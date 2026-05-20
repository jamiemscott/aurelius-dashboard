/* ─── NAVIGATION ────────────────────────────────────────────── */

const pageMap = {
  overview:    'page-overview',
  history:     'page-history',
  allocation:  'page-allocation',
  investments: 'page-investments',
  cgt:         'page-cgt',
  documents:   'page-documents',
  details:     'page-details',
  contact:     'page-contact',
};

function showPage(key, triggerEl) {
  Object.values(pageMap).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('is-active');
  });
  const target = document.getElementById(pageMap[key]);
  if (target) target.classList.add('is-active');

  // Sync tab buttons in topbar
  const keys = ['overview', 'history', 'allocation', 'investments', 'cgt'];
  document.querySelectorAll('.tab-btn').forEach((btn, i) => {
    btn.classList.toggle('is-active', keys[i] === key);
  });

  // Sync left sidebar nav — match by the key embedded in each button's onclick
  document.querySelectorAll('.nav-item').forEach(btn => {
    const oc = btn.getAttribute('onclick') || '';
    btn.classList.toggle('is-active', oc.includes(`'${key}'`));
  });
}

function setActiveNav(el) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('is-active'));
  el.classList.add('is-active');
}


/* ─── SIGN OUT ───────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {

  // Sign Out → login page
  document.querySelectorAll('.um-item--danger').forEach(btn => {
    btn.addEventListener('click', () => {
      window.location.href = '/login/';
    });
  });

  // Notifications button in user menu → close menu, open notifications panel
  document.querySelectorAll('.um-item').forEach(btn => {
    if (btn.querySelector('.um-badge')) {
      btn.addEventListener('click', () => {
        const userMenu = document.getElementById('user-menu');
        if (userMenu?.hidePopover) userMenu.hidePopover();
        const notifPanel = document.getElementById('notif-panel');
        if (notifPanel?.showPopover) notifPanel.showPopover();
      });
    }
  });

  // Help & Support → /help/
  document.querySelectorAll('.um-item').forEach(btn => {
    if (btn.textContent.trim().startsWith('Help')) {
      btn.addEventListener('click', () => {
        const userMenu = document.getElementById('user-menu');
        if (userMenu?.hidePopover) userMenu.hidePopover();
        window.location.href = '/help/';
      });
    }
  });

  // Download Statements → /documents/
  document.querySelectorAll('.um-item').forEach(btn => {
    if (btn.textContent.trim().startsWith('Download Statements')) {
      btn.addEventListener('click', () => {
        const userMenu = document.getElementById('user-menu');
        if (userMenu?.hidePopover) userMenu.hidePopover();
        window.location.href = '/documents/';
      });
    }
  });

  // Security & 2FA — inject status pill and link to My Details security tab
  document.querySelectorAll('.um-item').forEach(btn => {
    if (btn.textContent.trim().startsWith('Security')) {
      // Status comes from userData (My Details page) if available, else default to on
      const enabled = (typeof userData !== 'undefined') ? userData.twoFA : true;
      const pill = document.createElement('span');
      pill.className = `um-2fa-pill um-2fa-pill--${enabled ? 'on' : 'off'}`;
      pill.textContent = enabled ? '2FA On' : '2FA Off';
      btn.appendChild(pill);

      btn.addEventListener('click', () => {
        const userMenu = document.getElementById('user-menu');
        if (userMenu?.hidePopover) userMenu.hidePopover();
        window.location.href = '/my-details/#security';
      });
    }
  });

});


/* ─── RANGE PILLS ────────────────────────────────────────────── */

function setRange(el, range) {
  el.closest('.range-pills').querySelectorAll('.range-pill').forEach(p => p.classList.remove('is-active'));
  el.classList.add('is-active');
  if (typeof updateHistoryView === 'function') updateHistoryView(range);
}
