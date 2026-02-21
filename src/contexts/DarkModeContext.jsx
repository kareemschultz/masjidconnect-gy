import { useState, useEffect, useMemo } from 'react';
import { DarkModeContext } from './darkModeContext';

export function DarkModeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', dark);
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const value = useMemo(() => ({
    dark,
    darkMode: dark,
    setDarkMode: setDark,
    toggle: () => setDark((prev) => !prev),
  }), [dark]);

  return (
    <DarkModeContext.Provider value={value}>
      {children}
    </DarkModeContext.Provider>
  );
}
