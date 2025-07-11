const express = require("express");
const {
  createProduct,
  getAllProducts,
  getProductById,
  deleteProduct,
  putProductOnSale,
  editProduct,
  getMyProducts,
} = require("../controller/product.controller");
const {
  validationCreateProduct,
  validationParamId,
  validationPutProductOnSale,
  validationEditProduct,
} = require("../middlewares/validateInputErrors");
const { verifySession } = require("../middlewares/verifySession");
const checkRole = require("../middlewares/chekRole");

const productRouter = express.Router();

productRouter.get(
  "/",
  verifySession,
  checkRole("user", "provider", "admin"),
  getAllProducts
);

productRouter.get("/my", verifySession, checkRole("provider"), getMyProducts);

productRouter.post(
  "/",
  verifySession,
  checkRole("provider"),
  validationCreateProduct,
  createProduct
);

productRouter.patch(
  "/on-sale/:id",
  verifySession,
  checkRole("provider"),
  validationPutProductOnSale,
  putProductOnSale
);

productRouter.get(
  "/:id",
  verifySession,
  checkRole("user", "provider"),
  validationParamId,
  getProductById
);

productRouter.put(
  "/:id",
  verifySession,
  checkRole("provider"),
  validationEditProduct,
  editProduct
);

productRouter.delete(
  "/:id",
  verifySession,
  checkRole("provider"),
  validationParamId,
  deleteProduct
);

module.exports = productRouter;
