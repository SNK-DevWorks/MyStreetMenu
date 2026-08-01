import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { eq } from 'drizzle-orm';
import { getR2Client, getR2Bucket } from '@/lib/r2/r2';
import { getPublicMenuSnapshot } from '@/queries';
import { db } from '@/lib/db';
import { shops } from '../../drizzle/schema/shops';
import type { PublishStatus } from '../../drizzle/schema/shops';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Semver-style schema version. Bump this if the JSON shape has breaking changes. */
const SCHEMA_VERSION = 1 as const;

/** R2 object key for a shop's published menu JSON. Uses shopId (UUID) — never slug. */
const getR2Key = (shopId: string) => `published/menus/${shopId}.json`;

// ─── Retry Utility ────────────────────────────────────────────────────────────

/**
 * Retries an async operation up to `maxAttempts` times with exponential backoff.
 * Most R2 / network failures are transient — this catches them before marking a
 * shop as "failed."
 *
 * Attempt delays: 500ms → 1000ms → 2000ms
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 500,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

// ─── Status Helpers ───────────────────────────────────────────────────────────

async function setPublishStatus(shopId: string, status: PublishStatus, publishedAt?: Date) {
  await db
    .update(shops)
    .set({
      publishStatus: status,
      ...(publishedAt ? { lastPublishedAt: publishedAt } : {}),
      updatedAt: new Date(),
    })
    .where(eq(shops.id, shopId));
}

// ─── Published JSON Shape ─────────────────────────────────────────────────────

export interface PublishedMenu {
  /** Schema version — bump when the shape has breaking changes. */
  version: typeof SCHEMA_VERSION;
  publishedAt: string;
  shop: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    coverImage: string | null;
    foodType: string | null;
    phone: string | null;
    whatsapp: string | null;
    address: string | null;
    mapUrl: string | null;
    openingHours: unknown;
    theme: string | null;
  };
  categories: Array<{
    id: string;
    name: string;
    sortOrder: number;
    items: Array<{
      id: string;
      name: string;
      slug: string;
      description: string | null;
      price: string;
      imageUrl: string | null;
      foodType: string;
      isBestSeller: boolean;
      isSoldOut: boolean;
      isTodaysSpecial: boolean;
      sortOrder: number;
    }>;
  }>;
  promotions: Array<{
    id: string;
    type: string;
    title: string;
    description: string | null;
    startDate: string | null;
    endDate: string | null;
  }>;
  meta: {
    totalItems: number;
    totalCategories: number;
    hasPromotions: boolean;
    hasBestSellers: boolean;
    hasTodaysSpecials: boolean;
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const publishService = {
  /**
   * Publishes (or un-publishes) a shop's public menu to Cloudflare R2.
   *
   * Behaviour:
   *   - public + active  → PutObject: writes/replaces the JSON file in R2
   *   - private or inactive → DeleteObject: removes the file so the CDN returns 404
   *
   * Retries the R2 upload up to 3 times (exponential backoff: 500ms → 1s → 2s).
   * Updates `publishStatus` and `lastPublishedAt` on the shops row throughout.
   *
   * Throws on permanent failure so the fire-and-forget wrapper can log cleanly.
   */
  async publishMenu(shopId: string): Promise<void> {
    // Mark as in-progress immediately
    await setPublishStatus(shopId, 'publishing');

    try {
      const snapshot = await getPublicMenuSnapshot(shopId);

      // Shop deleted out from under us — nothing to do
      if (!snapshot) {
        await setPublishStatus(shopId, 'idle');
        return;
      }

      const { shop } = snapshot;

      // ── Un-publish path ───────────────────────────────────────────────────
      if (shop.menuVisibility === 'private' || !shop.isActive) {
        await withRetry(() =>
          getR2Client().send(
            new DeleteObjectCommand({
              Bucket: getR2Bucket(),
              Key: getR2Key(shopId),
            }),
          ),
        );
        await setPublishStatus(shopId, 'idle');
        return;
      }

      // ── Publish path ──────────────────────────────────────────────────────
      const publishedAt = new Date();

      const totalItems = snapshot.allItems.length;
      const payload: PublishedMenu = {
        version: SCHEMA_VERSION,
        publishedAt: publishedAt.toISOString(),
        shop: {
          id: shop.id,
          name: shop.name,
          slug: shop.slug,
          logoUrl: shop.logoUrl ?? null,
          coverImage: shop.coverImage ?? null,
          foodType: shop.foodType ?? null,
          phone: shop.phone ?? null,
          whatsapp: shop.whatsapp ?? null,
          address: shop.address ?? null,
          mapUrl: shop.mapUrl ?? null,
          openingHours: shop.openingHours ?? null,
          theme: shop.theme ?? null,
        },
        categories: snapshot.categories.map((cat) => ({
          id: cat.id,
          name: cat.name,
          sortOrder: cat.sortOrder,
          items: cat.items.map((item) => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
            description: item.description ?? null,
            price: item.price,
            imageUrl: item.imageUrl ?? null,
            foodType: item.foodType,
            isBestSeller: item.isBestSeller,
            isSoldOut: item.isSoldOut,
            isTodaysSpecial: item.isTodaysSpecial,
            sortOrder: item.sortOrder,
          })),
        })),
        promotions: snapshot.promotions.map((p) => ({
          id: p.id,
          type: p.type,
          title: p.title,
          description: p.description ?? null,
          startDate: p.startDate?.toISOString() ?? null,
          endDate: p.endDate?.toISOString() ?? null,
        })),
        meta: {
          totalItems,
          totalCategories: snapshot.categories.length,
          hasPromotions: snapshot.promotions.length > 0,
          hasBestSellers: snapshot.allItems.some((i) => i.isBestSeller),
          hasTodaysSpecials: snapshot.allItems.some((i) => i.isTodaysSpecial),
        },
      };

      const body = JSON.stringify(payload);

      await withRetry(() =>
        getR2Client().send(
          new PutObjectCommand({
            Bucket: getR2Bucket(),
            Key: getR2Key(shopId),
            Body: body,
            ContentType: 'application/json',
            // 60s fresh, 5-min stale-while-revalidate for resilience during peak traffic
            CacheControl: 'public, max-age=60, stale-while-revalidate=300',
          }),
        ),
      );

      await setPublishStatus(shopId, 'published', publishedAt);

      console.info(`[publishService] Published menu for shop ${shopId} (${totalItems} items)`);
    } catch (error) {
      // All retries exhausted — mark as failed so the dashboard can surface it
      await setPublishStatus(shopId, 'failed').catch(() => {
        // Status update failing is not worth throwing over
      });
      console.error(`[publishService] Failed to publish menu for shop ${shopId}:`, error);
      throw error;
    }
  },

  /**
   * Fire-and-forget wrapper used by Server Actions.
   *
   * The vendor's action returns immediately after the DB write.
   * The publish runs in the background without blocking the response.
   * Errors are fully handled inside publishMenu — nothing escapes here.
   */
  publishMenuBackground(shopId: string): void {
    void this.publishMenu(shopId).catch((error) => {
      // publishMenu already logs — this catch is a safety net
      console.error(`[publishService] Unhandled background publish error for ${shopId}:`, error);
    });
  },

  /**
   * Removes the published menu from R2 entirely.
   * Called when a shop is permanently deleted.
   */
  async deletePublishedMenu(shopId: string): Promise<void> {
    try {
      await withRetry(() =>
        getR2Client().send(
          new DeleteObjectCommand({
            Bucket: getR2Bucket(),
            Key: getR2Key(shopId),
          }),
        ),
      );
    } catch (error) {
      console.error(`[publishService] Failed to delete published menu for shop ${shopId}:`, error);
    }
  },
};
