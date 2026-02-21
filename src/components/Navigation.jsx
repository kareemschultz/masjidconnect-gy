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
      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none pb-safe px-4 mb-2">
        <nav
          className={`${containerClass} mx-auto pointer-events-auto flex items-stretch bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-emerald-100/50 dark:border-emerald-900/30 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-2xl overflow-hidden`}
          aria-label="Main navigation"
        >
          {PRIMARY_NAV_ITEMS.map(tab => {
            const isActive = pathname === tab.path || (tab.path === '/quran' && pathname.startsWith('/quran'));
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                aria-label={tab.ariaLabel}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => { haptic(); setMoreOpen(false); }}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 relative transition-all duration-300 focus-visible:outline-none ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-gray-400 dark:text-gray-500 hover:text-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10'
                }`}
              >
                {isActive && (
                  <span className="absolute inset-x-3 inset-y-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl -z-10 animate-fade-in" />
                )}
                <tab.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110 fill-emerald-600/10 dark:fill-emerald-400/10' : ''}`} />
                <span className={`text-[10px] transition-all duration-300 ${isActive ? 'font-bold translate-y-0' : 'font-medium'}`}>
                  {tab.label}
                </span>
              </NavLink>
            );
          })}

          {/* More tab */}
          <button
            onClick={() => { haptic(); setMoreOpen(prev => !prev); }}
            aria-label="Explore and account options"
            aria-expanded={moreOpen}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 relative transition-all duration-300 focus-visible:outline-none ${
              moreOpen || !isOnPrimaryTab
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-gray-400 dark:text-gray-500 hover:text-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10'
            }`}
          >
            {(moreOpen || !isOnPrimaryTab) && (
              <span className="absolute inset-x-3 inset-y-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl -z-10 animate-fade-in" />
            )}
            <Menu className={`w-5 h-5 transition-transform duration-300 ${moreOpen ? 'rotate-90 scale-110' : ''}`} />
            <span className={`text-[10px] ${moreOpen || !isOnPrimaryTab ? 'font-bold' : 'font-medium'}`}>
              Explore
            </span>
          </button>
        </nav>
      </div>

      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} layoutVariant={layoutVariant} />
    </>
  );
}
