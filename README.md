<p align="center">
  <img src="public/icons/icon-192.png" alt="MasjidConnect GY" width="96" height="96" style="border-radius:50%"/>
</p>

<h1 align="center">🕌 MasjidConnect GY</h1>

<p align="center">
  <strong>بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</strong>
</p>

<p align="center">
  <em>Guyana's Muslim community hub — prayer times, masjid directory, and ibadah tools, year-round.</em>
</p>

<p align="center">
  <a href="https://masjidconnectgy.com/"><img src="https://img.shields.io/badge/🌐%20Live-masjidconnectgy.com-22c55e?style=for-the-badge" alt="Live Site"/></a>
  <img src="https://img.shields.io/badge/version-1.2.0-059669?style=for-the-badge" alt="Version"/>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-16a34a?style=for-the-badge" alt="License"/></a>
  <a href="https://masjidconnectgy.com/"><img src="https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa" alt="PWA"/></a>
</p>

---

## ✨ Features

### 🕌 Masjid Directory
- 16 masjids across Guyana with directions, parking, sisters section info
- Interactive map view
- Distance sorting, search, and filters

### 🕐 Prayer Times (Year-Round)
- Calculated daily via **Adhan.js** (Muslim World League method, Georgetown coords)
- All 5 prayers displayed in header — next salah highlighted live
- Countdown: Suhoor → Iftaar → Suhoor cycle during Ramadan; Maghrib/Fajr year-round
- Hijri date displayed at all times

### ✅ Prayer Tracker
- Log all 5 daily prayers with one tap
- 🔥 Streak counter (consecutive fully-completed days)
- 7-day weekly grid with per-prayer colour dots

### 📿 Tasbih Counter
- SubhanAllah (33) → Alhamdulillah (33) → Allahu Akbar (34) auto-cycle
- Custom dhikr with your own phrase and target count
- Haptic feedback + completion celebration

### 💰 Zakat Calculator
- Full nisab threshold calculation (gold & silver)
- All zakatable wealth categories (cash, gold, silver, business, investments)
- GYD support with live gold/silver price input
- Shows exactly how much zakat you owe

### 🌙 Ramadan Companion
- Ramadan Day counter + progress bar
- Fasting, Quran, and ibadah tracker
- GIT official timetable for Georgetown

### 📖 Islamic Library
- 10 classical Islamic texts available to read/download
- Duas & Supplications with Arabic, transliteration, and translation
- Daily rotating hadiths and Quranic ayahs

### 📅 Community Events
- Submit and view community events
- Iftaar reports from around Guyana

### 🧭 More Tools
- Qibla compass
- Friends & ibadah leaderboard
- Islamic lectures (archive.org)
- Push notifications (Iftaar alerts)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Auth | better-auth (Google OAuth + username/password) |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Prayer Times | Adhan.js (Muslim World League) |
| Hosting | Docker on kt-nexus-01, Pangolin reverse proxy |
| CI/CD | GitHub Actions → GHCR → SSH deploy |
| PWA | Service Worker (cache `masjidconnect-gy-v6`) |

---

## 🚀 Development

```bash
# Install
npm install
cd api && npm install

# Dev server
npm run dev

# Build
npm run build

# E2E tests
npx playwright test --reporter=list
```

**Deploy (SPA only):**
```bash
npm run build
docker cp dist/. kt-masjidconnect-web:/usr/share/nginx/html/
docker exec kt-masjidconnect-web nginx -s reload
```

> ⚠️ After any breaking JS change, bump `CACHE_NAME` in `public/sw.js` to force SW cache eviction.

---

## 📍 Georgetown Prayer Times

Calculated using [Adhan.js](https://github.com/batoulapps/adhan-js) with:
- **Method:** Muslim World League
- **Coordinates:** 6.8013°N, 58.1551°W (Georgetown, Guyana)
- **Timezone:** America/Guyana (UTC-4, no DST)
- **Asr:** Shafi/Maliki (user-configurable to Hanafi)

---

## 🗺️ Roadmap

See [ROADMAP.md](ROADMAP.md) for the full v1.3–v2.0 plan.

**Coming next:**
- Prayer time push notifications (all 5 prayers)
- Quran Verse of the Day
- Masjid announcements feed

---

## 🤲 About

Built for the Muslim community of Georgetown, Guyana. Started as a Ramadan guide, now a year-round Islamic community platform.

*بارك الله فيكم — May Allah bless you all.*

---

<p align="center">Built with ❤️ for the ummah by <a href="https://karetechsolutions.com">Kareem @ KareTech Solutions</a></p>
