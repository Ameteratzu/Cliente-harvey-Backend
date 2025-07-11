const express = require("express");
const {
  getAllCategories,
  createCategory,
  getCategoryById,
  editCategory,
  deleteCategory,
} = require("../controller/category.controller");
const {
  validationCreateCategory,
  validationParamId,
  validationEditCategory,
} = require("../middlewares/validateInputErrors");
const { verifySession } = require("../middlewares/verifySession");
const checkRole = require("../middlewares/chekRole");

const categoryRoutes = express.Router();

categoryRoutes.post(
  "/",
  verifySession,
  checkRole("admin"),
  validationCreateCategory,
  createCategory
);
categoryRoutes.get("/", getAllCategories);
categoryRoutes.get("/:id", validationParamId, getCategoryById);

categoryRoutes.patch(
  "/:id",
  verifySession,
  checkRole("admin"),
  validationEditCategory,
  editCategory
);
categoryRoutes.delete(
  "/:id",
  verifySession,
  checkRole("admin"),
  validationParamId,
  deleteCategory
);

module.exports = categoryRoutes;
