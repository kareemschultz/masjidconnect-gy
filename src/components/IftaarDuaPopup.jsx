import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getSecondsUntilIftaar } from '../data/ramadanTimetable';

const STORAGE_KEY = 'iftaar_dua_shown_';

export default function IftaarDuaPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const shownToday = localStorage.getItem(STORAGE_KEY + today);
    if (shownToday) return;

    const checkTime = () => {
      const secs = getSecondsUntilIftaar();
      // Show popup when iftaar time arrives (within first 2 minutes)
      if (secs !== null && secs <= 0 && secs > -120) {
        setVisible(true);
        localStorage.setItem(STORAGE_KEY + today, '1');
      }
    };

    checkTime();
    const id = setInterval(checkTime, 30000);
    return () => clearInterval(id);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Iftaar Dua"
      onClick={(e) => { if (e.target === e.currentTarget) setVisible(false); }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center relative">
        <button
          onClick={() => setVisible(false)}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>

        <p className="text-4xl mb-3">🌇</p>
        <h2 className="font-bold text-emerald-900 dark:text-emerald-100 text-lg mb-1 font-amiri">
          Iftaar Time — Break Your Fast!
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          May Allah accept your fast
        </p>

        <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-xl p-4 mb-3">
          <p className="font-amiri text-xl text-emerald-900 dark:text-emerald-100 leading-relaxed mb-2" dir="rtl">
            اللَّهُمَّ لَكَ صُمْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ
          </p>
          <p className="text-xs text-emerald-700 dark:text-emerald-300 italic mb-1">
            Allahumma laka sumtu wa ʿala rizqika aftartu
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            O Allah! For You I fasted and upon Your provision I break my fast.
          </p>
        </div>

        <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-4">Abu Dawud 2358</p>

        <button
          onClick={() => setVisible(false)}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors"
        >
          بِسْمِ اللَّهِ — Begin Iftaar
        </button>
      </div>
    </div>
  );
}
