import { useSession, signOut } from '../lib/auth-client';
import { useRamadanTracker } from '../hooks/useRamadanTracker';
import { getRamadanDay, getUserRamadanStart } from '../data/ramadanTimetable';
import { Flame, BookOpen, Moon, Star, LogOut, User, Calendar, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const CHECKLIST_LABELS = {
  fasted:  { icon: '🌙', label: 'Fasts' },
  quran:   { icon: '📖', label: "Qur'an" },
  dhikr:   { icon: '📿', label: 'Dhikr' },
  prayer:  { icon: '🙏', label: 'Prayer' },
  masjid:  { icon: '🕌', label: 'Masjid' },
};

// Build a 30-slot Ramadan calendar grid
function buildCalendarSlots(ramadanStart, allDays) {
  const byDate = Object.fromEntries(allDays.map(d => [d.date, d.completed]));
  const slots = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(ramadanStart + 'T12:00:00');
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const today = new Date().toISOString().slice(0, 10);
    const completed = byDate[key] ?? null;
    slots.push({
      day: i + 1,
      date: key,
      completed,
      isToday: key === today,
      isFuture: key > today,
    });
  }
  return slots;
}

function HeatmapCell({ slot }) {
  let bg = 'bg-gray-100 dark:bg-gray-800'; // future / no data
  if (!slot.isFuture && slot.completed !== null) {
    if (slot.completed >= 5) bg = 'bg-emerald-600';
    else if (slot.completed >= 4) bg = 'bg-emerald-500';
    else if (slot.completed >= 3) bg = 'bg-emerald-400';
    else if (slot.completed >= 2) bg = 'bg-emerald-300 dark:bg-emerald-700';
    else if (slot.completed >= 1) bg = 'bg-emerald-200 dark:bg-emerald-800';
    else bg = 'bg-gray-200 dark:bg-gray-700';
  }
  const ring = slot.isToday ? 'ring-2 ring-emerald-500 ring-offset-1 dark:ring-offset-gray-900' : '';

  return (
    <div
      className={`aspect-square rounded-sm ${bg} ${ring} flex items-center justify-center`}
      title={`Day ${slot.day}: ${slot.completed ?? 0}/5 completed`}
    >
      {slot.isToday && (
        <span className="text-[6px] font-bold text-white leading-none">•</span>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, sub }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-emerald-50 dark:border-gray-700 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xl font-bold text-emerald-900 dark:text-emerald-100">{value}</div>
      <div className="text-xs font-medium text-gray-600 dark:text-gray-300">{label}</div>
      {sub && <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function UserProfile() {
  const { data: session } = useSession();
  const { getAllDays, getStreak, getTodayProgress } = useRamadanTracker();
  const ramadan = getRamadanDay();
  const ramadanStart = getUserRamadanStart();

  const allDays = getAllDays();
  const streak = getStreak();
  const progress = getTodayProgress();

  // Days where user tracked anything (at least 1 item)
  const trackedDays = allDays.filter(d => d.completed > 0).length;
  // Perfect days (5/5)
  const perfectDays = allDays.filter(d => d.completed === 5).length;
  // Per-item totals
  const itemTotals = {};
  for (const k of Object.keys(CHECKLIST_LABELS)) {
    try {
      const stored = JSON.parse(localStorage.getItem('ramadan_tracker_v1') || '{}');
      itemTotals[k] = Object.values(stored).filter(r => r[k]).length;
    } catch { itemTotals[k] = 0; }
  }

  const calendarSlots = buildCalendarSlots(ramadanStart, allDays);

  if (!session?.user) {
    return (
      <div className="px-4 py-10 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Sign in to see your profile</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Track your Ramadan progress, view your streak, and sync across devices.
        </p>
      </div>
    );
  }

  const { user } = session;
  const initials = (user.name || user.email || '?').slice(0, 2).toUpperCase();
  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-GY', { month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="px-4 py-5 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-emerald-900 dark:text-emerald-100 font-amiri truncate">
            {user.name || 'Anonymous'}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
          {memberSince && (
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">Member since {memberSince}</p>
          )}
        </div>
        <button
          onClick={() => signOut()}
          className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          aria-label="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Ramadan banner */}
      {ramadan.isRamadan && (
        <div className="bg-emerald-700 dark:bg-emerald-900 rounded-2xl px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-emerald-200 font-medium">Ramadan 1447</p>
            <p className="text-lg font-bold text-white font-amiri">Day {ramadan.day} of 30</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-emerald-300">Today's progress</p>
            <p className="text-lg font-bold text-emerald-100">{progress.completed}/{progress.total}</p>
          </div>
          <span className="text-3xl">🌙</span>
        </div>
      )}

      {/* Stats row */}
      <div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
          Your Ramadan Stats
        </p>
        <div className="grid grid-cols-3 gap-2">
          <StatCard icon="🔥" label="Day Streak" value={streak} sub="consecutive days" />
          <StatCard icon="📅" label="Days Tracked" value={trackedDays} sub={`of ${ramadan.day || 30} days`} />
          <StatCard icon="⭐" label="Perfect Days" value={perfectDays} sub="all 5 items" />
        </div>
      </div>

      {/* Per-item breakdown */}
      <div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
          Totals This Ramadan
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-emerald-50 dark:border-gray-700 divide-y divide-gray-50 dark:divide-gray-700">
          {Object.entries(CHECKLIST_LABELS).map(([key, { icon, label }]) => {
            const count = itemTotals[key] || 0;
            const max = ramadan.day || 30;
            const pct = Math.min(100, Math.round((count / max) * 100));
            return (
              <div key={key} className="px-4 py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700 dark:text-gray-200">{icon} {label}</span>
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">{count}/{max}</span>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 30-day heatmap */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Ramadan Calendar
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
            <span className="w-3 h-3 rounded-sm bg-gray-200 dark:bg-gray-700 inline-block" />
            <span>0</span>
            <span className="w-3 h-3 rounded-sm bg-emerald-300 dark:bg-emerald-700 inline-block" />
            <span>2</span>
            <span className="w-3 h-3 rounded-sm bg-emerald-600 inline-block" />
            <span>5</span>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-emerald-50 dark:border-gray-700">
          <div className="grid grid-cols-10 gap-1">
            {calendarSlots.map(slot => (
              <div key={slot.day} className="relative">
                <HeatmapCell slot={slot} />
                {(slot.day % 10 === 0 || slot.day === 1) && (
                  <p className="text-center text-[8px] text-gray-400 mt-0.5">{slot.day}</p>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 text-[10px] text-gray-400 dark:text-gray-500">
            <span>🟩 More complete = darker green</span>
            <span>· Today has a ring</span>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
          Quick Links
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Link
            to="/ramadan"
            className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl p-3 text-center hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
          >
            <span className="text-2xl">🌙</span>
            <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 mt-1">Ramadan Companion</p>
          </Link>
          <Link
            to="/timetable"
            className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-3 text-center hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
          >
            <span className="text-2xl">🕐</span>
            <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 mt-1">Prayer Timetable</p>
          </Link>
        </div>
      </div>

      <p className="text-center text-[10px] text-gray-400 dark:text-gray-500 pb-2">
        بارك الله فيكم — Your progress is saved locally on this device
      </p>
    </div>
  );
}
