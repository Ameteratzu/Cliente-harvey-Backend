"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Purchase extends Model {
    static associate(models) {
      Purchase.belongsTo(models.ProductItem, {
        foreignKey: "productItemid",
        as: "productItem",
      });
      Purchase.belongsTo(models.Users, {
        foreignKey: "userId",
        as: "user",
      });
      Purchase.belongsTo(models.Providers, {
        foreignKey: "providerId",
        as: "provider",
      });
    }
  }
  Purchase.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      purchaseCode: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "purchase_code",
      },
      productCodeItem: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "product_code_item",
      },
      purchasingGroupCode: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "purchasing_group_code",
      },
      productItemName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "product_item_name",
      },
      termsOfUse: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "terms_of_use",
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      renewalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: "renewal_price",
      },
      purchaseDate: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "purchase_date",
      },
      expirationDate: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "expiration_date",
      },
      note: {
        type: DataTypes.TEXT,
      },
      descriptionProblem: {
        type: DataTypes.TEXT,
        field: "description_problem",
      },
      supportType: {
        type: DataTypes.ENUM("refund", "renewal", "problem"),
        field: "support_type",
      },
      status: {
        type: DataTypes.ENUM(
          "purchased", // comprado
          "support", // en soporte
          "ordered", // pedido
          "delivered", // entregado
          "resolved", // resuelto
          "renewed", // renovado
          "beaten" // vencido
        ),
        defaultValue: "purchased",
        allowNull: false,
      },
      productItemid: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: "product_items",
          key: "id",
        },
        field: "product_item_id",
      },
      userId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: "users",
          key: "id",
        },
        field: "user_id",
      },
      providerId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: "providers",
          key: "id",
        },
        field: "provider_id",
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
      modelName: "Purchase",
      tableName: "purchases",
      timestamps: true,
    }
  );
  return Purchase;
};
