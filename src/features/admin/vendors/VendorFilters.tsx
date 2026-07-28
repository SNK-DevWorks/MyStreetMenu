'use client';

import React from 'react';
import { Search } from 'lucide-react';

interface VendorFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
}

export function VendorFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
}: VendorFiltersProps) {
  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
      {/* Search Input */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search vendors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-600 focus:bg-white transition-colors"
        />
      </div>

      {/* Filter & Sort Controls */}
      <div className="flex flex-wrap items-center gap-4 text-xs">
        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-gray-500">Status:</span>
          <div className="inline-flex bg-gray-100 p-1 rounded-xl">
            {['All', 'Active', 'Inactive'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  statusFilter === status
                    ? 'bg-white text-purple-700 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Filter */}
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-gray-500">Sort:</span>
          <div className="inline-flex bg-gray-100 p-1 rounded-xl">
            {['Newest', 'Oldest', 'Name'].map((sort) => (
              <button
                key={sort}
                onClick={() => setSortBy(sort)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  sortBy === sort
                    ? 'bg-white text-purple-700 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {sort}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VendorFilters;
