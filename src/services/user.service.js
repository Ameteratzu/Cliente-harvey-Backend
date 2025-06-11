const db = require("./../database/models/index.js");

class UserService {
  async getAllUsers() {
    return await db.Users.findAll();
  }

  async getUserById(id) {
    return await db.Users.findOne({ where: { id } });
  }

  async createUser(userData) {
    return await db.Users.create(userData);
  }

  async findUserByEmail(email) {
    const user = await db.Users.findOne({ where: { email } });
    if (!user) {
      throw new Error("Usuario no encontrado");
    }
    return user;
  }
}

module.exports = UserService;
