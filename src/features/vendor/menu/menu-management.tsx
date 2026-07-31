'use client';

import React, { useState, useEffect, useTransition, useCallback } from 'react';
import {
  Plus,
  Search,
  X,
  Utensils,
  Check,
  Image as ImageIcon,
  Upload,
  ChevronDown,
  Loader2,
  AlertCircle,
  RefreshCw,
  Pencil,
  Trash2,
} from 'lucide-react';

import MenuLoading from '@/app/vendor/menu/loading';
import { FoodCard, type FoodCardItem } from '@/components/shared/item';

import { getVendorShopAction } from '@/actions/shop/get-vendor-shop';
import { getMenuDataAction, type MenuItemWithCategory } from '@/actions/shop/get-menu-data';
import { createMenuAction } from '@/actions/menu/create-menu';
import { updateMenuAction } from '@/actions/menu/update-menu';
import { deleteMenuAction } from '@/actions/menu/delete-menu';
import { toggleSoldOutAction } from '@/actions/menu/toggle-sold-out';
import { createCategoryAction } from '@/actions/category/create-category';
import { updateCategoryAction } from '@/actions/category/update-category';
import { deleteCategoryAction } from '@/actions/category/delete-category';

import type { Shop } from '../../../../drizzle/schema/shops';
import type { Category } from '../../../../drizzle/schema/categories';
import type { MenuItem } from '../../../../drizzle/schema/menu-items';

// ─── Adapter: DB MenuItem → FoodCardItem ─────────────────────────────────────

function toFoodCardItem(item: MenuItemWithCategory): FoodCardItem {
  return {
    id: item.id,
    title: item.name,
    description: item.description ?? 'Freshly prepared vendor special.',
    price: `₹${Number(item.price).toFixed(0)}`,
    image:
      item.imageUrl ||
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2080&auto=format&fit=crop',
    category: item.categoryName,
    foodType: (item.foodType as 'veg' | 'non-veg' | 'egg') ?? 'veg',
    isBestseller: item.isBestSeller,
    isTodaysSpecial: item.isTodaysSpecial,
    isAvailable: !item.isSoldOut,
    gradientColors: { mid: 'rgba(56, 45, 41, 0.85)', end: 'rgba(40, 30, 25, 0.98)' },
  };
}

// ─── Form State ───────────────────────────────────────────────────────────────

interface FormState {
  name: string;
  description: string;
  price: string;
  categoryId: string;
  foodType: 'veg' | 'non-veg' | 'egg';
  isBestSeller: boolean;
  isTodaysSpecial: boolean;
  imageUrl: string;
  imagePreview: string;
}

