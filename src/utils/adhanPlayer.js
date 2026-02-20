/**
 * Adhan audio scheduler — MasjidConnect GY
 * Plays Mishary Alafasy adhan when app is open at prayer times.
 * Uses year-round Adhan.js times (not limited to Ramadan timetable).
 * Uses localStorage 'adhan_notif_prayers' (JSON array of prayer names).
 */

import { getPrayerTimesForDate } from './prayerTimes';

const ADHAN_KEY = 'adhan_notif_prayers';
const AUDIO_SRC = '/audio/adhan-alafasy.mp3';

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

/**
 * Schedule adhan playback for today's remaining prayer times.
 * Uses year-round Adhan.js calculation — works every day, not just Ramadan.
 * Call once on app load. Returns cleanup function.
 */
export function scheduleAdhanForToday() {
  timers.forEach(clearTimeout);
  timers = [];

  const enabledPrayers = (() => {
    try {
      const raw = localStorage.getItem(ADHAN_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  })();

  if (enabledPrayers.length === 0) return () => {};

  // Get today's prayer times from Adhan.js (year-round, not Ramadan-only)
  const pt = getPrayerTimesForDate(new Date());
  const now = Date.now();

  const PRAYER_TIME_MAP = {
    Fajr:    pt.fajr,
    Dhuhr:   pt.dhuhr,
    Asr:     pt.asr,
    Maghrib: pt.maghrib,
    Isha:    pt.isha,
  };

  enabledPrayers.forEach(prayer => {
    const prayerDate = PRAYER_TIME_MAP[prayer];
    if (!prayerDate) return;

    const msLeft = prayerDate.getTime() - now;
    // Only schedule if prayer is in the future (within next 16 hours)
    if (msLeft <= 0 || msLeft > 16 * 60 * 60 * 1000) return;

    const timer = setTimeout(() => previewAdhan(), msLeft);
    timers.push(timer);
  });

  return () => {
    timers.forEach(clearTimeout);
    timers = [];
  };
}
