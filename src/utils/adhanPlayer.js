/**
 * Adhan audio scheduler — MasjidConnect GY
 * Plays Mishary Alafasy adhan when app is open at prayer times.
 * Uses localStorage 'adhan_notif_prayers' (JSON array of prayer names).
 */

import { getTodayTimetable } from '../data/ramadanTimetable';
import { guyanaRawTimeToMs } from './timezone';

const ADHAN_KEY = 'adhan_notif_prayers';
const AUDIO_SRC = '/audio/adhan-alafasy.mp3';

// Timetable field → { label, toH24: (val) => hour24 }
// Timetable values are 12h strings without AM/PM (e.g. '4:58', '6:08')
// Fajr/suhoor is always AM; zuhr/asr/maghrib/isha are PM (add 12 if < 12)
const PRAYER_MAP = {
  Fajr:    { field: 'suhoor',  toH24: h => h },           // always AM
  Dhuhr:   { field: 'zuhr',    toH24: h => h < 12 ? h + 12 : h }, // 12:xx PM
  Asr:     { field: 'asrS',    toH24: h => h < 12 ? h + 12 : h }, // 3-5 PM
  Maghrib: { field: 'maghrib', toH24: h => h < 12 ? h + 12 : h }, // 6 PM
  Isha:    { field: 'isha',    toH24: h => h < 12 ? h + 12 : h }, // 7 PM
};

let audio = null;
let timers = [];

function getAudio() {
  if (!audio) {
    audio = new Audio(AUDIO_SRC);
    audio.preload = 'auto';
  }
  return audio;
}

export function previewAdhan() {
  try {
    const a = getAudio();
    a.currentTime = 0;
    a.play().catch(() => {});
    return a;
  } catch {}
}

export function stopAdhan() {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
}

/** Parse a timetable time string like '6:08' into { hour24, minute } */
function parseTimetableTime(timeStr, toH24) {
  if (!timeStr) return null;
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  return { hour24: toH24(h), minute: m };
}

/**
 * Schedule adhan playback for today's remaining prayer times.
 * Call once on app load. Returns cleanup function.
 */
export function scheduleAdhanForToday() {
  // Clear any existing timers
  timers.forEach(clearTimeout);
  timers = [];

  const enabledPrayers = (() => {
    try {
      const raw = localStorage.getItem(ADHAN_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  })();

  if (enabledPrayers.length === 0) return () => {};

  const today = getTodayTimetable();
  if (!today) return () => {};

  const now = Date.now();

  enabledPrayers.forEach(prayer => {
    const mapping = PRAYER_MAP[prayer];
    if (!mapping) return;

    const timeStr = today[mapping.field];
    const parsed = parseTimetableTime(timeStr, mapping.toH24);
    if (!parsed) return;

    const prayerMs = guyanaRawTimeToMs(parsed.hour24, parsed.minute);
    const msLeft = prayerMs - now;

    // Only schedule if prayer is in the future (within next 12 hours)
    if (msLeft <= 0 || msLeft > 12 * 60 * 60 * 1000) return;

    const timer = setTimeout(() => {
      previewAdhan();
    }, msLeft);

    timers.push(timer);
  });

  return () => {
    timers.forEach(clearTimeout);
    timers = [];
  };
}
