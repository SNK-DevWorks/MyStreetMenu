// MyStreetMenu Service Worker v3
// Provides offline capability for the PWA shell and static assets only.
// Auth routes and protected pages are always fetched from network.

const STATIC_CACHE = 'msm-static-v3';
const DYNAMIC_CACHE = 'msm-dynamic-v3';

// Static assets to pre-cache on install
const STATIC_ASSETS = [
  '/manifest.json',
  '/favicon.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/text-logo.png',
];

// ─── Install ─────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Failed to pre-cache static assets:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// ─── Activate ────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// ─── Fetch Strategy ──────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // ── NEVER intercept these — always go to network ────────────────────────────

  // 1. Auth routes — PKCE code must reach the server untouched.
  //    Also never cache /?code= (OAuth fallback landing on root).
  if (
    url.pathname.startsWith('/auth/') ||
    url.pathname.startsWith('/api/') ||
    url.searchParams.has('code') ||
    url.searchParams.has('error')
  ) {
    return; // Let browser handle without SW interception
  }

  // 2. Vendor protected pages — must always be fresh (session-aware).
  //    Caching these causes stale auth state to be shown.
  if (url.pathname.startsWith('/vendor/') || url.pathname.startsWith('/admin/')) {
    return; // Network only, no SW caching
  }

  // Cross-origin requests (except cloudinary)
  if (url.origin !== self.location.origin && !url.hostname.includes('cloudinary')) {
    return;
  }

  // ── Cloudinary images: cache first ──────────────────────────────────────────
  if (url.hostname.includes('cloudinary.com')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        });
      })
    );
    return;
  }

  // ── Static file assets: cache first ─────────────────────────────────────────
  if (url.pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|css)$/)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          // Only cache successful non-redirect responses
          if (response.ok && response.status === 200) {
            const copy = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        }).catch(() => cached || new Response('', { status: 404 }));
      })
    );
    return;
  }

  // ── Root page (/) and other public pages: network first, cache fallback ──────
  // Only cache the plain root — never when it has query params (e.g. ?code=).
  if (url.pathname === '/' && !url.search) {
    event.respondWith(
      fetch(request).then((response) => {
        // Only cache successful non-redirect responses
        if (response.ok && response.status === 200 && response.type !== 'opaqueredirect') {
          const copy = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      }).catch(() => {
        return caches.match('/') || new Response(
          '<html><body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#FDF6F0"><div style="text-align:center"><h2 style="color:#f77512">You\'re Offline</h2><p style="color:#666">Check your connection and try again.</p></div></body></html>',
          { headers: { 'Content-Type': 'text/html' } }
        );
      })
    );
    return;
  }


  // Default: network only (don't cache unknown routes)
  event.respondWith(fetch(request));
});

// ─── Push Notifications ──────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'MyStreetMenu';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: data.tag || 'msm-notification',
    data: { url: data.url || '/vendor/dashboard' },
    actions: [
      { action: 'open', title: 'Open Dashboard' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  const url = event.notification.data?.url || '/vendor/dashboard';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/vendor') && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
