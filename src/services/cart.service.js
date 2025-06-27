const db = require("./../database/models/index.js");
const { addDays } = require("date-fns");
const { toZonedTime } = require("date-fns-tz");
const WalletService = require("./wallet.service.js");
const AppError = require("../utils/appError.js");
const Decimal = require("decimal.js");

class CartService {
  constructor() {
    this.walletService = new WalletService();
    this.RESERVATION_TIME_MINUTES = 1; // 30 minutos de reserva
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

  // Limpiar items expirados automáticamente
  async cleanExpiredItems() {
    const expiredItems = await db.ProductsInCarts.findAll({
      include: [
        {
          model: db.ProductItem,
          as: "productItem",
          where: {
            status: {
              [db.Sequelize.Op.in]: ["purchased", "inactive", "unpublished"],
            },
          },
        },
      ],
    });

    // eliminar expirados
    const deletedCount = await db.ProductsInCarts.destroy({
      where: {
        id: {
          [db.Sequelize.Op.in]: expiredItems.map((item) => item.id),
        },
      },
    });

    return deletedCount;
  }

  async addToCart({ userId, productId }) {
    const transaction = await db.sequelize.transaction();

    try {
      // Limpiar items expirados antes de comenzar
      await this.cleanExpiredItems();

      const product = await db.Product.findByPk(productId);
      if (!product) {
        throw new AppError("Producto no encontrado", 404);
      }

      // Buscar o crear el carrito
      let cart = await db.Carts.findOne({ where: { userId }, transaction });

      if (!cart) {
        cart = await db.Carts.create(
          {
            userId,
            productId,
          },
          { transaction }
        );
      }

      // BUSCAR Y BLOQUEAR el primer ProductItem disponible (FOR UPDATE)
      const [availableItem] = await db.sequelize.query(
        `
        SELECT * FROM "product_items"
        WHERE "product_id" = :productId AND "status" = 'published'
        LIMIT 1
        FOR UPDATE SKIP LOCKED
        `,
        {
          replacements: { productId },
          type: db.Sequelize.QueryTypes.SELECT,
          transaction,
          model: db.ProductItem,
          mapToModel: true,
        }
      );

      if (!availableItem) {
        throw new AppError(
          "No hay cuentas disponibles para este producto",
          400
        );
      }

      // Marcarlo como reservado
      await availableItem.update({ status: "reserved" }, { transaction });

      // Agregarlo al carrito
      await db.ProductsInCarts.create(
        {
          userId,
          cartId: cart.id,
          productItemId: availableItem.id,
          price: product.regularPrice,
        },
        { transaction }
      );

      await transaction.commit();

      // Devolver cantidad de items
      const totalItems = await db.ProductsInCarts.count({
        where: { cartId: cart.id },
      });
      return { message: "Producto agregado al carrito", totalItems };
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  // Obtener carrito del usuario
  async getCart({ userId, transaction }) {
    // Limpiar items expirados primero
    await this.cleanExpiredItems();

    const cart = await db.Carts.findOne({
      where: { userId },
      include: [
        {
          model: db.ProductsInCarts,
          as: "productsInCarts",
          include: [
            {
              model: db.ProductItem,
              as: "productItem",
              include: [
                {
                  model: db.Product,
                  as: "product",
                  attributes: [
                    "productName",
                    "duration",
                    "salePrice",
                    "regularPrice",
                    "renewalPrice",
                    "typeOfDelivery",
                    "termsOfUse",
                  ],
                },
              ],
            },
          ],
        },
      ],
      order: [["createdAt", "ASC"]],
      transaction,
    });

    // Si no hay carrito, o está vacío
    if (!cart || !cart.productsInCarts.length) {
      return {
        message: "El carrito vacío",
        totalAmount: 0,
        itemsCount: 0,
        items: [],
      };
    }

    // Calcular total
    const total = cart.productsInCarts.reduce((acc, item) => {
      return acc.plus(new Decimal(item.price));
    }, new Decimal(0));

    return {
      message: "Carrito obtenido exitosamente",
      id: cart.id,
      totalAmount: total.toNumber(),
      itemsCount: cart.productsInCarts.length,
      items: cart.productsInCarts,
    };
  }

  // Remover item del carrito
  async removeFromCart({ userId, productInCartId }) {
    const item = await db.ProductsInCarts.findOne({
      where: {
        id: productInCartId,
        userId,
      },
      include: [
        {
          model: db.ProductItem,
          as: "productItem",
        },
      ],
    });

    if (!item) {
      throw new AppError("Item no encontrado en tu carrito", 400);
    }

    // Liberar la reserva (volver a 'published')
    await db.ProductItem.update(
      { status: "published" },
      { where: { id: item.productItemId } }
    );

    // Eliminar del carrito
    return await item.destroy();
  }

  // Limpiar todo el carrito
  async clearCart({ userId, transaction }) {
    const cart = await this.getCart({ userId, transaction });

    if (cart.itemsCount === 0) {
      return 0;
    }

    // Liberar todas las reservas
    const productItemIds = cart.items.map((item) => item.productItemId);

    if (productItemIds.length > 0) {
      await db.ProductItem.update(
        { status: "published" },
        {
          where: {
            id: { [db.Sequelize.Op.in]: productItemIds },
            status: "reserved",
          },
          transaction,
        }
      );
    }

    // Eliminar todos los productos del carrito
    const deletedCount = await db.ProductsInCarts.destroy({
      where: {
        cartId: cart.id,
      },
      transaction,
    });

    return deletedCount;
  }

  async calculateAmountToPay({ cart, transaction }) {
    let originalAmount = new Decimal(0);
    let totalAmount = new Decimal(0);

    const discounts = await db.PurchaseDiscount.findAll({ transaction });

    const itemsWithCalculatedPrices = [];
    const matchedItemIds = new Set();
    const groupedItems = {};

    for (const item of cart.items) {
      originalAmount = originalAmount.plus(new Decimal(item.price));
    }

    for (const item of cart.items) {
      for (const discount of discounts) {
        const pattern = new RegExp(discount.nameDiscount, "i");
        const productName = item.productItem.product.productName.toLowerCase();

        if (pattern.test(productName)) {
          const key = discount.nameDiscount.toLowerCase();
          if (!groupedItems[key]) groupedItems[key] = [];
          groupedItems[key].push(item);
          matchedItemIds.add(item.id);
          break;
        }
      }
    }

    for (const [discountName, items] of Object.entries(groupedItems)) {
      const applicableDiscounts = discounts
        .filter((d) => d.nameDiscount.toLowerCase() === discountName)
        .sort((a, b) => b.quantityProducts - a.quantityProducts);

      const bestDiscount = applicableDiscounts.find(
        (d) => items.length >= d.quantityProducts
      );

      if (items.length === 1) {
        const item = items[0];
        const salePrice =
          item.productItem?.product?.salePrice &&
          new Decimal(item.productItem.product.salePrice).gt(0)
            ? new Decimal(item.productItem.product.salePrice)
            : new Decimal(item.price);

        totalAmount = totalAmount.plus(salePrice);

        itemsWithCalculatedPrices.push({
          itemId: item.id,
          originalPrice: new Decimal(item.price),
          finalPrice: salePrice,
          discountApplied: 0,
          note: "Usó salePrice porque solo se compró un ítem",
        });
      } else if (bestDiscount) {
        const rate = new Decimal(1).minus(
          new Decimal(bestDiscount.percentageDiscount)
        );

        for (const item of items) {
          const basePrice =
            item.productItem?.product?.salePrice &&
            new Decimal(item.productItem.product.salePrice).gt(0) &&
            !bestDiscount
              ? new Decimal(item.productItem.product.salePrice)
              : new Decimal(item.price);

          const discountedPrice = basePrice.mul(rate);

          totalAmount = totalAmount.plus(discountedPrice);

          itemsWithCalculatedPrices.push({
            itemId: item.id,
            originalPrice: new Decimal(item.price),
            finalPrice: discountedPrice,
            discountApplied: bestDiscount.percentageDiscount,
          });
        }
      } else {
        for (const item of items) {
          const itemPrice = new Decimal(item.price);
          totalAmount = totalAmount.plus(itemPrice);

          itemsWithCalculatedPrices.push({
            itemId: item.id,
            originalPrice: itemPrice,
            finalPrice: itemPrice,
            discountApplied: 0,
          });
        }
      }
    }

    const itemsWithoutDiscount = cart.items.filter(
      (item) => !matchedItemIds.has(item.id)
    );

    for (const item of itemsWithoutDiscount) {
      const rawPrice =
        item.productItem?.product?.salePrice &&
        new Decimal(item.productItem.product.salePrice).gt(0)
          ? item.productItem.product.salePrice
          : item.price ?? 0;

      const price = new Decimal(rawPrice);
      totalAmount = totalAmount.plus(price);

      itemsWithCalculatedPrices.push({
        itemId: item.id,
        originalPrice: new Decimal(item.price),
        finalPrice: price,
        discountApplied: 0,
      });
    }

    const discountAmount = originalAmount.minus(totalAmount);

    return {
      originalAmount: originalAmount.toNumber(),
      discountAmount: discountAmount.toNumber(),
      totalAmount: totalAmount.toNumber(),
      itemPrices: itemsWithCalculatedPrices,
    };
  }

  async purchaseCart({ userId, userType }) {
    const transaction = await db.sequelize.transaction();

    try {
      const cart = await this.getCart({ userId, transaction });

      if (cart.itemsCount === 0) {
        throw new AppError("El carrito está vacío", 400);
      }

      const {
        totalAmount,
        originalAmount,
        discountAmount,
        itemPrices, // Usar los precios calculados
      } = await this.calculateAmountToPay({
        cart,
        transaction,
      });

      let userBalance = await this.walletService.getTotalBalance({
        userId,
        userType,
        transaction,
      });

      if (userBalance.lessThan(totalAmount)) {
        throw new AppError(
          `Saldo insuficiente. Necesitas $${totalAmount}, tienes $${userBalance}`,
          400
        );
      }

      const purchases = [];
      const timeZone = "America/Lima";
      const purchaseDate = toZonedTime(new Date(), timeZone);
      const purchasingGroupCode = this.generateOperationCode("purchase");

      // Crear un mapa para acceso rápido a precios por ítem
      const priceMap = new Map(
        itemPrices.map((item) => [item.itemId, item.finalPrice.toNumber()])
      );

      for (const cartItem of cart.items) {
        const stillExists = await db.ProductItem.findByPk(
          cartItem.productItemId,
          { transaction }
        );

        if (!stillExists) {
          throw new AppError(
            `El producto ${cartItem.productItem.product.productName} ya no está disponible`,
            400
          );
        }

        const expirationDate = addDays(
          purchaseDate,
          cartItem.productItem.product.duration
        );

        // Usar el precio calculado (con descuento si aplica)
        const finalPrice = priceMap.get(cartItem.id) || cartItem.price;

        await this.walletService.createMovement({
          quantity: finalPrice, // Usar precio con descuento
          description: `Compra: ${cartItem.productItem.product.productName}`,
          userId,
          providerId: cartItem.productItem.providerId,
          productItemId: cartItem.productItemId,
          transaction,
        });

        await this.walletService.createMovement({
          quantity: finalPrice, // Usar precio con descuento
          description: `Venta: ${cartItem.productItem.product.productName}`,
          providerId: cartItem.productItem.providerId,
          productItemId: cartItem.productItemId,
          operationType: "earning",
          status: "accepted",
          transaction,
        });

        await db.ProductItem.update(
          {
            status: "purchased",
            soldAt: new Date(),
            soldTo: userId,
          },
          {
            where: { id: cartItem.productItemId },
            transaction,
          }
        );

        const purchase = await db.Purchase.create(
          {
            purchaseCode: this.generateOperationCode("purchase"),
            productCodeItem: cartItem.productItem.productCodeItem,
            termsOfUse: cartItem.productItem.product.termsOfUse,
            purchasingGroupCode,
            productItemName: cartItem.productItem.productItemName,
            productItemid: cartItem.productItemId,
            userId,
            providerId: cartItem.productItem.providerId,
            duration: cartItem.productItem.product.duration,
            renewalPrice: cartItem.productItem.product.renewalPrice,
            purcahaseDate: purchaseDate,
            expirationDate,
            status: "purchased",
          },
          { transaction }
        );

        purchases.push({ cartItem, purchase });
      }

      await this.clearCart({ userId, transaction });
      await transaction.commit();

      return {
        message: "Compra realizada exitosamente",
        totalPaid: totalAmount,
        originalAmount, // TODO: Corregir calculo
        discount: discountAmount,
        purchases,
      };
    } catch (error) {
      console.log({ error });
      await transaction.rollback();
      throw new AppError(error.message, error.statusCode || 500);
    }
  }

  async getCartItemCount({ userId }) {
    const cart = await this.getCart({ userId });

    return cart ? cart.productsInCarts.length : 0;
  }
}

module.exports = CartService;
