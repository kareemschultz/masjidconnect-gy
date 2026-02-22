import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell, BellOff, Moon, Sun, Calculator, Clock, BookOpen, Globe,
  ChevronRight, Check, Volume2, Loader2, Settings2,
  Sunrise, Sunset, CloudSun, Coffee, UtensilsCrossed, Play, Square,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDarkMode } from '../contexts/useDarkMode';
import { getUserAsrMadhab, setUserAsrMadhab } from '../utils/settings';
import PageHero from './PageHero';
import { subscribeToPush, unsubscribeFromPush, updatePushPreferences, getPushSubscriptionState, isPushSupported } from '../utils/pushNotifications';

const CALC_METHODS = [
  { id: 'MWL', label: 'Muslim World League', desc: 'Europe, Far East, parts of US' },
  { id: 'ISNA', label: 'ISNA', desc: 'North America' },
  { id: 'Egypt', label: 'Egyptian General Authority', desc: 'Africa, Syria, Lebanon' },
  { id: 'Makkah', label: 'Umm Al-Qura', desc: 'Arabian Peninsula' },
  { id: 'Karachi', label: 'University of Islamic Sciences, Karachi', desc: 'Pakistan, Bangladesh, India' },
  { id: 'Tehran', label: 'Institute of Geophysics, Tehran', desc: 'Iran' },
];

const MADHAB_OPTIONS = [
  { id: 'shafi', label: 'Shafi\'i / Hanbali / Maliki', desc: 'Shadow = object length' },
  { id: 'hanafi', label: 'Hanafi', desc: 'Shadow = 2x object length (later Asr)' },
];

const STORAGE_KEYS = {
  calcMethod: 'prayer_calc_method',
  notifications: 'notification_prefs',
  quranFont: 'quran_font',
};

const PRAYER_ICON_MAP = {
  Fajr:    { icon: Sunrise, bg: 'bg-indigo-400' },
  Dhuhr:   { icon: Sun, bg: 'bg-yellow-500' },
  Asr:     { icon: CloudSun, bg: 'bg-orange-400' },
  Maghrib: { icon: Sunset, bg: 'bg-rose-500' },
  Isha:    { icon: Moon, bg: 'bg-slate-600' },
};

function SettingGroup({ title, icon: GroupIcon, color = 'emerald', children }) {
  const colorMap = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500',
    gray: 'bg-gray-400',
  };
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2 px-1">
        <div className={`w-1 h-4 rounded-full ${colorMap[color]}`} />
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">{title}</h3>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm divide-y divide-gray-100 dark:divide-gray-800">
        {children}
      </div>
    </div>
  );
}

