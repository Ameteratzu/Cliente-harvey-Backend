const catchAsync = require("../utils/catchAsync");
const ProviderDiscountService = require("../services/provider-discount.service");

const providerDiscountService = new ProviderDiscountService();

module.exports.createProviderDiscount = catchAsync(async (req, res) => {
  const { id: adminId } = req.user;
  const { name, percentage, quantity } = req.body;

  await providerDiscountService.createProviderDiscount(adminId, {
    name,
    percentage,
    quantity,
  });
  return res.status(201).json({ message: "Descuento creado con éxito" });
});

module.exports.editProviderDiscount = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { body } = req;

  await providerDiscountService.editProviderDiscount({ body, id });
  return res.status(200).json({ message: "Descuento actualizado con éxito" });
});

module.exports.deleteProviderDiscount = catchAsync(async (req, res) => {
  const { id } = req.params;

  await providerDiscountService.deleteProviderDiscount(id);
  return res.status(200).json({ message: "Descuento eliminado con éxito" });
});
