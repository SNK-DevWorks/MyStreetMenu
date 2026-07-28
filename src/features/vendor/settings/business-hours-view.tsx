'use client';

import React, { useState } from 'react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

export const BusinessHoursView: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative bg-white">
      <div className="max-w-2xl mx-auto space-y-7">

        {/* Master Open/Closed Toggle */}
        <div className="flex items-center justify-between p-5 bg-[#fdf8f3] border border-gray-200 rounded-xl shadow-sm">
          <div>
            <h3 className="text-[16px] font-bold text-[#1a1a1a]">Shop Status</h3>
            <p className="text-[13px] text-gray-500 mt-0.5">
              {isOpen
                ? 'Your shop is currently open and accepting orders.'
                : 'Your shop is closed. Customers cannot place orders.'}
            </p>
          </div>
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            aria-pressed={isOpen}
            aria-label="Toggle shop open/closed"
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#f67412] focus:ring-offset-2 ${
              isOpen ? 'bg-[#16a34a]' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                isOpen ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <hr className="border-gray-100" />

        {/* Opening Hours Schedule */}
        <div className="space-y-4">
          <h3 className="text-[16px] font-bold text-[#1a1a1a]">Opening Hours</h3>
          <div className="space-y-3">
            {DAYS.map((day) => (
              <div
                key={day}
                className="flex items-center gap-4 p-3.5 border border-gray-200 bg-[#fdf8f3] rounded-xl hover:border-gray-300 transition-colors"
              >
                <div className="w-28 shrink-0">
                  <span className="text-[14px] font-semibold text-gray-700">{day}</span>
                </div>
                <div className="flex-1 flex items-center gap-3">
                  <input
                    type="time"
                    defaultValue="09:00"
                    aria-label={`${day} opening time`}
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-gray-800 text-[14px] font-medium focus:outline-none focus:border-[#f67412] focus:ring-2 focus:ring-[#f67412]/20 transition-all bg-white shadow-sm"
                  />
                  <span className="text-gray-400 font-medium text-[13px]">to</span>
                  <input
                    type="time"
                    defaultValue="22:00"
                    aria-label={`${day} closing time`}
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-gray-800 text-[14px] font-medium focus:outline-none focus:border-[#f67412] focus:ring-2 focus:ring-[#f67412]/20 transition-all bg-white shadow-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 pb-8">
          <button className="w-full bg-[#f67412] text-white font-bold py-3.5 rounded-xl hover:bg-[#d96610] active:scale-[0.99] transition-all shadow-md">
            Save Business Hours
          </button>
        </div>
      </div>
    </div>
  );
};
