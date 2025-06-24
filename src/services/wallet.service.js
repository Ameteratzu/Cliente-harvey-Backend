const db = require("./../database/models/index.js");
const AppError = require("../utils/appError");
const Decimal = require("decimal.js");

class WalletService {
  getModel(userType) {
    const models = {
      user: { model: db.Users, walletField: "userId" },
      provider: { model: db.Providers, walletField: "providerId" },
    };

    const entry = models[userType];
    if (!entry) {
      throw new AppError("Tipo de usuario no válido", 404);
    }

    return entry;
  }

  // Generar código único de operación
  generateOperationCode(type) {
    const prefix = {
      recharge: "REC",
      deduct: "DED",
      purchase: "PUR",
      refund: "REF",
    };
    return `${prefix[type]}-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 4)
      .toUpperCase()}`;
  }

  // RECARGAS
  async createRecharge(rechargeData) {
    const { quantity, id, role } = rechargeData;

    if (role === "user") {
      return await db.Wallet.create({
        quantity: Math.abs(quantity),
        description: "Recarga de saldo",
        operationCode: this.generateOperationCode("recharge"),
        userId: id,
        operationType: "recharge",
        status: "pending",
        operationDate: new Date(),
      });
    } else if (role === "provider") {
      return await db.Wallet.create({
        quantity: Math.abs(quantity),
        description: "Recarga de saldo",
        operationCode: this.generateOperationCode("recharge"),
        providerId: id,
        operationType: "recharge",
        status: "pending",
        operationDate: new Date(),
      });
    }
  }

  async approveRecharge(walletId, adminId) {
    return await db.Wallet.update(
      {
        status: "accepted",
        adminId,
        updatedAt: new Date(),
      },
      { where: { id: walletId, operationType: "recharge" } }
    );
  }

  async rejectRecharge(walletId, adminId) {
    return await db.Wallet.update(
      {
        status: "rejected",
        adminId,
        updatedAt: new Date(), // agregar un campo para detalle del rechazo
      },
      { where: { id: walletId, operationType: "recharge" } }
    );
  }

  async createMovement({
    quantity,
    description,
    userId,
    providerId,
    purchasingGroupCode,
    productItemId,
    operationType = "purchase", // default al tipo esperado
    operationCode,
    status = "accepted", // default aceptado
    transaction,
  }) {
    if (!operationCode) {
      operationCode = this.generateOperationCode(operationType);
    }

    return await db.Wallet.create(
      {
        quantity,
        description,
        purchasingGroupCode,
        operationCode,
        userId,
        providerId,
        productItemId,
        operationType,
        status,
      },
      {
        transaction,
      }
    );
  }

  // REEMBOLSOS
  async createRefund(refundData) {
    const {
      quantity,
      description,
      userId,
      providerId,
      productItemId,
      adminId,
    } = refundData;

    return await db.Wallet.create({
      quantity: Math.abs(quantity),
      description: description || "Reembolso",
      operationCode: this.generateOperationCode("refund"),
      userId,
      providerId,
      productItemId,
      adminId,
      operationType: "refund",
      status: "accepted",
      operationDate: new Date(),
    });
  }

  // DESCONTAR SALDO
  async deductBalance({ quantity, id, transaction, userType, description }) {
    const { walletField } = this.getModel(userType);

    return await db.Wallet.create(
      {
        quantity: Math.abs(quantity),
        description: description || "Descuento de saldo",
        operationCode: this.generateOperationCode("deduct"),
        [walletField]: id,
        operationType: "deduct",
        status: "accepted",
        operationDate: new Date(),
      },
      {
        transaction,
      }
    );
  }

  // CONSULTAS
  async getTotalBalance({ userId, userType, transaction }) {
    const { model: Model, walletField } = this.getModel(userType);

    const account = await Model.findByPk(userId, { transaction });

    if (!account) {
      throw new AppError("Cuenta no encontrado", 404);
    }

    const transactions = await db.Wallet.findAll({
      where: {
        [walletField]: userId,
        status: "accepted",
      },
      attributes: ["quantity", "operationType"],
      transaction,
    });

    return transactions.reduce((balance, tx) => {
      const quantity = new Decimal(tx.quantity);

      if (["recharge", "refund"].includes(tx.operationType)) {
        return balance.plus(quantity);
      } else if (["purchase", "deduct"].includes(tx.operationType)) {
        return balance.minus(quantity);
      }
      return balance;
    }, new Decimal(0));
  }

  async getMovements(userId, options = {}) {
    const { page = 1, limit = 10, operationType } = options;
    const offset = (page - 1) * limit;

    const whereClause = { userId };
    if (operationType) {
      whereClause.operationType = operationType;
    }

    return await db.Wallet.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: db.Users,
          as: "user",
          attributes: ["username", "email"],
        },
        {
          model: db.Providers,
          as: "provider",
          attributes: ["businessName", "username"],
        },
        {
          model: db.ProductItem,
          as: "productItem",
          attributes: ["productItemName"],
        },
        {
          model: db.Admins,
          as: "admin",
          attributes: ["username"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });
  }

  async getRecharges(userId, status = null) {
    const whereClause = {
      userId,
      operationType: "recharge",
    };

    if (status) {
      whereClause.status = status;
    }

    return await db.Wallet.findAll({
      where: whereClause,
      include: [
        {
          model: db.Admins,
          as: "admin",
          attributes: ["username"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
  }

  async getPurchases(userId) {
    return await db.Wallet.findAll({
      where: {
        userId,
        operationType: "purchase",
      },
      include: [
        {
          model: db.Providers,
          as: "provider",
          attributes: ["businessName", "username"],
        },
        {
          model: db.ProductItem,
          as: "productItem",
          attributes: ["name", "price"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
  }

  // Para proveedores - ver sus ventas
  async getProviderSales(providerId) {
    return await db.Wallet.findAll({
      where: {
        providerId,
        operationType: "purchase",
        status: "accepted",
      },
      include: [
        {
          model: db.Users,
          as: "user",
          attributes: ["username", "email"],
        },
        {
          model: db.ProductItem,
          as: "productItem",
          attributes: ["productItemName"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
  }

  async getWalletById(id) {
    return await db.Wallet.findByPk(id, {
      include: [
        {
          model: db.Users,
          as: "user",
          attributes: ["username", "email"],
        },
        {
          model: db.Providers,
          as: "provider",
          attributes: ["businessName", "username"],
        },
        {
          model: db.ProductItem,
          as: "productItem",
          attributes: ["name", "price"],
        },
        {
          model: db.Users,
          as: "admin",
          attributes: ["username"],
        },
      ],
    });
  }
}

module.exports = WalletService;
