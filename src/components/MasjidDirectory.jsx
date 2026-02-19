import { MapPin, Phone, ExternalLink } from 'lucide-react';
import { masjids, featureLabels } from '../data/masjids';

export default function MasjidDirectory({ submissions }) {
  const getLatestSubmission = (masjidId) =>
    submissions.find(s => s.masjidId === masjidId);

  return (
    <div className="px-4 py-5 max-w-lg mx-auto">
      <h2 className="text-lg font-bold text-emerald-900 font-amiri mb-1">
        Masjids in Georgetown
      </h2>
      <p className="text-xs text-gray-500 mb-4">
        {masjids.length} masjids • Tap for directions
      </p>

      <div className="space-y-3">
        {masjids.map((m, i) => {
          const latest = getLatestSubmission(m.id);
          return (
            <div
              key={m.id}
              className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-50 card-hover animate-fade-in"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-emerald-900 text-sm">🕌 {m.name}</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />{m.address}
                  </p>
                </div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
                  title="Get Directions"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {m.features.map(f => (
                  <span key={f} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                    {featureLabels[f]?.icon} {featureLabels[f]?.label}
                  </span>
                ))}
              </div>

              {m.contact && (
                <a href={`tel:${m.contact}`} className="flex items-center gap-1 text-xs text-emerald-600 mt-2 hover:underline">
                  <Phone className="w-3 h-3" />{m.contact}
                </a>
              )}

              {m.notes && (
                <p className="text-xs text-gray-500 mt-2 italic">{m.notes}</p>
              )}

              {/* Tonight's status */}
              {latest ? (
                <div className="mt-3 bg-emerald-50 rounded-xl px-3 py-2">
                  <p className="text-xs font-semibold text-emerald-800">🍽️ Tonight:</p>
                  <p className="text-xs text-emerald-700 mt-0.5">{latest.menu}</p>
                </div>
              ) : (
                <div className="mt-3 bg-gray-50 rounded-xl px-3 py-2">
                  <p className="text-xs text-gray-400 italic">No update for tonight yet</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
