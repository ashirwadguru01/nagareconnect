import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getMapComplaints } from '../../services/complaintService';
import { Link } from 'react-router-dom';
import { FiMap, FiMapPin, FiAlertCircle } from 'react-icons/fi';

// Fix Leaflet default icon paths broken by bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const defaultCenter = [19.076, 72.8777];
const statusColors = {
  pending: '#fdcb6e',
  in_progress: '#74b9ff',
  resolved: '#00b894',
  rejected: '#ff7675',
};

// Component to fly map to a new location
const FlyTo = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 15, { duration: 1.2 });
  }, [center, map]);
  return null;
};

const MapView = ({ role = 'citizen' }) => {
  const [complaints, setComplaints] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [flyTarget, setFlyTarget] = useState(null);
  const [filter, setFilter] = useState('all');
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState('');

  useEffect(() => {
    getMapComplaints().then(r => setComplaints(r.data)).catch(() => {});
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
      }, () => {});
    }
  }, []);

  const goToMyLocation = () => {
    setLocError('');
    if (!navigator.geolocation) { setLocError('Geolocation not supported'); return; }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const loc = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(loc);
        setFlyTarget(loc);
        setLocLoading(false);
      },
      () => { setLocError('Location access denied'); setLocLoading(false); },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const filtered = filter === 'all' ? complaints : complaints.filter(c => c.status === filter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '24px', gap: '16px', fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiMap /> Complaints Map
          </h1>
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

      {/* Map */}
      <div style={{ flex: 1, borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)', position: 'relative' }}>
        <MapContainer
          center={userLocation || defaultCenter}
          zoom={13}
          style={{ width: '100%', height: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {flyTarget && <FlyTo center={flyTarget} />}

          {/* User location */}
          {userLocation && (
            <CircleMarker
              center={userLocation}
              radius={10}
              pathOptions={{ color: '#fff', weight: 3, fillColor: '#00b894', fillOpacity: 1 }}
            >
              <Popup>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'Poppins, sans-serif' }}>
                  <FiMapPin color="#00b894" /> Your Location
                </div>
              </Popup>
            </CircleMarker>
          )}

          {/* Complaint markers */}
          {filtered.map(c => {
            const color = statusColors[c.status] || '#999';
            const icon = L.divIcon({
              className: '',
              html: `<div style="
                width:18px;height:18px;border-radius:50%;
                background:${color};border:2.5px solid #fff;
                box-shadow:0 2px 6px rgba(0,0,0,0.5);
                cursor:pointer;
              "></div>`,
              iconSize: [18, 18],
              iconAnchor: [9, 9],
            });
            return (
              <Marker key={c.id} position={[parseFloat(c.lat), parseFloat(c.lng)]} icon={icon}>
                <Popup>
                  <div style={{ minWidth: '180px' }}>
                    <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>{c.title}</div>
                    {c.address && <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>{c.address.substring(0, 80)}</div>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        fontSize: '11px', fontWeight: 700, padding: '2px 8px',
                        borderRadius: '999px', background: color + '25', color,
                        border: `1px solid ${color}50`, textTransform: 'capitalize',
                      }}>
                        {c.status.replace('_', ' ')}
                      </span>
                      {role === 'citizen' && (
                        <Link to={`/citizen/complaints/${c.id}`} style={{ fontSize: '12px', color: '#00897b', fontWeight: 600 }}>View →</Link>
                      )}
                      {role === 'worker' && (
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`}
                          target="_blank" rel="noreferrer"
                          style={{ fontSize: '12px', color: '#00897b', fontWeight: 600 }}
                        >Navigate →</a>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* My Location FAB */}
        <button
          onClick={goToMyLocation}
          disabled={locLoading}
          title="Go to my location"
          style={{
            position: 'absolute', bottom: 80, right: 12, zIndex: 1000,
            width: 44, height: 44, borderRadius: '50%',
            background: locLoading ? '#1a2a3a' : '#0d1b2a',
            border: '2px solid #22c55e',
            boxShadow: '0 0 0 3px rgba(34,197,94,0.2), 0 4px 18px rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: locLoading ? 'wait' : 'pointer',
            transition: 'transform 0.15s ease',
          }}
        >
          {locLoading ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#22c55e" strokeWidth="2" strokeDasharray="31.4" strokeDashoffset="10">
                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
              </circle>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" fill="#22c55e" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
              <circle cx="12" cy="12" r="7" />
            </svg>
          )}
        </button>
        {locError && (
          <div style={{
            position: 'absolute', bottom: 132, right: 12, zIndex: 1000,
            background: '#1a0a0a', border: '1px solid #ef444455', borderRadius: 8,
            padding: '6px 12px', fontSize: 11, color: '#ef4444', whiteSpace: 'nowrap',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}><FiAlertCircle /> {locError}</div>
        )}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        {Object.entries(statusColors).map(([s, c]) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: c, flexShrink: 0 }} />
            <span style={{ textTransform: 'capitalize' }}>{s.replace('_', ' ')}</span>
          </div>
        ))}
        {userLocation && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#00b894', border: '2px solid white', flexShrink: 0 }} />
            <span>Your Location</span>
          </div>
        )}
        <div style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-muted)' }}>
          Click any marker for details
        </div>
      </div>
    </div>
  );
};

export default MapView;
