/**
 * OnboardingWizard — shown once on first visit.
 * Steps:
 *  0. Welcome (features overview + share prompt)
 *  1. Ramadan start date (Feb 18 Saudi / Feb 19 local)
 *  2. Asr madhab (Shafi / Hanafi)
 *  3. Account (optional sign-up to sync tracking data)
 *  4. Notifications + Install
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { Moon, Bell, Smartphone, ChevronRight, Check, X, Share2, User, LogIn } from 'lucide-react';
import { RAMADAN_START_OPTIONS, setUserRamadanStart, getUserRamadanStart } from '../data/ramadanTimetable';
import { getUserAsrMadhab, setUserAsrMadhab } from '../utils/settings';
import { signIn, signUp, useSession } from '../lib/auth-client';

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C33.7 6.1 29.1 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-9 20-20 0-1.3-.1-2.7-.4-4z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 18.9 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C33.7 6.1 29.1 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5.1l-6.2-5.2C29.4 35.5 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.7 39.7 16.4 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.6-2.4 4.7-4.6 6.2l6.2 5.2c3.6-3.4 5.8-8.3 5.8-13.4 0-1.3-.1-2.7-.4-4z"/>
    </svg>
  );
}
import { subscribeToPush, isPushSupported, getPushSubscriptionState } from '../utils/pushNotifications';
import { updatePushPreferences } from '../utils/pushNotifications';

const WIZARD_KEY = 'onboarding_v2';
const TOTAL_STEPS = 5;

// Detect iOS
const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
// Detect if already installed as PWA
const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  navigator.standalone === true;

function StepDots({ step }) {
  return (
    <div className="flex justify-center gap-1.5 mb-5" role="progressbar" aria-valuenow={step + 1} aria-valuemax={TOTAL_STEPS} aria-label={`Step ${step + 1} of ${TOTAL_STEPS}`}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i < step
              ? 'bg-emerald-500 w-1.5'
              : i === step
              ? 'bg-emerald-600 w-4'
              : 'bg-gray-200 dark:bg-gray-700 w-1.5'
          }`}
        />
      ))}
    </div>
  );
}

function RadioOption({ value, selected, onClick, label, note }) {
  return (
    <button
      onClick={() => onClick(value)}
      className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
        selected
          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30'
          : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700'
      }`}
      aria-pressed={selected}
    >
      <span className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
        selected ? 'border-emerald-500' : 'border-gray-300 dark:border-gray-600'
      }`}>
        {selected && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
      </span>
      <div>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</p>
        {note && <p className="text-[11px] text-gray-400 mt-0.5">{note}</p>}
      </div>
    </button>
  );
}

export default function OnboardingWizard() {
  const [show, setShow] = useState(false);
  const [visible, setVisible] = useState(false); // Controls animation
  const [step, setStep] = useState(0);
  const [ramadanStart, setRamadanStartLocal] = useState(() => getUserRamadanStart());
  const [asrMadhab, setAsrMadhabLocal] = useState(() => getUserAsrMadhab());
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [notifState, setNotifState] = useState('idle'); // idle | requesting | granted | denied | unsupported
  const [authMode, setAuthMode] = useState('signup');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const { data: session } = useSession();
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const dialogRef = useRef(null);

  useEffect(() => {
    fetch('/api/config').then(r => r.json()).then(d => setGoogleEnabled(d.googleAuthEnabled)).catch(() => {});
  }, []);

  // Check existing notification state on mount
  useEffect(() => {
    if (!isPushSupported()) return;
    getPushSubscriptionState().then(({ subscribed }) => {
      if (subscribed) setNotifState('granted');
    });
  }, []);

  // Show wizard after delay (only if not completed)
  useEffect(() => {
    if (localStorage.getItem(WIZARD_KEY)) return;
    const t = setTimeout(() => {
      setShow(true);
      // Delay visible state slightly so CSS transition runs properly
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  // Capture Android install prompt
  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Trap focus inside dialog when open
  useEffect(() => {
    if (!show) return;
    const el = dialogRef.current;
    if (!el) return;
    el.focus();
  }, [show, step]);

  const finish = useCallback(() => {
    setVisible(false);
    // Wait for exit animation before unmounting
    setTimeout(() => {
      localStorage.setItem(WIZARD_KEY, 'done');
      localStorage.setItem('ramadan_start_prompted', 'done');
      setShow(false);
    }, 300);
  }, []);

  const next = useCallback(() => {
    setStep(s => {
      if (s >= TOTAL_STEPS - 1) {
        finish();
        return s;
      }
      return s + 1;
    });
  }, [finish]);

  const handleNotifRequest = async () => {
    if (!isPushSupported()) {
      setNotifState('unsupported');
      return;
    }
    setNotifState('requesting');
    const result = await subscribeToPush({
      ramadanStart: localStorage.getItem('ramadan_start') || '2026-02-19',
      asrMadhab: localStorage.getItem('asr_madhab') || 'shafi',
    });
    if (result.success) {
      setNotifState('granted');
    } else if (result.reason === 'denied') {
      setNotifState('denied');
    } else {
      setNotifState('unsupported');
    }
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    }
    finish();
  };

  const handleShare = async () => {
    const shareData = {
      title: 'MasjidConnect GY',
      text: '🕌 Find masjids, iftaar updates, prayer times & more for Guyana\'s Muslim community!',
      url: 'https://masjidconnectgy.com',
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch {}
    } else {
      await navigator.clipboard.writeText('https://masjidconnectgy.com').catch(() => {});
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      if (authMode === 'signup') {
        const res = await signUp.email({
          email: authEmail,
          password: authPassword,
          name: authName || authEmail.split('@')[0],
        });
        if (res.error) throw new Error(res.error.message);
      } else {
        const res = await signIn.email({ email: authEmail, password: authPassword });
        if (res.error) throw new Error(res.error.message);
      }
      next();
    } catch (err) {
      setAuthError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRamadanStartContinue = () => {
    setUserRamadanStart(ramadanStart);
    updatePushPreferences({ ramadanStart }).catch(() => {});
    next();
  };

  const handleAsrMadhabContinue = () => {
    setUserAsrMadhab(asrMadhab);
    updatePushPreferences({ asrMadhab }).catch(() => {});
    next();
  };

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[130] flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to MasjidConnect GY"
      onKeyDown={(e) => { if (e.key === 'Escape') finish(); }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={finish}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={`relative bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-2xl p-6 w-full sm:max-w-sm shadow-2xl border border-emerald-100 dark:border-emerald-900 max-h-[90vh] overflow-y-auto outline-none transition-transform duration-300 ${visible ? 'translate-y-0' : 'translate-y-8 sm:translate-y-2'}`}
      >
        {/* Close */}
        <button
          onClick={finish}
          className="absolute top-3 right-3 p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          aria-label="Close setup wizard"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>

        <StepDots step={step} />

        {/* ── Step 0: Welcome ── */}
        {step === 0 && (
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4" aria-hidden="true">
              <span className="text-3xl">🕌</span>
            </div>
            <h2 className="text-xl font-bold text-emerald-900 dark:text-emerald-100 font-cinzel mb-1">
              MasjidConnect GY
            </h2>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-4">
              Connecting Guyana's Muslim Community
            </p>
            <div className="grid grid-cols-2 gap-2 mb-5 text-left" role="list">
              {[
                { icon: '🕌', text: 'Masjid directory for all of Guyana' },
                { icon: '🌙', text: 'Iftaar updates & live reports' },
                { icon: '🕐', text: 'Prayer timetable & Asr madhab' },
                { icon: '📿', text: 'Duas, Qibla & Ramadan tracker' },
                { icon: '🗓️', text: 'Community events year-round' },
                { icon: '📲', text: 'Works offline as a phone app' },
              ].map(({ icon, text }) => (
                <div key={text} role="listitem" className="flex items-start gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg px-2.5 py-2">
                  <span className="text-sm shrink-0" aria-hidden="true">{icon}</span>
                  <span className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-tight">{text}</span>
                </div>
              ))}
            </div>
            <button
              onClick={handleShare}
              className="w-full py-2.5 mb-2 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl text-sm font-medium transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-900/30 flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <Share2 className="w-4 h-4" aria-hidden="true" /> Share with a friend
            </button>
            <button
              onClick={next}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              Set Up (takes 1 min) <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* ── Step 1: Ramadan start date ── */}
        {step === 1 && (
          <div>
            <div className="text-center mb-4">
              <p className="text-2xl mb-2" aria-hidden="true">🌙</p>
              <h2 className="text-lg font-bold text-emerald-900 dark:text-emerald-100 font-cinzel mb-1">
                When did Ramadan start?
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                This sets your Suhoor/Iftaar countdowns and Ramadan day tracking correctly.
              </p>
            </div>
            <div className="space-y-2 mb-5">
              {RAMADAN_START_OPTIONS.map(opt => (
                <RadioOption
                  key={opt.value}
                  value={opt.value}
                  selected={ramadanStart === opt.value}
                  onClick={setRamadanStartLocal}
                  label={opt.label}
                />
              ))}
            </div>
            <button
              onClick={handleRamadanStartContinue}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              Continue <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* ── Step 2: Asr madhab ── */}
        {step === 2 && (
          <div>
            <div className="text-center mb-4">
              <p className="text-2xl mb-2" aria-hidden="true">🕐</p>
              <h2 className="text-lg font-bold text-emerald-900 dark:text-emerald-100 font-cinzel mb-1">
                Which Asr time do you follow?
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Affects the Asr time shown throughout the app.
              </p>
            </div>
            <div className="space-y-2 mb-5">
              <RadioOption
                value="shafi"
                selected={asrMadhab === 'shafi'}
                onClick={setAsrMadhabLocal}
                label="Shafi / Maliki / Hanbali"
                note="Shadow = 1× object height"
              />
              <RadioOption
                value="hanafi"
                selected={asrMadhab === 'hanafi'}
                onClick={setAsrMadhabLocal}
                label="Hanafi"
                note="Shadow = 2× object height (~45–60 min later)"
              />
            </div>
            <button
              onClick={handleAsrMadhabContinue}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              Continue <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* ── Step 3: Account (optional) ── */}
        {step === 3 && (
          <div>
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3" aria-hidden="true">
                <User className="w-6 h-6 text-emerald-600" />
              </div>
              <h2 className="text-lg font-bold text-emerald-900 dark:text-emerald-100 font-cinzel mb-1">
                Sync Your Progress
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Create a free account to save your Ramadan tracking and preferences across all your devices.
              </p>
            </div>

            {session ? (
              <div className="flex items-center justify-center gap-2 text-emerald-600 font-semibold py-4 mb-3">
                <Check className="w-5 h-5" aria-hidden="true" /> Signed in as {session.user?.email}
              </div>
            ) : (
              <>
                {googleEnabled && (
                  <>
                    <button
                      type="button"
                      onClick={() => signIn.social({ provider: 'google', callbackURL: '/' })}
                      className="w-full flex items-center justify-center gap-2.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors mb-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    >
                      <GoogleIcon /> Continue with Google
                    </button>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                      <span className="text-xs text-gray-400">or</span>
                      <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                    </div>
                  </>
                )}
                <div className="flex rounded-xl border border-gray-200 dark:border-gray-700 mb-3 overflow-hidden text-sm" role="tablist">
                  <button
                    role="tab"
                    aria-selected={authMode === 'signup'}
                    onClick={() => { setAuthMode('signup'); setAuthError(''); }}
                    className={`flex-1 py-2 font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${authMode === 'signup' ? 'bg-emerald-600 text-white' : 'text-gray-500 dark:text-gray-400'}`}
                  >
                    Sign Up
                  </button>
                  <button
                    role="tab"
                    aria-selected={authMode === 'signin'}
                    onClick={() => { setAuthMode('signin'); setAuthError(''); }}
                    className={`flex-1 py-2 font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${authMode === 'signin' ? 'bg-emerald-600 text-white' : 'text-gray-500 dark:text-gray-400'}`}
                  >
                    Sign In
                  </button>
                </div>

                <form onSubmit={handleAuth} className="space-y-2.5 mb-3">
                  {authMode === 'signup' && (
                    <input
                      type="text"
                      placeholder="Your name"
                      value={authName}
                      onChange={e => setAuthName(e.target.value)}
                      autoComplete="name"
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  )}
                  <input
                    type="email"
                    placeholder="Email"
                    value={authEmail}
                    onChange={e => setAuthEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <input
                    type="password"
                    placeholder="Password (min 8 chars)"
                    value={authPassword}
                    onChange={e => setAuthPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {authError && (
                    <p role="alert" className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{authError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    {authLoading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                    ) : (
                      <><LogIn className="w-4 h-4" aria-hidden="true" /> {authMode === 'signup' ? 'Create Account' : 'Sign In'}</>
                    )}
                  </button>
                </form>
              </>
            )}

            <button
              onClick={next}
              className="w-full py-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xl"
            >
              {session
                ? <span className="flex items-center justify-center gap-1.5 text-emerald-600">Continue <ChevronRight className="w-4 h-4" aria-hidden="true" /></span>
                : "Skip — I'll use it without an account"
              }
            </button>
          </div>
        )}

        {/* ── Step 4: Notifications + Install ── */}
        {step === 4 && (
          <div className="text-center">
            <h2 className="text-lg font-bold text-emerald-900 dark:text-emerald-100 font-cinzel mb-1">
              {isStandalone() ? 'All Set!' : 'Stay Connected'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Get Iftaar reminders and install the app for fast offline access.
            </p>

            {/* Notification */}
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 mb-3 text-left">
              <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 mb-2 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5" aria-hidden="true" /> Iftaar Reminders
              </p>
              {notifState === 'granted' && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" aria-hidden="true" /> Enabled! You'll get notified before Iftaar.
                </p>
              )}
              {notifState === 'denied' && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  ⚠️ Blocked in browser settings. Enable under Site Settings → Notifications.
                </p>
              )}
              {notifState === 'unsupported' && isIOS() && !isStandalone() && (
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  📲 On iPhone: Install the app first (see below), then enable reminders from Settings.
                </p>
              )}
              {notifState === 'unsupported' && (!isIOS() || isStandalone()) && (
                <p className="text-xs text-gray-500 dark:text-gray-400">Notifications not supported in this browser.</p>
              )}
              {(notifState === 'idle' || notifState === 'requesting') && (
                <button
                  onClick={handleNotifRequest}
                  disabled={notifState === 'requesting'}
                  className="mt-2 w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-lg text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  {notifState === 'requesting' ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                      Requesting...
                    </span>
                  ) : '🔔 Enable Iftaar Reminders'}
                </button>
              )}
            </div>

            {/* PWA Install */}
            {!isStandalone() && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-4 text-left">
                <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" aria-hidden="true" /> Install as App
                </p>
                {deferredPrompt ? (
                  <button
                    onClick={handleInstall}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    📲 Install on Home Screen
                  </button>
                ) : isIOS() ? (
                  <div className="space-y-2">
                    <p className="text-[11px] text-blue-700 dark:text-blue-300 font-medium mb-1">Follow these steps in Safari:</p>
                    {[
                      { n: '1', text: 'Tap the Share button', sub: '(📤 at the bottom of your Safari screen)' },
                      { n: '2', text: 'Scroll down in the sheet', sub: 'until you see "Add to Home Screen"' },
                      { n: '3', text: 'Tap "Add to Home Screen"', sub: 'then tap Add in the top right' },
                    ].map(s => (
                      <div key={s.n} className="flex items-start gap-2">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center mt-0.5">{s.n}</span>
                        <div>
                          <p className="text-xs text-blue-800 dark:text-blue-200 font-medium">{s.text}</p>
                          <p className="text-[10px] text-blue-600/70 dark:text-blue-400/70">{s.sub}</p>
                        </div>
                      </div>
                    ))}
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 pt-1">
                      ⚠️ Must be opened in <strong>Safari</strong> — Chrome on iPhone cannot install apps.
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    Open in <strong>Chrome</strong> (Android) or <strong>Safari</strong> (iPhone) to install.
                  </p>
                )}
              </div>
            )}

            <button
              onClick={finish}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <Check className="w-4 h-4" aria-hidden="true" /> {isStandalone() ? 'Get Started!' : "Done — Let's go!"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
