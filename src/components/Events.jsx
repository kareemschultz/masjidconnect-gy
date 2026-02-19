import { useState, useMemo, lazy, Suspense } from 'react';
import { Calendar, MapPin, Clock, ChevronDown, ChevronUp, Plus } from 'lucide-react';

const EventSubmitForm = lazy(() => import('./EventSubmitForm'));

// ── Static community events data ──────────────────────────────────────────────
// This will be replaced with Firestore data once the backend is set up
const EVENTS = [
  {
    id: 1,
    title: 'Jumah Prayer',
    type: 'salah',
    masjid: 'CIOG Central Masjid',
    address: 'Woolford Avenue, Thomas Lands, Georgetown',
    date: '2026-02-20',
    time: '12:30',
    recurring: 'weekly',
    description: 'Weekly Friday Jumah. Khutbah begins 12:15.',
    contact: null,
  },
  {
    id: 2,
    title: 'Taraweeh Prayers — Ramadan 1447',
    type: 'ramadan',
    masjid: 'GIT Queenstown Masjid',
    address: '295 Church Street, Queenstown',
    date: '2026-02-19',
    endDate: '2026-03-20',
    time: '20:15',
    recurring: 'nightly',
    description: '20 rak\'ah Taraweeh every night of Ramadan. Doors open after Isha.',
    contact: null,
  },
  {
    id: 3,
    title: 'Laylatul Qadr Program',
    type: 'ramadan',
    masjid: 'GIT Queenstown Masjid',
    address: '295 Church Street, Queenstown',
    date: '2026-03-15',
    time: '22:00',
    description: 'Special program for the last 10 nights. Qiyam, lectures, and dua. Open to all.',
    contact: null,
  },
  {
    id: 4,
    title: 'Eid ul-Fitr Prayers',
    type: 'eid',
    masjid: 'Various Masjids',
    address: 'Georgetown & surrounds',
    date: '2026-03-21',
    time: '07:00',
    description: 'Eid ul-Fitr prayers across all masjids. Check your local masjid for exact time.',
    contact: null,
  },
  {
    id: 5,
    title: 'Islamic Education Classes',
    type: 'education',
    masjid: 'CIOG Central Masjid',
    address: 'Woolford Avenue, Thomas Lands',
    date: '2026-02-22',
    time: '09:00',
    recurring: 'weekly',
    description: 'Weekly Islamic studies for children and adults. Qur\'an, Fiqh, and Islamic History.',
    contact: null,
  },
  {
    id: 6,
    title: 'Taraweeh Prayers — Ramadan 1447',
    type: 'ramadan',
    masjid: 'Kitty Masjid',
    address: 'Kitty, Georgetown',
    date: '2026-02-19',
    endDate: '2026-03-20',
    time: '20:15',
    recurring: 'nightly',
    description: 'Nightly Taraweeh prayers throughout Ramadan at Kitty Masjid. All are welcome.',
    contact: null,
  },
];

const EVENT_TYPES = [
  { id: 'all', label: 'All' },
  { id: 'ramadan', label: '🌙 Ramadan' },
  { id: 'salah', label: '🕐 Salah' },
  { id: 'eid', label: '🎉 Eid' },
  { id: 'education', label: '📚 Education' },
  { id: 'lecture', label: '🎤 Lecture' },
  { id: 'community', label: '🤝 Community' },
];

const TYPE_COLORS = {
  ramadan: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  salah: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  eid: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  education: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  lecture: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  community: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
};

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-GY', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTime(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function isUpcoming(event) {
  const today = new Date().toISOString().slice(0, 10);
  return (event.endDate || event.date) >= today;
}

function EventCard({ event }) {
  const [expanded, setExpanded] = useState(false);
  const typeColor = TYPE_COLORS[event.type] || 'bg-gray-100 text-gray-600';

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
      <button
        className="w-full text-left p-4"
        onClick={() => setExpanded(e => !e)}
        aria-expanded={expanded}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${typeColor}`}>
                {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                {event.recurring && ` · ${event.recurring}`}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-tight">
              {event.title}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
              {event.masjid}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
              {formatDate(event.date)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatTime(event.time)}
            </p>
            {expanded
              ? <ChevronUp className="w-3.5 h-3.5 text-gray-400 ml-auto mt-1" />
              : <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-auto mt-1" />}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-50 dark:border-gray-800 pt-3 space-y-2">
          {event.description && (
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              {event.description}
            </p>
          )}
          <div className="flex items-start gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-500" />
            <span>{event.address}</span>
          </div>
          {event.endDate && event.endDate !== event.date && (
            <div className="flex items-start gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-500" />
              <span>Until {formatDate(event.endDate)}</span>
            </div>
          )}
          {event.contact && (
            <a
              href={`tel:${event.contact}`}
              className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium"
            >
              📞 {event.contact}
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default function Events() {
  const [filter, setFilter] = useState('all');
  const [showPast, setShowPast] = useState(false);
  const [showSubmitForm, setShowSubmitForm] = useState(false);

  const filtered = useMemo(() => {
    return EVENTS.filter(e => {
      const matchType = filter === 'all' || e.type === filter;
      const matchTime = showPast ? true : isUpcoming(e);
      return matchType && matchTime;
    }).sort((a, b) => a.date.localeCompare(b.date));
  }, [filter, showPast]);

  return (
    <div className="px-4 py-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-bold text-emerald-900 dark:text-emerald-100 font-amiri">
          Community Events
        </h2>
        <button
          onClick={() => setShowPast(p => !p)}
          className="text-xs text-gray-500 dark:text-gray-400 hover:text-emerald-600 transition-colors"
        >
          {showPast ? 'Hide past' : 'Show past'}
        </button>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        Upcoming programs & events for the Muslim community in Guyana
      </p>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide -mx-1 px-1">
        {EVENT_TYPES.map(t => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === t.id
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Events list */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-3xl mb-3">📅</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">No events found</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Check back soon or suggest an event</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(event => <EventCard key={event.id} event={event} />)}
        </div>
      )}

      {/* Submit event CTA */}
      <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-center border border-emerald-100 dark:border-emerald-800">
        <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 mb-1">
          Know of an upcoming event?
        </p>
        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mb-3">
          Help the community by submitting programs, lectures, and masjid events.
        </p>
        <button
          onClick={() => setShowSubmitForm(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" /> Submit an Event
        </button>
      </div>

      {showSubmitForm && (
        <Suspense fallback={null}>
          <EventSubmitForm onClose={() => setShowSubmitForm(false)} />
        </Suspense>
      )}
    </div>
  );
}
