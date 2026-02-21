import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, CheckCircle } from 'lucide-react';
import { useToast } from '../contexts/useToast';
import { API_BASE } from '../config';
import { INPUT_BASE_CLASS, PAGE_CONTAINER_CLASS } from './ui/layoutPrimitives';


const TYPES = [
  { value: 'correction', icon: '✏️', label: 'Correction', desc: 'Something is wrong or outdated' },
  { value: 'add_masjid', icon: '🕌', label: 'Add a Masjid', desc: 'Know a masjid we missed?' },
  { value: 'prayer_time', icon: '🕐', label: 'Prayer Time Fix', desc: 'Reported times are inaccurate' },
  { value: 'feature', icon: '💡', label: 'Feature Idea', desc: 'Suggest something new' },
  { value: 'bug', icon: '🐛', label: 'Bug Report', desc: 'Something is broken' },
  { value: 'other', icon: '💬', label: 'Other', desc: 'General feedback' },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateForm(selectedType, form) {
  const errors = {};

  if (!selectedType) {
    errors.type = 'Select a feedback category.';
  }

  if (!form.message.trim()) {
    errors.message = 'Please enter your message.';
  } else if (form.message.trim().length < 8) {
    errors.message = 'Please provide a bit more detail (at least 8 characters).';
  }

  if (form.email.trim() && !EMAIL_REGEX.test(form.email.trim())) {
    errors.email = 'Enter a valid email or leave it blank.';
  }

  return errors;
}

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
  const [showValidation, setShowValidation] = useState(false);
  const [touched, setTouched] = useState({ type: false, message: false, email: false });

  const errors = validateForm(selectedType, form);
  const hasErrors = Object.keys(errors).length > 0;
  const showFieldError = (field) => (showValidation || touched[field]) && errors[field];
  const fieldClass = (field) => `${INPUT_BASE_CLASS} ${showFieldError(field) ? 'border-red-400 focus:ring-red-400' : ''}`;

  const set = (key) => (e) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowValidation(true);
    setTouched({ type: true, message: true, email: true });
    if (hasErrors) {
      addToast('Please fix the highlighted fields.', 'error');
      return;
    }

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
      <div className={`${PAGE_CONTAINER_CLASS.shell} py-10 text-center`}>
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
    <div className={PAGE_CONTAINER_CLASS.shell}>
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
        {showValidation && hasErrors && (
          <div
            role="alert"
            aria-live="polite"
            className="rounded-xl border border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-xs text-red-700 dark:text-red-300"
          >
            Please correct the highlighted fields before submitting.
          </div>
        )}

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
                onClick={() => {
                  setTouched((prev) => ({ ...prev, type: true }));
                  setSelectedType(t.value);
                }}
                className={`flex items-start gap-2.5 p-3 rounded-xl border-2 text-left transition-all ${
                  selectedType === t.value
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30'
                    : showFieldError('type')
                      ? 'border-red-300 dark:border-red-700'
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
          {showFieldError('type') && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.type}</p>
          )}
        </div>

        {/* Message */}
        <div>
          <label htmlFor="feedback-message" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
            Your Message <span className="text-red-400">*</span>
          </label>
          <textarea
            id="feedback-message"
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
            aria-invalid={Boolean(showFieldError('message'))}
            aria-describedby={showFieldError('message') ? 'feedback-message-error' : undefined}
            className={`${fieldClass('message')} resize-none`}
          />
          {showFieldError('message') && (
            <p id="feedback-message-error" className="mt-1 text-xs text-red-600 dark:text-red-400">
              {errors.message}
            </p>
          )}
        </div>

        {/* Name + Email (optional) */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="feedback-name" className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
              Your Name (optional)
            </label>
            <input
              id="feedback-name"
              type="text"
              value={form.name}
              onChange={set('name')}
              placeholder="Brother / Sister..."
              className={INPUT_BASE_CLASS}
            />
          </div>
          <div>
            <label htmlFor="feedback-email" className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
              Email (optional)
            </label>
            <input
              id="feedback-email"
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="For a reply"
              aria-invalid={Boolean(showFieldError('email'))}
              aria-describedby={showFieldError('email') ? 'feedback-email-error' : undefined}
              className={fieldClass('email')}
            />
            {showFieldError('email') && (
              <p id="feedback-email-error" className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.email}
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting || hasErrors}
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
