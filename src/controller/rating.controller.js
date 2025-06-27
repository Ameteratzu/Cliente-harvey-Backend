const catchAsync = require("../utils/catchAsync");
const RatingService = require("../services/rating.service");

const ratingService = new RatingService();

module.exports.rateProduct = catchAsync(async (req, res) => {
  const { productId, rating } = req.body;
  const { id: userId } = req.user;

  const newRating = await ratingService.toggleRating({
    userId,
    productId,
    rating,
  });

  res.status(201).json({
    message: newRating.message,
  });
});

module.exports.getAverageRatingOfProduct = catchAsync(async (req, res) => {
  const { productId } = req.params;

  const averageRating = await ratingService.getAverageRatingOfProduct(
    productId
  );

  res.status(200).json({
    message: "Promedio de calificaciones obtenido con éxito",
    average: averageRating.average,
    count: averageRating.count,
  });
});

module.exports.getMyRating = catchAsync(async (req, res) => {
  const { id: userId } = req.user;
  const { productId } = req.params;

  const myRating = await ratingService.getMyRating({
    userId,
    productId,
  });

  res.status(200).json({
    message: "Calificación obtenida con éxito",
    data: myRating,
  });
});

module.exports.getRatingCount = catchAsync(async (req, res) => {
  const { productId } = req.params;

  const ratingCount = await ratingService.getRatingCountOfProduct(productId);

  res.status(200).json({
    message: "Cantidad de calificaciones obtenida con éxito",
    count: ratingCount,
  });
});
