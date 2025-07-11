const express = require("express");
const { verifySession } = require("../middlewares/verifySession");
const checkRole = require("../middlewares/chekRole");
const {
  createProductImage,
  deleteProductImage,
} = require("../controller/product-images.controller");
const { validationParamId } = require("../middlewares/validateInputErrors");

const productImagesRouter = express.Router();

productImagesRouter.post(
  "/",
  verifySession,
  checkRole("provider"),
  createProductImage
);

productImagesRouter.delete(
  "/:id",
  verifySession,
  checkRole("provider"),
  validationParamId,
  deleteProductImage
);

module.exports = productImagesRouter;
