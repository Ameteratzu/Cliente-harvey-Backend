const express = require("express");
const {
  createPublishedProduct,
  getMyPublishedProducts,
  getAllPublishedProducts,
} = require("../controller/published-products.controller");
const { verifySession } = require("../middlewares/verifySession");
const checkRole = require("../middlewares/chekRole");

const publishedProductsRouter = express.Router();

publishedProductsRouter.post(
  "/",
  verifySession,
  checkRole("admin", "user", "provider"),
  createPublishedProduct
);

publishedProductsRouter.get(
  "/my",
  verifySession,
  checkRole("provider"),
  getMyPublishedProducts
);

publishedProductsRouter.get(
  "/all-published-products",
  verifySession,
  checkRole("admin", "user", "provider"),
  getAllPublishedProducts
);

module.exports = publishedProductsRouter;
