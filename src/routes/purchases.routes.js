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
  changeToRefuned,
  getProviderSales,
  getProviderSalesById,
  getMostSoldProducts,
  acceptRenewal,
  deleteExpired,
} = require("../controller/purchases.controller");

const purchasesRouter = express.Router();
// TODO: faltan validaciones

// TODO: ENDPOINT PARA RENOVAR COMPRA, PUEDE RENOVAR VARIOS PRODUCTOS, DURACION + FECHA DE FIN Y SE LE COBRA EL PRECIO DE RENOVACION

purchasesRouter.post("/", verifySession, checkRole("user"), createPurchase);

purchasesRouter.put(
  "/support/:id",
  verifySession,
  checkRole("user"),
  sendPurchaseSupport
);

purchasesRouter.put(
  "/solve-support/:id",
  verifySession,
  checkRole("provider"),
  solveSupport
);

purchasesRouter.patch(
  "/change-to-purchased/:id",
  verifySession,
  checkRole("user"),
  changeToPurchased
);

purchasesRouter.patch(
  "/change-to-refunded/:id",
  verifySession,
  checkRole("provider"),
  changeToRefuned
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
  deleteExpired
);

purchasesRouter.put(
  "/accept-renewal/:id",
  verifySession,
  checkRole("provider"),
  acceptRenewal
);

// HACER UN REEMBOLSO FORZADO - admin
purchasesRouter.patch(
  "/forced-refund/:id",
  verifySession,
  checkRole("admin"),
  changeToRefuned
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
  getProviderSalesById
);

module.exports = purchasesRouter;