function SettingRow({ icon: Icon, iconBg = 'bg-emerald-500', label, desc, value, onClick, toggle, toggleValue, onToggle, disabled, danger }) {
  const handleClick = (e) => {
    if (disabled) return;
    if (toggle && onToggle) {
      e.stopPropagation();
      onToggle(!toggleValue);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/60 active:bg-gray-100 dark:active:bg-gray-800 transition-colors text-left touch-pan-y ${disabled ? 'opacity-40 cursor-default' : ''}`}
    >
      {Icon && (
        <div className={`w-9 h-9 rounded-[10px] ${iconBg} flex items-center justify-center shrink-0`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${danger ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-100'}`}>{label}</p>
        {desc && <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{desc}</p>}
      </div>
      {value && (
        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium shrink-0 max-w-[40%] text-right">{value}</span>
      )}
      {toggle && (
        <div
          className={`w-[51px] h-[31px] rounded-full transition-colors duration-200 relative shrink-0 ${
            toggleValue ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        >
          <div
            className="absolute top-[3px] w-[25px] h-[25px] rounded-full bg-white shadow-sm transition-transform duration-200"
            style={{ transform: toggleValue ? 'translateX(23px)' : 'translateX(3px)' }}
          />
        </div>
      )}
      {!toggle && !value && onClick && (
        <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0" />
      )}
    </button>
  );
}

function SelectModal({ title, options, value, onSelect, onClose }) {
  const listRef = useRef(null);

  useEffect(() => {
    const orig = document.body.style.cssText;
    document.body.style.cssText = 'overflow:hidden;position:fixed;width:100%;';
    return () => { document.body.style.cssText = orig; };
  }, []);

  return (
    <div className="fixed inset-0 z-[100]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="absolute inset-x-0 bottom-0 top-[20vh] bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl flex flex-col"
      >
        <div className="shrink-0 px-5 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="w-10 h-1 rounded-full bg-gradient-to-r from-amber-400/60 to-yellow-400/60 mx-auto mb-3" />
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{title}</h3>
            <button onClick={onClose} className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold px-3 py-1 rounded-lg active:bg-emerald-50 dark:active:bg-emerald-900/20">Done</button>
          </div>
        </div>
        <div ref={listRef} className="flex-1 overflow-y-scroll overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="p-4 pb-24 space-y-1">
            {options.map(opt => {
              const selected = value === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => { onSelect(opt.id); onClose(); }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-colors ${
                    selected
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700'
                      : 'active:bg-gray-50 dark:active:bg-gray-800'
                  }`}
                >
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{opt.label}</p>
                    {opt.desc && <p className="text-[11px] text-gray-400 mt-0.5">{opt.desc}</p>}
                  </div>
                  {selected ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function Settings() {
  const { darkMode, setDarkMode } = useDarkMode();
  const [calcMethod, setCalcMethod] = useState(() => localStorage.getItem(STORAGE_KEYS.calcMethod) || 'MWL');
  const [madhab, setMadhab] = useState(() => getUserAsrMadhab());
  const [quranFont, setQuranFont] = useState(() => localStorage.getItem(STORAGE_KEYS.quranFont) || 'Uthmani');
  const [showCalcModal, setShowCalcModal] = useState(false);
  const [showMadhabModal, setShowMadhabModal] = useState(false);
  const [showFontModal, setShowFontModal] = useState(false);

  // Notification prefs
  const [notifPrefs, setNotifPrefs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.notifications) || '{}');
    } catch { return {}; }
  });
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const pushSupported = isPushSupported();
  const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  // Check push subscription state on mount
  useEffect(() => {
    getPushSubscriptionState().then(({ subscribed }) => setPushSubscribed(subscribed));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.calcMethod, calcMethod);
  }, [calcMethod]);

  useEffect(() => {
    setUserAsrMadhab(madhab);
  }, [madhab]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.quranFont, quranFont);
  }, [quranFont]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(notifPrefs));
  }, [notifPrefs]);

  // Sync notification prefs to backend (debounced)
  const syncTimerRef = useRef(null);
  const syncPrefsToBackend = (prefs) => {
    clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      if (pushSubscribed) {
        updatePushPreferences({ notificationPrefs: prefs });
      }
    }, 500);
  };

  const togglePrayerNotif = (prayer) => {
    setNotifPrefs(prev => {
      const updated = { ...prev, [prayer]: !prev[prayer] };
      syncPrefsToBackend(updated);
      return updated;
    });
  };

  const handleEnableNotifications = async () => {
    setPushLoading(true);
    const allOn = { Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true, suhoor: true, iftaar: true };
    const result = await subscribeToPush({ notificationPrefs: allOn });
    if (result.success) {
      setPushSubscribed(true);
      setNotifPrefs(allOn);
    }
    setPushLoading(false);
  };

  const handleDisableNotifications = async () => {
    setPushLoading(true);
    await unsubscribeFromPush();
    setPushSubscribed(false);
    setPushLoading(false);
  };

  // Adhan preview
  const adhanAudioRef = useRef(null);
  const [adhanPlaying, setAdhanPlaying] = useState(false);

  const toggleAdhanPreview = () => {
    if (adhanAudioRef.current) {
      adhanAudioRef.current.pause();
      adhanAudioRef.current.currentTime = 0;
      adhanAudioRef.current = null;
    }
    if (adhanPlaying) {
      setAdhanPlaying(false);
    } else {
      const audio = new Audio('/audio/adhan-alafasy.mp3');
      adhanAudioRef.current = audio;
      audio.play().catch(() => setAdhanPlaying(false));
      setAdhanPlaying(true);
      const timer = setTimeout(() => {
        if (adhanAudioRef.current === audio) {
          audio.pause();
          audio.currentTime = 0;
          adhanAudioRef.current = null;
          setAdhanPlaying(false);
        }
      }, 10000);
      audio.addEventListener('ended', () => { setAdhanPlaying(false); adhanAudioRef.current = null; clearTimeout(timer); });
      audio.addEventListener('error', () => { setAdhanPlaying(false); adhanAudioRef.current = null; clearTimeout(timer); });
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (adhanAudioRef.current) {
        adhanAudioRef.current.pause();
        adhanAudioRef.current = null;
      }
    };
  }, []);

  const calcMethodLabel = CALC_METHODS.find(m => m.id === calcMethod)?.label || calcMethod;
  const madhabLabel = MADHAB_OPTIONS.find(m => m.id === madhab)?.label || madhab;
  const notificationStatus = !pushSupported
    ? 'Unsupported on this browser'
    : pushLoading
      ? 'Updating notification settings...'
      : pushSubscribed
        ? 'Push notifications enabled'
        : 'Push notifications disabled';

  return (
    <div className="min-h-screen faith-canvas pb-24 page-enter" style={{ touchAction: 'pan-y', WebkitOverflowScrolling: 'touch' }}>
      <PageHero icon={Settings2} title="Settings" subtitle="Preferences & notifications" color="purple" />

      <div className="p-4">
        {/* ── Prayer Times ── */}
        <SettingGroup title="Prayer Times" color="emerald">
          <SettingRow
            icon={Calculator}
            iconBg="bg-emerald-500"
            label="Calculation Method"
            value={calcMethodLabel}
            onClick={() => setShowCalcModal(true)}
          />
          <SettingRow
            icon={Clock}
            iconBg="bg-teal-500"
            label="Asr Juristic Method"
            value={madhabLabel}
            onClick={() => setShowMadhabModal(true)}
          />
        </SettingGroup>

        {/* ── Notifications ── */}
        <SettingGroup title="Notifications" color="amber">
          {/* Status badge */}
          <div className={`flex items-center gap-2 px-4 py-2.5 ${
            pushSubscribed
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900/50'
              : 'bg-gray-50 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-800'
          }`}>
            <div className={`w-2 h-2 rounded-full ${pushSubscribed ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
            <p className={`text-[11px] font-medium ${pushSubscribed ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
              {notificationStatus}
            </p>
          </div>

          {!pushSupported ? (
            <SettingRow
              icon={BellOff}
              iconBg="bg-gray-400"
              label="Notifications Unavailable"
              desc="Install as PWA (Add to Home Screen) to enable"
            />
          ) : !pushSubscribed ? (
            <SettingRow
              icon={pushLoading ? Loader2 : Bell}
              iconBg="bg-amber-500"
              label={pushLoading ? 'Enabling...' : 'Enable Notifications'}
              desc="Tap to enable prayer time alerts"
              onClick={pushLoading ? undefined : handleEnableNotifications}
            />
          ) : (
            <SettingRow
              icon={BellOff}
              iconBg="bg-red-500"
              label="Disable All Notifications"
              desc="Turn off push notifications"
              onClick={handleDisableNotifications}
              danger
            />
          )}

          {pushSupported && !pushSubscribed && (
            <div className="px-4 py-2 bg-amber-50 dark:bg-amber-900/10 border-b border-gray-100 dark:border-gray-800">
              <p className="text-[11px] text-amber-600 dark:text-amber-400">Enable notifications above to customize which prayers you receive alerts for.</p>
            </div>
          )}

          {pushSupported && (
            <>
              {prayers.map(prayer => {
                const prayerMeta = PRAYER_ICON_MAP[prayer];
                return (
                  <SettingRow
                    key={prayer}
                    icon={prayerMeta.icon}
                    iconBg={prayerMeta.bg}
                    label={`${prayer} Adhan`}
                    toggle
                    toggleValue={pushSubscribed ? notifPrefs[prayer] !== false : false}
                    onToggle={() => togglePrayerNotif(prayer)}
                    disabled={!pushSubscribed}
                  />
                );
              })}
              <SettingRow
                icon={Coffee}
                iconBg="bg-amber-700"
                label="Suhoor Reminder"
                desc="30 minutes before Fajr"
                toggle
                toggleValue={pushSubscribed ? notifPrefs.suhoor !== false : false}
                onToggle={() => {
                  setNotifPrefs(p => {
                    const updated = { ...p, suhoor: !p.suhoor };
                    syncPrefsToBackend(updated);
                    return updated;
                  });
                }}
                disabled={!pushSubscribed}
              />
              <SettingRow
                icon={UtensilsCrossed}
                iconBg="bg-emerald-600"
                label="Iftaar Alert"
                desc="At Maghrib time"
                toggle
                toggleValue={pushSubscribed ? notifPrefs.iftaar !== false : false}
                onToggle={() => {
                  setNotifPrefs(p => {
                    const updated = { ...p, iftaar: !p.iftaar };
                    syncPrefsToBackend(updated);
                    return updated;
                  });
                }}
                disabled={!pushSubscribed}
              />
            </>
          )}
        </SettingGroup>

        {/* ── Adhan Sound ── */}
        <SettingGroup title="Adhan Sound" color="purple">
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div className="w-9 h-9 rounded-[10px] bg-purple-500 flex items-center justify-center shrink-0">
              <Volume2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100">Mishary Al-Afasy</p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">Default adhan recitation</p>
            </div>
            <button
              onClick={toggleAdhanPreview}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 ${
                adhanPlaying
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
              }`}
            >
              {adhanPlaying ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
              {adhanPlaying ? 'Stop' : 'Play'}
            </button>
          </div>
        </SettingGroup>

        {/* ── Display ── */}
        <SettingGroup title="Display" color="blue">
          <SettingRow
            icon={darkMode ? Moon : Sun}
            iconBg={darkMode ? 'bg-slate-700' : 'bg-yellow-500'}
            label="Dark Mode"
            toggle
            toggleValue={darkMode}
            onToggle={setDarkMode}
          />
          <SettingRow
            icon={BookOpen}
            iconBg="bg-blue-500"
            label="Quran Font"
            value={quranFont}
            onClick={() => setShowFontModal(true)}
          />
        </SettingGroup>

        {/* ── About ── */}
        <SettingGroup title="About" color="gray">
          <div className="px-4 py-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-gray-500 flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">MasjidConnect GY</p>
                <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-mono px-2 py-0.5 rounded-full">v1.5.4</span>
              </div>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">No ads. No data collection. Community first.</p>
            </div>
          </div>
          <Link to="/feedback" className="block">
            <SettingRow
              icon={Bell}
              iconBg="bg-blue-400"
              label="Send Feedback"
              desc="Report bugs or suggest features"
            />
          </Link>
          <Link to="/changelog" className="block">
            <SettingRow
              icon={BookOpen}
              iconBg="bg-gray-400"
              label="Changelog"
              desc="What's new in this version"
            />
          </Link>
        </SettingGroup>
      </div>

      {/* Modals */}
      <AnimatePresence mode="wait">
        {showCalcModal && (
          <SelectModal
            key="calc"
            title="Calculation Method"
            options={CALC_METHODS}
            value={calcMethod}
            onSelect={setCalcMethod}
            onClose={() => setShowCalcModal(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait">
        {showMadhabModal && (
          <SelectModal
            key="madhab"
            title="Asr Juristic Method"
            options={MADHAB_OPTIONS}
            value={madhab}
            onSelect={setMadhab}
            onClose={() => setShowMadhabModal(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait">
        {showFontModal && (
          <SelectModal
            key="font"
            title="Quran Font"
            options={[
              { id: 'Uthmani', label: 'Uthmani', desc: 'Standard Madinah-style script, clear and widely used' },
              { id: 'IndoPak', label: 'IndoPak', desc: 'South Asian script with extra aids for recitation' },
            ]}
            value={quranFont}
            onSelect={setQuranFont}
            onClose={() => setShowFontModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
