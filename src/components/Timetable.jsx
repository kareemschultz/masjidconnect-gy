import { timetable, areaAdjustments, getRamadanDay } from '../data/ramadanTimetable';

export default function Timetable() {
  const ramadan = getRamadanDay();
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="px-4 py-5 max-w-lg mx-auto">
      <h2 className="text-lg font-bold text-emerald-900 font-amiri mb-1">
        Ramadan 1447 AH Timetable
      </h2>
      <p className="text-xs text-gray-500 mb-4">
        Source: Guyana Islamic Trust (GIT) • Georgetown / East Bank Demerara
      </p>

      {/* Scrollable table */}
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-emerald-800 text-white">
                <th className="px-2 py-2.5 text-left font-semibold sticky left-0 bg-emerald-800 z-10">Day</th>
                <th className="px-2 py-2.5 text-left font-semibold">Date</th>
                <th className="px-2 py-2.5 font-semibold text-amber-300">Suhoor</th>
                <th className="px-2 py-2.5 font-semibold">Sunrise</th>
                <th className="px-2 py-2.5 font-semibold">Zuhr</th>
                <th className="px-2 py-2.5 font-semibold">Asr(S)</th>
                <th className="px-2 py-2.5 font-semibold">Asr(H)</th>
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
                    className={`border-t border-emerald-50 ${
                      isToday
                        ? 'bg-emerald-50 font-bold'
                        : row.day % 2 === 0
                        ? 'bg-gray-50/50'
                        : ''
                    }`}
                  >
                    <td className={`px-2 py-2 sticky left-0 z-10 ${isToday ? 'bg-emerald-50 text-emerald-800' : row.day % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}`}>
                      {isToday && '▶ '}{row.day}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      {row.weekday} {row.date.slice(5)}
                    </td>
                    <td className="px-2 py-2 text-center text-amber-700 font-semibold">{row.suhoor}</td>
                    <td className="px-2 py-2 text-center text-gray-500">{row.sunrise}</td>
                    <td className="px-2 py-2 text-center">{row.zuhr}</td>
                    <td className="px-2 py-2 text-center">{row.asrS}</td>
                    <td className="px-2 py-2 text-center">{row.asrH}</td>
                    <td className="px-2 py-2 text-center text-emerald-700 font-bold">{row.maghrib}</td>
                    <td className="px-2 py-2 text-center">{row.isha}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Area adjustments */}
      <div className="mt-4 bg-amber-50 rounded-2xl p-4 border border-amber-100">
        <h3 className="font-bold text-amber-900 text-sm mb-2">📍 Area Time Adjustments</h3>
        <div className="space-y-1">
          {areaAdjustments.map(a => (
            <div key={a.area} className="flex justify-between text-xs">
              <span className={`text-gray-700 ${a.minutes === 0 ? 'font-bold text-emerald-800' : ''}`}>
                {a.area}
              </span>
              <span className={`font-mono font-bold ${
                a.minutes === 0 ? 'text-emerald-700' :
                a.minutes > 0 ? 'text-blue-600' : 'text-red-600'
              }`}>
                {a.minutes === 0 ? '—' : a.minutes > 0 ? `+${a.minutes} min` : `${a.minutes} min`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* GIT credit */}
      <div className="mt-4 text-center text-xs text-gray-400">
        <p className="font-semibold text-gray-500">Guyana Islamic Trust (GIT)</p>
        <p>N ½ Lot 321, East Street, N/Cummingsburg, Georgetown</p>
        <p>📞 227-0115 / 225-5934 • ✉️ gits@guyana.net.gy</p>
      </div>
    </div>
  );
}
