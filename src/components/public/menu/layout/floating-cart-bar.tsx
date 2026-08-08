'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import type { CartSummary, ActiveOrder } from '../types';
import { getCategoryEmoji, formatSavings } from '../utils';

interface FloatingCartBarProps {
  cartSummary: CartSummary;
  activeOrder?: ActiveOrder | null;
  ordersList?: ActiveOrder[];
  onContinue: () => void;
  onViewActiveOrder?: () => void;
}

export function FloatingCartBar({
  cartSummary,
  activeOrder,
  ordersList = [],
  onContinue,
  onViewActiveOrder,
}: FloatingCartBarProps) {
  // ── Mode 1: Active Cart Items ──────────────────────────────────────────────
  if (cartSummary.totalItemsCount > 0) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-40 max-w-lg mx-auto animate-in slide-in-from-bottom duration-300">
        <div className="bg-white rounded-2xl shadow-2xl border border-orange-100/90 overflow-hidden">
          {/* Offer Savings Top Banner */}
          {cartSummary.totalSavings > 0 && cartSummary.lastAddedItem && (
            <div className="bg-sky-50/90 border-b border-sky-100 px-4 py-2.5 flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 font-extrabold text-xs shadow-xs">
                %
              </div>
              <p className="text-xs sm:text-[13px] font-bold text-blue-700 truncate">
                You are saving{' '}
                <span className="font-black text-blue-800">
                  ₹{formatSavings(cartSummary.totalSavings)}
                </span>{' '}
                on {cartSummary.lastAddedItem.title}
              </p>
            </div>
          )}

          {/* Main Cart Action Bar */}
          <div
            onClick={onContinue}
            className="group bg-gradient-to-r from-[#FF6B00] via-[#FF7A1A] to-[#FF8C33] p-3 px-4 flex items-center justify-between text-white cursor-pointer hover:opacity-98 transition-all select-none"
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Item Thumbnail */}
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/20 border border-white/40 shrink-0 flex items-center justify-center">
                {cartSummary.lastAddedItem?.image ? (
                  <img
                    src={cartSummary.lastAddedItem.image}
                    alt={cartSummary.lastAddedItem.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl">
                    {getCategoryEmoji(cartSummary.lastAddedItem?.category || '')}
                  </span>
                )}
              </div>

              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-base leading-tight truncate">
                  {cartSummary.totalItemsCount}{' '}
                  {cartSummary.totalItemsCount === 1 ? 'item' : 'items'} added
                </span>
                <span className="text-xs text-white/90 font-medium truncate">
                  ₹{cartSummary.totalPrice} • View order details
                </span>
              </div>
            </div>

            {/* Continue label */}
            <div className="flex items-center gap-1 font-black text-sm sm:text-base text-white group-hover:translate-x-0.5 group-active:scale-95 transition-transform shrink-0">
              <span>Continue</span>
              <ChevronRight size={18} strokeWidth={3} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Mode 2: Placed Active Orders Status Bar ───────────────────────────────
  const activeOrders = ordersList.length > 0 ? ordersList : (activeOrder ? [activeOrder] : []);

  if (activeOrders.length > 0 && onViewActiveOrder) {
    const totalItemsCount    = activeOrders.reduce((sum, o) => sum + o.itemsCount, 0);
    const combinedTotalPrice = activeOrders.reduce((sum, o) => sum + o.totalPrice, 0);

    // Priority: ready > preparing > new
    const readyOrders    = activeOrders.filter(o => o.status === 'ready');
    const preparingOrders = activeOrders.filter(o => o.status === 'preparing');

    const hasReady    = readyOrders.length > 0;
    const hasPreparing = preparingOrders.length > 0;

    // Always use the latest (newest placed) order as the primary display
    const latestOrder = activeOrders[activeOrders.length - 1];
    const representativeOrder = latestOrder;

    // Banner reflects the newest order's status with prior ready order indicators
    let bannerBg   = 'bg-slate-100 text-slate-700 border-slate-200';
    let bannerText = '';

    if (latestOrder.status === 'ready') {
      bannerBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      bannerText = `Order Ready — Token #${latestOrder.tokenNumber}`;
    } else if (latestOrder.status === 'preparing') {
      bannerBg = 'bg-amber-50 text-amber-800 border-amber-200';
      bannerText = `Order Preparing — Token #${latestOrder.tokenNumber}`;
    } else {
      bannerBg = 'bg-blue-50 text-blue-800 border-blue-200';
      bannerText = `Order Received — Token #${latestOrder.tokenNumber}`;
    }

    // If there are multiple orders and a prior one is ready, note it cleanly
    const priorReady = activeOrders.filter((o) => o.orderId !== latestOrder.orderId && o.status === 'ready');
    if (priorReady.length > 0 && latestOrder.status !== 'ready') {
      const priorTokens = priorReady.map((o) => `#${o.tokenNumber}`).join(', ');
      bannerText += ` • (Prior Token ${priorTokens} Ready)`;
    }

    return (
      <div className="fixed bottom-4 left-4 right-4 z-40 max-w-lg mx-auto animate-in slide-in-from-bottom duration-300">
        <div className="bg-white rounded-2xl shadow-2xl border border-orange-100/90 overflow-hidden">
          {/* Order Status Top Banner — Clean Linear, No Emoji, Latest Order First */}
          <div className={`border-b px-4 py-2 flex items-center ${bannerBg}`}>
            <p className="text-xs sm:text-[13px] font-semibold truncate">
              {bannerText}
            </p>
          </div>



          {/* Main Order Action Bar */}
          <div
            onClick={onViewActiveOrder}
            className="group bg-gradient-to-r from-[#FF6B00] via-[#FF7A1A] to-[#FF8C33] p-3 px-4 flex items-center justify-between text-white cursor-pointer hover:opacity-98 transition-all select-none"
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Item Thumbnail */}
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/20 border border-white/40 shrink-0 flex items-center justify-center">
                {representativeOrder.lastAddedItem?.image ? (
                  <img
                    src={representativeOrder.lastAddedItem.image}
                    alt={representativeOrder.lastAddedItem.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl">
                    {getCategoryEmoji(representativeOrder.lastAddedItem?.category || '')}
                  </span>
                )}
              </div>

              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-base leading-tight truncate">
                  {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} ordered
                  {activeOrders.length > 1 ? ` (${activeOrders.length} orders)` : ''}
                </span>
                <span className="text-xs text-white/90 font-medium truncate">
                  ₹{combinedTotalPrice} • View order details
                </span>
              </div>
            </div>

            {/* View Order label */}
            <div className="flex items-center gap-1 font-black text-sm sm:text-base text-white group-hover:translate-x-0.5 group-active:scale-95 transition-transform shrink-0">
              <span>View {activeOrders.length > 1 ? 'Orders' : 'Order'}</span>
              <ChevronRight size={18} strokeWidth={3} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
