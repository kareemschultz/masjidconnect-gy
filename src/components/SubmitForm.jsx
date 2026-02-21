import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, CheckCircle } from 'lucide-react';
import { masjids } from '../data/masjids';
import { useToast } from '../contexts/useToast';
import { INPUT_BASE_CLASS } from './ui/layoutPrimitives';

function validateForm(form) {
  const errors = {};
  if (!form.masjidId) errors.masjidId = 'Select a masjid.';
  if (!form.menu.trim()) errors.menu = 'Add tonight\'s menu.';
  if (!form.submittedBy.trim()) errors.submittedBy = 'Enter your name.';
  if (form.servings && (!Number.isInteger(Number(form.servings)) || Number(form.servings) <= 0)) {
    errors.servings = 'Servings must be a positive whole number.';
  }
  return errors;
}

export default function SubmitForm({ onClose, onSubmit, defaultMasjidId }) {
  const [form, setForm] = useState({
    masjidId: defaultMasjidId || '',
    menu: '',
    submittedBy: '',
    servings: '',
    notes: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showValidation, setShowValidation] = useState(false);
  const [touched, setTouched] = useState({});
  const { addToast } = useToast();
  const firstFocusRef = useRef(null);
  const lastFocusRef = useRef(null);

  useEffect(() => { firstFocusRef.current?.focus(); }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'Tab') {
      const focusable = Array.from(
        e.currentTarget.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      ).filter(el => !el.disabled);
      const idx = focusable.indexOf(document.activeElement);
      if (e.shiftKey && idx === 0) { e.preventDefault(); focusable[focusable.length - 1]?.focus(); }
      else if (!e.shiftKey && idx === focusable.length - 1) { e.preventDefault(); focusable[0]?.focus(); }
    }
  }, [onClose]);

  const errors = validateForm(form);
  const hasErrors = Object.keys(errors).length > 0;
  const showFieldError = (field) => (showValidation || touched[field]) && errors[field];
  const fieldClass = (field) => `${INPUT_BASE_CLASS} ${showFieldError(field) ? 'border-red-400 focus:ring-red-400' : 'border-emerald-200 dark:border-gray-600 dark:bg-gray-700'}`;

  const setField = (key) => (e) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowValidation(true);
    if (hasErrors) return;
    setError('');
    setSubmitting(true);
    try {
      await onSubmit({
        ...form,
        servings: form.servings ? parseInt(form.servings) : null,
      });
      setSubmitted(true);
      addToast('JazakAllah Khair! Your update has been shared 🤲');
      setTimeout(() => onClose(), 2000);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md text-center animate-fade-in" onClick={e => e.stopPropagation()}>
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-100 font-amiri">JazakAllah Khair!</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">Your update has been shared with the community.</p>
          <p className="text-emerald-600 dark:text-emerald-400 text-xs mt-1">May Allah accept your efforts this Ramadan 🤲</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Share Tonight's Iftaar"
      onKeyDown={handleKeyDown}
      onClick={onClose}
    >
      <div className="bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-emerald-100 dark:border-gray-700 px-4 py-3 flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl z-10">
          <h3 className="font-bold text-emerald-900 dark:text-emerald-100 font-amiri text-lg">Share Tonight's Iftaar</h3>
          <button ref={lastFocusRef} onClick={onClose} aria-label="Close submission form" className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl px-3 py-2.5 text-sm text-red-700 dark:text-red-400" role="alert">
              {error}
            </div>
          )}
          {showValidation && hasErrors && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl px-3 py-2.5 text-sm text-red-700 dark:text-red-400" role="alert">
              Please fix the highlighted fields.
            </div>
          )}

          {/* Masjid select */}
          <div>
            <label htmlFor="submit-masjid" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">🕌 Which Masjid?</label>
            <select
              ref={firstFocusRef}
              id="submit-masjid"
              required
              value={form.masjidId}
              onChange={setField('masjidId')}
              aria-invalid={Boolean(showFieldError('masjidId'))}
              aria-describedby={showFieldError('masjidId') ? 'submit-masjid-error' : undefined}
              className={fieldClass('masjidId')}
            >
              <option value="">Select a masjid...</option>
              {masjids.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            {showFieldError('masjidId') && <p id="submit-masjid-error" className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.masjidId}</p>}
          </div>

          {/* Menu */}
          <div>
            <label htmlFor="submit-menu" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">🍽️ What's being served?</label>
            <textarea
              id="submit-menu"
              required
              rows={3}
              value={form.menu}
              onChange={setField('menu')}
              placeholder="e.g., Chicken curry, rice, dhal, roti, dates, mauby..."
              aria-invalid={Boolean(showFieldError('menu'))}
              aria-describedby={showFieldError('menu') ? 'submit-menu-error' : undefined}
              className={`${fieldClass('menu')} resize-none`}
            />
            {showFieldError('menu') && <p id="submit-menu-error" className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.menu}</p>}
          </div>

          {/* Name */}
          <div>
            <label htmlFor="submit-name" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">👤 Your name</label>
            <input
              id="submit-name"
              required
              type="text"
              value={form.submittedBy}
              onChange={setField('submittedBy')}
              placeholder="e.g., Brother Ahmad / Sister Fatima"
              aria-invalid={Boolean(showFieldError('submittedBy'))}
              aria-describedby={showFieldError('submittedBy') ? 'submit-name-error' : undefined}
              className={fieldClass('submittedBy')}
            />
            {showFieldError('submittedBy') && <p id="submit-name-error" className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.submittedBy}</p>}
          </div>

          {/* Servings */}
          <div>
            <label htmlFor="submit-servings" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">👥 Approx. servings (optional)</label>
            <input
              id="submit-servings"
              type="number"
              value={form.servings}
              onChange={setField('servings')}
              placeholder="e.g., 100"
              aria-invalid={Boolean(showFieldError('servings'))}
              aria-describedby={showFieldError('servings') ? 'submit-servings-error' : undefined}
              className={fieldClass('servings')}
            />
            {showFieldError('servings') && <p id="submit-servings-error" className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.servings}</p>}
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="submit-notes" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">📝 Notes (optional)</label>
            <input
              id="submit-notes"
              type="text"
              value={form.notes}
              onChange={setField('notes')}
              placeholder="e.g., Sisters section available, special program..."
              className={fieldClass('notes')}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || hasErrors}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all text-sm active:scale-95"
          >
            {submitting ? (
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                Share with the Community
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-400 dark:text-gray-500">
            بارك الله فيكم — May Allah bless you
          </p>
        </form>
      </div>
    </div>
  );
}
