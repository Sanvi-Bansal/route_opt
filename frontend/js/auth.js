const SESSION_KEY = 'routeopt_session';

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
  setToken(null);
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
    toggleText.textContent = isLogin ? "Don't have an account?" : 'Already have an account?';
  }
  if (toggleBtn) toggleBtn.textContent = isLogin ? 'Sign up' : 'Log in';
  if (err) err.style.display = 'none';
}

async function handleAuth(event) {
  event.preventDefault();
  const emailInput = document.getElementById('authEmail');
  const passwordInput = document.getElementById('authPassword');
  const nameInput = document.getElementById('authName');
  const errEl = document.getElementById('authError');

  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;
  const name = nameInput ? nameInput.value.trim() : '';

  if (!email || !password) {
    errEl.textContent = 'Email and password are required.';
    errEl.style.display = 'block';
    return false;
  }

  try {
    if (authMode === 'signup') {
      if (!name) {
        errEl.textContent = 'Please enter your name.';
        errEl.style.display = 'block';
        return false;
      }
      if (password.length < 4) {
        errEl.textContent = 'Password must be at least 4 characters.';
        errEl.style.display = 'block';
        return false;
      }
      const data = await AuthAPI.register(name, email, password);
      setToken(data.token);
      setSession(data.user);
      closeAuth();
      showToast('Account created. Welcome!', 'success');
      updateNavForUser(data.user);
    } else {
      const data = await AuthAPI.login(email, password);
      setToken(data.token);
      setSession(data.user);
      closeAuth();
      showToast('Welcome back, ' + data.user.name + '!', 'success');
      updateNavForUser(data.user);
    }
  } catch (err) {
    errEl.textContent = err.message || 'Authentication failed';
    errEl.style.display = 'block';
  }
  return false;
}

function logout() {
  clearSession();
  showToast('Logged out');
  updateNavForUser(null);
  const path = window.location.pathname;
  if (path.includes('dashboard') || path.includes('optimizer')) {
    window.location.href = '../index.html';
  }
}

function updateNavForUser(user) {
  const btnLogin = document.getElementById('btnLogin');
  const btnSignup = document.getElementById('btnSignup');
  const btnLogout = document.getElementById('btnLogout');
  const userLabel = document.getElementById('navUserLabel');

  if (user) {
    if (btnLogin) btnLogin.style.display = 'none';
    if (btnSignup) btnSignup.style.display = 'none';
    if (btnLogout) btnLogout.style.display = 'inline-flex';
    if (userLabel) {
      userLabel.style.display = 'inline';
      userLabel.textContent = user.name || user.email;
    }
  } else {
    if (btnLogin) btnLogin.style.display = 'inline-flex';
    if (btnSignup) btnSignup.style.display = 'inline-flex';
    if (btnLogout) btnLogout.style.display = 'none';
    if (userLabel) userLabel.style.display = 'none';
  }
}

function initAuth() {
  const user = getCurrentUser();
  updateNavForUser(user);
  const overlay = document.getElementById('authModal');
  if (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeAuth();
    });
  }
}

document.addEventListener('DOMContentLoaded', initAuth);
