const db = require("./../database/models/index.js");
const { addDays } = require("date-fns");
const { toZonedTime } = require("date-fns-tz");
const AppError = require("../utils/appError.js");
const UserService = require("./user.service.js");
const WalletService = require("./wallet.service.js");

class PurchaseService {
  constructor() {
    this.userService = new UserService();
    this.walletService = new WalletService();
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

  async filterPurchases(status) {
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

  // TRAER LOS PRODUCTOS MÁS VENDIDOS
  async getMostSoldProducts(limit = 10) {
    try {
      const mostSoldProducts = await db.sequelize.query(
        `
        SELECT 
          pi.id as productItemId,
          pi.product_code_item as productCodeItem,
          pi.product_item_name as productItemName,
          p.product_name as productName,
          p.product_code as productCode,
          p.regular_price as regularPrice,
          p.sale_price as salePrice,
          p.is_on_sale as isOnSale,
          c.category as categoryName,
          pr.business_name as businessName,
          COUNT(pu.id) as totalSales,
          SUM(CASE 
            WHEN p.is_on_sale = true THEN p.sale_price 
            ELSE p.regular_price 
          END) as totalRevenue
        FROM purchases pu
        INNER JOIN product_items pi ON pu.product_item_id = pi.id
        INNER JOIN products p ON pi.product_id = p.id
        INNER JOIN categories c ON p.category_id = c.id
        INNER JOIN providers pr ON p.provider_id = pr.id
        WHERE pu.status IN ('purchased', 'delivered', 'resolved', 'renewed')
        GROUP BY 
          pi.id, pi.product_code_item, pi.product_item_name,
          p.product_name, p.product_code, p.regular_price, 
          p.sale_price, p.is_on_sale, c.category, pr.business_name
        ORDER BY totalSales DESC, totalRevenue DESC
        LIMIT :limit
      `,
        {
          replacements: { limit },
          type: db.sequelize.QueryTypes.SELECT,
        }
      );

      return mostSoldProducts;
    } catch (error) {
      console.error("Error al obtener productos más vendidos:", error);
      throw new Error("No se pudieron obtener los productos más vendidos");
    }
  }

  async getPurchaseById(id) {
    const purchase = await db.Purchase.findByPk(id);
    if (!purchase) {
      throw new AppError("Compra no encontrada", 404);
    }
    return purchase;
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

  async acceptRenewal({ purchaseId, providerId, userType }) {
    const transaction = await db.sequelize.transaction();

    try {
      const purchase = await db.Purchase.findOne(
        {
          where: { id: purchaseId },
          include: [
            {
              model: db.ProductItem,
              as: "productItem",
              attributes: ["productItemName"],
              include: [
                {
                  model: db.Product,
                  as: "product",
                  attributes: [
                    "regularPrice",
                    "salePrice",
                    "renewalPrice",
                    "duration",
                  ],
                },
              ],
            },
          ],
        },
        {
          transaction,
        }
      );
      if (!purchase) {
        throw new AppError("Compra no encontrada", 404);
      }

      const providerBalance = await this.walletService.getTotalBalance({
        userId: providerId,
        userType,
        transaction,
      });

      if (providerBalance < purchase.renewalPrice) {
        throw new AppError("Saldo insuficiente", 400);
      }

      await this.walletService.deductBalance({
        quantity: purchase.renewalPrice,
        id: providerId,
        description: "Renovación de compra",
        userType,
        transaction,
      });

      const expirationDate = addDays(
        purchase.expirationDate,
        purchase.productItem.product.duration
      );

      purchase.expirationDate = expirationDate;
      purchase.status = "renewed";
      await purchase.save({ transaction });

      await transaction.commit();
      return purchase;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async deleteExpired({ purchaseId }) {
    const purchase = await this.getPurchaseById(purchaseId);
    if (!purchase.expirationDate < new Date()) {
      throw new AppError("La compra aún no ha expirado", 400);
    }

    return purchase.destroy();
  }
}

module.exports = PurchaseService;
