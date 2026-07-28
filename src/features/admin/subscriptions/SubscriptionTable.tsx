'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical, Settings, RefreshCw, XCircle } from 'lucide-react';

export interface SubscriptionItem {
  id: string;
  shopName: string;
  logoEmoji: string;
  currentPlan: 'Free' | 'Basic' | 'Premium' | string;
  status: 'Active' | 'Expired' | 'Cancelled' | string;
  startDate: string;
  expiryDate: string;
}

const defaultSubscriptions: SubscriptionItem[] = [
  {
    id: '1',
    shopName: 'Burger Corner',
    logoEmoji: '🍔',
    currentPlan: 'Free',
    status: 'Active',
    startDate: '01 Jan 2026',
    expiryDate: '—',
  },
  {
    id: '2',
    shopName: 'Tea Time',
    logoEmoji: '☕',
    currentPlan: 'Basic',
    status: 'Active',
    startDate: '20 Jul 2026',
    expiryDate: '20 Aug 2026',
  },
  {
    id: '3',
    shopName: 'Momo Point',
    logoEmoji: '🥟',
    currentPlan: 'Premium',
    status: 'Expired',
    startDate: '10 Jun 2026',
    expiryDate: '10 Jul 2026',
  },
];

interface SubscriptionTableProps {
  subscriptions?: SubscriptionItem[];
  onAction?: (action: string, item: SubscriptionItem) => void;
}

export function SubscriptionTable({
  subscriptions = defaultSubscriptions,
  onAction,
}: SubscriptionTableProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleActionClick = (actionName: string, item: SubscriptionItem) => {
    setActiveMenuId(null);
    if (onAction) {
      onAction(actionName, item);
    }
  };

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl shadow-xs">
      <table className="w-full text-left text-xs text-gray-700">
        <thead className="bg-gray-50/80 text-gray-400 font-semibold border-b border-gray-200/80 uppercase text-[11px] tracking-wider">
          <tr>
            <th className="py-3 px-4">Shop Name</th>
            <th className="py-3 px-4">Current Plan</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Start Date</th>
            <th className="py-3 px-4">Expiry Date</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 font-medium">
          {subscriptions.map((sub) => (
            <tr key={sub.id} className="hover:bg-gray-50/60 transition-colors">
              {/* Shop Name */}
              <td className="py-3.5 px-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg leading-none select-none">{sub.logoEmoji}</span>
                  <span className="font-bold text-[#1f114a] text-xs">{sub.shopName}</span>
                </div>
              </td>

              {/* Current Plan */}
              <td className="py-3.5 px-4">
                <span className="font-semibold text-purple-700 bg-purple-50 border border-purple-100 px-2.5 py-0.5 rounded-lg text-[11px]">
                  {sub.currentPlan}
                </span>
              </td>

              {/* Status */}
              <td className="py-3.5 px-4">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    sub.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : sub.status === 'Expired'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      sub.status === 'Active'
                        ? 'bg-emerald-500'
                        : sub.status === 'Expired'
                        ? 'bg-red-500'
                        : 'bg-gray-400'
                    }`}
                  />
                  {sub.status}
                </span>
              </td>

              {/* Start Date */}
              <td className="py-3.5 px-4 text-gray-500">{sub.startDate}</td>

              {/* Expiry Date */}
              <td className="py-3.5 px-4 text-gray-500">{sub.expiryDate}</td>

              {/* Actions */}
              <td className="py-3.5 px-4 text-right">
                <div className="inline-flex items-center gap-2">
                  <button
                    onClick={() => handleActionClick('Manage Plan', sub)}
                    className="px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold border border-purple-200 rounded-lg text-xs transition-colors"
                  >
                    Manage
                  </button>

                  <div className="relative">
                    <button
                      onClick={() =>
                        setActiveMenuId(activeMenuId === sub.id ? null : sub.id)
                      }
                      className={`p-1.5 rounded-lg transition-colors ${
                        activeMenuId === sub.id
                          ? 'bg-purple-100 text-purple-700'
                          : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                      title="More Options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Dropdown Menu */}
                    {activeMenuId === sub.id && (
                      <div
                        ref={menuRef}
                        className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-50 text-left"
                      >
                        <button
                          onClick={() => handleActionClick('Renew Plan', sub)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Renew Plan</span>
                        </button>

                        <button
                          onClick={() => handleActionClick('Cancel Plan', sub)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancel Plan</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SubscriptionTable;
