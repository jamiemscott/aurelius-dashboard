/* ─── PLAN MY FUTURE — DATA ──────────────────────────────────
   Static snapshot for the phase-one mock. Phase two swaps the
   ETF_SNAPSHOT for live Alpha Vantage data via a server-side
   proxy; nothing else in the plan modules needs to change.

   ETF prices: Alpha Vantage TIME_SERIES_MONTHLY_ADJUSTED,
   London listings (.LON), month-end adjusted closes from
   Nov 2021 to Oct 2026, plus the latest price on 3 Nov 2026.
   Pence-quoted lines (EQQQ, SGLN) are converted to pounds.

   Expected returns are long-run assumptions per asset class,
   NOT the trailing five-year return — projecting 2021–26 gold
   (+17% a year) or gilts (−5% a year) forward would mislead.
   History is used for volatility and the "past 5 years" figure.
   ─────────────────────────────────────────────────────────── */

export const SNAPSHOT_DATE = '2026-11-03';
export const PLAN_START    = { year: 2026, month: 10 };   /* Nov 2026, 0-based month */

export const ETF_SNAPSHOT = [
  {
    id: 'VWRP', symbol: 'VWRP.LON',
    name: 'Vanguard FTSE All-World UCITS ETF (Acc)',
    short: 'Vanguard FTSE All-World',
    assetClass: 'Global equity',
    blurb: 'About 3,700 companies across developed and emerging markets in one fund.',
    ocf: 0.22, expectedReturn: 0.065, price: 140.20,
    closes: [
      86.00, 87.75,
      83.41, 81.92, 85.89, 83.31, 81.86, 77.94, 82.67, 83.94, 80.37, 81.34, 82.67, 80.37,
      83.91, 83.36, 83.71, 83.62, 83.87, 86.69, 88.79, 87.89, 87.61, 84.96, 88.92, 92.94,
      93.98, 97.70, 101.08, 99.19, 100.12, 104.44, 104.12, 103.55, 104.12, 106.48, 111.77, 111.16,
      116.16, 112.05, 105.42, 102.85, 108.18, 111.25, 117.48, 117.32, 121.66, 127.72, 126.74, 126.66,
      127.34, 131.60, 123.66, 132.98, 141.36, 142.30, 139.16, 142.91, 145.26, 140.68,
    ],
  },
  {
    id: 'VUAG', symbol: 'VUAG.LON',
    name: 'Vanguard S&P 500 UCITS ETF (Acc)',
    short: 'Vanguard S&P 500',
    assetClass: 'US equity',
    blurb: 'The 500 largest US companies, at one of the lowest costs available.',
    ocf: 0.07, expectedReturn: 0.07, price: 109.20,
    closes: [
      63.32, 64.79,
      60.96, 59.94, 64.09, 61.77, 60.19, 57.34, 62.05, 63.13, 60.83, 62.45, 61.41, 59.04,
      60.99, 61.14, 61.44, 61.51, 62.78, 65.32, 66.67, 66.88, 66.28, 64.49, 67.54, 70.65,
      72.32, 75.78, 78.40, 76.60, 77.39, 82.37, 81.49, 80.78, 81.20, 84.50, 90.25, 89.95,
      93.49, 88.88, 81.95, 78.84, 83.52, 86.31, 92.37, 91.51, 94.80, 99.88, 99.14, 98.37,
      97.17, 98.29, 93.86, 101.66, 108.58, 108.86, 106.66, 110.66, 112.44, 109.78,
    ],
  },
  {
    id: 'EQQQ', symbol: 'EQQQ.LON',
    name: 'Invesco EQQQ Nasdaq-100 UCITS ETF',
    short: 'Invesco Nasdaq-100',
    assetClass: 'US technology',
    blurb: 'The 100 largest non-financial Nasdaq companies — higher growth, bigger swings.',
    ocf: 0.30, expectedReturn: 0.075, price: 513.19,
    closes: [
      292.90, 292.16,
      263.71, 255.71, 274.88, 252.86, 240.25, 228.49, 252.76, 254.97, 243.57, 239.40, 233.16, 217.53,
      235.56, 240.52, 255.19, 252.47, 277.70, 288.09, 296.10, 296.69, 293.39, 286.04, 303.56, 321.50,
      328.43, 343.92, 350.38, 341.86, 348.50, 381.77, 366.10, 358.91, 362.91, 376.95, 400.71, 413.29,
      426.25, 398.48, 359.13, 352.82, 384.79, 402.17, 431.48, 422.53, 445.96, 480.64, 467.07, 460.99,
      457.08, 452.56, 431.66, 490.24, 549.65, 555.27, 509.25, 535.45, 563.35, 519.46,
    ],
  },
  {
    id: 'SGLN', symbol: 'SGLN.LON',
    name: 'iShares Physical Gold ETC',
    short: 'iShares Physical Gold',
    assetClass: 'Gold',
    blurb: 'Backed by physical gold bars. Tends to move differently from shares.',
    ocf: 0.12, expectedReturn: 0.035, price: 56.80,
    closes: [
      26.17, 26.32,
      26.08, 27.65, 28.83, 29.61, 28.49, 29.01, 28.28, 28.80, 29.23, 27.77, 28.62, 29.43,
      30.50, 29.36, 31.14, 30.83, 31.01, 29.38, 29.82, 29.84, 29.59, 31.93, 31.36, 31.56,
      31.39, 31.49, 34.16, 35.70, 35.63, 35.83, 36.66, 37.07, 38.18, 41.39, 40.71, 40.46,
      43.88, 43.96, 46.93, 48.16, 47.41, 46.58, 48.41, 49.54, 55.45, 58.91, 61.73, 62.17,
      70.55, 75.41, 67.86, 66.05, 65.91, 58.95, 58.19, 65.19, 60.76, 56.45,
    ],
  },
  {
    id: 'IGLT', symbol: 'IGLT.LON',
    name: 'iShares Core UK Gilts UCITS ETF',
    short: 'iShares Core UK Gilts',
    assetClass: 'UK government bonds',
    blurb: 'UK government bonds. Steadier than shares, and pays a regular income.',
    ocf: 0.07, expectedReturn: 0.04, price: 9.66,
    closes: [
      12.49, 12.12,
      11.66, 11.50, 11.25, 10.94, 10.63, 10.41, 10.71, 9.87, 9.11, 9.36, 9.63, 9.25,
      9.48, 9.16, 9.43, 9.26, 8.95, 8.91, 8.97, 8.94, 8.84, 8.83, 9.08, 9.58,
      9.38, 9.25, 9.42, 9.15, 9.21, 9.34, 9.51, 9.53, 9.55, 9.31, 9.47, 9.26,
      9.32, 9.39, 9.31, 9.49, 9.36, 9.49, 9.47, 9.37, 9.43, 9.70, 9.70, 9.69,
      9.72, 9.94, 9.55, 9.51, 9.67, 9.74, 9.58, 9.60, 9.49, 9.63,
    ],
  },
];

