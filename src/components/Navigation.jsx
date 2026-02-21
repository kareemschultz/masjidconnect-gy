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
        className="fixed bottom-0 left-0 right-0 z-50 px-safe border-t border-emerald-100/70 dark:border-emerald-900/40 bg-gradient-to-t from-white/96 via-white/92 to-white/85 dark:from-gray-950/96 dark:via-gray-900/92 dark:to-gray-900/86 backdrop-blur-xl shadow-[0_-12px_28px_rgba(2,44,34,0.14)]"
        aria-label="Main navigation"
      >
        <div className={`${containerClass} mx-auto flex items-stretch`}>
          {PRIMARY_NAV_ITEMS.map(tab => {
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
            aria-label="Explore and account options"
            aria-expanded={moreOpen}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 relative transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-inset ${
              moreOpen || !isOnPrimaryTab
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-gray-400 dark:text-gray-500 active:text-emerald-500'
            }`}
          >
            <Menu className={`w-5 h-5 transition-transform duration-200 ${moreOpen ? 'rotate-90 scale-110' : ''}`} />
            <span className={`text-[10px] ${moreOpen || !isOnPrimaryTab ? 'font-bold' : 'font-medium'}`}>
              Explore
            </span>
            {(moreOpen || !isOnPrimaryTab) && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-emerald-600 dark:bg-emerald-400 rounded-full animate-scale-in" />
            )}
          </button>
        </div>

        {/* Safe area spacer */}
        <div className="pb-safe" />
      </nav>

      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} layoutVariant={layoutVariant} />
    </>
  );
}
