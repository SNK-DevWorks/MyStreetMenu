'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Utensils,
  Tag,
  Loader2,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { Vendor } from './VendorTable';
import { getVendorDetailAction } from '@/actions/admin/manage-vendor';

export interface VendorDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: Vendor | null;
  onAction?: (actionName: string, vendor: Vendor) => void;
}

interface MenuItemData {
  id: string;
  name: string;
  price: string | number;
  category?: string;
  description?: string | null;
  image?: string | null;
  isAvailable?: boolean;
}

interface CategoryData {
  id: string;
  name: string;
}

export function VendorDetailsDrawer({
  isOpen,
  onClose,
  vendor,
  onAction,
}: VendorDetailsDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItemData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    if (isOpen && vendor) {
      setLoading(true);
      const userId = vendor.userId || vendor.id;
      getVendorDetailAction(userId).then((res) => {
        if (res.success && res.data?.shop) {
          const shop = res.data.shop;
          if (shop.categories && shop.categories.length > 0) {
            setCategories(shop.categories.map((c: { id: string; name: string }) => ({ id: c.id, name: c.name })));
          } else {
            setCategories([]);
          }

          if (shop.menuItems && shop.menuItems.length > 0) {
            setMenuItems(
              shop.menuItems.map((item: { id: string; name: string; price: string; description?: string | null; image?: string | null; isAvailable?: boolean }) => ({
                id: item.id,
                name: item.name,
                price: item.price,
                description: item.description,
                image: item.image,
                isAvailable: item.isAvailable ?? true,
              }))
            );
          } else {
            // Default sample menu if empty
            setMenuItems([
              { id: '1', name: 'Classic Street Burger', price: '120', category: 'Burgers', description: 'Crispy patty with house secret sauce', isAvailable: true },
              { id: '2', name: 'Cheese Blast Burger', price: '160', category: 'Burgers', description: 'Loaded with melted cheddar & mozzarella', isAvailable: true },
              { id: '3', name: 'Special Masala Tea', price: '30', category: 'Beverages', description: 'Ginger & cardamom spiced hot tea', isAvailable: true },
              { id: '4', name: 'Peri Peri Fries', price: '90', category: 'Sides', description: 'Crispy potato fries with peri peri seasoning', isAvailable: false },
            ]);
            setCategories([
              { id: 'cat-1', name: 'Burgers' },
              { id: 'cat-2', name: 'Beverages' },
              { id: 'cat-3', name: 'Sides' },
            ]);
          }
        }
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [isOpen, vendor]);

  if (!isOpen || !vendor) return null;

  const filteredMenuItems = selectedCategory === 'All'
    ? menuItems
    : menuItems.filter((i) => i.category === selectedCategory);

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
        <div className="w-screen max-w-lg bg-white border-l border-gray-200 shadow-2xl flex flex-col justify-between">
          
          {/* Drawer Header */}
          <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-[#fdf8f3]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 text-2xl flex items-center justify-center font-bold shadow-2xs border border-orange-200/50">
                {vendor.logoEmoji || '🏪'}
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#1f114a] leading-tight">{vendor.shopName}</h2>
                <p className="text-xs text-gray-500 font-medium">Owner: {vendor.owner}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs text-gray-700">
            
            {/* Shop Information Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Shop Information
              </h3>
              <div className="bg-gray-50/80 rounded-2xl p-4 space-y-2.5 border border-gray-200/80">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Food Type / Description:</span>
                  <span className="font-semibold text-gray-900 text-right max-w-[220px] truncate">
                    {vendor.description || vendor.foodType || 'Street Food'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Phone:</span>
                  <span className="font-semibold text-gray-900 font-mono">{vendor.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">WhatsApp:</span>
                  <span className="font-semibold text-emerald-600 font-mono">{vendor.whatsapp || vendor.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Address / City:</span>
                  <span className="font-semibold text-gray-900 text-right max-w-[220px] truncate">
                    {vendor.location}
                  </span>
                </div>
                {vendor.mapUrl && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Map Link:</span>
                    <a
                      href={vendor.mapUrl.startsWith('http') ? vendor.mapUrl : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(vendor.mapUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <span>View Map</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Status:</span>
                  <span className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${vendor.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                    {vendor.status === 'Active' ? '🟢 Active' : '🔴 Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Vendor Menu Section ── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-orange-500" />
                  <span>Vendor Menu ({menuItems.length} items)</span>
                </h3>
                {categories.length > 0 && (
                  <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                    {categories.length} Categories
                  </span>
                )}
              </div>

              {loading ? (
                <div className="flex items-center justify-center p-8 bg-gray-50 rounded-2xl border border-gray-200/80">
                  <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
                </div>
              ) : (
                <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-200/80 space-y-3">
                  
                  {/* Category Filter Pills */}
                  {categories.length > 0 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                      <button
                        type="button"
                        onClick={() => setSelectedCategory('All')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                          selectedCategory === 'All'
                            ? 'bg-orange-500 text-white shadow-2xs'
                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/80'
                        }`}
                      >
                        All ({menuItems.length})
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedCategory(cat.name)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                            selectedCategory === cat.name
                              ? 'bg-orange-500 text-white shadow-2xs'
                              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/80'
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Menu Items List */}
                  <div className="space-y-2 max-h-[260px] overflow-y-auto pr-0.5">
                    {filteredMenuItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white p-3 rounded-xl border border-gray-200/80 flex items-center justify-between gap-3 shadow-2xs hover:border-gray-300 transition-all"
                      >
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-xs truncate">{item.name}</span>
                            {item.category && (
                              <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md">
                                {item.category}
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-[11px] text-gray-500 truncate">{item.description}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-extrabold text-orange-600 text-xs">
                            ₹{item.price}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                              item.isAvailable
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-red-50 text-red-600 border border-red-200'
                            }`}
                          >
                            {item.isAvailable ? 'In Stock' : 'Sold Out'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}
            </div>

            {/* Admin Actions Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Admin Actions
              </h3>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => handleAction('Edit Vendor')}
                  className="w-full flex items-center justify-between py-2.5 px-4 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold border border-purple-200 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    <span>Edit Vendor Details</span>
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                {vendor.status === 'Active' ? (
                  <button
                    onClick={() => handleAction('Deactivate')}
                    className="w-full flex items-center justify-between py-2.5 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold border border-amber-200 transition-colors cursor-pointer"
                  >
                    <span>Deactivate Vendor</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleAction('Activate')}
                    className="w-full flex items-center justify-between py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold border border-emerald-200 transition-colors cursor-pointer"
                  >
                    <span>Activate Vendor</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => handleAction('Delete Vendor')}
                  className="w-full flex items-center justify-between py-2.5 px-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-semibold border border-red-200 transition-colors cursor-pointer"
                >
                  <span>Delete Vendor</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-gray-100 bg-[#fdf8f3]">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold transition-colors cursor-pointer text-xs"
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
