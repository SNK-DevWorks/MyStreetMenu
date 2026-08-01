import { menuRepository, shopRepository, categoryRepository } from '@/repositories';
import { imageUploadService } from './image-upload.service';
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
   * Batch-create multiple menu items in a single DB insert.
   * Validates shop ownership once. Validates all referenced categories in parallel.
   * Caller is responsible for uploading images beforehand.
   */
  async createMenuItemsBatch(
    userId: string,
    shopId: string,
    items: Array<{
      categoryId: string;
      name: string;
      description?: string;
      price: string;
      imageUrl?: string | null;
      foodType: string;
      isBestSeller: boolean;
      isSoldOut: boolean;
      isTodaysSpecial: boolean;
    }>,
  ) {
    const shop = await shopRepository.findById(shopId);
    if (!shop) throw new Error('Shop not found');
    if (shop.userId !== userId) throw new Error('Unauthorized');

    // Validate all unique categories belong to this shop (parallel)
    const uniqueCategoryIds = [...new Set(items.map((i) => i.categoryId))];
    const categoryResults = await Promise.all(
      uniqueCategoryIds.map((id) => categoryRepository.findById(id)),
    );
    for (const cat of categoryResults) {
      if (!cat || cat.shopId !== shopId) {
        throw new Error(`Category not found in this shop`);
      }
    }

    // Build insertable rows with generated slugs
    const rows: NewMenuItem[] = items.map((item, index) => ({
      shopId,
      categoryId: item.categoryId,
      name: item.name,
      slug: generateSlug(item.name),
      description: item.description ?? null,
      price: item.price,
      imageUrl: item.imageUrl ?? null,
      foodType: item.foodType,
      isBestSeller: item.isBestSeller,
      isSoldOut: item.isSoldOut,
      isTodaysSpecial: item.isTodaysSpecial,
      sortOrder: index,
    }));

    return menuRepository.createMany(rows);
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

    // Delete old image from R2 if the image is being replaced or removed
    const isImageChanging = 'imageUrl' in data && data.imageUrl !== item.imageUrl;
    if (isImageChanging && item.imageUrl) {
      await imageUploadService.deleteImage(item.imageUrl);
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

    // Delete image from R2 before removing the DB record
    if (item.imageUrl) {
      await imageUploadService.deleteImage(item.imageUrl);
    }

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
   * Bulk update today's specials for a shop.
   */
  async updateTodaysSpecials(userId: string, shopId: string, specialItemIds: string[]) {
    const shop = await shopRepository.findById(shopId);
    if (!shop || shop.userId !== userId) throw new Error('Unauthorized');

    const items = await menuRepository.findByShopId(shopId);
    const updates = items.map(async (item) => {
      const shouldBeSpecial = specialItemIds.includes(item.id);
      if (item.isTodaysSpecial !== shouldBeSpecial) {
        return menuRepository.update(item.id, { isTodaysSpecial: shouldBeSpecial });
      }
    });

    await Promise.all(updates);
    return true;
  },

  /**
   * Get all menu items for a shop.
   */
  async getMenuByShop(shopId: string) {
    return menuRepository.findByShopId(shopId);
  },

  /**
   * Get menu items with their category name enriched.
   * Returns items sorted by category sort order, then item sort order.
   */
  async getMenuWithCategories(shopId: string) {
    const [items, cats] = await Promise.all([
      menuRepository.findByShopId(shopId),
      categoryRepository.findByShopId(shopId),
    ]);

    const categoryMap = new Map(cats.map((c) => [c.id, c.name]));

    return items.map((item) => ({
      ...item,
      categoryName: categoryMap.get(item.categoryId) ?? 'Uncategorized',
    }));
  },
};

