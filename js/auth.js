const USERS_KEY = 'routeopt_users';
const SESSION_KEY = 'routeopt_session';

function getUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getCurrentUser() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

let authMode = 'login';

function openAuth(mode) {
  authMode = mode || 'login';
  const overlay = document.getElementById('authModal');
  if (!overlay) return;
  overlay.classList.add('open');
  const err = document.getElementById('authError');
  if (err) err.style.display = 'none';
  updateAuthUI();
}

function closeAuth() {
  const overlay = document.getElementById('authModal');
  if (overlay) overlay.classList.remove('open');
}

function toggleAuthMode() {
  authMode = authMode === 'login' ? 'signup' : 'login';
  updateAuthUI();
}

function updateAuthUI() {
  const isLogin = authMode === 'login';
  const title = document.getElementById('authTitle');
  const sub = document.getElementById('authSub');
  const submit = document.getElementById('authSubmit');
  const nameGroup = document.getElementById('nameGroup');
  const toggleText = document.getElementById('authToggleText');
  const toggleBtn = document.getElementById('authToggleBtn');
  const err = document.getElementById('authError');

  if (title) title.textContent = isLogin ? 'Log in' : 'Create account';
  if (sub) {
    sub.textContent = isLogin
      ? 'Welcome back. Access your dashboard and optimizer.'
      : 'Sign up to save routes and track fuel spending.';
  }
  if (submit) submit.textContent = isLogin ? 'Log in' : 'Sign up';
  if (nameGroup) nameGroup.style.display = isLogin ? 'none' : 'block';
  if (toggleText) {
    toggleText.textContent = isLogin
      ? "Don't have an account?"
      : 'Already have an account?';
  }
  if (toggleBtn) toggleBtn.textContent = isLogin ? 'Sign up' : 'Log in';
  if (err) err.style.display = 'none';
}

function handleAuth(event) {
  event.preventDefault(); // Form event + preventDefault (syllabus)

  const emailInput = document.getElementById('authEmail');
  const passwordInput = document.getElementById('authPassword');
  const nameInput = document.getElementById('authName');
  const errEl = document.getElementById('authError');

  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;
  const name = nameInput ? nameInput.value.trim() : '';

  const users = getUsers();}