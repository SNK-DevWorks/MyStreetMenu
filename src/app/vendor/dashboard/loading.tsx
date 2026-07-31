import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="max-w-[1536px] mx-auto px-4 md:px-8 pt-4 pb-12 flex flex-col items-center gap-8 w-full animate-in fade-in duration-200">
      
      {/* 3 Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-[1200px]">
        <Skeleton className="h-56 rounded-[2rem] bg-gray-200/70" />
        <Skeleton className="h-56 rounded-[2rem] bg-gray-200/70" />
        <Skeleton className="h-56 rounded-[2rem] bg-gray-200/70" />
      </div>

      {/* Quick Actions Row Skeleton */}
      <Skeleton className="w-full max-w-[1200px] h-24 rounded-3xl bg-gray-200/60 mt-12 sm:mt-24" />

      {/* Popular Items Skeleton */}
      <div className="w-full max-w-[1200px] flex flex-col gap-5 mt-12 sm:mt-24">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-2">
            <Skeleton className="w-48 h-7 rounded-xl bg-gray-200" />
            <Skeleton className="w-64 h-4 rounded-lg bg-gray-100" />
          </div>
          <Skeleton className="w-64 h-10 rounded-full bg-gray-200" />
        </div>

        {/* 4 Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-full aspect-[3/4] max-h-[380px] rounded-[30px] bg-gray-200/80 p-5 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <Skeleton className="w-20 h-6 rounded-full bg-gray-300/60" />
                <Skeleton className="w-16 h-6 rounded-full bg-gray-300/60" />
              </div>
              <div className="flex flex-col gap-2 mt-auto">
                <Skeleton className="w-3/4 h-6 rounded-xl bg-gray-300/80" />
                <Skeleton className="w-full h-4 rounded-lg bg-gray-300/50" />
                <Skeleton className="w-full h-10 rounded-full bg-white/80 mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
