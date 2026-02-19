import { useState } from 'react';
import { X, Send, CheckCircle, ChevronDown } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

const API_BASE = import.meta.env.VITE_API_URL || 'https://masjidconnectgy.com';

const EVENT_TYPES = [
  { value: 'ramadan', label: '🌙 Ramadan Program' },
  { value: 'salah', label: '🕐 Salah / Jumah' },
  { value: 'lecture', label: '🎤 Lecture / Talk' },
  { value: 'education', label: '📚 Islamic Education' },
  { value: 'community', label: '🤝 Community Event' },
  { value: 'eid', label: '🎉 Eid Celebration' },
  { value: 'other', label: '📌 Other' },
];

const inputClass = "w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-800 dark:text-gray-200 transition-all";

export default function EventSubmitForm({ onClose }) {
  const { addToast } = useToast();
  const [form, setForm] = useState({
    title: '',
    type: 'community',
    venue: '',
    date: '',
    time: '',
    description: '',
    contact: '',
    submittedBy: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.venue || !form.date || !form.submittedBy) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/events/submit`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Submission failed');
      setSubmitted(true);
      addToast('JazakAllah Khair! Your event has been submitted 📅');
      setTimeout(() => onClose(), 2500);
    } catch {
      addToast('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md text-center" onClick={e => e.stopPropagation()}>
          <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-100 font-amiri">
            JazakAllah Khair!
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
            Your event has been submitted for review. It will appear in the Events tab once approved.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 py-3 flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl z-10">
          <h3 className="font-bold text-emerald-900 dark:text-emerald-100 font-amiri text-lg">
            🗓️ Submit an Event
          </h3>
          <button onClick={onClose} aria-label="Close" className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
          {/* Event title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
              📌 Event Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={set('title')}
              placeholder="e.g., Ramadan Night Lecture — Sheikh Ahmad"
              className={inputClass}
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
              🏷️ Event Type
            </label>
            <div className="relative">
              <select
                value={form.type}
                onChange={set('type')}
                className={inputClass + ' appearance-none pr-9'}
              >
                {EVENT_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Venue */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
              🕌 Masjid / Venue <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={form.venue}
              onChange={set('venue')}
              placeholder="e.g., CIOG Central Masjid, Georgetown"
              className={inputClass}
            />
          </div>

          {/* Date + Time row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
                📅 Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                required
                value={form.date}
                onChange={set('date')}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
                🕐 Time
              </label>
              <input
                type="time"
                value={form.time}
                onChange={set('time')}
                className={inputClass}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
              📝 Description
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={set('description')}
              placeholder="Brief description of the event, who it's for, what to expect..."
              className={inputClass + ' resize-none'}
            />
          </div>

          {/* Contact */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
              📞 Contact (optional)
            </label>
            <input
              type="text"
              value={form.contact}
              onChange={set('contact')}
              placeholder="Phone number or email"
              className={inputClass}
            />
          </div>

          {/* Your name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
              👤 Your Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={form.submittedBy}
              onChange={set('submittedBy')}
              placeholder="e.g., Brother Ahmad"
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !form.title || !form.venue || !form.date || !form.submittedBy}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all text-sm active:scale-95 disabled:cursor-not-allowed"
          >
            {submitting
              ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <><Send className="w-4 h-4" /> Submit Event</>
            }
          </button>

          <p className="text-center text-xs text-gray-400 dark:text-gray-500">
            Events are reviewed before appearing in the app · بارك الله فيكم
          </p>
        </form>
      </div>
    </div>
  );
}
