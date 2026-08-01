'use server';

import { menuService, publishService } from '@/services';
import { menuRepository } from '@/repositories';
import { getCurrentUserId } from '@/lib/auth/get-user';
import type { ActionResponse } from '@/types/action-response';

export async function deleteMenuAction(itemId: string): Promise<ActionResponse> {
  if (!itemId) {
    return { success: false, error: 'Menu item ID is required' };
  }

  try {
    const userId = await getCurrentUserId();

    // Fetch shopId before deletion — we need it for republishing after the row is gone
    const item = await menuRepository.findById(itemId);
    const shopId = item?.shopId;

    await menuService.deleteMenuItem(userId, itemId);

    // Republish so the deleted item is no longer in the public JSON
    if (shopId) publishService.publishMenuBackground(shopId);

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete menu item' };
  }
}
