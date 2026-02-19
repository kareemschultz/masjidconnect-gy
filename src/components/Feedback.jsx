import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, CheckCircle } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { API_BASE } from '../config';


const TYPES = [
  { value: 'correction', icon: '✏️', label: 'Correction', desc: 'Something is wrong or outdated' },
  { value: 'add_masjid', icon: '🕌', label: 'Add a Masjid', desc: 'Know a masjid we missed?' },
  { value: 'prayer_time', icon: '🕐', label: 'Prayer Time Fix', desc: 'Reported times are inaccurate' },
  { value: 'feature', icon: '💡', label: 'Feature Idea', desc: 'Suggest something new' },
  { value: 'bug', icon: '🐛', label: 'Bug Report', desc: 'Something is broken' },
  { value: 'other', icon: '💬', label: 'Other', desc: 'General feedback' },
];

const inputClass = "w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-800 dark:text-gray-200 transition-all placeholder-gray-400";

export default function Feedback() {
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();
  const [selectedType, setSelectedType] = useState(() => {
    const t = searchParams.get('type');
    const match = t ? TYPES.find(x => x.value === t || x.value.startsWith(t)) : null;
    return match?.value || '';
  });
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedType || !form.message.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/feedback`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          name: form.name || null,
          email: form.email || null,
          message: form.message,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      setSubmitted(true);
    } catch {
      addToast('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="px-4 py-10 max-w-md mx-auto text-center">
        <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-emerald-900 dark:text-emerald-100 font-amiri mb-2">
          JazakAllah Khair!
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
          Your feedback has been received. We read every submission and use it to improve MasjidConnect GY for the whole community.
        </p>
        <p className="text-emerald-600 dark:text-emerald-400 text-xs mt-3">
          بارك الله فيكم — May Allah bless you
        </p>
        <button
          onClick={() => { setSubmitted(false); setForm({ name: '', email: '', message: '' }); setSelectedType(''); }}
          className="mt-6 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          Submit Another
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-5 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-4xl mb-3">💬</div>
        <h2 className="text-xl font-bold text-emerald-900 dark:text-emerald-100 font-amiri mb-1">
          Feedback &amp; Corrections
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          Help us keep MasjidConnect GY accurate and useful for the whole community.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type picker */}
        <div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
            What's this about? <span className="text-red-400">*</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            {TYPES.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => setSelectedType(t.value)}
                className={`flex items-start gap-2.5 p-3 rounded-xl border-2 text-left transition-all ${
                  selectedType === t.value
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700'
                }`}
              >
                <span className="text-lg leading-none mt-0.5">{t.icon}</span>
                <div>
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-tight">{t.label}</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 leading-snug">{t.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
            Your Message <span className="text-red-400">*</span>
          </label>
          <textarea
            required
            rows={4}
            value={form.message}
            onChange={set('message')}
            placeholder={
              selectedType === 'add_masjid'
                ? 'Masjid name, address, phone number, and any other details...'
                : selectedType === 'correction'
                ? 'What needs to be corrected, and what the correct information is...'
                : selectedType === 'prayer_time'
                ? 'Which masjid, which prayer time, and what the correct time is...'
                : selectedType === 'bug'
                ? 'What happened, what you expected, and how to reproduce it...'
                : 'Tell us more...'
            }
            className={inputClass + ' resize-none'}
          />
        </div>

        {/* Name + Email (optional) */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
              Your Name (optional)
            </label>
            <input
              type="text"
              value={form.name}
              onChange={set('name')}
              placeholder="Brother / Sister..."
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
              Email (optional)
            </label>
            <input
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="For a reply"
              className={inputClass}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting || !selectedType || !form.message.trim()}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all text-sm active:scale-95"
        >
          {submitting
            ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <><Send className="w-4 h-4" /> Send Feedback</>
          }
        </button>

        <p className="text-center text-[11px] text-gray-400 dark:text-gray-500">
          All submissions are reviewed by the MasjidConnect GY team 🤲
        </p>
      </form>
    </div>
  );
}
