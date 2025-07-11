const catchAsync = require("../utils/catchAsync.js");
const ProductService = require("../services/product.service.js");
const CategoryService = require("../services/category.service.js");
const { differenceInDays } = require("date-fns");

const productService = new ProductService();
const categoryService = new CategoryService();

module.exports.createProduct = catchAsync(async (req, res) => {
  const { categoryId, ...productData } = req.body;
  const { id: providerId } = req.user;

  await productService.createProduct({
    ...productData,
    providerId,
    categoryId,
  });

  return res.status(201).json({ message: "Producto creado con éxito" });
});

module.exports.putProductOnSale = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { salePrice } = req.body;

  await productService.putProductOnSale(id, salePrice);

  return res
    .status(200)
    .json({ message: "Producto puesto en oferta con éxito" });
});

module.exports.getAllProducts = catchAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const parsedLimit = parseInt(limit);
  const parsedPage = parseInt(page);
  const offset = (parsedPage - 1) * parsedLimit;

  const { products, count } = await productService.getAllProducts({
    limit: parsedLimit,
    offset,
  });

  return res.status(200).json({
    page: parsedPage,
    results: products.length,
    total: count,
    totalPages: Math.ceil(count / parsedLimit),
    products,
  });
});

module.exports.getMyProducts = catchAsync(async (req, res) => {
  const { id: providerId } = req.user;
  const { page = 1, limit = 10 } = req.query;

  const parsedLimit = parseInt(limit);
  const parsedPage = parseInt(page);
  const offset = (parsedPage - 1) * parsedLimit;

  const { products, count } = await productService.getMyProducts({
    providerId,
    limit: parsedLimit,
    offset,
  });

  return res.status(200).json({
    page: parsedPage,
    results: products.length,
    total: count,
    totalPages: Math.ceil(count / parsedLimit),
    products,
  });
});

module.exports.getProductById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const product = await productService.findProductById(id);
  if (!product) {
    return res.status(404).json({ message: "Producto no encontrado" });
  }

  return res.status(200).json({ product });
});

module.exports.editProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { providerId, categoryId, ...productData } = req.body;

  const findProduct = await productService.findProductById(id);
  if (!findProduct) {
    return res.status(404).json({ message: "Producto no encontrado" });
  }

  const findCategory = await categoryService.findCategoryById(categoryId);
  if (!findCategory) {
    return res.status(404).json({ message: "Categoría no encontrada" });
  }

  await productService.editProduct(id, {
    ...productData,
    providerId,
    categoryId,
  });

  return res.status(200).json({ message: "Producto editado con éxito" });
});

module.exports.deleteProduct = catchAsync(async (req, res) => {
  const { id } = req.params;

  await productService.deleteProductById(id);

  return res.status(200).json({ message: "Producto eliminado con éxito" });
});
