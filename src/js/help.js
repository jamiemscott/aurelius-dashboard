/* ─── HELP & SUPPORT ──────────────────────────────────────────── */

/* ── Static data ─────────────────────────────────────── */

const HS_CATEGORIES = [
  {
    id: 'getting-started', label: 'Getting Started', count: 3,
    icon: `<svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 14 14"/></svg>`,
  },
  {
    id: 'account', label: 'Account & Profile', count: 5,
    icon: `<svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  },
  {
    id: 'investments', label: 'Investments', count: 5,
    icon: `<svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24" aria-hidden="true"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  },
  {
    id: 'payments', label: 'Payments & Withdrawals', count: 4,
    icon: `<svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24" aria-hidden="true"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
  },
  {
    id: 'security', label: 'Security & Privacy', count: 4,
    icon: `<svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  },
  {
    id: 'documents', label: 'Documents & Reports', count: 3,
    icon: `<svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  },
];

const CAT_LABELS = {
  'getting-started': 'Getting Started',
  account:           'Account & Profile',
  investments:       'Investments',
  payments:          'Payments & Withdrawals',
  security:          'Security & Privacy',
  documents:         'Documents & Reports',
};

const HS_FAQ = [
  /* Getting Started */
  {
    id: 'faq-gs-1', cat: 'getting-started',
    q:  'How do I navigate the Aurelius dashboard?',
    a:  'Use the left sidebar to move between sections — Portfolio (Overview, Valuation History, Asset Allocation, My Investments, Capital Gains Tax) and Account (Documents, My Details, Contact Us). The top navigation bar also provides quick access to the main portfolio views.',
  },
  {
    id: 'faq-gs-2', cat: 'getting-started',
    q:  'What is the ISA allowance for 2025–26?',
    a:  'The ISA allowance for 2025–26 is <strong>£20,000</strong> per person. This can be split across a Stocks &amp; Shares ISA and a Cash ISA in any proportion. The allowance resets on 6 April each year — unused allowance cannot be carried forward.',
  },
  {
    id: 'faq-gs-3', cat: 'getting-started',
    q:  'How do I contact my adviser?',
    a:  'Your dedicated adviser <strong>James Whitmore</strong> can be reached at <strong>j.whitmore@aurelius.co.uk</strong> or via the secure message form on the <a href="/contact-us/">Contact Us</a> page. You can also click "Message Adviser" in the bottom-left of any page.',
  },

  /* Account & Profile */
  {
    id: 'faq-acc-1', cat: 'account',
    q:  'How do I update my personal details?',
    a:  'Go to <a href="/my-details/">My Details</a> and select the Personal tab. Click Edit to update your name, date of birth, or nationality. Changes to legal name require identity verification — please contact your adviser to assist.',
  },
  {
    id: 'faq-acc-2', cat: 'account',
    q:  'How do I change my correspondence address?',
    a:  'Navigate to <a href="/my-details/">My Details</a> → Contact tab. You can update your home address, mailing preference, and phone number. Address changes are subject to a 24-hour security hold.',
  },
  {
    id: 'faq-acc-3', cat: 'account',
    q:  'Where can I find my client reference number?',
    a:  'Your client reference number (e.g. AW-20182-UK) appears in the account menu — click your initials in the top-right corner. It is also printed on all correspondence and statements.',
  },
  {
    id: 'faq-acc-4', cat: 'account',
    q:  'How do I set up a preferred name?',
    a:  'Under <a href="/my-details/">My Details</a> → Personal, you can enter a preferred name. This is how Ava and your adviser will address you within the platform. It does not affect any legal documentation.',
  },
  {
    id: 'faq-acc-5', cat: 'account',
    q:  'How do I close my account?',
    a:  'Account closure requires written confirmation and settlement of all open positions. Please contact your adviser via <a href="/contact-us/">Contact Us</a> or call 0800 000 0000. ISA and SIPP accounts have specific closure rules under HMRC regulations.',
  },

  /* Investments */
  {
    id: 'faq-inv-1', cat: 'investments',
    q:  'How do I add a new investment?',
    a:  'Navigate to <a href="/my-investments/">My Investments</a> and click Add Investment. You can browse by asset class, search by name, ISIN or ticker, or use Smart Search to find investments using plain English — for example, "a UK big pharma company".',
  },
  {
    id: 'faq-inv-2', cat: 'investments',
    q:  'How long does a purchase take to settle?',
    a:  'UK equities settle in T+2 (two business days). Funds and ETFs typically settle within T+3 to T+5, depending on the provider. You can track order status in My Investments.',
  },
  {
    id: 'faq-inv-3', cat: 'investments',
    q:  'What investment types are available?',
    a:  'Aurelius provides access to UK and international equities, unit trusts, OEICs, ETFs, investment trusts, and bonds. ISA and SIPP wrappers are available for eligible investments, all held in an FCA-regulated custody arrangement.',
  },
  {
    id: 'faq-inv-4', cat: 'investments',
    q:  'What is the minimum investment amount?',
    a:  'The minimum single investment is <strong>£500</strong>. For regular monthly contributions the minimum is <strong>£100 per month</strong>. Certain funds may have higher minimums set by the fund manager — these are displayed on the investment detail screen.',
  },
  {
    id: 'faq-inv-5', cat: 'investments',
    q:  'What is a fund\'s Ongoing Charge Figure (OCF)?',
    a:  'The OCF (also called TER — Total Expense Ratio) is the annual cost of holding a fund, expressed as a percentage. It covers fund management and administration and is deducted from the fund\'s assets — it does not appear as a separate charge on your statement. Lower is generally better for long-term returns.',
  },

  /* Payments & Withdrawals */
  {
    id: 'faq-pay-1', cat: 'payments',
    q:  'How do I withdraw funds from my portfolio?',
    a:  'Withdrawal requests are made from My Investments. Funds are transferred to your nominated bank account and typically arrive within 3–5 business days after settlement. Note: withdrawing from a Stocks &amp; Shares ISA permanently uses that portion of your annual ISA allowance.',
  },
  {
    id: 'faq-pay-2', cat: 'payments',
    q:  'Are there any charges for withdrawals?',
    a:  'Aurelius does not charge for standard withdrawals. Some funds may apply an early redemption charge — this is shown on the fund\'s factsheet before you confirm. UK bank transfers are provided free of charge.',
  },
  {
    id: 'faq-pay-3', cat: 'payments',
    q:  'How do I add funds to my portfolio?',
    a:  'Visit <a href="/my-investments/add-funds/">Add Funds</a> under My Investments. You can make a one-off payment or set up a regular direct debit. We accept bank transfer and debit card. Credit card payments are not accepted under FCA guidance.',
  },
  {
    id: 'faq-pay-4', cat: 'payments',
    q:  'How do I set up regular monthly contributions?',
    a:  'Navigate to <a href="/my-investments/add-funds/">Add Funds</a> and select the Regular Contributions tab. Choose your amount, frequency (monthly or quarterly) and start date. Direct debit mandates typically activate within 3 working days.',
  },

  /* Security & Privacy */
  {
    id: 'faq-sec-1', cat: 'security',
    q:  'How do I enable two-factor authentication (2FA)?',
    a:  'Go to <a href="/my-details/#security">My Details → Security &amp; Access</a>. Under Two-Factor Authentication, click Enable 2FA and follow the steps to link your authenticator app. We support Google Authenticator, Microsoft Authenticator and Authy.',
  },
  {
    id: 'faq-sec-2', cat: 'security',
    q:  'I think my account has been compromised — what should I do?',
    a:  'Call our security line immediately on <strong>0800 000 0000</strong> (available 24/7). Your adviser will suspend account activity whilst we investigate. Do not attempt to change your password until we confirm it is safe — this can trigger additional security locks.',
  },
  {
    id: 'faq-sec-3', cat: 'security',
    q:  'How do I reset my password?',
    a:  'For security, passwords cannot be changed within the portal. Use the Forgot Password link on the <a href="/login/">login page</a>. A secure reset link is emailed to your registered address and expires after 30 minutes.',
  },
  {
    id: 'faq-sec-4', cat: 'security',
    q:  'How is my data protected?',
    a:  'All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We are regulated by the FCA and comply fully with UK GDPR. Client assets are held in a ring-fenced custody account separate from Aurelius operational funds. You are protected by the FSCS up to £85,000.',
  },

  /* Documents & Reports */
  {
    id: 'faq-doc-1', cat: 'documents',
    q:  'Where can I find my annual valuation statement?',
    a:  'All statements are in the <a href="/documents/">Documents</a> section. Your 2025–26 annual valuation statement was published on 10 March 2026. Statements are retained for 7 years in line with FCA record-keeping requirements.',
  },
  {
    id: 'faq-doc-2', cat: 'documents',
    q:  'How do I download my tax documents?',
    a:  'CGT summaries, dividend certificates and ISA subscription confirmations are in <a href="/documents/">Documents</a> under the Tax &amp; Regulatory category. For the current tax year, documents are typically available within 2 weeks of 5 April.',
  },
  {
    id: 'faq-doc-3', cat: 'documents',
    q:  'How do I find a specific contract note?',
    a:  'Contract notes for all transactions are in <a href="/documents/">Documents</a> → Transaction Confirmations. They are usually available within 24 hours of settlement. Each note includes the ISIN, execution price, quantity and total consideration.',
  },
];


/* ── State ───────────────────────────────────────────── */

let hsState = {
  category: 'all',
  search:   '',
};


/* ── Category cards ──────────────────────────────────── */

function renderHsCategories() {
  const grid = document.getElementById('hs-cat-grid');
  if (!grid) return;

  grid.innerHTML = HS_CATEGORIES.map(cat => `
    <button class="hs-cat-card${cat.id === hsState.category ? ' is-active' : ''}"
            data-cat="${cat.id}"
            onclick="selectHsCat('${cat.id}')"
            aria-pressed="${cat.id === hsState.category}">
      <span class="hs-cat-icon-wrap" aria-hidden="true">${cat.icon}</span>
      <span class="hs-cat-title">${cat.label}</span>
      <span class="hs-cat-count">${cat.count} article${cat.count !== 1 ? 's' : ''}</span>
    </button>
  `).join('');
}

function selectHsCat(id) {
  hsState.category = id;
  hsState.search   = '';

  const searchInput = document.getElementById('hs-search-input');
  if (searchInput) searchInput.value = '';
  document.getElementById('hs-search-clear')?.classList.remove('is-visible');

  const cat = HS_CATEGORIES.find(c => c.id === id);
  const titleEl = document.getElementById('hs-faq-title');
  if (titleEl) titleEl.textContent = cat ? cat.label : 'All Topics';

  // Update active state on cards
  document.querySelectorAll('.hs-cat-card').forEach(el => {
    const isActive = el.dataset.cat === id;
    el.classList.toggle('is-active', isActive);
    el.setAttribute('aria-pressed', isActive);
  });

  renderHsFaq();
}

function selectAllTopics() {
  hsState.category = 'all';
  hsState.search   = '';

  const searchInput = document.getElementById('hs-search-input');
  if (searchInput) searchInput.value = '';
  document.getElementById('hs-search-clear')?.classList.remove('is-visible');

  const titleEl = document.getElementById('hs-faq-title');
  if (titleEl) titleEl.textContent = 'All Topics';

  document.querySelectorAll('.hs-cat-card').forEach(el => {
    el.classList.remove('is-active');
    el.setAttribute('aria-pressed', 'false');
  });

  renderHsFaq();
}


/* ── FAQ render ──────────────────────────────────────── */

function renderHsFaq() {
  const { category, search } = hsState;

  // Filter
  let items = HS_FAQ;
  if (category !== 'all') {
    items = items.filter(f => f.cat === category);
  }
  if (search) {
    const q = search.toLowerCase();
    items = items.filter(f =>
      f.q.toLowerCase().includes(q) || f.a.toLowerCase().replace(/<[^>]+>/g, '').toLowerCase().includes(q)
    );
  }

  // Update count badge
  const countEl = document.getElementById('hs-faq-count');
  if (countEl) countEl.textContent = items.length;

  const list    = document.getElementById('hs-faq-list');
  const noRes   = document.getElementById('hs-no-results');
  if (!list) return;

  if (!items.length) {
    list.innerHTML = '';
    noRes?.classList.add('is-visible');
    return;
  }
  noRes?.classList.remove('is-visible');

  // Group by category when showing all without a search query
  if (category === 'all' && !search) {
    const groups = {};
    items.forEach(f => {
      if (!groups[f.cat]) groups[f.cat] = [];
      groups[f.cat].push(f);
    });
    list.innerHTML = Object.entries(groups)
      .map(([cat, faqs]) => `
        <div class="hs-faq-group">
          <div class="hs-faq-group-label">${CAT_LABELS[cat] || cat}</div>
          ${faqs.map(f => faqItemHtml(f, search)).join('')}
        </div>
      `).join('');
  } else {
    list.innerHTML = items.map(f => faqItemHtml(f, search)).join('');
  }
}

function faqItemHtml(f, search) {
  let qText = esc(f.q);
  // Highlight matching search term in the question
  if (search) {
    const re = new RegExp(`(${escRe(esc(search))})`, 'gi');
    qText = qText.replace(re, '<mark class="hs-hl">$1</mark>');
  }
  return `
    <div class="hs-faq-item" id="${f.id}">
      <button class="hs-faq-q"
              onclick="toggleHsFaq('${f.id}')"
              aria-expanded="false"
              aria-controls="${f.id}-body">
        <span>${qText}</span>
        <svg class="hs-faq-chevron" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      <div class="hs-faq-a" id="${f.id}-body" role="region" aria-labelledby="${f.id}-btn">
        <div class="hs-faq-a-inner">${f.a}</div>
      </div>
    </div>
  `;
}

function toggleHsFaq(id) {
  const item = document.getElementById(id);
  if (!item) return;
  const wasOpen = item.classList.contains('is-open');

  // Close all open items
  document.querySelectorAll('.hs-faq-item.is-open').forEach(el => {
    el.classList.remove('is-open');
    el.querySelector('.hs-faq-q')?.setAttribute('aria-expanded', 'false');
  });

  if (!wasOpen) {
    item.classList.add('is-open');
    item.querySelector('.hs-faq-q')?.setAttribute('aria-expanded', 'true');
  }
}


/* ── Search ──────────────────────────────────────────── */

function initHsSearch() {
  const input = document.getElementById('hs-search-input');
  const clear = document.getElementById('hs-search-clear');
  if (!input) return;

  input.addEventListener('input', () => {
    const q = input.value.trim();
    hsState.search   = q;
    hsState.category = 'all';

    document.querySelectorAll('.hs-cat-card').forEach(el => {
      el.classList.remove('is-active');
      el.setAttribute('aria-pressed', 'false');
    });

    const titleEl = document.getElementById('hs-faq-title');
    if (titleEl) titleEl.textContent = q ? `Results for "${q}"` : 'All Topics';

    clear?.classList.toggle('is-visible', !!q);
    renderHsFaq();
  });

  clear?.addEventListener('click', () => {
    input.value      = '';
    hsState.search   = '';
    hsState.category = 'all';
    clear.classList.remove('is-visible');
    const titleEl = document.getElementById('hs-faq-title');
    if (titleEl) titleEl.textContent = 'All Topics';
    renderHsFaq();
    input.focus();
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Escape') clear?.click();
  });
}

function hsPopularSearch(term) {
  const input = document.getElementById('hs-search-input');
  if (input) {
    input.value = term;
    input.dispatchEvent(new Event('input'));
    input.focus();
    // Scroll down to the FAQ section
    document.getElementById('hs-faq-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}


/* ── Embedded Ava chat ───────────────────────────────── */

let hsAvaState = {
  messages: [],
};

function initHsAva() {
  const name = (typeof userData !== 'undefined' && userData.preferredName)
    ? userData.preferredName
    : 'there';

  hsAvaState.messages = [{
    role: 'bot',
    text: `Hi ${esc(name)} 👋 I'm <strong>Ava</strong>, your AI support assistant. Ask me anything — 2FA setup, withdrawals, tax documents — I'm here 24/7.`,
    chips: ['How do I withdraw?', 'Enable 2FA', 'Find my statement', 'Speak to James'],
  }];

  renderHsAva();

  const input = document.getElementById('hs-ava-input');
  if (input) {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') hsAvaSend();
    });
  }
}

function hsAvaSend(textArg) {
  const input = document.getElementById('hs-ava-input');
  const msg   = textArg !== undefined ? textArg : (input?.value?.trim() || '');
  if (!msg) return;

  if (input && textArg === undefined) input.value = '';

  hsAvaState.messages.push({ role: 'user', text: msg });
  hsAvaState.messages.push({ role: 'typing' });
  renderHsAva();

  // Hide topic suggestions once conversation starts
  const topics = document.getElementById('hs-ava-topics');
  if (topics) topics.style.display = 'none';

  const reply = getHsAvaResponse(msg);
  setTimeout(() => {
    hsAvaState.messages = hsAvaState.messages.filter(m => m.role !== 'typing');
    hsAvaState.messages.push({ role: 'bot', ...reply });
    renderHsAva();
  }, 680);
}

function getHsAvaResponse(raw) {
  const t = raw.toLowerCase().trim();

  /* Escalation */
  if (/\b(speak|adviser|james|human|call|connect|urgent|emergency)\b/.test(t)) {
    return {
      text: 'Of course — I\'ll connect you with <strong>James Whitmore</strong> right away.',
      actionChips: [{ label: 'Message James Whitmore', key: 'escalate' }],
    };
  }

  /* 2FA / security code */
  if (/\b(2fa|two.?factor|authenticat|security code|verification)\b/.test(t)) {
    return {
      text: 'To enable two-factor authentication, go to <a href="/my-details/#security">My Details → Security &amp; Access</a>. Click <strong>Enable 2FA</strong> and link an authenticator app (Google, Microsoft or Authy). It only takes 2 minutes and significantly improves your account security.',
      chips: ['Reset password', 'Suspicious activity', 'Speak to James'],
    };
  }

  /* Password / login */
  if (/\b(password|reset|login|sign.?in|forgotten|can.?t log)\b/.test(t)) {
    return {
      text: 'Passwords are reset from the <a href="/login/">login page</a> — click <em>Forgot Password</em>. A secure link is sent to your registered email address and expires after 30 minutes. If you\'re locked out, call <strong>0800 000 0000</strong>.',
      chips: ['Enable 2FA', 'Account compromised'],
    };
  }

  /* Suspicious / compromised */
  if (/\b(compromised|hack|suspicious|stolen|unauthorised|unauthorized|breach)\b/.test(t)) {
    return {
      text: 'Call our security line <strong>immediately</strong> on <strong>0800 000 0000</strong> — available 24/7 for security emergencies. Your adviser will suspend account activity whilst we investigate.',
      actionChips: [{ label: 'Message James Whitmore', key: 'escalate' }],
    };
  }

  /* Withdrawal */
  if (/\b(withdraw|withdrawal|take out|cash out|redemption)\b/.test(t)) {
    return {
      text: 'Withdrawal requests are made from My Investments. Funds reach your nominated bank account within <strong>3–5 business days</strong> after settlement. <strong>Important:</strong> withdrawing from an ISA permanently uses that portion of your annual allowance.',
      chips: ['Add funds instead', 'ISA rules', 'Speak to James'],
    };
  }

  /* Add funds */
  if (/\b(add funds|top up|deposit|contribute|payment|fund my)\b/.test(t)) {
    return {
      text: 'You can add funds from the <a href="/my-investments/add-funds/">Add Funds</a> page. Options include a one-off bank transfer, debit card payment, or setting up a regular monthly direct debit from £100.',
      actionChips: [{ label: 'Add Funds ↗', key: 'add-funds' }],
    };
  }

  /* Statements / documents */
  if (/\b(statement|annual|report|download|document|tax cert|contract note)\b/.test(t)) {
    return {
      text: 'Your statements, tax documents and contract notes are all in the Documents section. Your 2025–26 annual statement is ready to download now.',
      actionChips: [{ label: 'Go to Documents ↗', key: 'view-documents' }],
    };
  }

  /* Add investment */
  if (/\b(add.?invest|buy|purchase|new holding|invest in)\b/.test(t)) {
    return {
      text: 'To add an investment, go to My Investments and click <strong>Add Investment</strong>. You can browse by asset class, search by name or ISIN, or use our Smart Search to describe what you\'re looking for in plain English.',
      actionChips: [{ label: 'Add Investment ↗', key: 'add-investment' }],
    };
  }

  /* ISA allowance */
  if (/\b(isa|individual savings|tax.?free|annual allowance)\b/.test(t)) {
    return {
      text: 'The 2025/26 ISA allowance is <strong>£20,000</strong>. You currently have <strong>£8,240 remaining</strong> before the 5 April 2026 deadline. Unused allowance cannot be carried forward to the next tax year.',
      chips: ['Add to ISA', 'SIPP rules', 'CGT allowance'],
    };
  }

  /* CGT */
  if (/\b(cgt|capital gains|gains tax)\b/.test(t)) {
    return {
      text: 'The Capital Gains Tax annual exempt amount for 2025/26 is <strong>£3,000</strong>. Gains above this are taxed at <strong>18%</strong> (basic rate) or <strong>24%</strong> (higher rate) for investment assets. See your <a href="/capital-gains-tax/">CGT summary</a> for this year\'s figures.',
      chips: ['ISA allowance', 'SIPP rules', 'Speak to James'],
    };
  }

  /* SIPP / pension */
  if (/\b(sipp|pension|retirement|drawdown|annuity)\b/.test(t)) {
    return {
      text: 'The annual pension allowance is <strong>£60,000</strong> (or 100% of earnings, whichever is lower). Your SIPP benefits from tax-free growth and a <strong>25% tax-free lump sum</strong> at retirement. Speak to James for personalised retirement planning.',
      chips: ['ISA rules', 'CGT', 'Speak to James'],
    };
  }

  /* Charges / fees */
  if (/\b(charge|fee|cost|pricing|management fee|ocf|ter)\b/.test(t)) {
    return {
      text: 'Aurelius charges an annual management fee based on your portfolio size, billed quarterly. There are no charges for withdrawals or bank transfers. Each investment also carries an Ongoing Charge Figure (OCF) set by the fund manager, visible on the investment detail screen.',
      chips: ['ISA rules', 'Speak to James'],
    };
  }

  /* Complaint */
  if (/\b(complaint|complain|unhappy|dissatisfied|ombudsman|fos)\b/.test(t)) {
    return {
      text: 'We\'re sorry to hear you\'re dissatisfied. Please write to <strong>complaints@aurelius.co.uk</strong> or call <strong>0800 000 0000</strong>. We acknowledge within 2 business days and aim to resolve within 8 weeks. If not satisfied, you may refer to the <strong>Financial Ombudsman Service</strong>.',
      actionChips: [{ label: 'Message James Whitmore', key: 'escalate' }],
    };
  }

  /* Portfolio value */
  if (/\b(portfolio|worth|value|total|balance|how much)\b/.test(t)) {
    return {
      text: 'Your portfolio is currently valued at <strong>£842,340</strong>, spread across 23 holdings. Your largest allocation is UK Equities at 38.2%. See the full breakdown on the <a href="/asset-allocation/">Asset Allocation</a> page.',
      chips: ['Performance', 'Add investment', 'Speak to James'],
    };
  }

  /* Default */
  return {
    text: 'That\'s a great question. I\'d recommend browsing the FAQ articles below or speaking directly with your adviser — they\'ll be able to give you personalised guidance.',
    actionChips: [{ label: 'Message James Whitmore', key: 'escalate' }],
  };
}

function handleHsChip(label, key) {
  if (key === 'escalate') {
    const drawer = document.getElementById('adviser-drawer');
    if (drawer?.showPopover) drawer.showPopover();
    return;
  }
  if (key === 'view-documents') {
    window.location.href = '/documents/';
    return;
  }
  if (key === 'add-investment') {
    window.location.href = '/my-investments/add-investment/';
    return;
  }
  if (key === 'add-funds') {
    window.location.href = '/my-investments/add-funds/';
    return;
  }
  // Regular text chip — send as user message
  hsAvaSend(label);
}

function renderHsAva() {
  const container = document.getElementById('hs-ava-messages');
  if (!container) return;

  container.innerHTML = hsAvaState.messages.map(msg => {

    if (msg.role === 'typing') {
      return `<div class="chat-msg chat-msg-bot">
        <div class="chat-typing">
          <span class="chat-typing-dot"></span>
          <span class="chat-typing-dot"></span>
          <span class="chat-typing-dot"></span>
        </div>
      </div>`;
    }

    if (msg.role === 'user') {
      return `<div class="chat-msg chat-msg-user">
        <div class="chat-bubble-inner">${esc(msg.text)}</div>
      </div>`;
    }

    const chipsHtml = msg.chips?.length
      ? `<div class="chat-chips">${msg.chips.map(c =>
          `<button class="chat-chip" onclick='handleHsChip(${JSON.stringify(c)},null)'>${esc(c)}</button>`
        ).join('')}</div>`
      : '';

    const actionHtml = msg.actionChips?.length
      ? `<div class="chat-chips">${msg.actionChips.map(c =>
          `<button class="chat-chip action" onclick='handleHsChip(${JSON.stringify(c.label)},${JSON.stringify(c.key)})'>${esc(c.label)}</button>`
        ).join('')}</div>`
      : '';

    return `<div class="chat-msg chat-msg-bot">
      <div class="chat-bubble-inner">${msg.text}</div>
      ${chipsHtml}${actionHtml}
    </div>`;

  }).join('');

  container.scrollTop = container.scrollHeight;
}


/* ── Utility ─────────────────────────────────────────── */

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escRe(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


/* ── Init ────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  renderHsCategories();
  renderHsFaq();
  initHsSearch();
  initHsAva();
});
