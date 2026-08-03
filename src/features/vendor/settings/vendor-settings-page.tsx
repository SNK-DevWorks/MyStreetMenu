'use client';

import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

import type { SettingsTab } from './types';
import { SettingsSidebar } from './settings-sidebar';
import { ShopInformationView } from './shop-information-view';
import { BusinessHoursView } from './business-hours-view';
import { AccountView } from './account-view';
import { SupportView } from './support-view';
import { useVendorUser } from './use-vendor-user';

const TAB_LABELS: Record<SettingsTab, string> = {
  'shop-info':      'Shop Information',
  'business-hours': 'Business Hours',
  'account':        'Account',
  'support':        'Customer Support',
};

function ContentView({ activeTab, user, loading }: {
  activeTab: SettingsTab;
  user: ReturnType<typeof useVendorUser>['user'];
  loading: boolean;
}) {
  switch (activeTab) {
    case 'shop-info':      return <ShopInformationView />;
    case 'business-hours': return <BusinessHoursView />;
    case 'account':        return <AccountView user={user} loading={loading} />;
    case 'support':        return <SupportView />;
  }
}

export const VendorSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('shop-info');
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');
  const { user, loading } = useVendorUser();

  const handleSelectTab = (tab: SettingsTab) => {
    setActiveTab(tab);
    setMobileView('detail');
  };

  return (
    <div className="w-full bg-[#fdf8f3] flex items-start justify-center p-2 sm:p-4 md:px-8 py-2 md:py-6 font-sans">
      {/* Scrollbar + Font Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }

          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; margin-top: 10px; margin-bottom: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #d1d5db; border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #9ca3af; }
        `,
      }} />

      {/* Main Container */}
      <div className="bg-white w-full max-w-[1050px] rounded-xl sm:rounded-2xl border border-gray-200/90 shadow-sm md:shadow-xl overflow-hidden flex flex-col md:flex-row md:h-[750px] lg:h-[800px] md:max-h-[85vh]">

        {/* Left Sidebar */}
        <div className={`w-full md:w-[300px] shrink-0 h-full ${mobileView === 'detail' ? 'hidden md:block' : 'block'}`}>
          <SettingsSidebar
            activeTab={activeTab}
            setActiveTab={handleSelectTab}
            user={user}
            loading={loading}
          />
        </div>

        {/* Right Content Area */}
        <div className={`flex-1 bg-[#fdf8f3] flex-col relative h-full min-h-0 overflow-hidden ${mobileView === 'list' ? 'hidden md:flex' : 'flex animate-in slide-in-from-right-4 duration-200'}`}>
          {/* Content Header */}
          <div className="h-[54px] sm:h-[60px] bg-white border-b border-gray-200 flex items-center justify-between px-3 sm:px-4 shrink-0 z-10 shadow-2xs">
            <button
              type="button"
              onClick={() => setMobileView('list')}
              className="flex items-center gap-1 text-[#f77512] hover:text-[#e05a00] font-extrabold text-sm p-1.5 rounded-lg hover:bg-orange-50 transition-colors cursor-pointer md:hidden"
            >
              <ChevronLeft size={20} strokeWidth={2.5} />
              <span>Settings</span>
            </button>

            <div className="flex items-center text-[#1a1a1a] font-bold text-sm sm:text-[16px] truncate">
              <span className="hidden md:inline-flex items-center mr-1 text-gray-400">
                <ChevronLeft size={20} />
              </span>
              <span>{TAB_LABELS[activeTab]}</span>
            </div>

            <div className="w-12 md:hidden" /> {/* Spacer for mobile centered title */}
          </div>

          {/* Dynamic Tab Content */}
          <ContentView activeTab={activeTab} user={user} loading={loading} />
        </div>
      </div>
    </div>
  );
};
