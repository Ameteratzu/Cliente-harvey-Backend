const express = require("express");
const {
  getAllCodeRegisters,
  createCodeRegister,
  deleteCodeRegister,
} = require("../controller/code-register.controller");
const codeRegisterRouter = express.Router();

codeRegisterRouter.route("/create").post(createCodeRegister);
codeRegisterRouter.route("/").get(getAllCodeRegisters);
codeRegisterRouter.route("/delete/:id").delete(deleteCodeRegister);

module.exports = codeRegisterRouter;
