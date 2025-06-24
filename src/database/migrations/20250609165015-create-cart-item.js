"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("cart_items", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      productItemId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "product_items",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: "Precio al momento de agregar al carrito",
      },
      typeOfDelivery: {
        type: Sequelize.ENUM("selfDelivery", "uponRequest"),
        allowNull: false,
        field: "type_of_delivery",
      },
      reservedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        comment: "Momento en que se reservó el item",
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: "Momento en que expira la reserva (ej: 30 min)",
      },
      status: {
        type: Sequelize.ENUM("reserved", "purchased", "expired"),
        defaultValue: "reserved",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Índices para optimizar consultas
    await queryInterface.addIndex("cart_items", ["userId"]);
    await queryInterface.addIndex("cart_items", ["productItemId"]);
    await queryInterface.addIndex("cart_items", ["status"]);
    await queryInterface.addIndex("cart_items", ["expiresAt"]);

    // Constraint único: un usuario no puede tener el mismo producto dos veces en su carrito
    await queryInterface.addConstraint("cart_items", {
      fields: ["userId", "productItemId"],
      type: "unique",
      name: "unique_user_product_cart",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("cart_items");
  },
};
