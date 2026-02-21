import { useSession, signOut, updateUser, changePassword } from '../lib/auth-client';
import { useRamadanTracker } from '../hooks/useRamadanTracker';
import { getRamadanDay, getUserRamadanStart } from '../data/ramadanTimetable';
import { getLevel, LEVELS } from '../utils/points';
import { LogOut, User, Settings, ChevronDown, ChevronUp, ChevronLeft, Loader2, Check, Eye, EyeOff, Flame, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import BuddySection from './BuddySection';
import { API_BASE } from '../config';

const CHECKLIST_LABELS = {
  fasted:  { icon: '🌙', label: 'Fasts' },
  quran:   { icon: '📖', label: "Qur'an" },
  dhikr:   { icon: '📿', label: 'Dhikr' },
  prayer:  { icon: '🙏', label: 'Prayer' },
  masjid:  { icon: '🕌', label: 'Masjid' },
};

// Build a 30-slot Ramadan calendar grid with points data
function buildCalendarSlots(ramadanStart, allDays, pointsHistory) {
  const byDate = Object.fromEntries(allDays.map(d => [d.date, d.completed]));
  const ptsByDate = Object.fromEntries((pointsHistory || []).map(d => [d.date, d.points]));
  const slots = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(ramadanStart + 'T12:00:00');
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const today = new Date().toISOString().slice(0, 10);
    const completed = byDate[key] ?? null;
    const points = ptsByDate[key] ?? null;
    slots.push({
      day: i + 1,
      date: key,
      completed,
      points,
      isToday: key === today,
      isFuture: key > today,
    });
  }
  return slots;
}

function pointsToBg(pts) {
  if (pts === null || pts === 0) return 'bg-gray-200 dark:bg-gray-700';
  if (pts <= 50)  return 'bg-emerald-200 dark:bg-emerald-800';
  if (pts <= 100) return 'bg-emerald-300 dark:bg-emerald-700';
  if (pts <= 150) return 'bg-emerald-400';
  if (pts <= 200) return 'bg-emerald-500';
  return 'bg-emerald-600';
}

function HeatmapCell({ slot }) {
  const bg = slot.isFuture || slot.completed === null
    ? 'bg-gray-100 dark:bg-gray-800'
    : pointsToBg(slot.points);
  const ring = slot.isToday ? 'ring-2 ring-emerald-500 ring-offset-1 dark:ring-offset-gray-900' : '';
  const showPts = !slot.isFuture && slot.points !== null && slot.points > 0;

  return (
    <div
      className={`aspect-square rounded-sm ${bg} ${ring} flex items-center justify-center overflow-hidden`}
      title={`Day ${slot.day}: ${slot.points ?? 0} pts (${slot.completed ?? 0}/5 items)`}
    >
      {showPts && (
        <span className="text-[7px] font-bold text-white/80 leading-none">{slot.points}</span>
      )}
    </div>
  );
}

