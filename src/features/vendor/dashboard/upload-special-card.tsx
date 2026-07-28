'use client';

import React from 'react';

export interface UploadSpecialCardProps {
  onUpdate?: () => void;
}

export const UploadSpecialCard: React.FC<UploadSpecialCardProps> = ({ onUpdate }) => {
  return (
    <div 
      onClick={onUpdate}
      className="w-full max-w-[1200px] mt-8 group cursor-pointer hover:-translate-y-1 transition-all duration-300 select-none"
    >
      {/* Card Container - Long & Slim with vibrant gradient */}
      <div 
        className="w-full min-h-[140px] sm:h-[150px] rounded-[2.5rem] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4 sm:gap-8 shadow-[0_20px_45px_rgba(236,72,153,0.25)] hover:shadow-[0_25px_50px_rgba(236,72,153,0.35)] border border-white/30 transition-all duration-300"
        style={{
          background: 'linear-gradient(135deg, #EC4899 0%, #F97316 100%)'
        }}
      >
        {/* Left Text Content */}
        <div className="flex flex-col gap-1 text-center sm:text-left">
          <h2 className="text-white text-xl sm:text-2xl md:text-3xl font-black tracking-wide drop-shadow-sm">
            Update Today's Special
          </h2>
          <p className="text-white/90 text-xs sm:text-sm md:text-base font-extrabold tracking-wide">
            Click to add new items to your daily special menu
          </p>
        </div>

        {/* Right Plus Button */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white flex items-center justify-center shrink-0 shadow-[0_10px_20px_rgba(0,0,0,0.15)] group-hover:scale-110 group-hover:shadow-[0_14px_28px_rgba(0,0,0,0.22)] transition-all duration-300">
          <svg 
            width="28" 
            height="28" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="#EC4899" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="sm:w-8 sm:h-8"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default UploadSpecialCard;
