/* ─── ADVISER DATA ──────────────────────────────────────────────
   James Whitmore's client book. One source for the adviser
   dashboard, Client Book and Client 360, so their numbers agree.
   All clients are fictional. Dates are ISO strings; statuses
   (overdue, expiring, expired) are worked out from AS_AT rather
   than stored, so moving AS_AT moves every page consistently.  */

const ADVISER = {
  name:  'James Whitmore',
  slug:  'james-whitmore',
  title: 'Senior Wealth Manager',
  office: 'Mayfair',
  email: 'j.whitmore@aurelius.co.uk',
};

const AS_AT = '2026-11-11';

/* Windows the dashboard counts within, in days */
const REVIEW_WINDOW = 30;
const KYC_WINDOW    = 60;
const SOON          = 14;   /* due within this many days reads as amber */

const adviserClients = [
  { slug: 'frasier-crane',    name: 'Frasier Crane',    ref: 'AW-20177-UK', tier: 'Platinum', role: 'Individual', since: '2017-04-03',
    value: 1842315.20, cash: 96400.00, gain: 311240.20, gainPct: 20.3,
    lastActivity: '2026-11-10', lastActivityNote: 'Logged in · viewed valuation',
    lastReview: '2025-12-08', nextReview: '2026-12-08',
    kyc: { doc: 'Passport', expiry: '2029-01-30' },
    email: 'f.crane@kacl-radio.example', phone: '+44 7700 900 311', city: 'Seattle (UK tax resident)' },

  { slug: 'margo-leadbetter', name: 'Margo Leadbetter', ref: 'AW-20189-UK', tier: 'Platinum', role: 'Joint',      since: '2017-09-14',
    value: 1215600.00, cash: 64000.00, gain: 201600.00, gainPct: 19.9,
    lastActivity: '2026-10-21', lastActivityNote: 'Secure message sent',
    lastReview: '2026-03-05', nextReview: '2027-03-05',
    kyc: { doc: 'Passport', expiry: '2031-04-12' },
    email: 'margo@leadbetter.example', phone: '+44 7700 900 189', city: 'Surbiton' },

  { slug: 'sumant-kumar',     name: 'Sumant Kumar',     ref: 'AW-20182-UK', tier: 'Platinum', role: 'Individual', since: '2018-03-01',
    value: 842340.00,  cash: 31800.00, gain: 148130.00, gainPct: 21.3,
    lastActivity: '2026-11-02', lastActivityNote: 'Used Plan My Future',
    lastReview: '2026-09-15', nextReview: '2027-09-15',
    kyc: { doc: 'Passport', expiry: '2031-11-24' },
    email: 'sumant.kumar@gmail.com', phone: '+44 7700 900 142', city: 'London' },

  { slug: 'jessica-fletcher', name: 'Jessica Fletcher', ref: 'AW-20402-UK', tier: 'Gold',     role: 'Individual', since: '2020-02-17',
    value: 734120.00,  cash: 52300.00, gain: 88120.00,  gainPct: 13.6,
    lastActivity: '2026-10-30', lastActivityNote: 'Royalties added · £12,000',
    lastReview: '2026-02-14', nextReview: '2027-02-14',
    kyc: { doc: 'Passport', expiry: '2026-11-04' },
    email: 'j.fletcher@cabotcove.example', phone: '+44 7700 900 402', city: 'Cabot Cove (UK tax resident)' },

  { slug: 'hyacinth-bucket',  name: 'Hyacinth Bucket',  ref: 'AW-20298-UK', tier: 'Gold',     role: 'Joint',      since: '2019-06-22',
    value: 612880.50,  cash: 41200.00, gain: 52880.50,  gainPct: 9.4,
    lastActivity: '2026-11-11', lastActivityNote: 'Advice request · gifting',
    lastReview: '2025-11-27', nextReview: '2026-11-27',
    kyc: { doc: 'Passport', expiry: '2030-08-19' },
    email: 'hyacinth@bouquet-residence.example', phone: '+44 7700 900 298', city: 'Coventry' },

  { slug: 'jim-rockford',     name: 'Jim Rockford',     ref: 'AW-20254-UK', tier: 'Gold',     role: 'Individual', since: '2018-11-05',
    value: 522960.40,  cash: 33500.00, gain: 47960.40,  gainPct: 10.1,
    lastActivity: '2026-11-06', lastActivityNote: 'Advice request · ISA top-up',
    lastReview: '2026-06-30', nextReview: '2027-06-30',
    kyc: { doc: 'Passport', expiry: '2028-10-07' },
    email: 'jim@rockford-files.example', phone: '+44 7700 900 254', city: 'Brighton' },

  { slug: 'victor-meldrew',   name: 'Victor Meldrew',   ref: 'AW-20366-UK', tier: 'Silver',   role: 'Individual', since: '2019-12-01',
    value: 356775.90,  cash: 22100.00, gain: 12775.90,  gainPct: 3.7,
    lastActivity: '2026-09-14', lastActivityNote: 'Complaint logged · resolved',
    lastReview: '2026-04-02', nextReview: '2027-04-02',
    kyc: { doc: 'Passport', expiry: '2026-12-29' },
    email: 'v.meldrew@example.co.uk', phone: '+44 7700 900 366', city: 'Bournemouth' },

  { slug: 'basil-fawlty',     name: 'Basil Fawlty',     ref: 'AW-20311-UK', tier: 'Silver',   role: 'Corporate',  since: '2020-05-11',
    value: 286540.00,  cash: 18230.00, gain: -4210.80,  gainPct: -1.4,
    lastActivity: '2026-11-07', lastActivityNote: 'Withdrawal · £5,000',
    lastReview: '2025-11-19', nextReview: '2026-11-19',
    kyc: { doc: 'Passport', expiry: '2026-12-02' },
    email: 'basil@fawltytowers.example', phone: '+44 7700 900 311', city: 'Torquay' },

  { slug: 'columbo',          name: 'Lt. Columbo',      ref: 'AW-20433-UK', tier: 'Silver',   role: 'Individual', since: '2021-03-08',
    value: 198430.00,  cash: 14900.00, gain: 6430.00,   gainPct: 3.3,
    lastActivity: '2026-08-30', lastActivityNote: 'Just one more question…',
    lastReview: '2026-05-18', nextReview: '2027-05-18',
    kyc: { doc: 'Driving licence', expiry: '2030-02-09' },
    email: 'columbo@example.com', phone: '+44 7700 900 433', city: 'London' },

  { slug: 'diogo',            name: 'Diogo',            ref: 'AW-20051-UK', tier: 'Platinum', role: 'Joint',      since: '2016-01-12',
    value: 129198.76,  cash: 12400.00, gain: 15230.55,  gainPct: 13.4,
    lastActivity: '2026-11-03', lastActivityNote: 'Logged in',
    lastReview: '2025-07-22', nextReview: '2026-07-22',
    kyc: { doc: 'Driving licence', expiry: '2029-06-11' },
    email: 'diogo@example.pt', phone: '+44 7700 900 051', city: 'London' },

  { slug: 'mike',             name: 'Mike',             ref: 'AW-20240-UK', tier: 'Bronze',   role: 'Individual', since: '2018-08-20',
    value: 104458.68,  cash: 6210.40,  gain: 8412.10,   gainPct: 8.7,
    lastActivity: '2026-10-28', lastActivityNote: 'Monthly contribution · £500',
    lastReview: '2025-07-15', nextReview: '2026-07-15',
    kyc: { doc: 'Passport', expiry: '2028-03-02' },
    email: 'mike@example.co.uk', phone: '+44 7700 900 240', city: 'Manchester' },

  { slug: 'derek-trotter',    name: 'Derek Trotter',    ref: 'AW-20415-UK', tier: 'Bronze',   role: 'Corporate',  since: '2022-01-04',
    value: 48210.35,   cash: 9880.00,  gain: -2140.65,  gainPct: -4.3,
    lastActivity: '2026-11-09', lastActivityNote: 'Advice request · new money',
    lastReview: '2026-01-20', nextReview: '2027-01-20',
    kyc: { doc: 'Driving licence', expiry: '2026-12-20' },
    email: 'del@trotters-independent.example', phone: '+44 7700 900 415', city: 'Peckham' },
];

