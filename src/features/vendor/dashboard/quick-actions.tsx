'use client';

import React from 'react';

export const QuickActionsRow: React.FC = () => {
  const actions = [
    {
      name: "Add Menu Item",
      bg: "#A5D6A7", // Vibrant Pastel Green
      text: "#143314", // Deep Green
      shadow: "rgba(165, 214, 167, 0.7)",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      )
    },
    {
      name: "Download QR",
      bg: "#FFCC80", // Vibrant Pastel Orange
      text: "#592700", // Deep Orange/Brown
      shadow: "rgba(255, 204, 128, 0.7)",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
          <line x1="12" y1="18" x2="12.01" y2="18"></line>
        </svg>
      )
    },
    {
      name: "Preview Menu",
      bg: "#FFE082", // Vibrant Pastel Yellow
      text: "#5C4000", // Deep Gold
      shadow: "rgba(255, 224, 130, 0.7)",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      )
    },
    {
      name: "Share Menu",
      bg: "#F48FB1", // Vibrant Pastel Pink
      text: "#4A001F", // Deep Pink/Burgundy
      shadow: "rgba(244, 143, 177, 0.7)",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
          <polyline points="16 6 12 2 8 6"></polyline>
          <line x1="12" y1="2" x2="12" y2="15"></line>
        </svg>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1200px] mt-24 sm:mt-32">
      <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight px-1">
        Quick Actions
      </h2>
      
      {/* Horizontal Scrollable Row for responsiveness, defaults to a single line */}
      <div className="flex flex-row overflow-x-auto pb-4 gap-4 items-center no-scrollbar">
        {actions.map((action, index) => (
          <div key={index} className="relative group cursor-pointer transition-all duration-300 flex-1 min-w-[210px]">
            {/* Card Container with custom pastel colors */}
            <div 
              className="px-6 py-4.5 sm:py-5 rounded-2xl flex flex-row items-center justify-center gap-3.5 border border-white/60 shadow-sm hover:shadow-md transition-all duration-300"
              style={{
                backgroundColor: action.bg,
                color: action.text,
              }}
            >
              <div 
                className="opacity-90 group-hover:scale-110 group-hover:opacity-100 transition-all duration-300"
              >
                {action.icon}
              </div>
              <span className="text-base sm:text-lg font-bold tracking-wide whitespace-nowrap">
                {action.name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickActionsRow;
