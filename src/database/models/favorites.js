"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Favorites extends Model {
    static associate(models) {
      Favorites.belongsTo(models.Users, {
        foreignKey: "userId",
        as: "user",
      });

      Favorites.belongsTo(models.Product, {
        foreignKey: "productId",
        as: "product",
      });
    }
  }
  Favorites.init(
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
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        field: "user_id",
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "products",
          key: "id",
        },
        field: "product_id",
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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
      modelName: "Favorites",
      tableName: "favorites",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["user_id", "product_id"],
          name: "favorites_user_product_unique_idx",
        },
      ],
    }
  );
  return Favorites;
};
