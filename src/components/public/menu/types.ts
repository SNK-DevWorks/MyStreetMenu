import type { FoodCardItem } from '@/components/shared/item';

export interface AnnouncementItem {
  id: string;
  type?: 'announcement' | 'offer' | 'todays_special';
  title: string;
  description?: string;
  code?: string;
  startDate?: string;
  endDate?: string;
}

export interface PublicOfferItem {
  id: string;
  title: string;
  badge: string; // "20% OFF", "₹50 OFF", "Buy 1 Get 1"
  type: string;
  targetType: string;
  targetCount: number;
  startTime: string | null;
  endTime: string | null;
  /** Resolved CDN banner URL from published JSON. null = use gradient default. */
  banner: { image: string; alt: string } | null;
}

export interface PublicMenuViewProps {
  vendorName?: string;
  vendorAddress?: string;
  phone?: string | null;
  whatsapp?: string | null;
  mapUrl?: string | null;
  items?: FoodCardItem[];
  categories?: string[];
  offers?: PublicOfferItem[];
  announcements?: AnnouncementItem[];
}

export type DietFilter = 'all' | 'veg' | 'non-veg' | 'egg';

/** Cart state shape returned by useCart */
export interface CartItem {
  itemId: string;
  quantity: number;
}

export interface CartSummary {
  totalItemsCount: number;
  totalSavings: number;
  totalPrice: number;
  lastAddedItem: FoodCardItem | null;
}

export interface ActiveOrder {
  tokenNumber: string;
  itemsCount: number;
  totalPrice: number;
  totalSavings: number;
  lastAddedItem: FoodCardItem | null;
  items: Array<{ item: FoodCardItem; quantity: number }>;
  customerName?: string;
  tableNumber?: string;
  customerPhone?: string;
  specialInstructions?: string;
}
