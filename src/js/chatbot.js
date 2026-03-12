/* ─── AVA — CHAT ASSISTANT ──────────────────────────────────── */

let chatState = {
  open:     false,
  messages: [],    // { role: 'bot'|'user'|'typing', text, chips?, actionChips? }
};

/* ── Initialise ────────────────────────────────────────────── */
function initChatbot() {
  if (!chatState.messages.length) {
    chatState.messages.push({
      role: 'bot',
      text: `Good morning, ${(typeof userData !== 'undefined' && userData.preferredName) || 'there'}. I\'m <strong>Ava</strong>, your Aurelius assistant. How can I help you today?`,
      chips: ['My Portfolio', 'Market Update', 'ISA Allowance', 'Speak to James'],
    });
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && chatState.open) closeChatbot();
  });
  renderMessages();
}

/* ── Open / Close ──────────────────────────────────────────── */
function toggleChatbot() {
  chatState.open = !chatState.open;
  const win = document.getElementById('chat-window');
  if (win) win.classList.toggle('is-open', chatState.open);
  if (chatState.open) {
    setTimeout(() => {
      const inp = document.getElementById('chat-input');
      if (inp) inp.focus();
    }, 300);
  }
}

function closeChatbot() {
  chatState.open = false;
  const win = document.getElementById('chat-window');
  if (win) win.classList.remove('is-open');
}

/* ── Bot Response Library ──────────────────────────────────── */
function getBotResponse(raw) {
  const t = raw.toLowerCase().trim();

  /* 1 — Escalation (highest priority) */
  if (/\b(speak|adviser|james|human|person|talk to|call|connect)\b/.test(t)) {
    return {
      text: 'Of course — let me connect you with <strong>James Whitmore</strong> now.',
      actionChips: [{ label: 'Open Message Adviser', key: 'escalate' }],
    };
  }

  /* 2 — Action shortcuts */
  if (/\b(add investment|invest|buy|purchase|new holding)\b/.test(t)) {
    return {
      text: 'I can take you straight to the investment instruction form.',
      actionChips: [{ label: 'Add Investment ↗', key: 'add-investment' }],
    };
  }

  if (/\b(document|statement|report|download)\b/.test(t)) {
    return {
      text: 'Your documents and statements are all in the Documents section.',
      actionChips: [{ label: 'View Documents ↗', key: 'view-documents' }],
    };
  }

  if (/\b(allocation|breakdown|split|weighting|diversif)\b/.test(t)) {
    return {
      text: 'Your portfolio is currently split across 7 asset classes. I\'ll take you to the full breakdown.',
      actionChips: [{ label: 'View Allocation ↗', key: 'view-allocation' }],
    };
  }

  /* 3 — Portfolio data */
  if (/\b(portfolio|worth|value|total|balance|how much)\b/.test(t)) {
    return {
      text: 'Your portfolio is currently valued at <strong>£842,340</strong>, spread across <strong>23 holdings</strong>. Your largest allocation is UK Equities at 38.2%.',
      chips: ['Top Holdings', 'Performance', 'View Allocation'],
    };
  }

  if (/\b(performance|return|gain|profit|change|growth|benchmark)\b/.test(t)) {
    return {
      text: 'Over the past 12 months your portfolio has returned <strong>+12.4%</strong>, outperforming your benchmark by 2.1%. Your best performer is <strong>Fundsmith Equity</strong> at +18.6%.',
      chips: ['View History', 'Top Holdings'],
    };
  }

  if (/\b(cash|liquidity|available fund)\b/.test(t)) {
    return {
      text: 'You currently hold <strong>£31,800</strong> in cash across your accounts — approximately 3.8% of your total portfolio value.',
      chips: ['My Portfolio', 'Add Investment'],
    };
  }

  if (/\b(holdings|funds|top holding|largest|positions)\b/.test(t)) {
    return {
      text: 'Your three largest holdings are:<br><br>'
          + '1. <strong>Fundsmith Equity</strong> — £94,820 (11.3%)<br>'
          + '2. <strong>Scottish Mortgage Trust</strong> — £71,600 (8.5%)<br>'
          + '3. <strong>Artemis Income Fund</strong> — £63,450 (7.5%)',
      chips: ['Performance', 'View Allocation'],
    };
  }

  /* 4 — Wealth management FAQs */
  if (/\b(isa|individual savings|tax.?free|annual allowance)\b/.test(t)) {
    return {
      text: 'The 2025/26 ISA allowance is <strong>£20,000</strong> per tax year. You can split this across a Stocks & Shares ISA, Cash ISA, and Innovative Finance ISA as you choose.',
      chips: ['SIPP Rules', 'CGT Allowance', 'Speak to James'],
    };
  }

  if (/\b(cgt|capital gains|gains tax)\b/.test(t)) {
    return {
      text: 'The Capital Gains Tax annual exempt amount is <strong>£3,000</strong> for 2025/26. Gains above this are taxed at <strong>18%</strong> (basic rate) or <strong>24%</strong> (higher rate) for investment assets.',
      chips: ['ISA Allowance', 'Speak to James'],
    };
  }

  if (/\b(sipp|pension|retirement|drawdown|annuity)\b/.test(t)) {
    return {
      text: 'The annual pension allowance is <strong>£60,000</strong> (or 100% of earnings, whichever is lower). Your SIPP allows tax-free growth and a <strong>25% tax-free lump sum</strong> at retirement.',
      chips: ['ISA Allowance', 'Speak to James'],
    };
  }

  if (/\b(rebalanc|drift|reweight|target weight)\b/.test(t)) {
    return {
      text: 'Portfolio rebalancing involves selling overweighted assets and buying underweighted ones to restore your target allocation. Aurelius recommends reviewing this quarterly.',
      chips: ['View Allocation', 'Speak to James'],
    };
  }

  /* 5 — Market context */
  if (/\b(market|ftse|outlook|economy|economic|interest rate|inflation|rate cut)\b/.test(t)) {
    return {
      text: 'UK markets are showing cautious optimism in Q1 2026, with the <strong>FTSE 100 up 4.2%</strong> year-to-date. Inflation has eased to 2.6%, supporting the case for further rate cuts later in the year.',
      chips: ['Sector Update', 'My Performance', 'Speak to James'],
    };
  }

  if (/\b(sector|technology|healthcare|energy|financials|property|tech)\b/.test(t)) {
    return {
      text: 'Your portfolio has <strong>14.3%</strong> in Technology and <strong>11.8%</strong> in Healthcare — both strong performers over the past quarter. Financials account for 9.4%.',
      chips: ['View Allocation', 'Market Update'],
    };
  }

  /* 6 — Default fallback */
  return {
    text: 'I don\'t have specific information on that, but your adviser <strong>James Whitmore</strong> can help directly.',
    actionChips: [{ label: 'Speak to James Whitmore', key: 'escalate' }],
  };
}

