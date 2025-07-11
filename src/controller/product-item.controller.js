const multer = require("multer");
const xlsx = require("xlsx");
const catchAsync = require("../utils/catchAsync.js");
const ProductItemService = require("../services/product-item.service.js");
const productItemService = new ProductItemService();

const upload = multer({ storage: multer.memoryStorage() }).single("file");

module.exports.createProductItem = catchAsync(async (req, res) => {
  const { id: providerId } = req.user;
  const { productId, password, ...productItemData } = req.body;

  const data = {
    productItemData: {
      ...productItemData,
      productId,
      providerId,
      password,
    },
  };

  const productItem = await productItemService.createProductItem({
    productItemData: data.productItemData,
  });

  return res.status(201).json({ productItem });
});

module.exports.uploadProductItemsExcel = catchAsync(async (req, res) => {
  upload(req, res, async (err) => {
    if (err || !req.file) {
      return res.status(400).json({ message: "Archivo no valido" });
    }

    try {
      const result = await productItemService.uploadProductItemsExcel(
        req.file.buffer
      );
      res.json(result);
    } catch (error) {
      console.error("Error general:", error);
      res.status(500).json({ message: "Error interno al procesar el archivo" });
    }
  });
});

module.exports.unpublishProductItem = catchAsync(async (req, res) => {
  const { id: productItemId } = req.params;
  const { id: providerId } = req.user;

  const productItem = await productItemService.unpublishProductItem({
    productItemId,
    providerId,
  });

  return res.status(200).json({ data: productItem });
});

module.exports.getMyProductItems = catchAsync(async (req, res) => {
  const { id: providerId } = req.user;
  const { page = 1, limit = 10 } = req.query;

  const parsedLimit = parseInt(limit);
  const parsedPage = parseInt(page);
  const offset = (parsedPage - 1) * parsedLimit;

  const { rows: productItems, count } =
    await productItemService.getMyProductItems({
      providerId,
      limit: parseInt(limit),
      offset,
    });

  return res.status(200).json({
    data: productItems,
    results: productItems?.length,
    total: count,
    page: parseInt(page),
    totalPages: Math.ceil(count / limit),
  });
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
  const { username, password, url } = req.body;

  const updatedProductItem = await productItemService.editProductItem({
    productItemData: {
      username,
      password,
      url,
    },
    id,
    providerId,
  });

  return res.status(200).json({
    message: "Producto actualizado con éxito",
    data: updatedProductItem,
  });
});
