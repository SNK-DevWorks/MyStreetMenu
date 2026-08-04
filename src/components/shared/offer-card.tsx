/**
 * OfferCard — Shared component used by both the vendor promotions page
 * and the public-facing menu view.
 *
 * Rendering logic:
 *   - If offer.banner is set → banner image as background + always-on gradient
 *     overlay (top-to-bottom dark gradient) so white text is always readable.
 *   - If no banner → gradient default card using GRADIENT_PALETTES (branded,
 *     never plain pastel).
 */

import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OfferCardData {
  id: string;
  title: string;
  badge: string;
  type: string;
  targetType: string;
  targetCount: number;
  /** Specific resolved category or item names (e.g. ["Burgers", "Drinks"]) */
  targetNames?: string[];
  startTime: string | null;
  endTime: string | null;
  /** Fully resolved CDN URL from publish.service (never a raw R2 key) */
  banner: { image: string; alt: string } | null;
}

// ─── Gradient Palettes (branded, replaces flat pastel) ────────────────────────

export const GRADIENT_PALETTES = [
  {
    gradient: 'from-[#f77512] to-[#c2410c]',
    badgeBg: 'bg-white/20',
    badgeText: 'text-white',
    arcStroke: 'rgba(255,255,255,0.15)',
  },
  {
    gradient: 'from-violet-600 to-purple-900',
    badgeBg: 'bg-white/20',
    badgeText: 'text-white',
    arcStroke: 'rgba(255,255,255,0.15)',
  },
  {
    gradient: 'from-emerald-500 to-teal-700',
    badgeBg: 'bg-white/20',
    badgeText: 'text-white',
    arcStroke: 'rgba(255,255,255,0.15)',
  },
  {
    gradient: 'from-rose-500 to-pink-800',
    badgeBg: 'bg-white/20',
    badgeText: 'text-white',
    arcStroke: 'rgba(255,255,255,0.15)',
  },
  {
    gradient: 'from-sky-500 to-blue-800',
    badgeBg: 'bg-white/20',
    badgeText: 'text-white',
    arcStroke: 'rgba(255,255,255,0.15)',
  },
  {
    gradient: 'from-amber-500 to-orange-800',
    badgeBg: 'bg-white/20',
    badgeText: 'text-white',
    arcStroke: 'rgba(255,255,255,0.15)',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatApplyScope(targetType: string, targetCount: number, targetNames?: string[]): string {
  if (targetType === 'all') return 'Valid on Entire Menu';

  if (targetNames && targetNames.length > 0) {
    if (targetNames.length === 1) return `Valid on ${targetNames[0]}`;
    if (targetNames.length === 2) return `Valid on ${targetNames[0]} & ${targetNames[1]}`;
    return `Valid on ${targetNames[0]} +${targetNames.length - 1} more`;
  }

  if (targetType === 'category')
    return `Valid on ${targetCount} Categor${targetCount !== 1 ? 'ies' : 'y'}`;
  return `Valid on ${targetCount} Selected Item${targetCount !== 1 ? 's' : ''}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface OfferCardProps {
  offer: OfferCardData;
  index: number;
  /** 'sm' = mobile (w-72, min-h-[155px]), 'md' = desktop (w-80, min-h-[175px]) */
  size?: 'sm' | 'md';
  className?: string;
}

export function OfferCard({ offer, index, size = 'md', className = '' }: OfferCardProps) {
  const theme = GRADIENT_PALETTES[index % GRADIENT_PALETTES.length];
  const hasBanner = !!offer.banner?.image;
  const applyScope = formatApplyScope(offer.targetType, offer.targetCount, offer.targetNames);

  const isSm = size === 'sm';
  const isFullWidth = className.includes('w-full');
  const cardWidth = isFullWidth ? 'w-full' : isSm ? 'w-72' : 'w-80';
  const cardHeight = isFullWidth ? 'min-h-[175px] sm:min-h-[210px]' : isSm ? 'min-h-[155px]' : 'min-h-[175px]';
  const cardPadding = isFullWidth ? 'p-4 sm:p-6' : isSm ? 'p-4 sm:p-5' : 'p-5 sm:p-6';
  const titleSize = isFullWidth ? 'text-xl sm:text-2xl' : isSm ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl';
  const roundedClass = className.includes('rounded-') ? '' : 'rounded-2xl';

  return (
    <div
      key={offer.id}
      className={`relative ${cardWidth} ${cardHeight} ${roundedClass} overflow-hidden flex flex-col justify-between ${cardPadding} shadow-sm transition-all hover:shadow-md shrink-0 ${className}`}
      style={
        hasBanner
          ? {
              backgroundImage: `url("${offer.banner!.image}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined
      }
    >
      {/* ── Background: gradient default OR always-on overlay on banner ─── */}
      {hasBanner ? (
        // Always-on dark gradient overlay so white text is ALWAYS readable
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/15" />
      ) : (
        // Branded gradient background (no banner)
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient}`} />
      )}

      {/* Decorative arcs */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.12]">
        <svg width="100%" height="100%" viewBox="0 0 340 144" fill="none">
          <circle cx="240" cy="72" r="70" stroke={hasBanner ? 'white' : theme.arcStroke} strokeWidth="2.5" />
          <circle cx="240" cy="72" r="95" stroke={hasBanner ? 'white' : theme.arcStroke} strokeWidth="2.5" />
        </svg>
      </div>

      {/* Content — always z-10, always white */}
      <div className="flex flex-col z-10 w-[88%] justify-between h-full gap-2">
        {/* High-Impact Promo Sticker Badge */}
        {offer.badge && (
          <div className="self-start inline-flex items-center gap-1.5 bg-amber-400 text-slate-950 text-xs sm:text-sm font-black px-3.5 py-1 rounded-xl shadow-lg border border-amber-300 uppercase tracking-wider transform -rotate-1 active:scale-95 transition-transform">
            <span>{offer.badge}</span>
          </div>
        )}

        <div className="flex flex-col gap-1.5 mt-auto">
          {/* Main Headline Title — Bigger & bolder */}
          <h3 className={`${titleSize} font-black text-white leading-tight tracking-tight drop-shadow-md uppercase`}>
            {offer.title}
          </h3>

          {/* Banner Subtitle Pills — Scope & Schedule */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] sm:text-[11px] font-black text-amber-300 bg-black/40 border border-amber-400/30 backdrop-blur-md px-2.5 py-0.5 rounded-lg shadow-xs tracking-wide uppercase">
              {applyScope}
            </span>

            {offer.startTime && offer.endTime && (
              <span className="text-[10px] sm:text-[11px] font-extrabold text-white/90 bg-black/40 border border-white/20 px-2.5 py-0.5 rounded-lg backdrop-blur-md shadow-xs">
                ⏱️ {offer.startTime}–{offer.endTime}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OfferCard;
