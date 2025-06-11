const express = require("express");
const { verifySession } = require("../middlewares/verifySession");
const checkRole = require("../middlewares/chekRole");
const {
  balanceRecharge,
  approveRecharge,
  makePurchase,
  createRefund,
  getTotalBalance,
  getAllMovements,
  rejectRecharge,
  getRecharges,
  getProviderSales,
  getPurchases,
} = require("../controller/wallet.controller");

const walletRouter = express.Router();

walletRouter.post(
  "/recharge",
  verifySession,
  checkRole("user"),
  balanceRecharge
);
walletRouter.put(
  "/reject-recharge/:walletId",
  verifySession,
  checkRole("admin"),
  rejectRecharge
);

walletRouter.get(
  "/recharges/:userId",
  verifySession,
  checkRole("admin"),
  getRecharges
);

walletRouter.post("/purchase", verifySession, checkRole("user"), makePurchase);

// REEMBOLSO
walletRouter.post(
  "/refund",
  verifySession,
  checkRole("admin", "provider"),
  createRefund
);

walletRouter.get(
  "/balance/:userId",
  verifySession,
  checkRole("user", "admin"),
  getTotalBalance
);

walletRouter.get(
  "/movements/:userId",
  verifySession,
  checkRole("user", "admin"),
  getAllMovements
);

walletRouter.put(
  "/recharge/:id/approve",
  verifySession,
  checkRole("admin"),
  approveRecharge
);

walletRouter.get(
  "/get-provider-sales/:providerId",
  verifySession,
  checkRole("provider", "admin"),
  getProviderSales
);

walletRouter.get(
  "/purchases/:userId",
  verifySession,
  checkRole("user", "admin"),
  getPurchases
);

module.exports = walletRouter;

// eliminar wallet
