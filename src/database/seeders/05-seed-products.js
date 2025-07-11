"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Obtener IDs de proveedores y categorías
    const [providers] = await queryInterface.sequelize.query(
      `SELECT id, business_name FROM providers WHERE business_name IN ('Netflix Inc', 'Steam Games')`
    );

    const [categories] = await queryInterface.sequelize.query(
      `SELECT id, category FROM categories WHERE category IN ('Streaming', 'Gaming')`
    );

    const streamingCat = categories.find((c) => c.category === "Streaming");
    const gamingCat = categories.find((c) => c.category === "Gaming");

    const netflixProv = providers.find(
      (p) => p.business_name === "Netflix Inc"
    );
    const steamProv = providers.find((p) => p.business_name === "Steam Games");

    // Verificar que todos los registros necesarios existen
    if (!streamingCat) {
      throw new Error("Streaming category not found");
    }
    if (!gamingCat) {
      throw new Error("Gaming category not found");
    }
    if (!netflixProv) {
      throw new Error("Netflix provider not found");
    }
    if (!steamProv) {
      throw new Error("Steam provider not found");
    }

    return queryInterface.bulkInsert(
      "products",
      [
        // Producto Netflix
        {
          product_code: "NETFLIX-PREM",
          product_name: "Netflix Premium",
          terms_of_use: "4 pantallas simultáneas, Ultra HD",
          duration: 30,
          is_on_sale: false,
          regular_price: 15.99,
          sale_price: 0,
          renewal_price: 15.99,
          provider_id: netflixProv.id,
          category_id: streamingCat.id,
          type_of_delivery: "selfDelivery",
          created_at: new Date(),
          updated_at: new Date(),
        },
        // Producto Steam
        {
          product_code: "AMAZON-PRIME",
          product_name: "Amazon Prime",
          terms_of_use: "Código digital para Amazon Prime",
          duration: 30,
          is_on_sale: true,
          regular_price: 50.0,
          sale_price: 45.0,
          renewal_price: 50.0,
          provider_id: steamProv.id,
          category_id: gamingCat.id,
          type_of_delivery: "selfDelivery",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("products", null, {});
  },
};
