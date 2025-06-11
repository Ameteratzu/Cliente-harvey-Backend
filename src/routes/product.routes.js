const express = require("express");
const {
  createProduct,
  getAllProducts,
  getProductById,
  deleteProduct,
  publishProduct,
  putProductOnSale,
  editProduct,
  renewProduct,
  unPublishProduct,
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
  checkRole("admin", "provider", "user"),
  getAllProducts
);
productRouter.post(
  "/",
  verifySession,
  checkRole("provider"),
  validationCreateProduct,
  createProduct
);

// editar

productRouter.post(
  "/publish/:id",
  verifySession,
  checkRole("provider"),
  validationParamId,
  publishProduct
);
productRouter.patch(
  "/on-sale/:id",
  validationPutProductOnSale,
  putProductOnSale
);

productRouter.get("/:id", validationParamId, getProductById);
productRouter.put("/unpublish/:id", verifySession, unPublishProduct);
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
