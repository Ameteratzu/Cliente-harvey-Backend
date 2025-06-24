'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add missing values to the operation_type ENUM
    await queryInterface.sequelize.query(
      "ALTER TYPE enum_wallets_operation_type ADD VALUE IF NOT EXISTS 'earning';"
    );
    await queryInterface.sequelize.query(
      "ALTER TYPE enum_wallets_operation_type ADD VALUE IF NOT EXISTS 'deduct';"
    );
  },

  async down (queryInterface, Sequelize) {
    // Note: PostgreSQL doesn't support removing values from ENUMs directly
    // This would require recreating the ENUM type, which is complex
    // For now, we'll leave this empty as it's rarely needed in development
  }
};
