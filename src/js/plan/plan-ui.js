/* ─── PLAN MY FUTURE — UI ────────────────────────────────────
   Wires the scripted chat to the plan model and charts.
   Layout, motion, the mobile drawer (popover), the period
   radios and the table disclosures are all HTML + CSS; this
   file only renders data and handles the conversation.
   ─────────────────────────────────────────────────────────── */

import { PERIODS, DEFAULT_PERIOD, CURRENT_HOLDINGS, ACCOUNTS, TAX_YEAR } from './plan-data.js';
import {
  ETFS, createPlan, lineInfo, findLine, activeLines, addEtf, setMonthly, removeLine, restoreLine,
  moveLump, moveAccount, project, projectBaseline, allocation, totalValue, changes,
  taxYearUse, sippRelief, orders, orderCosts, stressTest, previewAdd, money, moneyShort, pct,
} from './plan-model.js';
import { STEPS, CHECKS, matchStep, markDone, nextChips, GREETING, FALLBACK } from './plan-script.js';
import {
  createProjectionChart, updateProjectionChart, createAllocationChart, updateAllocationChart, setProjectionPreview,
} from './plan-charts.js';

const USER = { name: 'Sumant', initials: 'SK' };
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

const $ = sel => document.querySelector(sel);
const els = {
  messages:   $('#plan-messages'),
  form:       $('#plan-form'),
  input:      $('#plan-input'),
  send:       $('#plan-send'),
  announcer:  $('#plan-announcer'),
  kpiValue:   $('#plan-kpi-value'),
  kpiValueSub:$('#plan-kpi-value-sub'),
  kpiDiff:    $('#plan-kpi-diff'),
  kpiPaid:    $('#plan-kpi-paid'),
  kpiPaidSub: $('#plan-kpi-paid-sub'),
  kpiRange:   $('#plan-kpi-range'),
  lines:      $('#plan-lines'),
  changes:    $('#plan-changes'),
  changeCount:document.querySelectorAll('[data-plan-change-count]'),
  status:     $('#plan-status'),
  projTable:  $('#plan-proj-table tbody'),
  allocTable: $('#plan-alloc-table tbody'),
  allocLegend:$('#plan-alloc-legend'),
  periodCaption: document.querySelectorAll('[data-plan-period-long]'),
  allow:      $('#plan-allow'),
  investBars: document.querySelectorAll('[data-invest-bar]'),
  investCount:$('[data-invest-count]'),
  panel:      $('#plan-panel'),
};

const state = {
  plan: createPlan(),
  period: DEFAULT_PERIOD,
  done: new Set(),
  status: 'draft',   /* draft · saved · placed · adviser */
  busy: false,
  risk: null,        /* the approach chosen in the chat */
  fund: null,        /* key of the plan line for the chosen fund */
  account: null,     /* where new money goes: ISA · SIPP · GIA */
  check: null,       /* answers to the quick check: { horizon, cushion, fall } */
};

const STATUS_TEXT = { draft: 'Draft', saved: 'Saved', placed: 'Orders placed', adviser: 'With your adviser' };

const charts = {
  projection: createProjectionChart('plan-proj-chart'),
  allocation: createAllocationChart('plan-alloc-chart'),
};

/* ── Context handed to script steps ─────────────────────── */
/* The chosen fund's line; the global tracker if none has been chosen
   (or it was removed from the panel).                             */
function fundKey() {
  if (state.fund && state.plan.lines.some(l => l.key === state.fund)) return state.fund;
  state.fund = addEtf(state.plan, 'VWRP', { account: state.account }).key;
  return state.fund;
}

const ctx = {
  addEtf: (id, opts) => addEtf(state.plan, id, opts),
  setMonthly: (key, amount) => setMonthly(state.plan, key, amount),
  moveLump: (from, to, amount) => moveLump(state.plan, from, to, amount),
  moveLumpFromRemoved: (from, to, amount) => { findLine(state.plan, to).lump += amount; },
  remove: key => removeLine(state.plan, key),
  lumpOf: key => findLine(state.plan, key)?.lump ?? 0,
  monthlyOf: key => findLine(state.plan, key)?.monthly ?? 0,
  accountOf: key => findLine(state.plan, key)?.account ?? null,
  nameOf: key => lineInfo(findLine(state.plan, key)).short,
  setPeriod: id => setPeriod(id, { silent: true }),
  has: id => !!findLine(state.plan, id),
  risk: () => state.risk,
  setRisk: key => { state.risk = key; },
  fund: () => fundKey(),
  /* These two only read: they never add a placeholder fund */
  fundId: () => findLine(state.plan, state.fund)?.id ?? 'VWRP',
  fundAccount: () => (state.fund && findLine(state.plan, state.fund)?.account) ?? null,
  setFund: key => { state.fund = key; },
  account: () => state.account,
  /* New money waiting for an account moves into it; returns the fund's key */
  setAccount: account => {
    state.account = account;
    for (const line of [...state.plan.lines]) {
      if (line.source === 'etf' && line.account === null) {
        const moved = moveAccount(state.plan, line.key, account);
        if (state.fund === line.key || state.fund === `${line.id}-new`) state.fund = moved.key;
      }
    }
    return state.fund && state.plan.lines.some(l => l.key === state.fund) ? state.fund : null;
  },
  orderCount: () => orders(state.plan).length,
  needsAccount: () => state.plan.lines.some(l => l.source === 'etf' && l.status !== 'removed' && !l.account),
  checked: () => !!state.check,
  checkAnswers: () => state.check ?? {},
  stress: () => stressTest(state.plan),
  costs: () => orderCosts(state.plan),
  reset: () => {
    state.plan = createPlan(); state.done.clear(); state.status = 'draft';
    state.risk = null; state.fund = null; state.account = null; state.check = null;
    setPeriod(DEFAULT_PERIOD, { silent: true });
  },
  summary: () => summary(),
};

