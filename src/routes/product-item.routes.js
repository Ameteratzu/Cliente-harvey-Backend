const express = require("express");
const {
  createProductItem,
  getMyProductItems,
  deleteProductItem,
  editProductItem,
  getProviderProductItems,
  getProductItemById,
  getProductsItemsPublished,
  uploadProductItemsExcel,
  unpublishProductItem,
} = require("../controller/product-item.controller");
const { verifySession } = require("../middlewares/verifySession");
const checkRole = require("../middlewares/chekRole");
const {
  validationCreateProductItem,
  validationParamId,
} = require("../middlewares/validateInputErrors");

const productItemRouter = express.Router();

productItemRouter.post(
  "/",
  verifySession,
  checkRole("provider"),
  validationCreateProductItem,
  createProductItem
);

productItemRouter.post("/upload-excel-product-items", uploadProductItemsExcel);

productItemRouter.get(
  "/my",
  verifySession,
  checkRole("provider"),
  getMyProductItems
);

productItemRouter.get(
  "/",
  verifySession,
  checkRole("admin"),
  getProviderProductItems
);

productItemRouter.get(
  "/get-products-items-published",
  verifySession,
  checkRole("admin"),
  getProductsItemsPublished
);

productItemRouter.get(
  "/:id",
  verifySession,
  checkRole("provider"),
  validationParamId,
  getProductItemById
);

productItemRouter.delete(
  "/:id",
  verifySession,
  checkRole("provider"),
  validationParamId,
  deleteProductItem
);

productItemRouter.patch(
  "/unpublish/:id",
  verifySession,
  checkRole("provider"),
  validationParamId,
  unpublishProductItem
);

productItemRouter.put(
  "/:id",
  verifySession,
  checkRole("provider"),
  validationParamId,
  editProductItem
);

module.exports = productItemRouter;
