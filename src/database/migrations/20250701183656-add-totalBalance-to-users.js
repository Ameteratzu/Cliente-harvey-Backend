"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("users");

    if (!table.total_balance) {
      await queryInterface.addColumn("users", "total_balance", {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("users", "total_balance");
  },
};
