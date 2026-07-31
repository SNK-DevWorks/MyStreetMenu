'use server';

import { menuService, categoryService } from '@/services';
import type { ActionResponse } from '@/types/action-response';
import type { Category } from '../../../drizzle/schema/categories';
import type { MenuItem } from '../../../drizzle/schema/menu-items';

export type MenuItemWithCategory = MenuItem & { categoryName: string };

export interface MenuPageData {
  categories: Category[];
  items: MenuItemWithCategory[];
}

/**
 * Fetches all categories and menu items for a given shop in a single round-trip.
 * Safe to call from client components via server action.
 */
export async function getMenuDataAction(shopId: string): Promise<ActionResponse<MenuPageData>> {
  if (!shopId) {
    return { success: false, error: 'Shop ID is required' };
  }

  try {
    const [categories, items] = await Promise.all([
      categoryService.getCategoriesByShop(shopId),
      menuService.getMenuWithCategories(shopId),
    ]);

    return {
      success: true,
      data: { categories, items },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load menu data',
    };
  }
}
