/**
 * Bidirectional preferences sync hook.
 *
 * On mount (when user is authenticated):
 *   - Fetches ramadanStart + asrMadhab from server → writes to localStorage
 *     (server wins to unify across iOS PWA / Safari isolation)
 *
 * savePreferences(prefs):
 *   - Writes to localStorage immediately
 *   - If authenticated, PATCHes to /api/user/preferences
 *   - If push-subscribed, PATCHes to /api/push/preferences
 *
 * This solves iOS PWA storage isolation:
 *   localStorage is isolated between Safari browser and installed PWA,
 *   but cookies (used by better-auth) are shared. So we use the API
 *   as the source of truth when the user is logged in.
 */

import { useEffect, useCallback, useRef } from 'react';
import { useSession } from '../lib/auth-client';
import { setUserRamadanStart } from '../data/ramadanTimetable';
import { setUserAsrMadhab } from '../utils/settings';
import { updatePushPreferences, getPushSubscriptionState } from '../utils/pushNotifications';

const API_BASE = import.meta.env.VITE_API_URL || 'https://masjidconnectgy.com';

export function usePreferencesSync() {
  const { data: session } = useSession();
  const synced = useRef(false);

  // On login: pull preferences from server → localStorage
  useEffect(() => {
    if (!session?.user || synced.current) return;
    synced.current = true;

    fetch(`${API_BASE}/api/user/profile`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(profile => {
        if (!profile) return;
        if (profile.ramadanStart) setUserRamadanStart(profile.ramadanStart);
        if (profile.asrMadhab) setUserAsrMadhab(profile.asrMadhab);
      })
      .catch(() => {}); // Silently ignore — offline or no session
  }, [session]);

  // Reset sync flag on logout
  useEffect(() => {
    if (!session) synced.current = false;
  }, [session]);

  /** Save preferences to localStorage + API (if authenticated) + push subscription */
  const savePreferences = useCallback(async (prefs = {}) => {
    const { ramadanStart, asrMadhab } = prefs;

    // 1. Local storage (immediate, no flash)
    if (ramadanStart) setUserRamadanStart(ramadanStart);
    if (asrMadhab) setUserAsrMadhab(asrMadhab);

    // 2. API preferences (if logged in)
    if (session?.user) {
      const body = {};
      if (ramadanStart) body.ramadanStart = ramadanStart;
      if (asrMadhab) body.asrMadhab = asrMadhab;
      if (Object.keys(body).length > 0) {
        fetch(`${API_BASE}/api/user/preferences`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }).catch(() => {});
      }
    }

    // 3. Push subscription preferences
    const { subscribed } = await getPushSubscriptionState().catch(() => ({ subscribed: false }));
    if (subscribed) {
      updatePushPreferences(prefs).catch(() => {});
    }
  }, [session]);

  return { savePreferences };
}
