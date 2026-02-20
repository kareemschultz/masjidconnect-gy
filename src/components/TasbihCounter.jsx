import { useState, useCallback, useEffect, useRef } from 'react';
import { RotateCcw, Settings, CheckCircle2, ChevronRight } from 'lucide-react';
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
    ring: 'ring-emerald-400',
    text: 'text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
    progress: 'from-emerald-400 to-emerald-600',
  },
  gold: {
    bg: 'bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700',
    ring: 'ring-yellow-400',
    text: 'text-yellow-600 dark:text-yellow-400',
    badge: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300',
    progress: 'from-yellow-400 to-yellow-600',
  },
  blue: {
    bg: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800',
    ring: 'ring-blue-400',
    text: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    progress: 'from-blue-400 to-blue-600',
  },
  custom: {
    bg: 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800',
    ring: 'ring-purple-400',
    text: 'text-purple-600 dark:text-purple-400',
    badge: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
    progress: 'from-purple-400 to-purple-600',
  },
};

function loadCustom() {
  try {
    const raw = localStorage.getItem('tasbih_custom');
    if (raw) return JSON.parse(raw);
  } catch {}
  return { phrase: 'Lā ilāha illallāh', arabic: 'لَا إِلَهَ إِلَّا اللَّهُ', target: 100 };
}

function vibrate(ms = 30) {
  try { navigator.vibrate?.(ms); } catch {}
}

