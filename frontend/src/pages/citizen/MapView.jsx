import { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { getMapComplaints } from '../../services/complaintService';
import { Link } from 'react-router-dom';

const containerStyle = { width: '100%', height: '100%' };
const defaultCenter = { lat: 19.076, lng: 72.8777 };

const statusColors = { pending: '#fdcb6e', in_progress: '#74b9ff', resolved: '#00b894', rejected: '#ff7675' };

const MapView = ({ role = 'citizen' }) => {
  const [complaints, setComplaints] = useState([]);
  const [selected, setSelected] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [center, setCenter] = useState(defaultCenter);
  const [filter, setFilter] = useState('all');

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  useEffect(() => {
    getMapComplaints().then(r => setComplaints(r.data));
    navigator.geolocation?.getCurrentPosition(pos => {
      const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setUserLocation(loc);
      setCenter(loc);
    });
  }, []);

  const filtered = filter === 'all' ? complaints : complaints.filter(c => c.status === filter);

  if (loadError) return (
    <div className="page-wrapper">
      <div className="alert alert-error">Google Maps failed to load. Please check your API key in the .env file.</div>
      <div className="card">
        <p style={{ color: 'var(--text-secondary)' }}>Set <code>VITE_GOOGLE_MAPS_API_KEY</code> in <code>frontend/.env</code> to enable maps.</p>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '24px', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800 }}>🗺️ Complaints Map</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{filtered.length} complaints shown</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['all', 'pending', 'in_progress', 'resolved'].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-ghost'}`}>
              {s === 'all' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)' }}>
        {!isLoaded ? (
          <div className="spinner-overlay" style={{ height: '100%' }}><div className="spinner" /></div>
        ) : (
          <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12}
            options={{ styles: darkMapStyle, disableDefaultUI: false, zoomControl: true, mapTypeControl: false, streetViewControl: false }}>
            {userLocation && (
              <Marker position={userLocation} icon={{ path: window.google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: '#00b894', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 }} title="Your Location" />
            )}
            {filtered.map(c => (
              <Marker key={c.id} position={{ lat: parseFloat(c.lat), lng: parseFloat(c.lng) }}
                onClick={() => setSelected(c)}
                icon={{ path: window.google.maps.SymbolPath.CIRCLE, scale: 7, fillColor: statusColors[c.status] || '#999', fillOpacity: 0.9, strokeColor: '#fff', strokeWeight: 2 }}
              />
            ))}
            {selected && (
              <InfoWindow position={{ lat: parseFloat(selected.lat), lng: parseFloat(selected.lng) }} onCloseClick={() => setSelected(null)}>
                <div style={{ background: '#1a2332', padding: '12px', borderRadius: '8px', maxWidth: '220px', color: '#e6edf3' }}>
                  <div style={{ fontWeight: 700, marginBottom: '4px', fontSize: '14px' }}>{selected.title}</div>
                  <div style={{ fontSize: '12px', color: '#8b949e', marginBottom: '8px' }}>{selected.address?.substring(0, 60)}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: statusColors[selected.status] + '30', color: statusColors[selected.status] }}>
                      {selected.status.replace('_', ' ')}
                    </span>
                    {role === 'citizen' && (
                      <Link to={`/citizen/complaints/${selected.id}`} style={{ fontSize: '12px', color: '#00b894', fontWeight: 600 }}>View →</Link>
                    )}
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        )}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {Object.entries(statusColors).map(([s, c]) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: c }} />
            <span style={{ textTransform: 'capitalize' }}>{s.replace('_', ' ')}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#00b894', border: '2px solid #fff' }} />
          <span>Your Location</span>
        </div>
      </div>
    </div>
  );
};

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1d2c3e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8b949e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1d2c3e' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#243447' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d1117' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
];

export default MapView;
