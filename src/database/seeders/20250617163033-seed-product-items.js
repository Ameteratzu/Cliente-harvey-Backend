"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Obtener IDs de productos y proveedores
    const [products] = await queryInterface.sequelize.query(
      `SELECT id, provider_id, product_code FROM products WHERE product_code IN ('NETFLIX-PREM', 'STEAM-50')`
    );

    const netflixProduct = products.find(
      (p) => p.product_code === "NETFLIX-PREM"
    );
    const steamProduct = products.find((p) => p.product_code === "STEAM-50");

    // Verificar que los productos existen
    if (!netflixProduct) {
      throw new Error('Netflix product not found');
    }
    if (!steamProduct) {
      throw new Error('Steam product not found');
    }

    const now = new Date();

    return queryInterface.bulkInsert(
      "product_items",
      [
        // Items para Netflix
        {
          product_code_item: "NFX-ACC-001",
          product_item_name: "Cuenta Premium Netflix",
          username: "netflix_user_1",
          password: "P@ssw0rdNetflix",
          status: "published",
          provider_id: netflixProduct.provider_id,
          product_id: netflixProduct.id,
          created_at: now,
          updated_at: now,
        },
        {
          product_code_item: "NFX-ACC-002",
          product_item_name: "Cuenta Premium Netflix",
          username: "netflix_user_2",
          password: "P@ssw0rdNetflix2",
          status: "published",
          provider_id: netflixProduct.provider_id,
          product_id: netflixProduct.id,
          created_at: now,
          updated_at: now,
        },
        // Items para Steam
        {
          product_code_item: "STM-CODE-01",
          product_item_name: "Código $50 Steam",
          username: "STEAMCODE-XXXX-YYYY-ZZZZ",
          password: "",
          status: "published",
          provider_id: steamProduct.provider_id,
          product_id: steamProduct.id,
          created_at: now,
          updated_at: now,
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("product_items", null, {});
  },
};
