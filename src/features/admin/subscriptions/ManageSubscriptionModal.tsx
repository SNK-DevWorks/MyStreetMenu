'use client';

import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { SubscriptionItem } from './SubscriptionTable';

export interface ManageSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: SubscriptionItem | null;
  onSave: (updatedSubscription: SubscriptionItem) => void;
}

export function ManageSubscriptionModal({
  isOpen,
  onClose,
  subscription,
  onSave,
}: ManageSubscriptionModalProps) {
  const [currentPlan, setCurrentPlan] = useState('Free');
  const [status, setStatus] = useState('Active');
  const [startDate, setStartDate] = useState('12 Jul 2026');
  const [expiryDate, setExpiryDate] = useState('12 Aug 2026');

  useEffect(() => {
    if (subscription) {
      setCurrentPlan(subscription.currentPlan || 'Free');
      setStatus(subscription.status || 'Active');
      setStartDate(subscription.startDate || '12 Jul 2026');
      setExpiryDate(subscription.expiryDate || '12 Aug 2026');
    }
  }, [subscription]);

  if (!isOpen || !subscription) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...subscription,
      currentPlan,
      status,
      startDate,
      expiryDate,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-[#fdf8f3]">
          <div className="flex items-center gap-3">
            <span className="text-2xl leading-none select-none">{subscription.logoEmoji}</span>
            <div>
              <h2 className="text-base font-bold text-[#1f114a]">{subscription.shopName}</h2>
              <p className="text-xs text-gray-500 font-medium">Manage Subscription</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Divider */}
        <div className="border-b border-gray-100" />

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Current Plan Dropdown */}
          <div className="space-y-1.5">
            <label className="font-semibold text-gray-700 block">Current Plan</label>
            <select
              value={currentPlan}
              onChange={(e) => setCurrentPlan(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-900 focus:outline-none focus:border-purple-600 focus:bg-white cursor-pointer"
            >
              <option value="Free">Free</option>
              <option value="Basic">Basic</option>
              <option value="Premium">Premium</option>
            </select>
          </div>

          {/* Subscription Status */}
          <div className="space-y-1.5">
            <label className="font-semibold text-gray-700 block">Subscription Status</label>
            <div className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
              <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-emerald-700">
                <input
                  type="radio"
                  name="subStatus"
                  value="Active"
                  checked={status === 'Active'}
                  onChange={() => setStatus('Active')}
                  className="accent-emerald-600 w-4 h-4"
                />
                <span>🟢 Active</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-red-700">
                <input
                  type="radio"
                  name="subStatus"
                  value="Expired"
                  checked={status === 'Expired'}
                  onChange={() => setStatus('Expired')}
                  className="accent-red-600 w-4 h-4"
                />
                <span>🔴 Expired</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-gray-600">
                <input
                  type="radio"
                  name="subStatus"
                  value="Cancelled"
                  checked={status === 'Cancelled'}
                  onChange={() => setStatus('Cancelled')}
                  className="accent-gray-600 w-4 h-4"
                />
                <span>Cancelled</span>
              </label>
            </div>
          </div>

          {/* Start Date & Expiry Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-gray-700 block">Start Date</label>
              <input
                type="text"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 focus:outline-none focus:border-purple-600 focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-gray-700 block">Expiry Date</label>
              <input
                type="text"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 focus:outline-none focus:border-purple-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="pt-2 border-t border-gray-100" />

          {/* Save Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <Check className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default ManageSubscriptionModal;
