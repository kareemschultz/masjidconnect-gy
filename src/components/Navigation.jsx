import { UtensilsCrossed, Building2, Calendar, BookOpen, Map, Plus, Compass, Library } from 'lucide-react';

const tabs = [
  { id: 'tonight', label: 'Tonight', icon: UtensilsCrossed, ariaLabel: 'Tonight\'s Iftaar' },
  { id: 'masjids', label: 'Masjids', icon: Building2, ariaLabel: 'Masjid Directory' },
  { id: 'map', label: 'Map', icon: Map, ariaLabel: 'Map View' },
  { id: 'timetable', label: 'Times', icon: Calendar, ariaLabel: 'Prayer Timetable' },
  { id: 'duas', label: 'Duas', icon: BookOpen, ariaLabel: 'Duas and Supplications' },
  { id: 'qibla', label: 'Qibla', icon: Compass, ariaLabel: 'Qibla Compass' },
  { id: 'resources', label: 'More', icon: Library, ariaLabel: 'More Resources' },
];

export default function Navigation({ active, onChange, onSubmit }) {
  return (
    <nav
      className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-emerald-100 dark:border-emerald-900 shadow-sm"
      aria-label="Main navigation"
    >
      <div
        className="flex items-center max-w-lg mx-auto overflow-x-auto scrollbar-hide"
        role="tablist"
        aria-label="App sections"
      >
        {tabs.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active === tab.id}
            aria-controls={`panel-${tab.id}`}
            aria-label={tab.ariaLabel}
            onClick={() => onChange(tab.id)}
            className={`flex-1 min-w-[60px] flex flex-col items-center gap-0.5 py-2.5 text-[10px] sm:text-xs transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-inset ${
              active === tab.id
                ? 'text-emerald-700 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400 font-semibold scale-105'
                : 'text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-300'
            }`}
          >
            <tab.icon className="w-4 h-4" aria-hidden="true" />
            <span className="truncate">{tab.label}</span>
          </button>
        ))}
        <button
          onClick={onSubmit}
          aria-label="Submit Iftaar update"
          className="flex flex-col items-center gap-0.5 py-2.5 px-3 text-[10px] sm:text-xs text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-inset"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Submit</span>
        </button>
      </div>
    </nav>
  );
}
