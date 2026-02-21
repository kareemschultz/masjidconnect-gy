import React, { useState, useCallback } from 'react';
import { qaidaLessons, MAKHRAJ_GROUPS, LETTER_FORMS } from '../data/qaidaData';
import { ChevronLeft, Volume2, Eye, RotateCcw, ChevronRight, Gauge } from 'lucide-react';
import { Link } from 'react-router-dom';
import { updateTrackingData, getTrackingToday } from '../hooks/useRamadanTracker';

const MADRASA_KEY = 'madrasa_completed';

function getCompletedLessons() {
  try { return JSON.parse(localStorage.getItem(MADRASA_KEY) || '[]'); } catch { return []; }
}

function markLessonCompleted(lessonId) {
  const completed = getCompletedLessons();
  if (!completed.includes(lessonId)) {
    completed.push(lessonId);
    localStorage.setItem(MADRASA_KEY, JSON.stringify(completed));
    // Sync to tracking for points
    const today = getTrackingToday();
    const existing = today.madrasa_data || {};
    const currentLessons = existing.lessons || [];
    if (!currentLessons.includes(lessonId)) {
      updateTrackingData({
        madrasa_data: { ...existing, lessons: [...currentLessons, lessonId] },
      });
    }
  }
}

const LetterCard = ({ item, onPlay, slowMode }) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <button
      onClick={() => {
        if (navigator.vibrate) navigator.vibrate(8);
        onPlay(item.arabic);
      }}
      onDoubleClick={() => setFlipped(!flipped)}
      className="aspect-square bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-emerald-100 dark:border-emerald-900/30 flex flex-col items-center justify-center gap-0.5 hover:border-emerald-500 hover:shadow-md transition-all active:scale-95 group relative overflow-hidden"
    >
      {!flipped ? (
        <>
          <span className="text-4xl font-amiri leading-none group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors text-gray-800 dark:text-gray-100">
            {item.arabic}
          </span>
          {item.trans && (
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
              {item.trans}
            </span>
          )}
          <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold">
            {item.name}
          </span>
        </>
      ) : (
        <div className="text-center px-1">
          <span className="text-2xl font-amiri text-emerald-600">{item.arabic}</span>
          <p className="text-[8px] text-gray-500 dark:text-gray-400 leading-tight mt-0.5">{item.makhraj || item.note}</p>
        </div>
      )}
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Volume2 className="w-3 h-3 text-emerald-400" />
      </div>
      {slowMode && (
        <div className="absolute bottom-0.5 left-0.5">
          <Gauge className="w-2.5 h-2.5 text-blue-400" />
        </div>
      )}
      <div className="absolute inset-0 bg-emerald-50 dark:bg-emerald-900/20 opacity-0 group-active:opacity-30 transition-opacity" />
    </button>
  );
};

const HarakatSection = ({ section, onPlay }) => (
  <div className="mb-6 animate-slide-up">
    <div className="flex items-center gap-2 mb-2">
      <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">{section.section}</h3>
    </div>
    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{section.desc}</p>
    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
      {section.examples.map((ex, i) => (
        <button
          key={i}
          onClick={() => { if (navigator.vibrate) navigator.vibrate(8); onPlay(ex.arabic); }}
          className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center gap-1 hover:border-emerald-500 active:scale-95 transition-all group"
        >
          <span className="text-2xl font-amiri group-hover:text-emerald-600 dark:group-hover:text-emerald-400 text-gray-800 dark:text-gray-100">
            {ex.arabic}
          </span>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold">{ex.trans}</span>
        </button>
      ))}
    </div>
  </div>
);

