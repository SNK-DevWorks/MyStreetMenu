'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
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
    <div className="bg-[#FAE5FD] rounded-[2rem] p-6 flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow-md w-full h-[250px] transition-all">
      <h3 className="text-[#C500D4] font-black text-lg sm:text-xl tracking-wide">Menu Items</h3>

      <div className="relative flex items-center justify-center">
        <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r={radius} stroke="#E812F7" strokeOpacity="0.2" strokeWidth="11" fill="transparent" />
          <circle
            cx="80" cy="80" r={radius}
            stroke="#E812F7" strokeWidth="11" fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {isLoading ? (
          <Loader2 className="absolute w-8 h-8 text-[#B000BE] animate-spin" />
        ) : (
          <span className="absolute text-[44px] sm:text-[50px] font-black text-[#B000BE] tracking-tight">{total}</span>
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
    <div className="bg-[#FFEAD8] rounded-[2.5rem] relative overflow-hidden shadow-sm hover:shadow-md w-full h-[250px] flex transition-all">
      {/* Left Content — Centered vertically */}
      <div className="flex-1 p-6 sm:p-7 flex flex-col justify-center z-10 h-full">
        <h3 className="text-[#E05A00] font-black text-xl sm:text-2xl tracking-tight mb-3">Menu Views</h3>
        <ul className="space-y-2.5 text-slate-800 text-sm sm:text-base font-extrabold">
          {(['Today', 'Yesterday', 'This Month'] as const).map((period) => (
            <li
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`flex items-center gap-3 cursor-pointer py-1 transition-colors ${
                selectedPeriod === period ? 'text-slate-900 font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full transition-all shrink-0 flex items-center justify-center ${
                selectedPeriod === period
                  ? 'bg-[#F77512] shadow-[0_0_16px_rgba(247,117,18,0.6)] scale-105'
                  : 'bg-slate-300/90 hover:bg-slate-400'
              }`}>
                {selectedPeriod === period && <span className="w-3.5 h-3.5 rounded-full bg-white" />}
              </span>
              {period}
            </li>
          ))}
        </ul>
        <div className="mt-2">
          <DeltaBadge today={todayViews} yesterday={yesterdayViews} />
        </div>
      </div>

      {/* Right Orange Curved Section */}
      <div className="absolute right-0 top-0 bottom-0 w-[48%] sm:w-[52%] md:w-[55%] bg-[#F77512] rounded-l-[70px] sm:rounded-l-[80px] flex flex-col items-center justify-center">
        <div className="text-center mt-1">
          {loading ? (
            <Loader2 className="text-white w-10 h-10 animate-spin mx-auto mb-1" />
          ) : (
            <span className="block text-white text-[36px] sm:text-[44px] font-black tracking-tight mb-0.5 transition-all">
              {formatCount(displayed)}
            </span>
          )}
          <span className="text-white/95 text-xs sm:text-sm font-extrabold tracking-wide">
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
    <div className="bg-[#FFF460] rounded-[2rem] p-6 sm:p-8 shadow-sm hover:shadow-md w-full h-[250px] flex flex-col justify-between relative overflow-hidden transition-all">
      <div className="relative z-10">
        <h3 className="text-slate-900 font-black text-xl sm:text-2xl tracking-tight mb-1">QR Scans</h3>
        <p className="text-slate-800 text-xs sm:text-sm font-extrabold tracking-wide">Today</p>
      </div>

      <div className="mt-auto relative z-10">
        {loading ? (
          <Loader2 className="w-8 h-8 text-slate-700 animate-spin mb-3" />
        ) : (
          <span className="block text-slate-900 text-[52px] sm:text-[60px] font-black tracking-tight leading-none mb-3">
            {formatCount(todayScans)}
          </span>
        )}
        <div className="bg-slate-900 text-[#FFF460] text-xs font-black px-4 py-2 rounded-full w-max shadow-sm">
          {delta >= 0 ? `+${formatCount(delta)}` : formatCount(delta)} vs yesterday
        </div>
      </div>

      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/50 rounded-full blur-2xl z-0 pointer-events-none" />
    </div>
  );
};

// ─── Menu Illustration ─────────────────────────────────────────────────────────

