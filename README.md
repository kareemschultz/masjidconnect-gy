<p align="center">
  <img src="public/icons/icon-192.png" alt="MasjidConnect GY" width="96" height="96" style="border-radius:50%"/>
</p>

<h1 align="center">🕌 MasjidConnect GY</h1>

<p align="center">
  <strong>بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</strong>
</p>

<p align="center">
  <em>Linking Faith and Community — Guyana's Muslim community hub for Ramadan and beyond.</em>
</p>

<p align="center">
  <a href="https://masjidconnectgy.com/"><img src="https://img.shields.io/badge/🌐%20Live%20Site-masjidconnectgy.com-22c55e?style=for-the-badge" alt="Live Site"/></a>
  <img src="https://img.shields.io/badge/version-1.1.0-059669?style=for-the-badge" alt="Version"/>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-16a34a?style=for-the-badge" alt="License: MIT"/></a>
  <a href="https://masjidconnectgy.com/"><img src="https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa" alt="PWA Ready"/></a>
</p>

<p align="center">
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React"/></a>
  <a href="https://vitejs.dev"><img src="https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite"/></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind-v4-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS"/></a>
  <a href="https://firebase.google.com"><img src="https://img.shields.io/badge/Firebase-12-FFCA28?style=flat-square&logo=firebase&logoColor=black" alt="Firebase"/></a>
  <a href="https://reactrouter.com"><img src="https://img.shields.io/badge/React%20Router-7-CA4245?style=flat-square&logo=reactrouter&logoColor=white" alt="React Router"/></a>
</p>

---

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 📖 About

**MasjidConnect GY** is a free, open-source community platform for Muslims in Georgetown, Guyana. It started as a simple Ramadan Iftaar tracker and has grown into a full masjid directory, prayer companion, and community hub — active year-round.

This project is **not affiliated with any single Islamic organisation**. It is built for the ummah, by the community, entirely open source.

---

## ✨ Features

### 🕌 Masjid Directory
| Feature | Description |
|:---|:---|
| **Verified Masjids** | 16 masjids across Georgetown, East Bank & West Bank Demerara, with GPS coordinates verified via OSM, prayersconnect.com, eSalah & Plus Codes |
| **Search & Filter** | Search by name, filter by features (parking, sisters section, wudu facilities) |
| **Iftaar Reports** | Community-submitted real-time iftaar updates — menus, serving status, notes |
| **Salah Times** | Official verified times (where provided) and community-reported times per masjid |
| **Imam & Taraweeh Info** | Verified Imam and Taraweeh leadership per masjid, with community reporting |
| **Submit a Masjid** | Submit new masjids or corrections directly from the directory |
| **Directions** | One-tap Google Maps directions from your location |

### 🗺️ Prayer & Navigation
| Feature | Description |
|:---|:---|
| **Interactive Map** | Leaflet map with all masjid pins and tonight's iftaar locations |
| **Prayer Timetable** | Full Ramadan 1447 AH timetable (GIT-sourced) — Suhoor, Fajr, Dhuhr, Asr, Maghrib, Isha |
| **Live Countdowns** | Real-time timers to Suhoor and Iftaar |
| **Qibla Compass** | Device-orientation-based live Qibla direction |
| **Adhan Audio** | Mishary Alafasy adhan plays at prayer times when the app is open |

### 🌙 Ramadan Companion
| Feature | Description |
|:---|:---|
| **Daily Reminders** | Themed by the three 10-day periods — Mercy, Forgiveness, Protection from Hellfire |
| **Daily Checklist** | Track: Fasted · Qur'an · Dhikr · Extra Prayer · Attended Masjid |
| **Streak Counter** | Consecutive days with 3+ items completed |
| **Last 10 Nights Mode** | Special UI — Tahajjud reminders and Laylatul Qadr duas when Day ≥ 21 |
| **Post-Iftaar Dhikr** | Guided SubhanAllah × 33, Alhamdulillah × 33, Allahu Akbar × 34 |
| **Adhan Alerts** | Per-prayer adhan toggle with Mishary Alafasy audio preview |

