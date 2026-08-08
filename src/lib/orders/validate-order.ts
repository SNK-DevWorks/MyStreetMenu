import { z } from 'zod';

// ── Order Item Payload ────────────────────────────────────────────────────────
//
// Security: browser sends ONLY menuItemId + quantity.
// Server fetches name, image, and price from menu_items DB.
// This prevents client-side price/name/image manipulation.

export const orderItemInputSchema = z.object({
  menuItemId: z.string().uuid('Invalid item ID'),
  quantity:   z.number().int().min(1, 'Quantity must be at least 1').max(50, 'Max 50 per item'),
});

// ── Place Order Payload ───────────────────────────────────────────────────────
//
// Security notes:
//   - shopSlug (not shopId): server resolves slug → shopId. Browser never nominates a shopId.
//   - customerUserId is NOT in this schema — it is resolved server-side from the auth session.
//   - items contain only menuItemId + quantity — no price, name, or image from browser.

export const placeOrderSchema = z.object({
  shopSlug:     z.string().min(1, 'Shop slug required').max(100),
  orderSource:  z.enum(['qr', 'direct_link', 'manual', 'admin']).default('direct_link'),

  // Customer info — all optional
  customerName:  z.string().max(100).optional(),
  customerPhone: z.string().max(20).optional(),

  // Table — tableUuid is the UUID from ?t= param, validated server-side in Order Service
  tableUuid:   z.string().uuid().optional(),  // from QR scan
  tableLabel:  z.string().max(50).optional(), // fallback for manual/walk-in orders
  customerNotes: z.string().max(500).optional(),

  // Payment — defaults to counter_cash
  paymentMethod: z
    .enum(['counter_cash', 'counter_card', 'counter_upi', 'online_upi', 'online_card'])
    .default('counter_cash'),

  // Items — at least one required; server fetches price/name/image from DB
  items: z.array(orderItemInputSchema).min(1, 'Order must have at least one item').max(50),
});


export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;
export type OrderItemInput  = z.infer<typeof orderItemInputSchema>;

// ── Update Status Payload ─────────────────────────────────────────────────────

export const updateOrderStatusSchema = z.object({
  orderId: z.string().uuid('Invalid order ID'),
  status:  z.enum(['new', 'preparing', 'ready', 'completed', 'cancelled']),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

