const catchAsync = require("../utils/catchAsync.js");
const CartService = require("../services/cart.service.js");

const cartService = new CartService();

// Agregar producto al carrito
module.exports.addToCart = catchAsync(async (req, res) => {
  const { productId } = req.body;
  const { id: userId } = req.user;

  const productInCart = await cartService.addToCart({
    userId,
    productId,
  });

  res.status(201).json({
    message: productInCart.message,
    totalItems: productInCart.totalItems,
  });
});

// Obtener carrito del usuario
module.exports.getCart = catchAsync(async (req, res) => {
  const { id: userId } = req.user;

  const cart = await cartService.getCart({ userId });

  res.status(200).json({
    message: "Carrito obtenido exitosamente",
    data: { cart },
  });
});

// Remover item del carrito
module.exports.removeFromCart = catchAsync(async (req, res) => {
  const { id: userId } = req.user;
  const { id: cartItemId } = req.params;

  await cartService.removeFromCart({ userId, productInCartId: cartItemId });

  res.status(200).json({
    message: "Producto removido del carrito",
  });
});

// Limpiar todo el carrito
module.exports.clearCart = catchAsync(async (req, res) => {
  const { id: userId } = req.user;

  const deleteCount = await cartService.clearCart({ userId });

  const message =
    deleteCount === 0
      ? "No hay productos en el carrito"
      : `${deleteCount} productos removidos del carrito`;

  res.status(200).json({ message });
});

// Procesar compra del carrito
module.exports.purchaseCart = catchAsync(async (req, res) => {
  const { id: userId, role: userType } = req.user;

  const { message, ...purchaseResult } = await cartService.purchaseCart({
    userId,
    userType,
  });

  res.status(200).json({
    message,
    data: purchaseResult,
  });
});

// Limpiar items expirados (endpoint manual)
module.exports.cleanExpiredItems = catchAsync(async (req, res) => {
  const cleanedCount = await cartService.cleanExpiredItems();

  res.status(200).json({
    message: `${cleanedCount} items expirados limpiados`,
  });
});
