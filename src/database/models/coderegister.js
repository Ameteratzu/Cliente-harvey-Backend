"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class RegistrationCodes extends Model {
    static associate(models) {
      // define association here
    }
  }
  RegistrationCodes.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      code: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      roleType: {
        allowNull: false,
        type: DataTypes.STRING,
        field: "role_type",
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
      modelName: "RegistrationCodes",
      tableName: "registration_codes",
      timestamps: true,
    }
  );
  return RegistrationCodes;
};
