const express = require("express");
const checkRole = require("../middlewares/chekRole");
const { verifySession } = require("../middlewares/verifySession");
const verifyUserTypeQuery = require("../middlewares/verifyUserTypeQuery");
const {
  validationLogin,
  validationConfirmAccount,
  validationSendEmailCodeRecover,
  validationChangePassword,
  validationChangeTelephone,
} = require("../middlewares/validateInputErrors");
const {
  login,
  logout,
  confirmAccount,
  sendEmailCodeRecover,
  changePassword,
  sendEmailCodeChangeTelephone,
  changeTelephone,
  authMe,
} = require("../controller/auth.controller");

const authRouter = express.Router();

authRouter.get("/me", verifySession, checkRole("user", "provider", "admin"), authMe);

authRouter.post("/login", verifyUserTypeQuery, validationLogin, login);

authRouter.post(
  "/logout",
  verifySession,
  checkRole("user", "provider", "admin"),
  logout
);

authRouter.post(
  "/send-email-code-recover",
  verifyUserTypeQuery,
  validationSendEmailCodeRecover,
  sendEmailCodeRecover
);

authRouter.patch(
  "/change-password/:code",
  verifyUserTypeQuery,
  validationChangePassword,
  changePassword
);

authRouter.patch(
  "/confirm-account/:code",
  verifyUserTypeQuery,
  validationConfirmAccount,
  confirmAccount
);

authRouter.post(
  "/send-email-code-change-telephone",
  verifySession,
  checkRole("user", "provider", "admin"),
  validationSendEmailCodeRecover,
  sendEmailCodeChangeTelephone
);

authRouter.patch(
  "/change-telephone/:code",
  verifyUserTypeQuery,
  validationChangeTelephone,
  changeTelephone
);

module.exports = authRouter;
