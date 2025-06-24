"use strict";
const bcrypt = require("bcrypt");
const SALT_ROUNDS = 10;
const now = new Date();

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const password = await bcrypt.hash("123456", SALT_ROUNDS);
    await queryInterface.bulkInsert(
      "users",
      [
        {
          username: "juan_user",
          email: "juan@example.com",
          password: password,
          telephone: "+1234567890",
          status: "active",
          role: "user",
          code_user: "USER-001",
          created_at: now,
          updated_at: now,
        },
        {
          username: "maria_user",
          email: "maria@example.com",
          password: password,
          telephone: "+0987654321",
          status: "active",
          role: "user",
          code_user: "USER-002",
          created_at: now,
          updated_at: now,
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", null, {});
  },
};
