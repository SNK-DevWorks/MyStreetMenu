import { z } from 'zod';

// ── Order Item Payload ────────────────────────────────────────────────────────

export const orderItemInputSchema = z.object({
  menuItemId: z.string().uuid().nullable().optional(),
  name:       z.string().min(1, 'Item name required'),
  image:      z.string().nullable().optional(),
  price:      z.number().min(0, 'Price must be positive'),
  quantity:   z.number().int().min(1, 'Quantity must be at least 1'),
});

// ── Place Order Payload ───────────────────────────────────────────────────────

export const placeOrderSchema = z.object({
  shopId:       z.string().uuid('Invalid shop'),
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

  // Items — at least one required
  items: z.array(orderItemInputSchema).min(1, 'Order must have at least one item'),
});


export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;
export type OrderItemInput  = z.infer<typeof orderItemInputSchema>;

// ── Update Status Payload ─────────────────────────────────────────────────────

export const updateOrderStatusSchema = z.object({
  orderId: z.string().uuid('Invalid order ID'),
  status:  z.enum(['new', 'preparing', 'ready', 'completed', 'cancelled']),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
