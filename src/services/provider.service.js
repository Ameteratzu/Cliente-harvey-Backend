const db = require("./../database/models/index.js");
const AppError = require("../utils/appError.js");

class ProviderService {
  async getAllProviders() {
    return await db.Providers.findAll();
  }

  async getProviderById(id) {
    const provider = await db.Providers.findOne({ where: { id } });
    if (!provider) {
      throw new AppError("Proveedor no encontrado", 404);
    }
    return provider;
  }

  async createProvider(provider) {
    return await db.Providers.create(provider);
  }

  async findUserByEmail(email) {
    const provider = await db.Providers.findOne({ where: { email } });
    if (!provider) {
      throw new AppError("Proveedor no encontrado", 404);
    }
    return provider;
  }

  async deleteProviderById(id) {
    const provider = await this.getProviderById(id);
    return await provider.destroy();
  }
}

module.exports = ProviderService;
