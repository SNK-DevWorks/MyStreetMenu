'use server';

import { inArray } from 'drizzle-orm';
import { db } from '@/lib/db';
import { orders } from '../../../drizzle/schema/orders';
import type { ActionResponse } from '@/types/action-response';

export type OrderStatusItem = {
  id: string;
  status: string;
  readyAt: Date | null;
  completedAt: Date | null;
};

/**
 * Public action for customer menu:
 * Checks the current live status of the customer's active orders by ID.
 * Returns only the status & timestamps so the customer's bottom bar
 * automatically updates to 'ready' or dismisses when 'completed'.
 */
export async function getCustomerOrderStatusesAction(
  orderIds: string[],
): Promise<ActionResponse<OrderStatusItem[]>> {
  if (!orderIds || orderIds.length === 0) {
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
      .where(inArray(orders.id, validIds));

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
