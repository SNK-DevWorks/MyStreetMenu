'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Heart, Phone, MessageCircle, MapPin, Share2, Flame, Clock, Star, X, Megaphone } from 'lucide-react';
import { type FoodCardItem, type TimeframeType, FoodTypeDot } from '@/components/shared/item';
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

const CARD_COLOR_PALETTES = [
  { bg: 'bg-[#E5DEFF]', border: 'border-purple-300/80', title: 'text-[#4C1D95]', desc: 'text-[#5B21B6]/95', badgeBg: 'bg-white/75', badgeText: 'text-[#5B21B6]', arcStroke: '#4C1D95' },
  { bg: 'bg-[#FFEDD5]', border: 'border-orange-300/80', title: 'text-[#C2410C]', desc: 'text-[#9A3412]/95', badgeBg: 'bg-white/75', badgeText: 'text-[#9A3412]', arcStroke: '#C2410C' },
  { bg: 'bg-[#DCFCE7]', border: 'border-emerald-300/80', title: 'text-[#15803D]', desc: 'text-[#166534]/95', badgeBg: 'bg-white/75', badgeText: 'text-[#166534]', arcStroke: '#15803D' },
  { bg: 'bg-[#FFE4E6]', border: 'border-rose-300/80', title: 'text-[#BE123C]', desc: 'text-[#9F1239]/95', badgeBg: 'bg-white/75', badgeText: 'text-[#9F1239]', arcStroke: '#BE123C' },
  { bg: 'bg-[#E0F2FE]', border: 'border-sky-300/80', title: 'text-[#0369A1]', desc: 'text-[#075985]/95', badgeBg: 'bg-white/75', badgeText: 'text-[#075985]', arcStroke: '#0369A1' },
  { bg: 'bg-[#FEF3C7]', border: 'border-amber-300/80', title: 'text-[#B45309]', desc: 'text-[#92400E]/95', badgeBg: 'bg-white/75', badgeText: 'text-[#B45309]', arcStroke: '#B45309' },
];

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

function GoogleMapsIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" className={className} xmlns="http://www.w3.org/2000/svg">
      <path fill="#EA4335" d="M12 2C8.13 2 5 5.13 5 9c0 1.74.5 3.37 1.41 4.74l5.59 8.26 5.59-8.26C18.5 12.37 19 10.74 19 9c0-3.87-3.13-7-7-7z" />
      <path fill="#FBBC05" d="M12 2v7l5.59 4.74C18.5 12.37 19 10.74 19 9c0-3.87-3.13-7-7-7z" />
      <path fill="#34A853" d="M12 22s3.5-5.17 5.59-8.26L12 9v13z" />
      <path fill="#4285F4" d="M5 9c0 1.74.5 3.37 1.41 4.74L12 22V9H5z" />
      <circle cx="12" cy="9" r="2.8" fill="#FFFFFF" />
    </svg>
  );
}

function Google4ColorShareIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" className={className} xmlns="http://www.w3.org/2000/svg">
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="#4285F4" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="#FBBC05" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="6" cy="12" r="3.2" fill="#4285F4" />
      <circle cx="18" cy="5" r="3.2" fill="#EA4335" />
      <circle cx="18" cy="19" r="3.2" fill="#34A853" />
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

// ─── Public Offer Hero Carousel (Food App Banner Style) ─────────────────────

