let stops = [];
let lastOptimizeResult = null;
let mapInstance = null;
let mapMarkers = [];
let mapPolyline = null;

document.addEventListener('DOMContentLoaded', async () => {
  const user = getCurrentUser();
  if (!user) {
    showToast('Please log in to use the optimizer');
    setTimeout(() => { window.location.href = '../index.html'; }, 1200);
    return;
  }
  if (!getToken()) {
    showToast('Session expired — please log in again');
    clearSession();
    setTimeout(() => { window.location.href = '../index.html'; }, 1200);
    return;
  }

  initMap();

  try {
    stops = await loadStopsFromAPI();
  } catch (e) {
    stops = [];
  }
  renderStopsList();
  updateMapMarkers();
  await renderSavedSets();

  const form = document.getElementById('stopForm');
  if (form) form.addEventListener('submit', onAddStop);
});

async function onAddStop(event) {
  event.preventDefault();
  const nameEl = document.getElementById('stopName');
  const latEl = document.getElementById('stopLat');
  const lngEl = document.getElementById('stopLng');
  const name = nameEl.value.trim();
  const lat = parseFloat(latEl.value);
  const lng = parseFloat(lngEl.value);

  if (!name) { showToast('Stop name is required'); return; }
  if (isNaN(lat) || isNaN(lng)) { showToast('Valid latitude and longitude are required'); return; }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) { showToast('Coordinates out of range'); return; }

  try {
    const created = await persistStopToAPI({ name, lat, lng });
    stops.push(created);
    nameEl.value = '';
    latEl.value = '';
    lngEl.value = '';
    renderStopsList();
    updateMapMarkers();
    hideResults();
    showToast('Stop added', 'success');
  } catch (err) {
    showToast(err.message || 'Failed to add stop');
  }
}

async function removeStop(id) {
  stops = stops.filter((s) => String(s.id) !== String(id));
  await removeStopFromAPI(id);
  renderStopsList();
  updateMapMarkers();
  hideResults();
}

async function clearStops() {
  if (stops.length === 0) return;
  stops = [];
  await clearStopsFromAPI();
  renderStopsList();
  updateMapMarkers();
  hideResults();
  showToast('All stops cleared');
}

function renderStopsList() {
  const container = document.getElementById('stopsList');
  if (!container) return;
  if (stops.length === 0) {
    container.innerHTML = '<div class="empty-msg">No stops yet. Add your first delivery point.</div>';
    return;
  }
  container.innerHTML = stops
    .map(
      (s) => `
    <div class="stop-item">
      <div class="name">${escapeHtml(s.name)}</div>
      <div class="coords">${s.lat.toFixed(4)}, ${s.lng.toFixed(4)}</div>
      <button class="remove" type="button" onclick="removeStop('${s.id}')" title="Remove">×</button>
    </div>`
    )
    .join('');
}

async function runOptimize() {
  const user = getCurrentUser();
  if (!user) { showToast('Please log in first'); return; }
  if (stops.length < 2) { showToast('Add at least 2 stops'); return; }

  const mileage = parseFloat(document.getElementById('mileage').value) || 15;
  const fuelPrice = parseFloat(document.getElementById('fuelPrice').value) || 100;

  try {
    // Server-side heuristic (POST /api/routes/optimize)
    const result = await RoutesAPI.optimize({
      stops: stops.map((s) => ({ name: s.name, lat: s.lat, lng: s.lng })),
      mileage,
      fuelPrice,
      save: true,
    });

    lastOptimizeResult = result;
    const { order, totalKm, matrix, fuelCost } = result;

    document.getElementById('totalDist').textContent = formatNum(totalKm, 1);
    document.getElementById('totalFuel').textContent = formatNum(fuelCost, 0);
    document.getElementById('stopCount').textContent = String(stops.length);

    const container = document.getElementById('orderedRoute');
    let html = '';
    for (let i = 0; i < order.length; i++) {
      const idx = order[i];
      const stop = stops[idx];
      const isStart = i === 0;
      const isReturn = i === order.length - 1;
      let legHtml = '';
      if (i > 0 && matrix) {
        const prevIdx = order[i - 1];
        legHtml = `<div class="leg-info">+ ${formatNum(matrix[prevIdx][idx], 2)} km from previous</div>`;
      }
      const label = isReturn ? stop.name + ' (return)' : stop.name;
      html += `
        <div class="ordered-stop ${isStart ? 'start' : ''}">
          <div class="line-col">
            <div class="dot">${isReturn ? '↩' : i + 1}</div>
            <div class="connector"></div>
          </div>
          <div class="content">
            <strong>${escapeHtml(label)}</strong>
            <div class="meta">${stop.lat.toFixed(4)}, ${stop.lng.toFixed(4)}</div>
            ${legHtml}
          </div>
        </div>`;
    }
    container.innerHTML = html;
    document.getElementById('resultsEmpty').style.display = 'none';
    document.getElementById('routeResult').classList.add('visible');
    drawOptimizedRoute(order);
    showToast('Route optimized & saved to history', 'success');
  } catch (err) {
    showToast(err.message || 'Optimization failed');
  }
}

