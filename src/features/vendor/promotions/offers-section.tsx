'use client';

import React, { useState, useEffect, useTransition, useCallback, useRef } from 'react';
import { Plus, Edit3, Power, Trash2, X, Check, Loader2, ChevronRight, ChevronLeft, Tag, Target, Calendar, Clock, Eye, Upload, Image as ImageIcon } from 'lucide-react';
import OfferIcon from '@/components/icons/offer-icon';
import { OfferCard } from '@/components/shared/offer-card';
import type { OfferCardData } from '@/components/shared/offer-card';
import { uploadMenuImageAction } from '@/actions/menu/upload-menu-image';

import { useVendor } from '@/context/vendor-context';
import { createPromotionAction } from '@/actions/promotion/create-promotion';
import { updatePromotionAction } from '@/actions/promotion/update-promotion';
import { deletePromotionAction } from '@/actions/promotion/delete-promotion';

import { getOfferImage } from '@/lib/images';

import type { Promotion } from '../../../../drizzle/schema/promotions';

// CARD_COLOR_PALETTES removed — vendor offer cards now use the shared
// OfferCard component (with GRADIENT_PALETTES) for visual parity with the public menu.

// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildBadgePreview(offerType: string, offerValue: string): string {
  const val = parseFloat(offerValue);
  if (!offerType || isNaN(val) || val <= 0) return '';
  if (offerType === 'percentage') return `${val}% OFF`;
  if (offerType === 'flat') return `₹${val} OFF`;
  if (offerType === 'bxgy') return val === 1 ? 'Buy 1 Get 1' : `Buy ${val} Get ${val}`;
  return '';
}

function formatEndDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return String(date);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// ─── Wizard Step Indicator ────────────────────────────────────────────────────
const STEPS = [
  { label: 'Offer Type', icon: Tag },
  { label: 'Apply To', icon: Target },
  { label: 'Schedule', icon: Calendar },
  { label: 'Preview', icon: Eye },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function OffersSection() {
  const { shop, offers: contextOffers, categories: contextCategories, dbItems, promotionsLoading: isLoading, refetchPromotions } = useVendor();
  const [offers, setOffers] = useState<Promotion[]>(contextOffers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Promotion | null>(null);
  const [wizardStep, setWizardStep] = useState(1);

  // ── Form State ────────────────────────────────────────────────────────────
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  // Step 1 — Offer Type & Value
  const [formOfferType, setFormOfferType] = useState<'percentage' | 'flat' | 'bxgy'>('percentage');
  const [formOfferValue, setFormOfferValue] = useState('');
  // Step 2 — Targeting
  const [formTargetType, setFormTargetType] = useState<'all' | 'category' | 'item'>('all');
  const [formTargetIds, setFormTargetIds] = useState<string[]>([]);
  // Step 3 — Schedule
  const [formScheduleType, setFormScheduleType] = useState<'always' | 'date' | 'time'>('always');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formStartTime, setFormStartTime] = useState('');
  const [formEndTime, setFormEndTime] = useState('');

  const [isSaving, startSavingTransition] = useTransition();
  const [isDeleting, startDeletingTransition] = useTransition();
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // ── Banner State (hold-until-save pattern — no orphan images) ──────────────
  // formBannerKey: the R2 key currently in DB (null for new offers)
  // formBannerFile: the new File the vendor selected (not yet uploaded)
  // formBannerPreview: local blob URL for instant preview
  const [formBannerKey, setFormBannerKey] = useState<string | null>(null);
  const [formBannerFile, setFormBannerFile] = useState<File | null>(null);
  const [formBannerPreview, setFormBannerPreview] = useState<string | null>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const notify = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => { setOffers(contextOffers); }, [contextOffers]);

  useEffect(() => {
    document.body.style.overflow = (isModalOpen || !!deleteConfirmTarget) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isModalOpen, deleteConfirmTarget]);

  const resetForm = () => {
    setFormTitle('');
    setFormDescription('');
    setFormIsActive(true);
    setFormOfferType('percentage');
    setFormOfferValue('');
    setFormTargetType('all');
    setFormTargetIds([]);
    setFormScheduleType('always');
    setFormStartDate('');
    setFormEndDate('');
    setFormStartTime('');
    setFormEndTime('');
    setFormBannerKey(null);
    setFormBannerFile(null);
    setFormBannerPreview(null);
    try {
      localStorage.removeItem('mystreetmenu_offer_draft_banner');
    } catch {}
    setWizardStep(1);
  };

  const handleOpenCreateModal = () => {
    setEditingOffer(null);
    resetForm();
    try {
      const savedDraft = localStorage.getItem('mystreetmenu_offer_draft_banner');
      if (savedDraft) {
        setFormBannerPreview(savedDraft);
      }
    } catch {}
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (offer: Promotion) => {
    setEditingOffer(offer);
    setFormTitle(offer.title);
    setFormDescription(offer.description ?? '');
    setFormIsActive(offer.isActive);
    setFormOfferType((offer.offerType as 'percentage' | 'flat' | 'bxgy') ?? 'percentage');
    setFormOfferValue(offer.offerValue ?? '');
    setFormTargetType((offer.targetType as 'all' | 'category' | 'item') ?? 'all');
    setFormTargetIds(offer.targetIds ?? []);
    const hasDate = offer.startDate || offer.endDate;
    const hasTime = offer.startTime || offer.endTime;
    setFormScheduleType(hasTime ? 'time' : hasDate ? 'date' : 'always');
    setFormStartDate(offer.startDate ?? '');
    setFormEndDate(offer.endDate ?? '');
    setFormStartTime(offer.startTime ?? '');
    setFormEndTime(offer.endTime ?? '');
    // Pre-fill banner: existing R2 key stays as bannerKey (no preview needed — it's already saved)
    setFormBannerKey(offer.bannerImage ?? null);
    setFormBannerFile(null);
    setFormBannerPreview(null);
    setWizardStep(1);
    setIsModalOpen(true);
  };

  const handleToggleStatus = (offer: Promotion) => {
    const fd = new FormData();
    fd.set('id', offer.id);
    fd.set('isActive', String(!offer.isActive));
    startSavingTransition(async () => {
      const result = await updatePromotionAction(fd);
      if (result.success && result.data) {
        setOffers(prev => prev.map(o => o.id === offer.id ? result.data! : o));
        notify(result.data.isActive ? 'Offer enabled' : 'Offer disabled');
      }
    });
  };

  const handleDeleteOffer = (id: string) => {
    startDeletingTransition(async () => {
      const result = await deletePromotionAction(id);
      if (result.success) {
        setOffers(prev => prev.filter(o => o.id !== id));
        notify('Offer deleted');
      } else {
        notify(result.error ?? 'Failed to delete', 'error');
      }
    });
  };

  const toggleTargetId = (id: string) => {
    setFormTargetIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSaveOffer = () => {
    if (!formTitle.trim() || !shop?.id) return;
    if (!formOfferValue || parseFloat(formOfferValue) <= 0) {
      notify('Please enter a valid offer value', 'error');
      return;
    }

    startSavingTransition(async () => {
      // ── Step 1: Upload banner to R2 (if a new file was chosen) ────────────
      // Safe order: upload new → DB write → delete old (never delete first)
      let bannerKey = formBannerKey; // keep existing key by default

      if (formBannerFile) {
        setIsUploadingBanner(true);
        try {
          const uploadFd = new FormData();
          uploadFd.append('file', formBannerFile);
          uploadFd.append('shopId', shop.id);
          uploadFd.append('imageType', 'offer');
          uploadFd.append('format', 'webp');

          const uploadResult = await uploadMenuImageAction(uploadFd);

          if (!uploadResult.success || !uploadResult.data) {
            notify(uploadResult.error ?? 'Banner upload failed.', 'error');
            return;
          }
          bannerKey = uploadResult.data.key;
        } finally {
          setIsUploadingBanner(false);
        }
      }

      // ── Step 2: Build FormData and call the server action ─────────────────
      const fd = new FormData();
      fd.set('title', formTitle);
      fd.set('description', formDescription);
      fd.set('isActive', String(formIsActive));
      fd.set('offerType', formOfferType);
      fd.set('offerValue', formOfferValue);
      fd.set('targetType', formTargetType);
      fd.set('targetIds', JSON.stringify(formTargetIds));
      // Schedule
      if (formScheduleType === 'date') {
        if (formStartDate) fd.set('startDate', formStartDate);
        if (formEndDate) fd.set('endDate', formEndDate);
      } else if (formScheduleType === 'time') {
        if (formStartTime) fd.set('startTime', formStartTime);
        if (formEndTime) fd.set('endTime', formEndTime);
      }
      // Banner key (null = remove, undefined = keep untouched for toggle-only updates)
      if (bannerKey !== undefined) fd.set('bannerImage', bannerKey ?? '');

      let result;
      if (editingOffer) {
        fd.set('id', editingOffer.id);
        result = await updatePromotionAction(fd);
      } else {
        fd.set('shopId', shop!.id);
        fd.set('type', 'offer');
        result = await createPromotionAction(fd);
      }

      if (result.success && result.data) {
        if (editingOffer) {
          setOffers(prev => prev.map(o => o.id === editingOffer.id ? result.data! : o));
          notify('Offer updated!');
        } else {
          setOffers(prev => [result.data!, ...prev]);
          notify('Offer created!');
        }
        setIsModalOpen(false);
        resetForm();
      } else {
        // ── Rollback: DB failed → fire-and-forget delete just-uploaded banner ─
        if (formBannerFile && bannerKey && bannerKey !== formBannerKey) {
          fetch('/api/images/delete', {
            method: 'POST',
            body: JSON.stringify({ key: bannerKey }),
            headers: { 'Content-Type': 'application/json' },
          }).catch(() => {});
        }
        notify(result.error ?? 'Failed to save offer', 'error');
      }
    });
  };

  // ── Banner file selection handler ──────────────────────────────────────────
  const handleBannerFileChange = useCallback((file: File | null) => {
    if (!file) return;
    setFormBannerFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setFormBannerPreview(dataUrl);
      try {
        localStorage.setItem('mystreetmenu_offer_draft_banner', dataUrl);
      } catch {}
    };
    reader.readAsDataURL(file);
  }, []);

  const handleBannerInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    handleBannerFileChange(file);
    // Reset input value so the same file can be re-selected
    e.target.value = '';
  };

  const handleBannerRemove = () => {
    setFormBannerFile(null);
    setFormBannerPreview(null);
    try {
      localStorage.removeItem('mystreetmenu_offer_draft_banner');
    } catch {}
  };

  const handleClearSavedBanner = () => {
    setFormBannerKey(null);
    setFormBannerFile(null);
    setFormBannerPreview(null);
    try {
      localStorage.removeItem('mystreetmenu_offer_draft_banner');
    } catch {}
  };

  // ── Drag-and-drop handlers for banner ─────────────────────────────────────
  const [isDraggingBanner, setIsDraggingBanner] = useState(false);
  const handleBannerDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDraggingBanner(true); };
  const handleBannerDragLeave = () => setIsDraggingBanner(false);
  const handleBannerDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingBanner(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) handleBannerFileChange(file);
  };

  // ── Badge Preview ──────────────────────────────────────────────────────────
  const badgePreview = buildBadgePreview(formOfferType, formOfferValue);
  const targetSummary =
    formTargetType === 'all'
      ? 'Entire Menu'
      : formTargetType === 'category'
        ? contextCategories.filter(c => formTargetIds.includes(c.id)).map(c => c.name).join(', ') || 'No categories selected'
        : dbItems.filter(i => formTargetIds.includes(i.id)).map(i => i.name).join(', ') || 'No items selected';

  const canGoNext =
    wizardStep === 1 ? (formTitle.trim().length > 0 && parseFloat(formOfferValue) > 0) :
    wizardStep === 2 ? (formTargetType === 'all' || formTargetIds.length > 0) :
    true;

  return (
    <div className="w-full max-w-[1200px] mt-1 sm:mt-4 flex flex-col gap-4 sm:gap-6 animate-in fade-in duration-200">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-full shadow-2xl border flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-200 whitespace-nowrap text-xs sm:text-sm font-bold ${
          toast.type === 'success' ? 'bg-slate-900 text-white border-slate-700/80' : 'bg-rose-900 text-white border-rose-700/80'
        }`}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-3 bg-white p-3.5 sm:p-6 md:p-8 rounded-2xl sm:rounded-[2rem] border border-gray-200/80 shadow-xs sm:shadow-sm">
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
          <OfferIcon className="w-7 h-7 sm:w-10 sm:h-10 shrink-0" />
          <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight truncate">Offers</h1>
        </div>
        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center gap-1.5 bg-[#f77512] hover:bg-[#e05a00] text-white font-black px-3.5 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl transition-all shadow-sm hover:shadow-md active:scale-95 text-xs sm:text-sm cursor-pointer shrink-0 whitespace-nowrap"
        >
          <Plus size={16} strokeWidth={2.5} className="shrink-0" />
          <span>Create Offer</span>
        </button>
      </div>

      <hr className="border-gray-200 my-1" />

      {/* Offers Grid */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
            Active Offers
            <span className="bg-orange-100 text-[#f77512] text-[10px] sm:text-xs font-black px-2 sm:px-2.5 py-0.5 rounded-full border border-orange-200">
              {offers.filter(o => o.isActive).length} Active
            </span>
          </h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 size={32} className="animate-spin text-[#f77512]" />
          </div>
        ) : offers.length === 0 ? (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-center border border-gray-200/80 flex flex-col items-center justify-center min-h-[160px] sm:min-h-[220px]">
            <OfferIcon className="w-10 h-10 sm:w-14 sm:h-14 mb-2 sm:mb-3" />
            <h3 className="text-sm sm:text-base font-bold text-slate-800 mb-3 sm:mb-4">No Offers Yet</h3>
            <button type="button" onClick={handleOpenCreateModal} className="bg-[#f77512] hover:bg-[#e05a00] text-white font-bold px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl transition-all shadow-md flex items-center gap-1.5 sm:gap-2 text-xs cursor-pointer">
              <Plus size={15} /> Create Offer
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
            {offers.map((offer, idx) => {
              let targetNames: string[] = [];
              if (offer.targetType === 'category' && offer.targetIds?.length) {
                targetNames = contextCategories
                  .filter((c) => offer.targetIds!.includes(c.id))
                  .map((c) => c.name);
              } else if (offer.targetType === 'item' && offer.targetIds?.length) {
                targetNames = dbItems
                  .filter((i) => offer.targetIds!.includes(i.id))
                  .map((i) => i.name);
              }

              const offerCardData: OfferCardData = {
                id: offer.id,
                title: offer.title,
                badge: buildBadgePreview(offer.offerType ?? '', offer.offerValue ?? ''),
                type: offer.offerType ?? 'percentage',
                targetType: offer.targetType ?? 'all',
                targetCount:
                  offer.targetType === 'all'
                    ? 0
                    : (offer.targetIds?.length ?? 0),
                targetNames,
                startTime: offer.startTime ?? null,
                endTime: offer.endTime ?? null,
                // Vendor card: show real banner if present (resolved via CDN helper)
                banner: offer.bannerImage
                  ? { image: getOfferImage(offer.bannerImage), alt: offer.title }
                  : null,
              };

              return (
                <div
                  key={offer.id}
                  className={`relative transition-all duration-200 ${
                    !offer.isActive ? 'opacity-50 grayscale-[40%]' : ''
                  }`}
                >
                  <OfferCard offer={offerCardData} index={idx} className="w-full" />

                  {/* Action overlay — positioned over the card */}
                  <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(offer)}
                      className="bg-white/90 backdrop-blur-sm text-slate-800 hover:bg-white text-[10px] font-extrabold py-1 px-2.5 rounded-full flex items-center gap-1 shadow-md transition-all cursor-pointer active:scale-95"
                    >
                      <Edit3 size={10} /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(offer)}
                      disabled={isSaving}
                      className={`text-[10px] font-extrabold py-1 px-2.5 rounded-full flex items-center gap-1 shadow-md transition-all cursor-pointer active:scale-95 ${
                        offer.isActive
                          ? 'bg-black/40 text-white hover:bg-black/60'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      <Power size={10} /> {offer.isActive ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setDeleteConfirmTarget({ id: offer.id, title: offer.title });
                      }}
                      disabled={isDeleting}
                      className="bg-rose-500/80 hover:bg-rose-600 text-white p-1.5 rounded-full shadow-md transition-all cursor-pointer active:scale-95"
                      title="Delete"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Wizard Modal ─────────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-gray-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">

            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <OfferIcon className="w-7 h-7 shrink-0" />
                <div>
                  <h2 className="text-lg font-black tracking-tight">{editingOffer ? 'Edit Offer' : 'Create Offer'}</h2>
                  <p className="text-slate-400 text-xs font-medium">Step {wizardStep} of {STEPS.length} — {STEPS[wizardStep - 1].label}</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full text-gray-300 hover:text-white transition-colors cursor-pointer">
                <X size={16} />
              </button>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center px-6 pt-5 gap-1">
              {STEPS.map((s, i) => {
                const StepIcon = s.icon;
                const done = i + 1 < wizardStep;
                const active = i + 1 === wizardStep;
                return (
                  <React.Fragment key={s.label}>
                    <div className={`flex flex-col items-center gap-0.5 ${active ? '' : done ? 'opacity-70' : 'opacity-30'}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${active ? 'bg-[#f77512] text-white' : done ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                        {done ? <Check size={12} /> : <StepIcon size={12} />}
                      </div>
                      <span className="text-[9px] font-bold text-gray-500 hidden sm:block">{s.label}</span>
                    </div>
                    {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-1 rounded ${i + 1 < wizardStep ? 'bg-emerald-400' : 'bg-gray-200'}`} />}
                  </React.Fragment>
                );
              })}
            </div>

            <div className="p-6 flex flex-col gap-5">

              {/* ── STEP 1: Offer Type + Value ─────────────────────────────── */}
              {wizardStep === 1 && (
                <>
                  {/* ── Banner Upload (Top of Modal) ─────────────────────── */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Offer Banner
                      <span className="ml-1.5 text-[10px] font-semibold text-slate-400 normal-case tracking-normal">(optional · 2:1 ratio · max 5 MB)</span>
                    </label>

                    {/* Active preview: new file selected */}
                    {formBannerPreview ? (
                      <div className="relative w-full h-36 rounded-2xl overflow-hidden shadow-sm border border-gray-200 group">
                        <img
                          src={formBannerPreview}
                          alt="Banner preview"
                          className="w-full h-full object-cover"
                        />
                        {/* Overlay with change/remove actions */}
                        <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                          <label className="bg-white text-slate-900 text-xs font-extrabold px-4 py-2 rounded-full shadow-lg hover:bg-gray-100 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95">
                            <Upload size={12} className="text-[#f77512]" />
                            <span>Change</span>
                            <input
                              ref={bannerInputRef}
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/avif"
                              onChange={handleBannerInputChange}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={handleBannerRemove}
                            className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-extrabold px-4 py-2 rounded-full shadow-lg transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                          >
                            <X size={12} />
                            <span>Remove</span>
                          </button>
                        </div>
                        <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                          New
                        </span>
                      </div>
                    ) : formBannerKey ? (
                      /* Existing saved banner (edit mode — no local preview available) */
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                          <ImageIcon size={18} className="text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-emerald-800">Banner saved</p>
                          <p className="text-[10px] text-emerald-600 font-medium truncate">{formBannerKey}</p>
                        </div>
                        <div className="flex gap-1.5">
                          <label className="bg-white border border-gray-200 text-slate-700 text-[10px] font-bold px-2.5 py-1.5 rounded-lg cursor-pointer hover:bg-gray-50 flex items-center gap-1 shadow-xs">
                            <Upload size={10} className="text-[#f77512]" />
                            Replace
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/avif"
                              onChange={handleBannerInputChange}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={handleClearSavedBanner}
                            className="bg-rose-50 border border-rose-200 text-rose-600 text-[10px] font-bold px-2.5 py-1.5 rounded-lg cursor-pointer hover:bg-rose-100 flex items-center gap-1"
                          >
                            <X size={10} /> Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Drop zone — no banner set yet */
                      <div
                        onDragOver={handleBannerDragOver}
                        onDragLeave={handleBannerDragLeave}
                        onDrop={handleBannerDrop}
                        className={`relative w-full h-28 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden group select-none cursor-pointer ${
                          isDraggingBanner
                            ? 'border-[#f77512] bg-[#f77512]/10 scale-[1.01]'
                            : 'border-gray-300 bg-gray-50/80 hover:bg-white hover:border-[#f77512]/60 hover:shadow-sm'
                        }`}
                      >
                        <label className="w-full h-full flex flex-col items-center justify-center p-4 cursor-pointer gap-1.5">
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/avif"
                            onChange={handleBannerInputChange}
                            className="hidden"
                          />
                          <div className="w-9 h-9 rounded-xl bg-[#f77512]/10 flex items-center justify-center text-[#f77512] group-hover:scale-110 group-hover:bg-[#f77512] group-hover:text-white transition-all duration-300">
                            <Upload size={18} strokeWidth={2.5} />
                          </div>
                          <div className="text-center">
                            <p className="text-slate-700 font-bold text-xs">Upload Banner Image</p>
                            <p className="text-slate-400 text-[10px] font-medium">
                              Drag & drop or <span className="text-[#f77512] underline decoration-2 underline-offset-2">click to browse</span>
                            </p>
                          </div>
                        </label>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Offer Title <span className="text-red-500">*</span></label>
                    <input type="text" required placeholder="e.g. 🔥 Weekend Special" value={formTitle} onChange={e => setFormTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-slate-900 placeholder:text-slate-400 focus:border-[#f77512] focus:ring-2 focus:ring-[#f77512]/20 text-sm font-semibold outline-none transition-all" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Discount Type <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-3 gap-2">
                      {([['percentage', '% Off', '20% OFF'], ['flat', '₹ Off', '₹50 OFF'], ['bxgy', 'Buy X Get Y', 'B1G1']] as const).map(([val, label, ex]) => (
                        <button key={val} type="button" onClick={() => { setFormOfferType(val as 'percentage' | 'flat' | 'bxgy'); if (val === 'bxgy') setFormOfferValue('1'); }} className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all cursor-pointer text-center ${formOfferType === val ? 'border-[#f77512] bg-orange-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                          <span className="text-xs font-black text-slate-800">{label}</span>
                          <span className="text-[9px] text-slate-400 font-semibold">{ex}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {formOfferType !== 'bxgy' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        {formOfferType === 'percentage' ? 'Discount %' : 'Flat Discount (₹)'} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input type="number" min="1" max={formOfferType === 'percentage' ? '100' : undefined} step="1" placeholder={formOfferType === 'percentage' ? 'e.g. 20' : 'e.g. 50'} value={formOfferValue} onChange={e => setFormOfferValue(e.target.value)} className="w-full px-4 py-3 pr-20 rounded-xl bg-gray-50 border border-gray-200 text-slate-900 placeholder:text-slate-400 focus:border-[#f77512] focus:ring-2 focus:ring-[#f77512]/20 text-sm font-bold outline-none transition-all" />
                        {badgePreview && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#f77512] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                            {badgePreview}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {formOfferType === 'bxgy' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Buy X Get X — Quantity</label>
                      <select value={formOfferValue} onChange={e => setFormOfferValue(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-slate-900 focus:border-[#f77512] focus:ring-2 focus:ring-[#f77512]/20 text-sm font-semibold outline-none transition-all">
                        <option value="1">Buy 1 Get 1 Free</option>
                        <option value="2">Buy 2 Get 2 Free</option>
                        <option value="3">Buy 3 Get 3 Free</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Description (optional)</label>
                    <textarea rows={2} placeholder="Terms or conditions..." value={formDescription} onChange={e => setFormDescription(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-slate-900 placeholder:text-slate-400 focus:border-[#f77512] focus:ring-2 focus:ring-[#f77512]/20 text-sm font-medium outline-none transition-all resize-none" />
                  </div>
                </>
              )}

              {/* ── STEP 2: Target ─────────────────────────────────────────── */}
              {wizardStep === 2 && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Apply This Offer To</label>
                    <div className="flex flex-col gap-2">
                      {([['all', 'Entire Menu', 'All items get this offer'], ['category', 'Specific Categories', 'All items within selected categories'], ['item', 'Specific Items', 'Only selected menu items']] as const).map(([val, label, desc]) => (
                        <button key={val} type="button" onClick={() => { setFormTargetType(val); setFormTargetIds([]); }} className={`flex items-start gap-3 p-3.5 rounded-xl border-2 transition-all cursor-pointer text-left ${formTargetType === val ? 'border-[#f77512] bg-orange-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                          <span className="mt-0.5">{formTargetType === val ? <Check size={14} className="text-[#f77512]" /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300" />}</span>
                          <div>
                            <p className="text-sm font-black text-slate-800">{label}</p>
                            <p className="text-xs text-gray-400 font-medium">{desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category multi-select */}
                  {formTargetType === 'category' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Select Categories</label>
                      <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                        {contextCategories.length === 0 ? (
                          <p className="text-sm text-gray-400 text-center py-4">No categories found</p>
                        ) : contextCategories.map(cat => (
                          <button key={cat.id} type="button" onClick={() => toggleTargetId(cat.id)} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer text-left ${formTargetIds.includes(cat.id) ? 'border-[#f77512] bg-orange-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                            <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${formTargetIds.includes(cat.id) ? 'bg-[#f77512]' : 'border-2 border-gray-300'}`}>
                              {formTargetIds.includes(cat.id) && <Check size={10} className="text-white" />}
                            </div>
                            <span className="text-sm font-semibold text-slate-800">{cat.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Item multi-select */}
                  {formTargetType === 'item' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Select Items</label>
                      <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-1">
                        {dbItems.length === 0 ? (
                          <p className="text-sm text-gray-400 text-center py-4">No items found</p>
                        ) : dbItems.map(item => (
                          <button key={item.id} type="button" onClick={() => toggleTargetId(item.id)} className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer text-left ${formTargetIds.includes(item.id) ? 'border-[#f77512] bg-orange-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                            <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${formTargetIds.includes(item.id) ? 'bg-[#f77512]' : 'border-2 border-gray-300'}`}>
                              {formTargetIds.includes(item.id) && <Check size={10} className="text-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-800 truncate">{item.name}</p>
                              <p className="text-[10px] text-gray-400">{item.categoryName} · ₹{item.price}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ── STEP 3: Schedule ───────────────────────────────────────── */}
              {wizardStep === 3 && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Schedule Type</label>
                    <div className="flex flex-col gap-2">
                      {([['always', 'Always Active', 'Offer runs with no time limit'], ['date', 'Date Range', 'Set a start and end date'], ['time', 'Happy Hours', 'Apply only during specific hours each day']] as const).map(([val, label, desc]) => (
                        <button key={val} type="button" onClick={() => setFormScheduleType(val)} className={`flex items-start gap-3 p-3.5 rounded-xl border-2 transition-all cursor-pointer text-left ${formScheduleType === val ? 'border-[#f77512] bg-orange-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                          <span className="mt-0.5">{formScheduleType === val ? <Check size={14} className="text-[#f77512]" /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300" />}</span>
                          <div>
                            <p className="text-sm font-black text-slate-800">{label}</p>
                            <p className="text-xs text-gray-400 font-medium">{desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {formScheduleType === 'date' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
                        <input type="date" value={formStartDate} onChange={e => setFormStartDate(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-slate-900 focus:border-[#f77512] focus:ring-2 focus:ring-[#f77512]/20 text-sm font-medium outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">End Date</label>
                        <input type="date" value={formEndDate} onChange={e => setFormEndDate(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-slate-900 focus:border-[#f77512] focus:ring-2 focus:ring-[#f77512]/20 text-sm font-medium outline-none" />
                      </div>
                    </div>
                  )}

                  {formScheduleType === 'time' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Start Time</label>
                        <input type="time" value={formStartTime} onChange={e => setFormStartTime(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-slate-900 focus:border-[#f77512] focus:ring-2 focus:ring-[#f77512]/20 text-sm font-medium outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">End Time</label>
                        <input type="time" value={formEndTime} onChange={e => setFormEndTime(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-slate-900 focus:border-[#f77512] focus:ring-2 focus:ring-[#f77512]/20 text-sm font-medium outline-none" />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Status</label>
                    <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-gray-200">
                      <button type="button" onClick={() => setFormIsActive(true)} className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center ${formIsActive ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'}`}>
                        Active
                      </button>
                      <button type="button" onClick={() => setFormIsActive(false)} className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center ${!formIsActive ? 'bg-slate-700 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'}`}>
                        Disabled
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* ── STEP 4: Preview ────────────────────────────────────────── */}
              {wizardStep === 4 && (
                <div className="flex flex-col gap-4">
                  {/* Live Card Preview */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Card Preview</label>
                    <OfferCard
                      offer={{
                        id: 'preview',
                        title: formTitle || 'Offer Title',
                        badge: badgePreview || 'Special Offer',
                        type: formOfferType,
                        targetType: formTargetType,
                        targetCount: formTargetType === 'all' ? 0 : formTargetIds.length,
                        targetNames:
                          formTargetType === 'category'
                            ? contextCategories.filter((c) => formTargetIds.includes(c.id)).map((c) => c.name)
                            : formTargetType === 'item'
                            ? dbItems.filter((i) => formTargetIds.includes(i.id)).map((i) => i.name)
                            : [],
                        startTime: formStartTime || null,
                        endTime: formEndTime || null,
                        banner: formBannerPreview
                          ? { image: formBannerPreview, alt: formTitle || 'Banner' }
                          : formBannerKey
                          ? { image: getOfferImage(formBannerKey), alt: formTitle || 'Banner' }
                          : null,
                      }}
                      index={0}
                      className="w-full"
                    />
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Offer Summary</h4>
                    {formDescription && <p className="text-xs text-gray-600 font-medium mb-3">{formDescription}</p>}
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="bg-white border border-gray-200 text-slate-700 font-bold px-3 py-1 rounded-full">{targetSummary}</span>
                      {formScheduleType === 'always' && <span className="bg-white border border-gray-200 text-slate-700 font-bold px-3 py-1 rounded-full">Always Active</span>}
                      {formScheduleType === 'date' && formEndDate && <span className="bg-white border border-gray-200 text-slate-700 font-bold px-3 py-1 rounded-full">Until {formatEndDate(formEndDate)}</span>}
                      {formScheduleType === 'time' && formStartTime && <span className="bg-white border border-gray-200 text-slate-700 font-bold px-3 py-1 rounded-full">{formStartTime}–{formEndTime}</span>}
                      <span className={`font-bold px-3 py-1 rounded-full border ${formIsActive ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-gray-100 border-gray-200 text-gray-500'}`}>
                        {formIsActive ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                  </div>

                  {/* Example item preview */}
                  {formOfferType !== 'bxgy' && (
                    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-100/70 border border-orange-200 flex items-center justify-center shrink-0">
                        <Tag size={18} className="text-[#f77512]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-black text-slate-800">Example Item</p>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="text-base font-black text-slate-900">
                            ₹{formOfferType === 'percentage' ? Math.round(300 * (1 - parseFloat(formOfferValue || '0') / 100)) : Math.max(0, 300 - parseFloat(formOfferValue || '0'))}
                          </span>
                          <span className="text-xs text-gray-400 line-through">₹300</span>
                        </div>
                      </div>
                      {badgePreview && (
                        <span className="bg-[#f77512] text-white text-[10px] font-black px-2 py-0.5 rounded-full">{badgePreview}</span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── Navigation Buttons ────────────────────────────────────── */}
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100">
                <div>
                  {wizardStep > 1 && (
                    <button type="button" onClick={() => setWizardStep(s => s - 1)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-slate-600 hover:bg-gray-100 transition-colors cursor-pointer">
                      <ChevronLeft size={14} /> Back
                    </button>
                  )}
                </div>
                <div>
                  {wizardStep < STEPS.length ? (
                    <button type="button" onClick={() => canGoNext && setWizardStep(s => s + 1)} disabled={!canGoNext} className="flex items-center gap-1.5 bg-[#f77512] hover:bg-[#e05a00] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black px-5 py-2.5 rounded-xl shadow-md transition-all text-xs cursor-pointer active:scale-95">
                      Next <ChevronRight size={14} />
                    </button>
                  ) : (
                    <button type="button" onClick={handleSaveOffer} disabled={isSaving || isUploadingBanner} className="flex items-center gap-2 bg-[#f77512] hover:bg-[#e05a00] disabled:opacity-60 text-white font-black px-6 py-2.5 rounded-xl shadow-md transition-all text-xs cursor-pointer active:scale-95">
                      {(isSaving || isUploadingBanner) ? <Loader2 size={14} className="animate-spin" /> : <Check size={16} />}
                      {isUploadingBanner ? 'Uploading...' : editingOffer ? 'Update Offer' : 'Save Offer'}
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── Gokul Construction Style Delete Confirmation Modal ────────────────────── */}
      {deleteConfirmTarget && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setDeleteConfirmTarget(null)}
        >
          <div
            className="bg-white border border-black/10 rounded-[28px] max-w-sm w-full p-6 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 mb-4 shadow-sm">
                <Trash2 size={24} />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Delete Offer?
              </h3>
              <p className="text-sm text-slate-500 mt-2 font-medium leading-relaxed">
                Are you sure you want to delete <span className="font-bold text-slate-800">&quot;{deleteConfirmTarget.title}&quot;</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3 w-full mt-6">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmTarget(null)}
                  className="flex-grow py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-bold transition-all active:scale-[0.98] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => {
                    const { id } = deleteConfirmTarget;
                    setDeleteConfirmTarget(null);
                    handleDeleteOffer(id);
                  }}
                  className="flex-grow py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-sm font-bold transition-all active:scale-[0.98] shadow-lg shadow-rose-600/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isDeleting ? <Loader2 size={15} className="animate-spin" /> : null}
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
