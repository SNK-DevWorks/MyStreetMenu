import React from 'react';

export default function QrLoading() {
  return (
    <div className="w-full flex flex-col items-start md:ml-28 lg:ml-44 justify-start py-2 mt-1 min-h-[calc(100vh-200px)]">
      {/* Card skeleton */}
      <div className="w-full max-w-[380px] bg-white rounded-[28px] shadow-md border border-gray-200/80 overflow-hidden animate-pulse">
        {/* Orange header */}
        <div className="h-[88px] bg-orange-300/60 w-full" />
        {/* Card body */}
        <div className="flex flex-col items-center px-6 pt-5 pb-7 gap-5">
          {/* Burger image placeholder */}
          <div className="w-[335px] h-[230px] rounded-[24px] bg-gray-200" />
          {/* QR code placeholder */}
          <div className="w-[160px] h-[160px] rounded-xl bg-gray-200" />
          {/* Vendor name */}
          <div className="flex flex-col items-center gap-2 w-full">
            <div className="h-7 w-44 rounded-xl bg-gray-200" />
            <div className="h-4 w-32 rounded-lg bg-gray-100" />
          </div>
        </div>
      </div>
      {/* Action buttons skeleton */}
      <div className="flex gap-4 w-full max-w-[380px] mt-6">
        <div className="flex-1 h-[52px] rounded-2xl bg-gray-200 animate-pulse" />
        <div className="flex-1 h-[52px] rounded-2xl bg-orange-300/60 animate-pulse" />
      </div>
    </div>
  );
}
