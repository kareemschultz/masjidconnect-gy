import { useState, useEffect } from 'react';
import { Moon, X } from 'lucide-react';
import { RAMADAN_START_OPTIONS, setUserRamadanStart } from '../data/ramadanTimetable';

const PROMPT_KEY = 'ramadan_start_prompted';

export default function RamadanStartPrompt() {
  const [show, setShow] = useState(false);
  const [selected, setSelected] = useState('2026-02-19');

  useEffect(() => {
    // Show once if user hasn't picked their start date yet
    if (localStorage.getItem(PROMPT_KEY)) return;
    if (localStorage.getItem('ramadan_start')) return;
    // If wizard hasn't been completed yet, it covers this step — don't double-prompt
    if (!localStorage.getItem('onboarding_v2')) return;
    // Only show during Ramadan window (Feb 18 – Mar 21, 2026)
    const now = Date.now();
    const start = new Date('2026-02-18T00:00:00Z').getTime();
    const end = new Date('2026-03-21T00:00:00Z').getTime();
    if (now < start || now > end) return;
    // Slight delay so the app renders first
    const t = setTimeout(() => setShow(true), 2000);
    return () => clearTimeout(t);
  }, []);

  const confirm = () => {
    setUserRamadanStart(selected);
    localStorage.setItem(PROMPT_KEY, 'done');
    setShow(false);
    // Reload to refresh all day counts
    window.location.reload();
  };

  const dismiss = () => {
    localStorage.setItem(PROMPT_KEY, 'skipped');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={dismiss} aria-hidden="true" />

      {/* Modal */}
      <div
        className="relative bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-emerald-100 dark:border-emerald-900 animate-fade-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ramadan-start-heading"
      >
        {/* Close */}
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center">
            <Moon className="w-8 h-8 text-emerald-600" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-5">
          <h2 id="ramadan-start-heading" className="text-lg font-bold text-emerald-900 dark:text-emerald-100 font-cinzel mb-1">
            When did your Ramadan start?
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            The <strong>CIOG</strong> follows the Saudi/international sighting (Feb 18); the <strong>GIT</strong> follows the local/regional moon sighting (Feb 19). Pick the one that matches your community.
          </p>
        </div>

        {/* Options */}
        <div className="space-y-2 mb-5" role="radiogroup" aria-labelledby="ramadan-start-heading">
          {RAMADAN_START_OPTIONS.map(opt => (
            <button
              key={opt.value}
              role="radio"
              aria-checked={selected === opt.value}
              onClick={() => setSelected(opt.value)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                selected === opt.value
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200'
                  : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-emerald-300 dark:hover:border-emerald-700'
              }`}
            >
              <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                selected === opt.value ? 'border-emerald-500' : 'border-gray-300 dark:border-gray-600'
              }`} aria-hidden="true">
                {selected === opt.value && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
              </span>
              <span>
                <span className="text-sm font-medium block">{opt.label}</span>
                {opt.desc && <span className="text-[11px] text-gray-400 dark:text-gray-500 block mt-0.5">{opt.desc}</span>}
              </span>
            </button>
          ))}
        </div>

        {/* Confirm */}
        <button
          onClick={confirm}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-semibold text-sm transition-colors"
        >
          🌙 Confirm
        </button>
        <p className="text-center text-[10px] text-gray-400 mt-2">
          You can change this later in the Ramadan tab.
        </p>
      </div>
    </div>
  );
}
