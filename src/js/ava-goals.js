/* ─── AVA GOAL DISCOVERY ─────────────────────────────────────
   Conversational goal-discovery flow. Ava asks three short,
   carefully framed questions — always about what the user
   *wants*, never about their personal circumstances — then
   suggests 2–3 goals that fit their answers.

   Sensitivity rules:
   - Questions are aspiration-based, never circumstance-based.
     We never ask about family status, relationships, health,
     or bereavement. Goal types related to those topics exist
     in the picker so users can choose them freely — we simply
     don't steer people towards them via probing questions.
   - All copy is warm and non-assumptive.
   - "Start a family" is available as a goal type in the main
     picker but is excluded from Ava's suggestions. Users who
     want it will find it there on their own terms.
   ─────────────────────────────────────────────────────────── */

/* ── Question definitions ──────────────────────────────────── */

var avaQuestions = [
  {
    id: 'chapter',
    text: 'To point you in the right direction — where are you in your financial journey right now?',
    chips: [
      { id: 'starting',   label: 'Just getting started' },
      { id: 'building',   label: 'Building steadily'    },
      { id: 'established',label: 'In a good rhythm'     },
      { id: 'planning',   label: 'Thinking ahead'       },
    ],
  },
  {
    id: 'priority',
    text: 'What would make the biggest difference to how you feel about your finances right now?',
    chips: [
      { id: 'security',   label: 'Feeling more secure'     },
      { id: 'experience', label: 'A big experience'        },
      { id: 'roots',      label: 'Putting down roots'      },
      { id: 'growth',     label: 'Growing my wealth'       },
      { id: 'freedom',    label: 'More freedom'            },
    ],
  },
  {
    id: 'horizon',
    text: 'Are you thinking about a short-term win, or playing the longer game?',
    chips: [
      { id: 'short',  label: '1 – 3 years'     },
      { id: 'medium', label: '3 – 7 years'      },
      { id: 'long',   label: '7 years or more'  },
      { id: 'mix',    label: 'A mix of both'    },
    ],
  },
];

/* ── Suggestion logic ──────────────────────────────────────── */
/* Maps combinations of answers to goal type IDs from goalTypes.
   Deliberately excludes 'family' — see sensitivity note above.
   Each entry: [chapter, priority, horizon] → [typeId, ...].   */

function avaSuggest(answers) {
  var chapter  = answers.chapter;
  var priority = answers.priority;
  var horizon  = answers.horizon;

  /* Primary suggestion always derived from priority + horizon.
     Secondary / tertiary pulled from chapter context.          */

  var suggestions = [];

  /* Security → emergency fund first, then depends on horizon  */
  if (priority === 'security') {
    suggestions.push('emergency');
    if (horizon === 'short' || horizon === 'mix')  suggestions.push('holiday');
    if (horizon === 'medium' || horizon === 'long') suggestions.push('home');
    if (chapter === 'planning' || horizon === 'long') suggestions.push('retirement');
  }

  /* Experience → holidays, sabbatical                         */
  if (priority === 'experience') {
    suggestions.push('holiday');
    suggestions.push('sabbatical');
    if (horizon === 'long') suggestions.push('retirement');
    if (horizon === 'short' || horizon === 'mix') suggestions.push('emergency');
  }

  /* Putting down roots → home, then education                 */
  if (priority === 'roots') {
    suggestions.push('home');
    if (horizon === 'medium' || horizon === 'long') suggestions.push('education');
    if (horizon === 'long') suggestions.push('retirement');
    if (chapter === 'starting' || chapter === 'building') suggestions.push('emergency');
  }

  /* Growth → retirement / long-term, custom                   */
  if (priority === 'growth') {
    if (horizon === 'long' || horizon === 'mix') suggestions.push('retirement');
    suggestions.push('home');
    if (chapter === 'starting' || chapter === 'building') suggestions.push('emergency');
    suggestions.push('custom');
  }

  /* Freedom → sabbatical, retirement, custom                  */
  if (priority === 'freedom') {
    suggestions.push('sabbatical');
    suggestions.push('retirement');
    if (horizon === 'short') suggestions.push('holiday');
    suggestions.push('custom');
  }

  /* Deduplicate and take the top 3 */
  var seen = {};
  var unique = [];
  suggestions.forEach(function(id) {
    if (!seen[id]) { seen[id] = true; unique.push(id); }
  });
  return unique.slice(0, 3);
}

