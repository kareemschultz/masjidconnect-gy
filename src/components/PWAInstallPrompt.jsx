import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('install_prompt_dismissed') === 'true';
    if (dismissed) return;

    if (window.matchMedia('(display-mode: standalone)').matches) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShowBanner(true), 5000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('install_prompt_dismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-fade-in">
      <div className="mx-auto max-w-lg rounded-2xl border border-emerald-500/20 bg-white dark:bg-gray-900 p-4 shadow-xl shadow-black/10 dark:shadow-black/40">
        <div className="flex items-start gap-3">
          <img
            src="/icons/icon-48.png"
            alt="MasjidConnect"
            width={44}
            height={44}
            className="shrink-0 rounded-xl"
          />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Install MasjidConnect GY</h3>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Add to your home screen for the best experience with prayer notifications and offline access.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 active:text-gray-600 dark:active:text-gray-300"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={handleInstall}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2.5 text-sm font-semibold text-white transition-all active:scale-[0.98]"
        >
          <Download className="h-4 w-4" />
          Install App
        </button>
      </div>
    </div>
  );
}
