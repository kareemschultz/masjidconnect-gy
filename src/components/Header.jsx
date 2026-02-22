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
          <div className="inline-block px-4 py-1.5">
            {countdownLabel && (
              <p className="text-emerald-300/80 text-[11px] uppercase tracking-widest mb-0.5">{countdownLabel}</p>
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
    <header className="gradient-islamic text-white relative overflow-hidden pt-safe">
      <div className="absolute inset-0 islamic-pattern opacity-30" />

      {/* Floating lanterns (decorative) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="lantern lantern-1">🏮</div>
        <div className="lantern lantern-2">🏮</div>
        <div className="lantern lantern-3">✨</div>
        <div className="lantern lantern-4">⭐</div>
      </div>

      <div className="relative z-10 px-4 pt-4 pb-3">
        <h1 className="sr-only">MasjidConnect GY</h1>
        {/* Compact top bar: Hijri date + Bismillah */}
        <div className="text-center mb-1">
          <p className="text-gold-400 font-amiri text-lg leading-snug">
            بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </p>
          <p className="text-gold-400/60 text-[10px] mt-0.5">
            {ramadan.isRamadan 
              ? `Ramadan ${ramadan.day}, ${RAMADAN_YEAR_HIJRI} AH`
              : new Intl.DateTimeFormat('en-TN-u-ca-islamic-umalqura', {
                  day: 'numeric', month: 'long', year: 'numeric',
                  timeZone: 'America/Guyana',
                }).format(new Date())
            }
          </p>
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
                style={{ width: `${Math.max(ramadan.progress, 4)}%` }}
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

  // Build the prayer list — always show all 6 time points (Muslim Pro style)
  const prayers = [
    { label: 'Fajr',    time: pt.fajr,    key: 'Fajr' },
    { label: 'Sunrise', time: pt.sunrise, key: 'Sunrise' },
    { label: 'Dhuhr',   time: pt.dhuhr,   key: 'Dhuhr' },
    { label: 'Asr',     time: pt.asr,     key: 'Asr' },
    { label: 'Maghrib', time: (ramadan.isRamadan && today) ? today.maghrib : pt.maghrib, key: 'Maghrib' },
    { label: 'Isha',    time: pt.isha,    key: 'Isha' },
  ];

  // Build a timeline progress indicator
  const currentIdx = prayers.findIndex(p => p.key === nextName);

  return (
    <div className="mt-2 mb-1 w-full">
      {/* Timeline connector line */}
      <div className="relative">
        <div className="absolute top-[10px] left-6 right-6 h-[1px] bg-gradient-to-r from-emerald-500/30 via-gold-400/20 to-emerald-500/30" />
        {currentIdx >= 0 && (
          <div
            className="absolute top-[10px] left-6 h-[2px] bg-gold-400/60 rounded-full transition-all duration-1000"
            style={{ width: `${(currentIdx / (prayers.length - 1)) * (100 - 10)}%` }}
          />
        )}
      </div>
      <div className="flex items-start justify-between px-1 relative">
        {prayers.map(p => (
          <TimeChip
            key={p.key}
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
    <div className="mt-2 max-w-md mx-auto select-none">
      <div
        className="relative bg-white/5 backdrop-blur-sm rounded-xl px-8 py-2 cursor-pointer"
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
            minHeight: '56px',
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

// Muslim Pro inspired prayer band icons
const PRAYER_ICONS = {
  Fajr:    ({ active }) => <svg viewBox="0 0 24 24" className={`w-5 h-5 ${active ? 'text-gold-400' : 'text-emerald-300/50'}`} fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3v1m0 16v1m-7.07-2.93l.7-.7m12.73 0l.7.7M3 12h1m16 0h1m-2.93-7.07l-.7.7M6.63 6.63l-.7-.7"/><path d="M17 12a5 5 0 11-10 0" strokeLinecap="round"/><line x1="4" y1="18" x2="20" y2="18" strokeLinecap="round" opacity="0.5"/></svg>,
  Sunrise: ({ active }) => <svg viewBox="0 0 24 24" className={`w-5 h-5 ${active ? 'text-gold-400' : 'text-emerald-300/50'}`} fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="14" r="4"/><path d="M12 6v2m-6.36 1.64l1.41 1.41m12.73-1.41l-1.41 1.41M4 18h16" strokeLinecap="round"/><path d="M12 2l1.5 3h-3L12 2z" fill="currentColor" stroke="none" opacity="0.7"/></svg>,
  Dhuhr:   ({ active }) => <svg viewBox="0 0 24 24" className={`w-5 h-5 ${active ? 'text-gold-400' : 'text-emerald-300/50'}`} fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="4"/><path d="M12 3v2m0 14v2m-7.07-2.93l1.41-1.41m11.31 0l1.41 1.41M3 12h2m14 0h2m-2.93-7.07l-1.41 1.41M6.34 6.34L4.93 4.93" strokeLinecap="round"/></svg>,
  Asr:     ({ active }) => <svg viewBox="0 0 24 24" className={`w-5 h-5 ${active ? 'text-gold-400' : 'text-emerald-300/50'}`} fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="4"/><path d="M12 3v2m0 14v2m7.07-2.93l-1.41-1.41m-11.31 0l-1.41 1.41M21 12h-2M5 12H3" strokeLinecap="round"/><path d="M16 16l4 4" strokeLinecap="round" opacity="0.4"/></svg>,
  Maghrib: ({ active }) => <svg viewBox="0 0 24 24" className={`w-5 h-5 ${active ? 'text-gold-400' : 'text-emerald-300/50'}`} fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 12a5 5 0 01-10 0"/><line x1="4" y1="18" x2="20" y2="18" strokeLinecap="round"/><path d="M12 14v4m-4-2h8" strokeLinecap="round" opacity="0.4"/><circle cx="7" cy="8" r="1" fill="currentColor" opacity="0.3"/><circle cx="11" cy="6" r="0.7" fill="currentColor" opacity="0.3"/></svg>,
  Isha:    ({ active }) => <svg viewBox="0 0 24 24" className={`w-5 h-5 ${active ? 'text-gold-400' : 'text-emerald-300/50'}`} fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/><circle cx="17" cy="7" r="0.7" fill="currentColor" opacity="0.5"/><circle cx="19" cy="11" r="0.5" fill="currentColor" opacity="0.3"/></svg>,
};

function TimeChip({ label, time, highlight }) {
  const IconComponent = PRAYER_ICONS[label] || PRAYER_ICONS.Dhuhr;
  return (
    <div className={`flex flex-col items-center text-center transition-all duration-300 relative flex-1 ${
      highlight ? 'scale-105' : ''
    }`}>
      {/* Active indicator dot */}
      {highlight && (
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold-400 animate-pulse" />
      )}
      <IconComponent active={highlight} />
      <span className={`text-[8px] uppercase tracking-wider font-semibold mt-0.5 ${
        highlight ? 'text-gold-400' : 'text-emerald-300/40'
      }`}>{label}</span>
      <span className={`font-bold text-[11px] tabular-nums ${
        highlight ? 'text-white' : 'text-white/70'
      }`}>{time}</span>
    </div>
  );
}
