// MasjidConnect GY — Service Worker
// Handles: caching, push notifications, scheduled iftaar alerts

const CACHE_NAME = 'masjidconnect-gy-v2';
const BASE = '/masjidconnect-gy';

const STATIC_ASSETS = [
  `${BASE}/`,
  `${BASE}/index.html`,
  `${BASE}/manifest.json`,
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

// ─── Fetch (network-first, cache fallback) ────────────────────────────────────
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('googleapis.com') ||
      event.request.url.includes('firestore') ||
      event.request.url.includes('firebase')) return;

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

// ─── Scheduled local notifications (posted from client via postMessage) ────────
// The client posts: { type: 'SCHEDULE_IFTAAR', maghribMs: <unix ms>, ramadanDay: <n> }
// We store the scheduled time and fire it via a setTimeout within the SW.

let scheduledIftaarTimer = null;
let scheduledWarningTimer = null;

function showIftaarNotification(ramadanDay) {
  const isLastTen = ramadanDay >= 21;

  // At-iftaar notification
  self.registration.showNotification('🎉 Iftaar Time — Break Your Fast!', {
    body: 'اللَّهُمَّ لَكَ صُمْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ\nAllahumma laka sumtu wa \'ala rizqika aftartu',
    icon: `${BASE}/vite.svg`,
    tag: 'iftaar-now',
    requireInteraction: true,
    vibrate: [300, 100, 300, 100, 300],
    data: `${BASE}/ramadan`,
    actions: [
      { action: 'open', title: '📖 See Duas & Dhikr' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
    silent: false,
  });

  // Post-iftaar dhikr reminder — 5 minutes later
  setTimeout(() => {
    self.registration.showNotification('📿 Post-Iftaar Dhikr', {
      body: 'SubhanAllah × 33 · Alhamdulillah × 33 · Allahu Akbar × 34\nAstaghfirullah × 100',
      icon: `${BASE}/vite.svg`,
      tag: 'iftaar-dhikr',
      data: `${BASE}/ramadan`,
      vibrate: [100, 50, 100],
    });
  }, 5 * 60 * 1000);

  // Tahajjud reminder for last 10 nights — fired at 2 AM the next day
  if (isLastTen) {
    const now = new Date();
    const tomorrow2am = new Date(now);
    tomorrow2am.setDate(tomorrow2am.getDate() + 1);
    tomorrow2am.setHours(2, 0, 0, 0);
    const msUntilTahajjud = tomorrow2am - now;
    if (msUntilTahajjud > 0 && msUntilTahajjud < 12 * 60 * 60 * 1000) {
      setTimeout(() => {
        self.registration.showNotification('🌙 Tahajjud Time — Last 10 Nights!', {
          body: 'Wake up and pray! Laylatul Qadr is better than 1,000 months. اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
          icon: `${BASE}/vite.svg`,
          tag: 'tahajjud',
          requireInteraction: true,
          vibrate: [200, 100, 200, 100, 200, 100, 200],
          data: `${BASE}/ramadan`,
          actions: [
            { action: 'open', title: '🤲 Open App' },
          ],
        });
      }, msUntilTahajjud);
    }
  }
}

function showIftaarWarning(ramadanDay, minutesLeft) {
  self.registration.showNotification(`🌇 Iftaar in ${minutesLeft} minutes`, {
    body: 'Make dua now — the fasting person\'s dua is never rejected!\nاللَّهُمَّ لَكَ صُمْتُ...',
    icon: `${BASE}/vite.svg`,
    tag: 'iftaar-warning',
    vibrate: [150, 75, 150],
    data: `${BASE}/ramadan`,
    silent: false,
  });
}

self.addEventListener('message', (event) => {
  const msg = event.data;
  if (!msg || msg.type !== 'SCHEDULE_IFTAAR') return;

  const { maghribMs, ramadanDay } = msg;
  const now = Date.now();
  const msLeft = maghribMs - now;

  // Clear any previously scheduled timers (can't persist across SW restarts,
  // but this prevents double-scheduling within a session)
  if (scheduledIftaarTimer) clearTimeout(scheduledIftaarTimer);
  if (scheduledWarningTimer) clearTimeout(scheduledWarningTimer);

  if (msLeft <= 0 || msLeft > 12 * 60 * 60 * 1000) return; // Sanity check

  // 10-minute warning
  const warn10 = msLeft - 10 * 60 * 1000;
  if (warn10 > 0) {
    scheduledWarningTimer = setTimeout(() => showIftaarWarning(ramadanDay, 10), warn10);
  }

  // 5-minute warning
  const warn5 = msLeft - 5 * 60 * 1000;
  if (warn5 > 0) {
    setTimeout(() => showIftaarWarning(ramadanDay, 5), warn5);
  }

  // At iftaar
  scheduledIftaarTimer = setTimeout(() => showIftaarNotification(ramadanDay), msLeft);

  // Confirm to client
  event.source?.postMessage({ type: 'IFTAAR_SCHEDULED', maghribMs, msLeft });
});
