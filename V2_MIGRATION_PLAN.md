# MasjidConnect GY — v1 Feature Migration Plan
_Last updated: 2026-02-22 by Alfred_

## Context

**v1 (this repo)** — `masjidconnectgy.com`
- Stack: React 19 + Vite + React Router + Express.js + PostgreSQL
- Status: Production. People have it installed as a PWA. Do NOT break.
- Frontend: `/home/karetech/georgetown-iftaar/`
- Backend API: `/home/karetech/georgetown-iftaar/api/`

**v2 (reference repo)** — `v2.masjidconnectgy.com`
- Stack: Next.js 16 + TypeScript + shadcn/ui + Tailwind CSS
- Repo: `github.com/kareemschultz/v0-masjid-connect-gy`
- Local: `/home/karetech/v0-masjid-connect-gy/`
- Status: Staging/reference. Full backend migrated (23 API routes, same DB).
- Purpose: Source of new UI/features to cherry-pick into v1.

**Strategy:** Port new features from v2 → v1 in phases. v1 stays live throughout.
Never switch users to v2 — they have the PWA installed at masjidconnectgy.com.

---

## Design System Reference

v1 uses these reusable components (already exist in `src/components/`):
- `PageHero` — gradient hero header (use for every new page)
- `SettingGroup` / `SettingRow` — iOS-style settings cards
- `IOSToggle` — toggle switches
- The dark card pattern: `bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800`
- Section headers: colored left-bar accent + uppercase tracking-widest label

v2 source files to reference for each feature are in `/home/karetech/v0-masjid-connect-gy/app/`

---

## Phase 1 — New Pages (Highest Value, Self-Contained)

These are completely new pages that v1 is missing entirely. Each is a clean drop-in.

### 1.1 — Resources Page ✅ PORT
**What it is:** Categorized Islamic resource links (Quran.com, Sunnah.com, Bayyinah TV, Arabic learning, Islamic finance, kids resources, Guyana-specific).

**v2 source:** `app/explore/resources/page.tsx`
**v1 target:** `src/components/Resources.jsx`
**Route:** Add `/resources` in `App.jsx`
**Nav:** Add to Explore grid in `src/components/Explore.jsx` (or MoreSheet)

**How to port:**
1. Copy `app/explore/resources/page.tsx` → `src/components/Resources.jsx`
2. Convert TypeScript to JSX (remove type annotations, rename `.tsx` → `.jsx`)
3. Replace Next.js `Link` with React Router `Link`
4. Replace `PageHero` props to match v1's PageHero API
5. No backend needed — purely static data
6. Add a route in App.jsx: `<Route path="/resources" element={<Resources />} />`
7. Add entry to Explore page grid with Library icon

**Complexity:** Low — zero backend, zero state, pure static UI.

---

### 1.2 — Prayer Timetable ✅ PORT
**What it is:** Full monthly prayer timetable for Georgetown, GY. Prev/next month navigation. Respects user's calculation method and madhab settings from localStorage. Copy/share functionality.

**v2 source:** `app/timetable/page.tsx`
**v1 target:** `src/components/Timetable.jsx`
**Route:** Add `/timetable` in `App.jsx`
**Nav:** Link from Home page (quick action) or Settings

**How to port:**
1. Copy `app/timetable/page.tsx` → `src/components/Timetable.jsx`
2. TypeScript → JSX conversion
3. The `adhan` library is already in v1 — same import
4. localStorage keys `KEYS.CALCULATION_METHOD` and `KEYS.MADHAB` — check v1's key names in `src/utils/` and align
5. Replace `getItem(KEYS.X, default)` with v1's localStorage pattern
6. No backend needed

**Complexity:** Low-medium — uses adhan lib (already present), localStorage only.

---

### 1.3 — Fasting Tracker ✅ PORT
**What it is:** Monthly calendar view, tap a day to cycle through null/intended/fasted/missed states. Consecutive streak counter. Share button. All localStorage.

**v2 source:** `app/tracker/fasting/page.tsx`
**v1 target:** `src/components/FastingTracker.jsx`
**Route:** Add `/fasting` in `App.jsx` (or `/tracker/fasting`)
**Nav:** Link from Tracker tab (PrayerTracker page)

**How to port:**
1. Copy `app/tracker/fasting/page.tsx` → `src/components/FastingTracker.jsx`
2. TypeScript → JSX conversion
3. Import `shareContent` from new `src/utils/share.js` (see Phase 2.1)
4. localStorage key: `fasting_log` — add to v1's KEYS constant if one exists
5. No backend needed

**Complexity:** Low — localStorage only, no API calls.

---

### 1.4 — 99 Names of Allah ✅ PORT
**What it is:** All 99 names with Arabic text, transliteration, meaning. Searchable. Beautiful card grid.

**v2 source:** `app/explore/names/page.tsx`
**v1 target:** `src/components/NamesOfAllah.jsx`
**Route:** Add `/names` in `App.jsx`
**Nav:** Add to Explore grid or Madrasa section

**How to port:**
1. Copy `app/explore/names/page.tsx` → `src/components/NamesOfAllah.jsx`
2. TypeScript → JSX conversion
3. The full 99 names data array is embedded in the file — no API needed
4. Search state is local React state

**Complexity:** Trivial — static data, local search state, no API.

---

## Phase 2 — Components & Utilities

