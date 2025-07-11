const db = require("./../database/models/index.js");
const AppError = require("../utils/appError.js");

class CategoryService {
  async getAllCategories() {
    const categories = await db.Categories.findAll({
      attributes: ["id", "category"],
    });
    return categories;
  }

  async createCategory(categoryData) {
    return await db.Categories.create(categoryData);
  }

  async findCategoryById(id, transaction) {
    const category = await db.Categories.findByPk(
      id,
      {
        attributes: ["id", "category"],
      },
      { transaction }
    );

    if (!category) {
      throw new AppError("Categoría no encontrada", 404);
    }
    return category;
  }

  async findCategoryByName(name) {
    const category = await db.Categories.findOne({ where: { category: name } });
    if (category) {
      throw new AppError("La categoría ya existe", 400);
    }
    return category;
  }

  async editCategory(id, categoryData) {
    const category = await this.findCategoryById(id);
    return await category.update(categoryData);
  }

  async deleteCategory(id) {
    const category = await this.findCategoryById(id);
    return await category.destroy();
  }
}

module.exports = CategoryService;
