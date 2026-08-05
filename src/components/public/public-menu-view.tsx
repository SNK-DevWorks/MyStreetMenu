'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Heart, Phone, Flame, Clock, Star, X, Megaphone, MapPin, ChevronRight, ChevronLeft, Share2, Umbrella } from 'lucide-react';
import { type FoodCardItem, type TimeframeType } from '@/components/shared/item';
import { useAnalytics } from '@/providers/analytics-provider';
import { OfferCard } from '@/components/shared/offer-card';

export interface AnnouncementItem {
  id: string;
  type?: 'announcement' | 'offer' | 'todays_special';
  title: string;
  description?: string;
  code?: string;
  startDate?: string;
  endDate?: string;
}

export interface PublicOfferItem {
  id: string;
  title: string;
  badge: string;  // "20% OFF", "₹50 OFF", "Buy 1 Get 1"
  type: string;
  targetType: string;
  targetCount: number;
  startTime: string | null;
  endTime: string | null;
  /** Resolved CDN banner URL from published JSON. null = use gradient default. */
  banner: { image: string; alt: string } | null;
}

interface PublicMenuViewProps {
  vendorName?: string;
  vendorAddress?: string;
  phone?: string | null;
  whatsapp?: string | null;
  mapUrl?: string | null;
  items?: FoodCardItem[];
  categories?: string[];
  offers?: PublicOfferItem[];
  announcements?: AnnouncementItem[];
}

const FoodTypeIcon = ({ type }: { type?: 'veg' | 'non-veg' | 'egg' }) => {
  const isVeg = type === 'veg';
  const isEgg = type === 'egg';
  const borderColor = isVeg ? 'border-green-600' : isEgg ? 'border-amber-500' : 'border-[#8F291D]';
  const dotColor = isVeg ? 'bg-green-600' : isEgg ? 'bg-amber-500' : 'bg-[#8F291D]';

  return (
    <div className={`w-3.5 h-3.5 border ${borderColor} rounded-sm flex items-center justify-center bg-white shadow-xs shrink-0`}>
      {isVeg ? (
        <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      ) : isEgg ? (
        <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      ) : (
        <div className="w-0 h-0 border-l-[3.5px] border-l-transparent border-b-[5px] border-b-[#8F291D] border-r-[3.5px] border-r-transparent" />
      )}
    </div>
  );
};

function WhatsAppIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="100%"
      height="100%"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c-.001 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662a11.87 11.87 0 005.71 1.455h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
    </svg>
  );
}

function getCategoryEmoji(catName: string): string {
  const lower = catName.toLowerCase();
  if (lower.includes('all')) return '🍽️';
  if (lower.includes('burger')) return '🍔';
  if (lower.includes('pizza')) return '🍕';
  if (lower.includes('chicken') || lower.includes('bucket') || lower.includes('tender') || lower.includes('wings')) return '🍗';
  if (lower.includes('drink') || lower.includes('beverage') || lower.includes('juice') || lower.includes('soda')) return '🥤';
  if (lower.includes('side') || lower.includes('fries') || lower.includes('snack')) return '🍟';
  if (lower.includes('dessert') || lower.includes('sweet') || lower.includes('ice') || lower.includes('cake')) return '🍦';
  if (lower.includes('special') || lower.includes('offer') || lower.includes('deal')) return '🔥';
  if (lower.includes('noodle') || lower.includes('pasta') || lower.includes('ramen') || lower.includes('chow')) return '🍜';
  if (lower.includes('taco') || lower.includes('wrap') || lower.includes('roll')) return '🌮';
  if (lower.includes('rice') || lower.includes('biryani')) return '🍚';
  if (lower.includes('coffee') || lower.includes('tea') || lower.includes('chai')) return '☕';
  return '🍢';
}

// ─── Public Offer Hero Carousel ──────────────────────────────────────────────

