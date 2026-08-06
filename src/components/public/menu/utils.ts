import { CATEGORY_EMOJIS, DEFAULT_FALLBACK_EMOJI } from './constants';

/** Returns an emoji for a given category name. */
export function getCategoryEmoji(catName: string): string {
  const lower = catName.toLowerCase();
  for (const [key, emoji] of Object.entries(CATEGORY_EMOJIS)) {
    if (lower.includes(key)) return emoji;
  }
  return DEFAULT_FALLBACK_EMOJI;
}

/** Parse a display price string or number to a plain number. */
export function parsePrice(price: string | number | undefined): number {
  if (typeof price === 'number') return price;
  return parseInt(String(price || '0').replace(/\D/g, ''), 10) || 199;
}

/** Get the effective unit price for an item (discounted or original). */
export function getItemUnitPrice(item: {
  hasDiscount?: boolean;
  priceFinal?: number;
  price?: string | number;
}): number {
  if (item.hasDiscount && item.priceFinal != null) return item.priceFinal;
  return parsePrice(item.price);
}

/** Format savings display — strips trailing ".0" */
export function formatSavings(amount: number): string {
  return amount.toFixed(1).replace(/\.0$/, '');
}
