"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Referrals extends Model {
    static associate(models) {
      // define association here
      Referrals.belongsTo(models.Users, {
        foreignKey: "userId",
        as: "user",
      });

      Referrals.belongsTo(models.Users, {
        foreignKey: "referralUserId",
        as: "referralUser",
      });
    }
  }
  Referrals.init(
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
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        field: "user_id",
      },
      referralUserId: {
        type: DataTypes.INTEGER,
        references: {
          model: "users",
          key: "id",
        },
        field: "referred_user_id",
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
      modelName: "Referrals",
      tableName: "referrals",
      timestamps: true,
    }
  );
  return Referrals;
};
