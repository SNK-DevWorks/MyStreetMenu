// ── Order Status Constants ────────────────────────────────────────────────────
// Use these instead of raw strings everywhere to prevent typo bugs.

export const ORDER_STATUS = {
  NEW:       'new',
  PREPARING: 'preparing',
  READY:     'ready',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

// ── Status → Timestamp Mapping ────────────────────────────────────────────────
// Which DB column gets set when a status transition happens.

export const STATUS_TIMESTAMPS: Partial<Record<OrderStatus, 'preparingAt' | 'readyAt' | 'completedAt'>> = {
  preparing: 'preparingAt',
  ready:     'readyAt',
  completed: 'completedAt',
};

// ── Status Labels (for UI display) ───────────────────────────────────────────

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  new:       'New',
  preparing: 'Preparing',
  ready:     'Ready',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

// ── Active statuses (shown on vendor live screen) ─────────────────────────────

export const LIVE_STATUSES: OrderStatus[] = [
  ORDER_STATUS.NEW,
  ORDER_STATUS.PREPARING,
  ORDER_STATUS.READY,
];

export const HISTORY_STATUSES: OrderStatus[] = [
  ORDER_STATUS.COMPLETED,
  ORDER_STATUS.CANCELLED,
];

// ── Valid transitions ─────────────────────────────────────────────────────────
// Defines which status changes are allowed from a given state.

export const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  new:       ['preparing', 'ready', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready:     ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

export function isValidTransition(from: OrderStatus, to: OrderStatus): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}
