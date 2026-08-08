/**
 * Image URL helpers — never expose raw R2 credentials or bucket URLs.
 * All public URLs are constructed from R2_PUBLIC_URL (your CDN domain).
 *
 * Usage:
 *   getMenuImage("shops/shop123/menu/Qd8Ka7Nm.webp")
 *   → "https://cdn.mystreetmenu.com/shops/shop123/menu/Qd8Ka7Nm.webp"
 */

function getImageUrl(key: string | null | undefined): string {
  if (!key || typeof key !== 'string') return '';
  const trimmed = key.trim();
  if (!trimmed) return '';
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (!base) {
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  }
  const cleanKey = trimmed.replace(/^\/+/, '');
  return `${base.replace(/\/+$/, '')}/${cleanKey}`;
}

/**
 * Returns the public CDN URL for a menu item image.
 * key example: "shops/shop123/menu/Qd8Ka7Nm.webp"
 */
export function getMenuImage(key: string | null | undefined): string {
  return getImageUrl(key);
}


/**
 * Returns the public CDN URL for a shop logo.
 * key example: "shops/shop123/logo/logo.webp"
 */
export function getLogo(key: string | null | undefined): string {
  return getImageUrl(key);
}

/**
 * Returns the public CDN URL for a shop cover image.
 * key example: "shops/shop123/cover/cover.webp"
 */
export function getCover(key: string | null | undefined): string {
  return getImageUrl(key);
}

/**
 * Returns the public CDN URL for an offer banner image.
 * key example: "shops/shop123/offers/Qd8Ka7Nm.webp"
 */
export function getOfferImage(key: string | null | undefined): string {
  return getImageUrl(key);
}
