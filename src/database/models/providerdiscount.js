"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ProviderDiscount extends Model {
    static associate(models) {
      ProviderDiscount.belongsTo(models.Providers, {
        foreignKey: "providerId",
        as: "provider",
      });
    }
  }

  ProviderDiscount.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      name: {
        type: DataTypes.ENUM("publication_price", "withdrawal"),
        allowNull: false,
      },
      // PORCENTAJE DE DESCUENTO POR RETIRO
      percentage: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      // CANTIDAD DE DESCUENTO POR PUBLICACION
      quantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      providerId: {
        type: DataTypes.INTEGER,
        references: {
          model: "Providers",
          key: "id",
        },
        field: "provider_id",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
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
      modelName: "ProviderDiscount",
      tableName: "provider_discounts",
      timestamps: true,
    }
  );
  return ProviderDiscount;
};
