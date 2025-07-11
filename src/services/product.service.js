const db = require("./../database/models/index.js");
const AppError = require("../utils/appError.js");
const WalletService = require("./wallet.service.js");
const CategoryService = require("../services/category.service.js");
const { differenceInDays } = require("date-fns/differenceInDays");

class ProductService {
  constructor() {
    this.walletService = new WalletService();
    this.categoryService = new CategoryService();
  }

  generateProductCode(productName) {
    if (!productName || typeof productName !== "string") {
      throw new Error("Nombre de producto inválido");
    }

    const cleanName = productName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .toUpperCase();

    const words = cleanName.split(/\s+/);

    const first = words[0]?.slice(0, 7) || "";
    const second = words[1]?.slice(0, 4) || "";

    return `${first}-${second}`;
  }

  async createProduct(productData) {
    const transaction = await db.sequelize.transaction();
    try {
      const { productName, categoryId } = productData;

      const productCode = this.generateProductCode(productName);

      const findProduct = await db.Product.findOne({
        where: { productName },
        transaction,
      });
      if (findProduct) {
        throw new AppError("El producto ya existe", 400);
      }

      const findCategory = await this.categoryService.findCategoryById(
        categoryId,
        transaction
      );
      if (!findCategory) {
        throw new AppError("La categoría no existe", 400);
      }

      const createdProduct = await db.Product.create(
        {
          ...productData,
          renewalPrice: productData.regularPrice,
          productCode,
        },
        { transaction }
      );

      await transaction.commit();
      return createdProduct;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getAllProducts({ limit = 10, offset = 0 }) {
    const { count, rows } = await db.Product.findAndCountAll({
      include: [
        {
          model: db.Providers,
          as: "provider",
          attributes: [
            "id",
            "businessName",
            "username",
            "email",
            "telephone",
            "createdAt",
            "updatedAt",
          ],
        },
        {
          model: db.Categories,
          as: "category",
          attributes: ["id", "category"],
        },
        {
          model: db.ProductItem,
          as: "productItem",
          //attributes: ["id"],
        },
        {
          model: db.ProductImages,
          as: "images",
          attributes: ["id", "url"],
        },
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    const products = rows.map((product) => {
      return {
        id: product.id,
        productName: product.productName,
        productCode: product.productCode,
        product: product.product,
        provider: product.provider,
        category: product.category,
        quantity: product.quantity,
        regularPrice: product.regularPrice,
        salePrice: product.salePrice,
        isPublished: product.isPublished,
        publishStartDate: product.publishStartDate,
        publishEndDate: product.publishEndDate,
        isOnSale: product.isOnSale,
        stock: product.productItem.filter((p) => p.isPublished).length,
        remaningDays: differenceInDays(
          new Date(product.publishEndDate),
          new Date()
        ),
        images: product.images,
        productItems: product.productItem,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      };
    });

    return { products, count };
  }

  async getMyProducts({ providerId, limit = 10, offset = 0 }) {
    const { count, rows } = await db.Product.findAndCountAll({
      where: {
        providerId,
      },
      attributes: [
        "id",
        "productName",
        "productCode",
        "salePrice",
        "regularPrice",
        "duration",
        "renewalPrice",
        "isOnSale",
        "typeOfDelivery",
        "createdAt",
        "updatedAt",
      ],
      include: [
        {
          model: db.ProductItem,
          as: "productItem",
          attributes: ["id", "productItemName", "status"],
        },
        {
          model: db.ProductImages,
          as: "images",
          attributes: ["id", "url"],
        },
        {
          model: db.Providers,
          as: "provider",
          attributes: ["id", "businessName", "username", "email", "telephone"],
        },
        {
          model: db.Categories,
          as: "category",
          attributes: ["id", "category"],
        },
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    const products = rows.map((prod) => ({
      id: prod.id,
      productName: prod.productName,
      productCode: prod.productCode,
      salePrice: prod.salePrice,
      regularPrice: prod.regularPrice,
      renewalPrice: prod.renewalPrice,
      isOnSale: prod.isOnSale,
      duration: prod.duration,
      typeOfDelivery: prod.typeOfDelivery,
      provider: prod.provider,
      category: prod.category,
      stock: prod.productItem.filter((p) => p.status === "published").length,
      images: prod.images,
      createdAt: prod.createdAt,
      updatedAt: prod.updatedAt,
    }));

    return { products, count };
  }

  async findProductById(id) {
    const product = await db.Product.findOne({ where: { id } });

    if (!product) {
      throw new AppError("Producto no encontrado", 404);
    }

    return product;
  }

  async editProduct(id, productData) {
    const product = await this.findProductById(id);
    return await product.update(productData);
  }

  async deleteProductById(id) {
    const product = await this.findProductById(id);

    const isPublished = await db.PublishedProducts.findOne({
      where: { productId: id },
    });

    if (isPublished) {
      throw new AppError(
        "No se puede eliminar porque el producto está publicado",
        400
      );
    }

    return await product.destroy();
  }

  async putProductOnSale(id, salePrice) {
    const product = await this.findProductById(id);
    return await product.update({ isOnSale: true, salePrice });
  }

  // VA EN PRODUCT ITEM
  async unPublishProduct(id) {
    return await db.Product.update(
      { isPublished: false, publishEndDate: null, publishStartDate: null },
      { where: { id } }
    );
  }
}

module.exports = ProductService;
