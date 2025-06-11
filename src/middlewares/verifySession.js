const jwt = require("jsonwebtoken");
const db = require("./../database/models/index.js");

module.exports.verifySession = async (req, res, next) => {
  try {
    const token = req.cookies["auth_token"]; // Bearer <token>
    console.log({ token });

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

    req.user = payload;
    req.token = token;

    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};
