/**
 * Aurelius Onboarding — Knowledge grid (Metal · Refinement)
 * Tap-to-cycle confidence cards, keyboard accessible
 */

import { S } from '../onboarding.js';

const CONCEPTS = [
  'Equities & Shares',
  'Fixed Income / Bonds',
  'ETFs & Index Funds',
  'Portfolio Diversification',
  'Risk vs Return',
  'Compound Growth',
  'Asset Allocation',
  'Inflation & Real Returns',
];

const LEVELS = ['—', 'Awareness', 'Understanding', 'Proficiency', 'Expertise'];
const COLORS = [
  'var(--border)',
  'var(--el-earth)',
  'var(--el-wood)',
  'var(--el-water)',
  'var(--gold)',
];

document.addEventListener('DOMContentLoaded', () => {
  const grid   = document.getElementById('know-grid');
  const legend = document.getElementById('know-legend');

  if (!grid) return;

  const scores = new Array(CONCEPTS.length).fill(0);

  // Build legend
  const LEGEND_LABELS = ['—', 'Aware', 'Understand', 'Proficient', 'Expert'];
  LEGEND_LABELS.forEach((label, i) => {
    const item = document.createElement('div');
    item.className = 'ob-kleg-item';
    item.innerHTML = `<div class="ob-kleg-dot" style="background:${COLORS[i]}"></div><span>${label}</span>`;
    legend.appendChild(item);
  });

  // Build cards
  CONCEPTS.forEach((concept, i) => {
    const card = document.createElement('button');
    card.className = 'ob-kc';
    card.setAttribute('type', 'button');
    card.setAttribute('aria-label', `${concept} — ${LEVELS[0]}. Press to cycle confidence level.`);
    card.innerHTML = `
      <div class="ob-kc-name">${concept}</div>
      <div class="ob-kpips">
        ${[0,1,2,3,4].map(() => '<div class="ob-kpip"></div>').join('')}
      </div>
      <div class="ob-klbl">—</div>
    `;

    card.addEventListener('click', () => {
      scores[i] = (scores[i] + 1) % 5;
      _updateCard(card, i, scores[i]);
      S.knowledge = scores.slice();
    });

    grid.appendChild(card);
  });

  function _updateCard(card, i, level) {
    const color = COLORS[level];
    card.style.borderColor = level ? color : '';

    const pips = card.querySelectorAll('.ob-kpip');
    pips.forEach((pip, j) => {
      pip.style.background = j < level ? color : 'var(--border)';
    });

    card.querySelector('.ob-klbl').textContent = LEVELS[level];
    card.setAttribute('aria-label', `${CONCEPTS[i]} — ${LEVELS[level]}. Press to cycle confidence level.`);
    card.setAttribute('aria-pressed', level > 0 ? 'true' : 'false');
  }
});
