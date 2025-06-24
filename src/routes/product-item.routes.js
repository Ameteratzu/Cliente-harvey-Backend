const express = require("express");
const {
  createProductItem,
  getProductItems,
  deleteProductItem,
  editProductItem,
  getProviderProductItems,
  getProductItemById,
  getProductsItemsPublished,
} = require("../controller/product-item.controller");
const { verifySession } = require("../middlewares/verifySession");
const checkRole = require("../middlewares/chekRole");

const productItemRouter = express.Router();

// TODO: PENDIENTE PARA DEJAR SUBIR UN EXCEL
productItemRouter.post(
  "/",
  verifySession,
  checkRole("provider"),
  createProductItem
);

productItemRouter.get(
  "/",
  verifySession,
  checkRole("provider"),
  getProductItems
);

productItemRouter.get(
  "/all",
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

productItemRouter.get("/:id", getProductItemById);

productItemRouter.delete(
  "/:id",
  verifySession,
  checkRole("provider"),
  deleteProductItem
);

productItemRouter.put(
  "/:id",
  verifySession,
  checkRole("provider"),
  editProductItem
);

module.exports = productItemRouter;
