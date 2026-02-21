import { useState } from 'react';
import { getVerseOfTheDay } from '../data/adhkarData';
import { Link } from 'react-router-dom';
import { BookOpen, RefreshCw } from 'lucide-react';

export default function VerseOfTheDay() {
  const verse = getVerseOfTheDay();
  const [showArabic, setShowArabic] = useState(true);

  return (
    <div>
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/30 p-4 relative overflow-hidden">
        {/* Decorative pattern */}
        <div className="absolute top-0 right-0 w-20 h-20 opacity-5">
          <svg viewBox="0 0 100 100" className="w-full h-full fill-emerald-900">
            <text x="50" y="65" textAnchor="middle" fontSize="60">☪</text>
          </svg>
        </div>

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Verse of the Day
            </span>
          </div>
          <Link
            to={`/quran/${verse.ref.split(':')[0]}`}
            className="text-[10px] text-emerald-500 hover:text-emerald-700 font-medium"
          >
            {verse.surah} {verse.ref}
          </Link>
        </div>

        <button
          onClick={() => setShowArabic(!showArabic)}
          className="w-full text-left"
        >
          {showArabic ? (
            <p className="text-lg font-amiri text-gray-800 dark:text-gray-100 leading-relaxed text-right" dir="rtl">
              {verse.arabic}
            </p>
          ) : null}
          <p className={`text-sm text-gray-600 dark:text-gray-300 italic ${showArabic ? 'mt-2' : ''}`}>
            "{verse.translation}"
          </p>
        </button>
      </div>
    </div>
  );
}
