import React from 'react';
import { Store } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-12 text-center shadow-xs flex flex-col items-center justify-center space-y-3">
      <div className="w-12 h-12 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
        <Store className="w-6 h-6" />
      </div>

      <h3 className="text-base font-bold text-[#1f114a]">No vendors found.</h3>

      <p className="text-xs text-gray-500 max-w-sm">
        Vendors will appear here once they register on MyStreetMenu.
      </p>
    </div>
  );
}

export default EmptyState;
