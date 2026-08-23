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

const escapeAttr = (str) => {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};


// Format number with fixed decimals
const formatNum = (n, digits = 1) => {
  return Number(n).toFixed(digits);
};

