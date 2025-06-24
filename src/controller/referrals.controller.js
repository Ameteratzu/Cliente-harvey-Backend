const catchAsync = require("../utils/catchAsync");
const ReferralService = require("../services/referrals.service.js");

const referralService = new ReferralService();

module.exports.createReferral = catchAsync(async (req, res) => {
  const { referralUserId } = req.body;
  const { id: userId } = req.user;

  const newReferral = await referralService.createReferral({
    userId,
    referralUserId,
  });

  res.status(201).json({
    message: "Referencia creada con éxito",
    data: newReferral,
  });
});

module.exports.getMyReferrals = catchAsync(async (req, res) => {
  const { id: userId } = req.user;

  const referrals = await referralService.getReferrals(userId);

  res.status(200).json({
    message: "Referencias obtenidas exitosamente",
    data: referrals,
    results: referrals.length,
  });
});

module.exports.getReferrals = catchAsync(async (req, res) => {
  const { id } = req.params;

  const referrals = await referralService.getReferrals(id);

  res.status(200).json({
    message: "Referencias obtenidas exitosamente",
    data: referrals,
    results: referrals.length,
  });
});

module.exports.deleteReferral = catchAsync(async (req, res) => {
  const { id } = req.params;

  await referralService.deleteReferral(id);

  res.status(200).json({ message: "Referencia eliminada con éxito" });
});
