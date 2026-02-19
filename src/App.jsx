import { useState, lazy, Suspense, Component, useEffect } from 'react';
import { Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Navigation from './components/Navigation';
import TonightIftaar from './components/TonightIftaar';
import InstallBanner from './components/InstallBanner';
import RamadanStartPrompt from './components/RamadanStartPrompt';
import OnboardingWizard from './components/OnboardingWizard';
import IftaarDuaPopup from './components/IftaarDuaPopup';
import SubmitHub from './components/SubmitHub';
import { useSubmissions } from './hooks/useSubmissions';
import { usePreferencesSync } from './hooks/usePreferencesSync';
import { scheduleAdhanForToday } from './utils/adhanPlayer';

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
const EventSubmitForm = lazy(() => import('./components/EventSubmitForm'));
const Changelog = lazy(() => import('./components/Changelog'));
const Events = lazy(() => import('./components/Events'));
const UserProfile = lazy(() => import('./components/UserProfile'));

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
  const [submitDefaultMasjid, setSubmitDefaultMasjid] = useState(null);
  const [showChangelog, setShowChangelog] = useState(false);
  const [showHub, setShowHub] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const { submissions, loading, addSubmission, reactToSubmission } = useSubmissions();
  const location = useLocation();
  const navigate = useNavigate();
  usePreferencesSync(); // Sync preferences between localStorage and API on auth

  // Schedule in-app adhan audio for today's enabled prayers
  useEffect(() => {
    const cancel = scheduleAdhanForToday();
    return cancel;
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black transition-colors duration-300">
      <div className="max-w-md mx-auto min-h-screen bg-warm-50 dark:bg-gray-950 shadow-[0_0_60px_rgba(0,0,0,0.15)] relative transition-colors duration-300">
      <Header />
      <Navigation onSubmit={() => setShowHub(true)} />

      <main className="pb-24" id="main-content">
        <ErrorBoundary key={location.pathname}>
          <Routes>
            <Route path="/" element={<Navigate to="/masjids" replace />} />
            <Route path="/masjids" element={
              <Suspense fallback={<TabLoader />}>
                <MasjidDirectory submissions={submissions} onSubmitMasjid={() => navigate('/feedback?type=add_masjid')} />
              </Suspense>
            } />
            <Route path="/events" element={
              <Suspense fallback={<TabLoader />}>
                <Events />
              </Suspense>
            } />
            <Route path="/iftaar" element={
              <TonightIftaar submissions={submissions} loading={loading} onReact={reactToSubmission} onSubmit={(masjidId) => { setSubmitDefaultMasjid(masjidId || null); setShowSubmit(true); }} />
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
            <Route path="/profile" element={
              <Suspense fallback={<TabLoader />}>
                <UserProfile />
              </Suspense>
            } />
            <Route path="*" element={
              <div className="px-4 py-16 text-center max-w-sm mx-auto">
                <p className="text-5xl mb-4">🕌</p>
                <h2 className="text-xl font-bold text-emerald-900 dark:text-emerald-100 font-amiri mb-2">Page Not Found</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">This page doesn't exist or has moved.</p>
                <Link to="/masjids" className="inline-block px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors">Back to Home</Link>
              </div>
            } />
          </Routes>
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <footer className="bg-emerald-900 dark:bg-gray-900 text-emerald-200 text-center py-6 px-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src="/icons/icon-48.png" alt="" width={32} height={32} className="rounded-full opacity-90" />
          <p className="font-cinzel text-white font-bold text-base tracking-wide">MasjidConnect GY</p>
        </div>
        <p className="text-xs text-emerald-300/80 italic mb-2">Linking Faith and Community.</p>
        <p className="text-xs text-emerald-400 dark:text-emerald-500">
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
          MasjidConnect GY v1.0 · Serving the Muslim Community of Guyana · Not affiliated with GIT or CIOG
        </p>
      </footer>

      <OnboardingWizard />
      <IftaarDuaPopup />
      <InstallBanner />
      <RamadanStartPrompt />

      <Suspense fallback={null}>
        {showSubmit && (
          <SubmitForm
            onClose={() => { setShowSubmit(false); setSubmitDefaultMasjid(null); }}
            onSubmit={addSubmission}
            defaultMasjidId={submitDefaultMasjid}
          />
        )}
        {showChangelog && (
          <Changelog onClose={() => setShowChangelog(false)} />
        )}
        {showEventForm && (
          <EventSubmitForm onClose={() => setShowEventForm(false)} />
        )}
      </Suspense>

      {showHub && (
        <SubmitHub
          onClose={() => setShowHub(false)}
          onIftaar={() => { setShowHub(false); setShowSubmit(true); }}
          onEvent={() => { setShowHub(false); setShowEventForm(true); }}
        />
      )}
      </div>{/* max-w-md phone shell */}
    </div>
  );
}
