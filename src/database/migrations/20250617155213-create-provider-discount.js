"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("provider_discounts", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.ENUM("publication_price", "withdrawal"),
        allowNull: false,
      },
      // PORCENTAJE DE DESCUENTO POR RETIRO
      percentage: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      // CANTIDAD DE DESCUENTO POR PUBLICACION
      quantity: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      providerId: {
        type: Sequelize.INTEGER,
        references: {
          model: "providers",
          key: "id",
        },
        field: "provider_id",
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
    await queryInterface.dropTable("provider_discounts");
  },
};
