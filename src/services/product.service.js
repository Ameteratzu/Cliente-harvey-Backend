const db = require("./../database/models/index.js");
const AppError = require("../utils/appError.js");
const WalletService = require("./wallet.service.js");
const CategoryService = require("../services/category.service.js");

class ProductService {
  constructor() {
    this.walletService = new WalletService();
    this.categoryService = new CategoryService();
    this.publishCost = 1;
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
    const { productName, categoryId } = productData;

    const productCode = this.generateProductCode(productName);

    const findProduct = await db.Product.findOne({ where: { productName } });
    if (findProduct) {
      return res.status(400).json({ message: "El producto ya existe" });
    }

    const findCategory = await this.categoryService.findCategoryById(
      categoryId
    );
    if (!findCategory) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    return await db.Product.create({ ...productData, productCode });
  }

  async getAllProducts() {
    return await db.Product.findAll({
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
      ],
    });
  }

  // TODO: TRAER LOS PRODUCTOS DEL PROVIDER

  async findProductById(id) {
    const product = await db.Product.findOne({ where: { id } });

    if (!product) {
      throw new AppError("Producto no encontrado", 404);
    }

    return product;
  }

  async editProduct(id, productData) {
    return await db.Product.update(productData, { where: { id } });
  }

  async deleteProductById(id) {
    return await db.Product.destroy({ where: { id } });
  }

  async putProductOnSale(id, salePrice) {
    return await db.Product.update(
      { isOnSale: true, salePrice },
      { where: { id } }
    );
  }

  // async renewProduct(id, publishEndDate) {
  //   const newPublishEndDate = addDays(publishEndDate, 30);
  //   return await db.Product.update(
  //     { publishEndDate: newPublishEndDate },
  //     { where: { id } }
  //   );
  // }

  // TODO: VA EN PRODUCT ITEM
  async unPublishProduct(id) {
    return await db.Product.update(
      { isPublished: false, publishEndDate: null, publishStartDate: null },
      { where: { id } }
    );
  }
}

module.exports = ProductService;
