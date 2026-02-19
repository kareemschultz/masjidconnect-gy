import { useState, useEffect, useCallback } from 'react';
import { guyanaDate } from '../utils/timezone';
import { API_BASE } from '../config';


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
      console.error('Failed to load submissions:', err.message);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

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
      console.error('Failed to add submission:', err.message);
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
      console.error('Failed to react:', err.message);
    }
  }, []);

  return { submissions, loading, addSubmission, reactToSubmission, refresh: fetchSubmissions };
}

/**
 * Fetch historical submissions for a specific date or masjid.
 */
export async function fetchHistoricalSubmissions(date, masjidId) {
  try {
    const params = new URLSearchParams();
    if (date) params.set('date', date);
    const res = await fetch(`${API_BASE}/api/submissions?${params}`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error('fetch failed');
    const data = await res.json();
    return masjidId ? data.filter(s => s.masjidId === masjidId) : data;
  } catch (err) {
    console.error('Historical fetch failed:', err.message);
    return [];
  }
}
