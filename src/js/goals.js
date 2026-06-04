/* ─── MY GOALS ─────────────────────────────────────────────────
   Goal-based investing: progress arcs, scenario planner,
   add-goal flow.
   ─────────────────────────────────────────────────────────── */

/* ── Goal types ─────────────────────────────────────────────── */

const goalTypes = [
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
  var now   = new Date();
  var then  = new Date(dateStr);
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
  var monthsLeft    = glMonthsUntil(goal.targetDate);
  var monthsNeeded  = glMonthsNeeded(goal.target, goal.saved, goal.monthlyContrib);
  var pct           = goal.saved / goal.target;
  if (pct >= 1)                       return { key: 'complete', label: 'Complete 🎉',      cls: 'gl-status--complete' };
  if (monthsNeeded <= monthsLeft * 1.05) return { key: 'on-track',  label: 'On track',        cls: 'gl-status--good'     };
  if (monthsNeeded <= monthsLeft * 1.3)  return { key: 'watch',     label: 'Worth a look',    cls: 'gl-status--warn'     };
  return                                        { key: 'behind',    label: 'Needs attention', cls: 'gl-status--bad'      };
}

/* ── SVG progress arc ───────────────────────────────────────── */

function glArc(pct, color, id) {
  var r   = 54;
  var cx  = 64;
  var cy  = 64;
  var circ = 2 * Math.PI * r;
  var clamped = Math.min(1, Math.max(0, pct));
  var offset  = circ * (1 - clamped);
  return [
    '<svg class="gl-arc" viewBox="0 0 128 128" aria-hidden="true">',
      '<circle class="gl-arc-track" cx="' + cx + '" cy="' + cy + '" r="' + r + '"/>',
      '<circle class="gl-arc-fill" id="arc-' + id + '"',
        ' cx="' + cx + '" cy="' + cy + '" r="' + r + '"',
        ' stroke="' + color + '"',
        ' stroke-dasharray="' + circ.toFixed(2) + '"',
        ' stroke-dashoffset="' + offset.toFixed(2) + '"',
        ' style="--gl-circ:' + circ.toFixed(2) + ';--gl-offset:' + offset.toFixed(2) + '"',
      '/>',
      '<text class="gl-arc-pct" x="' + cx + '" y="' + (cy + 6) + '">' + Math.round(clamped * 100) + '%</text>',
    '</svg>',
  ].join('');
}

/* ── Hero stats ─────────────────────────────────────────────── */

function glRenderHero() {
  var el = document.getElementById('gl-hero-stats');
  if (!el) return;

  var totalTarget  = goalsData.reduce(function(s, g) { return s + g.target; }, 0);
  var totalSaved   = goalsData.reduce(function(s, g) { return s + g.saved;  }, 0);
  var activeCount  = goalsData.length;
  var nearest      = goalsData.slice().sort(function(a, b) {
    return new Date(a.targetDate) - new Date(b.targetDate);
  })[0];

  el.innerHTML = [
    '<div class="gl-stat">',
      '<span class="gl-stat-value">' + activeCount + '</span>',
      '<span class="gl-stat-label">Active goals</span>',
    '</div>',
    '<div class="gl-stat-sep" aria-hidden="true"></div>',
    '<div class="gl-stat">',
      '<span class="gl-stat-value">' + glFmt(totalSaved) + '</span>',
      '<span class="gl-stat-label">Saved so far</span>',
    '</div>',
    '<div class="gl-stat-sep" aria-hidden="true"></div>',
    '<div class="gl-stat">',
      '<span class="gl-stat-value">' + glFmt(totalTarget) + '</span>',
      '<span class="gl-stat-label">Total target</span>',
    '</div>',
    nearest ? [
      '<div class="gl-stat-sep" aria-hidden="true"></div>',
      '<div class="gl-stat">',
        '<span class="gl-stat-value">' + nearest.emoji + ' ' + glFriendlyDate(nearest.targetDate) + '</span>',
        '<span class="gl-stat-label">Nearest goal</span>',
      '</div>',
    ].join('') : '',
  ].join('');
}

/* ── Goal card ──────────────────────────────────────────────── */

