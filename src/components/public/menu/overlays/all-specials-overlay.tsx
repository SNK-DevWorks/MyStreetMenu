'use client';

import React from 'react';
import { ChevronLeft } from 'lucide-react';
import type { FoodCardItem } from '@/components/shared/item';
import { SpecialCard } from '../cards/special-card';

interface AllSpecialsOverlayProps {
  items: FoodCardItem[];
  vendorName: string;
  onClose: () => void;
  onItemClick: (item: FoodCardItem) => void;
  isLiked: (id: string) => boolean;
  getLikeCount: (id: string) => number;
  isLikePending: (id: string) => boolean;
  onLikeClick: (id: string, e: React.MouseEvent) => void;
}

export function AllSpecialsOverlay({
  items,
  vendorName,
  onClose,
  onItemClick,
  isLiked,
  getLikeCount,
  isLikePending,
  onLikeClick,
}: AllSpecialsOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 bg-[#FDFBF7] flex flex-col overflow-hidden animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-[#FF6B00] via-[#FF7A1A] to-[#FF8C33] px-4 sm:px-6 py-4 text-white flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all active:scale-90 cursor-pointer"
            aria-label="Back to menu"
          >
            <ChevronLeft size={22} />
          </button>
          <div>
            <h1 className="font-extrabold text-lg sm:text-xl leading-tight">Today's Specials</h1>
            <p className="text-xs text-white/90">{vendorName || 'Special Dishes'}</p>
          </div>
        </div>
        <div className="bg-white/20 backdrop-blur-md text-white text-xs font-black px-3.5 py-1 rounded-full border border-white/30">
          {items.length} Items
        </div>
      </div>

      {/* Dishes Grid — 2 items in a row */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 pb-20">
        <div className="max-w-5xl mx-auto grid grid-cols-2 gap-3 sm:gap-4 md:gap-5">
          {items.map(item => (
            <SpecialCard
              key={`specials-page-${item.id}`}
              item={item}
              isLiked={isLiked(item.id)}
              likeCount={getLikeCount(item.id)}
              isLikePending={isLikePending(item.id)}
              onCardClick={onItemClick}
              onLikeClick={onLikeClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
