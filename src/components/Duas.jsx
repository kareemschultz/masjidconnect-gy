import { duas } from '../data/ramadanTimetable';

export default function Duas() {
  const allDuas = [
    { ...duas.suhoor, label: 'Intention for Fasting (Suhoor)', step: 1 },
    { ...duas.beforeBreaking, label: 'Before Breaking Fast', step: 2 },
    { ...duas.whileBreaking, label: 'While Breaking Fast', step: 3 },
    { ...duas.afterBreaking, label: 'After Breaking Fast', step: 4 },
    { ...duas.laylatalQadr, label: 'Dua for Laylatul Qadr', step: 5 },
    { ...duas.forgiveness, label: 'Dua for Forgiveness', step: 6 },
    { ...duas.general1, label: 'General Ramadan Dua', step: 7 },
    { ...duas.general2, label: 'Dua for Guidance', step: 8 },
  ];

  return (
    <div className="px-4 py-5 max-w-2xl mx-auto">
      <h2 className="text-lg font-bold text-emerald-900 dark:text-emerald-100 font-amiri mb-1">
        Ramadan Duas Collection
      </h2>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
        From the Sunnah of the Prophet ﷺ
      </p>

      <div className="space-y-4">
        {allDuas.map(dua => (
          <div key={dua.step} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-emerald-50 dark:border-gray-700 overflow-hidden animate-fade-in" style={{ animationDelay: `${dua.step * 100}ms` }}>
            {/* Step badge */}
            <div className="bg-emerald-800 dark:bg-emerald-900 px-4 py-2 flex items-center gap-2">
              <span className="w-6 h-6 bg-gold-400 text-emerald-950 rounded-full flex items-center justify-center text-xs font-bold">
                {dua.step}
              </span>
              <span className="text-white font-semibold text-sm">{dua.label}</span>
            </div>

            <div className="p-4 space-y-3">
              {/* Arabic */}
              <p className="text-right font-amiri text-2xl leading-loose text-emerald-900 dark:text-emerald-100" dir="rtl">
                {dua.arabic}
              </p>

              {/* Transliteration */}
              <p className="text-sm text-emerald-700 dark:text-emerald-400 italic">
                {dua.transliteration}
              </p>

              {/* Translation */}
              <p className="text-sm text-gray-600 dark:text-gray-300 bg-warm-50 dark:bg-gray-700/50 rounded-xl px-3 py-2">
                "{dua.translation}"
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Etiquette */}
      <div className="mt-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-800/30">
        <h3 className="font-bold text-emerald-800 dark:text-emerald-300 text-sm mb-2">🤲 Etiquette of Iftaar</h3>
        <ul className="text-xs text-emerald-700 dark:text-emerald-400 space-y-1.5">
          <li>• Break your fast with dates and water, following the Sunnah</li>
          <li>• Make dua before breaking — it is a time of acceptance</li>
          <li>• Share your food with others; great reward in feeding the fasting</li>
          <li>• Say Bismillah before eating and Alhamdulillah after</li>
          <li>• The Prophet ﷺ said: "Whoever provides Iftaar for a fasting person earns the same reward without diminishing the faster's reward"</li>
        </ul>
      </div>
    </div>
  );
}
