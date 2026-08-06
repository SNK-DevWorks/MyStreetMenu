/** Category emoji lookup */
export const CATEGORY_EMOJIS: Record<string, string> = {
  all: '🍽️',
  burger: '🍔',
  pizza: '🍕',
  chicken: '🍗',
  bucket: '🍗',
  tender: '🍗',
  wings: '🍗',
  drink: '🥤',
  beverage: '🥤',
  juice: '🥤',
  soda: '🥤',
  side: '🍟',
  fries: '🍟',
  snack: '🍟',
  dessert: '🍦',
  sweet: '🍦',
  ice: '🍦',
  cake: '🍦',
  special: '🔥',
  offer: '🔥',
  deal: '🔥',
  noodle: '🍜',
  pasta: '🍜',
  ramen: '🍜',
  chow: '🍜',
  taco: '🌮',
  wrap: '🌮',
  roll: '🌮',
  rice: '🍚',
  biryani: '🍚',
  coffee: '☕',
  tea: '☕',
  chai: '☕',
};

export const DEFAULT_FALLBACK_EMOJI = '🍢';

/** Default category list when none provided */
export const DEFAULT_CATEGORIES = ['All'];

/** Auto-scroll interval for carousels (ms) */
export const CAROUSEL_INTERVAL_MS = 3800;
export const SPECIAL_CAROUSEL_INTERVAL_MS = 4000;

/** Diet filter options */
export const DIET_FILTER_OPTIONS = ['all', 'veg', 'non-veg', 'egg'] as const;

/** Animation class names for the bottom sheet */
export const SHEET_ANIMATION = {
  in: 'zepto-sheet-in',
  out: 'zepto-sheet-out',
  backdropIn: 'zepto-backdrop-in',
  backdropOut: 'zepto-backdrop-out',
} as const;

/** Sheet close animation duration in ms */
export const SHEET_CLOSE_DURATION_MS = 280;