const TajweedSection = ({ section, onPlay }) => (
  <div className="mb-6 animate-slide-up">
    <div className="bg-rose-50 dark:bg-rose-900/20 rounded-xl p-4 border border-rose-100 dark:border-rose-800/30">
      <h3 className="text-sm font-bold text-rose-800 dark:text-rose-300 mb-1">{section.section}</h3>
      <p className="text-xs text-rose-600 dark:text-rose-400 mb-3">{section.desc}</p>
      <div className="space-y-2">
        {section.examples.map((ex, i) => (
          <button
            key={i}
            onClick={() => { if (navigator.vibrate) navigator.vibrate(8); onPlay(ex.arabic); }}
            className="w-full flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg px-4 py-2.5 shadow-sm hover:shadow-md active:scale-[0.98] transition-all group"
          >
            <span className="text-xl font-amiri text-gray-800 dark:text-gray-100 group-hover:text-emerald-600">{ex.arabic}</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold">{ex.trans}</span>
          </button>
        ))}
      </div>
    </div>
  </div>
);

const ProgressBar = ({ current, total }) => (
  <div className="flex items-center gap-2 mb-4">
    <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <div
        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
        style={{ width: `${((current + 1) / total) * 100}%` }}
      />
    </div>
    <span className="text-[10px] font-semibold text-gray-400">{current + 1}/{total}</span>
  </div>
);

