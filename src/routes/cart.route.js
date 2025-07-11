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
const {
  validationAddToCart,
  validationClearCart,
  validationParamId,
} = require("../middlewares/validateInputErrors");

const cartRouter = express.Router();

cartRouter.post("/purchase", verifySession, checkRole("user"), purchaseCart);
cartRouter.post(
  "/add",
  verifySession,
  checkRole("user"),
  validationAddToCart,
  addToCart
);

cartRouter.get("/", verifySession, checkRole("user"), getCart);

cartRouter.delete("/clear", verifySession, checkRole("user"), clearCart);

// remover item
cartRouter.delete(
  "/remove/:id",
  verifySession,
  checkRole("user"),
  validationParamId,
  removeFromCart
);

module.exports = cartRouter;
