import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, ExternalLink, Search, Navigation as NavIcon, Clock, ChevronDown, ChevronUp, Send, UserRound, Plus, Trash2 } from 'lucide-react';
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

function saveSalahTimes(masjidId, times, reportedBy, notes) {
  try {
    const data = JSON.parse(localStorage.getItem('salah_times') || '{}');
    data[masjidId] = { times, notes: notes || null, reportedBy, reportedAt: new Date().toISOString() };
    localStorage.setItem('salah_times', JSON.stringify(data));
  } catch {}
}

function SalahTimesSection({ masjidId, officialTimes, prayerNote }) {
  const [expanded, setExpanded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saved, setSaved] = useState(() => getSalahTimes(masjidId));
  const [form, setForm] = useState({ Fajr: '', Zuhr: '', Asr: '', Maghrib: '', Isha: '', Taraweeh: '', "Jumu'ah": '', notes: '', reportedBy: '' });
  const { addToast } = useToast();

  // Official times (from masjid data) take precedence over community-reported localStorage times
  const displayTimes = officialTimes
    ? { times: officialTimes, isOfficial: true }
    : saved
    ? { times: saved.times, notes: saved.notes, isOfficial: false, reportedBy: saved.reportedBy, reportedAt: saved.reportedAt }
    : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const times = {};
    SALAH_NAMES.forEach(name => { if (form[name]) times[name] = form[name]; });
    if (Object.keys(times).length === 0) return;
    saveSalahTimes(masjidId, times, form.reportedBy || 'Anonymous', form.notes);
    setSaved({ times, notes: form.notes || null, reportedBy: form.reportedBy || 'Anonymous', reportedAt: new Date().toISOString() });
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
          {displayTimes ? (
            <div>
              {displayTimes.isOfficial && (
                <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1">
                  ✓ Verified by masjid
                </p>
              )}
              <div className="grid grid-cols-2 gap-1.5">
                {SALAH_NAMES.map(name => displayTimes.times[name] && (
                  <div key={name} className="flex justify-between text-xs bg-white dark:bg-gray-800 rounded-lg px-2 py-1.5">
                    <span className="text-gray-500 dark:text-gray-400">{name}</span>
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">{displayTimes.times[name]}</span>
                  </div>
                ))}
              </div>
              {!displayTimes.isOfficial && displayTimes.notes && (
                <p className="text-[10px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-2 py-1.5 mt-2">
                  ℹ️ {displayTimes.notes}
                </p>
              )}
              {!displayTimes.isOfficial && (
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2">
                  Reported by {displayTimes.reportedBy} • {new Date(displayTimes.reportedAt).toLocaleDateString()}
                </p>
              )}
              {prayerNote && (
                <p className="text-[10px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-2 py-1.5 mt-2">
                  ℹ️ {prayerNote}
                </p>
              )}
              {!displayTimes.isOfficial && (
                <button
                  onClick={() => { setShowForm(true); setForm({ Fajr: '', Zuhr: '', Asr: '', Maghrib: '', Isha: '', Taraweeh: '', "Jumu'ah": '', notes: '', reportedBy: '' }); }}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline mt-1"
                >
                  Update times
                </button>
              )}
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
                placeholder="Note (optional) — e.g. Adhan at these times, salah 10 min after"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full border border-emerald-200 dark:border-gray-600 rounded-lg px-2 py-1 text-xs bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
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

// ─── Masjid Info (Imam + Taraweeh) ───────────────────────────────────────────

const EMPTY_PERSON = { name: '', contact: '', bio: '' };

function getMasjidInfo(masjidId) {
  try {
    const data = JSON.parse(localStorage.getItem('masjid_info') || '{}');
    return data[masjidId] || null;
  } catch { return null; }
}

function saveMasjidInfo(masjidId, imam, taraweeh, reportedBy) {
  try {
    const data = JSON.parse(localStorage.getItem('masjid_info') || '{}');
    data[masjidId] = { imam, taraweeh, reportedBy: reportedBy || 'Anonymous', reportedAt: new Date().toISOString() };
    localStorage.setItem('masjid_info', JSON.stringify(data));
  } catch {}
}

function PersonCard({ label, person, index }) {
  if (!person?.name && !person?.contact && !person?.bio) return null;
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg px-3 py-2 space-y-0.5">
      <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">{label}</p>
      {person.name && <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">{person.name}</p>}
      {person.contact && (
        <a href={`tel:${person.contact}`} className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
          📞 {person.contact}
        </a>
      )}
      {person.bio && <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">{person.bio}</p>}
    </div>
  );
}

function PersonForm({ label, value, onChange, onRemove, showRemove }) {
  return (
    <div className="border border-emerald-100 dark:border-gray-600 rounded-xl p-2.5 space-y-1.5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">{label}</p>
        {showRemove && (
          <button type="button" onClick={onRemove} className="p-0.5 text-red-400 hover:text-red-600 transition-colors" aria-label="Remove">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <input
        type="text"
        placeholder="Name (optional)"
        value={value.name}
        onChange={e => onChange({ ...value, name: e.target.value })}
        className="w-full border border-emerald-200 dark:border-gray-600 rounded-lg px-2 py-1 text-xs bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
      />
      <input
        type="text"
        placeholder="Contact / phone (optional)"
        value={value.contact}
        onChange={e => onChange({ ...value, contact: e.target.value })}
        className="w-full border border-emerald-200 dark:border-gray-600 rounded-lg px-2 py-1 text-xs bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
      />
      <input
        type="text"
        placeholder="Short bio (optional)"
        value={value.bio}
        onChange={e => onChange({ ...value, bio: e.target.value })}
        className="w-full border border-emerald-200 dark:border-gray-600 rounded-lg px-2 py-1 text-xs bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
      />
    </div>
  );
}

function MasjidInfoSection({ masjidId, officialInfo }) {
  const [expanded, setExpanded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saved, setSaved] = useState(() => getMasjidInfo(masjidId));
  const [imam, setImam] = useState({ ...EMPTY_PERSON });
  const [taraweeh, setTaraweeh] = useState([{ ...EMPTY_PERSON }]);
  const [reportedBy, setReportedBy] = useState('');
  const { addToast } = useToast();

  const display = officialInfo
    ? { imam: officialInfo.imam, taraweeh: officialInfo.taraweeh || [], isOfficial: true }
    : saved
    ? { imam: saved.imam, taraweeh: saved.taraweeh || [], isOfficial: false, reportedBy: saved.reportedBy, reportedAt: saved.reportedAt }
    : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const filteredTaraweeh = taraweeh.filter(t => t.name || t.contact || t.bio);
    const hasImam = imam.name || imam.contact || imam.bio;
    if (!hasImam && filteredTaraweeh.length === 0) return;
    const imamData = hasImam ? imam : null;
    saveMasjidInfo(masjidId, imamData, filteredTaraweeh, reportedBy);
    setSaved({ imam: imamData, taraweeh: filteredTaraweeh, reportedBy: reportedBy || 'Anonymous', reportedAt: new Date().toISOString() });
    setShowForm(false);
    addToast('Masjid info updated! JazakAllah Khair');
  };

  const resetForm = () => {
    setImam({ ...EMPTY_PERSON });
    setTaraweeh([{ ...EMPTY_PERSON }]);
    setReportedBy('');
    setShowForm(true);
  };

  return (
    <div className="mt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
      >
        <UserRound className="w-3 h-3" />
        Imam & Taraweeh
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {expanded && (
        <div className="mt-2 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl p-3">
          {display ? (
            <div className="space-y-2">
              {display.isOfficial && (
                <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">✓ Verified by masjid</p>
              )}
              {display.imam && <PersonCard label="Imam" person={display.imam} />}
              {display.taraweeh.map((p, i) => (
                <PersonCard
                  key={i}
                  label={display.taraweeh.length > 1 ? `Taraweeh Leader ${i + 1}` : 'Taraweeh Leader'}
                  person={p}
                />
              ))}
              {!display.isOfficial && (
                <p className="text-[10px] text-gray-400 dark:text-gray-500">
                  Reported by {display.reportedBy} • {new Date(display.reportedAt).toLocaleDateString()}
                </p>
              )}
              {!display.isOfficial && (
                <button onClick={resetForm} className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">Update info</button>
              )}
            </div>
          ) : (
            !showForm && (
              <div className="text-center">
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">No info reported yet</p>
                <button
                  onClick={resetForm}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  Report Imam & Taraweeh
                </button>
              </div>
            )
          )}

          {showForm && (
            <form onSubmit={handleSubmit} className="mt-2 space-y-3">
              <PersonForm
                label="Imam"
                value={imam}
                onChange={setImam}
                showRemove={false}
              />
              <div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1.5 font-semibold">Taraweeh Leader(s) this Ramadan</p>
                <div className="space-y-2">
                  {taraweeh.map((t, i) => (
                    <PersonForm
                      key={i}
                      label={`Leader ${i + 1}`}
                      value={t}
                      onChange={v => setTaraweeh(prev => prev.map((p, j) => j === i ? v : p))}
                      onRemove={() => setTaraweeh(prev => prev.filter((_, j) => j !== i))}
                      showRemove={taraweeh.length > 1}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => setTaraweeh(prev => [...prev, { ...EMPTY_PERSON }])}
                    className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    <Plus className="w-3 h-3" /> Add another leader
                  </button>
                </div>
              </div>
              <input
                type="text"
                placeholder="Your name (optional)"
                value={reportedBy}
                onChange={e => setReportedBy(e.target.value)}
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

export default function MasjidDirectory({ submissions, onSubmitMasjid }) {
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
      <div className="flex items-start justify-between mb-1">
        <h2 className="text-lg font-bold text-emerald-900 dark:text-emerald-100 font-amiri">
          Masjids in Guyana
        </h2>
        <button
          onClick={onSubmitMasjid}
          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold rounded-full transition-all shrink-0 ml-2"
        >
          <Plus className="w-3.5 h-3.5" />
          Submit a Masjid
        </button>
      </div>
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
                <SalahTimesSection masjidId={m.id} officialTimes={m.prayerTimes} prayerNote={m.prayerNote} />

                {/* Imam & Taraweeh */}
                <MasjidInfoSection masjidId={m.id} officialInfo={m.masjidInfo} />

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

      {/* Correction CTA */}
      <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl text-center border border-amber-100 dark:border-amber-800/40">
        <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-1">
          Spot an error?
        </p>
        <p className="text-[11px] text-amber-600 dark:text-amber-400 mb-3">
          Wrong address, missing info, or know a masjid we missed? Let us know.
        </p>
        <Link
          to="/feedback?type=correction"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold transition-colors active:scale-95"
        >
          ✏️ Suggest a Correction
        </Link>
      </div>
    </div>
  );
}
