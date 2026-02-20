import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, BookMarked, CheckSquare, Building2, Menu } from 'lucide-react';
import MoreSheet from './MoreSheet';

const tabs = [
  { path: '/ramadan',  label: 'Home',    icon: Home,        ariaLabel: 'Ramadan Home' },
  { path: '/quran',    label: 'Quran',   icon: BookMarked,  ariaLabel: 'Quran Reader' },
  { path: '/tracker',  label: 'Tracker', icon: CheckSquare, ariaLabel: 'Prayer Tracker' },
  { path: '/masjids',  label: 'Masjids', icon: Building2,   ariaLabel: 'Masjid Directory' },
];

export default function Navigation() {
  const [moreOpen, setMoreOpen] = useState(false);
  const { pathname } = useLocation();

  // Check if current path is one of the primary tabs
  const isOnPrimaryTab = tabs.some(t =>
    pathname === t.path || (t.path === '/quran' && pathname.startsWith('/quran'))
  );

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 shadow-[0_-2px_10px_rgba(0,0,0,0.06)]"
        aria-label="Main navigation"
      >
        <div className="max-w-md mx-auto flex items-stretch">
          {tabs.map(tab => {
            const isActive = pathname === tab.path || (tab.path === '/quran' && pathname.startsWith('/quran'));
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                aria-label={tab.ariaLabel}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => setMoreOpen(false)}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors duration-200 ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-gray-400 dark:text-gray-500 active:text-emerald-500'
                }`}
              >
                <tab.icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <div className="absolute bottom-0 w-8 h-0.5 bg-emerald-600 dark:bg-emerald-400 rounded-full" />
                )}
              </NavLink>
            );
          })}

          {/* More tab */}
          <button
            onClick={() => setMoreOpen(prev => !prev)}
            aria-label="More options"
            aria-expanded={moreOpen}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors duration-200 ${
              moreOpen || !isOnPrimaryTab
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-gray-400 dark:text-gray-500 active:text-emerald-500'
            }`}
          >
            <Menu className={`w-5 h-5 ${moreOpen || !isOnPrimaryTab ? 'stroke-[2.5]' : ''}`} />
            <span className={`text-[10px] ${moreOpen || !isOnPrimaryTab ? 'font-semibold' : 'font-medium'}`}>
              More
            </span>
            {(moreOpen || !isOnPrimaryTab) && (
              <div className="absolute bottom-0 w-8 h-0.5 bg-emerald-600 dark:bg-emerald-400 rounded-full" />
            )}
          </button>
        </div>

        {/* Safe area spacer */}
        <div className="pb-safe" />
      </nav>

      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  );
}