// Mini 30-bar points chart
function PointsChart({ pointsHistory, ramadanStart }) {
  const MAX_PTS = 215;
  const slots = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(ramadanStart + 'T12:00:00');
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const today = new Date().toISOString().slice(0, 10);
    const entry = (pointsHistory || []).find(p => p.date === key);
    slots.push({ day: i + 1, date: key, points: entry?.points ?? 0, isToday: key === today, isFuture: key > today });
  }

  return (
    <div className="flex items-end gap-0.5 h-16">
      {slots.map(slot => {
        const heightPct = slot.isFuture ? 0 : Math.max(0, (slot.points / MAX_PTS) * 100);
        const bg = slot.isToday
          ? 'bg-gold-400'
          : slot.isFuture
            ? 'bg-gray-100 dark:bg-gray-800'
            : pointsToBg(slot.points);
        return (
          <div
            key={slot.day}
            className="flex-1 flex flex-col justify-end"
            title={`Day ${slot.day}: ${slot.points} pts`}
          >
            <div
              className={`rounded-sm transition-all ${bg} ${slot.isToday ? 'ring-1 ring-gold-400/50' : ''}`}
              style={{ height: slot.isFuture ? '2px' : `${Math.max(heightPct, slot.points > 0 ? 4 : 1)}%` }}
            />
          </div>
        );
      })}
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

// ─── Account Settings ─────────────────────────────────────────────────────────
function AccountSettings({ user }) {
  const [open, setOpen] = useState(false);

  // Profile fields
  const [name, setName] = useState(user.name || '');
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [username, setUsername] = useState(user.username || '');
  const [community, setCommunity] = useState(user.community || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null); // { ok, text }

  // Password fields
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);


  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      // Update name + displayName + community via API
      const res = await fetch(`${API_BASE}/api/user/preferences`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ displayName, community }),
      });
      if (!res.ok) throw new Error('Update failed');

      // Update name via better-auth
      if (name !== user.name) {
        const r = await updateUser({ name });
        if (r?.error) throw new Error(r.error.message);
      }

      // Update username via better-auth username plugin
      if (username && username !== user.username) {
        const r = await updateUser({ username });
        if (r?.error) throw new Error(r.error.message);
      }

      setProfileMsg({ ok: true, text: 'Profile updated!' });
    } catch (err) {
      setProfileMsg({ ok: false, text: err.message || 'Update failed.' });
    } finally {
      setProfileSaving(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (newPw.length < 8) {
      setPwMsg({ ok: false, text: 'Password must be at least 8 characters.' });
      return;
    }
    setPwSaving(true);
    setPwMsg(null);
    try {
      const r = await changePassword({ currentPassword: currentPw, newPassword: newPw, revokeOtherSessions: false });
      if (r?.error) throw new Error(r.error.message);
      setCurrentPw('');
      setNewPw('');
      setPwMsg({ ok: true, text: 'Password changed!' });
    } catch (err) {
      setPwMsg({ ok: false, text: err.message || 'Password change failed.' });
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-emerald-50 dark:border-gray-700 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left"
      >
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">Account Settings</span>
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-gray-400" />
          : <ChevronDown className="w-4 h-4 text-gray-400" />
        }
      </button>

      {open && (
        <div className="px-4 pb-5 space-y-5 border-t border-gray-50 dark:border-gray-700 pt-4">

          {/* Profile form */}
          <form onSubmit={saveProfile} className="space-y-3">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Profile</p>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Display Name <span className="text-gray-400 font-normal">(shown on leaderboard)</span>
              </label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="e.g. Br. Kareem"
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Username <span className="text-gray-400 font-normal">(optional, unique @handle)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="yourhandle"
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl pl-7 pr-3 py-2 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Community / Masjid <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={community}
                onChange={e => setCommunity(e.target.value)}
                placeholder="e.g. Queenstown Masjid"
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {profileMsg && (
              <p className={`text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 ${
                profileMsg.ok
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
              }`}>
                {profileMsg.ok ? <Check className="w-3.5 h-3.5 shrink-0" /> : '⚠️'}
                {profileMsg.text}
              </p>
            )}

            <button
              type="submit"
              disabled={profileSaving}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {profileSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save Profile
            </button>
          </form>

          <div className="border-t border-gray-100 dark:border-gray-700" />

          {/* Password form */}
          <form onSubmit={savePassword} className="space-y-3">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Change Password</p>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
              <input
                type={showPw ? 'text' : 'password'}
                value={currentPw}
                onChange={e => setCurrentPw(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  placeholder="Min 8 characters"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 pr-10 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {pwMsg && (
              <p className={`text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 ${
                pwMsg.ok
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
              }`}>
                {pwMsg.ok ? <Check className="w-3.5 h-3.5 shrink-0" /> : '⚠️'}
                {pwMsg.text}
              </p>
            )}

            <button
              type="submit"
              disabled={pwSaving}
              className="w-full py-2.5 bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {pwSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Update Password
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function UserProfile() {
  const { data: session } = useSession();
  const { getAllDays, getStreak, getTodayProgress, getTotalPoints, getPointsHistory } = useRamadanTracker();
  const ramadan = getRamadanDay();
  const ramadanStart = getUserRamadanStart();

  const allDays = getAllDays();
  const streak = getStreak();
  const progress = getTodayProgress();
  const totalPts = getTotalPoints();
  const pointsHistory = getPointsHistory();

  // Days where user tracked anything (at least 1 item)
  const trackedDays = allDays.filter(d => d.completed > 0).length;
  // Perfect days (5/5)
  const perfectDays = allDays.filter(d => d.completed === 5).length;
  // Per-item totals (memoized — localStorage read is synchronous but inside a loop)
  const itemTotals = useMemo(() => {
    const totals = {};
    try {
      const stored = JSON.parse(localStorage.getItem('ramadan_tracker_v1') || '{}');
      for (const k of Object.keys(CHECKLIST_LABELS)) {
        totals[k] = Object.values(stored).filter(r => r[k]).length;
      }
    } catch {
      for (const k of Object.keys(CHECKLIST_LABELS)) totals[k] = 0;
    }
    return totals;
  }, []);

  const calendarSlots = buildCalendarSlots(ramadanStart, allDays, pointsHistory);

  const profileHeader = (
    <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 dark:from-emerald-800 dark:to-emerald-900 text-white pt-safe pb-5 px-5 rounded-b-3xl shadow-lg sticky top-0 z-10">
      <div className="flex items-center gap-3 pt-4">
        <Link to="/ramadan" className="p-2 -ml-2 hover:bg-emerald-500/30 rounded-full transition-colors" aria-label="Back">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold font-display">Profile</h1>
      </div>
    </div>
  );

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24 page-enter">
        {profileHeader}
        <div className="px-4 py-10 text-center">
          <div className="text-5xl mb-4">🔒</div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Sign in to see your profile</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Track your Ramadan progress, view your streak, and sync across devices.
          </p>
        </div>
      </div>
    );
  }

  const { user } = session;
  const initials = (user.name || user.email || '?').slice(0, 2).toUpperCase();
  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-GY', { month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24 page-enter">
      {profileHeader}
    <div className="px-4 py-5 space-y-5">
      {/* User info */}
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

      {/* Points header */}
      <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 dark:from-emerald-800 dark:to-gray-900 rounded-2xl p-4 text-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-gold-400" />
            <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wide">Total Points</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-gold-400">
            Level {totalPts.level.level}
          </span>
        </div>

        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-4xl font-bold tabular-nums">{totalPts.total.toLocaleString()}</p>
            <p className="text-sm text-gold-400 font-semibold mt-0.5">
              {totalPts.level.arabic} · {totalPts.level.label}
            </p>
          </div>
          {/* Circular level indicator */}
          <div className="relative w-14 h-14">
            <svg viewBox="0 0 56 56" className="w-14 h-14 -rotate-90">
              <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5" />
              <circle
                cx="28" cy="28" r="22" fill="none"
                stroke="rgb(251 191 36)"
                strokeWidth="5"
                strokeDasharray={`${2 * Math.PI * 22}`}
                strokeDashoffset={`${2 * Math.PI * 22 * (1 - totalPts.progress / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-gold-400">{totalPts.progress}%</span>
            </div>
          </div>
        </div>

        {totalPts.nextLevel && (
          <div>
            <div className="flex justify-between text-[10px] text-emerald-300 mb-1">
              <span>{totalPts.level.label}</span>
              <span>{totalPts.total} / {totalPts.nextLevel.min} pts → {totalPts.nextLevel.label}</span>
            </div>
            <div className="w-full bg-black/30 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-emerald-400 to-gold-400 h-1.5 rounded-full transition-all duration-700"
                style={{ width: `${totalPts.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
          Your Ramadan Stats
        </p>
        <div className="grid grid-cols-3 gap-2">
          <StatCard
            icon="🔥"
            label="Day Streak"
            value={streak}
            sub={streak >= 3 ? `×${[2.0,1.8,1.5,1.2].find((_,i)=>streak>=[21,14,7,3][i]) || 1} bonus` : 'consecutive days'}
          />
          <StatCard icon="📅" label="Days Tracked" value={trackedDays} sub={`of ${ramadan.day || 30} days`} />
          <StatCard
            icon="⭐"
            label="Perfect Days"
            value={perfectDays}
            sub={perfectDays > 0 ? `+${perfectDays * 50} bonus pts` : 'all 5 items'}
          />
        </div>
      </div>

      {/* Points chart */}
      {pointsHistory.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            Points Per Day
          </p>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-emerald-50 dark:border-gray-700">
            <PointsChart pointsHistory={pointsHistory} ramadanStart={ramadanStart} />
            <div className="flex items-center justify-between mt-2 text-[10px] text-gray-400 dark:text-gray-500">
              <span>Day 1</span>
              <span className="text-gold-500 dark:text-gold-400 font-semibold">■ today</span>
              <span>Day 30</span>
            </div>
          </div>
        </div>
      )}

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
            <span>50</span>
            <span className="w-3 h-3 rounded-sm bg-emerald-600 inline-block" />
            <span>200+</span>
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
            <span>🟩 More points = darker green · numbers = day's pts</span>
            <span>· Today has a ring</span>
          </div>
        </div>
      </div>

      {/* Buddy / Leaderboard */}
      <div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
          Friends &amp; Leaderboard
        </p>
        <BuddySection currentUser={user} />
      </div>

      {/* Account Settings */}
      <AccountSettings user={user} />

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
    </div>
  );
}
