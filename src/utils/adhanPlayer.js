/**
 * Adhan audio scheduler — MasjidConnect GY
 * Plays Mishary Alafasy adhan when app is open at prayer times.
 * Uses year-round Adhan.js times (not limited to Ramadan timetable).
 * Uses localStorage 'adhan_notif_prayers' (JSON array of prayer names).
 * 
 * Mobile fix: Uses AudioContext unlock pattern to work on iOS/Android.
 */

import { getPrayerTimesForDate } from './prayerTimes';

const ADHAN_KEY = 'adhan_notif_prayers';
const AUDIO_SRC = '/audio/adhan-alafasy.mp3';

let audio = null;
let audioContext = null;
let audioUnlocked = false;
let timers = [];

/**
 * Unlock the AudioContext on user gesture.
 * Call this from any click/tap handler to enable future audio playback.
 */
export function unlockAudio() {
  if (audioUnlocked) return;
  
  try {
    // Create or resume AudioContext
    if (!audioContext) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioContext = new AC();
    }
    if (audioContext?.state === 'suspended') {
      audioContext.resume();
    }

    // Create and play a silent buffer to unlock HTML5 Audio on iOS
    if (!audio) {
      audio = new Audio(AUDIO_SRC);
      audio.preload = 'auto';
    }
    // Play silent then immediately pause to unlock
    audio.volume = 0;
    const p = audio.play();
    if (p && p.then) {
      p.then(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 1;
        audioUnlocked = true;
      }).catch(() => {});
    }
  } catch (e) {
    // Silently fail, will retry on next gesture
  }
}

function getAudio() {
  if (!audio) {
    audio = new Audio(AUDIO_SRC);
    audio.preload = 'auto';
  }
  return audio;
}

/**
 * Play adhan audio. Returns { audio, playing } for UI feedback.
 */
export function previewAdhan() {
  try {
    const a = getAudio();
    a.currentTime = 0;
    a.volume = 1;
    const p = a.play();
    if (p && p.then) {
      return { audio: a, playing: true, promise: p.catch(() => ({ playing: false, error: 'blocked' })) };
    }
    return { audio: a, playing: true };
  } catch (e) {
    return { audio: null, playing: false, error: e.message };
  }
}

export function stopAdhan() {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
}

/**
 * Check if audio is unlocked and ready for playback.
 */
export function isAudioUnlocked() {
  return audioUnlocked;
}

/**
 * Schedule adhan playback for today's remaining prayer times.
 * Uses year-round Adhan.js calculation.
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
    if (msLeft <= 0 || msLeft > 16 * 60 * 60 * 1000) return;

    const timer = setTimeout(() => {
      const a = getAudio();
      a.currentTime = 0;
      a.volume = 1;
      a.play().catch(() => {
        // If autoplay blocked, try sending a notification instead
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`🕌 ${prayer} Time`, {
            body: 'It is time for ' + prayer + ' prayer. May Allah accept your worship.',
            icon: '/icons/icon-192x192.png',
            tag: 'adhan-' + prayer,
            silent: false,
          });
        }
      });
    }, msLeft);
    timers.push(timer);
  });

  return () => {
    timers.forEach(clearTimeout);
    timers = [];
  };
}
