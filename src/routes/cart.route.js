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
