
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

function saveHistory(email, history) {
  localStorage.setItem(getHistoryKey(email), JSON.stringify(history));
}
function addToHistory(email, entry) {
  const history = loadHistory(email);
  // Keep newest first
  history.unshift(entry);
  // Limit to last 50 runs
  if (history.length > 50) {
    history.length = 50;
  }
  saveHistory(email, history);
  return history;
}

function getTotalSpent(email) {
  const history = loadHistory(email);
  return history.reduce((sum, item) => {
    return sum + (Number(item.fuelCost) || 0);
  }, 0);
}

function getTotalKm(email) {
  const history = loadHistory(email);
  return history.reduce((sum, item) => {
    return sum + (Number(item.totalKm) || 0);
  }, 0);
}
