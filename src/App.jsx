import { useState, lazy, Suspense } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import TonightIftaar from './components/TonightIftaar';
import { useSubmissions } from './hooks/useSubmissions';

// Lazy load heavier tabs
const MasjidDirectory = lazy(() => import('./components/MasjidDirectory'));
const MapView = lazy(() => import('./components/MapView'));
const Timetable = lazy(() => import('./components/Timetable'));
const Duas = lazy(() => import('./components/Duas'));
const QiblaCompass = lazy(() => import('./components/QiblaCompass'));
const Resources = lazy(() => import('./components/Resources'));
const SubmitForm = lazy(() => import('./components/SubmitForm'));
const Changelog = lazy(() => import('./components/Changelog'));

function TabLoader() {
  return (
    <div className="flex items-center justify-center py-20" role="status" aria-label="Loading">
      <div className="animate-spin w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full" />
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState('tonight');
  const [showSubmit, setShowSubmit] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const { submissions, loading, addSubmission } = useSubmissions();

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-gray-950 transition-colors duration-300">
      <Header />
      <Navigation active={tab} onChange={setTab} onSubmit={() => setShowSubmit(true)} />

      <main className="pb-8" id="main-content">
        <Suspense fallback={<TabLoader />}>
          <div
            id="panel-tonight"
            role="tabpanel"
            aria-label="Tonight's Iftaar"
            className={tab === 'tonight' ? '' : 'hidden'}
          >
            <TonightIftaar submissions={submissions} loading={loading} />
          </div>
          {tab === 'masjids' && (
            <div id="panel-masjids" role="tabpanel" aria-label="Masjid Directory">
              <MasjidDirectory submissions={submissions} />
            </div>
          )}
          {tab === 'map' && (
            <div id="panel-map" role="tabpanel" aria-label="Map View">
              <MapView submissions={submissions} />
            </div>
          )}
          {tab === 'timetable' && (
            <div id="panel-timetable" role="tabpanel" aria-label="Prayer Timetable">
              <Timetable />
            </div>
          )}
          {tab === 'duas' && (
            <div id="panel-duas" role="tabpanel" aria-label="Duas and Supplications">
              <Duas />
            </div>
          )}
          {tab === 'qibla' && (
            <div id="panel-qibla" role="tabpanel" aria-label="Qibla Compass">
              <QiblaCompass />
            </div>
          )}
          {tab === 'resources' && (
            <div id="panel-resources" role="tabpanel" aria-label="More Resources">
              <Resources />
            </div>
          )}
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="bg-emerald-900 dark:bg-gray-900 text-emerald-200 py-8 px-4">
        <div className="max-w-lg mx-auto">
          {/* Arabic blessing */}
          <p className="font-amiri text-gold-400 text-2xl mb-1 text-center">رمضان مبارك</p>
          <p className="text-xs text-emerald-300 mb-4 text-center">Ramadan Mubarak — May this blessed month bring you peace, mercy, and forgiveness</p>

          <div className="border-t border-emerald-700/50 my-4" />

          {/* Timetable source */}
          <p className="text-xs text-emerald-400 text-center mb-3">
            Prayer times sourced from the Guyana Islamic Trust (GIT) Ramadan 1447 timetable
          </p>

          {/* Links row */}
          <div className="flex items-center justify-center gap-4 flex-wrap mb-4">
            <button
              onClick={() => setTab('resources')}
              className="text-xs text-emerald-300 hover:text-gold-400 transition-colors underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 rounded"
            >
              📚 Resources
            </button>
            <button
              onClick={() => setShowChangelog(true)}
              className="text-xs text-emerald-300 hover:text-gold-400 transition-colors underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 rounded"
              aria-label="View changelog"
            >
              📋 Changelog
            </button>
            <a
              href="https://github.com/kareemschultz/georgetown-iftaar"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-emerald-300 hover:text-gold-400 transition-colors underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 rounded"
            >
              ⭐ Open Source
            </a>
          </div>

          <div className="border-t border-emerald-700/50 my-4" />

          {/* Credits */}
          <p className="text-sm text-center text-emerald-300">
            Built with ❤️ by <span className="font-semibold text-gold-400">Kareem</span>
          </p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-700 mt-2 text-center">
            Georgetown Ramadan Guide v2.0 · Open source, built for the ummah and community 🤲
          </p>
        </div>
      </footer>

      <Suspense fallback={null}>
        {showSubmit && (
          <SubmitForm
            onClose={() => setShowSubmit(false)}
            onSubmit={addSubmission}
          />
        )}
        {showChangelog && (
          <Changelog onClose={() => setShowChangelog(false)} />
        )}
      </Suspense>
    </div>
  );
}
