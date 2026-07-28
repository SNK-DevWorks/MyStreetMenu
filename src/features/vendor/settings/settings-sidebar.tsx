'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Store,
  Clock,
  User,
  MessageSquare,
  ChevronRight,
  LogOut as LogOutIcon,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { SettingsTab } from './types';
import type { VendorUser } from './use-vendor-user';

interface SidebarProps {
  activeTab: SettingsTab;
  setActiveTab: (tab: SettingsTab) => void;
  user: VendorUser | null;
  loading?: boolean;
}

const NAV_ITEMS: { id: SettingsTab; label: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
  { id: 'shop-info',       label: 'Shop Information',   icon: Store },
  { id: 'business-hours',  label: 'Business Hours',     icon: Clock },
  { id: 'account',         label: 'Account',            icon: User },
  { id: 'support',         label: 'Customer Support',   icon: MessageSquare },
];

export const SettingsSidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, user, loading }) => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace('/vendor/login');
    router.refresh();
  };

  return (
    <div className="w-[300px] flex-shrink-0 flex flex-col bg-white border-r border-gray-200 h-full">
      {/* User Profile Info */}
      <div className="p-6 flex items-center gap-4">
        {/* Avatar */}
        {loading ? (
          <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse shrink-0" />
        ) : user?.avatarUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-12 h-12 rounded-full object-cover shrink-0 shadow-sm ring-2 ring-[#f67412]/20"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-[#f67412] flex items-center justify-center text-white shrink-0 shadow-sm text-lg font-bold uppercase">
            {user?.name?.charAt(0) ?? <User size={22} />}
          </div>
        )}

        {/* Name & Contact */}
        <div className="flex flex-col min-w-0">
          {loading ? (
            <>
              <div className="h-4 w-32 bg-gray-200 animate-pulse rounded mb-2" />
              <div className="h-3 w-24 bg-gray-200 animate-pulse rounded" />
            </>
          ) : (
            <>
              <h2 className="font-bold text-[#1a1a1a] text-[16px] leading-tight truncate">{user?.name ?? 'Vendor'}</h2>
              <span className="text-[12px] text-gray-500 mt-0.5 truncate">{user?.email ?? ''}</span>
            </>
          )}
        </div>
      </div>

      {/* Active Subscription Card */}
      <div className="px-6 pb-6">
        <div className="bg-[#fdf8f3] border border-gray-200 rounded-xl overflow-hidden p-4">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[14px] font-bold text-[#1a1a1a]">MyStreetMenu</span>
              <span className="text-[12px] text-gray-500 mt-1">Active till 12th Aug 2026</span>
            </div>
            <span className="bg-[#f67412]/10 text-[#f67412] text-[10px] font-bold px-2 py-1 rounded-full">
              ACTIVE
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center cursor-pointer group">
            <span className="text-[13px] font-semibold text-[#1a1a1a] group-hover:text-[#f67412] transition-colors">
              Manage Subscription
            </span>
            <ChevronRight size={16} className="text-gray-400 group-hover:text-[#f67412] transition-colors" />
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-4 px-3.5 py-3.5 rounded-xl cursor-pointer transition-all text-left focus:outline-none focus:ring-0 outline-none select-none ${
                isActive
                  ? 'bg-[#fdf8f3] text-[#f67412] font-bold border border-orange-200/70 shadow-xs'
                  : 'text-[#1a1a1a] hover:bg-[#fdf8f3]/60 font-medium border border-transparent'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-[#f67412] shrink-0' : 'text-[#1a1a1a] shrink-0'} />
              <span className="text-[14px]">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout and Logo */}
      <div className="p-6 flex flex-col items-center justify-center mt-auto">
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center justify-center gap-2 border border-[#ff3269] text-[#ff3269] px-6 py-2.5 rounded-xl text-[14px] font-semibold hover:bg-pink-50 transition-colors cursor-pointer disabled:opacity-50"
        >
          {isLoggingOut ? (
            <span className="w-4 h-4 border-2 border-[#ff3269] border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <LogOutIcon size={16} />
              <span>Log Out</span>
            </>
          )}
        </button>
        <div className="mt-6 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/text-logo.png" alt="MyStreetMenu" className="h-7 w-auto object-contain" />
        </div>
      </div>
    </div>
  );
};
