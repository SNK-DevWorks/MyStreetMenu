'use client';

import React, { useState, useMemo } from 'react';
import { Eye, MonitorSmartphone, Smartphone, Monitor, Search, X, Star, Flame, Clock } from 'lucide-react';
import { FoodCard, type FoodCardItem, type TimeframeType } from '@/components/shared/item';
// Menu preview will load from DB in a future phase
const items: FoodCardItem[] = [];

const CATEGORIES = ['All'];

type ViewMode = 'desktop' | 'mobile';

export default function MenuPreview() {
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTimeframe, setActiveTimeframe] = useState<TimeframeType>('today');

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch && item.isAvailable !== false;
    });
  }, [searchQuery, selectedCategory]);

  const tabs = [
    { id: 'today' as TimeframeType, label: "Today's", icon: Clock },
    { id: 'thisWeek' as TimeframeType, label: 'This Week', icon: Star },
    { id: 'thisMonth' as TimeframeType, label: 'This Month', icon: Flame },
  ];

  return (
    <div className="w-full flex flex-col gap-6">

      {/* Preview Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl border border-gray-200/80 shadow-sm p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#f77512]/10 flex items-center justify-center shrink-0">
            <Eye size={20} className="text-[#f77512]" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight">Public Menu Preview</h2>
            <p className="text-xs text-slate-500 font-medium">This is exactly how customers see your menu</p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('desktop')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              viewMode === 'desktop'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Monitor size={15} />
            Desktop
          </button>
          <button
            type="button"
            onClick={() => setViewMode('mobile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              viewMode === 'mobile'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Smartphone size={15} />
            Mobile
          </button>
        </div>
      </div>

      {/* Preview Frame */}
      <div className={`mx-auto transition-all duration-300 ease-in-out ${
        viewMode === 'mobile' ? 'w-full max-w-[390px]' : 'w-full'
      }`}>
        {/* Simulated Device Frame */}
        <div className={`bg-[#fdf8f3] rounded-[2rem] border border-gray-300 shadow-2xl overflow-hidden ${
          viewMode === 'mobile' ? 'border-[6px] border-slate-800' : 'border border-gray-200'
        }`}>
          {/* Mobile notch bar */}
          {viewMode === 'mobile' && (
            <div className="bg-slate-800 h-7 flex items-center justify-center gap-2">
              <div className="w-16 h-3 bg-slate-900 rounded-full" />
            </div>
          )}

          {/* Simulated public page header */}
          <div className="bg-white border-b border-gray-200 px-5 py-3 flex items-center">
            <span className="text-[#f77512] text-xl font-extrabold tracking-tighter">MyStreetMenu</span>
          </div>

          {/* Public Menu Content */}
          <div className="p-4 sm:p-6 overflow-y-auto max-h-[75vh]">

            {/* Vendor Banner */}
            <div className="bg-gradient-to-r from-[#f77512] to-[#ff9436] rounded-[1.5rem] p-5 text-white mb-5 relative overflow-hidden">
              <h1 className={`font-black tracking-tight leading-tight mb-1 ${viewMode === 'mobile' ? 'text-xl' : 'text-2xl sm:text-3xl'}`}>
                Street Food Corner
              </h1>
              <p className="text-orange-100 text-xs font-medium">123 Market Street · Open Now · ⭐ 4.8</p>
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            </div>

            {/* Search + Category Filter */}
            <div className="flex flex-col gap-3 mb-5">
              {/* Search */}
              <div className="relative flex items-center h-11 rounded-2xl bg-gray-100/80 px-3.5 border border-gray-200 focus-within:border-[#f77512] focus-within:bg-white transition-all">
                <Search size={16} className="text-gray-400 shrink-0 mr-2" />
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent outline-none text-sm font-medium text-slate-800 placeholder-gray-400"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Category pills */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                      selectedCategory === cat
                        ? 'bg-[#f77512] text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200/80'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Timeframe Tabs */}
              <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-full border border-slate-200/80 shadow-inner self-start max-w-full overflow-x-auto no-scrollbar">
                {tabs.map(tab => {
                  const isActive = activeTimeframe === tab.id;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTimeframe(tab.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                        isActive ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                    >
                      <Icon size={12} className={`shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Menu Grid — same FoodCard in customer variant */}
            {filteredItems.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Search size={36} className="mx-auto mb-3 opacity-40" />
                <p className="font-bold text-sm">No items found</p>
              </div>
            ) : (
              <div className={`grid gap-4 ${
                viewMode === 'mobile'
                  ? 'grid-cols-1'
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              }`}>
                {filteredItems.map(item => (
                  <FoodCard
                    key={item.id}
                    {...item}
                    variant="customer"
                    activeTimeframe={activeTimeframe}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom note */}
      <p className="text-center text-xs text-slate-400 font-medium pb-4">
        <MonitorSmartphone size={13} className="inline-block mr-1 mb-0.5" />
        This preview reflects only available items as seen by your customers.
      </p>
    </div>
  );
}
