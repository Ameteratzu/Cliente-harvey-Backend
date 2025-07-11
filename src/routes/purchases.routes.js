const express = require("express");
const { verifySession } = require("../middlewares/verifySession");
const checkRole = require("../middlewares/chekRole");
const {
  getMyPurchases,
  createPurchase,
  getUserPurchases,
  sendPurchaseSupport,
  filterPurchases,
  solveSupport,
  changeToPurchased,
  getProviderSales,
  getProviderSalesById,
  getMostSoldProducts,
  acceptRenewal,
  deleteExpired,
  approveRefund,
  requestRefund,
} = require("../controller/purchases.controller");
const {
  validationCreatePurchase,
  validationSendSupport,
  validationSolveSupport,
  validationParamId,
  validationAccepRenewal,
  validationRequestRefund,
} = require("../middlewares/validateInputErrors");

const purchasesRouter = express.Router();

purchasesRouter.post(
  "/",
  verifySession,
  checkRole("user"),
  validationCreatePurchase,
  createPurchase
);

purchasesRouter.put(
  "/support/:id",
  verifySession,
  checkRole("user"),
  validationSendSupport,
  sendPurchaseSupport
);

purchasesRouter.put(
  "/solve-support/:id",
  verifySession,
  checkRole("provider"),
  validationSolveSupport,
  solveSupport
);

purchasesRouter.patch(
  "/change-to-purchased/:id",
  verifySession,
  checkRole("user"),
  validationParamId,
  changeToPurchased
);

// FILTRAR PURCHASES POR ESTADO
purchasesRouter.get(
  "/filter",
  verifySession,
  checkRole("user"),
  filterPurchases
);

// OBTENER MIS COMPRAS - user y provider
purchasesRouter.get(
  "/my-purchases",
  verifySession,
  checkRole("user", "provider"),
  getMyPurchases
);

purchasesRouter.get(
  "/user/:id",
  verifySession,
  checkRole("admin"),
  validationParamId,
  getUserPurchases
);

// OBETENER PRODUCTOS MAS VENDIDOS
purchasesRouter.get(
  "/most-sold",
  verifySession,
  checkRole("admin", "user", "provider"),
  getMostSoldProducts
);

purchasesRouter.delete(
  "/delete-expired/:id",
  verifySession,
  checkRole("provider"),
  validationParamId,
  deleteExpired
);

purchasesRouter.put(
  "/accept-renewal",
  verifySession,
  checkRole("user"),
  validationAccepRenewal,
  acceptRenewal
);

// OBTENER VENTAS DE UN PROVEEDOR - admin y provider
purchasesRouter.get(
  "/my-sales",
  verifySession,
  checkRole("provider"),
  getProviderSales
);

purchasesRouter.get(
  "/get-provider-sales/:id",
  verifySession,
  checkRole("admin"),
  validationParamId,
  getProviderSalesById
);

purchasesRouter.put(
  "/request-refund/:id",
  verifySession,
  checkRole("user"),
  validationRequestRefund,
  requestRefund
);

purchasesRouter.put(
  "/approve-refund/:id",
  verifySession,
  checkRole("provider", "admin"),
  validationParamId,
  approveRefund
);

module.exports = purchasesRouter;
