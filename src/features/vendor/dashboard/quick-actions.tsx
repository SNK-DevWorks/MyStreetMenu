'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
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
      bg: "#A5D6A7", // Vibrant Pastel Green
      text: "#143314", // Deep Green
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      )
    },
    {
      name: isDownloading ? "Saving..." : "Download QR",
      onClick: handleDownloadQR,
      bg: "#FFCC80", // Vibrant Pastel Orange
      text: "#592700", // Deep Orange/Brown
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
          <line x1="12" y1="18" x2="12.01" y2="18"></line>
        </svg>
      )
    },
    {
      name: "Preview Menu",
      href: "/vendor/menu?tab=preview",
      bg: "#FFE082", // Vibrant Pastel Yellow
      text: "#5C4000", // Deep Gold
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      )
    },
    {
      name: "Share Menu",
      onClick: handleShareMenu,
      bg: "#F48FB1", // Vibrant Pastel Pink
      text: "#4A001F", // Deep Pink/Burgundy
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
          <polyline points="16 6 12 2 8 6"></polyline>
          <line x1="12" y1="2" x2="12" y2="15"></line>
        </svg>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1200px] mt-24 sm:mt-32 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-bold animate-in fade-in slide-in-from-bottom-2 duration-200">
          {toastMessage}
        </div>
      )}

      <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight px-1">
        Quick Actions
      </h2>
      
      {/* Horizontal Scrollable Row */}
      <div className="flex flex-row overflow-x-auto pb-4 gap-4 items-center no-scrollbar">
        {actions.map((action, index) => {
          const content = (
            <div 
              className="px-6 py-4.5 sm:py-5 rounded-2xl flex flex-row items-center justify-center gap-3.5 border border-white/60 shadow-sm hover:shadow-md transition-all duration-300"
              style={{
                backgroundColor: action.bg,
                color: action.text,
              }}
            >
              <div className="opacity-90 group-hover:scale-110 group-hover:opacity-100 transition-all duration-300">
                {action.icon}
              </div>
              <span className="text-base sm:text-lg font-bold tracking-wide whitespace-nowrap">
                {action.name}
              </span>
            </div>
          );

          if (action.href) {
            return (
              <Link key={index} href={action.href} className="relative group cursor-pointer transition-all duration-300 flex-1 min-w-[210px]">
                {content}
              </Link>
            );
          }

          return (
            <button
              key={index}
              type="button"
              onClick={action.onClick}
              className="relative group cursor-pointer transition-all duration-300 flex-1 min-w-[210px] text-left"
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
