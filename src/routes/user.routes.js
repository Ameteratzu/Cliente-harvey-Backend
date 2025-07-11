const express = require("express");
const {
  validationRegisterUser,
  validationEditUser,
  validationChangeTelephone,
  validationParamId,
} = require("../middlewares/validateInputErrors.js");
const {
  register,
  getAllUsers,
  getUserById,
  editUser,
  getProfile,
  changeTelephone,
} = require("../controller/user.controller.js");
const setUserType = require("../middlewares/setUserType.js");
const { verifySession } = require("../middlewares/verifySession.js");
const checkRole = require("../middlewares/chekRole.js");

const userRoutes = express.Router();

// routes
userRoutes.post("/register", setUserType, validationRegisterUser, register);

userRoutes.get("/", verifySession, checkRole("admin"), getAllUsers);
userRoutes.get("/profile", verifySession, checkRole("user"), getProfile);

userRoutes.get(
  "/:id",
  verifySession,
  checkRole("admin"),
  validationParamId,
  getUserById
);
userRoutes.put(
  "/:id",
  verifySession,
  checkRole("user"),
  validationEditUser,
  editUser
);

module.exports = userRoutes;
