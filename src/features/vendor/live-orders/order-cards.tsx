'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Utensils, Printer, CheckCircle2, FileText, ChefHat, Flame } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type OrderStatus = 'new' | 'preparing' | 'ready';

export interface OrderItem {
  name: string;
  qty: number;
  image?: string;
}

export interface Order {
  id: string;
  token: string;
  tableNo: string;
  placedAt: Date;
  preparingAt?: Date;
  readyAt?: Date;
  items: OrderItem[];
  notes?: string;
  total: number;
  status: OrderStatus;
  collected?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatTableNo(tableNo: string): string {
  if (!tableNo) return '—';
  const cleaned = tableNo.replace(/^table\s+/i, '').trim();
  return cleaned || tableNo;
}

export function getElapsedMinutes(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / 60000);
}

function elapsedUrgency(mins: number) {
  if (mins < 5) {
    return {
      bar: 'bg-green-500',
      badgeBg: 'bg-white text-green-600 border-green-500/70',
      statusText: 'WAITING',
    };
  }
  if (mins < 10) {
    return {
      bar: 'bg-yellow-500',
      badgeBg: 'bg-white text-yellow-600 border-yellow-500/70',
      statusText: 'WAITING',
    };
  }
  if (mins < 15) {
    return {
      bar: 'bg-orange-500',
      badgeBg: 'bg-white text-orange-600 border-orange-500/70',
      statusText: 'WAITING',
    };
  }
  return {
    bar: 'bg-red-500',
    badgeBg: 'bg-white text-red-500 border-red-500/70',
    statusText: 'WAITING',
  };
}

/**
 * Resilient Order Item Thumbnail for vendor live orders cards:
 * - Renders item image if available
 * - Handles onError gracefully so broken image icons are never shown
 * - Falls back to clean food initials / icon
 */
