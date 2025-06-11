"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class EmailCode extends Model {
    static associate(models) {}
  }
  EmailCode.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      code: {
        type: DataTypes.STRING,
      },
      targetId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        field: "target_id",
      },
      targetType: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "target_type",
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
      modelName: "EmailCode",
      tableName: "email_codes",
      timestamps: true,
    }
  );
  return EmailCode;
};
