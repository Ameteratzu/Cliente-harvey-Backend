const express = require("express");
const { verifySession } = require("../middlewares/verifySession");
const checkRole = require("../middlewares/chekRole");
const {
  createCategoryImage,
  deleteCategoryImage,
} = require("../controller/category-images.controller");
const { validationParamId } = require("../middlewares/validateInputErrors");

const categoryImagesRouter = express.Router();

categoryImagesRouter.post(
  "/",
  verifySession,
  checkRole("admin"),
  createCategoryImage
);

categoryImagesRouter.delete(
  "/:id",
  verifySession,
  checkRole("admin"),
  validationParamId,
  deleteCategoryImage
);

module.exports = categoryImagesRouter;