function PublicOfferCarousel({ offers }: { offers: PublicOfferItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Auto-slide every 4 seconds if multiple offers present
  useEffect(() => {
    if (offers.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % offers.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [offers.length, isPaused]);

  if (!offers || offers.length === 0) return null;

  // Touch Swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    if (touchStartX.current === null) return;
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    if (diffX < -40) {
      // Swipe left -> Next slide
      setActiveIndex((prev) => (prev + 1) % offers.length);
    } else if (diffX > 40) {
      // Swipe right -> Prev slide
      setActiveIndex((prev) => (prev - 1 + offers.length) % offers.length);
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="relative w-full mb-6 group select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Hero Banner Container — Centered, Wide, Smooth Low Rounded Corners */}
      <div className="relative w-full overflow-hidden rounded-2xl shadow-xs border border-orange-100/90 bg-slate-900">
        <div
          className="flex transition-transform duration-500 ease-out w-full"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {offers.map((offer, idx) => (
            <div key={offer.id} className="w-full min-w-full shrink-0 overflow-hidden">
              <OfferCard
                offer={offer}
                index={idx}
                className="w-full min-h-[175px] sm:min-h-[210px] rounded-none border-none"
              />
            </div>
          ))}
        </div>

        {/* Floating Dot Indicators (Food App Carousel Style) */}
        {offers.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 bg-black/45 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 shadow-md">
            {offers.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  i === activeIndex
                    ? 'w-5 h-2 bg-[#f77512] shadow-xs'
                    : 'w-2 h-2 bg-white/60 hover:bg-white'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PublicMenuView({
  vendorName = 'Crispy Bites',
  vendorAddress = '123 Market Street · Open Now · ⭐ 4.8',
  phone = null,
  whatsapp = null,
  mapUrl = null,
  items = [],
  categories = ['All Items'],
  offers = [],
  announcements = [],
}: PublicMenuViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [activeTimeframe, setActiveTimeframe] = useState<TimeframeType>('today');
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});
  const [selectedItemModal, setSelectedItemModal] = useState<FoodCardItem | null>(null);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const { track } = useAnalytics();

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

  // Lock scroll when item modal is open
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

  // Fire menu_view once on mount; also detect QR scan from URL params
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

  // Ensure "All Items" or "All" is present in categories
  const categoryList = useMemo(() => {
    const list = categories.length > 0 ? categories : ['All Items'];
    if (!list.some(c => c.toLowerCase() === 'all' || c.toLowerCase() === 'all items')) {
      return ['All Items', ...list];
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
      return matchesCategory && matchesSearch && item.isAvailable !== false;
    });
  }, [items, searchQuery, selectedCategory, isAllCategory]);

  // Filter items specifically marked by vendor as Today's Special
  const todaysSpecialsList = useMemo(() => {
    return items.filter(i => i.isTodaysSpecial && i.isAvailable !== false);
  }, [items]);

  const tabs = [
    { id: 'today' as TimeframeType, label: "Today's", icon: Clock },
    { id: 'thisWeek' as TimeframeType, label: 'This Week', icon: Star },
    { id: 'thisMonth' as TimeframeType, label: 'This Month', icon: Flame },
  ];

  const handleWhatsApp = () => {
    track('whatsapp_click');
  };

  const handleDirections = () => {
    track('direction_click');
  };

  const handleShare = () => {
    track('share_click');
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: vendorName, url: window.location.href }).catch(() => {});
    }
  };

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedItems(prev => {
      const newVal = !prev[id];
      if (newVal) {
        // Only track when liking (not unliking)
        track('like_click', { itemId: id });
      }
      return { ...prev, [id]: newVal };
    });
  };

  return (
    <div className="min-h-screen bg-[#FDF6F0] text-gray-900 font-sans select-none">
      {/* ── Mobile: phone-frame | Desktop: full page ── */}
      <div className="lg:hidden max-w-[420px] mx-auto bg-[#FDF6F0] min-h-screen sm:min-h-0 sm:shadow-2xl sm:rounded-[3rem] sm:my-8 overflow-hidden relative sm:border sm:border-gray-200/80">
        
        {/* Roof Awning Flap Canopy Header */}
        <div className="w-full relative z-20">
          <div className="w-full flex h-12 drop-shadow-xs">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex-1 relative flex flex-col">
                {/* Top roof slope */}
                <div className={`w-full h-4 ${i % 2 === 0 ? 'bg-[#f77512]' : 'bg-gray-200'}`}></div>
                {/* Front vertical flap */}
                <div className={`w-full h-8 ${i % 2 === 0 ? 'bg-[#f77512]' : 'bg-white'}`}></div>
                {/* Bottom rounded scallop */}
                <div className={`absolute -bottom-4 left-0 w-full h-8 rounded-b-full ${i % 2 === 0 ? 'bg-[#f77512]' : 'bg-white'}`}></div>
              </div>
            ))}
          </div>

          <header className="flex flex-col gap-1.5 px-5 pb-2 pt-8">
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                {vendorName}
              </h1>

              {/* Official Icon-Only Quick Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {phone && (
                  <a
                    href={`tel:${phone}`}
                    className="w-9 h-9 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center shadow-xs transition-all active:scale-95"
                    title="Call Us"
                    aria-label="Call Us"
                  >
                    <Phone size={15} className="fill-white text-white" />
                  </a>
                )}
                {whatsapp && (
                  <a
                    href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleWhatsApp}
                    className="w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-xs transition-all active:scale-95 p-2"
                    title="WhatsApp"
                    aria-label="WhatsApp"
                  >
                    <WhatsAppIcon className="w-4 h-4 fill-white" />
                  </a>
                )}
                {mapUrl && (
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleDirections}
                    className="w-9 h-9 rounded-full bg-white border border-gray-200/90 hover:bg-rose-50 flex items-center justify-center shadow-2xs transition-all active:scale-95 p-1.5"
                    title="Location"
                    aria-label="Location"
                  >
                    <GoogleMapsIcon className="w-5 h-5" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={handleShare}
                  className="w-9 h-9 rounded-full bg-white border border-gray-200/90 hover:bg-gray-50 flex items-center justify-center shadow-2xs transition-all active:scale-95 cursor-pointer p-2"
                  title="Share Menu"
                  aria-label="Share Menu"
                >
                  <Google4ColorShareIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </header>
        </div>

        {/* Main Content */}
        <main className="px-5 pt-3 pb-10">
          {/* Search Bar */}
          <div className="flex gap-3 my-2 mb-4">
            <div className="flex-1 flex items-center bg-white rounded-[1.25rem] px-4 py-3 shadow-xs border border-gray-100 focus-within:border-[#f77512] transition-all">
              <Search className="w-4 h-4 text-gray-400 mr-2.5 shrink-0" />
              <input
                type="text"
                placeholder="Search for your favorite dish..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-[13px] text-gray-800 font-medium placeholder-gray-400"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* ── 1. ANNOUNCEMENTS (Slim Notification Bar Style) ────────────────── */}
          {announcements && announcements.length > 0 && isAllCategory && !searchQuery && (
            <div className="mb-4 flex flex-col gap-2">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="w-full bg-gradient-to-r from-indigo-50/95 via-blue-50/90 to-indigo-50/95 border border-indigo-200/80 rounded-2xl px-3.5 py-2.5 shadow-2xs flex items-center gap-3 transition-all hover:border-indigo-300 active:scale-[0.99]"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Megaphone size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-100/90 px-1.5 py-0.5 rounded-md">Notice</span>
                      <h4 className="text-xs sm:text-sm font-black text-indigo-950 truncate leading-tight">{ann.title}</h4>
                    </div>
                    {ann.description && (
                      <p className="text-[11px] text-indigo-900/80 font-semibold line-clamp-1 mt-0.5 leading-tight">{ann.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── OFFERS HERO CAROUSEL ── */}
          {isAllCategory && !searchQuery && <PublicOfferCarousel offers={offers} />}

          {/* Categories Horizontal Scroll */}
          <div className="mb-6 overflow-x-auto no-scrollbar -mx-5 px-5 pt-2 pb-2">
            <div className="flex gap-4 min-w-max py-2 px-1">
              {categoryList.map((cat, index) => {
                const isActive = selectedCategory === cat;
                const emoji = getCategoryEmoji(cat);
                return (
                  <div key={index} onClick={() => setSelectedCategory(cat)} className="flex flex-col items-center gap-2 cursor-pointer group shrink-0 select-none">
                    <div className={`w-[62px] h-[62px] rounded-full flex items-center justify-center transition-all duration-300 ${ isActive ? 'bg-[#f77512]/25 text-[#f77512] scale-110 shadow-xs font-black' : 'bg-[#f77512]/15 text-[#f77512]/90 hover:bg-[#f77512]/25 hover:scale-105 shadow-2xs'}` }>
                      <span className={`transition-transform duration-300 ${isActive ? 'text-2xl scale-110' : 'text-xl'}`}>{emoji}</span>
                    </div>
                    <span className={`text-[11px] font-black transition-colors ${isActive ? 'text-[#f77512]' : 'text-gray-800 font-bold group-hover:text-[#f77512]'}`}>{cat}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Today's Specials */}
          {todaysSpecialsList.length > 0 && isAllCategory && !searchQuery && (
            <div className="mb-7">
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-[#f77512] fill-[#f77512]" />
                  <h3 className="text-lg font-black text-gray-900 tracking-tight">Today's Specials</h3>
                </div>
                <span className="text-[11px] font-black text-[#f77512] bg-orange-100/70 px-2.5 py-0.5 rounded-full border border-orange-200/80">
                  {todaysSpecialsList.length} {todaysSpecialsList.length === 1 ? 'Item' : 'Items'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {todaysSpecialsList.map((item) => {
                  const isLiked = !!likedItems[item.id];
                  return (
                    <div key={item.id} onClick={() => handleItemClick(item)} className="bg-white rounded-2xl shadow-xs border border-orange-100 flex flex-col relative group cursor-pointer hover:shadow-md transition-all duration-200 overflow-hidden">
                      <div className="relative h-[120px] w-full bg-gray-50 overflow-hidden p-1">
                        {item.foodType && (<span className="absolute top-2 left-2 z-10 p-0.5 bg-white/90 rounded-sm shadow-xs"><FoodTypeDot type={item.foodType} /></span>)}
                        <button type="button" onClick={(e) => toggleLike(item.id, e)} className="absolute top-2 right-2 p-1 bg-white/90 rounded-full z-10 text-gray-400 hover:text-red-500 transition-colors shadow-xs">
                          <Heart className={`w-3 h-3 ${isLiked ? 'text-red-500 fill-red-500' : ''}`} strokeWidth={2.5} />
                        </button>
                        {item.image ? (<img src={item.image} alt={item.title} className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500" />) : (<div className="w-full h-full flex items-center justify-center text-3xl">{getCategoryEmoji(item.category || '')}</div>)}
                      </div>
                      <div className="flex flex-col flex-1 p-2.5">
                        <span className="text-[8px] font-black text-[#B91C1C] tracking-widest uppercase mb-0.5">Special</span>
                        <h4 className="font-extrabold text-[12px] text-gray-900 leading-tight line-clamp-1 mb-0.5">{item.title}</h4>
                        {item.description ? (
                          <p className="text-[10px] text-gray-400 font-medium line-clamp-1 mb-2.5">{item.description}</p>
                        ) : null}
                        <div className="flex items-center gap-1.5 mt-auto">
                          <span className="text-[13px] font-black text-gray-900 tracking-tight">
                            {item.hasDiscount && item.priceFinal != null ? `₹${item.priceFinal}` : (item.price || '₹199')}
                          </span>
                          {item.hasDiscount && item.priceOriginal != null && (
                            <span className="text-[10px] text-gray-400 line-through">₹{item.priceOriginal}</span>
                          )}
                          {item.resolvedOffer && (
                            <span className="ml-auto text-[8px] font-black bg-[#f77512] text-white px-1.5 py-0.5 rounded-full">{item.resolvedOffer.badge}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Timeframe Tabs & Section Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-gray-900 tracking-tight">{selectedCategory === 'All Items' ? 'Menu' : selectedCategory}</h3>
            <div className="flex items-center gap-1 bg-gray-200/70 p-1 rounded-full border border-gray-300/60 shadow-inner">
              {tabs.map(tab => {
                const isActive = activeTimeframe === tab.id;
                const Icon = tab.icon;
                return (
                  <button key={tab.id} type="button" onClick={() => setActiveTimeframe(tab.id)} className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold whitespace-nowrap transition-all cursor-pointer ${ isActive ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900' }`}>
                    <Icon size={11} className={isActive ? 'text-amber-400' : 'text-slate-500'} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Food Items Grid */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-16 text-gray-400 bg-white rounded-[1.75rem] border border-gray-100 shadow-xs mb-8">
              <Search size={36} className="mx-auto mb-2 opacity-40" />
              <p className="font-bold text-sm text-slate-700">No items found</p>
              <p className="text-xs text-slate-400 mt-0.5">Try searching for something else</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 mb-8">
              {filteredItems.map((item) => {
                const isLiked = !!likedItems[item.id];
                const badgeText = item.isTodaysSpecial ? "SPECIAL" : item.isBestseller ? "BESTSELLER" : item.badgeLabel;
                const badgeColor = item.isTodaysSpecial ? "text-[#B91C1C]" : item.isBestseller ? "text-[#B45309]" : "text-[#EA580C]";
                return (
                  <div key={item.id} onClick={() => handleItemClick(item)} className="bg-white rounded-2xl shadow-xs border border-gray-100 flex flex-col relative group cursor-pointer hover:shadow-md transition-all duration-200 overflow-hidden">
                    <div className="relative h-[120px] w-full bg-gray-50 overflow-hidden p-1">
                      {item.foodType && (<span className="absolute top-2 left-2 z-10 p-0.5 bg-white/90 rounded-sm shadow-xs"><FoodTypeDot type={item.foodType} /></span>)}
                      <button type="button" onClick={(e) => toggleLike(item.id, e)} className="absolute top-2 right-2 p-1 bg-white/90 rounded-full z-10 text-gray-400 hover:text-red-500 transition-colors shadow-xs">
                        <Heart className={`w-3 h-3 ${isLiked ? 'text-red-500 fill-red-500' : ''}`} strokeWidth={2.5} />
                      </button>
                      {item.image ? (<img src={item.image} alt={item.title} className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500" />) : (<div className="w-full h-full flex items-center justify-center text-3xl">{getCategoryEmoji(item.category || '')}</div>)}
                    </div>
                    <div className="flex flex-col flex-1 p-2.5">
                      {badgeText && <span className={`text-[8px] font-black tracking-widest uppercase mb-0.5 ${badgeColor}`}>{badgeText}</span>}
                      <h4 className="font-extrabold text-[12px] text-gray-900 leading-tight line-clamp-1 mb-0.5">{item.title}</h4>
                      {item.description ? (
                        <p className="text-[10px] text-gray-400 font-medium line-clamp-1 mb-2.5">{item.description}</p>
                      ) : null}
                      <div className="flex items-center gap-1.5 mt-auto">
                        <span className="text-[13px] font-black text-gray-900 tracking-tight">
                          {item.hasDiscount && item.priceFinal != null ? `₹${item.priceFinal}` : (item.price || '₹199')}
                        </span>
                        {item.hasDiscount && item.priceOriginal != null && (
                          <span className="text-[10px] text-gray-400 line-through">₹{item.priceOriginal}</span>
                        )}
                        {item.resolvedOffer && (
                          <span className="ml-auto text-[8px] font-black bg-[#f77512] text-white px-1.5 py-0.5 rounded-full">{item.resolvedOffer.badge}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* ── DESKTOP LAYOUT (lg+) ── */}
      <div className="hidden lg:flex min-h-screen">
        {/* Left Sidebar */}
        <aside className="w-[300px] xl:w-[340px] shrink-0 bg-white border-r border-gray-200 flex flex-col sticky top-0 h-screen overflow-y-auto no-scrollbar shadow-sm">
          {/* Awning header strip */}
          <div className="w-full flex h-10 shrink-0">
            {[...Array(10)].map((_, i) => (
              <div key={i} className={`flex-1 ${i % 2 === 0 ? 'bg-[#f77512]' : 'bg-white'}`} />
            ))}
          </div>

          <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">{vendorName}</h1>

              {/* Official Icon-Only Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                {phone && (
                  <a
                    href={`tel:${phone}`}
                    className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-all shadow-xs hover:scale-105 active:scale-95"
                    title="Call"
                  >
                    <Phone size={15} className="fill-white text-white" />
                  </a>
                )}
                {whatsapp && (
                  <a
                    href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleWhatsApp}
                    className="w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-all shadow-xs hover:scale-105 active:scale-95 p-1.5"
                    title="WhatsApp"
                  >
                    <WhatsAppIcon className="w-4 h-4 fill-white" />
                  </a>
                )}
                {mapUrl && (
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleDirections}
                    className="w-8 h-8 rounded-full bg-white border border-gray-200/90 hover:bg-rose-50 flex items-center justify-center transition-all shadow-2xs hover:scale-105 active:scale-95 p-1.5"
                    title="Location"
                  >
                    <GoogleMapsIcon className="w-4 h-4" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={handleShare}
                  className="w-8 h-8 rounded-full bg-white border border-gray-200/90 hover:bg-gray-50 flex items-center justify-center transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer p-1.5"
                  title="Share Menu"
                >
                  <Google4ColorShareIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center bg-[#FDF6F0] rounded-xl px-3 py-2.5 border border-gray-200 focus-within:border-[#f77512] transition-all">
              <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
              <input type="text" placeholder="Search dishes..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bg-transparent border-none outline-none w-full text-sm text-gray-800 font-medium placeholder-gray-400" />
              {searchQuery && (<button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>)}
            </div>
          </div>

          {/* Category list vertical */}
          <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-2">Categories</p>
            {categoryList.map((cat, index) => {
              const isActive = selectedCategory === cat;
              const emoji = getCategoryEmoji(cat);
              return (
                <button key={index} type="button" onClick={() => setSelectedCategory(cat)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-left transition-all font-bold text-sm ${ isActive ? 'bg-[#f77512]/15 text-[#f77512]' : 'text-gray-700 hover:bg-gray-100' }`}>
                  <span className="text-lg">{emoji}</span>
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>


        </aside>

        {/* Main content area */}
        <main className="flex-1 min-w-0 px-8 xl:px-12 py-8 overflow-y-auto bg-[#FDF6F0]">

          {/* ── 1. ANNOUNCEMENTS (Desktop — Slim Notification Bar Style) ────── */}
          {announcements && announcements.length > 0 && isAllCategory && !searchQuery && (
            <div className="mb-6 flex flex-col gap-2.5 w-full">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="w-full bg-gradient-to-r from-indigo-50/95 via-blue-50/90 to-indigo-50/95 border border-indigo-200/80 rounded-2xl px-4 py-3 shadow-2xs flex items-center gap-3.5 transition-all hover:border-indigo-300 active:scale-[0.99]"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Megaphone size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-100/90 px-2 py-0.5 rounded-md">Notice</span>
                      <h4 className="text-sm font-black text-indigo-950 truncate leading-tight">{ann.title}</h4>
                    </div>
                    {ann.description && (
                      <p className="text-xs text-indigo-900/80 font-semibold line-clamp-1 mt-0.5 leading-tight">{ann.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── 2. OFFERS HERO CAROUSEL (Desktop — Full Width) ────────────── */}
          {isAllCategory && !searchQuery && (
            <div className="mb-8 w-full">
              <PublicOfferCarousel offers={offers} />
            </div>
          )}

          {/* Today's Specials */}
          {todaysSpecialsList.length > 0 && isAllCategory && !searchQuery && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-[#f77512] fill-[#f77512]" />
                  <h2 className="text-xl font-black text-gray-900 tracking-tight">Today's Specials</h2>
                </div>
                <span className="text-xs font-black text-[#f77512] bg-orange-100/70 px-3 py-1 rounded-full border border-orange-200/80">
                  {todaysSpecialsList.length} {todaysSpecialsList.length === 1 ? 'Item' : 'Items'}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {todaysSpecialsList.map((item) => {
                  const isLiked = !!likedItems[item.id];
                  return (
                    <div key={item.id} onClick={() => handleItemClick(item)} className="bg-white rounded-2xl shadow-xs border border-orange-100 flex flex-col cursor-pointer hover:shadow-md transition-all duration-200 overflow-hidden group">
                      <div className="relative aspect-[4/3] w-full bg-gray-50 overflow-hidden p-1.5">
                        {item.foodType && (<span className="absolute top-2.5 left-2.5 z-10 p-0.5 bg-white/90 rounded-sm shadow-xs"><FoodTypeDot type={item.foodType} /></span>)}
                        <button type="button" onClick={(e) => toggleLike(item.id, e)} className="absolute top-2.5 right-2.5 p-1 bg-white/90 rounded-full z-10 text-gray-400 hover:text-red-500 transition-colors shadow-xs">
                          <Heart className={`w-3 h-3 ${isLiked ? 'text-red-500 fill-red-500' : ''}`} strokeWidth={2.5} />
                        </button>
                        {item.image ? (<img src={item.image} alt={item.title} className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500" />) : (<div className="w-full h-full flex items-center justify-center text-4xl">{getCategoryEmoji(item.category || '')}</div>)}
                      </div>
                        <div className="flex flex-col flex-1 p-3">
                        <span className="text-[9px] font-black text-[#B91C1C] tracking-widest uppercase mb-0.5">Special</span>
                        <h4 className="font-extrabold text-[13px] text-gray-900 leading-tight line-clamp-1 mb-0.5">{item.title}</h4>
                        {item.description ? (
                          <p className="text-[11px] text-gray-400 font-medium line-clamp-1 mb-2">{item.description}</p>
                        ) : null}
                        <div className="flex items-center gap-2 mt-auto">
                          <span className="text-sm font-black text-gray-900 tracking-tight">
                            {item.hasDiscount && item.priceFinal != null ? `₹${item.priceFinal}` : (item.price || '₹199')}
                          </span>
                          {item.hasDiscount && item.priceOriginal != null && (
                            <span className="text-[10px] text-gray-400 line-through">₹{item.priceOriginal}</span>
                          )}
                          {item.resolvedOffer && (
                            <span className="ml-auto text-[9px] font-black bg-[#f77512] text-white px-1.5 py-0.5 rounded-full">{item.resolvedOffer.badge}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Menu section header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-black text-gray-900 tracking-tight">{selectedCategory === 'All Items' ? 'Menu' : selectedCategory}</h2>
            <div className="flex items-center gap-1 bg-gray-200/70 p-1 rounded-full border border-gray-300/60 shadow-inner">
              {tabs.map(tab => {
                const isActive = activeTimeframe === tab.id;
                const Icon = tab.icon;
                return (
                  <button key={tab.id} type="button" onClick={() => setActiveTimeframe(tab.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${ isActive ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900' }`}>
                    <Icon size={12} className={isActive ? 'text-amber-400' : 'text-slate-500'} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Items Grid */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100 shadow-xs">
              <Search size={40} className="mx-auto mb-3 opacity-40" />
              <p className="font-bold text-base text-slate-700">No items found</p>
              <p className="text-sm text-slate-400 mt-1">Try searching for something else</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-10">
              {filteredItems.map((item) => {
                const isLiked = !!likedItems[item.id];
                const badgeText = item.isTodaysSpecial ? "SPECIAL" : item.isBestseller ? "BESTSELLER" : item.badgeLabel;
                const badgeColor = item.isTodaysSpecial ? "text-[#B91C1C]" : item.isBestseller ? "text-[#B45309]" : "text-[#EA580C]";
                return (
                  <div key={item.id} onClick={() => handleItemClick(item)} className="bg-white rounded-2xl shadow-xs border border-gray-100 flex flex-col cursor-pointer hover:shadow-md transition-all duration-200 overflow-hidden group">
                    <div className="relative aspect-[4/3] w-full bg-gray-50 overflow-hidden p-1.5">
                      {item.foodType && (<span className="absolute top-2.5 left-2.5 z-10 p-0.5 bg-white/90 rounded-sm shadow-xs"><FoodTypeDot type={item.foodType} /></span>)}
                      <button type="button" onClick={(e) => toggleLike(item.id, e)} className="absolute top-2.5 right-2.5 p-1 bg-white/90 rounded-full z-10 text-gray-400 hover:text-red-500 transition-colors shadow-xs">
                        <Heart className={`w-3 h-3 ${isLiked ? 'text-red-500 fill-red-500' : ''}`} strokeWidth={2.5} />
                      </button>
                      {item.image ? (<img src={item.image} alt={item.title} className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500" />) : (<div className="w-full h-full flex items-center justify-center text-4xl">{getCategoryEmoji(item.category || '')}</div>)}
                    </div>
                    <div className="flex flex-col flex-1 p-3">
                      {badgeText && <span className={`text-[9px] font-black tracking-widest uppercase mb-0.5 ${badgeColor}`}>{badgeText}</span>}
                      <h4 className="font-extrabold text-[13px] text-gray-900 leading-tight line-clamp-1 mb-0.5">{item.title}</h4>
                      {item.description ? (
                        <p className="text-[11px] text-gray-400 font-medium line-clamp-1 mb-2">{item.description}</p>
                      ) : null}
                      <div className="flex items-center gap-2 mt-auto">
                        <span className="text-sm font-black text-gray-900 tracking-tight">
                          {item.hasDiscount && item.priceFinal != null ? `₹${item.priceFinal}` : (item.price || '₹199')}
                        </span>
                        {item.hasDiscount && item.priceOriginal != null && (
                          <span className="text-[10px] text-gray-400 line-through">₹{item.priceOriginal}</span>
                        )}
                        {item.resolvedOffer && (
                          <span className="ml-auto text-[9px] font-black bg-[#f77512] text-white px-1.5 py-0.5 rounded-full">{item.resolvedOffer.badge}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* ── Zoomed Floating Item Detail Modal Widget (Apple Spring Animation) ── */}
      {selectedItemModal && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto ${
            isModalClosing ? 'apple-backdrop-out' : 'apple-backdrop-in'
          }`}
          onClick={closeModal}
        >
          <div
            className={`relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-gray-100/80 overflow-hidden my-auto cursor-default ${
              isModalClosing ? 'apple-card-out' : 'apple-card-in'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Banner Image Container */}
            <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
              {/* Top Floating Controls */}
              <div className="absolute top-4 inset-x-4 z-20 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-2 pointer-events-auto">
                  {selectedItemModal.foodType && (
                    <span className="p-1 bg-white/90 backdrop-blur-md rounded-lg shadow-md flex items-center gap-1.5 px-2">
                      <FoodTypeDot type={selectedItemModal.foodType} />
                      <span className="text-[11px] font-bold text-slate-700 capitalize">
                        {selectedItemModal.foodType}
                      </span>
                    </span>
                  )}
                  {selectedItemModal.category && (
                    <span className="bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">
                      {selectedItemModal.category}
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

              {/* Offer / Special Badge Tag on Image bottom-left */}
              {(selectedItemModal.resolvedOffer || selectedItemModal.isTodaysSpecial || selectedItemModal.isBestseller) && (
                <div className="absolute bottom-3 left-4 z-20 flex items-center gap-1.5">
                  {selectedItemModal.resolvedOffer ? (
                    <span className="bg-[#f77512] text-white text-xs font-black px-3 py-1 rounded-full shadow-lg tracking-wide border border-white/30">
                      🔥 {selectedItemModal.resolvedOffer.badge}
                    </span>
                  ) : selectedItemModal.isTodaysSpecial ? (
                    <span className="bg-rose-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg tracking-wide border border-white/30">
                      ⭐ TODAY'S SPECIAL
                    </span>
                  ) : selectedItemModal.isBestseller ? (
                    <span className="bg-amber-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg tracking-wide border border-white/30">
                      👑 BESTSELLER
                    </span>
                  ) : null}
                </div>
              )}

              {/* Dish Image or Emoji Fallback */}
              {selectedItemModal.image ? (
                <img
                  src={selectedItemModal.image}
                  alt={selectedItemModal.title}
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-7xl bg-orange-50/50">
                  {getCategoryEmoji(selectedItemModal.category || '')}
                </div>
              )}
            </div>

            {/* Item Body Content */}
            <div className="p-6 flex flex-col gap-4">
              {/* Title & Like button */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight tracking-tight">
                    {selectedItemModal.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={(e) => toggleLike(selectedItemModal.id, e)}
                  className="p-2.5 bg-slate-100 hover:bg-rose-50 rounded-full text-slate-400 hover:text-rose-500 transition-colors shrink-0 cursor-pointer shadow-xs"
                >
                  <Heart
                    size={20}
                    className={likedItems[selectedItemModal.id] ? 'text-rose-500 fill-rose-500' : ''}
                  />
                </button>
              </div>

              {/* Price Tag Box */}
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
                {selectedItemModal.hasDiscount && selectedItemModal.priceOriginal != null && selectedItemModal.priceFinal != null && (
                  <span className="bg-emerald-600 text-white text-xs font-extrabold px-2.5 py-1 rounded-full shadow-xs">
                    Save ₹{selectedItemModal.priceOriginal - selectedItemModal.priceFinal}
                  </span>
                )}
              </div>

              {/* Description */}
              {selectedItemModal.description ? (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Description
                  </span>
                  <p className="text-slate-600 font-medium text-sm sm:text-base leading-relaxed">
                    {selectedItemModal.description}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        .apple-backdrop-in {
          animation: appleBackdropFadeIn 0.35s ease-out forwards;
        }
        .apple-backdrop-out {
          animation: appleBackdropFadeOut 0.28s ease-in forwards;
        }

        .apple-card-in {
          animation: appleSpringScaleIn 0.42s cubic-bezier(0.32, 0.72, 0, 1) forwards;
        }
        .apple-card-out {
          animation: appleSpringScaleOut 0.28s cubic-bezier(0.32, 0.72, 0, 1) forwards;
        }

        @keyframes appleBackdropFadeIn {
          from { background-color: rgba(2, 6, 23, 0); backdrop-filter: blur(0px); }
          to { background-color: rgba(2, 6, 23, 0.7); backdrop-filter: blur(12px); }
        }
        @keyframes appleBackdropFadeOut {
          from { background-color: rgba(2, 6, 23, 0.7); backdrop-filter: blur(12px); }
          to { background-color: rgba(2, 6, 23, 0); backdrop-filter: blur(0px); }
        }

        @keyframes appleSpringScaleIn {
          0% {
            opacity: 0;
            transform: scale(0.82) translateY(32px);
            filter: blur(6px);
          }
          65% {
            opacity: 1;
            transform: scale(1.02) translateY(-2px);
            filter: blur(0px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
            filter: blur(0px);
          }
        }

        @keyframes appleSpringScaleOut {
          0% {
            opacity: 1;
            transform: scale(1) translateY(0);
            filter: blur(0px);
          }
          100% {
            opacity: 0;
            transform: scale(0.86) translateY(24px);
            filter: blur(4px);
          }
        }
      `}} />
    </div>
  );
}
