'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Clipboard, ExternalLink, MapPin, Loader2 } from 'lucide-react';
import { Vendor } from './VendorTable';

export interface EditVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: Vendor | null;
  onSave: (updatedVendor: Vendor) => Promise<void> | void;
}

export function EditVendorModal({
  isOpen,
  onClose,
  vendor,
  onSave,
}: EditVendorModalProps) {
  const [shopName, setShopName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [mapUrl, setMapUrl] = useState('');
  const [owner, setOwner] = useState('');
  const [location, setLocation] = useState('');
  const [logoEmoji, setLogoEmoji] = useState('🍔');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (vendor) {
      setShopName(vendor.shopName || '');
      setDescription(vendor.description || vendor.foodType || '');
      setPhone(vendor.phone || '');
      setWhatsapp(vendor.whatsapp || vendor.phone || '');
      setMapUrl(vendor.mapUrl || vendor.location || '');
      setOwner(vendor.owner || '');
      setLocation(vendor.location || '');
      setLogoEmoji(vendor.logoEmoji || '🍔');
      setStatus(vendor.status === 'Inactive' ? 'Inactive' : 'Active');
    }
  }, [vendor]);

  if (!isOpen || !vendor) return null;

  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        if (text) setMapUrl(text.trim());
      }
    } catch {
      // Clipboard permission denied or unavailable
    }
  };

  const handleOpenGoogleMapsSearch = () => {
    const query = encodeURIComponent(shopName ? `${shopName} ${location}`.trim() : 'Google Maps');
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleTestMapUrl = () => {
    if (!mapUrl.trim()) return;
    const url = mapUrl.startsWith('http') ? mapUrl : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapUrl)}`;
    window.open(url, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        ...vendor,
        shopName,
        description,
        foodType: description,
        phone,
        whatsapp,
        mapUrl,
        owner,
        location,
        logoEmoji,
        status,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
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
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-[#fdf8f3]">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#1f114a]">Edit Vendor Details</h2>
            <p className="text-xs text-gray-500 mt-0.5">Update vendor information and platform status</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
          
          {/* Section: Basic Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 tracking-tight">Basic Details</h3>

            {/* Shop Name */}
            <div className="space-y-1.5">
              <label className="font-semibold text-gray-700 block">Shop Name</label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="e.g. SNK DevWorks"
                required
                className="w-full px-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl font-semibold text-gray-900 focus:outline-none focus:border-[#f77512] focus:bg-white transition-all text-xs"
              />
            </div>

            {/* Description / Food Type */}
            <div className="space-y-1.5">
              <label className="font-semibold text-gray-700 block">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is your shop known for?"
                className="w-full px-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#f77512] focus:bg-white transition-all text-xs resize-none placeholder:text-gray-400 font-medium"
              />
            </div>

            {/* Phone & WhatsApp Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 block">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="7890700156"
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl font-medium text-gray-900 focus:outline-none focus:border-[#f77512] focus:bg-white transition-all text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 block">WhatsApp Number</label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="7890700156"
                  className="w-full px-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl font-medium text-gray-900 focus:outline-none focus:border-[#f77512] focus:bg-white transition-all text-xs"
                />
              </div>
            </div>

            {/* Google Maps Link Block */}
            <div className="p-3.5 rounded-2xl bg-amber-500/[0.04] border border-amber-500/15 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-gray-900 text-xs">Google Maps Link</h4>
                  <p className="text-[11px] text-gray-500">Paste your shop's Google Maps location link or exact address</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handlePasteClipboard}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-[11px] font-semibold flex items-center gap-1 transition-all shadow-2xs cursor-pointer"
                  >
                    <Clipboard className="w-3.5 h-3.5 text-gray-500" />
                    <span>Paste Link</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenGoogleMapsSearch}
                    className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold flex items-center gap-1 transition-all shadow-2xs cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Google Maps</span>
                    <ExternalLink className="w-3 h-3 text-white/80" />
                  </button>
                </div>
              </div>

              <div className="relative flex items-center">
                <input
                  type="text"
                  value={mapUrl}
                  onChange={(e) => setMapUrl(e.target.value)}
                  placeholder="Paste map link or search location"
                  className="w-full pl-3.5 pr-16 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:border-[#f77512] transition-all"
                />
                <button
                  type="button"
                  onClick={handleTestMapUrl}
                  disabled={!mapUrl.trim()}
                  className="absolute right-2 px-2.5 py-1 rounded-lg border border-amber-300 text-amber-700 hover:bg-amber-100 text-[11px] font-bold flex items-center gap-1 transition-all disabled:opacity-40 cursor-pointer bg-amber-50"
                >
                  <span>Test</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              <p className="text-[11px] text-amber-700/80 font-medium">
                <span className="font-bold text-amber-700">Tip:</span> Open Google Maps to copy your location link and paste here.
              </p>
            </div>

            {/* Owner & City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 block">Owner Name</label>
                <input
                  type="text"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  placeholder="Owner Name"
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#f77512] focus:bg-white transition-all text-xs font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 block">Location / City</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Kolkata"
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#f77512] focus:bg-white transition-all text-xs font-medium"
                />
              </div>
            </div>

            {/* Platform Status */}
            <div className="space-y-1.5 pt-1">
              <label className="font-semibold text-gray-700 block">Platform Status</label>
              <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-200">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-emerald-700 text-xs">
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

                <label className="flex items-center gap-2 cursor-pointer font-semibold text-gray-600 text-xs">
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

          </div>

          {/* Action Button: Save Shop Information */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-colors cursor-pointer text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-[#f77512] hover:bg-[#e0670d] text-white font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer text-xs"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Shop Information</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default EditVendorModal;
