import { useState, useEffect, useCallback } from 'react';
import { db, isDemo, collection, addDoc, query, where, orderBy, onSnapshot } from '../firebase';
import { sampleSubmissions } from '../data/sampleData';

const getToday = () => new Date().toISOString().split('T')[0];

export function useSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isDemo || !db) {
      setSubmissions(sampleSubmissions);
      setLoading(false);
      return;
    }

    const today = getToday();
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
  }, []);

  const addSubmission = useCallback(async (submission) => {
    const entry = {
      ...submission,
      date: getToday(),
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

  const todaySubmissions = submissions.filter(s => s.date === getToday());

  return { submissions: todaySubmissions, allSubmissions: submissions, loading, error, addSubmission };
}
