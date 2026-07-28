'use client';

import React from 'react';
import { MessageCircle, Mail, Phone } from 'lucide-react';

interface CustomPosterProps {
  vendorName?: string;
  vendorAddress?: string;
  publicMenuUrl?: string;
  accentColor?: string;
}

export default function CustomPoster({
  vendorName = 'Vendor Name',
  vendorAddress = 'Vendor Address',
  publicMenuUrl = '',
  accentColor = '#f77512',
}: CustomPosterProps) {
  const whatsappMessage = encodeURIComponent(
    `Hi MyStreetMenu! I want a custom poster for my restaurant:\n\nName: ${vendorName}\nAddress: ${vendorAddress}\nMenu: ${publicMenuUrl}`
  );
  const whatsappUrl = `https://wa.me/917890700156?text=${whatsappMessage}`;
  const mailtoUrl = `mailto:snkdevworks@gmail.com?subject=Custom Poster Request - ${encodeURIComponent(
    vendorName
  )}`;

  return (
    <div className="w-full max-w-[380px] flex flex-col items-start select-none">
      <div className="w-full bg-white rounded-[24px] border border-gray-200/80 shadow-lg p-6 flex flex-col items-center text-center gap-5">
        {/* Text Details */}
        <div className="flex flex-col gap-1">
          <h3 className="text-[20px] font-black text-slate-900 tracking-tight">
            Need a Custom Poster?
          </h3>
          <p className="text-[13.5px] text-slate-500 font-medium leading-snug max-w-[260px]">
            Get a personalized, print-ready poster designed specifically for your menu and brand.
          </p>
        </div>

        {/* Contact Buttons */}
        <div className="w-full flex flex-col gap-2.5 pt-1">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-extrabold text-sm text-white transition-all active:scale-95 cursor-pointer shadow-sm hover:shadow-md"
            style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)' }}
          >
            <MessageCircle className="w-4 h-4" />
            Chat on WhatsApp
          </a>

          <a
            href={mailtoUrl}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 font-bold text-sm text-slate-700 hover:bg-slate-50 transition-all active:scale-95"
          >
            <Mail className="w-4 h-4 text-slate-500" />
            Email Support
          </a>
        </div>

        {/* Phone info */}
        <div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-400 pt-1">
          <Phone className="w-3.5 h-3.5 text-orange-500" />
          <span>+91 7890700156</span>
        </div>
      </div>
    </div>
  );
}
