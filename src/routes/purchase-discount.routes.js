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

const purchaseDiscountRouter = express.Router();

purchaseDiscountRouter.post(
  "/",
  verifySession,
  checkRole("admin"),
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
  getPurchaseDiscountById
);

purchaseDiscountRouter.put(
  "/:id",
  verifySession,
  checkRole("admin"),
  editPurchaseDiscountById
);

purchaseDiscountRouter.delete(
  "/:id",
  verifySession,
  checkRole("admin"),
  deletePurchaseDiscountById
);

module.exports = purchaseDiscountRouter;
