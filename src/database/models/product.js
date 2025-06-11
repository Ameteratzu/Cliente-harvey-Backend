"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      Product.belongsTo(models.Providers, {
        foreignKey: "providerId",
        as: "provider",
      });

      Product.belongsTo(models.Categories, {
        foreignKey: "categoryId",
        as: "category",
      });

      Product.hasMany(models.ProductImages, {
        foreignKey: "productId",
        as: "images",
      });

      Product.hasMany(models.ProductItem, {
        foreignKey: "productId",
        as: "productItem",
      });
    }
  }
  Product.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      productCode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: "product_code",
      },
      productName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "product_name",
      },
      termsOfUse: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: "terms_of_use",
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      publishStartDate: {
        type: DataTypes.DATE,
        field: "publish_start_date",
      },
      publishEndDate: {
        type: DataTypes.DATE,
        field: "publish_end_date",
      },
      isOnSale: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "is_on_sale",
      },
      regularPrice: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        field: "regular_price",
      },
      salePrice: {
        type: DataTypes.DECIMAL,
        defaultValue: 0,
        field: "sale_price",
      },
      renewalPrice: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        defaultValue: 0,
        field: "renewal_price",
      },
      providerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "provider_id",
        references: {
          model: "providers",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "category_id",
        references: {
          model: "categories",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      isPublished: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "is_published",
      },
      url: {
        type: DataTypes.STRING,
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
      modelName: "Product",
      tableName: "products",
      timestamps: true,
    }
  );
  return Product;
};
