import type { PublishedMenu, PublishedItem, PublishedOfferStrip } from '@/services/publish.service';
import type { FoodCardItem, ResolvedOfferBadge } from '@/components/shared/item';
import { getMenuImage } from '@/lib/images';

export const PUBLISHED_IMAGE_FALLBACK =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2080&auto=format&fit=crop';

export interface PublicMenuPromotion {
  id: string;
  type: 'announcement' | 'offer' | 'todays_special';
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

/** Offer strip item for the public menu Offers section */
export interface PublicMenuOffer {
  id: string;
  title: string;
  badge: string;
  type: string;
  targetType: string;
  targetCount: number;
  targetNames?: string[];
  startTime: string | null;
  endTime: string | null;
  /**
   * Fully-resolved CDN banner URL — set at publish time in publish.service.ts.
   * null = no banner uploaded; OfferCard falls back to gradient default.
   */
  banner: { image: string; alt: string } | null;
}

export interface PublicMenuViewModel {
  vendorName: string;
  vendorAddress: string;
  phone: string | null;
  whatsapp: string | null;
  mapUrl: string | null;
  items: FoodCardItem[];
  categories: string[];
  /** Active offer strip items (type=offer) */
  offers: PublicMenuOffer[];
  /** Announcements and other non-offer promotions */
  announcements: PublicMenuPromotion[];
  menuVersion: number;
  publishedAt: string;
}

function fromPublishedItem(item: PublishedItem, categoryName: string): FoodCardItem {
  const resolvedOffer: ResolvedOfferBadge | null = item.resolvedOffer
    ? {
        id: item.resolvedOffer.id,
        title: item.resolvedOffer.title,
        type: item.resolvedOffer.type,
        value: item.resolvedOffer.value,
        badge: item.resolvedOffer.badge,
      }
    : null;

  return {
    id: item.id,
    title: item.name,
    description: item.description ?? '',
    // Legacy string price — used as fallback and in vendor view
    price: `₹${item.price.final}`,
    // Structured price fields for discount rendering
    priceOriginal: item.price.original,
    priceFinal: item.price.final,
    hasDiscount: item.price.hasDiscount,
    resolvedOffer,
    image: item.imageUrl ? getMenuImage(item.imageUrl) || PUBLISHED_IMAGE_FALLBACK : PUBLISHED_IMAGE_FALLBACK,
    category: categoryName,
    foodType: item.foodType as 'veg' | 'non-veg' | 'egg',
    isBestseller: item.isBestSeller,
    isTodaysSpecial: item.isTodaysSpecial,
    isAvailable: !item.isSoldOut,
    gradientColors: { mid: 'rgba(56, 45, 41, 0.85)', end: 'rgba(40, 30, 25, 0.98)' },
  };
}

export function publishedMenuAdapter(menu: PublishedMenu): PublicMenuViewModel {
  const items = menu.categories.flatMap((cat) =>
    cat.items
      .filter((item) => !item.isSoldOut)
      .map((item) => fromPublishedItem(item, cat.name))
  );

  // Offers strip (type = 'offer')
  const offers: PublicMenuOffer[] = (menu.offers ?? []).map((o: PublishedOfferStrip) => ({
    id: o.id,
    title: o.title,
    badge: o.badge,
    type: o.type,
    targetType: o.targetType,
    targetCount: o.targetCount,
    targetNames: o.targetNames ?? [],
    startTime: o.startTime,
    endTime: o.endTime,
    // Pass through the CDN-resolved banner (null when no banner was uploaded)
    banner: o.banner ?? null,
  }));

  // Announcements (non-offer promotions)
  const announcements: PublicMenuPromotion[] = (menu.promotions || []).map((p) => ({
    id: p.id,
    type: (p.type as 'announcement' | 'offer' | 'todays_special') || 'announcement',
    title: p.title,
    description: p.description ?? undefined,
    startDate: p.startDate ?? undefined,
    endDate: p.endDate ?? undefined,
  }));

  return {
    vendorName: menu.shop.name,
    vendorAddress: menu.shop.address ?? '',
    phone: menu.shop.phone,
    whatsapp: menu.shop.whatsapp,
    mapUrl: menu.shop.mapUrl,
    items,
    categories: ['All', ...menu.categories.filter((c) => c.items.length > 0).map((c) => c.name)],
    offers,
    announcements,
    menuVersion: menu.version,
    publishedAt: menu.publishedAt,
  };
}
