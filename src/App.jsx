import { useState, lazy, Suspense, Component } from 'react';
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

class ErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center py-12 px-4">
          <p className="text-4xl mb-3">⚠️</p>
          <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">Something went wrong</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm transition-colors"
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [tab, setTab] = useState('masjids');
  const [showSubmit, setShowSubmit] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const { submissions, loading, addSubmission } = useSubmissions();

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-gray-950 transition-colors duration-300">
      <Header />
      <Navigation active={tab} onChange={setTab} onSubmit={() => setShowSubmit(true)} />

      <main className="pb-8" id="main-content">
        <ErrorBoundary>
          <Suspense fallback={<TabLoader />}>
            {tab === 'masjids' && (
              <div id="panel-masjids" role="tabpanel" aria-label="Masjid Directory">
                <MasjidDirectory submissions={submissions} />
              </div>
            )}
            <div
              id="panel-tonight"
              role="tabpanel"
              aria-label="Tonight's Iftaar"
              className={tab === 'tonight' ? '' : 'hidden'}
            >
              <TonightIftaar submissions={submissions} loading={loading} />
            </div>
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
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <footer className="bg-emerald-900 dark:bg-gray-900 text-emerald-200 text-center py-6 px-4">
        <p className="font-amiri text-gold-400 text-lg mb-1">رمضان مبارك</p>
        <p className="text-xs mb-2">Ramadan Mubarak to the Georgetown Muslim Community</p>
        <p className="text-xs text-emerald-400 dark:text-emerald-500">
          Built with ❤️ for the ummah by <span className="font-semibold text-gold-400">Kareem</span>
        </p>
        <p className="text-xs text-emerald-500 dark:text-emerald-600 mt-1">
          Open source • Community driven • No data collected
        </p>
        <div className="mt-3 flex items-center justify-center gap-4 flex-wrap">
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
          <a
            href="https://github.com/kareemschultz/georgetown-iftaar/issues/new"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-emerald-300 hover:text-gold-400 transition-colors underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 rounded"
          >
            💬 Feedback
          </a>
        </div>
        <p className="text-[10px] text-emerald-400/80 dark:text-emerald-500/80 mt-2">
          Spotted an error? Have a feature idea? Tap Feedback above!
        </p>
        <p className="text-[10px] text-emerald-600 dark:text-emerald-700 mt-2">
          Georgetown Ramadan Guide v1.0 · Not affiliated with GIT or CIOG · Built for the ummah 🤲
        </p>
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
