document.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser();
  if (!user) {
    showToast('Please log in to view dashboard');
    setTimeout(() => {
      window.location.href = '../index.html';
    }, 1200);
    return;
  }

  const nameEl = document.getElementById('dashUserName');
  if (nameEl) nameEl.textContent = user.name || user.email;

  renderDashboard(user.email);
});

function renderDashboard(email) {
  const history = loadHistory(email);
  const totalSpent = getTotalSpent(email);
  const totalKm = getTotalKm(email);
  const runCount = history.length;

  const spentEl = document.getElementById('totalSpent');
  const kmEl = document.getElementById('totalKm');
  const runsEl = document.getElementById('totalRuns');

  if (spentEl) spentEl.textContent = '₹' + formatNum(totalSpent, 0);
  if (kmEl) kmEl.textContent = formatNum(totalKm, 1) + ' km';
  if (runsEl) runsEl.textContent = String(runCount);

  const tbody = document.getElementById('historyBody');
  const empty = document.getElementById('historyEmpty');

  if (!tbody) return;

  if (history.length === 0) {
    tbody.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }

  if (empty) empty.style.display = 'none';

  tbody.innerHTML = history
    .map((item) => {
      const date = new Date(item.date);
      const dateStr =
        date.toLocaleDateString() +
        ' ' +
        date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      return `
        <tr>
          <td>${escapeHtml(dateStr)}</td>
          <td>${item.stopCount}</td>
          <td>${formatNum(item.totalKm, 1)} km</td>
          <td>${formatNum(item.fuelLitres, 2)} L</td>
          <td>₹${formatNum(item.fuelCost, 0)}</td>
          <td title="${escapeAttr(item.stopNames)}">${escapeHtml(
            truncate(item.stopNames, 40)
          )}</td>
        </tr>
      `;
    })
    .join('');
}

function truncate(str, max) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) + '…' : str;
}

function clearHistory() {
  const user = getCurrentUser();
  if (!user) return;
  if (!confirm('Clear all route history? This cannot be undone.')) return;

  saveHistory(user.email, []);
  renderDashboard(user.email);
  showToast('History cleared');
}
