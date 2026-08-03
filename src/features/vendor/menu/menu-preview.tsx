'use client';

import React, { useState, useMemo } from 'react';
import { MonitorSmartphone, Smartphone, Monitor } from 'lucide-react';
import { useVendor } from '@/context/vendor-context';
import { toFoodCardItem } from '@/lib/adapters/menu-adapter';
import PublicMenuView from '@/components/public/public-menu-view';

type ViewMode = 'desktop' | 'mobile';

export default function MenuPreview() {
  const { shop, dbItems, categories: contextCategories, announcements: contextAnnouncements } = useVendor();
  const [viewMode, setViewMode] = useState<ViewMode>('mobile');

  const items = useMemo(() => dbItems.map(toFoodCardItem), [dbItems]);
  const categories = useMemo(() => ['All Items', ...contextCategories.map(c => c.name)], [contextCategories]);
  const announcements = useMemo(
    () =>
      (contextAnnouncements || [])
        .filter((a) => a.isActive)
        .map((a) => ({
          id: a.id,
          title: a.title,
          description: a.description ?? undefined,
        })),
    [contextAnnouncements],
  );

  return (
    <div className="w-full max-w-[1300px] mx-auto py-6 px-2 sm:px-4 flex flex-col gap-6">

      {/* Preview Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-xs p-3.5 sm:p-5">
        <div className="text-center sm:text-left w-full sm:w-auto">
          <h2 className="text-base font-black text-slate-900 tracking-tight text-center sm:text-left">
            <span className="sm:hidden">Preview</span>
            <span className="hidden sm:inline">Public Menu Preview</span>
          </h2>
          <p className="hidden sm:block text-xs text-slate-500 font-medium">This is exactly how customers see your menu</p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl sm:rounded-2xl border border-slate-200/80 w-full sm:w-auto max-w-[320px] mx-auto sm:mx-0">
          <button
            type="button"
            onClick={() => setViewMode('desktop')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              viewMode === 'desktop'
                ? 'bg-white text-slate-900 shadow-xs font-black'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Monitor size={14} className="sm:w-[15px] sm:h-[15px]" />
            <span>Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('mobile')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              viewMode === 'mobile'
                ? 'bg-white text-slate-900 shadow-xs font-black'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Smartphone size={14} className="sm:w-[15px] sm:h-[15px]" />
            <span>Mobile</span>
          </button>
        </div>
      </div>

      {/* Preview Frame */}
      <div className={`mx-auto transition-all duration-300 ease-in-out ${
        viewMode === 'mobile' ? 'w-full max-w-[420px]' : 'w-full max-w-[850px]'
      }`}>
        <PublicMenuView
          vendorName={shop?.name || 'Crispy Bites'}
          vendorAddress={shop?.address || '123 Market Street · Open Now · ⭐ 4.8'}
          phone={shop?.phone || null}
          whatsapp={shop?.whatsapp || null}
          mapUrl={shop?.mapUrl || null}
          items={items}
          categories={categories}
          announcements={announcements}
        />
      </div>

      {/* Bottom note */}
      <p className="text-center text-xs text-slate-400 font-medium pb-4">
        <MonitorSmartphone size={13} className="inline-block mr-1 mb-0.5" />
        This preview reflects only available items as seen by your customers.
      </p>
    </div>
  );
}
