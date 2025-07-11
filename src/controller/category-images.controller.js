const catchAsync = require("../utils/catchAsync.js");
const CategoryImagesService = require("../services/category-images.service.js");
const categoryImagesService = new CategoryImagesService();

module.exports.createCategoryImage = catchAsync(async (req, res) => {
  const data = req.body;

  const result = await categoryImagesService.createCategoryImage(data);
  return res.status(200).json(result);
});

module.exports.deleteCategoryImage = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await categoryImagesService.deleteCategoryImage(id);
  return res.status(200).json(result);
});
