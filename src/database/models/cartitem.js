"use strict";
const { Model } = require("sequelize");
const { isBefore, differenceInMinutes } = require("date-fns");

module.exports = (sequelize, DataTypes) => {
  class CartItem extends Model {
    static associate(models) {
      CartItem.belongsTo(models.Users, {
        foreignKey: "userId",
        as: "user",
      });

      CartItem.belongsTo(models.ProductItem, {
        foreignKey: "productItemId",
        as: "productItem",
      });
    }

    // Verificar si el item expiró
    isExpired() {
      return isBefore(this.expiresAt, new Date());
    }

    // Tiempo restante en minutos
    getTimeLeft() {
      const now = new Date();
      const timeLeft = differenceInMinutes(this.expiresAt, now);
      return Math.max(0, timeLeft);
    }
  }

  CartItem.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      productItemId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "product_items",
          key: "id",
        },
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0.01,
        },
      },
      typeOfDelivery: {
        type: DataTypes.ENUM("selfDelivery", "uponRequest"),
        allowNull: false,
        field: "type_of_delivery",
      },
      reservedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("reserved", "purchased", "expired"),
        defaultValue: "reserved",
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "CartItem",
      tableName: "cart_items",
      indexes: [
        {
          unique: true,
          fields: ["userId", "productItemId"],
          name: "unique_user_product_cart",
        },
      ],
    }
  );

  return CartItem;
};
