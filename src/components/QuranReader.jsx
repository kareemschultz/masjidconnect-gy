import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Bookmark, BookmarkCheck, Play, Pause, Search, X, Loader2, Volume2, RefreshCw, WifiOff, BookOpen, Flame, BarChart3 } from 'lucide-react';
import { surahs, QURAN_API, AUDIO_CDN } from '../data/quranMeta';
import { getTrackingToday, updateTrackingData } from '../hooks/useRamadanTracker';

const BOOKMARKS_KEY = 'quran_bookmarks';
const LAST_READ_KEY = 'quran_last_read';
const RECITER_KEY = 'quran_reciter';
const STATS_KEY = 'quran_stats';
const CACHE_PREFIX = 'quran_cache_';

function getBookmarks() {
  try { return JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || '[]'); } catch { return []; }
}
function saveBookmarks(bm) { localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bm)); }
function getLastRead() {
  try { return JSON.parse(localStorage.getItem(LAST_READ_KEY) || 'null'); } catch { return null; }
}
function saveLastRead(data) { localStorage.setItem(LAST_READ_KEY, JSON.stringify(data)); }

// ─── Stats helpers ──────────────────────────────────────────────────────────────
function getStats() {
  try { return JSON.parse(localStorage.getItem(STATS_KEY) || '{}'); } catch { return {}; }
}
function saveStats(stats) { localStorage.setItem(STATS_KEY, JSON.stringify(stats)); }

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function recordReadingDay() {
  const stats = getStats();
  if (!stats.readDays) stats.readDays = [];
  const today = getToday();
  if (!stats.readDays.includes(today)) {
    stats.readDays.push(today);
    // Keep only last 365 days
    if (stats.readDays.length > 365) stats.readDays = stats.readDays.slice(-365);
  }
  saveStats(stats);
}

function markSurahRead(surahNumber) {
  const stats = getStats();
  if (!stats.surahsRead) stats.surahsRead = [];
  if (!stats.surahsRead.includes(surahNumber)) {
    stats.surahsRead.push(surahNumber);
  }
  saveStats(stats);

  // Sync to daily tracking record for buddy system points
  const today = getTrackingToday();
  const existing = today.quran_data || {};
  const currentSurahs = existing.surahs || [];
  if (!currentSurahs.includes(surahNumber)) {
    updateTrackingData({
      quran: true,
      quran_data: { surahs: [...currentSurahs, surahNumber] },
    });
  }
}

function getStreak() {
  const stats = getStats();
  const days = (stats.readDays || []).sort();
  if (days.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  const checkDate = new Date(today);

  for (let i = 0; i < 365; i++) {
    const dateStr = checkDate.toISOString().slice(0, 10);
    if (days.includes(dateStr)) {
      streak++;
    } else if (i > 0) {
      break;
    }
    checkDate.setDate(checkDate.getDate() - 1);
  }
  return streak;
}

// ─── Cache helpers ──────────────────────────────────────────────────────────────
function getCachedSurah(surahNumber) {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${surahNumber}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}
function cacheSurah(surahNumber, ayahs) {
  try {
    localStorage.setItem(`${CACHE_PREFIX}${surahNumber}`, JSON.stringify({ ayahs, ts: Date.now() }));
  } catch {
    // localStorage full — silently skip
  }
}

// ─── Fetch with retry ───────────────────────────────────────────────────────────
async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.json();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
}

