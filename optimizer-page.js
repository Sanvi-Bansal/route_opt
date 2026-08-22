let stops = []; 

document.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser();
  if (!user) {
    showToast('Please log in to use the optimizer');
    setTimeout(() => {
      window.location.href = '../index.html';
    }, 1200);
    return;
  }

  stops = loadStops(user.email);
  renderStopsList();
  renderSavedSets();

  const form = document.getElementById('stopForm');
  if (form) {
    form.addEventListener('submit', onAddStop);
  }
});

function onAddStop(event) {
  event.preventDefault();

  const nameEl = document.getElementById('stopName');
  const latEl = document.getElementById('stopLat');
  const lngEl = document.getElementById('stopLng');

  const name = nameEl.value.trim();
  const lat = parseFloat(latEl.value);
  const lng = parseFloat(lngEl.value);

  if (!name) {
    showToast('Stop name is required');
    return;
  }
  if (isNaN(lat) || isNaN(lng)) {
    showToast('Valid latitude and longitude are required');
    return;
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    showToast('Coordinates out of range');
    return;
  }

  const stop = {
    id: Date.now() + Math.random(),
    name: name,
    lat: lat,
    lng: lng
  };
  stops.push(stop);

  nameEl.value = '';
  latEl.value = '';
  lngEl.value = '';

  renderStopsList();
  persistCurrentStops();
  showToast('Stop added', 'success');
}

function removeStop(id) {

  stops = stops.filter((s) => s.id !== id);
  renderStopsList();
  persistCurrentStops();
  hideResults();
}

function clearStops() {
  if (stops.length === 0) return;
  stops = [];
  renderStopsList();
  persistCurrentStops();
  hideResults();
  showToast('All stops cleared');
}

function persistCurrentStops() {
  const user = getCurrentUser();
  if (user) saveStops(user.email, stops);
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
      <button class="remove" type="button" onclick="removeStop(${s.id})" title="Remove">×</button>
    </div>
  `
    )
    .join('');
}

function runOptimize() {
  const user = getCurrentUser();
  if (!user) {
    showToast('Please log in first');
    return;
  }

  if (stops.length < 2) {
    showToast('Add at least 2 stops');
    return;
  }

  const mileage = parseFloat(document.getElementById('mileage').value) || 15;
  const fuelPrice = parseFloat(document.getElementById('fuelPrice').value) || 100;

  const result = optimize(stops, true);
  const { order, total, matrix } = result;

  const fuelLitres = total / mileage;
  const fuelCost = fuelLitres * fuelPrice;

  document.getElementById('totalDist').textContent = formatNum(total, 1);
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
    if (i > 0) {
      const prevIdx = order[i - 1];
      const legKm = matrix[prevIdx][idx];
      legHtml = `<div class="leg-info">+ ${formatNum(legKm, 2)} km from previous</div>`;
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
      </div>
    `;
  }

  container.innerHTML = html;
  document.getElementById('resultsEmpty').style.display = 'none';
  document.getElementById('routeResult').classList.add('visible');

  const stopNames = order
    .slice(0, -1)
    .map((idx) => stops[idx].name)
    .join(' → ');

  addToHistory(user.email, {
    id: Date.now(),
    date: new Date().toISOString(),
    stopCount: stops.length,
    totalKm: Number(total.toFixed(2)),
    fuelLitres: Number(fuelLitres.toFixed(2)),
    fuelCost: Number(fuelCost.toFixed(2)),
    stopNames: stopNames
  });

  showToast('Route optimized & saved to history', 'success');
}

function hideResults() {
  const result = document.getElementById('routeResult');
  const empty = document.getElementById('resultsEmpty');
  if (result) result.classList.remove('visible');
  if (empty) empty.style.display = 'flex';
}

function saveCurrentSet() {
  const user = getCurrentUser();
  if (!user) return;

  const nameInput = document.getElementById('setName');
  const name = nameInput.value.trim();

  if (!name) {
    showToast('Enter a name for the set');
    return;
  }
  if (stops.length === 0) {
    showToast('Add stops first');
    return;
  }

  const sets = loadSets(user.email);
  sets[name] = stops.map((s) => ({
    name: s.name,
    lat: s.lat,
    lng: s.lng
  }));
  saveSets(user.email, sets);
  nameInput.value = '';
  renderSavedSets();
  showToast('Set saved: ' + name, 'success');
}
