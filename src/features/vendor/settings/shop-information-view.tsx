'use client';

import React, { useState, useEffect } from 'react';
import { Camera, ImagePlus, MapPin, ExternalLink, Clipboard, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export const ShopInformationView: React.FC = () => {
  const [shopName, setShopName] = useState('');
  const [description, setDescription] = useState('');
  const [foodType, setFoodType] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [pastedStatus, setPastedStatus] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setShopName(user.user_metadata?.shop_name || user.user_metadata?.full_name || '');
        setDescription(user.user_metadata?.description || '');
        setFoodType(user.user_metadata?.food_type || '');
        setPhone(user.phone || user.user_metadata?.phone || '');
        setWhatsapp(user.user_metadata?.whatsapp || '');
        setAddress(user.user_metadata?.address || user.user_metadata?.location || '');
      }
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      await supabase.auth.updateUser({
        data: {
          shop_name: shopName,
          description,
          food_type: foodType,
          phone,
          whatsapp,
          address,
          location: address,
        },
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const handleOpenGoogleMaps = () => {
    let url = 'https://www.google.com/maps';
    if (address.trim()) {
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.trim())}`;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handlePasteAddress = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setAddress((prev) => (prev ? `${prev}\n${text}` : text));
        setPastedStatus(true);
        setTimeout(() => setPastedStatus(false), 2000);
      }
    } catch {
      const textareaElement = document.getElementById('complete-address-input') as HTMLTextAreaElement;
      if (textareaElement) {
        textareaElement.focus();
      }
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative bg-white">
      <div className="max-w-2xl mx-auto space-y-7">

        {/* Images Section */}
        <div className="space-y-4">
          <h3 className="text-[16px] font-bold text-[#1a1a1a]">Shop Assets</h3>
          <div className="flex gap-6 items-end">
            {/* Logo Upload */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-[#fdf8f3] cursor-pointer hover:bg-[#f8f0e5] transition-colors relative overflow-hidden group">
                <Camera size={24} className="text-gray-400 group-hover:text-[#f67412] transition-colors" />
                <span className="text-[10px] text-gray-500 mt-1 font-medium group-hover:text-[#f67412]">Logo</span>
              </div>
            </div>

            {/* Cover Upload */}
            <div className="flex-1">
              <div className="h-32 w-full rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-[#fdf8f3] cursor-pointer hover:bg-[#f8f0e5] transition-colors group">
                <ImagePlus size={28} className="text-gray-400 group-hover:text-[#f67412] transition-colors" />
                <span className="text-[13px] text-gray-500 mt-2 font-medium group-hover:text-[#f67412]">
                  Upload Cover Image
                </span>
              </div>
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Form Fields Section */}
        <div className="space-y-5">
          <h3 className="text-[16px] font-bold text-[#1a1a1a]">Basic Details</h3>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-gray-700">Shop Name</label>
            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-gray-800 text-[14px] placeholder:text-gray-400 placeholder:opacity-100 focus:outline-none focus:border-[#f67412] focus:ring-2 focus:ring-[#f67412]/20 transition-all bg-[#fdf8f3] focus:bg-white"
              placeholder="Enter your shop's full name"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-gray-700">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-gray-800 text-[14px] placeholder:text-gray-400 placeholder:opacity-100 focus:outline-none focus:border-[#f67412] focus:ring-2 focus:ring-[#f67412]/20 transition-all bg-[#fdf8f3] focus:bg-white resize-none"
              placeholder="What is your shop known for?"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-gray-700">Food Type</label>
            <select
              value={foodType}
              onChange={(e) => setFoodType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-gray-800 text-[14px] focus:outline-none focus:border-[#f67412] focus:ring-2 focus:ring-[#f67412]/20 transition-all bg-[#fdf8f3] focus:bg-white appearance-none cursor-pointer"
            >
              <option value="" disabled className="text-gray-400">Select food category</option>
              <option value="veg">Pure Veg</option>
              <option value="non-veg">Non-Veg</option>
              <option value="both">Veg &amp; Non-Veg</option>
              <option value="dessert">Desserts &amp; Bakery</option>
              <option value="beverages">Beverages</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-gray-700">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-gray-800 text-[14px] placeholder:text-gray-400 placeholder:opacity-100 focus:outline-none focus:border-[#f67412] focus:ring-2 focus:ring-[#f67412]/20 transition-all bg-[#fdf8f3] focus:bg-white"
                placeholder="+91 98765 43210"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-gray-700">WhatsApp Number</label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-gray-800 text-[14px] placeholder:text-gray-400 placeholder:opacity-100 focus:outline-none focus:border-[#f67412] focus:ring-2 focus:ring-[#f67412]/20 transition-all bg-[#fdf8f3] focus:bg-white"
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          {/* Google Maps Link / Location Section */}
          <div className="flex flex-col gap-2.5 p-4 bg-[#fdf8f3] border border-gray-200 rounded-xl">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <label className="text-[13px] font-semibold text-gray-800">Google Maps Link</label>
                <p className="text-[11px] text-gray-500">Paste your shop's Google Maps location link or exact address</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePasteAddress}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 shadow-xs transition-all active:scale-[0.98]"
                  title="Paste Google Maps link from clipboard"
                >
                  {pastedStatus ? <Check size={14} className="text-emerald-600" /> : <Clipboard size={14} className="text-gray-500" />}
                  <span>{pastedStatus ? 'Pasted!' : 'Paste GMap Link'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenGoogleMaps}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#4285F4] hover:bg-[#3367D6] px-3.5 py-1.5 rounded-lg shadow-sm transition-all active:scale-[0.98] group"
                  title="Open Google Maps to search or copy exact location link"
                >
                  <MapPin size={14} className="text-white fill-white/20" />
                  <span>Google Maps</span>
                  <ExternalLink size={12} className="opacity-80 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            <div className="relative flex items-center">
              <input
                id="complete-address-input"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2.5 pr-28 rounded-lg border border-gray-200 text-gray-800 text-[14px] placeholder:text-gray-400 placeholder:opacity-100 focus:outline-none focus:border-[#f67412] focus:ring-2 focus:ring-[#f67412]/20 transition-all bg-white"
                placeholder="https://maps.app.goo.gl/... or full shop address"
              />
              {address.trim() && (
                <a
                  href={
                    address.trim().startsWith('http://') || address.trim().startsWith('https://')
                      ? address.trim()
                      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.trim())}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-2 text-xs font-semibold text-[#f67412] hover:text-[#d96610] bg-[#fdf8f3] hover:bg-[#f8f0e5] px-2.5 py-1 rounded-md border border-[#f67412]/20 flex items-center gap-1 transition-colors"
                  title="Open and test this Google Maps link in a new tab"
                >
                  <span>Test Link</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </div>

            <p className="text-[12px] text-gray-500 flex items-center gap-1 mt-0.5">
              <span className="font-medium text-[#f67412]">Tip:</span> Click <span className="font-semibold text-gray-700">Google Maps</span> above to find your shop, click <span className="font-semibold text-gray-700">Share &gt; Copy Link</span>, then paste it here.
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-6 pb-8">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-[#f67412] text-white font-bold py-3.5 rounded-xl hover:bg-[#d96610] active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2"
          >
            {savedSuccess ? (
              <>
                <Check size={18} className="text-white" />
                <span>Shop Information Saved!</span>
              </>
            ) : (
              <span>{saving ? 'Saving...' : 'Save Shop Information'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

