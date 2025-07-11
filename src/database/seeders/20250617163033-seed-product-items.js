"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Obtener IDs de productos y proveedores
    const [products] = await queryInterface.sequelize.query(
      `SELECT id, provider_id, product_code FROM products WHERE product_code IN ('NETFLIX-PREM', 'AMAZON-PRIME')`
    );

    const netflixProduct = products.find(
      (p) => p.product_code === "NETFLIX-PREM"
    );
    const amazonPrimeProduct = products.find(
      (p) => p.product_code === "AMAZON-PRIME"
    );

    // Verificar que los productos existen
    if (!netflixProduct) {
      throw new Error("Netflix product not found");
    }
    if (!amazonPrimeProduct) {
      throw new Error("Amazon Prime product not found");
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
        {
          product_code_item: "NFX-ACC-003",
          product_item_name: "Cuenta Premium Netflix",
          username: "netflix_user_3",
          password: "P@ssw0rdNetflix3",
          status: "published",
          provider_id: netflixProduct.provider_id,
          product_id: netflixProduct.id,
          created_at: now,
          updated_at: now,
        },
        {
          product_code_item: "NFX-ACC-004",
          product_item_name: "Cuenta Premium Netflix",
          username: "netflix_user_4",
          password: "P@ssw0rdNetflix4",
          status: "published",
          provider_id: netflixProduct.provider_id,
          product_id: netflixProduct.id,
          created_at: now,
          updated_at: now,
        },
        // Items para Amazon Prime
        {
          product_code_item: "AMZ-PRM-01",
          product_item_name: "Código $50 Steam",
          username: "AMAZON-CODE-XXXX-YYYY-ZZZZ",
          password: "P@ssw0rdAmazon",
          status: "published",
          provider_id: amazonPrimeProduct.provider_id,
          product_id: amazonPrimeProduct.id,
          created_at: now,
          updated_at: now,
        },
        {
          product_code_item: "AMZ-PRM-02",
          product_item_name: "Código $50 Steam",
          username: "AMAZON-CODE-XXXX-YYYY-ZZZZ",
          password: "P@ssw0rdAmazon",
          status: "published",
          provider_id: amazonPrimeProduct.provider_id,
          product_id: amazonPrimeProduct.id,
          created_at: now,
          updated_at: now,
        },
        {
          product_code_item: "AMZ-PRM-03",
          product_item_name: "Código $50 Steam",
          username: "AMAZON-CODE-XXXX-YYYY-ZZZZ",
          password: "P@ssw0rdAmazon",
          status: "published",
          provider_id: amazonPrimeProduct.provider_id,
          product_id: amazonPrimeProduct.id,
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
