/* ─── PLAN MY FUTURE — SCRIPTED CONVERSATION ─────────────────
   A deterministic demo script. Every step has:
     id     — unique key
     chip   — the suggestion-chip label (also the user's words)
     match  — regex for free-typed messages
     run(c) — mutates the plan via the context and returns the
              bot's reply: an array of { html, tone?, etf? }
   The main route runs in ROUTE order; chips always offer the
   next unfinished steps, so the demo can't drift off-script.
   Copy rule: explain and model, never instruct ("you should").
   ─────────────────────────────────────────────────────────── */

import { ETFS, money, moneyShort, pct } from './plan-model.js';

export const ROUTE = ['start', 'add-vwrp', 'add-gold', 'monthly-1000', 'remove-veritas', 'grow', 'save'];

const etfFacts = id => {
  const e = ETFS[id];
  return `${pct(e.fiveYear, 0)} over the past 5 years, ${(e.volatility * 100).toFixed(0)}% typical yearly swing, ${e.ocf.toFixed(2)}% a year in charges`;
};

export const STEPS = {
  start: {
    chip: 'Start planning',
    match: /\b(start|begin|plan|yes|let'?s go|ok(ay)?)\b/i,
    run: c => [
      { html: `Your portfolio today is <strong>96% shares</strong>, mostly in four actively managed global funds, with ${money(31800)} in cash.` },
      { html: 'A low-cost global tracker is a common way to build a steady core alongside funds like these. Here’s one you could model:', etf: 'VWRP' },
    ],
  },

  'add-vwrp': {
    chip: 'Add a global tracker',
    match: /\b(global|tracker|all[- ]?world|vwrp)\b/i,
    run: c => {
      c.addEtf('VWRP', { monthly: 500 });
      const s = c.summary();
      return [
        { tone: 'success', html: `Added <strong>Vanguard FTSE All-World</strong> with <strong>${money(500)} a month</strong>.` },
        { html: `Over ${s.periodLong}, the central estimate is now <strong>${moneyShort(s.central)}</strong>, ${moneyShort(s.vsBaseline)} more than leaving things as they are.` },
      ];
    },
  },

  'add-gold': {
    chip: 'Add some gold as a hedge',
    match: /\b(gold|hedge|sgln)\b/i,
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

  'monthly-1000': {
    chip: 'What if I invest £1,000 a month?',
    match: /(1,?000|1k|thousand|more a month|increase|monthly)/i,
    run: c => {
      const before = c.summary().central;
      c.setMonthly('VWRP', 1000);
      const s = c.summary();
      return [
        { tone: 'success', html: `Your monthly amount into the global tracker is now <strong>${money(1000)}</strong>.` },
        { html: `That adds about <strong>${moneyShort(s.central - before)}</strong> to the central estimate over ${s.periodLong}. Regular amounts also smooth out the price you pay over time.` },
      ];
    },
  },

  'remove-veritas': {
    chip: 'Remove the underperformer',
    match: /\b(remove|sell|drop|underperform|veritas)\b/i,
    run: c => {
      const amount = c.lumpOf('VERITAS');
      c.remove('VERITAS');
      c.moveLumpFromRemoved('VERITAS', 'VWRP', amount);
      return [
        { html: `<strong>Veritas Global Focus</strong> is your only holding that’s down: −6.3% since you bought it.` },
        { tone: 'success', html: `Modelled selling it and moving <strong>${money(amount)}</strong> into the global tracker.` },
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

  /* ── Off-route extras (typed only) ──────────────────────── */
  'add-vuag': {
    chip: 'Add the S&P 500',
    match: /\b(s&p|sp ?500|us shares|america|vuag)\b/i,
    run: c => {
      c.addEtf('VUAG', { monthly: 250 });
      return [{ tone: 'success', html: `Added <strong>Vanguard S&amp;P 500</strong> with ${money(250)} a month. ${etfFacts('VUAG')}.`, etf: 'VUAG' }];
    },
  },
  'add-eqqq': {
    chip: 'Add the Nasdaq-100',
    match: /\b(nasdaq|tech|technology|eqqq)\b/i,
    run: c => {
      c.addEtf('EQQQ', { monthly: 250 });
      return [
        { tone: 'success', html: `Added <strong>Invesco Nasdaq-100</strong> with ${money(250)} a month.`, etf: 'EQQQ' },
        { tone: 'warning', html: `It’s concentrated in a few large tech companies: ${etfFacts('EQQQ')}.` },
      ];
    },
  },
  'add-iglt': {
    chip: 'Add UK gilts',
    match: /\b(gilts?|bonds?|safer|steady|iglt)\b/i,
    run: c => {
      c.addEtf('IGLT', {});
      c.moveLump('CASH', 'IGLT', 10000);
      return [{ tone: 'success', html: `Moved ${money(10000)} from cash into <strong>iShares Core UK Gilts</strong>. ${etfFacts('IGLT')}.`, etf: 'IGLT' }];
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

/* Typed-message matching: route steps first (in order), then extras */
const MATCH_ORDER = ['reset', 'remove-veritas', 'monthly-1000', 'add-gold', 'add-vuag', 'add-eqqq', 'add-iglt', 'add-vwrp', 'grow', 'save', 'start'];

export function matchStep(text, done) {
  for (const id of MATCH_ORDER) {
    if (STEPS[id].match.test(text) && !(done.has(id) && id !== 'reset')) return id;
  }
  return null;
}

/* Next chips: the next two unfinished route steps */
export function nextChips(done) {
  const remaining = ROUTE.filter(id => !done.has(id));
  if (!remaining.length) return ['reset'];
  return remaining.slice(0, 2);
}

export const GREETING = (name, value) => [
  { html: `Good ${dayPart()}, ${name}. Your portfolio is worth <strong>${money(value)}</strong> today.` },
  { html: 'On the right is where it could go if you leave it as it is. Shall we see what a plan could do?' },
];

export const FALLBACK = [
  { html: 'I can model a few things in this demo: adding a tracker, gold or gilts, changing what you invest each month, or removing a holding. Try one of these:' },
];

function dayPart() {
  const h = new Date().getHours();
  return h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening';
}
