'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, TrendingUp, TrendingDown, Minus, QrCode } from 'lucide-react';
import { useVendor } from '@/context/vendor-context';
import { getDashboardAnalyticsAction, type DashboardAnalytics } from '@/actions/analytics/get-dashboard-analytics';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function getDelta(today: number, yesterday: number): { value: number; positive: boolean; zero: boolean } {
  const delta = today - yesterday;
  return { value: Math.abs(delta), positive: delta >= 0, zero: delta === 0 };
}

function DeltaBadge({ today, yesterday }: { today: number; yesterday: number }) {
  const { value, positive, zero } = getDelta(today, yesterday);
  if (zero) return null;
  return (
    <span className={`flex items-center gap-1 text-xs font-bold ${positive ? 'text-green-600' : 'text-red-500'}`}>
      {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {positive ? '+' : '-'}{formatCount(value)} vs yesterday
    </span>
  );
}

// ─── Menu Items Card ───────────────────────────────────────────────────────────

export const MenuItemsCard: React.FC<{ count?: number }> = ({ count: initialCount }) => {
  const { dbItems, menuLoading } = useVendor();

  const total = initialCount ?? dbItems.length;
  const available = dbItems.filter(i => !i.isSoldOut).length;
  const isLoading = initialCount === undefined && menuLoading;

  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? (available / total) * 100 : 0;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="bg-[#FFF6F0] rounded-2xl sm:rounded-3xl md:rounded-[2rem] p-3 sm:p-5 md:p-6 flex flex-col items-center justify-center gap-1 sm:gap-2 shadow-xs hover:shadow-md w-full h-[140px] sm:h-[180px] md:h-[250px] transition-all border border-orange-100/90">
      <h3 className="text-[#C84E00] font-black text-[16px] sm:text-lg md:text-xl tracking-tight leading-tight">Menu Items</h3>

      <div className="relative flex items-center justify-center mt-0.5">
        <svg className="w-20 h-20 sm:w-28 sm:h-28 md:w-40 md:h-40 transform -rotate-90" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r={radius} stroke="#F77512" strokeOpacity="0.2" strokeWidth="11" fill="transparent" />
          <circle
            cx="80" cy="80" r={radius}
            stroke="#F77512" strokeWidth="11" fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {isLoading ? (
          <Loader2 className="absolute w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[#F77512] animate-spin" />
        ) : (
          <span className="absolute text-[32px] sm:text-[38px] md:text-[50px] font-black text-[#A93900] tracking-tight">{total}</span>
        )}
      </div>
    </div>
  );
};

// ─── Menu Views Card ───────────────────────────────────────────────────────────

