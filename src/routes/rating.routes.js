const express = require("express");
const checkRole = require("../middlewares/chekRole");
const { verifySession } = require("../middlewares/verifySession");
const {
  getAverageRatingOfProduct,
  getMyRating,
  getRatingCount,
  rateProduct,
} = require("../controller/rating.controller");

const ratingRouter = express.Router();

ratingRouter.post("/", verifySession, checkRole("user"), rateProduct);
ratingRouter.get(
  "/average/:productId",
  verifySession,
  checkRole("user"),
  getAverageRatingOfProduct
);

ratingRouter.get(
  "/my/:productId",
  verifySession,
  checkRole("user"),
  getMyRating
);

ratingRouter.get(
  "/count/:productId",
  verifySession,
  checkRole("user"),
  getRatingCount
);

module.exports = ratingRouter;
