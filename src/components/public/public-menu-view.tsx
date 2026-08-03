'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search, Heart, Phone, MessageCircle, MapPin, Share2, Flame, Clock, Star, X, Megaphone } from 'lucide-react';
import { type FoodCardItem, type TimeframeType, FoodTypeDot } from '@/components/shared/item';
import { useAnalytics } from '@/providers/analytics-provider';

export interface AnnouncementItem {
  id: string;
  type?: 'announcement' | 'offer' | 'todays_special';
  title: string;
  description?: string;
  code?: string;
  startDate?: string;
  endDate?: string;
}

interface PublicMenuViewProps {
  vendorName?: string;
  vendorAddress?: string;
  phone?: string | null;
  whatsapp?: string | null;
  mapUrl?: string | null;
  items?: FoodCardItem[];
  categories?: string[];
  announcements?: AnnouncementItem[];
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

export default function PublicMenuView({
  vendorName = 'Crispy Bites',
  vendorAddress = '123 Market Street · Open Now · ⭐ 4.8',
  phone = null,
  whatsapp = null,
  mapUrl = null,
  items = [],
  categories = ['All Items'],
  announcements = [],
}: PublicMenuViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [activeTimeframe, setActiveTimeframe] = useState<TimeframeType>('today');
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});
  const { track } = useAnalytics();

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
    setLikedItems(prev => ({ ...prev, [id]: !prev[id] }));
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

          <header className="flex flex-col gap-3 px-5 pb-2 pt-8">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight text-center flex items-center justify-center gap-2">
              {vendorName}
            </h1>

            {/* Quick Action Pill Buttons */}
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {mapUrl && (
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleDirections}
                  className="flex-1 bg-white border border-gray-200 text-gray-700 py-2 px-3 rounded-full text-xs font-bold flex justify-center items-center gap-1.5 shadow-xs hover:bg-gray-50 transition-colors"
                >
                  <MapPin size={14} className="text-[#f77512]" />
                  <span>Location</span>
                </a>
              )}
              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="flex-1 bg-white border border-gray-200 text-gray-700 py-2 px-3 rounded-full text-xs font-bold flex justify-center items-center gap-1.5 shadow-xs hover:bg-gray-50 transition-colors"
                >
                  <Phone size={14} className="text-gray-700" />
                  <span>Call Us</span>
                </a>
              )}
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleWhatsApp}
                  className="flex-1 bg-white border border-gray-200 text-emerald-700 py-2 px-3 rounded-full text-xs font-bold flex justify-center items-center gap-1.5 shadow-xs hover:bg-emerald-50 transition-colors"
                >
                  <MessageCircle size={14} className="text-emerald-600" />
                  <span>WhatsApp</span>
                </a>
              )}
              <button
                type="button"
                onClick={handleShare}
                className="bg-white border border-gray-200 text-gray-700 p-2 rounded-full shadow-xs hover:bg-gray-50 transition-colors flex items-center justify-center shrink-0"
                title="Share Menu"
              >
                <Share2 size={14} className="text-gray-600" />
              </button>
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

          {/* Announcements */}
          {announcements && announcements.length > 0 && isAllCategory && !searchQuery && (
            <div className="mb-7 flex flex-col gap-5 pt-2">
              {announcements.map((ann) => {
                const isOffer = ann.type === 'offer';
                if (isOffer) {
                  return (
                    <div key={ann.id} className="relative w-full min-h-[140px] sm:min-h-[155px] rounded-2xl sm:rounded-3xl bg-[#FFEDD5] border-2 border-orange-300/80 shadow-xs flex flex-row items-center justify-between p-4 sm:p-5 pt-6 sm:pt-7 transition-all hover:shadow-md mt-2">
                      <div className="absolute -top-3.5 left-4 sm:left-5 bg-gradient-to-r from-[#C2410C] to-[#EA580C] text-white text-[10px] sm:text-[11px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full shadow-md z-30 flex items-center gap-1.5 border-2 border-white">
                        <Flame size={12} className="fill-white text-white" />
                        <span>SPECIAL OFFER</span>
                      </div>
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.08]">
                        <svg width="100%" height="100%" viewBox="0 0 340 144" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="240" cy="72" r="70" stroke="#C2410C" strokeWidth="2.5" />
                          <circle cx="240" cy="72" r="95" stroke="#C2410C" strokeWidth="2.5" />
                        </svg>
                      </div>
                      <div className="flex flex-col z-10 w-[68%] text-left justify-between">
                        <h3 className="text-[#6C1D07] text-2xl sm:text-3xl font-black leading-[1.15] mb-2 tracking-tight drop-shadow-xs capitalize">{ann.title}</h3>
                        {ann.description && <p className="text-[#7C2D12] text-xs sm:text-sm font-bold leading-relaxed mb-2.5 line-clamp-2">{ann.description}</p>}
                        {ann.endDate && (
                          <span className="text-[10px] sm:text-xs font-bold text-[#9A3412] bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg inline-block shadow-2xs border border-orange-200/60">
                            Valid Until <strong className="text-[#C2410C] font-black">{new Date(ann.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</strong>
                          </span>
                        )}
                      </div>
                      <div className="relative z-10 w-[28%] flex justify-end items-center pointer-events-none shrink-0">
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
                          <div className="absolute inset-0 bg-orange-300/40 rounded-full blur-xl" />
                          <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="z-10">
                            <defs><linearGradient id={`offerGrad-${ann.id}`} x1="30" y1="30" x2="170" y2="170" gradientUnits="userSpaceOnUse"><stop stopColor="#F97316" /><stop offset="1" stopColor="#EA580C" /></linearGradient></defs>
                            <rect x="40" y="40" width="120" height="120" rx="28" fill={`url(#offerGrad-${ann.id})`} transform="rotate(-10 100 100)" />
                            <circle cx="75" cy="75" r="10" fill="#FFEAD8" />
                            <path d="M90 120 L135 75" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round" />
                            <circle cx="95" cy="80" r="8" fill="#FFFFFF" />
                            <circle cx="130" cy="115" r="8" fill="#FFFFFF" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={ann.id} className="relative w-full bg-gradient-to-br from-[#EBF4FF] to-[#E0E7FF] rounded-2xl sm:rounded-3xl p-4 sm:p-5 pt-6 sm:pt-7 shadow-xs border-2 border-indigo-100 flex flex-row items-center justify-between gap-3 transition-all hover:shadow-md min-h-[130px] mt-2">
                    <div className="absolute -top-3.5 left-4 sm:left-5 bg-gradient-to-r from-[#1E1B4B] to-[#312E81] text-white text-[10px] sm:text-[11px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full shadow-md z-30 flex items-center gap-1.5 border-2 border-white">
                      <Megaphone size={12} className="text-white" />
                      <span>ANNOUNCEMENT</span>
                    </div>
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-44 h-44 bg-white opacity-40 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-36 h-36 bg-blue-300 opacity-20 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex flex-col z-10 w-[70%] text-left justify-between">
                      <h3 className="text-[#1E1B4B] text-xl sm:text-2xl font-black leading-snug tracking-tight mb-1.5">&ldquo;{ann.title}&rdquo;</h3>
                      {ann.description && <p className="text-slate-600 text-xs sm:text-sm font-semibold leading-relaxed line-clamp-2">{ann.description}</p>}
                    </div>
                    <div className="relative z-10 w-[28%] flex justify-end items-center pointer-events-none shrink-0">
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
                        <div className="absolute inset-0 bg-yellow-200/40 rounded-full blur-xl" />
                        <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="z-10">
                          <defs>
                            <linearGradient id={`bellGrad-${ann.id}`} x1="50" y1="20" x2="150" y2="160" gradientUnits="userSpaceOnUse"><stop stopColor="#FDE047" /><stop offset="1" stopColor="#EAB308" /></linearGradient>
                            <linearGradient id={`bellBtmGrad-${ann.id}`} x1="40" y1="140" x2="160" y2="140" gradientUnits="userSpaceOnUse"><stop stopColor="#FACC15" /><stop offset="1" stopColor="#CA8A04" /></linearGradient>
                            <linearGradient id={`clapperGrad-${ann.id}`} x1="85" y1="150" x2="115" y2="180" gradientUnits="userSpaceOnUse"><stop stopColor="#F59E0B" /><stop offset="1" stopColor="#B45309" /></linearGradient>
                            <filter id={`dropShadow-${ann.id}`} x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="12" stdDeviation="15" floodOpacity="0.15" floodColor="#4338CA" /></filter>
                          </defs>
                          <g filter={`url(#dropShadow-${ann.id})`}>
                            <path d="M100 25 C85 25 85 45 100 45 C115 45 115 25 100 25 Z" fill="#CA8A04" />
                            <path d="M100 29 C92 29 92 41 100 41 C108 41 108 29 100 29 Z" fill="#FEF08A" />
                            <path d="M100 40 C60 40 55 90 50 120 C45 145 35 150 35 150 L165 150 C165 150 155 145 150 120 C145 90 140 40 100 40 Z" fill={`url(#bellGrad-${ann.id})`} />
                            <path d="M95 43 C65 45 60 90 56 120 C54 135 48 145 42 148 C55 130 65 100 70 60 C72 48 85 43 95 43 Z" fill="#FEF08A" opacity="0.6" />
                            <path d="M30 145 L170 145 C175 145 175 155 170 155 L30 155 C25 155 25 145 30 145 Z" fill={`url(#bellBtmGrad-${ann.id})`} />
                            <path d="M32 147 L168 147" stroke="#FEF08A" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
                            <circle cx="100" cy="165" r="15" fill={`url(#clapperGrad-${ann.id})`} />
                            <circle cx="95" cy="160" r="4" fill="#FEF08A" opacity="0.8" />
                          </g>
                        </svg>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

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
                    <div key={item.id} onClick={() => track('item_view', { itemId: item.id, itemName: item.title })} className="bg-white rounded-2xl shadow-xs border border-orange-100 flex flex-col relative group cursor-pointer hover:shadow-md transition-all duration-200 overflow-hidden">
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
                        <p className="text-[10px] text-gray-400 font-medium line-clamp-1 mb-2.5">{item.description || 'Delicious & fresh'}</p>
                        <span className="text-[13px] font-black text-gray-900 tracking-tight mt-auto">{item.price || '₹199'}</span>
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
                  <div key={item.id} onClick={() => track('item_view', { itemId: item.id, itemName: item.title })} className="bg-white rounded-2xl shadow-xs border border-gray-100 flex flex-col relative group cursor-pointer hover:shadow-md transition-all duration-200 overflow-hidden">
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
                      <p className="text-[10px] text-gray-400 font-medium line-clamp-1 mb-2.5">{item.description || 'Delicious & fresh'}</p>
                      <span className="text-[13px] font-black text-gray-900 tracking-tight mt-auto">{item.price || '₹199'}</span>
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

          <div className="px-6 pt-5 pb-4 border-b border-gray-100">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-1">{vendorName}</h1>
            <p className="text-xs text-gray-500 font-medium mb-4">{vendorAddress}</p>

            {/* Action buttons */}
            <div className="flex flex-col gap-2">
              {mapUrl && (
                <a href={mapUrl} target="_blank" rel="noopener noreferrer" onClick={handleDirections} className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-[#f77512] transition-colors">
                  <MapPin size={16} className="text-[#f77512]" /><span>Get Directions</span>
                </a>
              )}
              {phone && (
                <a href={`tel:${phone}`} className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-[#f77512] transition-colors">
                  <Phone size={16} className="text-gray-500" /><span>{phone}</span>
                </a>
              )}
              {whatsapp && (
                <a href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" onClick={handleWhatsApp} className="flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-600 transition-colors">
                  <MessageCircle size={16} className="text-emerald-500" /><span>WhatsApp</span>
                </a>
              )}
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

          {/* Share button */}
          <div className="px-5 py-4 border-t border-gray-100">
            <button type="button" onClick={handleShare} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
              <Share2 size={15} className="text-gray-500" /> Share Menu
            </button>
          </div>
        </aside>

        {/* Main content area */}
        <main className="flex-1 min-w-0 px-8 xl:px-12 py-8 overflow-y-auto bg-[#FDF6F0]">

          {/* Announcements row */}
          {announcements && announcements.length > 0 && isAllCategory && !searchQuery && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-8">
              {announcements.map((ann) => {
                const isOffer = ann.type === 'offer';
                if (isOffer) {
                  return (
                    <div key={ann.id} className="relative w-full rounded-2xl bg-[#FFEDD5] border-2 border-orange-300/80 shadow-xs flex flex-row items-center justify-between p-5 pt-8 hover:shadow-md mt-3">
                      <div className="absolute -top-3.5 left-5 bg-gradient-to-r from-[#C2410C] to-[#EA580C] text-white text-[11px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full shadow-md z-30 flex items-center gap-1.5 border-2 border-white">
                        <Flame size={12} className="fill-white text-white" /><span>SPECIAL OFFER</span>
                      </div>
                      <div className="flex flex-col z-10 flex-1">
                        <h3 className="text-[#6C1D07] text-3xl font-black leading-tight mb-2 capitalize">{ann.title}</h3>
                        {ann.description && <p className="text-[#7C2D12] text-sm font-bold mb-3 line-clamp-2">{ann.description}</p>}
                        {ann.endDate && (
                          <span className="text-xs font-bold text-[#9A3412] bg-white/90 px-3 py-1 rounded-lg inline-block border border-orange-200/60 w-fit">
                            Valid Until <strong className="text-[#C2410C] font-black">{new Date(ann.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</strong>
                          </span>
                        )}
                      </div>
                      <div className="w-28 h-28 shrink-0 flex items-center justify-center">
                        <div className="text-6xl">🏷️</div>
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={ann.id} className="relative w-full bg-gradient-to-br from-[#EBF4FF] to-[#E0E7FF] rounded-2xl p-5 pt-8 border-2 border-indigo-100 flex flex-row items-center justify-between gap-4 hover:shadow-md mt-3">
                    <div className="absolute -top-3.5 left-5 bg-gradient-to-r from-[#1E1B4B] to-[#312E81] text-white text-[11px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full shadow-md z-30 flex items-center gap-1.5 border-2 border-white">
                      <Megaphone size={12} className="text-white" /><span>ANNOUNCEMENT</span>
                    </div>
                    <div className="flex flex-col z-10 flex-1">
                      <h3 className="text-[#1E1B4B] text-2xl font-black leading-snug tracking-tight mb-1.5">&ldquo;{ann.title}&rdquo;</h3>
                      {ann.description && <p className="text-slate-600 text-sm font-semibold leading-relaxed line-clamp-2">{ann.description}</p>}
                    </div>
                    <div className="w-24 h-24 shrink-0 flex items-center justify-center text-5xl">🔔</div>
                  </div>
                );
              })}
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
                    <div key={item.id} onClick={() => track('item_view', { itemId: item.id, itemName: item.title })} className="bg-white rounded-2xl shadow-xs border border-orange-100 flex flex-col cursor-pointer hover:shadow-md transition-all duration-200 overflow-hidden group">
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
                        <p className="text-[11px] text-gray-400 font-medium line-clamp-1 mb-2">{item.description || 'Delicious & fresh'}</p>
                        <span className="text-sm font-black text-gray-900 tracking-tight mt-auto">{item.price || '₹199'}</span>
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
                  <div key={item.id} onClick={() => track('item_view', { itemId: item.id, itemName: item.title })} className="bg-white rounded-2xl shadow-xs border border-gray-100 flex flex-col cursor-pointer hover:shadow-md transition-all duration-200 overflow-hidden group">
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
                      <p className="text-[11px] text-gray-400 font-medium line-clamp-1 mb-2">{item.description || 'Delicious & fresh'}</p>
                      <span className="text-sm font-black text-gray-900 tracking-tight mt-auto">{item.price || '₹199'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
