'use client';

import React from 'react';
import { Heart } from 'lucide-react';

interface LikeButtonProps {
  itemId: string;
  isLiked: boolean;
  likeCount: number;
  isPending: boolean;
  onClick: (e: React.MouseEvent) => void;
  /** Visual variant */
  variant?: 'pill' | 'icon' | 'inline';
  className?: string;
}

/**
 * Reusable like/heart button with pill, icon-only, and inline count variants.
 */
export function LikeButton({
  isLiked,
  likeCount,
  isPending,
  onClick,
  variant = 'icon',
  className = '',
}: LikeButtonProps) {
  if (variant === 'pill') {
    return (
      <button
        type="button"
        disabled={isPending}
        onClick={onClick}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold border transition-all active:scale-95 ${
          isLiked
            ? 'bg-rose-600 text-white border-rose-600'
            : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
        } ${className}`}
      >
        <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} strokeWidth={2.5} />
        <span>{likeCount}</span>
      </button>
    );
  }

  if (variant === 'inline') {
    return (
      <button
        type="button"
        disabled={isPending}
        onClick={onClick}
        className={`flex items-center gap-1 text-[11px] font-extrabold text-rose-600 transition-transform active:scale-90 cursor-pointer border-none bg-transparent ${className}`}
      >
        <Heart
          size={13}
          fill={isLiked ? 'currentColor' : 'none'}
          className="text-rose-500"
          strokeWidth={2.5}
        />
        {likeCount > 0 && <span>{likeCount}</span>}
      </button>
    );
  }

  // icon variant (default)
  return (
    <button
      type="button"
      disabled={isPending}
      onClick={onClick}
      className={`p-1.5 bg-white/90 backdrop-blur-md rounded-full shadow-xs text-gray-400 hover:text-rose-500 transition-all active:scale-90 flex items-center justify-center cursor-pointer disabled:opacity-50 ${className}`}
    >
      <Heart
        size={14}
        className={isLiked ? 'text-rose-500 fill-rose-500' : 'text-gray-400'}
        strokeWidth={2.5}
      />
    </button>
  );
}
