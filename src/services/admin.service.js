const db = require("../database/models/index.js");
const { toZonedTime } = require("date-fns-tz");
const { addDays } = require("date-fns");
const AppError = require("../utils/appError.js");

class AdminService {
  async getAllAdmins() {
    const admins = await db.Admins.findAll();
    const users = await db.Users.findAll();
    const providers = await db.Providers.findAll();

    return {
      data: {
        admins,
        users,
        providers,
      },
      results: admins.length + users.length + providers.length,
    };
  }

  async getAdminById(id) {
    const admin = await db.Admins.findOne({
      where: { id },
      attributes: ["id", "username", "email", "role", "telephone", "createdAt"],
    });
    if (!admin) {
      throw new AppError("Admin no encontrado", 404);
    }
    return admin;
  }

  async blockAccountById({ id, role }) {
    const timeZone = "America/Lima";
    const now = toZonedTime(new Date(), timeZone);
    const lockedUntil = addDays(now, 30);

    if (role === "provider")
      return await db.Providers.update(
        { status: "blocked", lockedUntil },
        { where: { id } }
      );

    return await db.Users.update(
      { status: "blocked", lockedUntil },
      { where: { id } }
    );
  }

  async unblockAccountById({ id, role }) {
    if (role === "provider")
      return await db.Providers.update(
        { status: "active", lockedUntil: null },
        { where: { id } }
      );

    return await db.Users.update(
      { status: "active", lockedUntil: null },
      { where: { id } }
    );
  }

  async editAdmin({ id, ...rest }) {
    await this.getAdminById(id);
    return await db.Admins.update(rest, { where: { id } });
  }

  async deleteProfileById({ id, role }) {
    if (role === "provider")
      return await db.Providers.destroy({ where: { id } });

    return await db.Admins.destroy({ where: { id } });
  }
}

module.exports = AdminService;
