import { useState, useEffect } from 'react';
import { Bell, X, Moon, Clock } from 'lucide-react';

const PROMPT_KEY = 'notif_prompt_v1';

export default function NotificationPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show if browser supports notifications and hasn't decided yet
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'default') return;
    if (localStorage.getItem(PROMPT_KEY)) return;

    // Show after 5 seconds on first visit
    const timer = setTimeout(() => setShow(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    localStorage.setItem(PROMPT_KEY, 'dismissed');
    setShow(false);
  };

  const handleEnable = async () => {
    localStorage.setItem(PROMPT_KEY, 'shown');
    setShow(false);
    try {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        localStorage.setItem('ramadan_notifs', 'true');
        // Small confirmation notification
        new Notification('MasjidConnect GY 🌙', {
          body: 'You\'ll receive iftaar reminders with duas. Ramadan Mubarak!',
          icon: '/icon-192.png',
        });
      }
    } catch {}
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={dismiss}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-emerald-100 dark:border-emerald-900 animate-fade-in">
        {/* Close */}
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center">
            <span className="text-3xl">🔔</span>
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-5">
          <h2 className="text-lg font-bold text-emerald-900 dark:text-emerald-100 font-cinzel mb-1">
            Stay Connected this Ramadan
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Enable reminders and we'll notify you at iftaar time with duas to recite.
          </p>
        </div>

        {/* Benefits */}
        <div className="space-y-2 mb-5">
          {[
            { icon: <Clock className="w-4 h-4 text-emerald-600" />, text: 'Iftaar time alert with duas' },
            { icon: <Moon className="w-4 h-4 text-emerald-600" />, text: 'Tahajjud reminder (last 10 nights)' },
            { icon: <Bell className="w-4 h-4 text-emerald-600" />, text: 'Post-iftaar dhikr reminder' },
          ].map((b, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              {b.icon}
              <span className="text-sm text-emerald-800 dark:text-emerald-200">{b.text}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={handleEnable}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-semibold text-sm transition-colors"
          >
            🌙 Enable Reminders
          </button>
          <button
            onClick={dismiss}
            className="w-full py-2 text-gray-500 dark:text-gray-400 text-sm hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
