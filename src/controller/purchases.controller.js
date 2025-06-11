const catchAsync = require("../utils/catchAsync.js");
const PurchaseService = require("../services/purchase.service.js");

const purchaseService = new PurchaseService();

module.exports.createPurchase = catchAsync(async (req, res) => {
  const { productItemid, providerId, duration, amount, renewalPrice } =
    req.body;
  const { id: userId } = req.user;

  try {
    const purchase = await purchaseService.createPurchase({
      productItemid,
      providerId,
      duration,
      amount,
      renewalPrice,
      userId,
    });

    return res.status(201).json({
      message: "Compra realizada exitosamente",
      data: purchase,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
});