/* Adviser notes shown on Client 360, keyed by slug. Clients
   without notes get a generic "no notes yet" empty state.     */
const adviserNotes = {
  'sumant-kumar': [
    { date: '2026-11-02', title: 'Plan My Future used',     sub: 'Explored retiring at 60 · follow up at next review' },
    { date: '2026-09-15', title: 'Annual review held',       sub: 'Risk profile confirmed · Balanced (Water)' },
    { date: '2026-04-03', title: 'ISA subscription',         sub: '£20,000 into Stocks & Shares ISA' },
  ],
  'hyacinth-bucket': [
    { date: '2026-11-11', title: 'Advice request received',  sub: 'Gifting £40,000 to grandchildren · IHT planning' },
    { date: '2026-06-02', title: 'Call',                     sub: 'Asked that we pronounce it “Bouquet”' },
  ],
  'jessica-fletcher': [
    { date: '2026-11-04', title: 'Passport expired',         sub: 'Trading restricted until new ID received' },
    { date: '2026-10-30', title: 'Royalties added',          sub: '£12,000 into GIA' },
  ],
};


/* ─── ADVICE REQUESTS ───────────────────────────────────────────
   Inbound requests from clients. Status runs new → open (read)
   → awaiting (adviser replied, ball in client's court) → closed.
   "Needs reply" is new + open, which is what the dashboard and
   nav badge count. Thread entries are from 'client' or 'adviser'. */

