import { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, Sun, Moon, Check, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { morningAdhkar, eveningAdhkar, getTimeOfDay } from '../data/adhkarData';
import { updateTrackingData, getTrackingToday } from '../hooks/useRamadanTracker';

const STORAGE_KEY = 'adhkar_progress';

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { date: getToday(), morning: {}, evening: {} };

    const data = JSON.parse(raw);
    if (data.date !== getToday()) return { date: getToday(), morning: {}, evening: {} };
    return data;
  } catch {
    return { date: getToday(), morning: {}, evening: {} };
  }
}

export default function Adhkar() {
  const timeOfDay = getTimeOfDay();
  const [tab, setTab] = useState(timeOfDay === 'morning' ? 'morning' : 'evening');
  const [progress, setProgress] = useState(loadProgress);
  const [expanded, setExpanded] = useState(null);

  const periodConfig = tab === 'morning'
    ? {
      title: 'Morning Adhkar',
      subtitle: 'Start with remembrance and protection',
      headerClass: 'from-amber-500 via-orange-500 to-amber-700',
      tint: 'bg-amber-100 text-amber-700 dark:bg-amber-900/35 dark:text-amber-300',
      icon: Sun,
      actionClass: 'bg-amber-500 hover:bg-amber-600 focus-visible:ring-amber-500',
    }
    : {
      title: 'Evening Adhkar',
      subtitle: 'Close your day with gratitude and trust',
      headerClass: 'from-indigo-600 via-violet-700 to-indigo-900',
      tint: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/35 dark:text-indigo-300',
      icon: Moon,
      actionClass: 'bg-indigo-500 hover:bg-indigo-600 focus-visible:ring-indigo-500',
    };

  const adhkarList = useMemo(() => (tab === 'morning' ? morningAdhkar : eveningAdhkar), [tab]);
  const currentProgress = useMemo(() => progress[tab] || {}, [progress, tab]);

  const totalDhikr = useMemo(
    () => adhkarList.reduce((sum, dhikr) => sum + dhikr.count, 0),
    [adhkarList]
  );
  const completedDhikr = useMemo(
    () => adhkarList.reduce((sum, dhikr) => sum + Math.min(currentProgress[dhikr.id] || 0, dhikr.count), 0),
    [adhkarList, currentProgress]
  );
  const percentComplete = useMemo(
    () => Math.round((completedDhikr / totalDhikr) * 100),
    [completedDhikr, totalDhikr]
  );
  const allDone = completedDhikr >= totalDhikr;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const increment = useCallback((id, maxCount) => {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(8);
    }

    setProgress((prev) => {
      const tabData = { ...(prev[tab] || {}) };
      const currentCount = tabData[id] || 0;
      if (currentCount >= maxCount) return prev;

      tabData[id] = currentCount + 1;
      return { ...prev, [tab]: tabData };
    });
  }, [tab]);

  const resetAll = useCallback(() => {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate([16, 40, 16]);
    }
    setProgress((prev) => ({ ...prev, [tab]: {} }));
  }, [tab]);

  useEffect(() => {
    if (!allDone) return;

    const today = getTrackingToday();
    const existing = today.adhkar_data || {};
    const key = tab === 'morning' ? 'morning_complete' : 'evening_complete';

    if (!existing[key]) {
      updateTrackingData({ adhkar_data: { ...existing, [key]: true } });
    }
  }, [allDone, tab]);

  const Icon = periodConfig.icon;

  return (
    <div className="min-h-screen worship-canvas pb-24 page-enter">
      <header className="sticky top-0 z-20 px-4 pt-safe pb-3">
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${periodConfig.headerClass} text-white shadow-xl transition-colors duration-500`}>
          <div className="absolute inset-0 islamic-pattern opacity-35" aria-hidden="true" />
          <div className="relative px-5 py-5">
            <div className="flex items-center gap-3">
              <Link
                to="/ramadan"
                className="p-2 -ml-2 rounded-full bg-white/10 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 transition-colors"
                aria-label="Back to home"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>

              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold font-display">Daily Adhkar</h1>
                <p className="text-xs text-white/80">Fortress of the Muslim</p>
              </div>

              <button
                onClick={resetAll}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 transition-colors"
                aria-label={`Reset ${tab} adhkar progress`}
                title="Reset progress"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-[auto_1fr] items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-3 py-2">
              <div className="relative h-12 w-12 shrink-0">
                <svg viewBox="0 0 120 120" className="h-12 w-12 -rotate-90" aria-hidden="true">
                  <circle cx="60" cy="60" r="48" className="fill-none stroke-white/25" strokeWidth="16" />
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    className="fill-none stroke-white transition-all duration-500"
                    strokeWidth="16"
                    strokeLinecap="round"
                    strokeDasharray={302}
                    strokeDashoffset={302 * (1 - (percentComplete / 100))}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                  {percentComplete}%
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{periodConfig.title}</p>
                <p className="text-xs text-white/80">{completedDhikr} of {totalDhikr} completed</p>
              </div>
            </div>

            <div className="mt-3" role="tablist" aria-label="Choose adhkar period">
              <div className="grid grid-cols-2 gap-2">
                <button
                  role="tab"
                  aria-selected={tab === 'morning'}
                  onClick={() => setTab('morning')}
                  className={`min-h-11 rounded-xl px-3 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 ${
                    tab === 'morning' ? 'bg-white/30 shadow text-white' : 'bg-white/10 text-white/75 hover:bg-white/20'
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Sun className="w-4 h-4" /> Morning
                  </span>
                </button>
                <button
                  role="tab"
                  aria-selected={tab === 'evening'}
                  onClick={() => setTab('evening')}
                  className={`min-h-11 rounded-xl px-3 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 ${
                    tab === 'evening' ? 'bg-white/30 shadow text-white' : 'bg-white/10 text-white/75 hover:bg-white/20'
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Moon className="w-4 h-4" /> Evening
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4">
        <section className="worship-surface p-3" aria-live="polite">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-white/70 px-3 py-2 dark:border-emerald-900/40 dark:bg-gray-900/50">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{periodConfig.subtitle}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Tap the Arabic text or counter chip to increment.
              </p>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${periodConfig.tint}`}>
              <Icon className="inline w-3.5 h-3.5 mr-1" /> {allDone ? 'Complete' : `${percentComplete}%`}
            </span>
          </div>

          {allDone && (
            <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-sm font-semibold text-emerald-700 dark:border-emerald-700/60 dark:bg-emerald-900/20 dark:text-emerald-300 animate-fade-in">
              MashaAllah, all {tab} adhkar are complete.
            </p>
          )}

          <div className="mt-3 space-y-3">
            {adhkarList.map((dhikr, index) => {
              const count = currentProgress[dhikr.id] || 0;
              const done = count >= dhikr.count;
              const isExpanded = expanded === dhikr.id;

              return (
                <article
                  key={dhikr.id}
                  className={`rounded-2xl border p-3 transition-all motion-standard ${
                    done
                      ? 'border-emerald-200 bg-emerald-50/85 dark:border-emerald-700/60 dark:bg-emerald-900/20'
                      : 'border-gray-200 bg-white/90 dark:border-gray-700 dark:bg-gray-900/70'
                  }`}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <button
                    onClick={() => !done && increment(dhikr.id, dhikr.count)}
                    disabled={done}
                    className="w-full rounded-xl px-2 py-3 text-right touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    aria-label={`Increment dhikr ${dhikr.transliteration}. ${count} of ${dhikr.count} completed`}
                  >
                    <p className="font-amiri text-lg leading-relaxed text-gray-800 dark:text-gray-100" dir="rtl">
                      {dhikr.arabic}
                    </p>
                  </button>

                  <div className="mt-2 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setExpanded(isExpanded ? null : dhikr.id)}
                      className="min-h-11 rounded-lg px-2 text-xs text-gray-500 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:text-gray-400 dark:hover:text-gray-200"
                      aria-expanded={isExpanded}
                      aria-controls={`adhkar-details-${dhikr.id}`}
                    >
                      <span className="inline-flex items-center gap-1">
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        {dhikr.source}
                      </span>
                    </button>

                    {done ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                        <Check className="w-3.5 h-3.5" /> Done
                      </span>
                    ) : (
                      <button
                        onClick={() => increment(dhikr.id, dhikr.count)}
                        className={`min-h-11 rounded-xl px-3 py-2 text-sm font-bold text-white touch-manipulation transition-colors focus-visible:outline-none focus-visible:ring-2 ${periodConfig.actionClass}`}
                        aria-label={`Increase count for ${dhikr.transliteration}`}
                      >
                        {count}/{dhikr.count}
                      </button>
                    )}
                  </div>

                  {isExpanded && (
                    <div id={`adhkar-details-${dhikr.id}`} className="mt-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-xs dark:border-gray-700 dark:bg-gray-800 animate-slide-down">
                      <p className="italic text-gray-600 dark:text-gray-300">{dhikr.transliteration}</p>
                      <p className="mt-1 text-gray-500 dark:text-gray-400">{dhikr.translation}</p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
