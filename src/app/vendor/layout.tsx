'use client';

import React, { ReactNode, useState, useEffect, useRef, Suspense } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import MenuLoading from '@/app/vendor/menu/loading';
import { createClient } from '@/lib/supabase/client';

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
  LucideIcon
} from 'lucide-react';

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

function getCleanPlaceAddress(rawAddress: string | null | undefined): string {
  if (!rawAddress || !rawAddress.trim()) {
    return 'Vendor Location';
  }
  const trimmed = rawAddress.trim();

  // If the string contains a URL link (Google Maps link)
  if (/https?:\/\/|[a-z0-9-]+\.(goo\.gl|google\.com)/i.test(trimmed)) {
    // Strip URL out if combined with text address
    const cleanText = trimmed
      .replace(/https?:\/\/[^\s]+/gi, '')
      .replace(/maps\.app\.goo\.gl[^\s]*/gi, '')
      .replace(/goo\.gl\/maps[^\s]*/gi, '')
      .trim();

    if (cleanText.length > 0) {
      return cleanText.replace(/^[\s,.-]+|[\s,.-]+$/g, '');
    }

    // If pure URL, parse query or path place name
    try {
      const urlObj = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
      const queryParam = urlObj.searchParams.get('q') || urlObj.searchParams.get('query');
      if (queryParam) {
        return decodeURIComponent(queryParam);
      }

      const placeMatch = urlObj.pathname.match(/\/place\/([^\/]+)/);
      if (placeMatch && placeMatch[1]) {
        return decodeURIComponent(placeMatch[1]).replace(/\+/g, ' ');
      }
    } catch {
      // fallback
    }

    return 'Google Maps Location';
  }

  return trimmed;
}

