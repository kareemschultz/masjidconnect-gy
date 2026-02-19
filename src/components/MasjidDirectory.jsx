import { useState, useEffect, useMemo } from 'react';
import { MapPin, Phone, ExternalLink, Search, SlidersHorizontal, Navigation as NavIcon } from 'lucide-react';
import { masjids, featureLabels } from '../data/masjids';

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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
    <div className="px-4 py-5 max-w-lg mx-auto">
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
                    <h3 className="font-bold text-emerald-900 dark:text-emerald-100 text-sm">🕌 {m.name}</h3>
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
