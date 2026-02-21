import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, X } from 'lucide-react';
import { useDarkMode } from '../contexts/useDarkMode';
import { getLayoutContainerClass } from '../layout/routeLayout';
import { MORE_NAV_SECTIONS, ACCOUNT_NAV_ITEMS } from '../config/navigation';

export default function MoreSheet({ open, onClose, layoutVariant = 'shell' }) {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [dragY, setDragY] = useState(0);
  const dragStart = useRef(null);
  const sheetRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);
  const { dark, toggle } = useDarkMode();
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setVisible(true);
      setDragY(0);
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimating(true)));
    } else {
      setAnimating(false);
      const t = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

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

  if (!visible) return null;

  const go = (path) => { onClose(); navigate(path); };
  const containerClass = getLayoutContainerClass(layoutVariant);

  // Flatten all items for stagger index
  let itemIndex = 0;

  return (
    <div className="fixed inset-0 z-[60]" aria-modal="true" role="dialog" aria-labelledby="more-sheet-title">
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
        className={`absolute bottom-0 left-0 right-0 ${containerClass} mx-auto bg-gradient-to-b from-white to-emerald-50/40 dark:from-gray-900 dark:to-gray-950 rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out max-h-[80vh] flex flex-col ${animating && dragY === 0 ? 'translate-y-0' : !animating ? 'translate-y-full' : ''}`}
        style={dragY > 0 ? { transform: `translateY(${dragY}px)` } : undefined}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0 cursor-grab">
          <div className="w-10 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
        </div>
        <div className="flex items-center justify-between px-5 pb-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <h2 id="more-sheet-title" className="text-base font-bold text-gray-900 dark:text-gray-100">More</h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-3 space-y-4 scrollbar-hide">
          {MORE_NAV_SECTIONS.map(section => (
            <div key={section.title}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5 px-1">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map(item => {
                  const idx = itemIndex++;
                  return (
                    <button
                      key={item.path}
                      onClick={() => go(item.path)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 active:scale-[0.98] transition-all duration-200 text-left"
                      style={animating ? { animation: `fadeIn 0.25s ease-out ${idx * 30}ms both` } : undefined}
                    >
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{item.label}</p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500">{item.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Account */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5 px-1">Account</p>
            <div className="space-y-0.5">
              {ACCOUNT_NAV_ITEMS.map(item => {
                const idx = itemIndex++;
                return (
                  <button
                    key={item.path}
                    onClick={() => go(item.path)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 active:scale-[0.98] transition-all duration-200 text-left"
                    style={animating ? { animation: `fadeIn 0.25s ease-out ${idx * 30}ms both` } : undefined}
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{item.label}</p>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500">{item.desc}</p>
                    </div>
                  </button>
                );
              })}

              {/* Dark mode toggle */}
              <button
                onClick={toggle}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 active:scale-[0.98] transition-all duration-200 text-left"
                style={animating ? { animation: `fadeIn 0.25s ease-out ${itemIndex * 30}ms both` } : undefined}
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
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
        </div>

        <div className="pb-safe flex-shrink-0" />
      </div>
    </div>
  );
}
