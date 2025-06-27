const express = require("express");
const {
  createProduct,
  getAllProducts,
  getProductById,
  deleteProduct,
  putProductOnSale,
  editProduct,
  renewProduct,
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
  checkRole("user", "provider"),
  getAllProducts
);
productRouter.post(
  "/",
  verifySession,
  checkRole("provider"),
  validationCreateProduct,
  createProduct
);

productRouter.patch(
  "/on-sale/:id",
  validationPutProductOnSale,
  putProductOnSale
);

productRouter.get("/:id", validationParamId, getProductById);
productRouter.patch("/renew/:id", renewProduct);
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
