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

module.exports.getMostSoldProducts = catchAsync(async (req, res) => {
  const { limit } = req.query;

  const products = await purchaseService.getMostSoldProducts(limit);

  return res.status(200).json({
    message: "Productos obtenidos exitosamente",
    data: products,
    results: products.length,
  });
});

module.exports.filterPurchases = catchAsync(async (req, res) => {
  const { status } = req.query;

  const purchases = await purchaseService.filterPurchases(status);

  return res.status(200).json({
    message: "Compras obtenidas exitosamente",
    data: purchases,
    results: purchases.length,
  });
});

module.exports.getMyPurchases = catchAsync(async (req, res) => {
  const { id, role } = req.user;
  const { status, page = 1, limit = 10 } = req.query;

  const parsedLimit = parseInt(limit);
  const parsedPage = parseInt(page);
  const offset = (parsedPage - 1) * parsedLimit;

  const { rows: purchases, count } = await purchaseService.getMyPurchases({
    id,
    role,
    status,
    limit: parsedLimit,
    offset,
  });

  return res.status(200).json({
    message: "Compras obtenidas exitosamente",
    results: purchases.length,
    total: count,
    totalPages: Math.ceil(count / parsedLimit),
    purchases,
  });
});

module.exports.getUserPurchases = catchAsync(async (req, res) => {
  const { id: userId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const parsedLimit = parseInt(limit);
  const parsedPage = parseInt(page);
  const offset = (parsedPage - 1) * parsedLimit;

  const { rows: purchases, count } = await purchaseService.getUserPurchases({
    userId,
    limit: parsedLimit,
    offset,
  });

  return res.status(200).json({
    message: "Compras obtenidas exitosamente",
    results: purchases.length,
    total: count,
    totalPages: Math.ceil(count / parsedLimit),
    purchases,
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

// PROVIDER
// OBTENER VENTAS DEL PROVEEDOR
module.exports.getProviderSales = catchAsync(async (req, res) => {
  const { id: providerId } = req.user;
  const { userId, page = 1, limit = 10 } = req.query;

  const parsedLimit = parseInt(limit);
  const parsedPage = parseInt(page);
  const offset = (parsedPage - 1) * parsedLimit;

  const { rows: sales, count } = await purchaseService.getProviderSales({
    providerId,
    userId,
    limit: parsedLimit,
    offset,
  });

  return res.status(200).json({
    message: "Ventas obtenidas exitosamente",
    results: sales.length,
    total: count,
    totalPages: Math.ceil(sales.length / parsedLimit),
    sales,
  });
});

module.exports.getProviderSalesById = catchAsync(async (req, res) => {
  const { id: providerId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const parsedLimit = parseInt(limit);
  const parsedPage = parseInt(page);
  const offset = (parsedPage - 1) * parsedLimit;

  const { rows: sales, count } = await purchaseService.getProviderSalesById({
    providerId,
    limit: parsedLimit,
    offset,
  });

  return res.status(200).json({
    message: "Ventas obtenidas exitosamente",
    results: sales.length,
    total: count,
    totalPages: Math.ceil(count / parsedLimit),
    sales,
  });
});

module.exports.makeForcedRefund = catchAsync(async (req, res) => {
  const { id: purchaseId } = req.params;

  const result = await purchaseService.changeToRefuned({ purchaseId });

  return res.status(200).json({
    message: "Reembolso realizado con éxito",
    data: result,
  });
});

// ACEPTAR RENOVACIONES
module.exports.acceptRenewal = catchAsync(async (req, res) => {
  const { id: providerId, role: userType } = req.user;
  const { purchaseIds } = req.body;

  const result = await purchaseService.acceptRenewal({
    purchaseIds,
    providerId,
    userType,
  });

  return res.status(200).json({
    message: "Renovación aceptada con éxito",
    data: result,
  });
});

module.exports.requestRefund = catchAsync(async (req, res) => {
  const { id } = req.user;
  const { id: purchaseId } = req.params;
  const { descriptionProblem = "" } = req.body || {};

  const result = await purchaseService.requestRefund({
    purchaseId,
    userId: id,
    descriptionProblem,
  });

  return res.status(200).json(result);
});

module.exports.approveRefund = catchAsync(async (req, res) => {
  const { id, role: userType } = req.user;
  const { id: purchaseId } = req.params;

  const result = await purchaseService.approveRefund({
    purchaseId,
    id,
    userType,
  });

  return res.status(200).json(result);
});

module.exports.deleteExpired = catchAsync(async (req, res) => {
  const { id: purchaseId } = req.params;
  const result = await purchaseService.deleteExpired({ purchaseId });

  return res.status(200).json({
    message: "Compras expiradas eliminadas con éxito",
    data: result,
  });
});
