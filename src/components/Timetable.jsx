import { useRef, useEffect, useState, useMemo } from 'react';
import { timetable, areaAdjustments } from '../data/ramadanTimetable';
import { guyanaDate } from '../utils/timezone';
import { getUserAsrMadhab, setUserAsrMadhab } from '../utils/settings';
import { ChevronLeft, ChevronRight, TableProperties, LayoutList, Copy, Check, Clock, CalendarDays } from 'lucide-react';
import PageHero from './PageHero';

function getNextPrayer(todayRow, madhab) {
  if (!todayRow) return null;
  
  const now = new Date();
  // Simple time parser assuming Georgetown time matches device time for visualizer purposes
  // (In production this should use robust timezone handling, but for visualizer it's acceptable approximation)
  const parseTime = (timeStr) => {
    if (!timeStr) return null;
    const [time, period] = timeStr.split(' ');
    let [h, m] = time.split(':').map(Number);
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
  };

  const times = [
    { name: 'Suhoor', time: parseTime(todayRow.suhoor) },
    { name: 'Sunrise', time: parseTime(todayRow.sunrise) },
    { name: 'Zuhr', time: parseTime(todayRow.zuhr) },
    { name: 'Asr', time: parseTime(madhab === 'hanafi' ? todayRow.asrH : todayRow.asrS) },
    { name: 'Iftaar', time: parseTime(todayRow.maghrib) },
    { name: 'Isha', time: parseTime(todayRow.isha) },
  ];

  const upcoming = times.find(t => t.time > now);
  return upcoming ? { ...upcoming, remainingMs: upcoming.time - now } : null;
}

function NextPrayerBanner({ row, madhab }) {
  const [next, setNext] = useState(() => getNextPrayer(row, madhab));
  
  useEffect(() => {
    const timer = setInterval(() => {
      setNext(getNextPrayer(row, madhab));
    }, 60000);
    return () => clearInterval(timer);
  }, [row, madhab]);

  if (!next) return null;

  const hours = Math.floor(next.remainingMs / 3600000);
  const mins = Math.floor((next.remainingMs % 3600000) / 60000);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 to-emerald-800 p-5 text-white shadow-lg mb-4 animate-fade-in">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10" />
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-emerald-200 text-xs font-medium uppercase tracking-wider mb-1">Next Prayer</p>
          <h3 className="text-2xl font-bold font-display">{next.name}</h3>
          <p className="text-sm text-emerald-100/80">{next.time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold tabular-nums tracking-tight">
            {hours > 0 ? `${hours}h ` : ''}{mins}m
          </p>
          <p className="text-xs text-emerald-300">remaining</p>
        </div>
      </div>
      {/* Progress Bar */}
      <div className="mt-4 h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-400 rounded-full w-full animate-pulse" /> 
      </div>
    </div>
  );
}

