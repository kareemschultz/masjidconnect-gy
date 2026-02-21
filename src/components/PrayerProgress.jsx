import { useState, useEffect, useMemo } from 'react';
import { Check, Volume2 } from 'lucide-react';

const STORAGE_KEY = 'prayer_log';
const PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const PRAYER_ICONS = {
  Fajr: '✨',
  Dhuhr: '☀️',
  Asr: '🌤️',
  Maghrib: '🌅',
  Isha: '🌙',
};

function getToday() { return new Date().toISOString().slice(0, 10); }

function loadData() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return raw;
  } catch { return {}; }
}

export default function PrayerProgress({ prayerTimes, nextPrayer, compact = false }) {
  const [data, setData] = useState(loadData);
  const today = getToday();
  const todayData = data[today] || {};

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const prayedCount = PRAYERS.filter(p => todayData[p]).length;
  const progress = (prayedCount / 5) * 100;

  const togglePrayer = (prayer) => {
    if (navigator.vibrate) navigator.vibrate(todayData[prayer] ? 5 : [10, 30, 10]);
    setData(prev => {
      const td = { ...(prev[today] || {}) };
      td[prayer] = !td[prayer];
      return { ...prev, [today]: td };
    });
  };

  const markAll = () => {
    if (navigator.vibrate) navigator.vibrate([10, 20, 10, 20, 10]);
    setData(prev => {
      const td = {};
      PRAYERS.forEach(p => td[p] = true);
      return { ...prev, [today]: td };
    });
  };

  // Time until next prayer
  const timeUntilNext = useMemo(() => {
    if (!nextPrayer || !prayerTimes) return null;
    const now = new Date();
    const nextTime = prayerTimes[nextPrayer.toLowerCase()] || prayerTimes[nextPrayer];
    if (!nextTime) return null;
    // Parse time like "4:58 AM" or "16:05"
    let hours, mins;
    const match12 = nextTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    const match24 = nextTime.match(/^(\d+):(\d+)$/);
    if (match12) {
      hours = parseInt(match12[1]);
      mins = parseInt(match12[2]);
      if (match12[3].toUpperCase() === 'PM' && hours !== 12) hours += 12;
      if (match12[3].toUpperCase() === 'AM' && hours === 12) hours = 0;
    } else if (match24) {
      hours = parseInt(match24[1]);
      mins = parseInt(match24[2]);
    } else return null;

    const target = new Date(now);
    target.setHours(hours, mins, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);
    const diff = target - now;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return { hours: h, mins: m, name: nextPrayer };
  }, [nextPrayer, prayerTimes]);

  if (compact) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
        <div className="flex items-center gap-4">
          {/* Circular progress */}
          <div className="relative w-16 h-16 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-gray-200 dark:stroke-gray-700" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.5" fill="none"
                className="stroke-emerald-500"
                strokeWidth="3" strokeLinecap="round"
                strokeDasharray={`${progress * 0.975} 100`}
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {prayedCount === 5 ? (
                <Check className="w-5 h-5 text-emerald-500" />
              ) : (
                <>
                  <span className="text-lg font-bold text-gray-800 dark:text-gray-100">{prayedCount}/5</span>
                  <span className="text-[8px] text-gray-400">prayed</span>
                </>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {timeUntilNext && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {timeUntilNext.name} in <span className="font-semibold text-emerald-600 dark:text-emerald-400">{timeUntilNext.hours}h {timeUntilNext.mins}m</span>
              </p>
            )}
            {/* Mini prayer checkboxes */}
            <div className="flex gap-1.5">
              {PRAYERS.map(p => (
                <button
                  key={p}
                  onClick={() => togglePrayer(p)}
                  className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold transition-all active:scale-90 ${
                    todayData[p]
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                  }`}
                  title={p}
                >
                  {todayData[p] ? '✓' : p.charAt(0)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full version
  return (
    <div className="space-y-3">
      {/* Big current prayer + progress ring */}
      <div className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="relative w-20 h-20 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-gray-200 dark:stroke-gray-700" strokeWidth="2.5" />
            <circle
              cx="18" cy="18" r="15.5" fill="none"
              className="stroke-emerald-500"
              strokeWidth="2.5" strokeLinecap="round"
              strokeDasharray={`${progress * 0.975} 100`}
              style={{ transition: 'stroke-dasharray 0.5s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {prayedCount === 5 ? (
              <span className="text-2xl">✅</span>
            ) : (
              <>
                <span className="text-xl font-bold text-gray-800 dark:text-gray-100">{prayedCount}/5</span>
                <span className="text-[9px] text-gray-400">prayed</span>
              </>
            )}
          </div>
        </div>

        <div className="flex-1">
          {timeUntilNext && (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-semibold">{timeUntilNext.name}</span> in {timeUntilNext.hours}h {timeUntilNext.mins}m
            </p>
          )}
          {prayerTimes?.sunrise && (
            <p className="text-[10px] text-gray-400 mt-1">
              Imsak {prayerTimes.fajr} | Sunrise {prayerTimes.sunrise}
            </p>
          )}
        </div>
      </div>

      {/* Prayer list with toggles */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        {PRAYERS.map((prayer, idx) => {
          const time = prayerTimes?.[prayer.toLowerCase()] || '';
          const prayed = todayData[prayer];
          const isNext = nextPrayer === prayer;

          return (
            <button
              key={prayer}
              onClick={() => togglePrayer(prayer)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 transition-colors active:bg-gray-50 dark:active:bg-gray-700 ${
                idx > 0 ? 'border-t border-gray-100 dark:border-gray-700' : ''
              } ${isNext ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''}`}
            >
              {/* Checkbox circle */}
              <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                prayed
                  ? 'bg-emerald-500 border-emerald-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}>
                {prayed && <Check className="w-3.5 h-3.5 text-white" />}
              </div>

              <span className="text-base">{PRAYER_ICONS[prayer]}</span>
              <span className={`text-sm font-medium flex-1 text-left ${
                prayed ? 'text-gray-400 line-through' : 'text-gray-800 dark:text-gray-100'
              }`}>
                {prayer}
              </span>

              {isNext && (
                <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">Now</span>
              )}

              <span className={`text-sm tabular-nums ${prayed ? 'text-gray-300' : 'text-gray-600 dark:text-gray-300'}`}>
                {time}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mark all */}
      {prayedCount < 5 && (
        <button
          onClick={markAll}
          className="w-full py-2.5 rounded-xl border-2 border-dashed border-emerald-200 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 text-sm font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 active:scale-[0.98] transition-all"
        >
          Mark all as prayed
        </button>
      )}
    </div>
  );
}
