"use strict";
const bcrypt = require("bcrypt");
const SALT_ROUNDS = 10;
const now = new Date();

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const password = await bcrypt.hash("123456", SALT_ROUNDS);
    await queryInterface.bulkInsert(
      "admins",
      [
        {
          username: "admin",
          email: "admin@example.com",
          password,
          telephone: "+1234567890",
          status: "active",
          role: "admin",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("admins", null, {});
  },
};
