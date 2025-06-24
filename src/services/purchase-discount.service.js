const db = require("./../database/models/index.js");
const AppError = require("../utils/appError.js");

class PurchaseDiscount {
  async create(data) {
    return await db.PurchaseDiscount.create(data);
  }

  async getAll() {
    return await db.PurchaseDiscount.findAll();
  }

  async getById(id) {
    const discount = await db.PurchaseDiscount.findByPk(id);
    if (!discount) {
      throw new AppError("Descuento no encontrado", 404);
    }
    return discount;
  }

  async editById(id, data) {
    const discount = await this.getById(id);
    await discount.update(data);
    return discount;
  }

  async deleteById(id) {
    const discount = await this.getById(id);
    return await discount.destroy();
  }
}

module.exports = PurchaseDiscount;
