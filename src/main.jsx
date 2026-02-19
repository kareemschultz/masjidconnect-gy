import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { ToastProvider } from './contexts/ToastContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DarkModeProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </DarkModeProvider>
  </StrictMode>,
);

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/georgetown-iftaar/sw.js').catch(() => {});
  });
}
