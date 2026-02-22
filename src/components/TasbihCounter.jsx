import { useState, useEffect, useRef, useMemo } from 'react';
import { RotateCcw, Settings, CheckCircle2, ChevronRight, ChevronLeft, Fingerprint } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getTrackingToday, updateTrackingData } from '../hooks/useRamadanTracker';
import PageHero from './PageHero';

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
    ring: 'text-emerald-500',
    text: 'text-emerald-700 dark:text-emerald-300',
    badge: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
    progress: 'from-emerald-400 to-emerald-600',
  },
  gold: {
    bg: 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700',
    ring: 'text-amber-500',
    text: 'text-amber-700 dark:text-amber-300',
    badge: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
    progress: 'from-amber-400 to-amber-600',
  },
  blue: {
    bg: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800',
    ring: 'text-blue-600',
    text: 'text-blue-700 dark:text-blue-300',
    badge: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    progress: 'from-blue-400 to-blue-600',
  },
  custom: {
    bg: 'bg-teal-600 hover:bg-teal-700 active:bg-teal-800',
    ring: 'text-teal-600',
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
    <div className="min-h-screen faith-canvas pb-24 page-enter">
      <PageHero 
        title="Tasbih Counter" 
        subtitle={`${sessionCount} / 100 core dhikr`} 
        icon={Fingerprint} 
        color={current.color} 
        pattern="organic" 
      />

      <main className="max-w-lg mx-auto px-4 space-y-4">
        {sessionDone && (
          <section className="mc-card px-5 py-8 text-center animate-fade-in" aria-live="polite">
            <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-in">
              <span className="text-3xl">✨</span>
            </div>
            <h2 className="text-xl font-bold text-emerald-800 dark:text-emerald-300">Session Complete</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              SubhanAllah 33, Alhamdulillah 33, Allahu Akbar 34 completed.
            </p>
            <p className="font-amiri text-2xl text-gold-500 dark:text-gold-400 mt-4 leading-loose">سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ</p>
            <button
              onClick={reset}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700 shadow-lg shadow-emerald-900/20 active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Start new session
            </button>
          </section>
        )}

        {!sessionDone && (
          <>
            <section className="mc-card p-2" role="tablist" aria-label="Select dhikr phrase">
              <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                {dhikrList.map((dhikr, index) => (
                  <button
                    key={dhikr.key}
                    id={`tasbih-tab-${dhikr.key}`}
                    role="tab"
                    aria-selected={cycleIdx === index}
                    aria-controls={`tasbih-panel-${dhikr.key}`}
                    onClick={() => setCycleIdx(index)}
                    className={`flex-1 min-w-[88px] rounded-lg px-3 py-2.5 text-xs font-semibold transition-all whitespace-nowrap ${
                      cycleIdx === index
                        ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white shadow-sm'
                        : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50'
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
              className="mc-card px-6 py-8 relative overflow-hidden"
            >
              {/* Background Glow */}
              <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${palette.progress} opacity-[0.03] blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none`} />

              <div className="text-center space-y-2 relative z-10">
                <span className={`inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${palette.badge}`}>
                  Target {current.target}
                </span>
                <p className={`font-amiri text-4xl ${palette.text} py-2`} dir="rtl">{current.arabic || '—'}</p>
                <p className="font-bold text-lg text-gray-900 dark:text-white">{current.transliteration}</p>
                {current.translation && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{current.translation}</p>
                )}
              </div>

              <div className="mt-8 flex justify-center">
                <div className="relative h-48 w-48 tap-scale cursor-pointer" onClick={tap}>
                  {/* Progress Ring */}
                  <svg viewBox="0 0 120 120" className="h-48 w-48 -rotate-90 filter drop-shadow-sm" aria-hidden="true">
                    {/* Track */}
                    <circle cx="60" cy="60" r={RING_RADIUS} className="fill-none stroke-gray-100 dark:stroke-gray-800" strokeWidth="8" />
                    {/* Indicator */}
                    <circle
                      cx="60"
                      cy="60"
                      r={RING_RADIUS}
                      strokeLinecap="round"
                      className={`fill-none transition-all duration-300 ease-out ${palette.ring}`}
                      strokeWidth="8"
                      strokeDasharray={RING_CIRCUMFERENCE}
                      strokeDashoffset={ringOffset}
                    />
                  </svg>
                  
                  {/* Center Counter */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className={`text-5xl font-bold tabular-nums tracking-tight ${palette.text}`}>{count}</span>
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-widest mt-1">Count</span>
                  </div>
                  
                  {/* Tap Ripple Hint */}
                  <div className={`absolute inset-0 rounded-full border-4 border-transparent ${isDone ? '' : 'active:border-gray-100/50'} transition-all`} />
                </div>
              </div>

              <button
                onClick={tap}
                disabled={isDone}
                aria-label={`Count ${current.transliteration}`}
                className={`mt-8 w-full py-4 rounded-2xl text-sm font-bold text-white shadow-lg shadow-emerald-900/10 touch-manipulation transition-all active:scale-[0.98] ${palette.bg} ${isDone ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                {isDone ? 'Completed' : 'Tap to Count'}
              </button>

              <div className="mt-6 flex items-center justify-between gap-3">
                <button
                  onClick={reset}
                  className="flex-1 rounded-xl border border-gray-200 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Reset
                </button>

                {cycleIdx < 2 && !isDone && (
                  <button
                    onClick={() => setCycleIdx((prev) => prev + 1)}
                    className="flex-1 rounded-xl border border-gray-200 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    Skip
                  </button>
                )}

                {cycleIdx === 3 && (
                  <button
                    onClick={() => setCustomInputOpen(true)}
                    className="flex-1 rounded-xl border border-teal-200 py-2.5 text-xs font-semibold text-teal-700 hover:bg-teal-50 dark:border-teal-800 dark:text-teal-400 dark:hover:bg-teal-900/20"
                  >
                    Edit
                  </button>
                )}
              </div>
            </section>
          </>
        )}
      </main>

      {customInputOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setCustomInputOpen(false)}>
          <form
            onSubmit={saveCustom}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
            role="dialog"
            aria-modal="true"
            aria-labelledby="custom-dhikr-title"
          >
            <h3 id="custom-dhikr-title" className="text-lg font-bold text-gray-900 dark:text-white">Custom Dhikr</h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Set a personal phrase and target.</p>

            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="custom-phrase" className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Phrase (transliteration)
                </label>
                <input
                  id="custom-phrase"
                  name="phrase"
                  defaultValue={custom.phrase}
                  className="mc-input"
                />
              </div>

              <div>
                <label htmlFor="custom-arabic" className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Arabic (optional)
                </label>
                <input
                  id="custom-arabic"
                  name="arabic"
                  defaultValue={custom.arabic}
                  dir="rtl"
                  className="mc-input font-amiri text-lg"
                />
              </div>

              <div>
                <label htmlFor="custom-target" className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Target count
                </label>
                <input
                  id="custom-target"
                  name="target"
                  type="number"
                  min="1"
                  max="9999"
                  defaultValue={custom.target}
                  className="mc-input"
                />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCustomInputOpen(false)}
                className="rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 active:scale-95 transition-transform"
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
