const express = require("express");
const checkRole = require("../middlewares/chekRole");
const { verifySession } = require("../middlewares/verifySession");
const {
  createPurchaseDiscount,
  getAllPurchaseDiscounts,
  getPurchaseDiscountById,
  editPurchaseDiscountById,
  deletePurchaseDiscountById,
} = require("../controller/purchase-discount.controller");
const {
  validationParamId,
  validationCreatePurchaseDiscount,
  validationEditPurchaseDiscount,
} = require("../middlewares/validateInputErrors");

const purchaseDiscountRouter = express.Router();

purchaseDiscountRouter.post(
  "/",
  verifySession,
  checkRole("admin"),
  validationCreatePurchaseDiscount,
  createPurchaseDiscount
);

purchaseDiscountRouter.get(
  "/",
  verifySession,
  checkRole("admin"),
  getAllPurchaseDiscounts
);

purchaseDiscountRouter.get(
  "/:id",
  verifySession,
  checkRole("admin"),
  validationParamId,
  getPurchaseDiscountById
);

purchaseDiscountRouter.put(
  "/:id",
  verifySession,
  checkRole("admin"),
  validationEditPurchaseDiscount,
  editPurchaseDiscountById
);

purchaseDiscountRouter.delete(
  "/:id",
  verifySession,
  checkRole("admin"),
  validationParamId,
  deletePurchaseDiscountById
);

module.exports = purchaseDiscountRouter;
