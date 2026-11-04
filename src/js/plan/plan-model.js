/* ─── PLAN MY FUTURE — MODEL ─────────────────────────────────
   Plan state and projection maths. Pure functions, no DOM.

   Projection: each holding compounds monthly at its expected
   return, with monthly contributions added at month end:
     V(t) = V0·g^t + C·(g^t − 1)/(g − 1),  g = (1 + r)^(1/12)
   The likely range is the 10th–90th percentile of a lognormal
   spread around the central path, using the portfolio's
   value-weighted volatility with a diversification factor.
   It is closed-form, so every demo run gives identical numbers.
   ─────────────────────────────────────────────────────────── */

import { ETF_SNAPSHOT, CURRENT_HOLDINGS, ASSET_CLASS_SLOTS, TAX_YEAR, SIPP_RELIEF } from './plan-data.js';

const Z90 = 1.2816;           /* z-score for the 10th / 90th percentile */
const DIVERSIFICATION = 0.8;  /* holdings are correlated but not perfectly */

/* ── History statistics ─────────────────────────────────── */
export function annualVolatility(closes) {
  const r = [];
  for (let i = 1; i < closes.length; i++) r.push(Math.log(closes[i] / closes[i - 1]));
  const mean = r.reduce((a, b) => a + b, 0) / r.length;
  const variance = r.reduce((a, b) => a + (b - mean) ** 2, 0) / (r.length - 1);
  return Math.sqrt(variance) * Math.sqrt(12);
}

export function fiveYearReturn(etf) {
  return etf.price / etf.closes[0] - 1;
}

/* Enrich the ETF snapshot once with derived figures */
export const ETFS = Object.fromEntries(ETF_SNAPSHOT.map(e => [e.id, {
  ...e,
  volatility: annualVolatility(e.closes),
  fiveYear: fiveYearReturn(e),
}]));

/* ── Plan state ─────────────────────────────────────────── */
/* A plan line: { key, id, source: 'current'|'etf', status: 'kept'|'added'|'removed',
                  account: 'ISA'|'SIPP'|'GIA'|null, lump, monthly }
   key is unique per line: an ETF can sit in more than one account
   (e.g. the ISA for new money, the general account for sale proceeds).
   account is null while the user hasn't chosen where new money goes.
   held is what's already in place: today's holdings to start with,
   and whatever was bought once orders are placed (see settle).     */
export function createPlan() {
  return {
    lines: CURRENT_HOLDINGS.map(h => ({
      key: h.id, id: h.id, source: 'current', status: 'kept', account: h.account, lump: h.value, monthly: 0,
      held: { lump: h.value, monthly: 0 },
    })),
  };
}

/* Is any of this line already held (so removing it means selling)? */
const isHeld = l => l.held.lump > 0 || l.held.monthly > 0;

/* Orders placed: the plan becomes what's held. Sold lines go, and
   every remaining line is held at its new amounts.             */
export function settle(plan) {
  plan.lines = plan.lines.filter(l => l.status !== 'removed');
  for (const l of plan.lines) {
    l.held = { lump: l.lump, monthly: l.monthly };
    l.status = 'kept';
  }
}

export const etfKey = (id, account) => `${id}-${account || 'new'}`;

export function lineInfo(line) {
  return line.source === 'etf' ? ETFS[line.id] : CURRENT_HOLDINGS.find(h => h.id === line.id);
}

/* By key, or by ETF/holding id (the first line holding it) */
export function findLine(plan, keyOrId) {
  return plan.lines.find(l => l.key === keyOrId) || plan.lines.find(l => l.id === keyOrId);
}

export function activeLines(plan) {
  return plan.lines.filter(l => l.status !== 'removed');
}

/* Add an ETF to an account (or top it up if it's already there) */
export function addEtf(plan, id, { lump = 0, monthly = 0, account = null } = {}) {
  const key = etfKey(id, account);
  const existing = plan.lines.find(l => l.key === key);
  if (existing) {
    if (existing.status === 'removed') existing.status = isHeld(existing) ? 'kept' : 'added';
    existing.lump += lump;
    existing.monthly = monthly || existing.monthly;
    return existing;
  }
  const line = { key, id, source: 'etf', status: 'added', account, lump, monthly, held: { lump: 0, monthly: 0 } };
  plan.lines.push(line);
  return line;
}

/* Move an added ETF line into another account, merging if the ETF
   is already held there. Returns the line it ends up in.          */
export function moveAccount(plan, key, account) {
  const line = plan.lines.find(l => l.key === key);
  if (!line || line.source !== 'etf' || line.account === account) return line;
  const target = plan.lines.find(l => l.key === etfKey(line.id, account));
  if (target) {
    target.lump += line.lump;
    target.monthly += line.monthly;
    plan.lines = plan.lines.filter(l => l !== line);
    return target;
  }
  line.account = account;
  line.key = etfKey(line.id, account);
  return line;
}

export function setMonthly(plan, key, monthly) {
  const line = findLine(plan, key);
  if (line) line.monthly = monthly;
  return line;
}

