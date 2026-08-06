'use client';

import React from 'react';

interface FoodTypeIconProps {
  type?: 'veg' | 'non-veg' | 'egg';
  showLabel?: boolean;
}

export function FoodTypeIcon({ type, showLabel = false }: FoodTypeIconProps) {
  const isVeg = type === 'veg';
  const isEgg = type === 'egg';

  const borderColor = isVeg
    ? 'border-green-600'
    : isEgg
    ? 'border-amber-500'
    : 'border-[#8F291D]';

  const dotColor = isVeg ? 'bg-green-600' : isEgg ? 'bg-amber-500' : 'bg-[#8F291D]';
  const textColor = isVeg ? 'text-green-700' : isEgg ? 'text-amber-700' : 'text-[#8F291D]';
  const labelText = isVeg ? 'Veg' : isEgg ? 'Egg' : 'Non-Veg';

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <div
        className={`w-3.5 h-3.5 border ${borderColor} rounded-sm flex items-center justify-center bg-white shadow-xs shrink-0`}
      >
        {isVeg ? (
          <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
        ) : isEgg ? (
          <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
        ) : (
          <div className="w-0 h-0 border-l-[3.5px] border-l-transparent border-b-[5px] border-b-[#8F291D] border-r-[3.5px] border-r-transparent" />
        )}
      </div>
      {showLabel && (
        <span className={`text-[11px] font-bold ${textColor} capitalize`}>{labelText}</span>
      )}
    </div>
  );
}
