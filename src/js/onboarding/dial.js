/**
 * Aurelius Onboarding — Dial (Life Stage)
 * SVG rotary dial with drag + keyboard support
 */

import { S } from '../onboarding.js';

const STAGES = [
  { n: 'Starting out',       s: 'Student or early career'            },
  { n: 'Early career',       s: 'Building career & life'             },
  { n: 'Established',        s: 'Stable income, forming commitments' },
  { n: 'Peak obligations',   s: 'Maximum financial responsibilities' },
  { n: 'Pre-retirement',     s: 'Consolidating ahead of retirement'  },
  { n: 'Retired',            s: 'Post-career, drawing on wealth'     },
];

const CX = 126, CY = 126, R = 94;

function angleDeg(index) {
  return -90 + (index / (STAGES.length - 1)) * 300;
}

function pointOnCircle(deg) {
  const rad = deg * Math.PI / 180;
  return [CX + R * Math.cos(rad), CY + R * Math.sin(rad)];
}

function arcPathD(a0, a1) {
  const [sx, sy] = pointOnCircle(a0);
  const [ex, ey] = pointOnCircle(a1);
  const large = (a1 - a0) > 180 ? 1 : 0;
  return `M${sx.toFixed(1)},${sy.toFixed(1)} A${R},${R},0,${large},1,${ex.toFixed(1)},${ey.toFixed(1)}`;
}

function indexFromXY(x, y) {
  let angle = Math.atan2(y - CY, x - CX) * 180 / Math.PI;
  let normalized = angle + 90;
  if (normalized < 0) normalized += 360;
  if (normalized > 300) normalized = normalized > 330 ? 0 : 300;
  return Math.round((normalized / 300) * (STAGES.length - 1));
}

document.addEventListener('DOMContentLoaded', () => {
  const svg      = document.getElementById('dial-svg');
  if (!svg) return;

  const arc      = document.getElementById('dial-arc');
  const thumb    = document.getElementById('dial-thumb');
  const thumbLbl = document.getElementById('dial-thumb-label');
  const ticksG   = document.getElementById('dial-ticks');
  const nameEl   = document.getElementById('dial-name');
  const subEl    = document.getElementById('dial-sub');
  const hintEl   = document.getElementById('dial-hint');
  const pipsEl   = document.getElementById('dial-pips');

  // Build tick marks
  STAGES.forEach((_, i) => {
    const [x, y] = pointOnCircle(angleDeg(i));
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x.toFixed(1));
    circle.setAttribute('cy', y.toFixed(1));
    circle.setAttribute('r', '4.5');
    circle.setAttribute('fill', 'rgba(255,255,255,0.07)');
    circle.style.cursor = 'pointer';
    circle.addEventListener('click', () => setDial(i));
    ticksG.appendChild(circle);
  });

  // Build pips
  STAGES.forEach(() => {
    const pip = document.createElement('div');
    pip.className = 'ob-pip';
    pipsEl.appendChild(pip);
  });

  function setDial(i) {
    const idx = Math.max(0, Math.min(STAGES.length - 1, i));
    S.lifeStage = idx;

    const angle  = angleDeg(idx);
    const [tx, ty] = pointOnCircle(angle);

    thumb.setAttribute('cx', tx.toFixed(1));
    thumb.setAttribute('cy', ty.toFixed(1));
    thumb.setAttribute('stroke', idx > 0 ? 'var(--gold-dim)' : 'rgba(255,255,255,0.16)');

    thumbLbl.setAttribute('x', tx.toFixed(1));
    thumbLbl.setAttribute('y', ty.toFixed(1));
    thumbLbl.textContent = idx + 1;

    arc.setAttribute('d', idx > 0 ? arcPathD(-90, angle) : '');
    arc.setAttribute('stroke', 'var(--el-water)');

    nameEl.textContent = STAGES[idx].n;
    subEl.textContent  = STAGES[idx].s;
    hintEl.textContent = `Stage ${idx + 1} of ${STAGES.length}`;

    // Update ticks fill
    ticksG.querySelectorAll('circle').forEach((c, j) => {
      c.setAttribute('fill', j <= idx ? 'var(--el-water)' : 'rgba(255,255,255,0.07)');
    });

    // Update pips
    const pips = pipsEl.querySelectorAll('.ob-pip');
    pips.forEach((p, j) => {
      p.className = 'ob-pip' + (j < idx ? ' ob-pip--done' : j === idx ? ' ob-pip--curr' : '');
      if (j === idx) p.style.background = 'var(--el-water)';
      else if (j < idx) p.style.background = 'color-mix(in srgb, var(--el-water) 27%, transparent)';
      else p.style.background = '';
    });

    // Update ARIA
    svg.setAttribute('aria-valuenow', idx + 1);
    svg.setAttribute('aria-valuetext', `Stage ${idx + 1} of ${STAGES.length} — ${STAGES[idx].n}`);
  }

  setDial(0);

  // ── Drag (mouse + touch) ──────────────────────────────────────────────────
  let dragging = false;

  function svgCoords(e) {
    const rect = svg.getBoundingClientRect();
    const src  = e.touches ? e.touches[0] : e;
    return [
      (src.clientX - rect.left) / rect.width  * 252,
      (src.clientY - rect.top)  / rect.height * 252,
    ];
  }

  thumb.addEventListener('mousedown',  ()  => { dragging = true; });
  thumb.addEventListener('touchstart', (e) => { dragging = true; e.preventDefault(); }, { passive: false });

  document.addEventListener('mouseup',  () => { dragging = false; });
  document.addEventListener('touchend', () => { dragging = false; });

  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const [x, y] = svgCoords(e);
    setDial(indexFromXY(x, y));
  });

  document.addEventListener('touchmove', e => {
    if (!dragging) return;
    e.preventDefault();
    const [x, y] = svgCoords(e);
    setDial(indexFromXY(x, y));
  }, { passive: false });

  // ── Keyboard ──────────────────────────────────────────────────────────────
  svg.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      setDial(S.lifeStage + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      setDial(S.lifeStage - 1);
    }
  });
});
