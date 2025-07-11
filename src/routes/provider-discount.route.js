const express = require("express");
const { verifySession } = require("../middlewares/verifySession");
const checkRole = require("../middlewares/chekRole");
const {
  createProviderDiscount,
  editProviderDiscount,
  deleteProviderDiscount,
} = require("../controller/provider-discount.controller");
const {
  validationParamId,
  validationCreateProviderDiscount,
  validationEditProviderDiscount,
} = require("../middlewares/validateInputErrors");

const providerDiscountRouter = express.Router();

providerDiscountRouter.post(
  "/",
  verifySession,
  checkRole("admin"),
  validationCreateProviderDiscount,
  createProviderDiscount
);

providerDiscountRouter.put(
  "/:id",
  verifySession,
  checkRole("admin"),
  validationEditProviderDiscount,
  editProviderDiscount
);

providerDiscountRouter.delete(
  "/:id",
  verifySession,
  checkRole("admin"),
  validationParamId,
  deleteProviderDiscount
);

module.exports = providerDiscountRouter;
