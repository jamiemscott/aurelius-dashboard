/**
 * Aurelius Onboarding — Capital amount (Water · Flow)
 * Native range + chip quick-select, bidirectional sync
 */

import { S } from '../onboarding.js';

const AMOUNTS = [
  { v: '£0',               d: 'No capital available at this time'  },
  { v: 'Under £500',       d: 'An initial exploratory position'    },
  { v: '£500 – £2,000',   d: 'A considered starting allocation'   },
  { v: '£2,000 – £10,000',d: 'A meaningful initial allocation'    },
  { v: '£10,000 – £50,000',d: 'A substantive investment mandate'  },
  { v: 'Over £50,000',     d: 'Significant capital to deploy'      },
];

document.addEventListener('DOMContentLoaded', () => {
  const range   = document.getElementById('amt-range');
  const numEl   = document.getElementById('amt-num');
  const descEl  = document.getElementById('amt-desc');
  const chips   = document.getElementById('amt-chips');

  if (!range || !chips) return;

  // Build chips
  AMOUNTS.forEach((amt, i) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'ob-achip' + (i === 3 ? ' ob-achip--on' : '');
    chip.textContent = amt.v;
    chip.setAttribute('aria-pressed', i === 3 ? 'true' : 'false');
    chip.addEventListener('click', () => update(i));
    chips.appendChild(chip);
  });

  function update(i) {
    const idx = Math.max(0, Math.min(AMOUNTS.length - 1, i));
    S.amount = idx;

    numEl.textContent  = AMOUNTS[idx].v;
    descEl.textContent = AMOUNTS[idx].d;
    range.value        = idx;

    chips.querySelectorAll('.ob-achip').forEach((c, j) => {
      const on = j === idx;
      c.classList.toggle('ob-achip--on', on);
      c.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  range.addEventListener('input', () => update(+range.value));

  update(3);
});

export { AMOUNTS };
