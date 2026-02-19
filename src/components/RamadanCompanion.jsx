import { useState, useEffect, useCallback } from 'react';
import { Moon, CheckCircle2, Circle, Flame, BookOpen, Star, Heart, Building2, Bell, BellOff, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { getRamadanDay, getTodayTimetable, getSecondsUntilIftaar } from '../data/ramadanTimetable';
import { timeSlots, getThemeForDay, getThemeKey, getCurrentTimeSlot } from '../data/ramadanReminders';
import { useRamadanTracker } from '../hooks/useRamadanTracker';

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
  { key: 'fasted', icon: '🌙', label: 'Fasted today', color: 'emerald' },
  { key: 'quran', icon: '📖', label: 'Read Qur\'an', color: 'blue' },
  { key: 'dhikr', icon: '📿', label: 'Completed Dhikr', color: 'purple' },
  { key: 'prayer', icon: '🙏', label: 'Extra prayer done', color: 'amber' },
  { key: 'masjid', icon: '🕌', label: 'Attended masjid', color: 'rose' },
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
  // Parse "6:08 PM" → Date in ms (today)
  if (!maghribTime) return null;
  const [time, ampm] = maghribTime.split(' ');
  const [h, m] = time.split(':').map(Number);
  let hours = h;
  if (ampm === 'PM' && h !== 12) hours += 12;
  if (ampm === 'AM' && h === 12) hours = 0;
  const d = new Date();
  d.setHours(hours, m, 0, 0);
  return d.getTime();
}

// Post iftaar schedule to SW — works while app is open/backgrounded on installed PWA
async function scheduleViaServiceWorker(maghribMs, ramadanDay) {
  if (!('serviceWorker' in navigator)) return false;
  const reg = await navigator.serviceWorker.ready;
  if (!reg.active) return false;
  reg.active.postMessage({ type: 'SCHEDULE_IFTAAR', maghribMs, ramadanDay });
  return true;
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

  const { todayRecord, toggle, getStreak, getTodayProgress } = useRamadanTracker();
  const streak = getStreak();
  const progress = getTodayProgress();

  const [notifEnabled, setNotifEnabled] = useState(() => localStorage.getItem('ramadan_notifs') === 'true');
  const [showDuas, setShowDuas] = useState(false);
  const [showAllSlots, setShowAllSlots] = useState(false);

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
            setTimeout(() => {
              new Notification('🌇 Iftaar in 5 minutes — Make Dua Now!', {
                body: 'اللَّهُمَّ لَكَ صُمْتُ — The fasting person\'s dua is accepted before iftaar!',
                tag: 'iftaar-warning',
              });
            }, warn5);
          }
          setTimeout(() => {
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
    <div className="px-4 py-5 max-w-lg mx-auto space-y-4">

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

          {/* Notification toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
            <span className="text-xs text-gray-500 dark:text-gray-400">Iftaar reminder notification</span>
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
          {CHECKLIST.map(({ key, icon, label, color }) => {
            const done = !!todayRecord[key];
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
                {done && <span className="text-[10px] opacity-70">✓</span>}
              </button>
            );
          })}
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
    <div className="px-4 py-12 max-w-lg mx-auto text-center">
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
