/* ─── ADVISER PAGES ─────────────────────────────────────────────
   Renders the adviser dashboard, Client Book and Client 360 from
   adviser-data.js. Each builder checks for its own root element,
   so one script serves every adviser page. Load after
   adviser-data.js and data.js, before main.js.                  */

/* ── Formatting ─────────────────────────────────────────────── */

function advMoney(n, dp) {
  dp = dp === undefined ? 2 : dp;
  var abs = Math.abs(n).toLocaleString('en-GB', { minimumFractionDigits: dp, maximumFractionDigits: dp });
  return (n < 0 ? '−£' : '£') + abs;
}

function advDate(iso) {
  return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

function advDaysUntil(iso) {
  return Math.round((Date.parse(iso + 'T00:00:00Z') - Date.parse(AS_AT + 'T00:00:00Z')) / 864e5);
}

function advClientUrl(slug) {
  return '/adviser-dashboard/' + ADVISER.slug + '/clients/' + slug + '/';
}

function advTag(text, tone) {
  return '<span class="status-tag' + (tone ? ' status-tag--' + tone : '') + '">' + text + '</span>';
}

/* "Overdue" / "Today" / "In 8 days", toned by how close it is */
function advDueTag(iso, pastWord) {
  var d = advDaysUntil(iso);
  if (d < 0)  return advTag(pastWord, 'error');
  if (d === 0) return advTag('Today', 'warning');
  return advTag('In ' + d + ' day' + (d === 1 ? '' : 's'), d <= SOON ? 'warning' : '');
}

function advTier(tier) {
  return tier === 'Platinum' ? advTag('Platinum', 'gold') : tier;
}

/* KYC is worked out from the expiry date, never stored */
function advKyc(c) {
  var d = advDaysUntil(c.kyc.expiry);
  if (d < 0)            return { label: 'Expired',  tone: 'error',   rank: 0 };
  if (d <= KYC_WINDOW)  return { label: 'Expiring', tone: 'warning', rank: 1 };
  return                       { label: 'Verified', tone: 'success', rank: 2 };
}

function advReviewDue(c) { return advDaysUntil(c.nextReview) <= REVIEW_WINDOW; }
function advKycDue(c)    { return advDaysUntil(c.kyc.expiry) <= KYC_WINDOW; }
function advNeedsAttention(c) { return advReviewDue(c) || advKycDue(c); }

function advNameCell(c, sub) {
  return '<td><a class="td-name" href="' + advClientUrl(c.slug) + '">' + c.name + '</a>' +
         '<div class="td-type">' + (sub || c.ref) + '</div></td>';
}

function advGainCell(c) {
  var cls = c.gain >= 0 ? 'is-up' : 'is-down';
  var sign = c.gain >= 0 ? '+' : '';
  return '<td><span class="td-change ' + cls + '">' + sign + advMoney(c.gain) + '</span>' +
         '<div class="td-type">' + sign + c.gainPct.toFixed(1) + '%</div></td>';
}

function advEmptyRow(cols, title, sub) {
  return '<tr><td colspan="' + cols + '"><div class="empty-state">' +
    '<svg aria-hidden="true" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
    '<div>' + title + '</div>' + (sub ? '<div class="empty-state-sub">' + sub + '</div>' : '') +
    '</div></td></tr>';
}

/* Whole-row click for pointer users; the name link stays the
   keyboard and screen-reader route to the same place.         */
function advRowLinks(tbody) {
  tbody.addEventListener('click', function (e) {
    if (e.target.closest('a, button')) return;
    var link = e.target.closest('tr') && e.target.closest('tr').querySelector('a.td-name');
    if (link) window.location.href = link.href;
  });
}

function advSetText(id, text) {
  var el = document.getElementById(id);
  if (el) el.textContent = text;
}


/* ── Dashboard ──────────────────────────────────────────────── */

function buildAdviserDashboard() {
  var reviewsBody = document.getElementById('adv-reviews-body');
  var kycBody     = document.getElementById('adv-kyc-body');
  if (!reviewsBody && !kycBody) return;

  var aum = adviserClients.reduce(function (s, c) { return s + c.value; }, 0);
  var reviews = adviserClients.filter(advReviewDue)
    .sort(function (a, b) { return a.nextReview.localeCompare(b.nextReview); });
  var kyc = adviserClients.filter(advKycDue)
    .sort(function (a, b) { return a.kyc.expiry.localeCompare(b.kyc.expiry); });
  var overdue = reviews.filter(function (c) { return advDaysUntil(c.nextReview) < 0; }).length;
  var expired = kyc.filter(function (c) { return advDaysUntil(c.kyc.expiry) < 0; }).length;

  advSetText('adv-kpi-aum', advMoney(aum, 0));
  advSetText('adv-kpi-clients', String(adviserClients.length));
  advSetText('adv-kpi-reviews', String(reviews.length));
  advSetText('adv-kpi-reviews-note', overdue + ' overdue');
  advSetText('adv-kpi-kyc', String(kyc.length));
  advSetText('adv-kpi-kyc-note', expired + ' expired');

  if (reviewsBody) {
    reviewsBody.innerHTML = reviews.length ? reviews.map(function (c) {
      return '<tr>' + advNameCell(c) +
        '<td>' + advTier(c.tier) + '</td>' +
        '<td><time datetime="' + c.nextReview + '">' + advDate(c.nextReview) + '</time></td>' +
        '<td>' + advDueTag(c.nextReview, 'Overdue') + '</td>' +
        '<td>' + advMoney(c.value) + '</td></tr>';
    }).join('') : advEmptyRow(5, 'No reviews due', 'Nothing in the next ' + REVIEW_WINDOW + ' days.');
    advRowLinks(reviewsBody);
  }

  if (kycBody) {
    kycBody.innerHTML = kyc.length ? kyc.map(function (c) {
      return '<tr>' + advNameCell(c, c.ref + ' · ' + c.kyc.doc) +
        '<td><time datetime="' + c.kyc.expiry + '">' + advDate(c.kyc.expiry) + '</time></td>' +
        '<td>' + advDueTag(c.kyc.expiry, 'Expired') + '</td></tr>';
    }).join('') : advEmptyRow(3, 'No KYC documents expiring', 'Nothing in the next ' + KYC_WINDOW + ' days.');
    advRowLinks(kycBody);
  }
}


/* ── Client Book ────────────────────────────────────────────── */

var bookState = { filter: 'all', query: '', sort: 'value', dir: 'descending' };

var bookFilters = {
  all:       function () { return true; },
  platinum:  function (c) { return c.tier === 'Platinum'; },
  attention: advNeedsAttention,
};

/* Sort keys map a column to a comparable value */
var bookSortKeys = {
  name:         function (c) { return c.name.split(' ').pop(); },   /* surname, as client books are filed */
  tier:         function (c) { return ['Platinum', 'Gold', 'Silver', 'Bronze'].indexOf(c.tier); },
  role:         function (c) { return c.role; },
  value:        function (c) { return c.value; },
  cash:         function (c) { return c.cash; },
  gain:         function (c) { return c.gainPct; },
  lastActivity: function (c) { return c.lastActivity; },
  nextReview:   function (c) { return c.nextReview; },
  kyc:          function (c) { return advKyc(c).rank; },
};

function buildClientBook() {
  var tbody = document.getElementById('book-body');
  if (!tbody) return;

  var table  = tbody.closest('table');
  var search = document.getElementById('book-search');
  var tabs   = document.getElementById('book-tabs');

  /* Tab counts */
  Object.keys(bookFilters).forEach(function (key) {
    advSetText('book-count-' + key, String(adviserClients.filter(bookFilters[key]).length));
  });

  function render() {
    var q = bookState.query.trim().toLowerCase();
    var rows = adviserClients
      .filter(bookFilters[bookState.filter])
      .filter(function (c) { return !q || (c.name + ' ' + c.ref).toLowerCase().indexOf(q) !== -1; });

    var key = bookSortKeys[bookState.sort];
    var dir = bookState.dir === 'ascending' ? 1 : -1;
    rows.sort(function (a, b) {
      var x = key(a), y = key(b);
      return (x > y ? 1 : x < y ? -1 : 0) * dir;
    });

    var total = rows.reduce(function (s, c) { return s + c.value; }, 0);
    advSetText('book-summary', rows.length + ' client' + (rows.length === 1 ? '' : 's') + ' · ' + advMoney(total, 0) + ' under advice');

    tbody.innerHTML = rows.length ? rows.map(function (c) {
      var k = advKyc(c);
      var review = '<time datetime="' + c.nextReview + '">' + advDate(c.nextReview) + '</time>' +
        (advReviewDue(c) ? '<div class="td-type">' + advDueTag(c.nextReview, 'Overdue') + '</div>' : '');
      return '<tr>' + advNameCell(c) +
        '<td>' + advTier(c.tier) + '</td>' +
        '<td class="td-secondary">' + c.role + '</td>' +
        '<td><strong>' + advMoney(c.value) + '</strong></td>' +
        '<td class="td-secondary">' + advMoney(c.cash) + '</td>' +
        advGainCell(c) +
        '<td><time datetime="' + c.lastActivity + '">' + advDate(c.lastActivity) + '</time><div class="td-type">' + c.lastActivityNote + '</div></td>' +
        '<td>' + review + '</td>' +
        '<td>' + advTag(k.label, k.tone) + '</td></tr>';
    }).join('') : advEmptyRow(9, 'No clients match', 'Try a different name or reference, or another tab.');

    /* Header state */
    table.querySelectorAll('th[data-sort]').forEach(function (th) {
      if (th.dataset.sort === bookState.sort) th.setAttribute('aria-sort', bookState.dir);
      else th.removeAttribute('aria-sort');
    });
  }

  if (search) search.addEventListener('input', function () { bookState.query = search.value; render(); });

  if (tabs) tabs.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-filter]');
    if (!btn) return;
    bookState.filter = btn.dataset.filter;
    tabs.querySelectorAll('[data-filter]').forEach(function (b) {
      var on = b === btn;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    render();
  });

  table.querySelectorAll('th[data-sort] .th-sort').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.closest('th').dataset.sort;
      if (bookState.sort === key) {
        bookState.dir = bookState.dir === 'ascending' ? 'descending' : 'ascending';
      } else {
        bookState.sort = key;
        /* Figures read biggest first; words and dates read A→Z / soonest first */
        bookState.dir = ['value', 'cash', 'gain'].indexOf(key) !== -1 ? 'descending' : 'ascending';
      }
      render();
    });
  });

  advRowLinks(tbody);
  render();
}


