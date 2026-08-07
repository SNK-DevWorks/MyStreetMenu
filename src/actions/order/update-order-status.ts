'use server';

import { updateOrderStatusSchema } from '@/lib/orders/validate-order';
import { orderService } from '@/services/order.service';
import { getCurrentUserId } from '@/lib/auth/get-user';
import type { ActionResponse } from '@/types/action-response';

/**
 * Vendor server action — requires authentication.
 * One action handles all status transitions:
 *
 *   updateOrderStatusAction({ orderId, status: 'preparing' })
 *   updateOrderStatusAction({ orderId, status: 'ready' })
 *   updateOrderStatusAction({ orderId, status: 'completed' })
 *   updateOrderStatusAction({ orderId, status: 'cancelled' })
 *
 * The service validates:
 *   - Vendor owns the shop this order belongs to
 *   - The transition is valid (e.g. can't go completed → ready)
 *   - Sets the correct timestamp (preparingAt, readyAt, completedAt)
 */
export async function updateOrderStatusAction(
  input: unknown,
): Promise<ActionResponse> {
  const parsed = updateOrderStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const userId = await getCurrentUserId();
    await orderService.updateStatus(userId, parsed.data.orderId, parsed.data.status);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update order status',
    };
  }
}
