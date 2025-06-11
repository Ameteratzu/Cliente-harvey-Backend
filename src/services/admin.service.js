const db = require("../database/models/index.js");

class AdminService {
  async getAllAdmins() {
    return await db.Admins.findAll();
  }

  async getAdminById(id) {
    return await db.Admins.findOne({ where: { id } });
  }

  async deleteAdminById(id) {
    return await db.Admins.destroy({ where: { id } });
  }
}

module.exports = AdminService;
