import { useState } from 'react';
import { X, Send, CheckCircle } from 'lucide-react';
import { masjids } from '../data/masjids';

export default function SubmitForm({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    masjidId: '',
    menu: '',
    submittedBy: '',
    servings: '',
    notes: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.masjidId || !form.menu || !form.submittedBy) return;
    
    setSubmitting(true);
    await onSubmit({
      ...form,
      servings: form.servings ? parseInt(form.servings) : null,
    });
    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => onClose(), 2000);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/50 flex items-end sm:items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-md text-center animate-fade-in">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-emerald-900 font-amiri">JazakAllah Khair!</h3>
          <p className="text-gray-600 text-sm mt-2">Your update has been shared with the community.</p>
          <p className="text-emerald-600 text-xs mt-1">May Allah accept your efforts this Ramadan 🤲</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-end sm:items-center justify-center">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-emerald-100 px-4 py-3 flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl">
          <h3 className="font-bold text-emerald-900 font-amiri text-lg">Share Tonight's Iftaar</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Masjid select */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">🕌 Which Masjid?</label>
            <select
              required
              value={form.masjidId}
              onChange={e => setForm(f => ({ ...f, masjidId: e.target.value }))}
              className="w-full border border-emerald-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
            >
              <option value="">Select a masjid...</option>
              {masjids.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Menu */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">🍽️ What's being served?</label>
            <textarea
              required
              rows={3}
              value={form.menu}
              onChange={e => setForm(f => ({ ...f, menu: e.target.value }))}
              placeholder="e.g., Chicken curry, rice, dhal, roti, dates, mauby..."
              className="w-full border border-emerald-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">👤 Your name</label>
            <input
              required
              type="text"
              value={form.submittedBy}
              onChange={e => setForm(f => ({ ...f, submittedBy: e.target.value }))}
              placeholder="e.g., Brother Ahmad / Sister Fatima"
              className="w-full border border-emerald-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Servings */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">👥 Approx. servings (optional)</label>
            <input
              type="number"
              value={form.servings}
              onChange={e => setForm(f => ({ ...f, servings: e.target.value }))}
              placeholder="e.g., 100"
              className="w-full border border-emerald-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">📝 Notes (optional)</label>
            <input
              type="text"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="e.g., Sisters section available, special program..."
              className="w-full border border-emerald-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !form.masjidId || !form.menu || !form.submittedBy}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm"
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

          <p className="text-center text-xs text-gray-400">
            بارك الله فيكم — May Allah bless you
          </p>
        </form>
      </div>
    </div>
  );
}
