const showToast = (message, type = '') => {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = 'toast show' + (type === 'success' ? ' success' : '');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
};


const escapeHtml = (str) => {
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
};