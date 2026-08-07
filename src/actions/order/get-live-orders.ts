'use server';

import { orderService } from '@/services/order.service';
import { getCurrentUserId } from '@/lib/auth/get-user';
import type { ActionResponse } from '@/types/action-response';
import type { LiveOrder } from '@/types/order';

/**
 * Vendor server action — returns all live orders (new, preparing, ready).
 * Called on initial page load by useLiveOrders() hook.
 * Realtime handles updates after that — no polling needed.
 */
export async function getLiveOrdersAction(): Promise<ActionResponse<LiveOrder[]>> {
  try {
    const userId = await getCurrentUserId();
    const orders = await orderService.getLiveOrders(userId);
    return { success: true, data: orders };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch live orders',
    };
  }
}
