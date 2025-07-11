const db = require("./../database/models/index.js");
const AppError = require("../utils/appError.js");
const WalletService = require("./wallet.service.js");
const { differenceInDays } = require("date-fns");
const { toZonedTime } = require("date-fns-tz");
const Decimal = require("decimal.js");

class PublishedProductsService {
  constructor() {
    this.publishCost = 0;
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

  async createPublishedProduct({ body, role, id: providerId }) {
    const { productId, publishedEndDate } = body;

    const product = await db.Product.findOne({
      where: { id: productId, providerId },
    });

    if (!product) {
      throw new AppError("No tienes permisos para publicar este producto", 403);
    }
    const now = toZonedTime(new Date(), "America/Lima");
    const publishedProduct = await db.PublishedProducts.findOne({
      where: {
        productId,
        publishedEndDate: { [db.Sequelize.Op.gt]: now },
      },
    });

    const transaction = await db.sequelize.transaction();

    try {
      if (publishedProduct) {
        throw new AppError("El producto ya estaba publicado", 400);
      }

      const providerBalanceRaw = await this.walletService.getTotalBalance({
        userId: providerId,
        userType: role,
        transaction,
      });

      const providerBalance = new Decimal(providerBalanceRaw);

      const providerPaysDiscount = await db.ProviderDiscount.findOne({
        where: { name: "publication_price" },
        transaction,
      });

      const publishStartDate = toZonedTime(new Date(), "America/Lima");
      const days = differenceInDays(
        new Date(publishedEndDate),
        publishStartDate
      );

      let publishCost = new Decimal(this.publishCost || 0);

      if (providerPaysDiscount) {
        const discountPerDay = new Decimal(providerPaysDiscount.quantity || 0);
        publishCost = discountPerDay.mul(days);
      }

      if (providerBalance.lessThan(publishCost)) {
        throw new AppError(
          `Saldo insuficiente para publicar, tienes $${providerBalance.toFixed(
            2
          )}, necesitas $${publishCost.toFixed(2)}`,
          400
        );
      }

      await this.walletService.deductBalance({
        quantity: publishCost.toNumber(),
        id: providerId,
        description: `Descuento por publicación de ${product.productName}`,
        userType: role,
        transaction,
      });

      await db.PublishedProducts.create(
        {
          providerId,
          productId: product.id,
          publishedStartDate: publishStartDate,
          publishedEndDate,
        },
        { transaction }
      );

      await transaction.commit();
      return {
        message: "Producto publicado con éxito",
        publishCost: publishCost.toNumber(),
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getMyPublishedProducts({ providerId, limit = 10, offset = 0 }) {
    const { rows, count } = await db.PublishedProducts.findAndCountAll({
      where: {
        providerId,
      },
      include: [
        {
          model: db.Product,
          as: "product",
          include: [
            {
              model: db.ProductItem,
              as: "productItem",
              attributes: ["id", "status"],
            },
            {
              model: db.ProductImages,
              as: "images",
              attributes: ["id", "url"],
            },
          ],
        },
        {
          model: db.Providers,
          as: "provider",
        },
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    // Mapear y agregar campos requeridos
    const publishedProducts = rows.map((pub) => {
      const startDate = pub.publishedStartDate;
      const endDate = pub.publishedEndDate;
      const remainingDays = differenceInDays(new Date(endDate), new Date());

      return {
        product: {
          id: pub.product.id,
          productName: pub.product.productName,
          stock: pub.product.productItem.filter((p) => p.status === "published")
            .length,
          images: pub.product.images,
        },
        publishedStartDate: startDate,
        publishedEndDate: endDate,
        remainingDays: remainingDays >= 0 ? remainingDays : 0,
      };
    });

    return {
      count,
      publishedProducts,
    };
  }

  async getAllPublishedProducts({ limit = 10, offset = 0 }) {
    const { rows, count } = await db.PublishedProducts.findAndCountAll({
      where: {
        publishedEndDate: { [db.Sequelize.Op.gt]: new Date() },
      },
      attributes: ["id", "publishedStartDate", "publishedEndDate", "createdAt"],
      include: [
        {
          model: db.Product,
          as: "product",
          include: [
            {
              model: db.ProductItem,
              as: "productItem",
              attributes: ["id", "status"],
            },
            {
              model: db.Rating,
              as: "ratings",
              attributes: ["id", "rating"],
            },
            {
              model: db.ProductImages,
              as: "images",
            },
          ],
        },
        {
          model: db.Providers,
          as: "provider",
          attributes: ["id", "businessName"],
        },
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    // Mapear y agregar campos requeridos
    const publishedProducts = rows.map((pub) => {
      return {
        id: pub.id,
        publishedStartDate: pub.publishedStartDate,
        publishedEndDate: pub.publishedEndDate,
        product: {
          id: pub.product.id,
          productName: pub.product.productName,
          duration: pub.product.duration,
          typeOfDelivery: pub.product.typeOfDelivery,
          productCode: pub.product.productCode,
          isOnSale: pub.product.isOnSale,
          salePrice: pub.product.salePrice,
          regularPrice: pub.product.regularPrice,
          typeOfDelivery: pub.product.typeOfDelivery,
          renewalPrice: pub.product.renewalPrice,
          stock: pub.product.productItem.filter((p) => p.status === "published")
            .length,
          rating:
            pub.product.ratings
              .map((r) => r.rating)
              .reduce((a, b) => a + b, 0) / pub.product.ratings.length,
        },
        images: pub.product.images,
        provider: {
          id: pub.provider.id,
          businessName: pub.provider.businessName,
        },
      };
    });

    return {
      count,
      publishedProducts,
    };
  }
}

module.exports = PublishedProductsService;