function PublicOfferCarousel({ offers }: { offers: PublicOfferItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const touchStartX = useRef<number | null>(null);

  // Extended list with cloned first item for seamless single-direction loop
  const displayOffers = useMemo(() => {
    if (offers && offers.length > 1) {
      return [...offers, offers[0]];
    }
    return offers || [];
  }, [offers]);

  useEffect(() => {
    if (offers.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setActiveIndex((prev) => prev + 1);
    }, 3800);

    return () => clearInterval(interval);
  }, [offers.length, isPaused]);

  const handleTransitionEnd = () => {
    if (activeIndex >= offers.length) {
      setIsTransitioning(false);
      setActiveIndex(0);
    }
  };

  if (!offers || offers.length === 0) return null;

  const realActiveIndex = activeIndex % offers.length;

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    if (touchStartX.current === null) return;
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    if (diffX < -40) {
      setIsTransitioning(true);
      setActiveIndex((prev) => prev + 1);
    } else if (diffX > 40) {
      setIsTransitioning(true);
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : offers.length - 1));
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="relative w-full group select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative w-full overflow-hidden rounded-[24px] shadow-[0_8px_24px_rgba(255,107,0,0.14)] border border-[#FF6B00]/25 bg-[#111111]">
        <div
          className={`flex w-full ${isTransitioning ? 'transition-transform duration-600 ease-out' : 'transition-none'}`}
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          onTransitionEnd={handleTransitionEnd}
        >
          {displayOffers.map((offer, idx) => (
            <div key={`${offer.id}-${idx}`} className="w-full min-w-full shrink-0 overflow-hidden">
              <OfferCard
                offer={offer}
                index={idx % offers.length}
                className="w-full min-h-[200px] sm:min-h-[235px] rounded-none border-none"
              />
            </div>
          ))}
        </div>

        {offers.length > 1 && (
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full border border-white/20 shadow-xs">
            {offers.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setIsTransitioning(true);
                  setActiveIndex(i);
                }}
                aria-label={`Go to slide ${i + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  i === realActiveIndex
                    ? 'w-3 h-1 bg-[#FF6B00] shadow-2xs'
                    : 'w-1 h-1 bg-white/50 hover:bg-white'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 3D Today's Specials Carousel Component ─────────────────────────────────

function TodaysSpecial3DCarousel({
  items,
  onItemClick,
  onLikeClick,
  isLiked,
  getLikeCount,
  isLikePending,
  onViewAllSpecials
}: {
  items: FoodCardItem[];
  onItemClick: (item: FoodCardItem) => void;
  onLikeClick: (id: string, e: React.MouseEvent) => void;
  isLiked: (id: string) => boolean;
  getLikeCount: (id: string) => number;
  isLikePending: (id: string) => boolean;
  onViewAllSpecials?: () => void;
}) {
  const carouselItems = useMemo(() => {
    if (items.length === 0) return [];
    if (items.length < 4) return [...items, ...items, ...items];
    return [...items, ...items];
  }, [items]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragCurrent, setDragCurrent] = useState(0);

  useEffect(() => {
    if (isPaused || isDragging || carouselItems.length === 0) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % carouselItems.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [isPaused, isDragging, carouselItems.length, activeIndex]);

  if (carouselItems.length === 0) return null;

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setDragStart(clientX);
    setDragCurrent(clientX);
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setDragCurrent(clientX);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (!dragStart || !dragCurrent) return;

    const distance = dragStart - dragCurrent;
    const swipeThreshold = 40;

    if (distance > swipeThreshold) {
      setActiveIndex((prev) => (prev + 1) % carouselItems.length);
    } else if (distance < -swipeThreshold) {
      setActiveIndex((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
    }

    setDragStart(0);
    setDragCurrent(0);
  };

  const getCardStyle = (index: number) => {
    const total = carouselItems.length;
    let diff = index - activeIndex;

    if (diff < -total / 2) diff += total;
    if (diff > total / 2) diff -= total;

    const isVisibleOrAdjacent = Math.abs(diff) <= 2;
    const transitionClass = isVisibleOrAdjacent ? "transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]" : "transition-none";

    const baseClasses = `absolute top-0 left-1/2 w-[270px] xs:w-[280px] h-[310px] sm:h-[320px] rounded-[24px] overflow-hidden flex flex-col cursor-grab active:cursor-grabbing ${transitionClass}`;

    if (diff === 0) {
      return `${baseClasses} translate-x-[-50%] scale-100 z-30 opacity-100 shadow-[0_12px_24px_rgba(0,0,0,0.2)]`;
    } else if (diff === 1) {
      return `${baseClasses} translate-x-[calc(-50%+260px)] sm:translate-x-[calc(-50%+275px)] scale-[0.88] z-20 opacity-100 shadow-sm`;
    } else if (diff === -1) {
      return `${baseClasses} translate-x-[calc(-50%-260px)] sm:translate-x-[calc(-50%-275px)] scale-[0.88] z-20 opacity-100 shadow-sm`;
    } else if (diff > 1) {
      return `${baseClasses} translate-x-[calc(-50%+450px)] scale-[0.8] z-0 opacity-0 pointer-events-none`;
    } else {
      return `${baseClasses} translate-x-[calc(-50%-450px)] scale-[0.8] z-0 opacity-0 pointer-events-none`;
    }
  };

  return (
    <div className="relative z-20 pt-6 pb-6 mb-2 overflow-hidden bg-[#FDFBF7]">
      {/* Seamless radial ambient orange glow feathered soft into the background */}
      <div className="absolute top-1 left-1/2 -translate-x-1/2 w-[280px] h-[130px] bg-[#FF6B00]/14 rounded-full blur-[45px] pointer-events-none" />

      <div className="flex flex-col items-center mb-5 px-4 relative z-10">
        <div className="bg-[#FF6B00] text-white text-[11px] font-bold px-3 py-1 rounded-sm mb-1.5 relative shadow-xs tracking-wide">
          Must Try
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-t-[5px] border-t-[#FF6B00] border-r-[5px] border-r-transparent" />
        </div>
        <h2 className="text-[22px] font-extrabold text-gray-900 tracking-tight">Today's Special</h2>
      </div>

      <div
        className="relative h-[330px] w-full flex items-center justify-center touch-pan-y select-none"
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={() => { handleDragEnd(); setIsPaused(false); }}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
        onMouseEnter={() => setIsPaused(true)}
      >
        {carouselItems.map((item, index) => {
          const itemIsLiked = isLiked(item.id);
          const itemLikeCount = getLikeCount(item.id);
          const isPending = isLikePending(item.id);

          return (
            <div
              key={`${item.id}-${index}`}
              className={getCardStyle(index)}
              onClick={() => onItemClick(item)}
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
                  {(item.resolvedOffer?.badge || (item.hasDiscount && item.priceOriginal != null && item.priceFinal != null && item.priceOriginal > item.priceFinal)) && (
                    <span className="bg-[#FF6B00] text-white font-black text-[10px] px-2.5 py-0.5 rounded-md shadow-md uppercase tracking-wider">
                      {item.resolvedOffer?.badge || `${Math.round(((item.priceOriginal! - item.priceFinal!) / item.priceOriginal!) * 100)}% OFF`}
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white flex flex-col gap-1.5">
                  <div className="flex justify-between items-baseline w-full">
                    <h3 className="font-bold text-[17.5px] leading-tight pr-2 drop-shadow-md line-clamp-1">{item.title}</h3>
                    <div className="flex items-baseline gap-1.5 shrink-0 drop-shadow-md">
                      <span className="font-extrabold text-[17.5px]">
                        {item.hasDiscount && item.priceFinal != null ? `₹${item.priceFinal}` : (item.price || '₹199')}
                      </span>
                      {item.hasDiscount && item.priceOriginal != null && (
                        <span className="text-[12px] text-gray-300/90 line-through font-normal">₹{item.priceOriginal}</span>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-300 text-[12.5px] drop-shadow-md -mt-0.5 truncate">{item.category || 'Special Dish'}</p>

                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-2 text-[12px] font-medium">
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={(e) => onLikeClick(item.id, e)}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-[6px] shadow-sm text-[11.5px] font-bold transition-all ${
                          itemIsLiked ? 'bg-rose-600 text-white' : 'bg-black/50 backdrop-blur-md text-white border border-white/20 hover:bg-black/70'
                        }`}
                        title={itemIsLiked ? 'Liked' : 'Like this dish'}
                      >
                        <Heart size={12} fill={itemIsLiked ? 'currentColor' : 'none'} className={itemIsLiked ? 'text-white' : 'text-rose-400'} strokeWidth={2.5} />
                        {itemLikeCount > 0 && <span>{itemLikeCount}</span>}
                      </button>
                      <span className="text-gray-400">|</span>
                      <span className="text-gray-200 flex items-center gap-1 drop-shadow-md text-[11.5px]">
                        <Umbrella size={12} className="text-gray-300" /> Fresh
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
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
                <div>
                  {item.badgeLabel || 'Popular'}
                </div>
              </div>
            </div>
          );
        })}
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