export const Header: React.FC = () => {
  const [vendorName, setVendorName] = useState<string>('SNK DevWorks');
  const [vendorLocation, setVendorLocation] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const name =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.user_metadata?.shop_name ||
          user.email?.split('@')[0] ||
          'SNK DevWorks';
        const location =
          user.user_metadata?.location ||
          user.user_metadata?.address ||
          user.user_metadata?.shop_address ||
          '';
        setVendorName(name);
        setVendorLocation(location);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const name =
          session.user.user_metadata?.full_name ||
          session.user.user_metadata?.name ||
          session.user.user_metadata?.shop_name ||
          session.user.email?.split('@')[0] ||
          'SNK DevWorks';
        const location =
          session.user.user_metadata?.location ||
          session.user.user_metadata?.address ||
          session.user.user_metadata?.shop_address ||
          '';
        setVendorName(name);
        setVendorLocation(location);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[#fdf8f3] border-b border-gray-200">
      <div className="max-w-[1536px] mx-auto px-4 md:px-8 h-[86px] flex items-center justify-between">

        {/* Left: Brand & Vendor Info */}
        <div className="flex items-center gap-6 shrink-0 ml-4 lg:ml-12">
          <Link href="/vendor/dashboard" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/text-logo.png" alt="MyStreetMenu" className="h-11 w-auto object-contain" />
          </Link>

          <Link href="/vendor/settings" className="hidden md:flex flex-col cursor-pointer border-r border-transparent pr-2 group">
            <span className="text-[15px] font-bold text-[#1f114a] group-hover:text-[#f77512] transition-colors">
              {loading ? (
                <span className="h-4 w-28 bg-gray-200 animate-pulse rounded inline-block" />
              ) : (
                vendorName
              )}
            </span>
            <div className="flex items-center text-[13px] mt-0.5">
              <span className="truncate max-w-[220px] font-medium text-[#7a859e] group-hover:text-[#f77512] transition-colors">
                {getCleanPlaceAddress(vendorLocation)}
              </span>
              <ChevronDown className="w-4 h-4 ml-1 flex-shrink-0 text-gray-500 group-hover:text-[#f77512] transition-colors" strokeWidth={2.5} />
            </div>
          </Link>
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

        {/* Right Side: Actions (Profile only) */}
        <div className="flex items-center gap-8 shrink-0 pr-2">
          <Link href="/vendor/settings" className="flex flex-col items-center justify-center gap-1 text-gray-800 hover:text-[#f77512] transition-colors">
            <User className="w-[24px] h-[24px]" strokeWidth={1.5} />
            <span className="text-[12px] font-medium">Profile</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

interface CategoryNavProps {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({ activeTab, setActiveTab }) => {
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
    <nav className="sticky top-[86px] z-40 border-b border-gray-200 bg-[#fdf8f3] overflow-x-auto no-scrollbar">
      <div className="max-w-[1536px] mx-auto px-4 md:px-8 flex">
        {/* Wrap in a relative container so the indicator can be absolutely positioned */}
        <div className="relative flex items-center ml-0 md:ml-64 lg:ml-72 xl:ml-80">
          {CATEGORIES.map((cat, index) => {
            const isActive = activeTab === cat.id;
            const Icon = cat.icon;

            // Map category id to destination path
            let path = '/vendor/dashboard';
            if (cat.id === 'menu') path = '/vendor/menu';
            else if (cat.id === 'promotions') path = '/vendor/promotions';
            else if (cat.id === 'qr-menu') path = '/vendor/qr';

            return (
              <Link
                key={cat.id}
                ref={(el) => { tabRefs.current[index] = el; }}
                href={path}
                onClick={() => setActiveTab(cat.id)}
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

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-gray-200/80 bg-[#fdf8f3] py-6 px-4 mt-auto">
      <div className="max-w-[1536px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-gray-500 font-medium px-4 md:px-8">
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

interface LayoutProps {
  children?: ReactNode;
}

// Paths within /vendor that should NOT use the dashboard shell
const AUTH_PATHS = ['/vendor/login', '/vendor/signup'];

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isAuthPath = AUTH_PATHS.includes(pathname);

  // Helper to resolve active tab from URL path
  const getTabFromPathname = (path: string) => {
    if (path.startsWith('/vendor/menu')) return 'menu';
    if (path.startsWith('/vendor/promotions')) return 'promotions';
    if (path.startsWith('/vendor/qr')) return 'qr-menu';
    if (path.startsWith('/vendor/settings')) return 'settings';
    return 'home';
  };

  const [activeTab, setActiveTab] = useState<string>(() => getTabFromPathname(pathname));
  const [activeSubTab, setActiveSubTab] = useState<string>('');

  // Synchronize state when the path changes (e.g. back/forward navigation)
  useEffect(() => {
    if (isAuthPath) return;
    setActiveTab(getTabFromPathname(pathname));
  }, [pathname, isAuthPath]);

  const currentSubNav = SUB_NAV_ITEMS[activeTab] || [];

  // Sync activeSubTab from URL query string on client side
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
      setActiveSubTab(tabParam);
    } else if (currentSubNav.length > 0) {
      setActiveSubTab(currentSubNav[0].id);
    } else {
      setActiveSubTab('');
    }
  }, [pathname, currentSubNav]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleSubTabChange = (subTabId: string) => {
    setActiveSubTab(subTabId);
    router.push(`${pathname}?tab=${subTabId}`);
  };

  // Render bare (no shell) for auth pages like /vendor/login
  if (isAuthPath) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#fdf8f3] font-sans flex flex-col justify-between overflow-x-hidden">
      {/* Global Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; margin: 0; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      <Header />
      <CategoryNav activeTab={activeTab} setActiveTab={handleTabChange} />

      <main className="w-full flex-1 min-h-[calc(100vh-136px)]">
        {currentSubNav.length > 0 ? (
          <div className="max-w-[1536px] mx-auto px-4 md:px-8 pt-8 pb-10 flex flex-col md:flex-row gap-8 lg:gap-16 items-start relative bg-[#fdf8f3]">
            {/* Left Sub-Navigation */}
            <div className="w-full md:w-[240px] shrink-0 flex flex-col gap-4 lg:ml-12 mt-2">
              {currentSubNav.map((item) => {
                const Icon = item.icon;
                const isActive = activeSubTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSubTabChange(item.id)}
                    className={`relative flex items-center gap-4 text-left transition-all duration-150 group py-2.5 px-3.5 rounded-xl cursor-pointer ${
                      isActive
                        ? 'bg-orange-100/80 text-[#f77512] font-semibold'
                        : 'bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100/60'
                    }`}
                  >
                    <Icon
                      className={`w-[22px] h-[22px] ${isActive ? 'text-[#f77512]' : 'text-gray-500 group-hover:text-gray-700'}`}
                      strokeWidth={1.5}
                    />
                    <span className={`text-[15px] font-medium ${isActive
                      ? 'text-[#f77512] font-bold'
                      : 'text-gray-600 group-hover:text-gray-800'
                      }`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>

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
  );
}
