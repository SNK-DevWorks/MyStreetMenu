'use client';

import React, { useState, useEffect, useTransition, useCallback } from 'react';
import { Plus, Edit3, Trash2, X, Check, Eye, EyeOff, Loader2 } from 'lucide-react';
import AnnouncementIcon from '@/components/icons/announcement-icon';

import { useVendor } from '@/context/vendor-context';
import { getAllPromotionsByTypeAction } from '@/actions/promotion/get-promotions';
import { createPromotionAction } from '@/actions/promotion/create-promotion';
import { updatePromotionAction } from '@/actions/promotion/update-promotion';
import { deletePromotionAction } from '@/actions/promotion/delete-promotion';

import type { Promotion } from '../../../../drizzle/schema/promotions';

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function AnnouncementsSection() {
  const { shop, announcements: contextAnnouncements, promotionsLoading: isLoading, refetchPromotions } = useVendor();
  const [announcements, setAnnouncements] = useState<Promotion[]>(contextAnnouncements);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Promotion | null>(null);

  const [formMessage, setFormMessage] = useState('');
  const [formIsVisible, setFormIsVisible] = useState(true);

  const [isSaving, startSavingTransition] = useTransition();
  const [isDeleting, startDeletingTransition] = useTransition();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const notify = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    setAnnouncements(contextAnnouncements);
  }, [contextAnnouncements]);

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isModalOpen]);

  const handleOpenCreateModal = () => {
    setEditingAnnouncement(null);
    setFormMessage('');
    setFormIsVisible(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: Promotion) => {
    setEditingAnnouncement(item);
    setFormMessage(item.title);
    setFormIsVisible(item.isActive);
    setIsModalOpen(true);
  };

  const handleToggleStatus = (item: Promotion) => {
    const fd = new FormData();
    fd.set('id', item.id);
    fd.set('isActive', String(!item.isActive));
    startSavingTransition(async () => {
      const result = await updatePromotionAction(fd);
      if (result.success && result.data) {
        setAnnouncements(prev => prev.map(a => a.id === item.id ? result.data! : a));
      }
    });
  };

  const handleDelete = (id: string) => {
    startDeletingTransition(async () => {
      const result = await deletePromotionAction(id);
      if (result.success) {
        setAnnouncements(prev => prev.filter(a => a.id !== id));
        notify('Announcement deleted');
      } else {
        notify(result.error ?? 'Failed to delete', 'error');
      }
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMessage.trim() || !shop?.id) return;

    startSavingTransition(async () => {
      if (editingAnnouncement) {
        const fd = new FormData();
        fd.set('id', editingAnnouncement.id);
        fd.set('title', formMessage.trim());
        fd.set('isActive', String(formIsVisible));

        const result = await updatePromotionAction(fd);
        if (result.success && result.data) {
          setAnnouncements(prev => prev.map(a => a.id === editingAnnouncement.id ? result.data! : a));
          notify('Announcement updated!');
        } else {
          notify(result.error ?? 'Failed to update', 'error');
          return;
        }
      } else {
        const fd = new FormData();
        fd.set('shopId', shop.id);
        fd.set('type', 'announcement');
        fd.set('title', formMessage.trim());

        const result = await createPromotionAction(fd);
        if (result.success && result.data) {
          setAnnouncements(prev => [result.data!, ...prev]);
          notify('Announcement posted!');
        } else {
          notify(result.error ?? 'Failed to create', 'error');
          return;
        }
      }
      setIsModalOpen(false);
    });
  };

  return (
    <div className="w-full max-w-[1200px] mt-4 flex flex-col gap-6 animate-in fade-in duration-200">

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-24 right-6 z-[200] px-5 py-3 rounded-2xl shadow-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200 ${toast.type === 'success'
            ? 'bg-slate-900 text-white border-slate-700'
            : 'bg-rose-900 text-white border-rose-700'
          }`}
        >
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-[2rem] border border-gray-200/80 shadow-sm">
        <div className="flex items-center gap-4">
          <AnnouncementIcon className="w-10 h-10 shrink-0" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Announcements</h1>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center gap-2 bg-[#f77512] hover:bg-[#e05a00] text-white font-black px-6 py-3 rounded-2xl transition-all shadow-md hover:shadow-lg active:scale-95 text-sm cursor-pointer shrink-0"
        >
          <Plus size={18} strokeWidth={2.5} />
          New Announcement
        </button>
      </div>

      <hr className="border-gray-200 my-1" />

      {/* Announcements List */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            Today&apos;s Announcement
            <span className="bg-orange-100 text-[#f77512] text-xs font-black px-2.5 py-0.5 rounded-full border border-orange-200">
              {announcements.filter(a => a.isActive).length} Active
            </span>
          </h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 size={32} className="animate-spin text-[#f77512]" />
          </div>
        ) : announcements.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200/80 flex flex-col items-center justify-center min-h-[220px]">
            <AnnouncementIcon className="w-14 h-14 mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-4">No Announcements Yet</h3>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="bg-[#f77512] hover:bg-[#e05a00] text-white font-bold px-5 py-2.5 rounded-2xl transition-all shadow-md flex items-center gap-2 text-xs cursor-pointer"
            >
              <Plus size={16} /> New Announcement
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {announcements.map(item => (
              <div
                key={item.id}
                className={`relative w-full bg-gradient-to-br from-[#EBF4FF] to-[#E0E7FF] rounded-2xl p-4 sm:p-5 shadow-sm overflow-hidden flex flex-row items-center justify-between gap-4 border transition-all duration-200 min-h-[140px] ${
                  item.isActive
                    ? 'border-indigo-100 hover:shadow-md'
                    : 'border-slate-300 opacity-40 grayscale-[60%]'
                }`}
              >
                {/* Background glows */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-44 h-44 bg-white opacity-40 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-36 h-36 bg-blue-300 opacity-20 rounded-full blur-2xl pointer-events-none" />

                {/* Content */}
                <div className="flex flex-col z-10 w-[72%] sm:w-[70%] text-left justify-between">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                      item.isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {item.isActive ? 'Active Announcement' : 'Hidden'}
                    </span>
                    <span className="text-[11px] font-bold text-[#4338CA] opacity-80">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>

                  <h2 className="text-[#1E1B4B] text-base sm:text-lg font-black leading-snug mb-3 tracking-tight">
                    &ldquo;{item.title}&rdquo;
                  </h2>

                  <div className="flex items-center gap-2 z-20">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(item)}
                      className="bg-[#1E1B4B] hover:bg-[#312E81] text-white transition-colors text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 shadow-sm cursor-pointer"
                    >
                      <Edit3 size={13} /> Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(item)}
                      disabled={isSaving}
                      className={`text-xs font-extrabold py-1.5 px-3 rounded-lg flex items-center gap-1 shadow-sm transition-colors cursor-pointer ${
                        item.isActive
                          ? 'bg-indigo-100 text-[#1E1B4B] hover:bg-indigo-200'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {item.isActive ? <EyeOff size={13} /> : <Eye size={13} />}
                      {item.isActive ? 'Hide' : 'Show'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Delete this announcement?')) handleDelete(item.id);
                      }}
                      disabled={isDeleting}
                      className="p-1.5 text-[#1E1B4B] hover:text-red-600 hover:bg-white/80 rounded-lg transition-colors cursor-pointer"
                      title="Delete announcement"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Bell SVG Graphic */}
                <div className="relative z-10 w-[28%] sm:w-[30%] flex justify-end items-center pointer-events-none shrink-0">
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
                    <div className="absolute inset-0 bg-yellow-200/40 rounded-full blur-xl" />
                    <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="z-10">
                      <defs>
                        <linearGradient id={`bellGradient-${item.id}`} x1="50" y1="20" x2="150" y2="160" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#FDE047" />
                          <stop offset="1" stopColor="#EAB308" />
                        </linearGradient>
                        <linearGradient id={`bellBottomGradient-${item.id}`} x1="40" y1="140" x2="160" y2="140" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#FACC15" />
                          <stop offset="1" stopColor="#CA8A04" />
                        </linearGradient>
                        <linearGradient id={`clapperGradient-${item.id}`} x1="85" y1="150" x2="115" y2="180" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#F59E0B" />
                          <stop offset="1" stopColor="#B45309" />
                        </linearGradient>
                        <filter id={`drop-shadow-${item.id}`} x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="12" stdDeviation="15" floodOpacity="0.15" floodColor="#4338CA" />
                        </filter>
                      </defs>
                      <g filter={`url(#drop-shadow-${item.id})`}>
                        <path d="M100 25 C85 25 85 45 100 45 C115 45 115 25 100 25 Z" fill="#CA8A04" />
                        <path d="M100 29 C92 29 92 41 100 41 C108 41 108 29 100 29 Z" fill="#FEF08A" />
                        <path d="M100 40 C60 40 55 90 50 120 C45 145 35 150 35 150 L165 150 C165 150 155 145 150 120 C145 90 140 40 100 40 Z" fill={`url(#bellGradient-${item.id})`} />
                        <path d="M95 43 C65 45 60 90 56 120 C54 135 48 145 42 148 C55 130 65 100 70 60 C72 48 85 43 95 43 Z" fill="#FEF08A" opacity="0.6" />
                        <path d="M30 145 L170 145 C175 145 175 155 170 155 L30 155 C25 155 25 145 30 145 Z" fill={`url(#bellBottomGradient-${item.id})`} />
                        <path d="M32 147 L168 147" stroke="#FEF08A" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
                        <circle cx="100" cy="165" r="15" fill={`url(#clapperGradient-${item.id})`} />
                        <circle cx="95" cy="160" r="4" fill="#FEF08A" opacity="0.8" />
                      </g>
                      <g>
                        <circle cx="155" cy="55" r="18" fill="#EF4444" stroke="#EBF4FF" strokeWidth="4" />
                        <text x="155" y="61" fontFamily="sans-serif" fontSize="16" fontWeight="bold" fill="white" textAnchor="middle">1</text>
                      </g>
                      <path d="M25 60 L35 63 L38 73 L41 63 L51 60 L41 57 L38 47 L35 57 Z" fill="#FBBF24" />
                      <path d="M165 25 L172 27 L174 34 L176 27 L183 25 L176 23 L174 16 L172 23 Z" fill="#FBBF24" />
                      <circle cx="45" cy="35" r="3" fill="#FDE047" />
                      <circle cx="175" cy="85" r="4" fill="#FDE047" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for Create / Edit Announcement */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-gray-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">

            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AnnouncementIcon className="w-8 h-8 shrink-0" />
                <div>
                  <h2 className="text-xl font-black tracking-tight">
                    {editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}
                  </h2>
                  <p className="text-slate-400 text-xs font-medium">
                    Broadcast important news to your menu visitors
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="bg-white/10 hover:bg-white/20 p-2.5 rounded-full text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 flex flex-col gap-4 bg-white">

              {/* Message input */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <span className={`text-xs font-semibold ${formMessage.length > 120 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                    {formMessage.length}/120
                  </span>
                </div>
                <textarea
                  rows={4}
                  required
                  maxLength={120}
                  placeholder='e.g. "We are closed after 8 PM today."'
                  value={formMessage}
                  onChange={e => setFormMessage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-slate-900 placeholder:text-slate-400 focus:border-[#f77512] focus:ring-2 focus:ring-[#f77512]/20 text-sm font-semibold outline-none transition-all resize-none shadow-sm"
                />
                <p className="text-xs font-medium text-slate-500 mt-0.5">Maximum 120 characters</p>
              </div>

              {/* Status Toggle */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Visibility
                </label>
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setFormIsVisible(true)}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center ${
                      formIsVisible
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    Visible
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormIsVisible(false)}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center ${
                      !formIsVisible
                        ? 'bg-slate-700 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    Hidden
                  </button>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-slate-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!formMessage.trim() || formMessage.length > 120 || isSaving}
                  className="bg-[#f77512] hover:bg-[#e05a00] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black px-6 py-2.5 rounded-xl shadow-md transition-all text-xs cursor-pointer flex items-center gap-2 active:scale-95"
                >
                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={16} />}
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
