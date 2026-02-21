import { useRef, useEffect, useState } from 'react';
import { timetable, areaAdjustments } from '../data/ramadanTimetable';
import { guyanaDate } from '../utils/timezone';
import { getUserAsrMadhab, setUserAsrMadhab } from '../utils/settings';
import { ChevronLeft, ChevronRight, TableProperties, LayoutList, Copy, Check } from 'lucide-react';

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
    <div className={`rounded-2xl p-4 border faith-section ${
      isToday
        ? 'border-emerald-300 dark:border-emerald-700 ring-2 ring-emerald-200/70 dark:ring-emerald-700/35'
        : 'border-emerald-100/70 dark:border-gray-700'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-lg font-bold text-emerald-900 dark:text-emerald-100">Day {row.day}</span>
          {isToday && <span className="ml-2 text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-full">Today</span>}
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">{row.weekday} {row.date.slice(5)}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {times.map(t => (
          <div key={t.label} className={`flex justify-between items-center px-3 py-2 rounded-xl text-sm ${
            t.highlight === 'amber' ? 'bg-amber-50 dark:bg-amber-900/20' :
            t.highlight === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/20' :
            t.highlight === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20' :
            'bg-gray-50 dark:bg-gray-700/30'
          }`}>
            <span className="text-gray-600 dark:text-gray-400 text-xs">{t.label}</span>
            <span className={`font-bold text-xs ${
              t.highlight === 'amber' ? 'text-amber-700 dark:text-amber-400' :
              t.highlight === 'emerald' ? 'text-emerald-700 dark:text-emerald-400' :
              t.highlight === 'blue' ? 'text-blue-700 dark:text-blue-400' :
              'text-gray-800 dark:text-gray-200'
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
      <div className="px-4 py-6 max-w-2xl mx-auto space-y-4">
        <section className="faith-hero px-4 py-4">
          <div className="relative z-[1]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-emerald-900 dark:text-emerald-100 font-display">Prayer Timetable</h2>
                <p className="text-xs text-emerald-700/90 dark:text-emerald-300 mt-1">
                  Georgetown / East Bank Demerara • Ramadan 1447 AH
                </p>
              </div>
              <button
                onClick={copyTodaySchedule}
                className="faith-chip px-2.5 py-1 text-[11px] inline-flex items-center gap-1"
                aria-label="Copy today's prayer schedule"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Share Today'}
              </button>
            </div>
            <div className="mt-3 inline-flex p-1 rounded-xl bg-white/70 dark:bg-gray-900/60 border border-emerald-100 dark:border-gray-700 gap-1">
              <button
                onClick={() => setViewMode('card')}
                aria-label="Card view"
                className={`px-3 py-1.5 faith-tab ${viewMode === 'card' ? 'faith-tab-active' : 'text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'}`}
              >
                <LayoutList className="w-3.5 h-3.5 inline mr-1" />
                Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                aria-label="Table view"
                className={`px-3 py-1.5 faith-tab ${viewMode === 'table' ? 'faith-tab-active' : 'text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'}`}
              >
                <TableProperties className="w-3.5 h-3.5 inline mr-1" />
                Table
              </button>
            </div>
          </div>
        </section>

        <section className="faith-section px-3 py-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-800 dark:text-blue-300 font-medium flex-1">Asr time method</span>
            <select
              aria-label="Asr madhab"
              value={asrMadhab}
              onChange={e => handleMadhabChange(e.target.value)}
              className="text-xs mc-input !w-auto py-1.5 px-2.5"
            >
              <option value="shafi">Shafi / Maliki / Hanbali</option>
              <option value="hanafi">Hanafi</option>
            </select>
          </div>
        </section>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          Source: Guyana Islamic Trust (GIT)
        </p>

        {viewMode === 'card' ? (
          <div>
            <DayCard row={timetable[cardIndex]} isToday={timetable[cardIndex].date === todayStr} asrMadhab={asrMadhab} />
            <div className="flex items-center justify-between mt-3">
              <button
                onClick={() => setCardIndex(i => Math.max(0, i - 1))}
                disabled={cardIndex === 0}
                aria-label="Previous day"
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium disabled:opacity-30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {cardIndex + 1} / {timetable.length}
              </span>
              <button
                onClick={() => setCardIndex(i => Math.min(timetable.length - 1, i + 1))}
                disabled={cardIndex === timetable.length - 1}
                aria-label="Next day"
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium disabled:opacity-30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            {todayIndex >= 0 && cardIndex !== todayIndex && (
              <button
                onClick={() => setCardIndex(todayIndex)}
                className="w-full mt-2 text-center text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Jump to today (Day {todayIndex + 1})
              </button>
            )}
          </div>
        ) : (
          <div className="worship-surface overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-emerald-800 text-white">
                    <th className="px-2 py-2.5 text-left font-semibold sticky left-0 bg-emerald-800 z-10">Day</th>
                    <th className="px-2 py-2.5 text-left font-semibold">Date</th>
                    <th className="px-2 py-2.5 font-semibold text-amber-300">Suhoor</th>
                    <th className="px-2 py-2.5 font-semibold">Sunrise</th>
                    <th className="px-2 py-2.5 font-semibold">Zuhr</th>
                    <th className={`px-2 py-2.5 font-semibold ${asrMadhab === 'shafi' ? 'text-blue-300' : ''}`}>Asr(S){asrMadhab === 'shafi' ? ' ★' : ''}</th>
                    <th className={`px-2 py-2.5 font-semibold ${asrMadhab === 'hanafi' ? 'text-blue-300' : ''}`}>Asr(H){asrMadhab === 'hanafi' ? ' ★' : ''}</th>
                    <th className="px-2 py-2.5 font-semibold text-gold-400">Iftaar</th>
                    <th className="px-2 py-2.5 font-semibold">Isha</th>
                  </tr>
                </thead>
                <tbody>
                  {timetable.map((row) => {
                    const isToday = row.date === todayStr;
                    return (
                      <tr
                        key={row.day}
                        ref={isToday ? todayRef : null}
                        className={`border-t border-emerald-50 dark:border-gray-700 transition-colors ${
                          isToday
                            ? 'bg-emerald-50 dark:bg-emerald-900/40 font-bold'
                            : row.day % 2 === 0
                            ? 'bg-gray-50/50 dark:bg-gray-800/50'
                            : 'dark:bg-gray-800'
                        }`}
                      >
                        <td className={`px-2 py-2 sticky left-0 z-10 ${
                          isToday ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                          : row.day % 2 === 0 ? 'bg-gray-50/50 dark:bg-gray-800/50'
                          : 'bg-white dark:bg-gray-800'
                        }`}>
                          {isToday && <span className="text-emerald-600">▶ </span>}{row.day}
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap dark:text-gray-300">
                          {row.weekday} {row.date.slice(5)}
                        </td>
                        <td className="px-2 py-2 text-center text-amber-700 dark:text-amber-400 font-semibold">{row.suhoor}</td>
                        <td className="px-2 py-2 text-center text-gray-500 dark:text-gray-400">{row.sunrise}</td>
                        <td className="px-2 py-2 text-center dark:text-gray-300">{row.zuhr}</td>
                        <td className={`px-2 py-2 text-center ${asrMadhab === 'shafi' ? 'text-blue-700 dark:text-blue-400 font-bold' : 'text-gray-400 dark:text-gray-500'}`}>{row.asrS}</td>
                        <td className={`px-2 py-2 text-center ${asrMadhab === 'hanafi' ? 'text-blue-700 dark:text-blue-400 font-bold' : 'text-gray-400 dark:text-gray-500'}`}>{row.asrH}</td>
                        <td className="px-2 py-2 text-center text-emerald-700 dark:text-emerald-400 font-bold">{row.maghrib}</td>
                        <td className="px-2 py-2 text-center dark:text-gray-300">{row.isha}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="faith-section p-4">
          <h3 className="font-bold text-amber-900 dark:text-amber-300 text-sm mb-2">Area Time Adjustments</h3>
          <div className="space-y-1.5">
            {areaAdjustments.map(a => (
              <div key={a.area} className="flex justify-between text-xs">
                <span className={`text-gray-700 dark:text-gray-300 ${a.minutes === 0 ? 'font-bold text-emerald-800 dark:text-emerald-400' : ''}`}>
                  {a.area}
                </span>
                <span className={`font-mono font-bold ${
                  a.minutes === 0 ? 'text-emerald-700 dark:text-emerald-400' :
                  a.minutes > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {a.minutes === 0 ? '—' : a.minutes > 0 ? `+${a.minutes} min` : `${a.minutes} min`}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center text-xs text-gray-400 dark:text-gray-500">
          <p className="font-semibold text-gray-500 dark:text-gray-400">Guyana Islamic Trust (GIT)</p>
          <p>N ½ Lot 321, East Street, N/Cummingsburg, Georgetown</p>
          <p>📞 227-0115 / 225-5934 • ✉️ gits@guyana.net.gy</p>
        </div>
      </div>
    </div>
  );
}
