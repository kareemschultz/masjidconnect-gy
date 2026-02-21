import { useContext } from 'react';
import { DarkModeContext } from './darkModeContext';

export function useDarkMode() {
  return useContext(DarkModeContext);
}
