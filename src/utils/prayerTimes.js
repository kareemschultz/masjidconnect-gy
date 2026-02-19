/**
 * Year-round prayer time calculation for Georgetown, Guyana
 * Uses the Adhan.js library with Muslim World League parameters
 *
 * Georgetown coordinates: 6.8013° N, 58.1551° W
 * Timezone: America/Guyana (UTC-4, no DST)
 */
import * as adhan from 'adhan';
import { getUserAsrMadhab } from './settings';

export const GEORGETOWN = {
  lat: 6.8013,
  lng: -58.1551,
};

/** Build Adhan calculation params respecting user's Asr madhab preference */
function getParams() {
  const params = adhan.CalculationMethod.MuslimWorldLeague();
  // Asr: Shafi (shadow ratio 1) vs Hanafi (shadow ratio 2)
  params.madhab =
    getUserAsrMadhab() === 'hanafi' ? adhan.Madhab.Hanafi : adhan.Madhab.Shafi;
  return params;
}

/** Format a Date object as "H:MM AM/PM" */
function fmt(date) {
  if (!date) return '--:--';
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Guyana',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

/**
 * Returns prayer times for a given JS Date (uses that date's Guyana calendar day).
 * All returned time values are JS Date objects.
 */
export function getPrayerTimesForDate(date) {
  const coords = new adhan.Coordinates(GEORGETOWN.lat, GEORGETOWN.lng);
  // Build a DateComponents from the Guyana calendar day of `date`
  const guyStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Guyana' }).format(date);
  const [y, mo, d] = guyStr.split('-').map(Number);
  const dc = new adhan.DateComponents(y, mo, d);
  return new adhan.PrayerTimes(coords, dc, getParams());
}

/**
 * Returns today's prayer times as formatted strings + raw Date objects.
 * {fajr, sunrise, dhuhr, asr, maghrib, isha, fajrDate, dhuhrDate, ...}
 */
export function getTodayPrayerTimes() {
  const pt = getPrayerTimesForDate(new Date());
  return {
    fajr:    fmt(pt.fajr),
    sunrise: fmt(pt.sunrise),
    dhuhr:   fmt(pt.dhuhr),
    asr:     fmt(pt.asr),
    maghrib: fmt(pt.maghrib),
    isha:    fmt(pt.isha),
    // Raw Date objects for countdown math
    fajrDate:    pt.fajr,
    sunriseDate: pt.sunrise,
    dhuhrDate:   pt.dhuhr,
    asrDate:     pt.asr,
    maghribDate: pt.maghrib,
    ishaDate:    pt.isha,
  };
}

/**
 * Returns tomorrow's prayer times (for post-Isha / post-midnight countdowns).
 */
export function getTomorrowPrayerTimes() {
  const tomorrow = new Date(Date.now() + 86400000);
  const pt = getPrayerTimesForDate(tomorrow);
  return {
    fajr:    fmt(pt.fajr),
    fajrDate: pt.fajr,
    maghrib: fmt(pt.maghrib),
    maghribDate: pt.maghrib,
  };
}

/**
 * Returns the next prayer name + formatted time + ms timestamp.
 * After Isha, returns tomorrow's Fajr.
 */
export function getNextPrayer() {
  const now = Date.now();
  const pt = getPrayerTimesForDate(new Date());

  const prayers = [
    { name: 'Fajr',    date: pt.fajr },
    { name: 'Sunrise', date: pt.sunrise },
    { name: 'Dhuhr',   date: pt.dhuhr },
    { name: 'Asr',     date: pt.asr },
    { name: 'Maghrib', date: pt.maghrib },
    { name: 'Isha',    date: pt.isha },
  ];

  for (const p of prayers) {
    if (p.date && p.date.getTime() > now) {
      return { name: p.name, display: fmt(p.date), ms: p.date.getTime() };
    }
  }

  // All prayers passed → tomorrow's Fajr
  const tom = getTomorrowPrayerTimes();
  if (tom.fajrDate) {
    return { name: 'Fajr', display: tom.fajr, ms: tom.fajrDate.getTime() };
  }
  return null;
}

/**
 * Seconds until today's Maghrib (iftaar equivalent outside Ramadan).
 * Negative if it has passed.
 */
export function getSecondsUntilMaghrib() {
  const pt = getPrayerTimesForDate(new Date());
  if (!pt.maghrib) return null;
  return Math.floor((pt.maghrib.getTime() - Date.now()) / 1000);
}

/**
 * Seconds until tomorrow's Fajr.
 */
export function getSecondsUntilTomorrowFajr() {
  const tom = getTomorrowPrayerTimes();
  if (!tom.fajrDate) return null;
  return Math.floor((tom.fajrDate.getTime() - Date.now()) / 1000);
}

/**
 * Seconds until next prayer (any prayer after now).
 */
export function getSecondsUntilNextPrayer() {
  const next = getNextPrayer();
  if (!next) return null;
  return Math.floor((next.ms - Date.now()) / 1000);
}
