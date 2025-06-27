const db = require("./../database/models/index.js");
const ProductService = require("./product.service.js");
const AppError = require("../utils/appError.js");

class RatingService {
  constructor() {
    this.productService = new ProductService();
  }

  async toggleRating({ userId, productId, rating }) {
    await this.productService.findProductById(productId);

    if (rating > 5 || rating < 1) {
      throw new AppError("La puntuación debe estar entre 1 y 5", 400);
    }

    const existingRating = await db.Rating.findOne({
      where: { userId, productId },
    });

    if (existingRating) {
      if (existingRating.rating === rating) {
        await existingRating.destroy();
        return { message: "Calificación eliminada correctamente" };
      } else {
        existingRating.rating = rating;
        await existingRating.save();
        return { message: "Calificación actualizada correctamente" };
      }
    } else {
      await db.Rating.create({
        userId,
        productId,
        rating,
      });
      return { message: "Calificación creada correctamente" };
    }
  }

  async getAverageRatingOfProduct(productId) {
    const result = await db.Rating.findOne({
      where: { productId },
      attributes: [
        [db.Sequelize.fn("AVG", db.Sequelize.col("rating")), "avgRating"],
        [db.sequelize.fn("COUNT", db.sequelize.col("rating")), "countRating"],
      ],
      raw: true,
    });

    return {
      average: result.avgRating ? parseFloat(result.avgRating) : 0,
      count: +result.countRating,
    };
  }

  async getMyRating({ userId, productId }) {
    const product = await db.Product.findByPk(productId);
    if (!product) {
      throw new AppError("Producto no encontrado", 404);
    }

    return await db.Rating.findOne({
      where: {
        userId,
        productId,
      },
    });
  }

  async getRatingCountOfProduct(productId) {
    await this.productService.findProductById(productId);

    return await db.Rating.count({
      where: {
        productId,
      },
    });
  }
}

module.exports = RatingService;
