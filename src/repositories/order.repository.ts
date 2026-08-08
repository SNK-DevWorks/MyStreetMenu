import { eq, inArray, asc, desc, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { orders } from '../../drizzle/schema/orders';
import { orderItems } from '../../drizzle/schema/order-items';
import type { NewOrder, Order } from '../../drizzle/schema/orders';
import type { NewOrderItem } from '../../drizzle/schema/order-items';
import type { OrderStatus } from '@/lib/orders/order-status';
import { getMenuImage } from '@/lib/images';
import type { LiveOrder } from '@/types/order';
import { STATUS_TIMESTAMPS } from '@/lib/orders/order-status';

function mapToLiveOrder(order: Order, items: typeof orderItems.$inferSelect[]): LiveOrder {
  return {
    id:           order.id,
    shopId:       order.shopId,
    token:        order.token,
    status:       order.status as OrderStatus,
    customerName:  order.customerName,
    customerPhone: order.customerPhone,
    tableId:       order.tableId ?? null,
    tableLabel:    order.tableLabel,
    customerNotes: order.customerNotes,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    orderSource:   order.orderSource,
    subtotal: parseFloat(order.subtotal ?? '0'),
    discount: parseFloat(order.discount ?? '0'),
    total:    parseFloat(order.total ?? '0'),
    placedAt:    order.placedAt,
    preparingAt: order.preparingAt ?? null,
    readyAt:     order.readyAt ?? null,
    completedAt: order.completedAt ?? null,
    items: items.map((i) => ({
      id:         i.id,
      menuItemId: i.menuItemId ?? null,
      name:       i.name,
      image:      i.image ? (getMenuImage(i.image) || i.image) : null,
      price:      parseFloat(i.price),
      quantity:   i.quantity,
    })),
  };
}


export const orderRepository = {
  /**
   * Insert a new order + its items in a single transaction.
   */
  async create(orderData: NewOrder, itemsData: Omit<NewOrderItem, 'orderId'>[]): Promise<Order> {
    return await db.transaction(async (tx) => {
      const [order] = await tx.insert(orders).values(orderData).returning();
      if (itemsData.length > 0) {
        await tx.insert(orderItems).values(
          itemsData.map((item) => ({ ...item, orderId: order.id })),
        );
      }
      return order;
    });
  },

  /**
   * Find a single order by ID (no items).
   */
  async findById(id: string): Promise<Order | null> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order ?? null;
  },

  /**
   * Find an order with its items hydrated.
   */
  async findWithItems(id: string): Promise<LiveOrder | null> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return null;
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
    return mapToLiveOrder(order, items);
  },

  /**
   * Fetch live orders (new, preparing, ready) for a shop with items.
   * Ordered oldest-first so vendors see urgent orders at top.
   */
  async findLiveByShopId(shopId: string): Promise<LiveOrder[]> {
    const liveStatuses: OrderStatus[] = ['new', 'preparing', 'ready'];
    const orderRows = await db
      .select()
      .from(orders)
      .where(and(eq(orders.shopId, shopId), inArray(orders.status, liveStatuses)))
      .orderBy(asc(orders.placedAt));

    if (orderRows.length === 0) return [];

    const orderIds = orderRows.map((o) => o.id);
    const allItems = await db
      .select()
      .from(orderItems)
      .where(inArray(orderItems.orderId, orderIds));

    const itemsByOrder = allItems.reduce<Record<string, typeof allItems>>((acc, item) => {
      (acc[item.orderId] ??= []).push(item);
      return acc;
    }, {});

    return orderRows.map((order) => mapToLiveOrder(order, itemsByOrder[order.id] ?? []));
  },

  /**
   * Fetch completed/cancelled orders for a shop (paginated).
   */
  async findHistoryByShopId(
    shopId: string,
    { page = 1, limit = 20 }: { page?: number; limit?: number } = {},
  ): Promise<LiveOrder[]> {
    const historyStatuses: OrderStatus[] = ['completed', 'cancelled'];
    const offset = (page - 1) * limit;

    const orderRows = await db
      .select()
      .from(orders)
      .where(and(eq(orders.shopId, shopId), inArray(orders.status, historyStatuses)))
      .orderBy(desc(orders.placedAt))
      .limit(limit)
      .offset(offset);

    if (orderRows.length === 0) return [];

    const orderIds = orderRows.map((o) => o.id);
    const allItems = await db
      .select()
      .from(orderItems)
      .where(inArray(orderItems.orderId, orderIds));

    const itemsByOrder = allItems.reduce<Record<string, typeof allItems>>((acc, item) => {
      (acc[item.orderId] ??= []).push(item);
      return acc;
    }, {});

    return orderRows.map((order) => mapToLiveOrder(order, itemsByOrder[order.id] ?? []));
  },

  /**
   * Update order status and automatically set the corresponding timestamp.
   */
  async updateStatus(id: string, status: OrderStatus): Promise<Order | null> {
    const timestampField = STATUS_TIMESTAMPS[status];
    const now = new Date();

    const updateData: Partial<NewOrder> = {
      status,
      updatedAt: now,
      ...(timestampField ? { [timestampField]: now } : {}),
    };

    const [updated] = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, id))
      .returning();

    return updated ?? null;
  },
};
