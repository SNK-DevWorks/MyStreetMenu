'use client';

import React from 'react';
import { ChevronRight, Check } from 'lucide-react';
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
    const latestOrder = activeOrders[activeOrders.length - 1];
    const totalItemsCount = activeOrders.reduce((sum, o) => sum + o.itemsCount, 0);
    const combinedTotalPrice = activeOrders.reduce((sum, o) => sum + o.totalPrice, 0);

    const bannerText = activeOrders.length > 1
      ? `${activeOrders.length} Orders Placed • Latest: Token #${latestOrder.tokenNumber}`
      : `Order Placed • Token #${latestOrder.tokenNumber}`;

    return (
      <div className="fixed bottom-4 left-4 right-4 z-40 max-w-lg mx-auto animate-in slide-in-from-bottom duration-300">
        <div className="bg-white rounded-2xl shadow-2xl border border-orange-100/90 overflow-hidden">
          {/* Order Status Top Banner */}
          <div className="bg-emerald-50/95 border-b border-emerald-100 px-4 py-2 flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[#00B56A] text-white flex items-center justify-center shrink-0">
              <Check size={12} strokeWidth={3} />
            </div>
            <p className="text-xs sm:text-[13px] font-bold text-emerald-800 truncate">
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
                {latestOrder.lastAddedItem?.image ? (
                  <img
                    src={latestOrder.lastAddedItem.image}
                    alt={latestOrder.lastAddedItem.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl">
                    {getCategoryEmoji(latestOrder.lastAddedItem?.category || '')}
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
