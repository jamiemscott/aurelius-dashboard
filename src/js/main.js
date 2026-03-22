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
  if (document.getElementById('doc-list'))          buildDocumentsPage();
  if (document.getElementById('details-hero'))      buildDetailsPage();
  if (document.getElementById('contact-hero'))      buildContactPage();
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

  if (document.getElementById('add-funds-form')) renderAddFundsPage();

  // Reset Add Fund drawer form to idle each time it is re-opened
  const addFundDrawer = document.getElementById('add-fund-drawer');
  if (addFundDrawer) {
    addFundDrawer.addEventListener('toggle', e => {
      if (e.newState === 'open') renderAddFundForm();
    });
  }

  // Account menu — keep aria-expanded in sync with popover open/close state
  const userMenuPopover = document.getElementById('user-menu');
  const userMenuBtn = document.querySelector('[aria-controls="user-menu"]');
  if (userMenuPopover && userMenuBtn) {
    userMenuPopover.addEventListener('toggle', e => {
      userMenuBtn.setAttribute('aria-expanded', String(e.newState === 'open'));
    });
  }

  // Theme live region — announces the outcome to screen readers
  document.querySelector('.theme-checkbox')?.addEventListener('change', e => {
    const live = document.querySelector('.theme-live');
    if (live) live.textContent = e.target.checked ? 'Light mode' : 'Dark mode';
  });

  // ── NOTIFICATIONS PANEL ─────────────────────────────────────
  const notifPanel = document.getElementById('notif-panel');
  const notifBtn   = document.getElementById('notif-btn');
  const notifList  = document.getElementById('notif-list');
  const notifCount = document.getElementById('notif-count');
  const markAllBtn = document.getElementById('notif-mark-all');

  function syncNotifBadge() {
    const n = notifList ? notifList.querySelectorAll('[data-unread]').length : 0;
    if (notifCount) notifCount.textContent = n > 0 ? `${n} unread` : '';
    if (notifBtn) {
      notifBtn.setAttribute('aria-label', n > 0 ? `Notifications, ${n} unread` : 'Notifications');
      notifBtn.classList.toggle('has-no-unread', n === 0);
    }
  }

  if (notifPanel && notifBtn) {
    notifPanel.addEventListener('toggle', e => {
      notifBtn.setAttribute('aria-expanded', String(e.newState === 'open'));
    });
  }

  if (notifList) {
    notifList.addEventListener('click', e => {
      const dismiss = e.target.closest('.np-dismiss');
      if (dismiss) {
        dismiss.closest('.np-item')?.remove();
        syncNotifBadge();
        return;
      }
      const btn = e.target.closest('.np-item-btn');
      if (btn) {
        const item = btn.closest('.np-item');
        if (item?.hasAttribute('data-unread')) {
          item.removeAttribute('data-unread');
          syncNotifBadge();
        }
      }
    });
  }

  if (markAllBtn) {
    markAllBtn.addEventListener('click', () => {
      notifList?.querySelectorAll('[data-unread]').forEach(el => el.removeAttribute('data-unread'));
      syncNotifBadge();
    });
  }

  initChatbot();
});
