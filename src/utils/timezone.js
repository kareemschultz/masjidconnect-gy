// Guyana timezone utilities
// America/Guyana = UTC-4, no DST

const TZ = 'America/Guyana';

/** Returns today's date string in Guyana time: "YYYY-MM-DD" */
export function guyanaDate() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date());
}

/** Returns current hour (0-23) in Guyana time */
export function guyanaHour() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    hour: 'numeric',
    hour12: false,
  }).formatToParts(new Date());
  const h = parseInt(parts.find(p => p.type === 'hour').value, 10);
  return h === 24 ? 0 : h; // midnight edge case
}

/**
 * Convert a Guyana local time string like "6:08 PM" (from timetable)
 * to a UTC Unix timestamp (ms) for today.
 */
export function guyanaTimeStrToMs(timeStr) {
  if (!timeStr) return null;
  const [time, ampm] = timeStr.split(' ');
  const [h, m] = time.split(':').map(Number);
  let hours = h;
  if (ampm === 'PM' && h !== 12) hours += 12;
  if (ampm === 'AM' && h === 12) hours = 0;

  const dateStr = guyanaDate(); // 'YYYY-MM-DD' in Guyana
  const [year, month, day] = dateStr.split('-').map(Number);
  // Guyana is UTC-4 (no DST) → UTC = Guyana local + 4 hours
  return Date.UTC(year, month - 1, day, hours + 4, m, 0, 0);
}

/**
 * Returns a Guyana date string offset by `dayDelta` days from today.
 * e.g. guyanaDateOffset(-1) = yesterday in Guyana.
 */
export function guyanaDateOffset(dayDelta) {
  const d = new Date();
  // Work in UTC+0 with Guyana offset baked in: UTC-4 means UTC ms - 4h
  const guyanaMs = d.getTime() - 4 * 60 * 60 * 1000 + dayDelta * 86400000;
  const gd = new Date(guyanaMs);
  return gd.toISOString().slice(0, 10);
}

/**
 * Convert a raw 24h hour + minute in Guyana local time to UTC ms for today.
 * e.g. guyanaRawTimeToMs(18, 8) = 6:08 PM Guyana time as UTC ms
 */
export function guyanaRawTimeToMs(hour24, minute) {
  const dateStr = guyanaDate();
  const [year, month, day] = dateStr.split('-').map(Number);
  // Guyana is UTC-4 → UTC = local + 4 hours
  return Date.UTC(year, month - 1, day, hour24 + 4, minute, 0, 0);
}
