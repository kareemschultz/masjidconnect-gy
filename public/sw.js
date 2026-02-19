// MasjidConnect GY — Service Worker
// Handles: caching, push notifications, scheduled iftaar alerts

const CACHE_NAME = 'masjidconnect-gy-v3';
const BASE = '';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// ─── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// ─── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ─── Fetch (stale-while-revalidate) ───────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type !== 'opaque') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});

// ─── Push notifications (server-sent — future use with VAPID) ─────────────────
self.addEventListener('push', (event) => {
  let data = { title: 'MasjidConnect GY', body: 'You have a reminder 🕌' };
  try {
    data = event.data.json();
  } catch {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: `${BASE}/icons/icon-192.png`,
      badge: `${BASE}/icons/badge-72.png`,
      tag: data.tag || 'masjidconnect',
      data: data.url || `${BASE}/`,
      vibrate: [200, 100, 200],
      actions: data.actions || [],
    })
  );
});

// ─── Notification click ───────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data || `${BASE}/`;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((c) => c.url.includes(BASE) && 'focus' in c);
      if (existing) return existing.focus();
      return self.clients.openWindow(url);
    })
  );
});

// Push notifications are sent server-side via VAPID cron.