function glRenderCard(goal) {
  var pct    = goal.saved / goal.target;
  var status = glStatus(goal);
  var months = glMonthsUntil(goal.targetDate);

  return [
    '<article class="gl-card" id="card-' + goal.id + '" style="--gl-color:' + goal.color + '" aria-label="' + goal.name + ' goal">',
      '<div class="gl-card-arc-wrap">',
        glArc(pct, goal.color, goal.id),
        '<span class="gl-card-emoji" aria-hidden="true">' + goal.emoji + '</span>',
      '</div>',
      '<div class="gl-card-body">',
        '<h2 class="gl-card-name">' + goal.name + '</h2>',
        '<div class="gl-card-amounts">',
          '<span class="gl-card-saved">' + glFmt(goal.saved) + '</span>',
          '<span class="gl-card-of"> of </span>',
          '<span class="gl-card-target">' + glFmt(goal.target) + '</span>',
        '</div>',
      '</div>',
      '<div class="gl-card-footer">',
        '<div class="gl-card-meta">',
          '<span class="gl-card-monthly"><strong>' + glFmt(goal.monthlyContrib) + '</strong>/mo</span>',
          '<span class="gl-card-date">' + glFriendlyDate(goal.targetDate) + '</span>',
        '</div>',
        '<div class="gl-card-actions">',
          '<span class="gl-status ' + status.cls + '">' + status.label + '</span>',
          '<button class="gl-adjust-btn" onclick="glOpenAdjust(\'' + goal.id + '\')" aria-label="Adjust ' + goal.name + ' goal">',
            'Adjust',
            '<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>',
          '</button>',
        '</div>',
      '</div>',
      // Inline adjust panel (hidden by default)
      '<div class="gl-adjust-panel" id="adjust-' + goal.id + '" hidden aria-label="Adjust goal">',
        '<div class="gl-adjust-inner">',
          '<div class="gl-adjust-row">',
            '<label class="gl-adjust-label" for="slider-target-' + goal.id + '">Target amount</label>',
            '<span class="gl-adjust-val" id="val-target-' + goal.id + '">' + glFmt(goal.target) + '</span>',
          '</div>',
          '<input class="gl-slider" id="slider-target-' + goal.id + '" type="range"',
            ' min="5000" max="500000" step="5000" value="' + goal.target + '"',
            ' oninput="glUpdateAdjust(\'' + goal.id + '\')"',
            ' aria-label="Target amount for ' + goal.name + '"',
            ' style="--gl-slider-pct:' + ((goal.target - 5000) / (500000 - 5000) * 100).toFixed(1) + '%">',
          '<div class="gl-adjust-row" style="margin-top:12px">',
            '<label class="gl-adjust-label" for="slider-months-' + goal.id + '">Target date</label>',
            '<span class="gl-adjust-val" id="val-months-' + goal.id + '">' + glFriendlyDate(goal.targetDate) + '</span>',
          '</div>',
          '<input class="gl-slider" id="slider-months-' + goal.id + '" type="range"',
            ' min="3" max="240" step="1" value="' + Math.max(3, months) + '"',
            ' oninput="glUpdateAdjust(\'' + goal.id + '\')"',
            ' aria-label="Months until target for ' + goal.name + '"',
            ' style="--gl-slider-pct:' + ((Math.max(3, months) - 3) / (240 - 3) * 100).toFixed(1) + '%">',
          '<div class="gl-adjust-result" id="result-' + goal.id + '">',
            'You need <strong>' + glFmt(goal.monthlyContrib) + '/month</strong> to get there.',
          '</div>',
          '<div class="gl-adjust-btns">',
            '<button class="gl-adjust-save" onclick="glSaveAdjust(\'' + goal.id + '\')">Save changes</button>',
            '<button class="gl-adjust-cancel" onclick="glCloseAdjust(\'' + goal.id + '\')">Cancel</button>',
          '</div>',
        '</div>',
      '</div>',
    '</article>',
  ].join('');
}

/* ── Add goal card ──────────────────────────────────────────── */

