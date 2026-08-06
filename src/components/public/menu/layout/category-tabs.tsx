'use client';

import React from 'react';

interface CategoryTabsProps {
  categories: string[];
  selectedCategory: string;
  onSelect: (cat: string) => void;
  className?: string;
}

/** Horizontal scrollable category pill row used on both mobile and desktop. */
export function CategoryTabs({ categories, selectedCategory, onSelect, className = '' }: CategoryTabsProps) {
  return (
    <div className={`flex gap-2.5 overflow-x-auto hide-scrollbar pb-2 touch-pan-x ${className}`}>
      {categories.map((cat, idx) => {
        const isActive = selectedCategory === cat;
        return (
          <button
            key={`cat-${idx}`}
            type="button"
            onClick={() => onSelect(cat)}
            className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-[13px] sm:text-[14px] font-bold transition-all shrink-0 cursor-pointer ${
              isActive
                ? 'bg-[#FF6B00] text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200/80 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
