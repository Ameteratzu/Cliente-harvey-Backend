const express = require("express");
const {
  register,
  login,
  confirmAccount,
  getAllUserTypes,
  getAdminById,
  sendEmailCodeRecover,
  changePassword,
  editAdmin,
  deleteProfile,
  logout,
  blockAccount,
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
const checkRole = require("../middlewares/chekRole");

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

// obtener todos los usuarios, proveedores y admins
adminRouter.get("/", verifySession, checkRole("admin"), getAllUserTypes);
// TODO: bloquear automaticamente cuando no tenga movimientos ni compras

adminRouter.get("/:id", getAdminById);
adminRouter.put("/:id", validationEditUser, editAdmin);

// bloquear cuentas
adminRouter.put("/:id/block", verifySession, checkRole("admin"), blockAccount);
// eliminar perfiles
adminRouter.delete("/:id", verifySession, checkRole("admin"), deleteProfile);

module.exports = adminRouter;
