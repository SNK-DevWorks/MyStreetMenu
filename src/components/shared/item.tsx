'use client';

import React, { useState, useRef, useMemo } from 'react';
import { Heart, Eye, Trash2, Pencil, Flame, Calendar, Clock } from 'lucide-react';
import allItemsData from '@/data/vendor/items.json';

// ─── Shared Types ─────────────────────────────────────────────────────────────

export interface FoodCardItem {
  id: number;
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

// ─── Food Type Dot ────────────────────────────────────────────────────────────

const FoodTypeDot: React.FC<{ type?: 'veg' | 'non-veg' | 'egg' }> = ({ type = 'veg' }) => {
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
  onDelete: (id: number, title: string) => void;
  onEdit?: (item: FoodCardItem) => void;
  onToggleAvailability?: (id: number) => void;
}

export type FoodCardProps = FoodCardItem & (CustomerProps | VendorProps);

// ─── FoodCard — single shared card component ──────────────────────────────────

export const FoodCard: React.FC<FoodCardProps> = (props) => {
  const {
    id, title, description, price = '₹199', image,
    badgeLabel, category, foodType, isBestseller, isTodaysSpecial,
    isAvailable = true, gradientColors, stats,
  } = props;

  const gradMid = gradientColors?.mid ?? 'rgba(56,45,41,0.85)';
  const gradEnd = gradientColors?.end ?? 'rgba(30,20,15,0.98)';

  const [liked, setLiked] = useState(false);
  const lastTapRef = useRef<number>(0);

  const activeTimeframe = props.variant === 'customer' ? props.activeTimeframe : 'today';
  const currentStats = stats?.[activeTimeframe] ?? { views: 1200, likes: 350 };

  const handleDoubleClick = () => { if (props.variant === 'customer') setLiked(true); };
  const handleTouchEnd = () => {
    if (props.variant !== 'customer') return;
    const now = Date.now();
    if (now - lastTapRef.current < 300) setLiked(true);
    lastTapRef.current = now;
  };

  return (
    <div
      onDoubleClick={handleDoubleClick}
      onTouchEnd={handleTouchEnd}
      className={`relative w-full aspect-[3/4] max-h-[380px] rounded-[30px] overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 group flex flex-col justify-between select-none cursor-pointer ${
        props.variant === 'vendor' && !isAvailable ? 'opacity-60 grayscale-[30%]' : ''
      }`}
    >
      {/* Background Image */}
      <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />

      {/* Gradient Overlay */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{ background: `linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, ${gradMid} 55%, ${gradEnd} 100%)` }}
      />

      {/* Content */}
      <div className="absolute inset-0 z-20 flex flex-col justify-between p-4 sm:p-5">

        {/* ── Top Row ── */}
        <div className="flex items-start justify-between w-full gap-2">

          {/* Left: food type + optional badge label */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <FoodTypeDot type={foodType} />
            {badgeLabel && !isBestseller && !isTodaysSpecial && (
              <span className="bg-black/40 backdrop-blur-md text-white text-[11px] font-black px-3 py-1 rounded-full border border-white/20 shadow-sm">
                {badgeLabel}
              </span>
            )}
          </div>

          {/* Right: customer → views + like  |  vendor → edit + delete */}
          {props.variant === 'customer' ? (
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="bg-black/40 backdrop-blur-md text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full border border-white/20 shadow-sm flex items-center gap-1" title={`${currentStats.views} views`}>
                <Eye size={12} className="text-cyan-300" />
                <span>{formatNumber(currentStats.views)}</span>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setLiked(v => !v); }}
                className="bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 hover:bg-black/60 transition-colors cursor-pointer flex items-center gap-1 text-white text-[11px] font-extrabold"
                aria-label="Like item"
              >
                <Heart size={12} className={`transition-colors duration-150 ${liked ? 'text-red-500 fill-red-500' : 'text-white'}`} />
                <span>{formatNumber(liked ? currentStats.likes + 1 : currentStats.likes)}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 shrink-0">
              {props.onEdit && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); props.onEdit?.(props); }}
                  className="bg-black/40 backdrop-blur-md text-white hover:bg-[#f77512] p-1.5 rounded-full border border-white/20 transition-colors cursor-pointer"
                  title="Edit menu item"
                >
                  <Pencil size={14} />
                </button>
              )}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); props.onDelete(id, title); }}
                className="bg-black/40 backdrop-blur-md text-white hover:bg-rose-600/80 p-1.5 rounded-full border border-white/20 transition-colors cursor-pointer"
                title="Delete menu item"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>

        {/* ── Bottom Section ── */}
        <div className="mt-auto">
          {/* Category & Tags Row */}
          <div className="flex items-center gap-1.5 flex-wrap mb-2">
            {category && (
              <span className="bg-white/15 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-white/20">
                {category}
              </span>
            )}
            {isBestseller && (
              <span className="bg-amber-500/90 backdrop-blur-md text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-300 shadow-sm leading-none">
                ⭐ Bestseller
              </span>
            )}
            {isTodaysSpecial && (
              <span className="bg-orange-600/90 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-0.5 rounded-full border border-orange-300 shadow-sm leading-none">
                🔥 Special
              </span>
            )}
          </div>
          <h2 className="text-white text-xl sm:text-2xl font-black leading-tight mb-1.5 tracking-tight">{title}</h2>
          <p className="text-gray-200/90 text-xs mb-3.5 leading-snug line-clamp-2 font-medium">{description}</p>
          <div className="w-full bg-white text-slate-900 font-black py-2.5 rounded-full text-center shadow-sm text-lg sm:text-xl tracking-tight">
            {price}
          </div>
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

export const Item: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TimeframeType>('today');
  const currentTabObj = TABS.find(t => t.id === activeTab) ?? TABS[0];
  const popularItems = useMemo(() => getPopularItems(allItemsData as FoodCardItem[], activeTab, 4), [activeTab]);

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
        {popularItems.map(food => (
          <FoodCard key={food.id} {...food} variant="customer" activeTimeframe={activeTab} />
        ))}
      </div>
    </div>
  );
};

export default Item;
