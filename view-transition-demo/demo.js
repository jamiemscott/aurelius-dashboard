/**
 * View Transition Demo — minimal page script
 * Handles theme persistence and the ob-cta card.
 * Does not require data.js / charts.js / main.js.
 */
(function () {
  'use strict';

  /* ── Theme persistence ────────────────────────────────────────── */
  const checkbox = document.getElementById('theme-checkbox');
  const live     = document.querySelector('.theme-live');
  if (!checkbox) return;

  const saved = localStorage.getItem('aurelius-theme');
  if (saved === 'light') {
    document.documentElement.style.colorScheme = 'light';
    checkbox.checked = true;
  }

  checkbox.addEventListener('change', () => {
    const isLight = checkbox.checked;
    document.documentElement.style.colorScheme = isLight ? 'light' : 'dark';
    localStorage.setItem('aurelius-theme', isLight ? 'light' : 'dark');
    if (live) live.textContent = isLight ? 'Light mode' : 'Dark mode';
  });

  /* ── ob-cta card ──────────────────────────────────────────────── */
  const card      = document.getElementById('ob-cta');
  const dismissEl = document.getElementById('ob-cta-dismiss');
  const titleEl   = document.getElementById('ob-cta-title');
  const subEl     = document.getElementById('ob-cta-sub');
  const btnEl     = document.getElementById('ob-cta-btn');

  if (card && !localStorage.getItem('aurelius-ob-cta-hidden')) {
    if (localStorage.getItem('aurelius-ob-complete')) {
      if (titleEl) titleEl.textContent = 'Retake Assessment';
      if (subEl)   subEl.textContent   = 'Re-evaluate your investment type';
      if (btnEl)   btnEl.textContent   = 'Retake';
    }
    card.removeAttribute('hidden');
    dismissEl?.addEventListener('click', () => {
      localStorage.setItem('aurelius-ob-cta-hidden', '1');
      card.setAttribute('hidden', '');
    });
  }
}());
