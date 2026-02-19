import 'dotenv/config';
import express from 'express';
import https from 'https';
import http from 'http';

// Prevent crash on unhandled rejections (better-auth init may fail on startup)
process.on('unhandledRejection', (err) => {
  console.error('[UnhandledRejection]', err?.message || err);
});
process.on('uncaughtException', (err) => {
  console.error('[UncaughtException]', err?.message || err);
});

import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { betterAuth } from 'better-auth';
import { toNodeHandler } from 'better-auth/node';
import { username } from 'better-auth/plugins/username';
import pg from 'pg';
import webpush from 'web-push';
import cron from 'node-cron';

const { Pool } = pg;

// ─── Database ─────────────────────────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// ─── VAPID / Web Push setup ───────────────────────────────────────────────────
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@masjidconnectgy.com';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  console.log('Web Push VAPID keys configured');
} else {
  console.warn('VAPID keys not set — push notifications disabled');
}

// ─── ntfy notifications ────────────────────────────────────────────────────────
const NTFY_URL = process.env.NTFY_URL || 'http://172.20.0.12';
const NTFY_TOKEN = process.env.NTFY_TOKEN;
const NTFY_TOPIC = process.env.NTFY_TOPIC || 'masjidconnect-feedback';

function sendNtfy({ title, message, priority = 3, tags = [] }) {
  if (!NTFY_TOKEN) return;
  try {
    const body = Buffer.from(message);
    const url = new URL(`${NTFY_URL}/${NTFY_TOPIC}`);
    const isHttps = url.protocol === 'https:';
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NTFY_TOKEN}`,
        'Title': title,
        'Priority': String(priority),
        'Tags': tags.join(','),
        'Content-Type': 'text/plain',
        'Content-Length': body.length,
      },
    };
    const req = (isHttps ? https : http).request(options, (res) => {
      if (res.statusCode !== 200) console.warn('ntfy response:', res.statusCode);
    });
    req.on('error', (e) => console.warn('ntfy error:', e.message));
    req.write(body);
    req.end();
  } catch (e) {
    console.warn('ntfy send failed:', e.message);
  }
}

// ─── Ramadan timetable (Guyana UTC-4) ─────────────────────────────────────────
// Maghrib times from official GIT timetable (Georgetown, local time)
// Stored as [month, day, hour, minute] in local Guyana time (UTC-4)
const MAGHRIB_TIMES = [
  [2, 18, 18, 8], [2, 19, 18, 8], [2, 20, 18, 8], [2, 21, 18, 8], [2, 22, 18, 8],
  [2, 23, 18, 8], [2, 24, 18, 8], [2, 25, 18, 8], [2, 26, 18, 8], [2, 27, 18, 8],
  [2, 28, 18, 8], [3, 1, 18, 8],  [3, 2, 18, 8],  [3, 3, 18, 8],  [3, 4, 18, 8],
  [3, 5, 18, 8],  [3, 6, 18, 8],  [3, 7, 18, 8],  [3, 8, 18, 8],  [3, 9, 18, 8],
  [3, 10, 18, 7], [3, 11, 18, 7], [3, 12, 18, 7], [3, 13, 18, 7], [3, 14, 18, 7],
  [3, 15, 18, 7], [3, 16, 18, 7], [3, 17, 18, 7], [3, 18, 18, 7], [3, 19, 18, 7],
  [3, 20, 18, 6],
];

// Get today's Maghrib as a UTC Date (Guyana is UTC-4)
function getTodayMaghribUTC() {
  const now = new Date();
  // Guyana date (UTC-4)
  const guyanaOffset = -4 * 60;
  const guyanaMs = now.getTime() + guyanaOffset * 60000;
  const guyanaDate = new Date(guyanaMs);
  const month = guyanaDate.getUTCMonth() + 1;
  const day = guyanaDate.getUTCDate();

  const entry = MAGHRIB_TIMES.find(([m, d]) => m === month && d === day);
  if (!entry) return null;

  const [, , hour, minute] = entry;
  // Convert local Guyana time to UTC: UTC = local + 4h
  const maghribUTC = new Date(Date.UTC(guyanaDate.getUTCFullYear(), month - 1, day, hour + 4, minute, 0));
  return maghribUTC;
}

// ─── Push notification sender ─────────────────────────────────────────────────
async function sendIftaarPushes(minutesBefore = 0) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return;

  let title, body, tag, url;
  if (minutesBefore === 10) {
    title = '🌇 Iftaar in 10 Minutes';
    body = 'Make dua now — the fasting person\'s dua is never rejected!\nاللَّهُمَّ لَكَ صُمْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ';
    tag = 'iftaar-warning-10';
    url = '/ramadan';
  } else {
    title = '🎉 Iftaar Time — Break Your Fast!';
    body = 'اللَّهُمَّ لَكَ صُمْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ\nAllahumma laka sumtu wa \'ala rizqika aftartu\n\nDates · Water · Maghrib prayer';
    tag = 'iftaar-now';
    url = '/duas';
  }

  const payload = JSON.stringify({
    title,
    body,
    tag,
    url,
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    actions: minutesBefore === 0 ? [
      { action: 'duas', title: '📖 Iftaar Duas' },
      { action: 'dismiss', title: 'Dismiss' },
    ] : undefined,
    requireInteraction: minutesBefore === 0,
    vibrate: minutesBefore === 0 ? [300, 100, 300, 100, 300] : [150, 75, 150],
  });

  // Fetch all active subscriptions
  let subs;
  try {
    const result = await pool.query('SELECT * FROM push_subscriptions WHERE active = true');
    subs = result.rows;
  } catch (err) {
    console.error('Failed to fetch push subscriptions:', err.message);
    return;
  }

  console.log(`Sending iftaar push (${minutesBefore}min before) to ${subs.length} subscribers`);

  const sendPromises = subs.map(async (sub) => {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload,
        { TTL: minutesBefore === 0 ? 3600 : 600 }
      );
    } catch (err) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        // Subscription expired — deactivate it
        await pool.query('UPDATE push_subscriptions SET active = false WHERE id = $1', [sub.id]);
      } else {
        console.error(`Push failed for sub ${sub.id}:`, err.message);
      }
    }
  });

  await Promise.allSettled(sendPromises);
}

// ─── Cron: check every minute if it's time to send Iftaar push ───────────────
cron.schedule('* * * * *', async () => {
  const maghrib = getTodayMaghribUTC();
  if (!maghrib) return;

  const now = new Date();
  const diffMs = maghrib.getTime() - now.getTime();
  const diffMin = diffMs / 60000;

  // Fire 10-min warning (within ±30s window)
  if (diffMin >= 9.5 && diffMin < 10.5) {
    await sendIftaarPushes(10).catch(console.error);
  }
  // Fire at-iftaar notification (within ±30s window)
  if (diffMin >= -0.5 && diffMin < 0.5) {
    await sendIftaarPushes(0).catch(console.error);
  }
});

// ─── Better Auth ──────────────────────────────────────────────────────────────
const auth = betterAuth({
  database: pool,   // Pass the pg.Pool directly
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || 'https://masjidconnectgy.com/api/auth',
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
  },
  plugins: [
    username(),
  ],
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? {
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      },
    },
  } : {}),
  user: {
    additionalFields: {
      displayName: { type: 'string', required: false, defaultValue: '' },
      community: { type: 'string', required: false, defaultValue: '' },
      ramadanStart: { type: 'string', required: false, defaultValue: '2026-02-19' },
      asrMadhab: { type: 'string', required: false, defaultValue: 'shafi' },
    },
  },
  trustedOrigins: [
    'https://masjidconnectgy.com',
    'http://localhost:5173',
  ],
  advanced: {
    cookiePrefix: 'mcgy',
    crossSubDomainCookies: { enabled: false },
    // Explicit cookie attributes — ensures session survives Google OAuth redirect
    // when running behind Pangolin reverse proxy
    cookies: {
      session_token: {
        attributes: {
          sameSite: 'lax',
          secure: true,
          path: '/',
        },
      },
    },
  },
});

// ─── Rate limiters ────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

const mutationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

// ─── Input validators ─────────────────────────────────────────────────────────
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const validDate = (d) => DATE_RE.test(d);
const validId = (id) => /^\d+$/.test(String(id));

// ─── Express ──────────────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 3000;

// Trust Pangolin / Traefik reverse proxy so Express sees correct protocol
// and IP — required for Better Auth to set secure cookies properly after
// OAuth redirects (Google Sign-In session persistence fix)
app.set('trust proxy', 1);

app.use(cors({
  origin: [
    'https://masjidconnectgy.com',
    'http://localhost:5173',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));

app.use(express.json({ limit: '16kb' }));
app.use(globalLimiter);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'masjidconnect-api', ts: new Date().toISOString() });
});

// ─── Public config (feature flags) ───────────────────────────────────────────
app.get('/api/config', (req, res) => {
  res.json({
    googleAuthEnabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  });
});

// ─── VAPID public key ─────────────────────────────────────────────────────────
app.get('/api/push/vapid-public-key', (req, res) => {
  if (!VAPID_PUBLIC_KEY) return res.status(503).json({ error: 'Push not configured' });
  res.json({ publicKey: VAPID_PUBLIC_KEY });
});

// ─── Push subscription ────────────────────────────────────────────────────────
app.post('/api/push/subscribe', mutationLimiter, async (req, res) => {
  try {
    const { endpoint, keys, anonId, ramadanStart, asrMadhab } = req.body;
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({ error: 'Missing subscription fields' });
    }

    // Get user session if available (optional)
    let userId = null;
    try {
      const session = await auth.api.getSession({ headers: req.headers });
      userId = session?.user?.id || null;
    } catch {}

    await pool.query(`
      INSERT INTO push_subscriptions (endpoint, p256dh, auth, user_id, anon_id, ramadan_start, asr_madhab, active, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW())
      ON CONFLICT (endpoint)
      DO UPDATE SET p256dh=$2, auth=$3, user_id=COALESCE($4, push_subscriptions.user_id),
        anon_id=COALESCE($5, push_subscriptions.anon_id),
        ramadan_start=COALESCE($6, push_subscriptions.ramadan_start),
        asr_madhab=COALESCE($7, push_subscriptions.asr_madhab),
        active=true, updated_at=NOW()
    `, [endpoint, keys.p256dh, keys.auth, userId, anonId || null,
        ramadanStart || '2026-02-19', asrMadhab || 'shafi']);

    res.json({ success: true });
  } catch (err) {
    console.error('Subscribe error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Unsubscribe ──────────────────────────────────────────────────────────────
app.post('/api/push/unsubscribe', async (req, res) => {
  try {
    const { endpoint } = req.body;
    if (!endpoint) return res.status(400).json({ error: 'Missing endpoint' });
    await pool.query('UPDATE push_subscriptions SET active = false WHERE endpoint = $1', [endpoint]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Update push preferences (ramadanStart, asrMadhab) ───────────────────────
app.patch('/api/push/preferences', async (req, res) => {
  try {
    const { endpoint, ramadanStart, asrMadhab } = req.body;
    if (!endpoint) return res.status(400).json({ error: 'Missing endpoint' });
    const updates = [];
    const values = [];
    if (ramadanStart) { updates.push(`ramadan_start = $${values.length + 1}`); values.push(ramadanStart); }
    if (asrMadhab)    { updates.push(`asr_madhab = $${values.length + 1}`); values.push(asrMadhab); }
    if (!updates.length) return res.json({ success: true });
    values.push(endpoint);
    await pool.query(
      `UPDATE push_subscriptions SET ${updates.join(', ')}, updated_at = NOW() WHERE endpoint = $${values.length}`,
      values
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── User profile (get + update preferences) ──────────────────────────────────
app.get('/api/user/profile', async (req, res) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorized' });
    const { id, email, name, displayName, community, ramadanStart, asrMadhab } = session.user;
    res.json({ id, email, name, displayName, community, ramadanStart, asrMadhab });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/api/user/preferences', async (req, res) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorized' });
    const { ramadanStart, asrMadhab, displayName, community } = req.body;
    const allowed = {};
    if (ramadanStart) allowed.ramadanStart = ramadanStart;
    if (asrMadhab) allowed.asrMadhab = asrMadhab;
    if (displayName !== undefined) allowed.displayName = displayName;
    if (community !== undefined) allowed.community = community;
    await auth.api.updateUser({ body: allowed, headers: req.headers });
    res.json({ success: true, updated: allowed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Ramadan tracking sync ────────────────────────────────────────────────────
app.get('/api/tracking/:date', async (req, res) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorized' });
    const { date } = req.params;
    if (!validDate(date)) return res.status(400).json({ error: 'Invalid date format' });
    const result = await pool.query(
      'SELECT * FROM ramadan_tracking WHERE user_id = $1 AND date = $2',
      [session.user.id, date]
    );
    res.json(result.rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/tracking/:date', async (req, res) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorized' });
    const { date } = req.params;
    if (!validDate(date)) return res.status(400).json({ error: 'Invalid date format' });
    const { fasted, quran, dhikr, prayer, masjid } = req.body;
    await pool.query(`
      INSERT INTO ramadan_tracking (user_id, date, fasted, quran, dhikr, prayer, masjid, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (user_id, date)
      DO UPDATE SET fasted=$3, quran=$4, dhikr=$5, prayer=$6, masjid=$7, updated_at=NOW()
    `, [session.user.id, date, !!fasted, !!quran, !!dhikr, !!prayer, !!masjid]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/tracking', async (req, res) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorized' });
    const result = await pool.query(
      'SELECT * FROM ramadan_tracking WHERE user_id = $1 ORDER BY date ASC',
      [session.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Feedback submissions ─────────────────────────────────────────────────────
app.post('/api/feedback', mutationLimiter, async (req, res) => {
  const { type, name, email, message } = req.body || {};
  if (!message || !type) return res.status(400).json({ error: 'type and message are required' });
  try {
    await pool.query(
      `INSERT INTO feedback (type, name, email, message) VALUES ($1, $2, $3, $4)`,
      [type, name || null, email || null, message]
    );

    // Notify via ntfy (HTTP headers must be ASCII — no emoji in title)
    const typeLabel = { correction: 'Correction', add_masjid: 'Add Masjid', prayer_time: 'Prayer Time Fix', feature: 'Feature Idea', bug: 'Bug Report', other: 'Other' };
    const typeEmoji = { correction: '✏️', add_masjid: '🕌', prayer_time: '🕐', feature: '💡', bug: '🐛', other: '💬' };
    const emoji = typeEmoji[type] || '💬';
    const label = typeLabel[type] || type;
    const from = name ? `${name}${email ? ` <${email}>` : ''}` : (email || 'Anonymous');
    sendNtfy({
      title: `MasjidConnect Feedback: ${label}`,
      message: `${emoji} ${label}\nFrom: ${from}\n\n${message}`,
      priority: type === 'bug' ? 4 : 3,
      tags: [type === 'bug' ? 'bug' : 'speech_balloon', 'masjid'],
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Event submissions ────────────────────────────────────────────────────────
app.post('/api/events/submit', mutationLimiter, async (req, res) => {
  const { title, type, venue, date, time, description, contact, submittedBy } = req.body || {};
  if (!title || !venue || !date || !submittedBy) {
    return res.status(400).json({ error: 'title, venue, date and submittedBy are required' });
  }
  try {
    await pool.query(
      `INSERT INTO event_submissions (title, type, venue, date, time, description, contact, submitted_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [title, type || 'community', venue, date, time || null, description || null, contact || null, submittedBy]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Points calculation (server-side, mirrors src/utils/points.js) ────────────
const POINT_VALUES = { fasted: 50, masjid: 40, quran: 30, prayer: 25, dhikr: 20 };
const PERFECT_BONUS = 50;
const STREAK_MULTIPLIERS = [[21, 2.0], [14, 1.8], [7, 1.5], [3, 1.2]];
const MIN_FOR_STREAK = 3;

function calcDayPoints(record, streakDays) {
  const base = Object.entries(POINT_VALUES).reduce((s, [k, v]) => s + (record[k] ? v : 0), 0);
  if (base === 0) return 0;
  let multiplier = 1;
  for (const [min, mult] of STREAK_MULTIPLIERS) {
    if (streakDays >= min) { multiplier = mult; break; }
  }
  const itemsDone = Object.keys(POINT_VALUES).filter(k => record[k]).length;
  return Math.round(base * multiplier) + (itemsDone === 5 ? PERFECT_BONUS : 0);
}

function calcTotalPoints(rows) {
  const sorted = [...rows].sort((a, b) => String(a.date).localeCompare(String(b.date)));
  let total = 0;
  for (let i = 0; i < sorted.length; i++) {
    let streak = 0;
    for (let j = i - 1; j >= 0; j--) {
      const count = Object.keys(POINT_VALUES).filter(k => sorted[j][k]).length;
      if (count >= MIN_FOR_STREAK) streak++;
      else break;
    }
    total += calcDayPoints(sorted[i], streak);
  }
  return total;
}

const LEVELS = [
  { min: 4000, level: 5, label: 'Champion',    arabic: 'البطل' },
  { min: 2500, level: 4, label: 'Illuminated', arabic: 'المنير' },
  { min: 1000, level: 3, label: 'Steadfast',   arabic: 'الصابر' },
  { min: 300,  level: 2, label: 'Devoted',     arabic: 'المحسن' },
  { min: 0,    level: 1, label: 'Seeker',      arabic: 'المبتدئ' },
];

function getLevel(pts) {
  return LEVELS.find(l => pts >= l.min) || LEVELS[LEVELS.length - 1];
}

// Helper: get points + streak for a user_id
async function getUserStats(userId) {
  const trackRes = await pool.query('SELECT * FROM ramadan_tracking WHERE user_id = $1 ORDER BY date ASC', [userId]);
  return calcStatsFromRows(userId, trackRes.rows);
}

// Helper: compute stats from pre-loaded rows (avoids N+1 in batch contexts)
function calcStatsFromRows(userId, rows) {
  const total = calcTotalPoints(rows);
  let streak = 0;
  // Guyana is UTC-4; avoid off-by-one on date boundary
  const today = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const byDate = Object.fromEntries(rows.map(r => [String(r.date).slice(0, 10), r]));
  let d = new Date(today);
  d.setDate(d.getDate() - 1);
  while (streak < 30) {
    const key = d.toISOString().slice(0, 10);
    const rec = byDate[key];
    if (!rec) break;
    const count = Object.keys(POINT_VALUES).filter(k => rec[k]).length;
    if (count < MIN_FOR_STREAK) break;
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return { totalPoints: total, streak, level: getLevel(total) };
}

// Batch version: single DB query for multiple users → Map<userId, stats>
async function getUserStatsBatch(userIds) {
  if (!userIds.length) return new Map();
  const trackRes = await pool.query(
    'SELECT * FROM ramadan_tracking WHERE user_id = ANY($1) ORDER BY user_id, date ASC',
    [userIds]
  );
  const rowsByUser = {};
  for (const row of trackRes.rows) {
    if (!rowsByUser[row.user_id]) rowsByUser[row.user_id] = [];
    rowsByUser[row.user_id].push(row);
  }
  const result = new Map();
  for (const uid of userIds) {
    result.set(uid, calcStatsFromRows(uid, rowsByUser[uid] || []));
  }
  return result;
}

// ─── Friends: send request ────────────────────────────────────────────────────
app.post('/api/friends/request', mutationLimiter, async (req, res) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorized' });
    const { email, username } = req.body;
    if (!email && !username) return res.status(400).json({ error: 'email or username required' });

    // Find target user by email or @username
    let userRes;
    if (username) {
      const handle = username.replace(/^@/, '').toLowerCase();
      userRes = await pool.query('SELECT id, name, email, "displayName" FROM "user" WHERE LOWER(username) = $1', [handle]);
    } else {
      userRes = await pool.query('SELECT id, name, email, "displayName" FROM "user" WHERE email = $1', [email]);
    }
    // Silently succeed if user not found (prevent enumeration)
    if (!userRes.rows.length) return res.json({ success: true });
    const addressee = userRes.rows[0];

    if (addressee.id === session.user.id) return res.status(400).json({ error: 'Cannot add yourself' });

    // Check existing
    const existing = await pool.query(
      `SELECT id, status FROM friendships WHERE (requester_id=$1 AND addressee_id=$2) OR (requester_id=$2 AND addressee_id=$1)`,
      [session.user.id, addressee.id]
    );
    if (existing.rows.length) {
      const s = existing.rows[0].status;
      return res.status(409).json({ error: s === 'accepted' ? 'Already friends' : 'Request already sent' });
    }

    const ins = await pool.query(
      'INSERT INTO friendships (requester_id, addressee_id) VALUES ($1, $2) RETURNING id',
      [session.user.id, addressee.id]
    );
    res.json({ id: ins.rows[0].id, addressee: { name: addressee.name, displayName: addressee.displayName, email: addressee.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Friends: list (accepted + pending) ──────────────────────────────────────
app.get('/api/friends', async (req, res) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorized' });
    const uid = session.user.id;

    const result = await pool.query(`
      SELECT f.id, f.status, f.created_at,
        CASE WHEN f.requester_id = $1 THEN 'sent' ELSE 'received' END AS direction,
        u.id AS friend_id, u.name, u."displayName", u.email, u.username
      FROM friendships f
      JOIN "user" u ON u.id = CASE WHEN f.requester_id = $1 THEN f.addressee_id ELSE f.requester_id END
      WHERE f.requester_id = $1 OR f.addressee_id = $1
      ORDER BY f.created_at DESC
    `, [uid]);

    // Batch-load stats for accepted friends (single query)
    const acceptedIds = result.rows.filter(r => r.status === 'accepted').map(r => r.friend_id);
    const statsMap = await getUserStatsBatch(acceptedIds);
    const enriched = result.rows.map(row => {
      if (row.status === 'accepted') {
        const stats = statsMap.get(row.friend_id) || { totalPoints: 0, streak: 0, level: getLevel(0) };
        return { ...row, ...stats };
      }
      return { ...row, totalPoints: null, streak: null, level: null };
    });

    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Friends: accept request ──────────────────────────────────────────────────
app.post('/api/friends/:id/accept', async (req, res) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorized' });
    const result = await pool.query(
      `UPDATE friendships SET status = 'accepted' WHERE id = $1 AND addressee_id = $2 AND status = 'pending' RETURNING id`,
      [req.params.id, session.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Request not found or already handled' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Friends: remove ─────────────────────────────────────────────────────────
app.delete('/api/friends/:id', async (req, res) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorized' });
    await pool.query(
      'DELETE FROM friendships WHERE id = $1 AND (requester_id = $2 OR addressee_id = $2)',
      [req.params.id, session.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Leaderboard: self + accepted friends ────────────────────────────────────
app.get('/api/leaderboard', async (req, res) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorized' });
    const uid = session.user.id;

    // Get accepted friend IDs
    const friendRes = await pool.query(`
      SELECT CASE WHEN requester_id = $1 THEN addressee_id ELSE requester_id END AS friend_id
      FROM friendships WHERE (requester_id=$1 OR addressee_id=$1) AND status='accepted'
    `, [uid]);
    const participantIds = [uid, ...friendRes.rows.map(r => r.friend_id)];

    // Get user info for all participants
    const userRes = await pool.query(
      `SELECT id, name, "displayName", username FROM "user" WHERE id = ANY($1)`,
      [participantIds]
    );
    const usersById = Object.fromEntries(userRes.rows.map(u => [u.id, u]));

    // Batch-load stats for all participants (single query, no N+1)
    const statsMap = await getUserStatsBatch(participantIds);
    const entries = participantIds.map(pid => {
      const stats = statsMap.get(pid) || { totalPoints: 0, streak: 0, level: getLevel(0) };
      const u = usersById[pid] || {};
      return {
        userId: pid,
        name: u.name || '',
        displayName: u.displayName || u.name || '',
        username: u.username || null,
        totalPoints: stats.totalPoints,
        streak: stats.streak,
        level: stats.level,
        isMe: pid === uid,
      };
    });

    // Sort by points desc, add rank
    entries.sort((a, b) => b.totalPoints - a.totalPoints);
    entries.forEach((e, i) => { e.rank = i + 1; });

    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Better Auth handler (all /api/auth/* routes) ────────────────────────────
app.all('/api/auth/*', authLimiter, (req, res, next) => {
  try {
    return toNodeHandler(auth)(req, res, next);
  } catch (err) {
    console.error('Auth handler error:', err.message);
    res.status(500).json({ error: 'Auth service unavailable' });
  }
});

// ─── Iftaar Submissions ───────────────────────────────────────────────────────

function rowToSubmission(row) {
  return {
    id: String(row.id),
    masjidId: row.masjid_id,
    menu: row.menu,
    submittedBy: row.submitted_by,
    servings: row.servings,
    notes: row.notes || '',
    date: row.date instanceof Date ? row.date.toISOString().split('T')[0] : String(row.date),
    likes: row.likes,
    attending: row.attending,
    submittedAt: row.submitted_at,
  };
}

// GET /api/submissions?date=YYYY-MM-DD
app.get('/api/submissions', async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    if (!validDate(date)) return res.status(400).json({ error: 'Invalid date format' });

    // Get optional user session for per-user reaction state
    let userId = null;
    try {
      const session = await auth.api.getSession({ headers: req.headers });
      userId = session?.user?.id || null;
    } catch {}

    const result = await pool.query(
      'SELECT * FROM iftaar_submissions WHERE date = $1 ORDER BY submitted_at DESC',
      [date]
    );

    if (!userId || !result.rows.length) {
      return res.json(result.rows.map(rowToSubmission));
    }

    // Fetch user's reactions for all returned submissions
    const ids = result.rows.map(r => r.id);
    const reactRes = await pool.query(
      'SELECT submission_id, type FROM submission_reactions WHERE submission_id = ANY($1) AND user_id = $2',
      [ids, userId]
    );
    const reacted = new Map();
    for (const r of reactRes.rows) {
      if (!reacted.has(r.submission_id)) reacted.set(r.submission_id, new Set());
      reacted.get(r.submission_id).add(r.type);
    }

    res.json(result.rows.map(row => ({
      ...rowToSubmission(row),
      userLiked: reacted.get(row.id)?.has('like') ?? false,
      userAttending: reacted.get(row.id)?.has('attend') ?? false,
    })));
  } catch (err) {
    console.error('GET /api/submissions error:', err.message);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// POST /api/submissions
app.post('/api/submissions', mutationLimiter, async (req, res) => {
  try {
    const { masjidId, menu, submittedBy, servings, notes, date } = req.body;
    if (!masjidId || !menu || !submittedBy) {
      return res.status(400).json({ error: 'masjidId, menu, submittedBy are required' });
    }
    const result = await pool.query(
      `INSERT INTO iftaar_submissions (masjid_id, menu, submitted_by, servings, notes, date)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [masjidId, menu, submittedBy, servings || null, notes || '', date || new Date().toISOString().split('T')[0]]
    );
    const submission = rowToSubmission(result.rows[0]);

    // Notify via ntfy
    sendNtfy({
      title: 'New Iftaar Report',
      message: `${submittedBy} submitted for ${masjidId}: ${menu}`,
      tags: ['fork_and_knife'],
    });

    res.status(201).json(submission);
  } catch (err) {
    console.error('POST /api/submissions error:', err.message);
    res.status(500).json({ error: 'Failed to create submission' });
  }
});

// POST /api/submissions/:id/react  { type: 'like'|'attend', delta: 1|-1 }
app.post('/api/submissions/:id/react', mutationLimiter, async (req, res) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    if (!validId(id)) return res.status(400).json({ error: 'Invalid id' });
    const { type, delta } = req.body;
    if (!['like', 'attend'].includes(type) || ![1, -1].includes(delta)) {
      return res.status(400).json({ error: 'Invalid type or delta' });
    }

    const col = type === 'like' ? 'likes' : 'attending';
    const userId = session.user.id;

    if (delta === 1) {
      // Only count if not already reacted
      const ins = await pool.query(
        `INSERT INTO submission_reactions (submission_id, user_id, type) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
        [id, userId, type]
      );
      if (ins.rowCount === 0) {
        // Already reacted — return current state without changing count
        const cur = await pool.query('SELECT * FROM iftaar_submissions WHERE id = $1', [id]);
        if (!cur.rows.length) return res.status(404).json({ error: 'Not found' });
        return res.json({ ...rowToSubmission(cur.rows[0]), userLiked: true, userAttending: true });
      }
      await pool.query(`UPDATE iftaar_submissions SET ${col} = ${col} + 1 WHERE id = $1`, [id]);
    } else {
      // Only decrement if reaction exists
      const del = await pool.query(
        `DELETE FROM submission_reactions WHERE submission_id = $1 AND user_id = $2 AND type = $3`,
        [id, userId, type]
      );
      if (del.rowCount > 0) {
        await pool.query(`UPDATE iftaar_submissions SET ${col} = GREATEST(0, ${col} - 1) WHERE id = $1`, [id]);
      }
    }

    const result = await pool.query('SELECT * FROM iftaar_submissions WHERE id = $1', [id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });

    // Return user's current reaction state
    const userReactions = await pool.query(
      'SELECT type FROM submission_reactions WHERE submission_id = $1 AND user_id = $2',
      [id, userId]
    );
    const reacted = new Set(userReactions.rows.map(r => r.type));
    res.json({ ...rowToSubmission(result.rows[0]), userLiked: reacted.has('like'), userAttending: reacted.has('attend') });
  } catch (err) {
    console.error('POST /api/submissions/:id/react error:', err.message);
    res.status(500).json({ error: 'Failed to update reaction' });
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`MasjidConnect API running on port ${PORT}`);
  // Run DB migrations
  try {
    // better-auth tables (camelCase column names — required by better-auth's Kysely adapter)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "user" (
        id TEXT NOT NULL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        "emailVerified" BOOLEAN NOT NULL DEFAULT FALSE,
        image TEXT,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "displayName" TEXT DEFAULT '',
        community TEXT DEFAULT '',
        "ramadanStart" TEXT DEFAULT '2026-02-19',
        "asrMadhab" TEXT DEFAULT 'shafi'
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS session (
        id TEXT NOT NULL PRIMARY KEY,
        "expiresAt" TIMESTAMPTZ NOT NULL,
        token TEXT NOT NULL UNIQUE,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "ipAddress" TEXT,
        "userAgent" TEXT,
        "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS session_user_id_idx ON session("userId");
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS account (
        id TEXT NOT NULL PRIMARY KEY,
        "accountId" TEXT NOT NULL,
        "providerId" TEXT NOT NULL,
        "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        "accessToken" TEXT,
        "refreshToken" TEXT,
        "idToken" TEXT,
        "accessTokenExpiresAt" TIMESTAMPTZ,
        "refreshTokenExpiresAt" TIMESTAMPTZ,
        scope TEXT,
        password TEXT,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS account_user_id_idx ON account("userId");
      CREATE INDEX IF NOT EXISTS account_provider_idx ON account("providerId", "accountId");
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS verification (
        id TEXT NOT NULL PRIMARY KEY,
        identifier TEXT NOT NULL,
        value TEXT NOT NULL,
        "expiresAt" TIMESTAMPTZ NOT NULL,
        "createdAt" TIMESTAMPTZ DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    // App-specific tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS feedback (
        id SERIAL PRIMARY KEY,
        type TEXT NOT NULL,
        name TEXT,
        email TEXT,
        message TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        reviewed BOOLEAN DEFAULT FALSE
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS event_submissions (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        type TEXT DEFAULT 'community',
        venue TEXT NOT NULL,
        date DATE NOT NULL,
        time TIME,
        description TEXT,
        contact TEXT,
        submitted_by TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        approved BOOLEAN DEFAULT FALSE
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ramadan_tracking (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        date DATE NOT NULL,
        fasted BOOLEAN DEFAULT FALSE,
        quran BOOLEAN DEFAULT FALSE,
        dhikr BOOLEAN DEFAULT FALSE,
        prayer BOOLEAN DEFAULT FALSE,
        masjid BOOLEAN DEFAULT FALSE,
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, date)
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id SERIAL PRIMARY KEY,
        endpoint TEXT NOT NULL UNIQUE,
        p256dh TEXT NOT NULL,
        auth TEXT NOT NULL,
        user_id TEXT,
        anon_id TEXT,
        ramadan_start TEXT DEFAULT '2026-02-19',
        asr_madhab TEXT DEFAULT 'shafi',
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS push_subs_active_idx ON push_subscriptions(active) WHERE active = true;
      CREATE INDEX IF NOT EXISTS push_subs_user_idx ON push_subscriptions(user_id) WHERE user_id IS NOT NULL;
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS friendships (
        id SERIAL PRIMARY KEY,
        requester_id TEXT NOT NULL,
        addressee_id TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(requester_id, addressee_id)
      );
      CREATE INDEX IF NOT EXISTS friendships_requester_idx ON friendships(requester_id);
      CREATE INDEX IF NOT EXISTS friendships_addressee_idx ON friendships(addressee_id);
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS iftaar_submissions (
        id SERIAL PRIMARY KEY,
        masjid_id TEXT NOT NULL,
        menu TEXT NOT NULL,
        submitted_by TEXT NOT NULL,
        servings INTEGER,
        notes TEXT DEFAULT '',
        date DATE NOT NULL,
        likes INTEGER NOT NULL DEFAULT 0,
        attending INTEGER NOT NULL DEFAULT 0,
        submitted_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS iftaar_submissions_date_idx ON iftaar_submissions(date);
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS submission_reactions (
        id SERIAL PRIMARY KEY,
        submission_id INTEGER NOT NULL REFERENCES iftaar_submissions(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('like', 'attend')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(submission_id, user_id, type)
      );
      CREATE INDEX IF NOT EXISTS submission_reactions_sub_idx ON submission_reactions(submission_id);
      CREATE INDEX IF NOT EXISTS submission_reactions_user_idx ON submission_reactions(user_id);
    `);
    console.log('DB schema ready');
  } catch (err) {
    console.error('DB schema error:', err.message);
  }
});
