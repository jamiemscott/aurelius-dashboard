/* ─── SAMPLE DATA ───────────────────────────────────────────── */

const allocationData = [
  { label: 'US Equity',                   pct: 52.73, color: '#F5A623' },
  { label: 'European Equity',             pct: 18.82, color: '#FFB547' },
  { label: 'Pacific ex-Japan Equity',     pct: 11.96, color: '#22C55E' },
  { label: 'UK Equity',                   pct:  8.39, color: '#3B82F6' },
  { label: 'Asia & Emerging Markets',     pct:  2.19, color: '#8B5CF6' },
  { label: 'Japan Equity',                pct:  1.87, color: '#EC4899' },
  { label: 'Cash',                        pct:  3.77, color: '#6B7280' },
  { label: 'Other',                       pct:  0.21, color: '#374151' },
];

const assetClassData = [
  { label: 'Equities',           pct: 95.96, color: '#F5A623' },
  { label: 'Cash & Equivalents', pct:  3.77, color: '#22C55E' },
  { label: 'Other',              pct:  0.27, color: '#6B7280' },
];

const currencyData = [
  { label: 'GBP',   pct: 61.2, color: '#F5A623' },
  { label: 'USD',   pct: 23.4, color: '#22C55E' },
  { label: 'EUR',   pct:  9.8, color: '#3B82F6' },
  { label: 'JPY',   pct:  3.1, color: '#8B5CF6' },
  { label: 'Other', pct:  2.5, color: '#6B7280' },
];

const topHoldings = [
  { name: 'Artisan Partners Gbl Global Value', type: 'GBP Mutual Fund', value: '£289,420', gain: '+£68,240', pct: '+30.9%', up: true,  spark: [40,42,38,45,50,48,55,53,58,60] },
  { name: 'Royal London Global Equity',        type: 'GBP Mutual Fund', value: '£218,340', gain: '+£41,800', pct: '+23.7%', up: true,  spark: [30,32,28,35,38,36,40,39,42,44] },
  { name: 'JPMorgan Emerging Markets',         type: 'GBP Mutual Fund', value: '£174,890', gain: '+£22,690', pct: '+14.9%', up: true,  spark: [20,18,22,24,21,25,23,26,24,27] },
  { name: 'Veritas Global Focus',              type: 'GBP Mutual Fund', value: '£127,890', gain: '-£8,600',  pct: '-6.3%',  up: false, spark: [50,48,46,44,47,43,41,42,40,38] },
  { name: 'Cash (GBP)',                        type: 'Cash',            value: '£31,800',  gain: '—',        pct: '—',      up: null,  spark: null },
];

const investments = [
  { name: 'Artisan Partners Gbl Global Value', qty: '12,430.21', price: '23.29', cost: '221,180', mv: '289,420', assets: '34.36', yield: '1.80', gl: '+68,240', glp: '+30.9', up: true  },
  { name: 'JPMorgan EM Income C Net Acc',      qty:  '8,920.44', price: '19.61', cost: '152,200', mv: '174,890', assets: '20.76', yield: '2.90', gl: '+22,690', glp: '+14.9', up: true  },
  { name: 'Royal London Gbl Eqty Divsfd Z',    qty: '14,210.88', price: '15.36', cost: '176,540', mv: '218,340', assets: '25.93', yield: '2.10', gl: '+41,800', glp: '+23.7', up: true  },
  { name: 'Veritas Global Focus GBP C Acc',    qty:  '5,640.77', price: '22.67', cost: '136,490', mv: '127,890', assets: '15.18', yield: '1.60', gl: '-8,600',  glp: '-6.3',  up: false },
];

const documents = [
  { id: 1,  name: 'Portfolio Statement — March 2026',        category: 'statement',      date: '6 Mar 2026',  ts: 20260306, size: '420 KB', account: 'Advised SIPP',  unread: true  },
  { id: 2,  name: 'CGT Summary Report 2025–26',              category: 'tax',            date: '6 Mar 2026',  ts: 20260306, size: '248 KB', account: 'All Accounts',  unread: true  },
  { id: 3,  name: 'Annual Review Letter 2026',               category: 'correspondence', date: '4 Mar 2026',  ts: 20260304, size: '312 KB', account: 'All Accounts',  unread: true  },
  { id: 4,  name: 'Dividend Voucher — Artisan Partners Q4',  category: 'tax',            date: '28 Feb 2026', ts: 20260228, size: '84 KB',  account: 'Advised SIPP',  unread: false },
  { id: 5,  name: 'Portfolio Statement — February 2026',     category: 'statement',      date: '6 Feb 2026',  ts: 20260206, size: '398 KB', account: 'Advised SIPP',  unread: false },
  { id: 6,  name: 'Regulatory Notice — MIFID II Update',     category: 'correspondence', date: '1 Feb 2026',  ts: 20260201, size: '96 KB',  account: 'All Accounts',  unread: false },
  { id: 7,  name: 'Portfolio Statement — January 2026',      category: 'statement',      date: '6 Jan 2026',  ts: 20260106, size: '385 KB', account: 'Advised SIPP',  unread: false },
  { id: 8,  name: 'Valuation Report Q4 2025',                category: 'report',         date: '31 Dec 2025', ts: 20251231, size: '312 KB', account: 'All Accounts',  unread: false },
  { id: 9,  name: 'Quarterly Investment Report — Q3 2025',   category: 'report',         date: '15 Oct 2025', ts: 20251015, size: '784 KB', account: 'All Accounts',  unread: false },
  { id: 10, name: 'SIPP Annual Allowance Statement 2024–25', category: 'tax',            date: '6 Apr 2025',  ts: 20250406, size: '189 KB', account: 'Advised SIPP',  unread: false },
  { id: 11, name: 'Annual CGT Statement 2024–25',            category: 'tax',            date: '6 Apr 2025',  ts: 20250406, size: '195 KB', account: 'All Accounts',  unread: false },
  { id: 12, name: 'Suitability Report — Annual Review 2025', category: 'report',         date: '15 Mar 2025', ts: 20250315, size: '1.2 MB', account: 'All Accounts',  unread: false },
  { id: 13, name: 'ISA Subscription Confirmation 2025–26',   category: 'form',           date: '10 Apr 2025', ts: 20250410, size: '142 KB', account: 'ISA',           unread: false },
  { id: 14, name: 'Investment Management Agreement',          category: 'form',           date: '12 Jan 2024', ts: 20240112, size: '328 KB', account: 'All Accounts',  unread: false },
];

const activity = [
  { icon: '↗', type: 'buy',  title: 'Bought Royal London Gbl Eqty', sub: 'SIPP · 842.4 units @ £14.82',       amount: '+£12,480',  pos: false, time: '2 Mar 2026'  },
  { icon: '÷', type: 'div',  title: 'Dividend Received',             sub: 'Artisan Partners · Q4 distribution', amount: '+£1,840',   pos: true,  time: '28 Feb 2026' },
  { icon: '↙', type: 'sell', title: 'Sold JPMorgan EM Income',       sub: 'SIPP · 420.1 units @ £19.61',       amount: '-£8,240',   pos: false, time: '14 Feb 2026' },
  { icon: '÷', type: 'div',  title: 'Dividend Received',             sub: 'Royal London · Q4 distribution',    amount: '+£2,210',   pos: true,  time: '31 Jan 2026' },
  { icon: '↗', type: 'buy',  title: 'Bought Artisan Partners',       sub: 'SIPP · 610.0 units @ £23.10',       amount: '-£14,091',  pos: false, time: '15 Jan 2026' },
];
