const catchAsync = require("../utils/catchAsync");
const PublishedProductsService = require("../services/publisehd-products.service.js");

const publishedProductsService = new PublishedProductsService();

// TODO: al publicar un producto, se le cobra un monto
/*- publicar el producto
  - eliminar la publicación cuando vence automaticamente
     */

module.exports.createPublishedProduct = catchAsync(async (req, res) => {
  const { role } = req.user;
  const { body } = req;

  await publishedProductsService.createPublishedProduct({ body, role });

  return res.status(200).json({ message: "Producto publicado con éxito" });
});

module.exports.getMyPublishedProducts = catchAsync(async (req, res) => {
  const { id: providerId } = req.user;

  const publishedProducts = await publishedProductsService.getPublishedProducts(
    providerId
  );

  return res
    .status(200)
    .json({ data: publishedProducts, results: publishedProducts.length });
});

module.exports.getAllPublishedProducts = catchAsync(async (req, res) => {
  const publishedProducts =
    await publishedProductsService.getAllPublishedProducts();

  return res
    .status(200)
    .json({ data: publishedProducts, results: publishedProducts.length });
});

module.exports.get;
