class CategoryImagesService {
  async createCategoryImage(data) {
    return db.CategoryImages.create(data);
  }

  async deleteCategoryImage(id) {
    const categoryImage = await db.CategoryImages.findByPk(id);
    if (!categoryImage) {
      throw new AppError("La imagen no existe", 404);
    }
    return categoryImage.destroy();
  }
}

module.exports = CategoryImagesService;
