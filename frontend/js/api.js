/**
 * API client for RouteOpt backend.
 */
const API_BASE = 'https://routeopt-backend.onrender.com/api';

function getToken() {
  try {
    return localStorage.getItem('routeopt_token') || null;
  } catch {
    return null;
  }
}

function setToken(token) {
  if (token) localStorage.setItem('routeopt_token', token);
  else localStorage.removeItem('routeopt_token');
}

async function api(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  let data = null;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { message: text };
  }
  if (!res.ok) {
    const err = new Error((data && data.message) || res.statusText || 'Request failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

const AuthAPI = {
  register: (name, email, password) =>
    api('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),
  login: (email, password) =>
    api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => api('/auth/me'),
};

const StopsAPI = {
  list: (setName) =>
    api('/stops' + (setName ? `?setName=${encodeURIComponent(setName)}` : '')),
  create: (stop) =>
    api('/stops', { method: 'POST', body: JSON.stringify(stop) }),
  update: (id, data) =>
    api(`/stops/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => api(`/stops/${id}`, { method: 'DELETE' }),
  clear: (setName) =>
    api('/stops' + (setName ? `?setName=${encodeURIComponent(setName)}` : ''), { method: 'DELETE' }),
  listSets: () => api('/stops/sets/list'),
  saveSet: (name, stops) =>
    api('/stops/sets', { method: 'POST', body: JSON.stringify({ name, stops }) }),
  deleteSet: (name) =>
    api(`/stops/sets/${encodeURIComponent(name)}`, { method: 'DELETE' }),
};

const RoutesAPI = {
  optimize: (payload) =>
    api('/routes/optimize', { method: 'POST', body: JSON.stringify(payload) }),
  list: () => api('/routes'),
  get: (id) => api(`/routes/${id}`),
  remove: (id) => api(`/routes/${id}`, { method: 'DELETE' }),
  clear: () => api('/routes', { method: 'DELETE' }),
  stats: () => api('/routes/stats/summary'),
};
