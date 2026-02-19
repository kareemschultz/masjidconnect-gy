# 🌙 Georgetown Iftaar Guide

**بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ**

A community-driven tracker for Iftaar meals at masjids in Georgetown, Guyana during Ramadan 1447 AH (2026).

## Features

- **Tonight's Iftaar** — See what each masjid is serving, updated by community members
- **Masjid Directory** — 9 masjids with addresses, features, and Google Maps directions
- **Full Ramadan Timetable** — Official GIT times for all 30 days with area adjustments
- **Duas for Iftaar** — Arabic, transliteration, and translation
- **Community Submissions** — Simple form, no login required
- **Mobile-first** — Designed for phones, PWA-capable

## Quick Start

```bash
npm install
npm run dev     # Dev server at localhost:5173
npm run build   # Production build to dist/
```

## Deployment (GitHub Pages)

1. Create a GitHub repo named `georgetown-iftaar`
2. Push this code
3. In repo Settings → Pages → Source: GitHub Actions
4. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci && npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
      - id: deployment
        uses: actions/deploy-pages@v4
```

## Firebase Setup (for live community data)

The site works in **demo mode** with sample data out of the box.

To enable live submissions:

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Firestore Database
3. Create a `.env` file:

```env
VITE_FIREBASE_API_KEY=your-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456
VITE_FIREBASE_APP_ID=your-app-id
```

4. Firestore rules (community trust model):
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

## Timetable Source

Official Ramadan 1447 AH timetable from the **Guyana Islamic Trust (GIT)**.

- Times for Georgetown / East Bank Demerara
- Area adjustments included for other regions
- Asr (S) = Shafi'e, Asr (H) = Hanafi

## Tech Stack

- React 19 + Vite
- Tailwind CSS v4
- Lucide React icons
- Firebase Firestore (optional)
- Aladhan API (prayer times fallback)

---

*Built with ❤️ for the Georgetown Muslim community*
*رمضان مبارك — Ramadan Mubarak*
