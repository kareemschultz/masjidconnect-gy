import { useState, useCallback } from 'react';

const STORAGE_KEY = 'ramadan_tracker_v1';
const CHECKLIST_ITEMS = ['fasted', 'quran', 'dhikr', 'prayer', 'masjid'];
const MIN_FOR_STREAK = 3; // out of 5

function getTodayKey() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
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

export function useRamadanTracker() {
  const [data, setData] = useState(loadData);

  const today = getTodayKey();
  const todayRecord = data[today] || {};

  const toggle = useCallback((item) => {
    setData(prev => {
      const next = {
        ...prev,
        [today]: {
          ...prev[today],
          [item]: !prev[today]?.[item],
        },
      };
      saveData(next);
      return next;
    });
  }, [today]);

  const getCompletedCount = useCallback((dateKey) => {
    const record = data[dateKey] || {};
    return CHECKLIST_ITEMS.filter(item => record[item]).length;
  }, [data]);

  const getStreak = useCallback(() => {
    let streak = 0;
    const date = new Date();
    // Don't count today in streak — it's still in progress
    date.setDate(date.getDate() - 1);

    while (streak < 30) {
      const key = date.toISOString().slice(0, 10);
      const count = getCompletedCount(key);
      if (count < MIN_FOR_STREAK) break;
      streak++;
      date.setDate(date.getDate() - 1);
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

  return {
    todayRecord,
    toggle,
    getStreak,
    getTodayProgress,
    getAllDays,
    checklist: CHECKLIST_ITEMS,
  };
}
