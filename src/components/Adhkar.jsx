import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, Sun, Moon, Check, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { morningAdhkar, eveningAdhkar, getTimeOfDay } from '../data/adhkarData';

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
  } catch { return { date: getToday(), morning: {}, evening: {} }; }
}

export default function Adhkar() {
  const timeOfDay = getTimeOfDay();
  const [tab, setTab] = useState(timeOfDay === 'morning' ? 'morning' : 'evening');
  const [progress, setProgress] = useState(loadProgress);
  const [expanded, setExpanded] = useState(null);

  const adhkarList = tab === 'morning' ? morningAdhkar : eveningAdhkar;
  const currentProgress = progress[tab] || {};

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const increment = useCallback((id, maxCount) => {
    if (navigator.vibrate) navigator.vibrate(8);
    setProgress(prev => {
      const tabData = { ...(prev[tab] || {}) };
      const current = tabData[id] || 0;
      if (current >= maxCount) return prev;
      tabData[id] = current + 1;
      return { ...prev, [tab]: tabData };
    });
  }, [tab]);

  const resetAll = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate([20, 50, 20]);
    setProgress(prev => ({ ...prev, [tab]: {} }));
  }, [tab]);

  const totalDhikr = adhkarList.reduce((sum, d) => sum + d.count, 0);
  const completedDhikr = adhkarList.reduce((sum, d) => sum + Math.min(currentProgress[d.id] || 0, d.count), 0);
  const percentComplete = Math.round((completedDhikr / totalDhikr) * 100);
  const allDone = completedDhikr >= totalDhikr;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24 page-enter">
      {/* Header */}
      <div className={`${tab === 'morning' ? 'bg-gradient-to-br from-amber-500 to-orange-500' : 'bg-gradient-to-br from-indigo-600 to-purple-700'} text-white pt-safe pb-5 px-5 rounded-b-3xl shadow-lg sticky top-0 z-10 transition-colors duration-500`}>
        <div className="flex items-center gap-3 pt-4">
          <Link to="/ramadan" className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors" aria-label="Back">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold font-display">Daily Adhkar</h1>
            <p className="text-white/70 text-xs">Fortress of the Muslim</p>
          </div>
          <button onClick={resetAll} className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Reset progress">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setTab('morning')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === 'morning' ? 'bg-white/25 shadow-sm' : 'bg-white/10 opacity-70'
            }`}
          >
            <Sun className="w-4 h-4" /> Morning
          </button>
          <button
            onClick={() => setTab('evening')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === 'evening' ? 'bg-white/25 shadow-sm' : 'bg-white/10 opacity-70'
            }`}
          >
            <Moon className="w-4 h-4" /> Evening
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
          <span className="text-xs font-bold">{percentComplete}%</span>
        </div>
        {allDone && (
          <p className="text-center text-sm font-semibold mt-2 animate-bounce-in">
            ✨ MashaAllah! All {tab} adhkar completed!
          </p>
        )}
      </div>

      {/* Adhkar list */}
      <div className="p-4 space-y-3">
        {adhkarList.map((dhikr, idx) => {
          const count = currentProgress[dhikr.id] || 0;
          const done = count >= dhikr.count;
          const isExpanded = expanded === dhikr.id;

          return (
            <div
              key={dhikr.id}
              className={`rounded-2xl border shadow-sm overflow-hidden transition-all ${
                done
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700'
                  : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
              }`}
              style={{ animationDelay: `${idx * 30}ms` }}
            >
              {/* Main tap area */}
              <button
                onClick={() => done ? null : increment(dhikr.id, dhikr.count)}
                disabled={done}
                className="w-full text-right px-4 pt-4 pb-2 active:scale-[0.99] transition-transform"
              >
                <p className="text-lg font-amiri leading-relaxed text-gray-800 dark:text-gray-100" dir="rtl">
                  {dhikr.arabic}
                </p>
              </button>

              {/* Counter & expand */}
              <div className="px-4 pb-3 flex items-center justify-between">
                <button
                  onClick={() => setExpanded(isExpanded ? null : dhikr.id)}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  <span>{dhikr.source}</span>
                </button>

                <div className="flex items-center gap-2">
                  {done ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <Check className="w-3.5 h-3.5" /> Done
                    </span>
                  ) : (
                    <button
                      onClick={() => increment(dhikr.id, dhikr.count)}
                      className={`min-w-[60px] py-1.5 px-3 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                        tab === 'morning'
                          ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                          : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                      }`}
                    >
                      {count}/{dhikr.count}
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-gray-100 dark:border-gray-700 space-y-1.5 animate-slide-down">
                  <p className="text-xs text-gray-600 dark:text-gray-300 italic">{dhikr.transliteration}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{dhikr.translation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
