const express = require("express");

const { verifySession } = require("../middlewares/verifySession.js");
const checkRole = require("../middlewares/chekRole.js");
const {
  createReferral,
  getMyReferrals,
  getReferrals,
  deleteReferral,
} = require("../controller/referrals.controller.js");

const referralRouter = express.Router();

referralRouter.post("/", verifySession, checkRole("user"), createReferral);
referralRouter.get("/", verifySession, checkRole("user"), getMyReferrals);
referralRouter.get("/:id", verifySession, checkRole("admin"), getReferrals);
referralRouter.delete(
  "/:id",
  verifySession,
  checkRole("admin", "user"),
  deleteReferral
);

module.exports = referralRouter;