### 📚 Resources
| Tab | Content |
|:---|:---|
| 🌙 **Ramadan** | Daily checklist, fasting rules, exemptions, Laylatul Qadr, I'tikaf, Taraweeh, Zakatul Fitr, virtues & hadiths, media programs |
| 🎉 **Eid** | Eid ul-Fitr prayer guide, sunnah acts, takbeeraat · Eid ul-Adha Qurbani guide, Arafah fasting, Tashreeq takbeer |
| 📖 **Islamic** | Five Pillars, daily adhkar, essential duas with full Arabic + transliteration, how to pray, Zakat guide, Islamic organisations in Guyana, trusted online resources, free PDF library |

### 🏠 Home Screen
| Feature | Description |
|:---|:---|
| **Hadith Carousel** | 30 hadiths & Qur'anic ayaat cycling with smooth fade transitions — specific book & hadith number references (Bukhari, Muslim, Tirmidhi, etc.) |
| **Live Iftaar Countdown** | Real-time Guyana-timezone countdown to Iftaar or Suhoor end |
| **Ramadan Progress** | Day N of 30 progress bar with Hijri year |
| **Next Salah Chip** | Live next prayer name + time in the header info bar |

### 👤 User Account & Profile
| Feature | Description |
|:---|:---|
| **Authentication** | Email / Google sign-in via better-auth |
| **Stats Dashboard** | Streak, days tracked, perfect days with progress bars |
| **30-Day Heatmap** | Visual calendar of your Ramadan tracker activity |
| **Preferences Sync** | Settings sync across devices on sign-in |

### 📲 PWA & Notifications
| Feature | Description |
|:---|:---|
| **Install Prompt** | Smart install banner — Android (beforeinstallprompt) + iOS Safari step-by-step guide |
| **Offline Support** | Service worker caches all routes and assets |
| **Push Notifications** | VAPID push — Iftaar reminders with duas text delivered in the notification |
| **Background Scheduling** | Service worker message scheduling for timed reminders |

### 🎨 Design & Accessibility
- Full dark mode — system-aware with manual toggle
- Mobile-first responsive layout (max-width phone shell, desktop-safe)
- ARIA labels, keyboard navigation, focus management, screen reader support
- Lazy-loaded routes with Suspense fallbacks for fast initial load
- Custom branding — logo, emerald/gold colour scheme, Cinzel + Amiri + Inter fonts

---

## 🛠️ Tech Stack

<p align="center">

| Layer | Technology |
|:---:|:---:|
| **Framework** | React 19 (Suspense + lazy loading) |
| **Build Tool** | Vite 7 |
| **Styling** | Tailwind CSS v4 |
| **Routing** | React Router v7 |
| **Auth** | better-auth |
| **Backend / DB** | Firebase Firestore v12 |
| **Maps** | Leaflet.js v1.9 |
| **Icons** | Lucide React |
| **PWA** | Custom service worker (cache + push + scheduling) |
| **Hosting** | Self-hosted via Docker + Traefik |

