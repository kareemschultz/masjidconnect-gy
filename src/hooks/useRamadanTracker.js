import { useState, useCallback, useEffect, useRef } from 'react';
import { guyanaDate, guyanaDateOffset } from '../utils/timezone';
import { calculateDayPoints, calculateTotalPoints, POINT_VALUES } from '../utils/points';
import { useSession } from '../lib/auth-client';
import { API_BASE } from '../config';

const STORAGE_KEY = 'ramadan_tracker_v1';
const CHECKLIST_ITEMS = ['fasted', 'quran', 'dhikr', 'prayer', 'masjid'];
const MIN_FOR_STREAK = 3; // out of 5

function getTodayKey() {
  return guyanaDate(); // YYYY-MM-DD in Guyana time
}

function loadData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function safeParseJson(val) {
  if (!val) return {};
  if (typeof val === 'object') return val;
  try { return JSON.parse(val); } catch { return {}; }
}

async function pushToAPI(date, record) {
  try {
    await fetch(`${API_BASE}/api/tracking/${date}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(record),
    });
  } catch {
    // Offline-first: localStorage is source of truth, API sync is best-effort
  }
}

async function fetchFromAPI() {
  try {
    const res = await fetch(`${API_BASE}/api/tracking`, { credentials: 'include' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ─── Standalone helpers for cross-component tracking updates ─────────────────
// TasbihCounter and QuranReader call these to update today's tracking record
// without needing the useRamadanTracker hook instance.

export function getTrackingToday() {
  const data = loadData();
  return data[getTodayKey()] || {};
}

export function updateTrackingData(updates) {
  const today = getTodayKey();
  const data = loadData();
  const current = data[today] || {};
  data[today] = { ...current, ...updates };
  saveData(data);
  // Best-effort API sync (credentials: 'include' sends session cookie if logged in)
  pushToAPI(today, data[today]);
  return data[today];
}

export function useRamadanTracker() {
  const [data, setData] = useState(loadData);
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const today = getTodayKey();
  const todayRecord = data[today] || {};

  // Debounce ref for API sync on toggle
  const debounceRef = useRef(null);

  // On mount: if logged in, fetch from API and merge (API wins on conflict)
  useEffect(() => {
    if (!isLoggedIn) return;
    fetchFromAPI().then(rows => {
      if (!rows || !Array.isArray(rows)) return;
      setData(prev => {
        const merged = { ...prev };
        for (const row of rows) {
          const dateKey = typeof row.date === 'string'
            ? row.date.slice(0, 10)
            : new Date(row.date).toISOString().slice(0, 10);
          merged[dateKey] = {
            fasted: !!row.fasted,
            quran:  !!row.quran,
            dhikr:  !!row.dhikr,
            prayer: !!row.prayer,
            masjid: !!row.masjid,
            prayer_data: safeParseJson(row.prayer_data),
            dhikr_data:  safeParseJson(row.dhikr_data),
            quran_data:  safeParseJson(row.quran_data),
          };
        }
        saveData(merged);
        return merged;
      });
    });
  // Only run on login state change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const toggle = useCallback((item) => {
    setData(() => {
      // Read fresh from localStorage so _data fields written by TasbihCounter/QuranReader aren't lost
      const fresh = loadData();
      const todayFresh = fresh[today] || {};
      const next = {
        ...fresh,
        [today]: {
          ...todayFresh,
          [item]: !todayFresh[item],
        },
      };
      saveData(next);

      // Debounced API sync when logged in
      if (isLoggedIn) {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          pushToAPI(today, next[today]);
        }, 500);
      }

      return next;
    });
  }, [today, isLoggedIn]);

  const getCompletedCount = useCallback((dateKey) => {
    const record = data[dateKey] || {};
    return CHECKLIST_ITEMS.filter(item => record[item]).length;
  }, [data]);

  const getStreak = useCallback(() => {
    let streak = 0;
    while (streak < 30) {
      const key = guyanaDateOffset(-(streak + 1));
      const count = getCompletedCount(key);
      if (count < MIN_FOR_STREAK) break;
      streak++;
    }
    return streak;
  }, [getCompletedCount]);

  const getTodayProgress = useCallback(() => {
    const completed = getCompletedCount(today);
    return { completed, total: CHECKLIST_ITEMS.length, percentage: Math.round((completed / CHECKLIST_ITEMS.length) * 100) };
  }, [getCompletedCount, today]);

  const getAllDays = useCallback(() => {
    return Object.entries(data).map(([date, record]) => ({
      date,
      completed: CHECKLIST_ITEMS.filter(item => record[item]).length,
      total: CHECKLIST_ITEMS.length,
    })).sort((a, b) => a.date.localeCompare(b.date));
  }, [data]);

  // ─── Points derived from existing tracking data ───────────────────────────

  const getTodayPoints = useCallback(() => {
    const streak = getStreak();
    return calculateDayPoints(todayRecord, streak);
  }, [todayRecord, getStreak]);

  const getTotalPoints = useCallback(() => {
    return calculateTotalPoints(data);
  }, [data]);

  const getPointsHistory = useCallback(() => {
    const sortedDates = Object.keys(data).sort();
    return sortedDates.map((date, i) => {
      const record = data[date] || {};
      let streakBeforeDay = 0;
      for (let j = i - 1; j >= 0; j--) {
        const prevRecord = data[sortedDates[j]] || {};
        const count = Object.keys(POINT_VALUES).filter(k => prevRecord[k]).length;
        if (count >= MIN_FOR_STREAK) streakBeforeDay++;
        else break;
      }
      const { total } = calculateDayPoints(record, streakBeforeDay);
      return { date, points: total, items: record };
    });
  }, [data]);

  return {
    todayRecord,
    toggle,
    getStreak,
    getTodayProgress,
    getAllDays,
    checklist: CHECKLIST_ITEMS,
    getTodayPoints,
    getTotalPoints,
    getPointsHistory,
  };
}
