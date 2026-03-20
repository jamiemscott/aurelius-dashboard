/* ── Add Investment Wizard ────────────────────────────────────── */

const WRAPPER_CAPTIONS = {
  isa:  '\u00A38,240 remaining ISA allowance this tax year',
  gia:  'No annual limit',
  sipp: '\u00A33,600\u2009/\u2009yr remaining',
  jisa: 'Not available for this fund',
};

const aiState = {
  step:       1,
  fund:       null,   // { id, name, isin, type, price, ocf }
  wrapper:    'isa',
  method:     'amount',
  amount:     0,
  units:      0,
  dealing:    'market',
  limitPrice: 0,
  tradeDate:  '',
  notes:      '',
  ref:        '',
};

/* ── Helpers ── */
function fmt(n) {
  return '\u00A3' + Number(n).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function nextBusinessDay() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  if (d.getDay() === 0) d.setDate(d.getDate() + 1);
  if (d.getDay() === 6) d.setDate(d.getDate() + 2);
  return d.toISOString().slice(0, 10);
}

/* ── Step navigation ── */
function goToStep(n) {
  // Hide all panels
  document.querySelectorAll('.ai-panel').forEach(p => p.classList.remove('is-active'));
  const target = document.getElementById('ai-panel-' + n);
  if (target) target.classList.add('is-active');

  // Update step indicators
  document.querySelectorAll('.ai-step').forEach((el, i) => {
    const stepNum = i / 2 + 1; // steps are at indices 0, 2, 4, 6 (lines interleaved)
  });

  // Re-derive from step IDs
  for (let s = 1; s <= 4; s++) {
    const el = document.getElementById('ai-step-' + s);
    if (!el) continue;
    el.classList.remove('is-active', 'is-done');
    if (s < n) el.classList.add('is-done');
    else if (s === n) {
      el.classList.add('is-active');
      el.setAttribute('aria-current', 'step');
    } else {
      el.removeAttribute('aria-current');
    }
  }

  // Update connector lines (3 lines, between steps 1-2, 2-3, 3-4)
  document.querySelectorAll('.ai-step-line').forEach((line, i) => {
    line.classList.toggle('is-filled', (i + 1) < n);
  });

  aiState.step = n;

  // Step-specific setup
  if (n === 2) populateStep2();
  if (n === 3) populateStep3();
  if (n === 4) populateStep4();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── Step 1: Fund selection ── */
document.addEventListener('DOMContentLoaded', () => {

  // Search
  const searchEl = document.getElementById('ai-search');
  if (searchEl) {
    searchEl.addEventListener('input', filterFunds);
  }

  // Filter chips
  document.querySelectorAll('.ai-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.ai-chip').forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      filterFunds();
    });
  });

  // Fund card buttons
  document.querySelectorAll('.ai-fund-card-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.ai-fund-card');
      selectFund(card);
    });
  });

  // Notes char counter
  const notesEl = document.getElementById('ai-notes');
  const notesCount = document.getElementById('ai-notes-count');
  if (notesEl && notesCount) {
    notesEl.addEventListener('input', () => {
      notesCount.textContent = notesEl.value.length;
    });
  }

  // Set default trade date
  const tradeDateEl = document.getElementById('ai-trade-date');
  if (tradeDateEl) tradeDateEl.value = nextBusinessDay();
  aiState.tradeDate = nextBusinessDay();
});

function filterFunds() {
  const query = (document.getElementById('ai-search')?.value || '').toLowerCase();
  const activeChip = document.querySelector('.ai-chip.is-active');
  const filterType = activeChip ? activeChip.dataset.filter : 'all';

  document.querySelectorAll('.ai-fund-card').forEach(card => {
    const name = (card.dataset.name || '').toLowerCase();
    const isin = (card.dataset.isin || '').toLowerCase();
    const type = (card.dataset.type || '').toLowerCase();

    const matchesSearch = !query || name.includes(query) || isin.includes(query);
    const matchesFilter = filterType === 'all' || type === filterType;

    card.classList.toggle('ai-hidden', !(matchesSearch && matchesFilter));
  });
}

