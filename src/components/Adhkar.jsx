import { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, Sun, Moon, Check, RotateCcw, ChevronDown, ChevronUp, RotateCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { morningAdhkar, eveningAdhkar, getTimeOfDay } from '../data/adhkarData';
import { updateTrackingData, getTrackingToday } from '../hooks/useRamadanTracker';
import PageHero from './PageHero';

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
    <div className="min-h-screen faith-canvas pb-24 page-enter">
      <PageHero 
        title={periodConfig.title} 
        subtitle="Fortress of the Muslim" 
        icon={Icon} 
        color={tab === 'morning' ? 'amber' : 'purple'} 
        pattern="organic" 
      />

      <main className="mx-auto w-full max-w-3xl px-4">
        {/* Progress & Toggle Card */}
        <div className="mc-card p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 shrink-0">
                <svg viewBox="0 0 120 120" className="h-12 w-12 -rotate-90" aria-hidden="true">
                  <circle cx="60" cy="60" r="48" className="fill-none stroke-gray-200 dark:stroke-gray-700" strokeWidth="12" />
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    className={`fill-none transition-all duration-500 ${tab === 'morning' ? 'stroke-amber-500' : 'stroke-indigo-500'}`}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={302}
                    strokeDashoffset={302 * (1 - (percentComplete / 100))}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-700 dark:text-gray-300">
                  {percentComplete}%
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{completedDhikr} / {totalDhikr} Done</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Keep your tongue moist with remembrance</p>
              </div>
            </div>
            
            <button
              onClick={resetAll}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Reset Progress"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-gray-800/50 rounded-xl">
            <button
              onClick={() => setTab('morning')}
              className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                tab === 'morning' 
                  ? 'bg-white dark:bg-gray-700 text-amber-600 dark:text-amber-400 shadow-sm' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
              }`}
            >
              <Sun className="w-3.5 h-3.5 inline mr-1.5" /> Morning
            </button>
            <button
              onClick={() => setTab('evening')}
              className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                tab === 'evening' 
                  ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
              }`}
            >
              <Moon className="w-3.5 h-3.5 inline mr-1.5" /> Evening
            </button>
          </div>
        </div>

        <section className="space-y-3" aria-live="polite">
          {allDone && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl flex items-center justify-center gap-2 text-emerald-700 dark:text-emerald-400 mb-4 animate-fade-in">
              <Check className="w-4 h-4" />
              <span className="text-xs font-semibold">MashaAllah! All {tab} adhkar complete.</span>
            </div>
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
