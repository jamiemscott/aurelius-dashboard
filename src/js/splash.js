/**
 * Aurelius Welcome Splash — theme toggle + scroll progress fallback
 *
 * Theme toggle mirrors login.js: persist the choice in localStorage so it
 * survives navigation to/from login and onboarding. Scroll-reveal on
 * sections is handled entirely by CSS progressive enhancement (see
 * .splash-reveal in splash.css) and needs no JS.
 */
(function () {
  'use strict';

  // ── Theme toggle ──────────────────────────────────────────────────────────
  var cb = document.getElementById('theme-checkbox');
  if (cb) {
    var stored  = localStorage.getItem('aurelius-theme');
    var isLight = stored
      ? stored === 'light'
      : window.matchMedia('(prefers-color-scheme: light)').matches;

    cb.checked = isLight;

    cb.addEventListener('change', function () {
      var light = cb.checked;
      localStorage.setItem('aurelius-theme', light ? 'light' : 'dark');

      var live = document.querySelector('.theme-live');
      if (live) live.textContent = light ? 'Light mode' : 'Dark mode';
    });
  }

  // ── Scroll progress bar — fallback for browsers without
  //    animation-timeline: scroll() support ────────────────────────────────
  if (!CSS.supports('animation-timeline', 'scroll()')) {
    var root = document.documentElement;

    var updateProgress = function () {
      var scrollable = root.scrollHeight - window.innerHeight;
      var pct = scrollable > 0 ? window.scrollY / scrollable : 0;
      root.style.setProperty('--splash-scroll-pct', String(Math.min(1, Math.max(0, pct))));
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    updateProgress();
  }
}());
