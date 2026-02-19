import { useState, useEffect } from 'react';
import { Moon, Sun, MapPin, Clock } from 'lucide-react';
import { getTodayTimetable, getRamadanDay, getSecondsUntilIftaar, getSecondsUntilSuhoor, RAMADAN_YEAR_HIJRI } from '../data/ramadanTimetable';
import { getTodayReminder } from '../data/dailyReminders';
import { useDarkMode } from '../contexts/DarkModeContext';
import { guyanaRawTimeToMs, guyanaDate } from '../utils/timezone';
import { getUserAsrMadhab } from '../utils/settings';
import UserMenu from './UserMenu';

function getNextPrayer(entry) {
  if (!entry) return null;
  const asrKey = getUserAsrMadhab() === 'hanafi' ? 'asrH' : 'asrS';
  const prayers = [
    { name: 'Fajr',    key: 'suhoor',  pm: false },
    { name: 'Zuhr',    key: 'zuhr',    pm: true  },
    { name: 'Asr',     key: asrKey,    pm: true  },
    { name: 'Maghrib', key: 'maghrib', pm: true  },
    { name: 'Isha',    key: 'isha',    pm: true  },
  ];
  const now = Date.now();
  for (const p of prayers) {
    const [h, m] = entry[p.key].split(':').map(Number);
    const h24 = p.pm ? (h < 12 ? h + 12 : h) : h;
    const ms = guyanaRawTimeToMs(h24, m);
    if (ms > now) return { name: p.name, display: entry[p.key] + (p.pm ? ' PM' : ' AM'), ms };
  }
  return null; // all prayers passed today
}

export default function Header() {
  const ramadan = getRamadanDay();
  const today = getTodayTimetable();
  const reminder = getTodayReminder();
  const { dark, toggle } = useDarkMode();
  const [countdown, setCountdown] = useState('');
  const [countdownLabel, setCountdownLabel] = useState('');
  const [guyanaTime, setGuyanaTime] = useState('');
  const [nextPrayer, setNextPrayer] = useState(null);

  useEffect(() => {
    const tick = () => {
      const suhoorSecs = getSecondsUntilSuhoor();
      const iftaarSecs = getSecondsUntilIftaar();

      // Before suhoor — show suhoor countdown
      if (suhoorSecs !== null && suhoorSecs > 0) {
        setCountdownLabel('Suhoor ends in');
        setCountdown(formatCountdown(suhoorSecs));
      } else if (iftaarSecs !== null && iftaarSecs > 0) {
        // After suhoor, before iftaar — show iftaar countdown
        setCountdownLabel('Iftaar in');
        setCountdown(formatCountdown(iftaarSecs));
      } else if (iftaarSecs !== null && iftaarSecs <= 0) {
        setCountdownLabel('');
        setCountdown('Iftaar Time! 🎉');
      } else {
        setCountdown('');
      }

      // Live Guyana clock
      setGuyanaTime(new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Guyana',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(new Date()));

      // Next salah
      setNextPrayer(getNextPrayer(today));
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [today]);

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

      {/* Top-right controls: dark mode + user menu */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <UserMenu />
        <button
          onClick={toggle}
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {dark ? <Sun className="w-5 h-5 text-gold-400" aria-hidden="true" /> : <Moon className="w-5 h-5 text-gold-400" aria-hidden="true" />}
        </button>
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
            <Moon className="w-6 h-6 text-gold-400 lantern-glow crescent-spin" />
            <h1 className="text-2xl md:text-3xl font-bold font-cinzel tracking-wide">
              MasjidConnect GY
            </h1>
            <Moon className="w-6 h-6 text-gold-400 lantern-glow crescent-spin" style={{ transform: 'scaleX(-1)' }} />
          </div>
          <p className="text-emerald-300/80 text-xs mb-1">Connecting You to Every Masjid in Guyana</p>
          {/* Live info bar: time + date + next salah */}
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
        </div>

        {/* Countdown Timer */}
        {countdown && ramadan.isRamadan && (
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

        {/* Today's Key Times */}
        {today && (
          <div className="flex justify-center items-center gap-2 md:gap-4 flex-wrap">
            <TimeChip icon="🌅" label="Suhoor" time={today.suhoor} />
            <TimeChip icon="🌇" label="Iftaar" time={today.maghrib} highlight />
            <TimeChip icon="🌙" label="Isha" time={today.isha} />
          </div>
        )}

        {/* Daily Reminder */}
        {reminder && ramadan.isRamadan && (
          <div className="mt-3 bg-white/5 backdrop-blur-sm rounded-xl px-4 py-2.5 max-w-md mx-auto">
            <p className="text-emerald-100 text-xs italic leading-relaxed">
              "{reminder.text}"
            </p>
            <p className="text-emerald-400/70 text-[10px] mt-1 text-right">
              — {reminder.source}
            </p>
          </div>
        )}
      </div>
    </header>
  );
}

function formatCountdown(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = n => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
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
