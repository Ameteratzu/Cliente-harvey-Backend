const db = require("./../database/models/index.js");

class ProductItemService {
  async createProductItem(productItemData) {
    return await db.ProductItem.create(productItemData);
  }

  async getAllProductItems() {
    return await db.ProductItem.findAll();
  }

  async findProductItemById(id) {
    return await db.ProductItem.findByPk(id);
  }

  async deleteProductItemById(id) {
    return await db.ProductItem.destroy({ where: { id } });
  }
}

module.exports = ProductItemService;
