const catchAsync = require("../utils/catchAsync");
const PurchaseDiscountService = require("../services/purchase-discount.service");

const purchaseDiscountService = new PurchaseDiscountService();

module.exports.createPurchaseDiscount = catchAsync(async (req, res) => {
  const { percentageDiscount, quantityProducts, nameDiscount } = req.body;

  await purchaseDiscountService.create({
    percentageDiscount,
    quantityProducts,
    nameDiscount,
  });

  return res.status(201).json({ message: "Descuento creado con éxito" });
});

module.exports.getAllPurchaseDiscounts = catchAsync(async (req, res) => {
  const discounts = await purchaseDiscountService.getAll();

  return res.status(200).json({ discounts });
});

module.exports.getPurchaseDiscountById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const discount = await purchaseDiscountService.getById(id);

  return res.status(200).json({ discount });
});

module.exports.editPurchaseDiscountById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { percentageDiscount, quantityProducts, nameDiscount } = req.body;

  const discount = await purchaseDiscountService.editById(id, {
    percentageDiscount,
    quantityProducts,
    nameDiscount,
  });

  return res.status(200).json({ discount });
});

module.exports.deletePurchaseDiscountById = catchAsync(async (req, res) => {
  const { id } = req.params;

  await purchaseDiscountService.deleteById(id);

  return res.status(200).json({ message: "Descuento eliminado con éxito" });
});
