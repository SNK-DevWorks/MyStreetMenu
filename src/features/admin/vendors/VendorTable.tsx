'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Eye, MoreVertical } from 'lucide-react';

export interface Vendor {
  id: string;
  logoEmoji: string;
  shopName: string;
  owner: string;
  phone: string;
  location: string;
  status: 'Active' | 'Inactive' | string;
  joined: string;
}

const defaultVendors: Vendor[] = [
  {
    id: '1',
    logoEmoji: '🍔',
    shopName: 'Burger Corner',
    owner: 'Rahul Das',
    phone: '+91 98765 43210',
    location: 'Kolkata',
    status: 'Active',
    joined: '12 Jul',
  },
  {
    id: '2',
    logoEmoji: '☕',
    shopName: 'Tea Time',
    owner: 'Anit Sharma',
    phone: '+91 98123 45678',
    location: 'Kolkata',
    status: 'Active',
    joined: '11 Jul',
  },
  {
    id: '3',
    logoEmoji: '🌯',
    shopName: 'Roll House',
    owner: 'Vikram Singh',
    phone: '+91 97890 12345',
    location: 'Mumbai',
    status: 'Inactive',
    joined: '10 Jul',
  },
  {
    id: '4',
    logoEmoji: '🍕',
    shopName: 'Pizza Hub',
    owner: 'Sneha Roy',
    phone: '+91 96543 21098',
    location: 'Delhi',
    status: 'Active',
    joined: '09 Jul',
  },
];

interface VendorTableProps {
  vendors?: Vendor[];
  onAction?: (action: string, vendor: Vendor) => void;
}

export function VendorTable({ vendors = defaultVendors, onAction }: VendorTableProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown when clicking outside
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

  const handleActionClick = (actionName: string, vendor: Vendor) => {
    setActiveMenuId(null);
    if (onAction) {
      onAction(actionName, vendor);
    }
  };

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl shadow-xs">
      <table className="w-full text-left text-xs text-gray-700">
        <thead className="bg-gray-50/80 text-gray-400 font-semibold border-b border-gray-200/80 uppercase text-[11px] tracking-wider">
          <tr>
            <th className="py-3 px-4">Shop</th>
            <th className="py-3 px-4">Owner</th>
            <th className="py-3 px-4">Phone</th>
            <th className="py-3 px-4">Location</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Joined</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 font-medium">
          {vendors.map((vendor) => (
            <tr key={vendor.id} className="hover:bg-gray-50/60 transition-colors">
              {/* Shop (Logo + Shop Name) */}
              <td className="py-3.5 px-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg leading-none select-none">{vendor.logoEmoji}</span>
                  <span className="font-bold text-[#1f114a] text-xs">{vendor.shopName}</span>
                </div>
              </td>

              {/* Owner */}
              <td className="py-3.5 px-4 text-gray-800">{vendor.owner}</td>

              {/* Phone */}
              <td className="py-3.5 px-4 text-gray-500 font-mono text-[11px]">{vendor.phone}</td>

              {/* Location */}
              <td className="py-3.5 px-4 text-gray-600">{vendor.location}</td>

              {/* Status */}
              <td className="py-3.5 px-4">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    vendor.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      vendor.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-400'
                    }`}
                  />
                  {vendor.status}
                </span>
              </td>

              {/* Joined */}
              <td className="py-3.5 px-4 text-gray-500">{vendor.joined}</td>

              {/* Actions */}
              <td className="py-3.5 px-4 text-right">
                <div className="inline-flex items-center gap-1">
                  <button
                    onClick={() => handleActionClick('View Details', vendor)}
                    className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <div className="relative">
                    <button
                      onClick={() =>
                        setActiveMenuId(activeMenuId === vendor.id ? null : vendor.id)
                      }
                      className={`p-1.5 rounded-lg transition-colors ${
                        activeMenuId === vendor.id
                          ? 'bg-purple-100 text-purple-700'
                          : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                      title="More Options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Dropdown Menu */}
                    {activeMenuId === vendor.id && (
                      <div
                        ref={menuRef}
                        className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-50 text-left"
                      >
                        <button
                          onClick={() => handleActionClick('View Details', vendor)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <span>👁</span>
                          <span>View Details</span>
                        </button>

                        <button
                          onClick={() => handleActionClick('Edit Vendor', vendor)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <span>✏️</span>
                          <span>Edit Vendor</span>
                        </button>

                        <button
                          onClick={() => handleActionClick('Activate', vendor)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors"
                        >
                          <span>🟢</span>
                          <span>Activate</span>
                        </button>

                        <button
                          onClick={() => handleActionClick('Deactivate', vendor)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50 transition-colors"
                        >
                          <span>🔴</span>
                          <span>Deactivate</span>
                        </button>

                        <div className="my-1 border-t border-gray-100" />

                        <button
                          onClick={() => handleActionClick('Delete Vendor', vendor)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <span>🗑</span>
                          <span>Delete Vendor</span>
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

export default VendorTable;
