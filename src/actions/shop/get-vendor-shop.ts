'use server';

import { createClient } from '@/lib/supabase/server';
import { shopService } from '@/services';
import { getCurrentUserId } from '@/lib/auth/get-user';
import { resolveLocationInput } from '@/lib/resolve-maps';
import type { ActionResponse } from '@/types/action-response';
import type { Shop } from '../../../drizzle/schema/shops';

/**
 * Returns the vendor's shop. After onboarding, the shop row always exists.
 * Falls back to auto-creation from auth metadata only as a safety net
 * (e.g., for legacy accounts created before this fix).
 *
 * Auto-migrates legacy records where address contains a raw Google Maps URL.
 */
export async function getVendorShopAction(): Promise<ActionResponse<Shop>> {
  try {
    const userId = await getCurrentUserId();

    // Primary path: shop already created during onboarding
    const shop = await shopService.getVendorShop(userId);
    if (shop) {
      // Auto-migrate if address is still a raw URL in DB
      if (shop.address && /^https?:\/\//i.test(shop.address)) {
        const resolved = await resolveLocationInput(shop.address);
        const updatedShop = await shopService.updateShop(userId, shop.id, {
          address: resolved.address,
          mapUrl: resolved.mapUrl || shop.address,
        });
        if (updatedShop) return { success: true, data: updatedShop };
      }
      return { success: true, data: shop };
    }

    // Safety-net: vendor completed onboarding before this fix was deployed.
    // Auto-create from their stored auth metadata.
    console.warn('[getVendorShopAction] Shop missing for user', userId, '— auto-creating from metadata.');
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const meta = user?.user_metadata ?? {};
    const shopName: string = meta.shop_name || meta.shopName || 'My Shop';
    const foodType: string = meta.category || meta.foodType || meta.food_type || '';
    const phone: string = meta.phone || '';
    const whatsapp: string = meta.whatsapp || '';
    const rawAddress: string = meta.location || meta.address || '';

    const resolved = await resolveLocationInput(rawAddress);

    const newShop = await shopService.createShop(userId, {
      name: shopName,
      foodType,
      phone,
      whatsapp,
      address: resolved.address,
      mapUrl: resolved.mapUrl,
    });

    return { success: true, data: newShop };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load shop',
    };
  }
}
