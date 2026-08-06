'use client';

import React from 'react';
import { Heart } from 'lucide-react';
import type { FoodCardItem } from '@/components/shared/item';
import { FoodTypeIcon } from '../ui/food-type-icon';
import { QuantityStepper } from '../ui/quantity-stepper';
import { getCategoryEmoji } from '../utils';

interface ItemCardProps {
  item: FoodCardItem;
  quantity: number;
  onCardClick: (item: FoodCardItem) => void;
  onIncrement: (itemId: string) => void;
  onDecrement: (itemId: string) => void;
  onAddFirst: (itemId: string) => void;
  isLiked: boolean;
  likeCount: number;
  isLikePending: boolean;
  onLikeClick: (id: string, e: React.MouseEvent) => void;
  /** 'mobile' renders the horizontal list layout; 'desktop' renders the card grid layout */
  variant?: 'mobile' | 'desktop';
}

export function ItemCard({
  item,
  quantity,
  onCardClick,
  onIncrement,
  onDecrement,
  onAddFirst,
  isLiked,
  likeCount,
  isLikePending,
  onLikeClick,
  variant = 'mobile',
}: ItemCardProps) {
  const displayPrice =
    item.hasDiscount && item.priceFinal != null
      ? `₹${item.priceFinal}`
      : item.price || '₹199';

  const offerBadge =
    item.resolvedOffer?.badge ||
    (item.hasDiscount &&
    item.priceOriginal != null &&
    item.priceFinal != null &&
    item.priceOriginal > item.priceFinal
      ? `${Math.round(((item.priceOriginal - item.priceFinal) / item.priceOriginal) * 100)}% OFF`
      : null);

  const imageOrEmoji = item.image ? (
    <img
      src={item.image}
      alt={item.title}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
    />
  ) : (
    <div className="w-full h-full flex items-center justify-center text-4xl bg-orange-50/50">
      {getCategoryEmoji(item.category || '')}
    </div>
  );

  const stepper = quantity > 0 ? (
    <QuantityStepper
      quantity={quantity}
      onDecrement={() => onDecrement(item.id)}
      onIncrement={() => onIncrement(item.id)}
      className="w-full"
    />
  ) : (
    <button
      type="button"
      onClick={e => {
        e.stopPropagation();
        onAddFirst(item.id);
      }}
      className="w-full bg-white text-[#FF6B00] font-bold border border-orange-200 py-2 rounded-[12px] shadow-md text-[13px] hover:bg-orange-50 uppercase transition-transform active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
    >
      ADD <span className="font-normal leading-none text-[16px]">+</span>
    </button>
  );

  // ── Mobile (horizontal list) layout ──────────────────────────────────────────
  if (variant === 'mobile') {
    return (
      <div
        onClick={() => onCardClick(item)}
        className="flex gap-3 group cursor-pointer border-b border-gray-100 pb-7 sm:pb-4 sm:border-b-0 sm:bg-gray-50/60 sm:p-4 sm:rounded-2xl sm:border sm:border-gray-100 sm:hover:shadow-md sm:transition-all"
      >
        {/* Details Side */}
        <div className="flex-1 flex flex-col justify-center min-w-0 py-1.5">
          <div className="flex items-center gap-2 mb-2.5">
            <FoodTypeIcon type={item.foodType} />
            {item.isBestseller && (
              <span className="text-[9.5px] font-black text-amber-600 bg-amber-50 border border-amber-200/60 px-1.5 py-0.2 rounded shrink-0">
                BESTSELLER
              </span>
            )}
            {item.isTodaysSpecial && (
              <span className="text-[9.5px] font-black text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.2 rounded uppercase shrink-0">
                TODAY'S SPECIAL
              </span>
            )}
            {(likeCount > 0 || isLiked) && (
              <button
                type="button"
                disabled={isLikePending}
                onClick={e => onLikeClick(item.id, e)}
                className="flex items-center gap-1 text-[11px] font-extrabold text-rose-600 transition-transform active:scale-90 cursor-pointer border-none bg-transparent ml-1"
              >
                <Heart
                  size={13}
                  fill={isLiked ? 'currentColor' : 'none'}
                  className="text-rose-500"
                  strokeWidth={2.5}
                />
                {likeCount > 0 && <span>{likeCount}</span>}
              </button>
            )}
          </div>

          <h3 className="font-bold text-[16.5px] text-gray-900 leading-tight mb-1.5 group-hover:text-[#FF6B00] transition-colors">
            {item.title}
          </h3>

          <div className="flex flex-col gap-1 mb-1">
            <div className="flex items-baseline gap-2">
              <span className="font-extrabold text-[16px] text-gray-900">{displayPrice}</span>
              {item.hasDiscount && item.priceOriginal != null && (
                <span className="text-[12px] text-gray-400 line-through font-medium">
                  ₹{item.priceOriginal}
                </span>
              )}
            </div>
            {offerBadge && (
              <span className="text-[#FF6B00] text-[10.5px] font-black uppercase tracking-wider inline-block">
                {offerBadge}
              </span>
            )}
          </div>
        </div>

        {/* Image & Button Side */}
        <div className="relative w-[140px] xs:w-[155px] sm:w-[165px] flex-shrink-0 flex flex-col items-center">
          <div className="w-[140px] h-[140px] xs:w-[155px] xs:h-[155px] sm:w-[165px] sm:h-[165px] rounded-[22px] overflow-hidden shadow-xs relative bg-gray-50 border border-gray-100">
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
            {imageOrEmoji}
            {(item.resolvedOffer || item.badgeLabel) && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 to-transparent pt-6 pb-2 px-2 text-center">
                <span className="text-white text-[9.5px] font-black uppercase tracking-wider block truncate">
                  {item.resolvedOffer?.badge || item.badgeLabel}
                </span>
              </div>
            )}
          </div>

          <div className="absolute -bottom-3.5 z-10 w-full px-2" onClick={e => e.stopPropagation()}>
            {stepper}
          </div>
        </div>
      </div>
    );
  }

  // ── Desktop (card grid) layout ────────────────────────────────────────────────
  return (
    <div
      onClick={() => onCardClick(item)}
      className="bg-white rounded-2xl p-4 shadow-2xs border border-gray-100 flex gap-4 cursor-pointer hover:shadow-md transition-all group"
    >
      <div className="flex-1 flex flex-col justify-center min-w-0 py-1.5">
        <div className="flex items-center gap-2 mb-2.5 flex-wrap">
          <FoodTypeIcon type={item.foodType} />
          {item.category && (
            <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200/70 shrink-0">
              {item.category}
            </span>
          )}
          {item.isBestseller && (
            <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded shrink-0">
              BESTSELLER
            </span>
          )}
          {item.isTodaysSpecial && (
            <span className="text-[10px] font-black text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 rounded uppercase shrink-0">
              TODAY'S SPECIAL
            </span>
          )}
          {(likeCount > 0 || isLiked) && (
            <button
              type="button"
              disabled={isLikePending}
              onClick={e => onLikeClick(item.id, e)}
              className="flex items-center gap-1 text-[11px] font-extrabold text-rose-600 transition-transform active:scale-90 cursor-pointer border-none bg-transparent ml-1"
            >
              <Heart
                size={13}
                fill={isLiked ? 'currentColor' : 'none'}
                className="text-rose-500"
                strokeWidth={2.5}
              />
              {likeCount > 0 && <span>{likeCount}</span>}
            </button>
          )}
        </div>
        <h3 className="font-bold text-base text-gray-900 group-hover:text-[#FF6B00] transition-colors leading-tight mb-1.5 truncate">
          {item.title}
        </h3>
        <div className="flex flex-col gap-1 mb-1">
          <div className="flex items-baseline gap-2">
            <span className="font-extrabold text-base text-gray-900">{displayPrice}</span>
            {item.hasDiscount && item.priceOriginal != null && (
              <span className="text-xs text-gray-400 line-through">₹{item.priceOriginal}</span>
            )}
          </div>
          {offerBadge && (
            <span className="text-[#FF6B00] text-[10.5px] font-black uppercase tracking-wider inline-block">
              {offerBadge}
            </span>
          )}
        </div>
      </div>

      <div className="relative w-32 xl:w-36 flex-shrink-0 flex flex-col items-center">
        <div className="w-32 h-32 xl:w-36 xl:h-36 rounded-2xl overflow-hidden bg-gray-50 relative border border-gray-100 shadow-2xs">
          <button
            type="button"
            disabled={isLikePending}
            onClick={e => onLikeClick(item.id, e)}
            className="absolute top-1.5 right-1.5 z-20 p-1 bg-white/90 backdrop-blur-md rounded-full shadow-xs text-gray-400 hover:text-rose-500 transition-all active:scale-90 flex items-center justify-center cursor-pointer disabled:opacity-50"
            title={isLiked ? 'Unlike' : 'Like'}
          >
            <Heart
              size={13}
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
            <div className="w-full h-full flex items-center justify-center text-3xl">
              {getCategoryEmoji(item.category || '')}
            </div>
          )}
        </div>

        <div
          className="absolute -bottom-3 z-10 w-28 xl:w-32 px-1"
          onClick={e => e.stopPropagation()}
        >
          {quantity > 0 ? (
            <QuantityStepper
              quantity={quantity}
              onDecrement={() => onDecrement(item.id)}
              onIncrement={() => onIncrement(item.id)}
              className="w-full"
            />
          ) : (
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onAddFirst(item.id);
              }}
              className="w-full bg-white text-[#FF6B00] font-bold border border-orange-200 py-1.5 rounded-[12px] shadow-md text-[13px] hover:bg-orange-50 uppercase transition-transform active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
            >
              ADD <span className="font-normal leading-none text-[16px]">+</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