const DEFAULT_FORM: FormState = {
  name: '',
  description: '',
  price: '',
  categoryId: '',
  foodType: 'veg',
  isBestSeller: false,
  isTodaysSpecial: false,
  imageUrl: '',
  imagePreview: '',
};

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div
      className={`fixed top-24 right-6 z-[200] px-5 py-3 rounded-2xl shadow-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200 ${type === 'success'
          ? 'bg-slate-900 text-white border-slate-700'
          : 'bg-rose-900 text-white border-rose-700'
        }`}
    >
      {type === 'error' && <AlertCircle size={18} className="text-rose-300 shrink-0" />}
      <span className="text-sm font-bold">{message}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MenuManagement() {
  // ── Data state ──────────────────────────────────────────────────────────────
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dbItems, setDbItems] = useState<MenuItemWithCategory[]>([]);

  // ── UI state ────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormState>(DEFAULT_FORM);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isCreatingCategoryInline, setIsCreatingCategoryInline] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  // ── Validation errors (Apple-style shake) ────────────────────────────────────
  const [fieldErrors, setFieldErrors] = useState<{ name?: boolean; price?: boolean; category?: boolean }>({});

  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState<string>('');

  // ── Transitions for mutations ────────────────────────────────────────────────
  const [isSaving, startSavingTransition] = useTransition();
  const [isDeleting, startDeletingTransition] = useTransition();
  const [isCreatingCategory, startCreatingCategoryTransition] = useTransition();
  const [isUpdatingCategory, startUpdatingCategoryTransition] = useTransition();
  const [isDeletingCategory, startDeletingCategoryTransition] = useTransition();
  const [isTogglingId, setIsTogglingId] = useState<string | null>(null);

  // ── Toast helper ─────────────────────────────────────────────────────────────
  const notify = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ── Bootstrap: load shop + menu data on mount ─────────────────────────────
  const bootstrap = useCallback(async () => {
    setIsBootstrapping(true);
    setBootstrapError(null);

    const shopResult = await getVendorShopAction();
    if (!shopResult.success || !shopResult.data) {
      setBootstrapError(shopResult.error ?? 'Could not load your shop.');
      setIsBootstrapping(false);
      return;
    }

    const loadedShop = shopResult.data;
    setShop(loadedShop);

    const menuResult = await getMenuDataAction(loadedShop.id);
    if (!menuResult.success || !menuResult.data) {
      setBootstrapError(menuResult.error ?? 'Could not load menu data.');
      setIsBootstrapping(false);
      return;
    }

    setCategories(menuResult.data.categories);
    setDbItems(menuResult.data.items);
    setIsBootstrapping(false);
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  // ── Body scroll lock when modal open ──────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = isModalOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isModalOpen]);

  // ── Filtered card items ────────────────────────────────────────────────────
  const cardItems: FoodCardItem[] = dbItems
    .filter((item) => {
      const matchesCategory =
        selectedCategory === 'All' || item.categoryName === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description ?? '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .map(toFoodCardItem);

  const allCategoryPills = ['All', ...categories.map((c) => c.name)];

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleOpenCreateModal = () => {
    setEditingItemId(null);
    setFormData({
      ...DEFAULT_FORM,
      categoryId: categories[0]?.id ?? '',
    });
    setFieldErrors({});
    setIsModalOpen(true);
    setIsCategoryDropdownOpen(false);
    setIsCreatingCategoryInline(false);
  };

  const handleEditItem = (cardItem: FoodCardItem) => {
    const dbItem = dbItems.find((i) => i.id === cardItem.id);
    if (!dbItem) return;
    setEditingItemId(dbItem.id);
    setFormData({
      name: dbItem.name,
      description: dbItem.description ?? '',
      price: String(Number(dbItem.price)),
      categoryId: dbItem.categoryId,
      foodType: (dbItem.foodType as 'veg' | 'non-veg' | 'egg') ?? 'veg',
      isBestSeller: dbItem.isBestSeller,
      isTodaysSpecial: dbItem.isTodaysSpecial,
      imageUrl: dbItem.imageUrl ?? '',
      imagePreview: dbItem.imageUrl ?? '',
    });
    setFieldErrors({});
    setIsModalOpen(true);
    setIsCategoryDropdownOpen(false);
    setIsCreatingCategoryInline(false);
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setFormData((prev) => ({ ...prev, imagePreview: result, imageUrl: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingImage(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingImage(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingImage(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleAddCategory = () => {
    const trimmed = newCategoryInput.trim();
    if (!trimmed || !shop) return;

    startCreatingCategoryTransition(async () => {
      const fd = new FormData();
      fd.append('shopId', shop.id);
      fd.append('name', trimmed);

      const result = await createCategoryAction(fd);
      if (result.success && result.data) {
        setCategories((prev) => [...prev, result.data!]);
        setFormData((prev) => ({ ...prev, categoryId: result.data!.id }));
        setNewCategoryInput('');
        setIsCreatingCategoryInline(false);
        setIsCategoryDropdownOpen(false);
        notify(`Category "${trimmed}" created!`);
      } else {
        notify(result.error ?? 'Failed to create category', 'error');
      }
    });
  };

  const handleUpdateCategory = (categoryId: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;

    startUpdatingCategoryTransition(async () => {
      const fd = new FormData();
      fd.append('id', categoryId);
      fd.append('name', trimmed);

      const result = await updateCategoryAction(fd);
      if (result.success && result.data) {
        const oldCat = categories.find((c) => c.id === categoryId);
        setCategories((prev) =>
          prev.map((c) => (c.id === categoryId ? { ...c, name: trimmed } : c))
        );
        if (oldCat) {
          setDbItems((prev) =>
            prev.map((item) =>
              item.categoryId === categoryId ? { ...item, categoryName: trimmed } : item
            )
          );
          if (selectedCategory === oldCat.name) {
            setSelectedCategory(trimmed);
          }
        }
        setEditingCategoryId(null);
        notify(`Category updated to "${trimmed}"!`);
      } else {
        notify(result.error ?? 'Failed to update category', 'error');
      }
    });
  };

  const handleDeleteCategory = (categoryId: string) => {
    const catToDelete = categories.find((c) => c.id === categoryId);
    if (!catToDelete) return;

    startDeletingCategoryTransition(async () => {
      const result = await deleteCategoryAction(categoryId);
      if (result.success) {
        setCategories((prev) => prev.filter((c) => c.id !== categoryId));
        setDbItems((prev) => prev.filter((item) => item.categoryId !== categoryId));
        if (selectedCategory === catToDelete.name) {
          setSelectedCategory('All');
        }
        notify(`Category "${catToDelete.name}" deleted.`);
      } else {
        notify(result.error ?? 'Failed to delete category', 'error');
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop) return;

    // ── Validate all required fields at once (Apple-style shake) ──────────────
    const errors: { name?: boolean; price?: boolean; category?: boolean } = {};
    if (!formData.name.trim()) errors.name = true;
    if (!formData.price.trim()) errors.price = true;
    if (!formData.categoryId) errors.category = true;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      // Auto-clear after animation completes
      setTimeout(() => setFieldErrors({}), 820);
      return;
    }

    startSavingTransition(async () => {
      const fd = new FormData();
      fd.append('shopId', shop.id);
      fd.append('categoryId', formData.categoryId);
      fd.append('name', formData.name.trim());
      fd.append('description', formData.description.trim());
      fd.append('price', formData.price.replace(/[^0-9.]/g, ''));
      fd.append('imageUrl', formData.imageUrl);
      fd.append('foodType', formData.foodType);
      fd.append('isBestSeller', String(formData.isBestSeller));
      fd.append('isSoldOut', 'false');
      fd.append('isTodaysSpecial', String(formData.isTodaysSpecial));

      if (editingItemId) {
        fd.append('id', editingItemId);
        const result = await updateMenuAction(fd);
        if (result.success && result.data) {
          // Re-fetch to get updated data with category name
          const menuResult = await getMenuDataAction(shop.id);
          if (menuResult.success && menuResult.data) {
            setDbItems(menuResult.data.items);
            setCategories(menuResult.data.categories);
          }
          notify(`"${formData.name}" updated successfully!`);
        } else {
          notify(result.error ?? 'Failed to update item', 'error');
          return;
        }
      } else {
        const result = await createMenuAction(fd);
        if (result.success && result.data) {
          const newItem: MenuItemWithCategory = {
            ...result.data,
            categoryName: categories.find((c) => c.id === result.data!.categoryId)?.name ?? 'Uncategorized',
          };
          setDbItems((prev) => [newItem, ...prev]);
          notify(`"${formData.name}" added to menu!`);
        } else {
          notify(result.error ?? 'Failed to create item', 'error');
          return;
        }
      }

      setIsModalOpen(false);
      setEditingItemId(null);
      setFormData(DEFAULT_FORM);
    });
  };

  const handleDeleteItem = (id: string, title: string) => {
    startDeletingTransition(async () => {
      const result = await deleteMenuAction(id);
      if (result.success) {
        setDbItems((prev) => prev.filter((item) => item.id !== id));
        notify(`"${title}" removed from menu.`);
      } else {
        notify(result.error ?? 'Failed to delete item', 'error');
      }
    });
  };

  const handleToggleAvailability = async (id: string) => {
    const item = dbItems.find((i) => i.id === id);
    if (!item) return;
    setIsTogglingId(id);
    const result = await toggleSoldOutAction(id, !item.isSoldOut);
    setIsTogglingId(null);
    if (result.success && result.data) {
      setDbItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, isSoldOut: result.data!.isSoldOut } : i))
      );
      notify(`"${item.name}" marked as ${result.data.isSoldOut ? 'Sold Out' : 'Available'}.`);
    } else {
      notify(result.error ?? 'Failed to toggle availability', 'error');
    }
  };

  // ── Render: Bootstrapping ──────────────────────────────────────────────────
  if (isBootstrapping) return <MenuLoading />;

  // ── Render: Error ──────────────────────────────────────────────────────────
  if (bootstrapError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <AlertCircle size={48} className="text-rose-400" />
        <h2 className="text-2xl font-black text-slate-800">Something went wrong</h2>
        <p className="text-slate-500 max-w-sm">{bootstrapError}</p>
        <button
          onClick={bootstrap}
          className="flex items-center gap-2 bg-[#f77512] text-white font-bold px-6 py-3 rounded-2xl hover:bg-[#e05a00] transition-colors cursor-pointer"
        >
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  // ── Render: Main ───────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-[1300px] mx-auto py-6 px-2 sm:px-4 flex flex-col gap-6">

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* ── Manage & Create Menu Banner Card ── */}
      <div className="bg-gradient-to-r from-[#f77512] via-[#ff8826] to-[#ff9838] rounded-2xl sm:rounded-3xl p-5 sm:p-7 text-white shadow-md hover:shadow-lg transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/20 relative overflow-hidden">
        <div className="flex flex-col gap-1.5 z-10">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight drop-shadow-sm">
              Manage &amp; Create Menu
            </h1>
            {shop?.name && (
              <span className="bg-white/25 text-white text-xs font-extrabold px-3 py-1 rounded-full backdrop-blur-md border border-white/30 shadow-sm">
                {shop.name}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="bg-slate-900 hover:bg-black text-white font-black px-5 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 text-xs sm:text-sm tracking-wide shrink-0 cursor-pointer border border-slate-700/80 active:scale-95 z-10 self-start sm:self-auto"
        >
          <Plus size={18} className="text-[#f77512] stroke-[3]" />
          <span>Create Menu Item</span>
        </button>

        {/* Decorative blur circle */}
        <div className="absolute -right-8 -bottom-10 w-44 h-44 bg-white/10 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* ── Categories Management Card (Under Manage & Create Menu) ── */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
              Manage Categories ({categories.length})
            </h3>
          </div>

          {/* Add Category Trigger */}
          {!isCreatingCategoryInline ? (
            <button
              type="button"
              onClick={() => setIsCreatingCategoryInline(true)}
              className="self-start sm:self-auto flex items-center gap-2 text-xs sm:text-sm font-bold text-[#f77512] hover:text-white bg-[#fff5ec] hover:bg-[#f77512] px-4 py-2 rounded-xl border border-[#f77512]/30 transition-all shadow-sm cursor-pointer active:scale-95"
            >
              <Plus size={16} className="stroke-[3]" />
              <span>Add Category</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 animate-in fade-in duration-200">
              <input
                type="text"
                value={newCategoryInput}
                onChange={(e) => setNewCategoryInput(e.target.value)}
                placeholder="Category name..."
                className="px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl border-2 border-[#f77512] outline-none bg-white text-slate-800 w-48 sm:w-64 shadow-inner"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddCategory();
                  if (e.key === 'Escape') setIsCreatingCategoryInline(false);
                }}
              />
              <button
                type="button"
                onClick={handleAddCategory}
                disabled={isCreatingCategory}
                className="bg-[#f77512] hover:bg-[#e05a00] text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl transition-all shadow flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                {isCreatingCategory ? <Loader2 size={14} className="animate-spin" /> : <Check size={16} />}
                <span>Save</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreatingCategoryInline(false);
                  setNewCategoryInput('');
                }}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Category Items Cards Grid */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2.5 sm:gap-3 pt-1">
            {categories.map((cat) => {
              const isEditingThis = editingCategoryId === cat.id;

              if (isEditingThis) {
                return (
                  <div
                    key={cat.id}
                    className="flex items-center gap-2 bg-orange-50 border-2 border-[#f77512] rounded-2xl px-3.5 py-2 shadow-sm animate-in fade-in"
                  >
                    <input
                      type="text"
                      value={editingCategoryName}
                      onChange={(e) => setEditingCategoryName(e.target.value)}
                      className="text-xs sm:text-sm font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-orange-300 outline-none w-32 sm:w-44"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleUpdateCategory(cat.id, editingCategoryName);
                        if (e.key === 'Escape') setEditingCategoryId(null);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleUpdateCategory(cat.id, editingCategoryName)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                      title="Save Category Name"
                    >
                      <Check size={14} />
                      <span>Save</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingCategoryId(null)}
                      className="text-gray-500 hover:text-slate-800 p-1 hover:bg-gray-200 rounded-lg cursor-pointer"
                      title="Cancel"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              }

              return (
                <div
                  key={cat.id}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-slate-50 text-slate-800 border border-slate-200 hover:border-slate-300 hover:bg-slate-100/80 transition-all shadow-xs"
                >
                  <span className="font-extrabold text-slate-900">{cat.name}</span>

                  {/* Prominent Edit & Delete Buttons */}
                  <div className="flex items-center gap-1.5 border-l border-slate-300 pl-2.5 ml-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategoryId(cat.id);
                        setEditingCategoryName(cat.name);
                      }}
                      className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-[#f77512] bg-white hover:bg-orange-50 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-orange-200 transition-all cursor-pointer shadow-xs active:scale-95"
                      title={`Edit "${cat.name}"`}
                    >
                      <Pencil size={13} className="text-[#f77512]" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
                          handleDeleteCategory(cat.id);
                        }
                      }}
                      className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 bg-white hover:bg-rose-50 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-rose-200 transition-all cursor-pointer shadow-xs active:scale-95"
                      title={`Delete "${cat.name}"`}
                    >
                      <Trash2 size={13} className="text-rose-500" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Controls Bar (Search + Category Filter Pills like Previous) ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-gray-200/80 shadow-sm">
        <div className="relative flex items-center w-full md:w-80 h-11 rounded-2xl bg-gray-100/80 px-3.5 border border-gray-200 focus-within:border-[#f77512] focus-within:bg-white transition-all">
          <Search size={18} className="text-gray-400 shrink-0 mr-2" />
          <input
            type="text"
            id="menu-search"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent outline-none text-sm font-medium text-slate-800 placeholder-gray-400"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600 cursor-pointer">
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {allCategoryPills.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all cursor-pointer ${isActive
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

      {/* ── Menu Grid ── */}
      {cardItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200/80 flex flex-col items-center justify-center min-h-[300px]">
          <Utensils size={48} className="text-gray-300 mb-3" />
          <h3 className="text-xl font-bold text-slate-800 mb-1">
            {searchQuery || selectedCategory !== 'All' ? 'No Items Found' : 'Your menu is empty'}
          </h3>
          {(searchQuery || selectedCategory !== 'All') && (
            <p className="text-gray-500 text-sm max-w-md mb-6">
              Try a different search or category filter.
            </p>
          )}
          {!searchQuery && selectedCategory === 'All' && (
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="bg-[#f77512] hover:bg-[#e05a00] text-white font-bold px-6 py-3 rounded-2xl transition-all shadow-md flex items-center gap-2 text-sm cursor-pointer"
            >
              <Plus size={18} /> Add First Item
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cardItems.map((item) => (
            <div key={item.id} className="relative">
              <FoodCard
                {...item}
                variant="vendor"
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
                onToggleAvailability={handleToggleAvailability}
              />
              {/* Sold-out overlay badge */}
              {!item.isAvailable && (
                <div className="absolute inset-0 rounded-[30px] flex items-center justify-center pointer-events-none">
                  <span className="bg-slate-900/80 text-white text-xs font-black px-4 py-2 rounded-full backdrop-blur-sm border border-white/20">
                    SOLD OUT
                  </span>
                </div>
              )}
              {/* Sold-out toggle button */}
              <button
                type="button"
                onClick={() => handleToggleAvailability(item.id)}
                disabled={isTogglingId === item.id}
                className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 text-[10px] font-black bg-white/90 backdrop-blur-sm text-slate-700 hover:bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap"
              >
                {isTogglingId === item.id ? (
                  <Loader2 size={12} className="animate-spin inline" />
                ) : item.isAvailable ? (
                  'Mark Sold Out'
                ) : (
                  'Mark Available'
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── CREATE / EDIT MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-gray-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">

            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-6 sm:p-8 flex items-center justify-between">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                {editingItemId ? 'Edit Menu Item' : 'Create New Menu Item'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="bg-white/10 hover:bg-white/20 p-2.5 rounded-full text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Shake animation — scoped to modal */}
            <style>{`
              @keyframes field-shake {
                0%   { transform: translateX(0); }
                15%  { transform: translateX(-6px); }
                30%  { transform: translateX(5px); }
                45%  { transform: translateX(-4px); }
                60%  { transform: translateX(3px); }
                75%  { transform: translateX(-2px); }
                90%  { transform: translateX(1px); }
                100% { transform: translateX(0); }
              }
              .shake { animation: field-shake 0.4s ease-in-out; }
            `}</style>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 flex flex-col gap-5">

              {/* 1. Image */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  Food Image
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative w-full h-44 sm:h-48 rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden group select-none ${
                    isDraggingImage
                      ? 'border-[#f77512] bg-[#f77512]/10 scale-[1.01]'
                      : formData.imagePreview
                      ? 'border-gray-200 bg-slate-900 shadow-sm'
                      : 'border-gray-300 bg-gray-50/80 hover:bg-white hover:border-[#f77512]/60 hover:shadow-sm'
                  }`}
                >
                  {formData.imagePreview ? (
                    <>
                      <img
                        src={formData.imagePreview}
                        alt="Food preview"
                        className="w-full h-full object-cover"
                      />
                      {/* Overlay controls on image hover */}
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                        <label className="bg-white text-slate-900 text-xs font-extrabold px-4 py-2.5 rounded-full shadow-lg hover:bg-gray-100 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95">
                          <Upload size={14} className="text-[#f77512]" />
                          <span>Change Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormData((prev) => ({ ...prev, imagePreview: '', imageUrl: '' }));
                          }}
                          className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-extrabold px-4 py-2.5 rounded-full shadow-lg transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                        >
                          <X size={14} />
                          <span>Remove</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <label className="w-full h-full flex flex-col items-center justify-center p-6 cursor-pointer gap-2.5">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <div className="w-14 h-14 rounded-2xl bg-[#f77512]/10 flex items-center justify-center text-[#f77512] shadow-sm group-hover:scale-110 group-hover:bg-[#f77512] group-hover:text-white transition-all duration-300">
                        <Upload size={26} strokeWidth={2.5} />
                      </div>
                      <div className="flex flex-col items-center text-center gap-1">
                        <p className="text-slate-900 font-extrabold text-sm sm:text-base tracking-tight">
                          Upload Food Image
                        </p>
                        <p className="text-slate-500 font-semibold text-xs sm:text-sm">
                          Drag & Drop or <span className="text-[#f77512] underline decoration-2 underline-offset-2 font-bold">Click to Upload</span>
                        </p>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {/* 2. Item Name */}
              <div>
                <label htmlFor="menu-item-name" className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  Item Name *
                </label>
                <input
                  id="menu-item-name"
                  type="text"
                  placeholder={fieldErrors.name ? 'Item name is required' : 'e.g. Classic Cheeseburger'}
                  value={formData.name}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, name: e.target.value }));
                    if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: false }));
                  }}
                  className={`w-full h-12 px-4 rounded-xl border focus:ring-2 outline-none font-semibold text-base transition-all ${fieldErrors.name
                      ? 'shake border-rose-400 ring-rose-200 bg-rose-50 placeholder-rose-400 focus:border-rose-400 focus:ring-rose-200'
                      : 'border-gray-300 focus:border-[#f77512] focus:ring-[#f77512]/20 text-slate-800'
                    }`}
                />
              </div>

              {/* 3. Description */}
              <div>
                <label htmlFor="menu-item-desc" className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  About this item
                </label>
                <textarea
                  id="menu-item-desc"
                  rows={2}
                  placeholder="Describe ingredients, taste, and special highlights..."
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3.5 rounded-xl border border-gray-300 focus:border-[#f77512] focus:ring-2 focus:ring-[#f77512]/20 outline-none text-slate-800 font-medium text-sm transition-all resize-none"
                />
              </div>

              {/* 4. Category & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Category Dropdown */}
                <div className="relative">
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                    Category *
                  </label>
                  <div
                    onClick={() => {
                      setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
                      setIsCreatingCategoryInline(false);
                      if (fieldErrors.category) setFieldErrors((prev) => ({ ...prev, category: false }));
                    }}
                    className={`w-full h-12 px-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between font-medium text-sm select-none ${fieldErrors.category
                        ? 'shake border-rose-400 ring-2 ring-rose-200 bg-rose-50'
                        : isCategoryDropdownOpen
                          ? 'border-[#f77512] ring-2 ring-[#f77512]/20 bg-white shadow-sm'
                          : 'border-gray-300 bg-gray-50/80 hover:bg-white'
                      }`}
                  >
                    <span className={`truncate ${fieldErrors.category && !categories.find((c) => c.id === formData.categoryId)
                        ? 'text-rose-400 font-semibold'
                        : 'text-slate-800'
                      }`}>
                      {categories.find((c) => c.id === formData.categoryId)?.name
                        || (fieldErrors.category ? 'Category is required' : 'Select Category')}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-200 ${fieldErrors.category
                          ? 'text-rose-400'
                          : isCategoryDropdownOpen ? 'rotate-180 text-[#f77512]' : 'text-gray-500'
                        }`}
                    />
                  </div>

                  {isCategoryDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-30 bg-transparent" onClick={() => setIsCategoryDropdownOpen(false)} />
                      <div
                        className="absolute top-full left-0 right-0 mt-2 z-40 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 p-2 overflow-hidden flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-150"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="max-h-40 overflow-y-auto no-scrollbar flex flex-col gap-0.5">
                          {categories.map((cat) => {
                            const isSelected = formData.categoryId === cat.id;
                            return (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => { setFormData((prev) => ({ ...prev, categoryId: cat.id })); setIsCategoryDropdownOpen(false); }}
                                className={`w-full text-left px-3.5 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-between cursor-pointer ${isSelected
                                    ? 'bg-[#f77512]/10 text-[#f77512] font-bold'
                                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80'
                                  }`}
                              >
                                <span>{cat.name}</span>
                                {isSelected && <Check size={16} className="text-[#f77512] shrink-0 stroke-[2.5]" />}
                              </button>
                            );
                          })}
                        </div>

                        <div className="pt-2 border-t border-gray-100">
                          {isCreatingCategoryInline ? (
                            <div className="flex items-center gap-2 p-1">
                              <input
                                type="text"
                                placeholder="New Category Name..."
                                value={newCategoryInput}
                                onChange={(e) => setNewCategoryInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCategory(); } }}
                                className="w-full h-10 px-3.5 rounded-xl border border-gray-300 outline-none text-sm font-medium text-slate-800 focus:border-[#f77512]"
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={handleAddCategory}
                                disabled={isCreatingCategory}
                                className="bg-[#f77512] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#e05a00] shrink-0 shadow-sm disabled:opacity-50 cursor-pointer"
                              >
                                {isCreatingCategory ? <Loader2 size={14} className="animate-spin" /> : 'Add'}
                              </button>
                              <button type="button" onClick={() => setIsCreatingCategoryInline(false)} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg cursor-pointer">
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

                {/* Price */}
                <div>
                  <label htmlFor="menu-item-price" className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                    Price *
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-slate-900 font-extrabold text-base select-none">
                      ₹
                    </span>
                    <input
                      id="menu-item-price"
                      type="text"
                      placeholder={fieldErrors.price ? 'Price is required' : '199'}
                      value={formData.price}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, price: e.target.value }));
                        if (fieldErrors.price) setFieldErrors((prev) => ({ ...prev, price: false }));
                      }}
                      className={`w-full h-12 pl-9 pr-4 rounded-xl border focus:ring-2 outline-none font-semibold text-base transition-all ${fieldErrors.price
                          ? 'shake border-rose-400 ring-rose-200 bg-rose-50 placeholder-rose-400 focus:border-rose-400 focus:ring-rose-200'
                          : 'border-gray-300 focus:border-[#f77512] focus:ring-[#f77512]/20 text-slate-800'
                        }`}
                    />
                  </div>
                </div>
              </div>

              {/* 5. Food Type */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  Food Type
                </label>
                <div className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-2xl border border-gray-200">
                  {(['veg', 'non-veg', 'egg'] as const).map((type) => {
                    const labels = { veg: 'Veg', 'non-veg': 'Non-Veg', egg: 'Egg' };
                    const styles = {
                      veg: { active: 'bg-emerald-50 border-emerald-500 text-emerald-700', dot: 'border-emerald-600 bg-emerald-600' },
                      'non-veg': { active: 'bg-rose-50 border-rose-500 text-rose-700', dot: 'border-rose-600 bg-rose-600' },
                      egg: { active: 'bg-amber-50 border-amber-500 text-amber-700', dot: 'border-amber-500 bg-amber-500' },
                    };
                    const isActive = formData.foodType === type;
                    return (
                      <label
                        key={type}
                        className={`flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer font-extrabold text-xs select-none ${isActive ? styles[type].active : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
                          }`}
                      >
                        <input
                          type="radio"
                          name="foodType"
                          value={type}
                          checked={isActive}
                          onChange={() => setFormData((prev) => ({ ...prev, foodType: type }))}
                          className="hidden"
                        />
                        <span className={`w-4 h-4 rounded-sm border-2 ${styles[type].dot.split(' ')[0]} flex items-center justify-center p-0.5 bg-white shrink-0`}>
                          {isActive && <span className={`w-2 h-2 rounded-full ${styles[type].dot.split(' ')[1]}`} />}
                        </span>
                        {labels[type]}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 6. Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <label className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${formData.isBestSeller ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-sm' : 'bg-gray-50 border-gray-200 text-slate-700'}`}>
                  <input
                    type="checkbox"
                    checked={formData.isBestSeller}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isBestSeller: e.target.checked }))}
                    className="w-4 h-4 accent-[#f77512] rounded cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <span className="font-extrabold text-xs text-amber-950">⭐ Bestseller</span>
                    <span className="text-[10px] text-gray-500 font-medium">Mark as Bestseller</span>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${formData.isTodaysSpecial ? 'bg-orange-50 border-orange-400 text-orange-900 shadow-sm' : 'bg-gray-50 border-gray-200 text-slate-700'}`}>
                  <input
                    type="checkbox"
                    checked={formData.isTodaysSpecial}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isTodaysSpecial: e.target.checked }))}
                    className="w-4 h-4 accent-[#f77512] rounded cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <span className="font-extrabold text-xs text-orange-950">🔥 Today&apos;s Special</span>
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
                  disabled={isSaving}
                  className="bg-[#f77512] hover:bg-[#e05a00] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black px-7 py-3 rounded-xl shadow-md transition-all text-sm cursor-pointer flex items-center gap-2 active:scale-95"
                >
                  {isSaving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Plus size={18} />
                  )}
                  {isSaving ? 'Saving...' : editingItemId ? 'Save Changes' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
