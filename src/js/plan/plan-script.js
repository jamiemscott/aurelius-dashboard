/* ─── PLAN MY FUTURE — SCRIPTED CONVERSATION ─────────────────
   A deterministic demo script. Every step has:
     id     — unique key
     chip   — the suggestion-chip label (also the user's words)
     match  — regex for free-typed messages
     run(c) — mutates the plan via the context and returns the
              bot's reply: an array of
              { html, tone?, etf?, options?, review?, receipt?, stress?, check? }
     slots  — (choice steps) the route slots a choice fills
     info   — answers a question; doesn't move the route on or
              close any open options
     quiet  — doesn't change the plan (no "plan updated" announcement)
     status — sets the plan status (saved / placed / adviser)
     skip   — (optional) hide the step's chip when it no longer fits
     repeatable — can run again once done (reviewing a changed plan)

   Route: start → approach → fund → account → refine the plan →
   (quick check) → review → decide (place orders, send to James,
   or save). Reviewing asks the three check questions first, once.
   'risk', 'fund', 'account' and 'decide' are slots: any of their
   choices fills them. Choices come as option cards with plus and
   minus points, so the trade-off is visible before the pick.
   Copy rule: explain and model, never instruct ("you should"),
   and never rank the options as "best".
   ─────────────────────────────────────────────────────────── */

import { ETFS, money, moneyShort, pct, sippRelief } from './plan-model.js';

/* Company shares: trade-offs written from the snapshot, no ranking */
const SHARE_POINTS = {
  AAPL: {
    match: /\b(apple|aapl)\b/i,
    pros: [() => 'One of the world’s largest companies by value', () => 'Earns from devices and a growing services business'],
    cons: [() => 'Priced in US dollars, so the pound’s moves matter too', () => 'Already a large part of US and global index funds'],
  },
  AZN: {
    match: /\b(astra ?zeneca|azn)\b/i,
    pros: [() => 'Listed in London and priced in pounds', () => 'Pays a dividend twice a year'],
    cons: [() => 'Results depend on drug trials and approvals', () => '0.5% stamp duty when you buy'],
  },
  RR: {
    match: /\brolls[- ]?royce\b/i,
    pros: [e => `Up about ${Math.round(e.fiveYear * 100).toLocaleString('en-GB')}% over the past 5 years`, () => 'Recovered strongly after 2020'],
    cons: [e => `Big swings: ${(e.volatility * 100).toFixed(0)}% typical yearly`, () => 'Fell about 80% in 2020 when flights stopped'],
  },
};
const SHARE = 5000;   /* a demo amount of new money for one company */

/* "about 8 months", "about 2½ years" */
function duration(months) {
  if (months >= 300) return 'more than 25 years';
  if (months < 12) return `${Math.max(1, months)} month${months === 1 ? '' : 's'}`;
  const half = Math.round(months / 6) / 2;
  const whole = Math.floor(half);
  return `${whole}${half % 1 ? '½' : ''} year${half > 1 ? 's' : ''}`;
}

/* ── Quick check before reviewing ───────────────────────── */
/* Three questions that make the trade-offs personal. "No" never
   blocks: it explains the concern and points to James.          */
export const CHECKS = [
  { id: 'horizon', q: 'Is this money you won’t need for at least 5 years?',
    no: 'Money needed within 5 years is often kept somewhere steadier, because a fall may not have time to recover.' },
  { id: 'cushion', q: 'Do you have 3 to 6 months of spending in cash elsewhere?',
    no: 'Without a cash cushion, an emergency could mean selling investments at a bad time.' },
  { id: 'fall', q: 'Could you leave it invested through a 25% fall?',
    no: 'If a 25% fall would be hard to live with, a more cautious approach could fit better.' },
];
import { ACCOUNTS, TAX_YEAR } from './plan-data.js';

export const ROUTE = ['start', 'risk', 'fund', 'account', 'topup', 'monthly-1000', 'add-gold', 'remove-veritas', 'grow', 'review', 'decide'];
const SLOTS = new Set(['risk', 'fund', 'account', 'decide']);

const etfFacts = id => {
  const e = ETFS[id];
  return `${pct(e.fiveYear, 0)} over the past 5 years, ${(e.volatility * 100).toFixed(0)}% typical yearly swing, ${e.ocf.toFixed(2)}% a year in charges`;
};

/* ── Approaches ─────────────────────────────────────────── */
export const RISKS = {
  cautious: {
    title: 'More cautious',
    chip: 'Something more cautious',
    match: /\b(cautious|careful|safer?|safety|low(er)?[- ]risk|steadier|defensive|less risk)\b/i,
    desc: 'Steadier holdings that usually move less than shares.',
    pros: ['Smaller ups and downs along the way'],
    cons: ['Lower expected growth over time'],
    intro: 'A more cautious approach leans on holdings that usually move less than shares.',
    funds: ['IGLT', 'SGLN', 'VWRP'],
  },
  balanced: {
    title: 'Balanced',
    chip: 'Something balanced',
    match: /\b(balanced?|middle|moderate|medium|in between)\b/i,
    desc: 'Shares at the centre, with something steadier alongside.',
    pros: ['Growth, with some cushioning in a bad year'],
    cons: ['Will still fall when markets fall'],
    intro: 'A balanced approach keeps shares at the centre, with something steadier alongside.',
    funds: ['VWRP', 'VUAG', 'IGLT'],
  },
  adventurous: {
    title: 'More adventurous',
    chip: 'Something more adventurous',
    match: /\b(adventurous|aggressive|bold|high(er)?[- ]risk|riskier|more risk|more growth)\b/i,
    desc: 'Higher-growth shares, with bigger swings.',
    pros: ['Highest expected growth over the long run'],
    cons: ['Bigger drops, sometimes over 30% in a year'],
    intro: 'A more adventurous approach accepts bigger swings for more expected growth. Your portfolio is already 96% shares, so this adds to that.',
    funds: ['EQQQ', 'VUAG', 'VWRP'],
  },
};

