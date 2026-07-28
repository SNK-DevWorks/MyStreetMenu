'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Edit3, Power, Trash2, X, Check } from 'lucide-react';
import OfferIcon from '@/components/icons/offer-icon';

export interface Offer {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Disabled';
}

const INITIAL_OFFERS: Offer[] = [
  {
    id: '1',
    title: '🔥 Buy 2 Rolls, Get Coke Free',
    description: 'Order any 2 rolls and get a complimentary 250ml beverage.',
    startDate: '2026-07-15',
    endDate: '30 July',
    status: 'Active',
  },
  {
    id: '2',
    title: '🎉 Flat 20% OFF on Orders Over ₹499',
    description: 'Applicable on all menu items during weekend special.',
    startDate: '2026-07-01',
    endDate: '05 August',
    status: 'Active',
  },
];

const CARD_COLOR_PALETTES = [
  {
    bg: 'bg-[#E5DEFF]',
    border: 'border-purple-300/80',
    title: 'text-[#4C1D95]',
    desc: 'text-[#5B21B6]/95',
    badgeBg: 'bg-white/75',
    badgeText: 'text-[#5B21B6]',
    badgeStrong: 'text-[#4C1D95]',
    btnBg: 'bg-white',
    btnText: 'text-[#4C1D95]',
    btnHover: 'hover:bg-purple-50',
    arcStroke: '#4C1D95',
  },
  {
    bg: 'bg-[#FFEDD5]',
    border: 'border-orange-300/80',
    title: 'text-[#C2410C]',
    desc: 'text-[#9A3412]/95',
    badgeBg: 'bg-white/75',
    badgeText: 'text-[#9A3412]',
    badgeStrong: 'text-[#C2410C]',
    btnBg: 'bg-white',
    btnText: 'text-[#C2410C]',
    btnHover: 'hover:bg-orange-50',
    arcStroke: '#C2410C',
  },
  {
    bg: 'bg-[#DCFCE7]',
    border: 'border-emerald-300/80',
    title: 'text-[#15803D]',
    desc: 'text-[#166534]/95',
    badgeBg: 'bg-white/75',
    badgeText: 'text-[#166534]',
    badgeStrong: 'text-[#15803D]',
    btnBg: 'bg-white',
    btnText: 'text-[#15803D]',
    btnHover: 'hover:bg-emerald-50',
    arcStroke: '#15803D',
  },
  {
    bg: 'bg-[#FFE4E6]',
    border: 'border-rose-300/80',
    title: 'text-[#BE123C]',
    desc: 'text-[#9F1239]/95',
    badgeBg: 'bg-white/75',
    badgeText: 'text-[#9F1239]',
    badgeStrong: 'text-[#BE123C]',
    btnBg: 'bg-white',
    btnText: 'text-[#BE123C]',
    btnHover: 'hover:bg-rose-50',
    arcStroke: '#BE123C',
  },
  {
    bg: 'bg-[#E0F2FE]',
    border: 'border-sky-300/80',
    title: 'text-[#0369A1]',
    desc: 'text-[#075985]/95',
    badgeBg: 'bg-white/75',
    badgeText: 'text-[#075985]',
    badgeStrong: 'text-[#0369A1]',
    btnBg: 'bg-white',
    btnText: 'text-[#0369A1]',
    btnHover: 'hover:bg-sky-50',
    arcStroke: '#0369A1',
  },
  {
    bg: 'bg-[#FEF3C7]',
    border: 'border-amber-300/80',
    title: 'text-[#B45309]',
    desc: 'text-[#92400E]/95',
    badgeBg: 'bg-white/75',
    badgeText: 'text-[#92400E]',
    badgeStrong: 'text-[#B45309]',
    btnBg: 'bg-white',
    btnText: 'text-[#B45309]',
    btnHover: 'hover:bg-amber-50',
    arcStroke: '#B45309',
  },
];

