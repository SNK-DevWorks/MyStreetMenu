import { eq, and, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { itemLikes } from '../../drizzle/schema/item-likes';
import { itemLikeCounts } from '../../drizzle/schema/item-like-counts';
import { analyticsEvents } from '../../drizzle/schema/analytics-events';

export const likeRepository = {
  /**
   * Insert a unique like record inside a transaction.
   * Returns true if inserted, false if already exists (conflict).
   */
  async insertLike(
    tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
    shopId: string,
    itemId: string,
    visitorId: string
  ): Promise<boolean> {
    const res = await tx
      .insert(itemLikes)
      .values({ shopId, itemId, visitorId })
      .onConflictDoNothing({
        target: [itemLikes.shopId, itemLikes.itemId, itemLikes.visitorId],
      })
      .returning({ id: itemLikes.id });

    return res.length > 0;
  },

  /**
   * Delete a like record inside a transaction for unliking.
   * Returns true if deleted, false if did not exist.
   */
  async deleteLike(
    tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
    shopId: string,
    itemId: string,
    visitorId: string
  ): Promise<boolean> {
    const res = await tx
      .delete(itemLikes)
      .where(
        and(
          eq(itemLikes.shopId, shopId),
          eq(itemLikes.itemId, itemId),
          eq(itemLikes.visitorId, visitorId)
        )
      )
      .returning({ id: itemLikes.id });

    return res.length > 0;
  },

  /**
   * Record a like_click event in analytics_events history table.
   */
  async recordAnalyticsLikeEvent(
    tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
    shopId: string,
    itemId: string,
    visitorId: string
  ): Promise<void> {
    const utcDate = new Date().toISOString().slice(0, 10);
    const dedupKey = `${visitorId}|like_click|${itemId}|${utcDate}`;

    await tx.insert(analyticsEvents).values({
      shopId,
      visitorId,
      eventType: 'like_click',
      dedupKey,
      metadata: { itemId, occurredAt: new Date().toISOString() },
    });
  },

  /**
   * Upsert and increment item_like_counts by 1 inside a transaction.
   * Returns the updated aggregate count directly from DB.
   */
  async upsertAndIncrementLikeCount(
    tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
    shopId: string,
    itemId: string
  ): Promise<number> {
    const [row] = await tx
      .insert(itemLikeCounts)
      .values({ shopId, itemId, likes: 1 })
      .onConflictDoUpdate({
        target: [itemLikeCounts.shopId, itemLikeCounts.itemId],
        set: {
          likes: sql`${itemLikeCounts.likes} + 1`,
          updatedAt: new Date(),
        },
      })
      .returning({ likes: itemLikeCounts.likes });

    return row?.likes ?? 0;
  },

  /**
   * Decrement item_like_counts by 1 inside a transaction (capped at 0).
   * Returns the updated aggregate count directly from DB.
   */
  async decrementLikeCount(
    tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
    shopId: string,
    itemId: string
  ): Promise<number> {
    const [row] = await tx
      .update(itemLikeCounts)
      .set({
        likes: sql`GREATEST(${itemLikeCounts.likes} - 1, 0)`,
        updatedAt: new Date(),
      })
      .where(and(eq(itemLikeCounts.shopId, shopId), eq(itemLikeCounts.itemId, itemId)))
      .returning({ likes: itemLikeCounts.likes });

    return row?.likes ?? 0;
  },

  /**
   * Fetch current like count for a single item.
   */
  async getItemLikeCount(
    client: typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0],
    shopId: string,
    itemId: string
  ): Promise<number> {
    const [row] = await client
      .select({ likes: itemLikeCounts.likes })
      .from(itemLikeCounts)
      .where(and(eq(itemLikeCounts.shopId, shopId), eq(itemLikeCounts.itemId, itemId)));

    return row?.likes ?? 0;
  },

  /**
   * Fetch all aggregate like counts for a shop as a Record<itemId, count>.
   */
  async getLikeCountsForShop(shopId: string): Promise<Record<string, number>> {
    const rows = await db
      .select({ itemId: itemLikeCounts.itemId, likes: itemLikeCounts.likes })
      .from(itemLikeCounts)
      .where(eq(itemLikeCounts.shopId, shopId));

    const map: Record<string, number> = {};
    for (const r of rows) {
      map[r.itemId] = r.likes;
    }
    return map;
  },

  /**
   * Fetch array of itemIds liked by a specific visitor in a shop.
   */
  async getLikedItemsForVisitor(shopId: string, visitorId: string): Promise<string[]> {
    if (!visitorId) return [];

    const rows = await db
      .select({ itemId: itemLikes.itemId })
      .from(itemLikes)
      .where(and(eq(itemLikes.shopId, shopId), eq(itemLikes.visitorId, visitorId)));

    return rows.map((r) => r.itemId);
  },
};
