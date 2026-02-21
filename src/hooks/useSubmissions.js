import { useState, useEffect, useCallback } from 'react';
import { guyanaDate } from '../utils/timezone';
import { API_BASE } from '../config';
import { logError } from '../utils/logger';

/**
 * @typedef {Object} SubmissionPayload
 * @property {string} masjidId
 * @property {string} menu
 * @property {string} submittedBy
 * @property {number | null} [servings]
 * @property {string} [notes]
 */

export function useSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = guyanaDate();

  const fetchSubmissions = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/submissions?date=${today}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json();
      setSubmissions(data);
    } catch (err) {
      logError('useSubmissions.fetchSubmissions', err);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  /**
   * @param {SubmissionPayload} submission
   */
  const addSubmission = useCallback(async (submission) => {
    try {
      const res = await fetch(`${API_BASE}/api/submissions`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...submission, date: today }),
      });
      if (!res.ok) throw new Error('submit failed');
      const entry = await res.json();
      setSubmissions(prev => [entry, ...prev]);
      return entry;
    } catch (err) {
      logError('useSubmissions.addSubmission', err);
      throw err;
    }
  }, [today]);

  const reactToSubmission = useCallback(async (id, type, delta) => {
    try {
      const res = await fetch(`${API_BASE}/api/submissions/${id}/react`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, delta }),
      });
      if (!res.ok) throw new Error('react failed');
      const updated = await res.json();
      setSubmissions(prev => prev.map(s => s.id === updated.id ? updated : s));
      return updated;
    } catch (err) {
      logError('useSubmissions.reactToSubmission', err);
      return null;
    }
  }, []);

  return { submissions, loading, addSubmission, reactToSubmission, refresh: fetchSubmissions };
}

/**
 * Fetch historical submissions for a specific date or masjid.
 */
const HISTORICAL_CACHE_TTL_MS = 60 * 1000;
const historicalCache = new Map();

export async function fetchHistoricalSubmissions(date, masjidId) {
  try {
    const params = new URLSearchParams();
    if (date) params.set('date', date);
    const query = params.toString();
    const cacheKey = query || '__all__';
    const now = Date.now();
    const cached = historicalCache.get(cacheKey);

    if (cached && now - cached.ts < HISTORICAL_CACHE_TTL_MS) {
      const data = cached.data;
      return masjidId ? data.filter(s => s.masjidId === masjidId) : data;
    }

    const res = await fetch(`${API_BASE}/api/submissions?${query}`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error('fetch failed');
    const data = await res.json();
    historicalCache.set(cacheKey, { ts: now, data });
    return masjidId ? data.filter(s => s.masjidId === masjidId) : data;
  } catch (err) {
    logError('fetchHistoricalSubmissions', err);
    return [];
  }
}