export const OrderItemThumbnail: React.FC<{ image?: string; name: string; size?: 'sm' | 'md' }> = ({
  image,
  name,
  size = 'md',
}) => {
  const [imgError, setImgError] = useState(false);

  const containerClass =
    size === 'sm'
      ? 'w-7 h-7 rounded-lg'
      : 'w-7 h-7 sm:w-9 sm:h-9 rounded-xl';

  if (image && !imgError) {
    return (
      <div className={`${containerClass} border border-orange-100 bg-orange-50/80 text-[#f77512] mr-2 sm:mr-2.5 flex-shrink-0 flex items-center justify-center overflow-hidden`}>
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  const initials = (name || '').trim().slice(0, 2).toUpperCase();

  return (
    <div className={`${containerClass} border border-orange-100 bg-orange-50/90 text-[#f77512] mr-2 sm:mr-2.5 flex-shrink-0 flex items-center justify-center font-black text-[10px] sm:text-xs select-none shadow-2xs`}>
      {initials || <Utensils className="w-3.5 h-3.5" />}
    </div>
  );
};


// ─── New Order Card ───────────────────────────────────────────────────────────

interface NewOrderCardProps {
  order: Order;
  mode?: 'simple' | 'kitchen';
  onStartPreparing?: (id: string) => void;
  onMarkReady?: (id: string) => void;
}

export const NewOrderCard: React.FC<NewOrderCardProps> = ({
  order,
  mode = 'kitchen',
  onStartPreparing,
  onMarkReady,
}) => {
  const [elapsed, setElapsed] = useState(getElapsedMinutes(order.placedAt));
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    const iv = setInterval(() => setElapsed(getElapsedMinutes(order.placedAt)), 15000);
    return () => clearInterval(iv);
  }, [order.placedAt]);

  const urgency = elapsedUrgency(elapsed);

  const handlePrint = () => {
    window.print();
  };

  const handleAction = () => {
    setMarking(true);
    if (mode === 'simple') {
      setTimeout(() => onMarkReady?.(order.id), 350);
    } else {
      setTimeout(() => onStartPreparing?.(order.id), 350);
    }
  };

  return (
    <div className="relative bg-[#F9FAFB] rounded-2xl shadow-md border-2 border-gray-200/90 w-full flex flex-col hover:shadow-lg transition-shadow min-h-0 md:min-h-[340px] justify-between">
      <div className="p-3.5 sm:p-5 flex flex-col flex-1 justify-between">
        <div>
          {/* Header: Elapsed, Token, Table */}
          <div className="flex items-center justify-between gap-1.5 sm:gap-2 mb-3 sm:mb-4">
            {/* Urgency Pill */}
            <div className={`rounded-xl px-2.5 py-1 sm:px-3 sm:py-1.5 flex flex-col items-center justify-center border min-w-[65px] sm:min-w-[85px] ${urgency.badgeBg}`}>
              <div className="flex items-baseline font-black text-lg sm:text-2xl tracking-tight leading-none">
                <span>{elapsed}</span>
                <span className="ml-0.5 text-[10px] sm:text-xs font-semibold">min</span>
              </div>
              <span className="text-[8.5px] sm:text-[10px] font-bold uppercase tracking-wider mt-0.5 sm:mt-1">
                {urgency.statusText}
              </span>
            </div>

            {/* Token Number */}
            <div className="flex flex-col items-center">
              <span className="text-gray-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-0.5">TOKEN</span>
              <span className="text-[24px] sm:text-[34px] leading-none font-black text-[#1B2533]">{order.token}</span>
            </div>

            {/* Table / Order Type */}
            <div className="bg-white text-purple-700 border border-purple-400/80 rounded-xl px-2.5 py-1 sm:px-3 sm:py-1.5 flex flex-col items-center justify-center min-w-[65px] sm:min-w-[85px]">
              <span className="text-purple-600 text-[8.5px] sm:text-[10px] font-bold uppercase tracking-widest mb-0.5">TABLE</span>
              <span className="text-lg sm:text-2xl font-black leading-none">{formatTableNo(order.tableNo)}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-gray-200 mb-2.5 sm:mb-3" />

          {/* Time & Total Qty Row */}
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center text-gray-500 text-xs font-semibold" suppressHydrationWarning>
              <Clock className="w-3.5 h-3.5 mr-1 text-gray-400" />
              <span suppressHydrationWarning>{formatTime(order.placedAt)}</span>
            </div>
            <div className="flex items-center bg-white text-black border border-black font-extrabold text-[11px] sm:text-xs px-2.5 py-0.5 rounded-lg">
              <span>Qty: {order.items.reduce((sum, item) => sum + item.qty, 0)}</span>
            </div>
          </div>

          {/* Ordered Items List */}
          <div className="space-y-2 sm:space-y-2.5 mb-3 sm:mb-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between group">
                <div className="flex items-center flex-1 min-w-0 pr-2">
                  <OrderItemThumbnail image={item.image} name={item.name} size="md" />
                  <span className="text-[#1B2533] font-bold text-xs sm:text-sm truncate">{item.name}</span>
                </div>
                <div className="text-[#1B2533] font-bold text-sm sm:text-base ml-2 shrink-0">
                  × {item.qty}
                </div>
              </div>
            ))}
          </div>

          {/* Special Instructions / Notes */}
          {order.notes && (
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-2.5 sm:p-3 flex items-start mb-3 sm:mb-4 text-xs">
              <FileText className="w-4 h-4 text-blue-500 mr-2 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-blue-700 mr-1">Notes:</span>
                <span className="text-gray-700 font-medium">{order.notes}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer (Total & Actions - Pinned to bottom) */}
        <div className="border-t border-gray-200/80 pt-2.5 sm:pt-3 mt-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex flex-col">
            <span className="text-gray-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">TOTAL</span>
            <span className="text-lg sm:text-2xl font-black text-[#1B2533]">₹{order.total}</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center px-3 py-1.5 sm:px-3.5 sm:py-2 border border-gray-200 bg-white rounded-xl text-[#1B2533] font-bold text-xs hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 mr-1" />
              Print
            </button>
            {mode === 'simple' ? (
              <button
                onClick={handleAction}
                disabled={marking}
                className="flex items-center justify-center px-4 py-1.5 sm:px-5 sm:py-2 bg-[#1EA34B] hover:bg-[#168a3d] text-white rounded-xl font-bold text-xs transition-colors shadow-xs disabled:opacity-60 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 mr-1" />
                {marking ? 'Ready…' : 'Ready'}
              </button>
            ) : (
              <button
                onClick={handleAction}
                disabled={marking}
                className="flex items-center justify-center px-4 py-1.5 sm:px-5 sm:py-2 bg-[#f77512] hover:bg-[#e0670d] text-white rounded-xl font-bold text-xs transition-colors shadow-xs disabled:opacity-60 cursor-pointer"
              >
                <ChefHat className="w-4 h-4 mr-1" />
                {marking ? 'Preparing…' : 'Preparing'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Preparing Order Card ──────────────────────────────────────────────────────

interface PreparingOrderCardProps {
  order: Order;
  onMarkReady: (id: string) => void;
}

export const PreparingOrderCard: React.FC<PreparingOrderCardProps> = ({ order, onMarkReady }) => {
  const [elapsed, setElapsed] = useState(getElapsedMinutes(order.preparingAt || order.placedAt));
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    const iv = setInterval(() => setElapsed(getElapsedMinutes(order.preparingAt || order.placedAt)), 15000);
    return () => clearInterval(iv);
  }, [order.preparingAt, order.placedAt]);

  const handlePrint = () => {
    window.print();
  };

  const handleReady = () => {
    setMarking(true);
    setTimeout(() => onMarkReady(order.id), 350);
  };

  return (
    <div className="relative bg-[#F9FAFB] rounded-2xl shadow-md border-2 border-orange-200/90 w-full flex flex-col hover:shadow-lg transition-shadow min-h-0 md:min-h-[340px] justify-between">
      <div className="p-3.5 sm:p-5 flex flex-col flex-1 justify-between">
        <div>
          {/* Header: Elapsed, Token, Table */}
          <div className="flex items-center justify-between gap-1.5 sm:gap-2 mb-3 sm:mb-4">
            {/* Status Pill */}
            <div className="bg-orange-50 text-orange-600 border border-orange-300 rounded-xl px-2.5 py-1 sm:px-3 sm:py-1.5 flex flex-col items-center justify-center min-w-[65px] sm:min-w-[85px]">
              <div className="flex items-baseline font-black text-lg sm:text-2xl tracking-tight leading-none">
                <span>{elapsed}</span>
                <span className="ml-0.5 text-[10px] sm:text-xs font-semibold">min</span>
              </div>
              <span className="text-[8.5px] sm:text-[10px] font-bold uppercase tracking-wider mt-0.5 sm:mt-1 flex items-center gap-0.5">
                <ChefHat className="w-3 h-3" />
                PREPARING
              </span>
            </div>

            {/* Token Number */}
            <div className="flex flex-col items-center">
              <span className="text-gray-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-0.5">TOKEN</span>
              <span className="text-[24px] sm:text-[34px] leading-none font-black text-[#1B2533]">{order.token}</span>
            </div>

            {/* Table / Order Type */}
            <div className="bg-white text-purple-700 border border-purple-400/80 rounded-xl px-2.5 py-1 sm:px-3 sm:py-1.5 flex flex-col items-center justify-center min-w-[65px] sm:min-w-[85px]">
              <span className="text-purple-600 text-[8.5px] sm:text-[10px] font-bold uppercase tracking-widest mb-0.5">TABLE</span>
              <span className="text-lg sm:text-2xl font-black leading-none">{formatTableNo(order.tableNo)}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-gray-200 mb-2.5 sm:mb-3" />

          {/* Time & Total Qty Row */}
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center text-gray-500 text-xs font-semibold" suppressHydrationWarning>
              <Clock className="w-3.5 h-3.5 mr-1 text-gray-400" />
              <span suppressHydrationWarning>{formatTime(order.placedAt)}</span>
            </div>
            <div className="flex items-center bg-white text-black border border-black font-extrabold text-[11px] sm:text-xs px-2.5 py-0.5 rounded-lg">
              <span>Qty: {order.items.reduce((sum, item) => sum + item.qty, 0)}</span>
            </div>
          </div>

          {/* Ordered Items List */}
          <div className="space-y-2 sm:space-y-2.5 mb-3 sm:mb-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between group">
                <div className="flex items-center flex-1 min-w-0 pr-2">
                  <OrderItemThumbnail image={item.image} name={item.name} size="md" />
                  <span className="text-[#1B2533] font-bold text-xs sm:text-sm truncate">{item.name}</span>
                </div>
                <div className="text-[#1B2533] font-bold text-sm sm:text-base ml-2 shrink-0">
                  × {item.qty}
                </div>
              </div>
            ))}
          </div>

          {/* Special Instructions / Notes */}
          {order.notes && (
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-2.5 sm:p-3 flex items-start mb-3 sm:mb-4 text-xs">
              <FileText className="w-4 h-4 text-blue-500 mr-2 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-blue-700 mr-1">Notes:</span>
                <span className="text-gray-700 font-medium">{order.notes}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer (Total & Actions) */}
        <div className="border-t border-gray-200/80 pt-2.5 sm:pt-3 mt-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex flex-col">
            <span className="text-gray-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">TOTAL</span>
            <span className="text-lg sm:text-2xl font-black text-[#1B2533]">₹{order.total}</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center px-3 py-1.5 sm:px-3.5 sm:py-2 border border-gray-200 bg-white rounded-xl text-[#1B2533] font-bold text-xs hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 mr-1" />
              Print
            </button>
            <button
              onClick={handleReady}
              disabled={marking}
              className="flex items-center justify-center px-4 py-1.5 sm:px-5 sm:py-2 bg-[#1EA34B] hover:bg-[#168a3d] text-white rounded-xl font-bold text-xs transition-colors shadow-xs disabled:opacity-60 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 mr-1" />
              {marking ? 'Ready…' : 'Ready'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Ready Order Card ─────────────────────────────────────────────────────────

interface ReadyOrderCardProps {
  order: Order;
  onComplete: (id: string) => void;
  onCollected: (id: string) => void;
}

export const ReadyOrderCard: React.FC<ReadyOrderCardProps> = ({ order, onComplete, onCollected }) => {
  const [completing, setCompleting] = useState(false);
  const readyMinsAgo = order.readyAt
    ? Math.floor((Date.now() - order.readyAt.getTime()) / 60000)
    : 0;

  const handleComplete = () => {
    setCompleting(true);
    setTimeout(() => onComplete(order.id), 350);
  };

  return (
    <div className="relative bg-[#F9FAFB] rounded-2xl shadow-md border-2 border-gray-200/90 w-full flex flex-col hover:shadow-lg transition-shadow min-h-0 md:min-h-[340px] justify-between">
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="bg-white text-green-600 border border-green-500/70 rounded-xl px-2 py-1 flex flex-col items-center justify-center min-w-[65px] sm:min-w-[72px]">
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider leading-none">READY</span>
              <span className="text-[8.5px] sm:text-[9.5px] font-bold text-green-700 mt-1 leading-none whitespace-nowrap">
                {readyMinsAgo === 0 ? 'just now' : `${readyMinsAgo} min ago`}
              </span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-gray-400 text-[9px] font-bold uppercase tracking-widest mb-0.5">TOKEN</span>
              <span className="text-[22px] sm:text-[26px] leading-none font-black text-[#1B2533]">{order.token}</span>
            </div>

            <div className="bg-white text-purple-700 border border-purple-400/80 rounded-xl px-2.5 py-1 flex flex-col items-center justify-center min-w-[60px] sm:min-w-[65px]">
              <span className="text-purple-600 text-[8.5px] font-bold uppercase tracking-widest mb-0.5">TABLE</span>
              <span className="text-lg sm:text-xl font-black leading-none">{formatTableNo(order.tableNo)}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-gray-200 mb-2.5" />

          {/* Time & Total Qty Row */}
          <div className="flex items-center justify-between mb-3 text-xs">
            <div className="flex items-center text-gray-500 text-[11px] font-medium" suppressHydrationWarning>
              <Clock className="w-3 h-3 mr-1 text-gray-400" />
              <span suppressHydrationWarning>{formatTime(order.placedAt)}</span>
            </div>
            <div className="flex items-center bg-white text-black border border-black font-extrabold text-[10.5px] px-2 py-0.5 rounded-lg">
              <span>Qty: {order.items.reduce((sum, item) => sum + item.qty, 0)}</span>
            </div>
          </div>

          {/* Ordered Items List */}
          <div className="space-y-2 mb-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between group">
                <div className="flex items-center flex-1 min-w-0 pr-2">
                  <OrderItemThumbnail image={item.image} name={item.name} size="sm" />
                  <span className="text-[#1B2533] font-semibold text-xs truncate">{item.name}</span>
                </div>
                <span className="text-[#1B2533] font-bold text-xs shrink-0 ml-1">× {item.qty}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer (Pinned to bottom) */}
        <div className="border-t border-gray-100 pt-2.5 mt-auto flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-gray-400 text-[9px] font-bold uppercase tracking-wider">TOTAL</span>
            <span className="text-base sm:text-lg font-black text-[#1B2533]">₹{order.total}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onCollected(order.id)}
              className={`text-[10px] sm:text-[10.5px] font-bold px-2.5 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                order.collected
                  ? 'bg-green-100 text-green-700 border-green-300'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {order.collected ? 'Collected ✓' : 'Collected'}
            </button>
            <button
              onClick={handleComplete}
              disabled={completing}
              className="text-[10px] sm:text-[10.5px] font-black px-3 py-1.5 rounded-xl bg-[#1B2533] hover:bg-[#2B384A] text-white transition-colors disabled:opacity-60 cursor-pointer flex items-center"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              {completing ? '…' : 'Done'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────

export const EmptyState: React.FC<{ tab: 'new' | 'preparing' | 'ready' }> = ({ tab }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
    <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
      {tab === 'new' ? (
        <Utensils className="w-6 h-6 text-gray-400" />
      ) : tab === 'preparing' ? (
        <ChefHat className="w-6 h-6 text-orange-400" />
      ) : (
        <CheckCircle2 className="w-6 h-6 text-green-500" />
      )}
    </div>
    <p className="text-[14px] font-black text-gray-400">
      {tab === 'new' ? 'No new orders' : tab === 'preparing' ? 'No preparing orders' : 'No ready orders'}
    </p>
    <p className="text-[12px] text-gray-400 font-semibold">
      {tab === 'new'
        ? 'New orders will appear here automatically.'
        : tab === 'preparing'
        ? 'Click "Preparing" on a new order to start.'
        : 'Mark orders as Ready to see them here.'}
    </p>
  </div>
);

// ─── Timer Legend ─────────────────────────────────────────────────────────────

export const TimerLegend: React.FC = () => {
  const items = [
    { label: '0–5 min',   cls: 'bg-green-50  border-green-200  text-green-700'  },
    { label: '5–10 min',  cls: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
    { label: '10–15 min', cls: 'bg-orange-50 border-orange-200 text-orange-700' },
    { label: '15+ min',   cls: 'bg-red-50    border-red-200    text-red-700'    },
  ];
  const dots = ['🟢', '🟡', '🟠', '🔴'];
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, i) => (
        <span key={i} className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${item.cls}`}>
          {dots[i]} {item.label}
        </span>
      ))}
    </div>
  );
};
