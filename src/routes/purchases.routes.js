const express = require("express");
const { verifySession } = require("../middlewares/verifySession");
const checkRole = require("../middlewares/chekRole");
const { createPurchase } = require("../controller/purchases.controller");

const purchasesRouter = express.Router();
// TODO: faltan validaciones

purchasesRouter.post("/", verifySession, checkRole("user"), createPurchase);

module.exports = purchasesRouter;
