'use server';

import { getVendorShopAction } from '@/actions/shop/get-vendor-shop';
import { getMenuDataAction, type MenuItemWithCategory } from '@/actions/shop/get-menu-data';
import { promotionRepository } from '@/repositories';
import type { ActionResponse } from '@/types/action-response';
import type { Shop } from '../../../drizzle/schema/shops';
import type { Category } from '../../../drizzle/schema/categories';
import type { Promotion } from '../../../drizzle/schema/promotions';

export interface VendorDashboardInitialData {
  shop: Shop;
  categories: Category[];
  dbItems: MenuItemWithCategory[];
  offers: Promotion[];
  announcements: Promotion[];
}

/**
 * Single consolidated Server Action that fetches shop info, menu items/categories,
 * and promotions in parallel on the server side in a single HTTP request.
 */
export async function getVendorDashboardDataAction(): Promise<ActionResponse<VendorDashboardInitialData>> {
  try {
    // 1. Fetch vendor shop info
    const shopResult = await getVendorShopAction();
    if (!shopResult.success || !shopResult.data) {
      return { success: false, error: shopResult.error || 'Failed to load shop' };
    }
    const shop = shopResult.data;

    // 2. Fetch menu data and promotions concurrently on the server
    const [menuResult, allPromotions] = await Promise.all([
      getMenuDataAction(shop.id),
      promotionRepository.findByShopId(shop.id),
    ]);

    const categories = menuResult.success && menuResult.data ? menuResult.data.categories : [];
    const dbItems = menuResult.success && menuResult.data ? menuResult.data.items : [];

    const offers = allPromotions.filter((p) => p.type === 'offer');
    const announcements = allPromotions.filter((p) => p.type === 'announcement');

    return {
      success: true,
      data: {
        shop,
        categories,
        dbItems,
        offers,
        announcements,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load vendor dashboard data',
    };
  }
}