/* Remove a line. Holdings already held are marked removed (so the
   plan can show the sale); ETFs only added in this plan drop out.  */
export function removeLine(plan, key) {
  const line = findLine(plan, key);
  if (!line) return null;
  if (isHeld(line)) {
    line.status = 'removed';
  } else {
    /* Money already moved into an ETF goes back to cash, not into thin air */
    const cash = findLine(plan, 'CASH');
    if (cash && line.lump) cash.lump += line.lump;
    plan.lines = plan.lines.filter(l => l !== line);
  }
  return line;
}

export function restoreLine(plan, key) {
  const line = findLine(plan, key);
  if (line && line.status === 'removed') line.status = 'kept';
  return line;
}

/* Move money between lines (e.g. cash → gold, Veritas → tracker) */
export function moveLump(plan, fromKey, toKey, amount) {
  const from = findLine(plan, fromKey);
  const to = findLine(plan, toKey);
  if (!from || !to) return;
  from.lump -= amount;
  to.lump += amount;
}

/* ── Tax year: allowance use and pension relief ─────────── */
/* What the plan pays into the ISA and SIPP before 5 April. Lumps into
   an added ETF line count as new subscriptions; SIPP figures are gross. */
export function taxYearUse(plan) {
  /* Amounts already placed count as used; the rest is this plan */
  const added = activeLines(plan).filter(l => l.source === 'etf');
  const inYear = ({ lump, monthly }) => lump + monthly * TAX_YEAR.paymentsLeft;
  const sum = (account, f) => added.filter(l => l.account === account).reduce((a, l) => a + f(l), 0) * (account === 'SIPP' ? SIPP_RELIEF : 1);
  const use = (account, base) => {
    const placed = sum(account, l => inYear(l.held));
    const planned = sum(account, l => inYear(l) - inYear(l.held));
    const used = base.used + placed;
    return { planned, used, limit: base.limit, left: base.limit - used - planned };
  };
  return { isa: use('ISA', TAX_YEAR.isa), sipp: use('SIPP', TAX_YEAR.sipp) };
}

/* For a higher-rate taxpayer: £1 from you → £1.25 in the pension, and
   a further 25p can be claimed back through self-assessment.         */
export function sippRelief(monthly) {
  const gross = monthly * SIPP_RELIEF;
  const extra = TAX_YEAR.band === 'higher' ? gross * 0.2 : 0;
  return { gross, atSource: gross - monthly, extra, netCost: monthly - extra };
}

/* ── Orders: what placing this plan would do ────────────── */
/* Sells first (they fund the buys), then buys, then regular amounts.
   Cash moving into a fund is the source of a buy, not an order.   */
export function orders(plan) {
  const out = [];
  const removed = plan.lines.filter(l => l.status === 'removed');
  for (const l of removed) if (l.lump) out.push({ type: 'sell', line: l, amount: l.lump });
  for (const l of removed) if (l.held.monthly) out.push({ type: 'stop', line: l, amount: l.held.monthly });
  for (const l of activeLines(plan)) {
    if (l.source === 'etf' && l.lump > l.held.lump) out.push({ type: 'buy', line: l, amount: l.lump - l.held.lump });
  }
  for (const l of activeLines(plan)) {
    if (l.monthly !== l.held.monthly) {
      out.push(l.monthly ? { type: 'regular', line: l, amount: l.monthly } : { type: 'stop', line: l, amount: l.held.monthly });
    }
  }
  return out;
}

/* First-year cost estimate, in pounds, for the cost disclosure */
export function orderCosts(plan) {
  const etf = activeLines(plan).filter(l => l.source === 'etf');
  /* Only the new money: what's already held was costed when it was placed */
  const fundCharges = etf.reduce((a, l) => {
    const gross = l.account === 'SIPP' ? SIPP_RELIEF : 1;
    const lump = Math.max(0, l.lump - l.held.lump);
    const monthly = Math.max(0, l.monthly - l.held.monthly);
    return a + (lump + monthly * 12 * gross) * (ETFS[l.id].ocf / 100);
  }, 0);
  const traded = orders(plan).filter(o => o.type !== 'regular').reduce((a, o) => a + o.amount, 0);
  const dealing = traded * 0.001;   /* estimated spread and market costs, 0.1% */
  return { fundCharges, dealing, total: fundCharges + dealing };
}

/* ── Projection ─────────────────────────────────────────── */
function pathFor(lump, monthly, annualReturn, months) {
  const g = Math.pow(1 + annualReturn, 1 / 12);
  const out = new Array(months + 1);
  let v = lump;
  out[0] = v;
  for (let t = 1; t <= months; t++) {
    v = v * g + monthly;
    out[t] = v;
  }
  return out;
}

