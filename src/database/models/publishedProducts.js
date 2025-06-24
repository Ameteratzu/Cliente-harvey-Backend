"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class PublishedProducts extends Model {
    static associate(models) {
      PublishedProducts.belongsTo(models.Providers, {
        foreignKey: "providerId",
        as: "provider",
      });

      PublishedProducts.belongsTo(models.Product, {
        foreignKey: "productId",
        as: "product",
      });
    }
  }
  PublishedProducts.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      publishedStartDate: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "published_start_date",
      },
      publishedEndDate: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "published_end_date",
      },
      providerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Providers",
          key: "id",
        },
        field: "provider_id",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Products",
          key: "id",
        },
        field: "product_id",
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
      modelName: "PublishedProducts",
      tableName: "published_products",
      timestamps: true,
    }
  );
  return PublishedProducts;
};
