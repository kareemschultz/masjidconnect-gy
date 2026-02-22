import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, BookOpen, Radio, Tv, Phone, Mail, CheckSquare, Square, FileText, Download, Play, Pause, SkipForward, SkipBack, Headphones, X, Library } from 'lucide-react';
import { getRamadanDay, getTodayTimetable } from '../data/ramadanTimetable';
import { books, categories } from '../data/books';
import { lectureSeries, lectureCategories } from '../data/lectures';
import PageHero from './PageHero';

// ── Shared UI ─────────────────────────────────────────────────────────────────

function Collapsible({ title, icon, children }) {
  const [open, setOpen] = useState(false); // all collapsed by default
  return (
    <div className="faith-section overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-emerald-50/60 dark:hover:bg-emerald-900/20 transition-colors"
      >
        <span className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-100 text-sm">
          <span>{icon}</span> {title}
        </span>
        {open
          ? <ChevronUp  className="w-4 h-4 text-gray-400 shrink-0" />
          : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1">
          {children}
        </div>
      )}
    </div>
  );
}

function InfoCard({ title, children }) {
  return (
    <div className="bg-warm-50/80 dark:bg-gray-700/35 rounded-xl p-3 mb-2 last:mb-0 border border-emerald-100/70 dark:border-gray-700">
      {title && <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 text-xs mb-1.5">{title}</h4>}
      <div className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed space-y-1">
        {children}
      </div>
    </div>
  );
}

// ── Daily Checklist ───────────────────────────────────────────────────────────

function DailyChecklist() {
  const storageKey = `checklist-${new Date().toISOString().split('T')[0]}`;
  const [checked, setChecked] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch { return {}; }
  });
  const toggle = (key) => {
    const next = { ...checked, [key]: !checked[key] };
    setChecked(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };
  const items = [
    { key: 'suhoor',   label: 'Suhoor',                  time: 'Before Fajr',    icon: '🌅' },
    { key: 'fajr',     label: 'Fajr Prayer',              time: '',               icon: '🕌' },
    { key: 'quran',    label: 'Quran Reading',            time: '',               icon: '📖' },
    { key: 'dhikr',    label: 'Morning Dhikr',            time: '',               icon: '📿' },
    { key: 'dhuhr',    label: 'Dhuhr Prayer',             time: '',               icon: '🕌' },
    { key: 'asr',      label: 'Asr Prayer',               time: '',               icon: '🕌' },
    { key: 'dua',      label: 'Dua before Iftaar',        time: 'Before Maghrib', icon: '🤲' },
    { key: 'iftaar',   label: 'Iftaar',                   time: 'At Maghrib',     icon: '🍽️' },
    { key: 'maghrib',  label: 'Maghrib Prayer',           time: '',               icon: '🕌' },
    { key: 'isha',     label: 'Isha Prayer',              time: '',               icon: '🕌' },
    { key: 'taraweeh', label: 'Taraweeh Prayer',          time: 'After Isha',     icon: '🌙' },
    { key: 'nightdua', label: 'Night Dua & Reflection',   time: 'Before sleep',   icon: '✨' },
  ];
  const done = Object.values(checked).filter(Boolean).length;
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-500 dark:text-gray-400">{done}/{items.length} completed today</p>
        <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
          <div className="bg-emerald-500 h-1.5 rounded-full transition-all" style={{ width: `${(done / items.length) * 100}%` }} />
        </div>
      </div>
      <div className="space-y-1">
        {items.map(item => (
          <button key={item.key} onClick={() => toggle(item.key)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-left transition-all ${
              checked[item.key]
                ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 line-through opacity-70'
                : 'bg-warm-50 dark:bg-gray-700/30 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-700'
            }`}>
            {checked[item.key]
              ? <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              : <Square      className="w-4 h-4 text-gray-400 shrink-0" />}
            <span>{item.icon}</span>
            <span className="flex-1 font-medium">{item.label}</span>
            {item.time && <span className="text-gray-400 dark:text-gray-500 text-[10px]">{item.time}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── PDF Viewer Modal ─────────────────────────────────────────────────────────

function PDFViewer({ url, title, onClose }) {
  return (
    <div className="fixed inset-0 z-[60] bg-black/90 flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 text-white shrink-0 safe-top">
        <h3 className="font-bold text-sm truncate pr-4">{title}</h3>
        <button 
          onClick={onClose}
          className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
          aria-label="Close PDF"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {/* Content */}
      <div className="flex-1 w-full bg-gray-100 relative">
        <iframe 
          src={url} 
          className="w-full h-full border-0" 
          title={title}
        />
        {/* Mobile fallback hint */}
        <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
          <span className="bg-black/50 text-white text-[10px] px-3 py-1 rounded-full backdrop-blur-sm">
            If PDF doesn't load, use "Open External" below
          </span>
        </div>
      </div>

      {/* Footer actions */}
      <div className="p-4 bg-gray-900 shrink-0 flex gap-3 safe-bottom">
        <button 
          onClick={onClose}
          className="flex-1 py-3 bg-gray-800 text-white rounded-xl text-sm font-medium"
        >
          Close
        </button>
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-sm font-medium text-center flex items-center justify-center gap-2"
        >
          <ExternalLink className="w-4 h-4" /> Open External
        </a>
      </div>
    </div>
  );
}

// ─── Islamic Library ───────────────────────────────────────────────────────────

function IslamicLibrary() {
  const [filter, setFilter] = useState('');
  const [viewingPdf, setViewingPdf] = useState(null);
  const basePath = import.meta.env.BASE_URL + 'books/';
  const filtered = filter ? books.filter(b => b.category === filter) : books;
  
  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Free Islamic educational resources. Tap to open.</p>
      <div className="flex gap-1.5 mb-3 overflow-x-auto scrollbar-hide pb-1">
        <button onClick={() => setFilter('')}
          className={`px-2.5 py-1 faith-chip text-xs whitespace-nowrap transition-all ${!filter ? 'bg-emerald-600 text-white border-emerald-600 dark:border-emerald-500' : ''}`}>
          All ({books.length})
        </button>
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(filter === cat ? '' : cat)}
            className={`px-2.5 py-1 faith-chip text-xs whitespace-nowrap transition-all ${filter === cat ? 'bg-emerald-600 text-white border-emerald-600 dark:border-emerald-500' : ''}`}>
            {cat}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {filtered.map(book => (
          <button 
            key={book.id} 
            onClick={() => setViewingPdf({ url: basePath + book.filename, title: book.title })}
            className="w-full flex items-start gap-3 bg-warm-50 dark:bg-gray-700/30 rounded-xl p-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors group text-left"
          >
            <div className="shrink-0 w-9 h-9 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 text-xs group-hover:underline">{book.title}</h4>
              {book.author && <p className="text-[10px] text-gray-500 dark:text-gray-400">{book.author}</p>}
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-2">{book.description}</p>
              <span className="inline-block mt-1 text-[10px] bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">{book.category}</span>
            </div>
            <BookOpen className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-emerald-600 shrink-0 mt-1 transition-colors" />
          </button>
        ))}
      </div>
      
      {viewingPdf && (
        <PDFViewer 
          url={viewingPdf.url} 
          title={viewingPdf.title} 
          onClose={() => setViewingPdf(null)} 
        />
      )}
    </div>
  );
}

// ── Iftaar Reminder ───────────────────────────────────────────────────────────

function IftaarReminder() {
  const [enabled, setEnabled] = useState(false);
  const [status, setStatus]   = useState('');
  const today       = getTodayTimetable();
  const maghribTime = today?.maghrib || '6:08';
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const enableReminder = async () => {
    if (!('Notification' in window)) { setStatus('Notifications not supported'); return; }
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      setEnabled(true);
      setStatus(`Reminder set! You'll be notified 30 min before Iftaar (${maghribTime} PM) In sha Allah`);
      const [mH, mM] = maghribTime.split(':').map(Number);
      const maghribH24 = mH < 12 ? mH + 12 : mH;
      let rH = maghribH24, rM = mM - 30;
      if (rM < 0) { rH -= 1; rM += 60; }
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        const n = new Date();
        if (n.getHours() === rH && n.getMinutes() === rM) {
          new Notification('🌙 Iftaar Reminder', { body: `Iftaar is in 30 minutes (${maghribTime} PM)! May Allah accept your fast.` });
        }
      }, 60000);
    } else {
      setStatus('Permission denied — enable notifications in browser settings.');
    }
  };

  return (
    <div className="text-center py-2">
      {!enabled ? (
        <>
          <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">Get a notification 30 min before Iftaar ({maghribTime} PM)</p>
          <button onClick={enableReminder} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors">
            🔔 Enable Iftaar Reminder
          </button>
        </>
      ) : (
        <p className="text-xs text-emerald-600 dark:text-emerald-400">✅ {status}</p>
      )}
      {status && !enabled && <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">{status}</p>}
    </div>
  );
}

// ── Lectures Section ──────────────────────────────────────────────────────────

const ARCHIVE_BASE = 'https://archive.org/download';

function LectureAudioPlayer({ series, initialTrack = 0, onClose }) {
  const [trackIdx, setTrackIdx] = useState(initialTrack);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const track = series.tracks[trackIdx];
  const src = `${ARCHIVE_BASE}/${series.archiveId}/${track.file}`;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = src;
    if (playing) audio.play().catch(() => setPlaying(false));
  }, [playing, src, trackIdx]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) audio.play().catch(() => setPlaying(false));
    else audio.pause();
  }, [playing]);

  const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60), sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 px-4 max-w-md mx-auto">
      <div className="bg-emerald-900 dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-emerald-700 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-800/50 dark:bg-black/30">
          <div className="flex items-center gap-2 min-w-0">
            <Headphones className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">{track.title}</p>
              <p className="text-emerald-400 text-[10px] truncate">{series.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-emerald-400 hover:text-white transition-colors shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-4 pt-2">
          <input
            type="range" min={0} max={duration || 100} value={progress}
            onChange={e => { if (audioRef.current) audioRef.current.currentTime = e.target.value; }}
            className="w-full h-1 accent-emerald-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-emerald-400/70 mt-0.5">
            <span>{fmt(progress)}</span>
            <span>{fmt(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 px-4 pb-3">
          <button
            onClick={() => setTrackIdx(i => Math.max(0, i - 1))}
            disabled={trackIdx === 0}
            className="p-2 text-emerald-300 hover:text-white disabled:opacity-30 transition-colors"
          >
            <SkipBack className="w-5 h-5" />
          </button>
          <button
            onClick={() => setPlaying(p => !p)}
            className="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center transition-colors"
          >
            {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
          <button
            onClick={() => setTrackIdx(i => Math.min(series.tracks.length - 1, i + 1))}
            disabled={trackIdx === series.tracks.length - 1}
            className="p-2 text-emerald-300 hover:text-white disabled:opacity-30 transition-colors"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Track indicator */}
        <div className="px-4 pb-2 text-center">
          <p className="text-[10px] text-emerald-400/60">Track {trackIdx + 1} of {series.tracks.length}</p>
        </div>

        <audio
          ref={audioRef}
          onTimeUpdate={e => setProgress(e.target.currentTime)}
          onLoadedMetadata={e => setDuration(e.target.duration)}
          onEnded={() => {
            if (trackIdx < series.tracks.length - 1) setTrackIdx(i => i + 1);
            else setPlaying(false);
          }}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
      </div>
    </div>
  );
}

function LecturesSection() {
  const [catFilter, setCatFilter] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [playerSeries, setPlayerSeries] = useState(null);
  const [playerTrack, setPlayerTrack] = useState(0);

  const filtered = catFilter ? lectureSeries.filter(s => s.category === catFilter) : lectureSeries;

  const openArchive = (series) => {
    window.open(`https://archive.org/details/${series.archiveId}`, '_blank', 'noopener');
  };

  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        Stream or download Islamic lectures — hosted on the Internet Archive (free, no account needed).
      </p>

      {/* Category filter */}
      <div className="flex gap-1.5 mb-3 overflow-x-auto scrollbar-hide pb-1">
        <button onClick={() => setCatFilter('')}
          className={`px-2.5 py-1 faith-chip text-xs whitespace-nowrap transition-all ${!catFilter ? 'bg-emerald-600 text-white border-emerald-600 dark:border-emerald-500' : ''}`}>
          All ({lectureSeries.length})
        </button>
        {lectureCategories.map(cat => (
          <button key={cat} onClick={() => setCatFilter(catFilter === cat ? '' : cat)}
            className={`px-2.5 py-1 faith-chip text-xs whitespace-nowrap transition-all ${catFilter === cat ? 'bg-emerald-600 text-white border-emerald-600 dark:border-emerald-500' : ''}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Series list */}
      <div className="space-y-2">
        {filtered.map(series => {
          const hasTracks = series.tracks.length > 0;
          const isExpanded = expandedId === series.id;

          return (
            <div key={series.id} className="bg-warm-50 dark:bg-gray-700/30 rounded-xl overflow-hidden">
              {/* Series header */}
              <button
                onClick={() => hasTracks ? setExpandedId(isExpanded ? null : series.id) : openArchive(series)}
                className="w-full flex items-start gap-3 p-3 text-left hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
              >
                <div className="shrink-0 w-9 h-9 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg flex items-center justify-center text-lg">
                  🎧
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-emerald-800 dark:text-emerald-300 text-xs">{series.title}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">{series.speaker}</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-2">{series.description}</p>
                  <span className="inline-block mt-1 text-[9px] bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">
                    {series.category}
                  </span>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-1">
                  {hasTracks
                    ? (isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />)
                    : <ExternalLink className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" />
                  }
                  {hasTracks && (
                    <span className="text-[9px] text-gray-400">{series.tracks.length} tracks</span>
                  )}
                </div>
              </button>

              {/* Track list */}
              {hasTracks && isExpanded && (
                <div className="border-t border-emerald-100 dark:border-gray-700">
                  <div className="max-h-64 overflow-y-auto">
                    {series.tracks.map((track, i) => (
                      <button
                        key={track.file}
                        onClick={() => { setPlayerSeries(series); setPlayerTrack(i); }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors border-b border-gray-50 dark:border-gray-700/50 last:border-0"
                      >
                        <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-[9px] font-bold flex items-center justify-center">
                          {track.n}
                        </span>
                        <span className="flex-1 text-xs text-gray-700 dark:text-gray-300">{track.title}</span>
                        <Play className="w-3 h-3 text-emerald-500 shrink-0" />
                      </button>
                    ))}
                  </div>
                  {/* External link fallback */}
                  <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800/50">
                    <a
                      href={`https://archive.org/details/${series.archiveId}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" /> View all tracks & download on archive.org
                    </a>
                  </div>
                </div>
              )}

              {/* No tracks — just archive.org link */}
              {!hasTracks && (
                <div className="px-3 pb-2">
                  <a
                    href={`https://archive.org/details/${series.archiveId}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" /> Stream & download on archive.org
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-3 text-center">
        Audio streams from archive.org — works best on Wi-Fi. Tap a track to play in-app.
      </p>

      {/* Floating player */}
      {playerSeries && (
        <LectureAudioPlayer
          series={playerSeries}
          initialTrack={playerTrack}
          onClose={() => setPlayerSeries(null)}
        />
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function Resources() {
  const ramadan = getRamadanDay();
  const [tab, setTab] = useState('ramadan'); // 'ramadan' | 'islamic'

  return (
    <div className="min-h-screen faith-canvas pb-24 page-enter">
      <PageHero icon={Library} title="Resources" subtitle="Guides, PDFs & learning materials" color="blue" backLink="/ramadan" />
      <div className="px-4 max-w-2xl mx-auto">

      {/* Tab toggle */}
      <div className="flex bg-white/70 dark:bg-gray-900/70 border border-emerald-100 dark:border-gray-700 rounded-2xl p-1 mb-5 gap-1">
        {[
          { id: 'ramadan', label: '🌙 Ramadan' },
          { id: 'eid',     label: '🎉 Eid' },
          { id: 'islamic', label: '📖 Islamic' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 faith-tab text-xs font-semibold transition-all ${
              tab === t.id
                ? 'faith-tab-active'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── RAMADAN TAB ── */}
      {tab === 'ramadan' && (
        <div className="space-y-3">
          <Collapsible title="Daily Ramadan Checklist" icon="✅">
            <DailyChecklist />
          </Collapsible>

          <Collapsible title="Rules & Etiquette of Fasting" icon="📜">
            <InfoCard title="What Invalidates the Fast">
              <p>• Eating or drinking intentionally</p>
              <p>• Intentional vomiting</p>
              <p>• Sexual relations during fasting hours</p>
              <p>• Menstruation or post-natal bleeding</p>
              <p>• <strong>Note:</strong> Eating or drinking forgetfully does not break the fast</p>
            </InfoCard>
            <InfoCard title="What Does NOT Invalidate the Fast">
              <p>• Unintentional eating/drinking (forgetfulness)</p>
              <p>• Using miswak or toothbrush (without toothpaste)</p>
              <p>• Rinsing the mouth or nose (without exaggeration)</p>
              <p>• Blood tests or injections that are not nutritional</p>
              <p>• Swallowing saliva</p>
              <p>• Tasting food without swallowing (if necessary)</p>
            </InfoCard>
            <InfoCard title="Sunnah Acts During Fasting">
              <p>• Eat suhoor — even if a sip of water</p>
              <p>• Delay suhoor close to Fajr time</p>
              <p>• Hasten to break fast at Maghrib</p>
              <p>• Break fast with dates, then water</p>
              <p>• Make dua at the time of breaking fast</p>
              <p>• Increase Quran recitation</p>
              <p>• Give generously in charity</p>
              <p>• Guard your tongue from backbiting and foul speech</p>
            </InfoCard>
          </Collapsible>

          <Collapsible title="Who is Exempt from Fasting" icon="💚">
            <InfoCard title="Temporary Exemptions (Must Make Up)">
              <p>• <strong>Travellers</strong> — may break fast and make up later</p>
              <p>• <strong>Sick persons</strong> — illness that worsens with fasting</p>
              <p>• <strong>Pregnant women</strong> — if fasting harms mother or baby</p>
              <p>• <strong>Breastfeeding women</strong> — if fasting affects milk supply</p>
              <p>• <strong>Menstruating women</strong> — must make up missed days</p>
            </InfoCard>
            <InfoCard title="Permanent Exemptions (Pay Fidyah)">
              <p>• <strong>Elderly</strong> who cannot fast without hardship</p>
              <p>• <strong>Chronically ill</strong> with no hope of recovery</p>
              <p>• <strong>Fidyah:</strong> Feed one poor person for each missed day</p>
            </InfoCard>
            <InfoCard title="Making Up Missed Fasts">
              <p>• Missed fasts should be made up before the next Ramadan</p>
              <p>• Can be consecutive or spread throughout the year</p>
              <p>• If not made up without valid excuse, fidyah is also required</p>
            </InfoCard>
          </Collapsible>

          <Collapsible title="Laylatul Qadr — The Night of Power" icon="🌟">
            <div className="bg-gradient-to-br from-emerald-50 to-amber-50 dark:from-emerald-900/20 dark:to-yellow-900/10 rounded-xl p-4 mb-2 text-center">
              <p className="font-amiri text-xl text-emerald-900 dark:text-emerald-100 mb-1">لَيْلَةُ الْقَدْرِ خَيْرٌ مِّنْ أَلْفِ شَهْرٍ</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 italic">"The Night of Power is better than a thousand months" (Quran 97:3)</p>
            </div>
            <InfoCard title="When is Laylatul Qadr?">
              <p>• Seek it in the <strong>odd nights of the last 10 days</strong></p>
              <p>• Nights of the 21st, 23rd, 25th, 27th, and 29th</p>
              <p>• Many scholars emphasize the <strong>27th night</strong></p>
              {ramadan.isRamadan && ramadan.day >= 21 && (
                <p className="mt-1 text-emerald-700 dark:text-emerald-400 font-bold">⭐ We are in the last 10 nights — seek it tonight!</p>
              )}
            </InfoCard>
            <InfoCard title="How to Worship on This Night">
              <p>• Pray Taraweeh and Tahajjud</p>
              <p>• Read and reflect on the Quran</p>
              <p>• Make abundant dua — especially: <em>"Allahumma innaka 'afuwwun tuhibbul 'afwa fa'fu 'anni"</em></p>
              <p>• Give charity, make dhikr and istighfar</p>
            </InfoCard>
          </Collapsible>

          <Collapsible title="I'tikaf Guidelines" icon="🕌">
            <InfoCard title="What is I'tikaf?">
              <p>Spiritual retreat in the masjid during the last 10 days of Ramadan, following the Sunnah of the Prophet ﷺ.</p>
            </InfoCard>
            <InfoCard title="Rules of I'tikaf">
              <p>• Performed in the last 10 days (Sunnah)</p>
              <p>• Stay in the masjid — only leave for necessities</p>
              <p>• Focus on prayer, Quran, dhikr, and dua</p>
              <p>• Avoid unnecessary conversation and worldly distractions</p>
              <p>• Can be done by both men and women</p>
            </InfoCard>
          </Collapsible>

          <Collapsible title="Taraweeh Prayer Guide" icon="🌙">
            <InfoCard title="About Taraweeh">
              <p>• Performed after Isha every night of Ramadan</p>
              <p>• Prayed in sets of 2 rakaat</p>
              <p>• <strong>8 or 20 rakaat</strong> — both are valid positions</p>
              <p>• Best performed in congregation at the masjid</p>
              <p>• The entire Quran is completed during Ramadan</p>
            </InfoCard>
            <InfoCard title="Tips for Taraweeh">
              <p>• Arrive early and pray Isha with the congregation</p>
              <p>• Maintain khushu' (focus) in prayer</p>
              <p>• If you cannot stand, sitting is permissible</p>
              <p>• Make dua in the Witr prayer at the end</p>
            </InfoCard>
          </Collapsible>

          <Collapsible title="Zakatul Fitr for Guyana" icon="💰">
            <InfoCard title="What is Zakatul Fitr?">
              <p>Obligatory charity given before Eid prayer. It purifies the fasting person and provides food for the poor on Eid day.</p>
            </InfoCard>
            <InfoCard title="Rules">
              <p>• <strong>Who pays:</strong> Every Muslim with food beyond their needs on Eid day</p>
              <p>• <strong>Pay for:</strong> Yourself and all dependents (including children)</p>
              <p>• <strong>When:</strong> Must be paid before Eid prayer</p>
              <p>• <strong>Amount:</strong> ~2.5–3 kg staple food per person, or cash equivalent</p>
            </InfoCard>
            <InfoCard title="In Guyana">
              <p>• Typical amount: approx <strong>GY$1,500–2,500</strong> per person</p>
              <p>• Consult CIOG or GIT for current year's rate</p>
              <p>• Contact GIT: 📞 227-0115 / 225-5934</p>
            </InfoCard>
          </Collapsible>

          <Collapsible title="Virtues of Ramadan" icon="✨">
            <div className="space-y-2">
              {[
                { hadith: "When Ramadan begins, the gates of Paradise are opened, the gates of Hell are closed, and the devils are chained.", source: "Bukhari & Muslim" },
                { hadith: "Whoever fasts Ramadan out of faith and seeking reward, his previous sins will be forgiven.", source: "Bukhari" },
                { hadith: "Every action of the son of Adam is for him except fasting, for that is solely for Me and I give the reward for it.", source: "Bukhari" },
                { hadith: "The fasting person has two joys: joy when he breaks his fast, and joy when he meets his Lord.", source: "Muslim" },
                { hadith: "There is a gate in Paradise called Ar-Rayyan, through which only those who fasted will enter.", source: "Bukhari & Muslim" },
                { hadith: "Whoever provides Iftaar for a fasting person earns the same reward without diminishing the faster's reward.", source: "Tirmidhi" },
              ].map((h, i) => (
                <div key={i} className="bg-warm-50 dark:bg-gray-700/30 rounded-xl p-3">
                  <p className="text-xs text-gray-700 dark:text-gray-300 italic leading-relaxed">"{h.hadith}"</p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 text-right">— {h.source}</p>
                </div>
              ))}
            </div>
          </Collapsible>

          <Collapsible title="Ramadan Media Programs" icon="📺">
            <div className="space-y-2">
              {[
                { icon: Radio, name: 'Voice of Guyana', info: '📻 102.5 FM / 560 AM', prog: '🌙 GIT Ramadan Program: 4:00–4:30 AM daily', note: 'Perfect to listen during Suhoor' },
                { icon: Tv,    name: 'NCN Television',  info: '📺 Channel 11',         prog: '🌙 Daily program: 4:15–4:45 AM' },
                { icon: Tv,    name: 'GIT Perspectives',info: '📺 MTV Ch 14 / Cable 65',prog: '🗓️ Tuesdays at 8:30 PM' },
              ].map(m => (
                <div key={m.name} className="bg-warm-50 dark:bg-gray-700/30 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <m.icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h4 className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">{m.name}</h4>
                  </div>
                  <p className="text-xs text-gray-700 dark:text-gray-300">{m.info}</p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">{m.prog}</p>
                  {m.note && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{m.note}</p>}
                </div>
              ))}
            </div>
          </Collapsible>

          <Collapsible title="Iftaar Reminder" icon="🔔">
            <IftaarReminder />
          </Collapsible>
        </div>
      )}

      {/* ── EID TAB ── */}
      {tab === 'eid' && (
        <div className="space-y-3">

          {/* Eid ul-Fitr */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-4 text-white text-center mb-1">
            <p className="text-2xl mb-1">🎉</p>
            <h3 className="font-bold text-base font-cinzel">Eid ul-Fitr</h3>
            <p className="text-xs text-emerald-100 mt-0.5">Marking the end of Ramadan — 1 Shawwal</p>
          </div>

          <Collapsible title="Eid ul-Fitr — Overview" icon="🌙">
            <InfoCard title="What is Eid ul-Fitr?">
              <p>Eid ul-Fitr (عيد الفطر) marks the end of Ramadan — the month of fasting. It is a day of gratitude, celebration, and community. The name means "Festival of Breaking the Fast."</p>
            </InfoCard>
            <InfoCard title="Key Dates & Timing">
              <p>• Begins on the <strong>1st of Shawwal</strong> (Islamic calendar)</p>
              <p>• Confirmed by moon sighting the night before</p>
              <p>• Eid prayer is performed in the <strong>morning</strong> (after sunrise, before noon)</p>
              <p>• <strong>Zakatul Fitr must be paid before Eid prayer</strong></p>
            </InfoCard>
            <InfoCard title="Eid Greeting">
              <p className="font-amiri text-xl text-emerald-900 dark:text-emerald-100 text-center mb-1">عِيدٌ مُبَارَكٌ</p>
              <p className="text-center italic">"Eid Mubarak" — Blessed Eid</p>
              <p className="mt-1">• Also: <em>"Taqabbalallahu minna wa minkum"</em> — May Allah accept from us and from you</p>
            </InfoCard>
          </Collapsible>

          <Collapsible title="Sunnah Acts on Eid ul-Fitr Day" icon="✨">
            <div className="space-y-1.5">
              {[
                { step: '1', text: 'Wake up early and perform Ghusl (full bath)' },
                { step: '2', text: 'Wear your best (or new) clothes' },
                { step: '3', text: 'Apply itr (perfume) — for men' },
                { step: '4', text: 'Eat dates (odd number) before leaving for Eid prayer' },
                { step: '5', text: 'Pay Zakatul Fitr before Eid prayer' },
                { step: '6', text: 'Recite the Eid Takbeer on the way to prayer' },
                { step: '7', text: 'Go to masjid by one route, return by a different route' },
                { step: '8', text: 'Greet and embrace fellow Muslims warmly' },
                { step: '9', text: 'Visit family and maintain ties of kinship' },
                { step: '10', text: 'Give generously in charity and gifts' },
              ].map(s => (
                <div key={s.step} className="flex items-start gap-2 bg-warm-50 dark:bg-gray-700/30 rounded-xl px-3 py-2">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center mt-0.5">{s.step}</span>
                  <p className="text-xs text-gray-700 dark:text-gray-300">{s.text}</p>
                </div>
              ))}
            </div>
          </Collapsible>

          <Collapsible title="Eid ul-Fitr Prayer Guide" icon="🕌">
            <InfoCard title="How Many Rak'ahs?">
              <p>• <strong>2 rak'ahs</strong> — performed as a congregation</p>
              <p>• Preceded by <strong>6 extra Takbeeraat</strong> (3 in each rak'ah)</p>
              <p>• Followed by the <strong>Eid Khutbah</strong> (sermon)</p>
              <p>• <strong>No Adhan or Iqamah</strong> for Eid prayer</p>
            </InfoCard>
            <InfoCard title="Steps of Eid Prayer">
              <p>1. Make intention for Eid prayer</p>
              <p>2. Imam says Takbiratul Ihram — follow with raised hands</p>
              <p>3. <strong>3 additional Takbeeraat</strong> in the first rak'ah</p>
              <p>4. Imam recites Al-Fatiha + Surah (e.g. Al-A'la)</p>
              <p>5. Complete ruku' and sujud as normal</p>
              <p>6. In 2nd rak'ah: <strong>3 more Takbeeraat</strong> before recitation</p>
              <p>7. Imam recites Al-Fatiha + Surah (e.g. Al-Ghashiyah)</p>
              <p>8. Complete prayer with Tasleem</p>
              <p>9. Remain seated for the Eid Khutbah</p>
            </InfoCard>
            <InfoCard title="In Guyana">
              <p>• Main Eid prayer venues: <strong>MYO Lawns (Woolford Ave)</strong>, Queenstown Jama Masjid, and local masjids throughout Georgetown</p>
              <p>• Check with CIOG, GIT, or your local masjid for exact times and venues</p>
            </InfoCard>
          </Collapsible>

          <Collapsible title="Eid Takbeeraat" icon="🔊">
            <div className="bg-gradient-to-br from-emerald-50 to-amber-50 dark:from-emerald-900/20 dark:to-yellow-900/10 rounded-xl p-4 text-center mb-2">
              <p className="font-amiri text-xl text-emerald-900 dark:text-emerald-100 leading-loose">
                ٱللَّٰهُ أَكْبَرُ، ٱللَّٰهُ أَكْبَرُ، لَا إِلَٰهَ إِلَّا ٱللَّٰهُ،<br />
                ٱللَّٰهُ أَكْبَرُ، ٱللَّٰهُ أَكْبَرُ، وَلِلَّٰهِ ٱلْحَمْدُ
              </p>
            </div>
            <InfoCard>
              <p className="italic text-center">"Allahu Akbar, Allahu Akbar, La ilaha illallah, Allahu Akbar, Allahu Akbar, wa lillahil hamd"</p>
              <p className="mt-2 text-center">"Allah is the Greatest, Allah is the Greatest, There is no god but Allah, Allah is the Greatest, Allah is the Greatest, and to Allah belongs all praise."</p>
            </InfoCard>
            <InfoCard title="When to Recite">
              <p>• From Fajr on the day of Eid until the Eid prayer begins</p>
              <p>• Recite aloud while walking to the prayer ground</p>
              <p>• Recite softly in the masjid or congregation</p>
            </InfoCard>
          </Collapsible>

          <Collapsible title="Zakatul Fitr Reminder" icon="💰">
            <InfoCard title="Obligatory Before Eid Prayer">
              <p>Zakatul Fitr is <strong>Wajib (obligatory)</strong> for every Muslim who has food beyond their needs on the day of Eid.</p>
            </InfoCard>
            <InfoCard title="Key Rules">
              <p>• Pay for <strong>yourself and all dependents</strong> (spouse, children, elderly parents)</p>
              <p>• <strong>Amount:</strong> ~2.5–3 kg of staple food per person (or cash equivalent)</p>
              <p>• <strong>Deadline:</strong> Must be paid <em>before</em> Eid prayer — ideally 1–2 days before</p>
              <p>• In Guyana: approx <strong>GY$1,500–2,500 per person</strong> — consult CIOG or GIT for current rate</p>
            </InfoCard>
          </Collapsible>

          {/* Divider */}
          <div className="flex items-center gap-3 py-2">
            <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Eid ul-Adha</span>
            <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
          </div>

          {/* Eid ul-Adha */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-4 text-white text-center mb-1">
            <p className="text-2xl mb-1">🐑</p>
            <h3 className="font-bold text-base font-cinzel">Eid ul-Adha</h3>
            <p className="text-xs text-amber-100 mt-0.5">Festival of Sacrifice — 10 Dhul Hijjah</p>
          </div>

          <Collapsible title="Eid ul-Adha — Overview" icon="🕋">
            <InfoCard title="What is Eid ul-Adha?">
              <p>Eid ul-Adha (عيد الأضحى) is the "Festival of Sacrifice," commemorating Prophet Ibrahim (AS) and his son Ismail (AS) and their willingness to submit to Allah's command. It coincides with the Hajj pilgrimage.</p>
            </InfoCard>
            <InfoCard title="Key Dates">
              <p>• Observed on <strong>10 Dhul Hijjah</strong> — the 12th Islamic month</p>
              <p>• Follows the Day of Arafah (9 Dhul Hijjah) — a day of fasting for those not on Hajj</p>
              <p>• The days of sacrifice (Ayyam al-Tashreeq) continue until 13 Dhul Hijjah</p>
            </InfoCard>
            <InfoCard title="The Connection to Hajj">
              <p>• Pilgrims in Makkah are performing the final rites of Hajj on this day</p>
              <p>• Making dua for the Hujjaj (pilgrims) is encouraged</p>
              <p>• Muslims worldwide celebrate in solidarity with those performing Hajj</p>
            </InfoCard>
          </Collapsible>

          <Collapsible title="Sunnah Acts on Eid ul-Adha Day" icon="✨">
            <div className="space-y-1.5">
              {[
                { step: '1', text: 'Fast on the Day of Arafah (9 Dhul Hijjah) if not performing Hajj — it expiates two years of sins' },
                { step: '2', text: 'Perform Ghusl and wear best clothes on Eid day' },
                { step: '3', text: 'Do NOT eat before Eid prayer — break fast after with Qurbani meat' },
                { step: '4', text: 'Recite the Takbeeraat of Tashreeq from Fajr on 9 Dhul Hijjah until Asr on 13 Dhul Hijjah' },
                { step: '5', text: 'Attend Eid prayer in congregation' },
                { step: '6', text: 'Perform Qurbani (sacrifice) if financially able' },
                { step: '7', text: 'Distribute meat: 1/3 for yourself, 1/3 for relatives, 1/3 for the poor' },
                { step: '8', text: 'Visit family and maintain ties of kinship' },
              ].map(s => (
                <div key={s.step} className="flex items-start gap-2 bg-warm-50 dark:bg-gray-700/30 rounded-xl px-3 py-2">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center mt-0.5">{s.step}</span>
                  <p className="text-xs text-gray-700 dark:text-gray-300">{s.text}</p>
                </div>
              ))}
            </div>
          </Collapsible>

          <Collapsible title="Qurbani — Sacrifice Guide" icon="🐑">
            <InfoCard title="What is Qurbani?">
              <p>Qurbani (sacrifice) is the slaughter of a livestock animal in the name of Allah during the days of Eid ul-Adha, following the Sunnah of Ibrahim (AS).</p>
            </InfoCard>
            <InfoCard title="Who Must Perform Qurbani?">
              <p>• Every Muslim who has reached puberty and possesses wealth above the Nisab (same threshold as Zakat)</p>
              <p>• Wajib (obligatory) according to the Hanafi school; Sunnah Muakkadah according to others</p>
            </InfoCard>
            <InfoCard title="Acceptable Animals">
              <p>• <strong>Sheep or Goat:</strong> counts for 1 person</p>
              <p>• <strong>Cow or Buffalo:</strong> counts for up to 7 people</p>
              <p>• <strong>Camel:</strong> counts for up to 7 people</p>
              <p>• Animals must be healthy, free of defects, and meet minimum age requirements</p>
            </InfoCard>
            <InfoCard title="Time of Sacrifice">
              <p>• After Eid prayer on 10 Dhul Hijjah</p>
              <p>• Can be done until Asr on 13 Dhul Hijjah (the 3 days of Tashreeq)</p>
              <p>• Best to perform it on Eid day itself</p>
            </InfoCard>
            <InfoCard title="Distribution">
              <p>• Recommended: ⅓ for yourself/family · ⅓ for relatives · ⅓ for the poor and needy</p>
              <p>• In Guyana: contact CIOG or GIT for community Qurbani arrangements</p>
            </InfoCard>
          </Collapsible>

          <Collapsible title="Takbeeraat of Tashreeq" icon="🔊">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10 rounded-xl p-4 text-center mb-2">
              <p className="font-amiri text-xl text-emerald-900 dark:text-emerald-100 leading-loose">
                ٱللَّٰهُ أَكْبَرُ، ٱللَّٰهُ أَكْبَرُ، لَا إِلَٰهَ إِلَّا ٱللَّٰهُ،<br />
                ٱللَّٰهُ أَكْبَرُ، ٱللَّٰهُ أَكْبَرُ، وَلِلَّٰهِ ٱلْحَمْدُ
              </p>
            </div>
            <InfoCard title="When to Recite">
              <p>• From <strong>Fajr on 9 Dhul Hijjah</strong> until <strong>Asr on 13 Dhul Hijjah</strong></p>
              <p>• Recited aloud after every obligatory prayer (Fard Salah)</p>
              <p>• Wajib (obligatory) according to the Hanafi school for this period</p>
            </InfoCard>
          </Collapsible>

          <Collapsible title="Day of Arafah — Virtues & Fasting" icon="🌟">
            <div className="bg-gradient-to-br from-emerald-50 to-amber-50 dark:from-emerald-900/20 dark:to-yellow-900/10 rounded-xl p-4 mb-2 text-center">
              <p className="text-xs text-emerald-700 dark:text-emerald-400 italic">"Fasting on the Day of Arafah expiates the sins of two years — the previous year and the coming year." — Muslim</p>
            </div>
            <InfoCard title="9 Dhul Hijjah — Day of Arafah">
              <p>• The most blessed day of the Islamic year (after Eid days)</p>
              <p>• Pilgrims gather on the plains of Arafah — the climax of Hajj</p>
              <p>• Muslims not on Hajj are encouraged to <strong>fast this day</strong></p>
              <p>• Make abundant dua, dhikr, and istighfar</p>
            </InfoCard>
            <InfoCard title="Best Duas on Arafah">
              <p className="font-amiri text-base text-emerald-900 dark:text-emerald-100 mb-1">لَا إِلَٰهَ إِلَّا ٱللَّٰهُ وَحْدَهُ لَا شَرِيكَ لَهُ</p>
              <p className="italic">"La ilaha illallahu wahdahu la sharika lah, lahul mulku wa lahul hamdu wa huwa 'ala kulli shay'in qadir"</p>
              <p className="mt-1 text-[10px] text-emerald-600 dark:text-emerald-400">— Best dhikr to repeat on Arafah (Tirmidhi)</p>
            </InfoCard>
          </Collapsible>

        </div>
      )}

      {/* ── ISLAMIC TAB ── */}
      {tab === 'islamic' && (
        <div className="space-y-3">

          <Collapsible title="The Five Pillars of Islam" icon="🕋">
            {[
              { n: 1, name: 'Shahada — Declaration of Faith', ar: 'لَا إِلَٰهَ إِلَّا ٱللَّٰهُ مُحَمَّدٌ رَسُولُ ٱللَّٰهِ', tr: 'There is no god but Allah, and Muhammad ﷺ is His messenger.' },
              { n: 2, name: 'Salah — Prayer', ar: '', tr: 'Pray five times daily: Fajr · Dhuhr · Asr · Maghrib · Isha' },
              { n: 3, name: 'Zakat — Obligatory Charity', ar: '', tr: '2.5% of savings held for one lunar year, given to those in need.' },
              { n: 4, name: 'Sawm — Fasting', ar: '', tr: 'Fast the month of Ramadan from Fajr to Maghrib.' },
              { n: 5, name: 'Hajj — Pilgrimage', ar: '', tr: 'Pilgrimage to Makkah once in a lifetime if able.' },
            ].map(p => (
              <div key={p.n} className="bg-warm-50 dark:bg-gray-700/30 rounded-xl p-3 mb-2 last:mb-0">
                <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1">{p.n}. {p.name}</p>
                {p.ar && <p className="font-amiri text-base text-emerald-900 dark:text-emerald-100 mb-1">{p.ar}</p>}
                <p className="text-xs text-gray-600 dark:text-gray-400">{p.tr}</p>
              </div>
            ))}
          </Collapsible>

          <Collapsible title="Daily Adhkar — Morning & Evening" icon="📿">
            <InfoCard title="Morning Adhkar (after Fajr)">
              <p>• <strong>Ayatul Kursi</strong> × 1 — protection throughout the day</p>
              <p>• <strong>Surah Al-Ikhlas, Al-Falaq, An-Nas</strong> × 3 each</p>
              <p>• <strong>SubhanAllah × 33, Alhamdulillah × 33, Allahu Akbar × 34</strong></p>
              <p>• <strong>Astaghfirullah × 100</strong> — seeking forgiveness</p>
              <p>• Dua: "Allahumma inni as'aluka 'ilman nafi'an wa rizqan tayyiban wa 'amalan mutaqabbalan"</p>
            </InfoCard>
            <InfoCard title="Evening Adhkar (after Asr)">
              <p>• <strong>Ayatul Kursi</strong> × 1</p>
              <p>• <strong>Surah Al-Ikhlas, Al-Falaq, An-Nas</strong> × 3 each</p>
              <p>• <strong>SubhanAllah wa bihamdihi × 100</strong></p>
              <p>• <strong>Salawat upon the Prophet ﷺ</strong> — Allahumma salli 'ala Muhammad</p>
            </InfoCard>
          </Collapsible>

          <Collapsible title="Essential Duas" icon="🤲">
            {[
              { label: 'Before eating', ar: 'بِسْمِ ٱللَّٰهِ', tr: 'Bismillah — In the name of Allah' },
              { label: 'After eating', ar: 'ٱلْحَمْدُ لِلَّٰهِ', tr: 'Alhamdulillah — All praise is due to Allah' },
              { label: 'Entering home', ar: 'بِسْمِ اللَّهِ وَلَجْنَا وَبِسْمِ اللَّهِ خَرَجْنَا وَعَلَى رَبِّنَا تَوَكَّلْنَا', tr: "Bismillahi walajna wa bismillahi kharajna wa 'ala Rabbina tawakkalna — In the name of Allah we enter, in the name of Allah we leave, and in our Lord we trust" },
              { label: 'Before sleeping', ar: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا', tr: "Bismika Allahumma amutu wa ahya — In Your name, O Allah, I die and I live" },
              { label: 'Waking up', ar: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا', tr: 'Alhamdulillahil-lathee ahyana ba\'da ma amatana wa ilayhin-nushur' },

              { label: 'Entering masjid', ar: 'ٱللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ', tr: 'Allahummaf-tah li abwaba rahmatik — O Allah, open for me the doors of Your mercy' },
              { label: 'For anxiety / distress', ar: 'حَسْبُنَا ٱللَّٰهُ وَنِعْمَ ٱلْوَكِيلُ', tr: 'HasbunAllahu wa ni\'mal wakeel — Allah is sufficient for us and He is the best disposer of affairs' },
            ].map(d => (
              <div key={d.label} className="bg-warm-50 dark:bg-gray-700/30 rounded-xl p-3 mb-2 last:mb-0">
                <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-1">{d.label}</p>
                <p className="font-amiri text-lg text-emerald-900 dark:text-emerald-100 leading-relaxed mb-1">{d.ar}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 italic">{d.tr}</p>
              </div>
            ))}
          </Collapsible>

          <Collapsible title="How to Perform Salah" icon="🙏">
            <InfoCard>
              <p className="font-semibold text-emerald-800 dark:text-emerald-300 mb-1">Number of Rak'ahs</p>
              <p>• Fajr: 2 · Dhuhr: 4 · Asr: 4 · Maghrib: 3 · Isha: 4</p>
            </InfoCard>
            <InfoCard title="Steps of Salah">
              <p>1. <strong>Niyyah</strong> — make intention in your heart</p>
              <p>2. <strong>Takbiratul Ihram</strong> — raise hands, say "Allahu Akbar"</p>
              <p>3. <strong>Qiyam</strong> — standing, recite Al-Fatiha + a surah</p>
              <p>4. <strong>Ruku'</strong> — bow, say "SubhanAllahi Rabbil 'Adheem" × 3</p>
              <p>5. <strong>I'tidal</strong> — stand up, say "Sami' Allahu liman hamidah"</p>
              <p>6. <strong>Sujud</strong> — prostrate, say "SubhanAllahi Rabbil A'la" × 3</p>
              <p>7. <strong>Julus</strong> — sit between prostrations</p>
              <p>8. Repeat sujud, then complete remaining rak'ahs</p>
              <p>9. <strong>Tashahhud</strong> — sitting after 2nd rak'ah (and last)</p>
              <p>10. <strong>Tasleem</strong> — "Assalamu 'alaykum wa rahmatullah" to both sides</p>
            </InfoCard>
          </Collapsible>

          <Collapsible title="Zakat Guide" icon="💰">
            <InfoCard title="Zakat on Savings (Zakat Al-Mal)">
              <p>• <strong>Rate:</strong> 2.5% of total eligible wealth</p>
              <p>• <strong>Nisab (minimum threshold):</strong> ~85g of gold or ~595g of silver</p>
              <p>• <strong>Condition:</strong> Wealth must have been held for one full lunar year (hawl)</p>
              <p>• <strong>Eligible wealth:</strong> Cash, savings, gold/silver, trade goods</p>
            </InfoCard>
            <InfoCard title="Who Receives Zakat?">
              <p>The Quran (9:60) designates 8 categories: the poor, the needy, Zakat workers, those whose hearts are to be reconciled, freeing captives, those in debt, in the cause of Allah, and the traveller in need.</p>
            </InfoCard>
            <InfoCard title="In Guyana">
              <p>• CIOG and GIT both facilitate Zakat collection and distribution</p>
              <p>• Contact CIOG: 📞 226-7495 · GIT: 📞 227-0115</p>
            </InfoCard>
          </Collapsible>

          <Collapsible title="Islamic Organizations in Guyana" icon="🇬🇾">
            <div className="space-y-2">
              <div className="bg-warm-50 dark:bg-gray-700/30 rounded-xl p-3">
                <h4 className="font-bold text-emerald-800 dark:text-emerald-300 text-sm mb-1">Guyana Islamic Trust (GIT)</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">N ½ Lot 321, East Street, N/Cummingsburg, Georgetown</p>
                <div className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
                  <p className="flex items-center gap-1"><Phone className="w-3 h-3 text-emerald-600" /> 227-0115 / 225-5934 / 227-3274</p>
                  <p className="flex items-center gap-1"><Mail className="w-3 h-3 text-emerald-600" /> gits@guyana.net.gy</p>
                  <a href="https://www.facebook.com/GuyanaIslamicTrust/" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline">
                    <ExternalLink className="w-3 h-3" /> Facebook Page
                  </a>
                </div>
              </div>
              <div className="bg-warm-50 dark:bg-gray-700/30 rounded-xl p-3">
                <h4 className="font-bold text-emerald-800 dark:text-emerald-300 text-sm mb-1">CIOG — Central Islamic Organisation of Guyana</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Woolford Avenue, Thomas Lands, Georgetown</p>
                <div className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
                  <p className="flex items-center gap-1"><Phone className="w-3 h-3 text-emerald-600" /> 226-7495</p>
                  <p>Regular Ramadan programs and Iftaar coordination</p>
                </div>
              </div>
              <div className="bg-warm-50 dark:bg-gray-700/30 rounded-xl p-3">
                <h4 className="font-bold text-emerald-800 dark:text-emerald-300 text-sm mb-1">Muslim Youth Organisation (MYO)</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Woolford Avenue, Thomas Lands, Georgetown</p>
                <div className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
                  <p>Hosts National Ramadan Village and youth programs annually</p>
                </div>
              </div>
            </div>
          </Collapsible>

          <Collapsible title="Quran Recitation — Listen Online" icon="🎧">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Listen to the Quran with a variety of reciters online or on YouTube.</p>
            <div className="space-y-2">
              {[
                { name: 'quran.com — Listen / Radio',   url: 'https://quran.com/ar/listen',         desc: 'Full Quran player — choose any reciter, surah by surah',       badge: 'Multi-reciter' },
                { name: 'Mishary Rashid Alafasy',        url: 'https://www.youtube.com/@alafasyofficial', desc: 'One of the most beloved voices in Quran recitation',        badge: 'YouTube' },
                { name: 'Abdul Rahman Al-Sudais',        url: 'https://www.youtube.com/@alsudays',   desc: 'Imam of Masjid Al-Haram, Makkah',                              badge: 'YouTube' },
                { name: 'Maher Al Muaiqly',              url: 'https://www.youtube.com/@MaherAlMuaiqlyOfficial', desc: 'Lead Imam of Masjid Al-Haram — calm, clear recitation', badge: 'YouTube' },
                { name: 'Saud Al-Shuraim',               url: 'https://www.youtube.com/@saudshuraim', desc: 'Former Imam of Masjid Al-Haram, Makkah',                     badge: 'YouTube' },
                { name: 'Muhammad Al-Luhaidan',          url: 'https://www.youtube.com/results?search_query=muhammad+luhaidan+quran', desc: 'Deep, powerful voice — highly popular for Tahajjud', badge: 'YouTube' },
                { name: 'mp3quran.net — Download MP3s',  url: 'https://mp3quran.net/eng/',           desc: 'Free high-quality MP3 downloads — 150+ reciters',               badge: 'Download' },
              ].map(r => (
                <a key={r.name} href={r.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-warm-50 dark:bg-gray-700/30 rounded-xl p-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors group">
                  <div className="shrink-0 w-8 h-8 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg flex items-center justify-center text-base">
                    🎵
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 group-hover:underline truncate">{r.name}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-snug">{r.desc}</p>
                  </div>
                  <span className="shrink-0 text-[9px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded-full">{r.badge}</span>
                </a>
              ))}
            </div>
          </Collapsible>

          <Collapsible title="Trusted Online Resources" icon="🌐">
            <div className="space-y-2">
              {[
                { name: 'IslamQA',          url: 'https://islamqa.info',           desc: 'Scholarly answers on Islamic rulings' },
                { name: 'SeekersGuidance',  url: 'https://seekersguidance.org',    desc: 'Free Islamic courses and Q&A' },
                { name: 'Sunnah.com',       url: 'https://sunnah.com',             desc: 'Complete hadith collections in Arabic & English' },
                { name: 'Quran.com',        url: 'https://quran.com',              desc: 'Quran with translation, recitation & tafsir' },
                { name: 'IslamicFinder',    url: 'https://islamicfinder.org',      desc: 'Prayer times, masjid finder, Qibla direction' },
              ].map(r => (
                <a key={r.name} href={r.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-warm-50 dark:bg-gray-700/30 rounded-xl p-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors group">
                  <div className="shrink-0 w-8 h-8 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg flex items-center justify-center">
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 group-hover:underline">{r.name}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">{r.desc}</p>
                  </div>
                </a>
              ))}
            </div>
          </Collapsible>

          <Collapsible title="Islamic Lectures — Audio Series" icon="🎧">
            <LecturesSection />
          </Collapsible>

          <Collapsible title="Islamic Library — Free PDFs" icon="📖">
            <IslamicLibrary />
          </Collapsible>

        </div>
      )}
      </div>
    </div>
  );
}
