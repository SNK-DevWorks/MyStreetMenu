'use client';

import React from 'react';
import { Search, X, MapPin, Phone, Share2, ShoppingBag } from 'lucide-react';
import type { AnnouncementItem } from '../types';
import { WhatsAppIcon } from '../ui/whatsapp-icon';

interface DesktopSidebarProps {
  vendorName: string;
  vendorAddress: string;
  phone?: string | null;
  whatsapp?: string | null;
  searchQuery: string;
  onSearchChange: (v: string) => void;
  onClearSearch: () => void;
  onShare: () => void;
  onWhatsApp: () => void;
  categories: string[];
  selectedCategory: string;
  onCategorySelect: (cat: string) => void;
  announcements: AnnouncementItem[];
  onCartClick: () => void;
}

export function DesktopSidebar({
  vendorName,
  vendorAddress,
  phone,
  whatsapp,
  searchQuery,
  onSearchChange,
  onClearSearch,
  onShare,
  onWhatsApp,
  categories,
  selectedCategory,
  onCategorySelect,
  onCartClick,
}: DesktopSidebarProps) {
  return (
    <aside className="w-[320px] xl:w-[360px] shrink-0 bg-white border-r border-gray-200 flex flex-col sticky top-0 h-screen overflow-y-auto hide-scrollbar shadow-xs">
      {/* Vendor Info Header */}
      <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C33] p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-black tracking-tight">{vendorName}</h1>
          <div className="flex items-center gap-1.5">
            {phone && (
              <a
                href={`tel:${phone}`}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white"
                title="Call"
              >
                <Phone size={15} className="fill-white" />
              </a>
            )}
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onWhatsApp}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white p-1.5"
                title="WhatsApp"
              >
                <WhatsAppIcon className="w-4 h-4 fill-white" />
              </a>
            )}
            <button
              type="button"
              onClick={onShare}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white cursor-pointer"
              title="Share Menu"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>
        <p className="text-xs text-white/90 flex items-center gap-1">
          <MapPin size={14} /> {vendorAddress}
        </p>
      </div>

      {/* Search & Cart Row */}
      <div className="p-4 border-b border-gray-100 flex items-center gap-2">
        <div className="flex-1 flex items-center bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-200 focus-within:border-[#FF6B00] transition-all">
          <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search dishes..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-sm text-gray-800 font-medium placeholder-gray-400"
          />
          {searchQuery && (
            <button onClick={onClearSearch} className="text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onCartClick}
          className="w-10 h-10 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-[#FF6B00] rounded-xl flex items-center justify-center shrink-0 transition-all cursor-pointer active:scale-95"
          title="Shopping Cart"
          aria-label="Shopping Cart"
        >
          <ShoppingBag size={18} strokeWidth={2.5} />
        </button>
      </div>

      {/* Category List */}
      <div className="flex-1 overflow-y-auto hide-scrollbar p-4">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-2">
          Categories
        </p>
        {categories.map((cat, index) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={index}
              type="button"
              onClick={() => onCategorySelect(cat)}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl mb-1 text-left transition-all font-bold text-sm cursor-pointer ${
                isActive ? 'bg-[#FF6B00]/10 text-[#FF6B00]' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{cat}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
