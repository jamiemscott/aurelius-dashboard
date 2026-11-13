/* ─── DEALING INSTRUCTIONS ────────────────────────────────────
   Shared by both sides: the adviser's Dealing page, dashboard and
   Client 360 (adviser.js), and the investor's Your Orders card on
   My Investments (orders.js), which shows Sumant Kumar's.

   Orders clients place through Add Investment. Each waits for the
   adviser to approve or reject it before it is sent to market.
   Prices are in pounds, as quoted on the Add Investment page.
   source.via is 'browse' or 'smart' (Smart Search, with the reason
   it matched). status: 'awaiting', 'approved', 'rejected' or
   'cancelled' (by the client, before a decision). */
const dealingInstructions = [
  { id: 'REF-20261111-0417', client: 'jim-rockford', status: 'awaiting',
    fund: { name: 'Vanguard FTSE All-World ETF', ticker: 'VWRL', isin: 'IE00B3RBWM25', type: 'ETF' },
    wrapper: 'Stocks & Shares ISA', method: 'amount', amount: 20000, units: null,
    price: 91.24, priceAt: '2026-11-11T08:00', order: 'market', limitPrice: null, tradeDate: '2026-11-12',
    source: { via: 'smart', reason: 'Global equity, low cost, matches “Growth” risk profile' },
    notes: 'Using this year’s ISA allowance, as discussed.', submitted: '2026-11-11T10:41' },
  { id: 'REF-20261111-0421', client: 'sumant-kumar', status: 'awaiting',
    fund: { name: 'Royal London UK Equity Income', ticker: 'RLUEI', isin: 'GB00B3LRCQ57', type: 'Fund' },
    wrapper: 'General Investment Account', method: 'amount', amount: 5000, units: null,
    price: 2.1564, priceAt: '2026-11-11T08:00', order: 'market', limitPrice: null, tradeDate: '2026-11-12',
    source: { via: 'browse', reason: null },
    notes: 'For the dividend income.', submitted: '2026-11-11T11:05' },
  { id: 'REF-20261111-0409', client: 'derek-trotter', status: 'awaiting',
    fund: { name: 'Fundsmith Equity Fund T Acc', ticker: 'FUNDX', isin: 'GB00B4Q5X527', type: 'Fund' },
    wrapper: 'General Investment Account', method: 'amount', amount: 15000, units: null,
    price: 6.225, priceAt: '2026-11-11T08:00', order: 'market', limitPrice: null, tradeDate: '2026-11-12',
    source: { via: 'browse', reason: null },
    notes: 'Something with a bit of growth in it.', submitted: '2026-11-11T08:57' },
  { id: 'REF-20261110-0388', client: 'frasier-crane', status: 'awaiting',
    fund: { name: 'AstraZeneca PLC', ticker: 'AZN', isin: 'GB0009895292', type: 'Share' },
    wrapper: 'General Investment Account', method: 'units', amount: null, units: 400,
    price: 112.40, priceAt: '2026-11-10T16:30', order: 'limit', limitPrice: 110.00, tradeDate: '2026-11-11',
    source: { via: 'browse', reason: null },
    notes: '', submitted: '2026-11-10T17:12' },
  { id: 'REF-20261109-0352', client: 'margo-leadbetter', status: 'awaiting',
    fund: { name: 'iShares Core MSCI World ETF', ticker: 'IWRD', isin: 'IE00B4L5Y983', type: 'ETF' },
    wrapper: 'Stocks & Shares ISA', method: 'amount', amount: 12500, units: null,
    price: 78.35, priceAt: '2026-11-09T08:00', order: 'market', limitPrice: null, tradeDate: '2026-11-10',
    source: { via: 'smart', reason: 'Developed-market equity, keeps current risk level' },
    notes: 'Jerry agrees.', submitted: '2026-11-09T12:20' },
  { id: 'REF-20261106-0301', client: 'sumant-kumar', status: 'approved',
    fund: { name: 'Vanguard LifeStrategy 80% Equity', ticker: 'VASF', isin: 'GB00B4PQW151', type: 'Fund' },
    wrapper: 'Stocks & Shares ISA', method: 'amount', amount: 10000, units: null,
    price: 3.1218, priceAt: '2026-11-06T08:00', order: 'market', limitPrice: null, tradeDate: '2026-11-07',
    source: { via: 'smart', reason: 'Multi-asset, matches “Balanced” risk profile' },
    notes: '', submitted: '2026-11-06T09:30',
    decision: { at: '2026-11-06T11:02', note: 'In line with the suitability report of 4 November.' } },
  { id: 'REF-20261104-0277', client: 'jessica-fletcher', status: 'approved',
    fund: { name: 'Unilever PLC', ticker: 'ULVR', isin: 'GB00B10RZP78', type: 'Share' },
    wrapper: 'General Investment Account', method: 'units', amount: null, units: 150,
    price: 42.18, priceAt: '2026-11-04T08:00', order: 'limit', limitPrice: 42.00, tradeDate: '2026-11-05',
    source: { via: 'browse', reason: null },
    notes: 'Royalty money.', submitted: '2026-11-04T14:15',
    decision: { at: '2026-11-04T16:40', note: '' } },
  { id: 'REF-20261105-0289', client: 'sumant-kumar', status: 'rejected',
    fund: { name: 'iShares Core MSCI World ETF', ticker: 'IWRD', isin: 'IE00B4L5Y983', type: 'ETF' },
    wrapper: 'Stocks & Shares ISA', method: 'amount', amount: 12000, units: null,
    price: 78.35, priceAt: '2026-11-05T08:00', order: 'market', limitPrice: null, tradeDate: '2026-11-06',
    source: { via: 'smart', reason: 'Developed-market equity, low cost' },
    notes: '', submitted: '2026-11-05T15:48',
    decision: { at: '2026-11-05T17:20', reason: 'allowance', note: 'You have £8,240 of ISA allowance left this tax year, so £12,000 won’t fit. Could you send it again at £8,240? Anything over that can go in your General Investment Account.' } },
  { id: 'REF-20261102-0240', client: 'victor-meldrew', status: 'rejected',
    fund: { name: 'Shell PLC', ticker: 'SHEL', isin: 'GB00BP6MXD84', type: 'Share' },
    wrapper: 'Stocks & Shares ISA', method: 'amount', amount: 25000, units: null,
    price: 26.12, priceAt: '2026-11-02T08:00', order: 'market', limitPrice: null, tradeDate: '2026-11-03',
    source: { via: 'browse', reason: null },
    notes: 'I don’t believe it isn’t in there already.', submitted: '2026-11-02T10:05',
    decision: { at: '2026-11-02T13:30', reason: 'allowance', note: 'Victor has £8,000 of ISA allowance left this tax year. I’ve called him to resubmit at that amount.' } },
];

/* Why an adviser can reject an instruction. */
const DEALING_REJECT_REASONS = {
  suitability: 'Not suitable for the client’s risk profile',
  allowance:   'Exceeds the wrapper’s allowance',
  cash:        'Not enough cash in the account',
  price:       'Price or order type needs changing',
  other:       'Other',
};