</p>

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Header.jsx              # Bismillah, hadith carousel, countdown, Ramadan progress
│   ├── Navigation.jsx          # NavLink tab bar
│   ├── TonightIftaar.jsx       # Community iftaar feed
│   ├── MasjidDirectory.jsx     # Masjid cards with salah times, imam/taraweeh info
│   ├── Events.jsx              # Community events calendar
│   ├── MapView.jsx             # Leaflet interactive map
│   ├── Timetable.jsx           # Full Ramadan prayer timetable
│   ├── Duas.jsx                # Dua collection with Arabic text + transliteration
│   ├── QiblaCompass.jsx        # Live Qibla direction
│   ├── Resources.jsx           # Ramadan · Eid · Islamic resource tabs
│   ├── RamadanCompanion.jsx    # Daily reminders, tracker, adhan alerts
│   ├── UserProfile.jsx         # Stats, heatmap, progress dashboard
│   ├── Feedback.jsx            # Community feedback portal
│   ├── SubmitForm.jsx          # Iftaar submission modal
│   ├── SubmitHub.jsx           # Multi-type submission picker
│   ├── EventSubmitForm.jsx     # Event submission modal
│   ├── OnboardingWizard.jsx    # First-run setup & iOS install guide
│   ├── InstallBanner.jsx       # PWA install prompt
│   ├── UserMenu.jsx            # Auth user dropdown menu
│   └── Changelog.jsx           # App changelog modal
├── data/
│   ├── masjids.js              # 16 masjid records (Georgetown + surrounds)
│   ├── ramadanTimetable.js     # 1447 AH full timetable + duas
│   ├── ramadanReminders.js     # Companion reminder content by theme × time slot
│   ├── dailyReminders.js       # 30 hadiths/ayaat with specific reference numbers
│   └── books.js                # PDF library catalogue
├── hooks/
│   ├── useSubmissions.js       # Firebase Firestore submissions hook
│   ├── useRamadanTracker.js    # localStorage daily checklist + streak
│   └── usePreferencesSync.js   # Auth-triggered preferences sync
├── utils/
│   ├── adhanPlayer.js          # Mishary Alafasy adhan scheduling + playback
│   ├── timezone.js             # Guyana timezone helpers
│   └── settings.js             # User settings (Asr madhab, etc.)
├── contexts/
│   ├── DarkModeContext.jsx     # System-aware dark mode
│   └── ToastContext.jsx        # Toast notification system
├── App.jsx                     # Routes + layout + footer
└── main.jsx                    # BrowserRouter + SW registration

public/
├── sw.js                       # Service worker (cache + push + scheduled notifs)
├── manifest.json               # PWA manifest (6 icon sizes)
├── audio/
│   └── adhan-alafasy.mp3       # Mishary Alafasy adhan audio
├── icons/                      # PWA icons: 32 → 512px
└── books/                      # Free Islamic PDF library
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

The app runs at `http://localhost:5173/`

> **Demo Mode:** The app works without Firebase. Community-submitted iftaar data gracefully degrades to an empty list in local development.

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

### v1.0 — Launched ✅

- [x] 12 verified masjids with GPS coordinates
- [x] Community iftaar feed and event calendar
- [x] Prayer timetable + live countdowns
- [x] Qibla compass
- [x] Duas collection with Arabic text + transliteration
- [x] Ramadan Companion — daily reminders, checklist, streak, last 10 nights
- [x] Resources — Ramadan, Eid, Islamic tabs
- [x] User authentication and profile with stats heatmap
- [x] PWA install banner (Android + iOS)
- [x] Push notifications (VAPID)
- [x] Full dark mode + accessibility

### v1.1 — Released ✅

- [x] Hadith carousel on home screen with 30 rotating hadiths/ayaat and specific reference numbers
- [x] Mishary Alafasy adhan audio — scheduled playback at prayer times when app is open
- [x] Per-masjid Salah Times section (official + community-reported)
- [x] Imam & Taraweeh leadership info per masjid
- [x] Submit a Masjid button on the directory page
- [x] 16 masjids including Masjid An-Najm (Albouystown) and Mandela Masjid
- [x] Arabic transliteration corrections across the app
- [x] Verified Kitty Masjid prayer times, Imam, and Taraweeh leaders

### v1.2 — Planned

- [ ] Google Form embed for community feedback
- [ ] Personalised reminders based on checklist patterns
- [ ] Firebase cross-device checklist sync
- [ ] Prayer time submission improvements (photo evidence)
- [ ] Gamification: masjid visit streaks
- [ ] WhatsApp / email notification option
- [ ] More masjids across Berbice and Essequibo

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

<p align="center">
  <br/>
  🕌 <strong>MasjidConnect GY</strong> · <em>Linking Faith and Community</em>
  <br/><br/>
  Built with ❤️ for the Muslim community of Georgetown, Guyana
  <br/><br/>
  <strong>رمضان مبارك — Ramadan Mubarak</strong>
  <br/><br/>
  <a href="https://masjidconnectgy.com/">🌐 Live App</a> ·
  <a href="https://github.com/kareemschultz/masjidconnect-gy/issues">🐛 Report Issue</a> ·
  <a href="https://github.com/kareemschultz/masjidconnect-gy">⭐ Star on GitHub</a>
  <br/><br/>
  <em>Not affiliated with GIT, CIOG, or any single Islamic organisation.</em>
</p>
