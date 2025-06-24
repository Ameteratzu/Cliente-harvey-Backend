"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class PurchaseDiscount extends Model {
    static associate(models) {
      // define association here
    }
  }
  PurchaseDiscount.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      percentageDiscount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: "percentage_discount",
      },
      quantityProducts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "quantity_products",
      },
      nameDiscount: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "name_discount",
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
      modelName: "PurchaseDiscount",
      tableName: "purchase_discounts",
      timestamps: true,
    }
  );
  return PurchaseDiscount;
};
