/**
 * Aurelius Onboarding — Register screen
 *
 * Collects first name + email + consent before the assessment begins.
 * Stores values on the shared state object S.
 * Personalises the results screen heading and CTA on completion.
 */

import { S, goTo } from '../onboarding.js';

const form        = document.getElementById('ob-reg-form');
const nameInput   = document.getElementById('reg-name');
const emailInput  = document.getElementById('reg-email');
const consentBox  = document.getElementById('reg-consent');
const nameErr     = document.getElementById('reg-name-err');
const emailErr    = document.getElementById('reg-email-err');
const consentErr  = document.getElementById('reg-consent-err');
const submitBtn   = document.getElementById('btn-reg-submit');

if (submitBtn) {
  submitBtn.addEventListener('click', e => {
    e.preventDefault();
    if (validate()) {
      // Persist to shared state
      S.firstName = nameInput.value.trim();
      S.email     = emailInput.value.trim().toLowerCase();

      goTo('s-dial');
    }
  });
}

function validate() {
  let ok = true;

  // Name
  const name = nameInput.value.trim();
  if (!name) {
    showError(nameInput, nameErr);
    ok = false;
  } else {
    clearError(nameInput, nameErr);
  }

  // Email
  const email = emailInput.value.trim();
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRe.test(email)) {
    showError(emailInput, emailErr);
    ok = false;
  } else {
    clearError(emailInput, emailErr);
  }

  // Consent
  if (!consentBox.checked) {
    consentErr.hidden = false;
    ok = false;
  } else {
    consentErr.hidden = true;
  }

  return ok;
}

function showError(input, msg) {
  input.classList.add('is-invalid');
  input.setAttribute('aria-invalid', 'true');
  msg.hidden = false;
}

function clearError(input, msg) {
  input.classList.remove('is-invalid');
  input.removeAttribute('aria-invalid');
  msg.hidden = true;
}

// Clear error styling on input
[nameInput, emailInput].forEach(input => {
  if (!input) return;
  input.addEventListener('input', () => {
    input.classList.remove('is-invalid');
    input.removeAttribute('aria-invalid');
  });
});

// ── Personalise the results screen ──────────────────────────────────────────
// Called by results.js once the profile is computed
export function personaliseResults() {
  const name      = S.firstName;
  const nameEl    = document.getElementById('comp-name');
  const openBtn   = document.getElementById('btn-open-account');

  if (name && nameEl) {
    nameEl.textContent = `Ready to own your element, ${name}.`;
    nameEl.hidden = false;
  }

  if (name && openBtn) {
    openBtn.textContent = `Ready to open your account, ${name}?`;
  }
}
