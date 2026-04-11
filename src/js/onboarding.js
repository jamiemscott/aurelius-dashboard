/**
 * Aurelius Onboarding — State machine & screen controller
 *
 * Exposes:
 *   S           — shared mutable state object
 *   goTo(id)    — transition to a screen by ID
 *   completeStep(from, to, title, sub) — show sol overlay then transition
 */

// ── Shared state ────────────────────────────────────────────────────────────
export const S = {
  lifeStage: 0,
  risk:       2,
  swipe:      [],
  rank:       [],
  knowledge:  [],
  amount:     3,
};

// ── Screen transition ────────────────────────────────────────────────────────
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function goTo(id) {
  const current = document.querySelector('.ob-screen--active');
  const next    = document.getElementById(id);
  if (!next || current === next) return;

  if (prefersReducedMotion) {
    current.classList.remove('ob-screen--active');
    current.hidden = true;
    next.hidden = false;
    next.classList.add('ob-screen--active');
    _focusScreen(next);
    _announce(next.getAttribute('aria-label') || '');
    return;
  }

  current.classList.add('ob-screen--out');

  setTimeout(() => {
    current.classList.remove('ob-screen--active', 'ob-screen--out');
    current.hidden = true;

    next.hidden = false;
    next.classList.add('ob-screen--active', 'ob-screen--in');

    setTimeout(() => next.classList.remove('ob-screen--in'), 420);

    _tickProgress(id);
    _focusScreen(next);
    _announce(next.getAttribute('aria-label') || '');
  }, 260);
}

function _focusScreen(screen) {
  const target = screen.querySelector('h1, h2, [tabindex="-1"]');
  if (target) {
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: false });
  }
}

function _announce(label) {
  const live = document.getElementById('ob-live');
  if (live) {
    live.textContent = '';
    requestAnimationFrame(() => { live.textContent = label; });
  }
}

// ── Progress bar update ──────────────────────────────────────────────────────
const PROGRESS_MAP = {
  's-dial':   { id: 'pf1', pct: 16  },
  's-risk':   { id: 'pf2', pct: 33  },
  's-swipe':  { id: 'pf3', pct: 50  },
  's-rank':   { id: 'pf4', pct: 66  },
  's-know':   { id: 'pf5', pct: 83  },
  's-amount': { id: 'pf6', pct: 100 },
};

function _tickProgress(screenId) {
  const entry = PROGRESS_MAP[screenId];
  if (!entry) return;
  setTimeout(() => {
    const el = document.getElementById(entry.id);
    if (el) el.style.setProperty('--ob-pct', entry.pct + '%');
  }, 100);
}

// ── Step-completion overlay ──────────────────────────────────────────────────
export function completeStep(from, to, title, sub) {
  const screen = document.getElementById(from);
  if (!screen) { goTo(to); return; }

  const eyebrow = screen.querySelector('.ob-eyebrow');
  const color   = eyebrow ? getComputedStyle(eyebrow).color : 'var(--gold)';

  const sol = document.createElement('div');
  sol.className = 'ob-sol';
  sol.setAttribute('role', 'status');
  sol.setAttribute('aria-live', 'assertive');
  sol.innerHTML = `
    <div class="ob-sol__icon" style="border: 1px solid ${color}55">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <circle cx="14" cy="14" r="11" stroke="${color}" stroke-width="1"/>
        <path d="M8 14l4 4 8-8" stroke="${color}" stroke-width="1.5"
              stroke-linecap="round" stroke-linejoin="round"
              stroke-dasharray="0 24"
              style="animation: ob-check-draw 0.4s 0.1s ease forwards"/>
      </svg>
    </div>
    <div class="ob-sol__title">${title}</div>
    <div class="ob-sol__sub">${sub}</div>
  `;

  screen.style.position = 'relative';
  screen.appendChild(sol);

  setTimeout(() => {
    sol.remove();
    goTo(to);
  }, 1350);
}

// ── Wire up data-* button attributes ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.body.addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;

    // data-goto="screen-id"
    const goto = btn.dataset.goto;
    if (goto) { goTo(goto); return; }

    // data-complete-from / to / title / sub
    const from = btn.dataset.completeFrom;
    if (from) {
      completeStep(
        from,
        btn.dataset.completeTo,
        btn.dataset.completeTitle,
        btn.dataset.completeSub,
      );
      return;
    }

    // Complete assessment — handled by results.js which registers itself
    if (btn.id === 'btn-complete-assessment') {
      btn.dispatchEvent(new CustomEvent('ob:complete', { bubbles: true }));
    }
  });
});