export default function OffersSection() {
  const [offers, setOffers] = useState<Offer[]>(INITIAL_OFFERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Disabled'>('Active');

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
    setEditingOffer(null);
    setFormTitle('');
    setFormDescription('');
    setFormStartDate('');
    setFormEndDate('');
    setFormStatus('Active');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (offer: Offer) => {
    setEditingOffer(offer);
    setFormTitle(offer.title);
    setFormDescription(offer.description);
    setFormStartDate(offer.startDate);
    setFormEndDate(offer.endDate);
    setFormStatus(offer.status);
    setIsModalOpen(true);
  };

  const handleToggleStatus = (id: string) => {
    setOffers(prev =>
      prev.map(offer => {
        if (offer.id === id) {
          const newStatus = offer.status === 'Active' ? 'Disabled' : 'Active';
          return { ...offer, status: newStatus };
        }
        return offer;
      })
    );
  };

  const handleDeleteOffer = (id: string) => {
    setOffers(prev => prev.filter(o => o.id !== id));
  };

  const handleSaveOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingOffer) {
      // Update existing
      setOffers(prev =>
        prev.map(o =>
          o.id === editingOffer.id
            ? {
                ...o,
                title: formTitle,
                description: formDescription,
                startDate: formStartDate,
                endDate: formEndDate,
                status: formStatus,
              }
            : o
        )
      );
    } else {
      // Create new offer
      const newOffer: Offer = {
        id: Date.now().toString(),
        title: formTitle,
        description: formDescription,
        startDate: formStartDate || new Date().toISOString().split('T')[0],
        endDate: formEndDate || '31 August',
        status: formStatus,
      };
      setOffers(prev => [newOffer, ...prev]);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="w-full max-w-[1200px] mt-4 flex flex-col gap-6 animate-in fade-in duration-200">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-[2rem] border border-gray-200/80 shadow-sm">
        <div className="flex items-center gap-4">
          <OfferIcon className="w-10 h-10 shrink-0" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Offers</h1>
            <p className="text-slate-500 font-medium text-xs sm:text-sm mt-0.5">
              Create limited-time offers for your customers.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center gap-2 bg-[#f77512] hover:bg-[#e05a00] text-white font-black px-6 py-3 rounded-2xl transition-all shadow-md hover:shadow-lg active:scale-95 text-sm cursor-pointer shrink-0"
        >
          <Plus size={18} strokeWidth={2.5} />
          Create Offer
        </button>
      </div>

      <hr className="border-gray-200 my-1" />

      {/* Active Offers Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            Active Offers
            <span className="bg-orange-100 text-[#f77512] text-xs font-black px-2.5 py-0.5 rounded-full border border-orange-200">
              {offers.filter(o => o.status === 'Active').length} Active
            </span>
          </h2>
        </div>

        {offers.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200/80 flex flex-col items-center justify-center min-h-[220px]">
            <OfferIcon className="w-14 h-14 mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">No Offers Available</h3>
            <p className="text-gray-500 text-xs max-w-sm mb-4">
              You haven't created any promotional offers yet. Click below to create your first offer!
            </p>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="bg-[#f77512] hover:bg-[#e05a00] text-white font-bold px-5 py-2.5 rounded-2xl transition-all shadow-md flex items-center gap-2 text-xs cursor-pointer"
            >
              <Plus size={16} /> Create Offer
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {offers.map((offer, idx) => {
              const theme = CARD_COLOR_PALETTES[idx % CARD_COLOR_PALETTES.length];
              return (
                <div
                  key={offer.id}
                  className={`relative w-full min-h-[185px] rounded-2xl ${theme.bg} shadow-sm overflow-hidden flex flex-col justify-between p-5 sm:p-6 border transition-all duration-200 ${
                    offer.status === 'Active'
                      ? `${theme.border} hover:shadow-md`
                      : 'border-gray-300/80 opacity-40 grayscale-[60%]'
                  }`}
                >
                  {/* Decorative background element (faint arcs) */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.07]">
                    <svg width="100%" height="100%" viewBox="0 0 340 144" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="240" cy="72" r="70" stroke={theme.arcStroke} strokeWidth="2.5" />
                      <circle cx="240" cy="72" r="95" stroke={theme.arcStroke} strokeWidth="2.5" />
                    </svg>
                  </div>

                  {/* Content Section (Left Side) */}
                  <div className="flex flex-col z-10 w-[68%] sm:w-[65%] gap-1">
                    {/* Main Headline */}
                    <h2 className={`text-xl sm:text-2xl font-black ${theme.title} leading-tight mb-2 drop-shadow-2xs`}>
                      {offer.title}
                    </h2>

                    {offer.description && (
                      <p className={`text-xs sm:text-sm ${theme.desc} font-semibold leading-relaxed mb-3`}>
                        {offer.description}
                      </p>
                    )}

                    {/* Validity */}
                    <div className="mb-3">
                      <span className={`text-xs sm:text-sm font-bold ${theme.badgeText} ${theme.badgeBg} backdrop-blur-md px-3 py-1 rounded-lg inline-block shadow-2xs`}>
                        Valid Until <strong className={`${theme.badgeStrong} font-black`}>{offer.endDate}</strong>
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-1.5 z-20">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(offer)}
                        className={`${theme.btnBg} ${theme.btnHover} ${theme.btnText} text-xs sm:text-sm font-extrabold py-2 px-4 rounded-full flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer`}
                      >
                        <Edit3 size={14} className={theme.btnText} /> Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleStatus(offer.id)}
                        className={`text-xs sm:text-sm font-extrabold py-2 px-4 rounded-full flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer ${
                          offer.status === 'Active'
                            ? 'bg-black/10 text-slate-900 hover:bg-black/20'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        <Power size={14} /> {offer.status === 'Active' ? 'Disable' : 'Enable'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteOffer(offer.id)}
                        className={`p-2 ${theme.btnText} hover:text-red-600 hover:bg-white/80 rounded-full transition-colors cursor-pointer`}
                        title="Delete offer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                {/* Image/Graphic Section (Right Side) */}
                <div className="absolute right-0 bottom-0 top-0 z-10 flex items-center justify-end w-36 sm:w-44 pointer-events-none overflow-hidden">
                  <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform translate-x-2 sm:translate-x-0">
                    <defs>
                      <filter id={`food-shadow-${offer.id}`} x="-10%" y="-10%" width="120%" height="120%">
                        <feDropShadow dx="2" dy="6" stdDeviation="4" floodOpacity="0.15" />
                      </filter>
                    </defs>

                    <g filter={`url(#food-shadow-${offer.id})`}>
                      {/* Coke Cup Straw */}
                      <path d="M100 65 L110 30" stroke="#FFF" strokeWidth="4" strokeLinecap="round"/>
                      <path d="M100 65 L110 30" stroke="#EF4444" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round"/>

                      {/* Cup Body */}
                      <path d="M85 60 L115 60 L108 115 C107 118 103 120 100 120 L100 120 C97 120 93 118 92 115 L85 60 Z" fill="#EF4444" />
                      <ellipse cx="100" cy="60" rx="16" ry="5" fill="#F3F4F6"/>
                      <ellipse cx="100" cy="58" rx="14" ry="3" fill="#E5E7EB"/>
                      {/* Cup Swoosh */}
                      <path d="M89 80 Q 100 90 109 75" stroke="#FFF" strokeWidth="2" fill="none" strokeLinecap="round"/>

                      {/* Back Roll */}
                      <g transform="translate(55, 60) rotate(-15)">
                          <rect x="0" y="0" width="28" height="50" rx="14" fill="#FDE68A" />
                          <circle cx="10" cy="8" r="6" fill="#22C55E" />
                          <circle cx="18" cy="12" r="5" fill="#EF4444" />
                          <path d="M-2 25 L30 20 L27 55 C27 60 22 63 14 63 L14 63 C6 63 1 60 0 55 Z" fill="#FFF" />
                      </g>

                      {/* Front Roll */}
                      <g transform="translate(25, 75) rotate(10)">
                          <rect x="0" y="0" width="32" height="55" rx="16" fill="#FDE68A" />
                          <circle cx="12" cy="10" r="8" fill="#22C55E" />
                          <circle cx="22" cy="15" r="6" fill="#F59E0B" />
                          <path d="M-2 28 L34 24 L30 60 C30 65 24 68 16 68 L16 68 C8 68 2 65 0 60 Z" fill="#FFF" />
                          <path d="M-2 28 Q 16 35 34 24" stroke="#E5E7EB" strokeWidth="2" fill="none"/>
                      </g>
                    </g>
                  </svg>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>

      {/* Modal for Create / Edit Offer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-gray-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <OfferIcon className="w-8 h-8 shrink-0" />
                <div>
                  <h2 className="text-xl font-black tracking-tight">
                    {editingOffer ? 'Edit Offer' : 'Create Offer'}
                  </h2>
                  <p className="text-slate-400 text-xs font-medium">
                    Configure offer details for your menu items
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
            <form onSubmit={handleSaveOffer} className="p-6 flex flex-col gap-4 bg-white">
              {/* Offer Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Offer Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 🔥 Buy 2 Rolls, Get Coke Free"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-slate-900 placeholder:text-slate-400 focus:border-[#f77512] focus:ring-2 focus:ring-[#f77512]/20 text-sm font-semibold outline-none transition-all shadow-sm"
                />
              </div>

              {/* Offer Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Offer Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe terms or conditions of this offer..."
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-slate-900 placeholder:text-slate-400 focus:border-[#f77512] focus:ring-2 focus:ring-[#f77512]/20 text-sm font-medium outline-none transition-all resize-none shadow-sm"
                />
              </div>

              {/* Start Date & End Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Start Date
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 20 July or YYYY-MM-DD"
                    value={formStartDate}
                    onChange={e => setFormStartDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-slate-900 placeholder:text-slate-400 focus:border-[#f77512] focus:ring-2 focus:ring-[#f77512]/20 text-sm font-medium outline-none transition-all shadow-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    End Date
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 30 July"
                    value={formEndDate}
                    onChange={e => setFormEndDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-slate-900 placeholder:text-slate-400 focus:border-[#f77512] focus:ring-2 focus:ring-[#f77512]/20 text-sm font-medium outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Status Segmented Pill Toggle */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Status
                </label>
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setFormStatus('Active')}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center ${
                      formStatus === 'Active'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormStatus('Disabled')}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center ${
                      formStatus === 'Disabled'
                        ? 'bg-slate-700 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    Disabled
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
                  className="bg-[#f77512] hover:bg-[#e05a00] text-white font-black px-6 py-2.5 rounded-xl shadow-md transition-all text-xs cursor-pointer flex items-center gap-2 active:scale-95"
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
