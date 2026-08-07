'use client';

import React, { ReactNode, useState, useEffect, useRef, Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import MenuLoading from '@/app/vendor/menu/loading';
import { createClient } from '@/lib/supabase/client';
import { getVendorShopAction } from '@/actions/shop/get-vendor-shop';

import {
  Search,
  User,
  ChevronDown,
  Home,
  List,
  Tag,
  QrCode,
  Utensils,
  Eye,
  Star,
  Percent,
  Megaphone,
  CreditCard,
  LayoutTemplate,
  MapPin,
  ExternalLink,
  X,
  Flame,
  LucideIcon
} from 'lucide-react';

import { VendorProvider, useVendor } from '@/context/vendor-context';

export interface CategoryItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface SubNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const CATEGORIES: CategoryItem[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'live-orders', label: 'Live Orders', icon: Flame },
  { id: 'menu', label: 'Menu', icon: List },
  { id: 'promotions', label: 'Promotions', icon: Tag },
  { id: 'qr-menu', label: 'QR Menu', icon: QrCode },
];

export const SUB_NAV_ITEMS: Record<string, SubNavItem[]> = {
  menu: [
    { id: 'items', label: 'Menu Items', icon: Utensils },
    { id: 'preview', label: 'Preview Menu', icon: Eye },
  ],
  promotions: [
    { id: 'special', label: "Today's Special", icon: Star },
    { id: 'offers', label: 'Offers', icon: Percent },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
  ],
  'qr-menu': [
    { id: 'card', label: 'Card', icon: CreditCard },
    { id: 'poster', label: 'Poster', icon: LayoutTemplate },
  ],
};

