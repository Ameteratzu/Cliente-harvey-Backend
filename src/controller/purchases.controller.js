const catchAsync = require("../utils/catchAsync.js");
const PurchaseService = require("../services/purchase.service.js");

const purchaseService = new PurchaseService();

module.exports.createPurchase = catchAsync(async (req, res) => {
  const { productItemid, providerId, duration, amount, renewalPrice } =
    req.body;
  const { id: userId } = req.user;

  const purchase = await purchaseService.createPurchase({
    productItemid,
    providerId,
    duration,
    amount,
    renewalPrice,
    userId,
  });

  return res.status(201).json({
    message: "Compra realizada exitosamente",
    data: purchase,
  });
});

module.exports.getPurchases = catchAsync(async (req, res) => {
  const { status } = req.query;

  const purchases = await purchaseService.getPurchases(status);

  return res.status(200).json({
    message: "Compras obtenidas exitosamente",
    data: purchases,
    results: purchases.length,
  });
});

module.exports.getMyPurchases = catchAsync(async (req, res) => {
  const { id, role } = req.user;
  const { status } = req.query;

  const purchases = await purchaseService.getMyPurchases({ id, role, status });

  return res.status(200).json({
    message: "Compras obtenidas exitosamente",
    data: purchases,
    results: purchases.length,
  });
});

module.exports.getUserPurchases = catchAsync(async (req, res) => {
  const { id: userId } = req.params;

  const purchases = await purchaseService.getUserPurchases(userId);

  return res.status(200).json({
    message: "Compras obtenidas exitosamente",
    data: purchases,
    results: purchases.length,
    userId,
  });
});

// ENVIAR COMPRA A SOPORTE
module.exports.sendPurchaseSupport = catchAsync(async (req, res) => {
  const { descriptionProblem } = req.body;
  const { id: purchaseId } = req.params;
  const { id: userId } = req.user;

  const result = await purchaseService.sendPurchaseSupport({
    descriptionProblem,
    userId,
    purchaseId,
  });

  return res.status(200).json({
    message: "Mandado a soporte con éxito",
    data: result,
  });
});

// RESOLVER SOPORTE
module.exports.solveSupport = catchAsync(async (req, res) => {
  const { note } = req.body;
  const { id: purchaseId } = req.params;

  const result = await purchaseService.solveSupport({ purchaseId, note });

  return res.status(200).json({
    message: "Solicitud resuelta con éxito",
    data: result,
  });
});

// CAMBIAR EL ESTADO A PURCHASED - USER
module.exports.changeToPurchased = catchAsync(async (req, res) => {
  const { id: purchaseId } = req.params;

  const result = await purchaseService.changeToPurchased(purchaseId);

  return res.status(200).json({
    message: "Compra realizada con éxito",
    data: result,
  });
});

// CAMBIAR EL ESTADO A REFUNED - PROVIDER
module.exports.changeToRefuned = catchAsync(async (req, res) => {
  const { id: purchaseId } = req.params;

  const result = await purchaseService.changeToRefuned(purchaseId);

  return res.status(200).json({
    message: "Compra renovada con éxito",
    data: result,
  });
});

// PROVIDER
// OBTENER VENTAS DEL PROVEEDOR
module.exports.getProviderSales = catchAsync(async (req, res) => {
  const { id: providerId } = req.user;
  const { userId } = req.query;

  const sales = await purchaseService.getProviderSales({ providerId, userId });

  return res.status(200).json({
    message: "Ventas obtenidas exitosamente",
    data: sales,
    results: sales.length,
  });
});

module.exports.getProviderSalesById = catchAsync(async (req, res) => {
  const { id: providerId } = req.params;

  const sale = await purchaseService.getProviderSalesById(providerId);

  return res.status(200).json({
    message: "Venta obtenida exitosamente",
    data: sale,
  });
});
