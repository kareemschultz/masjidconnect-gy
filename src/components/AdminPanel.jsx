import { useMemo, useState, useEffect } from 'react';
import { Megaphone, Trash2, CheckCircle, Loader2, Shield, Search } from 'lucide-react';
import { API_BASE } from '../config';
import { logError } from '../utils/logger';

export default function AdminPanel() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', body: '', priority: 'normal', type: 'general', expires_at: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [role, setRole] = useState(null);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    checkRole();
    loadData();
  }, []);

  const checkRole = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/user/role`, { credentials: 'include' });
      const data = await res.json();
      setRole(data.role);
    } catch {
      setRole('user');
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const annRes = await fetch(`${API_BASE}/api/announcements`, { credentials: 'include' });
      const annData = await annRes.json();
      setAnnouncements(Array.isArray(annData) ? annData : []);
    } catch (error) {
      logError('AdminPanel.loadData', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Failed to create announcement');
      setForm({ title: '', body: '', priority: 'normal', type: 'general', expires_at: '' });
      loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await fetch(`${API_BASE}/api/announcements/${id}`, { method: 'DELETE', credentials: 'include' });
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      logError('AdminPanel.handleDelete', error);
      setError('Failed to delete announcement. Please try again.');
    }
  };

  const filteredAnnouncements = useMemo(() => {
    const q = search.trim().toLowerCase();
    return announcements.filter((announcement) => {
      const priorityMatch = priorityFilter === 'all' || announcement.priority === priorityFilter;
      const textMatch = !q
        || announcement.title?.toLowerCase().includes(q)
        || announcement.body?.toLowerCase().includes(q)
        || announcement.type?.toLowerCase().includes(q);
      return priorityMatch && textMatch;
    });
  }, [announcements, search, priorityFilter]);

  if (role === 'user') {
    return (
      <div className="min-h-screen faith-canvas pb-24 page-enter px-4 py-20 text-center">
        <div className="max-w-xl mx-auto faith-section py-8 px-4">
          <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Access Denied</h2>
          <p className="text-gray-500">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="min-h-screen faith-canvas pb-24 page-enter flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>;
  }

  return (
    <div className="min-h-screen faith-canvas pb-24 page-enter">
      <div className="px-4 py-6 max-w-2xl mx-auto space-y-5">
        <section className="faith-hero px-4 py-4">
          <div className="relative z-[1]">
            <h1 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 font-display mb-1">Admin Dashboard</h1>
            <p className="text-sm text-emerald-700 dark:text-emerald-300">Manage announcements and monitor community updates.</p>
          </div>
        </section>

        {/* Create Announcement */}
        <div className="faith-section p-5">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-emerald-600" />
          Post Announcement
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
            <input
              required
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="mc-input"
              placeholder="e.g. Eid Prayers at 7:30 AM"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Body (Optional)</label>
            <textarea
              value={form.body}
              onChange={e => setForm({ ...form, body: e.target.value })}
              className="mc-input"
              rows={3}
              placeholder="Additional details..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Priority</label>
              <select
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}
                className="mc-input"
              >
                <option value="normal">Normal</option>
                <option value="important">Important (Amber)</option>
                <option value="urgent">Urgent (Red)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
                className="mc-input"
              >
                <option value="general">General</option>
                <option value="prayer_time">Prayer Times</option>
                <option value="event">Event</option>
                <option value="closure">Closure</option>
                <option value="ramadan">Ramadan</option>
              </select>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Post Announcement
          </button>
        </form>
      </div>

      {/* Active Announcements */}
      <div className="space-y-3">
        <div className="faith-section p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-lg px-1">Active Announcements ({filteredAnnouncements.length})</h3>
            <select
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
              className="mc-input !w-auto !py-1.5 !px-2.5 text-xs"
              aria-label="Filter by priority"
            >
              <option value="all">All priorities</option>
              <option value="normal">Normal</option>
              <option value="important">Important</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 text-emerald-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search title, type, or details"
              className="mc-input pl-9 text-xs py-2.5"
            />
          </div>
        </div>

        {filteredAnnouncements.length === 0 && <p className="text-gray-400 text-sm px-1">No announcements match the current filters.</p>}
        {filteredAnnouncements.map(a => (
          <div key={a.id} className="faith-section rounded-xl p-4 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                  a.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                  a.priority === 'important' ? 'bg-amber-100 text-amber-700' :
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  {a.priority}
                </span>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">{a.title}</h4>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{a.body}</p>
              <div className="flex gap-3 text-[10px] text-gray-400">
                <span>Type: {a.type}</span>
                <span>Posted: {new Date(a.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <button
              onClick={() => handleDelete(a.id)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}
