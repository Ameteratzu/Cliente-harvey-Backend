const catchAsync = require("../utils/catchAsync");
const PublishedProductsService = require("../services/publisehd-products.service.js");

const publishedProductsService = new PublishedProductsService();

module.exports.createPublishedProduct = catchAsync(async (req, res) => {
  const { role, id } = req.user;
  const { body } = req;

  const result = await publishedProductsService.createPublishedProduct({
    body,
    role,
    id,
  });

  return res.status(200).json(result);
});

module.exports.getMyPublishedProducts = catchAsync(async (req, res) => {
  const { id: providerId } = req.user;
  const { page = 1, limit = 10 } = req.query;

  const parsedLimit = parseInt(limit);
  const parsedPage = parseInt(page);
  const offset = (parsedPage - 1) * parsedLimit;

  const { publishedProducts, count } =
    await publishedProductsService.getMyPublishedProducts({
      providerId,
      limit: parsedLimit,
      offset,
    });

  return res.status(200).json({
    page: parsedPage,
    results: publishedProducts.length,
    total: count,
    totalPages: Math.ceil(count / parsedLimit),
    publishedProducts,
  });
});

module.exports.getAllPublishedProducts = catchAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const parsedLimit = parseInt(limit);
  const parsedPage = parseInt(page);
  const offset = (parsedPage - 1) * parsedLimit;

  const { publishedProducts, count } =
    await publishedProductsService.getAllPublishedProducts({
      limit: parsedLimit,
      offset,
    });

  return res.status(200).json({
    page: parsedPage,
    results: publishedProducts.length,
    total: count,
    totalPages: Math.ceil(count / parsedLimit),
    publishedProducts,
  });
});

module.exports.get;
