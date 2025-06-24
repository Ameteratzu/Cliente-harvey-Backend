const db = require("./../database/models/index.js");
const { addDays } = require("date-fns");
const { toZonedTime } = require("date-fns-tz");
const AppError = require("../utils/appError.js");
const UserService = require("./user.service.js");

class PurchaseService {
  constructor() {
    this.userService = new UserService();
  }

  getModel(userType) {
    const models = {
      user: { model: db.Users, purchaseField: "userId" },
      provider: { model: db.Providers, purchaseField: "providerId" },
    };

    const entry = models[userType];
    if (!entry) {
      throw new AppError("Tipo de usuario no válido", 404);
    }

    return entry;
  }

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

  async createPurchase(purchaseData) {
    const { duration, ...rest } = purchaseData;

    const timeZone = "America/Lima";
    const purchaseDate = toZonedTime(new Date(), timeZone);
    const expirationDate = addDays(purchaseDate, duration);

    const purchaseCode = this.generateOperationCode("purchase");

    return await db.Purchase.create({
      ...rest,
      purchaseCode,
      duration,
      expirationDate,
      purchaseDate,
    });
  }

  async getPurchases(status) {
    const listStatus = [
      "purchased",
      "support",
      "ordered",
      "delivered",
      "resolved",
      "renewed",
      "beaten",
    ];

    const where = {};
    if (status) {
      if (!listStatus.includes(status)) {
        throw new AppError("Status no válido", 400);
      }
      where.status = status;
    }

    return await db.Purchase.findAll({ where });
  }

  async getMyPurchases({ id, role, status }) {
    const { purchaseField } = this.getModel(role);

    const where = { [purchaseField]: id };
    if (status) where.status = status;

    return await db.Purchase.findAll({ where });
  }

  async getUserPurchases(userId) {
    return await db.Purchase.findAll({ where: { userId } });
  }

  async sendPurchaseSupport({ descriptionProblem, userId, purchaseId }) {
    return await db.Purchase.update(
      { descriptionProblem, status: "support" },
      { where: { userId, id: purchaseId } }
    );
  }

  async solveSupport({ purchaseId, note }) {
    return await db.Purchase.update(
      { status: "resolved", note },
      { where: { id: purchaseId } }
    );
  }

  async changeToPurchased({ purchaseId }) {
    return await db.Purchase.update(
      { status: "purchased" },
      { where: { id: purchaseId } }
    );
  }

  async changeToRefuned({ purchaseId }) {
    return await db.Purchase.update(
      { status: "renewed" },
      { where: { id: purchaseId } }
    );
  }

  async getProviderSales({ providerId, userId }) {
    let where = { providerId, status: "purchased" };
    if (userId && !isNaN(userId)) {
      await this.userService.getUserById(userId);
      where.userId = userId;
    }

    return await db.Purchase.findAll({
      where,
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

  async getProviderSalesById(providerId) {
    return await db.Purchase.findAll({
      where: { providerId, status: "purchased" },
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
}

module.exports = PurchaseService;
