import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function MenuLoading() {
  return (
    <div className="w-full max-w-[1300px] mx-auto py-6 px-2 sm:px-4 flex flex-col gap-6 animate-in fade-in duration-200">
      
      {/* Top Banner Skeleton */}
      <div className="bg-gradient-to-r from-orange-100/60 to-amber-100/60 rounded-[2.5rem] p-6 sm:p-10 border border-orange-200/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-3 max-w-xl">
          <Skeleton className="w-28 h-6 rounded-full bg-orange-200/70" />
          <Skeleton className="w-64 sm:w-80 h-9 rounded-2xl bg-orange-200/80" />
          <Skeleton className="w-full h-4 rounded-xl bg-orange-200/50" />
          <Skeleton className="w-3/4 h-4 rounded-xl bg-orange-200/50" />
        </div>
        <Skeleton className="w-44 h-14 rounded-2xl bg-orange-300/60 shrink-0" />
      </div>

      {/* Controls Bar Skeleton (Search & Filters) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-gray-200/80 shadow-sm">
        <Skeleton className="w-full md:w-80 h-11 rounded-2xl bg-gray-100" />
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <Skeleton className="w-16 h-8 rounded-full bg-gray-200 shrink-0" />
          <Skeleton className="w-20 h-8 rounded-full bg-gray-200 shrink-0" />
          <Skeleton className="w-20 h-8 rounded-full bg-gray-200 shrink-0" />
          <Skeleton className="w-20 h-8 rounded-full bg-gray-200 shrink-0" />
          <Skeleton className="w-24 h-8 rounded-full bg-gray-200 shrink-0" />
        </div>
      </div>

      {/* 6 Menu Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div key={idx} className="bg-white rounded-[2rem] border border-gray-200/80 overflow-hidden p-0 flex flex-col justify-between shadow-sm">
            {/* Image Placeholder */}
            <div className="relative w-full h-48 bg-gray-100 animate-pulse">
              <Skeleton className="absolute top-3 left-3 w-20 h-6 rounded-full bg-gray-300/80" />
              <Skeleton className="absolute top-3 right-3 w-24 h-6 rounded-full bg-gray-300/80" />
              <Skeleton className="absolute bottom-3 left-4 w-20 h-8 rounded-full bg-gray-300/90" />
            </div>

            {/* Details Placeholder */}
            <div className="p-5 flex-1 flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-2">
                <Skeleton className="w-3/4 h-6 rounded-xl bg-gray-200" />
                <Skeleton className="w-full h-4 rounded-lg bg-gray-100" />
                <Skeleton className="w-5/6 h-4 rounded-lg bg-gray-100" />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <Skeleton className="w-20 h-6 rounded-full bg-gray-100" />
                <Skeleton className="w-8 h-8 rounded-full bg-gray-100" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