export const MenuIllustration: React.FC = () => (
  <svg width="140" height="130" viewBox="0 0 140 130" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute right-0 bottom-3">
    <rect x="25" y="20" width="60" height="80" rx="4" fill="#FAFAFA" stroke="#E2E8F0" strokeWidth="2"/>
    <rect x="35" y="35" width="40" height="4" rx="2" fill="#E2E8F0"/>
    <rect x="35" y="45" width="30" height="4" rx="2" fill="#E2E8F0"/>
    <rect x="40" y="35" width="60" height="80" rx="4" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2"/>
    <rect x="50" y="50" width="40" height="4" rx="2" fill="#CBD5E1"/>
    <rect x="50" y="60" width="35" height="4" rx="2" fill="#CBD5E1"/>
    <rect x="50" y="70" width="20" height="20" rx="2" fill="#F1F5F9"/>
    <rect x="65" y="55" width="55" height="75" rx="4" fill="#FFFFFF" stroke="#12F7E8" strokeWidth="2" filter="drop-shadow(0 4px 6px rgba(18,247,232,0.15))"/>
    <path d="M66 59 C66 57.3431 67.3431 56 69 56 H 117 C118.657 56 120 57.3431 120 59 V 70 H 66 V 59 Z" fill="#12F7E8" fillOpacity="0.15" />
    <rect x="75" y="78" width="35" height="4" rx="2" fill="#12F7E8" fillOpacity="0.4"/>
    <rect x="75" y="86" width="25" height="4" rx="2" fill="#12F7E8" fillOpacity="0.4"/>
    <rect x="75" y="100" width="35" height="16" rx="4" fill="#12F7E8"/>
    <rect x="85" y="106" width="15" height="4" rx="2" fill="#FFFFFF"/>
    <path d="M125 55 Q 140 50 135 75 Q 130 80 120 70" fill="#0F766E" />
    <circle cx="118" cy="65" r="10" fill="#FFEDD5"/>
    <path d="M108 65 Q 115 50 128 60 Q 120 50 110 55 Z" fill="#0F766E"/>
    <path d="M110 75 Q 118 72 126 75 L 132 110 L 104 110 Z" fill="#12F7E8"/>
    <rect x="111" y="110" width="4" height="15" fill="#FFEDD5"/>
    <rect x="121" y="110" width="4" height="15" fill="#FFEDD5"/>
    <path d="M118 82 L 100 88" stroke="#FFEDD5" strokeWidth="4" strokeLinecap="round"/>
  </svg>
);

// ─── Most Viewed Card ──────────────────────────────────────────────────────────

export const MostViewedCard: React.FC<{ analytics: DashboardAnalytics | null; loading: boolean }> = ({ analytics, loading }) => {
  const topItems = analytics?.topItems ?? [];

  return (
    <div className="bg-[#D1FAF6] rounded-[2.5rem] relative overflow-hidden shadow-sm hover:shadow-md w-full h-[250px] flex transition-all">
      {/* Left Content */}
      <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between z-10">
        <div>
          <h3 className="text-[#087F75] font-black text-xl sm:text-2xl tracking-tight mb-3 sm:mb-4">Most Viewed</h3>
          {loading ? (
            <Loader2 className="w-6 h-6 text-[#087F75] animate-spin" />
          ) : topItems.length === 0 ? (
            <p className="text-slate-500 text-xs font-semibold">No data yet today</p>
          ) : (
            <ul className="space-y-2.5 sm:space-y-3 text-slate-800 text-sm sm:text-base font-extrabold">
              {topItems.map((item) => (
                <li key={item.itemId} className="flex items-center gap-2.5">
                  <svg width="10" height="12" viewBox="0 0 8 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 1.42857C0 0.536965 0.96349 -0.0177724 1.73205 0.430485L7.02738 3.51866C7.79594 3.96691 7.79594 5.0807 7.02738 5.52896L1.73205 8.61713C0.963491 9.06539 0 8.51065 0 7.61904V1.42857Z" fill="#087F75"/>
                  </svg>
                  <span className="truncate max-w-[140px]">{item.itemName}</span>
                  <span className="text-[#087F75] text-xs ml-auto shrink-0">{formatCount(item.views)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <Link
          href="/vendor/menu?tab=preview"
          className="bg-[#12F7E8] hover:bg-[#0BC5B8] transition-colors text-slate-900 text-xs font-black tracking-wide px-5 py-2.5 rounded-full w-max mt-2 shadow-sm inline-block"
        >
          View Menu
        </Link>
      </div>

      {/* Right Illustration */}
      <div className="w-[140px] sm:w-[160px] relative">
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
    <div className="w-full max-w-[1200px] mt-8 grid grid-cols-1 md:grid-cols-12 gap-6">
      <div className="md:col-span-6 lg:col-span-5">
        <MenuItemsCard />
      </div>

      <div className="md:col-span-6 lg:col-span-7">
        <MenuViewsCard analytics={analytics} loading={loading} />
      </div>

      <div className="md:col-span-6 lg:col-span-5">
        <QRScansCard analytics={analytics} loading={loading} />
      </div>

      <div className="md:col-span-6 lg:col-span-7">
        <MostViewedCard analytics={analytics} loading={loading} />
      </div>
    </div>
  );
};

export default StatsCards;
