import { useEffect, useRef, useState } from 'react';
import { masjids } from '../data/masjids';
import L from 'leaflet';

// Fix default marker icons for Leaflet + bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const masjidIcon = L.divIcon({
  html: '<span style="font-size:24px">🕌</span>',
  className: 'masjid-marker',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15],
});

export default function MapView({ submissions }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (mapInstance.current) return;

    // Georgetown center
    const map = L.map(mapRef.current, {
      center: [6.808, -58.155],
      zoom: 14,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    masjids.forEach(m => {
      const latest = submissions?.find(s => s.masjidId === m.id);
      const popupHtml = `
        <div style="min-width:180px;font-family:system-ui">
          <strong style="color:#065f46">🕌 ${m.name}</strong><br/>
          <span style="color:#666;font-size:12px">📍 ${m.address}</span>
          ${latest ? `<br/><span style="color:#047857;font-size:12px">🍽️ ${latest.menu.substring(0, 80)}${latest.menu.length > 80 ? '...' : ''}</span>` : ''}
          <br/>
          <a href="https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lng}" target="_blank" style="color:#2563eb;font-size:12px;text-decoration:none">📍 Get Directions →</a>
        </div>
      `;

      L.marker([m.lat, m.lng], { icon: masjidIcon })
        .addTo(map)
        .bindPopup(popupHtml);
    });

    // Try to add user location
    navigator.geolocation?.getCurrentPosition(
      pos => {
        const userIcon = L.divIcon({
          html: '<span style="font-size:20px">📍</span>',
          className: 'user-marker',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
        L.marker([pos.coords.latitude, pos.coords.longitude], { icon: userIcon })
          .addTo(map)
          .bindPopup('<strong>You are here</strong>');
      },
      () => {},
      { enableHighAccuracy: false, timeout: 5000 }
    );

    mapInstance.current = map;
    setLoading(false);

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [submissions]);

  return (
    <div className="px-4 py-5 max-w-2xl mx-auto">
      <h2 className="text-lg font-bold text-emerald-900 dark:text-emerald-100 font-amiri mb-1">
        Masjid Map
      </h2>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        Tap a pin to see details • {masjids.length} masjids
      </p>
      <div className="rounded-2xl overflow-hidden shadow-sm border border-emerald-50 dark:border-gray-700 relative">
        {loading && (
          <div className="absolute inset-0 z-10 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full" />
          </div>
        )}
        <div ref={mapRef} className="h-[60vh] sm:h-[400px] w-full" />
      </div>
    </div>
  );
}
