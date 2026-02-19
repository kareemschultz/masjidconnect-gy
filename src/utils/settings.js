/** Shared user preference helpers (all backed by localStorage) */

/** Asr madhab: 'shafi' (Shafi/Maliki/Hanbali) or 'hanafi' */
export function getUserAsrMadhab() {
  return localStorage.getItem('asr_madhab') || 'shafi';
}
export function setUserAsrMadhab(madhab) {
  localStorage.setItem('asr_madhab', madhab);
}

/** Get the correct Asr time from a timetable row based on user's madhab preference */
export function getAsrTime(row) {
  if (!row) return null;
  return getUserAsrMadhab() === 'hanafi' ? row.asrH : row.asrS;
}
