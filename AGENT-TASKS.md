# MasjidConnect GY - Feature Sprint Tasks

## Project: /home/karetech/georgetown-iftaar/
## Stack: React + Vite (frontend), Express + SQLite + better-auth (API at api/src/index.js)
## Live: https://masjidconnectgy.com
## Design: Islamic green/gold, Tailwind CSS, mobile-first PWA, accessible

---

## PRIORITY 1: Bug Fixes

### 1A. Fix Adhan Audio Playback on Mobile
**File:** `src/utils/adhanPlayer.js`, `src/components/RamadanCompanion.jsx`
**Issue:** Audio doesn't play on mobile because:
- `new Audio()` + `setTimeout` plays outside user gesture context (blocked by mobile browsers)
- `.play().catch(() => {})` silently swallows errors
**Fix:**
- On preview button click (user gesture), create AudioContext and resume it, then play
- For scheduled playback: use Web Audio API with an unlocked AudioContext, OR use the Notifications API with sound
- Add visual feedback when audio fails (e.g., "Tap to enable audio" prompt)
- The audio file exists at `/audio/adhan-alafasy.mp3`
- Consider using `navigator.mediaSession` for lock screen controls

### 1B. Fix Buddy Username Save
**File:** `api/src/index.js` (better-auth username plugin already enabled)
**Issue:** Username may not be persisting properly through better-auth
**Verify:** Test that `PATCH /api/user/preferences` with `displayName` saves correctly
**Also:** Phone number field was just added to schema - run ALTER TABLE to add column to existing DB:
```sql
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "phoneNumber" TEXT;
ALTER TABLE ramadan_tracking ADD COLUMN IF NOT EXISTS prayer_data TEXT DEFAULT '{}';
ALTER TABLE ramadan_tracking ADD COLUMN IF NOT EXISTS dhikr_data TEXT DEFAULT '{}';
```

---

## PRIORITY 2: New Features (Competitor-Inspired)

### 2A. Quran Section (New Page/Tab)
**Inspired by:** Quranly, Al Quran apps, Tarteel
**Create:** `src/components/QuranReader.jsx`
**Features:**
- Surah list (114 surahs) with Arabic name, English name, verse count, revelation type
- Surah reader: Arabic text + English translation (use quran.com API or bundle JSON)
- Verse-by-verse display with Arabic (large, Amiri font) + translation below
- Audio recitation per verse (quran.com CDN: `https://cdn.islamic.network/quran/audio/128/ar.alafasy/{verse}.mp3`)
- Bookmarks (localStorage) + last-read position
- Verse of the Day on home/companion page
- Search across translations
- Reading progress tracker
**Data:** Bundle surah metadata as JSON. For full text, use API: `https://api.alquran.cloud/v1/surah/{number}/editions/quran-uthmani,en.sahih`
**Route:** Add to React Router as `/quran` and `/quran/:surahNumber`
**Nav:** Add Quran icon to bottom nav

### 2B. Enhanced Dhikr Counter (Inspired by Dhikr and Dua app)
**File:** `src/components/TasbihCounter.jsx` (exists, enhance it)
**Add:**
- Haptic feedback on count (navigator.vibrate)
- Daily dhikr goals with progress rings
- Custom dhikr presets (save favorites)
- Session history (localStorage): date, dhikr type, count
- Points integration: sync dhikr counts to backend `dhikr_data` field
- Beautiful animations on milestone counts (33, 99, 100)

### 2C. Masjid Announcements & Admin Panel (from ROADMAP v1.4)
**Backend (`api/src/index.js`):**
- New table: `announcements` (id, masjid_id, title, body, type, priority, created_by, created_at, expires_at)
- New table: `masjid_follows` (user_id, masjid_id)
- Endpoints:
  - `GET /api/announcements` - list active announcements (optionally filtered by followed masjids)
  - `POST /api/announcements` - create (admin only)
  - `DELETE /api/announcements/:id` - delete (admin only)
  - `POST /api/masjids/:id/follow` - follow/unfollow a masjid
  - `GET /api/masjids/:id/followers` - count
