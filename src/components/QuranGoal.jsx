import { useState, useEffect, useRef, useCallback } from 'react';
import { BookOpen, Play, Pause, RotateCcw, Trophy, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'quran_reading_goal';
const GOALS = [
  { mins: 2, label: '2 min', badge: 'First Step', emoji: '🌱' },
  { mins: 5, label: '5 min', badge: 'Seeker', emoji: '🔍' },
  { mins: 10, label: '10 min', badge: 'Consistent', emoji: '📖' },
  { mins: 15, label: '15 min', badge: 'Dedicated', emoji: '⭐' },
  { mins: 20, label: '20 min', badge: 'Devoted', emoji: '🌟' },
  { mins: 30, label: '30 min', badge: 'Scholar', emoji: '🏆' },
];

function getToday() { return new Date().toISOString().slice(0, 10); }

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { goalMins: 5, history: {}, streak: 0 };
    return JSON.parse(raw);
  } catch { return { goalMins: 5, history: {}, streak: 0 }; }
}

function calcStreak(history) {
  let streak = 0;
  const d = new Date();
  while (true) {
    const key = d.toISOString().slice(0, 10);
    if (history[key]?.completed) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export default function QuranGoal({ compact = false }) {
  const [data, setData] = useState(loadData);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef(null);
  const today = getToday();
  const todayData = data.history[today] || { seconds: 0, completed: false };
  const goalSecs = data.goalMins * 60;
  const totalSecs = todayData.seconds + elapsed;
  const completed = totalSecs >= goalSecs;
  const streak = calcStreak(data.history);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  // Auto-save every 10 seconds
  useEffect(() => {
    if (elapsed > 0 && elapsed % 10 === 0) {
      saveProgress();
    }
  }, [elapsed]);

  // Auto-complete
  useEffect(() => {
    if (completed && running) {
      if (navigator.vibrate) navigator.vibrate([50, 100, 50, 100, 50]);
      saveProgress(true);
      setRunning(false);
    }
  }, [completed, running]);

  const saveProgress = useCallback((markComplete = false) => {
    setData(prev => {
      const hist = { ...prev.history };
      const td = hist[today] || { seconds: 0, completed: false };
      td.seconds += elapsed;
      if (markComplete || td.seconds >= goalSecs) td.completed = true;
      hist[today] = td;
      setElapsed(0);
      return { ...prev, history: hist, streak: calcStreak(hist) };
    });
  }, [elapsed, today, goalSecs]);

  const toggleTimer = () => {
    if (running) {
      saveProgress();
      setRunning(false);
    } else {
      setRunning(true);
    }
  };

  const setGoal = (mins) => {
    setData(prev => ({ ...prev, goalMins: mins }));
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progress = Math.min(100, (totalSecs / goalSecs) * 100);
  const currentGoalObj = GOALS.find(g => g.mins === data.goalMins) || GOALS[1];

  // Compact mode for homepage widget
  if (compact) {
    return (
      <div className="">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Quran Goal
              </span>
            </div>
            <div className="flex items-center gap-1">
              {streak > 0 && (
                <span className="flex items-center gap-0.5 text-[10px] font-bold text-orange-500">
                  <Flame className="w-3 h-3" /> {streak}
                </span>
              )}
              <span className="text-[10px] text-gray-400">{currentGoalObj.emoji} {data.goalMins}min</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Circular progress */}
            <div className="relative w-14 h-14 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-gray-200 dark:stroke-gray-700" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.5" fill="none"
                  className={completed ? 'stroke-emerald-500' : 'stroke-blue-500'}
                  strokeWidth="3" strokeLinecap="round"
                  strokeDasharray={`${progress * 0.975} 100`}
                  style={{ transition: 'stroke-dasharray 0.5s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                {completed ? (
                  <span className="text-lg">✅</span>
                ) : (
                  <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">
                    {formatTime(totalSecs)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              {completed ? (
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  Goal reached! MashaAllah ✨
                </p>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {formatTime(goalSecs - totalSecs)} remaining
                </p>
              )}
              <div className="flex items-center gap-2 mt-1.5">
                <Link
                  to="/quran"
                  className="text-xs text-blue-600 dark:text-blue-400 font-medium"
                >
                  Open Quran →
                </Link>
                <button
                  onClick={toggleTimer}
                  className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition-all active:scale-95 ${
                    running
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  }`}
                >
                  {running ? <><Pause className="w-3 h-3" /> Pause</> : <><Play className="w-3 h-3" /> Start</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full page mode
  return (
    <div className="space-y-4">
      {/* Goal selector */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {GOALS.map(g => (
          <button
            key={g.mins}
            onClick={() => setGoal(g.mins)}
            className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
              data.goalMins === g.mins
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            {g.emoji} {g.label}
          </button>
        ))}
      </div>

      {/* Timer display */}
      <div className="text-center py-4">
        <div className="relative w-32 h-32 mx-auto mb-3">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-gray-200 dark:stroke-gray-700" strokeWidth="2.5" />
            <circle
              cx="18" cy="18" r="15.5" fill="none"
              className={completed ? 'stroke-emerald-500' : 'stroke-blue-500'}
              strokeWidth="2.5" strokeLinecap="round"
              strokeDasharray={`${progress * 0.975} 100`}
              style={{ transition: 'stroke-dasharray 0.5s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">{formatTime(totalSecs)}</span>
            <span className="text-[10px] text-gray-400">/ {formatTime(goalSecs)}</span>
          </div>
        </div>

        <button
          onClick={toggleTimer}
          className={`px-8 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 shadow-sm ${
            running
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : completed
                ? 'bg-emerald-500 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {completed ? '✅ Goal Reached!' : running ? 'Pause' : 'Start Reading'}
        </button>
      </div>

      {/* Weekly streak */}
      {streak > 0 && (
        <div className="flex items-center justify-center gap-2 text-sm">
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="font-bold text-orange-600 dark:text-orange-400">{streak} day streak!</span>
        </div>
      )}
    </div>
  );
}
