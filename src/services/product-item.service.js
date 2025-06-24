const db = require("./../database/models/index.js");
const AppError = require("../utils/appError.js");
const ProductService = require("../services/product.service.js");
const ProviderService = require("../services/provider.service.js");
const { generateUserCode } = require("../utils/token.js");
const { hashPassword } = require("../utils/bcrypt");

class ProductItemService {
  constructor() {
    this.productService = new ProductService();
    this.providerService = new ProviderService();
  }

  async createProductItem({
    productItemData,
    productId,
    providerId,
    password,
  }) {
    const findProduct = await this.productService.findProductById(productId);
    if (!findProduct) {
      throw new AppError("Producto no encontrado", 404);
    }

    const findProvider = await this.providerService.getProviderById(providerId);
    if (!findProvider) {
      throw new AppError("Proveedor no encontrado", 404);
    }

    // TODO: FIX ERROR UNDEFINED
    const productCodeItem = await generateUserCode();
    productItemData.productCodeItem = productCodeItem;

    const hashedPassword = await hashPassword(password);
    productItemData.password = hashedPassword;

    return await db.ProductItem.create({
      ...productItemData,
      productItemName: findProduct.productName,
    });
  }

  async getAllProductItems(providerId) {
    const findProvider = await this.providerService.getProviderById(providerId);
    if (!findProvider) {
      throw new AppError("Proveedor no encontrado", 404);
    }

    return await db.ProductItem.findAll({
      where: {
        providerId,
      },
    });
  }

  async getProductsItemsPublished() {
    return await db.ProductItem.findAll({
      where: {
        status: "published",
      },
    });
  }

  // TODO: PROVEEDOR -> CREA, EDITA, ELIMINA, DESPUBLICA
  // TODO: SUBIR INFO DE UN EXCEL -> EVITAR REPETIDOS
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

    return await db.ProductItem.update(productItemData, {
      where: { id, providerId },
    });
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
