/**
 * Aurelius Style Guide — Interactive behaviours
 *
 * 1. Copy-to-clipboard on .sg-copy-btn
 * 2. Scroll-spy — highlights sidebar nav item matching the visible section
 * 3. Prism.js highlight trigger (called after shell injection)
 * 4. Icons page — colour/size picker, search, Copy SVG buttons
 */

document.addEventListener('DOMContentLoaded', () => {
  initCopyButtons();
  initScrollSpy();
  initIconLibrary();
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


// ── 4. Icons page ───────────────────────────────────────────────────────────
// The colour and size picker retints the previews and repoints every PNG
// link and the zip; search filters the cards; [data-copy] copies SVG code.
function initIconLibrary() {
  const toolbar = document.getElementById('sg-icon-toolbar');
  if (!toolbar) return;
  const root = document.documentElement;
  const DARK_BG = { gold: true, ivory: true };
  const state = { colour: 'gold', size: '48' };

  function apply() {
    const btn = toolbar.querySelector('[data-colour="' + state.colour + '"]');
    const label = btn.textContent.trim();
    root.style.setProperty('--sg-icon-colour', btn.dataset.hex);
    root.style.setProperty('--sg-icon-bg', DARK_BG[state.colour] ? '#0b0d10' : '#ffffff');
    document.querySelectorAll('[data-png]').forEach(a => {
      a.href = '../src/images/icons/png/' + state.colour + '/' + state.size + '/' + a.dataset.png + '.png';
    });
    const zip = document.getElementById('sg-icon-zip');
    zip.href = '../src/images/icons/zip/aurelius-icons-' + state.colour + '-' + state.size + '.zip';
    zip.textContent = 'All PNGs · ' + label + ' · ' + state.size + 'px (zip)';
    const note = document.getElementById('sg-icon-note');
    note.textContent = label + ' ' + btn.dataset.hex + ' · ' + btn.dataset.note;
  }

  function pick(group, attr) {
    group.addEventListener('click', e => {
      const btn = e.target.closest('[data-' + attr + ']');
      if (!btn) return;
      state[attr] = btn.dataset[attr];
      group.querySelectorAll('[data-' + attr + ']').forEach(b => {
        const on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      apply();
    });
  }
  pick(document.getElementById('sg-icon-colours'), 'colour');
  pick(document.getElementById('sg-icon-sizes'), 'size');

  const search = document.getElementById('sg-icon-search');
  search.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase();
    let shown = 0;
    document.querySelectorAll('.sg-icon-grid').forEach(grid => {
      let inGrid = 0;
      grid.querySelectorAll('[data-icon]').forEach(card => {
        const hit = !q || card.dataset.icon.indexOf(q) !== -1;
        card.hidden = !hit;
        if (hit) inGrid++;
      });
      grid.closest('.sg-section').hidden = !inGrid;
      shown += inGrid;
    });
    document.getElementById('sg-icon-empty').hidden = shown > 0;
  });

  document.body.addEventListener('click', e => {
    const btn = e.target.closest('[data-copy]');
    if (!btn) return;
    navigator.clipboard.writeText(btn.dataset.copy).then(() => {
      const original = btn.textContent;
      btn.classList.add('is-copied');
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.classList.remove('is-copied'); btn.textContent = original; }, 1500);
    }).catch(() => {});
  });

  apply();
}
