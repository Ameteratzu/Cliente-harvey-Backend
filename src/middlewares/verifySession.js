const jwt = require("jsonwebtoken");
const db = require("./../database/models/index.js");
const { isAccountBloqued } = require("../utils/auth.js");

module.exports.verifySession = async (req, res, next) => {
  try {
    const token = req.cookies["auth_token"]; // Bearer <token>

    if (!token) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const session = await db.UserSession.findOne({
      where: { token, userId: payload.id, isValid: true },
    });
    if (!session) {
      return res.status(401).json({ message: "No autorizado" });
    }

    let user;
    switch (payload.role) {
      case "user":
        user = await db.Users.findOne({ where: { id: payload.id } });
        break;
      case "provider":
        user = await db.Providers.findOne({ where: { id: payload.id } });
        break;
      case "admin":
        user = await db.Admins.findOne({ where: { id: payload.id } });
        break;
      default:
        return res.status(403).json({ message: "Rol inválido" });
    }

    if (!user) {
      return res.status(401).json({ message: "No autorizado" });
    }

    if ("lockedUntil" in user && isAccountBloqued(user)) {
      return res.status(403).json({
        message: `Tu cuenta está bloqueada hasta ${new Date(
          user.lockedUntil
        ).toLocaleString("es-PE")}`,
      });
    }

    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};
