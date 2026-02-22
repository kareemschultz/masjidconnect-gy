import { GitCommit, Sparkles } from 'lucide-react';
import PageHero from './PageHero';

const changelog = [
  {
    version: 'v1.6',
    date: 'February 2026',
    tag: 'current',
    label: 'Design Consistency',
    color: 'purple',
    sections: [
      {
        heading: 'Design Overhaul',
        items: [
          'Unified card styling across every page — bg-white/dark:bg-gray-900 rounded-2xl',
          'Changelog converted from modal to full standalone page with PageHero',
          'Admin Panel redesigned with PageHero and consistent card layout',
          'RamadanCompanion cards updated to match Settings design language',
          'Consistent border and dark mode colors throughout all pages',
        ],
      },
    ],
  },
  {
    version: 'v1.5',
    date: 'February 2026',
    label: 'Push Notifications & Learning',
    color: 'emerald',
    sections: [
      {
        heading: 'Push Notifications',
        items: [
          'Prayer time push notifications — Fajr, Dhuhr, Asr, Maghrib, Isha',
          'Suhoor reminder — 30 minutes before Fajr during Ramadan',
          'Iftaar alert — at Maghrib time during Ramadan',
          'Per-prayer notification toggles in Settings',
          'Server-side scheduling via VAPID web push',
        ],
      },
      {
        heading: 'Madrasa (Noorani Qaida)',
        items: [
          '12 structured lessons — from Arabic alphabet to Tajweed rules',
          'Interactive lesson cards with audio pronunciation guide',
          'Progressive learning path for beginners',
        ],
      },
      {
        heading: 'Daily Spiritual Tools',
        items: [
          'Morning & Evening Adhkar with Arabic, transliteration and translation',
          'Verse of the Day — daily rotating Quran ayah',
          'Quran Reading Goal — track daily reading progress',
        ],
      },
      {
        heading: 'UI/UX Polish',
        items: [
          'Muslim Pro-style prayer time band with Fajr & Sunrise',
          'Bottom tab bar with 5 primary tabs + More sheet',
          'Haptic feedback on Tasbih counter',
          'Slimmer headers, smoother animations, skeleton loading',
          'Drag-to-close bottom sheet interactions',
        ],
      },
    ],
  },
  {
    version: 'v1.0',
    date: 'February 2026 · Ramadan 1447 AH',
    label: 'Initial Launch',
    color: 'blue',
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
          'Three-tab layout: Ramadan · Eid · Islamic — all collapsed by default',
          'Ramadan: Daily checklist, fasting rules, exemptions, Laylatul Qadr, I\'tikaf, Taraweeh, Zakatul Fitr, virtues',
          'Eid ul-Fitr: Overview, sunnah acts, prayer guide, takbeeraat, Zakatul Fitr reminder',
          'Eid ul-Adha: Overview, sunnah acts, Qurbani guide, Takbeeraat of Tashreeq, Day of Arafah',
          'Islamic: Five Pillars, daily adhkar, essential duas, how to pray Salah, Zakat guide',
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

const ACCENT_COLORS = {
  emerald: { bar: 'bg-emerald-500', badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400', bullet: 'text-emerald-500 dark:text-emerald-600', heading: 'text-emerald-600 dark:text-emerald-500' },
  amber:   { bar: 'bg-amber-500',   badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',     bullet: 'text-amber-500 dark:text-amber-600',   heading: 'text-amber-600 dark:text-amber-500' },
  blue:    { bar: 'bg-blue-500',    badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',       bullet: 'text-blue-500 dark:text-blue-600',    heading: 'text-blue-600 dark:text-blue-500' },
  purple:  { bar: 'bg-purple-500',  badge: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400', bullet: 'text-purple-500 dark:text-purple-600',  heading: 'text-purple-600 dark:text-purple-500' },
  rose:    { bar: 'bg-rose-500',    badge: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',       bullet: 'text-rose-500 dark:text-rose-600',    heading: 'text-rose-600 dark:text-rose-500' },
};

export default function Changelog() {
  return (
    <div className="min-h-screen faith-canvas pb-24 page-enter" style={{ touchAction: 'pan-y', WebkitOverflowScrolling: 'touch' }}>
      <PageHero title="Changelog" subtitle="WHAT'S NEW" icon={GitCommit} backLink="/settings" color="amber" />

      <div className="p-4 space-y-5">
        {changelog.map((release) => {
          const accent = ACCENT_COLORS[release.color] || ACCENT_COLORS.emerald;
          return (
            <div key={release.version} className="mb-5">
              {/* Section header with colored left bar */}
              <div className="flex items-center gap-2 mb-2 px-1">
                <div className={`w-1 h-4 rounded-full ${accent.bar}`} />
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">{release.version}</h3>
                {release.label && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${accent.badge}`}>
                    {release.label}
                  </span>
                )}
                {release.tag === 'current' && (
                  <span className="flex items-center gap-1 text-[10px] bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-semibold">
                    <Sparkles className="w-3 h-3" />
                    current
                  </span>
                )}
                <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-auto">{release.date}</span>
              </div>

              {/* Card */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {release.sections.map((section) => (
                    <div key={section.heading} className="px-4 py-3.5">
                      <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${accent.heading}`}>
                        {section.heading}
                      </p>
                      <ul className="space-y-1.5">
                        {section.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <span className={`mt-0.5 shrink-0 ${accent.bullet}`}>•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

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
  );
}
