import { X, GitCommit } from 'lucide-react';

const changelog = [
  {
    version: 'v1.0',
    date: 'February 2026 · Ramadan 1447 AH',
    tag: 'current',
    label: 'Initial Launch',
    sections: [
      {
        heading: 'Masjid Directory',
        items: [
          '12 verified masjids — Georgetown, East Bank & West Bank Demerara',
          'GPS coordinates verified via OSM, prayersconnect.com, eSalah & Plus Codes',
          'Search by name, filter by features (parking, sisters section, wudu)',
          'Distance sorting, Google Maps directions integration',
          'Community iftaar reports per masjid (served/unserved, menus, notes)',
          'Suggest a Correction link for community accuracy',
        ],
      },
      {
        heading: 'Events',
        items: [
          'Community events calendar with category filters',
          'Submit an Event form — direct in-app submission',
          'Badge indicators for featured / free / RSVP events',
        ],
      },
      {
        heading: 'Prayer & Timetable',
        items: [
          'Full Ramadan 1447 AH timetable (GIT-sourced) with mobile card view',
          'Live countdown timers to Suhoor and Iftaar (Maghrib)',
          'Iftaar push notification — 30 min and at Maghrib time',
          'Qibla compass with live device-orientation support',
        ],
      },
      {
        heading: 'Ramadan Companion',
        items: [
          'Daily reminders themed by the three 10-day periods — Mercy, Forgiveness, Protection',
          'Manual daily checklist: Fasted · Qur\'an · Dhikr · Extra Prayer · Masjid',
          'Streak counter for consecutive days with 3+ items completed',
          'Last 10 nights special mode — Tahajjud reminders and Laylatul Qadr dua',
          'Post-iftaar Dhikr guide: SubhanAllah × 33, Alhamdulillah × 33, Allahu Akbar × 34',
        ],
      },
      {
        heading: 'Duas',
        items: [
          'Iftaar, Suhoor, Laylatul Qadr and general Ramadan supplications',
          'Arabic text, transliteration and English translation for each dua',
          'Copy-to-clipboard for easy sharing',
        ],
      },
      {
        heading: 'Resources',
        items: [
          'Three-tab layout: 🌙 Ramadan · 🎉 Eid · 📖 Islamic — all collapsed by default',
          'Ramadan: Daily checklist, fasting rules, exemptions, Laylatul Qadr, I\'tikaf, Taraweeh, Zakatul Fitr, virtues, media programs, iftaar reminder',
          'Eid ul-Fitr: Overview, sunnah acts, prayer guide, takbeeraat, Zakatul Fitr reminder',
          'Eid ul-Adha: Overview, sunnah acts, Qurbani guide, Takbeeraat of Tashreeq, Day of Arafah',
          'Islamic: Five Pillars, daily adhkar, essential duas, how to pray Salah, Zakat guide, Islamic organisations in Guyana, trusted online resources',
          'Free Islamic PDF library with category filter',
        ],
      },
      {
        heading: 'User Account & Profile',
        items: [
          'Authentication via email / Google (better-auth)',
          'Profile page with Ramadan tracker stats — streak, days tracked, perfect days',
          'Per-item progress bars (fasted, Qur\'an, dhikr, prayer, masjid)',
          '30-day Ramadan heatmap calendar',
          'Preferences sync between devices on sign-in',
        ],
      },
      {
        heading: 'PWA & Notifications',
        items: [
          'Installable on Android and iOS (Add to Home Screen)',
          'Offline support via service worker cache',
          'VAPID push notifications — Iftaar reminders and Ramadan alerts',
          'Smart onboarding wizard with iOS Safari install guide',
          'Background notification scheduling via service worker messaging',
        ],
      },
      {
        heading: 'Design & Accessibility',
        items: [
          'Full dark mode — system-aware with manual toggle',
          'Mobile-first responsive layout (max-width phone shell)',
          'ARIA labels, keyboard navigation, screen reader support throughout',
          'Toast notification system for user feedback',
          'Lazy-loaded routes with Suspense fallbacks for fast initial load',
          'Custom MasjidConnect GY branding — logo, colour scheme, Cinzel/Amiri fonts',
        ],
      },
    ],
  },
];

export default function Changelog({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-0 sm:px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Changelog"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-900 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <GitCommit className="w-5 h-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            <h2 className="font-bold text-gray-900 dark:text-gray-100 text-base">Changelog</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close changelog"
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-5 py-4 space-y-6">
          {changelog.map((release) => (
            <div key={release.version}>
              {/* Version header */}
              <div className="flex items-center gap-2 mb-3">
                <span className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">{release.version}</span>
                {release.label && (
                  <span className="text-[10px] bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                    {release.label}
                  </span>
                )}
                {release.tag === 'current' && (
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-semibold">
                    current
                  </span>
                )}
                <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">{release.date}</span>
              </div>

              {/* Sections */}
              <div className="space-y-3">
                {release.sections.map((section) => (
                  <div key={section.heading}>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-500 mb-1.5">
                      {section.heading}
                    </p>
                    <ul className="space-y-1">
                      {section.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                          <span className="mt-0.5 text-emerald-500 dark:text-emerald-600 shrink-0">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <p className="text-[10px] text-center text-gray-400 dark:text-gray-600 pb-1">
            Open source — contributions welcome on{' '}
            <a
              href="https://github.com/kareemschultz/masjidconnect-gy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              GitHub
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
