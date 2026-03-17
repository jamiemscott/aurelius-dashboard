/* ─── INIT / ENTRY POINT ────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  buildPerfChart('perf-chart', 600, 200);
  updateHistoryView('6M');
  buildDonut('small-donut', allocationData, 34, 12);
  buildLegend('small-legend', allocationData.slice(0, 6));
  buildDonut('big-donut', allocationData, 38, 14);
  buildProgressList('alloc-progress-list', allocationData, 842340);
  buildProgressList('asset-class-list', assetClassData, 842340);
  buildProgressList('currency-list', currencyData, 842340);
  buildTopHoldings();
  buildActivityFeed();
  buildInvestmentsTable();
  buildDocumentsPage();
  buildDetailsPage();
  buildContactPage();
  renderAdviserForm();

  // Reset drawer form to idle each time it is re-opened
  const advDrawer = document.getElementById('adviser-drawer');
  if (advDrawer) {
    advDrawer.addEventListener('toggle', e => {
      if (e.newState === 'open') renderAdviserForm();
    });
  }

  renderAddInvestmentForm();

  // Reset Add Investment drawer form to idle each time it is re-opened
  const addInvDrawer = document.getElementById('add-investment-drawer');
  if (addInvDrawer) {
    addInvDrawer.addEventListener('toggle', e => {
      if (e.newState === 'open') renderAddInvestmentForm();
    });
  }

  renderAddFundForm();

  // Reset Add Fund drawer form to idle each time it is re-opened
  const addFundDrawer = document.getElementById('add-fund-drawer');
  if (addFundDrawer) {
    addFundDrawer.addEventListener('toggle', e => {
      if (e.newState === 'open') renderAddFundForm();
    });
  }

  // Theme live region — announces the outcome to screen readers
  document.querySelector('.theme-checkbox')?.addEventListener('change', e => {
    const live = document.querySelector('.theme-live');
    if (live) live.textContent = e.target.checked ? 'Light mode' : 'Dark mode';
  });

  initChatbot();
});
