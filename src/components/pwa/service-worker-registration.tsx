'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        });

        // Check for updates on page focus
        const handleFocus = () => registration.update();
        window.addEventListener('focus', handleFocus);

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available — could show a toast here if needed
              console.log('[SW] New version available.');
            }
          });
        });

        console.log('[SW] Registered:', registration.scope);

        return () => window.removeEventListener('focus', handleFocus);
      } catch (err) {
        console.warn('[SW] Registration failed:', err);
      }
    };

    registerSW();
  }, []);

  return null;
}
