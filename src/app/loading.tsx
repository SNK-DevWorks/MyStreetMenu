import React from 'react';
import { PizzaLoader } from '@/components/shared/pizza-loader';

export default function Loading() {
  return (
    <div className="min-h-screen w-full bg-[#FFF0E5] flex items-center justify-center p-4">
      <div className="w-28 h-28 flex items-center justify-center relative">
        <PizzaLoader />
      </div>
    </div>
  );
}
