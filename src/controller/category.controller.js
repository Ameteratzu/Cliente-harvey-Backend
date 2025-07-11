const catchAsync = require("../utils/catchAsync.js");
const CategoryService = require("../services/category.service.js");

const categoryService = new CategoryService();

module.exports.getAllCategories = catchAsync(async (req, res) => {
  try {
    const categories = await categoryService.getAllCategories();
    return res.status(200).json({ categories, results: categories.length });
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ message: error.message });
  }
});

module.exports.createCategory = catchAsync(async (req, res) => {
  try {
    const { category } = req.body;

    const findCategory = await categoryService.findCategoryByName(category);
    if (findCategory) {
      return res.status(400).json({ message: "La categoría ya existe" });
    }

    await categoryService.createCategory({ category });
    return res.status(201).json({ message: "Categoría creada con éxito" });
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ message: error.message });
  }
});

module.exports.getCategoryById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const category = await categoryService.findCategoryById(id);
  if (!category) {
    return res.status(404).json({ message: "Categoría no encontrada" });
  }

  return res.status(200).json({ category });
});

module.exports.editCategory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { category } = req.body;

  await categoryService.editCategory(id, { category });
  return res.status(200).json({ message: "Categoría editada con éxito" });
});

module.exports.deleteCategory = catchAsync(async (req, res) => {
  const { id } = req.params;

  const category = await categoryService.findCategoryById(id);
  if (!category) {
    return res.status(404).json({ message: "Categoría no encontrada" });
  }

  await categoryService.deleteCategory(id);
  return res.status(200).json({ message: "Categoría eliminada con éxito" });
});
