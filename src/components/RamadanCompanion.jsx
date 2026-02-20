import { useState, useEffect, useCallback, useRef } from 'react';
import { Moon, CheckCircle2, Circle, Flame, BookOpen, Star, Heart, Building2, Bell, BellOff, ChevronDown, ChevronUp, Clock, Play, Square, Zap, Trophy } from 'lucide-react';
import { POINT_VALUES, calcCategoryPoints } from '../utils/points';
import { useSession } from '../lib/auth-client';
import { Link } from 'react-router-dom';
import Announcements from './Announcements';

const MEDALS = ['🥇', '🥈', '🥉'];
import { previewAdhan, stopAdhan } from '../utils/adhanPlayer';
import { getRamadanDay, getTodayTimetable, getSecondsUntilIftaar, RAMADAN_START_OPTIONS, getUserRamadanStart, setUserRamadanStart } from '../data/ramadanTimetable';
import { timeSlots, getThemeForDay, getThemeKey, getCurrentTimeSlot } from '../data/ramadanReminders';
import { useRamadanTracker } from '../hooks/useRamadanTracker';
import { guyanaTimeStrToMs } from '../utils/timezone';
import { getUserAsrMadhab, setUserAsrMadhab } from '../utils/settings';
import { API_BASE } from '../config';

// ─── Iftaar duas and dhikr ────────────────────────────────────────────────────
const IFTAAR_DUAS = [
  {
    title: 'Dua at the Time of Breaking Fast',
    arabic: 'اللَّهُمَّ لَكَ صُمْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ',
    transliteration: 'Allahumma laka sumtu wa \'ala rizqika aftartu',
    translation: 'O Allah! For You I fasted and upon Your provision I break my fast.',
    source: 'Abu Dawud',
  },
  {
    title: 'Alternative Iftaar Dua',
    arabic: 'ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ',
    transliteration: 'Dhahaba al-zama\' wa\'btallat al-\'urooq wa thabata al-ajru in sha Allah',
    translation: 'The thirst is gone, the veins are moistened, and the reward is certain, if Allah wills.',
    source: 'Abu Dawud',
  },
];

const POST_IFTAAR_DHIKR = [
  { arabic: 'الْحَمْدُ لِلَّهِ', transliteration: 'Alhamdulillah', count: '33×', note: 'Praise be to Allah' },
  { arabic: 'سُبْحَانَ اللَّهِ', transliteration: 'SubhanAllah', count: '33×', note: 'Glory be to Allah' },
  { arabic: 'اللَّهُ أَكْبَرُ', transliteration: 'Allahu Akbar', count: '34×', note: 'Allah is the Greatest' },
  { arabic: 'أَسْتَغْفِرُ اللَّهَ', transliteration: 'Astaghfirullah', count: '100×', note: 'I seek Allah\'s forgiveness' },
];

// ─── Checklist config ─────────────────────────────────────────────────────────
const CHECKLIST = [
  { key: 'fasted', icon: '🌙', label: 'Fasted today', color: 'emerald', hint: '+50' },
  { key: 'quran', icon: '📖', label: 'Read Qur\'an', color: 'blue', hint: '+10/surah' },
  { key: 'dhikr', icon: '📿', label: 'Completed Dhikr', color: 'purple', hint: '+1/10ct' },
  { key: 'prayer', icon: '🙏', label: 'Extra prayer done', color: 'amber', hint: '+5/prayer' },
  { key: 'masjid', icon: '🕌', label: 'Attended masjid', color: 'rose', hint: '+40' },
];

const COLOR_MAP = {
  emerald: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700',
  blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700',
  purple: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700',
  amber: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700',
  rose: 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-700',
};

// ─── Iftaar countdown ─────────────────────────────────────────────────────────
function useIftaarCountdown() {
  const [secsLeft, setSecsLeft] = useState(() => getSecondsUntilIftaar());
  useEffect(() => {
    const id = setInterval(() => setSecsLeft(getSecondsUntilIftaar()), 1000);
    return () => clearInterval(id);
  }, []);
  return secsLeft;
}

