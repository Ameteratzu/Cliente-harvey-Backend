const express = require("express");
const {
  register,
  getAllUserTypes,
  getAdminById,
  changePassword,
  editAdmin,
  deleteProfile,
  blockAccount,
  getProfile,
} = require("../controller/admin.controller");
const {
  validationChangePassword,
  validationEditUser,
  validationRegisterAdmin,
  validationParamId,
} = require("../middlewares/validateInputErrors");
const setUserType = require("../middlewares/setUserType");
const { verifySession } = require("../middlewares/verifySession");
const checkRole = require("../middlewares/chekRole");

const adminRouter = express.Router();

adminRouter.post("/register", setUserType, validationRegisterAdmin, register);

adminRouter.patch(
  "/change-password/:code",
  setUserType,
  validationChangePassword,
  changePassword
);

adminRouter.get("/profile", verifySession, checkRole("admin"), getProfile);

// obtener todos los usuarios, proveedores y admins
adminRouter.get("/", verifySession, checkRole("admin"), getAllUserTypes);

adminRouter.get(
  "/:id",
  verifySession,
  checkRole("admin"),
  validationParamId,
  getAdminById
);

adminRouter.put(
  "/:id",
  verifySession,
  checkRole("admin"),
  validationEditUser,
  editAdmin
);

// bloquear cuentas
adminRouter.put(
  "/:id/block",
  verifySession,
  checkRole("admin"),
  validationParamId,
  blockAccount
);

// eliminar perfiles
adminRouter.delete(
  "/:id",
  verifySession,
  checkRole("admin"),
  validationParamId,
  deleteProfile
);

module.exports = adminRouter;