/* Short reason copy personalised to the answer combination    */
function avaReason(typeId, answers) {
  var reasons = {
    emergency: {
      security:   'A solid rainy day fund is the foundation everything else rests on.',
      experience: 'Peace of mind first — then the adventure feels even better.',
      roots:      'Worth having in place before taking on a bigger commitment.',
      growth:     'A safety net lets you take smarter risks with the rest.',
      freedom:    'Financial freedom starts with knowing you\'re covered.',
    },
    holiday: {
      security:   'A well-earned break is good for perspective, not just pleasure.',
      experience: 'Sounds like you\'re ready for something to look forward to.',
      roots:      'A manageable, rewarding goal to build momentum.',
      growth:     'A near-term win alongside longer-term ambitions.',
      freedom:    'The first taste of spending on your own terms.',
    },
    home: {
      security:   'Owning your home is one of the most powerful anchors of financial security.',
      experience: 'A home gives you the stable base to launch from.',
      roots:      'Putting down roots — this one feels right for where you are.',
      growth:     'Property remains one of the most tangible forms of wealth-building.',
      freedom:    'Owning outright removes one of life\'s biggest monthly commitments.',
    },
    education: {
      security:   'Investing in knowledge pays the best interest.',
      experience: 'An education goal opens doors to experiences money alone can\'t buy.',
      roots:      'A meaningful long-term investment, however you look at it.',
      growth:     'Skills and qualifications compound in ways most assets can\'t.',
      freedom:    'Education is one of the most direct routes to more choices.',
    },
    car: {
      security:   'Reliable transport on your own terms — practical and freeing.',
      experience: 'The right car makes every journey part of the adventure.',
      roots:      'A sensible, satisfying medium-term goal.',
      growth:     'A clear, achievable milestone to build saving discipline.',
      freedom:    'Getting where you want, when you want.',
    },
    retirement: {
      security:   'The earlier you start, the lighter the lift. Future you will be grateful.',
      experience: 'Time is the rarest luxury — building towards it early is smart.',
      roots:      'A long-term goal worth layering in alongside the nearer ones.',
      growth:     'Compound growth over time is the most powerful force in investing.',
      freedom:    'This is the one — the goal that makes all the others possible.',
    },
    sabbatical: {
      security:   'A funded sabbatical removes the fear from the decision to step back.',
      experience: 'Time away — fully funded — is an experience unlike any other.',
      roots:      'Sometimes a change of pace is how you find where you truly want to be.',
      growth:     'Clarity and rest often return more than another year of grinding.',
      freedom:    'This is what saving for freedom actually looks like in practice.',
    },
    custom: {
      security:   'If none of the above quite fits, name the goal that does.',
      experience: 'Your ideal experience might not have a label yet — that\'s fine.',
      roots:      'The goal that matters most to you is the right one to chase.',
      growth:     'Sometimes the best investment is the one only you can see.',
      freedom:    'Freedom means something different to everyone. Define yours.',
    },
  };
  var byType = reasons[typeId];
  return byType ? (byType[answers.priority] || byType.growth) : '';
}