export const Header: React.FC = () => {
  const { vendorName, vendorLocation, rawLocation, loading } = useVendor();
  const [open, setOpen] = useState<boolean>(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const mapsUrl = rawLocation && /https?:\/\//i.test(rawLocation)
    ? rawLocation
    : vendorLocation
      ? `https://maps.google.com/?q=${encodeURIComponent(vendorLocation)}`
      : 'https://maps.google.com';

  return (
    <header className="bg-[#fdf8f3] border-b border-gray-200/80">
      <div className="max-w-[1536px] mx-auto px-4 md:px-8 h-[86px] flex items-center justify-between">

        {/* Left: Logo + Address trigger */}
        <div className="flex items-center gap-4 shrink-0 ml-4 lg:ml-12">
          <Link href="/vendor/dashboard" prefetch={false} className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/text-logo.png" alt="MyStreetMenu" className="h-11 w-auto object-contain" />
          </Link>

          {/* Zepto-style address pill */}
          <div className="relative hidden md:block" ref={popoverRef}>
            <button
              id="address-trigger"
              onClick={() => setOpen((o) => !o)}
              className="flex flex-col items-start cursor-pointer group focus:outline-none"
            >
              {loading ? (
                <>
                  <span className="h-4 w-28 bg-gray-200 animate-pulse rounded mb-1 inline-block" />
                  <span className="h-3 w-40 bg-gray-100 animate-pulse rounded inline-block" />
                </>
              ) : (
                <>
                  <span className="text-[15px] font-bold text-[#1f114a] group-hover:text-[#f77512] transition-colors leading-tight">
                    {vendorName || 'Your Shop'}
                  </span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#f77512] shrink-0" strokeWidth={2.5} />
                    <span className="text-[13px] font-semibold text-[#3d3d3d] max-w-[260px] truncate leading-tight">
                      {vendorLocation || 'Set your location'}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 text-gray-500 transition-transform duration-200 ${
                        open ? 'rotate-180 text-[#f77512]' : ''
                      }`}
                      strokeWidth={2.5}
                    />
                  </div>
                </>
              )}
            </button>

            {/* Dropdown popup */}
            {open && (
              <div className="absolute left-0 top-[calc(100%+12px)] w-80 bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-gray-100 z-50 overflow-hidden">
                {/* Header stripe */}
                <div className="bg-[#fff7f0] px-5 py-3.5 border-b border-orange-100">
                  <p className="text-[11px] font-semibold text-orange-400 uppercase tracking-widest mb-0.5">Shop Location</p>
                  <p className="text-[15px] font-bold text-[#1f114a] leading-snug">{vendorName || 'Your Shop'}</p>
                </div>

                {/* Address block */}
                <div className="px-5 py-4">
                  <div className="flex gap-3">
                    <div className="mt-0.5 w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-[#f77512]" strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-gray-800 leading-snug">
                        {vendorLocation || 'Location not set'}
                      </p>
                      {vendorLocation && (
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[12px] text-[#f77512] font-semibold mt-1.5 hover:underline"
                        >
                          View on Google Maps
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer action */}
                <div className="border-t border-gray-100 px-5 py-3">
                  <Link
                    href="/vendor/settings"
                    prefetch={false}
                    onClick={() => setOpen(false)}
                    className="text-[13px] font-semibold text-[#f77512] hover:underline"
                  >
                    Edit in Settings →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-[720px] mx-8">
          <div className="relative flex items-center w-full h-[46px] rounded-lg border border-gray-200 bg-[#fdf8f3] overflow-hidden focus-within:border-[#f77512] focus-within:ring-1 focus-within:ring-[#f77512] transition-all shadow-sm">
            <div className="pl-4 pr-3 text-gray-800">
              <Search className="w-[18px] h-[18px]" strokeWidth={2} />
            </div>
            <input
              type="text"
              placeholder='Search for "apple juice"'
              className="w-full h-full text-[14px] outline-none bg-transparent placeholder-gray-500 text-gray-800 font-medium"
            />
          </div>
        </div>

        {/* Right: Profile */}
        <div className="flex items-center gap-8 shrink-0 pr-2">
          <Link href="/vendor/settings" prefetch={false} className="flex flex-col items-center justify-center gap-1 text-gray-800 hover:text-[#f77512] transition-colors">
            <User className="w-[24px] h-[24px]" strokeWidth={1.5} />
            <span className="text-[12px] font-medium">Profile</span>
          </Link>
        </div>
      </div>
    </header>
  );
};interface CategoryNavProps {
  activeTab: string;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({ activeTab }) => {
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

  // Reposition the single always-mounted indicator whenever the active tab changes
  useEffect(() => {
    const activeIndex = CATEGORIES.findIndex((c) => c.id === activeTab);
    const el = tabRefs.current[activeIndex];
    if (el) {
      setIndicatorStyle({ left: el.offsetLeft, width: el.offsetWidth, opacity: 1 });
    } else {
      setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
    }
  }, [activeTab]);

  return (
    <nav className="border-b border-gray-200 bg-[#fdf8f3] overflow-x-auto no-scrollbar">
      <div className="max-w-[1536px] mx-auto px-4 md:px-8 flex">
        {/* Wrap in a relative container so the indicator can be absolutely positioned */}
        <div className="relative flex items-center ml-0 md:ml-64 lg:ml-72 xl:ml-80">
          {CATEGORIES.map((cat, index) => {
            const isActive = activeTab === cat.id;
            const Icon = cat.icon;

            // Map category id to destination path
            let path = '/vendor/dashboard';
            if (cat.id === 'live-orders') path = '/vendor/live-orders';
            else if (cat.id === 'menu') path = '/vendor/menu';
            else if (cat.id === 'promotions') path = '/vendor/promotions';
            else if (cat.id === 'qr-menu') path = '/vendor/qr';

            return (
              <Link
                key={cat.id}
                ref={(el) => { tabRefs.current[index] = el; }}
                href={path}
                prefetch={false}
                className={`relative flex items-center gap-2 px-5 py-[14px] min-w-max transition-colors bg-[#fdf8f3] ${isActive ? 'text-[#f77512]' : 'text-[#5C677D] hover:text-gray-00'
                  }`}
              >
                <Icon className="w-[18px] h-[18px] relative z-10" strokeWidth={2} />
                <span className="text-[15px] font-bold relative z-10 transition-colors">
                  {cat.label}
                </span>
              </Link>
            );
          })}

          {/* Indicator bar with smooth CSS transition */}
          <div
            className="absolute bottom-0 h-[3px] bg-[#f77512] rounded-t-full pointer-events-none transition-all duration-150 ease-out"
            style={{
              left: indicatorStyle.left,
              width: indicatorStyle.width,
              opacity: indicatorStyle.opacity,
            }}
          />
        </div>
      </div>
    </nav>
  );
};

export const MobileVendorHeader: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  const { vendorName, vendorLocation, rawLocation, loading } = useVendor();
  const [open, setOpen] = useState<boolean>(false);
  const [showWelcome, setShowWelcome] = useState<boolean>(false);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Auto-hide welcome card after 15s (if not seen before in this session)
  useEffect(() => {
    const hasSeenWelcome = sessionStorage.getItem('msm_mobile_welcome_seen');
    if (!hasSeenWelcome) {
      setShowWelcome(true);

      const timer = setTimeout(() => {
        setIsFadingOut(true);
        setTimeout(() => {
          setShowWelcome(false);
          sessionStorage.setItem('msm_mobile_welcome_seen', 'true');
        }, 500);
      }, 15000); // 15s auto-hide
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismissWelcome = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      setShowWelcome(false);
      sessionStorage.setItem('msm_mobile_welcome_seen', 'true');
    }, 500);
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const mapsUrl = rawLocation && /https?:\/\//i.test(rawLocation)
    ? rawLocation
    : vendorLocation
      ? `https://maps.google.com/?q=${encodeURIComponent(vendorLocation)}`
      : 'https://maps.google.com';

  return (
    <div className="block md:hidden w-full select-none">
      {/* 1. Mobile Welcome Card (Auto-hides after 10s or on dismiss) */}
      {showWelcome && (
        <div
          className={`w-full transition-all duration-500 ease-in-out ${
            isFadingOut
              ? 'max-h-0 opacity-0 overflow-hidden'
              : 'max-h-[140px] opacity-100'
          }`}
        >
          <div className="bg-[#f77512] text-center pt-3 pb-2.5 px-6 relative text-white">
            <button
              onClick={handleDismissWelcome}
              className="absolute right-2 top-2 text-white/80 hover:text-white p-1 rounded-full bg-black/15 hover:bg-black/25 cursor-pointer transition-colors"
              aria-label="Dismiss welcome card"
            >
              <X size={14} />
            </button>
            <p className="text-[13.5px] font-black tracking-tight leading-tight text-white">
              {vendorName ? `Welcome back, ${vendorName}!` : 'Manage Your Food Business'}
            </p>
            <p className="text-[11px] font-bold text-white/95 mt-0.5 leading-snug">
              Manage your menu and track today&apos;s performance.
            </p>
          </div>

          {/* Authentic Scalloped Wavy Divider matching card background (#f77512) */}
          <div
            className="w-full h-2.5 bg-repeat-x bg-bottom bg-[#f77512]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 10' width='20' height='10'%3E%3Cpath d='M0,10 Q10,0 20,10 Z' fill='%23fdf8f3'/%3E%3C/svg%3E")`
            }}
          />
        </div>
      )}

      {/* 2. Container matching Desktop Mode color (#fdf8f3) with comfortable spacing */}
      <div className="bg-[#fdf8f3] px-4 pt-3 pb-3 relative" ref={popoverRef}>
        {/* Top Row: Shop Title + Location Trigger (right side of vendor name) + Profile Avatar Icon */}
        <div className="flex items-center justify-between gap-2.5 relative z-20">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <h1 className="text-[18px] sm:text-xl font-black text-[#1f114a] tracking-tight leading-tight truncate shrink-0 max-w-[130px] sm:max-w-[180px]">
              {loading ? 'Your Shop' : vendorName || 'Your Shop'}
            </h1>

            {/* Location Trigger (Right side of vendor name) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-1.5 text-left focus:outline-none group max-w-full bg-orange-50/90 border border-orange-200/80 px-2.5 py-1 rounded-full shadow-xs"
              >
                <MapPin className="w-3.5 h-3.5 text-[#f77512] shrink-0" strokeWidth={2.5} />
                <span className="text-[11.5px] font-bold text-slate-700 group-hover:text-[#f77512] transition-colors truncate max-w-[120px] sm:max-w-[180px]">
                  {vendorLocation || 'Set location'}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-gray-500 shrink-0 transition-transform duration-200 ${
                    open ? 'rotate-180 text-[#f77512]' : ''
                  }`}
                  strokeWidth={2.5}
                />
              </button>

              {/* Location Dropdown Popup (Viewport aligned on mobile, higher up) */}
              {open && (
                <div className="fixed left-4 right-4 top-[44px] sm:absolute sm:top-[calc(100%+8px)] sm:left-0 sm:right-auto sm:w-80 bg-white rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.2)] border border-gray-100 z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-3.5">
                    <div className="flex gap-3">
                      <div className="mt-0.5 w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-[#f77512]" strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="text-[13px] font-extrabold text-gray-900 leading-snug">
                          {vendorLocation || 'Location not set'}
                        </p>
                        {vendorLocation && (
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[12px] text-[#f77512] font-bold mt-1.5 hover:underline"
                          >
                            View on Google Maps
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 px-4 py-2.5 bg-gray-50">
                    <Link
                      href="/vendor/settings"
                      prefetch={false}
                      onClick={() => setOpen(false)}
                      className="text-[12px] font-bold text-[#f77512] hover:underline"
                    >
                      Edit in Settings →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* User Profile Avatar Icon */}
          <Link
            href="/vendor/settings"
            prefetch={false}
            className="w-9 h-9 rounded-full bg-[#1f114a] text-white flex items-center justify-center shrink-0 shadow-xs border border-gray-200 hover:scale-105 transition-transform"
          >
            <User className="w-4.5 h-4.5 text-white" strokeWidth={2} />
          </Link>
        </div>

        {/* Third Row: Navigation Category Tabs (Icon-only for home, promotions & qr-menu on mobile) */}
        <div className="flex items-center gap-1.5 pt-3 pb-1 w-full relative z-10 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isActive = activeTab === cat.id;
            const Icon = cat.icon;
            const isIconOnly = cat.id === 'home' || cat.id === 'promotions' || cat.id === 'qr-menu';

            let path = '/vendor/dashboard';
            if (cat.id === 'live-orders') path = '/vendor/live-orders';
            else if (cat.id === 'menu') path = '/vendor/menu';
            else if (cat.id === 'promotions') path = '/vendor/promotions';
            else if (cat.id === 'qr-menu') path = '/vendor/qr';

            return (
              <Link
                key={cat.id}
                href={path}
                prefetch={false}
                title={cat.label}
                className={`flex items-center justify-center py-2 transition-all text-center rounded-xl text-[12px] font-bold ${
                  isIconOnly ? 'px-2.5 shrink-0' : 'px-3 flex-1 min-w-0'
                } ${
                  isActive
                    ? 'bg-[#f77512] text-white shadow-xs font-bold'
                    : 'bg-white text-slate-700 border border-gray-200/90 hover:bg-slate-100'
                }`}
              >
                {isIconOnly ? (
                  <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-white' : 'text-[#f77512]'}`} strokeWidth={2.2} />
                ) : (
                  <span className="truncate max-w-full leading-tight">{cat.label}</span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-gray-200/80 bg-[#fdf8f3] py-2.5 sm:py-3 md:py-4 px-3 sm:px-6 md:px-8 mt-auto">
      <div className="max-w-[1536px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-2 text-[11px] sm:text-xs md:text-sm text-gray-500 font-medium">
        <p>© {new Date().getFullYear()} MyStreetMenu. All rights reserved.</p>
        <p className="flex items-center gap-1">
          Copyright by{' '}
          <a 
            href="https://snkdevworks.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="font-extrabold text-[#f77512] hover:text-[#e05a00] hover:underline transition-colors"
          >
            snkdevworks.com
          </a>
        </p>
      </div>
    </footer>
  );
};

function VendorSubNavContent({ pathname, currentSubNav }: { pathname: string; currentSubNav: SubNavItem[] }) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeSubTab = tabParam || (currentSubNav.length > 0 ? currentSubNav[0].id : '');

  return (
    <div className="w-full md:w-[240px] shrink-0 flex flex-row items-center justify-center md:justify-start gap-1 sm:gap-2.5 md:gap-4 max-w-full md:max-w-none mx-auto md:mx-0 md:flex-col lg:ml-12 mt-1 md:mt-2 md:sticky md:top-[155px]">
      {currentSubNav.map((item) => {
        const Icon = item.icon;
        const isActive = activeSubTab === item.id;
        return (
          <Link
            key={item.id}
            href={`${pathname}?tab=${item.id}`}
            prefetch={false}
            className={`relative flex-1 md:flex-initial flex items-center justify-center md:justify-start gap-1 sm:gap-2 md:gap-3.5 text-center md:text-left transition-all duration-200 group py-2 px-1 xs:px-2 sm:px-3 md:py-3 md:px-4 rounded-lg sm:rounded-xl md:rounded-2xl cursor-pointer whitespace-nowrap min-w-0 md:w-full ${
              isActive
                ? 'bg-[#FFEAD8] text-[#f77512] font-extrabold border border-orange-200/80 shadow-2xs'
                : 'bg-white text-[#3d3d3d] font-bold border border-gray-200/90 hover:bg-slate-50 hover:text-slate-900 shadow-2xs'
            }`}
          >
            <Icon
              className={`w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 md:w-[22px] md:h-[22px] shrink-0 ${isActive ? 'text-[#f77512]' : 'text-gray-500 group-hover:text-gray-700'}`}
              strokeWidth={2}
            />
            <span className={`text-[11px] sm:text-[13px] md:text-[15px] truncate sm:whitespace-nowrap ${isActive
              ? 'text-[#f77512] font-black'
              : 'text-[#3d3d3d] font-extrabold group-hover:text-slate-900'
              }`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

function VendorSubNav({ pathname, currentSubNav }: { pathname: string; currentSubNav: SubNavItem[] }) {
  return (
    <Suspense fallback={
      <div className="w-full md:w-[240px] shrink-0 flex flex-row items-center justify-center md:justify-start gap-1 sm:gap-2.5 md:gap-4 max-w-full md:max-w-none mx-auto md:mx-0 md:flex-col lg:ml-12 mt-1 md:mt-2 md:sticky md:top-[155px]">
        {currentSubNav.map((item) => (
          <div key={item.id} className="flex-1 md:flex-initial h-10 md:h-12 bg-gray-200/60 animate-pulse rounded-lg md:rounded-2xl md:w-full" />
        ))}
      </div>
    }>
      <VendorSubNavContent pathname={pathname} currentSubNav={currentSubNav} />
    </Suspense>
  );
}

interface LayoutProps {
  children?: ReactNode;
}

// Paths within /vendor that should NOT use the dashboard shell
const AUTH_PATHS = ['/vendor/login', '/vendor/signup', '/vendor/onboarding'];

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();

  const isAuthPath = AUTH_PATHS.includes(pathname);

  // Helper to resolve active tab directly from URL path (strictly synchronized with router)
  const getTabFromPathname = (path: string) => {
    if (path.startsWith('/vendor/live-orders')) return 'live-orders';
    if (path.startsWith('/vendor/menu')) return 'menu';
    if (path.startsWith('/vendor/promotions')) return 'promotions';
    if (path.startsWith('/vendor/qr')) return 'qr-menu';
    if (path.startsWith('/vendor/settings')) return 'settings';
    return 'home';
  };

  const activeTab = getTabFromPathname(pathname);
  const currentSubNav = SUB_NAV_ITEMS[activeTab] || [];

  // Render bare (no shell) for auth pages like /vendor/login
  if (isAuthPath) {
    return <>{children}</>;
  }

  return (
    <VendorProvider>
      <div className="min-h-screen bg-[#fdf8f3] font-sans flex flex-col justify-between">
        {/* Global Styles */}
        <style dangerouslySetInnerHTML={{
          __html: `
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          body { font-family: 'Inter', sans-serif; margin: 0; }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}} />

        {/* Sticky Header & Category Navigation Wrapper */}
        <div className="sticky top-0 z-50 bg-[#fdf8f3] md:shadow-xs shadow-none">
          {/* Desktop Header (Unchanged) */}
          <div className="hidden md:block">
            <Header />
            <CategoryNav activeTab={activeTab} />
          </div>

          {/* Mobile Header (Zepto UI matching reference image) */}
          <div className="block md:hidden">
            <MobileVendorHeader activeTab={activeTab} />
          </div>
        </div>

        <main className="w-full flex-1 min-h-0">
          {currentSubNav.length > 0 ? (
            <div className="max-w-[1536px] mx-auto px-2 sm:px-4 md:px-8 pt-3 md:pt-6 pb-10 flex flex-col md:flex-row gap-4 md:gap-8 lg:gap-16 items-start relative bg-[#fdf8f3]">
              {/* Left/Top Sub-Navigation */}
              <VendorSubNav pathname={pathname} currentSubNav={currentSubNav} />

              {/* Right Side: Main Content Area */}
              <div className="flex-1 w-full bg-[#fdf8f3] min-h-[500px]">
                <Suspense fallback={<MenuLoading />}>
                  {children}
                </Suspense>
              </div>
            </div>
          ) : (
            <Suspense fallback={<MenuLoading />}>
              {children}
            </Suspense>
          )}
        </main>

        <Footer />
      </div>
    </VendorProvider>
  );
}

