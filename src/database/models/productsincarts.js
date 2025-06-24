"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ProductsInCarts extends Model {
    static associate(models) {
      ProductsInCarts.belongsTo(models.Users, {
        foreignKey: "userId",
        as: "user",
      });

      ProductsInCarts.belongsTo(models.Carts, {
        foreignKey: "cartId",
        as: "cart",
      });

      ProductsInCarts.belongsTo(models.ProductItem, {
        foreignKey: "productItemId",
        as: "productItem",
      });
    }
  }
  ProductsInCarts.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      userId: {
        type: DataTypes.INTEGER,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        field: "user_id",
      },
      cartId: {
        type: DataTypes.INTEGER,
        references: {
          model: "carts",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        field: "cart_id",
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      productItemId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "product_items",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        field: "product_item_id",
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
      modelName: "ProductsInCarts",
      tableName: "products_in_carts",
      timestamps: true,
    }
  );
  return ProductsInCarts;
};
