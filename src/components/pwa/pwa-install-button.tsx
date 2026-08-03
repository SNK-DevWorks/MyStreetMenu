'use client';

import React, { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
  });
}

export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(globalDeferredPrompt);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSSheet, setShowIOSSheet] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if app is already running as an installed PWA (Standalone)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const ua = window.navigator.userAgent;
    const isIosDevice =
      /iphone|ipad|ipod/i.test(ua) ||
      (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 1 && /macintosh/i.test(ua));

    setIsIOS(isIosDevice);

    // Show banner after short delay
    const timer = setTimeout(() => setVisible(true), 600);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      globalDeferredPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setVisible(false);
      setShowIOSSheet(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSSheet(true);
      return;
    }

    const promptEvent = deferredPrompt || globalDeferredPrompt;

    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
          setVisible(false);
        }
      } catch (err) {
        console.warn('[PWA] Native install prompt error:', err);
        setShowIOSSheet(true);
      } finally {
        setDeferredPrompt(null);
        globalDeferredPrompt = null;
      }
    } else {
      setShowIOSSheet(true);
    }
  };

  if (isInstalled) return null;

  return (
    <>
      {/* ── Top Notification Banner ────────────────────────────────────────────── */}
      {visible && !bannerDismissed && (
        <div className="fixed top-4 md:top-14 lg:top-16 inset-x-0 z-[9999] flex justify-center px-4 pointer-events-none transition-all duration-300">
          <div className="pointer-events-auto w-full max-w-sm bg-slate-950/90 text-white backdrop-blur-2xl border border-slate-800/90 shadow-[0_16px_40px_-8px_rgba(0,0,0,0.45)] rounded-2xl px-4 py-3 flex items-center gap-3 animate-in fade-in slide-in-from-top-6 duration-300">
            {/* App Icon */}
            <img
              src="/icons/icon-96x96.png"
              alt="MyStreetMenu"
              className="w-10 h-10 rounded-xl shrink-0 border border-slate-800 shadow-md"
            />

            {/* Notification Text */}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-white leading-tight truncate">
                MyStreetMenu
              </p>
              <p className="text-[11px] text-slate-300 leading-tight mt-0.5">
                {isIOS ? 'Tap Share → Add to Home Screen' : 'Install app on your phone'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleInstallClick}
                className="bg-gradient-to-r from-[#ff6b2b] to-[#f77512] text-white text-[12px] font-extrabold px-3.5 py-1.5 rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-[0_4px_12px_rgba(255,107,43,0.35)] cursor-pointer"
              >
                {isIOS ? 'How?' : 'Install'}
              </button>
              <button
                type="button"
                onClick={() => setBannerDismissed(true)}
                aria-label="Close notification"
                className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white rounded-full hover:bg-slate-800/80 transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── iOS / Helper Instructions Bottom Sheet (Gokul-style) ──────────────── */}
      {showIOSSheet && (
        <div className="fixed inset-0 z-[10000] flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          {/* Backdrop click closes sheet */}
          <div className="absolute inset-0" onClick={() => setShowIOSSheet(false)} />

          <div className="relative w-full max-w-md mx-auto bg-[#F2F2F7] rounded-t-[22px] shadow-[0_-10px_35px_rgba(0,0,0,0.25)] border-t border-white/20 p-6 flex flex-col gap-5 animate-in slide-in-from-bottom duration-300 pointer-events-auto">
            {/* iOS slider handle */}
            <div className="w-10 h-1 bg-black/15 rounded-full mx-auto -mt-2.5 mb-0 shrink-0" />

            {/* Header */}
            <div className="flex items-start gap-4">
              <img
                src="/icons/icon-96x96.png"
                alt="MyStreetMenu"
                className="w-12 h-12 rounded-2xl shrink-0 shadow-sm border border-black/5"
              />
              <div className="flex-1">
                <h4 className="text-lg font-extrabold text-slate-900 leading-tight">
                  Install MyStreetMenu
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isIOS ? 'Add to iPhone / iPad Home Screen' : 'Add to your device Home Screen'}
                </p>
              </div>
            </div>

            {/* Steps */}
            <div className="bg-white/80 rounded-2xl p-4 border border-black/[0.06] space-y-3.5 shadow-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {isIOS ? 'Steps for iOS Safari:' : 'Steps to Install:'}
              </p>

              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#ff6b2b]/15 text-[#ff6b2b] flex items-center justify-center font-bold text-xs shrink-0">
                  1
                </div>
                <p className="flex-1 text-xs font-medium text-slate-900">
                  Tap the{' '}
                  <span className="font-extrabold text-[#ff6b2b] bg-[#ff6b2b]/10 px-1.5 py-0.5 rounded-md inline-flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                      <polyline points="16 6 12 2 8 6"/>
                      <line x1="12" y1="2" x2="12" y2="15"/>
                    </svg>
                    Share
                  </span>{' '}
                  button in Safari&apos;s toolbar.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#ff6b2b]/15 text-[#ff6b2b] flex items-center justify-center font-bold text-xs shrink-0">
                  2
                </div>
                <p className="flex-1 text-xs font-medium text-slate-900">
                  Scroll down and select{' '}
                  <span className="font-extrabold text-[#ff6b2b] bg-[#ff6b2b]/10 px-1.5 py-0.5 rounded-md inline-flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="16"/>
                      <line x1="8" y1="12" x2="16" y2="12"/>
                    </svg>
                    Add to Home Screen
                  </span>.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#ff6b2b]/15 text-[#ff6b2b] flex items-center justify-center font-bold text-xs shrink-0">
                  3
                </div>
                <p className="flex-1 text-xs font-medium text-slate-900">
                  Open <strong>MyStreetMenu</strong> from your Home Screen and log in!
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowIOSSheet(false)}
              className="w-full py-3.5 bg-gradient-to-r from-[#ff6b2b] to-[#f77512] hover:brightness-110 active:scale-[0.98] text-white font-bold rounded-2xl shadow-[0_4px_14px_rgba(255,107,43,0.35)] transition-all duration-200 cursor-pointer text-sm"
            >
              Understand &amp; Dismiss
            </button>
          </div>
        </div>
      )}
    </>
  );
}
