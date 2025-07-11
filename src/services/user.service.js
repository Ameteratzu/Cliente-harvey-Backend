const AppError = require("../utils/appError.js");
const db = require("./../database/models/index.js");

class UserService {
  async getAllUsers({ limit = 10, offset = 0 }) {
    return await db.Users.findAndCountAll(
      { limit, offset },
      { attributes: ["username", "email", "role"] }
    );
  }

  async getUserById(id) {
    const user = await db.Users.findOne({
      where: { id },
      attributes: ["username", "email", "telephone", "status", "role"],
    });

    if (!user) {
      throw new AppError("Usuario no encontrado", 404);
    }

    return user;
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

  async editUser(userData) {
    const { id, ...rest } = userData;
    await this.getUserById(id);

    return await db.Users.update(rest, { where: { id } });
  }
}

module.exports = UserService;
