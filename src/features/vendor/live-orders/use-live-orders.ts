'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getLiveOrdersAction } from '@/actions/order/get-live-orders';
import { updateOrderStatusAction } from '@/actions/order/update-order-status';
import { getVendorShopAction } from '@/actions/shop/get-vendor-shop';
import { subscribeToShopOrders, type OrderRealtimePayload } from '@/lib/orders/realtime';
import { ORDER_STATUS, type OrderStatus } from '@/lib/orders/order-status';
import type { LiveOrder } from '@/types/order';

interface UseLiveOrdersReturn {
  newOrders: LiveOrder[];
  preparingOrders: LiveOrder[];
  readyOrders: LiveOrder[];
  loading: boolean;
  error: string | null;
  /** Change order status — handles all transitions through a single method */
  changeStatus: (orderId: string, status: OrderStatus) => Promise<void>;
}

/**
 * useLiveOrders — the single owner of vendor live orders state.
 *
 * Responsibilities:
 *  1. Initial fetch of active orders on mount
 *  2. Auto-fetches shopId for Supabase Realtime subscription
 *  3. Optimistic updates — state changes instantly before server confirms
 *  4. Audio + browser title notification on new orders
 *  5. changeStatus() — calls updateOrderStatusAction + updates local state
 *
 * The vendor page becomes purely presentational:
 *   const { newOrders, readyOrders, changeStatus } = useLiveOrders();
 */
export function useLiveOrders(): UseLiveOrdersReturn {
  const [orders, setOrders] = useState<LiveOrder[]>([]);
  const [shopId, setShopId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const originalTitle = useRef<string>('');
  const flashInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Derived buckets by status ──────────────────────────────────────────────
  const newOrders = orders.filter((o) => o.status === ORDER_STATUS.NEW);
  const preparingOrders = orders.filter((o) => o.status === ORDER_STATUS.PREPARING);
  const readyOrders = orders.filter((o) => o.status === ORDER_STATUS.READY);

  // ── Notification helpers ───────────────────────────────────────────────────
  const playNotificationSound = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      oscillator.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.4);
    } catch {
      // Audio not available — silently skip
    }
  }, []);

  const flashBrowserTitle = useCallback((message: string) => {
    if (typeof document === 'undefined') return;
    if (flashInterval.current) clearInterval(flashInterval.current);
    originalTitle.current = originalTitle.current || document.title;
    let toggled = false;
    let count = 0;
    flashInterval.current = setInterval(() => {
      document.title = toggled ? originalTitle.current : `🔔 ${message}`;
      toggled = !toggled;
      if (++count >= 10) {
        clearInterval(flashInterval.current!);
        document.title = originalTitle.current;
      }
    }, 700);
  }, []);

  // ── Convert Realtime payload to LiveOrder shape ────────────────────────────
  const payloadToOrder = useCallback((payload: OrderRealtimePayload): LiveOrder => ({
    id: payload.id,
    shopId: payload.shop_id,
    token: payload.token,
    status: payload.status,
    customerName: payload.customer_name,
    customerPhone: null,
    tableId: null,
    tableLabel: payload.table_label,
    customerNotes: null,
    paymentMethod: null,
    paymentStatus: 'pending',
    orderSource: 'direct_link',
    subtotal: parseFloat(payload.total ?? '0'),
    discount: 0,
    total: parseFloat(payload.total ?? '0'),
    placedAt: new Date(payload.placed_at),
    preparingAt: null,
    readyAt: null,
    completedAt: null,
    items: [], // Full items fetched on initial load; Realtime gives minimal payload
  }), []);

  // ── Helper to fetch and merge live orders without flicker ───────────────────
  const refreshOrders = useCallback(async (silent = true) => {
    if (!silent) setLoading(true);
    const result = await getLiveOrdersAction();
    if (result.success && result.data) {
      const data = result.data;
      setOrders((prev) => {
        // Detect if there are brand new incoming orders during polling
        const prevIds = new Set(prev.map((o) => o.id));
        const hasBrandNew = data.some((o) => !prevIds.has(o.id) && o.status === ORDER_STATUS.NEW);
        if (hasBrandNew) {
          playNotificationSound();
          flashBrowserTitle(`New Order Received!`);
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
          }
        }
        return data;
      });
      setError(null);
    } else if (!silent) {
      setError(result.error ?? 'Failed to load orders');
    }
    if (!silent) setLoading(false);
  }, [playNotificationSound, flashBrowserTitle]);

  // ── Initial load + shopId fetch ───────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [ordersResult, shopResult] = await Promise.all([
        getLiveOrdersAction(),
        getVendorShopAction(),
      ]);
      if (cancelled) return;
      if (ordersResult.success && ordersResult.data) {
        setOrders(ordersResult.data);
      } else {
        setError(ordersResult.error ?? 'Failed to load orders');
      }
      if (shopResult.success && shopResult.data) {
        setShopId(shopResult.data.id);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Smart Polling Fallback (Every 6 seconds) ───────────────────────────────
  // Industry standard resilience: catches orders even if WebSocket drops or is offline
  useEffect(() => {
    const interval = setInterval(() => {
      // Only poll if tab is visible to save battery and data
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        refreshOrders(true);
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [refreshOrders]);

  // ── Tab Visibility & Window Focus Re-sync ─────────────────────────────────
  // When vendor unlocks tablet or switches back to this tab, immediately re-sync
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshOrders(true);
      }
    };

    const handleFocus = () => {
      refreshOrders(true);
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [refreshOrders]);

  // ── Supabase Realtime subscription (Instant 0ms push) ─────────────────────
  useEffect(() => {
    if (!shopId) return;

    const unsubscribe = subscribeToShopOrders(shopId, {
      onInsert: (payload) => {
        refreshOrders(true);
        playNotificationSound();
        flashBrowserTitle(`New Order ${payload.token}`);

        // Vibrate on mobile
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try { navigator.vibrate([200, 100, 200]); } catch {}
        }
      },


      onUpdate: (payload) => {
        setOrders((prev) => {
          const isLive = ['new', 'preparing', 'ready'].includes(payload.status);
          if (!isLive) {
            // Remove completed/cancelled from live view
            return prev.filter((o) => o.id !== payload.id);
          }
          return prev.map((o) =>
            o.id === payload.id
              ? { ...o, status: payload.status }
              : o,
          );
        });
      },
    });

    return unsubscribe;
  }, [shopId, payloadToOrder, playNotificationSound, flashBrowserTitle]);

  // ── changeStatus — optimistic update + server action ──────────────────────
  const changeStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    // Optimistic: update UI immediately
    setOrders((prev) => {
      const isLive = ['new', 'preparing', 'ready'].includes(status);
      if (!isLive) return prev.filter((o) => o.id !== orderId);
      return prev.map((o) => o.id === orderId ? { ...o, status } : o);
    });

    // Persist to DB
    const result = await updateOrderStatusAction({ orderId, status });

    if (!result.success) {
      // Roll back optimistic update on failure
      const originalResult = await getLiveOrdersAction();
      if (originalResult.success && originalResult.data) {
        setOrders(originalResult.data);
      }
      console.error('Status update failed:', result.error);
    }
  }, []);

  return { newOrders, preparingOrders, readyOrders, loading, error, changeStatus };
}
