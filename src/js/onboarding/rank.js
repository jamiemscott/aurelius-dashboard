/**
 * Aurelius Onboarding — Drag-to-rank priorities (Earth · Values)
 * HTML5 drag API for pointer, keyboard reorder (Space/Arrow/Enter/Esc)
 */

import { S } from '../onboarding.js';

document.addEventListener('DOMContentLoaded', () => {
  const list     = document.getElementById('rank-list');
  const announce = document.getElementById('rank-announce');

  if (!list) return;

  // ── HTML5 Drag & Drop ───────────────────────────────────────────────────
  let draggingEl = null;
  let overEl     = null;

  list.addEventListener('dragstart', e => {
    draggingEl = e.target.closest('.ob-rank-item');
    if (!draggingEl) return;
    draggingEl.classList.add('ob-rank-item--dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', ''); // required for Firefox
  });

  list.addEventListener('dragend', () => {
    if (!draggingEl) return;
    draggingEl.classList.remove('ob-rank-item--dragging');
    list.querySelectorAll('.ob-rank-item').forEach(i =>
      i.classList.remove('ob-rank-item--drop-top', 'ob-rank-item--drop-bottom')
    );
    _renumber();
    _saveRank();
    draggingEl = null;
    overEl     = null;
  });

  list.addEventListener('dragover', e => {
    e.preventDefault();
    const target = e.target.closest('.ob-rank-item');
    if (!target || target === draggingEl) return;

    list.querySelectorAll('.ob-rank-item').forEach(i =>
      i.classList.remove('ob-rank-item--drop-top', 'ob-rank-item--drop-bottom')
    );

    const mid = target.getBoundingClientRect().top + target.offsetHeight / 2;
    const before = e.clientY < mid;
    target.classList.add(before ? 'ob-rank-item--drop-top' : 'ob-rank-item--drop-bottom');
    overEl = { el: target, before };
  });

  list.addEventListener('drop', e => {
    e.preventDefault();
    if (!draggingEl || !overEl) return;
    const { el, before } = overEl;
    list.insertBefore(draggingEl, before ? el : el.nextSibling);
  });

  // ── Keyboard Reorder ────────────────────────────────────────────────────
  // Space/Enter = pick up / drop, Arrow = move, Escape = cancel
  let grabbed    = null;
  let grabOrigin = null; // original position for cancel

  list.addEventListener('keydown', e => {
    const item = e.target.closest('.ob-rank-item');
    if (!item) return;

    if (e.key === ' ' || (e.key === 'Enter' && !grabbed)) {
      e.preventDefault();
      if (!grabbed) {
        // Pick up
        grabbed    = item;
        grabOrigin = [...list.children].indexOf(item);
        item.classList.add('ob-rank-item--dragging');
        _announceKbd(item, 'picked up');
      } else {
        // Drop
        grabbed.classList.remove('ob-rank-item--dragging');
        _renumber();
        _saveRank();
        const pos = [...list.children].indexOf(grabbed) + 1;
        _announceKbd(grabbed, `dropped at position ${pos}`);
        grabbed = null;
      }
      return;
    }

    if (!grabbed) return;

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = grabbed.previousElementSibling;
      if (prev) { list.insertBefore(grabbed, prev); }
      _announceKbd(grabbed, `moved to position ${[...list.children].indexOf(grabbed) + 1}`);
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = grabbed.nextElementSibling;
      if (next) { list.insertBefore(grabbed, next.nextSibling); }
      _announceKbd(grabbed, `moved to position ${[...list.children].indexOf(grabbed) + 1}`);
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      // Return to original position
      const children = [...list.children];
      const current  = children.indexOf(grabbed);
      if (current !== grabOrigin) {
        const ref = children[grabOrigin] || null;
        list.insertBefore(grabbed, ref);
      }
      grabbed.classList.remove('ob-rank-item--dragging');
      _announceKbd(grabbed, 'cancelled — returned to original position');
      grabbed = null;
    }
  });

  // ── Helpers ──────────────────────────────────────────────────────────────
  function _renumber() {
    list.querySelectorAll('.ob-rank-num').forEach((num, i) => {
      num.textContent = i + 1;
    });
  }

  function _saveRank() {
    S.rank = [...list.querySelectorAll('.ob-rank-text')].map(el => el.textContent.trim());
  }

  function _announceKbd(item, action) {
    const text = item.querySelector('.ob-rank-text')?.textContent?.trim() || 'Item';
    if (announce) {
      announce.textContent = '';
      requestAnimationFrame(() => {
        announce.textContent = `${text} ${action}`;
      });
    }
  }

  // Initial save
  _saveRank();
});