// ─── Surah List ────────────────────────────────────────────────────────────────
function SurahList() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | meccan | medinan | bookmarked
  const navigate = useNavigate();
  const lastRead = getLastRead();
  const bookmarks = getBookmarks();
  const bookmarkedSurahs = [...new Set(bookmarks.map(b => b.surah))];

  const stats = getStats();
  const surahsReadCount = (stats.surahsRead || []).length;
  const streak = getStreak();

  const filtered = useMemo(() => {
    let list = surahs;
    if (filter === 'meccan') list = list.filter(s => s.revelationType === 'Meccan');
    if (filter === 'medinan') list = list.filter(s => s.revelationType === 'Medinan');
    if (filter === 'bookmarked') list = list.filter(s => bookmarkedSurahs.includes(s.number));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.englishName.toLowerCase().includes(q) ||
        s.englishNameTranslation.toLowerCase().includes(q) ||
        s.name.includes(search) ||
        String(s.number) === q
      );
    }
    return list;
  }, [search, filter]);

  return (
    <div className="px-4 py-5 max-w-2xl mx-auto pb-safe">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-emerald-900 dark:text-emerald-100 font-amiri">
            القرآن الكريم
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">The Noble Quran</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-400 dark:text-gray-500">114 Surahs · 6,236 Ayahs</p>
        </div>
      </div>

      {/* Stats bar */}
      {(surahsReadCount > 0 || streak > 0) && (
        <div className="flex gap-2 mb-4">
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50 p-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-100">{surahsReadCount}</p>
              <p className="text-[10px] text-gray-400">Surahs Read</p>
            </div>
          </div>
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50 p-3 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500 dark:text-orange-400 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-100">{streak} day{streak !== 1 ? 's' : ''}</p>
              <p className="text-[10px] text-gray-400">Reading Streak</p>
            </div>
          </div>
        </div>
      )}

      {/* Last read */}
      {lastRead && (
        <button
          onClick={() => navigate(`/quran/${lastRead.surah}?ayah=${lastRead.ayah}`)}
          className="w-full mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-4 text-white text-left"
        >
          <p className="text-[10px] uppercase tracking-wider text-emerald-200 mb-1">Continue Reading</p>
          <p className="font-bold text-sm">{surahs[lastRead.surah - 1]?.englishName} — Ayah {lastRead.ayah}</p>
        </button>
      )}

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search surah name or number..."
          className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          aria-label="Search surahs"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto scrollbar-hide pb-1">
        {[
          { id: 'all', label: 'All' },
          { id: 'meccan', label: 'Meccan' },
          { id: 'medinan', label: 'Medinan' },
          { id: 'bookmarked', label: `🔖 Saved (${bookmarkedSurahs.length})` },
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all ${filter === f.id ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Surah list */}
      <div className="space-y-1.5">
        {filtered.map(surah => (
          <button
            key={surah.number}
            onClick={() => navigate(`/quran/${surah.number}`)}
            className="w-full flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl px-3 py-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors text-left group border border-gray-100 dark:border-gray-700/50"
          >
            <span className="shrink-0 w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center justify-center">
              {surah.number}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{surah.englishName}</p>
                <p className="font-amiri text-base text-emerald-800 dark:text-emerald-300">{surah.name}</p>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-gray-400 dark:text-gray-500">{surah.englishNameTranslation}</span>
                <span className="text-[10px] text-gray-300 dark:text-gray-600">·</span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500">{surah.numberOfAyahs} ayahs</span>
                <span className="text-[10px] text-gray-300 dark:text-gray-600">·</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${surah.revelationType === 'Meccan' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'}`}>
                  {surah.revelationType}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="text-center text-sm text-gray-400 py-8">No surahs found</p>
      )}
    </div>
  );
}

// ─── Surah Reader ──────────────────────────────────────────────────────────────
function SurahReader() {
  const { surahNumber } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const num = parseInt(surahNumber, 10);
  const surah = surahs.find(s => s.number === num);

  const [ayahs, setAyahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fromCache, setFromCache] = useState(false);
  const [bookmarks, setBookmarks] = useState(getBookmarks);
  const [playingAyah, setPlayingAyah] = useState(null);
  const [currentAyah, setCurrentAyah] = useState(1);
  const [fontSize, setFontSize] = useState(() => {
    try { return parseInt(localStorage.getItem('quran_font_size') || '24', 10); } catch { return 24; }
  });
  const audioRef = useRef(null);
  const ayahRefs = useRef({});
  const observerRef = useRef(null);
  const saveTimerRef = useRef(null);
  const hasScrolledRef = useRef(false);
  const containerRef = useRef(null);

  // Cumulative verse number mapping (for audio CDN)
  const [verseOffset, setVerseOffset] = useState(0);

  useEffect(() => {
    let offset = 0;
    for (let i = 0; i < num - 1; i++) {
      offset += surahs[i].numberOfAyahs;
    }
    setVerseOffset(offset);
  }, [num]);

  // ─── Fetch surah with cache + retry ────────────────────────────────────────
  const fetchSurah = useCallback(async () => {
    if (!surah) return;
    setError('');

    // Try cache first — show instantly
    const cached = getCachedSurah(num);
    if (cached && cached.ayahs) {
      setAyahs(cached.ayahs);
      setFromCache(true);
      setLoading(false);
    } else {
      setLoading(true);
      setAyahs([]);
    }

    // Fetch fresh data (background refresh if cache hit)
    try {
      const data = await fetchWithRetry(`${QURAN_API}/surah/${num}/editions/quran-uthmani,en.sahih`);
      if (data.code === 200 && data.data) {
        const arabic = data.data[0].ayahs;
        const english = data.data[1].ayahs;
        const merged = arabic.map((a, i) => ({
          number: a.numberInSurah,
          globalNumber: a.number,
          arabic: a.text,
          translation: english[i]?.text || '',
          juz: a.juz,
          page: a.page,
        }));
        setAyahs(merged);
        setFromCache(false);
        cacheSurah(num, merged);
        recordReadingDay();
      } else if (!cached) {
        setError('Failed to load surah. The server returned an unexpected response.');
      }
    } catch {
      if (!cached) {
        setError('Network error. Could not reach the Quran API after 3 attempts.');
      }
      // If we have cached data, keep showing it — no error needed
    } finally {
      setLoading(false);
    }
  }, [num, surah]);

  useEffect(() => {
    hasScrolledRef.current = false;
    fetchSurah();
  }, [fetchSurah]);

  // ─── Auto-scroll to last read ayah ─────────────────────────────────────────
  useEffect(() => {
    if (ayahs.length === 0 || hasScrolledRef.current) return;

    const targetAyah = parseInt(searchParams.get('ayah'), 10) || 1;
    if (targetAyah > 1) {
      // Small delay to let DOM render
      const timer = setTimeout(() => {
        const el = ayahRefs.current[targetAyah];
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        hasScrolledRef.current = true;
      }, 300);
      return () => clearTimeout(timer);
    }
    hasScrolledRef.current = true;
  }, [ayahs, searchParams]);

  // ─── IntersectionObserver for scroll-based progress tracking ───────────────
  useEffect(() => {
    if (ayahs.length === 0) return;

    // Disconnect previous observer
    if (observerRef.current) observerRef.current.disconnect();

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost visible ayah
        let topAyah = null;
        let topY = Infinity;
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const rect = entry.boundingClientRect;
            if (rect.top < topY && rect.top >= -100) {
              topY = rect.top;
              topAyah = parseInt(entry.target.dataset.ayah, 10);
            }
          }
        });
        if (topAyah && topAyah !== currentAyah) {
          setCurrentAyah(topAyah);
        }
      },
      { threshold: 0.3, rootMargin: '-10% 0px -60% 0px' }
    );

    observerRef.current = observer;

    // Observe all ayah elements
    Object.values(ayahRefs.current).forEach(el => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [ayahs]);

  // ─── Debounced save of reading position (every 2s) ─────────────────────────
  useEffect(() => {
    if (!surah || ayahs.length === 0) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveLastRead({ surah: num, ayah: currentAyah, timestamp: Date.now() });
      recordReadingDay();

      // Mark surah as read if past 90%
      if (currentAyah > surah.numberOfAyahs * 0.9) {
        markSurahRead(num);
      }
    }, 2000);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [currentAyah, num, surah, ayahs.length]);

  const toggleBookmark = (ayahNum) => {
    const key = `${num}:${ayahNum}`;
    let bm = getBookmarks();
    const idx = bm.findIndex(b => b.key === key);
    if (idx >= 0) {
      bm.splice(idx, 1);
    } else {
      bm.push({ key, surah: num, ayah: ayahNum, surahName: surah.englishName, timestamp: Date.now() });
    }
    saveBookmarks(bm);
    setBookmarks(bm);
  };

  const isBookmarked = (ayahNum) => bookmarks.some(b => b.key === `${num}:${ayahNum}`);

  const playAyah = (ayahNum) => {
    const globalNum = verseOffset + ayahNum;
    const url = `${AUDIO_CDN}/128/ar.alafasy/${globalNum}.mp3`;
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (playingAyah === ayahNum) {
      setPlayingAyah(null);
      return;
    }
    const a = new Audio(url);
    audioRef.current = a;
    setPlayingAyah(ayahNum);
    a.play().catch(() => setPlayingAyah(null));
    a.onended = () => setPlayingAyah(null);
  };

  const changeFontSize = (delta) => {
    const next = Math.max(16, Math.min(40, fontSize + delta));
    setFontSize(next);
    localStorage.setItem('quran_font_size', String(next));
  };

  // Assign ref callback for each ayah element
  const setAyahRef = useCallback((ayahNum, el) => {
    ayahRefs.current[ayahNum] = el;
  }, []);

  if (!surah) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-gray-500">Surah not found</p>
        <Link to="/quran" className="text-emerald-600 text-sm mt-2 inline-block">Back to list</Link>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="px-4 py-5 max-w-2xl mx-auto pb-safe">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => navigate('/quran')} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Back to surah list">
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="flex-1 min-w-0 text-center">
          <h2 className="font-amiri text-xl text-emerald-900 dark:text-emerald-100">{surah.name}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">{surah.englishName} — {surah.englishNameTranslation}</p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500">{surah.numberOfAyahs} Ayahs · {surah.revelationType}</p>
        </div>
        <div className="flex gap-1">
          <button onClick={() => changeFontSize(-2)} className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500" aria-label="Decrease font size">A-</button>
          <button onClick={() => changeFontSize(2)} className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500" aria-label="Increase font size">A+</button>
        </div>
      </div>

      {/* Cache indicator */}
      {fromCache && !loading && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-xs text-amber-700 dark:text-amber-400">
          <WifiOff className="w-3.5 h-3.5 shrink-0" />
          <span>Showing cached version</span>
        </div>
      )}

      {/* Bismillah (except Surah 1 and 9) */}
      {num !== 1 && num !== 9 && (
        <div className="text-center py-4 mb-4 border-b border-gray-100 dark:border-gray-800">
          <p className="font-amiri text-2xl text-emerald-800 dark:text-emerald-300" style={{ fontSize: fontSize + 4 }}>
            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">In the name of Allah, the Most Gracious, the Most Merciful</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          <span className="ml-2 text-sm text-gray-500">Loading surah...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-8 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-200 dark:border-red-800/30 mx-2">
          <WifiOff className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <p className="text-red-600 dark:text-red-400 text-sm mb-1 font-medium">Connection Failed</p>
          <p className="text-red-500/70 dark:text-red-400/60 text-xs mb-4 px-4">{error}</p>
          <button
            onClick={fetchSurah}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      )}

      {/* Ayahs */}
      <div className="space-y-4">
        {ayahs.map(ayah => (
          <div
            key={ayah.number}
            ref={el => setAyahRef(ayah.number, el)}
            data-ayah={ayah.number}
            id={`ayah-${ayah.number}`}
            className={`bg-white dark:bg-gray-800 rounded-2xl p-4 border transition-colors ${isBookmarked(ayah.number) ? 'border-amber-300 dark:border-amber-700' : 'border-gray-100 dark:border-gray-700/50'}`}
          >
            {/* Ayah number + actions */}
            <div className="flex items-center justify-between mb-3">
              <span className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center justify-center">
                {ayah.number}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => playAyah(ayah.number)}
                  className={`p-1.5 rounded-full transition-colors ${playingAyah === ayah.number ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-emerald-100'}`}
                  aria-label={playingAyah === ayah.number ? 'Stop audio' : 'Play audio'}
                >
                  {playingAyah === ayah.number ? <Pause className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => toggleBookmark(ayah.number)}
                  className={`p-1.5 rounded-full transition-colors ${isBookmarked(ayah.number) ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:bg-amber-50'}`}
                  aria-label={isBookmarked(ayah.number) ? 'Remove bookmark' : 'Add bookmark'}
                >
                  {isBookmarked(ayah.number) ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Arabic text */}
            <p
              className="font-amiri text-right leading-[2] text-emerald-900 dark:text-emerald-100 mb-3"
              style={{ fontSize }}
              dir="rtl"
              lang="ar"
            >
              {ayah.arabic}
            </p>

            {/* Translation */}
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-50 dark:border-gray-700/50 pt-3">
              {ayah.translation}
            </p>

            {/* Meta */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] text-gray-400">Juz {ayah.juz}</span>
              <span className="text-[10px] text-gray-300 dark:text-gray-600">·</span>
              <span className="text-[10px] text-gray-400">Page {ayah.page}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      {!loading && ayahs.length > 0 && (
        <div className="flex items-center justify-between mt-6 pb-4">
          {num > 1 ? (
            <button
              onClick={() => { navigate(`/quran/${num - 1}`); window.scrollTo(0, 0); }}
              className="flex items-center gap-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm text-gray-700 dark:text-gray-300"
            >
              <ChevronLeft className="w-4 h-4" /> {surahs[num - 2].englishName}
            </button>
          ) : <div />}
          {num < 114 ? (
            <button
              onClick={() => { navigate(`/quran/${num + 1}`); window.scrollTo(0, 0); }}
              className="flex items-center gap-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-sm text-white"
            >
              {surahs[num].englishName} <ChevronRight className="w-4 h-4" />
            </button>
          ) : <div />}
        </div>
      )}

      {/* Floating ayah indicator */}
      {ayahs.length > 0 && !loading && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 pointer-events-none" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <div className="bg-gray-900/80 dark:bg-gray-100/90 backdrop-blur-sm text-white dark:text-gray-900 text-xs px-3 py-1.5 rounded-full shadow-lg">
            Ayah {currentAyah} of {surah.numberOfAyahs}
          </div>
        </div>
      )}

      {/* Hidden audio element */}
      <audio ref={audioRef} />
    </div>
  );
}

// ─── Main Export ────────────────────────────────────────────────────────────────
export default function QuranReader() {
  const { surahNumber } = useParams();
  return surahNumber ? <SurahReader /> : <SurahList />;
}
