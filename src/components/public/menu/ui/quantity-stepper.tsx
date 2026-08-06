'use client';

import React from 'react';

interface QuantityStepperProps {
  quantity: number;
  onDecrement: () => void;
  onIncrement: () => void;
  /** Extra classes for the outer wrapper */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md';
}

/**
 * Reusable [ − qty + ] quantity stepper used on item cards and the detail sheet.
 */
export function QuantityStepper({
  quantity,
  onDecrement,
  onIncrement,
  className = '',
  size = 'md',
}: QuantityStepperProps) {
  const isSmall = size === 'sm';

  return (
    <div
      className={`bg-white text-[#FF6B00] font-black border border-[#FF6B00] py-1 px-1.5 rounded-[12px] shadow-md flex items-center justify-between transition-all ${className}`}
    >
      <button
        type="button"
        onClick={onDecrement}
        className={`flex items-center justify-center font-extrabold text-[#FF6B00] hover:bg-orange-50 rounded-lg active:scale-90 transition-transform cursor-pointer select-none ${isSmall ? 'w-5 h-5 text-sm' : 'w-6 h-6 text-base'}`}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className={`font-extrabold text-gray-900 select-none text-center ${isSmall ? 'text-xs w-4' : 'text-sm w-6'}`}>
        {quantity}
      </span>
      <button
        type="button"
        onClick={onIncrement}
        className={`flex items-center justify-center font-extrabold text-[#FF6B00] hover:bg-orange-50 rounded-lg active:scale-90 transition-transform cursor-pointer select-none ${isSmall ? 'w-5 h-5 text-sm' : 'w-6 h-6 text-base'}`}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
