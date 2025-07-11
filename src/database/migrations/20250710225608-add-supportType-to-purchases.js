"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("purchases");

    if (!table.support_type) {
      await queryInterface.addColumn("purchases", "support_type", {
        type: Sequelize.ENUM("refund", "renewal", "problem"),
        allowNull: false,
        defaultValue: "",
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("purchases", "support_type");
  },
};
