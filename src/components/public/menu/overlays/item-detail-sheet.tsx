'use client';

import React, { useState, useEffect } from 'react';
import { X, Share2, Umbrella } from 'lucide-react';
import type { FoodCardItem } from '@/components/shared/item';
import { FoodTypeIcon } from '../ui/food-type-icon';
import { LikeButton } from '../ui/like-button';
import { QuantityStepper } from '../ui/quantity-stepper';
import { getCategoryEmoji, getItemUnitPrice } from '../utils';
import { SHEET_ANIMATION, SHEET_CLOSE_DURATION_MS } from '../constants';

interface ItemDetailSheetProps {
  item: FoodCardItem;
  initialQuantity: number;
  onClose: () => void;
  onAddToCart: (itemId: string, quantity: number) => void;
  isLiked: boolean;
  likeCount: number;
  isLikePending: boolean;
  onLikeClick: (id: string, e: React.MouseEvent) => void;
  onShare: () => void;
}

export function ItemDetailSheet({
  item,
  initialQuantity,
  onClose,
  onAddToCart,
  isLiked,
  likeCount,
  isLikePending,
  onLikeClick,
  onShare,
}: ItemDetailSheetProps) {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => onClose(), SHEET_CLOSE_DURATION_MS);
  };

  const handleAdd = () => {
    const qtyToAdd = quantity > 0 ? quantity : 1;
    onAddToCart(item.id, qtyToAdd);
    handleClose();
  };

  const unitPrice = getItemUnitPrice(item);
  const totalPrice = unitPrice * quantity;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 overflow-visible ${
        isClosing ? SHEET_ANIMATION.backdropOut : SHEET_ANIMATION.backdropIn
      } bg-black/65 backdrop-blur-xs`}
      onClick={handleClose}
    >
      {/* Outer Wrapper for Floating Close Button + Sheet Card */}
      <div
        className="relative w-full max-w-lg overflow-visible my-0 sm:my-auto cursor-default"
        onClick={e => e.stopPropagation()}
      >
        {/* Top-Center Floating Circular Close Button (X) */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute -top-13 left-1/2 -translate-x-1/2 z-50 w-11 h-11 rounded-full bg-slate-900/90 hover:bg-slate-950 text-white shadow-xl border border-white/20 flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
          aria-label="Close details"
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        {/* Main Sheet Card Body */}
        <div
          className={`relative w-full max-h-[88vh] sm:max-h-[84vh] bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col overflow-hidden ${
            isClosing ? SHEET_ANIMATION.out : SHEET_ANIMATION.in
          }`}
        >
          {/* Inset Padded Rounded Corner Dish Image Card */}
          <div className="p-3 sm:p-4 pb-0 shrink-0">
            <div className="relative w-full aspect-[4/3] xs:aspect-[16/10] sm:aspect-[16/9] rounded-[24px] overflow-hidden bg-gray-50 border border-gray-100 shadow-xs">
              {/* Food Type Badge */}
              {item.foodType && (
                <div className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-xs flex items-center gap-1.5 border border-gray-100">
                  <FoodTypeIcon type={item.foodType} />
                  <span className="text-[11px] font-bold text-gray-700 capitalize">{item.foodType}</span>
                </div>
              )}
              {item.image ? (
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-7xl bg-orange-50/50">
                  {getCategoryEmoji(item.category || '')}
                </div>
              )}
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
            {/* Title & Action Buttons Row */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight tracking-tight">
                  {item.title}
                </h3>
                {item.category && (
                  <span className="text-xs font-bold text-[#FF6B00] bg-orange-50 px-2.5 py-0.5 rounded-md self-start border border-orange-200/60">
                    {item.category}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <LikeButton
                  itemId={item.id}
                  isLiked={isLiked}
                  likeCount={likeCount}
                  isPending={isLikePending}
                  onClick={e => onLikeClick(item.id, e)}
                  variant="pill"
                />
                <button
                  type="button"
                  onClick={onShare}
                  className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-all active:scale-95 cursor-pointer"
                  title="Share Dish"
                >
                  <Share2 size={16} />
                </button>
              </div>
            </div>

            {/* Description */}
            {item.description ? (
              <div className="bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100">
                <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed">
                  {item.description}
                </p>
              </div>
            ) : null}

            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap pt-0.5">
              {item.isBestseller && (
                <span className="text-[10.5px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg uppercase">
                  ⭐ Bestseller
                </span>
              )}
              {item.isTodaysSpecial && (
                <span className="text-[10.5px] font-black text-amber-800 bg-amber-100/80 border border-amber-300 px-2.5 py-1 rounded-lg uppercase">
                  🔥 Today's Special
                </span>
              )}
              <span className="text-[10.5px] font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <Umbrella size={12} className="text-gray-400" /> Freshly Prepared
              </span>
            </div>
          </div>

          {/* Sticky Bottom Stepper & Add Action Bar */}
          <div className="sticky bottom-0 z-30 bg-white border-t border-gray-100 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] shrink-0">
            {/* Stepper Box */}
            <div className="border border-orange-300/90 bg-orange-50/50 rounded-2xl p-1 px-3 flex items-center justify-between w-28 sm:w-32 h-12 shrink-0 shadow-2xs">
              <button
                type="button"
                onClick={() =>
                  setQuantity(q => {
                    const next = Math.max(0, q - 1);
                    return next;
                  })
                }
                className="text-[#FF6B00] hover:text-orange-700 font-bold text-xl w-7 h-full flex items-center justify-center cursor-pointer active:scale-90 transition-transform select-none"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="text-gray-900 font-black text-base w-6 text-center select-none">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(q => q + 1)}
                className="text-[#FF6B00] hover:text-orange-700 font-bold text-xl w-7 h-full flex items-center justify-center cursor-pointer active:scale-90 transition-transform select-none"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            {/* Add Item Button */}
            <button
              type="button"
              onClick={handleAdd}
              className="bg-gradient-to-r from-[#FF6B00] via-[#FF7A1A] to-[#FF8C33] hover:opacity-95 text-white font-extrabold text-base sm:text-lg rounded-2xl flex-1 h-12 shadow-md active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Add item ₹{totalPrice}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
