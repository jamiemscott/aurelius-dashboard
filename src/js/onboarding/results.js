/**
 * Aurelius Onboarding — Results builder
 * Calculates element scores from S state, populates completion screen
 */

import { S, completeStep } from '../onboarding.js';
import { personaliseResults } from './register.js';

document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('ob:complete', buildAndComplete);
});

const STAGES = [
  { n: 'Starting out',     s: 'Student or early career'            },
  { n: 'Early career',     s: 'Building career & life'             },
  { n: 'Established',      s: 'Stable income, forming commitments' },
  { n: 'Peak obligations', s: 'Maximum financial responsibilities'  },
  { n: 'Pre-retirement',   s: 'Consolidating ahead of retirement'  },
  { n: 'Retired',          s: 'Post-career, drawing on wealth'     },
];

const RISK_NAMES = [
  'Capital Preserver',
  'Cautious Investor',
  'Balanced Investor',
  'Growth Investor',
  'Aggressive Investor',
];

const AMOUNTS = [
  { v: '£0',                d: 'No capital available at this time' },
  { v: 'Under £500',        d: 'An initial exploratory position'   },
  { v: '£500 – £2,000',    d: 'A considered starting allocation'  },
  { v: '£2,000 – £10,000', d: 'A meaningful initial allocation'   },
  { v: '£10,000 – £50,000',d: 'A substantive investment mandate'  },
  { v: 'Over £50,000',      d: 'Significant capital to deploy'     },
];

const ELDATA = {
  water: {
    name:  'Water',
    color: 'var(--el-water)',
    desc:  'Adaptive and flow-driven. You move capital decisively when conditions align, guided by instinct calibrated through experience.',
  },
  wood: {
    name:  'Wood',
    color: 'var(--el-wood)',
    desc:  'Growth-oriented and relational. You invest with patience, building positions over time and valuing trusted guidance alongside your own research.',
  },
  fire: {
    name:  'Fire',
    color: 'var(--el-fire)',
    desc:  'Data-driven and conviction-led. You study markets deeply before acting, then commit fully when your thesis is established.',
  },
  earth: {
    name:  'Earth',
    color: 'var(--el-earth)',
    desc:  'Values-anchored and long-horizon. Stability, ethical alignment, and generational wealth preservation define your investment character.',
  },
  metal: {
    name:  'Metal',
    color: 'var(--el-metal)',
    desc:  'Rigorous and governance-focused. You trust regulated frameworks, prefer structured mandates, and prioritise risk-adjusted precision over speculation.',
  },
};

export function buildAndComplete() {
  // Derive scores from state (placeholder calculation — replace with real scoring)
  const scores = {
    water: Math.random() * 0.30 + 0.55,
    wood:  Math.random() * 0.25 + 0.35,
    fire:  Math.random() * 0.25 + 0.30,
    earth: Math.random() * 0.25 + 0.25,
    metal: Math.random() * 0.20 + 0.20,
  };

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const domKey = sorted[0][0];
  const el     = ELDATA[domKey];

  // Dominant element banner
  document.getElementById('dom-accent').style.background     = el.color;
  document.getElementById('dom-el-label').style.color        = el.color;
  document.getElementById('dom-name').textContent            = `${RISK_NAMES[S.risk]} · ${el.name} Type`;
  document.getElementById('dom-desc').textContent            = el.desc;

  // Element bars
  const barsEl = document.getElementById('el-bars');
  barsEl.innerHTML = '';

  sorted.forEach(([key, val]) => {
    const data = ELDATA[key];
    const pct  = Math.round(val * 100);

    const row  = document.createElement('div');
    row.className = 'ob-elbar-row';
    row.setAttribute('role', 'presentation');
    row.innerHTML = `
      <span class="ob-elbar-name">${data.name}</span>
      <div class="ob-elbar-outer" role="progressbar"
           aria-label="${data.name} element score"
           aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">
        <div class="ob-elbar-fill"
             style="width: 0%; background: ${data.color}"
             data-target="${pct}"></div>
      </div>
      <span class="ob-elbar-pct" style="color: ${data.color}">${pct}%</span>
    `;
    barsEl.appendChild(row);
  });

  // Animate bars after paint
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      barsEl.querySelectorAll('.ob-elbar-fill').forEach(fill => {
        fill.style.width = fill.dataset.target + '%';
      });
    });
  });

  // Summary grid
  const grid = document.getElementById('sum-grid');
  grid.innerHTML = '';

  [
    { l: 'Life Stage',   v: STAGES[S.lifeStage]?.n,   s: STAGES[S.lifeStage]?.s         },
    { l: 'Risk Profile', v: RISK_NAMES[S.risk],        s: 'Investor classification'      },
    { l: 'Capital',      v: AMOUNTS[S.amount]?.v,      s: AMOUNTS[S.amount]?.d           },
    { l: 'Objectives',   v: '5 ranked',                s: 'Priorities confirmed'          },
  ].forEach(({ l, v, s }) => {
    const card = document.createElement('div');
    card.className = 'ob-sum-card';
    card.innerHTML = `
      <div class="ob-sum-label">${l}</div>
      <div class="ob-sum-val">${v}</div>
      <div class="ob-sum-sub">${s}</div>
    `;
    grid.appendChild(card);
  });

  personaliseResults();
  completeStep('s-amount', 's-complete', 'Assessment complete', 'Generating your profile');
}