/* ── Send / Receive ───────────────────────────────────────── */
function sendUserMessage(text) {
  const clean = text.trim();
  if (!clean) return;

  chatState.messages.push({ role: 'user', text: clean });
  const inp = document.getElementById('chat-input');
  if (inp) inp.value = '';

  // Show typing indicator
  chatState.messages.push({ role: 'typing' });
  renderMessages();

  const reply = getBotResponse(clean);

  setTimeout(() => {
    chatState.messages = chatState.messages.filter(m => m.role !== 'typing');
    chatState.messages.push({ role: 'bot', ...reply });
    renderMessages();
  }, 640);
}

function handleChatSubmit() {
  const inp = document.getElementById('chat-input');
  if (inp && inp.value.trim()) sendUserMessage(inp.value);
}

/* ── Chip Routing ─────────────────────────────────────────── */
function handleChip(label, key) {
  if (key) {
    switch (key) {
      case 'escalate':
        escalateToAdviser();
        return;
      case 'add-investment': {
        const d = document.getElementById('add-investment-drawer');
        if (d) d.showPopover();
        closeChatbot();
        return;
      }
      case 'view-documents':
        if (typeof showPage === 'function') showPage('documents', null);
        closeChatbot();
        return;
      case 'view-allocation':
        if (typeof showPage === 'function') showPage('allocation', null);
        closeChatbot();
        return;
    }
  }
  // Regular text chip — send as user message
  sendUserMessage(label);
}

function escalateToAdviser() {
  closeChatbot();
  const drawer = document.getElementById('adviser-drawer');
  if (drawer) drawer.showPopover();
}

/* ── Render ───────────────────────────────────────────────── */
function renderMessages() {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  container.innerHTML = chatState.messages.map(msg => {

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
        <div class="chat-bubble-inner">${escChatHtml(msg.text)}</div>
      </div>`;
    }

    // Bot message
    const chipsHtml = msg.chips && msg.chips.length
      ? `<div class="chat-chips">${msg.chips.map(c =>
          `<button class="chat-chip" onclick='handleChip(${JSON.stringify(c)},null)'>${escChatHtml(c)}</button>`
        ).join('')}</div>`
      : '';

    const actionChipsHtml = msg.actionChips && msg.actionChips.length
      ? `<div class="chat-chips">${msg.actionChips.map(c =>
          `<button class="chat-chip action" onclick='handleChip(${JSON.stringify(c.label)},${JSON.stringify(c.key)})'>${escChatHtml(c.label)}</button>`
        ).join('')}</div>`
      : '';

    return `<div class="chat-msg chat-msg-bot">
      <div class="chat-bubble-inner">${msg.text}</div>
      ${chipsHtml}${actionChipsHtml}
    </div>`;

  }).join('');

  container.scrollTop = container.scrollHeight;
}

function escChatHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
