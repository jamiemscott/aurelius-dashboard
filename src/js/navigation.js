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


/* ─── RANGE PILLS ────────────────────────────────────────────── */

function setRange(el, range) {
  el.closest('.range-pills').querySelectorAll('.range-pill').forEach(p => p.classList.remove('is-active'));
  el.classList.add('is-active');
  if (typeof updateHistoryView === 'function') updateHistoryView(range);
}
