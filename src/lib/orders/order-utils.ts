import type { OrderStatus } from './order-status';

/**
 * Miscellaneous order display and formatting utilities.
 */

/**
 * Format a token for display: "A01" → "A01"
 */
export function formatToken(token: string): string {
  return token.toUpperCase();
}

/**
 * Human-readable status label with emoji for the customer sticky bar.
 */
export function getStatusDisplay(status: OrderStatus): { label: string; emoji: string; color: string } {
  switch (status) {
    case 'new':
      return { label: 'Order Received', emoji: '🧾', color: 'text-blue-600' };
    case 'preparing':
      return { label: 'Being Prepared', emoji: '👨‍🍳', color: 'text-orange-600' };
    case 'ready':
      return { label: 'Ready for Pickup!', emoji: '🎉', color: 'text-green-600' };
    case 'completed':
      return { label: 'Completed', emoji: '✅', color: 'text-gray-500' };
    case 'cancelled':
      return { label: 'Cancelled', emoji: '❌', color: 'text-red-500' };
  }
}

/**
 * Relative time: "just now", "2 min ago", "5 min ago"
 */
export function getRelativeTime(date: Date | string): string {
  const ms = Date.now() - new Date(date).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return 'just now';
  if (mins === 1) return '1 min ago';
  return `${mins} min ago`;
}

/**
 * Format price as ₹ string.
 */
export function formatPrice(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return `₹${num.toFixed(0)}`;
}
