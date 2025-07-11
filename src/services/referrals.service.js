const db = require("./../database/models/index.js");

class ReferralService {
  async createReferral(referralData) {
    await db.Referrals.create(referralData);
  }

  async getReferrals({ userId, limit = 10, offset }) {
    return await db.Referrals.findAndCountAll({
      where: { userId },
      include: {
        model: db.Users,
        as: "referralUser",
        attributes: ["username", "email", "role"],
      },
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });
  }

  async deleteReferral(referralId) {
    await db.Referrals.destroy({ where: { id: referralId } });
  }
}

module.exports = ReferralService;
