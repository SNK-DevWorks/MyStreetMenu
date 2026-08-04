import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { eq } from 'drizzle-orm';
import { getR2Client, getR2Bucket } from '@/lib/r2/r2';
import { getPublicMenuSnapshot } from '@/queries';
import { db } from '@/lib/db';
import { shops } from '../../drizzle/schema/shops';
import type { PublishStatus } from '../../drizzle/schema/shops';
import type { Promotion, ResolvedOffer } from '../../drizzle/schema/promotions';
import { getOfferImage } from '@/lib/images';

// ─── Constants ────────────────────────────────────────────────────────────────

const SCHEMA_VERSION = 2 as const;
const getR2Key = (shopId: string) => `published/menus/${shopId}.json`;

// ─── Retry Utility ────────────────────────────────────────────────────────────

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
        await new Promise((resolve) => setTimeout(resolve, baseDelayMs * Math.pow(2, attempt - 1)));
      }
    }
  }
  throw lastError;
}

// ─── Status Helpers ───────────────────────────────────────────────────────────

async function setPublishStatus(shopId: string, status: PublishStatus, publishedAt?: Date) {
  await db
    .update(shops)
    .set({ publishStatus: status, ...(publishedAt ? { lastPublishedAt: publishedAt } : {}), updatedAt: new Date() })
    .where(eq(shops.id, shopId));
}

// ─── Offer Resolution ─────────────────────────────────────────────────────────

/** Generate a human-readable badge string from an offer */
function buildBadge(offerType: string, offerValue: number): string {
  switch (offerType) {
    case 'percentage': return `${offerValue}% OFF`;
    case 'flat':       return `₹${offerValue} OFF`;
    case 'bxgy':       return offerValue === 1 ? 'Buy 1 Get 1' : `Buy ${offerValue} Get ${offerValue}`;
    default:           return 'Offer';
  }
}

/**
 * Resolves which single offer applies to each item, enforcing:
 *   Specificity: Item > Category > All
 *   Tie-break:   priority DESC → createdAt DESC (most recent wins)
 *
 * Returns a Map<itemId, ResolvedOffer>
 */
