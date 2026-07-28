'use client';

import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Vendor } from './VendorTable';

export interface EditVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: Vendor | null;
  onSave: (updatedVendor: Vendor) => void;
}

export function EditVendorModal({
  isOpen,
  onClose,
  vendor,
  onSave,
}: EditVendorModalProps) {
  const [shopName, setShopName] = useState('');
  const [logoEmoji, setLogoEmoji] = useState('🍔');
  const [owner, setOwner] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  useEffect(() => {
    if (vendor) {
      setShopName(vendor.shopName || '');
      setLogoEmoji(vendor.logoEmoji || '🍔');
      setOwner(vendor.owner || '');
      setPhone(vendor.phone || '');
      setLocation(vendor.location || '');
      setStatus(vendor.status === 'Inactive' ? 'Inactive' : 'Active');
    }
  }, [vendor]);

  if (!isOpen || !vendor) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...vendor,
      shopName,
      logoEmoji,
      owner,
      phone,
      location,
      status,
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

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-[#fdf8f3]">
          <div>
            <h2 className="text-base font-bold text-[#1f114a]">Edit Vendor Details</h2>
            <p className="text-xs text-gray-500">Update vendor information and platform status</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-4 gap-3">
            {/* Logo Emoji */}
            <div className="col-span-1 space-y-1.5">
              <label className="font-semibold text-gray-700 block">Logo</label>
              <input
                type="text"
                value={logoEmoji}
                onChange={(e) => setLogoEmoji(e.target.value)}
                maxLength={4}
                className="w-full text-center text-lg py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-600 focus:bg-white"
              />
            </div>

            {/* Shop Name */}
            <div className="col-span-3 space-y-1.5">
              <label className="font-semibold text-gray-700 block">Shop Name</label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-900 focus:outline-none focus:border-purple-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Owner */}
          <div className="space-y-1.5">
            <label className="font-semibold text-gray-700 block">Owner Name</label>
            <input
              type="text"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              required
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-purple-600 focus:bg-white"
            />
          </div>

          {/* Phone & Location */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-gray-700 block">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-gray-900 focus:outline-none focus:border-purple-600 focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-gray-700 block">Location / City</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-purple-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Status Radio options */}
          <div className="space-y-1.5 pt-2">
            <label className="font-semibold text-gray-700 block">Status</label>
            <div className="flex items-center gap-4 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-emerald-700">
                <input
                  type="radio"
                  name="status"
                  value="Active"
                  checked={status === 'Active'}
                  onChange={() => setStatus('Active')}
                  className="accent-emerald-600 w-4 h-4"
                />
                <span>🟢 Active</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-semibold text-gray-600">
                <input
                  type="radio"
                  name="status"
                  value="Inactive"
                  checked={status === 'Inactive'}
                  onChange={() => setStatus('Inactive')}
                  className="accent-gray-600 w-4 h-4"
                />
                <span>🔴 Inactive</span>
              </label>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold flex items-center gap-2 transition-colors shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditVendorModal;
