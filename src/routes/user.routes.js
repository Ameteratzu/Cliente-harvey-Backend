const express = require("express");
const {
  validationRegisterUser,
  validationLogin,
  validationConfirmAccount,
  validationChangePassword,
  validationSendEmailCodeRecover,
  validationEditUser,
} = require("../middlewares/validateInputErrors");
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
  deleteUser,
  logout,
} = require("../controller/user.controller");
const setUserType = require("../middlewares/setUserType");
const { verifySession } = require("../middlewares/verifySession");

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
userRoutes.patch(
  "/change-password/:code",
  setUserType,
  validationChangePassword,
  changePassword
);

userRoutes.get("/", getAllUsers);
userRoutes.get("/profile", verifySession, getProfile);

userRoutes.get("/:id", getUserById);
userRoutes.delete("/:id", deleteUser);
userRoutes.put("/:id", verifySession, validationEditUser, editUser);

module.exports = userRoutes;
