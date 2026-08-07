/**
 * Order total calculation utilities.
 * Lives in lib so it's reusable across service, client-side cart, and tests.
 */

export interface OrderLineItem {
  price: number;  // unit price
  quantity: number;
}

/**
 * Calculate subtotal from a list of items (price × qty for each).
 */
export function calculateSubtotal(items: OrderLineItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

/**
 * Calculate total after applying a flat discount.
 */
export function calculateTotal(subtotal: number, discount = 0): number {
  return Math.max(0, subtotal - discount);
}

/**
 * Round to 2 decimal places and return as string (for numeric DB columns).
 */
export function toDecimalString(value: number): string {
  return value.toFixed(2);
}
