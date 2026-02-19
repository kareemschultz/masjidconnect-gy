import { useState } from 'react';
import { X, GitCommit } from 'lucide-react';

const changelog = [
  {
    version: 'v2.1',
    date: 'February 19, 2026',
    tag: 'current',
    changes: [
      'Corrected mosque data — verified addresses, coordinates, and contacts for all masjids',
      'Added 5 new verified masjids (Baitul Noor, East Georgetown Sunnatul Jamma, Old Mosque, Anjuman, Turkeyen)',
      'Removed duplicate entries — 15 total verified masjids',
      'Community-reported salah times — report and view prayer times for each masjid',
      'Mobile-friendly timetable with card/day view (swipe between days)',
      'Responsive Qibla compass sizing for smaller screens',
      'Improved map height on mobile devices',
      'Dynamic Iftaar reminder using actual Maghrib time from timetable',
      'Enhanced navigation with active tab background highlight',
      'Accessibility: aria-expanded on collapsibles, aria-labels on buttons, aria-live on toasts, htmlFor on form labels',
      'Not affiliated with GIT, CIOG, or any single Islamic organisation',
    ],
  },
  {
    version: 'v2.0',
    date: 'February 2026',
    tag: null,
    changes: [
      'Rebranded to Georgetown Ramadan Guide — broader community scope',
      'Masjid Directory with search, feature filters & distance sorting',
      'Live Ramadan countdown (Suhoor & Iftaar timers)',
      'Full Ramadan 1447 AH timetable for Georgetown / East Bank Demerara',
      'Duas tab — Iftaar, Suhoor, and general supplications',
      'Qibla compass with device orientation support',
      'Community Iftaar submission form (no login required)',
      'Dark mode & responsive mobile-first design',
      'Daily Ramadan checklist with local persistence',
      'Ramadan resources — fasting rules, Laylatul Qadr, Taraweeh guide, and more',
      'Firebase Firestore backend for live community updates',
      'Accessibility improvements — ARIA labels, keyboard navigation, focus states',
    ],
  },
  {
    version: 'v1.0',
    date: 'Ramadan 1446 AH (2025)',
    tag: 'initial',
    changes: [
      'Initial launch of Georgetown Iftaar Guide',
      'Basic masjid listing for Georgetown',
      'Iftaar prayer times for the season',
      'Simple community update form',
      'Mobile-first layout',
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
              <div className="flex items-center gap-2 mb-2">
                <span className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">{release.version}</span>
                {release.tag === 'current' && (
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-semibold">
                    current
                  </span>
                )}
                <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">{release.date}</span>
              </div>
              <ul className="space-y-1.5">
                {release.changes.map((change, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <span className="mt-0.5 text-emerald-500 dark:text-emerald-600 shrink-0">•</span>
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <p className="text-[10px] text-center text-gray-400 dark:text-gray-600 pb-1">
            Open source — contributions welcome on{' '}
            <a
              href="https://github.com/kareemschultz/georgetown-iftaar"
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
