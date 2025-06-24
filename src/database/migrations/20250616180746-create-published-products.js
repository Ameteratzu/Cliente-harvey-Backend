"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("published_products", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      publishedStartDate: {
        type: Sequelize.DATE,
        allowNull: false,
        field: "published_start_date",
      },
      publishedEndDate: {
        type: Sequelize.DATE,
        allowNull: false,
        field: "published_end_date",
      },
      providerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "providers",
          key: "id",
        },
        field: "provider_id",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "products",
          key: "id",
        },
        field: "product_id",
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
    await queryInterface.dropTable("published_products");
  },
};
