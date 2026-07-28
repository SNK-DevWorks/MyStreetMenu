import { categoryRepository, shopRepository } from '@/repositories';
import type { NewCategory } from '../../drizzle/schema/categories';

export const categoryService = {
  /**
   * Create a new category. Vendor must own the shop.
   */
  async createCategory(userId: string, data: Omit<NewCategory, 'id'>) {
    const shop = await shopRepository.findById(data.shopId);
    if (!shop) throw new Error('Shop not found');
    if (shop.userId !== userId) throw new Error('Unauthorized');

    // Auto-set sort order to end
    const existing = await categoryRepository.findByShopId(data.shopId);
    const sortOrder = data.sortOrder ?? existing.length;

    return categoryRepository.create({ ...data, sortOrder });
  },

  /**
   * Update a category.
   */
  async updateCategory(userId: string, categoryId: string, data: Partial<NewCategory>) {
    const category = await categoryRepository.findById(categoryId);
    if (!category) throw new Error('Category not found');

    const shop = await shopRepository.findById(category.shopId);
    if (!shop || shop.userId !== userId) throw new Error('Unauthorized');

    return categoryRepository.update(categoryId, data);
  },

  /**
   * Delete a category.
   */
  async deleteCategory(userId: string, categoryId: string) {
    const category = await categoryRepository.findById(categoryId);
    if (!category) throw new Error('Category not found');

    const shop = await shopRepository.findById(category.shopId);
    if (!shop || shop.userId !== userId) throw new Error('Unauthorized');

    return categoryRepository.delete(categoryId);
  },

  /**
   * Reorder categories by providing an ordered list of IDs.
   */
  async reorderCategories(userId: string, shopId: string, categoryIds: string[]) {
    const shop = await shopRepository.findById(shopId);
    if (!shop) throw new Error('Shop not found');
    if (shop.userId !== userId) throw new Error('Unauthorized');

    await categoryRepository.reorder(categoryIds);
  },

  /**
   * Get all categories for a shop.
   */
  async getCategoriesByShop(shopId: string) {
    return categoryRepository.findByShopId(shopId);
  },
};
