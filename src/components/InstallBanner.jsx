import { useState, useEffect } from 'react';
import { X, Share, Plus, Download, Bell } from 'lucide-react';

// Detect iOS Safari
function isIosSafari() {
  const ua = navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS|EdgiOS/.test(ua);
  return isIos && isSafari;
}

// Detect if already installed (standalone mode)
function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

const DISMISSED_KEY = 'pwa_banner_dismissed_v2';

export default function InstallBanner() {
  const [mode, setMode] = useState(null); // null | 'android' | 'ios'
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [iosStep, setIosStep] = useState(1); // 1 = instructions, 2 = done
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Already installed or already dismissed — don't show
    if (isStandalone()) return;
    if (sessionStorage.getItem(DISMISSED_KEY)) return;

    // iOS Safari — show manual instructions
    if (isIosSafari()) {
      setMode('ios');
      setVisible(true);
      return;
    }

    // Android / Chrome / Edge — listen for beforeinstallprompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setMode('android');
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, '1');
    setVisible(false);
  };

  const installAndroid = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setVisible(false);
    }
    setDeferredPrompt(null);
  };

  if (!visible || !mode) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[100] animate-slide-up"
      role="dialog"
      aria-modal="true"
      aria-label="Install MasjidConnect GY"
    >
      <div className="max-w-lg mx-auto mx-4 mb-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-emerald-100 dark:border-emerald-900 overflow-hidden">
          {/* Header bar */}
          <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🕌</span>
              <div>
                <p className="text-white font-bold text-sm leading-tight">Install MasjidConnect GY</p>
                <p className="text-emerald-300 text-[10px]">Free · No App Store required</p>
              </div>
            </div>
            <button
              onClick={dismiss}
              aria-label="Dismiss install banner"
              className="p-2.5 rounded-full text-emerald-300 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          {/* Benefits */}
          <div className="px-4 pt-3 pb-2 grid grid-cols-3 gap-2 text-center">
            {[
              { icon: Bell, label: 'Iftaar alerts', sub: 'Even when closed' },
              { icon: Download, label: 'Works offline', sub: 'No internet needed' },
              { icon: Plus, label: 'Home screen', sub: 'One tap access' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-2">
                <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
                <p className="text-[11px] font-semibold text-gray-700 dark:text-gray-200 leading-tight">{label}</p>
                <p className="text-[9px] text-gray-400 dark:text-gray-500">{sub}</p>
              </div>
            ))}
          </div>

          {/* Platform-specific content */}
          {mode === 'android' && (
            <div className="px-4 pb-4">
              <button
                onClick={installAndroid}
                className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                Add to Home Screen
              </button>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-2">
                Tap to install — no App Store required. Works on Chrome &amp; Edge.
              </p>
            </div>
          )}

          {mode === 'ios' && (
            <div className="px-4 pb-4">
              {iosStep === 1 ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">
                    To install on iPhone / iPad:
                  </p>
                  <ol className="space-y-2" aria-label="Installation steps">
                    <IoStep num={1} icon="share">
                      Tap the <strong>Share</strong> button{' '}
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-gray-100 dark:bg-gray-700 rounded align-middle" aria-hidden="true">
                        <Share className="w-3 h-3 text-blue-500" />
                      </span>{' '}
                      at the bottom of Safari
                    </IoStep>
                    <IoStep num={2} icon="plus">
                      Scroll down and tap{' '}
                      <strong>"Add to Home Screen"</strong>{' '}
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-gray-100 dark:bg-gray-700 rounded align-middle" aria-hidden="true">
                        <Plus className="w-3 h-3 text-gray-600 dark:text-gray-300" />
                      </span>
                    </IoStep>
                    <IoStep num={3} icon="done">
                      Tap <strong>Add</strong> — done! Open from your home screen to enable iftaar notifications.
                    </IoStep>
                  </ol>
                  <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-1">
                    ⚠️ Iftaar push notifications require iOS 16.4+ with the app installed.
                  </p>
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-2xl mb-1">✅</p>
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Installed! JazakAllah Khair</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Open from your home screen and enable notifications.</p>
                </div>
              )}
              <button
                onClick={dismiss}
                className="w-full mt-3 text-xs text-gray-400 dark:text-gray-500 underline text-center"
              >
                Remind me later
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function IoStep({ num, children }) {
  return (
    <li className="flex items-start gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2">
      <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center mt-0.5" aria-hidden="true">
        {num}
      </span>
      <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{children}</p>
    </li>
  );
}
