"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop existing enum types if they exist
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_users_status";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_users_role";'
    );

    // Create enum types
    await queryInterface.sequelize.query(
      `CREATE TYPE "enum_users_status" AS ENUM ('active', 'blocked', 'pending_verification');`
    );
    await queryInterface.sequelize.query(
      `CREATE TYPE "enum_users_role" AS ENUM ('admin', 'provider', 'user');`
    );

    await queryInterface.createTable("users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      telephone: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      status: {
        type: Sequelize.ENUM("active", "blocked", "pending_verification"),
        allowNull: false,
        defaultValue: "pending_verification",
      },
      lockedUntil: {
        type: Sequelize.DATE,
        field: "locked_until",
      },
      role: {
        type: Sequelize.ENUM("admin", "provider", "user"),
        allowNull: false,
      },
      codeUser: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        field: "code_user",
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
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("users");

    // Drop enum types
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_users_status";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_users_role";'
    );
  },
};
