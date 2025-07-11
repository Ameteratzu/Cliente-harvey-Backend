const db = require("./../database/models/index.js");
const AppError = require("../utils/appError");
const Decimal = require("decimal.js");

class WalletService {
  getModel(userType) {
    const models = {
      user: {
        model: db.Users,
        walletField: "userId",
        filters: ["deduct", "recharge", "earning", "refund", "purchase"],
      },
      provider: {
        model: db.Providers,
        walletField: "providerId",
        filters: ["deduct", "recharge", "earning"],
      },
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

  async approveRecharge({ walletId, adminId, userType }) {
    const transaction = await db.sequelize.transaction();

    try {
      if (!userType || !["user", "provider"].includes(userType)) {
        throw new AppError(
          "La query userType es requerida o no es válida",
          400
        );
      }

      const wallet = await db.Wallet.findOne({
        where: { id: walletId, operationType: "recharge", status: "pending" },
        transaction,
      });

      if (!wallet) {
        throw new AppError("Recarga no encontrada", 404);
      }

      const idFromWallet =
        userType === "user" ? wallet.userId : wallet.providerId;

      if (!idFromWallet) {
        throw new AppError(
          "El tipo de usuario no coincide con el registro",
          400
        );
      }

      await wallet.update(
        {
          status: "accepted",
          adminId,
          updatedAt: new Date(),
        },
        { transaction }
      );

      await this.addBalance({
        quantity: wallet.quantity,
        id: idFromWallet,
        userType,
        transaction,
      });

      await transaction.commit();
      return wallet;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
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
  // TODO: ELIMINAR RECARGA ACEPTADA

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

  async discountBalance({ quantity, id, transaction, userType }) {
    const { model: Model } = this.getModel(userType);

    console.log("🔍 discountBalance called with:", { quantity, id, userType });

    const result = await Model.decrement("totalBalance", {
      by: quantity,
      where: { id },
      transaction,
    });

    console.log("💰 discountBalance result:", result);
    return result;
  }

  async addBalance({ quantity, id, transaction, userType }) {
    const { model: Model } = this.getModel(userType);

    console.log("🔍 addBalance called with:", { quantity, id, userType });

    const result = await Model.increment("totalBalance", {
      by: quantity,
      where: { id },
      transaction,
    });

    console.log("💰 addBalance result:", result);
    return result;
  }

  // CONSULTAS
  async getTotalBalance({ userId, userType, transaction }) {
    const { model: Model } = this.getModel(userType);

    const account = await Model.findByPk(userId, { transaction });

    if (!account) {
      throw new AppError("Cuenta no encontrado", 404);
    }

    let totalBalance = new Decimal(account.totalBalance || 0);

    return totalBalance;
  }

  async getMovements({ id, userType, operationType, limit = 10, offset = 0 }) {
    if (!userType) {
      throw new AppError("La query userType es requerida", 400);
    }

    if (!["user", "provider"].includes(userType)) {
      throw new AppError(
        "Tipo de usuario no válido, debe ser 'user' o 'provider'",
        400
      );
    }

    const opTypes = ["recharge", "purchase", "refund", "earning", "deduct"];

    if (operationType && !opTypes.includes(operationType)) {
      throw new AppError("Tipo de operación no válido", 400);
    }

    const { walletField, filters } = this.getModel(userType);

    const whereClause = {
      [walletField]: id,
    };

    if (operationType) {
      whereClause.operationType = operationType;
    } else if (filters && filters.length > 0) {
      whereClause.operationType = { [db.Sequelize.Op.in]: filters };
    }

    const { rows, count } = await db.Wallet.findAndCountAll({
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
          model: db.Admins,
          as: "admin",
          attributes: ["username"],
        },
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return { rows, count };
  }

  async getMyMovements({ id, userType, limit = 10, offset = 0 }) {
    return await this.getMovements({ id, userType, limit, offset });
  }

  async getRecharges({ id, status = null, limit = 10, offset = 0, userType }) {
    if (!userType) {
      throw new AppError("La query userType es requerida", 400);
    }

    if (!["user", "provider"].includes(userType)) {
      throw new AppError(
        "Tipo de usuario no válido, debe ser 'user' o 'provider'",
        400
      );
    }

    const { walletField } = this.getModel(userType);

    const whereClause = {
      [walletField]: id,
      operationType: "recharge",
    };

    if (status) {
      whereClause.status = status;
    }

    return await db.Wallet.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: db.Admins,
          as: "admin",
          attributes: ["username"],
        },
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });
  }

  async getPurchases({ userId, limit = 10, offset = 0 }) {
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
      limit,
      offset,
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
