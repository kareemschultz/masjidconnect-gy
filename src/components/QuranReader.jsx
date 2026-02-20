import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Bookmark, BookmarkCheck, Play, Pause, Search, X, Loader2, Volume2 } from 'lucide-react';
import { surahs, QURAN_API, AUDIO_CDN } from '../data/quranMeta';

const BOOKMARKS_KEY = 'quran_bookmarks';
const LAST_READ_KEY = 'quran_last_read';
const RECITER_KEY = 'quran_reciter';

function getBookmarks() {
  try { return JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || '[]'); } catch { return []; }
}
function saveBookmarks(bm) { localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bm)); }
function getLastRead() {
  try { return JSON.parse(localStorage.getItem(LAST_READ_KEY) || 'null'); } catch { return null; }
}
function saveLastRead(data) { localStorage.setItem(LAST_READ_KEY, JSON.stringify(data)); }

// ─── Surah List ────────────────────────────────────────────────────────────────
function SurahList() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | meccan | medinan | bookmarked
  const navigate = useNavigate();
  const lastRead = getLastRead();
  const bookmarks = getBookmarks();
  const bookmarkedSurahs = [...new Set(bookmarks.map(b => b.surah))];

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
    <div className="px-4 py-5 max-w-2xl mx-auto">
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
  const navigate = useNavigate();
  const num = parseInt(surahNumber, 10);
  const surah = surahs.find(s => s.number === num);

  const [ayahs, setAyahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookmarks, setBookmarks] = useState(getBookmarks);
  const [playingAyah, setPlayingAyah] = useState(null);
  const [fontSize, setFontSize] = useState(() => {
    try { return parseInt(localStorage.getItem('quran_font_size') || '24', 10); } catch { return 24; }
  });
  const audioRef = useRef(null);

  // Cumulative verse number mapping (for audio CDN)
  const [verseOffset, setVerseOffset] = useState(0);

  useEffect(() => {
    // Calculate cumulative verse offset for audio
    let offset = 0;
    for (let i = 0; i < num - 1; i++) {
      offset += surahs[i].numberOfAyahs;
    }
    setVerseOffset(offset);
  }, [num]);

  useEffect(() => {
    if (!surah) return;
    setLoading(true);
    setError('');
    setAyahs([]);

    fetch(`${QURAN_API}/surah/${num}/editions/quran-uthmani,en.sahih`)
      .then(r => r.json())
      .then(data => {
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
          // Save last read
          saveLastRead({ surah: num, ayah: 1, timestamp: Date.now() });
        } else {
          setError('Failed to load surah');
        }
      })
      .catch(() => setError('Network error. Check your connection.'))
      .finally(() => setLoading(false));
  }, [num, surah]);

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

  if (!surah) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-gray-500">Surah not found</p>
        <Link to="/quran" className="text-emerald-600 text-sm mt-2 inline-block">Back to list</Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-5 max-w-2xl mx-auto">
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
        <div className="text-center py-8">
          <p className="text-red-500 text-sm mb-2">{error}</p>
          <button onClick={() => window.location.reload()} className="text-emerald-600 text-sm">Try again</button>
        </div>
      )}

      {/* Ayahs */}
      <div className="space-y-4">
        {ayahs.map(ayah => (
          <div
            key={ayah.number}
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
