'use client';

import React, { useState, useCallback } from 'react';
import {
  NewOrderCard,
  PreparingOrderCard,
  ReadyOrderCard,
  EmptyState,
  type Order,
} from '@/features/vendor/live-orders/order-cards';
import { useLiveOrders } from '@/features/vendor/live-orders/use-live-orders';
import type { LiveOrder } from '@/types/order';
import { ORDER_STATUS } from '@/lib/orders/order-status';

import { getMenuImage } from '@/lib/images';

/** Bridge from LiveOrder (DB shape) → Order (card display shape) */
function toCardOrder(o: LiveOrder): Order {
  return {
    id:          o.id,
    token:       o.token,
    tableNo:     o.tableLabel ?? '—',
    placedAt:    new Date(o.placedAt),
    preparingAt: o.preparingAt ? new Date(o.preparingAt) : undefined,
    readyAt:     o.readyAt ? new Date(o.readyAt) : undefined,
    total:       o.total,
    status:      o.status as any,
    notes:       o.customerNotes ?? undefined,
    collected:   false,
    items: o.items.map((item) => ({
      name:  item.name,
      qty:   item.quantity,
      image: item.image ? (getMenuImage(item.image) || item.image) : undefined,
    })),
  };
}


export default function LiveOrdersPage() {
  const [toast, setToast] = useState<string | null>(null);
  const [orderMode, setOrderMode] = useState<'simple' | 'kitchen'>('kitchen');
  const [mobileTab, setMobileTab] = useState<'new' | 'preparing' | 'ready'>('new');
  // Track collected state locally (UI-only, not persisted to DB yet)
  const [collectedIds, setCollectedIds] = useState<Set<string>>(new Set());

  const { newOrders, preparingOrders, readyOrders, loading, changeStatus } = useLiveOrders();

  // Load saved mode from localStorage on mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vendor_order_mode');
      if (saved === 'simple' || saved === 'kitchen') {
        setOrderMode(saved);
      }
    }
  }, []);

  const handleModeChange = (mode: 'simple' | 'kitchen') => {
    setOrderMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vendor_order_mode', mode);
    }
    if (mode === 'simple' && mobileTab === 'preparing') {
      setMobileTab('new');
    }
  };

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  // In simple mode, treat new + preparing as pending orders in the NEW column
  const pendingOrdersSource = orderMode === 'simple' ? [...newOrders, ...preparingOrders] : newOrders;

  // Convert to card shape and merge collected flag
  const newCardOrders       = pendingOrdersSource.map((o) => ({ ...toCardOrder(o), collected: collectedIds.has(o.id) }));
  const preparingCardOrders = preparingOrders.map((o) => ({ ...toCardOrder(o), collected: collectedIds.has(o.id) }));
  const readyCardOrders     = readyOrders.map((o) => ({ ...toCardOrder(o), collected: collectedIds.has(o.id) }));

  const handleStartPreparing = useCallback(async (id: string) => {
    await changeStatus(id, ORDER_STATUS.PREPARING);
    showToast('Order is now preparing!');
  }, [changeStatus, showToast]);

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

  const ModeToggleSwitch = (
    <div className="flex items-center bg-gray-200/90 p-0.5 rounded-xl border border-gray-300/70 shadow-2xs shrink-0">
      <button
        type="button"
        onClick={() => handleModeChange('simple')}
        className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
          orderMode === 'simple'
            ? 'bg-white text-gray-900 shadow-xs'
            : 'text-gray-600 hover:text-gray-900'
        }`}
        title="Simple Mode: NEW → READY → COMPLETED"
      >
        Simple
      </button>
      <button
        type="button"
        onClick={() => handleModeChange('kitchen')}
        className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
          orderMode === 'kitchen'
            ? 'bg-[#f77512] text-white shadow-xs'
            : 'text-gray-600 hover:text-gray-900'
        }`}
        title="Kitchen Mode: NEW → PREPARING → READY → COMPLETED"
      >
        Kitchen
      </button>
    </div>
  );

  return (
    <div className="max-w-[1536px] mx-auto px-3 sm:px-4 md:px-8 pt-0 pb-12">

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl text-xs sm:text-sm font-bold whitespace-nowrap max-w-[90vw] text-center animate-in fade-in slide-in-from-top-4 duration-200">
          {toast}
        </div>
      )}

      {/* ── MOBILE ONLY: Switchable Tabs + Mode Toggle ── */}
      <div className="block md:hidden sticky top-[58px] z-30 bg-[#fdf8f3] pt-2 pb-3 border-b border-gray-200/80 mb-4 space-y-2">
        <div className="flex items-center justify-between gap-2 px-1">
          <span className="text-xs font-black text-gray-500 uppercase tracking-wider">Mode</span>
          {ModeToggleSwitch}
        </div>
        <div className="flex bg-[#F0E6DB]/60 p-1 rounded-xl gap-1">
          <button
            type="button"
            onClick={() => setMobileTab('new')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
              mobileTab === 'new'
                ? 'bg-white text-[#1f114a] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>NEW</span>
            <span className={`w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center ${
              mobileTab === 'new' ? 'bg-[#1f114a] text-white' : 'bg-gray-200 text-gray-700'
            }`}>
              {newCardOrders.length}
            </span>
          </button>

          {orderMode === 'kitchen' && (
            <button
              type="button"
              onClick={() => setMobileTab('preparing')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                mobileTab === 'preparing'
                  ? 'bg-white text-[#f77512] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>PREPARING</span>
              <span className={`w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center ${
                mobileTab === 'preparing' ? 'bg-[#f77512] text-white' : 'bg-gray-200 text-gray-700'
              }`}>
                {preparingCardOrders.length}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileTab('ready')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
              mobileTab === 'ready'
                ? 'bg-white text-green-600 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>READY</span>
            <span className={`w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center ${
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
                <NewOrderCard
                  key={order.id}
                  order={order}
                  mode={orderMode}
                  onStartPreparing={handleStartPreparing}
                  onMarkReady={handleMarkReady}
                />
              ))}
            </div>
          )
        ) : mobileTab === 'preparing' && orderMode === 'kitchen' ? (
          preparingCardOrders.length === 0 ? (
            <EmptyState tab="preparing" />
          ) : (
            <div className="flex flex-col gap-4">
              {preparingCardOrders.map((order) => (
                <PreparingOrderCard key={order.id} order={order} onMarkReady={handleMarkReady} />
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

      {/* ── DESKTOP ONLY: Dynamic Layout (Simple 2-Col / Kitchen 3-Col) ── */}
      <div className={`hidden md:grid gap-6 lg:gap-8 items-start ${orderMode === 'kitchen' ? 'grid-cols-3' : 'grid-cols-3'}`}>

        {/* NEW Orders Column */}
        <div className={`flex flex-col gap-4 border-r border-gray-200/90 pr-4 lg:pr-6 ${orderMode === 'simple' ? 'col-span-2' : 'col-span-1'}`}>
          <div className="sticky top-[138px] z-30 -mx-1 px-1 bg-[#fdf8f3] h-12 flex items-center justify-between shadow-[0_2px_0_0_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-2">
              <h3 className="text-[16px] font-black text-[#1f114a] tracking-tight">NEW</h3>
              <span className="w-6 h-6 rounded-full bg-[#1f114a] text-white text-[11px] font-black flex items-center justify-center shrink-0">
                {newCardOrders.length}
              </span>
            </div>
          </div>

          {newCardOrders.length === 0 ? (
            <EmptyState tab="new" />
          ) : (
            <div className={orderMode === 'simple' ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : 'flex flex-col gap-4'}>
              {newCardOrders.map((order) => (
                <NewOrderCard
                  key={order.id}
                  order={order}
                  mode={orderMode}
                  onStartPreparing={handleStartPreparing}
                  onMarkReady={handleMarkReady}
                />
              ))}
            </div>
          )}
        </div>

        {/* PREPARING Orders Column (Kitchen Mode Only) */}
        {orderMode === 'kitchen' && (
          <div className="flex flex-col gap-4 border-r border-gray-200/90 pr-4 lg:pr-6 col-span-1">
            <div className="sticky top-[138px] z-30 -mx-1 px-1 bg-[#fdf8f3] h-12 flex items-center justify-between shadow-[0_2px_0_0_rgba(0,0,0,0.06)]">
              <div className="flex items-center gap-2">
                <h3 className="text-[16px] font-black text-[#f77512] tracking-tight">PREPARING</h3>
                <span className="w-6 h-6 rounded-full bg-[#f77512] text-white text-[11px] font-black flex items-center justify-center shrink-0">
                  {preparingCardOrders.length}
                </span>
              </div>
            </div>

            {preparingCardOrders.length === 0 ? (
              <EmptyState tab="preparing" />
            ) : (
              <div className="flex flex-col gap-4">
                {preparingCardOrders.map((order) => (
                  <PreparingOrderCard key={order.id} order={order} onMarkReady={handleMarkReady} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* READY Orders Column */}
        <div className="flex flex-col gap-4 col-span-1">
          <div className="sticky top-[138px] z-30 -mx-1 px-1 bg-[#fdf8f3] h-12 flex items-center justify-between shadow-[0_2px_0_0_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-2">
              <h3 className="text-[16px] font-black text-green-700 tracking-tight">READY</h3>
              <span className="w-6 h-6 rounded-full bg-green-500 text-white text-[11px] font-black flex items-center justify-center shrink-0">
                {readyCardOrders.length}
              </span>
            </div>

            {ModeToggleSwitch}
          </div>

          {readyCardOrders.length === 0 ? (
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

      </div>
    </div>
  );
}
