const db = require("./../database/models/index.js");

class ProviderDisCountService {
  async createProviderDiscount(adminId, data) {
    return await db.ProviderDiscount.create({ adminId, ...data });
  }

  async editProviderDiscount(data) {
    const { id, ...rest } = data;
    return await db.ProviderDiscount.update(rest, { where: { id } });
  }

  async deleteProviderDiscount(id) {
    return await db.ProviderDiscount.destroy({ where: { id } });
  }
}

module.exports = ProviderDisCountService;
