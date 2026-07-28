'use server';

import { promotionService } from '@/services';
import { getCurrentUserId } from '@/lib/auth/get-user';
import type { ActionResponse } from '@/types/action-response';

export async function deletePromotionAction(promotionId: string): Promise<ActionResponse> {
  if (!promotionId) {
    return { success: false, error: 'Promotion ID is required' };
  }

  try {
    const userId = await getCurrentUserId();
    await promotionService.deletePromotion(userId, promotionId);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete promotion' };
  }
}
