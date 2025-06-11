const jwt = require("jsonwebtoken");
const crypto = require("node:crypto");

exports.tokenSing = async (user) => {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "8h",
  });
};

exports.verifyToken = async (token) => {
  try {
    /* return jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(401).json({ message: "Unauthorized" });
      req.user = decoded;
      next();
    });*/
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return null;
  }
};

exports.decodeToken = async (token) => {
  return jwt.decode(token, null);
};

// generar tokens random
exports.generateUserCode = async (longitud = 8) => {
  const caracteres =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let resultado = "";
  for (let i = 0; i < longitud; i++) {
    const index = crypto.randomInt(0, caracteres.length);
    resultado += caracteres[index];
  }
  return resultado;
};
