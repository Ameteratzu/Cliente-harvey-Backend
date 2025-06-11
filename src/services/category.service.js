const db = require("./../database/models/index.js");

class CategoryService {
  async getAllCategories() {
    const categories = await db.Categories.findAll();
    return categories;
  }

  async createCategory(categoryData) {
    return await db.Categories.create(categoryData);
  }

  async findCategoryById(id) {
    return await db.Categories.findByPk(id);
  }

  async findCategoryByName(name) {
    return await db.Categories.findOne({ where: { category: name } });
  }

  async editCategory(id, categoryData) {
    return await db.Categories.update(categoryData, { where: { id } });
  }

  async deleteCategory(id) {
    return await db.Categories.destroy({ where: { id } });
  }
}

module.exports = CategoryService;
