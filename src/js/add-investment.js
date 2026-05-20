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

  // Reset smart search
  const promptEl = document.getElementById('ais-prompt');
  if (promptEl) promptEl.value = '';
  const sendBtn = document.getElementById('ais-prompt-send');
  if (sendBtn) sendBtn.classList.remove('is-visible');
  const resultsWrap = document.getElementById('ais-results-wrap');
  if (resultsWrap) resultsWrap.hidden = true;
  const thinkingEl = document.getElementById('ais-thinking');
  if (thinkingEl) thinkingEl.classList.remove('is-active');
  setSearchMode('browse');

  goToStep(1);
}

/* ── Smart Search ────────────────────────────────────────────────── */

const SMART_DB = [
  {
    id: 'azn',
    name: 'AstraZeneca PLC',
    ticker: 'AZN',
    isin: 'GB0009895292',
    type: 'share',
    typeLabel: 'FTSE 100 Share',
    price: 11240.00,
    logoInitials: 'AZ',
    logoColor: '#1B5FAA',
    matchReason: 'British · Pharmaceuticals · FTSE 100',
    bio: 'One of the world\'s largest pharmaceutical companies, headquartered in Cambridge. AstraZeneca develops oncology, cardiovascular and respiratory medicines — best known for its cancer drug portfolio and global vaccines programme.',
    trustSignals: [
      { icon: 'building', text: 'FTSE 100' },
      { icon: 'chart', text: '£182bn market cap' },
      { icon: 'calendar', text: 'Est. 1999' },
      { icon: 'dividend', text: '3.2% dividend yield' },
    ],
    '1yr': '+14.2%', '3yr': '+38.6%', '5yr': '+62.1%', ytd: '+6.8%',
    ocf: '—', risk: 6,
    keywords: ['pharma', 'pharmaceutical', 'british', 'uk', 'medicine', 'drug', 'biotech', 'cancer', 'healthcare', 'astrazeneca', 'azn', 'cambridge', 'big', 'large'],
  },
  {
    id: 'gsk',
    name: 'GSK plc',
    ticker: 'GSK',
    isin: 'GB0009252882',
    type: 'share',
    typeLabel: 'FTSE 100 Share',
    price: 1584.50,
    logoInitials: 'GSK',
    logoColor: '#E05C00',
    matchReason: 'British · Biopharmaceuticals · FTSE 100',
    bio: 'A global biopharma leader with 170+ years of heritage, focusing on vaccines, HIV medicines and specialty pharmaceuticals. GSK is one of the UK\'s largest companies and a consistent dividend payer.',
    trustSignals: [
      { icon: 'building', text: 'FTSE 100' },
      { icon: 'chart', text: '£63bn market cap' },
      { icon: 'calendar', text: 'Est. 1830s' },
      { icon: 'dividend', text: '3.8% dividend yield' },
    ],
    '1yr': '+9.4%', '3yr': '+22.1%', '5yr': '+31.8%', ytd: '+3.1%',
    ocf: '—', risk: 5,
    keywords: ['pharma', 'pharmaceutical', 'british', 'uk', 'medicine', 'drug', 'vaccine', 'healthcare', 'gsk', 'glaxo', 'biopharma', 'big', 'large'],
  },
  {
    id: 'hsba',
    name: 'HSBC Holdings PLC',
    ticker: 'HSBA',
    isin: 'GB0005405286',
    type: 'share',
    typeLabel: 'FTSE 100 Share',
    price: 762.20,
    logoInitials: 'HS',
    logoColor: '#DB0011',
    matchReason: 'British · Banking · High Dividend',
    bio: 'One of the world\'s largest banks with 40 million customers across 60+ countries. Founded in Hong Kong in 1865, now London-headquartered. Renowned for its emerging markets exposure and generous, consistent dividends.',
    trustSignals: [
      { icon: 'building', text: 'FTSE 100' },
      { icon: 'chart', text: '£148bn market cap' },
      { icon: 'calendar', text: 'Est. 1865' },
      { icon: 'dividend', text: '5.1% dividend yield' },
    ],
    '1yr': '+22.8%', '3yr': '+51.4%', '5yr': '+44.3%', ytd: '+8.2%',
    ocf: '—', risk: 5,
    keywords: ['bank', 'banking', 'british', 'uk', 'finance', 'global', 'income', 'dividend', 'hsbc', 'emerging', 'high yield'],
  },
  {
    id: 'shel',
    name: 'Shell PLC',
    ticker: 'SHEL',
    isin: 'GB00BP6MXD84',
    type: 'share',
    typeLabel: 'FTSE 100 Share',
    price: 2612.00,
    logoInitials: 'SH',
    logoColor: '#DD1D21',
    matchReason: 'British · Energy · Dividend Income',
    bio: 'One of the world\'s largest integrated energy companies, operating in 70+ countries and investing heavily in renewables alongside traditional oil and gas. Shell generates substantial cash flows and returns significant capital to shareholders.',
    trustSignals: [
      { icon: 'building', text: 'FTSE 100' },
      { icon: 'chart', text: '£168bn market cap' },
      { icon: 'calendar', text: 'Est. 1907' },
      { icon: 'dividend', text: '4.2% dividend yield' },
    ],
    '1yr': '+6.3%', '3yr': '+44.8%', '5yr': '+35.7%', ytd: '+1.9%',
    ocf: '—', risk: 5,
    keywords: ['energy', 'oil', 'gas', 'british', 'uk', 'dividend', 'income', 'transition', 'renewable', 'shell', 'fossil', 'carbon', 'sustainable'],
  },
  {
    id: 'ulvr',
    name: 'Unilever PLC',
    ticker: 'ULVR',
    isin: 'GB00B10RZP78',
    type: 'share',
    typeLabel: 'FTSE 100 Share',
    price: 4218.00,
    logoInitials: 'UL',
    logoColor: '#1F3668',
    matchReason: 'British · Consumer Goods · Defensive',
    bio: 'Owner of 400+ iconic household brands — including Dove, Ben & Jerry\'s and Domestos — sold across 190 countries. A classic defensive stock offering steady growth, reliable dividends, and significant emerging markets revenue.',
    trustSignals: [
      { icon: 'building', text: 'FTSE 100' },
      { icon: 'chart', text: '£105bn market cap' },
      { icon: 'calendar', text: 'Est. 1929' },
      { icon: 'dividend', text: '3.4% dividend yield' },
    ],
    '1yr': '+12.1%', '3yr': '+8.4%', '5yr': '+22.6%', ytd: '+5.3%',
    ocf: '—', risk: 4,
    keywords: ['consumer', 'fmcg', 'goods', 'british', 'uk', 'defensive', 'stable', 'dividend', 'unilever', 'brands', 'household', 'everyday'],
  },
  {
    id: 'vwrl',
    name: 'Vanguard FTSE All-World ETF',
    ticker: 'VWRL',
    isin: 'IE00B3RBWM25',
    type: 'etf',
    typeLabel: 'Global Equity ETF',
    price: 91.24,
    logoInitials: 'VG',
    logoColor: '#8B1A1A',
    matchReason: 'Global · Passive · Ultra-low cost',
    bio: 'The most popular single-fund global tracker, holding 3,900+ companies across 50 countries in a single holding. Trusted by millions of long-term investors worldwide for its simplicity, ultra-low cost, and total market coverage across developed and emerging markets.',
    trustSignals: [
      { icon: 'aum', text: '$40bn AUM' },
      { icon: 'calendar', text: 'Launched 2012' },
      { icon: 'manager', text: 'Vanguard Group' },
      { icon: 'ocf', text: '0.22% OCF' },
    ],
    '1yr': '+18.4%', '3yr': '+42.1%', '5yr': '+73.6%', ytd: '+4.2%',
    ocf: '0.22%', risk: 5,
    keywords: ['global', 'world', 'diversified', 'everything', 'etf', 'vanguard', 'low cost', 'cheap', 'index', 'passive', 'tracker', 'all', 'broad'],
  },
  {
    id: 'iwrd',
    name: 'iShares Core MSCI World ETF',
    ticker: 'IWRD',
    isin: 'IE00B4L5Y983',
    type: 'etf',
    typeLabel: 'Global Equity ETF',
    price: 78.35,
    logoInitials: 'iS',
    logoColor: '#006A4E',
    matchReason: 'Developed Markets · Passive · Low cost',
    bio: 'Tracks the MSCI World Index with 1,600+ large and mid-cap companies across 23 developed markets. One of the lowest-cost global ETFs available, with near-perfect index tracking and enormous daily liquidity.',
    trustSignals: [
      { icon: 'aum', text: '$65bn AUM' },
      { icon: 'calendar', text: 'Launched 2009' },
      { icon: 'manager', text: 'BlackRock iShares' },
      { icon: 'ocf', text: '0.20% OCF' },
    ],
    '1yr': '+19.1%', '3yr': '+44.7%', '5yr': '+79.2%', ytd: '+4.8%',
    ocf: '0.20%', risk: 5,
    keywords: ['global', 'world', 'developed', 'etf', 'ishares', 'blackrock', 'low cost', 'cheap', 'index', 'passive', 'tracker', 'msci', 'broad'],
  },
  {
    id: 'fundsmith',
    name: 'Fundsmith Equity Fund T Acc',
    ticker: 'FUNDX',
    isin: 'GB00B4Q5X527',
    type: 'fund',
    typeLabel: 'Global Equity Fund',
    price: 622.50,
    logoInitials: 'FS',
    logoColor: '#2C5F2E',
    matchReason: 'Active · Quality Growth · Highly Rated',
    bio: 'Britain\'s most popular active fund. Terry Smith\'s "buy good companies, don\'t overpay, do nothing" philosophy has delivered exceptional long-term returns. A concentrated portfolio of 25–30 quality global businesses — many household names.',
    trustSignals: [
      { icon: 'aum', text: '£22bn AUM' },
      { icon: 'manager', text: 'Terry Smith' },
      { icon: 'calendar', text: 'Launched 2010' },
      { icon: 'rating', text: '5-star rated' },
    ],
    '1yr': '+11.2%', '3yr': '+18.4%', '5yr': '+51.3%', ytd: '+2.1%',
    ocf: '1.05%', risk: 6,
    keywords: ['active', 'fundsmith', 'terry smith', 'global', 'quality', 'long term', 'concentrated', 'british', 'popular', 'managed', 'stock picking'],
  },
  {
    id: 'ls80',
    name: 'Vanguard LifeStrategy 80% Equity',
    ticker: 'VASF',
    isin: 'GB00B4PQW151',
    type: 'fund',
    typeLabel: 'Mixed Asset Fund',
    price: 312.18,
    logoInitials: 'LS',
    logoColor: '#8B1A1A',
    matchReason: 'Balanced · Low cost · Auto-rebalancing',
    bio: 'A ready-made portfolio targeting 80% global equities and 20% bonds, automatically rebalanced. Ideal for investors who want broad diversification and long-term growth without the complexity of managing multiple funds.',
    trustSignals: [
      { icon: 'aum', text: '£9bn AUM' },
      { icon: 'manager', text: 'Vanguard Group' },
      { icon: 'calendar', text: 'Launched 2011' },
      { icon: 'ocf', text: '0.22% OCF' },
    ],
    '1yr': '+13.7%', '3yr': '+24.9%', '5yr': '+58.2%', ytd: '+3.1%',
    ocf: '0.22%', risk: 4,
    keywords: ['balanced', 'mixed', 'bond', 'equity', 'vanguard', 'lifestrategy', 'diversified', 'ready', 'simple', 'moderate', 'cautious', 'auto'],
  },
  {
    id: 'rlei',
    name: 'Royal London UK Equity Income',
    ticker: 'RLEIF',
    isin: 'GB00B3LRCQ57',
    type: 'fund',
    typeLabel: 'UK Equity Fund',
    price: 215.64,
    logoInitials: 'RL',
    logoColor: '#7B1F3C',
    matchReason: 'UK · Income · Actively Managed',
    bio: 'An award-winning UK equity income fund targeting dividends above the FTSE All-Share yield. Focuses on attractively valued UK companies with strong cash generation — a popular choice for income-seeking investors.',
    trustSignals: [
      { icon: 'aum', text: '£1.8bn AUM' },
      { icon: 'manager', text: 'Royal London AM' },
      { icon: 'calendar', text: 'Launched 1988' },
      { icon: 'rating', text: '4-star rated' },
    ],
    '1yr': '+8.9%', '3yr': '+19.2%', '5yr': '+38.7%', ytd: '+1.8%',
    ocf: '0.78%', risk: 5,
    keywords: ['uk', 'british', 'income', 'dividend', 'yield', 'equity', 'royal london', 'active', 'managed', 'ftse', 'high yield'],
  },
];

