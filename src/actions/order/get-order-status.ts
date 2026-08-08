'use server';

import { inArray, eq, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { orders } from '../../../drizzle/schema/orders';
import { createClient } from '@/lib/supabase/server';
import type { ActionResponse } from '@/types/action-response';

export type OrderStatusItem = {
  id: string;
  status: string;
  readyAt: Date | null;
  completedAt: Date | null;
};

/**
 * Public action for customer menu status reconciliation:
 *
 * Security:
 *   - Verifies the customer's authenticated Supabase anonymous session (auth.uid()).
 *   - Enforces: WHERE orders.id IN (validIds) AND orders.customer_user_id = auth.uid().
 *   - Prevents unauthorized status lookups of arbitrary order UUIDs.
 */
export async function getCustomerOrderStatusesAction(
  orderIds: string[],
): Promise<ActionResponse<OrderStatusItem[]>> {
  if (!orderIds || orderIds.length === 0) {
    return { success: true, data: [] };
  }

  // ── Authenticate customer session ──────────────────────────────────────────
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // No active customer session — return empty for security
    return { success: true, data: [] };
  }

  try {
    const validIds = orderIds.filter((id) => typeof id === 'string' && id.length > 10);
    if (validIds.length === 0) {
      return { success: true, data: [] };
    }

    const rows = await db
      .select({
        id: orders.id,
        status: orders.status,
        readyAt: orders.readyAt,
        completedAt: orders.completedAt,
      })
      .from(orders)
      .where(
        and(
          inArray(orders.id, validIds),
          eq(orders.customerUserId, user.id),
        ),
      );

    return {
      success: true,
      data: rows.map((r) => ({
        id: r.id,
        status: r.status,
        readyAt: r.readyAt,
        completedAt: r.completedAt,
      })),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch status',
    };
  }
}

