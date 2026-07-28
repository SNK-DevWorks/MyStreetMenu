'use server';

import { menuService } from '@/services';
import { getCurrentUserId } from '@/lib/auth/get-user';
import type { ActionResponse } from '@/types/action-response';

export async function deleteMenuAction(itemId: string): Promise<ActionResponse> {
  if (!itemId) {
    return { success: false, error: 'Menu item ID is required' };
  }

  try {
    const userId = await getCurrentUserId();
    await menuService.deleteMenuItem(userId, itemId);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete menu item' };
  }
}
