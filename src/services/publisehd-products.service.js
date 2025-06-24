const db = require("./../database/models/index.js");
const AppError = require("../utils/appError.js");
const WalletService = require("./wallet.service.js");
const { differenceInDays } = require("date-fns");
const { toZonedTime } = require("date-fns-tz");

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

  async createPublishedProduct({ body, role }) {
    const { providerId, productId, publishedEndDate } = body;

    const provider = await db.Providers.findOne({ where: { id: providerId } });
    const product = await db.Product.findOne({ where: { id: productId } });

    const publishedProduct = await db.PublishedProducts.findOne({
      where: { productId },
    });

    if (!provider || !product) {
      throw new AppError("Proveedor o producto no encontrado", 404);
    }

    const transaction = await db.sequelize.transaction();

    try {
      // if (product.providerId !== providerId) {
      //   throw new AppError(
      //     "No tienes permiso para publicar este producto",
      //     401
      //   );
      // }

      if (product.id === publishedProduct?.id) {
        throw new AppError("El producto ya estaba publicado", 400);
      }

      const providerBalance = await this.walletService.getTotalBalance({
        userId: providerId,
        userType: role,
        transaction,
      });

      const providerPaysDiscount = await db.ProviderDiscount.findOne({
        where: { name: "publication_price" },
        transaction,
      });

      // TODO: PONER EXACTAMENTE LA FECHA DE HOY
      const publishStartDate = toZonedTime(new Date(), "America/Lima");
      console.log({ publishStartDate });

      const days = differenceInDays(
        new Date(publishedEndDate),
        publishStartDate
      );
      const publishCost =
        (providerPaysDiscount.quantity ?? this.publishCost) * days;

      if (providerBalance < publishCost) {
        throw new AppError(
          `Saldo insuficiente para publicar, tienes $${providerBalance}, necesitas $${publishCost}`,
          400
        );
      }

      await this.walletService.deductBalance({
        quantity: publishCost,
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
      return { message: "Producto publicado con éxito" };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getPublishedProducts(providerId) {
    const publishedProducts = await db.PublishedProducts.findAll({
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
          ],
        },
        {
          model: db.Providers,
          as: "provider",
        },
      ],
    });

    // Mapear y agregar campos requeridos
    const result = publishedProducts.map((pub) => {
      const startDate = pub.publishedStartDate;
      const endDate = pub.publishedEndDate;
      const remainingDays = differenceInDays(new Date(endDate), new Date());

      return {
        product: {
          id: pub.product.id,
          productName: pub.product.productName,
          stock: pub.product.productItem.filter((p) => p.status === "published")
            .length,
        },
        publishedStartDate: startDate,
        publishedEndDate: endDate,
        remainingDays: remainingDays >= 0 ? remainingDays : 0,
      };
    });

    return result;
  }

  async getAllPublishedProducts() {
    const publishedProducts = await db.PublishedProducts.findAll({
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
          ],
        },
        {
          model: db.Providers,
          as: "provider",
          attrubutes: ["id", "businessName"],
        },
      ],
    });

    // Mapear y agregar campos requeridos
    const result = publishedProducts.map((pub) => {
      return {
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
          // productItem: pub.product.productItem.filter(
          //   (p) => p.status === "published"
          // ),
          stock: pub.product.productItem.filter((p) => p.status === "published")
            .length,
        },
        provider: {
          id: pub.provider.id,
          businessName: pub.provider.businessName,
        },
      };
    });

    return result;
  }

  // TODO: ELIMINAR EN AUTOMATICO
}

module.exports = PublishedProductsService;
