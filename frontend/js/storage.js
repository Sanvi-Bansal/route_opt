/**
 * Storage layer — backed by MongoDB via API.
 */

async function loadStopsFromAPI() {
  try {
    const stops = await StopsAPI.list();
    return stops
      .filter((s) => !s.setName)
      .map((s) => ({ id: s._id, name: s.name, lat: s.lat, lng: s.lng }));
  } catch (e) {
    console.warn('loadStopsFromAPI', e);
    return [];
  }
}

async function persistStopToAPI(stop) {
  if (stop.id && String(stop.id).length === 24) return stop;
  const created = await StopsAPI.create({
    name: stop.name,
    lat: stop.lat,
    lng: stop.lng,
  });
  return { id: created._id, name: created.name, lat: created.lat, lng: created.lng };
}

async function removeStopFromAPI(id) {
  if (!id) return;
  try {
    await StopsAPI.remove(id);
  } catch (e) {
    console.warn('removeStopFromAPI', e);
  }
}

async function clearStopsFromAPI() {
  try {
    const stops = await StopsAPI.list();
    const current = stops.filter((s) => !s.setName);
    await Promise.all(current.map((s) => StopsAPI.remove(s._id)));
  } catch (e) {
    console.warn('clearStopsFromAPI', e);
  }
}

async function loadSetsFromAPI() {
  try {
    return await StopsAPI.listSets();
  } catch (e) {
    console.warn('loadSetsFromAPI', e);
    return {};
  }
}

async function saveSetToAPI(name, stops) {
  return StopsAPI.saveSet(
    name,
    stops.map((s) => ({ name: s.name, lat: s.lat, lng: s.lng }))
  );
}

async function deleteSetFromAPI(name) {
  return StopsAPI.deleteSet(name);
}

async function loadHistoryFromAPI() {
  try {
    const plans = await RoutesAPI.list();
    return plans.map((p) => ({
      id: p._id,
      date: p.createdAt,
      stopCount: p.stopCount,
      totalKm: p.totalKm,
      fuelLitres: p.fuelLitres,
      fuelCost: p.fuelCost,
      stopNames: p.stopNames,
    }));
  } catch (e) {
    console.warn('loadHistoryFromAPI', e);
    return [];
  }
}

async function clearHistoryFromAPI() {
  return RoutesAPI.clear();
}

// Legacy sync stubs (unused after API migration)
function loadStops() { return []; }
function saveStops() {}
function loadSets() { return {}; }
function saveSets() {}
function loadHistory() { return []; }
function saveHistory() {}
function addToHistory() {}
function getTotalSpent() { return 0; }
function getTotalKm() { return 0; }
