import { eq, inArray } from 'drizzle-orm';
import { db } from '@/lib/db';
import { menuItems } from '../../drizzle/schema/menu-items';
import { shopRepository } from '@/repositories';
import { orderRepository } from '@/repositories/order.repository';
import { tableService } from '@/services/table.service';
import { generateToken } from '@/lib/orders/generate-token';
import { calculateSubtotal, calculateTotal, toDecimalString } from '@/lib/orders/calculate-total';
import { isValidTransition } from '@/lib/orders/order-status';
import { getMenuImage } from '@/lib/images';
import type { PlaceOrderPayload, LiveOrder, PlacedOrderResult } from '@/types/order';
import type { OrderStatus } from '@/lib/orders/order-status';

export const orderService = {
  /**
   * Place a new order.
   *
   * Security-first flow:
   *   1. Resolve shopSlug → shopId (browser never sends shopId directly)
   *   2. Reject if customerUserId is null (no anonymous session)
   *   3. Fetch menu items from DB — name, image, price are snapshots from DB, not browser
   *   4. Validate each item: exists, belongs to this shop, not sold out
   *   5. Calculate subtotal + total from DB prices only
   *   6. Resolve table UUID → tableId + tableLabel snapshot
   *   7. Generate race-condition-safe token
   *   8. Insert order + items in one transaction
   */
  async placeOrder(payload: PlaceOrderPayload): Promise<PlacedOrderResult> {
    // ── 1. Resolve shop from slug ────────────────────────────────────────────
    const shop = await shopRepository.findBySlug(payload.shopSlug);
    if (!shop) throw new Error('Shop not found');
    if (!shop.isActive) throw new Error('This shop is currently unavailable');

    // ── 2. Require authenticated customer identity ───────────────────────────
    if (!payload.customerUserId) {
      throw new Error('No active customer session. Please refresh and try again.');
    }

    // ── 3. Fetch menu items from DB — batch fetch all requested item IDs ─────
    const requestedIds = payload.items.map((i) => i.menuItemId);

    const dbItems = await db
      .select()
      .from(menuItems)
      .where(inArray(menuItems.id, requestedIds));

    // Build a map for O(1) lookup
    const dbItemMap = new Map(dbItems.map((item) => [item.id, item]));

    // ── 4. Validate each item ────────────────────────────────────────────────
    const resolvedItems: Array<{
      menuItemId: string;
      name:       string;
      image:      string | null;
      price:      string;
      quantity:   number;
    }> = [];

    for (const requested of payload.items) {
      const dbItem = dbItemMap.get(requested.menuItemId);

      // Item must exist
      if (!dbItem) {
        throw new Error(`Menu item not found. Please refresh and try again.`);
      }

      // Item must belong to this shop (prevents cross-shop attack)
      if (dbItem.shopId !== shop.id) {
        throw new Error(`Item does not belong to this shop.`);
      }

      // Item must not be sold out
      if (dbItem.isSoldOut) {
        throw new Error(`"${dbItem.name}" is currently unavailable. Please remove it from your cart.`);
      }

      resolvedItems.push({
        menuItemId: dbItem.id,
        name:       dbItem.name,
        image:      dbItem.imageUrl ? (getMenuImage(dbItem.imageUrl) || dbItem.imageUrl) : null,
        price:      dbItem.price,       // DB value — numeric string e.g. "299.00"
        quantity:   requested.quantity,
      });

    }

    // ── 5. Calculate totals from DB prices ───────────────────────────────────
    const subtotal = calculateSubtotal(
      resolvedItems.map((i) => ({ price: parseFloat(i.price), quantity: i.quantity }))
    );
    const total = calculateTotal(subtotal, 0);

    // ── 6. Table resolution ──────────────────────────────────────────────────
    let resolvedTableId:    string | null = null;
    let resolvedTableLabel: string | null = null;

    if (payload.tableUuid) {
      const table = await tableService.resolveTable(shop.id, payload.tableUuid);
      if (table) {
        resolvedTableId    = table.id;
        resolvedTableLabel = table.label;
      } else {
        // Tampered / deleted table → silent fallback
        resolvedTableLabel = 'Counter';
      }
    } else if (payload.tableLabel) {
      resolvedTableLabel = payload.tableLabel;
    }

    // ── 7. Generate token ────────────────────────────────────────────────────
    const token = await generateToken(shop.id);

    // ── 8. Insert order + items ──────────────────────────────────────────────
    const order = await orderRepository.create(
      {
        shopId:         shop.id,
        customerUserId: payload.customerUserId,
        token,
        status:         'new',
        customerName:   payload.customerName  ?? null,
        customerPhone:  payload.customerPhone ?? null,
        tableId:        resolvedTableId,
        tableLabel:     resolvedTableLabel,
        customerNotes:  payload.customerNotes ?? null,
        paymentMethod:  payload.paymentMethod ?? 'counter_cash',
        paymentStatus:  'pending',
        orderSource:    payload.orderSource,
        subtotal:       toDecimalString(subtotal),
        discount:       '0.00',
        total:          toDecimalString(total),
      },
      resolvedItems,
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