export const MenuViewsCard: React.FC<{ analytics: DashboardAnalytics | null; loading: boolean }> = ({ analytics, loading }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'Today' | 'Yesterday' | 'This Month'>('Today');

  const todayViews     = analytics?.today.menuViews     ?? 0;
  const yesterdayViews = analytics?.yesterday.menuViews ?? 0;
  const monthViews     = analytics?.thisMonth.menuViews ?? 0;

  const displayed =
    selectedPeriod === 'Today'
      ? todayViews
      : selectedPeriod === 'Yesterday'
      ? yesterdayViews
      : monthViews;

  return (
    <div className="bg-[#FFF4EC] rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] relative overflow-hidden shadow-xs hover:shadow-md w-full h-[180px] sm:h-[210px] md:h-[250px] flex transition-all border border-orange-100/90">
      {/* Left Content — Centered vertically */}
      <div className="flex-1 p-4 sm:p-6 md:p-7 flex flex-col justify-center z-10 h-full">
        <h3 className="text-[#C84E00] font-black text-[20px] sm:text-xl md:text-2xl tracking-tight mb-2 sm:mb-3">Menu Views</h3>
        <ul className="space-y-1.5 sm:space-y-2.5 text-slate-800 text-[14px] sm:text-sm md:text-base font-black">
          {(['Today', 'Yesterday', 'This Month'] as const).map((period) => (
            <li
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`flex items-center gap-2.5 sm:gap-3 cursor-pointer py-0.5 transition-colors ${
                selectedPeriod === period ? 'text-slate-900 font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className={`w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full transition-all shrink-0 flex items-center justify-center ${
                selectedPeriod === period
                  ? 'bg-[#F77512] shadow-[0_0_12px_rgba(247,117,18,0.5)] scale-105'
                  : 'bg-slate-300/90 hover:bg-slate-400'
              }`}>
                {selectedPeriod === period && <span className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-white" />}
              </span>
              <span className="truncate">{period}</span>
            </li>
          ))}
        </ul>
        <div className="mt-1.5 sm:mt-2">
          <DeltaBadge today={todayViews} yesterday={yesterdayViews} />
        </div>
      </div>

      {/* Right Orange Curved Section */}
      <div className="absolute right-0 top-0 bottom-0 w-[46%] sm:w-[50%] md:w-[55%] bg-[#F77512] rounded-l-[45px] sm:rounded-l-[70px] md:rounded-l-[80px] flex flex-col items-center justify-center">
        <div className="text-center mt-0.5 px-2">
          {loading ? (
            <Loader2 className="text-white w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 animate-spin mx-auto mb-1" />
          ) : (
            <span className="block text-white text-[36px] sm:text-[40px] md:text-[44px] font-black tracking-tight mb-0.5 transition-all">
              {formatCount(displayed)}
            </span>
          )}
          <span className="text-white/95 text-[13px] sm:text-xs md:text-sm font-black tracking-wide">
            {selectedPeriod === 'This Month' ? 'Month Views' : 'Total Views'}
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── QR Scans Card ─────────────────────────────────────────────────────────────

export const QRScansCard: React.FC<{ analytics: DashboardAnalytics | null; loading: boolean }> = ({ analytics, loading }) => {
  const todayScans     = analytics?.today.qrScans     ?? 0;
  const yesterdayScans = analytics?.yesterday.qrScans ?? 0;
  const delta          = todayScans - yesterdayScans;

  return (
    <div className="bg-[#FFEAD8] rounded-2xl sm:rounded-3xl md:rounded-[2rem] p-3 sm:p-5 md:p-8 shadow-xs hover:shadow-md w-full h-[140px] sm:h-[180px] md:h-[250px] flex flex-col justify-between relative overflow-hidden transition-all border border-orange-200/40">
      <div className="relative z-10">
        <h3 className="text-slate-900 font-black text-[16px] sm:text-lg md:text-2xl tracking-tight leading-tight">QR Scans</h3>
        <p className="text-slate-800 text-[12px] font-black tracking-wide mt-0.5">Today</p>
      </div>

      <div className="mt-auto relative z-10">
        {loading ? (
          <Loader2 className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-slate-700 animate-spin mb-1 md:mb-3" />
        ) : (
          <span className="block text-slate-900 text-[32px] sm:text-[42px] md:text-[60px] font-black tracking-tight leading-none mb-1 md:mb-2">
            {formatCount(todayScans)}
          </span>
        )}
        <div className="bg-slate-900 text-[#FFEAD8] text-[11px] font-black px-2.5 py-0.5 sm:px-3.5 sm:py-1.5 md:px-4 md:py-2 rounded-full w-max shadow-xs truncate max-w-full">
          {delta >= 0 ? `+${formatCount(delta)}` : formatCount(delta)} vs yesterday
        </div>
      </div>

      {/* Subtle Glow Backdrop */}
      <div className="absolute -bottom-10 -right-10 w-28 h-28 sm:w-36 sm:h-36 md:w-48 md:h-48 bg-white/50 rounded-full blur-xl md:blur-2xl z-0 pointer-events-none" />

      {/* Low Opacity QR Code Watermark Pattern */}
      <div className="absolute -right-3 -bottom-3 sm:-right-4 sm:-bottom-4 opacity-[0.05] text-slate-900 pointer-events-none select-none z-0 rotate-[-12deg]">
        <QrCode className="w-32 h-32 sm:w-44 sm:h-44 md:w-52 md:h-52" strokeWidth={1.8} />
      </div>
    </div>
  );
};

// ─── Menu Illustration ─────────────────────────────────────────────────────────

export const MenuIllustration: React.FC = () => (
  <svg width="140" height="130" viewBox="0 0 140 130" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute right-0 bottom-2 sm:bottom-3 w-[100px] sm:w-[130px] md:w-[140px] h-auto">
    <rect x="25" y="20" width="60" height="80" rx="4" fill="#FAFAFA" stroke="#E2E8F0" strokeWidth="2"/>
    <rect x="35" y="35" width="40" height="4" rx="2" fill="#E2E8F0"/>
    <rect x="35" y="45" width="30" height="4" rx="2" fill="#E2E8F0"/>
    <rect x="40" y="35" width="60" height="80" rx="4" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2"/>
    <rect x="50" y="50" width="40" height="4" rx="2" fill="#CBD5E1"/>
    <rect x="50" y="60" width="35" height="4" rx="2" fill="#CBD5E1"/>
    <rect x="50" y="70" width="20" height="20" rx="2" fill="#F1F5F9"/>
    <rect x="65" y="55" width="55" height="75" rx="4" fill="#FFFFFF" stroke="#F77512" strokeWidth="2" filter="drop-shadow(0 4px 6px rgba(247,117,18,0.15))"/>
    <path d="M66 59 C66 57.3431 67.3431 56 69 56 H 117 C118.657 56 120 57.3431 120 59 V 70 H 66 V 59 Z" fill="#F77512" fillOpacity="0.15" />
    <rect x="75" y="78" width="35" height="4" rx="2" fill="#F77512" fillOpacity="0.4"/>
    <rect x="75" y="86" width="25" height="4" rx="2" fill="#F77512" fillOpacity="0.4"/>
    <rect x="75" y="100" width="35" height="16" rx="4" fill="#F77512"/>
    <rect x="85" y="106" width="15" height="4" rx="2" fill="#FFFFFF"/>
    <path d="M125 55 Q 140 50 135 75 Q 130 80 120 70" fill="#9A3412" />
    <circle cx="118" cy="65" r="10" fill="#FFEDD5"/>
    <path d="M108 65 Q 115 50 128 60 Q 120 50 110 55 Z" fill="#9A3412"/>
    <path d="M110 75 Q 118 72 126 75 L 132 110 L 104 110 Z" fill="#F77512"/>
    <rect x="111" y="110" width="4" height="15" fill="#FFEDD5"/>
    <rect x="121" y="110" width="4" height="15" fill="#FFEDD5"/>
    <path d="M118 82 L 100 88" stroke="#FFEDD5" strokeWidth="4" strokeLinecap="round"/>
  </svg>
);

// ─── Most Viewed Card ──────────────────────────────────────────────────────────

export const MostViewedCard: React.FC<{ analytics: DashboardAnalytics | null; loading: boolean }> = ({ analytics, loading }) => {
  const topItems = analytics?.topItems ?? [];

  return (
    <div className="bg-[#FFF5EE] rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] relative overflow-hidden shadow-xs hover:shadow-md w-full h-[180px] sm:h-[210px] md:h-[250px] flex transition-all border border-orange-100/90">
      {/* Left Content */}
      <div className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col justify-between z-10">
        <div>
          <h3 className="text-[#C84E00] font-black text-[20px] sm:text-xl md:text-2xl tracking-tight mb-2 sm:mb-4">Most Viewed</h3>
          {loading ? (
            <Loader2 className="w-5 h-5 text-[#F77512] animate-spin" />
          ) : topItems.length === 0 ? (
            <p className="text-slate-500 text-xs font-semibold">No data yet today</p>
          ) : (
            <ul className="space-y-1.5 sm:space-y-3 text-slate-800 text-[14px] sm:text-sm md:text-base font-black">
              {topItems.map((item) => (
                <li key={item.itemId} className="flex items-center gap-2">
                  <svg width="8" height="10" viewBox="0 0 8 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                    <path d="M0 1.42857C0 0.536965 0.96349 -0.0177724 1.73205 0.430485L7.02738 3.51866C7.79594 3.96691 7.79594 5.0807 7.02738 5.52896L1.73205 8.61713C0.963491 9.06539 0 8.51065 0 7.61904V1.42857Z" fill="#F77512"/>
                  </svg>
                  <span className="truncate max-w-[110px] sm:max-w-[140px]">{item.itemName}</span>
                  <span className="text-[#C84E00] text-[13px] sm:text-xs ml-auto shrink-0 font-black">{formatCount(item.views)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <Link
          href="/vendor/menu?tab=preview"
          className="bg-slate-900 hover:bg-black text-white text-xs font-extrabold tracking-wide px-4.5 py-2 sm:px-5 sm:py-2.5 rounded-full w-max mt-1.5 sm:mt-2 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 inline-block"
        >
          View Menu
        </Link>
      </div>

      {/* Right Illustration */}
      <div className="w-[100px] sm:w-[140px] md:w-[160px] relative">
        <MenuIllustration />
      </div>
    </div>
  );
};

// ─── Stats Cards Container ─────────────────────────────────────────────────────

export const StatsCards: React.FC = () => {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardAnalyticsAction()
      .then(setAnalytics)
      .catch(() => setAnalytics(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full max-w-[1200px] mt-1.5 sm:mt-4 md:mt-8 grid grid-cols-2 md:grid-cols-12 gap-3 sm:gap-4 md:gap-6">
      {/* 1. Menu Items Card (1 col on mobile, 5 cols on md) */}
      <div className="col-span-1 md:col-span-6 lg:col-span-5 order-1">
        <MenuItemsCard />
      </div>

      {/* 2. QR Scans Card (1 col on mobile side-by-side with Menu Items, 5 cols on md) */}
      <div className="col-span-1 md:col-span-6 lg:col-span-5 order-2 md:order-3">
        <QRScansCard analytics={analytics} loading={loading} />
      </div>

      {/* 3. Menu Views Card (2 cols full width on mobile, 7 cols on md) */}
      <div className="col-span-2 md:col-span-6 lg:col-span-7 order-3 md:order-2">
        <MenuViewsCard analytics={analytics} loading={loading} />
      </div>

      {/* 4. Most Viewed Card (2 cols full width on mobile, 7 cols on md) */}
      <div className="col-span-2 md:col-span-6 lg:col-span-7 order-4">
        <MostViewedCard analytics={analytics} loading={loading} />
      </div>
    </div>
  );
};

export default StatsCards;
