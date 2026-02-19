import { Clock, Users, MapPin, AlertCircle } from 'lucide-react';
import { masjids } from '../data/masjids';
import { getTodayTimetable, getRamadanDay } from '../data/ramadanTimetable';

export default function TonightIftaar({ submissions, loading }) {
  const today = getTodayTimetable();
  const ramadan = getRamadanDay();

  const getTimeAgo = (isoStr) => {
    const diff = Date.now() - new Date(isoStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ago`;
  };

  const getMasjid = (id) => masjids.find(m => m.id === id);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="px-4 py-5 max-w-lg mx-auto">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-emerald-900 font-amiri">
            Tonight's Iftaar
          </h2>
          <p className="text-xs text-gray-500">
            {ramadan.isRamadan ? `Day ${ramadan.day} • ` : ''}Iftaar at {today?.maghrib || '6:08'} PM
          </p>
        </div>
        <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full">
          {submissions.length} update{submissions.length !== 1 ? 's' : ''}
        </span>
      </div>

      {submissions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-emerald-200">
          <UtensilsCrossed className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No updates yet tonight</p>
          <p className="text-gray-400 text-sm mt-1">Be the first to share what your masjid is serving!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((s, i) => {
            const masjid = getMasjid(s.masjidId);
            return (
              <div
                key={s.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-50 card-hover animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Masjid name */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-emerald-900 text-sm">
                      🕌 {masjid?.name || s.masjidId}
                    </h3>
                    {masjid?.address && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />{masjid.address}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 flex items-center gap-1 whitespace-nowrap">
                    <Clock className="w-3 h-3" />{getTimeAgo(s.submittedAt)}
                  </span>
                </div>

                {/* Menu */}
                <div className="bg-warm-50 rounded-xl p-3 mb-2">
                  <p className="text-sm text-gray-800 leading-relaxed">
                    🍽️ {s.menu}
                  </p>
                </div>

                {/* Meta row */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Shared by <strong className="text-emerald-700">{s.submittedBy}</strong></span>
                  {s.servings && (
                    <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                      <Users className="w-3 h-3" />{s.servings} servings
                    </span>
                  )}
                </div>

                {/* Notes */}
                {s.notes && (
                  <p className="mt-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-1.5 flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    {s.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function UtensilsCrossed(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8"/><path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c1.7 1.7 4.3 1.7 6 0"/><path d="m2 22 5.5-1.5L21.17 6.83a2.82 2.82 0 0 0-4-4L3.5 16.5Z"/><path d="m18 16 4 4"/><path d="m17 21 1-3"/>
    </svg>
  );
}
