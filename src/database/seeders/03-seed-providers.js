"use strict";
const bcrypt = require("bcrypt");
const SALT_ROUNDS = 10;
const now = new Date();

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const password = await bcrypt.hash("123456", SALT_ROUNDS);
    await queryInterface.bulkInsert(
      "providers",
      [
        {
          business_name: "Netflix Inc",
          username: "netflix_prov",
          email: "netflix@provider.com",
          password: password,
          telephone: "+15551234",
          role: "provider",
          status: "active",
          code_provider: "PROV-001",
          created_at: now,
          updated_at: now,
        },
        {
          business_name: "Steam Games",
          username: "steam_prov",
          email: "steam@provider.com",
          password: password,
          telephone: "+15555678",
          role: "provider",
          status: "active",
          code_provider: "PROV-002",
          created_at: now,
          updated_at: now,
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("providers", null, {});
  },
};
