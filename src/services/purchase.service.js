const db = require("./../database/models/index.js");
const { addDays } = require("date-fns");
const {} = require("date-fns-tz");

class PurchaseService {
  generateOperationCode(type) {
    const prefix = {
      recharge: "REC",
      purchase: "PUR",
      refund: "REF",
    };
    return `${prefix[type]}-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 4)
      .toUpperCase()}`;
  }

  async createPurchase(purchaseData) {
    const { duration, ...rest } = purchaseData;

    const timeZone = "America/Lima";
    const purchaseDate = zonedTimeToUtc(new Date(), timeZone);
    const expirationDate = addDays(purchaseDate, duration);

    const purchaseCode = this.generateOperationCode("purchase");

    return await db.Purchase.create({
      ...rest,
      purchaseCode,
      duration,
      expirationDate,
      purchaseDate,
    });
  }
}

module.exports = PurchaseService;
