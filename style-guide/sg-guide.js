/**
 * Aurelius Style Guide — Interactive behaviours
 *
 * 1. Copy-to-clipboard on .sg-copy-btn
 * 2. Scroll-spy — highlights sidebar nav item matching the visible section
 * 3. Prism.js highlight trigger (called after shell injection)
 */

document.addEventListener('DOMContentLoaded', () => {
  initCopyButtons();
  initScrollSpy();
});

// ── 1. Copy to clipboard ────────────────────────────────────────────────────
function initCopyButtons() {
  document.body.addEventListener('click', e => {
    const btn = e.target.closest('.sg-copy-btn');
    if (!btn) return;

    const codeEl = btn.closest('.sg-code')?.querySelector('code');
    if (!codeEl) return;

    // Get raw text — strip Prism's <span> wrappers
    const raw = codeEl.textContent || '';

    navigator.clipboard.writeText(raw).then(() => {
      const label = btn.querySelector('span');
      const original = label ? label.textContent : 'Copy';

      btn.classList.add('sg-copy-btn--copied');
      if (label) label.textContent = 'Copied!';

      setTimeout(() => {
        btn.classList.remove('sg-copy-btn--copied');
        if (label) label.textContent = original;
      }, 1500);
    }).catch(() => {
      // Clipboard API unavailable — fall back silently
    });
  });
}

// ── 2. Scroll-spy ───────────────────────────────────────────────────────────
function initScrollSpy() {
  const sections = document.querySelectorAll('.sg-section[id]');
  if (!sections.length) return;

  // Build a map of section id → sidebar nav item
  // Sidebar nav items are <a href="#id"> anchors within the aside
  function getNavItem(id) {
    return document.querySelector(`.site-sidebar a[href="#${id}"]`);
  }

  let current = null;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (current) current.classList.remove('is-active');
        current = getNavItem(entry.target.id);
        if (current) current.classList.add('is-active');
      }
    });
  }, {
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0,
  });

  sections.forEach(s => observer.observe(s));
}

// ── 3. Re-highlight after dynamic injection ─────────────────────────────────
// Prism auto-highlights on DOMContentLoaded, but shell is injected after that.
// We call Prism.highlightAll() after a microtask to catch any late-rendered code.
Promise.resolve().then(() => {
  if (window.Prism) window.Prism.highlightAll();
});
