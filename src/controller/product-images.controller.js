const catchAsync = require("../utils/catchAsync.js");
const ProductImagesService = require("../services/product-images.service.js");
const productImagesService = new ProductImagesService();

module.exports.createProductImage = catchAsync(async (req, res) => {
  const { body } = req;

  const result = await productImagesService.createProductImage(body);
  return res.status(201).json(result);
});

module.exports.deleteProductImage = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await productImagesService.deleteProductImage(id);
  return res.status(200).json(result);
});
