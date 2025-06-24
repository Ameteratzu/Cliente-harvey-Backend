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
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      purchasingGroupCode: {
        type: DataTypes.STRING,
      },
      operationDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: "operation_date",
      },
      operationCode: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "operation_code",
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        field: "user_id",
      },
      providerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "providers",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        field: "provider_id",
      },
      adminId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "admins",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        field: "admin_id",
      },
      status: {
        type: DataTypes.ENUM("pending", "accepted", "rejected"),
        defaultValue: "pending",
      },
      note: {
        type: DataTypes.TEXT,
      },
      operationType: {
        type: DataTypes.ENUM(
          "recharge",
          "purchase",
          "refund",
          "earning",
          "deduct"
        ),
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
