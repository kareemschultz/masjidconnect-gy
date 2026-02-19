/**
 * OnboardingWizard — shown once on first visit.
 * Steps:
 *  1. Welcome
 *  2. Ramadan start date (Feb 18 Saudi / Feb 19 local)
 *  3. Asr madhab (Shafi / Hanafi)
 *  4. Push notifications opt-in
 *  5. Install as PWA (iOS/Android instructions)
 */
import { useState, useEffect } from 'react';
import { Moon, Bell, Smartphone, ChevronRight, Check, X } from 'lucide-react';
import { RAMADAN_START_OPTIONS, setUserRamadanStart, getUserRamadanStart } from '../data/ramadanTimetable';
import { getUserAsrMadhab, setUserAsrMadhab } from '../utils/settings';

const WIZARD_KEY = 'onboarding_v1';
const TOTAL_STEPS = 5;

function StepDots({ step }) {
  return (
    <div className="flex justify-center gap-1.5 mb-5">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <span
          key={i}
          className={`w-1.5 h-1.5 rounded-full transition-all ${
            i < step ? 'bg-emerald-500' : i === step ? 'bg-emerald-600 w-3' : 'bg-gray-200 dark:bg-gray-700'
          }`}
        />
      ))}
    </div>
  );
}

export default function OnboardingWizard() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);
  const [ramadanStart, setRamadanStartLocal] = useState(() => getUserRamadanStart());
  const [asrMadhab, setAsrMadhabLocal] = useState(() => getUserAsrMadhab());
  const [notifStatus, setNotifStatus] = useState('idle'); // 'idle' | 'granted' | 'denied'
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(WIZARD_KEY)) return;
    // Only during Ramadan window
    const now = Date.now();
    if (now < new Date('2026-02-18T00:00:00Z').getTime() ||
        now > new Date('2026-03-21T00:00:00Z').getTime()) return;
    // Short delay to let the app settle
    const t = setTimeout(() => setShow(true), 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    // Listen for PWA install prompt (Android Chrome)
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    // Detect iOS
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const finish = () => {
    localStorage.setItem(WIZARD_KEY, 'done');
    localStorage.setItem('ramadan_start_prompted', 'done');
    setShow(false);
  };

  const next = () => {
    if (step < TOTAL_STEPS - 1) setStep(s => s + 1);
    else finish();
  };

  const skip = () => finish();

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-emerald-100 dark:border-emerald-900 animate-fade-in">
        {/* Skip */}
        <button
          onClick={skip}
          className="absolute top-3 right-3 p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Skip setup"
        >
          <X className="w-4 h-4" />
        </button>

        <StepDots step={step} />

        {/* ── Step 0: Welcome ── */}
        {step === 0 && (
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Moon className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-emerald-900 dark:text-emerald-100 font-cinzel mb-2">
              Welcome to MasjidConnect GY
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
              Your community guide for Ramadan in Georgetown, Guyana. Let's set things up quickly.
            </p>
            <div className="space-y-2 text-left mb-5">
              {[
                '🕌 Find tonight\'s iftaar menu for every masjid',
                '🌙 Track your Ramadan progress daily',
                '🕐 Prayer times with your correct madhab Asr',
                '📿 Duas, Timetable, Qibla & more',
              ].map(b => (
                <p key={b} className="text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                  <span className="shrink-0">{b.slice(0, 2)}</span>
                  <span>{b.slice(2)}</span>
                </p>
              ))}
            </div>
            <button onClick={next} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2">
              Get Started <ChevronRight className="w-4 h-4" />
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
                Communities following <strong>Saudi sighting</strong> started Feb 18; those following the <strong>local Guyana sighting</strong> started Feb 19.
              </p>
            </div>
            <div className="space-y-2 mb-5">
              {RAMADAN_START_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setRamadanStartLocal(opt.value)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                    ramadanStart === opt.value
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                    ramadanStart === opt.value ? 'border-emerald-500' : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {ramadanStart === opt.value && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                  </span>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{opt.label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setUserRamadanStart(ramadanStart);
                next();
              }}
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
                This affects the Asr prayer time shown throughout the app.
              </p>
            </div>
            <div className="space-y-2 mb-5">
              {[
                { value: 'shafi', label: 'Shafi / Maliki / Hanbali', note: 'Shadow = 1× object height' },
                { value: 'hanafi', label: 'Hanafi', note: 'Shadow = 2× object height (~45–60 min later)' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setAsrMadhabLocal(opt.value)}
                  className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                    asrMadhab === opt.value
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700'
                  }`}
                >
                  <span className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                    asrMadhab === opt.value ? 'border-emerald-500' : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {asrMadhab === opt.value && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{opt.label}</p>
                    <p className="text-[11px] text-gray-400">{opt.note}</p>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setUserAsrMadhab(asrMadhab);
                next();
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Step 3: Push notifications ── */}
        {step === 3 && (
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-lg font-bold text-emerald-900 dark:text-emerald-100 font-cinzel mb-2">
              Stay Connected
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
              Get reminded 10 minutes before Iftaar — with duas to recite while waiting.
            </p>
            <div className="space-y-1.5 mb-5 text-left">
              {[
                '🌇 Iftaar reminder 10 min before Maghrib',
                '📿 Post-Iftaar dhikr reminder',
                '⭐ Tahajjud alert during last 10 nights',
              ].map(b => (
                <p key={b} className="text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                  <span className="shrink-0">{b.slice(0, 2)}</span>
                  <span>{b.slice(2)}</span>
                </p>
              ))}
            </div>
            {notifStatus === 'granted' ? (
              <div className="flex items-center justify-center gap-2 text-emerald-600 font-semibold mb-3">
                <Check className="w-5 h-5" /> Reminders enabled!
              </div>
            ) : notifStatus === 'denied' ? (
              <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2 mb-3">
                ⚠️ Notifications blocked. You can enable them later in browser settings.
              </p>
            ) : null}
            {'Notification' in window && notifStatus !== 'granted' && (
              <button
                onClick={async () => {
                  const perm = await Notification.requestPermission();
                  if (perm === 'granted') {
                    localStorage.setItem('ramadan_notifs', 'true');
                    localStorage.setItem('notif_prompt_v1', 'shown');
                    setNotifStatus('granted');
                    new Notification('MasjidConnect GY 🌙', {
                      body: 'Iftaar reminders activated. Ramadan Mubarak!',
                      icon: '/icon-192.png',
                    });
                  } else {
                    setNotifStatus('denied');
                  }
                }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-colors mb-2"
              >
                🔔 Enable Reminders
              </button>
            )}
            <button onClick={next} className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${notifStatus === 'granted' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}>
              {notifStatus === 'granted' ? <>Continue <ChevronRight className="w-4 h-4 inline" /></> : 'Skip for now'}
            </button>
          </div>
        )}

        {/* ── Step 4: Install PWA ── */}
        {step === 4 && (
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-lg font-bold text-emerald-900 dark:text-emerald-100 font-cinzel mb-2">
              Add to Home Screen
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
              Install MasjidConnect GY as an app for faster access and background notifications.
            </p>

            {deferredPrompt ? (
              /* Android / Chrome */
              <button
                onClick={async () => {
                  deferredPrompt.prompt();
                  const { outcome } = await deferredPrompt.userChoice;
                  if (outcome === 'accepted') setDeferredPrompt(null);
                  next();
                }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-colors mb-2"
              >
                📲 Install App
              </button>
            ) : isIOS ? (
              /* iOS Safari instructions */
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 mb-4 text-left">
                <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-2">On iPhone / iPad:</p>
                <ol className="space-y-1.5 text-xs text-blue-700 dark:text-blue-400">
                  <li className="flex items-start gap-2"><span className="shrink-0 font-bold">1.</span> Tap the <strong>Share</strong> button (⬆️) in Safari</li>
                  <li className="flex items-start gap-2"><span className="shrink-0 font-bold">2.</span> Scroll down and tap <strong>"Add to Home Screen"</strong></li>
                  <li className="flex items-start gap-2"><span className="shrink-0 font-bold">3.</span> Tap <strong>Add</strong> — done! 🎉</li>
                </ol>
              </div>
            ) : (
              /* Fallback for other browsers */
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 mb-4 text-left">
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Open this site in <strong>Chrome</strong> on Android or <strong>Safari</strong> on iPhone and use the browser's install / "Add to Home Screen" option.
                </p>
              </div>
            )}

            <button
              onClick={finish}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" /> All done — Let's go!
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
