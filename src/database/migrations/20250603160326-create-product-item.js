"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop existing enum type if it exists to avoid conflicts
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_product_items_status" CASCADE;');
    
    await queryInterface.createTable("product_items", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      productCodeItem: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        field: "product_code_item",
      },
      productItemName: {
        type: Sequelize.STRING,
        field: "product_item_name",
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      secondUsername: {
        type: Sequelize.STRING,
        field: "second_username",
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      url: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.ENUM(
          "published",
          "unpublished",
          "inactive",
          "reserved",
          "purchased"
        ),
        allowNull: false,
        defaultValue: "published",
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
    await queryInterface.dropTable("product_items");
  },
};
