// ─── Granular point system (mirrors API) ──────────────────────────────────────
// Fasting: 50 pts flat | Masjid: 40 pts flat
// Prayer: 5 pts/prayer + 5 pts/jama'ah | Dhikr: 1 pt/10 count (cap 100/day)
// Quran: 10 pts/surah (cap 100/day)
// Adhkar: 25 pts morning + 25 pts evening | Tasbih: 5 pts/set (cap 50/day)
// Quran Goal: 20 pts bonus when met | Madrasa: 15 pts/lesson
// Buddy: 10 pts adding friend, 5 pts accepting

export const CHECKLIST_KEYS = ['fasted', 'quran', 'dhikr', 'prayer', 'masjid'];

// Legacy-shaped export (values are indicative bases)
export const POINT_VALUES = { fasted: 50, masjid: 40, quran: 10, prayer: 5, dhikr: 1 };

// Extended point values for new categories
export const EXTENDED_POINT_VALUES = {
  adhkar_morning: 25,
  adhkar_evening: 25,
  tasbih_set: 5,
  tasbih_cap: 50,
  quran_goal: 20,
  madrasa_lesson: 15,
  buddy_add: 10,
  buddy_accept: 5,
};

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

// ─── Parse helpers ────────────────────────────────────────────────────────────
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
  let prayerPts = 0;
  let prayerCount = 0;
  let jamaahCount = 0;
  PRAYERS.forEach(p => {
    const entry = pd[p];
    if (entry) {
      const performed = entry === true || entry.performed;
      if (performed) {
        prayerCount++;
        prayerPts += 5;
        if (entry.jamaat) {
          jamaahCount++;
          prayerPts += 5;
        }
      }
    }
  });
  // Fallback
  if (prayerPts === 0 && record.prayer) {
    prayerPts = 25;
    prayerCount = 1;
  }
  bd.prayer = { pts: prayerPts, prayers: prayerCount, jamaah: jamaahCount };

  // Dhikr: 1 pt per 10 count, cap 100
  const dd = parseData(record.dhikr_data);
  const dhikrCount = parseInt(dd.count || 0, 10);
  let dhikrPts = dhikrCount > 0 ? Math.min(Math.floor(dhikrCount / 10), 100) : 0;
  if (dhikrPts === 0 && record.dhikr) dhikrPts = 20;
  bd.dhikr = { pts: dhikrPts, count: dhikrCount };

  // Quran: 10 pts per surah, cap 100
  const qd = parseData(record.quran_data);
  const surahsList = qd.surahs || [];
  let quranPts = surahsList.length > 0 ? Math.min(surahsList.length * 10, 100) : 0;
  if (quranPts === 0 && record.quran) quranPts = 30;
  bd.quran = { pts: quranPts, surahs: surahsList.length };

  // ─── New categories ─────────────────────────────────────────────────────────

  // Adhkar: 25 pts morning, 25 pts evening (read from adhkar_data)
  const ad = parseData(record.adhkar_data);
  let adhkarPts = 0;
  if (ad.morning_complete) adhkarPts += 25;
  if (ad.evening_complete) adhkarPts += 25;
  bd.adhkar = { pts: adhkarPts, morning: !!ad.morning_complete, evening: !!ad.evening_complete };

  // Tasbih: 5 pts per completed set (33 count), cap 50/day
  const td = parseData(record.tasbih_data);
  const tasbihSets = parseInt(td.sets || 0, 10);
  const tasbihPts = Math.min(tasbihSets * 5, 50);
  bd.tasbih = { pts: tasbihPts, sets: tasbihSets };

  // Quran Reading Goal: 20 pts bonus when daily goal is met
  const qgd = parseData(record.quran_goal_data);
  const quranGoalPts = qgd.completed ? 20 : 0;
  bd.quranGoal = { pts: quranGoalPts, completed: !!qgd.completed };

  // Madrasa: 15 pts per lesson completed
  const md = parseData(record.madrasa_data);
  const madrasaLessons = md.lessons || [];
  const madrasaPts = madrasaLessons.length * 15;
  bd.madrasa = { pts: madrasaPts, lessons: madrasaLessons.length };

  // Buddy: points tracked on action, not daily (10 for add, 5 for accept)
  const bud = parseData(record.buddy_data);
  const buddyPts = (parseInt(bud.adds || 0, 10) * 10) + (parseInt(bud.accepts || 0, 10) * 5);
  bd.buddy = { pts: buddyPts };

  return bd;
}

// ─── Single-day points (returns breakdown object) ─────────────────────────────
export function calculateDayPoints(record, streakDays) {
  const breakdown = calcCategoryPoints(record);
  const base = breakdown.fasting + breakdown.masjid + breakdown.prayer.pts + breakdown.dhikr.pts + breakdown.quran.pts
    + breakdown.adhkar.pts + breakdown.tasbih.pts + breakdown.quranGoal.pts + breakdown.madrasa.pts + breakdown.buddy.pts;

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

// ─── All-time total points ───────────────────────────────────────────────────
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