### 2.1 — Share Utility ✅ PORT
**What it is:** `lib/share.ts` — `shareContent(title, text, url?)` function. Uses Web Share API if available, falls back to clipboard copy. Shows toast on success.

**v2 source:** `lib/share.ts`
**v1 target:** `src/utils/share.js`

**How to port:**
1. Copy `lib/share.ts` → `src/utils/share.js`
2. Remove TypeScript types
3. Use in FastingTracker, PrayerTracker, Tasbih — add share buttons

**Complexity:** Trivial.

---

### 2.2 — PWA Install Prompt ✅ PORT
**What it is:** `components/pwa-install-prompt.tsx` — Listens for `beforeinstallprompt`, shows a bottom sheet after 30s on first visit. "Install" triggers native prompt. "Not now" dismisses for 7 days.

**v2 source:** `components/pwa-install-prompt.tsx`
**v1 target:** `src/components/PWAInstallPrompt.jsx`

**How to port:**
1. Copy and convert TypeScript → JSX
2. Add `<PWAInstallPrompt />` to `App.jsx` at root level (renders nothing until triggered)

**Complexity:** Low.

---

### 2.3 — Buddy System Overhaul ⚠️ REVIEW FIRST
**What it is:** Major UI overhaul of the buddy/friends system. Tier badges, challenge creation, polished notification modals.

**v2 source:** `app/explore/buddy/page.tsx` (+546 lines)
**v1 target:** `src/components/BuddySection.jsx`

**How to port:**
- This is the most complex item — v1's buddy system has real PostgreSQL backend (friends table, leaderboard API)
- v2's buddy system is localStorage-only — the UI is better but the data layer is different
- **Approach:** Take the UI/design improvements from v2 but keep v1's API calls intact
- Do a side-by-side review before porting

**Complexity:** High — requires careful merge of UI and data layers.

---

### 2.4 — Announcements Banner ✅ PORT
**What it is:** `components/announcements-banner.tsx` — Dismissible banner cards on Home page. Reads from API, shows urgent/info/event types.

**v2 source:** `components/announcements-banner.tsx`
**v1 target:** `src/components/AnnouncementsBanner.jsx`

**How to port:**
1. Convert TypeScript → JSX
2. v1 already has the `/api/announcements` endpoint — wire it up
3. Add to RamadanCompanion (home page) near the top

**Complexity:** Low — API already exists in v1.

---

## Phase 3 — Later / Optional

These are lower priority or require more thought:

| Item | Notes |
|------|-------|
| Ramadan page (`/ramadan`) | v1's home page already IS the Ramadan companion — revisit post-Ramadan |
| Admin panel UI refresh | v1 has working admin — only port if v2's UI is significantly better |
| lib/notifications.ts | v1 already has server-side VAPID push — this is client-side only, lower value |
| Quran reader improvements | Review Quran reader navigation changes from PR |

---

## Deployment Checklist (after each phase)

```bash
# 1. Build v1 frontend
cd /home/karetech/georgetown-iftaar
npm run build

# 2. Rebuild container
docker build -t ghcr.io/kareemschultz/masjidconnect-gy:latest .
docker stop kt-masjidconnect-web && docker rm kt-masjidconnect-web
docker run -d --name kt-masjidconnect-web \
  --network kt-net-apps -p 3000:80 \
  --restart unless-stopped \
  ghcr.io/kareemschultz/masjidconnect-gy:latest

# 3. Reconnect to Pangolin network
docker network connect pangolin kt-masjidconnect-web
PANGOLIN_IP=$(docker inspect kt-masjidconnect-web --format \
  '{{(index .NetworkSettings.Networks "pangolin").IPAddress}}')
sudo sqlite3 /opt/infrastructure/docker/pangolin/config/db/db.sqlite \
  "UPDATE targets SET ip='$PANGOLIN_IP' WHERE resourceId=38;"
docker restart pangolin && sleep 10

# 4. Verify
curl -s -o /dev/null -w "%{http_code}" https://masjidconnectgy.com
```

**IMPORTANT:** Always bump SW cache version in `public/sw.js` after each deployment
(currently at v17 — increment to v18, v19, etc.)

---

## Version Tracking

| Version | What changed | SW Cache |
|---------|-------------|----------|
| v1.5.4 | Settings rebuilt, hero headers, iOS icons | v14 |
| v1.6.0 | Design consistency sweep (all pages) | v16 |
| v1.6.1 | Adhan silent unlock fix | v17 |
| v1.7.0 | Phase 1 ports (Resources, Timetable, Fasting, 99 Names) | v18 (planned) |
| v1.8.0 | Phase 2 ports (Share, PWA prompt, Buddy overhaul) | v19 (planned) |

---

## Notes for Future Alfred Sessions

- v1 is React JSX, v2 is TypeScript TSX — always convert on port
- v1 uses React Router `<Link>` — v2 uses Next.js `<Link>` (API slightly different)
- v1 localStorage keys are in `src/utils/` — check existing KEYS before adding new ones
- v1 prayer time utils are in `src/utils/prayerTimes.js` — reuse, don't duplicate
- The adhan library version is the same in both (v4.4.3)
- v1's API base URL: `https://masjidconnectgy.com/api` (proxied via Vite in dev)
- Never touch v1's Express API routes without checking against v2's equivalent first
