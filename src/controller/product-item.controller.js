const catchAsync = require("../utils/catchAsync.js");
const ProductItemService = require("../services/product-item.service.js");
const ProductService = require("../services/product.service.js");
const ProviderService = require("../services/provider.service.js");
const { generateUserCode } = require("../utils/token.js");
const { hashPassword } = require("../utils/bcrypt");

const productItemService = new ProductItemService();
const productService = new ProductService();
const providerService = new ProviderService();

module.exports.createProductItem = catchAsync(async (req, res) => {
  const { productId, providerId, password, ...productItemData } = req.body;

  try {
    const findProduct = await productService.findProductById(productId);
    if (!findProduct) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const findProvider = await providerService.getProviderById(providerId);
    if (!findProvider) {
      return res.status(404).json({ message: "Proveedor no encontrado" });
    }

    const productCodeItem = await generateUserCode();
    productItemData.productCodeItem = productCodeItem;

    const hashedPassword = await hashPassword(password);
    productItemData.password = hashedPassword;

    const productItem = await productItemService.createProductItem({
      ...productItemData,
      productId,
      providerId,
    });

    return res.status(201).json({ productItem });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
});
