"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("products", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      productCode: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        field: "product_code",
      },
      productName: {
        type: Sequelize.STRING,
        allowNull: false,
        field: "product_name",
      },
      termsOfUse: {
        type: Sequelize.TEXT,
        allowNull: false,
        field: "terms_of_use",
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      isOnSale: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "is_on_sale",
      },
      regularPrice: {
        type: Sequelize.DECIMAL,
        allowNull: false,
        field: "regular_price",
      },
      salePrice: {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
        field: "sale_price",
      },
      renewalPrice: {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
        field: "renewal_price",
      },
      typeOfDelivery: {
        type: Sequelize.ENUM("selfDelivery", "uponRequest"),
        allowNull: false,
        field: "type_of_delivery",
      },
      providerId: {
        type: Sequelize.INTEGER,
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
        type: Sequelize.INTEGER,
        allowNull: false,
        field: "category_id",
        references: {
          model: "categories",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: "created_at",
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: "updated_at",
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("products");
  },
};
