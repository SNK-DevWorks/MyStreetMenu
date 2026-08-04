import { getMenuImage } from '@/lib/images';
import type { FoodCardItem } from '@/components/shared/item';
import type { MenuItemWithCategory } from '@/actions/shop/get-menu-data';

export const FOOD_IMAGE_FALLBACK =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2080&auto=format&fit=crop';

export function toFoodCardItem(item: MenuItemWithCategory): FoodCardItem {
  return {
    id: item.id,
    title: item.name,
    description: item.description ?? '',
    price: `₹${Number(item.price).toFixed(0)}`,
    image: item.imageUrl ? getMenuImage(item.imageUrl) || FOOD_IMAGE_FALLBACK : FOOD_IMAGE_FALLBACK,
    category: item.categoryName,
    foodType: (item.foodType as 'veg' | 'non-veg' | 'egg') ?? 'veg',
    isBestseller: item.isBestSeller,
    isTodaysSpecial: item.isTodaysSpecial,
    isAvailable: !item.isSoldOut,
    gradientColors: { mid: 'rgba(56, 45, 41, 0.85)', end: 'rgba(40, 30, 25, 0.98)' },
  };
}
