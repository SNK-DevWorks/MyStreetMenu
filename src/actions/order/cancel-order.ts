'use server';

import { z } from 'zod';
import { orderService } from '@/services/order.service';
import { getCurrentUserId } from '@/lib/auth/get-user';
import type { ActionResponse } from '@/types/action-response';

const schema = z.object({ orderId: z.string().uuid() });

/**
 * Vendor server action — cancel an active order.
 * Delegates to updateStatus with 'cancelled' — the service validates
 * that cancellation is allowed from the current status.
 */
export async function cancelOrderAction(input: unknown): Promise<ActionResponse> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: 'Invalid order ID' };
  }

  try {
    const userId = await getCurrentUserId();
    await orderService.updateStatus(userId, parsed.data.orderId, 'cancelled');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel order',
    };
  }
}