function fmtSecs(s) {
  if (s == null || s <= 0) return null;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = n => String(n).padStart(2, '0');
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

// ─── Push notification helpers ────────────────────────────────────────────────
function canNotify() {
  return 'Notification' in window;
}

function parseMaghribMs(maghribTime) {
  // Parse "6:08 PM" (Guyana local time) → UTC ms for today
  return guyanaTimeStrToMs(maghribTime);
}

// Post iftaar schedule to SW — works while app is open/backgrounded on installed PWA
async function scheduleViaServiceWorker(maghribMs, ramadanDay) {
  if (!('serviceWorker' in navigator)) return false;
  const reg = await navigator.serviceWorker.ready;
  if (!reg.active) return false;
  reg.active.postMessage({ type: 'SCHEDULE_IFTAAR', maghribMs, ramadanDay });
  return true;
}

// ─── Asr madhab setting ───────────────────────────────────────────────────────
const ASR_OPTIONS = [
  { value: 'shafi', label: 'Shafi / Maliki / Hanbali', note: 'Shadow length = 1× object' },
  { value: 'hanafi', label: 'Hanafi', note: 'Shadow length = 2× object (~45–60 min later)' },
];

function AsrMadhabSetting() {
  const [madhab, setMadhab] = useState(() => getUserAsrMadhab());
  const change = (val) => {
    setUserAsrMadhab(val);
    setMadhab(val);
  };
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Asr prayer time</p>
        <p className="text-[11px] text-gray-400">{ASR_OPTIONS.find(o => o.value === madhab)?.note}</p>
      </div>
      <select
        value={madhab}
        onChange={e => change(e.target.value)}
        className="text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2.5 py-1.5 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        {ASR_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

// ─── Adhan notification toggle ────────────────────────────────────────────────

const ADHAN_PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const ADHAN_KEY = 'adhan_notif_prayers';

function AdhanNotifToggle({ canNotify }) {
  const [enabled, setEnabled] = useState(() => localStorage.getItem('adhan_notifs') === 'true');
  const [prayers, setPrayers] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(ADHAN_KEY) || '[]');
    } catch { return []; }
  });

  const toggleEnabled = async () => {
    if (!enabled) {
      if (Notification.permission === 'default') {
        const perm = await Notification.requestPermission();
        if (perm !== 'granted') return;
      }
      if (Notification.permission !== 'granted') return;
      const defaultPrayers = ['Fajr', 'Maghrib', 'Isha'];
      const next = prayers.length ? prayers : defaultPrayers;
      setPrayers(next);
      localStorage.setItem(ADHAN_KEY, JSON.stringify(next));
      localStorage.setItem('adhan_notifs', 'true');
      setEnabled(true);
    } else {
      localStorage.setItem('adhan_notifs', 'false');
      setEnabled(false);
    }
  };

  const togglePrayer = (p) => {
    const next = prayers.includes(p) ? prayers.filter(x => x !== p) : [...prayers, p];
    setPrayers(next);
    localStorage.setItem(ADHAN_KEY, JSON.stringify(next));
  };

  if (!canNotify) return null;

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400">🕌 Adhan (prayer time) alerts</span>
        <button
          onClick={toggleEnabled}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all ${
            enabled
              ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
          }`}
        >
          {enabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
          {enabled ? 'On' : 'Enable'}
        </button>
      </div>
      {enabled && (
        <>
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {ADHAN_PRAYERS.map(p => (
              <button
                key={p}
                onClick={() => togglePrayer(p)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${
                  prayers.includes(p)
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <AdhanPreview />
        </>
      )}
    </div>
  );
}

function AdhanPreview() {
  const [playing, setPlaying] = useState(false);

  const handlePreview = () => {
    if (playing) {
      stopAdhan();
      setPlaying(false);
    } else {
      const res = previewAdhan();
      const audio = res?.audio;
      setPlaying(true);
      if (audio) {
        audio.onended = () => setPlaying(false);
        audio.onpause = () => setPlaying(false);
      }
    }
  };

  return (
    <button
      onClick={handlePreview}
      className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
    >
      {playing ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
      {playing ? 'Stop preview' : 'Preview Adhan (Mishary Alafasy)'}
    </button>
  );
}

// ─── Mini Leaderboard Preview ─────────────────────────────────────────────────
function MiniLeaderboard() {
  const [entries, setEntries] = useState([]);
  useEffect(() => {
    fetch(`${API_BASE}/api/leaderboard`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : [])
      .then(data => setEntries(Array.isArray(data) ? data.slice(0, 3) : []))
      .catch(() => {});
  }, []);

  if (entries.length < 2) return null; // Only show when there's actually competition

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-emerald-50 dark:border-gray-700 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-gold-500" />
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">Leaderboard</span>
        </div>
        <Link to="/profile" className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
          See all →
        </Link>
      </div>
      <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
        {entries.map((e, i) => (
          <div key={e.userId} className={`flex items-center gap-3 px-4 py-2.5 ${e.isMe ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}`}>
            <span className="text-base w-6 text-center shrink-0">{MEDALS[i] || `#${e.rank}`}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                {e.displayName || e.name}
                {e.isMe && <span className="ml-1 text-[10px] text-emerald-500 font-normal">(you)</span>}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{e.totalPoints.toLocaleString()}</p>
              <p className="text-[10px] text-gray-400">pts</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function RamadanCompanion() {
  const ramadan = getRamadanDay();
  const today = getTodayTimetable();
  const secsLeft = useIftaarCountdown();
  const countdown = fmtSecs(secsLeft);
  const isIftaarTime = secsLeft !== null && secsLeft <= 0;

  const theme = getThemeForDay(ramadan.day);
  const themeKey = getThemeKey(ramadan.day);
  const currentSlotId = getCurrentTimeSlot();
  const currentSlot = timeSlots.find(s => s.id === currentSlotId);
  const currentReminder = currentSlot?.reminders?.[themeKey];
  const isLastTen = ramadan.isRamadan && ramadan.day >= 21;

  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const { todayRecord, toggle, getStreak, getTodayProgress, getTodayPoints, getTotalPoints } = useRamadanTracker();
  const streak = getStreak();
  const progress = getTodayProgress();
  const todayPts = getTodayPoints();
  const totalPts = getTotalPoints();
  const [showPtsBreakdown, setShowPtsBreakdown] = useState(false);

  const [notifEnabled, setNotifEnabled] = useState(() => localStorage.getItem('ramadan_notifs') === 'true');
  const notifWarnRef = useRef(null);
  const notifIftaarRef = useRef(null);

  useEffect(() => {
    return () => {
      if (notifWarnRef.current) clearTimeout(notifWarnRef.current);
      if (notifIftaarRef.current) clearTimeout(notifIftaarRef.current);
    };
  }, []);

  const [showDuas, setShowDuas] = useState(false);
  const [showAllSlots, setShowAllSlots] = useState(false);
  const [userStart, setUserStart] = useState(() => getUserRamadanStart());

  const changeRamadanStart = (newStart) => {
    setUserRamadanStart(newStart);
    setUserStart(newStart);
    localStorage.setItem('ramadan_start_prompted', 'done');
    window.location.reload();
  };

  const requestNotifications = useCallback(async () => {
    if (!canNotify()) return;
    if (Notification.permission === 'default') {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') return;
    }
    if (Notification.permission === 'granted') {
      setNotifEnabled(true);
      localStorage.setItem('ramadan_notifs', 'true');

      const maghribMs = parseMaghribMs(today?.maghrib);
      if (maghribMs) {
        // Try SW first (works when app is in background on installed PWA)
        const usedSW = await scheduleViaServiceWorker(maghribMs, ramadan.day);
        if (!usedSW && maghribMs > Date.now()) {
          // Fallback: browser-side setTimeout (only works while tab is open)
          const msLeft = maghribMs - Date.now();
          const warn5 = msLeft - 5 * 60 * 1000;
          if (warn5 > 0) {
            if (notifWarnRef.current) clearTimeout(notifWarnRef.current);
            notifWarnRef.current = setTimeout(() => {
              new Notification('🌇 Iftaar in 5 minutes — Make Dua Now!', {
                body: 'اللَّهُمَّ لَكَ صُمْتُ — The fasting person\'s dua is accepted before iftaar!',
                tag: 'iftaar-warning',
              });
            }, warn5);
          }
          if (notifIftaarRef.current) clearTimeout(notifIftaarRef.current);
          notifIftaarRef.current = setTimeout(() => {
            new Notification('🎉 Iftaar Time — Break Your Fast!', {
              body: 'اللَّهُمَّ لَكَ صُمْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ\nAllahumma laka sumtu wa \'ala rizqika aftartu',
              tag: 'iftaar-now',
            });
          }, msLeft);
        }
      }

      new Notification('✅ Iftaar Reminders Active', {
        body: 'You\'ll be notified 10 min before and at Iftaar time. Install the app for background alerts!',
        tag: 'notif-confirm',
      });
    }
  }, [today, ramadan.day]);

  const disableNotifications = useCallback(() => {
    setNotifEnabled(false);
    localStorage.setItem('ramadan_notifs', 'false');
  }, []);

  // Auto-schedule on mount if enabled (re-schedules after app reload)
  useEffect(() => {
    if (notifEnabled && Notification.permission === 'granted' && today?.maghrib) {
      const maghribMs = parseMaghribMs(today.maghrib);
      if (maghribMs) scheduleViaServiceWorker(maghribMs, ramadan.day);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ramadan.isRamadan) {
    return <OutsideRamadan ramadan={ramadan} />;
  }

  return (
    <div className="px-4 py-5 max-w-2xl mx-auto space-y-4">

      <Announcements compact />

      {/* Theme banner */}
      <div className={`rounded-2xl p-4 text-white bg-gradient-to-br ${theme?.bgGradient || 'from-emerald-900 to-emerald-700'} ${isLastTen ? 'ring-2 ring-amber-400/50' : ''}`}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium opacity-80">
            Day {ramadan.day} of {ramadan.total} — {theme?.label}
          </span>
          <span className="text-lg">{theme?.icon}</span>
        </div>
        <p className="font-amiri text-lg font-bold">{theme?.focus}</p>
        <p className="text-xs opacity-75 mt-0.5">{theme?.subtitle}</p>
        {isLastTen && (
          <div className="mt-2 bg-white/10 rounded-xl px-3 py-1.5 text-xs">
            ⭐ Last 10 Nights — Seek Laylatul Qadr every night
          </div>
        )}
        {/* Ramadan progress bar */}
        <div className="mt-3">
          <div className="w-full bg-black/20 rounded-full h-1.5">
            <div
              className="bg-white/80 h-1.5 rounded-full transition-all"
              style={{ width: `${ramadan.progress}%` }}
            />
          </div>
          <p className="text-[10px] opacity-60 mt-1">{ramadan.day}/30 days complete</p>
        </div>
      </div>

      {/* Iftaar countdown / time */}
      {today && (
        <div className={`rounded-2xl p-4 border transition-all ${
          isIftaarTime
            ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700'
            : 'bg-white dark:bg-gray-800 border-emerald-50 dark:border-gray-700'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className={`w-4 h-4 ${isIftaarTime ? 'text-amber-600' : 'text-emerald-600 dark:text-emerald-400'}`} />
              <span className={`text-sm font-semibold ${isIftaarTime ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-800 dark:text-emerald-200'}`}>
                {isIftaarTime ? '🎉 Iftaar Time!' : countdown ? `Iftaar in ${countdown}` : `Iftaar at ${today.maghrib}`}
              </span>
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500">Maghrib: {today.maghrib}</span>
          </div>

          {/* Notification toggles */}
          <div className="pt-2 border-t border-gray-100 dark:border-gray-700 space-y-2.5">
            {/* Iftaar reminder */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">🍽️ Iftaar reminder</span>
              {canNotify() ? (
                <button
                  onClick={notifEnabled ? disableNotifications : requestNotifications}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all ${
                    notifEnabled
                      ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {notifEnabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                  {notifEnabled ? 'On' : 'Enable'}
                </button>
              ) : (
                <span className="text-[10px] text-gray-400">Not supported on this browser</span>
              )}
            </div>
            {/* Adhan (prayer time) notifications */}
            <AdhanNotifToggle canNotify={canNotify()} />
          </div>
        </div>
      )}

      {/* Iftaar duas — show when iftaar time or expandable */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-emerald-50 dark:border-gray-700 overflow-hidden">
        <button
          onClick={() => setShowDuas(!showDuas)}
          className="w-full flex items-center justify-between px-4 py-3 text-left"
        >
          <div className="flex items-center gap-2">
            <span className="text-base">🤲</span>
            <span className="font-semibold text-sm text-emerald-900 dark:text-emerald-100">
              {isIftaarTime ? '🎉 Iftaar Duas & Dhikr' : 'Iftaar Duas & Dhikr'}
            </span>
            {isIftaarTime && (
              <span className="text-[10px] bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full animate-pulse">
                Now!
              </span>
            )}
          </div>
          {showDuas ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>

        {(showDuas || isIftaarTime) && (
          <div className="px-4 pb-4 space-y-3">
            {IFTAAR_DUAS.map((dua, i) => (
              <div key={i} className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3">
                <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-200 mb-1">{dua.title}</p>
                <p className="font-amiri text-right text-lg text-emerald-900 dark:text-emerald-100 leading-relaxed mb-1">
                  {dua.arabic}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 italic mb-1">{dua.transliteration}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">{dua.translation}</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">— {dua.source}</p>
              </div>
            ))}

            <div>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Post-Iftaar Dhikr</p>
              <div className="grid grid-cols-2 gap-2">
                {POST_IFTAAR_DHIKR.map((d, i) => (
                  <div key={i} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-2.5 text-center">
                    <p className="font-amiri text-base text-emerald-800 dark:text-emerald-200">{d.arabic}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{d.transliteration}</p>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-full mt-1 inline-block">
                      {d.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Today's contextual reminder */}
      {currentReminder && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-emerald-50 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{currentSlot?.icon}</span>
            <div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">{currentSlot?.label}</p>
              <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">{currentReminder.title}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-2">{currentReminder.text}</p>
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl px-3 py-2">
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">👉 {currentReminder.action}</p>
          </div>
          {currentReminder.tip && (
            <p className="text-[10px] text-gray-400 dark:text-gray-500 italic mt-2">💡 {currentReminder.tip}</p>
          )}
        </div>
      )}

      {/* Points Summary Card */}
      <button
        onClick={() => setShowPtsBreakdown(s => !s)}
        className="w-full bg-gradient-to-br from-emerald-700 to-emerald-900 dark:from-emerald-800 dark:to-gray-900 rounded-2xl p-4 text-white text-left transition-all"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-gold-400" />
            <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wide">Points Today</span>
          </div>
          {/* Level badge */}
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-gold-400`}>
            {totalPts.level.arabic} · {totalPts.level.label}
          </span>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold text-white tabular-nums">
              {todayPts.total}
              <span className="text-base font-normal text-emerald-300 ml-1">pts</span>
            </p>
            {todayPts.multiplier > 1 && (
              <p className="text-[11px] text-amber-300 mt-0.5 flex items-center gap-1">
                <Flame className="w-3 h-3" />
                ×{todayPts.multiplier} streak bonus active
              </p>
            )}
            {todayPts.bonus > 0 && (
              <p className="text-[11px] text-gold-400 mt-0.5">⭐ Perfect day +{todayPts.bonus} bonus!</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-emerald-300">{totalPts.total} total pts</p>
            <p className="text-[10px] text-emerald-400 mt-0.5">tap for breakdown</p>
          </div>
        </div>

        {/* XP progress bar */}
        {totalPts.nextLevel && (
          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-emerald-300 mb-1">
              <span>{totalPts.level.label}</span>
              <span>{totalPts.total} / {totalPts.nextLevel.min} → {totalPts.nextLevel.label}</span>
            </div>
            <div className="w-full bg-black/30 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-emerald-400 to-gold-400 h-1.5 rounded-full transition-all duration-700"
                style={{ width: `${totalPts.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Breakdown (expanded) */}
        {showPtsBreakdown && todayPts.breakdown && (
          <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
            {/* Per-category breakdown */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
              {todayPts.breakdown.fasting > 0 && (
                <div className="flex justify-between"><span className="text-emerald-300">Fasting</span><span className="font-bold">{todayPts.breakdown.fasting} pts</span></div>
              )}
              {todayPts.breakdown.masjid > 0 && (
                <div className="flex justify-between"><span className="text-emerald-300">Masjid</span><span className="font-bold">{todayPts.breakdown.masjid} pts</span></div>
              )}
              {todayPts.breakdown.prayer.pts > 0 && (
                <div className="flex justify-between"><span className="text-emerald-300">Prayer</span><span className="font-bold">{todayPts.breakdown.prayer.pts} pts <span className="font-normal text-emerald-400">({todayPts.breakdown.prayer.prayers} prayer{todayPts.breakdown.prayer.prayers !== 1 ? 's' : ''}{todayPts.breakdown.prayer.jamaah > 0 ? ` + ${todayPts.breakdown.prayer.jamaah} jama'ah` : ''})</span></span></div>
              )}
              {todayPts.breakdown.dhikr.pts > 0 && (
                <div className="flex justify-between"><span className="text-emerald-300">Dhikr</span><span className="font-bold">{todayPts.breakdown.dhikr.pts} pts <span className="font-normal text-emerald-400">({todayPts.breakdown.dhikr.count} count)</span></span></div>
              )}
              {todayPts.breakdown.quran.pts > 0 && (
                <div className="flex justify-between"><span className="text-emerald-300">Qur'an</span><span className="font-bold">{todayPts.breakdown.quran.pts} pts <span className="font-normal text-emerald-400">({todayPts.breakdown.quran.surahs} surah{todayPts.breakdown.quran.surahs !== 1 ? 's' : ''})</span></span></div>
              )}
            </div>
            {/* Streak + bonus row */}
            <div className="flex justify-between text-[11px] pt-1 border-t border-white/10">
              <span className="text-emerald-300">Streak ×{todayPts.multiplier} · Perfect +{todayPts.bonus}</span>
              <span className="font-bold">{todayPts.total} total</span>
            </div>
          </div>
        )}
      </button>

      {/* Mini leaderboard — only when logged in */}
      {isLoggedIn && <MiniLeaderboard />}

      {/* Daily checklist */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-emerald-50 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm text-gray-800 dark:text-gray-100">Today's Checklist</h3>
          <span className="text-xs text-gray-400 dark:text-gray-500">{progress.completed}/{progress.total}</span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 mb-3">
          <div
            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>

        <div className="space-y-2">
          {(() => {
            const bd = calcCategoryPoints(todayRecord);
            const earnedMap = {
              fasted: bd.fasting,
              masjid: bd.masjid,
              prayer: bd.prayer.pts,
              dhikr: bd.dhikr.pts,
              quran: bd.quran.pts,
            };
            return CHECKLIST.map(({ key, icon, label, color, hint }) => {
              const done = !!todayRecord[key];
              const earned = earnedMap[key] || 0;
              return (
                <button
                  key={key}
                  onClick={() => toggle(key)}
                  aria-pressed={done}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all border ${
                    done
                      ? `${COLOR_MAP[color]} border-current`
                      : 'bg-gray-50 dark:bg-gray-700/50 border-gray-100 dark:border-gray-600 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {done
                    ? <CheckCircle2 className="w-4 h-4 shrink-0" />
                    : <Circle className="w-4 h-4 shrink-0 text-gray-300 dark:text-gray-600" />
                  }
                  <span className="text-base">{icon}</span>
                  <span className="text-sm font-medium flex-1">{label}</span>
                  <span className={`text-[10px] font-semibold ${done ? 'opacity-60' : 'text-gray-300 dark:text-gray-600'}`}>
                    {done ? `+${earned}` : hint}
                  </span>
                </button>
              );
            });
          })()}
        </div>
      </div>

      {/* Streak */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-emerald-50 dark:border-gray-700 flex items-center gap-4">
        <div className="text-3xl">{streak > 0 ? '🔥' : '💧'}</div>
        <div className="flex-1">
          <p className="font-bold text-gray-800 dark:text-gray-100">
            {streak > 0 ? `${streak} Day Consistency` : 'Start Your Streak'}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {streak > 0
              ? `Complete ≥3 items daily to maintain your streak`
              : 'Complete at least 3 items today to begin'}
          </p>
        </div>
        {streak >= 7 && <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-full font-semibold">MashAllah!</span>}
      </div>

      {/* All time slots — expandable */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-emerald-50 dark:border-gray-700 overflow-hidden">
        <button
          onClick={() => setShowAllSlots(!showAllSlots)}
          className="w-full flex items-center justify-between px-4 py-3 text-left"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold text-sm text-gray-800 dark:text-gray-100">All Day's Reminders</span>
          </div>
          {showAllSlots ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
        {showAllSlots && (
          <div className="px-4 pb-4 space-y-3">
            {timeSlots.map(slot => {
              const reminder = slot.reminders[themeKey];
              const isCurrent = slot.id === currentSlotId;
              return (
                <div key={slot.id} className={`rounded-xl p-3 ${isCurrent ? 'bg-emerald-50 dark:bg-emerald-900/20 ring-1 ring-emerald-200 dark:ring-emerald-700' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span>{slot.icon}</span>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{slot.label}</p>
                    {isCurrent && <span className="text-[10px] bg-emerald-600 text-white px-1.5 rounded-full">Now</span>}
                  </div>
                  <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300 mb-0.5">{reminder?.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{reminder?.text}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Settings row — Ramadan start date + Asr madhab */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-emerald-50 dark:border-gray-700 space-y-3">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Settings</h3>

        {/* Ramadan start date */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">My Ramadan started</p>
            <p className="text-[11px] text-gray-400">Changes day count throughout app</p>
          </div>
          <select
            value={userStart}
            onChange={e => changeRamadanStart(e.target.value)}
            className="text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2.5 py-1.5 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {RAMADAN_START_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Asr madhab */}
        <AsrMadhabSetting />
      </div>

      {/* Last 10 nights special card */}
      {isLastTen && (
        <div className="rounded-2xl p-4 bg-gradient-to-br from-amber-900 to-amber-700 text-white ring-2 ring-amber-400/50">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-base">Last 10 Nights Mode</h3>
          </div>
          <p className="text-sm text-amber-100 leading-relaxed mb-2">
            These are the most blessed nights of the year. Laylatul Qadr is worth more than 1,000 months.
            Don't waste a single one.
          </p>
          <div className="space-y-1.5">
            {['Set alarm for Tahajjud tonight', 'Recite the Laylatul Qadr dua', 'Give sadaqah', 'Pray in the masjid if possible'].map(item => (
              <div key={item} className="flex items-center gap-2 text-xs text-amber-200">
                <span className="w-1 h-1 rounded-full bg-amber-400 shrink-0" />
                {item}
              </div>
            ))}
          </div>
          <div className="mt-3 bg-black/20 rounded-xl px-3 py-2 text-center">
            <p className="font-amiri text-base text-amber-200">اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي</p>
            <p className="text-[10px] text-amber-300/70 mt-0.5">Allahumma innaka Afuwwun tuhibbul \'afwa fa\'fu \'anni</p>
          </div>
        </div>
      )}
    </div>
  );
}

function OutsideRamadan({ ramadan }) {
  return (
    <div className="px-4 py-12 max-w-2xl mx-auto text-center">
      <div className="text-6xl mb-4">🌙</div>
      <h2 className="text-xl font-bold text-emerald-900 dark:text-emerald-100 font-amiri mb-2">
        Ramadan Companion
      </h2>
      {!ramadan.ended && ramadan.daysUntil > 0 ? (
        <>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Ramadan begins in <strong className="text-emerald-700 dark:text-emerald-300">{ramadan.daysUntil} days</strong>
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Prepare your heart. Start building good habits now so Ramadan is transformative, In sha Allah.
          </p>
        </>
      ) : (
        <>
          <p className="text-3xl mb-3">🎉</p>
          <p className="text-gold-600 font-bold font-amiri text-xl mb-2">Eid Mubarak!</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            May Allah accept our fasting, prayers, and good deeds. See you next Ramadan, In sha Allah!
          </p>
        </>
      )}
    </div>
  );
}
