"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("wallets", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      quantity: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      operationDate: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        field: "operation_date",
      },
      operationCode: {
        type: Sequelize.STRING,
        allowNull: false,
        field: "operation_code",
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        field: "user_id",
      },
      providerId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "providers",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        field: "provider_id",
      },
      productItemId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "product_items",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        field: "product_item_id",
      },
      adminId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "admins",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        field: "admin_id",
      },
      status: {
        type: Sequelize.ENUM("pending", "accepted", "rejected"),
        defaultValue: "pending",
      },
      operationType: {
        type: Sequelize.ENUM("recharge", "purchase", "refund"),
        allowNull: false,
        field: "operation_type",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        field: "created_at",
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        field: "updated_at",
      },
    });

    // Índices para optimizar consultas
    await queryInterface.addIndex("wallets", ["user_id"]);
    await queryInterface.addIndex("wallets", ["provider_id"]);
    await queryInterface.addIndex("wallets", ["operation_type"]);
    await queryInterface.addIndex("wallets", ["status"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("wallets");
  },
};
