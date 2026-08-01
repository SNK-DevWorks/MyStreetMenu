'use server';

import { promotionService, publishService } from '@/services';
import { promotionRepository } from '@/repositories';
import { getCurrentUserId } from '@/lib/auth/get-user';
import type { ActionResponse } from '@/types/action-response';

export async function deletePromotionAction(promotionId: string): Promise<ActionResponse> {
  if (!promotionId) {
    return { success: false, error: 'Promotion ID is required' };
  }

  try {
    const userId = await getCurrentUserId();

    // Fetch shopId before deletion — row won't exist after deletePromotion
    const promo = await promotionRepository.findById(promotionId);
    const shopId = promo?.shopId;

    await promotionService.deletePromotion(userId, promotionId);

    if (shopId) publishService.publishMenuBackground(shopId);

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete promotion' };
  }
}
