/**
 * Aurelius Onboarding — Swipe cards (Decision Style)
 * Mouse/touch drag + keyboard (Arrow L/R) + accessible buttons
 */

import { S } from '../onboarding.js';

const CARDS = [
  {
    k: 'Approach',
    t: 'I conduct thorough research before committing capital',
    b: 'Before any financial decision I study the landscape extensively, weighing evidence until I have genuine conviction.',
  },
  {
    k: 'Consultation',
    t: 'I value expert counsel before significant decisions',
    b: 'A trusted adviser or informed peer perspective is important before I commit to a material financial position.',
  },
  {
    k: 'Tempo',
    t: 'I move decisively once an opportunity is identified',
    b: 'When conviction is established, I act with purpose. Prolonged deliberation introduces unnecessary opportunity cost.',
  },
  {
    k: 'Trust',
    t: 'I trust regulated institutions to act in my long-term interest',
    b: 'FCA oversight and regulatory frameworks give me confidence that the system broadly operates for investors.',
  },
  {
    k: 'Learning',
    t: 'I prefer learning through direct market participation',
    b: 'Practical exposure with a considered position teaches me more than theoretical study of market dynamics.',
  },
];

document.addEventListener('DOMContentLoaded', () => {
  const card      = document.getElementById('swipe-card');
  const voteYes   = document.getElementById('vote-yes');
  const voteNo    = document.getElementById('vote-no');
  const eyebrow   = document.getElementById('swipe-eyebrow');
  const titleEl   = document.getElementById('swipe-title');
  const bodyEl    = document.getElementById('swipe-body');
  const pipsEl    = document.getElementById('swipe-pips');
  const foot      = document.getElementById('swipe-foot');
  const statusEl  = document.getElementById('swipe-status');
  const btnAffirm = document.getElementById('btn-affirm');
  const btnDecline= document.getElementById('btn-decline');

  if (!card) return;

  let idx     = 0;
  const scores = [];

  function buildPips() {
    pipsEl.innerHTML = '';
    CARDS.forEach((_, i) => {
      const pip = document.createElement('div');
      pip.className = 'ob-pip' + (i < idx ? ' ob-pip--done' : i === idx ? ' ob-pip--curr' : '');
      if (i === idx)      pip.style.background = 'var(--el-fire)';
      else if (i < idx)   pip.style.background = 'color-mix(in srgb, var(--el-fire) 27%, transparent)';
      pipsEl.appendChild(pip);
    });
  }

  function setCard() {
    if (idx >= CARDS.length) {
      // All cards reviewed
      titleEl.textContent  = 'All statements reviewed';
      bodyEl.textContent   = 'Your decision intelligence has been captured across five dimensions.';
      eyebrow.textContent  = 'Complete';
      card.style.transition = '';
      card.style.transform  = '';
      card.style.opacity    = '1';
      voteYes.style.opacity = '0';
      voteNo.style.opacity  = '0';
      foot.hidden = false;
      statusEl.textContent = 'All five statements reviewed. Press Continue to proceed.';
      buildPips();
      return;
    }

    const c = CARDS[idx];
    eyebrow.textContent  = c.k;
    titleEl.textContent  = c.t;
    bodyEl.textContent   = c.b;
    card.style.transition = '';
    card.style.transform  = '';
    card.style.opacity    = '1';
    voteYes.style.opacity = '0';
    voteNo.style.opacity  = '0';

    // Announce new card to screen readers
    statusEl.textContent = '';
    requestAnimationFrame(() => {
      statusEl.textContent = `Statement ${idx + 1} of ${CARDS.length}: ${c.t}`;
    });

    buildPips();
  }

  function swipeOut(affirm) {
    const dir = affirm ? 1 : -1;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReduced) {
      card.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
      card.style.transform  = `translateX(${dir * 360}px) rotate(${dir * 7}deg)`;
      card.style.opacity    = '0';
    }

    scores.push(affirm);
    S.swipe = scores.slice();

    setTimeout(() => {
      idx++;
      setCard();
    }, prefersReduced ? 0 : 300);
  }

  // Buttons
  btnAffirm.addEventListener('click',  () => swipeOut(true));
  btnDecline.addEventListener('click', () => swipeOut(false));

  // Keyboard on card
  card.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); swipeOut(true);  }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); swipeOut(false); }
  });

  // Drag
  let startX = 0, currentX = 0, dragging = false;

  function getX(e) { return e.touches ? e.touches[0].clientX : e.clientX; }

  card.addEventListener('mousedown',  e => { dragging = true; startX = currentX = getX(e); card.style.transition = 'none'; });
  card.addEventListener('touchstart', e => { dragging = true; startX = currentX = getX(e); card.style.transition = 'none'; }, { passive: true });

  function onMove(e) {
    if (!dragging) return;
    currentX = getX(e);
    const dx = currentX - startX;
    card.style.transform = `translateX(${dx}px) rotate(${dx * 0.03}deg)`;
    voteYes.style.opacity = dx >  35 ? String(Math.min(1, (dx - 35) / 55))  : '0';
    voteNo.style.opacity  = dx < -35 ? String(Math.min(1, (-dx - 35) / 55)) : '0';
  }

  function onEnd() {
    if (!dragging) return;
    dragging = false;
    const dx = currentX - startX;
    if (Math.abs(dx) > 88) {
      swipeOut(dx > 0);
    } else {
      card.style.transition = 'transform 0.25s ease';
      card.style.transform  = '';
      voteYes.style.opacity = '0';
      voteNo.style.opacity  = '0';
    }
  }

  document.addEventListener('mousemove', onMove);
  document.addEventListener('touchmove', onMove, { passive: true });
  document.addEventListener('mouseup',   onEnd);
  document.addEventListener('touchend',  onEnd);

  setCard();
});
