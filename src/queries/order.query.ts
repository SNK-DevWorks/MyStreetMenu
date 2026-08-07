import { eq, inArray, asc, desc, and, count, sum } from 'drizzle-orm';
import { db } from '@/lib/db';
import { orders } from '../../drizzle/schema/orders';
import { orderItems } from '../../drizzle/schema/order-items';
import type { LiveOrder } from '@/types/order';
import type { OrderStatus } from '@/lib/orders/order-status';

/**
 * Complex join query: live orders with items for a shop.
 * Optimized for real-time vendor view — no pagination, oldest first.
 */
export async function getLiveOrdersQuery(shopId: string): Promise<LiveOrder[]> {
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

  return orderRows.map((order) => ({
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
    items: (itemsByOrder[order.id] ?? []).map((i) => ({
      id:         i.id,
      menuItemId: i.menuItemId ?? null,
      name:       i.name,
      image:      i.image ?? null,
      price:      parseFloat(i.price),
      quantity:   i.quantity,
    })),
  }));
}

/**
 * Completed/cancelled orders — paginated, newest first.
 */
export async function getOrderHistoryQuery(
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

  return orderRows.map((order) => ({
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
    items: (itemsByOrder[order.id] ?? []).map((i) => ({
      id:         i.id,
      menuItemId: i.menuItemId ?? null,
      name:       i.name,
      image:      i.image ?? null,
      price:      parseFloat(i.price),
      quantity:   i.quantity,
    })),
  }));
}

/**
 * Order stats for a shop — used for analytics dashboard.
 * Independent from live/history views.
 */
export async function getOrderStatsQuery(shopId: string) {
  const [stats] = await db
    .select({
      totalOrders:    count(orders.id),
      totalRevenue:   sum(orders.total),
    })
    .from(orders)
    .where(and(eq(orders.shopId, shopId), eq(orders.status, 'completed')));

  return {
    totalOrders:  stats?.totalOrders ?? 0,
    totalRevenue: parseFloat(stats?.totalRevenue ?? '0'),
  };
}
