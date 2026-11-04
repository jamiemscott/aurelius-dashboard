/* ─── PLAN MY FUTURE — UI ────────────────────────────────────
   Wires the scripted chat to the plan model and charts.
   Layout, motion, the mobile drawer (popover), the period
   radios and the table disclosures are all HTML + CSS; this
   file only renders data and handles the conversation.
   ─────────────────────────────────────────────────────────── */

import { PERIODS, DEFAULT_PERIOD, CURRENT_HOLDINGS } from './plan-data.js';
import {
  ETFS, createPlan, lineInfo, findLine, activeLines, addEtf, setMonthly, removeLine, restoreLine,
  moveLump, project, projectBaseline, allocation, totalValue, changes, money, moneyShort, pct,
} from './plan-model.js';
import { STEPS, matchStep, nextChips, GREETING, FALLBACK } from './plan-script.js';
import { createProjectionChart, updateProjectionChart, createAllocationChart, updateAllocationChart } from './plan-charts.js';

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
};

const state = {
  plan: createPlan(),
  period: DEFAULT_PERIOD,
  done: new Set(),
  saved: false,
  busy: false,
};

const charts = {
  projection: createProjectionChart('plan-proj-chart'),
  allocation: createAllocationChart('plan-alloc-chart'),
};

/* ── Context handed to script steps ─────────────────────── */
function ensureEtf(id) {
  return findLine(state.plan, id) || addEtf(state.plan, id, {});
}

const ctx = {
  addEtf: (id, opts) => addEtf(state.plan, id, opts),
  setMonthly: (id, amount) => { ensureEtf(id); setMonthly(state.plan, id, amount); },
  moveLump: (from, to, amount) => { ensureEtf(to); moveLump(state.plan, from, to, amount); },
  moveLumpFromRemoved: (from, to, amount) => { ensureEtf(to).lump += amount; },
  remove: id => removeLine(state.plan, id),
  lumpOf: id => findLine(state.plan, id)?.lump ?? 0,
  setPeriod: id => setPeriod(id, { silent: true }),
  markSaved: () => { state.saved = true; },
  reset: () => { state.plan = createPlan(); state.done.clear(); state.saved = false; setPeriod(DEFAULT_PERIOD, { silent: true }); },
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

  els.status.textContent = state.saved ? 'Saved' : 'Draft';
  els.status.dataset.state = state.saved ? 'saved' : 'draft';

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

function totalMonthlyNow() { return activeLines(state.plan).reduce((a, l) => a + l.monthly, 0); }

function renderLines() {
  const total = totalValue(state.plan);
  els.lines.replaceChildren(...state.plan.lines.map(line => {
    const info = lineInfo(line);
    const li = document.createElement('li');
    li.className = 'plan-line';
    li.dataset.status = line.status;
    li.style.viewTransitionName = `plan-line-${line.id}`;
    const ticker = line.source === 'etf' ? `${info.id} · ` : '';
    const badge = { added: 'New', removed: 'Removed', kept: '' }[line.status];
    const share = line.status === 'removed' ? '' : `<span class="plan-line-share">${((line.lump / total) * 100).toFixed(1)}%</span>`;
    const monthly = line.monthly ? `<span class="plan-line-monthly">+ ${money(line.monthly)}/m</span>` : '';
    const action = line.status === 'removed'
      ? `<button type="button" class="plan-line-btn" data-action="restore" data-id="${line.id}">Undo<span class="plan-sr-only"> removing ${info.short}</span></button>`
      : `<button type="button" class="plan-line-btn plan-line-btn--icon" data-action="remove" data-id="${line.id}" aria-label="Remove ${info.short} from plan">
           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
         </button>`;
    li.innerHTML = `
      <span class="plan-line-swatch plan-slot-${slotOf(info)}" aria-hidden="true"></span>
      <span class="plan-line-main">
        <span class="plan-line-name">${info.short}${badge ? ` <span class="plan-badge plan-badge--${line.status}">${badge}</span>` : ''}</span>
        <span class="plan-line-meta">${ticker}${info.assetClass}</span>
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
    return `Added ${info.short}${parts.length ? ` · ${parts.join(' + ')}` : ''}`;
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
    : `<button type="button" class="btn-secondary btn-secondary--sm" data-step="add-vwrp">Add to plan</button>`;
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
      ${id === 'VWRP' ? cta : ''}
    </div>`;
}

function botMessage(parts, chipIds = []) {
  const msg = document.createElement('div');
  msg.className = 'adv-msg adv-msg--bot';
  const bubbles = parts.map(p => `
    <div class="adv-bubble-inner${p.tone ? ` adv-bubble-inner--${p.tone}` : ''}">
      <p class="adv-text">${p.html}</p>
      ${p.etf ? etfCard(p.etf) : ''}
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
  /* Scroll the log only — never the page around it */
  els.messages.scrollTo({ top: els.messages.scrollHeight, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
}

/* Only the latest chips stay actionable */
function retireChips() {
  els.messages.querySelectorAll('.adv-suggestions').forEach(g => g.remove());
  els.messages.querySelectorAll('.plan-etf [data-step]').forEach(b => {
    b.replaceWith(Object.assign(document.createElement('span'), { className: 'plan-badge plan-badge--added', textContent: 'In your plan' }));
  });
}

/* ── Conversation ───────────────────────────────────────── */
const wait = ms => new Promise(r => setTimeout(r, reduceMotion.matches ? 0 : ms));

async function converse(text, stepId) {
  if (state.busy) return;
  state.busy = true;
  els.form.setAttribute('aria-busy', 'true');
  const hadFocusInLog = els.messages.contains(document.activeElement);

  retireChips();
  append(userMessage(text));

  const typing = typingIndicator();
  await wait(250);
  append(typing);
  await wait(700);
  typing.remove();

  const id = stepId || matchStep(text, state.done);
  let reply;
  if (id) {
    reply = STEPS[id].run(ctx);
    if (id !== 'reset') state.done.add(id);
    state.saved = id === 'save';
  } else {
    reply = FALLBACK;
  }

  append(botMessage(reply, nextChips(state.done)));
  renderPanel();
  if (id && id !== 'start') announcePlan();

  state.busy = false;
  els.form.removeAttribute('aria-busy');
  /* Chips that held focus are gone — land somewhere predictable */
  if (hadFocusInLog || document.activeElement === document.body) {
    const target = els.messages.querySelector('.adv-msg:last-child .adv-chip') || els.input;
    target.focus({ preventScroll: true });
  }
}

/* Chips and ETF "Add to plan" buttons */
els.messages.addEventListener('click', e => {
  const btn = e.target.closest('[data-step]');
  if (!btn || state.busy) return;
  const id = btn.dataset.step;
  converse(STEPS[id].chip, id);
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
  state.saved = false;
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

/* ── Start ──────────────────────────────────────────────── */
function greet() {
  append(botMessage(GREETING(USER.name, totalValue(state.plan)), ['start']));
}

setPeriod(DEFAULT_PERIOD, { silent: true });
renderPanel({ animateLines: false });
greet();
