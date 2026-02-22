import { useState, useEffect, useRef } from 'react';
import { Compass, MapPin, Navigation } from 'lucide-react';
import PageHero from './PageHero';

// Qibla direction from Georgetown, Guyana (approx 6.8°N, 58.16°W) to Makkah (21.4225°N, 39.8262°E)
// Pre-calculated bearing ≈ 65.5° from True North
const QIBLA_BEARING = 65.5;
const GEORGETOWN_LAT = 6.808;
const GEORGETOWN_LNG = -58.155;

function calcQibla(lat, lng) {
  const mLat = 21.4225 * Math.PI / 180;
  const mLng = 39.8262 * Math.PI / 180;
  const uLat = lat * Math.PI / 180;
  const uLng = lng * Math.PI / 180;
  const dLng = mLng - uLng;
  const x = Math.sin(dLng) * Math.cos(mLat);
  const y = Math.cos(uLat) * Math.sin(mLat) - Math.sin(uLat) * Math.cos(mLat) * Math.cos(dLng);
  let bearing = Math.atan2(x, y) * 180 / Math.PI;
  return (bearing + 360) % 360;
}

export default function QiblaCompass() {
  const [heading, setHeading] = useState(null);
  const [qibla, setQibla] = useState(QIBLA_BEARING);
  const [error, setError] = useState(null);
  const [permissionState, setPermissionState] = useState('prompt');
  const handlerRef = useRef(null);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      pos => setQibla(calcQibla(pos.coords.latitude, pos.coords.longitude)),
      () => {},
      { enableHighAccuracy: false, timeout: 5000 }
    );
  }, []);

  useEffect(() => {
    return () => {
      if (handlerRef.current) {
        window.removeEventListener('deviceorientationabsolute', handlerRef.current, true);
        window.removeEventListener('deviceorientation', handlerRef.current, true);
      }
    };
  }, []);

  const requestCompass = async () => {
    try {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        const perm = await DeviceOrientationEvent.requestPermission();
        if (perm !== 'granted') { setError('Permission denied'); return; }
      }
      setPermissionState('granted');
      handlerRef.current = (e) => {
        const h = e.webkitCompassHeading || (e.alpha ? (360 - e.alpha) : null);
        if (h !== null) setHeading(h);
      };
      window.addEventListener('deviceorientationabsolute', handlerRef.current, true);
      window.addEventListener('deviceorientation', handlerRef.current, true);
    } catch {
      setError('Compass not available on this device');
    }
  };

  const rotation = heading !== null ? qibla - heading : 0;
  const normalizedHeading = heading === null ? null : ((heading % 360) + 360) % 360;
  const signedDelta = normalizedHeading === null ? null : ((((qibla - normalizedHeading) + 540) % 360) - 180);
  const guidance = signedDelta === null
    ? null
    : Math.abs(signedDelta) < 4
      ? 'Aligned with Qibla'
      : signedDelta > 0
        ? `Turn right ${Math.round(Math.abs(signedDelta))}°`
        : `Turn left ${Math.round(Math.abs(signedDelta))}°`;

  return (
    <div className="min-h-screen faith-canvas pb-24 page-enter">
      <PageHero icon={Compass} title="Qibla Compass" subtitle="Direction to the Holy Kaaba" color="teal" backLink="/ramadan" />
      <div className="px-4 max-w-2xl mx-auto space-y-4">

        <section className="worship-surface p-6 text-center">
          <div className="relative w-52 h-52 sm:w-64 sm:h-64 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-200 dark:border-emerald-800" />
            <div className="absolute inset-2 rounded-full border-2 border-emerald-100 dark:border-emerald-900" />

            {['N', 'E', 'S', 'W'].map((dir, i) => (
              <span
                key={dir}
                className="absolute text-xs font-bold text-gray-500 dark:text-gray-400"
                style={{
                  top: i === 0 ? '4px' : i === 2 ? 'auto' : '50%',
                  bottom: i === 2 ? '4px' : 'auto',
                  left: i === 3 ? '4px' : i === 1 ? 'auto' : '50%',
                  right: i === 1 ? '4px' : 'auto',
                  transform: (i === 0 || i === 2) ? 'translateX(-50%)' : 'translateY(-50%)',
                }}
              >
                {dir}
              </span>
            ))}

            <div
              className="absolute inset-4 transition-transform duration-500 ease-out"
              style={{ transform: `rotate(${heading !== null ? rotation : qibla}deg)` }}
            >
              <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <span className="text-2xl">🕋</span>
                <div className="w-0.5 h-16 bg-gradient-to-b from-emerald-600 to-transparent mt-1" />
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <div className="w-0.5 h-12 bg-gradient-to-t from-gray-300 dark:from-gray-600 to-transparent" />
              </div>
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-emerald-600 rounded-full shadow-lg z-10" />
          </div>

          <div className="space-y-2">
            <p className="text-emerald-800 dark:text-emerald-300 font-bold text-lg">{qibla.toFixed(1)}° from North</p>
            {normalizedHeading !== null && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Device heading: <span className="font-semibold text-gray-700 dark:text-gray-200">{normalizedHeading.toFixed(1)}°</span>
              </p>
            )}

            {heading !== null ? (
              <p className="text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-full inline-flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5" />
                Compass active
              </p>
            ) : permissionState === 'prompt' ? (
              <button
                onClick={requestCompass}
                className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                <Compass className="w-4 h-4 inline mr-1" /> Enable Device Compass
              </button>
            ) : null}

            {error && <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">{error}</p>}
          </div>
        </section>

        <section className="faith-section p-4">
          <h3 className="font-bold text-emerald-800 dark:text-emerald-300 text-sm mb-2">About Qibla Guidance</h3>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
            The Qibla is the direction of the Kaaba in Makkah. From Georgetown, Guyana, the prayer direction is approximately
            <strong> {qibla.toFixed(1)}° </strong>
            (East-Northeast).
          </p>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-2 leading-relaxed">
            For best accuracy, hold your phone flat and away from magnets or speakers, then rotate slowly until the indicator aligns.
          </p>
        </section>
      </div>
    </div>
  );
}
