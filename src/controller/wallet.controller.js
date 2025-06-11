const catchAsync = require("../utils/catchAsync.js");
const WalletService = require("../services/wallet.service.js");

const walletService = new WalletService();

// RECARGAS
module.exports.balanceRecharge = catchAsync(async (req, res) => {
  const { quantity } = req.body;
  const { id: userId } = req.user;

  const recharge = await walletService.createRecharge({
    quantity,
    userId,
  });

  res.status(201).json({
    message: "Solicitud de recarga creada exitosamente",
    data: recharge,
  });
});

module.exports.approveRecharge = catchAsync(async (req, res) => {
  const { id: walletId } = req.params;
  const { id: adminId } = req.user;

  const result = await walletService.approveRecharge(walletId, adminId);

  if (result[0] === 0) {
    return res.status(404).json({
      message: "Recarga no encontrada",
    });
  }

  res.status(200).json({
    message: "Recarga aprobada exitosamente",
  });
});

module.exports.rejectRecharge = catchAsync(async (req, res) => {
  const { walletId } = req.params;
  const { id: adminId } = req.user;

  const result = await walletService.rejectRecharge(walletId, adminId);

  if (result[0] === 0) {
    return res.status(404).json({
      message: "Recarga no encontrada",
    });
  }

  res.status(200).json({
    message: "Recarga rechazada",
  });
});

// COMPRAS
module.exports.makePurchase = catchAsync(async (req, res) => {
  const { quantity, description, providerId, productItemId } = req.body;
  const { id: userId } = req.user;

  const purchase = await walletService.createPurchase({
    quantity,
    description,
    userId,
    providerId,
    productItemId,
  });

  res.status(201).json({
    message: "Compra realizada exitosamente",
    data: purchase,
  });
});

// REEMBOLSOS
module.exports.createRefund = catchAsync(async (req, res) => {
  const { quantity, description, userId, providerId, productItemId, adminId } =
    req.body;

  if (!quantity || !userId) {
    return res.status(400).json({
      message: "Cantidad y usuario son requeridos",
    });
  }

  const refund = await walletService.createRefund({
    quantity,
    description,
    userId,
    providerId,
    productItemId,
    adminId,
  });

  res.status(201).json({
    message: "Reembolso procesado exitosamente",
    data: refund,
  });
});

// CONSULTAS
module.exports.getTotalBalance = catchAsync(async (req, res) => {
  const { userId } = req.params;

  const balance = await walletService.getTotalBalance(userId);

  res.status(200).json({
    message: "Saldo obtenido exitosamente",
    data: {
      userId: parseInt(userId),
      totalBalance: balance,
    },
  });
});

module.exports.getAllMovements = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { page, limit, operationType } = req.query;

  const movements = await walletService.getAllMovements(userId, {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    operationType,
  });

  res.status(200).json({
    message: "Movimientos obtenidos exitosamente",
    data: movements,
  });
});

module.exports.getRecharges = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { status } = req.query;

  const recharges = await walletService.getRecharges(userId, status);

  res.status(200).json({
    message: "Recargas obtenidas exitosamente",
    count: recharges.length,
    data: recharges,
  });
});

module.exports.getPurchases = catchAsync(async (req, res) => {
  const { userId } = req.params;

  const purchases = await walletService.getPurchases(userId);

  res.status(200).json({
    message: "Compras obtenidas exitosamente",
    data: purchases,
  });
});

// Para proveedores
module.exports.getProviderSales = catchAsync(async (req, res) => {
  const { providerId } = req.params;

  const sales = await walletService.getProviderSales(providerId);

  res.status(200).json({
    message: "Ventas obtenidas exitosamente",
    data: sales,
  });
});
