/* ─── PLAN MY FUTURE — SCRIPTED CONVERSATION ─────────────────
   A deterministic demo script. Every step has:
     id     — unique key
     chip   — the suggestion-chip label (also the user's words)
     match  — regex for free-typed messages
     run(c) — mutates the plan via the context and returns the
              bot's reply: an array of { html, tone?, etf?, options? }
     slots  — (choice steps) the route slots a choice fills
     skip   — (optional) hide the step's chip when it no longer fits

   Route: start → choose an approach (cautious / balanced /
   adventurous) → choose one of three funds → then the fixed steps.
   'risk' and 'fund' are slots: any of their choices fills them.
   Choices are offered as option cards with plus and minus points,
   so the user always sees the trade-off before they pick.
   Copy rule: explain and model, never instruct ("you should"),
   and never rank the options as "best".
   ─────────────────────────────────────────────────────────── */

import { ETFS, money, moneyShort, pct } from './plan-model.js';

export const ROUTE = ['start', 'risk', 'fund', 'monthly-1000', 'add-gold', 'remove-veritas', 'grow', 'save'];
const SLOTS = new Set(['risk', 'fund']);

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
    pros: [e => 'Thousands of companies worldwide in one fund', e => `Low charge: ${e.ocf.toFixed(2)}% a year`],
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

/* ── Steps ──────────────────────────────────────────────── */
export const STEPS = {
  start: {
    chip: 'Start planning',
    match: /\b(start|begin|plan|yes|let'?s go|ok(ay)?)\b/i,
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
      const id = c.fund();
      const before = c.summary().central;
      c.setMonthly(id, 1000);
      const s = c.summary();
      return [
        { tone: 'success', html: `Your monthly amount into <strong>${ETFS[id].short}</strong> is now <strong>${money(1000)}</strong>.` },
        { html: `That adds about <strong>${moneyShort(s.central - before)}</strong> to the central estimate over ${s.periodLong}. Regular amounts also smooth out the price you pay over time.` },
      ];
    },
  },

  'add-gold': {
    chip: 'Add some gold as a hedge',
    match: /\b(gold|hedge)\b/i,
    skip: c => c.has('SGLN'),
    run: c => {
      c.addEtf('SGLN', {});
      c.moveLump('CASH', 'SGLN', 10000);
      return [
        { html: `Gold has often held its value when shares fall. <strong>iShares Physical Gold</strong>: ${etfFacts('SGLN')}.`, etf: 'SGLN' },
        { tone: 'success', html: `Moved <strong>${money(10000)}</strong> from cash into gold. Your cash is now ${money(c.lumpOf('CASH'))}.` },
        { tone: 'warning', html: 'Gold’s last five years were unusually strong. The projection uses a long-run assumption of 3.5% a year, not that recent run.' },
      ];
    },
  },

  'remove-veritas': {
    chip: 'Remove the underperformer',
    match: /\b(remove|sell|drop|underperform|veritas)\b/i,
    run: c => {
      const to = c.fund();
      const amount = c.lumpOf('VERITAS');
      c.remove('VERITAS');
      c.moveLumpFromRemoved('VERITAS', to, amount);
      return [
        { html: `<strong>Veritas Global Focus</strong> is your only holding that’s down: −6.3% since you bought it.` },
        { tone: 'success', html: `Modelled selling it and moving <strong>${money(amount)}</strong> into ${ETFS[to].short}.` },
        { tone: 'warning', html: 'Selling a fund can create a capital gains tax bill or, as here, a loss you can use. <a href="/capital-gains-tax/">See your capital gains tax position</a>.' },
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

  save: {
    chip: 'Save this plan',
    match: /\b(save|keep|done|finish|happy)\b/i,
    run: c => {
      c.markSaved();
      return [
        { tone: 'success', html: 'Plan saved to your documents as <strong>“My future plan — November 2026”</strong>.' },
        { html: 'Nothing has been bought or sold. James, your adviser, can review this with you and check it suits your circumstances.' },
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
    run: c => {
      c.setRisk(key);
      return [{
        html: `${r.intro} Here are three funds that suit it, with the trade-offs of each.`,
        options: { label: `${r.title} fund options`, items: r.funds.map(fundOption) },
      }];
    },
  };
}

/* Choosing a fund: add it with a regular amount */
for (const id of Object.keys(FUND_POINTS)) {
  STEPS[`pick-${id}`] = {
    chip: `Add ${ETFS[id].short}`,
    match: FUND_POINTS[id].match,
    slots: ['start', 'risk', 'fund'],
    run: c => {
      c.addEtf(id, { monthly: 500 });
      c.setFund(id);
      const s = c.summary();
      return [
        { tone: 'success', html: `Added <strong>${ETFS[id].short}</strong> with <strong>${money(500)} a month</strong>.` },
        { html: `Over ${s.periodLong}, the central estimate is now <strong>${moneyShort(s.central)}</strong>, ${moneyShort(s.vsBaseline)} more than leaving things as they are.` },
      ];
    },
  };
}

/* Record a finished step. Choices fill their slots and can be made
   again (to change approach, or add a second fund).              */
export function markDone(done, id) {
  const step = STEPS[id];
  if (step.slots) step.slots.forEach(s => done.add(s));
  else if (id !== 'reset') done.add(id);
}

/* Typed-message matching: specific asks first, broad words last */
const MATCH_ORDER = [
  'reset', 'remove-veritas', 'monthly-1000',
  'risk-cautious', 'risk-balanced', 'risk-adventurous',
  'add-gold', 'pick-VUAG', 'pick-EQQQ', 'pick-IGLT', 'pick-SGLN', 'pick-VWRP',
  'grow', 'save', 'start',
];

export function matchStep(text, done) {
  for (const id of MATCH_ORDER) {
    if (STEPS[id].match.test(text) && !done.has(id)) return id;
  }
  return null;
}

/* Next chips:
   - choosing an approach: the three approaches
   - choosing a fund: offer the other approaches instead
   (the UI drops any chip that repeats an option card above it)
   - otherwise: the next two unfinished route steps           */
export function nextChips(done, c) {
  const remaining = ROUTE.filter(id => !done.has(id) && !STEPS[id]?.skip?.(c));
  if (!remaining.length) return ['reset'];
  if (remaining[0] === 'risk') return Object.keys(RISKS).map(k => `risk-${k}`);
  if (remaining[0] === 'fund') return Object.keys(RISKS).filter(k => k !== c.risk()).map(k => `risk-${k}`);
  /* Never offer a step that sits beyond an unmade choice */
  const before = remaining.findIndex(id => SLOTS.has(id));
  return (before === -1 ? remaining : remaining.slice(0, before)).slice(0, 2);
}

export const GREETING = (name, value) => [
  { html: `Good ${dayPart()}, ${name}. Your portfolio is worth <strong>${money(value)}</strong> today.` },
  { html: 'On the right is where it could go if you leave it as it is. Shall we see what a plan could do?' },
];

export const FALLBACK = [
  { html: 'I can model a few things in this demo: a more cautious or more adventurous approach, adding a fund, changing what you invest each month, or removing a holding. Try one of these:' },
];

function dayPart() {
  const h = new Date().getHours();
  return h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening';
}