function hideResults() {
  const result = document.getElementById('routeResult');
  const empty = document.getElementById('resultsEmpty');
  if (result) result.classList.remove('visible');
  if (empty) empty.style.display = 'flex';
  lastOptimizeResult = null;
  clearRouteLine();
}

async function saveCurrentSet() {
  const nameInput = document.getElementById('setName');
  const name = nameInput.value.trim();
  if (!name) { showToast('Enter a name for the set'); return; }
  if (stops.length === 0) { showToast('Add stops first'); return; }
  try {
    await saveSetToAPI(name, stops);
    nameInput.value = '';
    await renderSavedSets();
    showToast('Set saved: ' + name, 'success');
  } catch (err) {
    showToast(err.message || 'Failed to save set');
  }
}

async function loadStopSet(name) {
  try {
    const sets = await loadSetsFromAPI();
    if (!sets[name]) return;
    await clearStopsFromAPI();
    stops = [];
    for (const s of sets[name]) {
      const created = await persistStopToAPI({ name: s.name, lat: s.lat, lng: s.lng });
      stops.push(created);
    }
    renderStopsList();
    updateMapMarkers();
    hideResults();
    showToast('Loaded set: ' + name);
  } catch (err) {
    showToast(err.message || 'Failed to load set');
  }
}

async function deleteStopSet(name) {
  try {
    await deleteSetFromAPI(name);
    await renderSavedSets();
    showToast('Set deleted');
  } catch (err) {
    showToast(err.message || 'Failed to delete set');
  }
}

async function renderSavedSets() {
  const container = document.getElementById('savedSetsList');
  if (!container) return;
  try {
    const sets = await loadSetsFromAPI();
    const keys = Object.keys(sets);
    if (keys.length === 0) {
      container.innerHTML = '<div style="font-size:0.8rem;color:var(--text-muted);">No saved sets yet.</div>';
      return;
    }
    container.innerHTML = keys
      .map(
        (k) => `
      <div class="saved-item">
        <span onclick="loadStopSet('${escapeAttr(k)}')">${escapeHtml(k)} (${sets[k].length})</span>
        <button class="remove" type="button" onclick="event.stopPropagation(); deleteStopSet('${escapeAttr(k)}')" title="Delete">×</button>
      </div>`
      )
      .join('');
  } catch (e) {
    container.innerHTML = '<div style="font-size:0.8rem;color:var(--text-muted);">Could not load sets.</div>';
  }
}

// ========== MAP (Leaflet) — only UI addition ==========
function initMap() {
  const el = document.getElementById('routeMap');
  if (!el || typeof L === 'undefined') return;
  mapInstance = L.map('routeMap').setView([20.5937, 78.9629], 5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap',
    maxZoom: 19,
  }).addTo(mapInstance);
}

function clearMarkers() {
  mapMarkers.forEach((m) => mapInstance && mapInstance.removeLayer(m));
  mapMarkers = [];
}

function clearRouteLine() {
  if (mapPolyline && mapInstance) {
    mapInstance.removeLayer(mapPolyline);
    mapPolyline = null;
  }
}

function updateMapMarkers() {
  if (!mapInstance) return;
  clearMarkers();
  clearRouteLine();
  if (stops.length === 0) return;
  const bounds = [];
  stops.forEach((s) => {
    const marker = L.marker([s.lat, s.lng])
      .addTo(mapInstance)
      .bindPopup(`<strong>${escapeHtml(s.name)}</strong><br>${s.lat.toFixed(4)}, ${s.lng.toFixed(4)}`);
    mapMarkers.push(marker);
    bounds.push([s.lat, s.lng]);
  });
  if (bounds.length === 1) mapInstance.setView(bounds[0], 12);
  else if (bounds.length > 1) mapInstance.fitBounds(bounds, { padding: [40, 40] });
}

function drawOptimizedRoute(order) {
  if (!mapInstance || !order || order.length < 2) return;
  clearRouteLine();
  const latlngs = order.map((idx) => [stops[idx].lat, stops[idx].lng]);
  mapPolyline = L.polyline(latlngs, { color: '#22c55e', weight: 4, opacity: 0.85 }).addTo(mapInstance);
  mapInstance.fitBounds(mapPolyline.getBounds(), { padding: [40, 40] });
}
