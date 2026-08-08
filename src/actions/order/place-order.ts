'use server';

import { placeOrderSchema } from '@/lib/orders/validate-order';
import { orderService } from '@/services/order.service';
import { createClient } from '@/lib/supabase/server';
import type { ActionResponse } from '@/types/action-response';
import type { PlacedOrderResult } from '@/types/order';

/**
 * Public server action — called from the customer CartSheet after they fill in details.
 *
 * Security:
 *   - Resolves customerUserId from the server-side Supabase session (never from browser payload).
 *   - Rejects if no authenticated anonymous session exists.
 *   - Passes shopSlug (not shopId) — service resolves slug → shopId from DB.
 *   - Items carry only menuItemId + quantity — service fetches name, image, price from DB.
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

  // ── Resolve customer identity from server-side session ──────────────────────
  // Never trust customerUserId from the browser payload.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: 'No active customer session. Please refresh the page and try again.',
    };
  }

  try {
    const result = await orderService.placeOrder({
      ...parsed.data,
      customerUserId: user.id,   // server-resolved, never from browser
    });
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to place order',
    };
  }
}
