'use client';

import React, { useState, useRef } from 'react';
import { Heart, Eye, Trash2, Pencil, Flame, Calendar, Clock } from 'lucide-react';

// ─── Shared Types ─────────────────────────────────────────────────────────────

export interface FoodCardItem {
  id: string;
  title: string;
  description: string;
  price?: string;
  image: string;
  badgeLabel?: string;
  category?: string;
  foodType?: 'veg' | 'non-veg' | 'egg';
  isBestseller?: boolean;
  isTodaysSpecial?: boolean;
  isAvailable?: boolean;
  gradientColors?: { mid: string; end: string };
  stats?: {
    today?: { views: number; likes: number };
    thisWeek?: { views: number; likes: number };
    thisMonth?: { views: number; likes: number };
  };
}

export type TimeframeType = 'today' | 'thisWeek' | 'thisMonth';

// ─── Utilities ────────────────────────────────────────────────────────────────

export const formatNumber = (n: number): string => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'k';
  return String(n);
};

function getCategoryEmoji(catName: string): string {
  const lower = catName.toLowerCase();
  if (lower.includes('burger')) return '🍔';
  if (lower.includes('pizza')) return '🍕';
  if (lower.includes('chicken') || lower.includes('bucket') || lower.includes('tender') || lower.includes('wings')) return '🍗';
  if (lower.includes('drink') || lower.includes('beverage') || lower.includes('juice') || lower.includes('soda')) return '🥤';
  if (lower.includes('side') || lower.includes('fries') || lower.includes('snack')) return '🍟';
  if (lower.includes('dessert') || lower.includes('sweet') || lower.includes('ice') || lower.includes('cake')) return '🍦';
  if (lower.includes('special') || lower.includes('offer') || lower.includes('deal')) return '🔥';
  if (lower.includes('noodle') || lower.includes('pasta') || lower.includes('ramen')) return '🍜';
  if (lower.includes('taco') || lower.includes('wrap') || lower.includes('roll')) return '🌮';
  if (lower.includes('rice') || lower.includes('biryani')) return '🍚';
  if (lower.includes('coffee') || lower.includes('tea') || lower.includes('chai')) return '☕';
  return '🍢';
}


// ─── Food Type Dot ────────────────────────────────────────────────────────────

export const FoodTypeDot: React.FC<{ type?: 'veg' | 'non-veg' | 'egg' }> = ({ type = 'veg' }) => {
  const map = {
    'non-veg': { border: 'border-rose-500',    dot: 'bg-rose-500',    label: 'Non-Veg' },
    'egg':     { border: 'border-amber-400',   dot: 'bg-amber-400',   label: 'Egg'     },
    'veg':     { border: 'border-emerald-500', dot: 'bg-emerald-500', label: 'Veg'     },
  };
  const { border, dot, label } = map[type] ?? map['veg'];
  return (
    <span className={`w-4 h-4 rounded-sm border-2 ${border} bg-white flex items-center justify-center shrink-0 shadow`} title={label}>
      <span className={`w-2 h-2 rounded-full ${dot}`} />
    </span>
  );
};

// ─── FoodCard Props ───────────────────────────────────────────────────────────

interface CustomerProps { variant: 'customer'; activeTimeframe: TimeframeType; }
interface VendorProps   {
  variant: 'vendor';
  onDelete: (id: string, title: string) => void;
  onEdit?: (item: FoodCardItem) => void;
  onToggleAvailability?: (id: string) => void;
}

export type FoodCardProps = FoodCardItem & (CustomerProps | VendorProps);

// ─── FoodCard — single shared card component ──────────────────────────────────

