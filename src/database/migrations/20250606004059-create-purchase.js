"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop existing enum types if they exist
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_purchases_status";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_purchases_type_of_delivery";'
    );

    // Create enum types
    await queryInterface.sequelize.query(
      `CREATE TYPE "enum_purchases_status" AS ENUM ('purchased', 'support', 'ordered', 'delivered', 'resolved', 'renewed', 'beaten');`
    );
    await queryInterface.sequelize.query(
      `CREATE TYPE "enum_purchases_type_of_delivery" AS ENUM ('selfDelivery', 'uponRequest');`
    );

    await queryInterface.createTable("purchases", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      purchaseCode: {
        type: Sequelize.STRING,
        allowNull: false,
        field: "purchase_code",
      },
      productCodeItem: {
        type: Sequelize.STRING,
        allowNull: false,
        field: "product_code_item",
      },
      purchasingGroupCode: {
        type: Sequelize.STRING,
        allowNull: false,
        field: "purchasing_group_code",
      },
      productItemName: {
        type: Sequelize.STRING,
        allowNull: false,
        field: "product_item_name",
      },
      termsOfUse: {
        type: Sequelize.STRING,
        allowNull: false,
        field: "terms_of_use",
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      renewalPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        field: "renewal_price",
      },
      purcahaseDate: {
        type: Sequelize.DATE,
        allowNull: false,
        field: "purchase_date",
      },
      expirationDate: {
        type: Sequelize.DATE,
        allowNull: false,
        field: "expiration_date",
      },
      note: {
        type: Sequelize.TEXT,
      },
      descriptionProblem: {
        type: Sequelize.TEXT,
        field: "description_problem",
      },
      status: {
        type: Sequelize.ENUM(
          "purchased", // comprado
          "support", // en soporte
          "ordered", // pedido
          "delivered", // entregado
          "resolved", // resuelto
          "renewed", // renovado
          "beaten" // vencido
        ),
        defaultValue: "purchased",
        allowNull: false,
      },
      productItemid: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "product_items",
          key: "id",
        },
        field: "product_item_id",
      },
      userId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "users",
          key: "id",
        },
        field: "user_id",
      },
      providerId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "providers",
          key: "id",
        },
        field: "provider_id",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("purchases");

    // Drop enum types
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_purchases_status";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_purchases_type_of_delivery";'
    );
  },
};
