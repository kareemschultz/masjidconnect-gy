# MasjidConnect GY — Roadmap

> A year-round Islamic community app for Georgetown, Guyana.
> Live at [masjidconnectgy.com](https://masjidconnectgy.com)

---

## ✅ v1.2 — Daily Ibadah Tools (Feb 2026)

- [x] Year-round prayer times via Adhan.js (Muslim World League, Georgetown coords)
- [x] Full prayer time strip in header — all 5 prayers, next salah highlighted live
- [x] Post-iftaar countdown switches to tomorrow's Suhoor
- [x] Hijri date displayed in app header year-round
- [x] **Prayer Tracker** — log all 5 daily prayers, streak counter, weekly grid
- [x] **Tasbih Counter** — SubhanAllah/Alhamdulillah/AllahuAkbar auto-cycle + custom dhikr
- [x] Google Sign-In session persistence fix (trust proxy + explicit cookie attributes)
- [x] Layout overflow fix (nav `min-w-0`, phone shell, scrollable tabs)
- [x] Service worker cache bump (v5, network-first for HTML)

---

## 🗓️ v1.3 — Content & Worship (Planned)

### Quran Integration
- [ ] Verse of the Day — random ayah from quran.com API with Arabic + translation
- [ ] Mini-reader: Surah Al-Fatiha + last 10 surahs bundled as offline JSON
- [ ] Bookmarks + last-read position (localStorage)

### Zakat Calculator
- [ ] Nisab threshold (gold/silver — fetched from a metals API or hardcoded annually)
- [ ] GYD currency support (show amounts in Guyanese Dollars)
- [ ] Fields: cash, gold, silver, business goods, investments, receivables
- [ ] Output: total zakatable wealth, nisab status, zakat owed (2.5%)

### Prayer Notifications
- [ ] Schedule push notifications for all 5 prayers using Adhan.js times
- [ ] Per-prayer toggle in settings (e.g. "only notify for Fajr and Maghrib")
- [ ] Uses existing VAPID/Web Push infrastructure already in the API

### Islamic Library Completion
- [ ] Upload missing `Adab.pdf` (Ta'lim al-Muta'allim — 22.7MB, needs SCP to server)
- [ ] Add book descriptions and author metadata to the library UI

---

## 🕌 v1.4 — Community Features (Planned)

### Masjid Announcements
- [ ] Masjid administrators can post short announcements (prayer time changes, events, closures)
- [ ] Users follow specific masjids and receive push notifications
- [ ] Admin panel for masjid managers (separate protected route)
- [ ] Follow/unsubscribe API endpoint

### Community Iftaar Submissions
- [ ] Improve visibility of the iftaar submission feature (currently 0 submissions)
- [ ] Location tagging per submission (which masjid / area)
- [ ] Photo uploads for iftaar gatherings
- [ ] Community feed view of recent iftaar reports

---

## 🌙 v1.5 — Ramadan 1448 Features (Planned for ~Jan 2027)

### Tarawih Tracker
- [ ] Log which nights of Tarawih you attended or prayed at home
- [ ] Night count with progress (1–29/30)
- [ ] Intention tracker: full 20 rakaat / 8 rakaat / home

### Laylatul Qadr Tools
- [ ] Count-up for the last 10 nights
- [ ] Special ibadah checklist per night (Quran, dhikr, dua, sadaqah)
- [ ] Push reminders for odd nights (21, 23, 25, 27, 29)

### Ramadan 1448 Timetable
- [ ] Update timetable data for next Ramadan
- [ ] Allow users to select their area (East Bank, West Coast, Berbice, etc.)

---

## 🚀 v2.0 — Platform Evolution (Long-term)

### Community Profiles
- [ ] Public Islamic profiles: masjid affiliation, community, ibadah badges
- [ ] Friends leaderboard (existing BuddySection) fully integrated with Prayer Tracker streaks
- [ ] Privacy controls per user

### Offline Quran Bundle
- [ ] Compressed JSON with full Quran (Arabic + Saheeh International English)
- [ ] Offline-first reading, no API required
- [ ] Bookmark + last-read position, night reading mode

### Multi-Masjid Admin Panel
- [ ] Separate dashboard for masjid administrators
- [ ] Manage prayer times, events, announcements
- [ ] Analytics: community activity, iftaar report counts per area

### Scholar/Lecture Integration
- [ ] Curated Islamic lecture playlist (beyond existing archive.org links)
- [ ] Download for offline listening
- [ ] Tagged by topic (Tafsir, Fiqh, Seerah, etc.)

---

*Last updated: Feb 2026 | MasjidConnect GY by Kareem Schultz*
