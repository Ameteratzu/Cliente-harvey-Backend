const express = require("express");
const checkRole = require("../middlewares/chekRole");
const { verifySession } = require("../middlewares/verifySession");
const {
  getAllCodeRegisters,
  createCodeRegister,
  deleteCodeRegister,
} = require("../controller/code-register.controller");
const { validationParamId } = require("../middlewares/validateInputErrors");
const codeRegisterRouter = express.Router();

codeRegisterRouter.post(
  "/",
  verifySession,
  checkRole("admin"),
  createCodeRegister
);

codeRegisterRouter.get(
  "/",
  verifySession,
  checkRole("admin"),
  getAllCodeRegisters
);

codeRegisterRouter.delete(
  "/:id",
  verifySession,
  checkRole("admin"),
  validationParamId,
  deleteCodeRegister
);

module.exports = codeRegisterRouter;