/* Trust signal icon map */
function trustIcon(type) {
  const icons = {
    building: '<svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="7" width="20" height="15" rx="1"/><path d="M16 22V12H8v10"/><path d="M2 7l10-5 10 5"/></svg>',
    chart:    '<svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
    calendar: '<svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    dividend: '<svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    aum:      '<svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
    manager:  '<svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    ocf:      '<svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    rating:   '<svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  };
  return icons[type] || icons.building;
}

/* Risk segments HTML */
function riskSegsHtml(risk) {
  return Array.from({ length: 7 }, (_, i) =>
    `<span class="ai-risk-seg${i < risk ? ' is-filled' : ''}"></span>`
  ).join('');
}

/* Render a single smart result card */
function renderSmartCard(inv) {
  const trustHtml = inv.trustSignals.map(s =>
    `<span class="ais-trust-signal">${trustIcon(s.icon)}${s.text}</span>`
  ).join('');

  const logoStyle = `background:${inv.logoColor};color:#fff;`;

  return `
    <li class="ais-result-card" role="listitem" data-smart-id="${inv.id}">
      <button class="ais-result-btn" aria-pressed="false"
              aria-label="Select ${inv.name}"
              onclick="selectSmartFund('${inv.id}')">

        <div class="ais-result-top">
          <div class="ais-result-logo" style="${logoStyle}" aria-hidden="true">${inv.logoInitials}</div>
          <div class="ais-result-header">
            <div class="ais-result-name">${inv.name}</div>
            <div class="ais-result-meta">
              <span class="ai-badge ai-badge--isin">${inv.isin}</span>
              <span class="ai-badge ai-badge--type">${inv.typeLabel}</span>
            </div>
          </div>
          <span class="ais-result-checkmark" aria-hidden="true">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          </span>
        </div>

        <div class="ais-match-pill">
          <svg width="10" height="10" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          ${inv.matchReason}
        </div>

        <p class="ais-result-bio">${inv.bio}</p>

        <div class="ais-trust-signals">${trustHtml}</div>

        <div class="ais-result-metrics">
          <div class="ai-fund-metric">
            <span class="ai-metric-label">1yr</span>
            <span class="ai-metric-value green">${inv['1yr']}</span>
          </div>
          <div class="ai-fund-metric">
            <span class="ai-metric-label">OCF</span>
            <span class="ai-metric-value">${inv.ocf}</span>
          </div>
          <div class="ai-fund-metric">
            <span class="ai-metric-label">Risk</span>
            <span class="ai-risk-bar" aria-label="Risk rating ${inv.risk} out of 7">
              ${riskSegsHtml(inv.risk)}
            </span>
          </div>
        </div>
      </button>

      <div class="ais-result-stats">
        <div class="ais-result-stats-returns">
          <div class="ais-result-stats-return"><span class="ai-metric-label">YTD</span><span class="ai-metric-value green">${inv.ytd}</span></div>
          <div class="ais-result-stats-return"><span class="ai-metric-label">1yr</span><span class="ai-metric-value green">${inv['1yr']}</span></div>
          <div class="ais-result-stats-return"><span class="ai-metric-label">3yr</span><span class="ai-metric-value green">${inv['3yr']}</span></div>
          <div class="ais-result-stats-return"><span class="ai-metric-label">5yr</span><span class="ai-metric-value green">${inv['5yr']}</span></div>
        </div>
        <div class="ais-result-stats-meta">
          ${inv.ocf !== '—' ? `<span>OCF: ${inv.ocf}</span>` : ''}
          <span>Unit price: £${inv.price.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          <span>KIID risk: ${inv.risk}/7</span>
        </div>
      </div>
    </li>`;
}

/* Score an investment against a query */
function scoreInvestment(inv, tokens) {
  let score = 0;
  tokens.forEach(token => {
    inv.keywords.forEach(kw => {
      if (kw === token)          score += 4;
      else if (kw.includes(token) || token.includes(kw)) score += 2;
    });
    if (inv.name.toLowerCase().includes(token))     score += 3;
    if (inv.ticker.toLowerCase() === token)          score += 6;
    if (inv.isin.toLowerCase() === token)            score += 8;
    if (inv.typeLabel.toLowerCase().includes(token)) score += 1;
  });
  return score;
}

/* Run smart search — simulates API call with thinking state */
let _thinkingTimer = null;

function runSmartSearch(query) {
  query = query.trim();
  if (!query) return;

  const thinkingEl  = document.getElementById('ais-thinking');
  const thinkingTxt = document.getElementById('ais-thinking-text');
  const resultsWrap = document.getElementById('ais-results-wrap');
  const resultsList = document.getElementById('ais-smart-results');
  const resultsLbl  = document.getElementById('ais-results-label');

  // Show thinking state
  if (resultsWrap) resultsWrap.hidden = true;
  if (thinkingEl)  thinkingEl.classList.add('is-active');

  const messages = [
    'Searching 2,400+ investments…',
    'Matching to your criteria…',
    'Ranking by relevance…',
  ];
  let msgIdx = 0;
  if (thinkingTxt) thinkingTxt.textContent = messages[0];

  clearInterval(_thinkingTimer);
  _thinkingTimer = setInterval(() => {
    msgIdx = (msgIdx + 1) % messages.length;
    if (thinkingTxt) thinkingTxt.textContent = messages[msgIdx];
  }, 500);

  setTimeout(() => {
    clearInterval(_thinkingTimer);
    if (thinkingEl) thinkingEl.classList.remove('is-active');

    // Score and rank
    const tokens = query.toLowerCase().split(/\s+/).filter(t => t.length > 1);
    const results = SMART_DB
      .map(inv => ({ inv, score: scoreInvestment(inv, tokens) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map(({ inv }) => inv);

    if (!resultsList || !resultsWrap || !resultsLbl) return;

    if (results.length === 0) {
      resultsList.innerHTML = `
        <li role="listitem">
          <div class="ais-no-results">
            <svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.4" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="11"/><line x1="11" y1="14" x2="11.01" y2="14"/></svg>
            <div class="ais-no-results-title">No exact matches found</div>
            <p class="ais-no-results-sub">Try different wording, or switch to Browse to search by fund name or ISIN.</p>
          </div>
        </li>`;
      resultsLbl.textContent = 'No results';
    } else {
      resultsList.innerHTML = results.map(renderSmartCard).join('');
      const noun = results.length === 1 ? 'match' : 'matches';
      resultsLbl.textContent = `${results.length} ${noun} found for “${query}”`;
    }

    resultsWrap.hidden = false;
  }, 1600);
}

/* Select a smart result */
function selectSmartFund(id) {
  const inv = SMART_DB.find(i => i.id === id);
  if (!inv) return;

  const wasSelected = !!document.querySelector(`.ais-result-card[data-smart-id="${id}"].is-selected`);

  // Deselect all
  document.querySelectorAll('.ais-result-card').forEach(card => {
    card.classList.remove('is-selected');
    const btn = card.querySelector('.ais-result-btn');
    if (btn) btn.setAttribute('aria-pressed', 'false');
  });

  if (!wasSelected) {
    const card = document.querySelector(`.ais-result-card[data-smart-id="${id}"]`);
    if (card) {
      card.classList.add('is-selected');
      const btn = card.querySelector('.ais-result-btn');
      if (btn) btn.setAttribute('aria-pressed', 'true');
    }

    aiState.fund = {
      id:    inv.id,
      name:  inv.name,
      isin:  inv.isin,
      type:  inv.type,
      price: inv.price,
      ocf:   inv.ocf,
      '1yr': inv['1yr'],
      '3yr': inv['3yr'],
      '5yr': inv['5yr'],
      ytd:   inv.ytd,
    };
  } else {
    aiState.fund = null;
  }

  const btn1 = document.getElementById('ai-btn-1');
  if (btn1) {
    const enabled = aiState.fund !== null;
    btn1.disabled = !enabled;
    btn1.setAttribute('aria-disabled', String(!enabled));
  }
}

/* Switch between Browse and Smart modes */
function setSearchMode(mode) {
  const browsePanel = document.getElementById('ais-browse-panel');
  const smartPanel  = document.getElementById('ais-smart-panel');
  const browseBtn   = document.getElementById('ais-browse-btn');
  const smartBtn    = document.getElementById('ais-smart-btn');

  const isSmart = mode === 'smart';

  if (browsePanel) browsePanel.classList.toggle('is-hidden', isSmart);
  if (smartPanel)  smartPanel.classList.toggle('is-active', isSmart);
  if (browseBtn)  { browseBtn.classList.toggle('is-active', !isSmart); browseBtn.setAttribute('aria-pressed', String(!isSmart)); }
  if (smartBtn)   { smartBtn.classList.toggle('is-active',  isSmart);  smartBtn.setAttribute('aria-pressed',  String(isSmart));  }

  // Clear selection when switching modes
  aiState.fund = null;
  document.querySelectorAll('.ai-fund-card').forEach(c => {
    c.classList.remove('is-selected');
    const b = c.querySelector('.ai-fund-card-btn');
    if (b) b.setAttribute('aria-pressed', 'false');
    const s = c.querySelector('.ai-fund-stats');
    if (s) s.hidden = true;
  });
  document.querySelectorAll('.ais-result-card').forEach(c => {
    c.classList.remove('is-selected');
    const b = c.querySelector('.ais-result-btn');
    if (b) b.setAttribute('aria-pressed', 'false');
  });
  const btn1 = document.getElementById('ai-btn-1');
  if (btn1) { btn1.disabled = true; btn1.setAttribute('aria-disabled', 'true'); }
}

/* Wire up smart search inputs */
document.addEventListener('DOMContentLoaded', () => {
  const promptEl = document.getElementById('ais-prompt');
  const sendBtn  = document.getElementById('ais-prompt-send');

  if (promptEl) {
    promptEl.addEventListener('input', () => {
      const hasValue = promptEl.value.trim().length > 0;
      if (sendBtn) sendBtn.classList.toggle('is-visible', hasValue);
    });
    promptEl.addEventListener('keydown', e => {
      if (e.key === 'Enter') runSmartSearch(promptEl.value);
    });
  }

  if (sendBtn) {
    sendBtn.addEventListener('click', () => {
      const promptEl = document.getElementById('ais-prompt');
      if (promptEl) runSmartSearch(promptEl.value);
    });
  }

  document.querySelectorAll('.ais-suggestion').forEach(pill => {
    pill.addEventListener('click', () => {
      const promptEl = document.getElementById('ais-prompt');
      if (promptEl) {
        promptEl.value = pill.textContent;
        const sendBtn = document.getElementById('ais-prompt-send');
        if (sendBtn) sendBtn.classList.add('is-visible');
      }
      runSmartSearch(pill.textContent);
    });
  });
});