/* ── Fund trade-offs (figures come from the snapshot) ───── */
const FUND_POINTS = {
  VWRP: {
    match: /\b(global|tracker|all[- ]?world|vwrp)\b/i,
    pros: [() => 'Thousands of companies worldwide in one fund', e => `Low charge: ${e.ocf.toFixed(2)}% a year`],
    cons: [() => 'About 60% is in US companies', () => 'Falls with world markets; no cushion in a crash'],
  },
  VUAG: {
    match: /(s&p|\bsp ?500\b|\bus shares\b|\bamerica|\bvuag\b)/i,
    pros: [() => 'The 500 largest US companies', e => `One of the lowest charges available: ${e.ocf.toFixed(2)}%`],
    cons: [() => 'One country only', () => 'Overlaps with the US holdings in your global funds'],
  },
  EQQQ: {
    match: /\b(nasdaq|tech|technology|eqqq)\b/i,
    pros: [e => `Strongest of these over 5 years: ${pct(e.fiveYear, 0)}`, () => 'Large, fast-growing companies'],
    cons: [() => 'Concentrated: about ten companies are half the fund', e => `Biggest swings: ${(e.volatility * 100).toFixed(0)}% a year typically`],
  },
  SGLN: {
    match: /\bsgln\b/i,
    pros: [() => 'Has often held its value when shares fall', () => 'Backed by physical gold in vaults'],
    cons: [() => 'Pays no income', e => `Swings about as much as shares: ${(e.volatility * 100).toFixed(0)}% a year`],
  },
  IGLT: {
    match: /\b(gilts?|bonds?|iglt)\b/i,
    pros: [() => 'Pays a regular income from the UK government', e => `Steadiest of these: ${(e.volatility * 100).toFixed(0)}% typical yearly swing`],
    cons: [e => `Down ${Math.abs(e.fiveYear * 100).toFixed(0)}% over 5 years as interest rates rose`, () => 'Lower expected return: about 4% a year'],
  },
};

function fundOption(id) {
  const e = ETFS[id];
  const p = FUND_POINTS[id];
  return {
    step: `pick-${id}`, etf: id, kicker: id, title: e.short, desc: e.blurb,
    pros: p.pros.map(f => f(e)), cons: p.cons.map(f => f(e)),
    action: 'Add to plan',
  };
}

function riskOption(key) {
  const r = RISKS[key];
  return { step: `risk-${key}`, risk: key, title: r.title, desc: r.desc, pros: r.pros, cons: r.cons, action: 'Choose' };
}

/* ── Accounts (figures follow the plan's monthly amount) ── */
const isaLeft = () => TAX_YEAR.isa.limit - TAX_YEAR.isa.used;

function accountOption(id, monthly) {
  const r = sippRelief(monthly);
  const cards = {
    ISA: {
      desc: 'Tax-free growth and income, and you can take money out at any time.',
      pros: ['No UK tax on growth, income or withdrawals', 'Access to your money whenever you need it'],
      cons: [`${money(isaLeft())} of this year’s ${money(TAX_YEAR.isa.limit)} allowance left, until ${TAX_YEAR.ends}`, 'No tax relief on what you put in'],
    },
    SIPP: {
      desc: 'Your pension. Tax relief tops up what you put in.',
      pros: [`${money(monthly)} a month from you becomes ${money(r.gross)} in your pension`, `As a higher-rate taxpayer you can claim back ${money(r.extra)} more a month`],
      cons: ['Locked away until at least 57', 'Withdrawals are taxed as income, apart from 25% tax-free'],
    },
    GIA: {
      desc: 'No limits on how much you add or when you take it out.',
      pros: ['No yearly limit', 'Access to your money whenever you need it'],
      cons: [`Tax on dividends over ${money(TAX_YEAR.dividendAllowance)} and gains over ${money(TAX_YEAR.cgtAllowance)} a year`, 'No tax relief on what you put in'],
    },
  };
  return { step: `account-${id}`, kicker: ACCOUNTS[id].short, title: ACCOUNTS[id].name, action: 'Hold it here', ...cards[id] };
}

const accountQuestion = c => ({
  html: 'Which account should it go in? Each one is taxed differently.',
  options: { label: 'Account options', items: ['ISA', 'SIPP', 'GIA'].map(id => accountOption(id, c.fundMonthly() || 500)) },
});

