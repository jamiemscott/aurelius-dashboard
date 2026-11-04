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

/* Individual company shares, for the "buy shares in a company"
   demo. Same source and window as the ETFs. Apple is quoted in US
   dollars on Nasdaq, so its figures are in dollars; AstraZeneca and
   Rolls-Royce are London listings, converted from pence to pounds.
   inFunds: roughly how much of each index fund the company is, to
   show the overlap with funds already held (approximate weights). */
export const SHARE_SNAPSHOT = [
  {
    id: 'AAPL', symbol: 'AAPL', kind: 'share', currency: 'USD', market: 'Nasdaq, US',
    name: 'Apple Inc.', short: 'Apple',
    assetClass: 'Individual shares',
    blurb: 'Makes the iPhone, Mac and Apple Watch, and earns a growing share from services.',
    ocf: 0, expectedReturn: 0.07, price: 331.90,
    inFunds: { VWRP: 0.04, VUAG: 0.065, EQQQ: 0.08 },
    closes: [
      161.48, 173.46,
      170.74, 161.51, 170.79, 154.20, 145.80, 133.92, 159.19, 154.22, 135.56, 150.41, 145.45, 127.66,
      141.77, 145.06, 162.27, 166.97, 174.66, 191.14, 193.58, 185.38, 168.94, 168.50, 187.67, 190.22,
      182.19, 178.81, 169.64, 168.50, 190.45, 208.64, 220.00, 227.11, 231.08, 224.05, 235.63, 248.63,
      234.31, 240.37, 220.78, 211.21, 199.88, 204.18, 206.57, 231.28, 253.69, 269.37, 278.09, 271.12,
      258.77, 263.71, 253.33, 270.86, 311.79, 289.11, 308.64, 316.85, 333.02, 344.63,
    ],
  },
  {
    id: 'AZN', symbol: 'AZN.LON', kind: 'share', currency: 'GBP', market: 'London',
    name: 'AstraZeneca plc', short: 'AstraZeneca',
    assetClass: 'Individual shares',
    blurb: 'One of the UK’s largest companies: medicines for cancer, heart disease and rare conditions.',
    ocf: 0, expectedReturn: 0.07, price: 137.60,
    inFunds: { VWRP: 0.003 },
    closes: [
      74.58, 78.20,
      77.65, 82.97, 92.80, 97.89, 95.75, 98.92, 99.32, 98.18, 91.72, 94.58, 103.00, 103.48,
      97.68, 101.80, 105.09, 109.90, 109.10, 105.51, 104.66, 100.40, 104.55, 96.53, 95.36, 99.82,
      98.88, 95.49, 102.13, 115.37, 116.59, 118.18, 118.30, 127.74, 111.52, 106.26, 102.13, 100.74,
      109.17, 116.85, 109.88, 104.75, 104.67, 98.81, 110.57, 115.92, 109.94, 122.61, 137.39, 135.58,
      133.72, 154.39, 145.93, 138.56, 137.11, 140.07, 125.49, 119.70, 122.80, 139.60,
    ],
  },
  {
    id: 'RR', symbol: 'RR.LON', kind: 'share', currency: 'GBP', market: 'London',
    name: 'Rolls-Royce Holdings plc', short: 'Rolls-Royce',
    assetClass: 'Individual shares',
    blurb: 'Jet engines for airliners, plus power systems and defence. Not the car maker.',
    ocf: 0, expectedReturn: 0.07, price: 12.61,
    inFunds: { VWRP: 0.001 },
    closes: [
      1.1999, 1.2036,
      1.1216, 1.0138, 0.9903, 0.8158, 0.8491, 0.8125, 0.8744, 0.7542, 0.6816, 0.7655, 0.8906, 0.9129,
      1.0357, 1.4197, 1.4597, 1.4903, 1.4037, 1.4796, 1.8106, 2.1775, 2.1638, 2.1099, 2.6329, 2.9356,
      2.9503, 3.6154, 4.1796, 4.0464, 4.4411, 4.4744, 4.4039, 4.8623, 5.1640, 5.2443, 5.4716, 5.5695,
      5.9359, 7.2876, 7.3366, 7.4493, 8.5555, 9.5570, 10.5882, 10.6123, 11.8025, 11.5744, 10.5925, 11.4058,
      12.0108, 13.2257, 11.2272, 11.7748, 13.3229, 14.3908, 14.6219, 15.3020, 14.6160, 12.3940,
    ],
  },
];

/* Today's holdings — mirrors `investments` and `topHoldings` in
   src/js/data.js so the plan starts from the same £842,340 the
   rest of the dashboard shows. These funds aren't on Alpha
   Vantage, so they carry stated sample assumptions.           */
/* Accounts. Holdings are mapped so the demo agrees with the other
   pages: the Advised SIPP, an ISA with £8,240 of allowance left,
   and Veritas in the general account (it's on the CGT page).     */
export const ACCOUNTS = {
  ISA:  { id: 'ISA',  name: 'Stocks & Shares ISA', short: 'ISA' },
  SIPP: { id: 'SIPP', name: 'Advised SIPP',        short: 'SIPP' },
  GIA:  { id: 'GIA',  name: 'General account',     short: 'General account' },
};

/* Tax year 2026–27. Regular amounts start 1 December, so four
   payments land before the year ends on 5 April 2027.           */
export const TAX_YEAR = {
  label: '2026–27', ends: '5 April 2027', firstPayment: '1 December 2026', paymentsLeft: 4,
  isa:  { limit: 20000, used: 11760 },
  sipp: { limit: 60000, used: 12000 },   /* gross, including tax relief */
  dividendAllowance: 500, cgtAllowance: 3000,
  band: 'higher',                        /* higher-rate taxpayer, as on the CGT page */
};
export const SIPP_RELIEF = 1.25;         /* basic-rate relief added at source: £800 → £1,000 */

export const CURRENT_HOLDINGS = [
  { id: 'ARTISAN', name: 'Artisan Partners Gbl Global Value', short: 'Artisan Global Value',   assetClass: 'Global equity',      value: 289420, expectedReturn: 0.060, volatility: 0.14, fiveYear: 0.309, account: 'SIPP' },
  { id: 'RLGE',    name: 'Royal London Gbl Eqty Divsfd Z',    short: 'Royal London Global',    assetClass: 'Global equity',      value: 218340, expectedReturn: 0.065, volatility: 0.14, fiveYear: 0.237, account: 'SIPP' },
  { id: 'JPMEM',   name: 'JPMorgan EM Income C Net Acc',      short: 'JPMorgan EM Income',     assetClass: 'Emerging markets',   value: 174890, expectedReturn: 0.070, volatility: 0.18, fiveYear: 0.149, account: 'ISA' },
  { id: 'VERITAS', name: 'Veritas Global Focus GBP C Acc',    short: 'Veritas Global Focus',   assetClass: 'Global equity',      value: 127890, expectedReturn: 0.060, volatility: 0.15, fiveYear: -0.063, account: 'GIA' },
  { id: 'CASH',    name: 'Cash (GBP)',                        short: 'Cash',                   assetClass: 'Cash',               value:  31800, expectedReturn: 0.030, volatility: 0.005, fiveYear: null, account: 'GIA' },
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
  'Individual shares':    7,
};
