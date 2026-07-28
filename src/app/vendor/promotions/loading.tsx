import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function PromotionsLoading() {
  return (
    <div className="w-full max-w-[1200px] mt-4 flex flex-col gap-6 animate-in fade-in duration-200">
      
      {/* Top Banner Skeleton */}
      <div className="w-full h-36 sm:h-40 rounded-[2.5rem] bg-gradient-to-r from-orange-200/60 to-pink-200/60 p-6 sm:p-8 flex items-center justify-between shadow-sm">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Skeleton className="w-28 h-5 rounded-full bg-orange-300/60" />
            <Skeleton className="w-20 h-5 rounded-full bg-orange-300/60" />
          </div>
          <Skeleton className="w-64 sm:w-80 h-8 rounded-2xl bg-orange-300/70" />
          <Skeleton className="w-72 sm:w-96 h-4 rounded-xl bg-orange-300/40" />
        </div>
        <Skeleton className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/80 shrink-0" />
      </div>

      {/* Title & Action Row Skeleton */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-2xl bg-gray-200" />
          <div className="flex flex-col gap-2">
            <Skeleton className="w-48 h-7 rounded-xl bg-gray-200" />
            <Skeleton className="w-64 h-4 rounded-lg bg-gray-100" />
          </div>
        </div>
        <Skeleton className="w-32 h-10 rounded-full bg-gray-200" />
      </div>

      {/* Grid Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-full h-[320px] rounded-[30px] bg-white border border-gray-200/80 p-5 flex flex-col justify-between shadow-sm"
          >
            <div className="flex justify-between items-center">
              <Skeleton className="w-20 h-6 rounded-full bg-gray-200" />
              <Skeleton className="w-16 h-6 rounded-full bg-gray-200" />
            </div>

            <Skeleton className="w-full h-36 rounded-2xl bg-gray-100 my-3" />

            <div className="flex flex-col gap-2 mt-auto">
              <Skeleton className="w-3/4 h-5 rounded-xl bg-gray-200" />
              <Skeleton className="w-full h-4 rounded-lg bg-gray-100" />
              <div className="flex items-center justify-between pt-2">
                <Skeleton className="w-16 h-5 rounded-md bg-gray-200" />
                <Skeleton className="w-8 h-8 rounded-full bg-gray-200" />
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
