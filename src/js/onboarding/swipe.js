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
      pip.className = 'ob-pip ob-pip--fire' + (i < idx ? ' ob-pip--done' : i === idx ? ' ob-pip--curr' : '');
      pipsEl.appendChild(pip);
    });
  }

  /* Drag position and vote strength are runtime values: CSS consumes them */
  function dragTo(x, rot) {
    card.style.setProperty('--ob-swipe-x', `${x}px`);
    card.style.setProperty('--ob-swipe-rot', `${rot}deg`);
  }

  function setVotes(yes, no) {
    voteYes.style.setProperty('--ob-vote', String(yes));
    voteNo.style.setProperty('--ob-vote', String(no));
  }

  function resetCard() {
    card.classList.remove('is-dragging', 'is-settling', 'is-leaving');
    dragTo(0, 0);
    setVotes(0, 0);
  }

  function setCard() {
    if (idx >= CARDS.length) {
      // All cards reviewed
      titleEl.textContent  = 'All statements reviewed';
      bodyEl.textContent   = 'Your decision intelligence has been captured across five dimensions.';
      eyebrow.textContent  = 'Complete';
      resetCard();
      foot.hidden = false;
      statusEl.textContent = 'All five statements reviewed. Press Continue to proceed.';
      buildPips();
      return;
    }

    const c = CARDS[idx];
    eyebrow.textContent  = c.k;
    titleEl.textContent  = c.t;
    bodyEl.textContent   = c.b;
    resetCard();

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
      card.classList.remove('is-dragging', 'is-settling');
      card.classList.add('is-leaving');
      dragTo(dir * 360, dir * 7);
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

  card.addEventListener('mousedown',  e => { dragging = true; startX = currentX = getX(e); card.classList.remove('is-settling'); card.classList.add('is-dragging'); });
  card.addEventListener('touchstart', e => { dragging = true; startX = currentX = getX(e); card.classList.remove('is-settling'); card.classList.add('is-dragging'); }, { passive: true });

  function onMove(e) {
    if (!dragging) return;
    currentX = getX(e);
    const dx = currentX - startX;
    dragTo(dx, dx * 0.03);
    setVotes(dx > 35 ? Math.min(1, (dx - 35) / 55) : 0, dx < -35 ? Math.min(1, (-dx - 35) / 55) : 0);
  }

  function onEnd() {
    if (!dragging) return;
    dragging = false;
    const dx = currentX - startX;
    if (Math.abs(dx) > 88) {
      swipeOut(dx > 0);
    } else {
      card.classList.remove('is-dragging');
      card.classList.add('is-settling');
      dragTo(0, 0);
      setVotes(0, 0);
    }
  }

  document.addEventListener('mousemove', onMove);
  document.addEventListener('touchmove', onMove, { passive: true });
  document.addEventListener('mouseup',   onEnd);
  document.addEventListener('touchend',  onEnd);

  setCard();
});
