import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles, BookOpen, Moon, Sun } from 'lucide-react';
import { duas } from '../data/ramadanTimetable';
import PageHero from './PageHero';

function getCategory(step) {
  if (step <= 4) return 'fasting';
  if (step === 5) return 'night';
  return 'general';
}

const FILTERS = [
  { key: 'all', label: 'All', icon: Sparkles },
  { key: 'fasting', label: 'Fasting', icon: Sun },
  { key: 'night', label: 'Night', icon: Moon },
  { key: 'general', label: 'General', icon: BookOpen },
];

export default function Duas() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedStep, setExpandedStep] = useState(1);

  const allDuas = useMemo(
    () => [
      { ...duas.suhoor, label: 'Intention (Suhoor)', step: 1 },
      { ...duas.beforeBreaking, label: 'Before Breaking', step: 2 },
      { ...duas.whileBreaking, label: 'While Breaking', step: 3 },
      { ...duas.afterBreaking, label: 'After Breaking', step: 4 },
      { ...duas.laylatalQadr, label: 'Laylatul Qadr', step: 5 },
      { ...duas.forgiveness, label: 'Forgiveness', step: 6 },
      { ...duas.general1, label: 'Ramadan Dua', step: 7 },
      { ...duas.general2, label: 'Guidance', step: 8 },
    ],
    []
  );

  const filteredDuas = useMemo(() => {
    if (activeFilter === 'all') return allDuas;
    return allDuas.filter((dua) => getCategory(dua.step) === activeFilter);
  }, [activeFilter, allDuas]);

  return (
    <div className="min-h-screen faith-canvas pb-24 page-enter">
      <PageHero 
        title="Ramadan Duas" 
        subtitle="Supplications from the Sunnah"
        icon={BookOpen}
        color="emerald"
        pattern="organic"
      />

      <main className="mx-auto w-full max-w-3xl px-4 space-y-4">
        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {FILTERS.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                activeFilter === filter.key
                  ? 'bg-emerald-600 text-white shadow-md transform scale-105'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
              }`}
            >
              <filter.icon className="w-3.5 h-3.5" />
              {filter.label}
            </button>
          ))}
        </div>

        {/* Masonry/Grid Layout */}
        <div className="grid grid-cols-1 gap-3">
          {filteredDuas.map((dua, index) => {
            const isExpanded = expandedStep === dua.step;
            const category = getCategory(dua.step);
            
            return (
              <article
                key={dua.step}
                className={`mc-card overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-2 ring-emerald-500/50 shadow-lg scale-[1.01]' : 'hover:shadow-md'}`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <button
                  onClick={() => setExpandedStep(isExpanded ? null : dua.step)}
                  className="w-full px-4 py-3 text-left focus:outline-none"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                        category === 'fasting' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
                        category === 'night' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' :
                        'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                      }`}>
                        {dua.step}
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">{dua.label}</h3>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1 opacity-80">
                          {dua.transliteration}
                        </p>
                      </div>
                    </div>
                    <div className={`p-1.5 rounded-full transition-transform duration-300 ${isExpanded ? 'bg-emerald-100 dark:bg-emerald-900/30 rotate-180 text-emerald-600' : 'text-gray-400'}`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </button>

                {/* Expanded Content */}
                <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isExpanded ? 'grid-rows-[1fr] border-t border-gray-100 dark:border-gray-700/50' : 'grid-rows-[0fr]'}`}>
                  <div className="overflow-hidden">
                    <div className="p-4 pt-2 space-y-4 bg-gray-50/50 dark:bg-gray-800/50">
                      {/* Arabic */}
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/50">
                        <p className="text-right font-amiri text-2xl leading-loose text-emerald-900 dark:text-emerald-100" dir="rtl">
                          {dua.arabic}
                        </p>
                      </div>
                      
                      {/* Translation & Transliteration */}
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 italic">
                          {dua.transliteration}
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {dua.translation}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}
