import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import MoreSheet from './MoreSheet';
import { getLayoutContainerClass } from '../layout/routeLayout';
import { PRIMARY_NAV_ITEMS, isPrimaryRoute } from '../config/navigation';

function haptic() {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    navigator.vibrate(8);
  }
}

export default function Navigation({ layoutVariant = 'shell' }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const { pathname } = useLocation();
  const containerClass = getLayoutContainerClass(layoutVariant);
  const isOnPrimaryTab = isPrimaryRoute(pathname);

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-emerald-100/50 dark:border-emerald-900/30 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.04)]"
        aria-label="Main navigation"
        role="tablist"
      >
        <div className={`${containerClass} mx-auto flex items-stretch px-safe`}>
          {PRIMARY_NAV_ITEMS.map(tab => {
            const isActive = pathname === tab.path || (tab.path === '/quran' && pathname.startsWith('/quran'));
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                role="tab"
                aria-selected={isActive}
                aria-label={tab.ariaLabel}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => { haptic(); setMoreOpen(false); }}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 min-h-[44px] relative transition-all duration-200 focus-visible:outline-none ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-gray-400 dark:text-gray-500 hover:text-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10'
                }`}
              >
                {isActive && (
                  <span className="absolute top-0 inset-x-0 h-0.5 bg-emerald-600 dark:bg-emerald-400 shadow-[0_2px_8px_currentColor]" />
                )}
                <tab.icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 stroke-[2.5]' : ''}`} />
                <span className={`text-[10px] transition-all duration-200 ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {tab.label}
                </span>
              </NavLink>
            );
          })}

          {/* More tab */}
          <button
            onClick={() => { haptic(); setMoreOpen(prev => !prev); }}
            role="tab"
            aria-selected={moreOpen || !isOnPrimaryTab}
            aria-label="Explore and account options"
            aria-expanded={moreOpen}
            aria-controls="more-sheet"
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 min-h-[44px] relative transition-all duration-200 focus-visible:outline-none ${
              moreOpen || !isOnPrimaryTab
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-gray-400 dark:text-gray-500 hover:text-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10'
            }`}
          >
            {(moreOpen || !isOnPrimaryTab) && (
              <span className="absolute top-0 inset-x-0 h-0.5 bg-emerald-600 dark:bg-emerald-400 shadow-[0_2px_8px_currentColor]" />
            )}
            <Menu className={`w-5 h-5 transition-transform duration-200 ${moreOpen ? 'rotate-90 scale-110' : ''}`} />
            <span className={`text-[10px] ${moreOpen || !isOnPrimaryTab ? 'font-bold' : 'font-medium'}`}>
              Explore
            </span>
          </button>
        </div>
        
        {/* Safe area spacer */}
        <div className="nav-safe-bottom" />
      </nav>

      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} layoutVariant={layoutVariant} />
    </>
  );
}
