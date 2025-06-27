const express = require("express");
const {
  register,
  login,
  confirmAccount,
  getAllProviders,
  getProviderById,
  sendEmailCodeRecover,
  changePassword,
  editUser,
  deleteUser,
  logout,
  getProfile,
  sendEmailCodeChangeTelephone,
  changeTelephone,
} = require("../controller/provider.controller");
const {
  validationRegisterProvider,
  validationSendEmailCodeRecover,
  validationChangePassword,
  validationEditUser,
  validationConfirmAccount,
  validationLogin,
} = require("../middlewares/validateInputErrors");
const setUserType = require("../middlewares/setUserType");
const { verifySession } = require("../middlewares/verifySession");

const providerRouter = express.Router();

providerRouter.post(
  "/register",
  setUserType,
  validationRegisterProvider,
  register
);
providerRouter.post("/login", setUserType, validationLogin, login);
providerRouter.post("/logout", setUserType, verifySession, logout);
providerRouter.post(
  "/confirm-account/:code",
  setUserType,
  validationConfirmAccount,
  confirmAccount
);
providerRouter.post(
  "/send-email-recover",
  setUserType,
  validationSendEmailCodeRecover,
  sendEmailCodeRecover
);
providerRouter.patch(
  "/change-password/:code",
  setUserType,
  validationChangePassword,
  changePassword
);

providerRouter.post(
  "/send-email-code-change-telephone",
  verifySession,
  checkRole("provider"),
  sendEmailCodeChangeTelephone
);

providerRouter.patch(
  "/change-telephone",
  verifySession,
  checkRole("provider"),
  changeTelephone
);

providerRouter.get("/profile", setUserType, verifySession, getProfile);

providerRouter.get("/", getAllProviders);
providerRouter.get("/:id", getProviderById);
providerRouter.put("/:id", validationEditUser, editUser);

providerRouter.delete("/:id", deleteUser);

module.exports = providerRouter;
