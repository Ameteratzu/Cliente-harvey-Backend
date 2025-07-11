const db = require("./../database/models/index.js");
const {
  addDays,
  format,
  startOfDay,
  differenceInCalendarDays,
} = require("date-fns");
const { toZonedTime } = require("date-fns-tz");
const Decimal = require("decimal.js");
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
      admin: { model: db.Admins, purchaseField: "adminId" },
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

  async getMyPurchases({ id, role, status, limit = 10, offset }) {
    const { purchaseField } = this.getModel(role);

    const where = { [purchaseField]: id };
    if (status) where.status = status;

    const { count, rows } = await db.Purchase.findAndCountAll({
      where,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return { count, rows };
  }

  async getUserPurchases({ userId, limit = 10, offset }) {
    const { count, rows } = await db.Purchase.findAndCountAll({
      where: { userId },
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return { count, rows };
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

  async requestRefund({ userId, purchaseId, descriptionProblem }) {
    const purchase = await this.getPurchaseById(purchaseId);
    if (purchase.userId !== userId) {
      throw new AppError(
        "No puedes solicitar un reembolso para otra compra",
        400
      );
    }

    const descriptionProblemMessage = descriptionProblem
      ? `Solicitud de reembolso: ${descriptionProblem}`
      : "Solicitud de reembolso";

    await purchase.update({
      status: "support",
      descriptionProblem: descriptionProblemMessage,
      supportType: "refund",
    });

    return {
      message: "Reembolso solicitado con éxito",
      data: {
        purchase: {
          id: purchase.id,
          status: purchase.status,
          supportType: purchase.supportType,
          descriptionProblem: purchase.descriptionProblem,
        },
      },
    };
  }

  // APROBAR REEMBOLSO - admin o provider
  async approveRefund({ purchaseId, id, userType }) {
    const { purchaseField } = this.getModel(userType);

    const transaction = await db.sequelize.transaction();

    try {
      const purchase = await db.Purchase.findByPk(purchaseId, {
        include: [
          { model: db.Users, as: "user" },
          { model: db.Providers, as: "provider" },
        ],
        transaction,
      });

      if (!purchase) {
        throw new AppError("Compra no encontrada", 404);
      }

      if (
        !["support"].includes(purchase.status) ||
        purchase.supportType !== "refund"
      ) {
        throw new AppError(
          "La compra no puede ser reembolsada en su estado actual",
          400
        );
      }

      const currentDate = startOfDay(toZonedTime(new Date(), "America/Lima"));
      const expirationDate = startOfDay(new Date(purchase.expirationDate));
      const purchaseDate = startOfDay(new Date(purchase.purchaseDate));
      console.log({ currentDate, expirationDate, purchaseDate });

      const remainingDays = differenceInCalendarDays(
        expirationDate,
        currentDate
      );
      console.log({ remainingDays });
      const daysUsed = differenceInCalendarDays(currentDate, purchaseDate) + 1;
      console.log({ daysUsed });

      if (remainingDays <= 0) {
        throw new AppError(
          "No se puede reembolsar, la compra ya ha expirado",
          400
        );
      }

      const renewalPrice = parseFloat(purchase.renewalPrice);
      const duration = purchase.duration;
      console.log("dayliERate: ", renewalPrice, duration);

      if (!duration || duration <= 0) {
        throw new AppError("La duración de la compra debe ser mayor a 0", 400);
      }

      // 30 (precio de renovación) / 30 (duración) = 1(precio por dia)  * 5 (días restantes) = 5
      const dailyRate = new Decimal(renewalPrice)
        .div(duration)
        .toDecimalPlaces(2);
      const refundAmount = dailyRate.mul(remainingDays).toDecimalPlaces(2);
      console.log({ refundAmount });

      if (refundAmount.lte(0)) {
        throw new AppError("El monto del reembolso debe ser mayor a 0", 400);
      }

      const operationCode = this.generateOperationCode("refund");

      // REEMBOLSO PARA EL USUARIO
      await db.Wallet.create(
        {
          quantity: refundAmount.toFixed(2),
          description: `Reembolso de compra ${purchase.purchaseCode} - ${purchase.productItemName}`,
          purchasingGroupCode: purchase.purchasingGroupCode,
          operationCode,
          userId: purchase.userId,
          [purchaseField]: id,
          status: "accepted",
          note: `Reembolso aprobado. Días restantes: ${remainingDays}, Monto: $${refundAmount.toFixed(
            2
          )}`,
          operationType: "refund",
        },
        { transaction }
      );

      await this.walletService.addBalance({
        quantity: refundAmount.toFixed(2),
        id,
        transaction,
        userType: "user",
      });

      // DESCUENTO PARA EL PROVEEDOR
      await db.Wallet.create(
        {
          quantity: refundAmount.toFixed(2),
          description: `Descuento por reembolso - Compra ${purchase.purchaseCode}`,
          purchasingGroupCode: purchase.purchasingGroupCode,
          operationCode,
          providerId: purchase.providerId,
          status: "accepted",
          note: `Descuento aplicado por reembolso de ${purchase.productItemName}`,
          operationType: "deduct",
        },
        { transaction }
      );

      await this.walletService.discountBalance({
        quantity: refundAmount.toFixed(2),
        id: purchase.providerId,
        transaction,
        userType: "provider",
      });

      const formattedDate = format(currentDate, "yyyy-MM-dd");

      await purchase.update(
        {
          status: "resolved",
          note: purchase.note
            ? `${purchase.note}\n--- REEMBOLSADO: $${refundAmount.toFixed(
                2
              )} el ${formattedDate} ---`
            : `REEMBOLSADO: $${refundAmount.toFixed(2)} el ${formattedDate}`,
        },
        { transaction }
      );

      await transaction.commit();

      return {
        success: true,
        message: "Reembolso procesado exitosamente",
        data: {
          purchaseId: purchase.id,
          purchaseCode: purchase.purchaseCode,
          refundAmount: parseFloat(refundAmount.toFixed(2)),
          daysUsed,
          remainingDays,
          operationCode,
          purchaseDate,
          expirationDate,
          processedAt: currentDate,
        },
      };
    } catch (error) {
      await transaction.rollback();

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(`Error al procesar reembolso: ${error.message}`, 500);
    }
  }

  async getProviderSales({ providerId, userId, limit = 10, offset }) {
    let where = { providerId, status: "purchased" };

    if (userId && !isNaN(userId)) {
      await this.userService.getUserById(userId);
      where.userId = userId;
    }

    const { rows, count } = await db.Purchase.findAndCountAll({
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
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return { rows, count };
  }

  async getProviderSalesById({ providerId, limit = 10, offset }) {
    return await db.Purchase.findAndCountAll({
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
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });
  }

  // ACEPTAR RENOVARCION DE COMPRAS
  async acceptRenewal({ purchaseIds, providerId, userType }) {
    const transaction = await db.sequelize.transaction();

    try {
      // Convertir a array si viene un solo ID
      const idsArray = Array.isArray(purchaseIds) ? purchaseIds : [purchaseIds];

      if (idsArray.length === 0) {
        throw new AppError("Debe proporcionar al menos un ID de compra", 400);
      }

      // Buscar todas las compras
      const purchases = await db.Purchase.findAll({
        where: {
          id: idsArray,
          status: ["purchased", "delivered", "renewed"], // Estados válidos para renovar
        },
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
        transaction,
      });

      if (purchases.length === 0) {
        throw new AppError("Compras no encontradas o no válidas", 404);
      }

      if (purchases.length !== idsArray.length) {
        const foundIds = purchases.map((p) => p.id);
        const missingIds = idsArray.filter((id) => !foundIds.includes(id));
        throw new AppError(
          `Compras no encontradas o no válidas: ${missingIds.join(", ")}`,
          404
        );
      }

      //Calcular costo total de renovación
      const totalRenewalCost = purchases.reduce((total, purchase) => {
        return total + parseFloat(purchase.renewalPrice);
      }, 0);

      //Verificar saldo del proveedor
      const providerBalance = await this.walletService.getTotalBalance({
        userId: providerId,
        userType,
        transaction,
      });

      if (providerBalance < totalRenewalCost) {
        throw new AppError(
          `Saldo insuficiente. Necesario: $${totalRenewalCost.toFixed(
            2
          )}, Disponible: $${providerBalance.toFixed(2)}`,
          400
        );
      }

      // Procesar cada renovación
      const renewalResults = [];

      for (const purchase of purchases) {
        // Deducir saldo por cada compra
        await this.walletService.deductBalance({
          quantity: purchase.renewalPrice,
          id: providerId,
          description: `Renovación - ${purchase.productItemName} (${purchase.purchaseCode})`,
          purchasingGroupCode: purchase.purchasingGroupCode,
          userType,
          transaction,
        });

        const newPurchaseDate = addDays(new Date(purchase.expirationDate), 1);

        // Calcular nueva fecha de expiración
        const newExpirationDate = addDays(
          newPurchaseDate,
          purchase.productItem.product.duration
        );

        // Actualizar la compra
        await purchase.update(
          {
            purchaseDate: newPurchaseDate,
            expirationDate: newExpirationDate,
            status: "renewed",
            note: purchase.note
              ? `${purchase.note}\n--- RENOVADO: ${
                  new Date().toISOString().split("T")[0]
                } ---`
              : `RENOVADO: ${new Date().toISOString().split("T")[0]}`,
          },
          { transaction }
        );

        renewalResults.push({
          purchaseId: purchase.id,
          purchaseCode: purchase.purchaseCode,
          productName: purchase.productItemName,
          renewalCost: parseFloat(purchase.renewalPrice),
          previousExpiration: purchase.expirationDate,
          newExpiration: newExpirationDate,
          daysExtended: purchase.productItem.product.duration,
        });
      }

      await transaction.commit();

      return {
        success: true,
        message: `${purchases.length} compra(s) renovada(s) exitosamente`,
        data: {
          totalProcessed: purchases.length,
          totalCost: parseFloat(totalRenewalCost.toFixed(2)),
          remainingBalance: parseFloat(
            (providerBalance - totalRenewalCost).toFixed(2)
          ),
          renewals: renewalResults,
          processedAt: new Date(),
        },
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Método auxiliar para renovación individual (backward compatibility)
  async acceptSingleRenewal({ purchaseId, providerId, userType }) {
    return await this.acceptRenewal({
      purchaseIds: purchaseId,
      providerId,
      userType,
    });
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
