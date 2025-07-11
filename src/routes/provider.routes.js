const express = require("express");
const {
  register,
  getAllProviders,
  getProviderById,
  deleteUser,
  getProfile,
  changeTelephone,
  editProvider,
} = require("../controller/provider.controller");
const {
  validationRegisterProvider,
  validationEditUser,
  validationChangeTelephone,
  validationParamId,
} = require("../middlewares/validateInputErrors");
const setUserType = require("../middlewares/setUserType");
const { verifySession } = require("../middlewares/verifySession");
const checkRole = require("../middlewares/chekRole");

const providerRouter = express.Router();

providerRouter.post(
  "/register",
  setUserType,
  validationRegisterProvider,
  register
);
providerRouter.get("/profile", setUserType, verifySession, getProfile);

providerRouter.get("/", verifySession, checkRole("admin"), getAllProviders);
providerRouter.get(
  "/:id",
  verifySession,
  checkRole("admin"),
  validationParamId,
  getProviderById
);

providerRouter.put(
  "/:id",
  verifySession,
  checkRole("admin"),
  validationEditUser,
  editProvider
);

providerRouter.delete(
  "/:id",
  verifySession,
  checkRole("admin"),
  validationParamId,
  deleteUser
);

module.exports = providerRouter;
