import { useState, useRef, useEffect } from 'react';
import { User, LogOut, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSession, signOut } from '../lib/auth-client';
import AuthModal from './AuthModal';

export default function UserMenu({ variant = 'header' }) {
  const { data: session, isPending } = useSession();
  const [showModal, setShowModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const btnClass = variant === 'nav'
    ? 'flex items-center gap-1.5 px-2.5 py-1.5 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-gray-200 dark:border-gray-700 transition-all'
    : variant === 'nav-icon'
    ? 'p-2 text-gray-500 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors'
    : 'flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-full backdrop-blur-sm transition-all';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (isPending) return null;

  if (!session?.user) {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className={btnClass}
          aria-label="Sign in"
        >
          <User className="w-4 h-4" />
          {variant !== 'nav-icon' && <span>Sign in</span>}
        </button>
        {showModal && <AuthModal onClose={() => setShowModal(false)} />}
      </>
    );
  }

  const { user } = session;
  const initials = (user.name || user.email || '?').slice(0, 2).toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(s => !s)}
        className={variant === 'nav'
          ? 'flex items-center gap-1.5 px-2 py-1.5 text-gray-700 dark:text-gray-200 text-xs font-medium rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all'
          : variant === 'nav-icon'
          ? 'p-2 text-gray-500 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors'
          : 'flex items-center gap-1.5 px-2 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-full backdrop-blur-sm transition-all'
        }
        aria-label="User menu"
      >
        <span className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-[10px] font-bold text-white">
          {initials}
        </span>
        {variant !== 'nav-icon' && (
          <>
            <span className="max-w-[80px] truncate">{user.name || user.email}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {showMenu && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-emerald-50 dark:border-gray-700 z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{user.name}</p>
            <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
          </div>
          <Link
            to="/profile"
            onClick={() => setShowMenu(false)}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
          >
            <User className="w-3.5 h-3.5 text-emerald-600" />
            My Profile &amp; Stats
          </Link>
          <button
            onClick={() => { signOut(); setShowMenu(false); }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
