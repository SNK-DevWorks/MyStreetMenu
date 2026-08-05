'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { QrCode } from 'lucide-react';
import { useVendor } from '@/context/vendor-context';

export const QuickActionsRow: React.FC = () => {
  const { vendorName, publicMenuUrl } = useVendor();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDownloadQR = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const size = 1024;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;

      const targetUrl = publicMenuUrl || (typeof window !== 'undefined' ? `${window.location.origin}/menu` : '');

      await QRCode.toCanvas(canvas, targetUrl, {
        width: size,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      });

      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `${vendorName ? vendorName.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'vendor'}-qr-code.png`;
      a.click();
      showToast('QR Code downloaded successfully!');
    } catch (err) {
      console.error('Failed to download QR code:', err);
      showToast('Failed to download QR code');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareMenu = async () => {
    const targetUrl = publicMenuUrl || (typeof window !== 'undefined' ? `${window.location.origin}/menu` : '');

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: vendorName || 'My Street Menu',
          text: 'Scan or click to view our menu!',
          url: targetUrl,
        });
        return;
      } catch {
        // User cancelled or share failed — fall back to copy
      }
    }

    try {
      await navigator.clipboard.writeText(targetUrl);
      showToast('Menu link copied to clipboard!');
    } catch {
      showToast('Failed to copy menu link');
    }
  };

  const actions = [
    {
      name: "Add Menu Item",
      href: "/vendor/menu?action=create",
      iconBg: "bg-[#F77512] text-white shadow-orange-500/20",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      )
    },
    {
      name: isDownloading ? "Saving..." : "Download QR",
      onClick: handleDownloadQR,
      iconBg: "bg-slate-900 text-white shadow-slate-900/20",
      icon: (
        <QrCode size={19} strokeWidth={2.5} />
      )
    },
    {
      name: "Preview Menu",
      href: "/vendor/menu?tab=preview",
      iconBg: "bg-amber-500 text-white shadow-amber-500/20",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      )
    },
    {
      name: "Share Menu",
      onClick: handleShareMenu,
      iconBg: "bg-[#C84E00] text-white shadow-orange-600/20",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
          <polyline points="16 6 12 2 8 6"></polyline>
          <line x1="12" y1="2" x2="12" y2="15"></line>
        </svg>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-3 sm:gap-6 w-full max-w-[1200px] mt-10 sm:mt-16 md:mt-24 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl text-xs sm:text-sm font-bold animate-in fade-in slide-in-from-top-4 duration-200 whitespace-nowrap max-w-[90vw] text-center">
          {toastMessage}
        </div>
      )}

      <h2 className="text-[20px] sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight px-1">
        Quick Actions
      </h2>
      
      {/* 2x2 Grid on Mobile (< sm), Flex Row on Desktop (sm:) */}
      <div className="grid grid-cols-2 sm:flex sm:flex-row sm:overflow-x-auto gap-2.5 sm:gap-4 items-center w-full no-scrollbar">
        {actions.map((action, index) => {
          const content = (
            <div className="bg-white hover:bg-orange-50/40 border border-slate-200/80 hover:border-orange-300/80 px-3.5 py-3 sm:px-5 sm:py-4 rounded-2xl flex flex-row items-center justify-start gap-3 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 w-full group">
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-105 opacity-85 ${action.iconBg}`}>
                {action.icon}
              </div>
              <span className="text-[14px] sm:text-[15px] font-black text-slate-900 tracking-tight truncate leading-tight group-hover:text-[#F77512] transition-colors">
                {action.name}
              </span>
            </div>
          );

          if (action.href) {
            return (
              <Link key={index} href={action.href} prefetch={false} className="relative group cursor-pointer transition-all duration-200 w-full sm:flex-1 sm:min-w-[200px]">
                {content}
              </Link>
            );
          }

          return (
            <button
              key={index}
              type="button"
              onClick={action.onClick}
              className="relative group cursor-pointer transition-all duration-200 w-full sm:flex-1 sm:min-w-[200px] text-left"
            >
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActionsRow;