/* ── Derived figures ────────────────────────────────────── */
function periodInfo(id = state.period) { return PERIODS.find(p => p.id === id); }

function summary() {
  const { months, long } = periodInfo();
  const p = project(activeLines(state.plan), months);
  const b = projectBaseline(months);
  const newMoney = activeLines(state.plan).reduce((a, l) => a + l.monthly * months, 0);
  return {
    months, periodLong: long,
    central: p.central[months], low: p.low[months], high: p.high[months],
    baseline: b.central[months], vsBaseline: p.central[months] - b.central[months],
    newMoney, plan: p, base: b,
  };
}

/* ── Rendering: panel ───────────────────────────────────── */
function renderPanel({ animateLines = true } = {}) {
  const s = summary();

  els.kpiValue.textContent = moneyShort(s.central);
  els.kpiValueSub.textContent = `Central estimate in ${s.periodLong}`;
  els.kpiDiff.textContent = (s.vsBaseline >= 0 ? '+' : '') + moneyShort(s.vsBaseline);
  els.kpiDiff.classList.toggle('is-up', s.vsBaseline > 0);
  els.kpiDiff.classList.toggle('is-down', s.vsBaseline < 0);
  els.kpiPaid.textContent = moneyShort(s.newMoney);
  els.kpiPaidSub.textContent = s.newMoney ? `${money(totalMonthlyNow())} a month for ${s.periodLong}` : 'No regular amounts yet';
  els.kpiRange.textContent = `${moneyShort(s.low)} – ${moneyShort(s.high)}`;
  els.periodCaption.forEach(el => { el.textContent = s.periodLong; });

  updateProjectionChart(charts.projection, s.plan, s.base, s.months);
  const alloc = allocation(state.plan);
  updateAllocationChart(charts.allocation, alloc);
  renderAllocation(alloc);
  renderProjectionTable(s);

  els.status.textContent = STATUS_TEXT[state.status];
  els.status.dataset.state = state.status;
  renderAllowances();
  renderInvestBar();

  /* Resolves once the rows are in the DOM, so callers can move focus */
  const paint = () => { renderLines(); renderChanges(); };
  /* A hidden page renders no frames, so a transition would hold the update */
  if (animateLines && document.startViewTransition && !reduceMotion.matches && document.visibilityState === 'visible') {
    const vt = document.startViewTransition(paint);
    /* A skipped transition (e.g. a newer one started) rejects these — harmless */
    [vt.ready, vt.finished].forEach(p => p.catch(() => {}));
    /* If no frame arrives (throttled/background page), apply the update anyway */
    const guard = setTimeout(() => vt.skipTransition(), 200);
    return vt.updateCallbackDone.catch(() => {}).finally(() => clearTimeout(guard));
  }
  paint();
  return Promise.resolve();
}

/* "Make this investment": available from the moment a fund is chosen
   until the orders are placed (a changed plan brings it back). It
   steps aside while the latest reply already shows the review.      */
function renderInvestBar() {
  const count = orders(state.plan).length;
  const reviewing = !!els.messages.querySelector('.adv-msg:last-child :is(.plan-review, .plan-check):not([data-closed])');
  const show = state.done.has('fund') && state.status !== 'placed' && count > 0 && !reviewing;
  els.investBars.forEach(el => { el.hidden = !show; });
  els.investCount.textContent = `${count} order${count === 1 ? '' : 's'}`;
}

document.addEventListener('click', e => {
  if (!e.target.closest('[data-invest]') || state.busy) return;
  /* On narrow screens the plan is a drawer: close it to show the chat */
  if (els.panel.matches(':popover-open')) els.panel.hidePopover();
  converse('Make this investment', 'review', { focus: true });
});

function totalMonthlyNow() { return activeLines(state.plan).reduce((a, l) => a + l.monthly, 0); }

