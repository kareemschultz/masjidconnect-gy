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

function TabLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full" />
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState('tonight');
  const [showSubmit, setShowSubmit] = useState(false);
  const { submissions, loading, addSubmission } = useSubmissions();

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-gray-950 transition-colors duration-300">
      <Header />
      <Navigation active={tab} onChange={setTab} onSubmit={() => setShowSubmit(true)} />

      <main className="pb-8">
        <Suspense fallback={<TabLoader />}>
          <div className={tab === 'tonight' ? '' : 'hidden'}><TonightIftaar submissions={submissions} loading={loading} /></div>
          {tab === 'masjids' && <MasjidDirectory submissions={submissions} />}
          {tab === 'map' && <MapView submissions={submissions} />}
          {tab === 'timetable' && <Timetable />}
          {tab === 'duas' && <Duas />}
          {tab === 'qibla' && <QiblaCompass />}
          {tab === 'resources' && <Resources />}
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="bg-emerald-900 dark:bg-gray-900 text-emerald-200 text-center py-6 px-4">
        <p className="font-amiri text-gold-400 text-lg mb-1">رمضان مبارك</p>
        <p className="text-xs mb-2">Ramadan Mubarak</p>
        <p className="text-xs text-emerald-400 dark:text-emerald-500">
          Built by <span className="font-semibold text-gold-400">Kareem</span>
        </p>
        <div className="mt-3 flex items-center justify-center gap-4">
          <button
            onClick={() => setTab('resources')}
            className="text-xs text-emerald-300 hover:text-gold-400 transition-colors underline underline-offset-2"
          >
            📚 Resources
          </button>
          <a
            href="https://github.com/kareemschultz/georgetown-iftaar"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-emerald-300 hover:text-gold-400 transition-colors underline underline-offset-2"
          >
            ⭐ Open Source
          </a>
        </div>
      </footer>

      <Suspense fallback={null}>
        {showSubmit && (
          <SubmitForm
            onClose={() => setShowSubmit(false)}
            onSubmit={addSubmission}
          />
        )}
      </Suspense>
    </div>
  );
}
