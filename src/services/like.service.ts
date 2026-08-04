import { db } from '@/lib/db';
import { likeRepository } from '@/repositories/like.repository';

export interface LikeResponse {
  liked: boolean;
  isLiked: boolean;
  alreadyLiked: boolean;
  likes: number;
}

export interface PublicSocialSnapshot {
  likeCounts: Record<string, number>;
  likedItems: string[];
}

export const likeService = {
  /**
   * High-level transaction workflow to like a menu item.
   * Runs atomically inside a database transaction:
   *  1. Inserts into item_likes ON CONFLICT DO NOTHING.
   *  2. If duplicate conflict -> returns existing count without incrementing.
   *  3. If newly inserted -> inserts analytics_event (like_click), upserts item_like_counts (+1), and returns updated count.
   */
  async likeMenuItem({
    shopId,
    itemId,
    visitorId,
  }: {
    shopId: string;
    itemId: string;
    visitorId: string;
  }): Promise<LikeResponse> {
    if (!shopId || !itemId || !visitorId) {
      throw new Error('shopId, itemId, and visitorId are required');
    }

    return await db.transaction(async (tx) => {
      const inserted = await likeRepository.insertLike(tx, shopId, itemId, visitorId);

      if (!inserted) {
        // Already liked by this visitor — return current count without incrementing
        const currentLikes = await likeRepository.getItemLikeCount(tx, shopId, itemId);
        return {
          liked: true,
          isLiked: true,
          alreadyLiked: true,
          likes: currentLikes,
        };
      }

      // Newly inserted like: record analytics event + increment aggregate count
      await likeRepository.recordAnalyticsLikeEvent(tx, shopId, itemId, visitorId);
      const newLikes = await likeRepository.upsertAndIncrementLikeCount(tx, shopId, itemId);

      return {
        liked: true,
        isLiked: true,
        alreadyLiked: false,
        likes: newLikes,
      };
    });
  },

  /**
   * Future-proof workflow to unlike a menu item.
   * Runs atomically inside a database transaction.
   */
  async unlikeMenuItem({
    shopId,
    itemId,
    visitorId,
  }: {
    shopId: string;
    itemId: string;
    visitorId: string;
  }): Promise<LikeResponse> {
    if (!shopId || !itemId || !visitorId) {
      throw new Error('shopId, itemId, and visitorId are required');
    }

    return await db.transaction(async (tx) => {
      const deleted = await likeRepository.deleteLike(tx, shopId, itemId, visitorId);

      if (!deleted) {
        // Was not liked — return current count
        const currentLikes = await likeRepository.getItemLikeCount(tx, shopId, itemId);
        return {
          liked: false,
          isLiked: false,
          alreadyLiked: false,
          likes: currentLikes,
        };
      }

      // Decrement aggregate count
      const newLikes = await likeRepository.decrementLikeCount(tx, shopId, itemId);

      return {
        liked: false,
        isLiked: false,
        alreadyLiked: false,
        likes: newLikes,
      };
    });
  },

  /**
   * Get public social snapshot for a shop and optional visitorId.
   * Returns aggregate likeCounts map and array of items liked by visitor.
   */
  async getPublicSocialSnapshot({
    shopId,
    visitorId,
  }: {
    shopId: string;
    visitorId?: string | null;
  }): Promise<PublicSocialSnapshot> {
    if (!shopId) {
      throw new Error('shopId is required');
    }

    const [likeCounts, likedItems] = await Promise.all([
      likeRepository.getLikeCountsForShop(shopId),
      visitorId ? likeRepository.getLikedItemsForVisitor(shopId, visitorId) : Promise.resolve([]),
    ]);

    return {
      likeCounts,
      likedItems,
    };
  },
};
