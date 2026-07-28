'use client';

import React, { useState } from 'react';

export const MenuItemsCard: React.FC = () => {
  // SVG Donut Chart Math
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const progress = 85; 
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="bg-[#FAE5FD] rounded-[2rem] p-6 sm:p-7 flex flex-col items-center justify-between shadow-sm hover:shadow-md w-full h-[250px] transition-all">
      <h3 className="text-[#C500D4] font-black text-lg sm:text-xl tracking-wide">Menu Items</h3>
      
      <div className="relative flex items-center justify-center">
        <svg className="w-32 h-32 transform -rotate-90">
          {/* Background Track */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="#E812F7"
            strokeOpacity="0.2"
            strokeWidth="9"
            fill="transparent"
          />
          {/* Progress Ring */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="#E812F7"
            strokeWidth="9"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Center Number */}
        <span className="absolute text-[34px] sm:text-[38px] font-black text-[#B000BE]">120</span>
      </div>

      {/* Legend */}
      <div className="flex text-xs sm:text-sm font-extrabold tracking-wide">
        <div className="flex items-center gap-2 text-[#C500D4]">
          <span className="w-3 h-3 rounded-full bg-[#E812F7]"></span>
          Available
        </div>
      </div>
    </div>
  );
};

export const MenuViewsCard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'Today' | 'Yesterday' | 'Last Week'>('Today');

  const viewsData: Record<'Today' | 'Yesterday' | 'Last Week', string> = {
    'Today': '12.4K',
    'Yesterday': '8.9K',
    'Last Week': '45.2K',
  };

  return (
    <div className="bg-[#FFEAD8] rounded-[2.5rem] relative overflow-hidden shadow-sm hover:shadow-md w-full h-[250px] flex transition-all">
      {/* Left Content */}
      <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center z-10">
        <div>
          <h3 className="text-[#E05A00] font-black text-xl sm:text-2xl tracking-tight mb-3">Menu Views</h3>
          <p className="text-slate-500 text-xs font-bold tracking-wider uppercase mb-3">Time Period</p>
          <ul className="space-y-2.5 text-slate-800 text-sm sm:text-base font-extrabold">
            {(['Today', 'Yesterday', 'Last Week'] as const).map((date) => (
              <li
                key={date}
                onClick={() => setSelectedPeriod(date)}
                className={`flex items-center gap-2.5 cursor-pointer transition-colors ${
                  selectedPeriod === date ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    selectedPeriod === date
                      ? 'bg-[#F77512] shadow-[0_0_8px_#F77512] scale-110'
                      : 'bg-slate-400'
                  }`}
                ></span>
                {date}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right Orange Curved Section */}
      <div className="absolute right-0 top-0 bottom-0 w-[48%] sm:w-[52%] md:w-[55%] bg-[#F77512] rounded-l-[70px] sm:rounded-l-[80px] flex flex-col items-center justify-center">
        <div className="text-center mt-1">
          <span className="block text-white text-[36px] sm:text-[44px] font-black tracking-tight mb-0.5 transition-all">
            {viewsData[selectedPeriod]}
          </span>
          <span className="text-white/95 text-xs sm:text-sm font-extrabold tracking-wide">Total Views</span>
        </div>
      </div>
    </div>
  );
};

export const QRScansCard: React.FC = () => {
  return (
    <div className="bg-[#FFF460] rounded-[2rem] p-6 sm:p-8 shadow-sm hover:shadow-md w-full h-[250px] flex flex-col justify-between relative overflow-hidden transition-all">
      <div className="relative z-10">
        <h3 className="text-slate-900 font-black text-xl sm:text-2xl tracking-tight mb-1">QR Scans</h3>
        <p className="text-slate-800 text-xs sm:text-sm font-extrabold tracking-wide">Last 24 Hours</p>
      </div>
      
      <div className="mt-auto relative z-10">
        <span className="block text-slate-900 text-[52px] sm:text-[60px] font-black tracking-tight leading-none mb-3">342</span>
        <div className="bg-slate-900 text-[#FFF460] text-xs font-black px-4 py-2 rounded-full w-max shadow-sm">
          +50 New Scans
        </div>
      </div>
      
      {/* Decorative background accent */}
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/50 rounded-full blur-2xl z-0 pointer-events-none"></div>
    </div>
  );
};

export const MenuIllustration: React.FC = () => (
  <svg width="140" height="130" viewBox="0 0 140 130" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute right-0 bottom-3">
    {/* Back Document */}
    <rect x="25" y="20" width="60" height="80" rx="4" fill="#FAFAFA" stroke="#E2E8F0" strokeWidth="2"/>
    <rect x="35" y="35" width="40" height="4" rx="2" fill="#E2E8F0"/>
    <rect x="35" y="45" width="30" height="4" rx="2" fill="#E2E8F0"/>
    
    {/* Middle Document */}
    <rect x="40" y="35" width="60" height="80" rx="4" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2"/>
    <rect x="50" y="50" width="40" height="4" rx="2" fill="#CBD5E1"/>
    <rect x="50" y="60" width="35" height="4" rx="2" fill="#CBD5E1"/>
    <rect x="50" y="70" width="20" height="20" rx="2" fill="#F1F5F9"/>

    {/* Front Document Held by character */}
    <rect x="65" y="55" width="55" height="75" rx="4" fill="#FFFFFF" stroke="#12F7E8" strokeWidth="2" filter="drop-shadow(0 4px 6px rgba(18,247,232,0.15))"/>
    
    {/* Menu Header inside front doc */}
    <path d="M66 59 C66 57.3431 67.3431 56 69 56 H 117 C118.657 56 120 57.3431 120 59 V 70 H 66 V 59 Z" fill="#12F7E8" fillOpacity="0.15" />
    
    <rect x="75" y="78" width="35" height="4" rx="2" fill="#12F7E8" fillOpacity="0.4"/>
    <rect x="75" y="86" width="25" height="4" rx="2" fill="#12F7E8" fillOpacity="0.4"/>
    
    {/* Little button on front doc */}
    <rect x="75" y="100" width="35" height="16" rx="4" fill="#12F7E8"/>
    <rect x="85" y="106" width="15" height="4" rx="2" fill="#FFFFFF"/>

    {/* Character Illustration (Cyan Theme) */}
    {/* Hair Back */}
    <path d="M125 55 Q 140 50 135 75 Q 130 80 120 70" fill="#0F766E" />
    {/* Head */}
    <circle cx="118" cy="65" r="10" fill="#FFEDD5"/>
    {/* Hair front */}
    <path d="M108 65 Q 115 50 128 60 Q 120 50 110 55 Z" fill="#0F766E"/>
    {/* Body / Dress */}
    <path d="M110 75 Q 118 72 126 75 L 132 110 L 104 110 Z" fill="#12F7E8"/>
    {/* Legs */}
    <rect x="111" y="110" width="4" height="15" fill="#FFEDD5"/>
    <rect x="121" y="110" width="4" height="15" fill="#FFEDD5"/>
    {/* Arm holding doc */}
    <path d="M118 82 L 100 88" stroke="#FFEDD5" strokeWidth="4" strokeLinecap="round"/>
  </svg>
);

export const MostViewedCard: React.FC = () => {
  return (
    <div className="bg-[#D1FAF6] rounded-[2.5rem] relative overflow-hidden shadow-sm hover:shadow-md w-full h-[250px] flex transition-all">
      {/* Left Content */}
      <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between z-10">
        <div>
          <h3 className="text-[#087F75] font-black text-xl sm:text-2xl tracking-tight mb-3 sm:mb-4">Most Viewed Item</h3>
          <ul className="space-y-2.5 sm:space-y-3 text-slate-800 text-sm sm:text-base font-extrabold">
            {['Spicy Ramen', 'Double Burger', 'Mango Shake'].map((doc) => (
              <li key={doc} className="flex items-center gap-2.5">
                {/* Custom Triangle Play Icon in Cyan */}
                <svg width="10" height="12" viewBox="0 0 8 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 1.42857C0 0.536965 0.96349 -0.0177724 1.73205 0.430485L7.02738 3.51866C7.79594 3.96691 7.79594 5.0807 7.02738 5.52896L1.73205 8.61713C0.963491 9.06539 0 8.51065 0 7.61904V1.42857Z" fill="#087F75"/>
                </svg>
                {doc}
              </li>
            ))}
          </ul>
        </div>
        <button className="bg-[#12F7E8] hover:bg-[#0BC5B8] transition-colors text-slate-900 text-xs font-black tracking-wide px-5 py-2.5 rounded-full w-max mt-2 shadow-sm cursor-pointer">
          View Menu
        </button>
      </div>

      {/* Right Illustration Container */}
      <div className="w-[140px] sm:w-[160px] relative">
        <MenuIllustration />
      </div>
    </div>
  );
};

export const StatsCards: React.FC = () => {
  return (
    <div className="w-full max-w-[1200px] mt-8 grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* Menu Items Card */}
      <div className="md:col-span-6 lg:col-span-5">
        <MenuItemsCard />
      </div>

      {/* Menu Views Card */}
      <div className="md:col-span-6 lg:col-span-7">
        <MenuViewsCard />
      </div>

      {/* QR Scans Card */}
      <div className="md:col-span-6 lg:col-span-5">
        <QRScansCard />
      </div>

      {/* Most Viewed Card */}
      <div className="md:col-span-6 lg:col-span-7">
        <MostViewedCard />
      </div>
    </div>
  );
};

export default StatsCards;
