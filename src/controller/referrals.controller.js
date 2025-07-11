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
  const { page = 1, limit = 10 } = req.query;

  const parsedLimit = parseInt(limit);
  const parsedPage = parseInt(page);
  const offset = (parsedPage - 1) * parsedLimit;

  const { rows: referrals, count } = await referralService.getReferrals({
    userId,
    limit: parsedLimit,
    offset,
  });

  res.status(200).json({
    message: "Referencias obtenidas exitosamente",
    results: referrals.length,
    total: count,
    totalPages: Math.ceil(count / parsedLimit),
    referrals,
  });
});

module.exports.deleteReferral = catchAsync(async (req, res) => {
  const { id } = req.params;

  await referralService.deleteReferral(id);

  res.status(200).json({ message: "Referencia eliminada con éxito" });
});