const Madrasa = () => {
  const [activeLesson, setActiveLesson] = useState(null);
  const [showMakhraj, setShowMakhraj] = useState(false);
  const [slowMode, setSlowMode] = useState(false);
  const [completedLessons] = useState(getCompletedLessons);

  const playLetter = useCallback((letter) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(letter);
      utterance.lang = 'ar-SA';
      utterance.rate = slowMode ? 0.4 : 0.8;
      window.speechSynthesis.speak(utterance);
    }
  }, [slowMode]);

  const activeLessonIndex = activeLesson ? qaidaLessons.findIndex(l => l.id === activeLesson.id) : -1;
  const prevLesson = activeLessonIndex > 0 ? qaidaLessons[activeLessonIndex - 1] : null;
  const nextLesson = activeLessonIndex < qaidaLessons.length - 1 ? qaidaLessons[activeLessonIndex + 1] : null;

  const handleNextLesson = () => {
    if (activeLesson) markLessonCompleted(activeLesson.id);
    if (nextLesson) {
      setActiveLesson(nextLesson);
      window.scrollTo(0, 0);
    }
  };

  const renderLessonContent = (lesson) => {
    if (lesson.type === 'alphabet' || lesson.type === 'compounds') {
      return (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {lesson.content.map((item, idx) => (
            <LetterCard key={idx} item={item} onPlay={playLetter} slowMode={slowMode} />
          ))}
        </div>
      );
    }

    if (lesson.type === 'tajweed') {
      return lesson.content.map((section, idx) => (
        <TajweedSection key={idx} section={section} onPlay={playLetter} />
      ));
    }

    // harakat, maddah — sectioned content
    return lesson.content.map((section, idx) => (
      <HarakatSection key={idx} section={section} onPlay={playLetter} />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24 page-enter">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 dark:from-emerald-800 dark:to-emerald-900 text-white pt-safe pb-5 px-5 rounded-b-3xl shadow-lg sticky top-0 z-10">
        <div className="flex items-center gap-3 pt-4">
          {activeLesson ? (
            <button
              onClick={() => setActiveLesson(null)}
              className="p-2 -ml-2 hover:bg-emerald-500/30 rounded-full transition-colors"
              aria-label="Back to lessons"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          ) : (
            <Link to="/ramadan" className="p-2 -ml-2 hover:bg-emerald-500/30 rounded-full transition-colors" aria-label="Back to home">
              <ChevronLeft className="w-5 h-5" />
            </Link>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold font-display truncate">
              {activeLesson ? activeLesson.title : 'Madrasa — Noorani Qaida'}
            </h1>
            <p className="text-emerald-100 text-xs truncate">
              {activeLesson ? activeLesson.arabicTitle + ' — ' + activeLesson.subtitle : 'Learn Tajweed & Arabic from the basics'}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {/* Slow mode toggle */}
            <button
              onClick={() => setSlowMode(!slowMode)}
              className={`p-2 rounded-full transition-colors ${slowMode ? 'bg-blue-500/40' : 'hover:bg-emerald-500/20'}`}
              title={slowMode ? 'Slow mode ON (0.4x)' : 'Toggle slow pronunciation'}
            >
              <Gauge className="w-4 h-4" />
            </button>
            {activeLesson?.type === 'alphabet' && (
              <button
                onClick={() => setShowMakhraj(!showMakhraj)}
                className={`p-2 rounded-full transition-colors ${showMakhraj ? 'bg-emerald-500/40' : 'hover:bg-emerald-500/20'}`}
                title="Toggle Makhraj (pronunciation points)"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        {slowMode && (
          <p className="text-[10px] text-blue-200 mt-1 ml-10">Slow pronunciation mode active</p>
        )}
      </div>

      <div className="p-5">
        {/* Audio quality notice */}
        {activeLesson && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 mb-4 border border-blue-100 dark:border-blue-800/30">
            <p className="text-[11px] text-blue-700 dark:text-blue-300">
              Audio uses your device's text-to-speech. Quality varies by device. Use the <strong>Slow</strong> button (<Gauge className="w-3 h-3 inline" />) in the header for slower pronunciation.
            </p>
          </div>
        )}

        {!activeLesson ? (
          /* Lessons List */
          <div className="space-y-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 px-1 mb-2">
              12 lessons from Arabic alphabet to Tajweed rules. Tap to hear, double-tap for details.
            </p>
            {qaidaLessons.map((lesson, idx) => {
              const isCompleted = completedLessons.includes(lesson.id);
              return (
                <button
                  key={lesson.id}
                  onClick={() => setActiveLesson(lesson)}
                  className={`bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border flex items-center gap-3.5 hover:shadow-md transition-all active:scale-[0.98] text-left w-full ${isCompleted ? 'border-emerald-300 dark:border-emerald-700' : 'border-gray-100 dark:border-gray-700'}`}
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-lg ${isCompleted ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600' : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'}`}>
                    {isCompleted ? '✓' : lesson.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">{lesson.id}</span>
                      <h3 className="font-bold text-sm text-gray-800 dark:text-gray-100 truncate">{lesson.title}</h3>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{lesson.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                </button>
              );
            })}

            {/* Makhraj Diagram */}
            <div className="mt-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-800/30">
              <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-300 mb-3">Makhaarij (Pronunciation Points)</h3>
              <div className="space-y-2">
                {MAKHRAJ_GROUPS.map((group) => (
                  <div key={group.name} className="flex items-center gap-3">
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 w-24 shrink-0">{group.name}</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {group.letters.map(l => (
                        <button
                          key={l + group.name}
                          onClick={() => playLetter(l)}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-700 flex items-center justify-center text-sm font-amiri hover:bg-emerald-100 active:scale-90 transition-all text-gray-800 dark:text-gray-100"
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Active Lesson */
          <div>
            <ProgressBar current={activeLessonIndex} total={qaidaLessons.length} />

            {showMakhraj && activeLesson.type === 'alphabet' && (
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 mb-4 border border-amber-100 dark:border-amber-800/30">
                <p className="text-[11px] text-amber-700 dark:text-amber-300">
                  <strong>Double-tap</strong> any letter to see its pronunciation point (Makhraj)
                </p>
              </div>
            )}

            {renderLessonContent(activeLesson)}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
              {prevLesson ? (
                <button
                  onClick={() => { setActiveLesson(prevLesson); window.scrollTo(0, 0); }}
                  className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Lesson {prevLesson.id}</span>
                </button>
              ) : <div />}
              {nextLesson ? (
                <button
                  onClick={handleNextLesson}
                  className="flex items-center gap-1.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl transition-colors active:scale-95"
                >
                  <span>Next: {nextLesson.title}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <Link
                  to="/quran"
                  onClick={() => { if (activeLesson) markLessonCompleted(activeLesson.id); }}
                  className="flex items-center gap-1.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl transition-colors active:scale-95"
                >
                  <span>Start Reading Quran</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Madrasa;
