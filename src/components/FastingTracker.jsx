import { useState, useEffect, useMemo } from 'react';
import { Check, X, Moon } from 'lucide-react';

const STORAGE_KEY = 'fasting_tracker';
const NIYYAH_AR = 'وَبِصَوْمِ غَدٍ نَوَيْتُ مِنْ شَهْرِ رَمَضَانَ';
const NIYYAH_EN = 'I intend to fast tomorrow for the month of Ramadan.';
const NIYYAH_TRANS = "Wa bisawmi ghadin nawaytu min shahri Ramadan";

function getToday() { return new Date().toISOString().slice(0, 10); }

function loadData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch { return {}; }
}

export default function FastingTracker({ ramadan, compact = false }) {
  const [data, setData] = useState(loadData);
  const [showNiyyah, setShowNiyyah] = useState(false);
  const today = getToday();
  const fastedToday = data[today];

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const markFast = (val) => {
    if (navigator.vibrate) navigator.vibrate(val ? [10, 30, 10] : 8);
    setData(prev => ({ ...prev, [today]: val }));
  };

  // Calculate fasting duration
  const fastingDuration = useMemo(() => {
    if (!ramadan?.today) return null;
    const suhoor = ramadan.today.suhoor;
    const maghrib = ramadan.today.maghrib;
    if (!suhoor || !maghrib) return null;
    const [sh, sm] = suhoor.split(':').map(Number);
    const [mh, mm] = maghrib.split(':').map(Number);
    const totalMins = (mh * 60 + mm) - (sh * 60 + sm);
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    return { hours, mins, totalMins };
  }, [ramadan?.today]);

  // Weekly calendar
  const weekDays = useMemo(() => {
    const days = [];
    const d = new Date();
    const dayOfWeek = d.getDay();
    // Start from Saturday
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
        isPast: dateStr < today,
      });
      d.setDate(d.getDate() + 1);
    }
    return days;
  }, [data, today, ramadan]);

  // Count total fasts
  const totalFasts = Object.values(data).filter(v => v === true).length;

  if (compact) {
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

        {/* Did you fast today? */}
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

        {/* Weekly calendar */}
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

  // Full version
  return (
    <div className="space-y-4">
      {/* Fasting duration */}
      {fastingDuration && (
        <div className="text-center py-2">
          <p className="text-xs text-purple-400 dark:text-purple-300">Today's fasting duration</p>
          <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
            {fastingDuration.hours} hours and {fastingDuration.mins} minutes
          </p>
        </div>
      )}

      {/* Suhoor / Iftaar cards */}
      {ramadan?.today && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-indigo-900/80 rounded-2xl p-4 text-center">
            <p className="text-[10px] uppercase tracking-wider text-indigo-300 mb-1">Tomorrow · Imsak ✨</p>
            <p className="text-2xl font-bold text-white">{ramadan.today.suhoor}</p>
          </div>
          <div className="bg-orange-900/80 rounded-2xl p-4 text-center">
            <p className="text-[10px] uppercase tracking-wider text-orange-300 mb-1">Tomorrow · Iftar 🌅</p>
            <p className="text-2xl font-bold text-white">{ramadan.today.maghrib}</p>
          </div>
        </div>
      )}

      {/* Did you fast today? */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Did you fast today?</p>
          <div className="flex gap-2">
            <button
              onClick={() => markFast(false)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                fastedToday === false ? 'bg-gray-200 dark:bg-gray-600' : 'bg-gray-100 dark:bg-gray-700 opacity-50'
              }`}
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
            <button
              onClick={() => markFast(true)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                fastedToday === true ? 'bg-emerald-500 text-white' : 'bg-emerald-100 dark:bg-emerald-900/30 opacity-50'
              }`}
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Weekly fasting calendar */}
        <div className="flex justify-between gap-1 mt-4">
          {weekDays.map(day => (
            <div key={day.date} className="flex flex-col items-center gap-1">
              <span className="text-[9px] text-gray-400 font-medium">{day.dayLetter}</span>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                day.isToday
                  ? 'bg-purple-600 text-white ring-2 ring-purple-300'
                  : day.fasted === true
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                    : day.fasted === false
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-300'
              }`}>
                {day.fasted === true ? '🌙' : day.fasted === false ? '–' : day.dayNum}
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-3">
          {totalFasts} day{totalFasts !== 1 ? 's' : ''} fasted this Ramadan
        </p>
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
          <div className="mt-3 space-y-2 animate-slide-down">
            <p className="text-xl font-amiri text-purple-900 dark:text-purple-200 text-right leading-relaxed" dir="rtl">
              {NIYYAH_AR}
            </p>
            <p className="text-xs text-purple-600 dark:text-purple-400 italic">{NIYYAH_TRANS}</p>
            <p className="text-xs text-purple-500 dark:text-purple-400">{NIYYAH_EN}</p>
          </div>
        )}
      </button>

      {/* Ramadan Essentials */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Your Ramadan Essentials</h3>
        {[
          { label: 'Read Ayah of the Day', emoji: '🌙', path: '/quran' },
          { label: 'Journal your gratitude', emoji: '💛', path: '/tracker' },
          { label: 'Track your daily prayers', emoji: '🕌', path: '/tracker' },
          { label: 'Morning & Evening Adhkar', emoji: '🤲', path: '/adhkar' },
        ].map(item => (
          <a key={item.label} href={item.path}
            className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl px-4 py-3 border border-gray-100 dark:border-gray-700 hover:border-emerald-200 transition-colors"
          >
            <span className="text-lg">{item.emoji}</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 flex-1">{item.label}</span>
            <span className="text-gray-300">›</span>
          </a>
        ))}
      </div>
    </div>
  );
}