/* What the account choice means, in plain figures */
function accountNote(id, monthly) {
  if (id === 'ISA') {
    const year = monthly * TAX_YEAR.paymentsLeft;
    return `From ${TAX_YEAR.firstPayment} to ${TAX_YEAR.ends} that’s ${money(year)}, leaving ${money(isaLeft() - year)} of this year’s ISA allowance.`;
  }
  if (id === 'SIPP') {
    const r = sippRelief(monthly);
    return `${money(monthly)} a month from you becomes <strong>${money(r.gross)}</strong> in your pension. You can claim back a further ${money(r.extra)} a month through your tax return, so it costs you ${money(r.netCost)}. The projection includes the ${money(r.atSource)} added at source.`;
  }
  return `Gains above ${money(TAX_YEAR.cgtAllowance)} a year and dividends above ${money(TAX_YEAR.dividendAllowance)} are taxable here. Each April you could move some into your ISA (a “Bed and ISA”).`;
}

/* ── Adding more ────────────────────────────────────────── */
/* £5,000 at a time; in an ISA, no more than the allowance left */
const TOPUP = 5000;
function topupAmount(c, key) {
  if (c.accountOf(key) !== 'ISA') return TOPUP;
  return Math.max(0, Math.min(TOPUP, Math.floor(c.allowanceLeft('ISA') / 100) * 100));
}
const raisedMonthly = (c, key) => (c.monthlyOf(key) || 0) + 250;

function topupOptions(c, key) {
  const name = c.nameOf(key);
  const account = c.accountOf(key);
  const amount = topupAmount(c, key);
  const capped = account === 'ISA' && amount < TOPUP;
  const monthly = c.monthlyOf(key);
  const up = raisedMonthly(c, key);
  const cash = c.lumpOf('CASH');
  const items = [];
  if (amount >= 100) {
    items.push({
      step: 'topup-lump', kicker: 'One-off', title: `Add ${money(amount)} now`,
      desc: `New money from your bank, invested in ${name} at the next dealing point.`,
      pros: ['Invested straight away, so it has longer to grow', capped ? 'Uses the rest of this year’s ISA allowance' : 'One payment, then nothing more to do'],
      cons: ['All bought at one day’s price', `About ${money(amount * 0.001)} in dealing costs`],
      action: 'Add this',
    });
  }
  items.push({
    step: 'topup-monthly', kicker: 'Regular', title: `Raise to ${money(up)} a month`,
    desc: monthly ? `Up from ${money(monthly)} a month, from ${TAX_YEAR.firstPayment}.` : `A new monthly amount, from ${TAX_YEAR.firstPayment}.`,
    pros: ['Spreads the price you pay over time', 'Lower dealing costs than one-off buys'],
    cons: ['Takes longer to put the money to work', account === 'ISA' ? `Uses ${money(250 * TAX_YEAR.paymentsLeft)} more ISA allowance before ${TAX_YEAR.ends}` : 'A bigger regular commitment'],
    action: 'Raise it',
  });
  if (amount >= 100 && cash - amount >= 10000) {
    const moving = account && account !== 'GIA';
    items.push({
      step: 'topup-cash', kicker: 'From cash', title: `Use ${money(amount)} of your cash`,
      desc: `Cash already in your general account${moving ? `, moved into your ${ACCOUNTS[account].short}` : ''}.`,
      pros: ['No new money needed', 'Puts cash that earns little to work'],
      cons: [`Leaves ${money(cash - amount)} in cash for emergencies`, moving && account === 'ISA' ? 'Counts towards your ISA allowance' : 'Falls with markets, where cash wouldn’t'],
      action: 'Use cash',
    });
  }
  return items;
}

/* New money for a company: £5,000 in the account new money goes to.
   In an ISA it's capped at the allowance left; with none left, the
   shares go in the general account instead, which has no limit.   */
function shareInto(c) {
  const account = c.account();
  if (account !== 'ISA') return { account, amount: SHARE, note: '' };
  const left = Math.floor(c.allowanceLeft('ISA') / 100) * 100;
  if (left < 100) return { account: 'GIA', amount: SHARE, note: ' Your ISA allowance is used up in this plan, so these go in your general account, which has no yearly limit.' };
  if (left < SHARE) return { account, amount: left, note: ` That’s the rest of this year’s ISA allowance.` };
  return { account, amount: SHARE, note: '' };
}

function shareOption(id) {
  const e = ETFS[id];
  const p = SHARE_POINTS[id];
  return {
    step: `share-${id}`, etf: id, kicker: e.market, title: e.short, desc: e.blurb,
    pros: p.pros.map(f => f(e)), cons: p.cons.map(f => f(e)),
    action: 'Add to plan',
  };
}

function topupReply(c, key, before, done, monthly = false) {
  const s = c.summary();
  const extra = monthly && c.accountOf(key) === 'SIPP'
    ? ` With tax relief, that’s ${money(sippRelief(c.monthlyOf(key)).gross)} a month going into your pension.`
    : '';
  return [
    { tone: 'success', html: done },
    { html: `That adds about <strong>${moneyShort(s.central - before)}</strong> to the central estimate over ${s.periodLong}.${extra}` },
  ];
}

