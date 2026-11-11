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
    kyc: { doc: 'Proof of address', expiry: '2026-12-02' },
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