/* Suggested target and timeline based on goal type + horizon  */
function avaMeta(typeId, horizon) {
  var meta = {
    emergency:  { short: 'Target: 3–6 months of expenses · Start anytime',       medium: 'Target: 6–12 months of expenses · Build at your pace', long: 'Target: 12 months of expenses · Steady and thorough' },
    holiday:    { short: 'Target: £3,000 – £8,000 · 1–2 years',                  medium: 'Target: £10,000 – £20,000 · 3–5 years',               long: 'Target: £20,000+ · The trip of a lifetime'            },
    home:       { short: 'Target: £20,000 – £30,000 · Starter deposit',           medium: 'Target: £40,000 – £80,000 · 3–7 years',               long: 'Target: £80,000+ · Long-term deposit build'           },
    education:  { short: 'Target: £5,000 – £15,000 · 1–3 years',                 medium: 'Target: £20,000 – £40,000 · 3–7 years',               long: 'Target: £50,000+ · University or beyond'              },
    car:        { short: 'Target: £8,000 – £20,000 · 1–3 years',                 medium: 'Target: £20,000 – £40,000 · 3–5 years',               long: 'Target: £40,000+ · Worth the wait'                    },
    retirement: { short: 'Target: Maximise pension contributions now',            medium: 'Target: £50,000+ · Meaningful head start',            long: 'Target: 25× annual expenses · The full picture'       },
    sabbatical: { short: 'Target: £10,000 – £20,000 · 1–3 years',                medium: 'Target: £20,000 – £40,000 · 3–5 years',               long: 'Target: £40,000+ · Extended time away'                },
    custom:     { short: 'Target: Your call · Make it specific and achievable',   medium: 'Target: Your call · Aim high, track monthly',         long: 'Target: Your call · Dream big'                        },
  };
  var h = (horizon === 'mix') ? 'medium' : (horizon || 'medium');
  return meta[typeId] ? meta[typeId][h] : '';
}

/* ── State ─────────────────────────────────────────────────── */

var avaState = {
  step:    0,          /* 0 = not started, 1-3 = questions, 4 = results */
  answers: {},
};

/* ── DOM helpers ────────────────────────────────────────────── */

function avaPanel()  { return document.getElementById('ava-panel'); }
function avaBody()   { return document.getElementById('ava-panel-body'); }

function avaAppend(html) {
  var body = avaBody();
  if (!body) return;
  var wrap = document.createElement('div');
  wrap.innerHTML = html;
  while (wrap.firstChild) body.appendChild(wrap.firstChild);
}

function avaRemoveTyping() {
  var t = document.getElementById('ava-typing');
  if (t) t.parentElement.remove();
}

function avaUpdateProgress() {
  var dots = document.querySelectorAll('.ava-progress-dot');
  dots.forEach(function(d, i) {
    d.classList.remove('is-done', 'is-current');
    if (i < avaState.step - 1) d.classList.add('is-done');
    else if (i === avaState.step - 1) d.classList.add('is-current');
  });
}

/* ── Render helpers ─────────────────────────────────────────── */

function avaBubble(text) {
  return [
    '<div class="ava-bubble-row">',
      '<div class="ava-bubble-avatar" aria-hidden="true">A</div>',
      '<div class="ava-bubble">', text, '</div>',
    '</div>',
  ].join('');
}

function avaTypingIndicator() {
  return [
    '<div class="ava-typing-row">',
      '<div class="ava-bubble-avatar" aria-hidden="true">A</div>',
      '<div class="ava-typing" id="ava-typing" role="status" aria-label="Ava is thinking">',
        '<span></span><span></span><span></span>',
      '</div>',
    '</div>',
  ].join('');
}

function avaChips(chips, questionId) {
  return [
    '<div class="ava-chips" role="group" aria-label="Choose your answer">',
      chips.map(function(c) {
        return '<button class="ava-chip" data-ava-chip="' + questionId + '" data-ava-value="' + c.id + '" data-ava-label="' + c.label + '">' + c.label + '</button>';
      }).join(''),
    '</div>',
  ].join('');
}

function avaReplyBubble(label) {
  return '<div class="ava-reply-row"><div class="ava-reply-bubble">' + label + '</div></div>';
}

/* ── Conversation flow ──────────────────────────────────────── */

function avaLayout() { return document.querySelector('.gl-layout'); }

function avaOpen() {
  var panel = avaPanel();
  if (!panel) return;
  /* Hide entry card, show panel in its place */
  var container = document.getElementById('ava-entry-container');
  if (container) container.hidden = true;
  /* Stretch right column to match left */
  var layout = avaLayout();
  if (layout) layout.classList.add('ava-is-open');
  panel.classList.add('is-open');
  avaState.step    = 0;
  avaState.answers = {};
  avaStart();
}

