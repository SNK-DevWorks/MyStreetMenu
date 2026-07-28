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
  const { user, loading } = useVendorUser();

  return (
    <div className="w-full bg-[#fdf8f3] flex items-start justify-center p-4 md:px-8 md:py-6 font-sans">
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
      <div className="bg-white w-full max-w-[1000px] h-[800px] max-h-[90vh] rounded-2xl border border-gray-200 shadow-xl overflow-hidden flex flex-row">

        {/* Left Sidebar */}
        <SettingsSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={user}
          loading={loading}
        />

        {/* Right Content Area */}
        <div className="flex-1 bg-[#fdf8f3] flex flex-col relative h-full min-h-0 overflow-hidden">
          {/* Content Header */}
          <div className="h-[60px] bg-white border-b border-gray-200 flex items-center px-4 shrink-0 z-10 shadow-sm">
            <div className="flex items-center text-[#1a1a1a] p-1.5 rounded-lg">
              <ChevronLeft size={24} />
              <span className="font-bold text-[16px] ml-1">{TAB_LABELS[activeTab]}</span>
            </div>
          </div>

          {/* Dynamic Tab Content */}
          <ContentView activeTab={activeTab} user={user} loading={loading} />
        </div>
      </div>
    </div>
  );
};
