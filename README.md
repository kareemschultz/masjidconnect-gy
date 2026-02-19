# 🕌 MasjidConnect GY

**بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ**

> Connecting you to every masjid in Guyana — your community companion for Ramadan and beyond.

[![Live Site](https://img.shields.io/badge/🌐%20Live%20Site-masjidconnect--gy-22c55e?style=for-the-badge&logo=github)](https://kareemschultz.github.io/masjidconnect-gy/)
[![Version](https://img.shields.io/badge/version-2.0.0-emerald?style=for-the-badge)](https://github.com/kareemschultz/masjidconnect-gy/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa)](https://kareemschultz.github.io/masjidconnect-gy/)

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Firebase](https://img.shields.io/badge/Firebase-12-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com)
[![React Router](https://img.shields.io/badge/React%20Router-7-CA4245?style=flat-square&logo=reactrouter&logoColor=white)](https://reactrouter.com)

---

## 📋 Table of Contents

- [About](#-about)
- [Live Site](#-live-site)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 📖 About

**MasjidConnect GY** (formerly Georgetown Ramadan Guide) is a free, open-source community platform for Muslims in Georgetown, Guyana. It started as a simple Ramadan Iftaar tracker and has grown into a full masjid directory and spiritual companion app.

This project is **not affiliated with any single Islamic organisation**. It is built for the ummah, by the community, entirely open source.

---

## 🌐 Live Site

**[https://kareemschultz.github.io/masjidconnect-gy/](https://kareemschultz.github.io/masjidconnect-gy/)**

> Install as a PWA for the full experience — iftaar notifications, offline access, and one-tap home screen launch.

---

## ✨ Features

### Phase 1 — Foundation
| Feature | Description |
|---|---|
| 🕌 **Masjid Directory** | 14 verified Georgetown masjids with addresses, features, salah times & Google Maps directions |
| 🍽️ **Iftaar Reports** | Community-submitted real-time iftaar updates per masjid |
| 🗺️ **Interactive Map** | Leaflet map with masjid pins and tonight's iftaar locations |
| 📅 **Prayer Timetable** | Full Ramadan 1447 AH timetable — Suhoor, Fajr, Dhuhr, Asr, Maghrib, Isha |
| 🤲 **Duas Collection** | Iftaar, Suhoor & Ramadan duas with Arabic, transliteration & English translation |
| 🧭 **Qibla Compass** | Device-orientation-based live Qibla direction |
| 📚 **Resources** | Islamic books, lectures, and Ramadan reading materials |
| 💬 **Feedback** | Community correction and feature request system |

### Phase 2 — Ramadan Companion Mode
| Feature | Description |
|---|---|
| 🌙 **Ramadan Companion** | Daily reminders themed by Ramadan's 3 ten-day periods (Mercy → Forgiveness → Protection) |
| 🔔 **Iftaar Notifications** | Push alerts at 10 min before and at Maghrib — with the iftaar duas text delivered in the notification |
| 📿 **Post-Iftaar Dhikr** | SubhanAllah × 33, Alhamdulillah × 33, Allahu Akbar × 34, Astaghfirullah × 100 |
| ✅ **Daily Checklist** | Track: Fasted, Qur'an read, Dhikr, Extra prayer, Attended masjid |
| 🔥 **Streak Counter** | Tracks consecutive days with 3+ items completed |
| ⭐ **Last 10 Nights Mode** | Special UI + Tahajjud reminders + Laylatul Qadr dua when Day ≥ 21 |
| 📲 **PWA Install Prompt** | Smart Android (beforeinstallprompt) + iOS Safari step-by-step guide |

### PWA Capabilities
- ✅ Installable on Android & iOS (Add to Home Screen)
- ✅ Offline support via service worker cache
- ✅ Push notifications (Iftaar time + warnings)
- ✅ Background notification scheduling via service worker messaging

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 (with Suspense + lazy loading) |
| **Build Tool** | Vite 7 |
| **Styling** | Tailwind CSS v4 |
| **Routing** | React Router v7 (BrowserRouter with basename) |
| **Backend / DB** | Firebase Firestore v12 (community submissions) |
| **Maps** | Leaflet.js v1.9 |
| **Icons** | Lucide React |
| **Date Utils** | date-fns v4 |
| **PWA** | Custom service worker — caching + push notifications + SW message scheduling |
| **Hosting** | GitHub Pages via GitHub Actions CI/CD |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Header.jsx              # Bismillah, countdown, Ramadan progress
│   ├── Navigation.jsx          # NavLink tab bar (8 routes)
│   ├── TonightIftaar.jsx       # Community iftaar feed
│   ├── MasjidDirectory.jsx     # Masjid cards with verified badges + salah times
│   ├── MapView.jsx             # Leaflet interactive map
│   ├── Timetable.jsx           # Full Ramadan prayer timetable
│   ├── Duas.jsx                # Dua collection
│   ├── QiblaCompass.jsx        # Live Qibla direction
│   ├── Resources.jsx           # Islamic reading resources
│   ├── RamadanCompanion.jsx    # 🌙 Phase 2 — daily reminders & tracking
│   ├── Feedback.jsx            # Community feedback portal
│   ├── InstallBanner.jsx       # PWA install prompt (Android + iOS)
│   ├── SubmitForm.jsx          # Iftaar submission modal
│   └── Changelog.jsx           # App changelog modal
├── data/
│   ├── masjids.js              # 14 masjid records with verified flag
│   ├── ramadanTimetable.js     # 1447 AH full timetable
│   ├── ramadanReminders.js     # Phase 2 reminder content by theme × time slot
│   ├── dailyReminders.js       # Header daily hadith/dua
│   └── books.js                # Resource library data
├── hooks/
│   ├── useSubmissions.js       # Firebase Firestore submissions hook
│   └── useRamadanTracker.js    # localStorage daily checklist + streak
├── contexts/
│   ├── DarkModeContext.jsx     # System-aware dark mode
│   └── ToastContext.jsx        # Toast notification system
├── App.jsx                     # Routes + footer
└── main.jsx                    # BrowserRouter + SW registration

public/
├── sw.js                       # Service worker (cache + push + scheduled notifs)
└── manifest.json               # PWA manifest
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm 10+

### Install & Run

```bash
git clone https://github.com/kareemschultz/masjidconnect-gy.git
cd masjidconnect-gy
npm install
npm run dev
```

The app runs at `http://localhost:5173/masjidconnect-gy/`

> **Note:** The app works in Demo Mode without Firebase. All community-submitted iftaar data comes from Firestore — for local development this gracefully degrades to an empty submissions list.

### Build for Production

```bash
npm run build
```

### Firebase Setup (Optional)

Create `.env.local` with your Firebase project config:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

---

## 🗺️ Roadmap

### Phase 1 ✅ Complete
- [x] Masjid directory (14 masjids, verified badges)
- [x] Iftaar community feed
- [x] Prayer timetable
- [x] Qibla compass
- [x] Duas
- [x] Routing overhaul (React Router v7)
- [x] PWA + service worker

### Phase 2 ✅ Complete
- [x] Ramadan Companion tab
- [x] Daily checklist with streak tracking
- [x] Iftaar push notifications with duas
- [x] Post-iftaar dhikr reminders
- [x] Last 10 nights special mode (Tahajjud + Laylatul Qadr)
- [x] PWA install banner (Android + iOS)

### Phase 3 — Planned
- [ ] Google Form embed for community feedback
- [ ] Personalised reminders based on checklist patterns
- [ ] Firebase cross-device checklist sync
- [ ] Prayer time submission improvements (photo evidence)
- [ ] Gamification: masjid visit challenges
- [ ] WhatsApp / email notification option

---

## 🤝 Contributing

Contributions are welcome! The best ways to help:

1. **Report errors** — wrong masjid addresses, prayer times, duas
2. **Add missing masjids** — open an issue with name + address + coordinates
3. **Translate** — help expand beyond English
4. **Code** — fork, branch, PR

See [Issues](https://github.com/kareemschultz/masjidconnect-gy/issues) for open tasks.

---

## 📜 License

MIT — free to use, fork, and build upon. See [LICENSE](LICENSE).

---

<div align="center">

Built with ❤️ for the Muslim community of Georgetown, Guyana

**رمضان مبارك — Ramadan Mubarak**

[Live App](https://kareemschultz.github.io/masjidconnect-gy/) · [Report Issue](https://github.com/kareemschultz/masjidconnect-gy/issues) · [Star on GitHub](https://github.com/kareemschultz/masjidconnect-gy)

</div>
