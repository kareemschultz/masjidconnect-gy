import { useState } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import TonightIftaar from './components/TonightIftaar';
import MasjidDirectory from './components/MasjidDirectory';
import Timetable from './components/Timetable';
import Duas from './components/Duas';
import SubmitForm from './components/SubmitForm';
import { useSubmissions } from './hooks/useSubmissions';

export default function App() {
  const [tab, setTab] = useState('tonight');
  const [showSubmit, setShowSubmit] = useState(false);
  const { submissions, loading, addSubmission } = useSubmissions();

  return (
    <div className="min-h-screen bg-warm-50">
      <Header />
      <Navigation active={tab} onChange={setTab} onSubmit={() => setShowSubmit(true)} />

      <main className="pb-8">
        {tab === 'tonight' && <TonightIftaar submissions={submissions} loading={loading} />}
        {tab === 'masjids' && <MasjidDirectory submissions={submissions} />}
        {tab === 'timetable' && <Timetable />}
        {tab === 'duas' && <Duas />}
      </main>

      {/* Footer */}
      <footer className="bg-emerald-900 text-emerald-200 text-center py-6 px-4">
        <p className="font-amiri text-gold-400 text-lg mb-1">رمضان مبارك</p>
        <p className="text-xs mb-2">Ramadan Mubarak to the Georgetown Muslim Community</p>
        <p className="text-xs text-emerald-400">
          Built with ❤️ for the ummah • Timetable by{' '}
          <span className="font-semibold">Guyana Islamic Trust</span>
        </p>
        <p className="text-xs text-emerald-500 mt-1">
          Open source • Community driven • No data collected
        </p>
      </footer>

      {showSubmit && (
        <SubmitForm
          onClose={() => setShowSubmit(false)}
          onSubmit={addSubmission}
        />
      )}
    </div>
  );
}
