import { useState, useEffect, useCallback } from 'react';
import { db, isDemo, collection, addDoc, query, where, orderBy, onSnapshot, getDocs } from '../firebase';
import { sampleSubmissions } from '../data/sampleData';
import { guyanaDate } from '../utils/timezone';

export function useSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const today = guyanaDate();

  useEffect(() => {
    if (isDemo || !db) {
      setSubmissions(sampleSubmissions);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'submissions'),
      where('date', '==', today),
      orderBy('submittedAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setSubmissions(data);
      setLoading(false);
    }, (err) => {
      console.error('Firestore error:', err);
      setError(err.message);
      setSubmissions(sampleSubmissions);
      setLoading(false);
    });

    return unsub;
  }, [today]);

  const addSubmission = useCallback(async (submission) => {
    const entry = {
      ...submission,
      date: guyanaDate(),
      submittedAt: new Date().toISOString(),
      id: Date.now().toString(),
    };

    if (isDemo || !db) {
      setSubmissions(prev => [entry, ...prev]);
      return entry;
    }

    try {
      await addDoc(collection(db, 'submissions'), entry);
      return entry;
    } catch (err) {
      console.error('Failed to submit:', err);
      setSubmissions(prev => [entry, ...prev]);
      return entry;
    }
  }, []);

  return { submissions, loading, error, addSubmission };
}

/**
 * Fetch historical submissions.
 * - date=null → all dates for the masjid
 * - masjidId=null → all masjids for that date
 * - both null → everything (use sparingly)
 */
export async function fetchHistoricalSubmissions(date, masjidId) {
  if (isDemo || !db) {
    return sampleSubmissions.filter(s =>
      (!date || s.date === date) &&
      (!masjidId || s.masjidId === masjidId)
    );
  }
  try {
    const constraints = [];
    if (date) constraints.push(where('date', '==', date));
    if (masjidId) constraints.push(where('masjidId', '==', masjidId));
    constraints.push(orderBy('submittedAt', 'desc'));
    const q = query(collection(db, 'submissions'), ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('Historical query failed:', err);
    return [];
  }
}
