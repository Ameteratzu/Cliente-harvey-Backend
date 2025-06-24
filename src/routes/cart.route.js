const express = require("express");
const { verifySession } = require("../middlewares/verifySession");
const checkRole = require("../middlewares/chekRole");
const {
  addToCart,
  getCart,
  removeFromCart,
  purchaseCart,
  clearCart,
} = require("../controller/cart.controller");

const cartRouter = express.Router();

cartRouter.post("/purchase", verifySession, checkRole("user"), purchaseCart);
cartRouter.post("/add", verifySession, checkRole("user"), addToCart);

// user
/*
 - agregar item al carrito -> se cambia a reservado por un minuto, si no lo compra se elimina del carrito y se vuelve al active
 - elimina item del carrito
 - limpiar todo el carrito
 - hace la compra -> crea la compra (purchase) -> guarda los movimientos en la billetera en la billetera del proveedor le suma el saldo, al usuario le resta el saldo

 nota: si el usuario compra un producto le cuesta regularPrice, si compra 2 le descuenta 2%, si compra 5 hasta 10 un 5 % de descuento y más de 10 tiene un descuento del 10%, estos porcentajes son variables manipulables por el adminm tambien aplica para las recargas, no aplica en productos en oferta
*/

cartRouter.get("/", verifySession, checkRole("user"), getCart);

cartRouter.delete(
  "/clear/:userId/:cartItemId",
  verifySession,
  checkRole("user"),
  clearCart
);
// remover item
cartRouter.delete(
  "/remove/:cartItemId",
  verifySession,
  checkRole("user"),
  removeFromCart
);

module.exports = cartRouter;