function glAddCard() {
  return [
    '<button class="gl-add-card" onclick="glOpenDrawer()" aria-label="Add a new goal">',
      '<span class="gl-add-icon" aria-hidden="true">',
        '<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">',
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
  // Close any other open panels first
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
  var valTarget    = document.getElementById('val-target-'   + id);
  var valMonths    = document.getElementById('val-months-'   + id);
  var result       = document.getElementById('result-'       + id);

  var newTarget = parseFloat(sliderTarget.value);
  var newMonths = parseInt(sliderMonths.value, 10);

  // Update slider fill via CSS custom property
  sliderTarget.style.setProperty('--gl-slider-pct',
    ((newTarget - 5000) / (500000 - 5000) * 100).toFixed(1) + '%');
  sliderMonths.style.setProperty('--gl-slider-pct',
    ((newMonths - 3) / (240 - 3) * 100).toFixed(1) + '%');

  // Friendly date from months
  var futureDate = new Date();
  futureDate.setMonth(futureDate.getMonth() + newMonths);
  var friendlyDate = futureDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  valTarget.textContent = glFmt(newTarget);
  valMonths.textContent = friendlyDate;

  var needed = Math.ceil(Math.max(0, newTarget - goal.saved) / newMonths);
  result.innerHTML = 'You need <strong>' + glFmt(needed) + '/month</strong> to get there.';
}

function glSaveAdjust(id) {
  var goal         = goalsData.find(function(g) { return g.id === id; });
  if (!goal) return;

  var sliderTarget = document.getElementById('slider-target-' + id);
  var sliderMonths = document.getElementById('slider-months-' + id);

  var newTarget = parseFloat(sliderTarget.value);
  var newMonths = parseInt(sliderMonths.value, 10);

  var futureDate = new Date();
  futureDate.setMonth(futureDate.getMonth() + newMonths);

  goal.target      = newTarget;
  goal.targetDate  = futureDate.toISOString().split('T')[0];
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
            '<button class="gl-type-btn" onclick="glSelectType(\'' + t.id + '\')"',
              ' style="--gl-type-color:' + t.color + '"',
              ' aria-label="' + t.label + '">',
              '<span class="gl-type-emoji" aria-hidden="true">' + t.emoji + '</span>',
              '<span class="gl-type-label">' + t.label + '</span>',
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
        '<div class="gl-form-emoji" aria-hidden="true">' + type.emoji + '</div>',
        '<div class="gl-form-group">',
          '<label class="gl-form-label" for="gl-goal-name">What will you call it?</label>',
          '<input class="gl-form-input" id="gl-goal-name" type="text"',
            ' placeholder="e.g. Our dream home"',
            ' value="' + (glDraftGoal.name || type.label) + '"',
            ' oninput="glDraftGoal.name = this.value">',
        '</div>',
        '<div class="gl-form-row">',
          '<div class="gl-form-group">',
            '<label class="gl-form-label" for="gl-goal-target">How much do you need?</label>',
            '<div class="gl-form-input-wrap">',
              '<span class="gl-form-prefix">£</span>',
              '<input class="gl-form-input gl-form-input--prefixed" id="gl-goal-target" type="number"',
                ' placeholder="50000" min="100" step="100"',
                ' value="' + (glDraftGoal.target || '') + '"',
                ' oninput="glDraftGoal.target = parseFloat(this.value); glPreviewMonthly()">',
            '</div>',
            type.hint ? '<p class="gl-form-hint">' + type.hint + '</p>' : '',
          '</div>',
          '<div class="gl-form-group">',
            '<label class="gl-form-label" for="gl-goal-years">By when?</label>',
            '<div class="gl-form-input-wrap">',
              '<input class="gl-form-input gl-form-input--suffixed" id="gl-goal-years" type="number"',
                ' placeholder="5" min="1" max="40" step="1"',
                ' value="' + (glDraftGoal.years || '') + '"',
                ' oninput="glDraftGoal.years = parseInt(this.value,10); glPreviewMonthly()">',
              '<span class="gl-form-suffix">years</span>',
            '</div>',
          '</div>',
        '</div>',
        '<div class="gl-form-preview" id="gl-form-preview"></div>',
        '<div class="gl-form-actions">',
          '<button class="gl-form-back" onclick="glDrawerStep=1;glRenderDrawer()">',
            '<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>',
            'Back',
          '</button>',
          '<button class="gl-form-submit" onclick="glSubmitGoal()">Add this goal</button>',
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
  var preview = document.getElementById('gl-form-preview');
  if (!preview) return;
  var target = glDraftGoal.target;
  var years  = glDraftGoal.years;
  if (!target || !years || target <= 0 || years <= 0) {
    preview.innerHTML = '';
    return;
  }
  var monthly = Math.ceil(target / (years * 12));
  preview.innerHTML = [
    '<div class="gl-form-preview-inner">',
      '<span class="gl-form-preview-label">You\'d need to save</span>',
      '<span class="gl-form-preview-amount">' + glFmt(monthly) + '/month</span>',
      '<span class="gl-form-preview-sub">to reach ' + glFmt(target) + ' in ' + years + ' year' + (years !== 1 ? 's' : '') + '</span>',
    '</div>',
  ].join('');
}

function glSubmitGoal() {
  var nameEl   = document.getElementById('gl-goal-name');
  var targetEl = document.getElementById('gl-goal-target');
  var yearsEl  = document.getElementById('gl-goal-years');
  var name     = nameEl   ? nameEl.value.trim()          : '';
  var target   = targetEl ? parseFloat(targetEl.value)   : 0;
  var years    = yearsEl  ? parseInt(yearsEl.value, 10)  : 0;

  if (!name || !target || !years) return;

  var futureDate = new Date();
  futureDate.setFullYear(futureDate.getFullYear() + years);

  var newGoal = {
    id:           'g' + Date.now(),
    typeId:        glDraftGoal.typeId || 'custom',
    emoji:         glDraftGoal.emoji  || '⭐',
    name:          name,
    color:         glDraftGoal.color  || '#E2E8F0',
    target:        target,
    saved:         0,
    monthlyContrib: Math.ceil(target / (years * 12)),
    targetDate:    futureDate.toISOString().split('T')[0],
  };

  goalsData.push(newGoal);
  document.getElementById('add-goal-drawer').hidePopover();
  glRenderGrid();
  glRenderHero();
}

/* ── Init ───────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', function () {
  if (!document.getElementById('gl-grid')) return;
  glRenderHero();
  glRenderGrid();
});
