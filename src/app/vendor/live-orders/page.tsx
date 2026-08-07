'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  NewOrderCard,
  ReadyOrderCard,
  EmptyState,
  type Order,
  type OrderStatus,
} from '@/features/vendor/live-orders/order-cards';
import { makeSeedOrders } from '@/features/vendor/live-orders/seed-data';

export default function LiveOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<'new' | 'ready'>('new');
  const [, tick] = useState(0);

  // Initialize seed orders on mount to avoid SSR time mismatch
  useEffect(() => {
    setOrders(makeSeedOrders());
  }, []);

  // Refresh elapsed timers every 30 s
  useEffect(() => {
    const iv = setInterval(() => tick((n) => n + 1), 30000);
    return () => clearInterval(iv);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleMarkReady = useCallback((id: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status: 'ready' as OrderStatus, readyAt: new Date() } : o
      )
    );
    showToast('Order marked as ready!');
  }, [showToast]);

  const handleComplete = useCallback((id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
    showToast('Order completed.');
  }, [showToast]);

  const handleCollected = useCallback((id: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, collected: !o.collected } : o))
    );
  }, []);

  const newOrders   = orders.filter((o) => o.status === 'new');
  const readyOrders = orders.filter((o) => o.status === 'ready');

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
              {newOrders.length}
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
              {readyOrders.length}
            </span>
          </button>
        </div>
      </div>

      {/* ── MOBILE CONTENT: Displays Active Tab (NEW or READY) ── */}
      <div className="block md:hidden">
        {mobileTab === 'new' ? (
          newOrders.length === 0 ? (
            <EmptyState tab="new" />
          ) : (
            <div className="flex flex-col gap-4">
              {newOrders.map((order) => (
                <NewOrderCard key={order.id} order={order} onMarkReady={handleMarkReady} />
              ))}
            </div>
          )
        ) : readyOrders.length === 0 ? (
          <EmptyState tab="ready" />
        ) : (
          <div className="flex flex-col gap-4">
            {readyOrders.map((order) => (
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
              {newOrders.length}
            </span>
          </div>

          {newOrders.length === 0 ? (
            <EmptyState tab="new" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {newOrders.map((order) => (
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
              {readyOrders.length}
            </span>
          </div>

          {readyOrders.length === 0 ? (
            <EmptyState tab="ready" />
          ) : (
            <div className="flex flex-col gap-3 w-full">
              {readyOrders.map((order) => (
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
