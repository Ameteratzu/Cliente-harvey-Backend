const bcrypt = require("bcrypt");
const cryptojs = require("crypto-js");
const AppError = require("../utils/appError.js");
require("dotenv").config();

exports.comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

exports.hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new Error(error);
  }
};

module.exports.encryptPassword = (value) => {
  try {
    if (!value || typeof value !== "string") {
      throw new AppError(
        "El valor a encriptar debe ser una cadena de texto",
        400
      );
    }

    const encryptedValue = cryptojs.AES.encrypt(
      value,
      process.env.SECRET_KEY_CRYPTO
    ).toString();

    return encryptedValue;
  } catch (error) {
    console.error("Error al encriptar la contraseña:", error);
    throw error;
  }
};