/* Returns { central[], low[], high[], paidIn[] } with months+1 points */
export function project(lines, months) {
  const central = new Array(months + 1).fill(0);
  const paidIn  = new Array(months + 1).fill(0);
  let weightedVol = 0, total = 0;

  for (const line of lines) {
    const info = lineInfo(line);
    /* Pension contributions arrive with basic-rate relief added */
    const monthly = line.monthly * (line.account === 'SIPP' && line.source === 'etf' ? SIPP_RELIEF : 1);
    const path = pathFor(line.lump, monthly, info.expectedReturn, months);
    for (let t = 0; t <= months; t++) {
      central[t] += path[t];
      paidIn[t]  += line.lump + monthly * t;
    }
    const weight = line.lump + monthly * months;
    weightedVol += info.volatility * weight;
    total += weight;
  }

  const sigma = total ? (weightedVol / total) * DIVERSIFICATION : 0;
  const low  = central.map((v, t) => v * Math.exp(-Z90 * sigma * Math.sqrt(t / 12)));
  const high = central.map((v, t) => v * Math.exp( Z90 * sigma * Math.sqrt(t / 12)));
  return { central, low, high, paidIn, sigma };
}

/* Baseline = what's held, untouched: today's holdings, or the
   portfolio as it stands once orders have been placed         */
export function projectBaseline(plan, months) {
  const held = plan.lines.filter(isHeld).map(l => ({ ...l, lump: l.held.lump, monthly: l.held.monthly }));
  return project(held, months);
}

/* ── Allocation (by asset class) ────────────────────────── */
export function allocation(plan) {
  const byClass = new Map();
  for (const line of activeLines(plan)) {
    const info = lineInfo(line);
    byClass.set(info.assetClass, (byClass.get(info.assetClass) || 0) + line.lump);
  }
  const total = [...byClass.values()].reduce((a, b) => a + b, 0);
  return [...byClass.entries()]
    .map(([name, value]) => ({ name, value, pct: value / total, slot: ASSET_CLASS_SLOTS[name] ?? 7 }))
    .sort((a, b) => b.value - a.value);
}

export function totalValue(plan) {
  return activeLines(plan).reduce((a, l) => a + l.lump, 0);
}

export function totalMonthly(plan) {
  return activeLines(plan).reduce((a, l) => a + l.monthly, 0);
}

/* Lines that differ from what's held */
export function changes(plan) {
  return plan.lines.filter(l => l.status !== 'kept' || l.monthly !== l.held.monthly || l.lump !== l.held.lump);
}

/* ── Formatting ─────────────────────────────────────────── */
const gbp0 = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 });

export function money(v) { return gbp0.format(Math.round(v)); }

/* £1.24m / £842k style for KPIs and announcements */
export function moneyShort(v) {
  const a = Math.abs(v);
  const sign = v < 0 ? '−' : '';
  if (a >= 1e6) return `${sign}£${(a / 1e6).toFixed(a >= 1e7 ? 1 : 2)}m`;
  if (a >= 1e4) return `${sign}£${Math.round(a / 1e3)}k`;
  return sign + gbp0.format(Math.round(a));
}

export function pct(v, digits = 1) {
  const s = (v * 100).toFixed(digits);
  return v > 0 ? `+${s}%` : v < 0 ? `−${Math.abs(v * 100).toFixed(digits)}%` : `${s}%`;
}

/* ── Stress test: "what if markets fall?" ───────────────── */
/* How much each asset class moves when shares fall. Rough, round
   sensitivities for the demo, not a forecast: gold has tended to
   hold up, gilts to fall a little, cash not at all.             */
const STRESS_SENSITIVITY = {
  'Global equity': 1, 'US equity': 1, 'US technology': 1.3, 'Emerging markets': 1.1,
  Gold: -0.1, 'UK government bonds': 0.2, Cash: 0,
};

/* Shares fall by `shock` tomorrow. Returns the drop and how long the
   plan takes to get back to today's value at its expected growth,
   with its monthly amounts still going in.                        */
export function stressTest(plan, shock = 0.25) {
  const lines = activeLines(plan);
  const before = lines.reduce((a, l) => a + l.lump, 0);
  const values = lines.map(l => l.lump * (1 - shock * (STRESS_SENSITIVITY[lineInfo(l).assetClass] ?? 1)));
  const after = values.reduce((a, v) => a + v, 0);
  const growth = lines.map(l => Math.pow(1 + lineInfo(l).expectedReturn, 1 / 12));
  const monthly = lines.map(l => l.monthly * (l.account === 'SIPP' && l.source === 'etf' ? SIPP_RELIEF : 1));
  let months = 0;
  const v = [...values];
  while (v.reduce((a, x) => a + x, 0) < before && months < 300) {
    for (let i = 0; i < v.length; i++) v[i] = v[i] * growth[i] + monthly[i];
    months++;
  }
  const lossPct = (before - after) / before;
  /* Worth saying only when the steadier holdings make a visible difference */
  const cushioned = shock - lossPct >= 0.01;
  return { shock, before, after, loss: before - after, lossPct, months, cushioned };
}

/* What adding a fund would do, without changing the plan */
export function previewAdd(plan, id, { monthly = 500, account = null, months = 60 } = {}) {
  const copy = structuredClone(plan);
  addEtf(copy, id, { monthly, account });
  return project(activeLines(copy), months);
}
