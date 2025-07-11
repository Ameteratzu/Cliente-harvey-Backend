const catchAsync = require("../utils/catchAsync.js");
const WalletService = require("../services/wallet.service.js");

const walletService = new WalletService();

// RECARGAS
module.exports.balanceRecharge = catchAsync(async (req, res) => {
  const { quantity } = req.body;
  const { id, role } = req.user;

  const recharge = await walletService.createRecharge({
    quantity,
    id,
    role,
  });

  res.status(201).json({
    message: "Solicitud de recarga creada exitosamente",
    data: recharge,
  });
});

module.exports.approveRecharge = catchAsync(async (req, res) => {
  const { id: walletId } = req.params;
  const { id: adminId } = req.user;
  const { userType } = req.query;

  const result = await walletService.approveRecharge({
    walletId,
    adminId,
    userType,
  });

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
  const { id: walletId } = req.params;
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
module.exports.getMyBalance = catchAsync(async (req, res) => {
  const { id: userId, role: userType } = req.user;

  const totalBalance = await walletService.getTotalBalance({
    userId,
    userType,
  });

  res.status(200).json({
    message: "Saldo obtenido exitosamente",
    data: {
      totalBalance: totalBalance.toNumber(),
    },
  });
});

module.exports.getUserBalanceById = catchAsync(async (req, res) => {
  const { id: userId } = req.params;
  const { type: userType } = req.query;

  if (!["user", "provider"].includes(type)) {
    return res.status(400).json({
      message: "Tipo de usuario no válido. Debe ser 'user' o 'provider'",
    });
  }

  const balance = await walletService.getTotalBalance({
    userId,
    userType,
  });

  res.status(200).json({
    message: "Saldo obtenido exitosamente",
    data: {
      userId: parseInt(userId),
      totalBalance: balance,
    },
  });
});

module.exports.getMovements = catchAsync(async (req, res) => {
  const { id: userId } = req.params;
  const { page = 1, limit = 10, operationType, userType } = req.query;

  const parsedLimit = parseInt(limit);
  const parsedPage = parseInt(page);
  const offset = (parsedPage - 1) * parsedLimit;

  const { rows: movements, count } = await walletService.getMovements({
    id: userId,
    userType,
    limit: parsedLimit,
    offset,
    operationType,
  });

  res.status(200).json({
    message: "Movimientos obtenidos exitosamente",
    results: movements.length,
    total: count,
    totalPages: Math.ceil(count / parsedLimit),
    movements,
  });
});

module.exports.getMyMovements = catchAsync(async (req, res) => {
  const { id, role: userType } = req.user;
  const { page = 1, limit = 10, operationType } = req.query;

  const parsedLimit = parseInt(limit);
  const parsedPage = parseInt(page);
  const offset = (parsedPage - 1) * parsedLimit;

  const { rows: movements, count } = await walletService.getMovements({
    id,
    userType,
    limit: parsedLimit,
    offset,
    operationType,
  });

  res.status(200).json({
    message: "Movimientos obtenidos exitosamente",
    results: movements.length,
    total: count,
    totalPages: Math.ceil(count / parsedLimit),
    movements,
  });
});

module.exports.getRecharges = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { userType, status, page = 1, limit = 10 } = req.query;

  const parsedLimit = parseInt(limit);
  const parsedPage = parseInt(page);
  const offset = (parsedPage - 1) * parsedLimit;

  const { rows: recharges, count } = await walletService.getRecharges({
    id,
    status,
    limit: parsedLimit,
    offset,
    userType,
  });

  res.status(200).json({
    message: "Recargas obtenidas exitosamente",
    results: recharges.length,
    total: count,
    totalPages: Math.ceil(count / parsedLimit),
    recharges,
  });
});

module.exports.getPurchases = catchAsync(async (req, res) => {
  const { id: userId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const parsedLimit = parseInt(limit);
  const parsedPage = parseInt(page);
  const offset = (parsedPage - 1) * parsedLimit;

  const { rows: purchases, count } = await walletService.getPurchases({
    userId,
    limit: parsedLimit,
    offset,
  });

  res.status(200).json({
    message: "Compras obtenidas exitosamente",
    results: purchases.length,
    total: count,
    totalPages: Math.ceil(count / parsedLimit),
    purchases,
  });
});
