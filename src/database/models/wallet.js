"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Wallet extends Model {
    static associate(models) {
      // Relación con usuarios
      Wallet.belongsTo(models.Users, {
        foreignKey: "userId",
        as: "user",
      });

      // Relación con proveedores
      Wallet.belongsTo(models.Providers, {
        foreignKey: "providerId",
        as: "provider",
      });

      // Relación con productos
      Wallet.belongsTo(models.ProductItem, {
        foreignKey: "productItemId",
        as: "productItem",
      });

      // Admin que aprobó la operación
      Wallet.belongsTo(models.Admins, {
        foreignKey: "adminId",
        as: "admin",
      });
    }

    // Método para calcular saldo total
    static async getTotalBalance(userId) {
      const transactions = await this.findAll({
        where: { userId },
        attributes: ["quantity", "operationType"],
      });

      return transactions.reduce((balance, transaction) => {
        if (transaction.operationType === "recharge") {
          return balance + transaction.quantity;
        } else if (transaction.operationType === "purchase") {
          return balance - transaction.quantity;
        } else if (transaction.operationType === "refund") {
          return balance + transaction.quantity;
        }
        return balance;
      }, 0);
    }
  }

  Wallet.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      quantity: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        validate: {
          min: 0.01,
        },
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      operationDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: "operation_date",
      },
      operationCode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: "operation_code",
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        field: "user_id",
      },
      providerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "providers",
          key: "id",
        },
        field: "provider_id",
      },
      productItemId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "product_items",
          key: "id",
        },
        field: "product_item_id",
      },
      adminId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "admins",
          key: "id",
        },
        field: "admin_id",
      },
      status: {
        type: DataTypes.ENUM("pending", "accepted", "rejected"),
        defaultValue: "pending",
      },
      operationType: {
        type: DataTypes.ENUM("recharge", "purchase", "refund"),
        allowNull: false,
        field: "operation_type",
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
      modelName: "Wallet",
      tableName: "wallets",
      timestamps: true,
    }
  );

  return Wallet;
};
