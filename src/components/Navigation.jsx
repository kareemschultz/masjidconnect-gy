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

function haptic() {
  try { navigator.vibrate?.(8); } catch {}
}

export default function Navigation() {
  const [moreOpen, setMoreOpen] = useState(false);
  const { pathname } = useLocation();

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
                onClick={() => { haptic(); setMoreOpen(false); }}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 relative transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-inset ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-gray-400 dark:text-gray-500 active:text-emerald-500'
                }`}
              >
                <tab.icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 stroke-[2.5]' : ''}`} />
                <span className={`text-[10px] transition-all duration-200 ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-emerald-600 dark:bg-emerald-400 rounded-full animate-scale-in" />
                )}
              </NavLink>
            );
          })}

          {/* More tab */}
          <button
            onClick={() => { haptic(); setMoreOpen(prev => !prev); }}
            aria-label="More options"
            aria-expanded={moreOpen}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 relative transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-inset ${
              moreOpen || !isOnPrimaryTab
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-gray-400 dark:text-gray-500 active:text-emerald-500'
            }`}
          >
            <Menu className={`w-5 h-5 transition-transform duration-200 ${moreOpen ? 'rotate-90 scale-110' : ''}`} />
            <span className={`text-[10px] ${moreOpen || !isOnPrimaryTab ? 'font-bold' : 'font-medium'}`}>
              More
            </span>
            {(moreOpen || !isOnPrimaryTab) && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-emerald-600 dark:bg-emerald-400 rounded-full animate-scale-in" />
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
