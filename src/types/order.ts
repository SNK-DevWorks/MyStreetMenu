import type { OrderStatus } from '@/lib/orders/order-status';

/**
 * A fully hydrated order with its items — used across vendor dashboard,
 * customer sticky bar, and order history.
 */
export interface LiveOrder {
  id: string;
  shopId: string;
  token: string;
  status: OrderStatus;

  customerName:  string | null;
  customerPhone: string | null;
  tableId:       string | null;  // FK to shop_tables
  tableLabel:    string | null;  // snapshot at order time
  customerNotes: string | null;

  paymentMethod: string | null;
  paymentStatus: string;
  orderSource:   string;

  subtotal: number;
  discount: number;
  total:    number;

  placedAt:    Date;
  preparingAt: Date | null;
  readyAt:     Date | null;
  completedAt: Date | null;

  items: LiveOrderItem[];
}

export interface LiveOrderItem {
  id:         string;
  menuItemId: string | null;
  name:       string;
  image:      string | null;
  price:      number;
  quantity:   number;
}

/**
 * Minimal shape returned to the customer after order placement.
 */
export interface PlacedOrderResult {
  orderId:   string;
  token:     string;
  total:     number;
  placedAt:  Date;
}

/**
 * Input to place a new order (after validation via validate-order.ts).
 *
 * Security rules:
 *   - shopSlug (not shopId): server resolves slug → shopId. Browser never nominates a shopId directly.
 *   - customerUserId: resolved server-side from Supabase session. Never accepted from browser.
 *   - items carry only menuItemId + quantity. Server fetches name, image, price from menu_items DB.
 */
export interface PlaceOrderPayload {
  shopSlug:      string;        // server resolves to shopId — browser sends slug, not UUID
  customerUserId: string;       // resolved server-side from auth session; never from browser
  orderSource:   'qr' | 'direct_link' | 'manual' | 'admin';
  customerName?: string;
  customerPhone?: string;
  tableUuid?:    string;        // UUID from ?t= param — validated server-side
  tableLabel?:   string;        // fallback plain label (walk-in, manual orders)
  customerNotes?: string;
  paymentMethod?: 'counter_cash' | 'counter_card' | 'counter_upi' | 'online_upi' | 'online_card';
  items: Array<{
    menuItemId: string;         // DB UUID — server fetches name, image, price
    quantity:   number;
  }>;
}

