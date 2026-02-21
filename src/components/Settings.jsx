import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Bell, BellOff, Moon, Sun, Calculator, Clock, BookOpen, Globe, ChevronRight, Check, Volume2, Loader2 } from 'lucide-react';
import { useDarkMode } from '../contexts/DarkModeContext';
import { getUserAsrMadhab, setUserAsrMadhab } from '../utils/settings';
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
  { id: 'Standard', label: 'Shafi\'i / Hanbali / Maliki', desc: 'Shadow = object length' },
  { id: 'Hanafi', label: 'Hanafi', desc: 'Shadow = 2x object length (later Asr)' },
];

const STORAGE_KEYS = {
  calcMethod: 'prayer_calc_method',
  notifications: 'notification_prefs',
  quranFont: 'quran_font',
};

function SettingGroup({ title, children }) {
  return (
    <div className="mb-6">
      <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 px-1">{title}</h3>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function SettingRow({ icon: Icon, label, desc, value, onClick, toggle, toggleValue, onToggle, disabled }) {
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
      className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-750 active:bg-gray-100 dark:active:bg-gray-700 transition-colors text-left touch-pan-y ${disabled ? 'opacity-50 cursor-default' : ''}`}
    >
      {Icon && (
        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{label}</p>
        {desc && <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{desc}</p>}
      </div>
      {value && (
        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium shrink-0">{value}</span>
      )}
      {toggle && (
        <div className={`w-11 h-6 rounded-full transition-colors duration-200 relative shrink-0 ${toggleValue ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
          <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${toggleValue ? 'translate-x-5.5 left-[1px]' : 'left-[2px]'}`}
            style={{ transform: toggleValue ? 'translateX(21px)' : 'translateX(0)' }}
          />
        </div>
      )}
      {!toggle && !value && onClick && (
        <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
      )}
    </button>
  );
}

function SelectModal({ title, options, value, onSelect, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-t-3xl w-full max-w-lg max-h-[60vh] pb-20"
        style={{ touchAction: 'pan-y' }}
      >
        <div className="overflow-y-auto max-h-[60vh] overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="sticky top-0 bg-white dark:bg-gray-800 px-5 pt-4 pb-2 border-b border-gray-100 dark:border-gray-700">
          <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{title}</h3>
        </div>
        <div className="p-4 space-y-1">
          {options.map(opt => (
            <button
              key={opt.id}
              onClick={() => { onSelect(opt.id); onClose(); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                value === opt.id
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-750'
              }`}
            >
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{opt.label}</p>
                {opt.desc && <p className="text-[11px] text-gray-400 mt-0.5">{opt.desc}</p>}
              </div>
              {value === opt.id && <Check className="w-4 h-4 text-emerald-500" />}
            </button>
          ))}
        </div>
        </div>
      </div>
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
  const syncTimerRef = { current: null };
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
    // Always stop any existing audio first
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24 page-enter" style={{ touchAction: 'pan-y', WebkitOverflowScrolling: 'touch' }}>
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 dark:from-emerald-800 dark:to-emerald-900 text-white pt-safe pb-5 px-5 rounded-b-3xl shadow-lg relative z-10">
        <div className="flex items-center gap-3 pt-4">
          <Link to="/ramadan" className="p-2 -ml-2 hover:bg-emerald-500/30 rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold font-display">Settings</h1>
        </div>
      </div>

      <div className="p-4">
        {/* Prayer Calculation */}
        <SettingGroup title="Prayer Times">
          <SettingRow
            icon={Calculator}
            label="Calculation Method"
            value={calcMethod}
            onClick={() => setShowCalcModal(true)}
          />
          <SettingRow
            icon={Clock}
            label="Asr Juristic Method"
            value={madhab === 'Hanafi' ? 'Hanafi' : 'Standard'}
            onClick={() => setShowMadhabModal(true)}
          />
        </SettingGroup>

        {/* Notifications */}
        <SettingGroup title="Notifications">
          {!pushSupported ? (
            <SettingRow
              icon={BellOff}
              label="Notifications Unavailable"
              desc="Install as PWA (Add to Home Screen) to enable"
            />
          ) : !pushSubscribed ? (
            <SettingRow
              icon={pushLoading ? Loader2 : Bell}
              label={pushLoading ? 'Enabling...' : 'Enable Notifications'}
              desc="Tap to enable prayer time alerts"
              onClick={pushLoading ? undefined : handleEnableNotifications}
            />
          ) : (
            <SettingRow
              icon={BellOff}
              label="Disable All Notifications"
              desc="Turn off push notifications"
              onClick={handleDisableNotifications}
            />
          )}

          {/* Always show prayer toggles — disabled if not subscribed */}
          {pushSupported && !pushSubscribed && (
            <div className="px-4 py-2 bg-amber-50 dark:bg-amber-900/10 border-b border-gray-100 dark:border-gray-700">
              <p className="text-[11px] text-amber-600 dark:text-amber-400">Enable notifications above to customize which prayers you receive alerts for.</p>
            </div>
          )}
          {pushSupported && (
            <>
              {prayers.map(prayer => (
                <SettingRow
                  key={prayer}
                  icon={Bell}
                  label={`${prayer} Adhan`}
                  toggle
                  toggleValue={pushSubscribed ? notifPrefs[prayer] !== false : false}
                  onToggle={() => togglePrayerNotif(prayer)}
                  disabled={!pushSubscribed}
                />
              ))}
              <SettingRow
                icon={Bell}
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
                icon={Bell}
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

        {/* Adhan Sound */}
        <SettingGroup title="Adhan Sound">
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
              <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100">Mishary Al-Afasy</p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">Default adhan recitation</p>
            </div>
            <button
              onClick={toggleAdhanPreview}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                adhanPlaying
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                  : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
              }`}
            >
              {adhanPlaying ? 'Stop' : 'Preview'}
            </button>
          </div>
        </SettingGroup>

        {/* Display */}
        <SettingGroup title="Display">
          <SettingRow
            icon={darkMode ? Moon : Sun}
            label="Dark Mode"
            toggle
            toggleValue={darkMode}
            onToggle={setDarkMode}
          />
          <SettingRow
            icon={BookOpen}
            label="Quran Font"
            value={quranFont}
            onClick={() => setShowFontModal(true)}
          />
        </SettingGroup>

        {/* About */}
        <SettingGroup title="About">
          <SettingRow
            icon={Globe}
            label="MasjidConnect GY"
            desc="v1.5.0 — No ads. No data collection. Community first."
          />
          <Link to="/feedback" className="block">
            <SettingRow
              label="Send Feedback"
              desc="Report bugs or suggest features"
            />
          </Link>
          <Link to="/changelog" className="block">
            <SettingRow
              label="Changelog"
              desc="What's new in this version"
            />
          </Link>
        </SettingGroup>
      </div>

      {/* Modals */}
      {showCalcModal && (
        <SelectModal
          title="Calculation Method"
          options={CALC_METHODS}
          value={calcMethod}
          onSelect={setCalcMethod}
          onClose={() => setShowCalcModal(false)}
        />
      )}
      {showMadhabModal && (
        <SelectModal
          title="Asr Juristic Method"
          options={MADHAB_OPTIONS}
          value={madhab}
          onSelect={setMadhab}
          onClose={() => setShowMadhabModal(false)}
        />
      )}
      {showFontModal && (
        <SelectModal
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
    </div>
  );
}
