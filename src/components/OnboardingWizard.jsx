/**
 * OnboardingWizard — shown once on first visit.
 * Steps:
 *  0. Welcome (features overview + share prompt)
 *  1. Ramadan start date (Feb 18 Saudi / Feb 19 local)
 *  2. Asr madhab (Shafi / Hanafi)
 *  3. Account (optional sign-up to sync tracking data)
 *  4. Notifications + Install
 */
import { useState, useEffect, useCallback } from 'react';
import { Moon, Bell, Smartphone, ChevronRight, Check, X, Share2, User, LogIn } from 'lucide-react';
import { RAMADAN_START_OPTIONS, setUserRamadanStart, getUserRamadanStart } from '../data/ramadanTimetable';
import { getUserAsrMadhab, setUserAsrMadhab } from '../utils/settings';
import { signIn, signUp, useSession } from '../lib/auth-client';

const WIZARD_KEY = 'onboarding_v2';
const TOTAL_STEPS = 5;

// Detect iOS
const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
// Detect if already installed as PWA
const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  navigator.standalone === true;
// Check if Web Push is supported
const isPushSupported = () =>
  'Notification' in window &&
  'serviceWorker' in navigator &&
  'PushManager' in window;

function StepDots({ step }) {
  return (
    <div className="flex justify-center gap-1.5 mb-5">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 rounded-full transition-all ${
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
  const [step, setStep] = useState(0);
  const [ramadanStart, setRamadanStartLocal] = useState(() => getUserRamadanStart());
  const [asrMadhab, setAsrMadhabLocal] = useState(() => getUserAsrMadhab());
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [notifState, setNotifState] = useState('idle'); // idle | requesting | granted | denied | unsupported
  const [authMode, setAuthMode] = useState('signup'); // signup | signin
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const { data: session } = useSession();

  useEffect(() => {
    if (localStorage.getItem(WIZARD_KEY)) return;
    const t = setTimeout(() => setShow(true), 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const finish = useCallback(() => {
    localStorage.setItem(WIZARD_KEY, 'done');
    localStorage.setItem('ramadan_start_prompted', 'done');
    setShow(false);
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
    try {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        localStorage.setItem('ramadan_notifs', 'true');
        setNotifState('granted');
        // Show test notification
        const reg = await navigator.serviceWorker.ready;
        reg.showNotification('MasjidConnect GY 🌙', {
          body: 'Iftaar reminders are on. Ramadan Mubarak!',
          icon: '/manifest-icon-192.maskable.png',
          badge: '/manifest-icon-192.maskable.png',
        });
      } else {
        setNotifState('denied');
      }
    } catch {
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

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={finish} />

      <div className="relative bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-2xl p-6 w-full sm:max-w-sm shadow-2xl border border-emerald-100 dark:border-emerald-900 animate-slide-up sm:animate-fade-in max-h-[90vh] overflow-y-auto">
        {/* Close */}
        <button
          onClick={finish}
          className="absolute top-3 right-3 p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <StepDots step={step} />

        {/* ── Step 0: Welcome ── */}
        {step === 0 && (
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🕌</span>
            </div>
            <h2 className="text-xl font-bold text-emerald-900 dark:text-emerald-100 font-cinzel mb-1">
              MasjidConnect GY
            </h2>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-4">
              Connecting Guyana's Muslim Community
            </p>
            <div className="grid grid-cols-2 gap-2 mb-5 text-left">
              {[
                { icon: '🕌', text: 'Masjid directory for all of Guyana' },
                { icon: '🌙', text: 'Iftaar updates & live reports' },
                { icon: '🕐', text: 'Prayer timetable & Asr madhab' },
                { icon: '📿', text: 'Duas, Qibla & Ramadan tracker' },
                { icon: '🗓️', text: 'Community events year-round' },
                { icon: '📲', text: 'Works offline as a phone app' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-start gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg px-2.5 py-2">
                  <span className="text-sm shrink-0">{icon}</span>
                  <span className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-tight">{text}</span>
                </div>
              ))}
            </div>
            <button
              onClick={handleShare}
              className="w-full py-2.5 mb-2 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl text-sm font-medium transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-900/30 flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" /> Share with a friend
            </button>
            <button
              onClick={next}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              Set Up (takes 1 min) <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Step 1: Ramadan start date ── */}
        {step === 1 && (
          <div>
            <div className="text-center mb-4">
              <p className="text-2xl mb-2">🌙</p>
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
              onClick={() => { setUserRamadanStart(ramadanStart); next(); }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Step 2: Asr madhab ── */}
        {step === 2 && (
          <div>
            <div className="text-center mb-4">
              <p className="text-2xl mb-2">🕐</p>
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
              onClick={() => { setUserAsrMadhab(asrMadhab); next(); }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Step 3: Account (optional) ── */}
        {step === 3 && (
          <div>
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
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
                <Check className="w-5 h-5" /> Signed in as {session.user?.email}
              </div>
            ) : (
              <>
                <div className="flex rounded-xl border border-gray-200 dark:border-gray-700 mb-3 overflow-hidden text-sm">
                  <button
                    onClick={() => { setAuthMode('signup'); setAuthError(''); }}
                    className={`flex-1 py-2 font-medium transition-colors ${authMode === 'signup' ? 'bg-emerald-600 text-white' : 'text-gray-500 dark:text-gray-400'}`}
                  >
                    Sign Up
                  </button>
                  <button
                    onClick={() => { setAuthMode('signin'); setAuthError(''); }}
                    className={`flex-1 py-2 font-medium transition-colors ${authMode === 'signin' ? 'bg-emerald-600 text-white' : 'text-gray-500 dark:text-gray-400'}`}
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
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  )}
                  <input
                    type="email"
                    placeholder="Email"
                    value={authEmail}
                    onChange={e => setAuthEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <input
                    type="password"
                    placeholder="Password (min 8 chars)"
                    value={authPassword}
                    onChange={e => setAuthPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {authError && (
                    <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{authError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    {authLoading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <><LogIn className="w-4 h-4" /> {authMode === 'signup' ? 'Create Account' : 'Sign In'}</>
                    )}
                  </button>
                </form>
              </>
            )}

            <button
              onClick={next}
              className="w-full py-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm font-medium transition-colors"
            >
              {session ? <span className="flex items-center justify-center gap-1.5 text-emerald-600">Continue <ChevronRight className="w-4 h-4" /></span> : 'Skip — I\'ll use it without an account'}
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
                <Bell className="w-3.5 h-3.5" /> Iftaar Reminders
              </p>
              {notifState === 'granted' && (
                <p className="text-xs text-emerald-600 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> Enabled!
                </p>
              )}
              {notifState === 'denied' && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  ⚠️ Blocked in browser settings. Enable under Site Settings → Notifications.
                </p>
              )}
              {notifState === 'unsupported' && isIOS() && !isStandalone() && (
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  📲 On iPhone: Install the app first (see below), then notifications will work.
                </p>
              )}
              {notifState === 'unsupported' && (!isIOS() || isStandalone()) && (
                <p className="text-xs text-gray-500">Notifications not supported in this browser.</p>
              )}
              {(notifState === 'idle' || notifState === 'requesting') && (
                <button
                  onClick={handleNotifRequest}
                  disabled={notifState === 'requesting'}
                  className="mt-2 w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  {notifState === 'requesting' ? 'Requesting...' : '🔔 Enable Reminders'}
                </button>
              )}
            </div>

            {/* PWA Install */}
            {!isStandalone() && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-4 text-left">
                <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" /> Install as App
                </p>
                {deferredPrompt ? (
                  <button
                    onClick={handleInstall}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    📲 Install on Home Screen
                  </button>
                ) : isIOS() ? (
                  <ol className="space-y-1 text-xs text-blue-700 dark:text-blue-400">
                    <li>1. Tap <strong>Share</strong> (⬆️) in Safari</li>
                    <li>2. Tap <strong>"Add to Home Screen"</strong></li>
                    <li>3. Tap <strong>Add</strong> — done!</li>
                  </ol>
                ) : (
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    Open in <strong>Chrome</strong> (Android) or <strong>Safari</strong> (iPhone) to install.
                  </p>
                )}
              </div>
            )}

            <button
              onClick={finish}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" /> {isStandalone() ? 'Get Started!' : 'Done — Let\'s go!'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
