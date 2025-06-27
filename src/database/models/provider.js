"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Provider extends Model {
    static associate(models) {
      Provider.hasMany(models.Wallet, {
        foreignKey: "providerId",
        as: "wallet",
      });
      Provider.hasMany(models.Product, {
        foreignKey: "providerId",
        as: "products",
      });
      Provider.hasMany(models.ProductItem, {
        foreignKey: "providerId",
        as: "productItems",
      });
      Provider.hasMany(models.PublishedProducts, {
        foreignKey: "providerId",
        as: "publishedProducts",
      });
    }
  }
  Provider.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      businessName: {
        type: DataTypes.STRING,
        unique: true,
        field: "business_name",
      },
      username: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      telephone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      secondTelephone: {
        type: DataTypes.STRING,
        field: "second_telephone",
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("active", "blocked", "pending_verification"),
        allowNull: false,
        defaultValue: "pending_verification",
      },
      lockedUntil: {
        type: DataTypes.DATE,
        field: "locked_until",
      },
      codeProvider: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: "code_provider",
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: "created_at",
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: "updated_at",
      },
    },
    {
      sequelize,
      modelName: "Providers",
      tableName: "providers",
      timestamps: true,
    }
  );
  return Provider;
};
