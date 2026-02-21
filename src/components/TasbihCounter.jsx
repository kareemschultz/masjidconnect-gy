import { useState, useEffect, useRef, useMemo } from 'react';
import { RotateCcw, Settings, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getTrackingToday, updateTrackingData } from '../hooks/useRamadanTracker';

const DEFAULT_DHIKR = [
  {
    key: 'subhanallah',
    arabic: 'سُبْحَانَ اللَّهِ',
    transliteration: 'SubhanAllah',
    translation: 'Glory be to Allah',
    target: 33,
    color: 'emerald',
  },
  {
    key: 'alhamdulillah',
    arabic: 'الْحَمْدُ لِلَّهِ',
    transliteration: 'Alhamdulillah',
    translation: 'All praise is due to Allah',
    target: 33,
    color: 'gold',
  },
  {
    key: 'allahuakbar',
    arabic: 'اللَّهُ أَكْبَرُ',
    transliteration: 'Allahu Akbar',
    translation: 'Allah is the Greatest',
    target: 34,
    color: 'blue',
  },
];

const COLOR_MAP = {
  emerald: {
    bg: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800',
    ring: 'text-emerald-500 dark:text-emerald-400',
    text: 'text-emerald-700 dark:text-emerald-300',
    badge: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
    progress: 'from-emerald-400 to-emerald-600',
  },
  gold: {
    bg: 'bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700',
    ring: 'text-yellow-500 dark:text-yellow-400',
    text: 'text-yellow-700 dark:text-yellow-300',
    badge: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300',
    progress: 'from-yellow-400 to-yellow-600',
  },
  blue: {
    bg: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800',
    ring: 'text-blue-600 dark:text-blue-400',
    text: 'text-blue-700 dark:text-blue-300',
    badge: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    progress: 'from-blue-400 to-blue-600',
  },
  custom: {
    bg: 'bg-teal-600 hover:bg-teal-700 active:bg-teal-800',
    ring: 'text-teal-600 dark:text-teal-400',
    text: 'text-teal-700 dark:text-teal-300',
    badge: 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300',
    progress: 'from-teal-400 to-teal-600',
  },
};

const RING_RADIUS = 52;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function loadCustom() {
  try {
    const raw = localStorage.getItem('tasbih_custom');
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        phrase: parsed?.phrase || 'Lā ilāha illallāh',
        arabic: parsed?.arabic || 'لَا إِلَهَ إِلَّا اللَّهُ',
        target: Math.max(1, parseInt(parsed?.target, 10) || 100),
      };
    }
  } catch {
    // Ignore bad storage values and fall back to defaults.
  }
  return { phrase: 'Lā ilāha illallāh', arabic: 'لَا إِلَهَ إِلَّا اللَّهُ', target: 100 };
}

function vibrate(ms = 30) {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    navigator.vibrate(ms);
  }
}

