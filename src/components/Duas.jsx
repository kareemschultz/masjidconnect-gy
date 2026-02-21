import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { duas } from '../data/ramadanTimetable';

function getCategory(step) {
  if (step <= 4) return 'fasting';
  if (step === 5) return 'night';
  return 'general';
}

const FILTERS = [
  { key: 'all', label: 'All Duas' },
  { key: 'fasting', label: 'Fasting' },
  { key: 'night', label: 'Night' },
  { key: 'general', label: 'General' },
];

export default function Duas() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedStep, setExpandedStep] = useState(1);

  const allDuas = useMemo(
    () => [
      { ...duas.suhoor, label: 'Intention for Fasting (Suhoor)', step: 1 },
      { ...duas.beforeBreaking, label: 'Before Breaking Fast', step: 2 },
      { ...duas.whileBreaking, label: 'While Breaking Fast', step: 3 },
      { ...duas.afterBreaking, label: 'After Breaking Fast', step: 4 },
      { ...duas.laylatalQadr, label: 'Dua for Laylatul Qadr', step: 5 },
      { ...duas.forgiveness, label: 'Dua for Forgiveness', step: 6 },
      { ...duas.general1, label: 'General Ramadan Dua', step: 7 },
      { ...duas.general2, label: 'Dua for Guidance', step: 8 },
    ],
    []
  );

  const filteredDuas = useMemo(() => {
    if (activeFilter === 'all') return allDuas;
    return allDuas.filter((dua) => getCategory(dua.step) === activeFilter);
  }, [activeFilter, allDuas]);

  return (
    <div className="min-h-screen worship-canvas pb-24 page-enter">
      <header className="px-4 pt-safe pb-3">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-950 text-white shadow-xl">
          <div className="absolute inset-0 islamic-pattern opacity-35" aria-hidden="true" />
          <div className="relative px-5 py-5">
            <h1 className="text-2xl font-bold font-display">Ramadan Duas</h1>
            <p className="mt-1 text-xs text-emerald-100/85">A focused collection for fasting, gratitude, and guidance.</p>

            <div className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2">
              <p className="text-xs text-white/85">From the Sunnah of the Prophet ﷺ</p>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> {filteredDuas.length} duas
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 space-y-3">
        <section className="worship-surface p-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="tablist" aria-label="Filter duas by type">
            {FILTERS.map((filter) => (
              <button
                key={filter.key}
                role="tab"
                aria-selected={activeFilter === filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`min-h-11 rounded-xl px-3 py-2 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  activeFilter === filter.key
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-white text-gray-600 hover:bg-emerald-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          {filteredDuas.map((dua, index) => {
            const isExpanded = expandedStep === dua.step;
            const category = getCategory(dua.step);
            const categoryStyle = category === 'fasting'
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/35 dark:text-amber-300'
              : category === 'night'
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/35 dark:text-indigo-300'
                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/35 dark:text-emerald-300';

            return (
              <article
                key={dua.step}
                className="worship-surface overflow-hidden"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <button
                  onClick={() => setExpandedStep(isExpanded ? null : dua.step)}
                  className="w-full min-h-11 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  aria-expanded={isExpanded}
                  aria-controls={`dua-content-${dua.step}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-400 text-xs font-bold text-emerald-950">
                      {dua.step}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{dua.label}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${categoryStyle}`}>
                          {category}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
                        {dua.transliteration}
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="mt-1 h-4 w-4 text-gray-400" aria-hidden="true" />
                    ) : (
                      <ChevronDown className="mt-1 h-4 w-4 text-gray-400" aria-hidden="true" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div id={`dua-content-${dua.step}`} className="border-t border-emerald-100 px-4 pb-4 pt-3 dark:border-gray-700 animate-slide-down">
                    <p className="text-right font-amiri text-2xl leading-loose text-emerald-900 dark:text-emerald-100" dir="rtl">
                      {dua.arabic}
                    </p>
                    <p className="mt-2 text-sm italic text-emerald-700 dark:text-emerald-400">
                      {dua.transliteration}
                    </p>
                    <p className="mt-2 rounded-xl bg-warm-50 px-3 py-2 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                      &quot;{dua.translation}&quot;
                    </p>
                  </div>
                )}
              </article>
            );
          })}
        </section>

        <section className="worship-surface p-4">
          <h2 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Etiquette of Iftaar</h2>
          <ul className="mt-2 space-y-1.5 text-xs text-emerald-700 dark:text-emerald-400">
            <li>Break the fast with dates and water following the Sunnah.</li>
            <li>Make dua before breaking fast. This is a time of acceptance.</li>
            <li>Share food with others for multiplied reward.</li>
            <li>Say Bismillah before eating and Alhamdulillah after.</li>
            <li>Feeding a fasting person carries the reward of their fast without diminishing theirs.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
