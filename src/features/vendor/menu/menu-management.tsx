'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  X,
  Utensils,
  Check,
  Image as ImageIcon,
  CheckCircle2,
  Upload,
  ChevronDown
} from 'lucide-react';
import MenuLoading from '@/app/vendor/menu/loading';
import { FoodCard, type FoodCardItem } from '@/components/shared/item';
import initialItems from '@/data/vendor/items.json';

// MenuItem is now an alias for the shared FoodCardItem type
export type MenuItem = FoodCardItem;

const DEFAULT_CATEGORIES = ['Burgers', 'Pizzas', 'Mains', 'Sides & Snacks', 'Beverages', 'Desserts'];

export default function MenuManagement() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const [items, setItems] = useState<MenuItem[]>(() => {
    return (initialItems as MenuItem[]).map((item, idx) => ({
      ...item,
      category: item.category || (idx % 2 === 0 ? 'Mains' : 'Burgers'),
      foodType: idx % 3 === 0 ? 'veg' : idx % 3 === 1 ? 'non-veg' : 'egg',
      isBestseller: idx < 3,
      isTodaysSpecial: idx === 1 || idx === 4,
      isAvailable: item.isAvailable ?? true
    }));
  });

  const [categoriesList, setCategoriesList] = useState<string[]>(DEFAULT_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);

  // Lock body scroll when modal is open to prevent background scrolling
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  // Apple-style Dropdown States
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isCreatingCategoryInline, setIsCreatingCategoryInline] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');

  // Form & Edit State
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Mains',
    foodType: 'veg' as 'veg' | 'non-veg' | 'egg',
    isBestseller: false,
    isTodaysSpecial: false,
    badgeLabel: '',
    image: '',
    imagePreview: '',
    isAvailable: true
  });

  const triggerNotification = (message: string) => {
    setShowToast(message);
    setTimeout(() => setShowToast(null), 3000);
  };

  if (isLoading) {
    return <MenuLoading />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setFormData(prev => ({
          ...prev,
          imagePreview: result,
          image: result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddNewCategory = () => {
    const trimmed = newCategoryInput.trim();
    if (trimmed) {
      if (!categoriesList.includes(trimmed)) {
        setCategoriesList(prev => [...prev, trimmed]);
      }
      setFormData(prev => ({ ...prev, category: trimmed }));
      setNewCategoryInput('');
      setIsCreatingCategoryInline(false);
      setIsCategoryDropdownOpen(false);
      triggerNotification(`New Category "${trimmed}" created & selected!`);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingItemId(null);
    setFormData({
      title: '',
      description: '',
      price: '',
      category: 'Mains',
      foodType: 'veg',
      isBestseller: false,
      isTodaysSpecial: false,
      badgeLabel: '',
      image: '',
      imagePreview: '',
      isAvailable: true
    });
    setIsModalOpen(true);
    setIsCategoryDropdownOpen(false);
    setIsCreatingCategoryInline(false);
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItemId(item.id);
    setFormData({
      title: item.title,
      description: item.description || '',
      price: item.price ? item.price.replace('₹', '').trim() : '',
      category: item.category || 'Mains',
      foodType: item.foodType || 'veg',
      isBestseller: !!item.isBestseller,
      isTodaysSpecial: !!item.isTodaysSpecial,
      badgeLabel: item.badgeLabel || '',
      image: item.image || '',
      imagePreview: item.image || '',
      isAvailable: item.isAvailable ?? true
    });
    setIsModalOpen(true);
    setIsCategoryDropdownOpen(false);
    setIsCreatingCategoryInline(false);
  };

  const handleCreateMenuSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.price.trim()) {
      return;
    }

    let defaultBadge = formData.badgeLabel.trim();
    if (!defaultBadge && formData.isBestseller) defaultBadge = '⭐ Bestseller';
    if (!defaultBadge && formData.isTodaysSpecial) defaultBadge = '🔥 Today\'s Special';

    const formattedPrice = formData.price.startsWith('₹') ? formData.price : `₹${formData.price}`;

    if (editingItemId !== null) {
      // Edit existing item
      setItems(prev => prev.map(item => {
        if (item.id === editingItemId) {
          return {
            ...item,
            title: formData.title,
            description: formData.description || 'Delicious freshly prepared vendor special dish.',
            price: formattedPrice,
            category: formData.category,
            foodType: formData.foodType,
            isBestseller: formData.isBestseller,
            isTodaysSpecial: formData.isTodaysSpecial,
            badgeLabel: defaultBadge || item.badgeLabel || 'Vendor Item',
            image: formData.imagePreview || formData.image.trim() || item.image,
            isAvailable: formData.isAvailable
          };
        }
        return item;
      }));
    } else {
      // Create new item
      const newItem: MenuItem = {
        id: Date.now(),
        title: formData.title,
        description: formData.description || 'Delicious freshly prepared vendor special dish.',
        price: formattedPrice,
        category: formData.category,
        foodType: formData.foodType,
        isBestseller: formData.isBestseller,
        isTodaysSpecial: formData.isTodaysSpecial,
        badgeLabel: defaultBadge || 'Vendor Item',
        image: formData.imagePreview || formData.image.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2080&auto=format&fit=crop',
        isAvailable: formData.isAvailable,
        gradientColors: {
          mid: 'rgba(56, 45, 41, 0.85)',
          end: 'rgba(40, 30, 25, 0.98)'
        },
        stats: {
          today: { views: 50, likes: 12 },
          thisWeek: { views: 200, likes: 45 },
          thisMonth: { views: 800, likes: 180 }
        }
      };

      setItems(prev => [newItem, ...prev]);
    }

    setIsModalOpen(false);
    setEditingItemId(null);
    setFormData({
      title: '',
      description: '',
      price: '',
      category: 'Mains',
      foodType: 'veg',
      isBestseller: false,
      isTodaysSpecial: false,
      badgeLabel: '',
      image: '',
      imagePreview: '',
      isAvailable: true
    });
  };

  const handleDeleteItem = (id: number, title: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleToggleAvailability = (id: number) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const nextState = !item.isAvailable;
        triggerNotification(`"${item.title}" is now ${nextState ? 'Available' : 'Out of Stock'}.`);
        return { ...item, isAvailable: nextState };
      }
      return item;
    }));
  };

  // Filter categories combining default and dynamically added categories
  const allCategoryPills = ['All', ...categoriesList];

  // Filtering items
  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full max-w-[1300px] mx-auto py-6 px-2 sm:px-4 flex flex-col gap-6">
      
      {/* Success Notification Toast */}
      {showToast && (
        <div className="fixed top-24 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span className="text-sm font-bold">{showToast}</span>
        </div>
      )}

      {/* Top Banner & Title Row */}
      <div className="bg-gradient-to-r from-[#f77512] to-[#ff9436] rounded-[2.5rem] p-6 sm:p-10 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight mb-2">
            Manage & Create Menu
          </h1>
          <p className="text-orange-100 font-medium text-sm sm:text-base leading-relaxed">
            Create new food items, upload images, specify food types, and highlight your top specials.
          </p>
        </div>

        {/* Create Menu Button */}
        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="relative z-10 bg-slate-900 hover:bg-black text-white font-black px-7 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2.5 text-base sm:text-lg tracking-tight shrink-0 cursor-pointer border border-slate-700 active:scale-95"
        >
          <Plus size={22} className="text-[#f77512] stroke-[3]" />
          <span>Create Menu</span>
        </button>

        {/* Decorative background circle */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Controls Bar: Search & Category Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-gray-200/80 shadow-sm">
        
        {/* Search Bar */}
        <div className="relative flex items-center w-full md:w-80 h-11 rounded-2xl bg-gray-100/80 px-3.5 border border-gray-200 focus-within:border-[#f77512] focus-within:bg-white transition-all">
          <Search size={18} className="text-gray-400 shrink-0 mr-2" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent outline-none text-sm font-medium text-slate-800 placeholder-gray-400"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {allCategoryPills.map(cat => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#f77512] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200/80 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu Item Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200/80 flex flex-col items-center justify-center min-h-[300px]">
          <Utensils size={48} className="text-gray-300 mb-3" />
          <h3 className="text-xl font-bold text-slate-800 mb-1">No Menu Items Found</h3>
          <p className="text-gray-500 text-sm max-w-md mb-6">
            No menu items match your search or filter. Try creating a new menu item!
          </p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="bg-[#f77512] hover:bg-[#e05a00] text-white font-bold px-6 py-3 rounded-2xl transition-all shadow-md flex items-center gap-2 text-sm"
          >
            <Plus size={18} /> Create Menu Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map(item => (
            <FoodCard
              key={item.id}
              {...item}
              variant="vendor"
              onEdit={handleEditItem}
              onDelete={handleDeleteItem}
              onToggleAvailability={handleToggleAvailability}
            />
          ))}
        </div>
      )}


      {/* CREATE MENU MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-gray-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-6 sm:p-8 flex items-center justify-between relative">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
                  {editingItemId !== null ? 'Edit Menu Item' : 'Create New Menu Item'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="bg-white/10 hover:bg-white/20 p-2.5 rounded-full text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateMenuSubmit} className="p-6 sm:p-8 flex flex-col gap-5">
              
              {/* 1. Food Image Upload & Preview */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  Food Image
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Image Preview Box */}
                  <div className="w-24 h-24 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden shrink-0 relative group">
                    {formData.imagePreview ? (
                      <img src={formData.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-gray-400">
                        <ImageIcon size={24} />
                        <span className="text-[10px] font-bold">No Image</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Button & Image URL input */}
                  <div className="flex-1 w-full flex flex-col gap-2">
                    <label className="bg-slate-900 hover:bg-black text-white text-xs font-black py-3 px-5 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center gap-2 shadow-sm w-fit active:scale-95">
                      <Upload size={14} className="text-[#f77512]" />
                      <span>Upload Image</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                        className="hidden" 
                      />
                    </label>
                    <span className="text-gray-400 text-xs font-medium">Or enter image URL:</span>
                    <input
                      type="url"
                      name="image"
                      placeholder="https://images.unsplash.com/..."
                      value={formData.image}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          image: e.target.value,
                          imagePreview: e.target.value
                        }));
                      }}
                      className="w-full h-10 px-3.5 rounded-xl border border-gray-300 focus:border-[#f77512] outline-none text-slate-800 text-xs font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Item Name */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Classic Cheeseburger"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full h-12 px-4 rounded-xl border border-gray-300 focus:border-[#f77512] focus:ring-2 focus:ring-[#f77512]/20 outline-none text-slate-800 font-semibold text-base transition-all"
                />
              </div>

              {/* 3. Description */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Describe ingredients, taste, and special highlights..."
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-3.5 rounded-xl border border-gray-300 focus:border-[#f77512] focus:ring-2 focus:ring-[#f77512]/20 outline-none text-slate-800 font-medium text-sm transition-all resize-none"
                />
              </div>

              {/* 4. Category & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Apple-Style Custom Category Dropdown */}
                <div className="relative">
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                    Category
                  </label>
                  
                  {/* Trigger Pill */}
                  <div
                    onClick={() => {
                      setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
                      setIsCreatingCategoryInline(false);
                    }}
                    className={`w-full h-12 px-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between font-medium text-slate-800 text-sm sm:text-base select-none ${
                      isCategoryDropdownOpen
                        ? 'border-[#f77512] ring-2 ring-[#f77512]/20 bg-white shadow-sm'
                        : 'border-gray-300 bg-gray-50/80 hover:bg-white'
                    }`}
                  >
                    <span className="truncate">{formData.category || 'Select Category'}</span>
                    <ChevronDown 
                      size={18} 
                      className={`text-gray-500 transition-transform duration-200 ${isCategoryDropdownOpen ? 'rotate-180 text-[#f77512]' : ''}`} 
                    />
                  </div>

                  {/* Expanding Popup List */}
                  {isCategoryDropdownOpen && (
                    <>
                      {/* Click outside backdrop */}
                      <div 
                        className="fixed inset-0 z-30 bg-transparent" 
                        onClick={() => setIsCategoryDropdownOpen(false)} 
                      />

                      <div 
                        className="absolute top-full left-0 right-0 mt-2 z-40 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 p-2 overflow-hidden flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-150 overscroll-contain"
                        onClick={(e) => e.stopPropagation()}
                        onWheel={(e) => e.stopPropagation()}
                      >
                        <div 
                          className="max-h-40 overflow-y-auto overscroll-contain no-scrollbar flex flex-col gap-0.5"
                          onWheel={(e) => e.stopPropagation()}
                        >
                          {categoriesList.map((cat) => {
                            const isSelected = formData.category === cat;
                            return (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, category: cat }));
                                  setIsCategoryDropdownOpen(false);
                                }}
                                className={`w-full text-left px-3.5 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-between cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#f77512]/10 text-[#f77512] font-bold'
                                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80'
                                }`}
                              >
                                <span>{cat}</span>
                                {isSelected && <Check size={16} className="text-[#f77512] shrink-0 stroke-[2.5]" />}
                              </button>
                            );
                          })}
                        </div>

                        {/* Create Category Button / Inline Creator at bottom of dropdown */}
                        <div className="pt-2 border-t border-gray-100">
                          {isCreatingCategoryInline ? (
                            <div className="flex items-center gap-2 p-1">
                              <input
                                type="text"
                                placeholder="New Category Name..."
                                value={newCategoryInput}
                                onChange={(e) => setNewCategoryInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddNewCategory();
                                  }
                                }}
                                className="w-full h-10 px-3.5 rounded-xl border border-gray-300 outline-none text-sm font-medium text-slate-800 focus:border-[#f77512]"
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={handleAddNewCategory}
                                className="bg-[#f77512] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#e05a00] shrink-0 shadow-sm"
                              >
                                Add
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsCreatingCategoryInline(false)}
                                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setIsCreatingCategoryInline(true)}
                              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl bg-[#f77512]/10 text-[#f77512] font-semibold text-xs sm:text-sm hover:bg-[#f77512]/20 transition-colors cursor-pointer"
                            >
                              <Plus size={15} strokeWidth={2.5} />
                              <span>Create Category</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Price (₹) */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="text"
                    name="price"
                    required
                    placeholder="e.g. 199"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full h-12 px-4 rounded-xl border border-gray-300 focus:border-[#f77512] focus:ring-2 focus:ring-[#f77512]/20 outline-none text-slate-800 font-semibold text-base transition-all"
                  />
                </div>
              </div>

              {/* 5. Food Type (Veg / Non-Veg / Egg) Radio Selector */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  Food Type
                </label>
                <div className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-2xl border border-gray-200">
                  {/* Veg Option */}
                  <label className={`flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer font-extrabold text-xs select-none ${
                    formData.foodType === 'veg' 
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' 
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}>
                    <input 
                      type="radio" 
                      name="foodType" 
                      value="veg" 
                      checked={formData.foodType === 'veg'} 
                      onChange={() => setFormData(prev => ({ ...prev, foodType: 'veg' }))}
                      className="hidden" 
                    />
                    <span className="w-4 h-4 rounded-sm border-2 border-emerald-600 flex items-center justify-center p-0.5 bg-white shrink-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    </span>
                    Veg
                  </label>

                  {/* Non-Veg Option */}
                  <label className={`flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer font-extrabold text-xs select-none ${
                    formData.foodType === 'non-veg' 
                      ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-sm' 
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}>
                    <input 
                      type="radio" 
                      name="foodType" 
                      value="non-veg" 
                      checked={formData.foodType === 'non-veg'} 
                      onChange={() => setFormData(prev => ({ ...prev, foodType: 'non-veg' }))}
                      className="hidden" 
                    />
                    <span className="w-4 h-4 rounded-sm border-2 border-rose-600 flex items-center justify-center p-0.5 bg-white shrink-0">
                      <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                    </span>
                    Non-Veg
                  </label>

                  {/* Egg Option */}
                  <label className={`flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer font-extrabold text-xs select-none ${
                    formData.foodType === 'egg' 
                      ? 'bg-amber-50 border-amber-500 text-amber-700 shadow-sm' 
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}>
                    <input 
                      type="radio" 
                      name="foodType" 
                      value="egg" 
                      checked={formData.foodType === 'egg'} 
                      onChange={() => setFormData(prev => ({ ...prev, foodType: 'egg' }))}
                      className="hidden" 
                    />
                    <span className="w-4 h-4 rounded-sm border-2 border-amber-500 flex items-center justify-center p-0.5 bg-white shrink-0">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    </span>
                    Egg
                  </label>
                </div>
              </div>

              {/* 6 & 7. Checkboxes: Bestseller & Today's Special */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Bestseller Checkbox */}
                <label className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                  formData.isBestseller ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-sm' : 'bg-gray-50 border-gray-200 text-slate-700'
                }`}>
                  <input 
                    type="checkbox" 
                    checked={formData.isBestseller} 
                    onChange={(e) => setFormData(prev => ({ ...prev, isBestseller: e.target.checked }))}
                    className="w-4 h-4 accent-[#f77512] rounded cursor-pointer" 
                  />
                  <div className="flex flex-col">
                    <span className="font-extrabold text-xs text-amber-950">⭐ Bestseller</span>
                    <span className="text-[10px] text-gray-500 font-medium">Mark as Bestseller</span>
                  </div>
                </label>

                {/* Today's Special Checkbox */}
                <label className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                  formData.isTodaysSpecial ? 'bg-orange-50 border-orange-400 text-orange-900 shadow-sm' : 'bg-gray-50 border-gray-200 text-slate-[#f77512]'
                }`}>
                  <input 
                    type="checkbox" 
                    checked={formData.isTodaysSpecial} 
                    onChange={(e) => setFormData(prev => ({ ...prev, isTodaysSpecial: e.target.checked }))}
                    className="w-4 h-4 accent-[#f77512] rounded cursor-pointer" 
                  />
                  <div className="flex flex-col">
                    <span className="font-extrabold text-xs text-orange-950">🔥 Today's Special</span>
                    <span className="text-[10px] text-gray-500 font-medium">Mark as Special</span>
                  </div>
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 rounded-xl text-slate-600 font-bold hover:bg-gray-100 transition-colors text-sm cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bg-[#f77512] hover:bg-[#e05a00] text-white font-black px-7 py-3 rounded-xl shadow-md transition-all text-sm cursor-pointer flex items-center gap-2 active:scale-95"
                >
                  <Plus size={18} /> {editingItemId !== null ? 'Save Changes' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
