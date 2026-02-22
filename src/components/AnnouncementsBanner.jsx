import { useState, useEffect } from 'react';
import { X, AlertTriangle, Info, CalendarDays } from 'lucide-react';

export default function AnnouncementsBanner() {
  const [announcements, setAnnouncements] = useState([]);
  const [dismissed, setDismissed] = useState([]);

  useEffect(() => {
    // Load dismissed list from localStorage
    try {
      const d = JSON.parse(localStorage.getItem('dismissed_announcements') || '[]');
      setDismissed(d);
    } catch { /* ignore */ }

    // Fetch announcements from API
    fetch('/api/announcements')
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        const now = new Date();
        const active = (Array.isArray(data) ? data : []).filter(a => new Date(a.expiresAt) > now);
        setAnnouncements(active);
      })
      .catch(() => {});
  }, []);

  const dismiss = (id) => {
    const updated = [...dismissed, id];
    setDismissed(updated);
    try {
      localStorage.setItem('dismissed_announcements', JSON.stringify(updated));
    } catch { /* storage full */ }
  };

  const visible = announcements.filter(a => !dismissed.includes(a.id));
  if (visible.length === 0) return null;

  const config = {
    info: { bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800', icon: Info, iconColor: 'text-blue-500 dark:text-blue-400' },
    urgent: { bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800', icon: AlertTriangle, iconColor: 'text-red-500 dark:text-red-400' },
    event: { bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800', icon: CalendarDays, iconColor: 'text-emerald-500 dark:text-emerald-400' },
  };

  return (
    <div className="space-y-2">
      {visible.map(a => {
        const cfg = config[a.type] || config.info;
        const Icon = cfg.icon;
        return (
          <div key={a.id} className={`flex items-start gap-3 rounded-2xl border p-3.5 ${cfg.bg}`}>
            <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${cfg.iconColor}`} />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-gray-800 dark:text-gray-100">{a.title}</div>
              <div className="mt-0.5 text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">{a.body}</div>
            </div>
            <button onClick={() => dismiss(a.id)} className="shrink-0 rounded-lg p-1 text-gray-400 active:text-gray-600 dark:active:text-gray-300" aria-label="Dismiss">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
