'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Heart, ChevronLeft, ChevronRight, Umbrella } from 'lucide-react';
import type { FoodCardItem } from '@/components/shared/item';
import { FoodTypeIcon } from '../ui/food-type-icon';
import { getCategoryEmoji } from '../utils';
import { SPECIAL_CAROUSEL_INTERVAL_MS } from '../constants';

interface TodaysSpecialCarouselProps {
  items: FoodCardItem[];
  onItemClick: (item: FoodCardItem) => void;
  onLikeClick: (id: string, e: React.MouseEvent) => void;
  isLiked: (id: string) => boolean;
  getLikeCount: (id: string) => number;
  isLikePending: (id: string) => boolean;
  onViewAllSpecials?: () => void;
}

export function TodaysSpecialCarousel({
  items,
  onItemClick,
  onLikeClick,
  isLiked,
  getLikeCount,
  isLikePending,
  onViewAllSpecials,
}: TodaysSpecialCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  // Mouse drag-to-scroll state for desktop hold-to-slide
  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);

  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) return;
    const containerCenter = container.scrollLeft + container.clientWidth / 2;
    const children = Array.from(container.children) as HTMLElement[];
    let minDistance = Infinity;
    let closestIndex = 0;
    children.forEach((child, idx) => {
      const childCenter = child.offsetLeft + child.offsetWidth / 2;
      const distance = Math.abs(childCenter - containerCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = idx;
      }
    });
    if (closestIndex !== activeIndex) setActiveIndex(closestIndex);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const container = scrollRef.current;
    if (!container) return;
    isMouseDownRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.pageX - container.offsetLeft;
    scrollLeftRef.current = container.scrollLeft;
    setIsUserInteracting(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current) return;
    const container = scrollRef.current;
    if (!container) return;
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startXRef.current) * 1.4;
    if (Math.abs(walk) > 6) hasDraggedRef.current = true;
    container.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
    setTimeout(() => setIsUserInteracting(false), 3000);
  };

  const handleMouseLeave = () => {
    if (isMouseDownRef.current) {
      isMouseDownRef.current = false;
      setIsUserInteracting(false);
    }
  };

  const handleCardClick = (item: FoodCardItem) => {
    if (hasDraggedRef.current) {
      hasDraggedRef.current = false;
      return;
    }
    onItemClick(item);
  };

  const scrollByStep = (direction: 'left' | 'right') => {
    const container = scrollRef.current;
    if (!container) return;
    const cardWidth = container.firstElementChild?.clientWidth || 295;
    const scrollAmount = (cardWidth + 16) * 1.5;
    container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) return;
    if (isUserInteracting || !items || items.length <= 1) return;
    const interval = setInterval(() => {
      const container = scrollRef.current;
      if (!container) return;
      const cardWidth = container.firstElementChild?.clientWidth || 280;
      const gap = 16;
      const scrollStep = cardWidth + gap;
      const maxScroll = container.scrollWidth - container.clientWidth;
      if (container.scrollLeft >= maxScroll - 10) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollStep, behavior: 'smooth' });
      }
    }, SPECIAL_CAROUSEL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isUserInteracting, items]);

  if (!items || items.length === 0) return null;

  return (
    <div className="relative z-20 pt-6 pb-6 mb-2 overflow-visible bg-[#FDFBF7] group/carousel">
      {/* Soft Ambient Light Glow */}
      <div className="absolute top-1 left-1/2 -translate-x-1/2 w-[280px] h-[130px] bg-[#FF6B00]/14 rounded-full blur-[45px] pointer-events-none" />

      <div className="flex flex-col items-center mb-4 px-4 relative z-10">
        <div className="bg-[#FF6B00] text-white text-[11px] font-bold px-3 py-1 rounded-sm mb-1.5 relative shadow-xs tracking-wide">
          Must Try
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-t-[5px] border-t-[#FF6B00] border-r-[5px] border-r-transparent" />
        </div>
        <h2 className="text-[22px] font-extrabold text-gray-900 tracking-tight">Today's Special</h2>
      </div>

      <div className="relative w-full px-0 lg:px-6">
        <button
          type="button"
          onClick={() => scrollByStep('left')}
          className="hidden lg:flex absolute left-6 top-1/2 -translate-y-1/2 -translate-x-1/2 z-30 w-11 h-11 xl:w-12 xl:h-12 rounded-full bg-white hover:bg-slate-50 text-slate-900 shadow-2xl border border-gray-200/90 backdrop-blur-md items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer group/btn"
          aria-label="Previous special items"
        >
          <ChevronLeft size={22} className="text-slate-800 group-hover/btn:-translate-x-0.5 transition-transform stroke-[2.5]" />
        </button>

        <button
          type="button"
          onClick={() => scrollByStep('right')}
          className="hidden lg:flex absolute right-6 top-1/2 -translate-y-1/2 translate-x-1/2 z-30 w-11 h-11 xl:w-12 xl:h-12 rounded-full bg-white hover:bg-slate-50 text-slate-900 shadow-2xl border border-gray-200/90 backdrop-blur-md items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer group/btn"
          aria-label="Next special items"
        >
          <ChevronRight size={22} className="text-slate-800 group-hover/btn:translate-x-0.5 transition-transform stroke-[2.5]" />
        </button>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onMouseEnter={() => setIsUserInteracting(true)}
          onTouchStart={() => setIsUserInteracting(true)}
          onTouchEnd={() => setTimeout(() => setIsUserInteracting(false), 3000)}
          className="flex gap-4 overflow-x-auto hide-scrollbar snap-x snap-mandatory scroll-smooth px-[calc(50%-130px)] xs:px-[calc(50%-138px)] sm:px-[calc(50%-148px)] lg:px-0 lg:snap-none lg:w-full lg:max-w-none py-4 relative z-10 touch-pan-x items-center lg:justify-start cursor-grab active:cursor-grabbing select-none"
        >
          {items.map((item, index) => {
            const itemIsLiked = isLiked(item.id);
            const itemLikeCount = getLikeCount(item.id);
            const isPending = isLikePending(item.id);
            const isActive = index === activeIndex;

            return (
              <div
                key={`${item.id}-${index}`}
                onClick={() => handleCardClick(item)}
                className={`snap-center shrink-0 w-[260px] xs:w-[275px] sm:w-[295px] h-[315px] sm:h-[330px] rounded-[24px] overflow-hidden flex flex-col cursor-pointer bg-[#1C1C1C] border select-none transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                  isActive
                    ? 'scale-100 opacity-100 z-20 shadow-none border-[#FF6B00]/40 lg:scale-100 lg:opacity-100 lg:z-10 lg:border-white/10 lg:hover:border-[#FF6B00]/60 lg:hover:scale-[1.02] lg:hover:shadow-xl'
                    : 'scale-[0.88] opacity-75 z-10 shadow-none border-black/10 lg:scale-100 lg:opacity-100 lg:z-10 lg:border-white/10 lg:hover:border-[#FF6B00]/60 lg:hover:scale-[1.02] lg:hover:shadow-xl'
                }`}
              >
                <div className="relative flex-1 w-full bg-[#1C1C1C]">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
                      draggable="false"
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-gray-800 to-gray-950">
                      {getCategoryEmoji(item.category || '')}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

                  {/* Top overlay badge bar */}
                  <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
                    <FoodTypeIcon type={item.foodType} />
                    {(item.resolvedOffer?.badge ||
                      (item.hasDiscount &&
                        item.priceOriginal != null &&
                        item.priceFinal != null &&
                        item.priceOriginal > item.priceFinal)) && (
                      <span className="bg-[#FF6B00] text-white font-black text-[10px] px-2.5 py-0.5 rounded-md shadow-md uppercase tracking-wider">
                        {item.resolvedOffer?.badge ||
                          `${Math.round(((item.priceOriginal! - item.priceFinal!) / item.priceOriginal!) * 100)}% OFF`}
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white flex flex-col gap-1.5">
                    <div className="flex justify-between items-baseline w-full">
                      <h3 className="font-bold text-[17.5px] leading-tight pr-2 drop-shadow-md line-clamp-1">
                        {item.title}
                      </h3>
                      <div className="flex items-baseline gap-1.5 shrink-0 drop-shadow-md">
                        <span className="font-extrabold text-[17.5px]">
                          {item.hasDiscount && item.priceFinal != null
                            ? `₹${item.priceFinal}`
                            : item.price || '₹199'}
                        </span>
                        {item.hasDiscount && item.priceOriginal != null && (
                          <span className="text-[12px] text-gray-300/90 line-through font-normal">
                            ₹{item.priceOriginal}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-300 text-[12.5px] drop-shadow-md -mt-0.5 truncate">
                      {item.category || 'Special Dish'}
                    </p>

                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-2 text-[12px] font-medium">
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={e => onLikeClick(item.id, e)}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-[6px] shadow-sm text-[11.5px] font-bold transition-all ${
                            itemIsLiked
                              ? 'bg-rose-600 text-white'
                              : 'bg-black/50 backdrop-blur-md text-white border border-white/20 hover:bg-black/70'
                          }`}
                          title={itemIsLiked ? 'Liked' : 'Like this dish'}
                        >
                          <Heart
                            size={12}
                            fill={itemIsLiked ? 'currentColor' : 'none'}
                            className={itemIsLiked ? 'text-white' : 'text-rose-400'}
                            strokeWidth={2.5}
                          />
                          {itemLikeCount > 0 && <span>{itemLikeCount}</span>}
                        </button>
                        <span className="text-gray-400">|</span>
                        <span className="text-gray-200 flex items-center gap-1 drop-shadow-md text-[11.5px]">
                          <Umbrella size={12} className="text-gray-300" /> Fresh
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          onItemClick(item);
                        }}
                        className="bg-white text-[#E23744] font-bold px-3.5 py-1 rounded-[8px] shadow-xs text-[12.5px] hover:bg-gray-50 active:scale-95 transition-transform flex items-center gap-1 border border-[#E23744]/20"
                      >
                        ADD <span className="font-normal text-[15px] leading-none text-[#E23744]">+</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-[#2A3022] px-3 py-2 flex items-center justify-between text-[#93A274] text-[11px] font-medium shrink-0 z-10 border-t border-black/20">
                  <div className="flex items-center gap-1.5 text-white">
                    <div className="text-[#84B645] flex items-center justify-center drop-shadow-xs">
                      <Heart size={13} fill={itemIsLiked ? 'currentColor' : 'none'} strokeWidth={2} />
                    </div>
                    {itemIsLiked ? 'Liked' : 'Must Try'}
                  </div>
                  <div>{item.badgeLabel || 'Popular'}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {onViewAllSpecials && (
        <div className="mt-3 flex justify-center relative z-20">
          <button
            type="button"
            onClick={onViewAllSpecials}
            className="bg-black hover:bg-slate-900 text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full shadow-xs flex items-center gap-1 active:scale-95 transition-all cursor-pointer border border-white/10"
          >
            <span>View All</span>
            <ChevronRight size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
