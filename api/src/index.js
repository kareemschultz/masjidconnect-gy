import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { betterAuth } from 'better-auth';
import { toNodeHandler } from 'better-auth/node';
import pg from 'pg';

const { Pool } = pg;

// ─── Database ─────────────────────────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// ─── Better Auth ──────────────────────────────────────────────────────────────
const auth = betterAuth({
  database: {
    provider: 'pg',
    url: process.env.DATABASE_URL,
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || 'https://masjidconnectgy.com/api/auth',
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
  },
  user: {
    additionalFields: {
      displayName: { type: 'string', required: false, defaultValue: '' },
      community: { type: 'string', required: false, defaultValue: '' }, // e.g. "GIT", "CIOG"
      ramadanStart: { type: 'string', required: false, defaultValue: '2026-02-19' },
      asrMadhab: { type: 'string', required: false, defaultValue: 'shafi' },
    },
  },
  trustedOrigins: [
    'https://masjidconnectgy.com',
    'http://localhost:5173', // dev
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
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));

app.use(express.json());

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'masjidconnect-api', ts: new Date().toISOString() });
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
// Store user's daily tracking data in PostgreSQL (keyed by user_id + date)
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

// ─── Better Auth handler (all /api/auth/* routes) ────────────────────────────
app.all('/api/auth/*', toNodeHandler(auth));

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`MasjidConnect API running on port ${PORT}`);
  // Run DB migrations (better-auth auto-migrates, but we need our custom table)
  try {
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
    console.log('DB schema ready');
  } catch (err) {
    console.error('DB schema error:', err.message);
  }
});
