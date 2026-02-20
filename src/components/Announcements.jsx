import { useState, useEffect } from 'react';
import { Bell, AlertTriangle, Info, Megaphone, Loader2 } from 'lucide-react';
import { API_BASE } from '../config';

const PRIORITY_STYLES = {
  urgent: { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', icon: AlertTriangle, iconColor: 'text-red-500', badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' },
  important: { bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', icon: Bell, iconColor: 'text-amber-500', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' },
  normal: { bg: 'bg-white dark:bg-gray-800', border: 'border-gray-100 dark:border-gray-700', icon: Info, iconColor: 'text-emerald-500', badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
};

const TYPE_LABELS = {
  general: 'General',
  prayer_time: 'Prayer Times',
  event: 'Event',
  closure: 'Closure',
  ramadan: 'Ramadan',
};

export default function Announcements({ compact = false }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/announcements`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => setAnnouncements(Array.isArray(data) ? data : []))
      .catch(() => setAnnouncements([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return compact ? null : (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (announcements.length === 0) {
    if (compact) return null;
    return (
      <div className="text-center py-6">
        <Megaphone className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
        <p className="text-sm text-gray-400">No announcements right now</p>
      </div>
    );
  }

  const items = compact ? announcements.slice(0, 3) : announcements;

  return (
    <div className="space-y-2">
      {!compact && (
        <div className="flex items-center gap-2 mb-3">
          <Megaphone className="w-4 h-4 text-emerald-600" />
          <h3 className="font-bold text-sm text-gray-900 dark:text-white">Announcements</h3>
          <span className="text-xs text-gray-400">({announcements.length})</span>
        </div>
      )}
      {items.map(a => {
        const style = PRIORITY_STYLES[a.priority] || PRIORITY_STYLES.normal;
        const Icon = style.icon;
        const timeAgo = getTimeAgo(a.created_at);
        return (
          <div key={a.id} className={`${style.bg} ${style.border} border rounded-xl p-3`}>
            <div className="flex items-start gap-2">
              <Icon className={`w-4 h-4 ${style.iconColor} shrink-0 mt-0.5`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">{a.title}</h4>
                  {a.type !== 'general' && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${style.badge}`}>
                      {TYPE_LABELS[a.type] || a.type}
                    </span>
                  )}
                </div>
                {a.body && <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{a.body}</p>}
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-gray-400">{timeAgo}</span>
                  {a.author_display && (
                    <>
                      <span className="text-[10px] text-gray-300 dark:text-gray-600">·</span>
                      <span className="text-[10px] text-gray-400">{a.author_display}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      {compact && announcements.length > 3 && (
        <p className="text-xs text-emerald-600 dark:text-emerald-400 text-center">
          +{announcements.length - 3} more announcements
        </p>
      )}
    </div>
  );
}

function getTimeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}
