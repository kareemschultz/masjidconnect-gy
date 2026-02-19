import { UtensilsCrossed, Building2, Calendar, BookOpen, Plus } from 'lucide-react';

const tabs = [
  { id: 'tonight', label: "Tonight's Iftaar", icon: UtensilsCrossed },
  { id: 'masjids', label: 'Masjids', icon: Building2 },
  { id: 'timetable', label: 'Timetable', icon: Calendar },
  { id: 'duas', label: 'Duas', icon: BookOpen },
];

export default function Navigation({ active, onChange, onSubmit }) {
  return (
    <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-sm">
      <div className="flex items-center max-w-lg mx-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs transition-colors ${
              active === tab.id
                ? 'text-emerald-700 border-b-2 border-emerald-600 font-semibold'
                : 'text-gray-500 hover:text-emerald-600'
            }`}
          >
            <tab.icon className="w-4.5 h-4.5" />
            <span className="truncate">{tab.label}</span>
          </button>
        ))}
        <button
          onClick={onSubmit}
          className="flex flex-col items-center gap-0.5 py-2.5 px-3 text-xs text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Submit</span>
        </button>
      </div>
    </div>
  );
}
