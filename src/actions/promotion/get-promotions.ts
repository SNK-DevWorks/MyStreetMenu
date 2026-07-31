'use server';

import { getCurrentUserId } from '@/lib/auth/get-user';
import { shopRepository, promotionRepository } from '@/repositories';
import type { ActionResponse } from '@/types/action-response';
import type { Promotion } from '../../../drizzle/schema/promotions';

export async function getAllPromotionsByTypeAction(
  type: 'offer' | 'announcement'
): Promise<ActionResponse<Promotion[]>> {
  try {
    const userId = await getCurrentUserId();
    const shop = await shopRepository.findByUserId(userId);
    if (!shop) return { success: false, error: 'Shop not found' };

    const all = await promotionRepository.findByShopId(shop.id);
    const filtered = all.filter((p) => p.type === type);
    return { success: true, data: filtered };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch promotions',
    };
  }
}
