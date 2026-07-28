import { menuRepository, shopRepository, categoryRepository } from '@/repositories';
import type { NewMenuItem } from '../../drizzle/schema/menu-items';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export const menuService = {
  /**
   * Create a new menu item. Validates ownership + category existence.
   */
  async createMenuItem(userId: string, data: Omit<NewMenuItem, 'id' | 'slug'>) {
    const shop = await shopRepository.findById(data.shopId);
    if (!shop) throw new Error('Shop not found');
    if (shop.userId !== userId) throw new Error('Unauthorized');

    const category = await categoryRepository.findById(data.categoryId);
    if (!category || category.shopId !== data.shopId) {
      throw new Error('Category not found in this shop');
    }

    const slug = generateSlug(data.name);

    // Auto-set sort order
    const existing = await menuRepository.findByCategoryId(data.categoryId);
    const sortOrder = data.sortOrder ?? existing.length;

    return menuRepository.create({ ...data, slug, sortOrder });
  },

  /**
   * Update a menu item.
   */
  async updateMenuItem(userId: string, itemId: string, data: Partial<NewMenuItem>) {
    const item = await menuRepository.findById(itemId);
    if (!item) throw new Error('Menu item not found');

    const shop = await shopRepository.findById(item.shopId);
    if (!shop || shop.userId !== userId) throw new Error('Unauthorized');

    // Regenerate slug if name changed
    if (data.name && data.name !== item.name) {
      data.slug = generateSlug(data.name);
    }

    return menuRepository.update(itemId, data);
  },

  /**
   * Delete a menu item.
   */
  async deleteMenuItem(userId: string, itemId: string) {
    const item = await menuRepository.findById(itemId);
    if (!item) throw new Error('Menu item not found');

    const shop = await shopRepository.findById(item.shopId);
    if (!shop || shop.userId !== userId) throw new Error('Unauthorized');

    return menuRepository.delete(itemId);
  },

  /**
   * Toggle sold out status.
   */
  async toggleSoldOut(userId: string, itemId: string, isSoldOut: boolean) {
    const item = await menuRepository.findById(itemId);
    if (!item) throw new Error('Menu item not found');

    const shop = await shopRepository.findById(item.shopId);
    if (!shop || shop.userId !== userId) throw new Error('Unauthorized');

    return menuRepository.update(itemId, { isSoldOut });
  },

  /**
   * Set/unset best seller.
   */
  async setBestSeller(userId: string, itemId: string, isBestSeller: boolean) {
    const item = await menuRepository.findById(itemId);
    if (!item) throw new Error('Menu item not found');

    const shop = await shopRepository.findById(item.shopId);
    if (!shop || shop.userId !== userId) throw new Error('Unauthorized');

    return menuRepository.update(itemId, { isBestSeller });
  },

  /**
   * Set/unset today's special.
   */
  async setTodaysSpecial(userId: string, itemId: string, isTodaysSpecial: boolean) {
    const item = await menuRepository.findById(itemId);
    if (!item) throw new Error('Menu item not found');

    const shop = await shopRepository.findById(item.shopId);
    if (!shop || shop.userId !== userId) throw new Error('Unauthorized');

    return menuRepository.update(itemId, { isTodaysSpecial });
  },

  /**
   * Get all menu items for a shop.
   */
  async getMenuByShop(shopId: string) {
    return menuRepository.findByShopId(shopId);
  },
};
