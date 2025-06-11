"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
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
        unique: true,
        field: "purchase_code",
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
      duration: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      amount: {
        allowNull: false,
        type: Sequelize.DECIMAL(10, 2),
      },
      renewalPrice: {
        allowNull: false,
        type: Sequelize.DECIMAL(10, 2),
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
      purchaseDate: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      expirationDate: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      supportDate: {
        // fecha de soporte
        type: Sequelize.DATE,
      },
      supportDescription: {
        // descripcion de soporte
        type: Sequelize.TEXT,
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
  },
};
