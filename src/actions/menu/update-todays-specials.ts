'use server';

import { getCurrentUserId } from '@/lib/auth/get-user';
import { menuService, publishService } from '@/services';
import type { ActionResponse } from '@/types/action-response';

export async function updateTodaysSpecialsAction(
  shopId: string,
  specialItemIds: string[]
): Promise<ActionResponse<{ success: boolean }>> {
  if (!shopId) {
    return { success: false, error: 'Shop ID is required' };
  }

  try {
    const userId = await getCurrentUserId();
    await menuService.updateTodaysSpecials(userId, shopId, specialItemIds);
    // Trigger background publish for public menu cache
    publishService.publishMenuBackground(shopId);
    return { success: true, data: { success: true } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update Today's Specials",
    };
  }
}