function renderLines() {
  const total = totalValue(state.plan);
  els.lines.replaceChildren(...state.plan.lines.map(line => {
    const info = lineInfo(line);
    const li = document.createElement('li');
    li.className = 'plan-line';
    li.dataset.status = line.status;
    li.style.viewTransitionName = `plan-line-${line.key}`;
    const ticker = line.source === 'etf' ? `${info.id} · ` : '';
    const account = line.account ? ACCOUNTS[line.account].short : '<span class="plan-line-todo">Account to choose</span>';
    const badge = { added: 'New', removed: 'Removed', kept: '' }[line.status];
    const share = line.status === 'removed' ? '' : `<span class="plan-line-share">${((line.lump / total) * 100).toFixed(1)}%</span>`;
    const monthly = line.monthly ? `<span class="plan-line-monthly">+ ${money(line.monthly)}/m</span>` : '';
    const action = line.status === 'removed'
      ? `<button type="button" class="plan-line-btn" data-action="restore" data-id="${line.key}">Undo<span class="plan-sr-only"> removing ${info.short}</span></button>`
      : `<button type="button" class="plan-line-btn plan-line-btn--icon" data-action="remove" data-id="${line.key}" aria-label="Remove ${info.short} from plan">
           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
         </button>`;
    li.innerHTML = `
      <span class="plan-line-swatch plan-slot-${slotOf(info)}" aria-hidden="true"></span>
      <span class="plan-line-main">
        <span class="plan-line-name">${info.short}${badge ? ` <span class="plan-badge plan-badge--${line.status}">${badge}</span>` : ''}</span>
        <span class="plan-line-meta">${ticker}${info.assetClass} · ${account}</span>
      </span>
      <span class="plan-line-figures">
        <span class="plan-line-value">${money(line.lump)}</span>
        ${monthly || share}
      </span>
      ${action}`;
    return li;
  }));
}

function slotOf(info) {
  return { 'Global equity': 0, 'US equity': 1, 'US technology': 2, 'Emerging markets': 3, Gold: 4, 'UK government bonds': 5, Cash: 6 }[info.assetClass] ?? 7;
}

function changeText(line) {
  const info = lineInfo(line);
  if (line.status === 'removed') return `Removed ${info.short} (${money(line.lump)})`;
  if (line.status === 'added') {
    const parts = [line.lump ? money(line.lump) : null, line.monthly ? `${money(line.monthly)} a month` : null].filter(Boolean);
    const where = line.account ? ` (${ACCOUNTS[line.account].short})` : '';
    return `Added ${info.short}${where}${parts.length ? ` · ${parts.join(' + ')}` : ''}`;
  }
  const orig = CURRENT_HOLDINGS.find(h => h.id === line.id)?.value;
  return `${info.short}: ${money(orig)} → ${money(line.lump)}`;
}

function renderChanges() {
  const list = changes(state.plan);
  els.changes.replaceChildren(...list.map(line => {
    const li = document.createElement('li');
    li.dataset.status = line.status;
    li.textContent = changeText(line);
    return li;
  }));
  els.changeCount.forEach(el => { el.textContent = list.length; el.dataset.count = list.length; });
}

/* ISA and pension allowances for this tax year, as native <meter>s */
function renderAllowances() {
  const use = taxYearUse(state.plan);
  const item = (id, title, u) => {
    const total = u.used + u.planned;
    const over = u.left < 0;
    const planned = u.planned ? ` · ${money(u.planned)} in this plan` : '';
    return `
      <div class="plan-allow-item${over ? ' is-over' : ''}">
        <div class="plan-allow-head">
          <span class="plan-allow-name" id="plan-allow-${id}">${title}</span>
          <span class="plan-allow-left">${over ? `${money(-u.left)} over` : `${money(u.left)} left`}</span>
        </div>
        <meter class="plan-meter" aria-labelledby="plan-allow-${id}" aria-describedby="plan-allow-${id}-note"
          min="0" max="${u.limit}" low="${u.limit * 0.75}" high="${u.limit * 0.95}" optimum="0" value="${Math.min(total, u.limit)}"></meter>
        <p class="plan-allow-note" id="plan-allow-${id}-note">${money(u.used)} used${planned} · of ${money(u.limit)}</p>
      </div>`;
  };
  els.allow.innerHTML = item('isa', 'ISA allowance', use.isa) + item('sipp', 'Pension annual allowance', use.sipp);
}

function renderAllocation(alloc) {
  els.allocLegend.replaceChildren(...alloc.map(a => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="plan-line-swatch plan-slot-${a.slot}" aria-hidden="true"></span><span class="plan-legend-name">${a.name}</span><span class="plan-legend-pct">${(a.pct * 100).toFixed(1)}%</span>`;
    return li;
  }));
  els.allocTable.replaceChildren(...alloc.map(a => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<th scope="row">${a.name}</th><td>${money(a.value)}</td><td>${(a.pct * 100).toFixed(1)}%</td>`;
    return tr;
  }));
}

