import { useState, lazy, Suspense, Component } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Header from './components/Header';
import Navigation from './components/Navigation';
import TonightIftaar from './components/TonightIftaar';
import InstallBanner from './components/InstallBanner';
import RamadanStartPrompt from './components/RamadanStartPrompt';
import OnboardingWizard from './components/OnboardingWizard';
import { useSubmissions } from './hooks/useSubmissions';
import { usePreferencesSync } from './hooks/usePreferencesSync';

// Lazy load heavier tabs
const MasjidDirectory = lazy(() => import('./components/MasjidDirectory'));
const MapView = lazy(() => import('./components/MapView'));
const Timetable = lazy(() => import('./components/Timetable'));
const Duas = lazy(() => import('./components/Duas'));
const QiblaCompass = lazy(() => import('./components/QiblaCompass'));
const Resources = lazy(() => import('./components/Resources'));
const Feedback = lazy(() => import('./components/Feedback'));
const RamadanCompanion = lazy(() => import('./components/RamadanCompanion'));
const SubmitForm = lazy(() => import('./components/SubmitForm'));
const Changelog = lazy(() => import('./components/Changelog'));
const Events = lazy(() => import('./components/Events'));

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
  const [showSubmit, setShowSubmit] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const { submissions, loading, addSubmission } = useSubmissions();
  usePreferencesSync(); // Sync preferences between localStorage and API on auth

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black transition-colors duration-300">
      <div className="max-w-md mx-auto min-h-screen bg-warm-50 dark:bg-gray-950 shadow-[0_0_60px_rgba(0,0,0,0.15)] relative transition-colors duration-300">
      <Header />
      <Navigation onSubmit={() => setShowSubmit(true)} />

      <main className="pb-24" id="main-content">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Navigate to="/masjids" replace />} />
            <Route path="/masjids" element={
              <Suspense fallback={<TabLoader />}>
                <MasjidDirectory submissions={submissions} />
              </Suspense>
            } />
            <Route path="/events" element={
              <Suspense fallback={<TabLoader />}>
                <Events />
              </Suspense>
            } />
            <Route path="/iftaar" element={
              <TonightIftaar submissions={submissions} loading={loading} onSubmit={() => setShowSubmit(true)} />
            } />
            <Route path="/map" element={
              <Suspense fallback={<TabLoader />}>
                <MapView submissions={submissions} />
              </Suspense>
            } />
            <Route path="/timetable" element={
              <Suspense fallback={<TabLoader />}>
                <Timetable />
              </Suspense>
            } />
            <Route path="/duas" element={
              <Suspense fallback={<TabLoader />}>
                <Duas />
              </Suspense>
            } />
            <Route path="/qibla" element={
              <Suspense fallback={<TabLoader />}>
                <QiblaCompass />
              </Suspense>
            } />
            <Route path="/resources" element={
              <Suspense fallback={<TabLoader />}>
                <Resources />
              </Suspense>
            } />
            <Route path="/ramadan" element={
              <Suspense fallback={<TabLoader />}>
                <RamadanCompanion />
              </Suspense>
            } />
            <Route path="/feedback" element={
              <Suspense fallback={<TabLoader />}>
                <Feedback />
              </Suspense>
            } />
          </Routes>
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <footer className="bg-emerald-900 dark:bg-gray-900 text-emerald-200 text-center py-6 px-4">
        <p className="font-amiri text-gold-400 text-lg mb-1">رمضان مبارك</p>
        <p className="text-xs mb-2">Ramadan Mubarak to the Muslim Community of Guyana</p>
        <p className="text-xs text-emerald-400 dark:text-emerald-500">
          Built with ❤️ for the ummah
        </p>
        <p className="text-xs text-emerald-400 dark:text-emerald-500 mt-1">
          Masjids · Events · Ramadan · Resources — all year round
        </p>
        <div className="mt-3 flex items-center justify-center gap-4 flex-wrap">
          <Link
            to="/resources"
            className="text-xs text-emerald-300 hover:text-gold-400 transition-colors underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 rounded"
          >
            📚 Resources
          </Link>
          <button
            onClick={() => setShowChangelog(true)}
            className="text-xs text-emerald-300 hover:text-gold-400 transition-colors underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 rounded"
            aria-label="View changelog"
          >
            📋 Changelog
          </button>
          <a
            href="https://github.com/kareemschultz/masjidconnect-gy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-emerald-300 hover:text-gold-400 transition-colors underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 rounded"
          >
            ⭐ Open Source
          </a>
          <Link
            to="/feedback"
            className="text-xs text-emerald-300 hover:text-gold-400 transition-colors underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 rounded"
          >
            💬 Feedback
          </Link>
        </div>
        <p className="text-[10px] text-emerald-400/80 dark:text-emerald-500/80 mt-2">
          Spotted an error? Have a feature idea? Tap Feedback above!
        </p>
        <p className="text-[10px] text-emerald-600 dark:text-emerald-700 mt-2">
          MasjidConnect GY v2.1 · Serving the Muslim Community of Guyana · Not affiliated with GIT or CIOG
        </p>
      </footer>

      <OnboardingWizard />
      <InstallBanner />
      <RamadanStartPrompt />

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
      </div>{/* max-w-md phone shell */}
    </div>
  );
}
