/* ─── MY GOALS ─────────────────────────────────────────────────
   Goal-based investing: progress rings, scenario planner,
   add-goal flow.
   ─────────────────────────────────────────────────────────── */

/* ── Goal types ─────────────────────────────────────────────── */

var goalTypes = [
  { id: 'home',       emoji: '🏠', label: 'Buy a home',        color: '#F5A623', hint: 'Average UK deposit is around £50,000' },
  { id: 'holiday',    emoji: '🌍', label: 'Dream holiday',     color: '#34D399', hint: 'Where in the world is calling you?' },
  { id: 'education',  emoji: '🎓', label: 'Education',         color: '#60A5FA', hint: 'For you or someone you love' },
  { id: 'car',        emoji: '🚗', label: 'New car',           color: '#A78BFA', hint: 'Electric? Classic? You decide.' },
  { id: 'wedding',    emoji: '💒', label: 'Wedding',           color: '#F472B6', hint: 'Average UK wedding costs £20,000' },
  { id: 'retirement', emoji: '🏖️', label: 'Financial freedom', color: '#FBBF24', hint: 'The one goal that changes everything' },
  { id: 'emergency',  emoji: '🆘', label: 'Rainy day fund',    color: '#F87171', hint: 'Aim for 3–6 months of expenses' },
  { id: 'family',     emoji: '👶', label: 'Start a family',    color: '#4ADE80', hint: 'Babies cost more than you think!' },
  { id: 'sabbatical', emoji: '✈️', label: 'Sabbatical',        color: '#22D3EE', hint: 'Time is the most precious thing' },
  { id: 'custom',     emoji: '⭐', label: 'My own goal',       color: '#E2E8F0', hint: 'Name it, claim it.' },
];

/* ── Sample goal data ───────────────────────────────────────── */

var goalsData = [
  {
    id: 'g1',
    typeId: 'home',
    emoji: '🏠',
    name: 'Bigger family home',
    color: '#F5A623',
    target: 150000,
    saved: 97500,
    monthlyContrib: 1200,
    targetDate: '2027-06-01',
  },
  {
    id: 'g2',
    typeId: 'education',
    emoji: '🎓',
    name: "Kids' uni fund",
    color: '#60A5FA',
    target: 60000,
    saved: 24000,
    monthlyContrib: 480,
    targetDate: '2030-09-01',
  },
  {
    id: 'g3',
    typeId: 'sabbatical',
    emoji: '✈️',
    name: 'Family sabbatical',
    color: '#22D3EE',
    target: 25000,
    saved: 5000,
    monthlyContrib: 650,
    targetDate: '2026-08-01',
  },
];

/* ── Drawer state ───────────────────────────────────────────── */

var glDrawerStep = 1;
var glDraftGoal  = {};

/* ── Utilities ──────────────────────────────────────────────── */

function glFmt(n) {
  return '£' + Math.round(n).toLocaleString('en-GB');
}

function glMonthsUntil(dateStr) {
  var now  = new Date();
  var then = new Date(dateStr);
  return Math.max(0, (then.getFullYear() - now.getFullYear()) * 12 + (then.getMonth() - now.getMonth()));
}

function glFriendlyDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

function glMonthsNeeded(target, saved, monthlyContrib) {
  var remaining = target - saved;
  if (monthlyContrib <= 0) return Infinity;
  return Math.ceil(remaining / monthlyContrib);
}

function glStatus(goal) {
  var monthsLeft   = glMonthsUntil(goal.targetDate);
  var monthsNeeded = glMonthsNeeded(goal.target, goal.saved, goal.monthlyContrib);
  var pct          = goal.saved / goal.target;
  if (pct >= 1)                            return { label: 'Complete 🎉',      cls: 'gl-status--complete' };
  if (monthsNeeded <= monthsLeft * 1.05)   return { label: 'On track',        cls: 'gl-status--good'     };
  if (monthsNeeded <= monthsLeft * 1.3)    return { label: 'Worth a look',    cls: 'gl-status--warn'     };
  return                                          { label: 'Needs attention', cls: 'gl-status--bad'      };
}

/* ── Slider fill sync ───────────────────────────────────────── */
/* Updates --gl-slider-pct on the element itself so the CSS
   gradient fill tracks the thumb without any transition lag.   */