export default function TasbihCounter() {
  // Session state: which dhikr in the 3-cycle, counts, completion
  const [cycleIdx, setCycleIdx] = useState(0);  // 0,1,2 = the 3 defaults; 3 = custom
  const [counts, setCounts] = useState([0, 0, 0, 0]); // parallel to [sub, alham, akbar, custom]
  const [celebrated, setCelebrated] = useState([false, false, false, false]);
  const [sessionDone, setSessionDone] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [custom, setCustom] = useState(() => loadCustom());
  const [customInput, setCustomInput] = useState(null); // null = closed
  const celebrateTimer = useRef(null);

  const dhikrList = [
    ...DEFAULT_DHIKR,
    { key: 'custom', arabic: custom.arabic || '', transliteration: custom.phrase, translation: '', target: custom.target, color: 'custom' },
  ];

  const current = dhikrList[cycleIdx];
  const c = COLOR_MAP[current.color];
  const count = counts[cycleIdx];
  const progress = Math.min(count / current.target, 1);
  const isDone = celebrated[cycleIdx];

  const tap = useCallback(() => {
    if (sessionDone) return;
    vibrate(25);
    setCounts(prev => {
      const next = [...prev];
      next[cycleIdx] = next[cycleIdx] + 1;

      if (next[cycleIdx] === current.target) {
        vibrate(80);
        setCelebrated(c => { const n = [...c]; n[cycleIdx] = true; return n; });

        // Auto-advance after 1.4s
        if (cycleIdx < 2) {
          clearTimeout(celebrateTimer.current);
          celebrateTimer.current = setTimeout(() => {
            setCycleIdx(i => i + 1);
          }, 1400);
        } else if (cycleIdx === 2) {
          // All 3 done — full session complete
          clearTimeout(celebrateTimer.current);
          celebrateTimer.current = setTimeout(() => {
            setSessionDone(true);
          }, 1400);
        }
      }

      return next;
    });
  }, [cycleIdx, current.target, sessionDone]);

  const reset = useCallback(() => {
    if (counts.some(c => c > 0) && !sessionDone) {
      if (!confirm('Reset current session?')) return;
    }
    clearTimeout(celebrateTimer.current);
    setCounts([0, 0, 0, 0]);
    setCelebrated([false, false, false, false]);
    setCycleIdx(0);
    setSessionDone(false);
  }, [counts, sessionDone]);

  const saveCustom = useCallback((e) => {
    e.preventDefault();
    const updated = {
      phrase: e.target.phrase.value.trim() || custom.phrase,
      arabic: e.target.arabic?.value?.trim() || '',
      target: Math.max(1, parseInt(e.target.target.value) || custom.target),
    };
    localStorage.setItem('tasbih_custom', JSON.stringify(updated));
    setCustom(updated);
    setCounts(prev => { const n = [...prev]; n[3] = 0; return n; });
    setCelebrated(prev => { const n = [...prev]; n[3] = false; return n; });
    setCustomInput(null);
  }, [custom]);

  useEffect(() => () => clearTimeout(celebrateTimer.current), []);

  // Sync completed session count to daily tracking record for points
  useEffect(() => {
    if (!sessionDone) return;
    const sessionCount = counts.slice(0, 3).reduce((a, b) => a + b, 0);
    if (sessionCount === 0) return;
    const today = getTrackingToday();
    const existing = today.dhikr_data || {};
    const newCount = (existing.count || 0) + sessionCount;
    updateTrackingData({ dhikr: true, dhikr_data: { count: newCount } });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionDone]);

  if (sessionDone) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 flex flex-col items-center gap-6 text-center">
        <div className="text-6xl animate-bounce">🎉</div>
        <h2 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">Tasbih Complete!</h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          SubhanAllah × 33 · Alhamdulillah × 33 · Allahu Akbar × 34
        </p>
        <p className="text-gold-500 dark:text-gold-400 font-amiri text-lg">
          سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ
        </p>
        <p className="text-gray-500 dark:text-gray-400 text-xs italic">
          SubhanAllahu wa bihamdih — "Glory be to You, O Allah, and praise."
        </p>
        <button
          onClick={reset}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-semibold transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Start Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 flex flex-col gap-5">

      {/* ── Dhikr selector tabs ── */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-2xl p-1 overflow-x-auto scrollbar-none">
        {dhikrList.map((d, i) => (
          <button
            key={d.key}
            onClick={() => setCycleIdx(i)}
            className={`flex-1 min-w-[64px] text-xs font-medium py-2 px-2 rounded-xl whitespace-nowrap transition-all ${
              cycleIdx === i
                ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-gray-100'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {celebrated[i] && <CheckCircle2 className="w-3 h-3 inline mr-1 text-emerald-500" />}
            {d.key === 'custom' ? '⚙️ Custom' : d.transliteration.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* ── Current dhikr info ── */}
      <div className="text-center space-y-1">
        <p className={`font-amiri text-3xl ${c.text}`}>{current.arabic}</p>
        <p className="font-semibold text-gray-800 dark:text-gray-100">{current.transliteration}</p>
        {current.translation && (
          <p className="text-xs text-gray-500 dark:text-gray-400 italic">"{current.translation}"</p>
        )}
        <span className={`inline-block text-xs px-3 py-0.5 rounded-full font-medium ${c.badge}`}>
          Target: {current.target}
        </span>
      </div>

      {/* ── Progress arc (simple bar) ── */}
      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full bg-gradient-to-r ${c.progress} transition-all duration-300`}
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* ── Count display ── */}
      <div className="text-center">
        <span className={`text-7xl font-bold font-mono tabular-nums ${c.text} ${isDone ? 'opacity-60' : ''}`}>
          {count}
        </span>
        <span className="text-2xl text-gray-400 dark:text-gray-600 font-mono"> / {current.target}</span>
      </div>

      {/* ── Completion badge ── */}
      {isDone && (
        <div className="text-center animate-fade-in">
          <p className="text-emerald-600 dark:text-emerald-400 font-semibold">
            ✅ {current.transliteration} complete!
            {cycleIdx < 2 && <span className="text-gray-500 dark:text-gray-400 font-normal"> Next up ↓</span>}
          </p>
        </div>
      )}

      {/* ── Big tap button ── */}
      <button
        onClick={tap}
        disabled={isDone}
        aria-label={`Count ${current.transliteration}`}
        className={`w-full py-10 rounded-3xl text-white text-xl font-bold shadow-lg active:scale-95 transition-all duration-100 select-none ring-4 ring-transparent active:ring-8 ${c.bg} ${c.ring} ${isDone ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isDone ? '✓' : 'TAP'}
      </button>

      {/* ── Controls row ── */}
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset All
        </button>
        {cycleIdx === 3 && (
          <button
            onClick={() => setCustomInput({})}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-sm font-medium transition-colors"
          >
            <Settings className="w-4 h-4" />
            Edit Custom
          </button>
        )}
        {cycleIdx < 2 && !isDone && (
          <button
            onClick={() => setCycleIdx(i => i + 1)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-sm transition-colors"
          >
            Skip
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Custom dhikr editor modal ── */}
      {customInput !== null && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center p-4" onClick={() => setCustomInput(null)}>
          <form
            onSubmit={saveCustom}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl p-6 space-y-4 shadow-2xl"
          >
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">Custom Dhikr</h3>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Phrase (transliteration)</label>
              <input name="phrase" defaultValue={custom.phrase} className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Arabic (optional)</label>
              <input name="arabic" defaultValue={custom.arabic} dir="rtl" className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400 font-amiri text-xl" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Target count</label>
              <input name="target" type="number" min="1" max="9999" defaultValue={custom.target} className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400" />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setCustomInput(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium">Cancel</button>
              <button type="submit" className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