function renderProjectionTable(s) {
  const steps = Math.min(s.months, 6);
  const rows = [];
  for (let i = 1; i <= steps; i++) rows.push(Math.round((s.months * i) / steps));
  els.projTable.replaceChildren(...rows.map(t => {
    const d = new Date(Date.UTC(2026, 10 + t, 1));
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <th scope="row">${d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' })}</th>
      <td>${money(s.base.central[t])}</td>
      <td>${money(s.plan.central[t])}</td>
      <td>${moneyShort(s.plan.low[t])} – ${moneyShort(s.plan.high[t])}</td>`;
    return tr;
  }));
}

/* ── Period radios ──────────────────────────────────────── */
function setPeriod(id, { silent = false } = {}) {
  state.period = id;
  const radio = document.querySelector(`input[name="plan-period"][value="${id}"]`);
  if (radio) radio.checked = true;
  if (!silent) {
    renderPanel({ animateLines: false });
    const s = summary();
    announce(`Showing ${s.periodLong}. Central estimate ${moneyShort(s.central)}, likely range ${moneyShort(s.low)} to ${moneyShort(s.high)}.`);
  }
}

document.addEventListener('change', e => {
  if (e.target.matches('input[name="plan-period"]')) setPeriod(e.target.value);
});

/* ── Announcements ──────────────────────────────────────── */
let announceTimer;
function announce(text) {
  clearTimeout(announceTimer);
  els.announcer.textContent = '';
  announceTimer = setTimeout(() => { els.announcer.textContent = text; }, 120);
}

function announcePlan() {
  const s = summary();
  announce(`Plan updated. In ${s.periodLong}: central estimate ${moneyShort(s.central)}, likely range ${moneyShort(s.low)} to ${moneyShort(s.high)}.`);
}

/* ── Rendering: chat ────────────────────────────────────── */
const timeNow = () => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
const isoNow = () => new Date().toISOString();

function etfCard(id) {
  const e = ETFS[id];
  const inPlan = !!findLine(state.plan, id);
  const max = Math.max(...e.closes), min = Math.min(...e.closes);
  const pts = e.closes.map((v, i) => `${(i / (e.closes.length - 1)) * 100},${28 - ((v - min) / (max - min)) * 26}`).join(' ');
  const cta = inPlan
    ? `<span class="plan-badge plan-badge--added">In your plan</span>`
    : `<button type="button" class="btn-secondary btn-secondary--sm" data-step="pick-${id}">Add to plan<span class="plan-sr-only"> ${e.short}</span></button>`;
  return `
    <div class="plan-etf">
      <div class="plan-etf-head">
        <span class="plan-etf-ticker">${e.id}</span>
        <span class="plan-etf-name">${e.name}</span>
      </div>
      <p class="plan-etf-blurb">${e.blurb}</p>
      <svg class="plan-etf-spark" viewBox="0 0 100 30" preserveAspectRatio="none" role="img" aria-label="Price over the past 5 years, ${pct(e.fiveYear, 0)}">
        <polyline points="${pts}" vector-effect="non-scaling-stroke"/>
      </svg>
      <dl class="plan-etf-stats">
        <div><dt>Past 5 years</dt><dd>${pct(e.fiveYear, 0)}</dd></div>
        <div><dt>Typical yearly swing</dt><dd>${(e.volatility * 100).toFixed(0)}%</dd></div>
        <div><dt>Yearly charge</dt><dd>${e.ocf.toFixed(2)}%</dd></div>
      </dl>
      ${cta}
    </div>`;
}

/* Option cards: three choices, each with plus and minus points.
   Fund options also show the key figures from the snapshot.    */
function optionCards({ label, items }) {
  const point = (kind, text) => `
    <li class="plan-point plan-point--${kind}"><span class="plan-sr-only">${kind === 'pro' ? 'Plus' : 'Minus'}: </span>${text}</li>`;
  const card = o => {
    const e = o.etf && ETFS[o.etf];
    const inPlan = o.etf && findLine(state.plan, o.etf);
    const stats = e ? `
      <dl class="plan-option-stats">
        <div><dt>Past 5 years</dt><dd>${pct(e.fiveYear, 0)}</dd></div>
        <div><dt>Yearly swing</dt><dd>${(e.volatility * 100).toFixed(0)}%</dd></div>
        <div><dt>Charge</dt><dd>${e.ocf.toFixed(2)}%</dd></div>
      </dl>` : '';
    const action = inPlan
      ? `<span class="plan-badge plan-badge--added">In your plan</span>`
      : `<button type="button" class="btn-secondary btn-secondary--sm" data-step="${o.step}">${o.action}<span class="plan-sr-only"> ${o.title}</span></button>`;
    const preview = e && !inPlan ? previewText(o.etf) : '';
    return `
      <li class="plan-option"${o.risk ? ` data-risk="${o.risk}"` : ''}${e && !inPlan ? ` data-etf="${o.etf}"` : ''}>
        <p class="plan-option-head">
          ${o.kicker ? `<span class="plan-option-kicker">${o.kicker}</span>` : ''}
          <span class="plan-option-title">${o.title}</span>
        </p>
        <p class="plan-option-desc">${o.desc}</p>
        ${stats}
        <ul class="plan-points">${o.pros.map(t => point('pro', t)).join('')}${o.cons.map(t => point('con', t)).join('')}</ul>
        ${preview}
        ${action}
      </li>`;
  };
  return `<ul class="plan-options" aria-label="${label}">${items.map(card).join('')}</ul>`;
}

/* What a fund would add, with £500 a month, at the chosen period */
const PREVIEW_MONTHLY = 500;
function previewProjection(id) {
  const { months } = periodInfo();
  return { months, proj: previewAdd(state.plan, id, { monthly: PREVIEW_MONTHLY, account: state.account, months }) };
}
function previewText(id) {
  const { months, proj } = previewProjection(id);
  const s = summary();
  const gain = proj.central[months] - s.central;
  return `<p class="plan-option-preview">With ${money(PREVIEW_MONTHLY)} a month: about <strong>+${moneyShort(gain)}</strong> in ${s.periodLong}. <span class="plan-option-preview-hint">Hover or focus to see it on the chart.</span></p>`;
}

/* Hovering or focusing a fund option draws it, dashed, on the chart */
let previewing = null;
function showPreview(id) {
  if (id === previewing) return;
  previewing = id;
  if (!id) { setProjectionPreview(charts.projection, null); return; }
  const { months, proj } = previewProjection(id);
  setProjectionPreview(charts.projection, proj, months, ETFS[id].short);
}
const previewTarget = e => e.target.closest?.('.plan-option[data-etf]:not([data-chosen])')?.dataset.etf ?? null;
els.messages.addEventListener('pointerover', e => showPreview(previewTarget(e)));
els.messages.addEventListener('pointerleave', () => showPreview(null));
els.messages.addEventListener('focusin', e => showPreview(previewTarget(e)));
els.messages.addEventListener('focusout', e => { if (!els.messages.contains(e.relatedTarget)) showPreview(null); });

/* A 25% fall, before and after */
function stressCard(r) {
  const share = v => `${Math.round((v / r.before) * 100)}%`;
  return `
    <div class="plan-stress">
      <div class="plan-stress-bars" aria-hidden="true">
        <span class="plan-stress-bar" style="--w: 100%"><span>Today</span></span>
        <span class="plan-stress-bar plan-stress-bar--after" style="--w: ${share(r.after)}"><span>After a 25% fall</span></span>
      </div>
      <dl class="plan-etf-stats">
        <div><dt>Today</dt><dd>${moneyShort(r.before)}</dd></div>
        <div><dt>After the fall</dt><dd>${moneyShort(r.after)}</dd></div>
        <div><dt>Back to today</dt><dd>${r.recovery}</dd></div>
      </dl>
    </div>`;
}

/* The quick check: three yes/no questions, answered before the review */
let checkSeq = 0;
function checkCard() {
  const n = ++checkSeq;
  const q = (c, i) => `
    <fieldset class="plan-check-q">
      <legend>${i + 1}. ${c.q}</legend>
      <label><input type="radio" name="plan-check-${n}-${c.id}" value="yes"> Yes</label>
      <label><input type="radio" name="plan-check-${n}-${c.id}" value="no"> No</label>
    </fieldset>`;
  return `
    <section class="plan-check" aria-labelledby="plan-check-title-${n}">
      <p class="plan-check-title" id="plan-check-title-${n}">Quick check</p>
      ${CHECKS.map(q).join('')}
      <p class="plan-check-hint" id="plan-check-hint-${n}" aria-live="polite"></p>
      <div class="plan-check-actions">
        <button type="button" class="btn-primary" data-step="check-done" aria-describedby="plan-check-hint-${n}">Continue to review</button>
      </div>
    </section>`;
}

/* Read the answers; if one is missing, say so and focus it */
function readCheck(card) {
  const answers = {};
  for (const c of CHECKS) {
    const picked = card.querySelector(`input[name$="-${c.id}"]:checked`);
    if (!picked) {
      const hint = card.querySelector('.plan-check-hint');
      hint.textContent = 'Answer all three questions to continue.';
      hint.dataset.error = '';
      card.querySelector(`input[name$="-${c.id}"]`).focus();
      return null;
    }
    answers[c.id] = picked.value === 'yes';
  }
  return answers;
}

/* Review and invest: every order, its costs, allowance use, and two
   checks before the orders can be placed (execution-only).        */
let reviewSeq = 0;
const ORDER_LABEL = { sell: 'Sell', buy: 'Buy', regular: 'Monthly' };
const acctName = line => line.account ? ACCOUNTS[line.account].name : 'Account not chosen';

function orderRow(o, extra = '') {
  return `
    <li class="plan-order" data-type="${o.type}">
      <span class="plan-order-type">${ORDER_LABEL[o.type]}</span>
      <span class="plan-order-what">
        <span class="plan-order-name">${lineInfo(o.line).short}</span>
        <span class="plan-order-acct">${acctName(o.line)}${o.type === 'regular' ? ` · from ${TAX_YEAR.firstPayment}` : ''}${extra}</span>
      </span>
      <span class="plan-order-amt">${money(o.amount)}${o.type === 'regular' ? '<span class="plan-order-per"> a month</span>' : ''}</span>
    </li>`;
}

function reviewCard() {
  const n = ++reviewSeq;
  const list = orders(state.plan);
  const costs = orderCosts(state.plan);
  const use = taxYearUse(state.plan);
  const sippMonthly = activeLines(state.plan).filter(l => l.source === 'etf' && l.account === 'SIPP').reduce((a, l) => a + l.monthly, 0);
  const unchosen = list.some(o => o.line.source === 'etf' && !o.line.account);
  const facts = [
    ['Fund charges, first year', `about ${money(costs.fundCharges)}`],
    ['Dealing costs (estimate)', `about ${money(costs.dealing)}`],
    use.isa.planned ? ['ISA allowance', use.isa.left < 0 ? `${money(-use.isa.left)} over: the excess can’t go in` : `uses ${money(use.isa.planned)}, ${money(use.isa.left)} left`] : null,
    sippMonthly ? ['Pension tax relief', `${money(sippRelief(sippMonthly).atSource)} a month added, ${money(sippRelief(sippMonthly).extra)} more to claim`] : null,
  ].filter(Boolean);
  return `
    <section class="plan-review" tabindex="-1" aria-labelledby="plan-review-title-${n}">
      <p class="plan-review-title" id="plan-review-title-${n}">Your orders</p>
      ${concernsNote()}
      <ol class="plan-orders">${list.map(o => orderRow(o)).join('')}</ol>
      <dl class="plan-review-facts">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
      <p class="plan-review-docs">Before placing: the <a href="/documents/">Key Information Documents</a> for each fund${list.some(o => o.type === 'sell') ? ' and <a href="/capital-gains-tax/">your capital gains tax position</a>' : ''}.</p>
      <fieldset class="plan-review-checks">
        <legend>To place these orders, confirm:</legend>
        <label><input type="checkbox" name="plan-kid-${n}"> I’ve read the Key Information Documents</label>
        <label><input type="checkbox" name="plan-risk-${n}"> I understand the value can fall and I may get back less than I put in</label>
      </fieldset>
      <p class="plan-review-hint" id="plan-review-hint-${n}" aria-live="polite">${unchosen ? 'Choose an account for the new money first.' : 'Tick both boxes to place the orders.'}</p>
      <div class="plan-review-actions">
        <button type="button" class="btn-primary" data-step="confirm" aria-disabled="true" aria-describedby="plan-review-hint-${n}"${unchosen ? ' data-blocked' : ''}>Place these orders</button>
        <button type="button" class="btn-secondary" data-step="send-james">Send to James first</button>
      </div>
      <p class="plan-review-note">You’re choosing these investments yourself. Aurelius explains the options but hasn’t recommended them, and can’t say whether they suit you. James can.</p>
    </section>`;
}

function concernsNote() {
  const answers = state.check ?? {};
  const n = CHECKS.filter(c => answers[c.id] === false).length;
  return n ? `<p class="plan-review-concern">Your quick check raised ${n === 1 ? 'one point' : `${n} points`} to think about. James can talk ${n === 1 ? 'it' : 'them'} through before you invest.</p>` : '';
}

/* The confirmation, with reference numbers for each order */
function receiptCard() {
  const d = new Date();
  const stamp = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const list = orders(state.plan);
  return `
    <ol class="plan-orders plan-orders--receipt" aria-label="Orders placed">
      ${list.map((o, i) => orderRow(o, ` · Ref AUR-${stamp}-${String(i + 1).padStart(2, '0')}`)).join('')}
    </ol>`;
}

/* Only a fully-ticked review can place orders */
els.messages.addEventListener('change', e => {
  const review = e.target.closest('.plan-review');
  if (!review) return;
  const btn = review.querySelector('[data-step="confirm"]');
  const ready = [...review.querySelectorAll('.plan-review-checks input')].every(i => i.checked) && !btn.hasAttribute('data-blocked');
  btn.setAttribute('aria-disabled', String(!ready));
  if (ready) review.querySelector('.plan-review-hint').textContent = 'Ready to place.';
});

function botMessage(parts, chipIds = []) {
  const msg = document.createElement('div');
  msg.className = 'adv-msg adv-msg--bot';
  const bubbles = parts.map(p => `
    <div class="adv-bubble-inner${p.tone ? ` adv-bubble-inner--${p.tone}` : ''}">
      <p class="adv-text">${p.html}</p>
      ${p.etf ? etfCard(p.etf) : ''}
      ${p.options ? optionCards(p.options) : ''}
      ${p.stress ? stressCard(p.stress) : ''}
      ${p.check ? checkCard() : ''}
      ${p.review ? reviewCard() : ''}
      ${p.receipt ? receiptCard() : ''}
    </div>`).join('');
  const chips = chipIds.length ? `
    <div class="adv-suggestions" role="group" aria-label="Suggested replies">
      ${chipIds.map(id => `<button type="button" class="adv-chip" data-step="${id}">${STEPS[id].chip}</button>`).join('')}
    </div>` : '';
  msg.innerHTML = `
    <div class="adv-avatar adv-avatar--bot" aria-hidden="true">A</div>
    <div class="adv-bubble">
      <p class="adv-sender">Aurelius</p>
      ${bubbles}
      ${chips}
      <time class="adv-time" datetime="${isoNow()}">${timeNow()}</time>
    </div>`;
  return msg;
}

function userMessage(text) {
  const msg = document.createElement('div');
  msg.className = 'adv-msg adv-msg--user';
  msg.innerHTML = `
    <div class="adv-bubble">
      <p class="plan-sr-only">You said:</p>
      <div class="adv-bubble-inner"><p class="adv-text"></p></div>
      <time class="adv-time" datetime="${isoNow()}">${timeNow()}</time>
    </div>
    <div class="adv-avatar adv-avatar--user" aria-hidden="true">${USER.initials}</div>`;
  msg.querySelector('.adv-text').textContent = text;
  return msg;
}

function typingIndicator() {
  const msg = document.createElement('div');
  msg.className = 'adv-msg adv-msg--bot plan-typing';
  msg.setAttribute('aria-hidden', 'true');
  msg.innerHTML = `
    <div class="adv-avatar adv-avatar--bot">A</div>
    <div class="adv-bubble"><div class="adv-bubble-inner"><span class="adv-dots"><span></span><span></span><span></span></span></div></div>`;
  return msg;
}

function append(node) {
  els.messages.append(node);
  /* Scroll the log only — never the page around it. A reply taller
     than the log (the review card) is shown from its start, so its
     first lines aren't scrolled out of sight.                       */
  const log = els.messages;
  const tall = node.offsetHeight > log.clientHeight;
  const top = tall
    ? log.scrollTop + node.getBoundingClientRect().top - log.getBoundingClientRect().top - 8
    : log.scrollHeight;
  log.scrollTo({ top, behavior: reduceMotion.matches ? 'instant' : 'smooth' });
}

/* Only the latest chips and option buttons stay actionable. The
   option that was picked keeps a badge; the others lose their button.
   A message we didn't recognise leaves the options open.          */
function retireChips(chosen) {
  const badge = text => Object.assign(document.createElement('span'), { className: 'plan-badge plan-badge--added', textContent: text });
  els.messages.querySelectorAll('.adv-suggestions').forEach(g => g.remove());
  if (!chosen) return;
  els.messages.querySelectorAll('.plan-review:not([data-closed])').forEach(r => {
    const outcome = { confirm: 'Orders placed', 'send-james': 'Sent to James', save: 'Saved for later' }[chosen];
    r.dataset.closed = '';
    r.querySelectorAll('input').forEach(i => { i.disabled = true; });
    r.querySelector('.plan-review-hint').remove();
    r.querySelector('.plan-review-actions').replaceWith(outcome ? badge(outcome) : Object.assign(document.createElement('p'), {
      className: 'plan-review-stale', textContent: 'The plan has changed since this review.',
    }));
  });
  els.messages.querySelectorAll('.plan-check:not([data-closed])').forEach(card => {
    card.dataset.closed = '';
    card.querySelectorAll('input').forEach(i => { i.disabled = true; });
    card.querySelector('.plan-check-hint').remove();
    card.querySelector('.plan-check-actions').replaceWith(chosen === 'check-done' ? badge('Answered') : '');
  });
  els.messages.querySelectorAll('.plan-etf [data-step]').forEach(b => b.replaceWith(badge('In your plan')));
  showPreview(null);
  els.messages.querySelectorAll('.plan-option [data-step]').forEach(b => {
    const option = b.closest('.plan-option');
    delete option.dataset.etf;
    option.querySelector('.plan-option-preview-hint')?.remove();
    if (b.dataset.step === chosen) {
      option.dataset.chosen = '';
      b.replaceWith(badge(chosen.startsWith('pick-') ? 'In your plan' : 'Chosen'));
    } else {
      b.remove();
    }
  });
}

/* ── Conversation ───────────────────────────────────────── */
const wait = ms => new Promise(r => setTimeout(r, reduceMotion.matches ? 0 : ms));

async function converse(text, stepId, { focus = false } = {}) {
  if (state.busy) return;
  state.busy = true;
  els.form.setAttribute('aria-busy', 'true');
  const hadFocusInLog = els.messages.contains(document.activeElement);

  const id = stepId || matchStep(text, state.done);
  /* Answering a question leaves the open options (and review) as they are */
  retireChips(id && !STEPS[id].info ? id : null);
  append(userMessage(text));

  const typing = typingIndicator();
  await wait(250);
  append(typing);
  await wait(700);
  typing.remove();

  let reply;
  if (id) {
    const step = STEPS[id];
    reply = step.run(ctx);
    markDone(state.done, id);
    if (step.status) state.status = step.status;
    else if (!step.quiet) state.status = 'draft';   /* a changed plan is a new draft */
  } else {
    reply = FALLBACK;
  }

  /* A chip that repeats an option card in the same reply is noise */
  const offered = new Set(reply.flatMap(p => p.options?.items.map(o => o.step) ?? []));
  append(botMessage(reply, nextChips(state.done, ctx, id).filter(c => !offered.has(c))));
  renderPanel();
  if (id && !STEPS[id].quiet) announcePlan();

  state.busy = false;
  els.form.removeAttribute('aria-busy');
  /* Chips that held focus are gone — land somewhere predictable */
  if (focus || hadFocusInLog || document.activeElement === document.body) {
    const last = '.adv-msg:last-child';
    /* A review is focused as a whole, so it's read from "Your orders" */
    const target = els.messages.querySelector(`${last} .plan-review, ${last} .plan-check input, ${last} .plan-option [data-step], ${last} .adv-chip`) || els.input;
    target.focus({ preventScroll: true });
  }
}

/* Chips and ETF "Add to plan" buttons */
els.messages.addEventListener('click', e => {
  const btn = e.target.closest('[data-step]');
  if (!btn || state.busy) return;
  const id = btn.dataset.step;
  if (btn.getAttribute('aria-disabled') === 'true') {
    const review = btn.closest('.plan-review');
    const hint = review.querySelector('.plan-review-hint');
    hint.textContent = btn.hasAttribute('data-blocked')
      ? 'Choose an account for the new money first.'
      : 'Tick both boxes first: they confirm you’ve read the documents and understand the risk.';
    hint.dataset.error = '';
    review.querySelector('.plan-review-checks input:not(:checked)')?.focus();
    return;
  }
  if (id === 'check-done') {
    const answers = readCheck(btn.closest('.plan-check'));
    if (!answers) return;
    state.check = answers;
    const said = CHECKS.map(c => (answers[c.id] ? 'Yes' : 'No')).join(', ');
    converse(said, id);
    return;
  }
  converse(STEPS[id].chip, id);
});

/* "Ask about" menu beside the input */
const askMenu = $('#plan-ask');
askMenu?.addEventListener('click', e => {
  const btn = e.target.closest('[data-step]');
  if (!btn || state.busy) return;
  askMenu.open = false;
  converse(STEPS[btn.dataset.step].chip, btn.dataset.step);
});

/* Typed messages — Enter sends, Shift+Enter adds a line */
els.input.addEventListener('input', () => { els.send.disabled = !els.input.value.trim(); });
els.input.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); els.form.requestSubmit(); }
});
els.form.addEventListener('submit', e => {
  e.preventDefault();
  const text = els.input.value.trim();
  if (!text) return;
  els.input.value = '';
  els.send.disabled = true;
  converse(text);
});

/* Panel buttons: remove / undo work without the chat */
document.querySelector('.plan-panel').addEventListener('click', async e => {
  const btn = e.target.closest('.plan-line-btn');
  if (!btn) return;
  const { action, id } = btn.dataset;
  const info = lineInfo(findLine(state.plan, id));
  const index = [...els.lines.children].findIndex(li => li.contains(btn));
  if (action === 'remove') removeLine(state.plan, id); else restoreLine(state.plan, id);
  state.status = 'draft';
  announce(`${action === 'remove' ? 'Removed' : 'Restored'} ${info.short}. ${planSentence()}`);
  await renderPanel();
  /* Keep focus on the same row (now showing Undo / ×); if the row
     is gone (an added ETF), fall back to the row in its place.   */
  const rows = [...els.lines.querySelectorAll('.plan-line-btn')];
  const same = rows.find(r => r.dataset.id === id);
  (same || rows[index] || rows[rows.length - 1])?.focus({ preventScroll: true });
});

function planSentence() {
  const s = summary();
  return `Central estimate in ${s.periodLong}: ${moneyShort(s.central)}.`;
}

/* "New conversation" */
$('#plan-new')?.addEventListener('click', () => {
  ctx.reset();
  els.messages.replaceChildren();
  greet();
  renderPanel({ animateLines: false });
  announce('New conversation started. Plan reset to your current portfolio.');
  els.input.focus();
});

/* ── Chat height ────────────────────────────────────────── */
/* CSS sizes the chat to the viewport; it only needs to know how far
   the page scrolls before the chat sticks (i.e. the header above it). */
const scroller = $('#plan-main');
const chatWrap = $('.plan-chat');
const chatRow = $('.plan-layout');   /* not sticky, so its position is the natural one */
function measureChatOffset() {
  const top = chatRow.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
  const stick = parseFloat(getComputedStyle(chatWrap).insetBlockStart) || 0;
  const pad = parseFloat(getComputedStyle(scroller).paddingBlockStart) || 0;   /* sticky sits inside the padding */
  chatWrap.style.setProperty('--plan-pad', `${Math.round(pad)}px`);
  chatWrap.style.setProperty('--plan-chat-offset', `${Math.max(0, Math.round(top - stick - pad))}px`);
}
new ResizeObserver(measureChatOffset).observe($('.plan-main .page-header'));
addEventListener('resize', measureChatOffset);
measureChatOffset();

/* ── Start ──────────────────────────────────────────────── */
function greet() {
  append(botMessage(GREETING(USER.name, totalValue(state.plan)), ['start']));
}

setPeriod(DEFAULT_PERIOD, { silent: true });
renderPanel({ animateLines: false });
greet();
