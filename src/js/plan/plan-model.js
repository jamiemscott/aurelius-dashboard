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

import { ETF_SNAPSHOT, CURRENT_HOLDINGS, ASSET_CLASS_SLOTS } from './plan-data.js';

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
/* A plan line: { id, source: 'current'|'etf', status: 'kept'|'added'|'removed',
                  lump, monthly }  — value/assumptions come from the source. */
export function createPlan() {
  return {
    lines: CURRENT_HOLDINGS.map(h => ({ id: h.id, source: 'current', status: 'kept', lump: h.value, monthly: 0 })),
  };
}

export function lineInfo(line) {
  return line.source === 'etf' ? ETFS[line.id] : CURRENT_HOLDINGS.find(h => h.id === line.id);
}

export function findLine(plan, id) {
  return plan.lines.find(l => l.id === id);
}

export function activeLines(plan) {
  return plan.lines.filter(l => l.status !== 'removed');
}

/* Add an ETF (or top it up if already in the plan) */
export function addEtf(plan, id, { lump = 0, monthly = 0 } = {}) {
  const existing = findLine(plan, id);
  if (existing) {
    existing.status = existing.status === 'removed' ? 'added' : existing.status;
    existing.lump += lump;
    existing.monthly = monthly || existing.monthly;
    return existing;
  }
  const line = { id, source: 'etf', status: 'added', lump, monthly };
  plan.lines.push(line);
  return line;
}

export function setMonthly(plan, id, monthly) {
  const line = findLine(plan, id);
  if (line) line.monthly = monthly;
  return line;
}

/* Remove a line. Current holdings are marked removed (so the
   plan can show the change); added ETFs drop out entirely.   */
export function removeLine(plan, id) {
  const line = findLine(plan, id);
  if (!line) return null;
  if (line.source === 'current') {
    line.status = 'removed';
  } else {
    /* Money already moved into an ETF goes back to cash, not into thin air */
    const cash = findLine(plan, 'CASH');
    if (cash && line.lump) cash.lump += line.lump;
    plan.lines = plan.lines.filter(l => l !== line);
  }
  return line;
}

export function restoreLine(plan, id) {
  const line = findLine(plan, id);
  if (line && line.source === 'current') line.status = 'kept';
  return line;
}

/* Move money between lines (e.g. cash → gold, Veritas → tracker) */
export function moveLump(plan, fromId, toId, amount) {
  const from = findLine(plan, fromId);
  const to = findLine(plan, toId);
  if (!from || !to) return;
  from.lump -= amount;
  to.lump += amount;
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
    const path = pathFor(line.lump, line.monthly, info.expectedReturn, months);
    for (let t = 0; t <= months; t++) {
      central[t] += path[t];
      paidIn[t]  += line.lump + line.monthly * t;
    }
    const weight = line.lump + line.monthly * months;
    weightedVol += info.volatility * weight;
    total += weight;
  }

  const sigma = total ? (weightedVol / total) * DIVERSIFICATION : 0;
  const low  = central.map((v, t) => v * Math.exp(-Z90 * sigma * Math.sqrt(t / 12)));
  const high = central.map((v, t) => v * Math.exp( Z90 * sigma * Math.sqrt(t / 12)));
  return { central, low, high, paidIn, sigma };
}

/* Baseline = today's holdings, untouched, no contributions */
export function projectBaseline(months) {
  return project(createPlan().lines, months);
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

/* Lines that differ from today */
export function changes(plan) {
  return plan.lines.filter(l => l.status !== 'kept' || l.monthly > 0 ||
    (l.source === 'current' && l.lump !== lineInfo(l).value));
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
