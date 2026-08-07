'use server';

import { z } from 'zod';
import { orderService } from '@/services/order.service';
import { getCurrentUserId } from '@/lib/auth/get-user';
import type { ActionResponse } from '@/types/action-response';
import type { LiveOrder } from '@/types/order';

const schema = z.object({
  page:  z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
});

/**
 * Vendor server action — paginated completed/cancelled order history.
 */
export async function getOrderHistoryAction(
  input: unknown,
): Promise<ActionResponse<LiveOrder[]>> {
  const parsed = schema.safeParse(input ?? {});
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const userId = await getCurrentUserId();
    const orders = await orderService.getOrderHistory(userId, parsed.data);
    return { success: true, data: orders };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch order history',
    };
  }
}
