import { createClient } from '@/lib/supabase/client';
import type { OrderStatus } from './order-status';

export type OrderRealtimePayload = {
  id: string;
  shop_id: string;
  token: string;
  status: OrderStatus;
  customer_name: string | null;
  table_label: string | null;
  total: string;
  placed_at: string;
};

// ── Vendor Realtime ───────────────────────────────────────────────────────────

/**
 * Subscribe to live order changes for a vendor's shop.
 * Returns an unsubscribe function.
 *
 * - INSERT: new order placed by customer
 * - UPDATE: status changed (new → preparing → ready → completed)
 *
 * Used exclusively by the vendor dashboard (authenticated, non-anonymous session).
 * RLS enforces that only orders belonging to the vendor's shop are received.
 */
export function subscribeToShopOrders(
  shopId: string,
  callbacks: {
    onInsert?: (payload: OrderRealtimePayload) => void;
    onUpdate?: (payload: OrderRealtimePayload) => void;
    onDelete?: (payload: OrderRealtimePayload) => void;
  },
) {
  const supabase = createClient();

  const channel = supabase
    .channel(`shop-orders:${shopId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'orders',
        filter: `shop_id=eq.${shopId}`,
      },
      (event) => callbacks.onInsert?.(event.new as OrderRealtimePayload),
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `shop_id=eq.${shopId}`,
      },
      (event) => callbacks.onUpdate?.(event.new as OrderRealtimePayload),
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ── Customer Realtime ─────────────────────────────────────────────────────────

export interface CustomerOrderCallbacks {
  /** A new order row appeared (e.g. after placement, for future cross-tab sync) */
  onInsert?: (payload: OrderRealtimePayload) => void;
  /** Order status changed: new → preparing → ready → completed */
  onUpdate:  (payload: OrderRealtimePayload) => void;
  /** Order was deleted (defensive — active orders are normally completed, not deleted) */
  onDelete?: (payload: OrderRealtimePayload) => void;
  /** Channel reconnected after a drop — caller should do one reconciliation fetch */
  onReconnect?: () => void;
}

export interface CustomerOrderRealtimeManager {
  /**
   * Subscribe to Realtime updates for the given order IDs.
   * Replaces any existing subscription (safe to call when a new order is placed).
   *
   * Security note:
   *   The `filter` here is a traffic hint — it narrows which Postgres change events
   *   are sent over the wire. RLS on public.orders independently enforces that only
   *   the authenticated anonymous customer's own rows are authorized.
   *   Both layers must be correct.
   */
  subscribe(orderIds: string[], callbacks: CustomerOrderCallbacks): void;

  /** Close the active channel and stop all Realtime subscriptions. */
  unsubscribe(): void;
}

/**
 * Creates a single Realtime manager for the customer's active orders.
 *
 * Architecture:
 *   - One Supabase channel per customer session (not per order).
 *   - Uses `id=in.(uuid1,uuid2,...)` filter — supported in @supabase/supabase-js@2.110.8.
 *     Verify this filter works against your live Supabase project before relying on it.
 *   - Handles INSERT, UPDATE, DELETE events.
 *   - On reconnect, calls onReconnect() so the caller can do one status reconciliation fetch.
 *
 * Usage:
 *   const rt = createCustomerOrderRealtime();
 *   rt.subscribe(['uuid-1', 'uuid-2'], { onUpdate: handler, onReconnect: reconcile });
 *   // later:
 *   rt.unsubscribe();
 */
export function createCustomerOrderRealtime(): CustomerOrderRealtimeManager {
  const supabase = createClient();
  let activeChannel: ReturnType<typeof supabase.channel> | null = null;

  return {
    subscribe(orderIds: string[], callbacks: CustomerOrderCallbacks) {
      // Close any existing channel before opening a new one
      if (activeChannel) {
        supabase.removeChannel(activeChannel);
        activeChannel = null;
      }

      if (!orderIds || orderIds.length === 0) return;

      const orderIdSet = new Set(orderIds);
      const channelId = `customer-orders-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      let channel = supabase.channel(channelId);

      // 1. Register specific id=eq.X listeners for each active order
      orderIds.forEach((id) => {
        channel = channel
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'orders',
              filter: `id=eq.${id}`,
            },
            (event) => {
              if (event.new && (event.new as OrderRealtimePayload).id) {
                callbacks.onUpdate(event.new as OrderRealtimePayload);
              }
            },
          )
          .on(
            'postgres_changes',
            {
              event: 'DELETE',
              schema: 'public',
              table: 'orders',
              filter: `id=eq.${id}`,
            },
            (event) => {
              if (event.old && (event.old as OrderRealtimePayload).id) {
                callbacks.onDelete?.(event.old as OrderRealtimePayload);
              }
            },
          );
      });

      // 2. Also register a general orders listener as a fallback, filtering by orderIdSet in JS
      channel = channel
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
          },
          (event) => {
            const newRow = event.new as OrderRealtimePayload | undefined;
            const oldRow = event.old as OrderRealtimePayload | undefined;
            const id = newRow?.id || oldRow?.id;

            if (!id || !orderIdSet.has(id)) return;

            if (event.eventType === 'UPDATE' && newRow) {
              callbacks.onUpdate(newRow);
            } else if (event.eventType === 'DELETE' && oldRow) {
              callbacks.onDelete?.(oldRow);
            } else if (event.eventType === 'INSERT' && newRow) {
              callbacks.onInsert?.(newRow);
            }
          },
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            // Realtime is connected
          } else if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR' || status === 'CLOSED') {
            // Connection issue — call reconnect reconciliation
            callbacks.onReconnect?.();
          }
        });

      activeChannel = channel;
    },

    unsubscribe() {
      if (activeChannel) {
        supabase.removeChannel(activeChannel);
        activeChannel = null;
      }
    },
  };
}