export const FoodCard: React.FC<FoodCardProps> = (props) => {
  const {
    id, title, description, price = '₹199', image,
    badgeLabel, category, foodType, isBestseller, isTodaysSpecial,
    isAvailable = true, stats,
  } = props;

  const [liked, setLiked] = useState(false);
  const lastTapRef = useRef<number>(0);

  const activeTimeframe = props.variant === 'customer' ? props.activeTimeframe : 'today';
  const currentStats = stats?.[activeTimeframe] ?? { views: 0, likes: 0 };
  const hasStats = currentStats.views > 0 || currentStats.likes > 0;

  const handleDoubleClick = () => { if (props.variant === 'customer') setLiked(true); };
  const handleTouchEnd = () => {
    if (props.variant !== 'customer') return;
    const now = Date.now();
    if (now - lastTapRef.current < 300) setLiked(true);
    lastTapRef.current = now;
  };

  const badgeText = isTodaysSpecial ? 'Special' : isBestseller ? 'Bestseller' : badgeLabel;
  const badgeColorClass = isTodaysSpecial ? 'text-[#B91C1C]' : isBestseller ? 'text-[#B45309]' : 'text-[#EA580C]';

  return (
    <div
      onDoubleClick={handleDoubleClick}
      onTouchEnd={handleTouchEnd}
      className={`bg-white rounded-2xl shadow-xs border border-gray-100 flex flex-col overflow-hidden group cursor-pointer hover:shadow-md transition-all duration-200 select-none ${
        props.variant === 'vendor' && !isAvailable ? 'opacity-60 grayscale-[30%]' : ''
      }`}
    >
      {/* ── Image Area ── */}
      <div className="relative aspect-[4/3] w-full bg-gray-50 overflow-hidden shrink-0 p-1.5">
        {/* Food type dot — top left */}
        {foodType && (
          <span className="absolute top-2.5 left-2.5 z-10 p-0.5 bg-white/90 rounded-sm shadow-xs">
            <FoodTypeDot type={foodType} />
          </span>
        )}

        {/* Top-right controls */}
        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
          {props.variant === 'customer' ? (
            <>
              {hasStats && (
                <div
                  className="bg-black/40 backdrop-blur-md text-white text-xs font-extrabold px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1"
                  title={`${currentStats.views} views`}
                >
                  <Eye size={12} className="text-cyan-300" />
                  <span>{formatNumber(currentStats.views)}</span>
                </div>
              )}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setLiked(v => !v); }}
                className="p-1.5 bg-white/90 rounded-full text-gray-400 hover:text-red-500 transition-colors shadow-sm"
                aria-label="Like item"
              >
                <Heart size={14} className={liked ? 'text-red-500 fill-red-500' : ''} />
              </button>
            </>
          ) : (
            <>
              {props.onEdit && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); props.onEdit?.(props); }}
                  className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 hover:text-[#f77512] transition-colors shadow-sm cursor-pointer"
                  title="Edit menu item"
                >
                  <Pencil size={15} />
                </button>
              )}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); props.onDelete(id, title); }}
                className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 hover:text-rose-600 transition-colors shadow-sm cursor-pointer"
                title="Delete menu item"
              >
                <Trash2 size={15} />
              </button>
            </>
          )}
        </div>

        {/* Image or emoji fallback */}
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            {getCategoryEmoji(category || '')}
          </div>
        )}

        {/* Sold-out overlay */}
        {props.variant === 'vendor' && !isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
            <span className="bg-slate-900/90 text-white text-xs font-black px-4 py-1.5 rounded-full border border-white/20 shadow-md">
              SOLD OUT
            </span>
          </div>
        )}
      </div>

      {/* ── Content Area ── */}
      <div className="flex flex-col flex-1 p-3.5 sm:p-4">
        {/* Badge above title */}
        {badgeText && (
          <span className={`text-[10px] sm:text-xs font-black tracking-widest uppercase mb-1 ${badgeColorClass}`}>
            {badgeText}
          </span>
        )}

        <div className="flex items-center justify-between gap-2 mb-1">
          <h4 className="font-black text-sm sm:text-base text-gray-900 leading-snug line-clamp-1 flex-1">{title}</h4>
          {props.variant === 'vendor' && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); props.onToggleAvailability?.(id); }}
              className={`shrink-0 text-xs font-black px-2.5 py-1 rounded-xl shadow-xs transition-all whitespace-nowrap cursor-pointer ${
                isAvailable
                  ? 'bg-emerald-500 text-white hover:bg-rose-600'
                  : 'bg-rose-500 text-white hover:bg-emerald-600'
              }`}
            >
              {isAvailable ? 'Mark Sold Out' : 'Mark Available'}
            </button>
          )}
        </div>

        <p className="text-xs sm:text-sm text-gray-500 font-medium line-clamp-2 mb-2 leading-relaxed">
          {description || 'Delicious & fresh'}
        </p>

        {/* Category tag (vendor only) */}
        {category && props.variant === 'vendor' && (
          <span className="self-start text-xs font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md mb-2 border border-gray-200">
            {category}
          </span>
        )}

        {/* Price row */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <span className="text-base sm:text-lg font-black text-gray-900 tracking-tight">{price}</span>
          {props.variant === 'customer' && hasStats && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setLiked(v => !v); }}
              className="flex items-center gap-1 text-xs font-extrabold text-gray-500 hover:text-red-500 transition-colors"
            >
              <Heart size={13} className={liked ? 'text-red-500 fill-red-500' : ''} />
              <span>{formatNumber(liked ? currentStats.likes + 1 : currentStats.likes)}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Popular Items Section (home page) ────────────────────────────────────────

const TABS = [
  { id: 'today'     as TimeframeType, label: "Today's",    subtitle: "Most viewed & liked dishes today",                 icon: Clock    },
  { id: 'thisWeek'  as TimeframeType, label: "This Week",  subtitle: "Highest views & customer favorites this week",     icon: Flame    },
  { id: 'thisMonth' as TimeframeType, label: "This Month", subtitle: "All-time most viewed & top liked of the month",    icon: Calendar },
];

const getPopularItems = (items: FoodCardItem[], timeframe: TimeframeType, limit = 4) =>
  [...items]
    .sort((a, b) => {
      const sA = a.stats?.[timeframe] ?? { views: 0, likes: 0 };
      const sB = b.stats?.[timeframe] ?? { views: 0, likes: 0 };
      return (sB.views + sB.likes * 2) - (sA.views + sA.likes * 2);
    })
    .slice(0, limit);

interface ItemProps {
  items?: FoodCardItem[];
}

export const Item: React.FC<ItemProps> = ({ items = [] }) => {
  const [activeTab, setActiveTab] = useState<TimeframeType>('today');
  const currentTabObj = TABS.find(t => t.id === activeTab) ?? TABS[0];
  const popularItems = getPopularItems(items, activeTab, 4);

  if (items.length === 0) return null;

  return (
    <div className="w-full max-w-[1200px] mt-8 mb-8 flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Popular Items</h2>
          <p className="text-slate-500 font-semibold text-xs sm:text-sm mt-0.5">{currentTabObj.subtitle}</p>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-100/90 p-1 sm:p-1.5 rounded-full border border-slate-200/80 shadow-inner self-start sm:self-auto max-w-full overflow-x-auto no-scrollbar">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-[11px] sm:text-sm font-extrabold whitespace-nowrap transition-colors duration-150 flex items-center gap-1 sm:gap-1.5 select-none cursor-pointer shrink-0 ${
                  isActive ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon size={13} className={`shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full">
        {popularItems.map(food => (
          <FoodCard key={food.id} {...food} variant="customer" activeTimeframe={activeTab} />
        ))}
      </div>
    </div>
  );
};

export default Item;
