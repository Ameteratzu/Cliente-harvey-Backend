const catchAsync = require("../utils/catchAsync");
const FavoriteService = require("../services/favorites.service");

const favoriteService = new FavoriteService();

module.exports.addToFavorites = catchAsync(async (req, res) => {
  const { id: userId } = req.user;
  const { productId } = req.body;

  await favoriteService.addToFavorites({
    userId,
    productId,
  });

  res.status(201).json({
    message: "Producto agregado a favoritos",
  });
});

module.exports.getMyFavorites = catchAsync(async (req, res) => {
  const { id: userId } = req.user;

  const favorites = await favoriteService.getMyFavorites(userId);

  res.status(200).json({
    message: "Favoritos obtenidos exitosamente",
    data: favorites,
    results: favorites.length,
  });
});

module.exports.getFavoritesByUser = catchAsync(async (req, res) => {
  const { id: userId } = req.params;

  const favorites = await favoriteService.getMyFavorites(userId);

  res.status(200).json({
    message: "Favoritos obtenidos exitosamente",
    data: favorites,
    results: favorites.length,
  });
});

module.exports.removeFromFavorites = catchAsync(async (req, res) => {
  const { id: userId } = req.user;
  const { id: productId } = req.params;

  await favoriteService.removeFavorite({
    userId,
    productId,
  });

  res.status(200).json({
    message: "Producto eliminado de favoritos",
  });
});

module.exports.removeFavorites = catchAsync(async (req, res) => {
  const { id: userId } = req.user;

  const removeFavorites = await favoriteService.claerFavorites(userId);

  res.status(200).json({
    message: "Favoritos eliminados",
    data: removeFavorites,
  });
});
