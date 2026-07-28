'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, X, Check, Eye, EyeOff } from 'lucide-react';
import AnnouncementIcon from '@/components/icons/announcement-icon';

export interface Announcement {
  id: string;
  message: string;
  status: 'Visible' | 'Hidden';
  date: string;
}

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: '1',
    message: 'We are closed after 8 PM today.',
    status: 'Visible',
    date: 'Today',
  },
  {
    id: '2',
    message: 'Special weekend brunch menu available from 10 AM to 2 PM!',
    status: 'Visible',
    date: 'Yesterday',
  },
];

export default function AnnouncementsSection() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  // Form state
  const [formMessage, setFormMessage] = useState('');
  const [formStatus, setFormStatus] = useState<'Visible' | 'Hidden'>('Visible');

  // Lock scroll when modal is open
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

  const handleOpenCreateModal = () => {
    setEditingAnnouncement(null);
    setFormMessage('');
    setFormStatus('Visible');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: Announcement) => {
    setEditingAnnouncement(item);
    setFormMessage(item.message);
    setFormStatus(item.status);
    setIsModalOpen(true);
  };

  const handleToggleStatus = (id: string) => {
    setAnnouncements(prev =>
      prev.map(item => {
        if (item.id === id) {
          const newStatus = item.status === 'Visible' ? 'Hidden' : 'Visible';
          return { ...item, status: newStatus };
        }
        return item;
      })
    );
  };

  const handleDelete = (id: string) => {
    setAnnouncements(prev => prev.filter(item => item.id !== id));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMessage.trim()) return;

    if (editingAnnouncement) {
      setAnnouncements(prev =>
        prev.map(item =>
          item.id === editingAnnouncement.id
            ? {
                ...item,
                message: formMessage.trim(),
                status: formStatus,
              }
            : item
        )
      );
    } else {
      const newAnnouncement: Announcement = {
        id: Date.now().toString(),
        message: formMessage.trim(),
        status: formStatus,
        date: 'Today',
      };
      setAnnouncements(prev => [newAnnouncement, ...prev]);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="w-full max-w-[1200px] mt-4 flex flex-col gap-6 animate-in fade-in duration-200">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-[2rem] border border-gray-200/80 shadow-sm">
        <div className="flex items-center gap-4">
          <AnnouncementIcon className="w-10 h-10 shrink-0" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Announcements</h1>
            <p className="text-slate-500 font-medium text-xs sm:text-sm mt-0.5">
              Share important updates with your customers.
            </p>
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
            Today's Announcement
            <span className="bg-orange-100 text-[#f77512] text-xs font-black px-2.5 py-0.5 rounded-full border border-orange-200">
              {announcements.filter(a => a.status === 'Visible').length} Active
            </span>
          </h2>
        </div>

        {announcements.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200/80 flex flex-col items-center justify-center min-h-[220px]">
            <AnnouncementIcon className="w-14 h-14 mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">No Announcements Yet</h3>
            <p className="text-gray-500 text-xs max-w-sm mb-4">
              You haven't posted any announcements. Share store hours, holiday updates, or news with your visitors!
            </p>
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
                  item.status === 'Visible'
                    ? 'border-indigo-100 hover:shadow-md'
                    : 'border-slate-300 opacity-40 grayscale-[60%]'
                }`}
              >
                {/* Soft background glows */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-44 h-44 bg-white opacity-40 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-36 h-36 bg-blue-300 opacity-20 rounded-full blur-2xl pointer-events-none" />

                {/* Content Section (Left Side) */}
                <div className="flex flex-col z-10 w-[72%] sm:w-[70%] text-left justify-between">
                  {/* Top Row: Badge & Date */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                      item.status === 'Visible'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {item.status === 'Visible' ? 'Active Announcement' : 'Hidden'}
                    </span>
                    <span className="text-[11px] font-bold text-[#4338CA] opacity-80">
                      {item.date}
                    </span>
                  </div>

                  {/* Heading / Announcement Message */}
                  <h2 className="text-[#1E1B4B] text-base sm:text-lg font-black leading-snug mb-3 tracking-tight">
                    "{item.message}"
                  </h2>

                  {/* Action Buttons */}
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
                      onClick={() => handleToggleStatus(item.id)}
                      className={`text-xs font-extrabold py-1.5 px-3 rounded-lg flex items-center gap-1 shadow-sm transition-colors cursor-pointer ${
                        item.status === 'Visible'
                          ? 'bg-indigo-100 text-[#1E1B4B] hover:bg-indigo-200'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {item.status === 'Visible' ? <EyeOff size={13} /> : <Eye size={13} />}
                      {item.status === 'Visible' ? 'Hide' : 'Show'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-[#1E1B4B] hover:text-red-600 hover:bg-white/80 rounded-lg transition-colors cursor-pointer"
                      title="Delete announcement"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Right Side: Custom 3D Bell SVG Graphic Container */}
                <div className="relative z-10 w-[28%] sm:w-[30%] flex justify-end items-center pointer-events-none shrink-0">
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
                    {/* Soft glow behind the bell */}
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
                        {/* Bell Hanger / Top Loop */}
                        <path d="M100 25 C85 25 85 45 100 45 C115 45 115 25 100 25 Z" fill="#CA8A04" />
                        <path d="M100 29 C92 29 92 41 100 41 C108 41 108 29 100 29 Z" fill="#FEF08A" />

                        {/* Main Bell Body */}
                        <path d="M100 40 C60 40 55 90 50 120 C45 145 35 150 35 150 L165 150 C165 150 155 145 150 120 C145 90 140 40 100 40 Z" fill={`url(#bellGradient-${item.id})`} />

                        {/* Bell Highlight (Left side for 3D effect) */}
                        <path d="M95 43 C65 45 60 90 56 120 C54 135 48 145 42 148 C55 130 65 100 70 60 C72 48 85 43 95 43 Z" fill="#FEF08A" opacity="0.6" />

                        {/* Bell Bottom Rim */}
                        <path d="M30 145 L170 145 C175 145 175 155 170 155 L30 155 C25 155 25 145 30 145 Z" fill={`url(#bellBottomGradient-${item.id})`} />
                        <path d="M32 147 L168 147" stroke="#FEF08A" strokeWidth="2" strokeLinecap="round" opacity="0.5" />

                        {/* Clapper (Inside part) */}
                        <circle cx="100" cy="165" r="15" fill={`url(#clapperGradient-${item.id})`} />
                        <circle cx="95" cy="160" r="4" fill="#FEF08A" opacity="0.8" />
                      </g>

                      {/* Notification Badge (Red Dot without pulse animation) */}
                      <g>
                        <circle cx="155" cy="55" r="18" fill="#EF4444" stroke="#EBF4FF" strokeWidth="4" />
                        <text x="155" y="61" fontFamily="sans-serif" fontSize="16" fontWeight="bold" fill="white" textAnchor="middle">1</text>
                      </g>

                      {/* Decorative Sparkles */}
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

      {/* Modal Popup for Create / Edit Announcement */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-gray-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AnnouncementIcon className="w-8 h-8 shrink-0" />
                <div>
                  <h2 className="text-xl font-black tracking-tight">
                    {editingAnnouncement ? 'Edit Announcement' : 'Announcement'}
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
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  Maximum 120 characters
                </p>
              </div>

              {/* Status Segmented Pill Toggle */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Status
                </label>
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setFormStatus('Visible')}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center ${
                      formStatus === 'Visible'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    Visible
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormStatus('Hidden')}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center ${
                      formStatus === 'Hidden'
                        ? 'bg-slate-700 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    Hidden
                  </button>
                </div>
              </div>

              {/* Modal Footer / Save Action */}
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
                  disabled={!formMessage.trim() || formMessage.length > 120}
                  className="bg-[#f77512] hover:bg-[#e05a00] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black px-6 py-2.5 rounded-xl shadow-md transition-all text-xs cursor-pointer flex items-center gap-2 active:scale-95"
                >
                  <Check size={16} /> Save
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
