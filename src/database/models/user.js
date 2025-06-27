"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Referrals, {
        foreignKey: "userId",
        as: "referrals",
      });
      User.hasMany(models.Referrals, {
        foreignKey: "referralUserId",
        as: "referralUsers",
      });
      User.hasMany(models.Purchase, {
        foreignKey: "userId",
        as: "purchases",
      });
      User.hasMany(models.Wallet, {
        foreignKey: "userId",
        as: "wallet",
      });
    }
  }
  User.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
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
      status: {
        type: DataTypes.ENUM("active", "blocked", "pending_verification"),
        allowNull: false,
        defaultValue: "pending_verification",
      },
      lockedUntil: {
        type: DataTypes.DATE,
        field: "locked_until",
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      codeUser: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: "code_user",
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
      modelName: "Users",
      tableName: "users",
      timestamps: true,
    }
  );
  return User;
};
