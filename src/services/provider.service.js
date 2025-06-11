const db = require("./../database/models/index.js");

class ProviderService {
  async getAllProviders() {
    return await db.Providers.findAll();
  }

  async getProviderById(id) {
    return await db.Providers.findOne({ where: { id } });
  }

  async createProvider(provider) {
    return await db.Providers.create(provider);
  }

  async findUserByEmail(email) {
    const provider = await db.Providers.findOne({ where: { email } });
    if (!provider) {
      throw new Error("Usuario no encontrado");
    }
    return provider;
  }

  async deleteProviderById(id) {
    return await db.Providers.destroy({ where: { id } });
  }
}

module.exports = ProviderService;
