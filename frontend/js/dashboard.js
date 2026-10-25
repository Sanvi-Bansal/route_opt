document.addEventListener('DOMContentLoaded', async () => {
  const user = getCurrentUser();
  if (!user) {
    showToast('Please log in to view dashboard');
    setTimeout(() => { window.location.href = '../index.html'; }, 1200);
    return;
  }
  if (!getToken()) {
    showToast('Session expired — please log in again');
    clearSession();
    setTimeout(() => { window.location.href = '../index.html'; }, 1200);
    return;
  }

  const nameEl = document.getElementById('dashUserName');
  if (nameEl) nameEl.textContent = user.name || user.email;
  await renderDashboard();
});

async function renderDashboard() {
  let history = [];
  let totalSpent = 0;
  let totalKm = 0;
  let runCount = 0;

  try {
    history = await loadHistoryFromAPI();
    const stats = await RoutesAPI.stats();
    totalSpent = stats.totalSpent || 0;
    totalKm = stats.totalKm || 0;
    runCount = stats.runCount || history.length;
  } catch (e) {
    console.warn(e);
  }

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
          <td title="${escapeAttr(item.stopNames)}">${escapeHtml(truncate(item.stopNames, 40))}</td>
        </tr>`;
    })
    .join('');
}

function truncate(str, max) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) + '…' : str;
}

async function clearHistory() {
  if (!getCurrentUser()) return;
  if (!confirm('Clear all route history? This cannot be undone.')) return;
  try {
    await clearHistoryFromAPI();
    await renderDashboard();
    showToast('History cleared');
  } catch (err) {
    showToast(err.message || 'Failed to clear history');
  }
}
