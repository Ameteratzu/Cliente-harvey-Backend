const express = require("express");

const { verifySession } = require("../middlewares/verifySession.js");
const checkRole = require("../middlewares/chekRole.js");
const {
  createReferral,
  getMyReferrals,
  getReferrals,
  deleteReferral,
} = require("../controller/referrals.controller.js");
const {
  validationParamId,
  validationCreateReferral,
} = require("../middlewares/validateInputErrors.js");

const referralRouter = express.Router();

referralRouter.post(
  "/",
  verifySession,
  checkRole("user"),
  validationCreateReferral,
  createReferral
);

referralRouter.get("/my", verifySession, checkRole("user"), getMyReferrals);

referralRouter.delete(
  "/:id",
  verifySession,
  checkRole("admin", "user"),
  validationParamId,
  deleteReferral
);

module.exports = referralRouter;
