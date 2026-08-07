import { shopRepository } from '@/repositories';
import { orderRepository } from '@/repositories/order.repository';
import { tableService } from '@/services/table.service';
import { generateToken } from '@/lib/orders/generate-token';
import { calculateSubtotal, calculateTotal, toDecimalString } from '@/lib/orders/calculate-total';
import { isValidTransition } from '@/lib/orders/order-status';
import type { PlaceOrderPayload, LiveOrder, PlacedOrderResult } from '@/types/order';
import type { OrderStatus } from '@/lib/orders/order-status';

export const orderService = {
  /**
   * Place a new order.
   * - Validates shop exists
   * - Resolves tableUuid → tableId + tableLabel snapshot (single DB call)
   *   Invalid / tampered UUIDs silently fall back to "Counter"
   * - Generates race-condition-safe token
   * - Calculates totals
   * - Inserts order + items in one transaction
   */
  async placeOrder(payload: PlaceOrderPayload): Promise<PlacedOrderResult> {
    const shop = await shopRepository.findById(payload.shopId);
    if (!shop) throw new Error('Shop not found');

    // ── Table resolution (ONE query, ONE validation point) ──────────────────
    let resolvedTableId:    string | null = null;
    let resolvedTableLabel: string | null = null;

    if (payload.tableUuid) {
      // Customer arrived via QR — validate the UUID against this shop's tables
      const table = await tableService.resolveTable(payload.shopId, payload.tableUuid);
      if (table) {
        resolvedTableId    = table.id;
        resolvedTableLabel = `Table ${table.label}`;
      } else {
        // Tampered / deleted table → silent fallback
        // orderSource stays 'qr' — analytics must reflect how customer arrived
        resolvedTableLabel = 'Counter';
      }
    } else if (payload.tableLabel) {
      // Walk-in / manual order with a plain label (no QR validation needed)
      resolvedTableLabel = payload.tableLabel;
    }
    // ─────────────────────────────────────────────────────────────────────────

    const token    = await generateToken(payload.shopId);
    const subtotal = calculateSubtotal(payload.items.map((i) => ({ price: i.price, quantity: i.quantity })));
    const total    = calculateTotal(subtotal, 0);

    const order = await orderRepository.create(
      {
        shopId:        payload.shopId,
        token,
        status:        'new',
        customerName:  payload.customerName  ?? null,
        customerPhone: payload.customerPhone ?? null,
        tableId:       resolvedTableId,
        tableLabel:    resolvedTableLabel,
        customerNotes: payload.customerNotes ?? null,
        paymentMethod: payload.paymentMethod ?? 'counter_cash',
        paymentStatus: 'pending',
        orderSource:   payload.orderSource,
        subtotal:      toDecimalString(subtotal),
        discount:      '0.00',
        total:         toDecimalString(total),
      },
      payload.items.map((item) => ({
        menuItemId: item.menuItemId ?? null,
        name:       item.name,
        image:      item.image      ?? null,
        price:      toDecimalString(item.price),
        quantity:   item.quantity,
      })),
    );

    return {
      orderId:  order.id,
      token:    order.token,
      total,
      placedAt: order.placedAt,
    };
  },

  /**
   * Change an order's status.
   * - Validates vendor owns the shop this order belongs to
   * - Validates the transition is allowed
   */
  async updateStatus(
    userId: string,
    orderId: string,
    status: OrderStatus,
  ): Promise<void> {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new Error('Order not found');

    const shop = await shopRepository.findById(order.shopId);
    if (!shop || shop.userId !== userId) throw new Error('Unauthorized');

    if (!isValidTransition(order.status as OrderStatus, status)) {
      throw new Error(`Cannot transition from ${order.status} to ${status}`);
    }

    await orderRepository.updateStatus(orderId, status);
  },

  /**
   * Get all live (active) orders for a vendor's shop.
   */
  async getLiveOrders(userId: string): Promise<LiveOrder[]> {
    const shop = await shopRepository.findByUserId(userId);
    if (!shop) throw new Error('Shop not found');
    return orderRepository.findLiveByShopId(shop.id);
  },

  /**
   * Get order history (completed / cancelled) for a vendor's shop.
   */
  async getOrderHistory(
    userId: string,
    pagination: { page?: number; limit?: number } = {},
  ): Promise<LiveOrder[]> {
    const shop = await shopRepository.findByUserId(userId);
    if (!shop) throw new Error('Shop not found');
    return orderRepository.findHistoryByShopId(shop.id, pagination);
  },
};
