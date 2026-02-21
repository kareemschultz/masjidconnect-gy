# MasjidConnect GY — Changelog

## v1.5.1 (2026-02-21) — Bug Fixes, UI/UX, Audio Fix

### Critical Fixes
- **Audio playback fixed** — CSP (Content-Security-Policy) was blocking Quran audio CDN and local adhan. Fixed `media-src` and `connect-src` in nginx.conf to allow `cdn.islamic.network`, `audio.qurancdn.com`, and `'self'`
- **Settings page accessible** — Added `/settings` route to App.jsx and Settings link (gear icon) in MoreSheet. Previously the component existed but was completely unreachable
- **Changelog route** — Added `/changelog` route so Settings link works
- **SW cache v10** — Forces all users to get fresh content

### Settings Page (Now Accessible via More → Settings)
- Per-salah notification toggles (Fajr, Dhuhr, Asr, Maghrib, Isha)
- Suhoor reminder (30min before Fajr) + Iftaar alert at Maghrib
- Adhan sound preview (Mishary Al-Afasy, play/stop 10s clip)
- Prayer calculation method selector (MWL, ISNA, Egyptian, Umm al-Qura, Karachi, Tehran)
- Asr juristic method (Standard/Hanafi)
- Dark mode toggle
- Quran font selection (Uthmani/IndoPak)
- Notification toggles shown upfront (grayed out until enabled)

### Push Notifications (Fully Wired)
- Backend scheduler using `adhan` npm package calculates Georgetown prayer times daily
- Sends push notification at each prayer time the user has enabled
- Suhoor reminder 30min before Fajr (Ramadan only)
- Iftaar alert at Maghrib (Ramadan only)
- Per-subscriber notification preferences stored in DB
- Deduplication via sentToday set, reset at midnight GYT

### Quran Reader Enhancements
- **12 reciters** — Al-Afasy, Abdul Basit, Husary, Minshawi, and more from Islamic Network CDN
- **Repeat/loop** — 1x, 2x, 3x, 5x, infinite loop for memorization
- **Continuous play** — Play entire surah with auto-advance and auto-scroll
- **Playback speed** — 0.75x, 1x, 1.25x

### Madrasa (Noorani Qaida)
- Prominent transliteration on letter cards (bold emerald text)
- Slow playback toggle (0.4x speech rate)
- Audio quality notice (device-dependent TTS)
- Lesson completion tracking (synced to points)

### Points System Expanded
- Adhkar: 25 pts morning + 25 pts evening
- Tasbih: 5 pts per completed set (cap 50/day)
- Quran reading goal bonus: 20 pts when daily goal met
- Madrasa lessons: 15 pts per lesson completed
- Buddy system: 10 pts for adding friend, 5 pts for accepting

### Buddy System
- Friend streak/level display (Lv1-5 badge + flame streak icon)
- Nudge feature (bell button to send encouragement)
- Friends leaderboard with medals and collapsible ranking

### Ramadan
- CIOG (Central Islamic Organisation of Guyana) added as moon sighting option
- Calculation method now reads from Settings (localStorage)

---

## v1.5.0 (2026-02-20) — Muslim Pro Inspired Sprint

### Features
- Muslim Pro-style prayer band with Fajr + Sunrise
- Morning/Evening Adhkar with completion tracking
- Verse of the Day widget
- Quran Reading Goal with timer
- Madrasa (Noorani Qaida) — 12 lessons from alphabet to Tajweed
- Bottom tab bar with 5 primary tabs + More sheet
- Granular gamification points for prayer, dhikr, quran
- UI/UX audit: slimmer header, animations, haptics, skeleton loading

---

## v1.3.0 (2026-02-20) — Quran, Admin, Announcements

### Features
- Full Quran Reader (114 Surahs, Arabic/English, audio recitation)
- Admin Panel (protected /admin route)
- Announcements system (Urgent/Info/Event)
- Adhan audio fix for mobile (unlockAudio on first tap)
- Buddy System with phone number search
- Tasbih haptic feedback + reset confirmation
- Zakat Calculator (GYD)
- Qibla Compass

---

## v1.2.0 (2026-02-19) — Ramadan Launch

### Features
- Year-round prayer times via adhan@4.4.3
- Prayer time strip with next salah highlighted
- Post-iftaar countdown
- Hijri date display
- Prayer Tracker with streak counter
- Tasbih Counter with auto-cycle

---

## v1.0.0 (2026-02-18) — Initial Release

- Georgetown Iftaar Guide
- Ramadan countdown
- Community iftaar submissions
- Google Sign-In with Better Auth
