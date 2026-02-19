# 🌙 Georgetown Ramadan Guide

**بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ**

> A free, open-source Ramadan companion for the Muslim community of Georgetown, Guyana.

[![Live Site](https://img.shields.io/badge/Live%20Site-kareemschultz.github.io-emerald?style=flat-square&logo=github)](https://kareemschultz.github.io/georgetown-iftaar/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)
[![Built with React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)

---

## 📖 About

The **Georgetown Ramadan Guide** is a community-driven web app designed to help Muslims in Georgetown, Guyana make the most of Ramadan. It provides live Iftaar updates, a masjid directory, the official prayer timetable, duas, a Qibla compass, and a wealth of Ramadan resources — all in a clean, mobile-first interface.

This project is **not affiliated with any single Islamic organisation**. It is built for the ummah, by the community, and is open source for anyone to contribute.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🍽️ **Tonight's Iftaar** | Community-submitted Iftaar updates for each masjid in real time |
| 🕌 **Masjid Directory** | 15 Georgetown masjids with addresses, features, community-reported salah times, and Google Maps directions |
| 🗺️ **Map View** | Interactive map showing all masjids and tonight's Iftaar locations |
| 📅 **Prayer Timetable** | Full Ramadan 1447 AH timetable with Suhoor, Fajr, Dhuhr, Asr, Maghrib & Isha |
| 🤲 **Duas** | Iftaar, Suhoor, and general Ramadan duas with Arabic, transliteration & translation |
| 🧭 **Qibla Compass** | Device-orientation Qibla compass using your live location |
| ⏱️ **Live Countdown** | Real-time countdown to Suhoor end and Iftaar |
| 📊 **Ramadan Progress** | Visual progress bar for the month of Ramadan |
| ✅ **Daily Checklist** | Track daily Ramadan acts — prayers, Quran, dhikr, Taraweeh |
| 📚 **Resources** | Fasting rules, Laylatul Qadr guide, Taraweeh, Zakatul Fitr, I'tikaf, and more |
| 🌙 **Dark Mode** | Full dark mode support |
| 📱 **Mobile-First PWA** | Installable on Android/iOS, designed for phones |
| 🔔 **Iftaar Reminder** | Optional browser notification 30 minutes before Iftaar |

---

## 🛠 Tech Stack

- **[React 19](https://react.dev)** — UI framework
- **[Vite](https://vitejs.dev)** — Build tool & dev server
- **[Tailwind CSS v4](https://tailwindcss.com)** — Utility-first styling
- **[Lucide React](https://lucide.dev)** — Icon library
- **[Firebase Firestore](https://firebase.google.com)** — Real-time community data (optional)
- **[Leaflet.js](https://leafletjs.com)** — Interactive maps

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm

### Development

```bash
# 1. Clone the repository
git clone https://github.com/kareemschultz/georgetown-iftaar.git
cd georgetown-iftaar

# 2. Install dependencies
npm install

# 3. Start dev server (runs at http://localhost:5173)
npm run dev
```

> **Note:** The app works out of the box in **demo mode** with sample data. Firebase is optional for live community submissions.

### Build for Production

```bash
npm run build      # Output to dist/
npm run preview    # Preview production build locally
```

---

## 🔥 Firebase Setup (Optional)

Community Iftaar submissions require Firebase Firestore.

1. Create a project at [firebase.google.com](https://console.firebase.google.com)
2. Enable **Cloud Firestore**
3. Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456
VITE_FIREBASE_APP_ID=your-app-id
```

4. Set Firestore security rules (community trust model):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /submissions/{doc} {
      allow read: if true;
      allow create: if true;
    }
  }
}
```

---

## 🌐 Deployment (GitHub Pages)

This project deploys automatically via GitHub Actions on every push to `main`.

**Setup:**
1. Fork the repo
2. Go to **Settings → Pages → Source: GitHub Actions**
3. Push to `main` — the workflow in `.github/workflows/deploy.yml` handles the rest

---

## 🕌 Masjids Covered

The app includes **15 verified masjids** in the Georgetown area:

Queenstown Jama Masjid, Woolford Avenue Mosque (MYO/CIOG), Kitty Masjid, Baitul Noor Mosque, GUSIA Masjid, East Georgetown Sunnatul Jamma Masjid, Old Mosque, Anjuman Isha'at-I-Islam Mosque, Kingston Masjid, Masjid Al-Nur, Albouystown Masjid, Masjid-ur-Rahman, Alexander Street Masjid, Masjid At-Taqwa, and Turkeyen Masjid.

Coordinates, addresses, and contact numbers have been verified against multiple sources (OpenStreetMap, Wikidata, PrayersConnect, community databases). Community members can report daily salah times for each masjid directly in the app.

---

## Accessibility

- ARIA labels on all interactive elements (buttons, tabs, modals)
- `aria-expanded` on collapsible sections
- `aria-live` regions for toast notifications
- `htmlFor` label associations on all form inputs
- Keyboard navigation with visible focus indicators
- Screen reader-friendly tab navigation

---

## 🤝 Contributing

Contributions are welcome! This is an open-source community project.

### Ways to Contribute

- 🕌 **Add a masjid** — Edit `src/data/masjids.js` with the masjid's name, address, coordinates, and features
- 📅 **Update timetable** — Edit `src/data/ramadanTimetable.js` for future Ramadan years
- 🌍 **Translations** — Help translate content to other languages
- 🐛 **Bug fixes** — Open an issue or submit a pull request
- ✨ **Feature ideas** — Open a discussion in GitHub Issues

### How to Submit a PR

```bash
# Fork the repo, then:
git checkout -b feature/your-feature-name
# Make your changes
git commit -m "feat: describe your change"
git push origin feature/your-feature-name
# Open a Pull Request on GitHub
```

Please keep PRs focused and include a brief description of what changed and why.

---

## 📋 Timetable Source

The Ramadan 1447 AH timetable is sourced from the **Guyana Islamic Trust (GIT)** for Georgetown / East Bank Demerara. Area adjustment times are included for other regions.

- Asr (S) = Shafi'e method
- Asr (H) = Hanafi method

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

You are free to use, modify, and distribute this project. Attribution appreciated but not required.

---

## 🙏 Acknowledgements

Built with love for the Georgetown Muslim community.

*رمضان مبارك — Ramadan Mubarak*

---

<p align="center">
  Built by <strong>Kareem</strong> · For the ummah 🤲
</p>