function avaClose() {
  var panel = avaPanel();
  if (!panel) return;
  panel.classList.remove('is-open');
  var body = avaBody();
  if (body) body.innerHTML = '';
  avaState.step    = 0;
  avaState.answers = {};
  /* Restore entry card + collapse right column */
  var container = document.getElementById('ava-entry-container');
  if (container) container.hidden = false;
  var layout = avaLayout();
  if (layout) layout.classList.remove('ava-is-open');
}

function avaStart() {
  var body = avaBody();
  if (!body) return;
  body.innerHTML = '';

  /* Progress dots */
  avaAppend(
    '<div class="ava-progress" role="progressbar" aria-label="Question progress" aria-valuenow="1" aria-valuemin="1" aria-valuemax="' + avaQuestions.length + '">' +
      avaQuestions.map(function(_, i) { return '<div class="ava-progress-dot' + (i === 0 ? ' is-current' : '') + '"></div>'; }).join('') +
    '</div>'
  );

  avaState.step = 1;
  avaAskQuestion(0);
}

function avaAskQuestion(idx) {
  var q = avaQuestions[idx];
  if (!q) return;
  avaAppend(avaBubble(q.text));
  avaAppend(avaChips(q.chips, q.id));
}

function avaHandleChip(questionId, value, label) {
  /* Lock chips — disable the answered group */
  var chips = document.querySelectorAll('[data-ava-chip="' + questionId + '"]');
  chips.forEach(function(c) {
    c.classList.remove('is-selected');
    c.setAttribute('disabled', '');
    c.style.opacity = c.dataset.avaValue === value ? '1' : '0.35';
  });
  /* Highlight the picked one */
  var picked = document.querySelector('[data-ava-chip="' + questionId + '"][data-ava-value="' + value + '"]');
  if (picked) { picked.classList.add('is-selected'); picked.style.opacity = '1'; }

  /* Record answer */
  avaState.answers[questionId] = value;

  /* User reply bubble */
  avaAppend(avaReplyBubble(label));

  /* Show typing then next step */
  avaAppend(avaTypingIndicator());
  scrollToAvaBottom();

  var nextIdx = avaState.step; /* step is 1-based, idx is 0-based, so step === next idx */
  avaState.step++;
  avaUpdateProgress();

  setTimeout(function() {
    avaRemoveTyping();
    if (nextIdx < avaQuestions.length) {
      avaAskQuestion(nextIdx);
    } else {
      avaShowResults();
    }
    scrollToAvaBottom();
  }, 900);
}

function avaShowResults() {
  var typeIds    = avaSuggest(avaState.answers);
  var priority   = avaState.answers.priority || 'growth';
  var horizon    = avaState.answers.horizon  || 'medium';

  var closingMsg = 'Based on what you\'ve shared, here\'s where I\'d suggest putting your focus:';
  avaAppend(avaBubble(closingMsg));

  var cardsHtml = typeIds.map(function(typeId) {
    var type   = goalTypes.find(function(t) { return t.id === typeId; });
    if (!type) return '';
    var reason = avaReason(typeId, avaState.answers);
    var meta   = avaMeta(typeId, horizon);
    return [
      '<button class="ava-suggestion-card" data-ava-suggest="' + typeId + '" aria-label="Set up a goal: ' + type.label + '">',
        '<div class="ava-suggestion-emoji" aria-hidden="true">', type.emoji, '</div>',
        '<div class="ava-suggestion-label">', type.label, '</div>',
        meta ? '<div class="ava-suggestion-meta">' + meta + '</div>' : '',
        '<div class="ava-suggestion-reason">', reason, '</div>',
        '<div class="ava-suggestion-cta">',
          'Set this goal',
          '<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>',
        '</div>',
      '</button>',
    ].join('');
  }).join('');

  avaAppend('<div class="ava-suggestions">' + cardsHtml + '</div>');
  avaAppend('<button class="ava-panel-restart" data-action="ava-restart">Start over</button>');
  scrollToAvaBottom();
}

function scrollToAvaBottom() {
  var body = avaBody();
  if (body) body.scrollTop = body.scrollHeight;
}

/* ── Entry card HTML ────────────────────────────────────────── */

