const express = require("express");
const { verifySession } = require("../middlewares/verifySession");
const checkRole = require("../middlewares/chekRole");
const {
  balanceRecharge,
  approveRecharge,
  createRefund,
  getMyBalance,
  getUserBalanceById,
  getMovements,
  rejectRecharge,
  getRecharges,
  getPurchases,
  getMyMovements,
} = require("../controller/wallet.controller");
const {
  validationRecharge,
  validationParamId,
  validationCreateRefund,
} = require("../middlewares/validateInputErrors");

const walletRouter = express.Router();

// RECARGAR SALDO - user y provider
walletRouter.post(
  "/recharge",
  verifySession,
  checkRole("user", "provider"),
  validationRecharge,
  balanceRecharge
);

// RECHAZAR SOLICITUD DE RECARGA - admin
walletRouter.put(
  "/reject-recharge/:id",
  verifySession,
  checkRole("admin"),
  validationParamId,
  rejectRecharge
);

// OBTENER TODAS LAS SOLICITUDES DE RECARGA - admin
walletRouter.get(
  "/recharges/:id",
  verifySession,
  checkRole("admin"),
  validationParamId,
  getRecharges
);

// REEMBOLSO
walletRouter.post(
  "/refund",
  verifySession,
  checkRole("admin", "provider"),
  validationCreateRefund,
  createRefund
);

//TRAER SALDO TOTAL DE UN USUARIO - user y admin
walletRouter.get(
  "/balance",
  verifySession,
  checkRole("user", "provider"),
  getMyBalance
);

walletRouter.get(
  "/balance/:id",
  verifySession,
  checkRole("admin"),
  validationParamId,
  getUserBalanceById
);

// OBTENER LOS MOVIMIENTOS DE UN USUARIO - admin
walletRouter.get(
  "/movements/:id",
  verifySession,
  checkRole("admin"),
  validationParamId,
  getMovements
);

// OBTENER LOS MOVIMIENTOS DEL USUARIO AUTENTICADO - user y provider
walletRouter.get(
  "/movements",
  verifySession,
  checkRole("user", "provider"),
  getMyMovements
);

// APROBAR SOLICITUD DE RECARGA - admin
walletRouter.put(
  "/recharge/:id/approve",
  verifySession,
  checkRole("admin"),
  validationParamId,
  approveRecharge
);

// OBTENER COMPRAS DE UN USUARIO - user y admin
walletRouter.get(
  "/purchases/:id",
  verifySession,
  checkRole("user", "admin"),
  validationParamId,
  getPurchases
);

module.exports = walletRouter;
