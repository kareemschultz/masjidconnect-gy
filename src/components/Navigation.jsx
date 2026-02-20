import { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { UtensilsCrossed, Building2, Calendar, BookOpen, Map, Plus, Compass, Library, Moon, Sun, Star, ChevronRight, CheckSquare, Sparkles, Scale, BookMarked } from 'lucide-react';
import { useDarkMode } from '../contexts/DarkModeContext';
import UserMenu from './UserMenu';

const tabs = [
  { path: '/masjids',  label: 'Masjids', icon: Building2,      ariaLabel: 'Masjid Directory' },
  { path: '/iftaar',   label: 'Iftaar',  icon: UtensilsCrossed, ariaLabel: 'Iftaar Reports' },
  { path: '/events',   label: 'Events',  icon: Star,            ariaLabel: 'Community Events' },
  { path: '/ramadan',  label: 'Ramadan', icon: Moon,            ariaLabel: 'Ramadan Companion' },
  { path: '/tracker',  label: 'Tracker', icon: CheckSquare,     ariaLabel: 'Prayer Tracker' },
  { path: '/tasbih',   label: 'Tasbih',  icon: Sparkles,        ariaLabel: 'Tasbih Counter' },
  { path: '/quran',    label: 'Quran',   icon: BookMarked,      ariaLabel: 'Quran Reader' },
  { path: '/zakat',    label: 'Zakat',   icon: Scale,           ariaLabel: 'Zakat Calculator' },
  { path: '/map',      label: 'Map',     icon: Map,             ariaLabel: 'Map View' },
  { path: '/timetable',label: 'Times',   icon: Calendar,        ariaLabel: 'Prayer Timetable' },
  { path: '/duas',     label: 'Duas',    icon: BookOpen,        ariaLabel: 'Duas and Supplications' },
  { path: '/qibla',   label: 'Qibla',   icon: Compass,         ariaLabel: 'Qibla Compass' },
  { path: '/resources',label: 'More',    icon: Library,         ariaLabel: 'More Resources' },
];

export default function Navigation({ onSubmit }) {
  const scrollRef = useRef(null);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const { pathname } = useLocation();
  const { dark, toggle } = useDarkMode();

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => {
      const canScroll = el.scrollWidth > el.clientWidth;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 10;
      setShowScrollHint(canScroll && !atEnd);
    };
    check();
    el.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => {
      el.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, []);

  return (
    <nav
      className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-emerald-100 dark:border-emerald-900 shadow-sm"
      aria-label="Main navigation"
    >
      <div className="max-w-4xl mx-auto flex items-stretch">
        {/* Scrollable tabs — min-w-0 lets the flex child shrink so overflow-x-auto actually kicks in */}
        <div className="flex-1 relative min-w-0">
          <div
            ref={scrollRef}
            className="flex items-center overflow-x-auto lg:overflow-x-visible scrollbar-hide"
            role="tablist"
            aria-label="App sections"
          >
            {tabs.map(tab => (
              <NavLink
                key={tab.path}
                to={tab.path}
                role="tab"
                aria-label={tab.ariaLabel}
                className={({ isActive }) =>
                  `flex-1 min-w-[52px] flex flex-col items-center gap-0.5 py-2.5 text-[10px] sm:text-xs transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-inset ${
                    isActive
                      ? 'text-emerald-700 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400 bg-emerald-50/60 dark:bg-emerald-900/30 font-semibold'
                      : 'text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-300'
                  }`
                }
                aria-current={pathname === tab.path ? 'page' : undefined}
              >
                <tab.icon className="w-4 h-4" aria-hidden="true" />
                <span className="truncate">{tab.label}</span>
              </NavLink>
            ))}
            {/* Submit — lives at the end of the scroll row, reachable by swiping */}
            <button
              onClick={onSubmit}
              aria-label="Submit Iftaar update"
              className="flex flex-col items-center gap-0.5 py-2.5 px-3 text-[10px] sm:text-xs text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-inset flex-shrink-0"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Submit</span>
            </button>
          </div>

          {/* Scroll hint — positioned inside tabs wrapper so it doesn't overlap controls */}
          {showScrollHint && (
            <div className="absolute right-0 top-0 bottom-0 flex items-center pointer-events-none" aria-hidden="true">
              <div className="w-10 h-full bg-gradient-to-l from-white dark:from-gray-900 to-transparent" />
              <div className="absolute right-0.5 animate-pulse">
                <ChevronRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          )}
        </div>

        {/* Fixed right-side controls — icon-only to keep scroll area wide */}
        <div className="flex items-center flex-shrink-0 border-l border-emerald-100 dark:border-emerald-900">
          <UserMenu variant="nav-icon" />
          <button
            onClick={toggle}
            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {dark ? <Sun className="w-4 h-4" aria-hidden="true" /> : <Moon className="w-4 h-4" aria-hidden="true" />}
          </button>
        </div>{/* end fixed right controls */}
      </div>
    </nav>
  );
}
