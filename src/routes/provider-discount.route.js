const express = require("express");
const { verifySession } = require("../middlewares/verifySession");
const checkRole = require("../middlewares/chekRole");
const {
  createProviderDiscount,
  editProviderDiscount,
  deleteProviderDiscount,
} = require("../controller/provider-discount.controller");
const { validationParamId } = require("../middlewares/validateInputErrors");

const providerDiscountRouter = express.Router();

providerDiscountRouter.post(
  "/",
  verifySession,
  checkRole("admin"),
  createProviderDiscount
);

providerDiscountRouter.put(
  "/:id",
  verifySession,
  checkRole("admin"),
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
