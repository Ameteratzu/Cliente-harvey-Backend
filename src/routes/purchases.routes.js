const express = require("express");
const { verifySession } = require("../middlewares/verifySession");
const checkRole = require("../middlewares/chekRole");
const {
  getMyPurchases,
  createPurchase,
  getUserPurchases,
  sendPurchaseSupport,
  getPurchases,
  solveSupport,
  changeToPurchased,
  changeToRefuned,
  getProviderSales,
  getProviderSalesById,
} = require("../controller/purchases.controller");

const purchasesRouter = express.Router();
// TODO: faltan validaciones
// eliminar compra cuando haya vencido, solo el proveedor puede hacerlo
// traer las compras de un usuario -> usuario y proveedor -> admin puede verlas todas
// cambiar de estado a resolved -> soporte -> proveedor

// user
/*
- obtener todas sus compras -> traer los dias restantes
- renovar la compra -> se suma la duracion, cambia el estado a renovado
- cambiar de estado -> usuario mandar a soporte, etc
- cambiar de estado a purchased-> user
- cambiaria al estado vencido cuando hay un reembolso
*/

// ==================================================

// TODO: ENDPOINT PARA RENOVAR COMPRA, PUEDE RENOVAR VARIOS PRODUCTOS, DURACION + FECHA DE FIN Y SE LE COBRA EL PRECIO DE RENOVACION

// TODO: ENDPOINT PARA ELIMINAR COMPRA SOLO PARA PROVEEDORS

/*
  type: DataTypes.ENUM(
          "purchased", // comprado
          "support", // en soporte
          "ordered", // pedido
          "delivered", // entregado
          "resolved", // resuelto
          "renewed", // renovado
          "beaten" // vencido
        ),
   */

//

// TODO: ENDPOINT QUE RETORNE LOS PRODUCTOS EN ESTADO DELIVERED -> EL USUARIO CAMBIA EL ESTADO
// TODO: ENDPOINT QUE RETORNE LOS PRODUCTOS EN ESTADO BEATEN -> EN AUTOMATICO SE CAMBIA EL ESTADO BEATEN AL VENCER FECHA DE VENCIMIENTO del purchase
// TODO: ENDPOINT QUE RETORNE LOS PRODUCTOS EN ESTADO RENEWED -> EL USUARIO CAMBIA EL ESTADO

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
purchasesRouter.get("/", verifySession, checkRole("user"), getPurchases);

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

// provider
/*
- cambiar de estado -> soporte -> proveedor resuelve, entregado
- eliminar compra cuando haya vencido
- cuando se cambia el estado en reembolsado
- acepta las renovaciones -> cambia el estado a purchased
 */

// admin
/**
 * - obtener todas las ventas
 * - hacer reembolso forzados
 */

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

// crear una tabla de favoritos -> id de producto, id de usuario

module.exports = purchasesRouter;
