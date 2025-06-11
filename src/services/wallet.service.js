const db = require("./../database/models/index.js");

class WalletService {
  // Generar código único de operación
  generateOperationCode(type) {
    const prefix = {
      recharge: "REC",
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
    const { quantity, userId } = rechargeData;

    return await db.Wallet.create({
      quantity: Math.abs(quantity),
      description: "Recarga de saldo",
      operationCode: this.generateOperationCode("recharge"),
      userId,
      operationType: "recharge",
      status: "pending",
      operationDate: new Date(),
    });
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

  // COMPRAS
  async createPurchase(purchaseData) {
    const { quantity, description, userId, providerId, productItemId } =
      purchaseData;

    // Verificar saldo antes de comprar
    const currentBalance = await this.getTotalBalance(userId);
    if (currentBalance < quantity) {
      throw new Error("Saldo insuficiente para realizar la compra");
    }

    return await db.Wallet.create({
      quantity: Math.abs(quantity),
      description: description || "Compra de producto",
      operationCode: this.generateOperationCode("purchase"),
      userId,
      providerId,
      productItemId,
      operationType: "purchase",
      status: "accepted", // Las compras se aceptan automáticamente si hay saldo
      operationDate: new Date(),
    });
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

  // CONSULTAS
  async getTotalBalance(userId) {
    const transactions = await db.Wallet.findAll({
      where: {
        userId,
        status: "accepted",
      },
      attributes: ["quantity", "operationType"],
    });

    return transactions.reduce((balance, transaction) => {
      if (
        transaction.operationType === "recharge" ||
        transaction.operationType === "refund"
      ) {
        return balance + transaction.quantity;
      } else if (transaction.operationType === "purchase") {
        return balance - transaction.quantity;
      }
      return balance;
    }, 0);
  }

  async getAllMovements(userId, options = {}) {
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
