'use client';

import React from 'react';
import { X, Phone, MessageSquare, MapPin, Calendar, Eye, QrCode, Clock, Edit, CheckCircle, Ban, Trash2 } from 'lucide-react';
import { Vendor } from './VendorTable';

export interface VendorDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: Vendor | null;
  onAction?: (actionName: string, vendor: Vendor) => void;
}

export function VendorDetailsDrawer({
  isOpen,
  onClose,
  vendor,
  onAction,
}: VendorDetailsDrawerProps) {
  if (!isOpen || !vendor) return null;

  // Extended mock data for vendor details drawer
  const details = {
    foodType: 'Fast Food & Snacks',
    whatsapp: vendor.phone,
    address: `${vendor.location}, Main Market Area`,
    joinedDate: vendor.joined || '12 Jul 2026',
    categories: 4,
    menuItems: 24,
    todaysSpecial: 'Double Cheese Special Burger',
    announcements: '10% discount on all orders over $20 today!',
    lastLogin: '2 hours ago',
    menuViews: '1,420',
    qrScans: '380',
    lastUpdated: 'Yesterday at 4:30 PM',
  };

  const handleAction = (actionName: string) => {
    if (onAction && vendor) {
      onAction(actionName, vendor);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-gray-200 shadow-2xl flex flex-col justify-between">
          {/* Drawer Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-[#fdf8f3]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 text-2xl flex items-center justify-center font-bold shadow-xs">
                {vendor.logoEmoji}
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#1f114a] leading-tight">{vendor.shopName}</h2>
                <p className="text-xs text-gray-500 font-medium">Owner: {vendor.owner}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-gray-700">
            {/* Shop Information Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Shop Information
              </h3>
              <div className="bg-gray-50 rounded-2xl p-4 space-y-2.5 border border-gray-100">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Food Type:</span>
                  <span className="font-semibold text-gray-900">{details.foodType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Phone:</span>
                  <span className="font-semibold text-gray-900 font-mono">{vendor.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">WhatsApp:</span>
                  <span className="font-semibold text-emerald-600 font-mono">{details.whatsapp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Address:</span>
                  <span className="font-semibold text-gray-900 text-right max-w-[200px] truncate">
                    {details.address}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Joined Date:</span>
                  <span className="font-semibold text-gray-900">{details.joinedDate}</span>
                </div>
              </div>
            </div>

            {/* Menu Summary Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Menu Summary
              </h3>
              <div className="bg-gray-50 rounded-2xl p-4 space-y-2.5 border border-gray-100">
                <div className="grid grid-cols-2 gap-2 pb-2 border-b border-gray-200/60">
                  <div className="bg-white p-2.5 rounded-xl border border-gray-200/60 text-center">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Categories</span>
                    <span className="text-lg font-black text-purple-700">{details.categories}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-gray-200/60 text-center">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Menu Items</span>
                    <span className="text-lg font-black text-purple-700">{details.menuItems}</span>
                  </div>
                </div>

                <div className="pt-1">
                  <span className="text-gray-500 font-medium block mb-1">Today&apos;s Special:</span>
                  <span className="font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100 block">
                    ⭐ {details.todaysSpecial}
                  </span>
                </div>

                <div>
                  <span className="text-gray-500 font-medium block mb-1">Announcements:</span>
                  <span className="font-medium text-gray-700 bg-white p-2.5 rounded-xl border border-gray-200/60 block">
                    📢 {details.announcements}
                  </span>
                </div>
              </div>
            </div>

            {/* Activity Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Activity & Performance
              </h3>
              <div className="bg-gray-50 rounded-2xl p-4 space-y-2.5 border border-gray-100">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Last Login:</span>
                  <span className="font-semibold text-gray-900">{details.lastLogin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Menu Views:</span>
                  <span className="font-bold text-purple-700">{details.menuViews}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">QR Scans:</span>
                  <span className="font-bold text-indigo-700">{details.qrScans}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Last Updated:</span>
                  <span className="font-semibold text-gray-900">{details.lastUpdated}</span>
                </div>
              </div>
            </div>

            {/* Admin Actions Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Admin Actions
              </h3>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => handleAction('Edit Vendor')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold border border-purple-200 transition-colors"
                >
                  <span>✏️</span>
                  <span>Edit Vendor</span>
                </button>

                {vendor.status === 'Active' ? (
                  <button
                    onClick={() => handleAction('Deactivate')}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold border border-amber-200 transition-colors"
                  >
                    <span>🔴</span>
                    <span>Deactivate Vendor</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleAction('Activate')}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold border border-emerald-200 transition-colors"
                  >
                    <span>🟢</span>
                    <span>Activate Vendor</span>
                  </button>
                )}

                <button
                  onClick={() => handleAction('Delete Vendor')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-semibold border border-red-200 transition-colors"
                >
                  <span>🗑</span>
                  <span>Delete Vendor</span>
                </button>
              </div>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-gray-100 bg-[#fdf8f3]">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold transition-colors"
            >
              Close Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VendorDetailsDrawer;
