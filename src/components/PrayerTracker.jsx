import { useState, useCallback } from 'react';
import { CheckCircle2, Circle, Flame, Calendar, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getTodayPrayerTimes } from '../utils/prayerTimes';
import { guyanaDate } from '../utils/timezone';
import { logWarn } from '../utils/logger';

const PRAYERS = [
  { key: 'fajr',    label: 'Fajr',    icon: '🌄', timeKey: 'fajr'    },
  { key: 'dhuhr',   label: 'Dhuhr',   icon: '☀️',  timeKey: 'dhuhr'   },
  { key: 'asr',     label: 'Asr',     icon: '🌤️', timeKey: 'asr'     },
  { key: 'maghrib', label: 'Maghrib', icon: '🌇', timeKey: 'maghrib'  },
  { key: 'isha',    label: 'Isha',    icon: '🌙', timeKey: 'isha'     },
];

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getLogKey(dateStr) {
  return `prayer_log_${dateStr}`;
}

function loadLog(dateStr) {
  try {
    const raw = localStorage.getItem(getLogKey(dateStr));
    if (raw) return JSON.parse(raw);
  } catch (error) {
    logWarn('PrayerTracker.loadLog', 'Failed to read prayer log from storage', error);
  }
  return { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false };
}

function saveLog(dateStr, log) {
  try {
    localStorage.setItem(getLogKey(dateStr), JSON.stringify(log));
  } catch (error) {
    logWarn('PrayerTracker.saveLog', 'Failed to save prayer log to storage', error);
  }
}

function isAllDone(log) {
  return PRAYERS.every(p => log[p.key] === true);
}

/** Returns Guyana date string offset by `delta` days from today */
function offsetDate(delta) {
  const now = new Date();
  const guyanaMs = now.getTime() - 4 * 60 * 60 * 1000 + delta * 86400000;
  return new Date(guyanaMs).toISOString().slice(0, 10);
}

function calcStreak(today) {
  let streak = 0;
  // Check if today is complete — if so start from today, else from yesterday
  const todayLog = loadLog(today);
  let startDelta = isAllDone(todayLog) ? 0 : -1;
  for (let i = startDelta; i >= -365; i--) {
    const d = offsetDate(i);
    const log = loadLog(d);
    if (isAllDone(log)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const dateStr = offsetDate(-i);
    const [, , d] = dateStr.split('-').map(Number);
    const dow = new Date(dateStr + 'T12:00:00Z').getUTCDay();
    days.push({ dateStr, label: WEEK_DAYS[dow], dayNum: d, log: loadLog(dateStr) });
  }
  return days;
}

export default function PrayerTracker() {
  const today = guyanaDate();
  const pt = getTodayPrayerTimes();

  const [log, setLog] = useState(() => loadLog(today));

  const toggle = useCallback((key) => {
    setLog(prev => {
      const next = { ...prev, [key]: !prev[key] };
      saveLog(today, next);
      return next;
    });
  }, [today]);

  const streak = calcStreak(today);
  const week = getLast7Days();

  const done = PRAYERS.filter(p => log[p.key]).length;
  const progress = Math.round((done / 5) * 100);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24 page-enter">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 dark:from-emerald-800 dark:to-emerald-900 text-white pt-safe pb-5 px-5 rounded-b-3xl shadow-lg sticky top-0 z-10">
        <div className="flex items-center gap-3 pt-4">
          <Link to="/ramadan" className="p-2 -ml-2 hover:bg-emerald-500/30 rounded-full transition-colors" aria-label="Back">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold font-display">Prayer Tracker</h1>
            <p className="text-emerald-100 text-xs">{done}/5 prayers today{streak > 0 ? ` · ${streak} day streak` : ''}</p>
          </div>
        </div>
      </div>

    <div className="max-w-md mx-auto px-4 py-6 space-y-5">

      {/* ── Streak hero ── */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 dark:from-emerald-700 dark:to-emerald-900 rounded-2xl p-5 text-white text-center shadow-lg">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Flame className="w-6 h-6 text-gold-400" />
          <span className="text-3xl font-bold text-gold-400">{streak}</span>
          <Flame className="w-6 h-6 text-gold-400" />
        </div>
        <p className="text-sm font-semibold text-white/90">
          {streak === 0
            ? 'Start your streak — pray all 5 today!'
            : streak === 1
            ? '1 day streak — keep it going!'
            : `${streak} day streak — MashAllah! 🌟`}
        </p>
      </div>

      {/* ── Today's progress ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Today's Prayers</span>
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{done} / 5</span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        {done === 5 && (
          <p className="text-center text-emerald-600 dark:text-emerald-400 text-xs font-semibold mt-2 animate-fade-in">
            🎉 All 5 prayers complete — Alhamdulillah!
          </p>
        )}
      </div>

      {/* ── Prayer cards ── */}
      <div className="space-y-2">
        {PRAYERS.map(p => {
          const isDone = log[p.key];
          const time = pt[p.timeKey] || '';
          return (
            <button
              key={p.key}
              onClick={() => toggle(p.key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-200 text-left ${
                isDone
                  ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600'
              }`}
            >
              <span className="text-2xl" aria-hidden="true">{p.icon}</span>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${isDone ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-800 dark:text-gray-100'}`}>
                  {p.label}
                </p>
                {time && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">{time}</p>
                )}
              </div>
              {isDone
                ? <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                : <Circle className="w-6 h-6 text-gray-300 dark:text-gray-600 flex-shrink-0" />
              }
            </button>
          );
        })}
      </div>

      {/* ── Weekly grid ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">This Week</span>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {week.map(({ dateStr, label, log: dayLog }) => {
            const isToday = dateStr === today;
            return (
              <div key={dateStr} className="flex flex-col items-center gap-1">
                <span className={`text-[10px] font-medium ${isToday ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}`}>
                  {label}
                </span>
                {PRAYERS.map(p => (
                  <div
                    key={p.key}
                    title={`${p.label} — ${dateStr}`}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      dayLog[p.key]
                        ? 'bg-emerald-500'
                        : isToday
                        ? 'bg-gray-200 dark:bg-gray-600 ring-1 ring-emerald-300 dark:ring-emerald-700'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                ))}
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-3 mt-3 text-[10px] text-gray-400 dark:text-gray-500">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Prayed</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 inline-block" /> Missed</span>
        </div>
      </div>

    </div>
    </div>
  );
}
