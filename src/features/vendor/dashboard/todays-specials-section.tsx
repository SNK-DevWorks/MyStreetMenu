'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Search, X, Check, Utensils, Plus, Flame, Loader2 } from 'lucide-react';
import { FoodCard, type FoodCardItem } from '@/components/shared/item';
import { useVendor } from '@/context/vendor-context';
import { getMenuDataAction } from '@/actions/shop/get-menu-data';
import { updateTodaysSpecialsAction } from '@/actions/menu/update-todays-specials';
import { toFoodCardItem } from '@/lib/adapters/menu-adapter';

interface TodaysSpecialsSectionProps {
  className?: string;
}

export const TodaysSpecialsSection: React.FC<TodaysSpecialsSectionProps> = ({
  className = "mt-1 sm:mt-2"
}) => {
  const { shop, dbItems, offers, menuLoading: isLoading, refetchMenu } = useVendor();
  const [isSaving, setIsSaving] = useState(false);

  const items = React.useMemo(() => dbItems.map(item => toFoodCardItem(item, offers)), [dbItems, offers]);
  const specialItemIds = React.useMemo(
    () => items.filter(i => i.isTodaysSpecial).map(i => i.id),
    [items]
  );
  const shopId = shop?.id || null;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempSelectedIds, setTempSelectedIds] = useState<string[]>([]);
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
  const handleToggleItem = (id: string) => {
    setTempSelectedIds(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  // Save selection to DB
  const handleSaveSpecials = async () => {
    if (!shopId) return;
    setIsSaving(true);
    try {
      const res = await updateTodaysSpecialsAction(shopId, tempSelectedIds);
      if (res.success) {
        await refetchMenu();
        setIsModalOpen(false);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save today's specials:", err);
    } finally {
      setIsSaving(false);
    }
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
    <div className={`w-full max-w-[1200px] flex flex-col gap-6 ${className}`}>

      {showToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl border border-slate-700/80 flex items-center justify-center text-center animate-in fade-in slide-in-from-top-4 duration-200 text-xs sm:text-sm font-bold whitespace-nowrap max-w-[90vw]">
          <span className="text-xs sm:text-sm font-extrabold tracking-wide">Today's Specials updated successfully!</span>
        </div>
      )}

      <h2 className="text-[20px] sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight px-1">
        Daily Specials
      </h2>

      {/* ─── Update Today's Special Banner Card ─── */}
      <div
        onClick={handleOpenModal}
        className="w-full group cursor-pointer hover:-translate-y-0.5 transition-all duration-300 select-none"
      >
        <div
          className="w-full h-[95px] sm:h-[140px] md:h-[150px] rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] p-4 sm:p-6 md:p-8 flex flex-row items-center justify-between gap-3 sm:gap-8 shadow-[0_12px_30px_rgba(236,72,153,0.2)] hover:shadow-[0_20px_40px_rgba(236,72,153,0.3)] border border-white/30 transition-all duration-300 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #EC4899 0%, #F97316 100%)'
          }}
        >
          {/* Left Text Content */}
          <div className="flex flex-col gap-0.5 sm:gap-1 text-left z-10">
            <div className="flex items-center gap-2 justify-start">
              <span className="bg-slate-950/30 text-white text-[10px] sm:text-[11px] font-black px-2.5 py-0.5 rounded-full">
                {specialItemIds.length} Selected
              </span>
            </div>
            <p className="text-white text-[16px] sm:text-2xl md:text-3xl font-black tracking-wide drop-shadow-sm mt-0.5 sm:mt-1">
              Update Today's Special
            </p>
          </div>

          {/* Right Plus Button */}
          <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-white flex items-center justify-center shrink-0 shadow-[0_6px_14px_rgba(0,0,0,0.15)] group-hover:scale-110 group-hover:shadow-[0_10px_20px_rgba(0,0,0,0.22)] transition-all duration-300 z-10">
            <Plus className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[#EC4899] stroke-[3]" />
          </div>

          {/* Decorative blur */}
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/15 rounded-full blur-2xl pointer-events-none" />
        </div>
      </div>

      {/* ─── Today's Specials Grid Section ─── */}
      <div className="flex flex-col gap-4 mt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600 shrink-0">
              <Flame size={18} className="fill-orange-500 text-orange-500 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Today's Specials
                <span className="bg-orange-100 text-[#f77512] text-[11px] sm:text-xs font-black px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full border border-orange-200">
                  {currentSpecials.length} Active
                </span>
              </h2>
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

        {isLoading ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-gray-200/80 flex flex-col items-center justify-center min-h-[200px] gap-2">
            <Loader2 size={28} className="animate-spin text-[#f77512]" />
            <span className="text-xs font-bold text-slate-500">Loading specials...</span>
          </div>
        ) : currentSpecials.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-gray-200/80 flex flex-col items-center justify-center min-h-[200px]">
            <Utensils size={40} className="text-gray-300 mb-2" />
            <h3 className="text-base font-bold text-slate-800 mb-4">No Specials Selected</h3>
            <button
              type="button"
              onClick={handleOpenModal}
              className="bg-[#f77512] hover:bg-[#e05a00] text-white font-bold px-5 py-2.5 rounded-2xl transition-all shadow-md flex items-center gap-2 text-xs cursor-pointer"
            >
              <Plus size={16} /> Select Specials
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
                  <Loader2 size={24} className="animate-spin text-[#f77512]" />
                  <span className="text-xs font-bold">Loading available items...</span>
                </div>
              ) : filteredModalItems.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-sm font-bold">
                    {items.length === 0 ? 'No menu items available. Please add items in your menu first.' : 'No menu items match your search.'}
                  </p>
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
                        {/* eslint-disable-next-line @next/next/no-img-element */}
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
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-black text-[#f77512]">
                              {item.hasDiscount && item.priceFinal != null ? `₹${item.priceFinal}` : item.price}
                            </span>
                            {item.hasDiscount && item.priceOriginal != null && (
                              <span className="text-[11px] text-gray-400 line-through font-medium">
                                ₹{item.priceOriginal}
                              </span>
                            )}
                            {item.resolvedOffer?.badge && (
                              <span className="bg-[#f77512] text-white text-[9.5px] font-black px-1.5 py-0.5 rounded-md shadow-2xs uppercase">
                                {item.resolvedOffer.badge}
                              </span>
                            )}
                          </div>
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
            <div className="p-3 sm:p-5 bg-white border-t border-gray-100 flex items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setTempSelectedIds([])}
                className="text-[11.5px] sm:text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer whitespace-nowrap px-1 py-1.5"
              >
                Clear All
              </button>

              <div className="flex items-center gap-1.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-2.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-slate-600 font-bold hover:bg-gray-100 transition-colors text-xs sm:text-sm cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveSpecials}
                  disabled={isSaving}
                  className="bg-[#f77512] hover:bg-[#e05a00] text-white font-black px-3.5 py-2 sm:px-6 sm:py-2.5 rounded-xl shadow-md transition-all text-xs sm:text-sm cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-50 whitespace-nowrap"
                >
                  {isSaving ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Check size={15} className="stroke-[3]" />
                  )}
                  <span className="sm:hidden">Save ({tempSelectedIds.length})</span>
                  <span className="hidden sm:inline">Save Today's Specials ({tempSelectedIds.length})</span>
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
