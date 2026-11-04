/* ─── PLAN MY FUTURE — CHARTS ────────────────────────────────
   Highcharts 13.0.0 (the version OutSystems Charts 3.12 ships).
   styledMode: true — Highcharts emits classes only; every
   colour, stroke and font comes from plan-chart.css, which
   maps our tokens onto --highcharts-* variables. Dark/light
   mode and forced-colors therefore need no JavaScript.
   ─────────────────────────────────────────────────────────── */

import { PLAN_START } from './plan-data.js';
import { moneyShort, money } from './plan-model.js';

const H = window.Highcharts;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const animation = () => (reduceMotion.matches ? false : { duration: 450, easing: 'easeOutQuad' });

H.setOptions({
  lang: { thousandsSep: ',', decimalPoint: '.' },
  credits: { enabled: false },
  exporting: { enabled: false },
  time: { timezone: 'Europe/London' },
});

function monthTs(offset) {
  return Date.UTC(PLAN_START.year, PLAN_START.month + offset, 1);
}

const axisMoney = function () { return moneyShort(this.value); };

/* ── Projection chart ───────────────────────────────────── */
export function createProjectionChart(el) {
  return H.chart(el, {
    chart: { styledMode: true, animation: animation(), spacing: [8, 4, 8, 0] },
    title: { text: undefined },
    accessibility: {
      description: 'Projected portfolio value over time: the central estimate with your plan, the likely range around it, and today’s portfolio left unchanged.',
      point: { valueDescriptionFormat: '{xDescription}: {point.y:,.0f} pounds.' },
    },
    legend: { enabled: true, align: 'left', verticalAlign: 'top', margin: 12, itemDistance: 16, symbolRadius: 2 },
    xAxis: {
      type: 'datetime',
      crosshair: true,
      dateTimeLabelFormats: { month: '%b %Y', year: '%Y' },
      tickPixelInterval: 90,
    },
    yAxis: {
      title: { text: undefined },
      labels: { formatter: axisMoney },
      tickPixelInterval: 56,
    },
    tooltip: {
      shared: true,
      useHTML: true,
      xDateFormat: '%B %Y',
      formatter() {
        const rows = this.points.map(p => {
          if (p.series.type === 'arearange') {
            return `<span class="plan-tt-row"><span class="plan-tt-key highcharts-color-${p.series.colorIndex}">${p.series.name}</span> ${moneyShort(p.point.low)} – ${moneyShort(p.point.high)}</span>`;
          }
          return `<span class="plan-tt-row"><span class="plan-tt-key highcharts-color-${p.series.colorIndex}">${p.series.name}</span> ${money(p.y)}</span>`;
        });
        return `<span class="plan-tt-date">${H.dateFormat('%B %Y', this.x)}</span>${rows.join('')}`;
      },
    },
    plotOptions: {
      series: { animation: animation(), marker: { enabled: false, symbol: 'circle' }, states: { inactive: { enabled: false } } },
      arearange: { enableMouseTracking: true, lineWidth: 0 },
    },
    series: [
      { type: 'arearange', id: 'range',    name: 'Likely range',      className: 'plan-series-range',    colorIndex: 8, zIndex: 0, data: [] },
      { type: 'line',      id: 'baseline', name: 'Today’s portfolio', className: 'plan-series-baseline', colorIndex: 9, zIndex: 1, data: [] },
      { type: 'line',      id: 'plan',     name: 'With your plan',    className: 'plan-series-plan',     colorIndex: 0, zIndex: 2, data: [] },
      /* Shown while a fund option is hovered or focused in the chat */
      { type: 'line',      id: 'preview',  name: 'Preview',           className: 'plan-series-preview',  colorIndex: 0, zIndex: 3, data: [],
        visible: false, showInLegend: false, animation: false, enableMouseTracking: false,
        accessibility: { exposeAsGroupOnly: true } },
    ],
  });
}

export function updateProjectionChart(chart, plan, baseline, months) {
  const step = months > 60 ? 3 : 1;   /* quarterly points beyond 5 years */
  const idx = [];
  for (let t = 0; t <= months; t += step) idx.push(t);
  if (idx[idx.length - 1] !== months) idx.push(months);

  chart.get('range').setData(idx.map(t => [monthTs(t), Math.round(plan.low[t]), Math.round(plan.high[t])]), false);
  chart.get('baseline').setData(idx.map(t => [monthTs(t), Math.round(baseline.central[t])]), false);
  chart.get('plan').setData(idx.map(t => [monthTs(t), Math.round(plan.central[t])]), false);
  chart.xAxis[0].update({
    dateTimeLabelFormats: months <= 12 ? { month: '%b %Y' } : { month: '%b %Y', year: '%Y' },
  }, false);
  chart.redraw(animation());
}

/* A dashed "what if" line for a fund that isn't in the plan yet.
   Pass null to clear it. No animation: it follows the pointer.     */
export function setProjectionPreview(chart, projection, months, name) {
  const series = chart.get('preview');
  if (!projection) {
    if (series.visible) { series.update({ showInLegend: false }, false); series.setVisible(false, false); chart.redraw(false); }
    return;
  }
  const step = months > 60 ? 3 : 1;
  const idx = [];
  for (let t = 0; t <= months; t += step) idx.push(t);
  if (idx[idx.length - 1] !== months) idx.push(months);
  series.update({ name: `With ${name}`, showInLegend: true }, false);
  series.setData(idx.map(t => [monthTs(t), Math.round(projection.central[t])]), false, false);
  series.setVisible(true, false);
  chart.redraw(false);
}

/* ── Allocation donut ───────────────────────────────────── */
export function createAllocationChart(el) {
  return H.chart(el, {
    chart: { styledMode: true, type: 'pie', animation: animation(), spacing: [0, 0, 0, 0], height: 180 },
    title: { text: undefined },
    accessibility: {
      description: 'How the plan is split across asset classes.',
      point: { valueDescriptionFormat: '{point.name}: {point.percentage:.1f}%.' },
    },
    tooltip: {
      useHTML: true,
      formatter() { return `<span class="plan-tt-date">${this.point.name}</span><span class="plan-tt-row">${money(this.point.y)} · ${this.point.percentage.toFixed(1)}%</span>`; },
    },
    plotOptions: {
      pie: {
        innerSize: '68%',
        borderRadius: 3,
        dataLabels: { enabled: false },
        animation: animation(),
        states: { inactive: { enabled: false } },
      },
    },
    series: [{ name: 'Allocation', data: [] }],
  });
}

export function updateAllocationChart(chart, alloc) {
  chart.series[0].setData(
    alloc.map(a => ({ name: a.name, y: Math.round(a.value), colorIndex: a.slot })),
    true, animation(), false,
  );
}

/* Follow the OS motion preference live */
reduceMotion.addEventListener('change', () => {
  H.charts.filter(Boolean).forEach(c => c.update({ chart: { animation: animation() } }, false));
});
