/**
 * SubmitHub — type-picker modal for the global + Submit button.
 * Routes to the correct sub-form based on what the user wants to submit.
 */
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TYPES = [
  {
    id: 'iftaar',
    icon: '🍽️',
    label: 'Iftaar Report',
    desc: "Share what your masjid is serving tonight",
    color: 'border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
  {
    id: 'event',
    icon: '🗓️',
    label: 'Community Event',
    desc: "Submit a lecture, program, or upcoming event",
    color: 'border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  },
  {
    id: 'masjid',
    icon: '🕌',
    label: 'Submit / Correct a Masjid',
    desc: "Add a new masjid or update an existing one's info",
    color: 'border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-900/20',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  },
  {
    id: 'feedback',
    icon: '💬',
    label: 'Feedback / Bug',
    desc: "Feature ideas, bug reports, or general feedback",
    color: 'border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20',
    badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  },
];

export default function SubmitHub({ onClose, onIftaar, onEvent }) {
  const navigate = useNavigate();

  const handleSelect = (id) => {
    if (id === 'iftaar') { onIftaar(); return; }
    if (id === 'event') { onEvent(); return; }
    if (id === 'masjid') { onClose(); navigate('/feedback?type=masjid'); return; }
    if (id === 'feedback') { onClose(); navigate('/feedback'); return; }
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-2xl w-full max-w-md shadow-2xl animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg font-amiri">
              What would you like to submit?
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Choose a category below
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type cards */}
        <div className="px-4 pb-6 space-y-2.5">
          {TYPES.map(t => (
            <button
              key={t.id}
              onClick={() => handleSelect(t.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all active:scale-[0.98] ${t.color}`}
            >
              <span className="text-3xl shrink-0">{t.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{t.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">{t.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
