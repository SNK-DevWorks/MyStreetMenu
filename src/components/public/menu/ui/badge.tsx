'use client';

import React from 'react';

type BadgeVariant = 'bestseller' | 'special' | 'offer' | 'category' | 'notice';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  bestseller: 'text-amber-600 bg-amber-50 border border-amber-200/60',
  special: 'text-amber-700 bg-amber-50 border border-amber-200/80',
  offer: 'text-[#FF6B00] bg-orange-50 border border-orange-200/60',
  category: 'text-gray-500 bg-gray-100 border border-gray-200/70',
  notice: 'text-white bg-[#FF6B00]',
};

/**
 * Small label badge used across cards and overlays.
 */
export function Badge({ variant = 'category', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`text-[9.5px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
