import type { PublishedMenu } from '@/services/publish.service';
import type { FoodCardItem } from '@/components/shared/item';
import { getMenuImage } from '@/lib/images';

export const PUBLISHED_IMAGE_FALLBACK =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2080&auto=format&fit=crop';

export interface PublicMenuViewModel {
  vendorName: string;
  vendorAddress: string;
  phone: string | null;
  whatsapp: string | null;
  mapUrl: string | null;
  items: FoodCardItem[];
  categories: string[];
  /** Passed to AnalyticsProvider — not rendered */
  menuVersion: number;
  publishedAt: string;
}

type PublishedItem = PublishedMenu['categories'][number]['items'][number];

export function fromPublishedItem(item: PublishedItem, categoryName: string): FoodCardItem {
  return {
    id: item.id,
    title: item.name,
    description: item.description ?? '',
    price: `₹${Number(item.price).toFixed(0)}`,
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

  return {
    vendorName: menu.shop.name,
    vendorAddress: menu.shop.address ?? '',
    phone: menu.shop.phone,
    whatsapp: menu.shop.whatsapp,
    mapUrl: menu.shop.mapUrl,
    items,
    categories: ['All', ...menu.categories.filter((c) => c.items.length > 0).map((c) => c.name)],
    menuVersion: menu.version,
    publishedAt: menu.publishedAt,
  };
}
