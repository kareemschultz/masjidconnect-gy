import { useState, useEffect, useRef, useCallback } from 'react';
import { UserPlus, Users, Trophy, Check, X, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { API_BASE } from '../config';

const MEDALS = ['🥇', '🥈', '🥉'];

async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── Add Friend Modal ─────────────────────────────────────────────────────────
function AddFriendModal({ onClose, onSent }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const firstFocusRef = useRef(null);
  const lastFocusRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'Tab') {
      const focusable = [inputRef.current, firstFocusRef.current, lastFocusRef.current].filter(Boolean);
      const idx = focusable.indexOf(document.activeElement);
      if (e.shiftKey && idx === 0) {
        e.preventDefault();
        focusable[focusable.length - 1]?.focus();
      } else if (!e.shiftKey && idx === focusable.length - 1) {
        e.preventDefault();
        focusable[0]?.focus();
      }
    }
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setError('');
    try {
      const val = input.trim();
      let body = {};
      if (val.includes('@') && !val.startsWith('@')) {
        body = { email: val };
      } else if (val.startsWith('@')) {
        body = { username: val };
      } else if (/^[\d\s-]{7,}$/.test(val)) {
        // Simple heuristic: if it looks like a phone number
        body = { phone: val };
      } else {
        // Fallback to username if ambiguous
        body = { username: val.startsWith('@') ? val : '@' + val };
      }
      
      await apiFetch('/api/friends/request', { method: 'POST', body: JSON.stringify(body) });
      onSent?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Could not send request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Add Friend"
      onKeyDown={handleKeyDown}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 dark:text-white">Add a Friend</h3>
          <button
            ref={lastFocusRef}
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="buddy-input" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              Search by email, @username, or phone
            </label>
            <input
              id="buddy-input"
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="email@example.com, @user, or 592..."
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              autoComplete="off"
              aria-label="Friend email, username, or phone"
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            ref={firstFocusRef}
            type="submit"
            disabled={loading || !input.trim()}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            Send Request
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── BuddySection ─────────────────────────────────────────────────────────────
export default function BuddySection({ currentUser }) {
  const [friends, setFriends] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [showFriends, setShowFriends] = useState(false);
  const [accepting, setAccepting] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [f, lb] = await Promise.all([
        apiFetch('/api/friends').catch(() => []),
        apiFetch('/api/leaderboard').catch(() => []),
      ]);
      setFriends(Array.isArray(f) ? f : []);
      setLeaderboard(Array.isArray(lb) ? lb : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const acceptRequest = async (id) => {
    setAccepting(id);
    try {
      await apiFetch(`/api/friends/${id}/accept`, { method: 'POST' });
      await loadData();
    } catch {}
    finally { setAccepting(null); }
  };

  const removeFriend = async (id) => {
    try {
      await apiFetch(`/api/friends/${id}`, { method: 'DELETE' });
      setFriends(prev => prev.filter(f => f.id !== id));
    } catch {}
  };

  const pendingReceived = friends.filter(f => f.status === 'pending' && f.direction === 'received');
  const pendingSent = friends.filter(f => f.status === 'pending' && f.direction === 'sent');
  const accepted = friends.filter(f => f.status === 'accepted');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Leaderboard */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-emerald-50 dark:border-gray-700 overflow-hidden">
        <button
          onClick={() => setShowLeaderboard(v => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          aria-expanded={showLeaderboard}
        >
          <span className="flex items-center gap-2 font-semibold text-sm text-gray-900 dark:text-white">
            <Trophy className="w-4 h-4 text-amber-500" />
            Leaderboard
            <span className="text-xs font-normal text-gray-400">({leaderboard.length})</span>
          </span>
          {showLeaderboard
            ? <ChevronUp className="w-4 h-4 text-gray-400" />
            : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>

        {showLeaderboard && (
          <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
            {leaderboard.length === 0 ? (
              <p className="px-4 py-4 text-xs text-gray-400 text-center">
                Add friends to see a leaderboard!
              </p>
            ) : (
              leaderboard.map((entry, i) => (
                <div
                  key={entry.userId}
                  className={`flex items-center gap-3 px-4 py-2.5 ${entry.isMe ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}`}
                >
                  <span className="text-base w-6 text-center shrink-0">
                    {MEDALS[i] || `#${entry.rank}`}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                      {entry.displayName || entry.name}
                      {entry.isMe && <span className="ml-1 text-[10px] text-emerald-500 font-normal">(you)</span>}
                    </p>
                    {entry.streak > 0 && (
                      <p className="text-[10px] text-amber-500">🔥 {entry.streak} day streak</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                      {entry.totalPoints.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-gray-400">pts</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Friends */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-emerald-50 dark:border-gray-700 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setShowFriends(v => !v)}
            className="flex items-center gap-2 font-semibold text-sm text-gray-900 dark:text-white"
            aria-expanded={showFriends}
          >
            <Users className="w-4 h-4 text-emerald-600" />
            Friends
            {pendingReceived.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {pendingReceived.length}
              </span>
            )}
            <span className="text-xs font-normal text-gray-400">({accepted.length})</span>
            {showFriends ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium py-1 px-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
            aria-label="Add friend"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add
          </button>
        </div>

        {showFriends && (
          <div className="border-t border-gray-50 dark:border-gray-700/50">
            {pendingReceived.length > 0 && (
              <div className="px-4 py-2 bg-amber-50 dark:bg-amber-900/20">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2">
                  Pending requests
                </p>
                {pendingReceived.map(f => (
                  <div key={f.id} className="flex items-center gap-2 mb-2 last:mb-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                        {f.displayName || f.name}
                      </p>
                      <p className="text-[10px] text-gray-400 truncate">{f.email}</p>
                    </div>
                    <button
                      onClick={() => acceptRequest(f.id)}
                      disabled={accepting === f.id}
                      className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs transition-colors disabled:opacity-50"
                      aria-label={`Accept friend request from ${f.name}`}
                    >
                      {accepting === f.id
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : <Check className="w-3 h-3" />}
                      Accept
                    </button>
                  </div>
                ))}
              </div>
            )}

            {accepted.length === 0 && pendingReceived.length === 0 && (
              <p className="px-4 py-4 text-xs text-gray-400 text-center">
                No friends yet — add someone to compare progress!
              </p>
            )}

            {accepted.map(f => (
              <div key={f.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/30 group">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                    {f.displayName || f.name}
                  </p>
                  {f.totalPoints != null && (
                    <p className="text-[10px] text-gray-400">
                      {f.totalPoints.toLocaleString()} pts
                      {f.streak > 0 && ` · 🔥 ${f.streak}d`}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeFriend(f.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  aria-label={`Remove ${f.name}`}
                >
                  <X className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>
            ))}

            {pendingSent.length > 0 && (
              <div className="px-4 py-2 border-t border-gray-50 dark:border-gray-700/50">
                <p className="text-[10px] text-gray-400 mb-1">Sent requests ({pendingSent.length})</p>
                {pendingSent.map(f => (
                  <p key={f.id} className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {f.displayName || f.name} · Pending
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showAdd && (
        <AddFriendModal
          onClose={() => setShowAdd(false)}
          onSent={() => { loadData(); }}
        />
      )}
    </div>
  );
}
