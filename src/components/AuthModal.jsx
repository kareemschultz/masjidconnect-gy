import { useState, useEffect } from 'react';
import { X, Moon, Eye, EyeOff, Loader2 } from 'lucide-react';
import { signIn, signUp } from '../lib/auth-client';

function useGoogleEnabled() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    fetch('/api/config')
      .then(r => r.ok ? r.json() : {})
      .then(cfg => setEnabled(!!cfg.googleAuthEnabled))
      .catch(() => {});
  }, []);
  return enabled;
}

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function AuthModal({ onClose, onSuccess }) {
  const GOOGLE_ENABLED = useGoogleEnabled();
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        const res = await signUp.email({ email, password, name, callbackURL: '/' });
        if (res.error) throw new Error(res.error.message);
      } else {
        const res = await signIn.email({ email, password, callbackURL: '/' });
        if (res.error) throw new Error(res.error.message);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await signIn.social({ provider: 'google', callbackURL: '/' });
    } catch (err) {
      setError(err.message || 'Google sign-in failed. Try again.');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-emerald-100 dark:border-emerald-900 animate-fade-in">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Logo */}
        <div className="flex flex-col items-center mb-5">
          <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center mb-2">
            <Moon className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-lg font-bold text-emerald-900 dark:text-emerald-100 font-cinzel">MasjidConnect GY</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {mode === 'signup' ? 'Create a free account' : 'Sign in to sync your data'}
          </p>
        </div>

        {/* Benefits */}
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl px-3 py-2.5 mb-4 space-y-1">
          <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300 mb-1">✨ With an account you can:</p>
          {[
            'Sync Ramadan tracking across devices',
            'Compete with friends on the leaderboard',
            'Keep your streak history safe',
          ].map(b => (
            <p key={b} className="text-[11px] text-emerald-700 dark:text-emerald-400 flex items-start gap-1.5">
              <span className="text-emerald-500 shrink-0 mt-0.5">•</span>{b}
            </p>
          ))}
        </div>

        {/* Google sign-in */}
        {GOOGLE_ENABLED && (
          <>
            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={googleLoading || loading}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-60 mb-3"
            >
              {googleLoading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <GoogleIcon />
              }
              Continue with Google
            </button>

            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-px bg-gray-100 dark:bg-gray-700" />
              <span className="text-[10px] text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-100 dark:bg-gray-700" />
            </div>
          </>
        )}

        {/* Form */}
        <form onSubmit={submit} className="space-y-3">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Brother Kareem"
                required
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'Min 8 characters' : '••••••••'}
                required
                minLength={8}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 pr-10 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
              ⚠️ {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-60 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === 'signup' ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Toggle mode */}
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3">
          {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => { setMode(m => m === 'signup' ? 'signin' : 'signup'); setError(''); }}
            className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
          >
            {mode === 'signup' ? 'Sign in' : 'Create one'}
          </button>
        </p>
        <p className="text-center text-[10px] text-gray-400 dark:text-gray-500 mt-2">
          Optional • No data collected without sign-in • Purely for syncing your own data
        </p>
      </div>
    </div>
  );
}