// ─── Main PublicMenuView Component ──────────────────────────────────────────

export default function PublicMenuView({
  vendorName = 'Crispy Bites',
  vendorAddress = 'Hatiara, Rajarhat, Kolkata',
  phone = null,
  whatsapp = null,
  mapUrl = null,
  items = [],
  categories = ['All Items'],
  offers = [],
  announcements = [],
}: PublicMenuViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [activeTimeframe, setActiveTimeframe] = useState<TimeframeType>('today');
  const [selectedItemModal, setSelectedItemModal] = useState<FoodCardItem | null>(null);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [showAllSpecialsView, setShowAllSpecialsView] = useState(false);
  const { track, isLiked, getLikeCount, isLikePending, likeMenuItem } = useAnalytics();

  const handleLikeClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    likeMenuItem(id);
  };

  const handleItemClick = (item: FoodCardItem) => {
    track('item_view', { itemId: item.id, itemName: item.title });
    setIsModalClosing(false);
    setSelectedItemModal(item);
  };

  const closeModal = () => {
    if (!selectedItemModal || isModalClosing) return;
    setIsModalClosing(true);
    setTimeout(() => {
      setSelectedItemModal(null);
      setIsModalClosing(false);
    }, 280);
  };

  useEffect(() => {
    if (selectedItemModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedItemModal]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qrId = params.get('qr');

    if (qrId) {
      track('qr_scan', {
        qrId,
        source: params.get('src') ?? 'direct',
        tableNo: params.get('table') ?? null,
        campaign: params.get('campaign') ?? null,
      });
    }

    track('menu_view');
  }, [track]);

  const categoryList = useMemo(() => {
    const list = categories.length > 0 ? categories : ['All'];
    if (!list.some(c => c.toLowerCase() === 'all' || c.toLowerCase() === 'all items')) {
      return ['All', ...list];
    }
    return list;
  }, [categories]);

  const isAllCategory = useMemo(() => {
    const lower = selectedCategory.toLowerCase().trim();
    return lower === 'all' || lower === 'all items' || selectedCategory === categoryList[0];
  }, [selectedCategory, categoryList]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesCategory = isAllCategory || item.category === selectedCategory;
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDiet = dietFilter === 'all' || (dietFilter === 'veg' ? item.foodType === 'veg' : item.foodType !== 'veg');
      return matchesCategory && matchesSearch && matchesDiet && item.isAvailable !== false;
    });
  }, [items, searchQuery, selectedCategory, isAllCategory, dietFilter]);

  const todaysSpecialsList = useMemo(() => {
    return items.filter(i => i.isTodaysSpecial && i.isAvailable !== false);
  }, [items]);

  const handleWhatsApp = () => {
    track('whatsapp_click');
  };

  const handleShare = () => {
    track('share_click');
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: vendorName, url: window.location.href }).catch(() => { });
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-gray-900 font-sans selection:bg-orange-200">
      <style dangerouslySetInnerHTML={{
        __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* ── Mobile Container (Full-screen style) ── */}
      <div className="w-full max-w-[420px] mx-auto bg-[#FDFBF7] min-h-screen relative overflow-hidden flex flex-col shadow-2xl lg:hidden">
        
        {/* Tangy Orange Header */}
        <div className="bg-gradient-to-b from-[#FF6B00] via-[#FF7A1A] to-[#FF8C33] pt-10 px-4 pb-12 rounded-b-[32px] relative z-10 shadow-sm overflow-hidden">
          
          {/* Decorative Background Patterns */}
          <div className="absolute inset-0 pointer-events-none opacity-15 overflow-hidden">
            {/* Concentric Circles & Arcs */}
            <svg className="absolute -top-12 -right-12 w-64 h-64 text-white" viewBox="0 0 200 200" fill="none">
              <circle cx="100" cy="100" r="85" stroke="currentColor" strokeWidth="3" strokeDasharray="6 6" />
              <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="2" />
              <circle cx="100" cy="100" r="35" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
            </svg>
            
            <svg className="absolute -bottom-16 -left-16 w-56 h-56 text-white" viewBox="0 0 200 200" fill="none">
              <circle cx="100" cy="100" r="75" stroke="currentColor" strokeWidth="2.5" />
              <circle cx="100" cy="100" r="50" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
            </svg>

            {/* Subtle Dot Pattern Grid */}
            <div 
              className="absolute inset-0" 
              style={{
                backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.45) 1.2px, transparent 1.2px)`,
                backgroundSize: '18px 18px'
              }} 
            />
          </div>

          {/* Soft Top Ambient Light Glow */}
          <div className="absolute top-0 right-1/4 w-48 h-32 bg-white/20 rounded-full blur-2xl pointer-events-none" />

          {/* Header Top Row */}
          <div className="flex justify-between items-start mb-5">
            <div className="flex flex-col text-white w-[72%]">
              <div className="flex items-center gap-1.5 mb-1 cursor-pointer">
                <MapPin size={22} className="text-white fill-white/20 shrink-0" strokeWidth={2.5} />
                <h1 className="text-[20px] font-black tracking-tight leading-none truncate">{vendorName}</h1>
                {mapUrl && (
                  <a href={mapUrl} target="_blank" rel="noopener noreferrer" onClick={() => track('direction_click')}>
                    <ChevronRight size={18} strokeWidth={3} className="text-white" />
                  </a>
                )}
              </div>
              <p className="text-[12.5px] text-white/90 truncate ml-7 font-medium">{vendorAddress}</p>
            </div>

            <div className="flex gap-2 shrink-0">
              {phone && (
                <a href={`tel:${phone}`} className="w-9 h-9 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors" title="Call">
                  <Phone size={17} className="fill-white" />
                </a>
              )}
              {whatsapp && (
                <a href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" onClick={handleWhatsApp} className="w-9 h-9 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors p-2" title="WhatsApp">
                  <WhatsAppIcon className="w-4 h-4 fill-white" />
                </a>
              )}
              <button type="button" onClick={handleShare} className="w-9 h-9 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors" title="Share Menu">
                <Share2 size={18} />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FF6B00]">
              <Search size={20} strokeWidth={2.5} />
            </div>
            <input
              type="text"
              placeholder='Search "dishes, burgers, salad"'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white py-3.5 pl-11 pr-9 rounded-2xl text-[14.5px] text-gray-800 placeholder-gray-400 focus:outline-none shadow-[0_8px_20px_rgba(255,107,0,0.2)] font-medium"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            )}
          </div>

          {/* Notice Banner */}
          {announcements && announcements.length > 0 && (
            <div className="bg-black/15 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0 shadow-xs">
                <Megaphone size={13} className="text-white" />
              </div>
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="bg-white text-[#FF6B00] text-[9.5px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">Notice</span>
                <span className="text-[13px] font-bold text-white truncate">{announcements[0].title}</span>
              </div>
            </div>
          )}
        </div>

        {/* Hero Offer Banner (Overlapping header with negative margin) */}
        {offers && offers.length > 0 && isAllCategory && !searchQuery && (
          <div className="px-4 -mt-7 relative z-20 mb-4">
            <PublicOfferCarousel offers={offers} />
          </div>
        )}

        {/* Today's Special Section (Animated 3D Carousel) */}
        {isAllCategory && !searchQuery && todaysSpecialsList.length > 0 && (
          <TodaysSpecial3DCarousel
            items={todaysSpecialsList}
            onItemClick={handleItemClick}
            onLikeClick={handleLikeClick}
            isLiked={isLiked}
            getLikeCount={getLikeCount}
            isLikePending={isLikePending}
            onViewAllSpecials={() => setShowAllSpecialsView(true)}
          />
        )}

        {/* Categories (Swipable Pill Row) */}
        <div className="mb-6 mt-2 px-5">
          <h2 className="text-[20px] font-extrabold text-[#FF6B00] mb-3 tracking-tight">Categories</h2>
          <div className="flex gap-2.5 overflow-x-auto hide-scrollbar pb-2 -mx-5 px-5 touch-pan-x">
            {categoryList.map((cat, idx) => {
              const isActive = selectedCategory === cat;

              return (
                <button
                  key={`cat-${idx}`}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-[13px] font-bold transition-all shrink-0 cursor-pointer ${
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
        </div>

        {/* Full Menu List */}
        <div className="bg-white rounded-t-[32px] pt-7 pb-20 px-5 shadow-[0_-8px_24px_rgba(0,0,0,0.03)] relative z-20 flex-1 border-t border-gray-100 min-h-[60vh]">
          
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[22px] font-black text-[#FF6B00] tracking-tight">
              {isAllCategory ? 'Full Menu' : selectedCategory}
            </h2>
            <div className="bg-gray-100/90 rounded-full flex p-1 border border-gray-200/50">
              <button
                type="button"
                onClick={() => setDietFilter('all')}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${dietFilter === 'all' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-500'}`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setDietFilter('veg')}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${dietFilter === 'veg' ? 'bg-emerald-600 shadow-xs text-white' : 'text-gray-500'}`}
              >
                Veg
              </button>
              <button
                type="button"
                onClick={() => setDietFilter('non-veg')}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${dietFilter === 'non-veg' ? 'bg-[#8F291D] shadow-xs text-white' : 'text-gray-500'}`}
              >
                Non-Veg
              </button>
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <div className="text-center py-14 text-gray-400 bg-gray-50/50 rounded-2xl border border-gray-100 my-4">
              <Search size={34} className="mx-auto mb-2 opacity-40 text-gray-400" />
              <p className="font-bold text-sm text-gray-700">No items found</p>
              <p className="text-xs text-gray-400 mt-0.5">Try selecting another category or filter</p>
            </div>
          ) : (
            <div className="flex flex-col gap-7">
              {filteredItems.map((item) => (
                <div key={`list-${item.id}`} onClick={() => handleItemClick(item)} className="flex gap-3 group cursor-pointer border-b border-gray-100 pb-7 last:border-b-0">
                  {/* Details Side */}
                  <div className="flex-1 flex flex-col pt-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <FoodTypeIcon type={item.foodType} />
                      {item.isBestseller && (
                        <span className="text-[9.5px] font-black text-amber-600 bg-amber-50 border border-amber-200/60 px-1.5 py-0.2 rounded shrink-0">
                          BESTSELLER
                        </span>
                      )}
                      {(getLikeCount(item.id) > 0 || isLiked(item.id)) && (
                        <button
                          type="button"
                          disabled={isLikePending(item.id)}
                          onClick={(e) => handleLikeClick(item.id, e)}
                          className="flex items-center gap-1 text-[11px] font-extrabold text-rose-600 transition-transform active:scale-90 cursor-pointer border-none bg-transparent ml-1"
                        >
                          <Heart
                            size={13}
                            fill={isLiked(item.id) ? 'currentColor' : 'none'}
                            className="text-rose-500"
                            strokeWidth={2.5}
                          />
                          {getLikeCount(item.id) > 0 && <span>{getLikeCount(item.id)}</span>}
                        </button>
                      )}
                    </div>

                    <h3 className="font-bold text-[16.5px] text-gray-900 leading-tight mb-1 group-hover:text-[#FF6B00] transition-colors">{item.title}</h3>

                    <div className="flex flex-col gap-1 mb-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-extrabold text-[16px] text-gray-900">
                          {item.hasDiscount && item.priceFinal != null ? `₹${item.priceFinal}` : (item.price || '₹199')}
                        </span>
                        {item.hasDiscount && item.priceOriginal != null && (
                          <span className="text-[12px] text-gray-400 line-through font-medium">₹{item.priceOriginal}</span>
                        )}
                      </div>
                      {(item.resolvedOffer?.badge || (item.hasDiscount && item.priceOriginal != null && item.priceFinal != null && item.priceOriginal > item.priceFinal)) && (
                        <div>
                          <span className="bg-[#FF6B00] text-white text-[9.5px] font-black px-2 py-0.5 rounded-md shadow-2xs uppercase tracking-wider inline-block">
                            {item.resolvedOffer?.badge || `${Math.round(((item.priceOriginal! - item.priceFinal!) / item.priceOriginal!) * 100)}% OFF`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Image & Button Side */}
                  <div className="relative w-[130px] flex-shrink-0 flex flex-col items-center">
                    <div className="w-[130px] h-[130px] rounded-[20px] overflow-hidden shadow-xs relative bg-gray-50 border border-gray-100">
                      <button
                        type="button"
                        disabled={isLikePending(item.id)}
                        onClick={(e) => handleLikeClick(item.id, e)}
                        className="absolute top-2 right-2 z-20 p-1.5 bg-white/90 backdrop-blur-md rounded-full shadow-xs text-gray-400 hover:text-rose-500 transition-all active:scale-90 flex items-center justify-center cursor-pointer disabled:opacity-50"
                        title={isLiked(item.id) ? 'Unlike' : 'Like'}
                      >
                        <Heart
                          size={14}
                          className={isLiked(item.id) ? 'text-rose-500 fill-rose-500' : 'text-gray-400'}
                          strokeWidth={2.5}
                        />
                      </button>
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl bg-orange-50/50">
                          {getCategoryEmoji(item.category || '')}
                        </div>
                      )}
                      {(item.resolvedOffer || item.badgeLabel) && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 to-transparent pt-6 pb-2 px-2 text-center">
                          <span className="text-white text-[9.5px] font-black uppercase tracking-wider block truncate">
                            {item.resolvedOffer?.badge || item.badgeLabel}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="absolute -bottom-3.5 z-10 w-full px-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleItemClick(item);
                        }}
                        className="w-full bg-white text-[#FF6B00] font-bold border border-orange-200 py-2 rounded-[12px] shadow-md text-[13px] hover:bg-orange-50 uppercase transition-transform active:scale-95 flex items-center justify-center gap-1"
                      >
                        ADD <span className="font-normal leading-none text-[16px]">+</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Desktop Layout (lg+) ── */}
      <div className="hidden lg:flex min-h-screen">
        <aside className="w-[320px] xl:w-[360px] shrink-0 bg-white border-r border-gray-200 flex flex-col sticky top-0 h-screen overflow-y-auto hide-scrollbar shadow-xs">
          <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C33] p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-black tracking-tight">{vendorName}</h1>
              <div className="flex items-center gap-1.5">
                {phone && (
                  <a href={`tel:${phone}`} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white" title="Call">
                    <Phone size={15} className="fill-white" />
                  </a>
                )}
                {whatsapp && (
                  <a href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" onClick={handleWhatsApp} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white p-1.5" title="WhatsApp">
                    <WhatsAppIcon className="w-4 h-4 fill-white" />
                  </a>
                )}
                <button type="button" onClick={handleShare} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white cursor-pointer" title="Share Menu">
                  <Share2 size={16} />
                </button>
              </div>
            </div>
            <p className="text-xs text-white/90 flex items-center gap-1"><MapPin size={14} /> {vendorAddress}</p>
          </div>

          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-200 focus-within:border-[#FF6B00] transition-all">
              <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
              <input type="text" placeholder="Search dishes..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bg-transparent border-none outline-none w-full text-sm text-gray-800 font-medium placeholder-gray-400" />
              {searchQuery && (<button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>)}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto hide-scrollbar p-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-2">Categories</p>
            {categoryList.map((cat, index) => {
              const isActive = selectedCategory === cat;
              return (
                <button key={index} type="button" onClick={() => setSelectedCategory(cat)} className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl mb-1 text-left transition-all font-bold text-sm cursor-pointer ${isActive ? 'bg-[#FF6B00]/10 text-[#FF6B00]' : 'text-gray-700 hover:bg-gray-50'}`}>
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <main className="flex-1 min-w-0 px-8 xl:px-12 py-8 overflow-y-auto bg-[#FDFBF7] min-h-[70vh]">
          {offers && offers.length > 0 && isAllCategory && !searchQuery && (
            <div className="mb-8 w-full">
              <PublicOfferCarousel offers={offers} />
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-[#FF6B00] tracking-tight">{isAllCategory ? 'Full Menu' : selectedCategory}</h2>
            <div className="bg-white rounded-full flex p-1 border border-gray-200 shadow-2xs">
              <button type="button" onClick={() => setDietFilter('all')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${dietFilter === 'all' ? 'bg-[#FF6B00] text-white' : 'text-gray-600'}`}>All</button>
              <button type="button" onClick={() => setDietFilter('veg')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${dietFilter === 'veg' ? 'bg-emerald-600 text-white' : 'text-gray-600'}`}>Veg</button>
              <button type="button" onClick={() => setDietFilter('non-veg')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${dietFilter === 'non-veg' ? 'bg-[#8F291D] text-white' : 'text-gray-600'}`}>Non-Veg</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
            {filteredItems.map((item) => (
              <div key={item.id} onClick={() => handleItemClick(item)} className="bg-white rounded-2xl p-4 shadow-2xs border border-gray-100 flex gap-4 cursor-pointer hover:shadow-md transition-all group">
                <div className="flex-1 flex flex-col min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <FoodTypeIcon type={item.foodType} />
                    {item.isBestseller && <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded shrink-0">BESTSELLER</span>}
                    {(getLikeCount(item.id) > 0 || isLiked(item.id)) && (
                      <button
                        type="button"
                        disabled={isLikePending(item.id)}
                        onClick={(e) => handleLikeClick(item.id, e)}
                        className="flex items-center gap-1 text-[11px] font-extrabold text-rose-600 transition-transform active:scale-90 cursor-pointer border-none bg-transparent ml-1"
                      >
                        <Heart
                          size={13}
                          fill={isLiked(item.id) ? 'currentColor' : 'none'}
                          className="text-rose-500"
                          strokeWidth={2.5}
                        />
                        {getLikeCount(item.id) > 0 && <span>{getLikeCount(item.id)}</span>}
                      </button>
                    )}
                  </div>
                  <h3 className="font-bold text-base text-gray-900 group-hover:text-[#FF6B00] transition-colors leading-tight mb-1 truncate">{item.title}</h3>
                  <div className="flex flex-col gap-1 mb-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-extrabold text-base text-gray-900">{item.hasDiscount && item.priceFinal != null ? `₹${item.priceFinal}` : (item.price || '₹199')}</span>
                      {item.hasDiscount && item.priceOriginal != null && <span className="text-xs text-gray-400 line-through">₹{item.priceOriginal}</span>}
                    </div>
                    {(item.resolvedOffer?.badge || (item.hasDiscount && item.priceOriginal != null && item.priceFinal != null && item.priceOriginal > item.priceFinal)) && (
                      <div>
                        <span className="bg-[#FF6B00] text-white text-[9.5px] font-black px-2 py-0.5 rounded-md shadow-2xs uppercase tracking-wider inline-block">
                          {item.resolvedOffer?.badge || `${Math.round(((item.priceOriginal! - item.priceFinal!) / item.priceOriginal!) * 100)}% OFF`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                  <button
                    type="button"
                    disabled={isLikePending(item.id)}
                    onClick={(e) => handleLikeClick(item.id, e)}
                    className="absolute top-1.5 right-1.5 z-20 p-1 bg-white/90 backdrop-blur-md rounded-full shadow-xs text-gray-400 hover:text-rose-500 transition-all active:scale-90 flex items-center justify-center cursor-pointer disabled:opacity-50"
                    title={isLiked(item.id) ? 'Unlike' : 'Like'}
                  >
                    <Heart
                      size={13}
                      className={isLiked(item.id) ? 'text-rose-500 fill-rose-500' : 'text-gray-400'}
                      strokeWidth={2.5}
                    />
                  </button>
                  {item.image ? <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center text-3xl">{getCategoryEmoji(item.category || '')}</div>}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Item Detail Modal Widget */}
      {selectedItemModal && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto ${isModalClosing ? 'apple-backdrop-out' : 'apple-backdrop-in'}`}
          onClick={closeModal}
        >
          <div
            className={`relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-gray-100/80 overflow-hidden my-auto cursor-default ${isModalClosing ? 'apple-card-out' : 'apple-card-in'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
              <div className="absolute top-4 inset-x-4 z-20 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-2 pointer-events-auto">
                  {selectedItemModal.foodType && (
                    <span className="p-1 bg-white/90 backdrop-blur-md rounded-lg shadow-md flex items-center gap-1.5 px-2">
                      <FoodTypeIcon type={selectedItemModal.foodType} />
                      <span className="text-[11px] font-bold text-slate-700 capitalize">
                        {selectedItemModal.foodType}
                      </span>
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="p-2 bg-white/90 backdrop-blur-md text-slate-700 hover:text-slate-950 rounded-full shadow-md transition-all hover:scale-105 active:scale-95 pointer-events-auto cursor-pointer"
                  aria-label="Close modal"
                >
                  <X size={18} strokeWidth={2.5} />
                </button>
              </div>

              {selectedItemModal.image ? (
                <img
                  src={selectedItemModal.image}
                  alt={selectedItemModal.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-7xl bg-orange-50/50">
                  {getCategoryEmoji(selectedItemModal.category || '')}
                </div>
              )}
            </div>

            <div className="p-6 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight tracking-tight">
                  {selectedItemModal.title}
                </h3>
                <button
                  type="button"
                  disabled={isLikePending(selectedItemModal.id)}
                  onClick={(e) => handleLikeClick(selectedItemModal.id, e)}
                  className="px-4 py-2.5 bg-rose-50/90 hover:bg-rose-100 border border-rose-200/80 rounded-full text-slate-700 hover:text-rose-600 transition-all shrink-0 cursor-pointer shadow-xs flex items-center gap-2 hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  <Heart
                    size={22}
                    className={isLiked(selectedItemModal.id) ? 'text-rose-500 fill-rose-500' : ''}
                    strokeWidth={2.5}
                  />
                  {getLikeCount(selectedItemModal.id) > 0 && (
                    <span className="text-sm font-black text-slate-800">{getLikeCount(selectedItemModal.id)}</span>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between bg-orange-50/80 border border-orange-200/70 p-3.5 rounded-2xl">
                <div className="flex items-baseline gap-2.5">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {selectedItemModal.hasDiscount && selectedItemModal.priceFinal != null
                      ? `₹${selectedItemModal.priceFinal}`
                      : (selectedItemModal.price || '₹199')}
                  </span>
                  {selectedItemModal.hasDiscount && selectedItemModal.priceOriginal != null && (
                    <span className="text-base text-slate-400 font-bold line-through">
                      ₹{selectedItemModal.priceOriginal}
                    </span>
                  )}
                </div>
              </div>

              {selectedItemModal.description && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Description
                  </span>
                  <p className="text-slate-600 font-medium text-sm sm:text-base leading-relaxed">
                    {selectedItemModal.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Today's Specials Full Page View Overlay */}
      {showAllSpecialsView && (
        <div className="fixed inset-0 z-50 bg-[#FDFBF7] flex flex-col overflow-hidden animate-in fade-in duration-200">
          {/* Top Header */}
          <div className="bg-gradient-to-r from-[#FF6B00] via-[#FF7A1A] to-[#FF8C33] px-4 sm:px-6 py-4 text-white flex items-center justify-between shadow-md shrink-0">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowAllSpecialsView(false)}
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
              {todaysSpecialsList.length} Items
            </div>
          </div>

          {/* Dishes Grid / List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20">
            <div className="max-w-3xl mx-auto flex flex-col gap-4">
              {todaysSpecialsList.map((item) => {
                const itemIsLiked = isLiked(item.id);
                const itemLikeCount = getLikeCount(item.id);

                return (
                  <div
                    key={`specials-page-${item.id}`}
                    onClick={() => handleItemClick(item)}
                    className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 flex gap-4 cursor-pointer hover:shadow-md transition-all group"
                  >
                    {/* Left Details */}
                    <div className="flex-1 flex flex-col pt-0.5 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <FoodTypeIcon type={item.foodType} />
                        <span className="text-[10px] font-black text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full uppercase">
                          Today's Special
                        </span>
                      </div>

                      <h3 className="font-extrabold text-base sm:text-lg text-gray-900 leading-tight mb-1 group-hover:text-[#FF6B00] transition-colors">
                        {item.title}
                      </h3>

                      <div className="flex flex-col gap-1 mb-2">
                        <div className="flex items-baseline gap-2">
                          <span className="font-extrabold text-base text-gray-900">
                            {item.hasDiscount && item.priceFinal != null ? `₹${item.priceFinal}` : (item.price || '₹199')}
                          </span>
                          {item.hasDiscount && item.priceOriginal != null && (
                            <span className="text-xs text-gray-400 line-through font-medium">₹{item.priceOriginal}</span>
                          )}
                        </div>
                        {(item.resolvedOffer?.badge || (item.hasDiscount && item.priceOriginal != null && item.priceFinal != null && item.priceOriginal > item.priceFinal)) && (
                          <div>
                            <span className="bg-[#FF6B00] text-white text-[9.5px] font-black px-2 py-0.5 rounded-md shadow-2xs uppercase tracking-wider inline-block">
                              {item.resolvedOffer?.badge || `${Math.round(((item.priceOriginal! - item.priceFinal!) / item.priceOriginal!) * 100)}% OFF`}
                            </span>
                          </div>
                        )}
                      </div>

                      {itemLikeCount > 0 && (
                        <span className="text-[11px] font-extrabold text-rose-600 flex items-center gap-1">
                          <Heart size={11} className="text-rose-500 fill-rose-500" /> {itemLikeCount} likes
                        </span>
                      )}
                    </div>

                    {/* Right Image & Button */}
                    <div className="relative w-28 sm:w-32 flex-shrink-0 flex flex-col items-center pb-2">
                      <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100 relative">
                        <button
                          type="button"
                          disabled={isLikePending(item.id)}
                          onClick={(e) => handleLikeClick(item.id, e)}
                          className="absolute top-2 right-2 z-20 p-1.5 bg-white/90 backdrop-blur-md rounded-full shadow-xs text-gray-400 hover:text-rose-500 transition-all active:scale-90 flex items-center justify-center cursor-pointer disabled:opacity-50"
                          title={itemIsLiked ? 'Unlike' : 'Like'}
                        >
                          <Heart
                            size={14}
                            className={itemIsLiked ? 'text-rose-500 fill-rose-500' : 'text-gray-400'}
                            strokeWidth={2.5}
                          />
                        </button>
                        {item.image ? (
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl bg-orange-50/50">
                            {getCategoryEmoji(item.category || '')}
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-2 z-20 w-full px-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleItemClick(item);
                          }}
                          className="w-full bg-white text-[#FF6B00] font-bold border border-orange-200 py-1.5 rounded-[10px] shadow-md text-[12px] hover:bg-orange-50 uppercase transition-transform active:scale-95 flex items-center justify-center gap-0.5 cursor-pointer"
                        >
                          ADD <span className="font-normal text-[14px] leading-none text-[#FF6B00]">+</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