function resolveOffersForItems(
  items: Array<{ id: string; categoryId: string; price: string }>,
  offers: Promotion[],
): Map<string, ResolvedOffer> {
  const result = new Map<string, ResolvedOffer>();

  // Only process active 'offer' type promotions with a valid offerType
  const activeOffers = offers.filter(
    (o) => o.isActive && o.type === 'offer' && o.offerType,
  );

  // Specificity scoring: item=3, category=2, all=1
  const specificityScore = (targetType: string | null | undefined): number => {
    if (targetType === 'item') return 3;
    if (targetType === 'category') return 2;
    return 1; // 'all' or null
  };

  for (const item of items) {
    // Collect all offers that apply to this item
    const applicable = activeOffers.filter((o) => {
      const tt = o.targetType ?? 'all';
      if (tt === 'all') return true;
      if (tt === 'category') return o.targetIds?.includes(item.categoryId) ?? false;
      if (tt === 'item') return o.targetIds?.includes(item.id) ?? false;
      return false;
    });

    if (applicable.length === 0) continue;

    // Sort: specificity DESC → priority DESC → createdAt DESC
    applicable.sort((a, b) => {
      const specDiff = specificityScore(b.targetType) - specificityScore(a.targetType);
      if (specDiff !== 0) return specDiff;
      const priDiff = (b.priority ?? 0) - (a.priority ?? 0);
      if (priDiff !== 0) return priDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const winner = applicable[0];
    const value = parseFloat(winner.offerValue ?? '0');

    result.set(item.id, {
      id: winner.id,
      title: winner.title,
      type: winner.offerType as ResolvedOffer['type'],
      value,
      badge: buildBadge(winner.offerType!, value),
    });
  }

  return result;
}

/** Calculate final price from original price + resolved offer */
function calculatePrice(
  originalPrice: string,
  resolvedOffer: ResolvedOffer | undefined,
): { original: number; final: number; hasDiscount: boolean } {
  const original = parseFloat(originalPrice);
  if (!resolvedOffer || resolvedOffer.type === 'bxgy') {
    return { original, final: original, hasDiscount: false };
  }
  let final = original;
  if (resolvedOffer.type === 'percentage') {
    final = Math.round(original * (1 - resolvedOffer.value / 100));
  } else if (resolvedOffer.type === 'flat') {
    final = Math.max(0, original - resolvedOffer.value);
  }
  return { original, final, hasDiscount: final !== original };
}

// ─── Published JSON Shape ─────────────────────────────────────────────────────

export interface PublishedPrice {
  original: number;
  final: number;
  hasDiscount: boolean;
}

export interface PublishedItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  /** Structured price — public menu renders these directly, no calculation needed */
  price: PublishedPrice;
  imageUrl: string | null;
  foodType: string;
  isBestSeller: boolean;
  isSoldOut: boolean;
  isTodaysSpecial: boolean;
  sortOrder: number;
  /** Single resolved offer or null — pre-computed at publish time */
  resolvedOffer: ResolvedOffer | null;
}

export interface PublishedOfferStrip {
  id: string;
  title: string;
  badge: string;
  type: string;
  targetType: string;
  /** How many items/categories are targeted */
  targetCount: number;
  /** Resolved category or item names (e.g. ["Burgers", "Drinks"]) */
  targetNames?: string[];
  startTime: string | null;
  endTime: string | null;
  /**
   * Structured banner — fully-resolved CDN URL at publish time.
   * null when no banner was uploaded (card uses gradient default).
   */
  banner: { image: string; alt: string } | null;
}

export interface PublishedMenu {
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
    items: PublishedItem[];
  }>;
  /** Top-level offers for the Offers Strip UI */
  offers: PublishedOfferStrip[];
  /** Legacy: announcements & other promotions (non-offer type) */
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
    hasOffers: boolean;
    hasPromotions: boolean;
    hasBestSellers: boolean;
    hasTodaysSpecials: boolean;
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const publishService = {
  async publishMenu(shopId: string): Promise<void> {
    await setPublishStatus(shopId, 'publishing');

    try {
      const snapshot = await getPublicMenuSnapshot(shopId);

      if (!snapshot) {
        await setPublishStatus(shopId, 'idle');
        return;
      }

      const { shop } = snapshot;

      // ── Un-publish path ───────────────────────────────────────────────────
      if (shop.menuVisibility === 'private' || !shop.isActive) {
        await withRetry(() =>
          getR2Client().send(
            new DeleteObjectCommand({ Bucket: getR2Bucket(), Key: getR2Key(shopId) }),
          ),
        );
        await setPublishStatus(shopId, 'idle');
        return;
      }

      // ── Resolve offers for all items at publish time ──────────────────────
      const offerResolutionMap = resolveOffersForItems(snapshot.allItems, snapshot.promotions);

      const publishedAt = new Date();
      const totalItems = snapshot.allItems.length;

      // ── Build top-level offers strip ──────────────────────────────────────
      const activeOffers = snapshot.promotions.filter(
        (p) => p.isActive && p.type === 'offer' && p.offerType,
      );

      const offersStrip: PublishedOfferStrip[] = activeOffers.map((o) => {
        const value = parseFloat(o.offerValue ?? '0');
        const targetCount =
          o.targetType === 'all'
            ? totalItems
            : (o.targetIds?.length ?? 0);

        // Resolve target names for categories or items
        let targetNames: string[] = [];
        if (o.targetType === 'category' && o.targetIds?.length) {
          targetNames = snapshot.categories
            .filter((c) => o.targetIds!.includes(c.id))
            .map((c) => c.name);
        } else if (o.targetType === 'item' && o.targetIds?.length) {
          targetNames = snapshot.allItems
            .filter((i) => o.targetIds!.includes(i.id))
            .map((i) => i.name);
        }

        // Resolve banner CDN URL at publish time (CDN-first — public menu gets full URL)
        const bannerCdnUrl = o.bannerImage ? getOfferImage(o.bannerImage) : null;

        return {
          id: o.id,
          title: o.title,
          badge: buildBadge(o.offerType!, value),
          type: o.offerType!,
          targetType: o.targetType ?? 'all',
          targetCount,
          targetNames,
          startTime: o.startTime ?? null,
          endTime: o.endTime ?? null,
          banner: bannerCdnUrl ? { image: bannerCdnUrl, alt: o.title } : null,
        };
      });

      // ── Build payload ─────────────────────────────────────────────────────
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
          items: cat.items.map((item) => {
            const resolved = offerResolutionMap.get(item.id);
            return {
              id: item.id,
              name: item.name,
              slug: item.slug,
              description: item.description ?? null,
              price: calculatePrice(item.price, resolved),
              imageUrl: item.imageUrl ?? null,
              foodType: item.foodType,
              isBestSeller: item.isBestSeller,
              isSoldOut: item.isSoldOut,
              isTodaysSpecial: item.isTodaysSpecial,
              sortOrder: item.sortOrder,
              resolvedOffer: resolved ?? null,
            };
          }),
        })),
        offers: offersStrip,
        promotions: snapshot.promotions
          .filter((p) => p.type !== 'offer')
          .map((p) => ({
            id: p.id,
            type: p.type,
            title: p.title,
            description: p.description ?? null,
            startDate: p.startDate ?? null,
            endDate: p.endDate ?? null,
          })),
        meta: {
          totalItems,
          totalCategories: snapshot.categories.length,
          hasOffers: offersStrip.length > 0,
          hasPromotions: snapshot.promotions.filter((p) => p.type !== 'offer').length > 0,
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
            CacheControl: 'public, max-age=60, stale-while-revalidate=300',
          }),
        ),
      );

      await setPublishStatus(shopId, 'published', publishedAt);
      console.info(`[publishService] Published menu for shop ${shopId} (${totalItems} items, ${offersStrip.length} offers)`);
    } catch (error) {
      await setPublishStatus(shopId, 'failed').catch(() => {});
      console.error(`[publishService] Failed to publish menu for shop ${shopId}:`, error);
      throw error;
    }
  },

  /**
   * Fire-and-forget wrapper used by Server Actions.
   * The vendor's action returns immediately after the DB write.
   * The publish runs in the background without blocking the response.
   */
  publishMenuBackground(shopId: string): void {
    void this.publishMenu(shopId).catch((error) => {
      console.error(`[publishService] Unhandled background publish error for ${shopId}:`, error);
    });
  },

  async deletePublishedMenu(shopId: string): Promise<void> {
    try {
      await withRetry(() =>
        getR2Client().send(
          new DeleteObjectCommand({ Bucket: getR2Bucket(), Key: getR2Key(shopId) }),
        ),
      );
    } catch (error) {
      console.error(`[publishService] Failed to delete published menu for shop ${shopId}:`, error);
    }
  },
};
