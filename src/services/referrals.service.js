const db = require("./../database/models/index.js");

class ReferralService {
  async createReferral(referralData) {
    await db.Referrals.create(referralData);
  }

  async getReferrals(userId) {
    return await db.Referrals.findAll({
      where: { userId },
      include: {
        model: db.Users,
        as: "referralUser",
        attributes: ["username", "email", "role"],
      },
    });
  }

  async deleteReferral(referralId) {
    await db.Referrals.destroy({ where: { id: referralId } });
  }
}

module.exports = ReferralService;