function avaEntryCard() {
  return [
    '<button class="ava-entry-card" data-action="ava-open" aria-expanded="false" aria-controls="ava-panel">',
      '<div class="ava-entry-hd">',
        '<div class="ava-entry-avatar" aria-hidden="true">',
          '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">',
            '<circle cx="12" cy="12" r="3"/>',
            '<line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/>',
            '<line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/>',
            '<line x1="4.93" y1="4.93" x2="7.05" y2="7.05"/><line x1="16.95" y1="16.95" x2="19.07" y2="19.07"/>',
            '<line x1="19.07" y1="4.93" x2="16.95" y2="7.05"/><line x1="7.05" y1="16.95" x2="4.93" y2="19.07"/>',
          '</svg>',
        '</div>',
        '<span class="ava-entry-name">Ava</span>',
      '</div>',
      '<p class="ava-entry-heading">Not sure where to set your sights?</p>',
      '<p class="ava-entry-sub">Answer three quick questions and I\'ll suggest goals that actually fit where you are.</p>',
      '<span class="ava-entry-cta" aria-hidden="true">',
        'Let\'s figure it out',
        '<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>',
      '</span>',
    '</button>',
  ].join('');
}

/* ── Card height sync ───────────────────────────────────────── */
/* Matches the Ava entry card height to a single goal card so the
   two columns feel visually balanced at rest. A ResizeObserver
   keeps them in sync if the viewport changes.                   */

function avaSyncCardHeight() {
  var card      = document.querySelector('.gl-card');
  var container = document.getElementById('ava-entry-container');
  if (!card || !container) return;
  var entryCard = container.querySelector('.ava-entry-card');
  if (!entryCard) return;
  var h = Math.round(card.getBoundingClientRect().height);
  if (h > 0) entryCard.style.height = h + 'px';
}

/* ── Init ───────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', function() {
  if (!document.getElementById('ava-entry-container')) return;
  avaMountEntryCard();
  /* Sync after paint so card dimensions are finalised */
  requestAnimationFrame(function() {
    avaSyncCardHeight();
  });
  /* Re-sync on resize */
  if (window.ResizeObserver) {
    var firstCard = document.querySelector('.gl-card');
    if (firstCard) {
      new ResizeObserver(avaSyncCardHeight).observe(firstCard);
    }
  }
});

/* ── Entry card mount ───────────────────────────────────────── */
/* Renders the entry card into #ava-entry-container on load.
   The container lives in the right column of the goals layout,
   separate from the goals grid.                                */

function avaMountEntryCard() {
  var container = document.getElementById('ava-entry-container');
  if (!container) return;
  container.innerHTML = avaEntryCard();
}

/* ── Event wiring ───────────────────────────────────────────── */

document.addEventListener('click', function(e) {
  var el = e.target.closest('[data-action]') || e.target.closest('[data-ava-chip]') || e.target.closest('[data-ava-suggest]');
  if (!el) return;

  /* Open the panel */
  if (el.dataset.action === 'ava-open') {
    avaOpen();
    el.setAttribute('aria-expanded', 'true');
    var panel = avaPanel();
    if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    return;
  }

  /* Close the panel */
  if (el.dataset.action === 'ava-close') {
    avaClose();
    var card = document.querySelector('[data-action="ava-open"]');
    if (card) card.setAttribute('aria-expanded', 'false');
    return;
  }

  /* Restart conversation */
  if (el.dataset.action === 'ava-restart') {
    var body = avaBody();
    if (body) body.innerHTML = '';
    avaState.step    = 0;
    avaState.answers = {};
    avaStart();
    return;
  }

  /* Answer chip */
  if (el.dataset.avaChip) {
    avaHandleChip(el.dataset.avaChip, el.dataset.avaValue, el.dataset.avaLabel);
    return;
  }

  /* Suggestion card → pre-fill the add-goal drawer */
  if (el.dataset.avaSuggest) {
    avaClose();
    var card2 = document.querySelector('[data-action="ava-open"]');
    if (card2) card2.setAttribute('aria-expanded', 'false');
    /* Delegate to the existing goal flow */
    glSelectType(el.dataset.avaSuggest);
    var drawer = document.getElementById('add-goal-drawer');
    if (drawer) {
      drawer.removeAttribute('hidden');
      drawer.focus();
    }
    return;
  }
});
