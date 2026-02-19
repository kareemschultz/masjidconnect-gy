/**
 * Web Push Notification utility for MasjidConnect GY
 *
 * Handles VAPID subscription management with the API backend.
 * Works for both authenticated users and anonymous visitors.
 * On iOS: push notifications only work when installed as a PWA.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'https://masjidconnectgy.com';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert VAPID base64url public key to Uint8Array for PushManager */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

/** Get or create a persistent anonymous ID for this browser/device */
export function getAnonId() {
  let id = localStorage.getItem('mcgy_anon_id');
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now();
    localStorage.setItem('mcgy_anon_id', id);
  }
  return id;
}

/** Fetch the VAPID public key from the API */
async function getVapidPublicKey() {
  const cached = sessionStorage.getItem('mcgy_vapid_pubkey');
  if (cached) return cached;
  const res = await fetch(`${API_BASE}/api/push/vapid-public-key`);
  if (!res.ok) throw new Error('VAPID public key unavailable');
  const { publicKey } = await res.json();
  sessionStorage.setItem('mcgy_vapid_pubkey', publicKey);
  return publicKey;
}

/** Send a PushSubscription to the API */
async function sendSubscriptionToApi(subscription, prefs = {}) {
  const { p256dh, auth } = subscription.toJSON().keys;
  await fetch(`${API_BASE}/api/push/subscribe`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      endpoint: subscription.endpoint,
      keys: { p256dh, auth },
      anonId: getAnonId(),
      ramadanStart: prefs.ramadanStart || localStorage.getItem('ramadan_start') || '2026-02-19',
      asrMadhab: prefs.asrMadhab || localStorage.getItem('asr_madhab') || 'shafi',
    }),
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Check if Web Push is supported on this device/browser.
 * On iOS: only works if app is installed as PWA (iOS 16.4+).
 */
export function isPushSupported() {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * Get the current push subscription state.
 * Returns: { subscribed: bool, permission: 'default'|'granted'|'denied' }
 */
export async function getPushSubscriptionState() {
  if (!isPushSupported()) return { subscribed: false, permission: 'denied' };
  const permission = Notification.permission;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    return { subscribed: !!sub, permission, subscription: sub };
  } catch {
    return { subscribed: false, permission };
  }
}

/**
 * Subscribe to push notifications.
 * Requests permission → creates PushManager subscription → sends to API.
 *
 * @param {object} prefs - Optional { ramadanStart, asrMadhab }
 * @returns {object} { success: bool, reason?: string }
 */
export async function subscribeToPush(prefs = {}) {
  if (!isPushSupported()) return { success: false, reason: 'unsupported' };

  // Request notification permission
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return { success: false, reason: 'denied' };
  }

  try {
    const vapidPublicKey = await getVapidPublicKey();
    const reg = await navigator.serviceWorker.ready;

    // Re-use existing subscription or create new one
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
    }

    await sendSubscriptionToApi(sub, prefs);
    localStorage.setItem('ramadan_notifs', 'true');

    // Show confirmation notification
    reg.showNotification('MasjidConnect GY 🌙', {
      body: 'Iftaar reminders are now on! You\'ll be notified before Iftaar time each day.',
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      tag: 'push-enabled-confirm',
    });

    return { success: true };
  } catch (err) {
    console.error('subscribeToPush error:', err);
    return { success: false, reason: 'error', error: err.message };
  }
}

/**
 * Unsubscribe from push notifications.
 * Removes PushManager subscription and notifies API.
 */
export async function unsubscribeFromPush() {
  if (!isPushSupported()) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await fetch(`${API_BASE}/api/push/unsubscribe`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      });
      await sub.unsubscribe();
    }
    localStorage.removeItem('ramadan_notifs');
  } catch (err) {
    console.error('unsubscribeFromPush error:', err);
  }
}

/**
 * Update push subscription preferences (e.g. after wizard step changes them).
 */
export async function updatePushPreferences(prefs) {
  if (!isPushSupported()) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (!sub) return;
    await fetch(`${API_BASE}/api/push/preferences`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: sub.endpoint, ...prefs }),
    });
  } catch (err) {
    console.error('updatePushPreferences error:', err);
  }
}
