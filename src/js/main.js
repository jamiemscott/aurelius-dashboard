/* ─── INIT / ENTRY POINT ────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  buildPerfChart('perf-chart', 600, 200);
  buildPerfChart('hist-chart', 800, 260);
  buildDonut('small-donut', allocationData, 34, 12);
  buildLegend('small-legend', allocationData.slice(0, 6));
  buildDonut('big-donut', allocationData, 38, 14);
  buildProgressList('alloc-progress-list', allocationData, 842340);
  buildProgressList('asset-class-list', assetClassData, 842340);
  buildProgressList('currency-list', currencyData, 842340);
  buildTopHoldings();
  buildActivityFeed();
  buildInvestmentsTable();
  buildDocumentsPage();
});
