/**
 * Aurelius Onboarding — Risk spectrum slider
 * Custom visual thumb synced bidirectionally with a native <input type="range">
 */

import { S } from '../onboarding.js';

const RISK = [
  {
    n: 'Capital Preserver',
    d: 'Safety above all returns. You require certainty that invested capital will be protected, even at the cost of growth.',
  },
  {
    n: 'Cautious Investor',
    d: 'Modest, reliable returns with low volatility. A 10% drawdown causes genuine concern and prompts defensive repositioning.',
  },
  {
    n: 'Balanced Investor',
    d: 'Markets fall 20%. You hold your position and rebalance methodically — volatility is an accepted condition of long-term growth.',
  },
  {
    n: 'Growth Investor',
    d: 'A market correction is a buying opportunity. Long-term capital appreciation outweighs short-term fluctuation.',
  },
  {
    n: 'Aggressive Investor',
    d: 'Maximum long-term growth. You seek high-conviction, high-volatility positions with a multi-decade investment horizon.',
  },
];

document.addEventListener('DOMContentLoaded', () => {
  const wrap        = document.getElementById('risk-wrap');
  const nativeRange = document.getElementById('risk-range-native');
  const thumb       = document.getElementById('risk-thumb');
  const nameEl      = document.getElementById('risk-name');
  const descEl      = document.getElementById('risk-desc');

  if (!wrap || !nativeRange) return;

  function updateVisuals(pct) {
    const trackW = wrap.clientWidth;
    const thumbW = 52;
    const left   = pct * (trackW - thumbW) + thumbW / 2;
    thumb.style.left = left + 'px';
  }

  function setRisk(index) {
    const i = Math.max(0, Math.min(RISK.length - 1, index));
    S.risk = i;
    nameEl.textContent = RISK[i].n;
    descEl.textContent = RISK[i].d;
    const pct = i / (RISK.length - 1);
    updateVisuals(pct);
    nativeRange.value = i;
  }

  // Sync from native range (handles keyboard + AT natively)
  nativeRange.addEventListener('input', () => {
    setRisk(+nativeRange.value);
  });

  // Custom drag on visual thumb
  let dragging = false;

  function getClientX(e) { return e.touches ? e.touches[0].clientX : e.clientX; }

  thumb.addEventListener('mousedown',  ()  => { dragging = true; });
  thumb.addEventListener('touchstart', (e) => { dragging = true; e.preventDefault(); }, { passive: false });

  document.addEventListener('mouseup',  () => { dragging = false; });
  document.addEventListener('touchend', () => { dragging = false; });

  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const rect = wrap.getBoundingClientRect();
    const pct  = Math.max(0, Math.min(1, (getClientX(e) - rect.left - 26) / (rect.width - 52)));
    setRisk(Math.round(pct * (RISK.length - 1)));
  });

  document.addEventListener('touchmove', e => {
    if (!dragging) return;
    e.preventDefault();
    const rect = wrap.getBoundingClientRect();
    const pct  = Math.max(0, Math.min(1, (getClientX(e) - rect.left - 26) / (rect.width - 52)));
    setRisk(Math.round(pct * (RISK.length - 1)));
  }, { passive: false });

  // Click anywhere on track
  wrap.addEventListener('click', e => {
    if (e.target === thumb || thumb.contains(e.target)) return;
    const rect = wrap.getBoundingClientRect();
    const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setRisk(Math.round(pct * (RISK.length - 1)));
  });

  // Initialise at Balanced (index 2)
  setRisk(2);

  // Re-position thumb on resize
  window.addEventListener('resize', () => {
    updateVisuals(S.risk / (RISK.length - 1));
  });
});

export { RISK };