function glSyncSliderFill(el) {
  var min = parseFloat(el.min);
  var max = parseFloat(el.max);
  el.style.setProperty('--gl-slider-pct',
    ((parseFloat(el.value) - min) / (max - min) * 100).toFixed(1) + '%');
}

/* ── Hero stats ─────────────────────────────────────────────── */

function glRenderHero() {
  var el = document.getElementById('gl-hero-stats');
  if (!el) return;

  var totalTarget = goalsData.reduce(function(s, g) { return s + g.target; }, 0);
  var totalSaved  = goalsData.reduce(function(s, g) { return s + g.saved;  }, 0);
  var nearest     = goalsData.slice().sort(function(a, b) {
    return new Date(a.targetDate) - new Date(b.targetDate);
  })[0];

  el.innerHTML = [
    '<div class="gl-stat">',
      '<span class="gl-stat-value">', goalsData.length, '</span>',
      '<span class="gl-stat-label">Active goals</span>',
    '</div>',
    '<div class="gl-stat-sep" aria-hidden="true"></div>',
    '<div class="gl-stat">',
      '<span class="gl-stat-value">', glFmt(totalSaved), '</span>',
      '<span class="gl-stat-label">Saved so far</span>',
    '</div>',
    '<div class="gl-stat-sep" aria-hidden="true"></div>',
    '<div class="gl-stat">',
      '<span class="gl-stat-value">', glFmt(totalTarget), '</span>',
      '<span class="gl-stat-label">Total target</span>',
    '</div>',
    nearest ? [
      '<div class="gl-stat-sep" aria-hidden="true"></div>',
      '<div class="gl-stat">',
        '<span class="gl-stat-value">', nearest.emoji, ' ', glFriendlyDate(nearest.targetDate), '</span>',
        '<span class="gl-stat-label">Nearest goal</span>',
      '</div>',
    ].join('') : '',
  ].join('');
}

/* ── Goal card ──────────────────────────────────────────────── */
/* Progress ring is driven entirely by CSS:
   conic-gradient fills --gl-pct percent with the goal colour;
   a mask clips the centre to make a donut.
   @property registers --gl-pct as animatable so the
   CSS transition in goals.css plays on first paint.            */

function glRenderCard(goal) {
  var pct    = Math.min(1, Math.max(0, goal.saved / goal.target));
  var pctInt = Math.round(pct * 100);
  var status = glStatus(goal);
  var months = glMonthsUntil(goal.targetDate);
  var tgtPct = ((goal.target - 5000) / (500000 - 5000) * 100).toFixed(1);
  var moPct  = ((Math.max(3, months) - 3) / (240 - 3) * 100).toFixed(1);

  return [
    '<article class="gl-card" id="card-', goal.id, '"',
      ' style="--gl-color:', goal.color, '"',
      ' aria-label="', goal.name, ' goal">',

      /* ── Progress ring (pure CSS — no SVG) ── */
      '<div class="gl-card-arc-wrap">',
        '<div class="gl-ring-wrap">',
          '<div class="gl-progress-ring"',
            ' style="--gl-pct:', pctInt, ';--gl-color:', goal.color, '"',
            ' aria-hidden="true">',
          '</div>',
          '<div class="gl-ring-content" aria-hidden="true">',
            '<span class="gl-ring-emoji">', goal.emoji, '</span>',
            '<span class="gl-ring-pct">', pctInt, '%</span>',
          '</div>',
        '</div>',
      '</div>',

      /* ── Card body ── */
      '<div class="gl-card-body">',
        '<h2 class="gl-card-name">', goal.name, '</h2>',
        '<div class="gl-card-amounts">',
          '<span class="gl-card-saved">', glFmt(goal.saved), '</span>',
          '<span class="gl-card-of"> of </span>',
          '<span class="gl-card-target">', glFmt(goal.target), '</span>',
        '</div>',
      '</div>',

      /* ── Card footer ── */
      '<div class="gl-card-footer">',
        '<div class="gl-card-meta">',
          '<span class="gl-card-monthly"><strong>', glFmt(goal.monthlyContrib), '</strong>/mo</span>',
          '<span class="gl-card-date">', glFriendlyDate(goal.targetDate), '</span>',
        '</div>',
        '<div class="gl-card-actions">',
          '<span class="gl-status ', status.cls, '">', status.label, '</span>',
          '<button class="btn-secondary btn-secondary--sm"',
            ' data-action="adjust" data-id="', goal.id, '"',
            ' aria-label="Adjust ', goal.name, ' goal">',
            'Adjust',
            '<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>',
          '</button>',
        '</div>',
      '</div>',

      /* ── Inline adjust panel ── */
      '<div class="gl-adjust-panel" id="adjust-', goal.id, '" hidden>',
        '<div class="gl-adjust-inner">',
          '<div class="gl-adjust-group">',
            '<div class="gl-adjust-row">',
              '<label class="gl-adjust-label" for="slider-target-', goal.id, '">Target amount</label>',
              '<span class="gl-adjust-val" id="val-target-', goal.id, '">', glFmt(goal.target), '</span>',
            '</div>',
            '<input class="gl-slider" id="slider-target-', goal.id, '" type="range"',
              ' data-action="slider-update" data-id="', goal.id, '"',
              ' min="5000" max="500000" step="5000" value="', goal.target, '"',
              ' aria-label="Target amount for ', goal.name, '"',
              ' style="--gl-slider-pct:', tgtPct, '%">',
          '</div>',
          '<div class="gl-adjust-group">',
            '<div class="gl-adjust-row">',
              '<label class="gl-adjust-label" for="slider-months-', goal.id, '">Target date</label>',
              '<span class="gl-adjust-val" id="val-months-', goal.id, '">', glFriendlyDate(goal.targetDate), '</span>',
            '</div>',
            '<input class="gl-slider" id="slider-months-', goal.id, '" type="range"',
              ' data-action="slider-update" data-id="', goal.id, '"',
              ' min="3" max="240" step="1" value="', Math.max(3, months), '"',
              ' aria-label="Months until target for ', goal.name, '"',
              ' style="--gl-slider-pct:', moPct, '%">',
          '</div>',
          '<div class="gl-adjust-result" id="result-', goal.id, '">',
            'You need <output id="result-amount-', goal.id, '">', glFmt(goal.monthlyContrib), '/month</output> to get there.',
          '</div>',
          '<div class="gl-adjust-btns">',
            '<button class="btn-primary" data-action="save" data-id="', goal.id, '">Save changes</button>',
            '<button class="btn-secondary" data-action="cancel" data-id="', goal.id, '">Cancel</button>',
          '</div>',
        '</div>',
      '</div>',

    '</article>',
  ].join('');
}

