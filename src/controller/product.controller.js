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

module.exports.publishProduct = catchAsync(async (req, res) => {
  const { id: productItemId } = req.params;
  const { id: providerId, role: providerRole } = req.user;
  const { days } = req.body;

  await productService.publishProduct({
    productItemId,
    providerId,
    providerRole,
    days,
  });

  return res.status(200).json({ message: "Producto publicado con éxito" });
});

module.exports.putProductOnSale = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { salePrice } = req.body;

  const product = await productService.findProductById(id);
  if (!product) {
    return res.status(404).json({ message: "Producto no encontrado" });
  }
  if (!product.isPublished) {
    return res.status(400).json({ message: "El producto no está publicado" });
  }

  await productService.putProductOnSale(id, salePrice);

  return res
    .status(200)
    .json({ message: "Producto puesto en oferta con éxito" });
});

module.exports.getAllProducts = catchAsync(async (req, res) => {
  const products = await productService.getAllProducts();

  return res.status(200).json({
    results: products.length,
    products: products.map((product) => {
      return {
        id: product.id,
        productCode: product.productCode,
        product: product.product,
        provider: product.provider,
        category: product.category,
        quantity: product.quantity,
        salePrice: product.salePrice,
        isPublished: product.isPublished,
        publishStartDate: product.publishStartDate,
        publishEndDate: product.publishEndDate,
        isOnSale: product.isOnSale,
        stock: product.productItem.filter((p) => p.isPublished).length,
        remaningDays: differenceInDays(
          new Date(product.publishEndDate),
          new Date()
        ),
        productItems: product.productItem,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      };
    }),
  });
});

module.exports.renewProduct = catchAsync(async (req, res) => {
  const { id } = req.params;

  const findProduct = await productService.findProductById(id);
  if (!findProduct) {
    return res.status(404).json({ message: "Producto no encontrado" });
  }

  await productService.renewProduct(id, findProduct.publishEndDate);
  return res.status(200).json({ message: "Producto renovado con éxito" });
});

module.exports.unPublishProduct = catchAsync(async (req, res) => {
  const { id } = req.params;

  const findProduct = await productService.findProductById(id);
  if (!findProduct) {
    return res.status(404).json({ message: "Producto no encontrado" });
  }

  const days = differenceInDays(
    new Date(findProduct.publishEndDate),
    new Date()
  );

  if (days < 0) {
    await productService.unPublishProduct(id);
    return res.status(200).json({ message: "Producto despublicado con éxito" });
  }

  return res
    .status(400)
    .json({ message: "No se puede despublicar el producto" });
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

  const findProduct = await productService.findProductById(id);
  if (!findProduct) {
    return res.status(404).json({ message: "Producto no encontrado" });
  }

  if (findProduct.isPublished) {
    return res
      .status(400)
      .json({ message: "No se puede eliminar un producto publicado" });
  }

  await productService.deleteProductById(id);
  return res.status(200).json({ message: "Producto eliminado con éxito" });
});
