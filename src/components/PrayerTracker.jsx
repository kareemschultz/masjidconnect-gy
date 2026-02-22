import { useState, useCallback, useMemo } from 'react';
import { CheckCircle2, Circle, Flame, Calendar, CheckSquare, Sunrise, Sun, CloudSun, Sunset, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getTodayPrayerTimes } from '../utils/prayerTimes';
import { guyanaDate } from '../utils/timezone';
import { logWarn } from '../utils/logger';
import PageHero from './PageHero';

const PRAYERS = [
  { key: 'fajr',    label: 'Fajr',    Icon: Sunrise, bg: 'bg-indigo-100 dark:bg-indigo-900/40',  color: 'text-indigo-500 dark:text-indigo-300', timeKey: 'fajr'    },
  { key: 'dhuhr',   label: 'Dhuhr',   Icon: Sun,     bg: 'bg-yellow-100 dark:bg-yellow-900/30',  color: 'text-yellow-500 dark:text-yellow-300', timeKey: 'dhuhr'   },
  { key: 'asr',     label: 'Asr',     Icon: CloudSun,bg: 'bg-orange-100 dark:bg-orange-900/30',  color: 'text-orange-500 dark:text-orange-300', timeKey: 'asr'     },
  { key: 'maghrib', label: 'Maghrib', Icon: Sunset,  bg: 'bg-rose-100   dark:bg-rose-900/30',    color: 'text-rose-500   dark:text-rose-300',   timeKey: 'maghrib' },
  { key: 'isha',    label: 'Isha',    Icon: Moon,    bg: 'bg-slate-100  dark:bg-slate-800/60',   color: 'text-slate-500  dark:text-slate-300',  timeKey: 'isha'    },
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
  return PRAYERS.every((prayer) => log[prayer.key] === true);
}

function offsetDate(delta) {
  const now = new Date();
  const guyanaMs = now.getTime() - (4 * 60 * 60 * 1000) + (delta * 86400000);
  return new Date(guyanaMs).toISOString().slice(0, 10);
}

function calcStreak(today, todayLog) {
  let streak = 0;
  const startDelta = isAllDone(todayLog) ? 0 : -1;

  for (let index = startDelta; index >= -365; index--) {
    const dayLog = index === 0 ? todayLog : loadLog(offsetDate(index));
    if (isAllDone(dayLog)) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
}

function getLast7Days(today, todayLog) {
  const days = [];
  for (let index = 6; index >= 0; index--) {
    const dateStr = offsetDate(-index);
    const [, , day] = dateStr.split('-').map(Number);
    const dow = new Date(`${dateStr}T12:00:00Z`).getUTCDay();
    days.push({
      dateStr,
      label: WEEK_DAYS[dow],
      dayNum: day,
      log: dateStr === today ? todayLog : loadLog(dateStr),
    });
  }
  return days;
}

export default function PrayerTracker() {
  const today = guyanaDate();
  const prayerTimes = getTodayPrayerTimes();
  const [log, setLog] = useState(() => loadLog(today));

  const toggle = useCallback((key) => {
    setLog((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      saveLog(today, next);
      return next;
    });
  }, [today]);

  const done = useMemo(() => PRAYERS.filter((prayer) => log[prayer.key]).length, [log]);
  const progress = useMemo(() => Math.round((done / 5) * 100), [done]);
  const streak = useMemo(() => calcStreak(today, log), [today, log]);
  const week = useMemo(() => getLast7Days(today, log), [today, log]);

  return (
    <div className="min-h-screen worship-canvas pb-24 page-enter">
      <PageHero icon={CheckSquare} title="Prayer Tracker" subtitle="Daily salah log & streaks" color="emerald" />

      <main className="mx-auto w-full max-w-3xl px-4 space-y-3">
        <section className="worship-surface p-4" aria-live="polite">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-gray-700 dark:text-gray-200">Today&apos;s progress</span>
            <span className="font-bold text-emerald-700 dark:text-emerald-300">{done}/5</span>
          </div>
          <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          {done === 5 && (
            <p className="mt-2 text-center text-xs font-semibold text-emerald-700 dark:text-emerald-300 animate-fade-in">
              All five prayers completed today. Alhamdulillah.
            </p>
          )}
        </section>

        <section className="worship-surface p-3">
          <h2 className="px-1 text-sm font-semibold text-gray-800 dark:text-gray-100">Mark your prayers</h2>
          <div className="mt-2 space-y-2">
            {PRAYERS.map((prayer) => {
              const completed = log[prayer.key];
              const prayerTime = prayerTimes[prayer.timeKey] || '';

              return (
                <button
                  key={prayer.key}
                  onClick={() => toggle(prayer.key)}
                  className={`w-full min-h-11 rounded-2xl border px-4 py-3 text-left touch-manipulation transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                    completed
                      ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/25'
                      : 'border-gray-200 bg-white hover:border-emerald-300 dark:border-gray-700 dark:bg-gray-900/70 dark:hover:border-emerald-600'
                  }`}
                  aria-label={`${completed ? 'Unmark' : 'Mark'} ${prayer.label} as prayed`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${prayer.bg}`} aria-hidden="true">
                      <prayer.Icon className={`w-5 h-5 ${prayer.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                        {prayer.label}
                      </p>
                      {prayerTime && <p className="text-xs text-gray-500 dark:text-gray-400">{prayerTime}</p>}
                    </div>
                    {completed
                      ? <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-500" />
                      : <Circle className="h-6 w-6 shrink-0 text-gray-300 dark:text-gray-600" />}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="worship-surface p-4">
          <div className="mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Weekly consistency</h2>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {week.map(({ dateStr, label, dayNum, log: dayLog }) => {
              const isToday = dateStr === today;
              return (
                <div key={dateStr} className="flex flex-col items-center gap-1">
                  <span className={`text-[10px] font-semibold ${isToday ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}`}>
                    {label}
                  </span>
                  <span className={`text-[10px] ${isToday ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-500 dark:text-gray-400'}`}>{dayNum}</span>
                  {PRAYERS.map((prayer) => (
                    <div
                      key={prayer.key}
                      title={`${prayer.label} · ${dateStr}`}
                      className={`h-3 w-3 rounded-full transition-colors ${
                        dayLog[prayer.key]
                          ? 'bg-emerald-500'
                          : isToday
                            ? 'bg-gray-200 ring-1 ring-emerald-300 dark:bg-gray-600 dark:ring-emerald-700'
                            : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex items-center gap-3 text-[10px] text-gray-500 dark:text-gray-400">
            <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Prayed</span>
            <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-gray-200 dark:bg-gray-700" /> Missed</span>
          </div>
        </section>
      </main>
    </div>
  );
}
