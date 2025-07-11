const xlsx = require("xlsx");
const db = require("./../database/models/index.js");
const AppError = require("../utils/appError.js");
const ProductService = require("../services/product.service.js");
const ProviderService = require("../services/provider.service.js");
const { generateUserCode } = require("../utils/token.js");
const { encryptPassword } = require("../utils/bcrypt");

class ProductItemService {
  constructor() {
    this.productService = new ProductService();
    this.providerService = new ProviderService();
  }

  async createProductItem({ productItemData }) {
    const { productId, providerId, password } = productItemData;

    const findProduct = await this.productService.findProductById(productId);
    if (!findProduct) {
      throw new AppError("Producto no encontrado", 404);
    }

    const findProvider = await this.providerService.getProviderById(providerId);
    if (!findProvider) {
      throw new AppError("Proveedor no encontrado", 404);
    }

    const productCodeItem = await generateUserCode();
    productItemData.productCodeItem = productCodeItem;

    const hashedPassword = encryptPassword(password);
    productItemData.password = hashedPassword;

    return await db.ProductItem.create({
      ...productItemData,
      productItemName: findProduct.productName,
    });
  }

  async uploadProductItemsExcel(buffer) {
    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    const successItems = [];
    const failedItems = [];

    for (const row of data) {
      try {
        const requiredFields = [
          "username",
          "password",
          "providerId",
          "productId",
          "url",
        ];
        const hasAllFields = requiredFields.every((field) => row[field]);

        if (!hasAllFields) {
          failedItems.push({ ...row, reason: "Faltan campos obligatorios" });
          continue;
        }

        const existingItem = await db.ProductItem.findOne({
          where: { username: row.username },
        });

        if (existingItem) {
          failedItems.push({ ...row, reason: "El item ya existe" });
          continue;
        }

        const product = await db.Product.findByPk(row.productId);
        if (!product) {
          failedItems.push({ ...row, reason: "Producto no encontrado" });
          continue;
        }

        const provider = await db.Providers.findByPk(row.providerId);
        if (!provider) {
          failedItems.push({ ...row, reason: "Proveedor no encontrado" });
          continue;
        }

        const productCodeItem = await generateUserCode();
        const hashedPassword = encryptPassword(row.password);

        const newItem = await db.ProductItem.create({
          username: row.username,
          secondUsername: row.secondUsername || null,
          password: hashedPassword,
          url: row.url,
          productId: row.productId,
          providerId: row.providerId,
          productItemName: product.productName,
          productCodeItem,
        });

        successItems.push(newItem);
      } catch (error) {
        console.error("Error procesando fila:", error);
        failedItems.push({ ...row, reason: "Error inesperado al procesar" });
      }
    }

    const uploadItems = successItems.length;
    const message =
      uploadItems > 0
        ? `Se subieron ${uploadItems} items exitosamente`
        : "No se subieron items";

    return { message, successItems, failedItems, uploadItems };
  }

  async getMyProductItems({ providerId, limit = 10, offset = 0 }) {
    const productItems = await db.ProductItem.findAndCountAll({
      where: {
        providerId,
      },
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });
    console.log(productItems);

    return productItems;
  }

  async getProductsItemsPublished() {
    return await db.ProductItem.findAll({
      where: {
        status: "published",
      },
    });
  }

  // PROVEEDOR ->   DESPUBLICA
  async unpublishProductItem({ productItemId, providerId }) {
    const productItem = await this.findProductItemById(productItemId);
    if (!productItem) {
      throw new AppError("Item no encontrado", 404);
    }

    if (productItem.providerId !== providerId) {
      throw new AppError("No tienes permisos para editar este item", 403);
    }

    if (productItem.status === "unpublished") {
      throw new AppError("El item ya esta despublicado", 400);
    }

    return productItem.update({ status: "unpublished" });
  }

  async getProviderProductsItems() {
    return await db.ProductItem.findAll();
  }

  async findProductItemById(id) {
    const productItem = await db.ProductItem.findByPk(id);
    if (!productItem) {
      throw new AppError("Item no encontrado", 404);
    }
    return productItem;
  }

  async editProductItem({ id, productItemData, providerId }) {
    const { username, password, url } = productItemData;

    const productItem = await this.findProductItemById(id);
    if (!productItem) {
      throw new AppError("Item no encontrado", 404);
    }

    if (productItem.providerId !== providerId) {
      throw new AppError("No tienes permisos para editar este item", 403);
    }

    if (productItem.status === "published") {
      throw new AppError("No puedes editar un item publicado", 400);
    }

    const updateData = {
      url,
    };

    // Solo si cambia el username
    if (username && username !== productItem.username) {
      updateData.username = username;
      updateData.secondUsername = productItem.username;
    }

    // Solo si cambia la password
    if (password && password !== productItem.password) {
      updateData.password = encryptPassword(password);
    }

    await productItem.update(updateData);
  }

  async deleteProductItem({ id, providerId }) {
    const productItem = await this.findProductItemById(id);
    if (!productItem) {
      throw new AppError("Item no encontrado", 404);
    }

    if (productItem.status === "published") {
      throw new AppError("No puedes eliminar un item publicado", 400);
    }

    const isDelete = await db.ProductItem.destroy({
      where: { id, providerId },
    });
    if (!isDelete) {
      throw new AppError("No tienes permisos para eliminar este item", 403);
    }

    return isDelete;
  }
}

module.exports = ProductItemService;