/* ── Steps ──────────────────────────────────────────────── */
export const STEPS = {
  start: {
    chip: 'Start planning',
    match: /\b(start|begin|plan|yes|let'?s go|ok(ay)?)\b/i,
    quiet: true,
    run: () => [
      { html: `Your portfolio today is <strong>96% shares</strong>, mostly in four actively managed global funds, with ${money(31800)} in cash.` },
      {
        html: 'Before looking at funds: how much risk feels right for any new money? Here are three approaches and their trade-offs.',
        options: { label: 'Approaches', items: Object.keys(RISKS).map(riskOption) },
      },
    ],
  },

  'monthly-1000': {
    chip: 'What if I invest £1,000 a month?',
    match: /(1,?000|1k|thousand|more a month|increase|monthly)/i,
    run: c => {
      const key = c.fund();
      const before = c.summary().central;
      c.setMonthly(key, 1000);
      const s = c.summary();
      const extra = c.accountOf(key) === 'SIPP' ? ` In your pension, with tax relief, that’s ${money(sippRelief(1000).gross)} a month.` : '';
      return [
        { tone: 'success', html: `Your monthly amount into <strong>${c.nameOf(key)}</strong> is now <strong>${money(1000)}</strong>.${extra}` },
        { html: `That adds about <strong>${moneyShort(s.central - before)}</strong> to the central estimate over ${s.periodLong}. Regular amounts also smooth out the price you pay over time.` },
      ];
    },
  },

  /* ── Adding more to a holding ───────────────────────────── */
  topup: {
    chip: 'Add more to my fund',
    match: /\b(add more|top[- ]?up|put more|invest more|buy more|more (in|into|to) (it|this|my|the))\b/i,
    quiet: true,
    repeatable: true,
    run: c => {
      const key = c.takeTarget();
      if (!key) return [{ html: 'Once a fund is in your plan, you can add more to it here: a one-off amount, a bigger monthly amount, or some of your cash. Shall we start with how much risk feels right?' }];
      const items = topupOptions(c, key);
      const ways = ['', 'One way', 'Two ways', 'Three ways'][items.length];
      return [{
        html: `${ways} to add more to <strong>${c.nameOf(key)}</strong>${c.accountOf(key) ? ` in your ${ACCOUNTS[c.accountOf(key)].name}` : ''}:`,
        options: { label: `Ways to add more to ${c.nameOf(key)}`, items },
      }];
    },
  },

  'topup-lump': {
    chip: 'Add a one-off amount',
    match: /^$/,                 /* chosen from the option cards */
    repeatable: true,
    run: c => {
      const key = c.target();
      const amount = topupAmount(c, key);
      const before = c.summary().central;
      c.addLump(key, amount);
      return topupReply(c, key, before, `Added <strong>${money(amount)}</strong> of new money to <strong>${c.nameOf(key)}</strong>.`);
    },
  },

  'topup-monthly': {
    chip: 'Raise the monthly amount',
    match: /^$/,
    repeatable: true,
    run: c => {
      const key = c.target();
      const up = raisedMonthly(c, key);
      const before = c.summary().central;
      c.setMonthly(key, up);
      return topupReply(c, key, before, `Your monthly amount into <strong>${c.nameOf(key)}</strong> is now <strong>${money(up)}</strong>.`, true);
    },
  },

  'topup-cash': {
    chip: 'Use some of my cash',
    match: /^$/,
    repeatable: true,
    run: c => {
      const key = c.target();
      const amount = topupAmount(c, key);
      const before = c.summary().central;
      c.moveLump('CASH', key, amount);
      return topupReply(c, key, before, `Moved <strong>${money(amount)}</strong> from your cash into <strong>${c.nameOf(key)}</strong>. You have ${money(c.lumpOf('CASH'))} left in cash.`);
    },
  },

  'add-gold': {
    chip: 'Add some gold as a hedge',
    match: /\b(gold|hedge)\b/i,
    skip: c => c.has('SGLN'),
    run: c => {
      const key = c.addEtf('SGLN', { account: 'GIA' }).key;
      c.moveLump('CASH', key, 10000);
      return [
        { html: `Gold has often held its value when shares fall. <strong>iShares Physical Gold</strong>: ${etfFacts('SGLN')}.`, etf: 'SGLN' },
        { tone: 'success', html: `Moved <strong>${money(10000)}</strong> from cash into gold, both in your general account. Your cash is now ${money(c.lumpOf('CASH'))}.` },
        { tone: 'warning', html: 'Gold’s last five years were unusually strong. The projection uses a long-run assumption of 3.5% a year, not that recent run.' },
      ];
    },
  },

  'remove-veritas': {
    chip: 'Remove the underperformer',
    match: /\b(remove|sell|drop|underperform|veritas)\b/i,
    run: c => {
      const id = c.fundId();
      const amount = c.lumpOf('VERITAS');
      c.remove('VERITAS');
      /* The proceeds are in the general account, so they're reinvested there */
      const key = c.addEtf(id, { account: 'GIA' }).key;
      c.moveLumpFromRemoved('VERITAS', key, amount);
      const elsewhere = !['GIA', null].includes(c.fundAccount());
      return [
        { html: '<strong>Veritas Global Focus</strong> is your only holding that’s down: −6.3% since you bought it.' },
        { tone: 'success', html: `Modelled selling it and moving <strong>${money(amount)}</strong> into ${ETFS[id].short}${elsewhere ? ' in your general account, where the money already is' : ''}.` },
        { tone: 'warning', html: 'Selling a fund in a general account can create a capital gains tax bill or, as here, a loss you can use. <a href="/capital-gains-tax/">See your capital gains tax position</a>.' },
      ];
    },
  },

  grow: {
    chip: 'Show me if I leave it to grow',
    match: /\b(grow|long|all|25|leave|retire|future)\b/i,
    run: c => {
      c.setPeriod('All');
      const s = c.summary();
      return [
        { html: `Left to grow for 25 years, the central estimate is <strong>${moneyShort(s.central)}</strong>.` },
        { html: `The likely range is ${moneyShort(s.low)} to ${moneyShort(s.high)}. It widens the further out you look. That’s the honest shape of long-term investing.` },
      ];
    },
  },

  /* ── Review and decide ──────────────────────────────────── */
  review: {
    chip: 'Review and invest',
    match: /\b(review|invest now|go ahead|ready|make it happen|make (this|the) investment|place (the |these |my )?orders?|confirm|submit)\b/i,
    quiet: true,
    repeatable: true,
    run: c => {
      if (!c.orderCount()) return [{ html: 'There’s nothing to place yet: the plan matches your portfolio today. Add a fund or change an amount first.' }];
      /* Jumping here early: the new money still needs an account */
      if (c.needsAccount()) return [{ html: 'Nearly there. First, choose where the new money goes.' }, accountQuestion(c)];
      if (!c.checked()) return [{ html: 'Before the review, three quick questions. They help show whether this plan fits your situation.', check: true }];
      return [{ html: 'Here’s everything this plan would do, what it costs, and how it uses your allowances. Nothing happens until you place the orders.', review: true }];
    },
  },

  'check-done': {
    chip: 'Continue',
    match: /^$/,                 /* answered with the form, not by typing */
    slots: ['review'],
    quiet: true,
    run: c => {
      const answers = c.checkAnswers();
      const concerns = CHECKS.filter(q => answers[q.id] === false);
      if (!concerns.length) {
        return [
          { tone: 'success', html: 'Thanks. Those answers fit a long-term plan like this one.' },
          { html: 'Here’s everything this plan would do, what it costs, and how it uses your allowances. Nothing happens until you place the orders.', review: true },
        ];
      }
      return [
        { tone: 'warning', html: concerns.map(q => q.no).join(' ') },
        { html: 'You can still go ahead, or talk it through with James first. Here’s the review:', review: true },
      ];
    },
  },

  confirm: {
    chip: 'Place these orders',
    match: /^$/,                 /* only the review's button, after both ticks */
    slots: ['decide'],
    quiet: true,
    status: 'placed',
    run: () => [
      { tone: 'success', html: '<strong>Orders placed.</strong>', receipt: true },
      { html: `Sales and purchases go to market at the next dealing point and settle in 2 working days. Regular amounts start on ${TAX_YEAR.firstPayment}, and you can change or stop them at any time from <a href="/my-investments/">My Investments</a>.` },
      { html: 'You chose these investments; Aurelius hasn’t recommended them. James can still review them with you at your next meeting.' },
    ],
  },

  'send-james': {
    chip: 'Send to James first',
    match: /\b(james|adviser|advisor|talk to someone|check with)\b/i,
    slots: ['decide'],
    quiet: true,
    status: 'adviser',
    run: () => [
      { tone: 'success', html: 'Sent to <strong>James</strong>, with the plan and the orders it would place.' },
      { html: 'Nothing has been bought or sold. He usually replies within 2 working days, and can check the plan suits your circumstances before anything is placed.' },
    ],
  },

  save: {
    chip: 'Save it for later',
    match: /\b(save|keep|later|not now)\b/i,
    slots: ['decide'],
    quiet: true,
    status: 'saved',
    run: () => [
      { tone: 'success', html: 'Plan saved to your documents as <strong>“My future plan — November 2026”</strong>.' },
      { html: 'Nothing has been bought or sold. You can come back to it, or James, your adviser, can review it with you.' },
    ],
  },

  /* ── Questions (answer, don't move on) ──────────────────── */
  'topic-isa': {
    chip: 'What’s an ISA?',
    match: /\b(isas?|allowance|tax[- ]free)\b/i,
    info: true, quiet: true,
    run: () => [
      { html: 'An ISA lets your money grow free of UK tax. There’s no tax on growth, income or withdrawals, and you can take money out at any time.' },
      { html: `You can pay in up to ${money(TAX_YEAR.isa.limit)} each tax year. You’ve used ${money(TAX_YEAR.isa.used)} of this year’s, so <strong>${money(isaLeft())}</strong> is left until ${TAX_YEAR.ends}. Unused allowance doesn’t carry over.` },
    ],
  },

  'topic-sipp': {
    chip: 'What about my pension?',
    match: /\b(pensions?|sipp|tax relief)\b/i,
    info: true, quiet: true,
    run: () => {
      const r = sippRelief(800);
      return [
        { html: `Paying into your SIPP gets tax relief. For every ${money(800)} you pay in, ${money(r.atSource)} is added, making ${money(r.gross)}. As a higher-rate taxpayer you can claim back a further ${money(r.extra)} through your tax return, so ${money(r.gross)} in your pension costs you ${money(r.netCost)}.` },
        { html: `The trade-off: the money is locked away until at least 57, and withdrawals are taxed as income, apart from 25% you can usually take tax-free. You can pay in up to ${money(TAX_YEAR.sipp.limit)} a year, including tax relief.` },
      ];
    },
  },

  'topic-gia': {
    chip: 'What’s a general account?',
    match: /\b(general (investment )?account|gia|taxable account)\b/i,
    info: true, quiet: true,
    run: () => [
      { html: `A general account has no limits on how much you add or when you take it out, but it isn’t tax-sheltered. Dividends over ${money(TAX_YEAR.dividendAllowance)} and gains over ${money(TAX_YEAR.cgtAllowance)} a year are taxable.` },
      { html: 'Your Veritas fund and your cash are held here. Each April, some of it could move into your ISA using the new allowance.' },
    ],
  },

  /* ── What if markets fall? ─────────────────────────────── */
  stress: {
    chip: 'What if markets fall 25%?',
    match: /(\bcrash|\bdownturn|\bstress|\bworst case|\bcould i lose|\bhow much (could|might) i lose|\bmarkets? (fall|fell|drop|dropped|crash))/i,
    info: true, quiet: true,
    run: c => {
      const r = { ...c.stress() };
      r.recovery = duration(r.months);
      return [
        { html: `If shares fell 25% tomorrow, this plan would drop from ${money(r.before)} to about <strong>${money(r.after)}</strong>: a fall of ${money(r.loss)}, or ${(r.lossPct * 100).toFixed(0)}%.${r.cushioned ? ' Gold, gilts and cash would cushion part of it.' : ''}`, stress: r },
        { html: `At the assumed growth, with your monthly amounts still going in, it would be back to today’s value in about <strong>${r.recovery}</strong>. Falls this size have happened several times in the last 25 years, and recoveries have taken anything from months to years.` },
        { html: 'Could you leave it invested through a fall like that? If not, a more cautious approach may fit better.' },
      ];
    },
  },

  /* ── Other investments and common questions ─────────────── */
  'topic-costs': {
    chip: 'What will this cost me?',
    match: /\b(costs?|charges?|fees?|how much does it cost)\b/i,
    info: true, quiet: true,
    run: c => {
      const k = c.costs();
      if (!k.fundCharges) return [{ html: 'Nothing has been added to the plan yet, so there are no new fund charges. The funds suggested here charge between 0.07% and 0.30% a year.' }];
      return [
        { html: `The funds in this plan charge between 0.07% and 0.30% a year. For the new money in this plan that’s about <strong>${money(k.fundCharges)}</strong> in the first year, plus about ${money(k.dealing)} in one-off dealing costs.` },
        { html: 'Fund charges come out of the fund’s value, so there’s no bill to pay. Your Aurelius management fee is separate and isn’t shown in this demo.' },
      ];
    },
  },

  'topic-cash': {
    chip: 'Why not keep it in cash?',
    match: /\b(cash savings?|savings account|keep (it |this )?in cash|in the bank|interest rates?)\b/i,
    info: true, quiet: true,
    run: c => [
      { html: `Cash is steady: it won’t fall in value, and savings are protected up to £120,000 per person, per bank, by the Financial Services Compensation Scheme. Your plan holds ${money(c.lumpOf('CASH'))} in cash.` },
      { html: 'The trade-off is growth. Over long periods cash has usually grown more slowly than shares, and can lose ground to inflation. Many people keep 3 to 6 months of spending in cash and invest money they won’t need for at least 5 years.' },
    ],
  },

  'topic-property': {
    chip: 'What about property?',
    match: /\b(property|properties|buy[- ]to[- ]let|real estate|reits?|landlord)\b/i,
    info: true, quiet: true,
    run: () => [
      { html: 'Buying a property to let can bring rent and growth, but it puts a lot in one asset. It costs more to buy (including extra stamp duty on additional homes), rent is taxed, and it can take months to sell.' },
      { html: 'Property funds and REITs own many buildings and can sit in an ISA or SIPP. They’re easier to buy and sell, but still rise and fall with markets. This demo doesn’t include one.' },
    ],
  },

  'topic-shares': {
    chip: 'What about individual shares?',
    match: /\b(individual shares?|single (stock|shares?|compan(y|ies))|stock ?picking|particular compan(y|ies)|buy shares in)\b/i,
    info: true, quiet: true,
    run: () => [
      { html: 'Individual shares put more on each company: a few can do very well, and any one can fall sharply or fail.' },
      { html: 'A fund spreads your money across hundreds or thousands of companies, so one bad result matters less. Some people hold a small part of their portfolio in individual shares alongside funds.' },
      { html: 'Want to see what buying shares in one company would look like?' },
    ],
  },

  'topic-crypto': {
    chip: 'What about crypto?',
    match: /\b(crypto|cryptos|cryptocurrenc(y|ies)|bitcoin|ethereum|btc)\b/i,
    info: true, quiet: true,
    run: () => [
      { html: 'Aurelius doesn’t offer cryptoassets, so they can’t be part of this plan.' },
      { tone: 'warning', html: 'The FCA warns that cryptoassets are high risk and that you should be prepared to lose all the money you put in. Most aren’t covered by the Financial Services Compensation Scheme.' },
    ],
  },

  'topic-timing': {
    chip: 'Is now a good time to invest?',
    match: /\b(good time|right time|bad time|wait(ing)? (for|until)|timing|when should i|market (is )?(too )?(high|expensive)|bubble)\b/i,
    info: true, quiet: true,
    run: () => [
      { html: 'Nobody can reliably tell when markets will rise or fall. Waiting for a better moment can mean missing some of the best days, which often come soon after the worst ones.' },
      { html: 'Investing a set amount each month spreads the price you pay: you buy more when prices are low and less when they’re high. That’s how the monthly amounts in this plan work.' },
    ],
  },

  /* ── Shares in one company ─────────────────────────────── */
  shares: {
    chip: 'Show me some company shares',
    match: /\b(shares? in (a |one |a single |a particular |one particular )?compan(y|ies)|buy (some )?(company )?shares|single compan(y|ies)|particular compan(y|ies)|stocks? in (a )?compan(y|ies)|individual compan(y|ies))\b/i,
    quiet: true,
    repeatable: true,
    run: c => {
      const { amount, note } = shareInto(c);
      return [
        { html: `Buying shares in one company puts more on how that company does. Here are three well-known ones to compare, with ${money(amount)} of new money in each case.${note} <strong>This isn’t a recommendation.</strong>` },
        { html: 'The projection uses the same long-run 7% a year for each, so the chart can’t tell them apart. Where they differ is the swings along the way and what could go wrong.',
          options: { label: 'Company shares', items: Object.keys(SHARE_POINTS).map(shareOption) } },
      ];
    },
  },

  reset: {
    chip: 'Start again',
    match: /\b(reset|start again|start over|clear)\b/i,
    run: c => {
      c.reset();
      return [{ html: 'Back to your portfolio as it is today. Where would you like to begin?' }];
    },
  },
};

/* Choosing an approach: three funds that suit it */
for (const [key, r] of Object.entries(RISKS)) {
  STEPS[`risk-${key}`] = {
    chip: r.chip,
    match: r.match,
    slots: ['start', 'risk'],
    quiet: true,
    run: c => {
      c.setRisk(key);
      return [{
        html: `${r.intro} Here are three funds that suit it, with the trade-offs of each.`,
        options: { label: `${r.title} fund options`, items: r.funds.map(fundOption) },
      }];
    },
  };
}

/* Choosing a fund: add it with a regular amount. If no account has
   been chosen yet, ask; otherwise it goes where new money goes.   */
for (const id of Object.keys(FUND_POINTS)) {
  STEPS[`pick-${id}`] = {
    chip: `Add ${ETFS[id].short}`,
    match: FUND_POINTS[id].match,
    slots: ['start', 'risk', 'fund'],
    run: c => {
      const account = c.account();
      const key = c.addEtf(id, { monthly: 500, account }).key;
      c.setFund(key);
      const s = c.summary();
      const reply = [
        { tone: 'success', html: `Added <strong>${ETFS[id].short}</strong> with <strong>${money(500)} a month</strong>${account ? ` in your ${ACCOUNTS[account].name}` : ''}.` },
        { html: `Over ${s.periodLong}, the central estimate is now <strong>${moneyShort(s.central)}</strong>, ${moneyShort(s.vsBaseline)} more than leaving things as they are.` },
      ];
      if (!account) reply.push(accountQuestion(c));
      return reply;
    },
  };
}

/* Choosing an account for the new money */
const ACCOUNT_CHIPS = { ISA: 'Put it in my ISA', SIPP: 'Put it in my pension', GIA: 'Use my general account' };
const ACCOUNT_MATCH = {
  ISA:  /\b(put|hold|use|keep) (it |this |them )?(in(to)? )?(my |the |an )?isa\b/i,
  SIPP: /\b(put|hold|use|keep) (it |this |them )?(in(to)? )?(my |the |a )?(pension|sipp)\b/i,
  GIA:  /\b(put|hold|use|keep) (it |this |them )?(in(to)? )?(my |the |a )?general( account)?\b/i,
};
for (const id of Object.keys(ACCOUNTS)) {
  STEPS[`account-${id}`] = {
    chip: ACCOUNT_CHIPS[id],
    match: ACCOUNT_MATCH[id],
    slots: ['account'],
    run: c => {
      const key = c.setAccount(id);
      return [
        { tone: 'success', html: `${key ? c.nameOf(key) : 'New money'} will be held in your <strong>${ACCOUNTS[id].name}</strong>.` },
        { html: accountNote(id, key ? c.monthlyOf(key) : 500) },
      ];
    },
  };
}

/* Adding shares in one company: the amount, how much of the
   portfolio that is, any overlap with funds held, and the costs */
for (const id of Object.keys(SHARE_POINTS)) {
  STEPS[`share-${id}`] = {
    chip: `Add ${ETFS[id].short} shares`,
    match: SHARE_POINTS[id].match,
    repeatable: true,
    run: c => {
      const e = ETFS[id];
      const { account, amount, note } = shareInto(c);
      const before = c.summary().central;
      c.addEtf(id, { lump: amount, account });
      const s = c.summary();
      const share = amount / c.totalValue();
      const overlap = c.overlap(id);
      const held = overlap.reduce((a, o) => a + o.value, 0);
      const costs = e.currency === 'GBP'
        ? `Buying UK shares adds 0.5% stamp duty: about ${money(amount * 0.005)}.`
        : `Shares priced in dollars need a currency conversion, estimated at 0.5% (about ${money(amount * 0.005)}). A W-8BEN form reduces the US tax taken from dividends.`;
      const reply = [
        { tone: 'success', html: `Added <strong>${money(amount)}</strong> of <strong>${e.short}</strong> shares${account ? ` in your ${ACCOUNTS[account].name}` : ''}. That’s ${(share * 100).toFixed(1)}% of your portfolio.${note}`, etf: id },
        held >= 1
          ? { html: `You already own about <strong>${money(held)}</strong> of ${e.short} through ${overlap.map(o => `${ETFS[o.line.id].short} (about ${(o.weight * 100).toFixed(1)}% of that fund)`).join(' and ')}.` }
          : null,
        { html: `${costs} There’s no yearly fund charge on shares. Over ${s.periodLong}, the central estimate rises by about ${moneyShort(s.central - before)}, using a long-run 7% a year rather than the past five years.` },
        share > 0.1
          ? { tone: 'warning', html: 'That’s more than 10% of your portfolio in one company. Many people keep any single share to a small part of what they hold.' }
          : { tone: 'warning', html: 'One company can fall sharply, or fail, in a way a fund of thousands rarely does. This isn’t a recommendation.' },
      ].filter(Boolean);
      if (!account) reply.push(accountQuestion(c));
      return reply;
    },
  };
}

/* Record a finished step. Choices fill their slots and can be made
   again (to change approach, add a second fund, or switch account).
   Questions don't count as progress.                              */
export function markDone(done, id) {
  const step = STEPS[id];
  if (step.info) return;
  if (step.slots) step.slots.forEach(s => done.add(s));
  else if (id !== 'reset') done.add(id);
}

/* Typed-message matching: specific asks first, broad words last */
const MATCH_ORDER = [
  'reset', 'confirm', 'send-james',
  'account-ISA', 'account-SIPP', 'account-GIA',
  'topic-gia', 'topic-sipp', 'topic-isa',
  'share-AAPL', 'share-AZN', 'share-RR', 'shares',
  'stress', 'topic-crypto', 'topic-property', 'topic-shares', 'topic-timing', 'topic-cash', 'topic-costs',
  'review', 'topup', 'remove-veritas', 'monthly-1000',
  'risk-cautious', 'risk-balanced', 'risk-adventurous',
  'add-gold', 'pick-VUAG', 'pick-EQQQ', 'pick-IGLT', 'pick-SGLN', 'pick-VWRP',
  'grow', 'save', 'start',
];

export function matchStep(text, done) {
  for (const id of MATCH_ORDER) {
    if (STEPS[id].match.test(text) && !(done.has(id) && !STEPS[id].repeatable)) return id;
  }
  return null;
}

/* Next chips:
   - choosing an approach: the three approaches
   - choosing a fund: the other approaches
   - choosing an account: questions about the accounts, then the
     account just asked about
   - deciding: saving for later (the review card holds the rest)
   - otherwise: the next two unfinished route steps
   (the UI drops any chip that repeats an option card above it)   */
export function nextChips(done, c, lastId) {
  /* The check card is the answer; nothing else to tap */
  if (lastId === 'review' && !c.checked() && c.orderCount()) return [];
  const remaining = ROUTE.filter(id => !done.has(id) && !STEPS[id]?.skip?.(c));
  if (!remaining.length) return ['reset'];
  const next = remaining[0];
  if (next === 'risk') return Object.keys(RISKS).map(k => `risk-${k}`);
  if (next === 'fund') return Object.keys(RISKS).filter(k => k !== c.risk()).map(k => `risk-${k}`);
  if (next === 'account') {
    if (lastId === 'topic-isa')  return ['account-ISA', 'topic-sipp'];
    if (lastId === 'topic-sipp') return ['account-SIPP', 'topic-isa'];
    if (lastId === 'topic-gia')  return ['account-GIA', 'topic-isa'];
    return ['topic-isa', 'topic-sipp'];
  }
  /* The review card holds place / send; after any change, review again */
  if (next === 'decide') return ['review', 'check-done'].includes(lastId) ? ['save'] : ['review', 'save'];
  /* Never offer a step that sits beyond an unmade choice */
  const before = remaining.findIndex(id => SLOTS.has(id));
  const route = (before === -1 ? remaining : remaining.slice(0, before)).slice(0, 2);
  if (lastId === 'topic-shares') return ['shares', ...route.slice(0, 1)];
  /* After the stress test, offer the cautious route alongside the next step */
  if (lastId === 'stress' && c.risk() !== 'cautious') return ['risk-cautious', ...route.slice(0, 1)];
  return route;
}

export const GREETING = (name, value) => [
  { html: `Good ${dayPart()}, ${name}. Your portfolio is worth <strong>${money(value)}</strong> today.` },
  { html: 'On the right is where it could go if you leave it as it is. Shall we see what a plan could do?' },
];

export const FALLBACK = [
  { html: 'I can model a few things in this demo: a more cautious or more adventurous approach, adding a fund, choosing an ISA, pension or general account, changing what you invest each month, adding more to a holding, buying shares in a company, or removing one. I can also answer questions about costs, market falls, cash, property, shares and crypto: try <strong>Ask about</strong> below. Or one of these:' },
];

function dayPart() {
  const h = new Date().getHours();
  return h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening';
}
