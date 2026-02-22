import { useState, useEffect, useMemo, useCallback } from 'react';
import { Check, X, Moon, UtensilsCrossed, ChevronLeft, ChevronRight, Flame, Target, Share2 } from 'lucide-react';
import { shareContent } from '../utils/share';
import PageHero from './PageHero';

const NIYYAH_AR = 'وَبِصَوْمِ غَدٍ نَوَيْتُ مِنْ شَهْرِ رَمَضَانَ';
const NIYYAH_EN = 'I intend to fast tomorrow for the month of Ramadan.';
const NIYYAH_TRANS = "Wa bisawmi ghadin nawaytu min shahri Ramadan";

const LS_KEY = 'fasting_log';

function getItem(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* storage full */ }
}

function getToday() { return new Date().toISOString().slice(0, 10); }

// ─── Compact inline widget (used by RamadanCompanion) ────────────────────────

function FastingCompact({ ramadan }) {
  const STORAGE_KEY = 'fasting_tracker';
  const [data, setData] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
  });
  const today = getToday();
  const fastedToday = data[today];

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const markFast = (val) => {
    if (navigator.vibrate) navigator.vibrate(val ? [10, 30, 10] : 8);
    setData(prev => ({ ...prev, [today]: val }));
  };

  const weekDays = useMemo(() => {
    const days = [];
    const d = new Date();
    const dayOfWeek = d.getDay();
    d.setDate(d.getDate() - ((dayOfWeek + 1) % 7));
    for (let i = 0; i < 7; i++) {
      const dateStr = d.toISOString().slice(0, 10);
      const isToday = dateStr === today;
      const dayNum = ramadan?.isRamadan ? (ramadan.day - (new Date(today).getDate() - d.getDate())) : d.getDate();
      days.push({
        date: dateStr,
        dayLetter: ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()],
        dayNum,
        fasted: data[dateStr],
        isToday,
      });
      d.setDate(d.getDate() + 1);
    }
    return days;
  }, [data, today, ramadan]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Moon className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-bold text-gray-800 dark:text-gray-100">Fasting</span>
        </div>
        {fastedToday === undefined ? (
          <span className="text-[10px] text-gray-400">Did you fast today?</span>
        ) : (
          <span className={`text-[10px] font-semibold ${fastedToday ? 'text-emerald-500' : 'text-gray-400'}`}>
            {fastedToday ? '✅ Fasted' : 'Not today'}
          </span>
        )}
      </div>

      {fastedToday === undefined && (
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => markFast(true)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-semibold text-sm active:scale-95 transition-all"
          >
            <Check className="w-4 h-4" /> Yes
          </button>
          <button
            onClick={() => markFast(false)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-semibold text-sm active:scale-95 transition-all"
          >
            <X className="w-4 h-4" /> No
          </button>
        </div>
      )}

      <div className="flex justify-between gap-1">
        {weekDays.map(day => (
          <div key={day.date} className="flex flex-col items-center gap-1">
            <span className="text-[9px] text-gray-400 font-medium">{day.dayLetter}</span>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              day.isToday
                ? 'bg-purple-600 text-white ring-2 ring-purple-300 dark:ring-purple-700'
                : day.fasted === true
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                  : day.fasted === false
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-600'
            }`}>
              {day.fasted === true ? '🌙' : day.fasted === false ? '–' : day.dayNum}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Full standalone page (route: /fasting) ──────────────────────────────────

function FastingPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [log, setLog] = useState({});
  const [streak, setStreak] = useState(0);
  const [showTick, setShowTick] = useState('');
  const [showNiyyah, setShowNiyyah] = useState(false);

  useEffect(() => { setLog(getItem(LS_KEY, {})); }, []);

  const calculateStreak = useCallback((data) => {
    let s = 0;
    const d = new Date();
    while (true) {
      const key = d.toISOString().split('T')[0];
      if (data[key] === 'fasted') { s++; d.setDate(d.getDate() - 1); } else break;
    }
    return s;
  }, []);

  useEffect(() => { setStreak(calculateStreak(log)); }, [log, calculateStreak]);

  const toggleDay = (dateStr) => {
    const cycle = [null, 'intended', 'fasted', 'missed'];
    const current = log[dateStr] || null;
    const next = cycle[(cycle.indexOf(current) + 1) % cycle.length];
    const updated = { ...log };
    if (next) updated[dateStr] = next; else delete updated[dateStr];
    setLog(updated);
    setItem(LS_KEY, updated);
    setShowTick(dateStr);
    setTimeout(() => setShowTick(''), 300);
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const today = new Date().toISOString().split('T')[0];

  const monthDays = Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(year, month, i + 1);
    return d.toISOString().split('T')[0];
  });

  const stats = monthDays.reduce((a, d) => {
    if (log[d] === 'fasted') a.fasted++;
    if (log[d] === 'missed') a.missed++;
    if (log[d] === 'intended') a.intended++;
    return a;
  }, { fasted: 0, missed: 0, intended: 0 });

  const statusStyle = (s, isToday) => {
    const base = isToday ? 'ring-2 ring-emerald-400/40 ring-offset-1 ring-offset-gray-100 dark:ring-offset-gray-950' : '';
    if (s === 'fasted') return `bg-emerald-500/80 text-white ${base}`;
    if (s === 'missed') return `bg-red-500/60 text-white ${base}`;
    if (s === 'intended') return `bg-amber-500/60 text-white ${base}`;
    return `bg-white/60 dark:bg-gray-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 ${base}`;
  };

  const statusIcon = (s) => {
    if (s === 'fasted') return <Check className="h-3.5 w-3.5" />;
    if (s === 'missed') return <X className="h-3.5 w-3.5" />;
    if (s === 'intended') return <Target className="h-3.5 w-3.5" />;
    return null;
  };

  const handleShare = () => {
    const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    shareContent(
      `Fasting Tracker - ${monthName}`,
      `Alhamdulillah! I fasted ${stats.fasted} days in ${monthName} with a ${streak}-day streak. Track your fasts on MasjidConnect GY!`
    );
  };

  return (
    <div className="min-h-screen worship-canvas pb-24 page-enter">
      <PageHero icon={UtensilsCrossed} title="Fasting Tracker" subtitle="Track your blessed fasts" color="amber" backLink="/tracker" />

      <div className="space-y-4 px-4 max-w-2xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-3.5 text-center">
            <div className="text-2xl font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400">{stats.fasted}</div>
            <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Fasted</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-3.5 text-center">
            <div className="text-2xl font-extrabold tabular-nums text-red-500 dark:text-red-400">{stats.missed}</div>
            <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Missed</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-3.5 text-center">
            <div className="flex items-center justify-center gap-1.5 text-2xl font-extrabold tabular-nums text-amber-600 dark:text-amber-400">
              <Flame className="h-5 w-5" />{streak}
            </div>
            <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Streak</div>
          </div>
        </div>

        {/* Month nav */}
        <div className="flex items-center justify-between rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3">
          <button onClick={() => setCurrentMonth(new Date(year, month - 1))} className="rounded-xl p-2 transition-all active:scale-90 active:bg-gray-100 dark:active:bg-gray-800" aria-label="Previous month">
            <ChevronLeft className="h-5 w-5 text-gray-400" />
          </button>
          <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
          <div className="flex items-center gap-1">
            <button onClick={handleShare} className="rounded-xl p-2 transition-all active:scale-90 active:bg-gray-100 dark:active:bg-gray-800" aria-label="Share">
              <Share2 className="h-4 w-4 text-gray-400" />
            </button>
            <button onClick={() => setCurrentMonth(new Date(year, month + 1))} className="rounded-xl p-2 transition-all active:scale-90 active:bg-gray-100 dark:active:bg-gray-800" aria-label="Next month">
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
          <div className="mb-3 grid grid-cols-7 gap-1">
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
              <div key={d} className="text-center text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
            {monthDays.map((dateStr) => {
              const dayNum = parseInt(dateStr.split('-')[2]);
              const status = log[dateStr] || null;
              const isToday = dateStr === today;
              return (
                <button
                  key={dateStr}
                  onClick={() => toggleDay(dateStr)}
                  className={`flex h-10 w-full items-center justify-center rounded-xl text-xs font-semibold transition-all duration-200 active:scale-90 ${statusStyle(status, isToday)} ${showTick === dateStr ? 'scale-110' : ''}`}
                  aria-label={`${dateStr}: ${status || 'not logged'}`}
                >
                  {statusIcon(status) || dayNum}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center justify-center gap-5 text-[10px] font-medium text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Fasted</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Missed</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Intended</span>
          </div>
        </div>

        {/* Niyyah */}
        <button
          onClick={() => setShowNiyyah(!showNiyyah)}
          className="w-full bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-4 border border-purple-100 dark:border-purple-800/30 text-left active:scale-[0.99] transition-all"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-purple-800 dark:text-purple-300">Intention (Niyyah) of Fasting</p>
            <span className="text-gray-400">{showNiyyah ? '▲' : '▼'}</span>
          </div>
          {showNiyyah && (
            <div className="mt-3 space-y-2">
              <p className="text-xl font-amiri text-purple-900 dark:text-purple-200 text-right leading-relaxed" dir="rtl">
                {NIYYAH_AR}
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400 italic">{NIYYAH_TRANS}</p>
              <p className="text-xs text-purple-500 dark:text-purple-400">{NIYYAH_EN}</p>
            </div>
          )}
        </button>

        {/* Motivation */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 text-center">
          <p className="font-amiri text-base leading-[2] text-amber-900 dark:text-amber-200" dir="rtl">
            {'كُتِبَ عَلَيْكُمُ الصِّيَامُ كَمَا كُتِبَ عَلَى الَّذِينَ مِن قَبْلِكُمْ'}
          </p>
          <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            Fasting has been prescribed for you as it was prescribed for those before you.
          </p>
          <p className="mt-1 text-[10px] text-amber-600 dark:text-amber-500">Al-Baqarah 2:183</p>
        </div>
      </div>
    </div>
  );
}

// ─── Default export: standalone page ─────────────────────────────────────────

export default FastingPage;
export { FastingCompact };
