const express = require("express");
const {
  validationRegisterUser,
  validationLogin,
  validationConfirmAccount,
  validationChangePassword,
  validationSendEmailCodeRecover,
  validationEditUser,
} = require("../middlewares/validateInputErrors.js");
const {
  register,
  login,
  confirmAccount,
  changePassword,
  getAllUsers,
  getUserById,
  editUser,
  sendEmailCodeRecover,
  getProfile,
  logout,
} = require("../controller/user.controller.js");
const setUserType = require("../middlewares/setUserType.js");
const { verifySession } = require("../middlewares/verifySession.js");
const checkRole = require("../middlewares/chekRole.js");

const userRoutes = express.Router();

// routes
userRoutes.post("/register", setUserType, validationRegisterUser, register);
userRoutes.post("/login", setUserType, validationLogin, login);
userRoutes.post("/logout", setUserType, verifySession, logout);
userRoutes.patch(
  "/confirm-account/:code",
  setUserType,
  validationConfirmAccount,
  confirmAccount
);
userRoutes.post(
  "/send-email-code-recover",
  setUserType,
  validationSendEmailCodeRecover,
  sendEmailCodeRecover
);
// TODO: cambiar de numero de telefono
userRoutes.patch(
  "/change-password/:code",
  setUserType,
  validationChangePassword,
  changePassword
);

userRoutes.get("/", getAllUsers);
userRoutes.get("/profile", verifySession, checkRole("user"), getProfile);

userRoutes.get("/:id", getUserById);
userRoutes.put(
  "/:id",
  verifySession,
  checkRole("user"),
  validationEditUser,
  editUser
);

module.exports = userRoutes;
