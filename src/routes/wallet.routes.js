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
  getProviderSales,
  getPurchases,
  getUserMovements,
} = require("../controller/wallet.controller");

const walletRouter = express.Router();

// RECARGAR SALDO - user y provider
walletRouter.post(
  "/recharge",
  verifySession,
  checkRole("user", "provider"),
  balanceRecharge
);

// RECHAZAR SOLICITUD DE RECARGA - admin
walletRouter.put(
  "/reject-recharge/:walletId",
  verifySession,
  checkRole("admin"),
  rejectRecharge
);

// OBTENER TODAS LAS SOLICITUDES DE RECARGA - admin
walletRouter.get(
  "/recharges/:userId",
  verifySession,
  checkRole("admin"),
  getRecharges
);

// admin
/*
TODO: Get / traer todo los movimientos
TODO: Delete / Eleminar
*/

// REEMBOLSO
walletRouter.post(
  "/refund",
  verifySession,
  checkRole("admin", "provider"),
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
  "/balance/:userId",
  verifySession,
  checkRole("admin"),
  getUserBalanceById
);

// OBTENER LOS MOVIMIENTOS DE UN USUARIO - admin
walletRouter.get(
  "/movements/:userId",
  verifySession,
  checkRole("admin"),
  getMovements
);

// OBTENER LOS MOVIMIENTOS DEL USUARIO AUTENTICADO - user y provider
walletRouter.get(
  "/movements",
  verifySession,
  checkRole("user", "provider"),
  getUserMovements
);

// OBTENER LOS MOVIMIENTOS DE TODOS LOS USUARIOS

// APROBAR SOLICITUD DE RECARGA - admin
walletRouter.put(
  "/recharge/:id/approve",
  verifySession,
  checkRole("admin"),
  approveRecharge
);

// OBTENER VENTAS DE UN PROVEEDOR - admin y provider
walletRouter.get(
  "/get-provider-sales/:providerId",
  verifySession,
  checkRole("provider", "admin"),
  getProviderSales
);

// OBTENER COMPRAS DE UN USUARIO - user y admin
walletRouter.get(
  "/purchases/:userId",
  verifySession,
  checkRole("user", "admin"),
  getPurchases
);

module.exports = walletRouter;
