"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ProductItem extends Model {
    static associate(models) {
      ProductItem.belongsTo(models.Product, {
        foreignKey: "productId",
        as: "product",
      });

      ProductItem.belongsTo(models.Providers, {
        foreignKey: "providerId",
        as: "provider",
      });
    }
  }
  ProductItem.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      productCodeItem: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: "product_code_item",
      },
      productItemName: {
        type: DataTypes.STRING,
        field: "product_item_name",
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      secondUsername: {
        type: DataTypes.STRING,
        field: "second_username",
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      url: {
        type: DataTypes.STRING,
      },
      status: {
        type: DataTypes.ENUM(
          "published",
          "unpublished",
          // INTERACTUAR EL USUARIO EN LA COMPRA
          "inactive",
          "reserved",
          "purchased"
        ),
        allowNull: false,
        defaultValue: "published",
      },
      providerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "providers",
          key: "id",
        },
        field: "provider_id",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "products",
          key: "id",
        },
        field: "product_id",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        field: "created_at",
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        field: "updated_at",
      },
    },
    {
      sequelize,
      modelName: "ProductItem",
      tableName: "product_items",
      timestamps: true,
    }
  );
  return ProductItem;
};
