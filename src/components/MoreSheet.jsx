import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sun, Moon, X, Search, Pin, PinOff } from 'lucide-react';
import { useDarkMode } from '../contexts/useDarkMode';
import { getLayoutContainerClass } from '../layout/routeLayout';
import { MORE_NAV_SECTIONS, ACCOUNT_NAV_ITEMS, QUICK_ACCESS_ITEMS } from '../config/navigation';

const PINNED_ITEMS_STORAGE_KEY = 'more_sheet_pins_v1';

export default function MoreSheet({ open, onClose, layoutVariant = 'shell' }) {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [query, setQuery] = useState('');
  const [pinnedPaths, setPinnedPaths] = useState(() => {
    try {
      const raw = localStorage.getItem(PINNED_ITEMS_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const dragStart = useRef(null);
  const sheetRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);
  const { dark, toggle } = useDarkMode();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (open) {
      setVisible(true);
      setDragY(0);
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimating(true)));
      setQuery('');
    } else {
      setAnimating(false);
      const t = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    onClose?.();
  }, [location.pathname]);

  useEffect(() => {
    try {
      localStorage.setItem(PINNED_ITEMS_STORAGE_KEY, JSON.stringify(pinnedPaths));
    } catch {
      // Ignore localStorage write failures.
    }
  }, [pinnedPaths]);

  const getFocusableElements = useCallback(() => {
    if (!sheetRef.current) return [];
    return Array.from(
      sheetRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    ).filter((el) => !el.disabled && el.getAttribute('aria-hidden') !== 'true');
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    previousFocusRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusInitialElement = () => {
      const focusable = getFocusableElements();
      const target = focusable[0] || closeButtonRef.current || sheetRef.current;
      target?.focus();
    };
    const focusTimer = setTimeout(focusInitialElement, 0);

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = getFocusableElements();
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
        return;
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
    };
  }, [open, onClose, getFocusableElements]);

  // Drag to close
  const onTouchStart = useCallback((e) => {
    dragStart.current = e.touches[0].clientY;
  }, []);

  const onTouchMove = useCallback((e) => {
    if (dragStart.current === null) return;
    const dy = e.touches[0].clientY - dragStart.current;
    if (dy > 0) { setDragY(dy); e.preventDefault(); }
  }, []);

  const onTouchEnd = useCallback(() => {
    if (dragY > 100) { onClose(); }
    setDragY(0);
    dragStart.current = null;
  }, [dragY, onClose]);

  const go = (path) => { onClose(); navigate(path); };
  const containerClass = getLayoutContainerClass(layoutVariant);
  const normalizedQuery = query.trim().toLowerCase();
  const itemMatchesQuery = useCallback((item) => (
    !normalizedQuery ||
    item.label.toLowerCase().includes(normalizedQuery) ||
    (item.desc && item.desc.toLowerCase().includes(normalizedQuery))
  ), [normalizedQuery]);

  const allNavItems = useMemo(() => {
    const map = new Map();
    QUICK_ACCESS_ITEMS.forEach((item) => map.set(item.path, item));
    MORE_NAV_SECTIONS.forEach((section) => {
      section.items.forEach((item) => map.set(item.path, item));
    });
    ACCOUNT_NAV_ITEMS.forEach((item) => map.set(item.path, item));
    return map;
  }, []);

  const pinnedItems = pinnedPaths
    .map((path) => allNavItems.get(path))
    .filter((item) => Boolean(item) && itemMatchesQuery(item));

  const filteredQuickAccessItems = QUICK_ACCESS_ITEMS.filter(itemMatchesQuery);
  const filteredSections = MORE_NAV_SECTIONS
    .map((section) => ({
      ...section,
      items: section.items.filter(itemMatchesQuery),
    }))
    .filter((section) => section.items.length > 0);
  const filteredAccountItems = ACCOUNT_NAV_ITEMS.filter(itemMatchesQuery);
  const hasResults = pinnedItems.length > 0 || filteredQuickAccessItems.length > 0 || filteredSections.length > 0 || filteredAccountItems.length > 0;
  const showEmptyState = Boolean(normalizedQuery) && !hasResults;

  const isPinned = (path) => pinnedPaths.includes(path);
  const togglePinned = (path) => {
    setPinnedPaths((prev) => (
      prev.includes(path) ? prev.filter((itemPath) => itemPath !== path) : [...prev, path]
    ));
  };

  // Flatten all items for stagger index
  let itemIndex = 0;

  const renderNavRow = (item, idx) => (
    <div
      key={item.path}
      className="flex items-center gap-2 rounded-xl bg-white/72 dark:bg-gray-800/55 border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-200"
      style={animating ? { animation: `fadeIn 0.25s ease-out ${idx * 30}ms both` } : undefined}
    >
      <button
        onClick={() => go(item.path)}
        className="flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-50/70 dark:hover:bg-emerald-900/20 active:scale-[0.98] transition-all duration-200 text-left"
      >
        <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
          <item.icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{item.label}</p>
          {item.desc && <p className="text-[11px] text-gray-400 dark:text-gray-500">{item.desc}</p>}
        </div>
      </button>
      <button
        onClick={(event) => {
          event.stopPropagation();
          togglePinned(item.path);
        }}
        className={`mr-2 p-1.5 rounded-lg border transition-colors ${
          isPinned(item.path)
            ? 'border-gold-400/50 bg-gold-50 text-gold-600 dark:bg-gold-500/10 dark:text-gold-400 dark:border-gold-500/40'
            : 'border-gray-200 text-gray-400 hover:text-emerald-600 hover:border-emerald-300 dark:border-gray-700 dark:text-gray-500 dark:hover:text-emerald-400'
        }`}
        aria-label={isPinned(item.path) ? `Unpin ${item.label}` : `Pin ${item.label}`}
        title={isPinned(item.path) ? 'Unpin from quick list' : 'Pin to quick list'}
      >
        {isPinned(item.path) ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
      </button>
    </div>
  );

  if (!visible) return null;

  return (
    <div id="more-sheet" className="fixed inset-0 z-[60]" aria-modal="true" role="dialog" aria-labelledby="more-sheet-title">
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${animating ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={sheetRef}
        tabIndex={-1}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className={`absolute bottom-0 left-0 right-0 ${containerClass} mx-auto bg-gradient-to-b from-white/97 via-warm-50/94 to-emerald-50/70 dark:from-gray-900/98 dark:via-gray-950/96 dark:to-gray-950/94 rounded-t-3xl shadow-2xl border border-emerald-100/80 dark:border-gray-800 transition-transform duration-300 ease-out max-h-[84vh] flex flex-col ${animating && dragY === 0 ? 'translate-y-0' : !animating ? 'translate-y-full' : ''}`}
        style={dragY > 0 ? { transform: `translateY(${dragY}px)` } : undefined}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0 cursor-grab">
          <div className="w-10 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
        </div>
        <div className="flex items-center justify-between px-5 pb-3 border-b border-emerald-100/70 dark:border-gray-800 flex-shrink-0">
          <div>
            <h2 id="more-sheet-title" className="text-base font-bold text-gray-900 dark:text-gray-100">Explore</h2>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400">Daily essentials, worship tools, and account</p>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-3 space-y-4 scrollbar-hide">
          <div className="mc-card px-3 py-3">
            <label htmlFor="more-search" className="sr-only">Search sections and tools</label>
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-emerald-500 dark:text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="more-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search tools, pages, or settings"
                className="mc-input pl-10 py-2.5 text-xs bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800"
              />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Quick Access</p>
            <div className="grid grid-cols-4 gap-2">
              {filteredQuickAccessItems.map((item, idx) => (
                <button
                  key={item.path}
                  onClick={() => go(item.path)}
                  className="flex flex-col items-center gap-1.5 rounded-xl px-2 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-white dark:hover:bg-gray-700 transition-all text-center group"
                  style={animating ? { animation: `fadeIn 0.25s ease-out ${idx * 25}ms both` } : undefined}
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <item.icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-[10px] font-semibold text-gray-700 dark:text-gray-200 leading-tight">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {pinnedItems.length > 0 && (
            <div className="mc-card p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 px-1">Pinned</p>
              <div className="space-y-0.5">
                {pinnedItems.map((item) => {
                  const idx = itemIndex++;
                  return renderNavRow(item, idx);
                })}
              </div>
            </div>
          )}

          {filteredSections.map(section => (
            <div key={section.title} className="mc-card p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 px-1">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map(item => {
                  const idx = itemIndex++;
                  return renderNavRow(item, idx);
                })}
              </div>
            </div>
          ))}

          {/* Account */}
          <div className="mc-card p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 px-1">Account</p>
            <div className="space-y-0.5">
              {filteredAccountItems.map(item => {
                const idx = itemIndex++;
                return renderNavRow(item, idx);
              })}

              {/* Dark mode toggle */}
              <button
                onClick={toggle}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 active:scale-[0.98] transition-all duration-200 text-left"
                style={animating ? { animation: `fadeIn 0.25s ease-out ${itemIndex * 30}ms both` } : undefined}
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0">
                  {dark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-emerald-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{dark ? 'Light Mode' : 'Dark Mode'}</p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500">Switch appearance</p>
                </div>
                <div className={`w-10 h-6 rounded-full transition-colors ${dark ? 'bg-emerald-600' : 'bg-gray-300'} flex items-center px-0.5`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${dark ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </button>
            </div>
          </div>

          {showEmptyState && (
            <div className="mc-card py-12 px-4 text-center border-dashed">
              <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">No matches found</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Try "Quran", "Iftaar", or "Settings"</p>
            </div>
          )}
        </div>

        <div className="pb-safe flex-shrink-0" />
      </div>
    </div>
  );
}