const REQUEST_TYPES = {
  tax:        { label: 'Tax & Planning', color: '#22C55E', bg: 'rgba(34,197,94,0.12)'  },
  retirement: { label: 'Retirement',     color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
  investment: { label: 'Investment',     color: '#F5A623', bg: 'rgba(245,166,35,0.12)' },
  isa:        { label: 'ISA',            color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  fees:       { label: 'Fees',           color: '#6B7280', bg: 'rgba(107,114,128,0.12)' },
  complaint:  { label: 'Complaint',      color: '#EF4444', bg: 'rgba(239,68,68,0.12)'  },
};

const adviceRequests = [
  { id: 'AR-2611-0412', client: 'hyacinth-bucket', type: 'tax', amount: 40000, status: 'new',
    subject: 'Gifting to the grandchildren', received: '2026-11-11T09:12',
    thread: [
      { from: 'client', at: '2026-11-11T09:12', text: 'Good morning Mr Whitmore. Richard and I would like to give £40,000 to our grandchildren ahead of Christmas. I am told there is something called inheritance tax one must be careful of. Could you advise on the most elegant way to do it? It is pronounced “Bouquet”, by the way.' },
    ] },
  { id: 'AR-2611-0408', client: 'frasier-crane', type: 'retirement', amount: 250000, status: 'new',
    subject: 'Drawing down from my SIPP', received: '2026-11-10T16:40',
    thread: [
      { from: 'client', at: '2026-11-10T16:40', text: 'James, I’m considering taking £250,000 from the SIPP, partly tax-free cash, to fund a rather wonderful apartment refurbishment. Before Niles hears of it, could we discuss the tax position and what it does to my long-term income?' },
    ] },
  { id: 'AR-2611-0397', client: 'derek-trotter', type: 'investment', amount: 15000, status: 'open',
    subject: 'Lump sum to invest', received: '2026-11-09T11:05',
    thread: [
      { from: 'client', at: '2026-11-09T11:05', text: 'Alright James. Had a bit of a result this week, £15k cash to put to work. Something with a bit of growth in it. This time next year, eh?' },
    ] },
  { id: 'AR-2611-0381', client: 'jim-rockford', type: 'isa', amount: 20000, status: 'open',
    subject: 'Use this year’s ISA allowance', received: '2026-11-06T14:22',
    thread: [
      { from: 'client', at: '2026-11-06T14:22', text: 'Can we get the full £20,000 into my ISA well before April this time? Last year I left it late and it cost me. Leave a message at the tone if I’m not around.' },
    ] },
  { id: 'AR-2611-0355', client: 'margo-leadbetter', type: 'investment', amount: null, status: 'awaiting',
    subject: 'Moving to sustainable funds', received: '2026-11-04T10:30',
    thread: [
      { from: 'client', at: '2026-11-04T10:30', text: 'Jerry and I would like the portfolio to be rather more ethical. Nothing too sandal-wearing, mind. What are our options?' },
      { from: 'adviser', at: '2026-11-04T15:10', text: 'Thanks Margo. I’ve put together three ESG model portfolios that keep your current risk level. I’ve sent them to your Documents. Could you let me know which you’d both like to go through?' },
    ] },
  { id: 'AR-2610-0322', client: 'columbo', type: 'fees', amount: null, status: 'awaiting',
    subject: 'Just one more question about fees', received: '2026-10-29T17:55',
    thread: [
      { from: 'client', at: '2026-10-29T17:55', text: 'Sorry to bother you sir, I was just on my way out. One thing’s been nagging at me: the platform fee and the fund charges, are they the same thing? My wife asked and I couldn’t say.' },
      { from: 'adviser', at: '2026-10-30T09:20', text: 'Not at all, Lieutenant. They’re separate: the platform fee is 0.25% a year for holding everything, and each fund has its own ongoing charge on top. I’ve attached your full cost breakdown. Does that answer it?' },
    ] },
  { id: 'AR-2610-0290', client: 'sumant-kumar', type: 'retirement', amount: null, status: 'closed',
    subject: 'Retiring at 60, is it realistic?', received: '2026-10-20T08:45', outcome: 'Added to the September 2027 review agenda',
    thread: [
      { from: 'client', at: '2026-10-20T08:45', text: 'I tried Plan My Future and it says retiring at 60 is within reach. Is that realistic, and what would need to change?' },
      { from: 'adviser', at: '2026-10-21T11:00', text: 'It’s realistic on your current contributions, Sumant, with some margin. I’ll model it properly with you at your review and we can stress-test it then.' },
      { from: 'client', at: '2026-10-21T12:15', text: 'Perfect, thank you.' },
    ] },
  { id: 'AR-2609-0214', client: 'victor-meldrew', type: 'complaint', amount: null, status: 'closed',
    subject: 'Statement arrived late', received: '2026-09-14T07:02', outcome: 'Resolved · apology sent, no further action',
    thread: [
      { from: 'client', at: '2026-09-14T07:02', text: 'I don’t believe it. My quarterly statement arrived nine days late, again. I want to know why.' },
      { from: 'adviser', at: '2026-09-14T10:30', text: 'Victor, I’m sorry. A print run was delayed at our supplier. Your statements are now also in Documents the day they’re produced, so you won’t have to wait for the post.' },
    ] },
];


/* ─── REVIEWS & MEETINGS ────────────────────────────────────────
   Reviews come from each client's nextReview (adviserClients), so
   the dashboard, Client Book and this page always agree on what is
   due. reviewBookings adds the diary side: when it is booked, where,
   and how far through the review workflow it is. A due review with
   no booking shows as "Not booked".

   Workflow stages, each with a checklist that must be complete
   before moving on:
     0 Prepare · 1 Meet · 2 Report · 3 Sign-off · 4 Complete      */

const REVIEW_STAGES = [
  { label: 'Prepare',  status: 'Preparing',     checks: ['Fact-find updated', 'Valuation pack generated', 'Risk profile re-confirmed', 'Agenda sent to client'] },
  { label: 'Meet',     status: 'Meeting',       checks: ['Objectives and circumstances reviewed', 'Attitude to risk confirmed with client', 'Meeting notes recorded'] },
  { label: 'Report',   status: 'Report due',    checks: ['Suitability report drafted', 'Compliance check passed', 'Report sent to client'] },
  { label: 'Sign-off', status: 'Awaiting sign-off', checks: ['Client acknowledged report', 'Next review date set'] },
];

const MEETING_PLACES = ['Office · Mayfair', 'Video call', 'Phone', 'Client’s home'];

const reviewBookings = {
  'basil-fawlty':    { at: '2026-11-19T10:00', where: 'Client’s premises · Torquay', stage: 0, done: [0, 1] },
  'hyacinth-bucket': { at: '2026-11-27T14:30', where: 'Client’s home', stage: 0, done: [] },
  'sumant-kumar':    { at: '2026-09-15T10:00', where: 'Office · Mayfair', stage: 4, done: [], completed: true },
};

/* Other diary items: calls and meetings that are not reviews */
const adviserMeetings = [
  { id: 'MT-2611-031', client: 'hyacinth-bucket', title: 'Gifting and IHT call',          at: '2026-11-12T10:00', where: 'Phone',
    agenda: 'Talk through gifting £40,000: the seven-year rule, annual exemptions and gifts from surplus income.' },
  { id: 'MT-2611-032', client: 'frasier-crane',   title: 'SIPP drawdown discussion',      at: '2026-11-12T15:30', where: 'Video call',
    agenda: 'Tax-free cash vs. taxable income, the effect on long-term income, and the Money Purchase Annual Allowance.' },
  { id: 'MT-2611-033', client: 'derek-trotter',   title: 'Investing new money',           at: '2026-11-13T12:00', where: 'Office · Mayfair',
    agenda: 'Investing £15,000: objectives, time horizon and capacity for loss before any recommendation.' },
  { id: 'MT-2611-038', client: 'jim-rockford',    title: 'ISA top-up',                    at: '2026-11-17T09:30', where: 'Phone',
    agenda: 'Confirm the £20,000 subscription and fund choice for this tax year.' },
  { id: 'MT-2611-024', client: 'margo-leadbetter', title: 'ESG portfolio options',        at: '2026-11-04T15:00', where: 'Video call', held: true,
    agenda: 'Present three ESG model portfolios at the current risk level.' },
];

/* ── KYC & AML ──────────────────────────────────────────────────
   Per-client anti-money-laundering profile. Screening (sanctions,
   PEP and adverse media) repeats on a cycle set by the risk rating.
   idVerified / poa.date are when each document was last checked.  */
const AML_RISK = {
  Low:    { months: 12, tone: '' },
  Medium: { months: 6,  tone: 'warning' },
  High:   { months: 3,  tone: 'error' },
};

const ID_DOCUMENTS = ['Passport', 'Driving licence', 'National ID card'];

const adviserAml = {
  'frasier-crane':    { risk: 'Medium', pep: false, sow: 'Broadcasting income and book royalties', idVerified: '2019-02-11', poa: { doc: 'Council tax bill', date: '2026-04-02' }, screened: '2026-06-18', result: 'Clear' },
  'margo-leadbetter': { risk: 'Low',    pep: false, sow: 'Inheritance and spouse’s salary',       idVerified: '2021-04-20', poa: { doc: 'Utility bill',     date: '2026-01-15' }, screened: '2026-02-09', result: 'Clear' },
  'sumant-kumar':     { risk: 'Low',    pep: false, sow: 'Salary and share options',              idVerified: '2021-11-30', poa: { doc: 'Bank statement',   date: '2026-09-15' }, screened: '2026-09-15', result: 'Clear' },
  'jessica-fletcher': { risk: 'Low',    pep: false, sow: 'Book royalties',                        idVerified: '2016-11-04', poa: { doc: 'Utility bill',     date: '2025-12-01' }, screened: '2026-03-03', result: 'Clear' },
  'hyacinth-bucket':  { risk: 'Medium', pep: false, sow: 'Pension lump sum and property sale',    idVerified: '2020-08-19', poa: { doc: 'Council tax bill', date: '2026-05-10' }, screened: '2026-07-01', result: 'Clear' },
  'jim-rockford':     { risk: 'Medium', pep: false, sow: 'Self-employed investigator fees',       idVerified: '2018-10-07', poa: { doc: 'Bank statement',   date: '2026-03-28' }, screened: '2026-05-30', result: 'Clear' },
  'victor-meldrew':   { risk: 'Low',    pep: false, sow: 'Occupational pension',                  idVerified: '2016-12-29', poa: { doc: 'Utility bill',     date: '2026-02-17' }, screened: '2026-02-17', result: 'Clear' },
  'basil-fawlty':     { risk: 'High',   pep: false, sow: 'Hotel trading profits (cash business)', idVerified: '2020-12-02', poa: { doc: 'Business rates bill', date: '2025-12-02' }, screened: '2026-09-02', result: 'Clear' },
  'columbo':          { risk: 'Low',    pep: false, sow: 'Police pension',                        idVerified: '2021-02-09', poa: { doc: 'Utility bill',     date: '2026-06-06' }, screened: '2026-06-06', result: 'Clear' },
  'diogo':            { risk: 'High',   pep: true,  sow: 'Property portfolio, Lisbon and Porto',  idVerified: '2019-06-11', poa: { doc: 'Bank statement',   date: '2026-07-22' }, screened: '2026-08-24', result: 'Possible match cleared', pepNote: 'Former municipal councillor, Lisbon (2013–2017)' },
  'mike':             { risk: 'Low',    pep: false, sow: 'Salary',                                idVerified: '2018-03-02', poa: { doc: 'Utility bill',     date: '2025-07-15' }, screened: '2025-07-15', result: 'Clear' },
  'derek-trotter':    { risk: 'High',   pep: false, sow: 'Market trading (cash business)',        idVerified: '2016-12-20', poa: { doc: 'Utility bill',     date: '2026-01-04' }, screened: '2026-07-20', result: 'Clear' },
};
