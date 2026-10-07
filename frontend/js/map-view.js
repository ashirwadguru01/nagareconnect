// Nagar e-Connect - Interactive Map View Component

document.addEventListener('DOMContentLoaded', async () => {
  const user = requireAuth(['citizen', 'worker', 'admin']);
  if (!user) return;

  const role = user.role;
  const mapElement = document.getElementById('map');
  const countEl = document.getElementById('map-count');
  const filterBtns = document.querySelectorAll('.map-filter-btn');

  let complaints = [];
  let currentFilter = 'all';
  let mapInstance = null;
  let markersLayer = null;
  let userMarker = null;

  const statusColors = {
    pending: '#fdcb6e',
    in_progress: '#74b9ff',
    resolved: '#00b894',
    rejected: '#ff7675'
  };

  // Default center (Mumbai/India coordinates default, or dynamically detects)
  let defaultCenter = [19.0760, 72.8777];

  function initMap(center) {
    if (mapInstance) return;

    mapInstance = L.map('map', {
      center: center,
      zoom: 12,
      zoomControl: true
    });

    // Dark theme CartoDB basemap
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(mapInstance);

    markersLayer = L.layerGroup().addTo(mapInstance);
  }

  function createMarkerIcon(color, isUser = false) {
    const size = isUser ? 18 : 14;
    return L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background: ${color};
          border: 2.5px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 10px ${color}80, 0 2px 5px rgba(0,0,0,0.5);
          cursor: pointer;
        "></div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  }

  function renderMarkers() {
    if (!markersLayer) return;
    markersLayer.clearLayers();

    const filtered = currentFilter === 'all'
      ? complaints
      : complaints.filter(c => c.status === currentFilter);

    if (countEl) {
      countEl.textContent = `${filtered.length} complaints shown`;
    }

    filtered.forEach(c => {
      const lat = parseFloat(c.lat);
      const lng = parseFloat(c.lng);
      if (isNaN(lat) || isNaN(lng)) return;

      const color = statusColors[c.status] || '#999';
      const marker = L.marker([lat, lng], {
        icon: createMarkerIcon(color)
      });

      const detailLink = role === 'admin'
        ? `/admin/complaints.html?id=${c.id}`
        : role === 'worker'
        ? `/worker/tasks.html?id=${c.id}`
        : `/citizen/complaint-detail.html?id=${c.id}`;

      const popupHtml = `
        <div style="padding: 4px; min-width: 200px;">
          <div style="font-weight: 700; margin-bottom: 4px; font-size: 14px; color: #e6edf3;">${c.title}</div>
          <div style="font-size: 12px; color: #8b949e; margin-bottom: 8px;">${(c.address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`).substring(0, 60)}</div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="badge badge-${c.status}">${c.status.replace('_', ' ')}</span>
            <a href="${detailLink}" style="font-size: 12px; color: #00b894; font-weight: 700; text-decoration: none;">View Details →</a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      markersLayer.addLayer(marker);
    });
  }

  // Filter button handlers
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('btn-primary'));
      filterBtns.forEach(b => b.classList.add('btn-ghost'));
      btn.classList.remove('btn-ghost');
      btn.classList.add('btn-primary');

      currentFilter = btn.dataset.status;
      renderMarkers();
    });
  });

  // Start initialization
  initMap(defaultCenter);

  // Attempt user geolocation
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLoc = [pos.coords.latitude, pos.coords.longitude];
        if (mapInstance) {
          mapInstance.setView(userLoc, 13);
          userMarker = L.marker(userLoc, {
            icon: createMarkerIcon('#00b894', true),
            zIndexOffset: 1000
          }).bindPopup('<b>📍 Your Location</b>');
          markersLayer.addLayer(userMarker);
        }
      },
      () => {
        // Geolocation denied or unavailable, keep default center
      }
    );
  }

  // Load complaints from API
  try {
    const res = await complaintService.getMap();
    complaints = res || [];
    renderMarkers();

    // Auto-fit bounds if complaints exist
    if (complaints.length > 0 && mapInstance) {
      const validCoords = complaints
        .map(c => [parseFloat(c.lat), parseFloat(c.lng)])
        .filter(([lat, lng]) => !isNaN(lat) && !isNaN(lng));
      if (validCoords.length > 0) {
        mapInstance.fitBounds(validCoords, { padding: [50, 50], maxZoom: 14 });
      }
    }
  } catch (err) {
    toast.error('Failed to load map complaints');
  }

  if (window.feather) feather.replace();
});