/* Today's holdings — mirrors `investments` and `topHoldings` in
   src/js/data.js so the plan starts from the same £842,340 the
   rest of the dashboard shows. These funds aren't on Alpha
   Vantage, so they carry stated sample assumptions.           */
export const CURRENT_HOLDINGS = [
  { id: 'ARTISAN', name: 'Artisan Partners Gbl Global Value', short: 'Artisan Global Value',   assetClass: 'Global equity',      value: 289420, expectedReturn: 0.060, volatility: 0.14, fiveYear: 0.309 },
  { id: 'RLGE',    name: 'Royal London Gbl Eqty Divsfd Z',    short: 'Royal London Global',    assetClass: 'Global equity',      value: 218340, expectedReturn: 0.065, volatility: 0.14, fiveYear: 0.237 },
  { id: 'JPMEM',   name: 'JPMorgan EM Income C Net Acc',      short: 'JPMorgan EM Income',     assetClass: 'Emerging markets',   value: 174890, expectedReturn: 0.070, volatility: 0.18, fiveYear: 0.149 },
  { id: 'VERITAS', name: 'Veritas Global Focus GBP C Acc',    short: 'Veritas Global Focus',   assetClass: 'Global equity',      value: 127890, expectedReturn: 0.060, volatility: 0.15, fiveYear: -0.063 },
  { id: 'CASH',    name: 'Cash (GBP)',                        short: 'Cash',                   assetClass: 'Cash',               value:  31800, expectedReturn: 0.030, volatility: 0.005, fiveYear: null },
];

/* Projection periods — the site's 1M · 3M · 6M · 1Y pills,
   extended forward. "All" = the plan left to grow.           */
export const PERIODS = [
  { id: '1M',  months: 1,   label: '1M',  long: '1 month'  },
  { id: '3M',  months: 3,   label: '3M',  long: '3 months' },
  { id: '6M',  months: 6,   label: '6M',  long: '6 months' },
  { id: '1Y',  months: 12,  label: '1Y',  long: '1 year'   },
  { id: '3Y',  months: 36,  label: '3Y',  long: '3 years'  },
  { id: '5Y',  months: 60,  label: '5Y',  long: '5 years'  },
  { id: 'All', months: 300, label: 'All', long: '25 years' },
];

export const DEFAULT_PERIOD = '5Y';

/* Asset classes → chart colour slot (maps to --plan-series-N) */
export const ASSET_CLASS_SLOTS = {
  'Global equity':        0,
  'US equity':            1,
  'US technology':        2,
  'Emerging markets':     3,
  'Gold':                 4,
  'UK government bonds':  5,
  'Cash':                 6,
};