- Admin role: add `role` column to user table (default 'user', can be 'admin' or 'masjid_admin')
**Frontend:**
- `src/components/Announcements.jsx` - announcement feed (cards with priority badges)
- Admin panel route `/admin` - protected, only for role='admin'
- Admin can post announcements, manage masjids, view stats

### 2D. Enhanced Leaderboard & Gamification
**File:** `src/components/BuddySection.jsx`, `api/src/index.js`
**Add:**
- Weekly / Monthly / All-time tabs on leaderboard
- Stat breakdowns: prayer consistency, Quran reading days, dhikr counts, fasting streak
- Achievement badges (e.g., "7-Day Streak", "Quran Khatm", "100 Dhikr Session")
- Points from TasbihCounter and PrayerTracker synced to backend
- Friend activity feed: "Kareem completed 5/5 prayers today"

### 2E. User Profile/Settings Enhancement
**File:** `src/components/UserProfile.jsx` (exists, enhance)
**Add:**
- Phone number field (592-6XX-XXXX format with validation)
- Username display and edit
- Privacy controls (hide from leaderboard, hide activity)
- Notification preferences (per-prayer Adhan toggle, announcement notifications)
- Theme preference (light/dark/auto)
- Language preference (future: English/Arabic)
- Export my data button

---

## PRIORITY 3: Polish & Accessibility

### 3A. Accessibility Audit
- All interactive elements need proper `aria-label`, `role`, `aria-expanded`
- Focus management in modals (trap focus, return focus on close)
- Color contrast: ensure 4.5:1 ratio minimum for all text
- Screen reader announcements for dynamic content (aria-live regions)
- Keyboard navigation for all features (Tab, Enter, Escape)
- Skip navigation link at top
- Reduced motion support (`prefers-reduced-motion`)

### 3B. Responsive Polish
- Test all layouts at 320px, 375px, 414px widths
- Bottom nav should not overlap content (safe area padding)
- Modals should be scrollable on small screens
- Touch targets minimum 44x44px
- No horizontal scroll on any page

### 3C. PWA Enhancements
- Update service worker cache name after all changes
- Ensure offline fallback page works
- App icon and splash screen verification

---

## BUILD & DEPLOY

After all changes:
```bash
cd /home/karetech/georgetown-iftaar
npm run build
# Docker build
docker build -t ghcr.io/kareemschultz/masjidconnect-gy:latest .
docker push ghcr.io/kareemschultz/masjidconnect-gy:latest
# On server:
docker pull ghcr.io/kareemschultz/masjidconnect-gy:latest
docker stop kt-masjidconnect-web
docker rm kt-masjidconnect-web
docker run -d --name kt-masjidconnect-web --network kt-net-apps --restart unless-stopped ghcr.io/kareemschultz/masjidconnect-gy:latest
docker network connect pangolin kt-masjidconnect-web
```

## DB MIGRATIONS (run on existing SQLite)
```sql
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "phoneNumber" TEXT;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "role" TEXT DEFAULT 'user';
ALTER TABLE ramadan_tracking ADD COLUMN IF NOT EXISTS prayer_data TEXT DEFAULT '{}';
ALTER TABLE ramadan_tracking ADD COLUMN IF NOT EXISTS dhikr_data TEXT DEFAULT '{}';

CREATE TABLE IF NOT EXISTS announcements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  masjid_id INTEGER,
  title TEXT NOT NULL,
  body TEXT,
  type TEXT DEFAULT 'general',
  priority TEXT DEFAULT 'normal',
  created_by TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME
);

CREATE TABLE IF NOT EXISTS masjid_follows (
  user_id TEXT NOT NULL,
  masjid_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, masjid_id)
);
```