/* ── Client 360 ─────────────────────────────────────────────── */

/* The page is one template; the client comes from the URL
   (/clients/<slug>/, rewritten in serve.json and netlify.toml). */
function advCurrentClient() {
  var m = window.location.pathname.match(/\/clients\/([^/]+)\/?$/);
  var slug = m ? m[1] : '';
  if (!slug || slug === 'profile') slug = new URLSearchParams(window.location.search).get('id') || 'sumant-kumar';
  return adviserClients.find(function (c) { return c.slug === slug; }) || null;
}

/* Holdings in data.js are Sumant's. For anyone else, scale them
   to the client's value so the table adds up. Runs before
   main.js renders the table.                                  */
(function scaleHoldingsForClient() {
  if (!document.currentScript || typeof topHoldings === 'undefined') return;
  if (!/\/clients\/[^/]+\/?$/.test(window.location.pathname)) return;
  var c = advCurrentClient();
  if (!c || c.slug === 'sumant-kumar') return;
  var ratio = c.value / 842340;
  topHoldings.forEach(function (h) {
    var v = parseFloat(String(h.value).replace(/[£,]/g, ''));
    if (!isNaN(v)) h.value = advMoney(Math.round(v * ratio), 0);
  });
}());

function buildClientProfile() {
  var root = document.getElementById('client-360');
  if (!root) return;

  var c = advCurrentClient();
  if (!c) {
    root.innerHTML = '<div class="card empty-state">' +
      '<svg aria-hidden="true" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>' +
      '<div>Client not found</div><div class="empty-state-sub"><a href="/adviser-dashboard/' + ADVISER.slug + '/clients/">Back to Client Book</a></div></div>';
    advSetText('client-name', 'Client not found');
    advSetText('client-crumb', 'Not found');
    return;
  }

  var k = advKyc(c);
  var since = new Date(c.since + 'T00:00:00Z').toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });

  document.title = 'Aurelius Wealth — ' + c.name;
  advSetText('client-name', c.name);
  advSetText('client-crumb', c.name);
  advSetText('client-meta', c.ref + ' · ' + c.tier + ' · ' + c.role + ' · Client since ' + since);

  advSetText('client-kpi-value', advMoney(c.value, 0));
  advSetText('client-kpi-gain', (c.gain >= 0 ? '+' : '') + advMoney(c.gain, 0) + ' (' + (c.gain >= 0 ? '+' : '') + c.gainPct.toFixed(1) + '%)');
  var gainEl = document.getElementById('client-kpi-gain');
  if (gainEl) gainEl.classList.add(c.gain >= 0 ? 'up' : 'down');
  advSetText('client-kpi-cash', advMoney(c.cash, 0));
  advSetText('client-kpi-cash-note', (c.cash / c.value * 100).toFixed(2) + '% of portfolio');
  advSetText('client-kpi-review', advDate(c.nextReview));
  var reviewNote = document.getElementById('client-kpi-review-note');
  if (reviewNote) reviewNote.innerHTML = advDueTag(c.nextReview, 'Overdue');
  advSetText('client-kpi-kyc', k.label);
  var kycNote = document.getElementById('client-kpi-kyc-note');
  if (kycNote) kycNote.innerHTML = c.kyc.doc + ' · ' + (k.rank === 0 ? 'expired ' : 'expires ') + advDate(c.kyc.expiry);

  var row = function (label, html) {
    return '<div class="det-field-row"><div class="det-field-label">' + label + '</div><div class="det-field-val">' + html + '</div></div>';
  };

  var profile = document.getElementById('client-profile-fields');
  if (profile) profile.innerHTML =
    row('Client reference', c.ref) +
    row('Tier', advTier(c.tier)) +
    row('Account type', c.role) +
    row('Email', '<a href="mailto:' + c.email + '">' + c.email + '</a>') +
    row('Mobile', c.phone) +
    row('Location', c.city) +
    row('Last activity', advDate(c.lastActivity) + ' · ' + c.lastActivityNote);

  var compliance = document.getElementById('client-compliance-fields');
  if (compliance) compliance.innerHTML =
    row('KYC status', advTag(k.label, k.tone)) +
    row('ID document', c.kyc.doc) +
    row('Document expiry', advDate(c.kyc.expiry)) +
    row('Last review', advDate(c.lastReview)) +
    row('Next review', advDate(c.nextReview) + ' ' + advDueTag(c.nextReview, 'Overdue'));

  var notes = document.getElementById('client-notes');
  if (notes) {
    var list = adviserNotes[c.slug] || [];
    notes.innerHTML = list.length ? list.map(function (n) {
      return '<div class="activity-item">' +
        '<div class="activity-icon is-div" aria-hidden="true"><svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div>' +
        '<div class="activity-body"><div class="activity-title">' + n.title + '</div><div class="activity-sub">' + n.sub + '</div></div>' +
        '<div class="activity-figures"><div class="activity-time">' + advDate(n.date) + '</div></div></div>';
    }).join('') : '<div class="empty-state">' +
      '<svg aria-hidden="true" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' +
      '<div>No notes yet</div><div class="empty-state-sub">Notes from calls, meetings and reviews will appear here.</div></div>';
  }
}


document.addEventListener('DOMContentLoaded', function () {
  buildAdviserDashboard();
  buildClientBook();
  buildClientProfile();
});
