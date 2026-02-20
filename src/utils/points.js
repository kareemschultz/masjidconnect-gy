// ─── Granular point system (mirrors API) ──────────────────────────────────────
// Fasting: 50 pts flat | Masjid: 40 pts flat
// Prayer: 5 pts/prayer + 5 pts/jama'ah | Dhikr: 1 pt/10 count (cap 100/day)
// Quran: 10 pts/surah (cap 100/day)

export const CHECKLIST_KEYS = ['fasted', 'quran', 'dhikr', 'prayer', 'masjid'];

// Legacy-shaped export (keys used for streak counting in hooks; values are indicative minimums)
export const POINT_VALUES = { fasted: 50, masjid: 40, quran: 10, prayer: 5, dhikr: 1 };

const PERFECT_BONUS = 50;
const STREAK_MULTIPLIERS = [[21, 2.0], [14, 1.8], [7, 1.5], [3, 1.2]];
export const MIN_FOR_STREAK = 3;

const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

// ─── Levels ───────────────────────────────────────────────────────────────────
export const LEVELS = [
  { min: 4000, level: 5, label: 'Champion',    arabic: 'البطل' },
  { min: 2500, level: 4, label: 'Illuminated', arabic: 'المنير' },
  { min: 1000, level: 3, label: 'Steadfast',   arabic: 'الصابر' },
  { min: 300,  level: 2, label: 'Devoted',     arabic: 'المحسن' },
  { min: 0,    level: 1, label: 'Seeker',      arabic: 'المبتدئ' },
];

export function getLevel(pts) {
  return LEVELS.find(l => pts >= l.min) || LEVELS[LEVELS.length - 1];
}

function getNextLevel(pts) {
  return LEVELS.slice().reverse().find(l => l.min > pts) || null;
}

// ─── Parse helpers (handle object or JSON string) ────────────────────────────
function parseData(val) {
  if (!val) return {};
  if (typeof val === 'string') { try { return JSON.parse(val); } catch { return {}; } }
  return val;
}

// ─── Per-category breakdown ──────────────────────────────────────────────────
export function calcCategoryPoints(record) {
  const bd = {};

  // Fasting: 50 flat
  bd.fasting = record.fasted ? 50 : 0;

  // Masjid: 40 flat
  bd.masjid = record.masjid ? 40 : 0;

  // Prayer: 5 per prayer + 5 per jama'ah
  const pd = parseData(record.prayer_data);
  const prayerCount = PRAYERS.filter(p => pd[p]).length;
  const jamaahCount = PRAYERS.filter(p => pd[p + '_jamaah']).length;
  const effectivePrayers = prayerCount || (record.prayer ? 1 : 0);
  bd.prayer = { pts: effectivePrayers * 5 + jamaahCount * 5, prayers: effectivePrayers, jamaah: jamaahCount };

  // Dhikr: 1 pt per 10 count, cap 100
  const dd = parseData(record.dhikr_data);
  const dhikrCount = dd.count || 0;
  bd.dhikr = { pts: dhikrCount > 0 ? Math.min(Math.floor(dhikrCount / 10), 100) : (record.dhikr ? 10 : 0), count: dhikrCount };

  // Quran: 10 pts per surah, cap 100
  const qd = parseData(record.quran_data);
  const surahsList = qd.surahs || [];
  bd.quran = { pts: surahsList.length > 0 ? Math.min(surahsList.length * 10, 100) : (record.quran ? 10 : 0), surahs: surahsList.length };

  return bd;
}

// ─── Single-day points (returns breakdown object) ─────────────────────────────
export function calculateDayPoints(record, streakDays) {
  const breakdown = calcCategoryPoints(record);
  const base = breakdown.fasting + breakdown.masjid + breakdown.prayer.pts + breakdown.dhikr.pts + breakdown.quran.pts;

  if (base === 0) return { total: 0, base: 0, multiplier: 1, bonus: 0, breakdown };

  let multiplier = 1;
  for (const [min, mult] of STREAK_MULTIPLIERS) {
    if (streakDays >= min) { multiplier = mult; break; }
  }

  const itemsDone = CHECKLIST_KEYS.filter(k => record[k]).length;
  const bonus = itemsDone === 5 ? PERFECT_BONUS : 0;
  const total = Math.round(base * multiplier) + bonus;

  return { total, base, multiplier, bonus, breakdown };
}

// ─── All-time total points (from localStorage data object) ───────────────────
export function calculateTotalPoints(data) {
  const sortedKeys = Object.keys(data).sort();
  let total = 0;

  for (let i = 0; i < sortedKeys.length; i++) {
    let streak = 0;
    for (let j = i - 1; j >= 0; j--) {
      const rec = data[sortedKeys[j]] || {};
      const count = CHECKLIST_KEYS.filter(k => rec[k]).length;
      if (count >= MIN_FOR_STREAK) streak++;
      else break;
    }
    total += calculateDayPoints(data[sortedKeys[i]] || {}, streak).total;
  }

  const level = getLevel(total);
  const nextLevel = getNextLevel(total);
  const progress = nextLevel
    ? Math.round(((total - level.min) / (nextLevel.min - level.min)) * 100)
    : 100;

  return { total, level, nextLevel, progress };
}