function DayCard({ row, isToday, asrMadhab }) {
  const isHanafi = asrMadhab === 'hanafi';
  const times = [
    { label: 'Suhoor', value: row.suhoor, highlight: 'amber' },
    { label: 'Sunrise', value: row.sunrise },
    { label: 'Zuhr', value: row.zuhr },
    { label: `Asr${isHanafi ? ' (Hanafi ★)' : ' (Shafi ★)'}`, value: isHanafi ? row.asrH : row.asrS, highlight: 'blue' },
    { label: isHanafi ? 'Asr (Shafi)' : 'Asr (Hanafi)', value: isHanafi ? row.asrS : row.asrH },
    { label: 'Iftaar', value: row.maghrib, highlight: 'emerald' },
    { label: 'Isha', value: row.isha },
  ];

  return (
    <div className={`rounded-2xl p-5 border transition-all ${
      isToday
        ? 'bg-white dark:bg-gray-800 border-emerald-500/50 shadow-lg ring-4 ring-emerald-500/10'
        : 'mc-card'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xl font-bold text-gray-900 dark:text-gray-100 font-display">Day {row.day}</span>
          {isToday && <span className="ml-2 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Today</span>}
        </div>
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{row.weekday} {row.date.slice(5)}</span>
      </div>
      <div className="space-y-2">
        {times.map(t => (
          <div key={t.label} className={`flex justify-between items-center px-3 py-2.5 rounded-xl text-sm transition-colors ${
            t.highlight === 'amber' ? 'bg-amber-50/50 dark:bg-amber-900/10' :
            t.highlight === 'emerald' ? 'bg-emerald-50/50 dark:bg-emerald-900/10' :
            t.highlight === 'blue' ? 'bg-blue-50/50 dark:bg-blue-900/10' :
            'hover:bg-gray-50 dark:hover:bg-gray-800/50'
          }`}>
            <span className={`text-xs font-medium ${t.highlight ? 'text-gray-700 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>{t.label}</span>
            <span className={`font-bold font-display ${
              t.highlight === 'amber' ? 'text-amber-600 dark:text-amber-400' :
              t.highlight === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' :
              t.highlight === 'blue' ? 'text-blue-600 dark:text-blue-400' :
              'text-gray-900 dark:text-gray-100'
            }`}>{t.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Timetable() {
  const todayStr = guyanaDate();
  const todayRef = useRef(null);
  const todayIndex = timetable.findIndex(r => r.date === todayStr);
  const [cardIndex, setCardIndex] = useState(todayIndex >= 0 ? todayIndex : 0);
  const [viewMode, setViewMode] = useState('card'); // 'card' | 'table'
  const [asrMadhab, setAsrMadhab] = useState(() => getUserAsrMadhab());
  const [copied, setCopied] = useState(false);

  const handleMadhabChange = (val) => {
    setUserAsrMadhab(val);
    setAsrMadhab(val);
  };

  useEffect(() => {
    if (viewMode === 'table') {
      todayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [viewMode]);

  const copyTodaySchedule = async () => {
    const row = timetable[todayIndex >= 0 ? todayIndex : cardIndex];
    if (!row) return;
    const message = [
      `Ramadan Day ${row.day} (${row.weekday} ${row.date.slice(5)})`,
      `Suhoor ${row.suhoor}`,
      `Sunrise ${row.sunrise}`,
      `Zuhr ${row.zuhr}`,
      `Asr (${asrMadhab === 'hanafi' ? 'Hanafi' : 'Shafi'}) ${asrMadhab === 'hanafi' ? row.asrH : row.asrS}`,
      `Iftaar ${row.maghrib}`,
      `Isha ${row.isha}`,
    ].join(' • ');

    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="min-h-screen faith-canvas pb-24 page-enter">
      <PageHero 
        title="Prayer Timetable" 
        subtitle="Georgetown / East Bank • 1447 AH" 
        icon={CalendarDays} 
        color="purple" 
        pattern="geometric" 
      />

      <div className="px-4 max-w-2xl mx-auto space-y-4">
        {/* Actions Row */}
        <div className="flex items-center justify-between gap-3 bg-white dark:bg-gray-900/50 p-2 rounded-2xl border border-gray-100 dark:border-gray-800">
          <div className="inline-flex p-1 rounded-xl bg-gray-100/50 dark:bg-gray-800 gap-1">
            <button
              onClick={() => setViewMode('card')}
              aria-label="Card view"
              className={`px-3 py-1.5 faith-tab ${viewMode === 'card' ? 'faith-tab-active shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
            >
              <LayoutList className="w-3.5 h-3.5 inline mr-1.5" />
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              aria-label="Table view"
              className={`px-3 py-1.5 faith-tab ${viewMode === 'table' ? 'faith-tab-active shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
            >
              <TableProperties className="w-3.5 h-3.5 inline mr-1.5" />
              Table
            </button>
          </div>

          <button
            onClick={copyTodaySchedule}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              copied 
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Share'}
          </button>
        </div>

        {/* Asr Settings */}
        <div className="mc-card px-4 py-3 flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Asr Calculation Method</span>
          <select
            aria-label="Asr madhab"
            value={asrMadhab}
            onChange={e => handleMadhabChange(e.target.value)}
            className="text-xs bg-gray-50 dark:bg-gray-800 border-none rounded-lg py-1.5 pl-3 pr-8 focus:ring-2 focus:ring-emerald-500 font-semibold text-gray-700 dark:text-gray-200"
          >
            <option value="shafi">Shafi (Standard)</option>
            <option value="hanafi">Hanafi</option>
          </select>
        </div>

        {viewMode === 'card' ? (
          <div>
            {/* Next Prayer Banner (Only shows if today matches displayed card) */}
            {timetable[cardIndex].date === todayStr && (
              <NextPrayerBanner row={timetable[cardIndex]} madhab={asrMadhab} />
            )}

            <DayCard row={timetable[cardIndex]} isToday={timetable[cardIndex].date === todayStr} asrMadhab={asrMadhab} />
            
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => setCardIndex(i => Math.max(0, i - 1))}
                disabled={cardIndex === 0}
                className="flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" /> Previous Day
              </button>
              <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                Day {cardIndex + 1}
              </span>
              <button
                onClick={() => setCardIndex(i => Math.min(timetable.length - 1, i + 1))}
                disabled={cardIndex === timetable.length - 1}
                className="flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
              >
                Next Day <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            {todayIndex >= 0 && cardIndex !== todayIndex && (
              <button
                onClick={() => setCardIndex(todayIndex)}
                className="w-full mt-4 py-3 rounded-xl border border-emerald-200 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 text-sm font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
              >
                Jump to Today
              </button>
            )}
          </div>
        ) : (
          <div className="mc-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                    <th className="px-3 py-3 text-left font-bold text-gray-900 dark:text-white sticky left-0 bg-gray-50 dark:bg-gray-800 z-10">Day</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-500">Date</th>
                    <th className="px-3 py-3 font-semibold text-amber-600">Suhoor</th>
                    <th className="px-3 py-3 font-semibold text-gray-500">Sunrise</th>
                    <th className="px-3 py-3 font-semibold text-gray-900 dark:text-gray-300">Zuhr</th>
                    <th className={`px-3 py-3 font-semibold ${asrMadhab === 'shafi' ? 'text-blue-600' : 'text-gray-400'}`}>Asr(S)</th>
                    <th className={`px-3 py-3 font-semibold ${asrMadhab === 'hanafi' ? 'text-blue-600' : 'text-gray-400'}`}>Asr(H)</th>
                    <th className="px-3 py-3 font-bold text-emerald-600">Iftaar</th>
                    <th className="px-3 py-3 font-semibold text-gray-900 dark:text-gray-300">Isha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {timetable.map((row) => {
                    const isToday = row.date === todayStr;
                    return (
                      <tr
                        key={row.day}
                        ref={isToday ? todayRef : null}
                        className={`transition-colors ${
                          isToday
                            ? 'bg-emerald-50/60 dark:bg-emerald-900/10'
                            : 'hover:bg-gray-50/50 dark:hover:bg-gray-800/30'
                        }`}
                      >
                        <td className={`px-3 py-3 font-medium sticky left-0 z-10 ${
                          isToday ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100'
                        }`}>
                          {row.day}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-gray-500 dark:text-gray-400">
                          {row.weekday.slice(0,3)} {row.date.slice(5)}
                        </td>
                        <td className="px-3 py-3 text-center text-amber-700 dark:text-amber-400 font-medium">{row.suhoor}</td>
                        <td className="px-3 py-3 text-center text-gray-400 dark:text-gray-600">{row.sunrise}</td>
                        <td className="px-3 py-3 text-center text-gray-700 dark:text-gray-300">{row.zuhr}</td>
                        <td className={`px-3 py-3 text-center ${asrMadhab === 'shafi' ? 'text-blue-700 dark:text-blue-400 font-bold' : 'text-gray-400 dark:text-gray-600'}`}>{row.asrS}</td>
                        <td className={`px-3 py-3 text-center ${asrMadhab === 'hanafi' ? 'text-blue-700 dark:text-blue-400 font-bold' : 'text-gray-400 dark:text-gray-600'}`}>{row.asrH}</td>
                        <td className="px-3 py-3 text-center text-emerald-700 dark:text-emerald-400 font-bold">{row.maghrib}</td>
                        <td className="px-3 py-3 text-center text-gray-700 dark:text-gray-300">{row.isha}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mc-card p-4">
          <h3 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider mb-3">Area Adjustments</h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            {areaAdjustments.map(a => (
              <div key={a.area} className="flex justify-between text-xs py-1 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <span className="text-gray-600 dark:text-gray-400">{a.area}</span>
                <span className={`font-mono font-medium ${
                  a.minutes > 0 ? 'text-blue-600' : a.minutes < 0 ? 'text-red-600' : 'text-gray-400'
                }`}>
                  {a.minutes > 0 ? `+${a.minutes}` : a.minutes} m
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center py-4">
          <p className="text-[10px] font-medium text-gray-400 dark:text-gray-600 uppercase tracking-widest">
            Source: Guyana Islamic Trust (GIT)
          </p>
        </div>
      </div>
    </div>
  );
}
