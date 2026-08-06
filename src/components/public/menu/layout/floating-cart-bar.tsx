'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import type { CartSummary } from '../types';
import { getCategoryEmoji } from '../utils';
import { formatSavings } from '../utils';

interface FloatingCartBarProps {
  cartSummary: CartSummary;
  onContinue: () => void;
}

export function FloatingCartBar({ cartSummary, onContinue }: FloatingCartBarProps) {
  if (cartSummary.totalItemsCount === 0) return null;

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

          {/* Continue label — only this presses on click */}
          <div className="flex items-center gap-1 font-black text-sm sm:text-base text-white group-hover:translate-x-0.5 group-active:scale-95 transition-transform shrink-0">
            <span>Continue</span>
            <ChevronRight size={18} strokeWidth={3} />
          </div>
        </div>
      </div>
    </div>
  );
}
