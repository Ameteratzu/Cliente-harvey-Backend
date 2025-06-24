'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Drop the incorrectly named "Referrals" table if it exists
    // This will also drop any foreign key constraints
    try {
      await queryInterface.dropTable('Referrals');
      console.log('Dropped existing Referrals table');
    } catch (error) {
      console.log('Referrals table does not exist or already dropped');
    }
  },

  async down (queryInterface, Sequelize) {
    // Nothing to revert - this is a cleanup migration
  }
};
