import { useState, useEffect } from 'react';
import { Clock, Users, MapPin, AlertCircle, Heart, UserCheck, Navigation } from 'lucide-react';
import { masjids } from '../data/masjids';
import { getTodayTimetable, getRamadanDay } from '../data/ramadanTimetable';
import ShareMenu from './ShareMenu';
import SkeletonCard from './SkeletonCard';
import { useToast } from '../contexts/ToastContext';

export default function TonightIftaar({ submissions, loading }) {
  const today = getTodayTimetable();
  const ramadan = getRamadanDay();
  const { addToast } = useToast();
  const [likes, setLikes] = useState(() => JSON.parse(localStorage.getItem('iftaar_likes') || '{}'));
  const [attending, setAttending] = useState(() => JSON.parse(localStorage.getItem('iftaar_attending') || '{}'));
  const [sortBy, setSortBy] = useState('time'); // time | popular | attending

  const toggleLike = (id) => {
    setLikes(prev => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem('iftaar_likes', JSON.stringify(next));
      if (next[id]) addToast('JazakAllah Khair! 🤲');
      return next;
    });
  };

  const toggleAttending = (id) => {
    setAttending(prev => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem('iftaar_attending', JSON.stringify(next));
      if (next[id]) addToast("See you there, In sha Allah! 🕌");
      return next;
    });
  };

  const getTimeAgo = (isoStr) => {
    const diff = Date.now() - new Date(isoStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  // Live-update time ago
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const getMasjid = (id) => masjids.find(m => m.id === id);

  const sorted = [...submissions].sort((a, b) => {
    if (sortBy === 'popular') return ((b.likes || 0) + (likes[b.id] ? 1 : 0)) - ((a.likes || 0) + (likes[a.id] ? 1 : 0));
    if (sortBy === 'attending') return ((b.attending || 0) + (attending[b.id] ? 1 : 0)) - ((a.attending || 0) + (attending[a.id] ? 1 : 0));
    return new Date(b.submittedAt) - new Date(a.submittedAt);
  });

  if (loading) {
    return (
      <div className="px-4 py-5 max-w-lg mx-auto">
        <SkeletonCard count={3} />
      </div>
    );
  }

  return (
    <div className="px-4 py-5 max-w-lg mx-auto">
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-bold text-emerald-900 dark:text-emerald-100 font-amiri">
            Iftaar Reports
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {ramadan.isRamadan ? `Day ${ramadan.day} • ` : ''}Iftaar at {today?.maghrib || '6:08'} PM
          </p>
        </div>
        <span className="bg-emerald-50 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold px-2.5 py-1 rounded-full">
          {submissions.length} update{submissions.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Sort buttons */}
      {submissions.length > 1 && (
        <div className="flex gap-1.5 mb-3 overflow-x-auto scrollbar-hide">
          {[
            { key: 'time', label: '🕐 Recent' },
            { key: 'popular', label: '❤️ Popular' },
            { key: 'attending', label: '👥 Most Attending' },
          ].map(s => (
            <button
              key={s.key}
              onClick={() => setSortBy(s.key)}
              className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-all ${
                sortBy === s.key
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-700'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {submissions.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-emerald-200 dark:border-emerald-800">
          <div className="text-5xl mb-3">🍽️</div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">No updates yet tonight</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Be the first to share what your masjid is serving!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((s, i) => {
            const masjid = getMasjid(s.masjidId);
            const likeCount = (s.likes || 0) + (likes[s.id] ? 1 : 0);
            const attendCount = (s.attending || 0) + (attending[s.id] ? 1 : 0);

            return (
              <div
                key={s.id}
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-emerald-50 dark:border-gray-700 card-hover animate-fade-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {/* Header row */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-emerald-900 dark:text-emerald-100 text-sm truncate">
                      🕌 {masjid?.name || s.masjidId}
                    </h3>
                    {masjid?.address && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 shrink-0" /><span className="truncate">{masjid.address}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-2 shrink-0">
                    <ShareMenu masjidName={masjid?.name || s.masjidId} menu={s.menu} maghrib={today?.maghrib} />
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-0.5">
                      <Clock className="w-3 h-3" />{getTimeAgo(s.submittedAt)}
                    </span>
                  </div>
                </div>

                {/* Menu */}
                <div className="bg-warm-50 dark:bg-gray-700/50 rounded-xl p-3 mb-2">
                  <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                    🍽️ {s.menu}
                  </p>
                </div>

                {/* Meta row */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                  <span>by <strong className="text-emerald-700 dark:text-emerald-400">{s.submittedBy}</strong></span>
                  {s.servings && (
                    <span className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                      <Users className="w-3 h-3" />{s.servings} servings
                    </span>
                  )}
                </div>

                {/* Notes */}
                {s.notes && (
                  <p className="mb-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-1.5 flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    {s.notes}
                  </p>
                )}

                {/* Action buttons */}
                <div className="flex items-center gap-2 pt-1 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() => toggleLike(s.id)}
                    aria-label={likes[s.id] ? `Unlike ${masjid?.name || 'this submission'}` : `Like ${masjid?.name || 'this submission'}`}
                    aria-pressed={!!likes[s.id]}
                    className={`flex items-center gap-1.5 min-h-[44px] px-3 rounded-full text-xs transition-all ${
                      likes[s.id]
                        ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold border border-red-200 dark:border-red-800'
                        : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${likes[s.id] ? 'fill-current' : ''}`} />
                    <span>{likes[s.id] ? 'Liked!' : 'Like'}</span>
                    {likeCount > 0 && <span className="ml-0.5 text-[10px] opacity-70">{likeCount}</span>}
                  </button>

                  <button
                    onClick={() => toggleAttending(s.id)}
                    aria-label={attending[s.id] ? `Cancel attendance at ${masjid?.name || 'this masjid'}` : `Mark attending ${masjid?.name || 'this masjid'}`}
                    aria-pressed={!!attending[s.id]}
                    className={`flex items-center gap-1.5 min-h-[44px] px-3 rounded-full text-xs transition-all ${
                      attending[s.id]
                        ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-emerald-700'
                        : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    <UserCheck className={`w-3.5 h-3.5 ${attending[s.id] ? 'fill-current' : ''}`} />
                    <span>{attending[s.id] ? 'Going ✓' : "I'm Going"}</span>
                    {attendCount > 0 && <span className="ml-0.5 text-[10px] opacity-70">{attendCount}</span>}
                  </button>

                  {masjid && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${masjid.lat},${masjid.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all ml-auto"
                    >
                      <Navigation className="w-3.5 h-3.5" /> Directions
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
