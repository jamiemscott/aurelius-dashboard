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
    if (el) el.classList.remove('active');
  });
  const target = document.getElementById(pageMap[key]);
  if (target) target.classList.add('active');

  // Sync tab buttons in topbar
  const keys = ['overview', 'history', 'allocation', 'investments', 'cgt'];
  document.querySelectorAll('.tab-btn').forEach((btn, i) => {
    btn.classList.toggle('active', keys[i] === key);
  });

  // Sync left sidebar nav — match by the key embedded in each button's onclick
  document.querySelectorAll('.nav-item').forEach(btn => {
    const oc = btn.getAttribute('onclick') || '';
    btn.classList.toggle('active', oc.includes(`'${key}'`));
  });
}

function setActiveNav(el) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  el.classList.add('active');
}

/* ─── THEME TOGGLE ──────────────────────────────────────────── */

function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  document.getElementById('theme-icon').textContent = isDark ? '☀️' : '🌙';
  document.getElementById('theme-label').textContent = isDark ? 'Light' : 'Dark';
  const umHint = document.getElementById('um-theme-hint');
  if (umHint) umHint.textContent = isDark ? 'Light' : 'Dark';
}

/* ─── RANGE PILLS ────────────────────────────────────────────── */

function setRange(el) {
  el.closest('.range-pills').querySelectorAll('.range-pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
}
