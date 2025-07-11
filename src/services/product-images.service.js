const db = require("./../database/models/index.js");
const AppError = require("../utils/appError.js");

class ProductImagesService {
  async createProductImage(data) {
    return await db.ProductImages.create(data);
  }

  async deleteProductImage(id) {
    const productImage = await db.ProductImages.findByPk(id);
    if (!productImage) {
      throw new AppError("La imagen no existe", 404);
    }
    await productImage.destroy();
  }
}

module.exports = ProductImagesService;
