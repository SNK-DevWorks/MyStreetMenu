'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, Star, Flame, Clock, Utensils } from 'lucide-react';
import { FoodCard, type FoodCardItem, type TimeframeType } from '@/components/shared/item';
import { useAnalytics } from '@/providers/analytics-provider';

interface PublicMenuViewProps {
  vendorName?: string;
  vendorAddress?: string;
  phone?: string | null;
  whatsapp?: string | null;
  mapUrl?: string | null;
  items?: FoodCardItem[];
  categories?: string[];
}

export default function PublicMenuView({
  vendorName = 'Street Food Corner',
  vendorAddress = '123 Market Street · Open Now · ⭐ 4.8',
  phone = null,
  whatsapp = null,
  mapUrl = null,
  items = [],
  categories = ['All'],
}: PublicMenuViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTimeframe, setActiveTimeframe] = useState<TimeframeType>('today');
  const { track } = useAnalytics();

  // Fire menu_view once on mount; also detect QR scan from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qrId   = params.get('qr');

    if (qrId) {
      // QR-originated visit — fire qr_scan with structured metadata
      track('qr_scan', {
        qrId,
        source:   params.get('src')      ?? 'direct',
        tableNo:  params.get('table')    ?? null,
        campaign: params.get('campaign') ?? null,
      });
    }

    // Always fire menu_view (subject to client-side dedup)
    track('menu_view');
  }, [track]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch && item.isAvailable !== false;
    });
  }, [items, searchQuery, selectedCategory]);

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
    if (navigator.share) {
      navigator.share({ title: vendorName, url: window.location.href }).catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-[#fdf8f3] text-slate-800 pb-16 select-none">
      {/* Public Header Navbar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/text-logo.png" alt="MyStreetMenu" className="h-8 object-contain" />
        </div>
        <div className="flex items-center gap-2">
          {/* Share button */}
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition-all cursor-pointer"
          >
            Share
          </button>
          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-600 bg-orange-50 px-3.5 py-1.5 rounded-full border border-orange-200/80">
            <Utensils size={14} className="text-[#f77512]" />
            <span>Digital Menu</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        {/* Vendor Banner */}
        <div className="bg-gradient-to-r from-[#f77512] to-[#ff9436] rounded-3xl p-6 sm:p-8 text-white mb-6 relative overflow-hidden shadow-lg">
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight mb-2">
            {vendorName}
          </h1>
          <p className="text-orange-100 text-xs sm:text-sm font-medium">{vendorAddress}</p>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleWhatsApp}
                className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-4 py-2 rounded-full transition-all border border-white/30"
              >
                WhatsApp
              </a>
            )}
            {mapUrl && (
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleDirections}
                className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-4 py-2 rounded-full transition-all border border-white/30"
              >
                Directions
              </a>
            )}
            {phone && (
              <a
                href={`tel:${phone}`}
                className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-4 py-2 rounded-full transition-all border border-white/30"
              >
                Call
              </a>
            )}
          </div>

          <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Search + Category Filter */}
        <div className="flex flex-col gap-4 mb-6">
          {/* Search Bar */}
          <div className="relative flex items-center h-12 rounded-2xl bg-white px-4 border border-gray-200 shadow-xs focus-within:border-[#f77512] focus-within:ring-2 focus-within:ring-[#f77512]/20 transition-all">
            <Search size={18} className="text-gray-400 shrink-0 mr-3" />
            <input
              type="text"
              placeholder="Search dishes, snacks, drinks..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-transparent outline-none text-sm font-medium text-slate-800 placeholder-gray-400"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={16} />
              </button>
            )}
          </div>

          {/* Category pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-[#f77512] text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Timeframe Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-200/70 p-1.5 rounded-full border border-slate-300/60 shadow-inner self-start max-w-full overflow-x-auto no-scrollbar">
            {tabs.map(tab => {
              const isActive = activeTimeframe === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTimeframe(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                    isActive ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/50'
                  }`}
                >
                  <Icon size={13} className={`shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Food Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-20 text-gray-400 bg-white rounded-3xl border border-gray-200">
            <Search size={40} className="mx-auto mb-3 opacity-40" />
            <p className="font-bold text-base text-slate-600">No menu items found</p>
            <p className="text-xs text-slate-400 mt-1">Try searching for something else or clearing filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredItems.map(item => (
              <div
                key={item.id}
                onClick={() => track('item_view', { itemId: item.id, itemName: item.title })}
              >
                <FoodCard
                  {...item}
                  variant="customer"
                  activeTimeframe={activeTimeframe}
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