/* ── Add goal card ──────────────────────────────────────────── */

function glAddCard() {
  return [
    '<button class="gl-add-card" data-action="add-goal" aria-label="Add a new goal">',
      '<span class="gl-add-icon" aria-hidden="true">',
        '<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">',
          '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
        '</svg>',
      '</span>',
      '<span class="gl-add-label">Add a new goal</span>',
      '<span class="gl-add-sub">What are you saving for?</span>',
    '</button>',
  ].join('');
}

/* ── Render grid ────────────────────────────────────────────── */

function glRenderGrid() {
  var el = document.getElementById('gl-grid');
  if (!el) return;
  el.innerHTML = goalsData.map(glRenderCard).join('') + glAddCard();
}

/* ── Adjust panel ───────────────────────────────────────────── */

function glOpenAdjust(id) {
  document.querySelectorAll('.gl-adjust-panel:not([hidden])').forEach(function(p) {
    p.setAttribute('hidden', '');
    var card = p.closest('.gl-card');
    if (card) card.classList.remove('gl-card--adjusting');
  });
  var panel = document.getElementById('adjust-' + id);
  var card  = document.getElementById('card-' + id);
  if (!panel || !card) return;
  panel.removeAttribute('hidden');
  card.classList.add('gl-card--adjusting');
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function glCloseAdjust(id) {
  var panel = document.getElementById('adjust-' + id);
  var card  = document.getElementById('card-' + id);
  if (panel) panel.setAttribute('hidden', '');
  if (card)  card.classList.remove('gl-card--adjusting');
}

function glUpdateAdjust(id) {
  var goal         = goalsData.find(function(g) { return g.id === id; });
  if (!goal) return;

  var sliderTarget = document.getElementById('slider-target-' + id);
  var sliderMonths = document.getElementById('slider-months-' + id);
  var valTarget    = document.getElementById('val-target-'    + id);
  var valMonths    = document.getElementById('val-months-'    + id);
  var resultAmount = document.getElementById('result-amount-' + id);
  if (!sliderTarget || !sliderMonths || !valTarget || !valMonths || !resultAmount) return;

  var newTarget = parseFloat(sliderTarget.value);
  var newMonths = parseInt(sliderMonths.value, 10);

  var futureDate = new Date();
  futureDate.setMonth(futureDate.getMonth() + newMonths);

  valTarget.textContent    = glFmt(newTarget);
  valMonths.textContent    = futureDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  resultAmount.textContent = glFmt(Math.ceil(Math.max(0, newTarget - goal.saved) / newMonths)) + '/month';
}

function glSaveAdjust(id) {
  var goal         = goalsData.find(function(g) { return g.id === id; });
  if (!goal) return;

  var sliderTarget = document.getElementById('slider-target-' + id);
  var sliderMonths = document.getElementById('slider-months-' + id);
  if (!sliderTarget || !sliderMonths) return;

  var newTarget = parseFloat(sliderTarget.value);
  var newMonths = parseInt(sliderMonths.value, 10);
  var futureDate = new Date();
  futureDate.setMonth(futureDate.getMonth() + newMonths);

  goal.target         = newTarget;
  goal.targetDate     = futureDate.toISOString().split('T')[0];
  goal.monthlyContrib = Math.ceil(Math.max(0, newTarget - goal.saved) / newMonths);

  glCloseAdjust(id);
  glRenderGrid();
  glRenderHero();
}

/* ── Add goal drawer ────────────────────────────────────────── */

function glOpenDrawer() {
  glDrawerStep = 1;
  glDraftGoal  = {};
  glRenderDrawer();
  document.getElementById('add-goal-drawer').showPopover();
}

function glRenderDrawer() {
  var label = document.getElementById('gl-drawer-step-label');
  var body  = document.getElementById('gl-drawer-body');
  if (!label || !body) return;

  if (glDrawerStep === 1) {
    label.textContent = 'What are you saving for?';
    body.innerHTML = [
      '<div class="gl-type-grid">',
        goalTypes.map(function(t) {
          return [
            '<button class="gl-type-btn"',
              ' data-action="select-type" data-id="', t.id, '"',
              ' style="--gl-type-color:', t.color, '"',
              ' aria-label="', t.label, '">',
              '<span class="gl-type-emoji" aria-hidden="true">', t.emoji, '</span>',
              '<span class="gl-type-label">', t.label, '</span>',
            '</button>',
          ].join('');
        }).join(''),
      '</div>',
    ].join('');
  }

  if (glDrawerStep === 2) {
    var type = goalTypes.find(function(t) { return t.id === glDraftGoal.typeId; }) || goalTypes[0];
    label.textContent = 'Set your goal';
    body.innerHTML = [
      '<div class="gl-form">',
        '<div class="gl-form-emoji" aria-hidden="true">', type.emoji, '</div>',
        '<div class="gl-form-group">',
          '<label class="gl-form-label" for="gl-goal-name">What will you call it?</label>',
          '<input class="gl-form-input" id="gl-goal-name" type="text"',
            ' data-draft-field="name"',
            ' placeholder="e.g. Our dream home"',
            ' value="', (glDraftGoal.name || type.label), '">',
        '</div>',
        '<div class="gl-form-row">',
          '<div class="gl-form-group">',
            '<label class="gl-form-label" for="gl-goal-target">How much do you need?</label>',
            '<div class="gl-form-input-wrap">',
              '<span class="gl-form-prefix" aria-hidden="true">£</span>',
              '<input class="gl-form-input gl-form-input--prefixed" id="gl-goal-target" type="number"',
                ' data-draft-field="target"',
                ' placeholder="50000" min="100" step="100"',
                ' value="', (glDraftGoal.target || ''), '">',
            '</div>',
            type.hint ? '<p class="gl-form-hint">' + type.hint + '</p>' : '',
          '</div>',
          '<div class="gl-form-group">',
            '<label class="gl-form-label" for="gl-goal-years">By when?</label>',
            '<div class="gl-form-input-wrap">',
              '<input class="gl-form-input gl-form-input--suffixed" id="gl-goal-years" type="number"',
                ' data-draft-field="years"',
                ' placeholder="5" min="1" max="40" step="1"',
                ' value="', (glDraftGoal.years || ''), '">',
              '<span class="gl-form-suffix" aria-hidden="true">years</span>',
            '</div>',
          '</div>',
        '</div>',
        /* Monthly preview — shown/hidden by glPreviewMonthly() */
        '<div class="gl-form-preview">',
          '<div class="gl-form-preview-inner" id="gl-preview-inner" hidden>',
            '<span class="gl-form-preview-label">You\'d need to save</span>',
            '<output class="gl-form-preview-amount" id="gl-preview-amount"></output>',
            '<output class="gl-form-preview-sub" id="gl-preview-sub"></output>',
          '</div>',
        '</div>',
        '<div class="gl-form-actions">',
          '<button class="btn-secondary" data-action="drawer-back">',
            '<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>',
            'Back',
          '</button>',
          '<button class="btn-primary" data-action="submit-goal">Add this goal</button>',
        '</div>',
      '</div>',
    ].join('');
    glPreviewMonthly();
  }
}

function glSelectType(typeId) {
  var type = goalTypes.find(function(t) { return t.id === typeId; });
  if (!type) return;
  glDraftGoal.typeId = typeId;
  glDraftGoal.name   = type.label;
  glDraftGoal.color  = type.color;
  glDraftGoal.emoji  = type.emoji;
  glDrawerStep = 2;
  glRenderDrawer();
}

function glPreviewMonthly() {
  var inner  = document.getElementById('gl-preview-inner');
  var amount = document.getElementById('gl-preview-amount');
  var sub    = document.getElementById('gl-preview-sub');
  if (!inner || !amount || !sub) return;

  var target  = glDraftGoal.target;
  var years   = glDraftGoal.years;
  var valid   = target > 0 && years > 0;

  inner.hidden = !valid;
  if (!valid) return;

  var monthly        = Math.ceil(target / (years * 12));
  amount.textContent = glFmt(monthly) + '/month';
  sub.textContent    = 'to reach ' + glFmt(target) + ' in ' + years + ' year' + (years !== 1 ? 's' : '');
}

function glSubmitGoal() {
  var nameEl   = document.getElementById('gl-goal-name');
  var targetEl = document.getElementById('gl-goal-target');
  var yearsEl  = document.getElementById('gl-goal-years');
  var name     = nameEl   ? nameEl.value.trim()         : '';
  var target   = targetEl ? parseFloat(targetEl.value)  : 0;
  var years    = yearsEl  ? parseInt(yearsEl.value, 10) : 0;
  if (!name || !target || !years) return;

  var futureDate = new Date();
  futureDate.setFullYear(futureDate.getFullYear() + years);

  goalsData.push({
    id:             'g' + Date.now(),
    typeId:          glDraftGoal.typeId || 'custom',
    emoji:           glDraftGoal.emoji  || '⭐',
    name:            name,
    color:           glDraftGoal.color  || '#E2E8F0',
    target:          target,
    saved:           0,
    monthlyContrib:  Math.ceil(target / (years * 12)),
    targetDate:      futureDate.toISOString().split('T')[0],
  });

  document.getElementById('add-goal-drawer').hidePopover();
  glRenderGrid();
  glRenderHero();
}

/* ── Event delegation ───────────────────────────────────────── */
/* All click/input wiring in one place — no inline handlers.    */

document.addEventListener('click', function(e) {
  var btn = e.target.closest('[data-action]');
  if (!btn) return;

  var action = btn.dataset.action;
  var id     = btn.dataset.id;

  if (action === 'adjust')      glOpenAdjust(id);
  if (action === 'save')        glSaveAdjust(id);
  if (action === 'cancel')      glCloseAdjust(id);
  if (action === 'add-goal')    glOpenDrawer();
  if (action === 'select-type') glSelectType(id);
  if (action === 'drawer-back') { glDrawerStep = 1; glRenderDrawer(); }
  if (action === 'submit-goal') glSubmitGoal();
});

document.addEventListener('input', function(e) {
  var el = e.target;

  /* Slider fill — keep the gradient thumb in sync */
  if (el.classList.contains('gl-slider')) glSyncSliderFill(el);

  /* Draft goal field updates */
  var field = el.dataset.draftField;
  if (field === 'name')   { glDraftGoal.name   = el.value; }
  if (field === 'target') { glDraftGoal.target  = parseFloat(el.value); glPreviewMonthly(); }
  if (field === 'years')  { glDraftGoal.years   = parseInt(el.value, 10); glPreviewMonthly(); }

  /* Adjust panel sliders */
  if (el.dataset.action === 'slider-update') glUpdateAdjust(el.dataset.id);
});

/* ── Init ───────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', function() {
  if (!document.getElementById('gl-grid')) return;
  glRenderHero();
  glRenderGrid();
});
