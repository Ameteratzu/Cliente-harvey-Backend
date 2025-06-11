const db = require("./../database/models/index.js");
const { addDays } = require("date-fns");

class ProductService {
  async createProduct(productData) {
    return await db.Product.create(productData);
  }

  async getAllProducts() {
    return await db.Product.findAll({
      include: [
        {
          model: db.Providers,
          as: "provider",
          attributes: [
            "businessName",
            "username",
            "email",
            "telephone",
            "codeUser",
            "createdAt",
            "updatedAt",
          ],
        },
        {
          model: db.Categories,
          as: "category",
        },
        {
          model: db.ProductItem,
          as: "productItem",
          //attributes: ["id"],
        },
      ],
    });
  }

  async findProductById(id) {
    return await db.Product.findOne({ where: { id } });
  }

  async editProduct(id, productData) {
    return await db.Product.update(productData, { where: { id } });
  }

  async deleteProductById(id) {
    return await db.Product.destroy({ where: { id } });
  }

  async publishProduct(id) {
    const publishStartDate = new Date();
    const publishEndDate = addDays(publishStartDate, 30);

    return await db.Product.update(
      { isPublished: true, publishStartDate, publishEndDate },
      { where: { id } }
    );
  }

  async putProductOnSale(id, salePrice) {
    return await db.Product.update(
      { isOnSale: true, salePrice },
      { where: { id } }
    );
  }

  async renewProduct(id, publishEndDate) {
    const newPublishEndDate = addDays(publishEndDate, 30);
    return await db.Product.update(
      { publishEndDate: newPublishEndDate },
      { where: { id } }
    );
  }

  async unPublishProduct(id) {
    return await db.Product.update(
      { isPublished: false, publishEndDate: null, publishStartDate: null },
      { where: { id } }
    );
  }
}

module.exports = ProductService;