function selectFund(card) {
  const wasSelected = card.classList.contains('is-selected');

  // Deselect all
  document.querySelectorAll('.ai-fund-card').forEach(c => {
    c.classList.remove('is-selected');
    const btn = c.querySelector('.ai-fund-card-btn');
    if (btn) btn.setAttribute('aria-pressed', 'false');
    const stats = c.querySelector('.ai-fund-stats');
    if (stats) stats.hidden = true;
  });

  if (!wasSelected) {
    card.classList.add('is-selected');
    const btn = card.querySelector('.ai-fund-card-btn');
    if (btn) btn.setAttribute('aria-pressed', 'true');
    const stats = card.querySelector('.ai-fund-stats');
    if (stats) stats.hidden = false;

    aiState.fund = {
      id:    card.dataset.fundId,
      name:  card.dataset.name,
      isin:  card.dataset.isin,
      type:  card.dataset.type,
      price: parseFloat(card.dataset.price) || 0,
      ocf:   card.dataset.ocf || '—',
      '1yr': card.dataset['1yr'] || '—',
      '3yr': card.dataset['3yr'] || '—',
      '5yr': card.dataset['5yr'] || '—',
      ytd:   card.dataset.ytd  || '—',
    };
  } else {
    aiState.fund = null;
  }

  // Enable / disable Continue button
  const btn1 = document.getElementById('ai-btn-1');
  if (btn1) {
    const enabled = aiState.fund !== null;
    btn1.disabled = !enabled;
    btn1.setAttribute('aria-disabled', String(!enabled));
  }
}

/* ── Step 2: Wrapper / method ── */
function setWrapper(w) {
  aiState.wrapper = w;
  document.querySelectorAll('.ai-wrapper-seg .contact-seg-btn').forEach(btn => {
    btn.classList.toggle('is-active', btn.dataset.wrapper === w);
  });
  const caption = document.getElementById('ai-wrapper-caption');
  if (caption) caption.textContent = WRAPPER_CAPTIONS[w] || '';
  updateOrderSummary();
}

function setMethod(m) {
  aiState.method = m;
  document.querySelectorAll('.ai-method-seg .contact-seg-btn').forEach(btn => {
    btn.classList.toggle('is-active', btn.dataset.method === m);
  });
  const amountWrap = document.getElementById('ai-amount-wrap');
  const unitsWrap  = document.getElementById('ai-units-wrap');
  if (amountWrap) amountWrap.hidden = (m !== 'amount');
  if (unitsWrap)  unitsWrap.hidden  = (m !== 'units');
  updateOrderSummary();
}

function handleDealingChange() {
  const val = document.getElementById('ai-dealing')?.value || 'market';
  aiState.dealing = val;
  const limitWrap = document.getElementById('ai-limit-wrap');
  if (limitWrap) limitWrap.hidden = (val !== 'limit');
}

function populateStep2() {
  if (!aiState.fund) return;
  const priceEl = document.getElementById('ai-unit-price');
  if (priceEl) priceEl.value = aiState.fund.price.toFixed(2);
  updateOrderSummary();
}

function updateOrderSummary() {
  const fund = aiState.fund;
  const price = fund ? fund.price : 0;

  let amount = 0;
  let units  = 0;

  if (aiState.method === 'amount') {
    amount = parseFloat(document.getElementById('ai-amount')?.value) || 0;
    units  = price > 0 ? amount / price : 0;
  } else {
    units  = parseFloat(document.getElementById('ai-units')?.value) || 0;
    amount = units * price;
  }

  aiState.amount = amount;
  aiState.units  = units;

  const platformFee = amount * 0.0025;
  const total = amount + platformFee;

  const wrapperLabel = aiState.wrapper.toUpperCase();
  const dealingLabel = aiState.dealing === 'market' ? 'At next available price' : 'Limit order';

  setText('ai-os-fund-name', fund ? fund.name : '\u2014');
  setText('ai-os-sub', fund ? wrapperLabel + ' \u00B7 ' + dealingLabel : '\u2014');
  setText('ai-os-amount',       amount > 0 ? fmt(amount)      : '\u2014');
  setText('ai-os-price',        price  > 0 ? fmt(price)       : '\u2014');
  setText('ai-os-units',        units  > 0 ? units.toFixed(4) : '\u2014');
  setText('ai-os-platform-fee', amount > 0 ? fmt(platformFee) : '\u2014');
  setText('ai-os-total',        total  > 0 ? fmt(total)       : '\u2014');
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

/* ── Step 3: Review & confirm ── */
function populateStep3() {
  const fund    = aiState.fund;
  const price   = fund ? fund.price : 0;
  const amount  = aiState.amount;
  const units   = aiState.units;
  const platformFee = amount * 0.0025;
  const total   = amount + platformFee;
  const tradeDate = document.getElementById('ai-trade-date')?.value || aiState.tradeDate;
  const dealingLabel = aiState.dealing === 'market' ? 'At next available price' : 'Limit order';

  const reviewRows = [
    ['Fund',          fund ? fund.name : '\u2014'],
    ['ISIN',          fund ? fund.isin : '\u2014'],
    ['Wrapper',       aiState.wrapper.toUpperCase()],
    ['Amount',        amount > 0 ? fmt(amount) : '\u2014'],
    ['Est. unit price', price > 0 ? fmt(price) : '\u2014'],
    ['Est. units',    units > 0 ? units.toFixed(4) : '\u2014'],
    ['Trade date',    tradeDate || '\u2014'],
    ['Dealing',       dealingLabel],
  ];

  const reviewTable = document.getElementById('ai-review-table');
  if (reviewTable) {
    reviewTable.innerHTML = reviewRows.map(([label, val]) =>
      `<div class="ai-review-row"><dt>${label}</dt><dd>${val}</dd></div>`
    ).join('');
  }

  const chargeRows = [
    ['OCF (annual)',     fund ? fund.ocf : '\u2014'],
    ['Platform fee (0.25%)', amount > 0 ? fmt(platformFee) : '\u2014'],
    ['Dealing charge',  '\u00A30.00'],
    ['Est. total',       total > 0 ? fmt(total) : '\u2014'],
  ];

  const regCharges = document.getElementById('ai-reg-charges');
  if (regCharges) {
    regCharges.innerHTML = chargeRows.map(([label, val], i) => {
      const isTotal = i === chargeRows.length - 1;
      return `<div class="ai-reg-row${isTotal ? ' is-total' : ''}"><dt>${label}</dt><dd>${val}</dd></div>`;
    }).join('');
  }

  // Reset acknowledgement
  const ackEl = document.getElementById('ai-ack');
  if (ackEl) ackEl.checked = false;
  togglePlaceBtn();
}

function togglePlaceBtn() {
  const checked = document.getElementById('ai-ack')?.checked || false;
  const btn = document.getElementById('ai-btn-3');
  if (btn) {
    btn.disabled = !checked;
    btn.setAttribute('aria-disabled', String(!checked));
  }
}

/* ── Submit ── */
function submitInstruction() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  aiState.ref = 'REF-' + dateStr + '-' + rand;
  goToStep(4);
}

