'use client';

import React from 'react';
import { Search, X, MapPin, Phone, ChevronRight, Share2, Megaphone, Mic } from 'lucide-react';
import type { AnnouncementItem } from '../types';
import { WhatsAppIcon } from '../ui/whatsapp-icon';

interface MobileHeaderProps {
  vendorName: string;
  vendorAddress: string;
  phone?: string | null;
  whatsapp?: string | null;
  mapUrl?: string | null;
  searchQuery: string;
  onSearchChange: (v: string) => void;
  onClearSearch: () => void;
  onVoiceSearch: () => void;
  isListening: boolean;
  announcements: AnnouncementItem[];
  onShare: () => void;
  onWhatsApp: () => void;
  onPhone: () => void;
}

export function MobileHeader({
  vendorName,
  vendorAddress,
  phone,
  whatsapp,
  mapUrl,
  searchQuery,
  onSearchChange,
  onClearSearch,
  onVoiceSearch,
  isListening,
  announcements,
  onShare,
  onWhatsApp,
  onPhone,
}: MobileHeaderProps) {
  return (
    <div className="bg-gradient-to-b from-[#FF6B00] via-[#FF7A1A] to-[#FF8C33] pt-10 sm:pt-12 px-4 sm:px-8 pb-12 sm:pb-14 rounded-b-[32px] sm:rounded-b-[44px] relative z-10 shadow-sm overflow-hidden">

      {/* Decorative Background Patterns */}
      <div className="absolute inset-0 pointer-events-none opacity-15 overflow-hidden">
        <svg className="absolute -top-12 -right-12 w-64 h-64 text-white" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="85" stroke="currentColor" strokeWidth="3" strokeDasharray="6 6" />
          <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="2" />
          <circle cx="100" cy="100" r="35" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
        </svg>
        <svg className="absolute -bottom-16 -left-16 w-56 h-56 text-white" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="75" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="100" cy="100" r="50" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
        </svg>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.45) 1.2px, transparent 1.2px)`,
            backgroundSize: '18px 18px',
          }}
        />
      </div>

      {/* Soft Top Ambient Light Glow */}
      <div className="absolute top-0 right-1/4 w-48 h-32 bg-white/20 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-3xl mx-auto w-full">
        {/* Header Top Row */}
        <div className="flex justify-between items-start mb-5">
          <div className="flex flex-col text-white w-[72%]">
            <div className="flex items-center gap-1.5 mb-1 cursor-pointer">
              <MapPin size={22} className="text-white fill-white/20 shrink-0" strokeWidth={2.5} />
              <h1 className="text-[20px] sm:text-[24px] font-black tracking-tight leading-none truncate">
                {vendorName}
              </h1>
              {mapUrl && (
                <a href={mapUrl} target="_blank" rel="noopener noreferrer">
                  <ChevronRight size={18} strokeWidth={3} className="text-white" />
                </a>
              )}
            </div>
            <p className="text-[12.5px] sm:text-[14px] text-white/90 truncate ml-7 font-medium">
              {vendorAddress}
            </p>
          </div>

          <div className="flex gap-2.5 shrink-0 items-center">
            {phone && (
              <a
                href={`tel:${phone}`}
                onClick={onPhone}
                className="w-11 h-11 sm:w-12 sm:h-12 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all active:scale-95 shadow-xs"
                title="Call"
              >
                <Phone size={20} className="fill-white" />
              </a>
            )}
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onWhatsApp}
                className="w-11 h-11 sm:w-12 sm:h-12 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all active:scale-95 p-2.5 shadow-xs"
                title="WhatsApp"
              >
                <WhatsAppIcon className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />
              </a>
            )}
            <button
              type="button"
              onClick={onShare}
              className="w-11 h-11 sm:w-12 sm:h-12 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all active:scale-95 cursor-pointer shadow-xs"
              title="Share Menu"
            >
              <Share2 size={21} />
            </button>
          </div>
        </div>

        {/* Search Bar & Mic Button Row */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FF6B00]">
              <Search size={20} strokeWidth={2.5} />
            </div>
            <input
              type="text"
              placeholder='Search "dishes, burgers, salad"'
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              className="w-full bg-white py-3.5 pl-11 pr-9 rounded-2xl text-[14.5px] sm:text-[15.5px] text-gray-800 placeholder-gray-400 focus:outline-none shadow-[0_8px_20px_rgba(255,107,0,0.2)] font-medium"
            />
            {searchQuery && (
              <button
                onClick={onClearSearch}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onVoiceSearch}
            className={`relative bg-white text-[#FF6B00] w-12 h-12 rounded-2xl shadow-[0_8px_20px_rgba(255,107,0,0.2)] flex items-center justify-center shrink-0 hover:bg-orange-50 active:scale-95 transition-all cursor-pointer border border-orange-100/80 ${isListening ? 'ring-2 ring-[#FF6B00] ring-offset-2' : ''}`}
            title="Voice Search"
            aria-label="Voice Search"
          >
            <Mic size={21} strokeWidth={2.5} className={isListening ? 'animate-pulse' : ''} />
          </button>
        </div>

        {/* Notice Banner */}
        {announcements && announcements.length > 0 && (
          <div className="bg-black/15 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0 shadow-xs">
              <Megaphone size={13} className="text-white" />
            </div>
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="bg-white text-[#FF6B00] text-[9.5px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                Notice
              </span>
              <span className="text-[13px] sm:text-[14px] font-bold text-white truncate">
                {announcements[0].title}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
