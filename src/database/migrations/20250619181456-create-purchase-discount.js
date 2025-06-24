"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("purchase_discounts", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      percentageDiscount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        field: "percentage_discount",
      },
      quantityProducts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: "quantity_products",
      },
      nameDiscount: {
        type: Sequelize.STRING,
        allowNull: false,
        field: "name_discount",
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
    await queryInterface.dropTable("purchase_discounts");
  },
};