export default function TasbihCounter() {
  const [cycleIdx, setCycleIdx] = useState(0);
  const [counts, setCounts] = useState([0, 0, 0, 0]);
  const [celebrated, setCelebrated] = useState([false, false, false, false]);
  const [sessionDone, setSessionDone] = useState(false);
  const [custom, setCustom] = useState(() => loadCustom());
  const [customInputOpen, setCustomInputOpen] = useState(false);
  const celebrateTimer = useRef(null);

  const dhikrList = useMemo(
    () => [
      ...DEFAULT_DHIKR,
      { key: 'custom', arabic: custom.arabic || '', transliteration: custom.phrase, translation: '', target: custom.target, color: 'custom' },
    ],
    [custom]
  );

  const current = dhikrList[cycleIdx];
  const palette = COLOR_MAP[current.color];
  const count = counts[cycleIdx];
  const progress = Math.min(count / current.target, 1);
  const isDone = celebrated[cycleIdx];
  const ringOffset = RING_CIRCUMFERENCE * (1 - progress);

  const sessionCount = useMemo(() => counts.slice(0, 3).reduce((a, b) => a + b, 0), [counts]);
  const completedSets = useMemo(
    () => counts.slice(0, 3).filter((value, index) => value >= (index === 2 ? 34 : 33)).length,
    [counts]
  );
  const completedMilestones = useMemo(() => celebrated.slice(0, 3).filter(Boolean).length, [celebrated]);

  const tap = () => {
    if (sessionDone || isDone) return;

    vibrate(25);
    setCounts((prev) => {
      const next = [...prev];
      next[cycleIdx] += 1;

      if (next[cycleIdx] === current.target) {
        vibrate(80);
        setCelebrated((prevCelebrated) => {
          const updated = [...prevCelebrated];
          updated[cycleIdx] = true;
          return updated;
        });

        clearTimeout(celebrateTimer.current);
        if (cycleIdx < 2) {
          celebrateTimer.current = setTimeout(() => {
            setCycleIdx((prevIdx) => prevIdx + 1);
          }, 1300);
        } else if (cycleIdx === 2) {
          celebrateTimer.current = setTimeout(() => {
            setSessionDone(true);
          }, 1300);
        }
      }

      return next;
    });
  };

  const reset = () => {
    if (counts.some((value) => value > 0) && !sessionDone) {
      if (!window.confirm('Reset current session?')) return;
    }

    clearTimeout(celebrateTimer.current);
    setCounts([0, 0, 0, 0]);
    setCelebrated([false, false, false, false]);
    setCycleIdx(0);
    setSessionDone(false);
  };

  const saveCustom = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const updated = {
      phrase: form.phrase.value.trim() || custom.phrase,
      arabic: form.arabic.value.trim() || '',
      target: Math.max(1, parseInt(form.target.value, 10) || custom.target),
    };

    localStorage.setItem('tasbih_custom', JSON.stringify(updated));
    setCustom(updated);
    setCounts((prev) => {
      const updatedCounts = [...prev];
      updatedCounts[3] = 0;
      return updatedCounts;
    });
    setCelebrated((prev) => {
      const updatedCelebrated = [...prev];
      updatedCelebrated[3] = false;
      return updatedCelebrated;
    });
    setCustomInputOpen(false);
  };

  useEffect(() => () => clearTimeout(celebrateTimer.current), []);

  useEffect(() => {
    if (!sessionDone) return;
    if (sessionCount === 0) return;

    const today = getTrackingToday();
    const existingDhikr = (today.dhikr_data && typeof today.dhikr_data === 'object') ? today.dhikr_data : {};
    const existingTasbih = (today.tasbih_data && typeof today.tasbih_data === 'object') ? today.tasbih_data : {};

    updateTrackingData({
      dhikr: true,
      dhikr_data: { ...existingDhikr, count: (parseInt(existingDhikr.count || 0, 10) + sessionCount) },
      tasbih_data: { sets: (parseInt(existingTasbih.sets || 0, 10) + completedSets) },
    });
  }, [completedSets, sessionCount, sessionDone]);

  return (
    <div className="min-h-screen worship-canvas pb-24 page-enter">
      <header className="sticky top-0 z-20 px-4 pt-safe pb-3">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-950 text-white shadow-xl">
          <div className="absolute inset-0 islamic-pattern opacity-40" aria-hidden="true" />
          <div className="relative px-5 py-5">
            <div className="flex items-center gap-3">
              <Link
                to="/ramadan"
                className="p-2 -ml-2 rounded-full bg-white/10 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 transition-colors"
                aria-label="Back to home"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold font-display">Tasbih Counter</h1>
                <p className="text-xs text-emerald-100/90">{sessionCount} / 100 core dhikr this session</p>
              </div>
              <button
                onClick={reset}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 transition-colors"
                aria-label="Reset tasbih session"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {[0, 1, 2].map((index) => {
                const done = celebrated[index];
                return (
                  <div
                    key={DEFAULT_DHIKR[index].key}
                    className={`rounded-xl border px-2 py-2 text-[11px] ${
                      done
                        ? 'border-emerald-300/70 bg-emerald-400/15 text-emerald-100'
                        : 'border-white/20 bg-white/8 text-emerald-50/90'
                    }`}
                  >
                    <p className="font-semibold truncate">{DEFAULT_DHIKR[index].transliteration}</p>
                    <p>{counts[index]}/{DEFAULT_DHIKR[index].target}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 space-y-4">
        {sessionDone && (
          <section className="worship-surface px-5 py-6 text-center animate-fade-in" aria-live="polite">
            <p className="text-5xl mb-2" aria-hidden="true">✨</p>
            <h2 className="text-xl font-bold text-emerald-800 dark:text-emerald-300">Tasbih Session Complete</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              SubhanAllah 33, Alhamdulillah 33, Allahu Akbar 34 completed.
            </p>
            <p className="font-amiri text-xl text-gold-500 dark:text-gold-400 mt-3">سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ</p>
            <button
              onClick={reset}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Start another session
            </button>
          </section>
        )}

        {!sessionDone && (
          <>
            <section className="worship-surface p-2" role="tablist" aria-label="Select dhikr phrase">
              <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                {dhikrList.map((dhikr, index) => (
                  <button
                    key={dhikr.key}
                    id={`tasbih-tab-${dhikr.key}`}
                    role="tab"
                    aria-selected={cycleIdx === index}
                    aria-controls={`tasbih-panel-${dhikr.key}`}
                    onClick={() => setCycleIdx(index)}
                    className={`min-h-11 flex-1 min-w-[88px] rounded-xl px-3 py-2 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                      cycleIdx === index
                        ? 'bg-white text-gray-900 shadow dark:bg-gray-800 dark:text-gray-100'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                  >
                    {celebrated[index] && <CheckCircle2 className="inline w-3.5 h-3.5 mr-1 text-emerald-500" />}
                    {dhikr.key === 'custom' ? 'Custom' : dhikr.transliteration.split(' ')[0]}
                  </button>
                ))}
              </div>
            </section>

            <section
              id={`tasbih-panel-${current.key}`}
              role="tabpanel"
              aria-labelledby={`tasbih-tab-${current.key}`}
              className="worship-surface px-5 py-6"
            >
              <div className="text-center space-y-1">
                <p className={`font-amiri text-3xl ${palette.text}`} dir="rtl">{current.arabic || '—'}</p>
                <p className="font-semibold text-gray-800 dark:text-gray-100">{current.transliteration}</p>
                {current.translation && (
                  <p className="text-xs italic text-gray-500 dark:text-gray-400">&quot;{current.translation}&quot;</p>
                )}
                <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${palette.badge}`}>
                  Target {current.target}
                </span>
              </div>

              <div className="mt-5 flex justify-center">
                <div className="relative h-32 w-32">
                  <svg viewBox="0 0 120 120" className="h-32 w-32 -rotate-90" aria-hidden="true">
                    <circle cx="60" cy="60" r={RING_RADIUS} className="fill-none stroke-gray-200 dark:stroke-gray-700" strokeWidth="10" />
                    <circle
                      cx="60"
                      cy="60"
                      r={RING_RADIUS}
                      strokeLinecap="round"
                      className={`fill-none transition-all duration-300 ${palette.ring}`}
                      strokeWidth="10"
                      strokeDasharray={RING_CIRCUMFERENCE}
                      strokeDashoffset={ringOffset}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-3xl font-bold tabular-nums ${palette.text}`}>{count}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">of {current.target}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${palette.progress} transition-all duration-300`}
                  style={{ width: `${progress * 100}%` }}
                />
              </div>

              <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400" aria-live="polite">
                {isDone
                  ? `${current.transliteration} completed.`
                  : `${completedMilestones}/3 core phrases completed this session.`}
              </p>

              <button
                onClick={tap}
                disabled={isDone}
                aria-label={`Count ${current.transliteration}`}
                className={`mt-4 min-h-40 w-full rounded-3xl px-4 text-lg font-bold text-white shadow-lg touch-manipulation transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${palette.bg} ${isDone ? 'cursor-not-allowed opacity-55' : 'active:scale-[0.98]'}`}
              >
                {isDone ? 'Completed' : 'Tap to Count'}
              </button>

              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <button
                  onClick={reset}
                  className="min-h-11 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Reset
                </button>

                {cycleIdx < 2 && !isDone && (
                  <button
                    onClick={() => setCycleIdx((prev) => prev + 1)}
                    className="min-h-11 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <span className="inline-flex items-center gap-1">
                      Skip
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </button>
                )}

                {cycleIdx === 3 && (
                  <button
                    onClick={() => setCustomInputOpen(true)}
                    className="min-h-11 rounded-xl border border-teal-200 px-3 py-2 text-sm font-medium text-teal-700 hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-teal-700/60 dark:text-teal-300 dark:hover:bg-teal-900/20"
                  >
                    <span className="inline-flex items-center gap-1">
                      <Settings className="w-4 h-4" />
                      Edit custom
                    </span>
                  </button>
                )}
              </div>
            </section>
          </>
        )}
      </main>

      {customInputOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-4" onClick={() => setCustomInputOpen(false)}>
          <form
            onSubmit={saveCustom}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-800"
            role="dialog"
            aria-modal="true"
            aria-labelledby="custom-dhikr-title"
          >
            <h3 id="custom-dhikr-title" className="text-lg font-bold text-gray-900 dark:text-gray-100">Custom Dhikr</h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Set a personal phrase and target for your own session.</p>

            <div className="mt-4 space-y-3">
              <div>
                <label htmlFor="custom-phrase" className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
                  Phrase (transliteration)
                </label>
                <input
                  id="custom-phrase"
                  name="phrase"
                  defaultValue={custom.phrase}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label htmlFor="custom-arabic" className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
                  Arabic (optional)
                </label>
                <input
                  id="custom-arabic"
                  name="arabic"
                  defaultValue={custom.arabic}
                  dir="rtl"
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xl font-amiri text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label htmlFor="custom-target" className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
                  Target count
                </label>
                <input
                  id="custom-target"
                  name="target"
                  type="number"
                  min="1"
                  max="9999"
                  defaultValue={custom.target}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCustomInputOpen(false)}
                className="min-h-11 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="min-h-11 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
