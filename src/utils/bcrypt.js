const bcrypt = require("bcrypt");

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
