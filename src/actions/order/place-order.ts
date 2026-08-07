'use server';

import { placeOrderSchema } from '@/lib/orders/validate-order';
import { orderService } from '@/services/order.service';
import type { ActionResponse } from '@/types/action-response';
import type { PlacedOrderResult } from '@/types/order';

/**
 * Public server action — no authentication required.
 * Called from the customer CartSheet after they fill in their details.
 *
 * Returns a real token and orderId from the database.
 * The customer sees a loading state until this resolves — no fake tokens.
 */
export async function placeOrderAction(
  input: unknown,
): Promise<ActionResponse<PlacedOrderResult>> {
  const parsed = placeOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const result = await orderService.placeOrder(parsed.data);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to place order',
    };
  }
}
