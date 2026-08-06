'use client';

import React from 'react';
import { Heart } from 'lucide-react';
import type { FoodCardItem } from '@/components/shared/item';
import { FoodTypeIcon } from '../ui/food-type-icon';
import { getCategoryEmoji } from '../utils';

interface SpecialCardProps {
  item: FoodCardItem;
  isLiked: boolean;
  likeCount: number;
  isLikePending: boolean;
  onCardClick: (item: FoodCardItem) => void;
  onLikeClick: (id: string, e: React.MouseEvent) => void;
}

/** Card used inside the All Specials full-screen overlay (2-column grid). */
export function SpecialCard({
  item,
  isLiked,
  likeCount,
  isLikePending,
  onCardClick,
  onLikeClick,
}: SpecialCardProps) {
  const displayPrice =
    item.hasDiscount && item.priceFinal != null
      ? `₹${item.priceFinal}`
      : item.price || '₹199';

  return (
    <div
      onClick={() => onCardClick(item)}
      className="bg-white rounded-2xl p-3 sm:p-4 shadow-xs border border-gray-100 flex flex-col justify-between cursor-pointer hover:shadow-md transition-all group relative overflow-hidden"
    >
      {/* Top Image Box */}
      <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100 relative mb-2.5">
        <button
          type="button"
          disabled={isLikePending}
          onClick={e => onLikeClick(item.id, e)}
          className="absolute top-2 right-2 z-20 p-1.5 bg-white/90 backdrop-blur-md rounded-full shadow-xs text-gray-400 hover:text-rose-500 transition-all active:scale-90 flex items-center justify-center cursor-pointer disabled:opacity-50"
          title={isLiked ? 'Unlike' : 'Like'}
        >
          <Heart
            size={14}
            className={isLiked ? 'text-rose-500 fill-rose-500' : 'text-gray-400'}
            strokeWidth={2.5}
          />
        </button>

        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl bg-orange-50/50">
            {getCategoryEmoji(item.category || '')}
          </div>
        )}

        <div className="absolute top-2 left-2 z-20">
          <FoodTypeIcon type={item.foodType} />
        </div>
      </div>

      {/* Details Content */}
      <div className="flex flex-col flex-1 min-w-0 justify-between gap-1.5">
        <div>
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span className="text-[9.5px] font-black text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.2 rounded-full uppercase">
              Today's Special
            </span>
            {likeCount > 0 && (
              <span className="text-[10px] font-extrabold text-rose-600 flex items-center gap-0.5 ml-auto">
                <Heart size={10} className="text-rose-500 fill-rose-500" /> {likeCount}
              </span>
            )}
          </div>

          <h3 className="font-extrabold text-xs sm:text-base text-gray-900 leading-tight mb-1 group-hover:text-[#FF6B00] transition-colors line-clamp-1">
            {item.title}
          </h3>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100 gap-1 mt-auto">
          <div className="flex flex-col">
            <span className="font-extrabold text-sm sm:text-base text-gray-900">{displayPrice}</span>
            {item.hasDiscount && item.priceOriginal != null && (
              <span className="text-[11px] text-gray-400 line-through font-medium">
                ₹{item.priceOriginal}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              onCardClick(item);
            }}
            className="bg-white text-[#FF6B00] font-bold border border-orange-200 px-3 py-1 rounded-[10px] shadow-sm text-[11px] sm:text-xs hover:bg-orange-50 uppercase transition-transform active:scale-95 flex items-center gap-0.5 cursor-pointer shrink-0"
          >
            ADD <span className="font-normal text-[13px] leading-none text-[#FF6B00]">+</span>
          </button>
        </div>
      </div>
    </div>
  );
}
