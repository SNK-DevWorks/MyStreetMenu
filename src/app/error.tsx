'use client';

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen w-full bg-[#FFF0E5] flex items-center justify-center p-6 text-center">
      <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-xl border border-rose-100 max-w-md w-full flex flex-col items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
          <AlertCircle size={32} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Something Went Wrong</h1>
          <p className="text-sm font-medium text-slate-500 mt-2">
            {error?.message || 'An unexpected error occurred. Please try again.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => reset()}
          className="w-full bg-[#FF5A00] hover:bg-[#e04f00] text-white font-bold py-3 px-6 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
        >
          <RefreshCw size={16} /> Try Again
        </button>
      </div>
    </div>
  );
}
