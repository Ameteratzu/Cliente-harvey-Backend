"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Purchase extends Model {
    static associate(models) {
      // define association here
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
        unique: true,
        field: "purchase_code",
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
      duration: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      amount: {
        allowNull: false,
        type: DataTypes.DECIMAL(10, 2),
      },
      renewalPrice: {
        allowNull: false,
        type: DataTypes.DECIMAL(10, 2),
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
      purchaseDate: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      expirationDate: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      supportDate: {
        // fecha de soporte
        type: DataTypes.DATE,
      },
      supportDescription: {
        // descripcion de soporte
        type: DataTypes.TEXT,
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
