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

      Product.hasMany(models.Rating, {
        foreignKey: "productId",
        as: "ratings",
      });

      Product.hasMany(models.PublishedProducts, {
        foreignKey: "productId",
        as: "publishedProducts",
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
      isOnSale: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "is_on_sale",
      },
      regularPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: "regular_price",
      },
      salePrice: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        field: "sale_price",
      },
      renewalPrice: {
        type: DataTypes.DECIMAL(10, 2),
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
      typeOfDelivery: {
        type: DataTypes.ENUM("selfDelivery", "uponRequest"),
        allowNull: false,
        field: "type_of_delivery",
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
