'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Search, X, Check, Utensils, Plus, Flame } from 'lucide-react';
import { FoodCard, type FoodCardItem } from '@/components/shared/item';
import initialItemsData from '@/data/vendor/items.json';

export const TodaysSpecialsSection: React.FC = () => {
  const [items] = useState<FoodCardItem[]>(initialItemsData as FoodCardItem[]);

  // Track IDs of items selected as Today's Specials
  const [specialItemIds, setSpecialItemIds] = useState<number[]>(() => {
    return (initialItemsData as FoodCardItem[])
      .filter(item => item.isTodaysSpecial)
      .map(item => item.id);
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempSelectedIds, setTempSelectedIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showToast, setShowToast] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  // Open modal and sync temporary selection
  const handleOpenModal = () => {
    setTempSelectedIds([...specialItemIds]);
    setSearchQuery('');
    setSelectedCategory('All');
    setIsModalOpen(true);
  };

  // Toggle selection inside modal
  const handleToggleItem = (id: number) => {
    setTempSelectedIds(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  // Save selection
  const handleSaveSpecials = () => {
    setSpecialItemIds(tempSelectedIds);
    setIsModalOpen(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Derived list of current special items
  const currentSpecials = items.filter(item => specialItemIds.includes(item.id));

  // Available categories for modal filter
  const categories = ['All', ...Array.from(new Set(items.map(i => i.category).filter(Boolean))) as string[]];

  // Filtered list for modal selection
  const filteredModalItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full max-w-[1200px] mt-8 flex flex-col gap-6">

      {/* ─── Update Today's Special Banner Card ─── */}
      <div
        onClick={handleOpenModal}
        className="w-full group cursor-pointer hover:-translate-y-1 transition-all duration-300 select-none"
      >
        <div
          className="w-full min-h-[140px] sm:h-[150px] rounded-[2.5rem] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-8 shadow-[0_20px_45px_rgba(236,72,153,0.25)] hover:shadow-[0_25px_50px_rgba(236,72,153,0.35)] border border-white/30 transition-all duration-300 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #EC4899 0%, #F97316 100%)'
          }}
        >
          {/* Left Text Content */}
          <div className="flex flex-col gap-1 text-center sm:text-left z-10">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span className="bg-white/20 backdrop-blur-md text-white text-[11px] font-black px-3 py-0.5 rounded-full border border-white/30 uppercase tracking-wider">
                Daily Specials
              </span>
              <span className="bg-slate-950/30 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                {specialItemIds.length} Selected
              </span>
            </div>
            <h2 className="text-white text-xl sm:text-2xl md:text-3xl font-black tracking-wide drop-shadow-sm mt-1">
              Update Today's Special
            </h2>
            <p className="text-white/90 text-xs sm:text-sm md:text-base font-medium">
              Click to select multiple items from your menu to feature today
            </p>
          </div>

          {/* Right Plus Button */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white flex items-center justify-center shrink-0 shadow-[0_10px_20px_rgba(0,0,0,0.15)] group-hover:scale-110 group-hover:shadow-[0_14px_28px_rgba(0,0,0,0.22)] transition-all duration-300 z-10">
            <Plus className="w-8 h-8 text-[#EC4899] stroke-[3]" />
          </div>

          {/* Decorative blur */}
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/15 rounded-full blur-2xl pointer-events-none" />
        </div>
      </div>

      {/* ─── Today's Specials Grid Section ─── */}
      <div className="flex flex-col gap-4 mt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600">
              <Flame size={20} className="fill-orange-500 text-orange-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Today's Specials
                <span className="bg-orange-100 text-[#f77512] text-xs font-black px-2.5 py-0.5 rounded-full border border-orange-200">
                  {currentSpecials.length} Active
                </span>
              </h2>
              <p className="text-slate-500 font-semibold text-xs sm:text-sm">
                Featured daily items currently shown to your customers
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenModal}
            className="hidden sm:flex items-center gap-1.5 text-xs font-extrabold text-[#f77512] hover:text-[#e05a00] bg-orange-50 hover:bg-orange-100/80 px-4 py-2 rounded-full border border-orange-200/80 transition-all cursor-pointer"
          >
            <Plus size={14} />
            Edit Specials
          </button>
        </div>

        {currentSpecials.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-gray-200/80 flex flex-col items-center justify-center min-h-[200px]">
            <Utensils size={40} className="text-gray-300 mb-2" />
            <h3 className="text-base font-bold text-slate-800 mb-1">No Specials Selected</h3>
            <p className="text-gray-500 text-xs max-w-sm mb-4">
              You haven't selected any items for Today's Specials yet. Click below to add menu items!
            </p>
            <button
              type="button"
              onClick={handleOpenModal}
              className="bg-[#f77512] hover:bg-[#e05a00] text-white font-bold px-5 py-2.5 rounded-2xl transition-all shadow-md flex items-center gap-2 text-xs cursor-pointer"
            >
              <Plus size={16} /> Select Specials
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {currentSpecials.map(food => (
              <FoodCard
                key={food.id}
                {...food}
                isTodaysSpecial={true}
                variant="customer"
                activeTimeframe="today"
              />
            ))}
          </div>
        )}
      </div>

      {/* ─── Selection Modal ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-gray-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">

            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-6 flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-orange-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Menu Selection
                  </span>
                  <span className="text-orange-400 font-extrabold text-xs">
                    {tempSelectedIds.length} Items Selected
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
                  🔥 Select Today's Specials
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="bg-white/10 hover:bg-white/20 p-2.5 rounded-full text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Filters & Controls */}
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col gap-3 shrink-0">
              {/* Search Bar */}
              <div className="relative flex items-center h-10 rounded-xl bg-white px-3 border border-gray-200 focus-within:border-[#f77512] transition-all shadow-sm">
                <Search size={16} className="text-gray-400 shrink-0 mr-2" />
                <input
                  type="text"
                  placeholder="Search available menu items..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent outline-none text-xs sm:text-sm font-medium text-slate-800 placeholder-gray-400"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {categories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${selectedCategory === cat
                        ? 'bg-[#f77512] text-white shadow-sm'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Items Selection List */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-2.5">
              {filteredModalItems.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-sm font-bold">No menu items match your search.</p>
                </div>
              ) : (
                filteredModalItems.map(item => {
                  const isSelected = tempSelectedIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleItem(item.id)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer select-none group ${isSelected
                          ? 'bg-orange-50/80 border-[#f77512] shadow-sm'
                          : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/60'
                        }`}
                    >
                      {/* Left: Thumbnail & Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-14 h-14 rounded-xl object-cover shrink-0 border border-gray-200"
                        />
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-slate-900 truncate">
                              {item.title}
                            </span>
                            {item.category && (
                              <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                                {item.category}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-500 text-xs line-clamp-1 font-medium mt-0.5">
                            {item.description}
                          </p>
                          <span className="text-xs font-black text-[#f77512] mt-0.5">
                            {item.price}
                          </span>
                        </div>
                      </div>

                      {/* Right: Custom Styled Checkbox */}
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-all ml-3 ${isSelected
                          ? 'bg-[#f77512] text-white shadow-md scale-105'
                          : 'bg-gray-100 border border-gray-300 text-transparent group-hover:border-gray-400'
                        }`}>
                        <Check size={16} className="stroke-[3]" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 sm:p-5 bg-white border-t border-gray-100 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setTempSelectedIds([])}
                className="text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
              >
                Clear All
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-gray-100 transition-colors text-xs sm:text-sm cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveSpecials}
                  className="bg-[#f77512] hover:bg-[#e05a00] text-white font-black px-6 py-2.5 rounded-xl shadow-md transition-all text-xs sm:text-sm cursor-pointer flex items-center gap-2 active:scale-95"
                >
                  <Check size={16} /> Save Today's Specials ({tempSelectedIds.length})
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default TodaysSpecialsSection;
