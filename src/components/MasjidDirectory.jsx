import { useState, useEffect, useMemo } from 'react';
import { MapPin, Phone, ExternalLink, Search, SlidersHorizontal, Navigation as NavIcon, Clock, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { masjids, featureLabels } from '../data/masjids';
import { useToast } from '../contexts/ToastContext';

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const SALAH_NAMES = ['Fajr', 'Zuhr', 'Asr', 'Maghrib', 'Isha', 'Taraweeh', "Jumu'ah"];

function getSalahTimes(masjidId) {
  try {
    const data = JSON.parse(localStorage.getItem('salah_times') || '{}');
    return data[masjidId] || null;
  } catch { return null; }
}

function saveSalahTimes(masjidId, times, reportedBy) {
  try {
    const data = JSON.parse(localStorage.getItem('salah_times') || '{}');
    data[masjidId] = { times, reportedBy, reportedAt: new Date().toISOString() };
    localStorage.setItem('salah_times', JSON.stringify(data));
  } catch {}
}

function SalahTimesSection({ masjidId }) {
  const [expanded, setExpanded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saved, setSaved] = useState(() => getSalahTimes(masjidId));
  const [form, setForm] = useState({ Fajr: '', Zuhr: '', Asr: '', Maghrib: '', Isha: '', Taraweeh: '', "Jumu'ah": '', reportedBy: '' });
  const { addToast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    const times = {};
    SALAH_NAMES.forEach(name => { if (form[name]) times[name] = form[name]; });
    if (Object.keys(times).length === 0) return;
    saveSalahTimes(masjidId, times, form.reportedBy || 'Anonymous');
    setSaved({ times, reportedBy: form.reportedBy || 'Anonymous', reportedAt: new Date().toISOString() });
    setShowForm(false);
    addToast('Salah times updated! JazakAllah Khair');
  };

  return (
    <div className="mt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
      >
        <Clock className="w-3 h-3" />
        Salah Times
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {expanded && (
        <div className="mt-2 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl p-3">
          {saved ? (
            <div>
              <div className="grid grid-cols-2 gap-1.5">
                {SALAH_NAMES.map(name => saved.times[name] && (
                  <div key={name} className="flex justify-between text-xs bg-white dark:bg-gray-800 rounded-lg px-2 py-1.5">
                    <span className="text-gray-500 dark:text-gray-400">{name}</span>
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">{saved.times[name]}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2">
                Reported by {saved.reportedBy} • {new Date(saved.reportedAt).toLocaleDateString()}
              </p>
              <button
                onClick={() => { setShowForm(true); setForm({ Fajr: '', Zuhr: '', Asr: '', Maghrib: '', Isha: '', Taraweeh: '', "Jumu'ah": '', reportedBy: '' }); }}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline mt-1"
              >
                Update times
              </button>
            </div>
          ) : (
            !showForm && (
              <div className="text-center">
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">No salah times reported yet</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  Report Salah Times
                </button>
              </div>
            )
          )}

          {showForm && (
            <form onSubmit={handleSubmit} className="mt-2 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {SALAH_NAMES.map(name => (
                  <div key={name}>
                    <label htmlFor={`salah-${masjidId}-${name}`} className="text-[10px] text-gray-500 dark:text-gray-400">{name}</label>
                    <input
                      id={`salah-${masjidId}-${name}`}
                      type="text"
                      placeholder="e.g. 5:15 AM"
                      value={form[name]}
                      onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
                      className="w-full border border-emerald-200 dark:border-gray-600 rounded-lg px-2 py-1 text-xs bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                ))}
              </div>
              <input
                type="text"
                placeholder="Your name (optional)"
                value={form.reportedBy}
                onChange={e => setForm(f => ({ ...f, reportedBy: e.target.value }))}
                className="w-full border border-emerald-200 dark:border-gray-600 rounded-lg px-2 py-1 text-xs bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <div className="flex gap-2">
                <button type="submit" className="flex items-center gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition-colors">
                  <Send className="w-3 h-3" /> Save
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export default function MasjidDirectory({ submissions }) {
  const [search, setSearch] = useState('');
  const [filterFeature, setFilterFeature] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [userLoc, setUserLoc] = useState(null);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      pos => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: false, timeout: 5000 }
    );
  }, []);

  const getLatestSubmission = (masjidId) =>
    submissions.find(s => s.masjidId === masjidId);

  const filtered = useMemo(() => {
    let list = masjids.filter(m => {
      const q = search.toLowerCase();
      const matchSearch = !q || m.name.toLowerCase().includes(q) || m.address.toLowerCase().includes(q);
      const matchFeature = !filterFeature || m.features.includes(filterFeature);
      return matchSearch && matchFeature;
    });

    if (sortBy === 'distance' && userLoc) {
      list = [...list].sort((a, b) =>
        getDistance(userLoc.lat, userLoc.lng, a.lat, a.lng) - getDistance(userLoc.lat, userLoc.lng, b.lat, b.lng)
      );
    } else {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [search, filterFeature, sortBy, userLoc, submissions]);

  return (
    <div className="px-4 py-5 max-w-2xl mx-auto">
      <h2 className="text-lg font-bold text-emerald-900 dark:text-emerald-100 font-amiri mb-1">
        Masjids in Georgetown
      </h2>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        {masjids.length} masjids • Tap for directions
      </p>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search masjids..."
          className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-gray-800 border border-emerald-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-gray-200 transition-all"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 mb-3 overflow-x-auto scrollbar-hide pb-1">
        <button
          onClick={() => setSortBy(sortBy === 'distance' ? 'name' : 'distance')}
          disabled={!userLoc}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs whitespace-nowrap transition-all ${
            sortBy === 'distance'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
          } ${!userLoc ? 'opacity-50' : ''}`}
        >
          <NavIcon className="w-3 h-3" /> {sortBy === 'distance' ? 'Nearest First' : 'Sort by Distance'}
        </button>

        {Object.entries(featureLabels).map(([key, { label, icon }]) => (
          <button
            key={key}
            onClick={() => setFilterFeature(filterFeature === key ? '' : key)}
            className={`px-2.5 py-1 rounded-full text-xs whitespace-nowrap transition-all ${
              filterFeature === key
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
            }`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-2xl">
          <p className="text-gray-400 dark:text-gray-500">No masjids match your search</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((m, i) => {
            const latest = getLatestSubmission(m.id);
            const dist = userLoc ? getDistance(userLoc.lat, userLoc.lng, m.lat, m.lng) : null;

            return (
              <div
                key={m.id}
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-emerald-50 dark:border-gray-700 card-hover animate-fade-in"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-emerald-900 dark:text-emerald-100 text-sm">🕌 {m.name}</h3>
                      {m.verified === false && (
                        <span className="text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded-full">⚠️ Location unverified</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 shrink-0" />{m.address}
                      {dist !== null && (
                        <span className="ml-1 text-blue-600 dark:text-blue-400 font-medium">
                          ({dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)}km`})
                        </span>
                      )}
                    </p>
                  </div>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-full transition-colors shrink-0"
                    title="Get Directions"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {m.features.map(f => (
                    <span key={f} className="text-[10px] bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                      {featureLabels[f]?.icon} {featureLabels[f]?.label}
                    </span>
                  ))}
                </div>

                {m.contact && (
                  <a href={`tel:${m.contact}`} className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 mt-2 hover:underline">
                    <Phone className="w-3 h-3" />{m.contact}
                  </a>
                )}

                {m.notes && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">{m.notes}</p>
                )}

                {/* Salah Times */}
                <SalahTimesSection masjidId={m.id} />

                {/* Tonight's status */}
                {latest ? (
                  <div className="mt-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl px-3 py-2">
                    <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">🍽️ Tonight:</p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">{latest.menu}</p>
                  </div>
                ) : (
                  <div className="mt-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl px-3 py-2">
                    <p className="text-xs text-gray-400 dark:text-gray-500 italic">No update for tonight yet</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
