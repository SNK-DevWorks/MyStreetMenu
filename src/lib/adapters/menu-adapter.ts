import { getMenuImage } from '@/lib/images';
import type { FoodCardItem, ResolvedOfferBadge } from '@/components/shared/item';
import type { MenuItemWithCategory } from '@/actions/shop/get-menu-data';
import type { Promotion } from '../../../drizzle/schema/promotions';

export const FOOD_IMAGE_FALLBACK =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2080&auto=format&fit=crop';

function resolveOfferForItem(
  item: MenuItemWithCategory,
  offers?: Promotion[]
): { priceOriginal: number; priceFinal: number; hasDiscount: boolean; resolvedOffer: ResolvedOfferBadge | null } {
  const original = parseFloat(String(item.price || 0));
  if (!Array.isArray(offers) || offers.length === 0) {
    return { priceOriginal: original, priceFinal: original, hasDiscount: false, resolvedOffer: null };
  }

  const activeOffers = offers.filter(o => o.isActive && o.type === 'offer' && o.offerType);
  const applicable = activeOffers.filter(o => {
    const tt = o.targetType ?? 'all';
    if (tt === 'all') return true;
    if (tt === 'category') return o.targetIds?.includes(item.categoryId) ?? false;
    if (tt === 'item') return o.targetIds?.includes(item.id) ?? false;
    return false;
  });

  if (applicable.length === 0) {
    return { priceOriginal: original, priceFinal: original, hasDiscount: false, resolvedOffer: null };
  }

  const specificityScore = (targetType: string | null | undefined): number => {
    if (targetType === 'item') return 3;
    if (targetType === 'category') return 2;
    return 1;
  };

  applicable.sort((a, b) => {
    const specDiff = specificityScore(b.targetType) - specificityScore(a.targetType);
    if (specDiff !== 0) return specDiff;
    const priDiff = (b.priority ?? 0) - (a.priority ?? 0);
    if (priDiff !== 0) return priDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const winner = applicable[0];
  const value = parseFloat(winner.offerValue ?? '0');
  let final = original;
  let badge = 'Offer';

  if (winner.offerType === 'percentage') {
    final = Math.round(original * (1 - value / 100));
    badge = `${value}% OFF`;
  } else if (winner.offerType === 'flat') {
    final = Math.max(0, original - value);
    badge = `₹${value} OFF`;
  } else if (winner.offerType === 'bxgy') {
    badge = value === 1 ? 'Buy 1 Get 1' : `Buy ${value} Get ${value}`;
  }

  const hasDiscount = final < original;

  return {
    priceOriginal: original,
    priceFinal: final,
    hasDiscount,
    resolvedOffer: {
      id: winner.id,
      title: winner.title,
      type: winner.offerType as ResolvedOfferBadge['type'],
      value,
      badge,
    },
  };
}

export function toFoodCardItem(item: MenuItemWithCategory, offers?: Promotion[]): FoodCardItem {
  const validOffers = Array.isArray(offers) ? offers : undefined;
  const priceInfo = resolveOfferForItem(item, validOffers);
  const displayPrice = priceInfo.hasDiscount ? `₹${priceInfo.priceFinal}` : `₹${Number(item.price).toFixed(0)}`;

  return {
    id: item.id,
    title: item.name,
    description: item.description ?? '',
    price: displayPrice,
    priceOriginal: priceInfo.priceOriginal,
    priceFinal: priceInfo.priceFinal,
    hasDiscount: priceInfo.hasDiscount,
    resolvedOffer: priceInfo.resolvedOffer,
    badgeLabel: priceInfo.resolvedOffer?.badge,
    image: item.imageUrl ? getMenuImage(item.imageUrl) || FOOD_IMAGE_FALLBACK : FOOD_IMAGE_FALLBACK,
    category: item.categoryName,
    foodType: (item.foodType as 'veg' | 'non-veg' | 'egg') ?? 'veg',
    isBestseller: item.isBestSeller,
    isTodaysSpecial: item.isTodaysSpecial,
    isAvailable: !item.isSoldOut,
    gradientColors: { mid: 'rgba(56, 45, 41, 0.85)', end: 'rgba(40, 30, 25, 0.98)' },
  };
}
