// ─── Point values (mirrors API) ───────────────────────────────────────────────
export const POINT_VALUES = { fasted: 50, masjid: 40, quran: 30, prayer: 25, dhikr: 20 };

const PERFECT_BONUS = 50;
const STREAK_MULTIPLIERS = [[21, 2.0], [14, 1.8], [7, 1.5], [3, 1.2]];
export const MIN_FOR_STREAK = 3;

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

// ─── Single-day points (returns breakdown object) ─────────────────────────────
export function calculateDayPoints(record, streakDays) {
  const base = Object.entries(POINT_VALUES).reduce((s, [k, v]) => s + (record[k] ? v : 0), 0);
  if (base === 0) return { total: 0, base: 0, multiplier: 1, bonus: 0 };

  let multiplier = 1;
  for (const [min, mult] of STREAK_MULTIPLIERS) {
    if (streakDays >= min) { multiplier = mult; break; }
  }

  const itemsDone = Object.keys(POINT_VALUES).filter(k => record[k]).length;
  const bonus = itemsDone === 5 ? PERFECT_BONUS : 0;
  const total = Math.round(base * multiplier) + bonus;

  return { total, base, multiplier, bonus };
}

// ─── All-time total points (from localStorage data object) ───────────────────
export function calculateTotalPoints(data) {
  const sortedKeys = Object.keys(data).sort();
  let total = 0;

  for (let i = 0; i < sortedKeys.length; i++) {
    let streak = 0;
    for (let j = i - 1; j >= 0; j--) {
      const rec = data[sortedKeys[j]] || {};
      const count = Object.keys(POINT_VALUES).filter(k => rec[k]).length;
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
