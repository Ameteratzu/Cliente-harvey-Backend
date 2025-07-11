const db = require("./../database/models/index.js");
const AppError = require("../utils/appError.js");

class ProviderDisCountService {
  async createProviderDiscount(adminId, data) {
    return await db.ProviderDiscount.create({ adminId, ...data });
  }

  async getProviderDiscountById(id) {
    const discount = await db.ProviderDiscount.findByPk(id);
    if (!discount) {
      throw new AppError("Descuento no encontrado", 404);
    }
    return discount;
  }

  async editProviderDiscount(data) {
    const { id, ...rest } = data;
    const discount = await this.getProviderDiscountById(id);

    return discount.update(rest);
  }

  async deleteProviderDiscount(id) {
    const discount = await this.getProviderDiscountById(id);
    return await discount.destroy();
  }
}

module.exports = ProviderDisCountService;
