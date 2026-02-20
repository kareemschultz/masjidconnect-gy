import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { getTodayTimetable, getRamadanDay, getSecondsUntilIftaar, getSecondsUntilSuhoor, getSecondsUntilTomorrowSuhoor, RAMADAN_YEAR_HIJRI } from '../data/ramadanTimetable';
import { dailyReminders, getTodayReminderIndex } from '../data/dailyReminders';
import { getTodayPrayerTimes, getNextPrayer, getSecondsUntilMaghrib, getSecondsUntilTomorrowFajr } from '../utils/prayerTimes';

// Isolated component so its 1-second interval doesn't re-render the whole Header
function LiveStats({ ramadan }) {
  const [countdown, setCountdown] = useState('');
  const [countdownLabel, setCountdownLabel] = useState('');
  const [guyanaTime, setGuyanaTime] = useState('');
  const [nextPrayer, setNextPrayer] = useState(null);

  useEffect(() => {
    const tick = () => {
      // --- Year-round prayer times from Adhan ---
      const maghribSecs = getSecondsUntilMaghrib();
      const tomorrowFajrSecs = getSecondsUntilTomorrowFajr();

      if (ramadan.isRamadan) {
        // During Ramadan: prefer suhoor/iftaar labels from the Islamic calendar
        const suhoorSecs = getSecondsUntilSuhoor();
        const iftaarSecs = getSecondsUntilIftaar();
        const tomorrowSuhoorSecs = getSecondsUntilTomorrowSuhoor();

        if (suhoorSecs !== null && suhoorSecs > 0) {
          setCountdownLabel('Suhoor ends in');
          setCountdown(formatCountdown(suhoorSecs));
        } else if (iftaarSecs !== null && iftaarSecs > 0) {
          setCountdownLabel('Iftaar in');
          setCountdown(formatCountdown(iftaarSecs));
        } else if (iftaarSecs !== null && iftaarSecs > -1800) {
          // First 30 min after iftaar — celebrate
          setCountdownLabel('');
          setCountdown('Iftaar Time! 🎉');
        } else if (tomorrowSuhoorSecs !== null && tomorrowSuhoorSecs > 0) {
          setCountdownLabel('Suhoor in');
          setCountdown(formatCountdown(tomorrowSuhoorSecs));
        } else {
          // Fall through to general maghrib logic
          if (maghribSecs !== null && maghribSecs > 0) {
            setCountdownLabel('Maghrib in');
            setCountdown(formatCountdown(maghribSecs));
          } else if (tomorrowFajrSecs !== null && tomorrowFajrSecs > 0) {
            setCountdownLabel('Fajr in');
            setCountdown(formatCountdown(tomorrowFajrSecs));
          } else {
            setCountdown('');
          }
        }
      } else {
        // Outside Ramadan: count down to next Maghrib (or tomorrow's Fajr)
        if (maghribSecs !== null && maghribSecs > 0) {
          setCountdownLabel('Maghrib in');
          setCountdown(formatCountdown(maghribSecs));
        } else if (maghribSecs !== null && maghribSecs > -1800) {
          setCountdownLabel('');
          setCountdown('Maghrib Time! 🌙');
        } else if (tomorrowFajrSecs !== null && tomorrowFajrSecs > 0) {
          setCountdownLabel('Fajr in');
          setCountdown(formatCountdown(tomorrowFajrSecs));
        } else {
          setCountdown('');
        }
      }

      setGuyanaTime(new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Guyana',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(new Date()));

      // Use year-round next prayer from Adhan
      setNextPrayer(getNextPrayer());
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [ramadan.isRamadan]);

  return (
    <>
      {/* Live info bar: time + next salah */}
      <div className="flex items-center justify-center gap-3 flex-wrap text-xs text-emerald-200/80 mt-1">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span className="font-mono font-medium text-white/90">{guyanaTime}</span>
          <span className="text-emerald-300/60">GYT</span>
        </span>
        <span className="text-emerald-600/50">·</span>
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          <span>Guyana</span>
        </span>
        {nextPrayer && (
          <>
            <span className="text-emerald-600/50">·</span>
            <span className="flex items-center gap-1 text-gold-400/80">
              <span>Next: {nextPrayer.name}</span>
              <span className="font-semibold text-gold-400">{nextPrayer.display}</span>
            </span>
          </>
        )}
      </div>

      {/* Countdown Timer — shown year-round */}
      {countdown && (
        <div className="text-center mb-3 animate-fade-in">
          <div className="inline-block bg-black/20 backdrop-blur-sm rounded-2xl px-5 py-2.5">
            {countdownLabel && (
              <p className="text-emerald-300 text-xs mb-0.5">{countdownLabel}</p>
            )}
            <p className="text-2xl md:text-3xl font-bold font-mono text-gold-400 tracking-wider countdown-glow">
              {countdown}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default function Header() {
  const ramadan = getRamadanDay();
  const today = getTodayTimetable();
  // Year-round prayer times (always available, not just Ramadan)
  const pt = getTodayPrayerTimes();

  return (
    <header className="gradient-islamic text-white relative overflow-hidden">
      <div className="absolute inset-0 islamic-pattern opacity-30" />

      {/* Floating lanterns (decorative) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="lantern lantern-1">🏮</div>
        <div className="lantern lantern-2">🏮</div>
        <div className="lantern lantern-3">✨</div>
        <div className="lantern lantern-4">⭐</div>
      </div>

      <div className="relative z-10 px-4 pt-6 pb-5">
        {/* Bismillah */}
        <p className="text-center text-gold-400 font-amiri text-2xl md:text-3xl mb-1 leading-relaxed animate-fade-in">
          بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </p>
        <p className="text-center text-emerald-300/70 text-xs mb-3">
          In the Name of Allah, the Most Gracious, the Most Merciful
        </p>

        {/* Title */}
        <div className="text-center mb-3">
          <div className="flex items-center justify-center gap-3 mb-1">
            <img
              src="/icons/icon-96.png"
              alt="MasjidConnect GY logo"
              width={52}
              height={52}
              className="rounded-full shadow-lg shadow-black/30 ring-2 ring-white/20"
              loading="eager"
            />
            <div className="text-left">
              <h1 className="text-2xl md:text-3xl font-bold font-cinzel tracking-wide leading-tight">
                MasjidConnect GY
              </h1>
              <p className="text-emerald-300/80 text-xs italic">Linking Faith and Community.</p>
              <p className="text-gold-400/70 text-xs mt-0.5">
                {new Intl.DateTimeFormat('en-TN-u-ca-islamic-umalqura', {
                  day: 'numeric', month: 'long', year: 'numeric',
                  timeZone: 'America/Guyana',
                }).format(new Date())}
              </p>
            </div>
          </div>
          <LiveStats ramadan={ramadan} />
        </div>

        {/* Ramadan Progress */}
        {ramadan.isRamadan && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 max-w-md mx-auto mb-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gold-400 font-bold text-sm">
                🌙 Ramadan Day {ramadan.day} of {ramadan.total}
              </span>
              <span className="text-emerald-200 text-xs font-medium">
                {RAMADAN_YEAR_HIJRI} AH
              </span>
            </div>
            <div className="w-full bg-emerald-900/50 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-gold-400 to-gold-600 h-2.5 rounded-full transition-all duration-1000 progress-shimmer"
                style={{ width: `${ramadan.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Pre-Ramadan countdown */}
        {!ramadan.isRamadan && !ramadan.ended && ramadan.daysUntil > 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 max-w-md mx-auto mb-3 text-center">
            <p className="text-gold-400 font-bold text-lg">
              🌙 Ramadan begins in {ramadan.daysUntil} day{ramadan.daysUntil !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Eid celebration */}
        {ramadan.ended && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 max-w-md mx-auto mb-3 text-center">
            <p className="text-3xl mb-2">🎉🌙🎊</p>
            <p className="text-gold-400 font-bold font-amiri text-xl">Eid Mubarak!</p>
            <p className="text-emerald-200 text-sm">عيد مبارك — May Allah accept our fasting and prayers</p>
          </div>
        )}

        {/* All daily prayer times — next salah highlighted live */}
        <PrayerStrip pt={pt} today={today} ramadan={ramadan} />

        {/* Hadith / Ayah Carousel */}
        <HadithCarousel />
      </div>
    </header>
  );
}

/**
 * Shows all 5 daily prayer times (+ Suhoor during Ramadan).
 * The next upcoming prayer is highlighted in gold and pulses.
 * Updates every 30 seconds so the highlight advances automatically.
 */
function PrayerStrip({ pt, today, ramadan }) {
  const [nextName, setNextName] = useState(() => getNextPrayer()?.name ?? '');

  useEffect(() => {
    const update = () => setNextName(getNextPrayer()?.name ?? '');
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);

  // Build the prayer list for today
  const prayers = [];

  // During Ramadan prepend Suhoor from the timetable
  if (ramadan.isRamadan && today) {
    prayers.push({ icon: '🌅', label: 'Suhoor', time: today.suhoor, key: 'Fajr' });
  } else {
    prayers.push({ icon: '🌄', label: 'Fajr', time: pt.fajr, key: 'Fajr' });
  }

  prayers.push(
    { icon: '☀️', label: 'Dhuhr',   time: pt.dhuhr,   key: 'Dhuhr'   },
    { icon: '🌤️', label: 'Asr',     time: pt.asr,     key: 'Asr'     },
    {
      icon: '🌇',
      label: ramadan.isRamadan ? 'Iftaar' : 'Maghrib',
      time: ramadan.isRamadan && today ? today.maghrib : pt.maghrib,
      key: 'Maghrib',
    },
    { icon: '🌙', label: 'Isha', time: pt.isha, key: 'Isha' },
  );

  return (
    <div className="mt-2 mb-1 w-full overflow-x-auto scrollbar-none">
      <div className="flex items-center gap-2 px-1 min-w-max mx-auto justify-center">
        {prayers.map(p => (
          <TimeChip
            key={p.key}
            icon={p.icon}
            label={p.label}
            time={p.time}
            highlight={p.key === nextName}
          />
        ))}
      </div>
    </div>
  );
}

function formatCountdown(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = n => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

const CYCLE_MS = 15000; // 15 seconds per hadith

function HadithCarousel() {
  const startIdx = getTodayReminderIndex();
  const [idx, setIdx] = useState(startIdx);
  const [phase, setPhase] = useState('visible'); // 'visible' | 'fading'
  const timerRef = useRef(null);
  const total = dailyReminders.length;

  const goTo = useCallback((next) => {
    setPhase('fading');
    setTimeout(() => {
      setIdx(next);
      setPhase('visible');
    }, 350);
  }, []);

  const advance = useCallback(() => {
    goTo((idx + 1) % total);
  }, [idx, total, goTo]);

  const retreat = useCallback(() => {
    goTo((idx - 1 + total) % total);
  }, [idx, total, goTo]);

  // Auto-advance
  useEffect(() => {
    timerRef.current = setInterval(advance, CYCLE_MS);
    return () => clearInterval(timerRef.current);
  }, [advance]);

  // Reset timer on manual nav
  const nav = (fn) => {
    clearInterval(timerRef.current);
    fn();
    timerRef.current = setInterval(advance, CYCLE_MS);
  };

  const item = dailyReminders[idx];
  const typeLabel = item.type === 'ayah' ? '📖 Ayah' : '📿 Hadith';

  return (
    <div className="mt-3 max-w-md mx-auto select-none">
      <div
        className="relative bg-white/5 backdrop-blur-sm rounded-xl px-8 py-3 cursor-pointer"
        onClick={() => nav(advance)}
        role="button"
        aria-label="Next hadith"
      >
        {/* Type badge */}
        <span className="text-[10px] font-semibold text-gold-400/80 tracking-wide">{typeLabel}</span>

        {/* Text with fade+slide transition */}
        <div
          style={{
            transition: 'opacity 0.35s ease, transform 0.35s ease',
            opacity: phase === 'visible' ? 1 : 0,
            transform: phase === 'visible' ? 'translateY(0)' : 'translateY(5px)',
            minHeight: '72px',
          }}
        >
          <p className="text-emerald-100 text-xs italic leading-relaxed mt-1">
            "{item.text}"
          </p>
          <p className="text-emerald-400/60 text-[10px] mt-1.5 text-right">
            — {item.source}
          </p>
        </div>

        {/* Prev button */}
        <button
          className="absolute left-1 top-1/2 -translate-y-1/2 p-2 text-white/30 hover:text-white/70 transition-colors bg-white/5 rounded-full"
          onClick={e => { e.stopPropagation(); nav(retreat); }}
          aria-label="Previous"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Next button */}
        <button
          className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-white/30 hover:text-white/70 transition-colors bg-white/5 rounded-full"
          onClick={e => { e.stopPropagation(); nav(advance); }}
          aria-label="Next"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Progress dots — max 7 visible, centered around current, with 24px touch targets */}
      <div className="flex items-center justify-center gap-1 mt-1" aria-hidden="true">
        {(() => {
          const half = 3;
          let start = Math.max(0, idx - half);
          let end = Math.min(total - 1, start + 6);
          start = Math.max(0, end - 6);
          return Array.from({ length: end - start + 1 }, (_, i) => start + i).map(dotIdx => (
            <button
              key={dotIdx}
              onClick={() => nav(() => goTo(dotIdx))}
              aria-label={`Go to hadith ${dotIdx + 1}`}
              className="py-3 px-0.5 transition-all duration-300"
            >
              <span
                className="block transition-all duration-300"
                style={{
                  width: dotIdx === idx ? '16px' : '4px',
                  height: '4px',
                  borderRadius: '2px',
                  background: dotIdx === idx ? 'rgb(251 191 36 / 0.9)' : 'rgb(255 255 255 / 0.2)',
                }}
              />
            </button>
          ));
        })()}
      </div>
    </div>
  );
}

function TimeChip({ icon, label, time, highlight }) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all ${
      highlight
        ? 'bg-gold-400/20 border border-gold-400/40 text-gold-400 font-bold text-sm animate-pulse-gold'
        : 'bg-white/5 text-emerald-200'
    }`}>
      <span>{icon}</span>
      <span>{label}:</span>
      <span className={highlight ? '' : 'text-white font-semibold'}>{time}</span>
    </div>
  );
}
