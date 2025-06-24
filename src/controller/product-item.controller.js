const catchAsync = require("../utils/catchAsync.js");
const ProductItemService = require("../services/product-item.service.js");
const productItemService = new ProductItemService();

module.exports.createProductItem = catchAsync(async (req, res) => {
  const { productId, password, ...productItemData } = req.body;
  const { id: providerId } = req.user;

  const productItem = await productItemService.createProductItem({
    ...productItemData,
    productId,
    providerId,
    password,
  });

  return res.status(201).json({ productItem });
});

module.exports.getProductItems = catchAsync(async (req, res) => {
  const { id: providerId } = req.user;

  const productItems = await productItemService.getAllProductItems(providerId);
  return res
    .status(200)
    .json({ data: productItems, results: productItems.length });
});

module.exports.getProviderProductItems = catchAsync(async (req, res) => {
  const productItems = await productItemService.getProviderProductsItems();
  return res
    .status(200)
    .json({ data: productItems, results: productItems.length });
});

module.exports.getProductsItemsPublished = catchAsync(async (req, res) => {
  const productItems = await productItemService.getProductsItemsPublished();

  return res
    .status(200)
    .json({ data: productItems, results: productItems.length });
});

module.exports.getProductItemById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const productItem = await productItemService.findProductItemById(id);
  return res.status(200).json({ data: productItem });
});

module.exports.deleteProductItem = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { id: providerId } = req.user;

  const deletedProductItem = await productItemService.deleteProductItem({
    id,
    providerId,
  });
  return res.status(200).json({
    message: "Producto eliminado con éxito",
    data: deletedProductItem,
  });
});

module.exports.editProductItem = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { id: providerId } = req.user;
  const { body } = req;

  const updatedProductItem = await productItemService.editProductItem({
    productItemData: body,
    id,
    providerId,
  });

  return res.status(200).json({
    message: "Producto actualizado con éxito",
    data: updatedProductItem,
  });
});
