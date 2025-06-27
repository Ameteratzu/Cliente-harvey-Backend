const db = require("./../database/models/index.js");
const AppError = require("../utils/appError.js");

class FavoritesService {
  async addToFavorites({ userId, productId }) {
    const product = await db.Product.findByPk(productId);
    if (!product) {
      throw new AppError("Producto no encontrado", 404);
    }

    try {
      const favorite = await db.Favorites.create({
        userId,
        productId,
      });

      return favorite;
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        throw new AppError("El producto ya está en tus favoritos", 400);
      }

      throw error;
    }
  }

  async getMyFavorites(userId) {
    return db.Favorites.findAll({
      where: { userId },
      include: [
        {
          model: db.Product,
          as: "product",
          attributes: ["id", "productName", "salePrice", "regularPrice"],
        },
      ],
    });
  }

  async getFavoritesByUser(userId) {
    const favorites = await db.Favorites.findAll({
      where: { userId },
      include: [
        {
          model: db.Product,
          as: "product",
          attributes: ["id", "productName", "salePrice", "regularPrice"],
        },
      ],
    });

    return favorites;
  }

  async removeFavorite({ userId, productId }) {
    const favorite = await db.Favorites.findOne({
      where: {
        userId,
        productId,
      },
    });

    if (!favorite) {
      throw new AppError("El producto no estaba en tus favoritos", 404);
    }

    return await favorite.destroy();
  }

  async claerFavorites(userId) {
    return await db.Favorites.destroy({ where: { userId } });
  }
}

module.exports = FavoritesService;
