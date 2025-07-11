const express = require("express");
const checkRole = require("../middlewares/chekRole");
const { verifySession } = require("../middlewares/verifySession");
const {
  getAverageRatingOfProduct,
  getMyRating,
  getRatingCount,
  rateProduct,
} = require("../controller/rating.controller");
const {
  validationParamId,
  validationCreateRating,
} = require("../middlewares/validateInputErrors");

const ratingRouter = express.Router();

ratingRouter.post(
  "/",
  verifySession,
  checkRole("user"),
  validationCreateRating,
  rateProduct
);

ratingRouter.get(
  "/average/:id",
  verifySession,
  checkRole("user"),
  validationParamId,
  getAverageRatingOfProduct
);

ratingRouter.get(
  "/my/:id",
  verifySession,
  checkRole("user"),
  validationParamId,
  getMyRating
);

ratingRouter.get(
  "/count/:id",
  verifySession,
  checkRole("user"),
  validationParamId,
  getRatingCount
);

module.exports = ratingRouter;
