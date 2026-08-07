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

/**
 * Subscribe to live order changes for a vendor's shop.
 * Returns an unsubscribe function.
 *
 * - INSERT: new order placed by customer
 * - UPDATE: status changed (new → preparing → ready → completed)
 *
 * Both the vendor dashboard and customer sticky bar use this same channel.
 * Vendor filters by shop_id, customer filters by order id.
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

/**
 * Subscribe to a single order's status changes.
 * Used by the customer sticky bar to show real-time status.
 */
export function subscribeToOrder(
  orderId: string,
  onUpdate: (payload: OrderRealtimePayload) => void,
) {
  const supabase = createClient();

  const channel = supabase
    .channel(`order:${orderId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`,
      },
      (event) => onUpdate(event.new as OrderRealtimePayload),
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
