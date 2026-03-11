/* ─── THEME TOGGLE ──────────────────────────────────────────── */

function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  document.getElementById('theme-icon').textContent = isDark ? '☀️' : '🌙';
  document.getElementById('theme-label').textContent = isDark ? 'Light' : 'Dark';
}

/* ─── RANGE PILLS ────────────────────────────────────────────── */

function setRange(el) {
  el.closest('.range-pills').querySelectorAll('.range-pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
}
