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
import { betterAuth } from 'better-auth';
import { toNodeHandler } from 'better-auth/node';
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
  },
});

// ─── Express ──────────────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: [
    'https://masjidconnectgy.com',
    'http://localhost:5173',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));

app.use(express.json());

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'masjidconnect-api', ts: new Date().toISOString() });
});

// ─── VAPID public key ─────────────────────────────────────────────────────────
app.get('/api/push/vapid-public-key', (req, res) => {
  if (!VAPID_PUBLIC_KEY) return res.status(503).json({ error: 'Push not configured' });
  res.json({ publicKey: VAPID_PUBLIC_KEY });
});

// ─── Push subscription ────────────────────────────────────────────────────────
app.post('/api/push/subscribe', async (req, res) => {
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
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
  }
});

// ─── Ramadan tracking sync ────────────────────────────────────────────────────
app.get('/api/tracking/:date', async (req, res) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorized' });
    const { date } = req.params;
    const result = await pool.query(
      'SELECT * FROM ramadan_tracking WHERE user_id = $1 AND date = $2',
      [session.user.id, date]
    );
    res.json(result.rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/tracking/:date', async (req, res) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorized' });
    const { date } = req.params;
    const { fasted, quran, dhikr, prayer, masjid } = req.body;
    await pool.query(`
      INSERT INTO ramadan_tracking (user_id, date, fasted, quran, dhikr, prayer, masjid, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (user_id, date)
      DO UPDATE SET fasted=$3, quran=$4, dhikr=$5, prayer=$6, masjid=$7, updated_at=NOW()
    `, [session.user.id, date, !!fasted, !!quran, !!dhikr, !!prayer, !!masjid]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
  }
});

// ─── Feedback submissions ─────────────────────────────────────────────────────
app.post('/api/feedback', async (req, res) => {
  const { type, name, email, message } = req.body || {};
  if (!message || !type) return res.status(400).json({ error: 'type and message are required' });
  try {
    await pool.query(
      `INSERT INTO feedback (type, name, email, message) VALUES ($1, $2, $3, $4)`,
      [type, name || null, email || null, message]
    );

    // Notify via ntfy
    const typeEmoji = { correction: '✏️', add_masjid: '🕌', prayer_time: '🕐', feature: '💡', bug: '🐛', other: '💬' };
    const emoji = typeEmoji[type] || '💬';
    const from = name ? `${name}${email ? ` <${email}>` : ''}` : (email || 'Anonymous');
    sendNtfy({
      title: `${emoji} MasjidConnect Feedback — ${type.replace('_', ' ')}`,
      message: `From: ${from}\n\n${message}`,
      priority: type === 'bug' ? 4 : 3,
      tags: [type === 'bug' ? 'bug' : 'speech_balloon', 'masjid'],
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Event submissions ────────────────────────────────────────────────────────
app.post('/api/events/submit', async (req, res) => {
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
    res.status(500).json({ error: err.message });
  }
});

// ─── Better Auth handler (all /api/auth/* routes) ────────────────────────────
app.all('/api/auth/*', (req, res, next) => {
  try {
    return toNodeHandler(auth)(req, res, next);
  } catch (err) {
    console.error('Auth handler error:', err.message);
    res.status(500).json({ error: 'Auth service unavailable' });
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
    console.log('DB schema ready');
  } catch (err) {
    console.error('DB schema error:', err.message);
  }
});
