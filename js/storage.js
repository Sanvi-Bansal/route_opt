function getStopsKey(email) {
  return 'routeopt_stops_' + email;
}

function loadStops(email) {
  try {
    const raw = localStorage.getItem(getStopsKey(email));
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveStops(email, stops) {
  localStorage.setItem(getStopsKey(email), JSON.stringify(stops));
}

function getSetsKey(email) {
  return 'routeopt_sets_' + email;
}

function loadSets(email) {
  try {
    const raw = localStorage.getItem(getSetsKey(email));
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveSets(email, sets) {
  localStorage.setItem(getSetsKey(email), JSON.stringify(sets));
}

function getHistoryKey(email) {
  return 'routeopt_history_' + email;
}

function loadHistory(email) {
  try {
    const raw = localStorage.getItem(getHistoryKey(email));
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}