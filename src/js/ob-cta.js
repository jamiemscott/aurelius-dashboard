/**
 * Aurelius — Onboarding CTA sidebar card
 *
 * Shows a prompt at the top of the sidebar to take (or retake) the
 * 'Know Your Element' investment profile assessment.
 *
 * localStorage keys
 *   aurelius-ob-complete    set by onboarding/results.js on completion
 *   aurelius-ob-cta-hidden  set when user dismisses the card
 *
 * Phrasing
 *   Not done  →  "Know Your Element"  /  "Begin Assessment"
 *   Done      →  "Retake Assessment"  /  "Retake"
 */
(function () {
  'use strict';

  const STORAGE_COMPLETE = 'aurelius-ob-complete';
  const STORAGE_HIDDEN   = 'aurelius-ob-cta-hidden';

  const card    = document.getElementById('ob-cta');
  if (!card) return;

  // User previously dismissed — leave hidden
  if (localStorage.getItem(STORAGE_HIDDEN)) return;

  const titleEl   = document.getElementById('ob-cta-title');
  const subEl     = document.getElementById('ob-cta-sub');
  const btnEl     = document.getElementById('ob-cta-btn');
  const dismissEl = document.getElementById('ob-cta-dismiss');

  // Adjust copy depending on whether the assessment has been completed
  if (localStorage.getItem(STORAGE_COMPLETE)) {
    if (titleEl) titleEl.textContent = 'Retake Assessment';
    if (subEl)   subEl.textContent   = 'Re-evaluate your investment type';
    if (btnEl)   btnEl.textContent   = 'Retake';
  }

  // Reveal the card (it starts with [hidden] to prevent flash)
  card.removeAttribute('hidden');

  // Dismiss handler
  if (dismissEl) {
    dismissEl.addEventListener('click', () => {
      localStorage.setItem(STORAGE_HIDDEN, '1');
      card.setAttribute('hidden', '');
    });
  }
}());
