'use client';

import React, { useState, useCallback } from 'react';
import {
  NewOrderCard,
  ReadyOrderCard,
  EmptyState,
  type Order,
} from '@/features/vendor/live-orders/order-cards';
import { useLiveOrders } from '@/features/vendor/live-orders/use-live-orders';
import type { LiveOrder } from '@/types/order';
import { ORDER_STATUS } from '@/lib/orders/order-status';

/** Bridge from LiveOrder (DB shape) → Order (card display shape) */
function toCardOrder(o: LiveOrder): Order {
  return {
    id:       o.id,
    token:    o.token,
    tableNo:  o.tableLabel ?? '—',
    placedAt: new Date(o.placedAt),
    total:    o.total,
    status:   (o.status === 'new' || o.status === 'preparing') ? 'new' : 'ready',
    readyAt:  o.readyAt ? new Date(o.readyAt) : undefined,
    notes:    o.customerNotes ?? undefined,
    collected: false,
    items: o.items.map((item) => ({
      name: item.name,
      qty:  item.quantity,
      image: item.image ?? undefined,
    })),
  };
}

export default function LiveOrdersPage() {
  const [toast, setToast] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<'new' | 'ready'>('new');
  // Track collected state locally (UI-only, not persisted to DB yet)
  const [collectedIds, setCollectedIds] = useState<Set<string>>(new Set());

  const { newOrders, preparingOrders, readyOrders, loading, changeStatus } = useLiveOrders();

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Merge new + preparing into a single "NEW" column for the current card UI
  const pendingLiveOrders = [...newOrders, ...preparingOrders];

  // Convert to card shape and merge collected flag
  const newCardOrders  = pendingLiveOrders.map((o) => ({ ...toCardOrder(o), collected: collectedIds.has(o.id) }));
  const readyCardOrders = readyOrders.map((o) => ({ ...toCardOrder(o), collected: collectedIds.has(o.id) }));

  const handleMarkReady = useCallback(async (id: string) => {
    await changeStatus(id, ORDER_STATUS.READY);
    showToast('Order marked as ready!');
  }, [changeStatus, showToast]);

  const handleComplete = useCallback(async (id: string) => {
    await changeStatus(id, ORDER_STATUS.COMPLETED);
    showToast('Order completed.');
  }, [changeStatus, showToast]);

  const handleCollected = useCallback((id: string) => {
    setCollectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#f77512] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1536px] mx-auto px-3 sm:px-4 md:px-8 pt-0 pb-12">

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl text-xs sm:text-sm font-bold whitespace-nowrap max-w-[90vw] text-center animate-in fade-in slide-in-from-top-4 duration-200">
          {toast}
        </div>
      )}

      {/* ── MOBILE ONLY: Switchable Tabs (NEW / READY) ── */}
      <div className="block md:hidden sticky top-[58px] z-30 bg-[#fdf8f3] pt-2 pb-3 border-b border-gray-200/80 mb-4">
        <div className="flex bg-[#F0E6DB]/60 p-1 rounded-xl gap-1">
          <button
            type="button"
            onClick={() => setMobileTab('new')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-black transition-all cursor-pointer ${
              mobileTab === 'new'
                ? 'bg-white text-[#1f114a] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>NEW</span>
            <span className={`w-5 h-5 rounded-full text-[10.5px] font-black flex items-center justify-center ${
              mobileTab === 'new' ? 'bg-[#f77512] text-white' : 'bg-gray-200 text-gray-700'
            }`}>
              {newCardOrders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab('ready')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-black transition-all cursor-pointer ${
              mobileTab === 'ready'
                ? 'bg-white text-[#1f114a] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>READY</span>
            <span className={`w-5 h-5 rounded-full text-[10.5px] font-black flex items-center justify-center ${
              mobileTab === 'ready' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}>
              {readyCardOrders.length}
            </span>
          </button>
        </div>
      </div>

      {/* ── MOBILE CONTENT ── */}
      <div className="block md:hidden">
        {mobileTab === 'new' ? (
          newCardOrders.length === 0 ? (
            <EmptyState tab="new" />
          ) : (
            <div className="flex flex-col gap-4">
              {newCardOrders.map((order) => (
                <NewOrderCard key={order.id} order={order} onMarkReady={handleMarkReady} />
              ))}
            </div>
          )
        ) : readyCardOrders.length === 0 ? (
          <EmptyState tab="ready" />
        ) : (
          <div className="flex flex-col gap-4">
            {readyCardOrders.map((order) => (
              <ReadyOrderCard
                key={order.id}
                order={order}
                onComplete={handleComplete}
                onCollected={handleCollected}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── DESKTOP ONLY: Side-by-Side Split Layout (75% NEW | border | 25% READY) ── */}
      <div className="hidden md:grid grid-cols-4 gap-6 lg:gap-8">

        {/* Left Side: NEW Orders (75% width, 3 cols out of 4) */}
        <div className="col-span-3 flex flex-col gap-4 border-r border-gray-200/90 pr-6 lg:pr-8">
          <div className="sticky top-[138px] z-30 -mx-1 pr-7 lg:pr-9 bg-[#fdf8f3] py-3.5 flex items-center gap-2 shadow-[0_2px_0_0_rgba(0,0,0,0.06)]">
            <h3 className="text-[16px] font-black text-[#1f114a] tracking-tight">NEW</h3>
            <span className="w-6 h-6 rounded-full bg-[#f77512] text-white text-[11px] font-black flex items-center justify-center shrink-0">
              {newCardOrders.length}
            </span>
          </div>

          {newCardOrders.length === 0 ? (
            <EmptyState tab="new" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {newCardOrders.map((order) => (
                <NewOrderCard key={order.id} order={order} onMarkReady={handleMarkReady} />
              ))}
            </div>
          )}
        </div>

        {/* Right Side: READY Orders (Far right, 25% width, 1 col out of 4) */}
        <div className="col-span-1 flex flex-col gap-4">
          <div className="sticky top-[138px] z-30 -mx-1 px-1 bg-[#fdf8f3] py-3.5 flex items-center gap-2 shadow-[0_2px_0_0_rgba(0,0,0,0.06)]">
            <h3 className="text-[16px] font-black text-[#1f114a] tracking-tight">READY</h3>
            <span className="w-6 h-6 rounded-full bg-green-500 text-white text-[11px] font-black flex items-center justify-center shrink-0">
              {readyCardOrders.length}
            </span>
          </div>

          {readyCardOrders.length === 0 ? (
            <EmptyState tab="ready" />
          ) : (
            <div className="flex flex-col gap-3 w-full">
              {readyCardOrders.map((order) => (
                <ReadyOrderCard
                  key={order.id}
                  order={order}
                  onComplete={handleComplete}
                  onCollected={handleCollected}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