/* ── Step 4: Confirmation ── */
function populateStep4() {
  setText('ai-confirm-ref', aiState.ref);

  const fund   = aiState.fund;
  const amount = aiState.amount;
  const units  = aiState.units;
  const tradeDate = document.getElementById('ai-trade-date')?.value || aiState.tradeDate;

  const summaryRows = [
    ['Fund',     fund ? fund.name : '\u2014'],
    ['Wrapper',  aiState.wrapper.toUpperCase()],
    ['Amount',   amount > 0 ? fmt(amount) : '\u2014'],
    ['Est. units', units > 0 ? units.toFixed(4) : '\u2014'],
    ['Trade date', tradeDate || '\u2014'],
  ];

  const summaryEl = document.getElementById('ai-confirm-summary');
  if (summaryEl) {
    summaryEl.innerHTML = summaryRows.map(([label, val]) =>
      `<div class="ai-review-row"><dt>${label}</dt><dd>${val}</dd></div>`
    ).join('');
  }

  // Replay animation by re-inserting SVG
  const checkEl = document.querySelector('.ai-confirm-check');
  if (checkEl) {
    const svg = checkEl.querySelector('.ai-check-svg');
    if (svg) {
      const clone = svg.cloneNode(true);
      svg.replaceWith(clone);
    }
  }
}

/* ── Reset wizard ── */
function resetWizard() {
  aiState.step    = 1;
  aiState.fund    = null;
  aiState.wrapper = 'isa';
  aiState.method  = 'amount';
  aiState.amount  = 0;
  aiState.units   = 0;
  aiState.dealing = 'market';
  aiState.notes   = '';
  aiState.ref     = '';

  // Clear fund selection
  document.querySelectorAll('.ai-fund-card').forEach(c => {
    c.classList.remove('is-selected');
    const btn = c.querySelector('.ai-fund-card-btn');
    if (btn) btn.setAttribute('aria-pressed', 'false');
    const stats = c.querySelector('.ai-fund-stats');
    if (stats) stats.hidden = true;
  });

  // Reset form fields
  const amountEl = document.getElementById('ai-amount');
  if (amountEl) amountEl.value = '';
  const unitsEl = document.getElementById('ai-units');
  if (unitsEl) unitsEl.value = '';
  const notesEl = document.getElementById('ai-notes');
  if (notesEl) notesEl.value = '';
  const tradeDateEl = document.getElementById('ai-trade-date');
  if (tradeDateEl) tradeDateEl.value = nextBusinessDay();
  const dealingEl = document.getElementById('ai-dealing');
  if (dealingEl) dealingEl.value = 'market';
  const limitWrap = document.getElementById('ai-limit-wrap');
  if (limitWrap) limitWrap.hidden = true;

  // Reset search
  const searchEl = document.getElementById('ai-search');
  if (searchEl) searchEl.value = '';
  document.querySelectorAll('.ai-chip').forEach(c => c.classList.remove('is-active'));
  const allChip = document.querySelector('.ai-chip[data-filter="all"]');
  if (allChip) allChip.classList.add('is-active');
  filterFunds();

  // Reset wrapper + method UI
  setWrapper('isa');
  setMethod('amount');

  goToStep(1);
}
