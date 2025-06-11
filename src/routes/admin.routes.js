const express = require("express");
const {
  register,
  login,
  confirmAccount,
  getAllAdmins,
  getAdminById,
  sendEmailCodeRecover,
  changePassword,
  editAdmin,
  deleteAdmin,
  getProfile,
  logout,
} = require("../controller/admin.controller");
const {
  validationSendEmailCodeRecover,
  validationChangePassword,
  validationEditUser,
  validationConfirmAccount,
  validationLogin,
  validationRegisterAdmin,
} = require("../middlewares/validateInputErrors");
const setUserType = require("../middlewares/setUserType");
const { verifySession } = require("../middlewares/verifySession");

const adminRouter = express.Router();

adminRouter.post("/register", setUserType, validationRegisterAdmin, register);
adminRouter.post("/login", setUserType, validationLogin, login);
adminRouter.post("/logout", setUserType, verifySession, logout);
adminRouter.post(
  "/confirm-account/:code",
  setUserType,
  validationConfirmAccount,
  confirmAccount
);
adminRouter.post(
  "/send-email-code-recover",
  setUserType,
  validationSendEmailCodeRecover,
  sendEmailCodeRecover
);
adminRouter.patch(
  "/change-password/:code",
  setUserType,
  validationChangePassword,
  changePassword
);

adminRouter.get("/", getAllAdmins);
adminRouter.get("/profile", setUserType, verifySession, getProfile);

adminRouter.get("/:id", getAdminById);
adminRouter.put("/:id", validationEditUser, editAdmin);

adminRouter.delete("/:id", deleteAdmin);

module.exports = adminRouter;
