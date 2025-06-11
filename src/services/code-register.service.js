const db = require("./../database/models/index.js");

class RegistrationCodesService {
  async getAllCodeRegisters() {
    return await db.RegistrationCodes.findAll();
  }

  async createCodeRegister(data) {
    return await db.RegistrationCodes.create(data);
  }

  async deleteCodeRegister(id) {
    return await db.RegistrationCodes.destroy({ where: { id } });
  }
}
module.exports = RegistrationCodesService;
