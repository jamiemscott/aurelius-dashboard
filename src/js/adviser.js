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
  var bookBtn = document.getElementById('client-book-review');
  if (bookBtn) bookBtn.href = '/adviser-dashboard/' + ADVISER.slug + '/reviews/#review-' + c.slug;
  var msgLink = document.getElementById('client-message');
  if (msgLink) msgLink.href = '/adviser-dashboard/' + ADVISER.slug + '/messages/#' + c.slug;
  var kycLink = document.getElementById('client-kyc-link');
  if (kycLink) kycLink.href = '/adviser-dashboard/' + ADVISER.slug + '/compliance/kyc/#' + c.slug;

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
    row('Next review', advDate(c.nextReview) + ' ' + advDueTag(c.nextReview, 'Overdue')) +
    advLatestReportRow(c, row);

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


/* ── Advice Requests ────────────────────────────────────────── */

var REQUEST_STATUS = {
  new:      { label: 'New',             tone: 'gold' },
  open:     { label: 'Needs reply',     tone: 'warning' },
  awaiting: { label: 'Awaiting client', tone: '' },
  closed:   { label: 'Closed',          tone: 'success' },
};

var requestFilters = {
  reply:    { label: 'Needs reply',     test: function (r) { return r.status === 'new' || r.status === 'open'; } },
  awaiting: { label: 'Awaiting client', test: function (r) { return r.status === 'awaiting'; } },
  closed:   { label: 'Closed',          test: function (r) { return r.status === 'closed'; } },
  all:      { label: 'All requests',    test: function () { return true; } },
};

var requestState = { filter: 'reply', query: '', openId: null };

var REQUEST_ICONS = {
  tax:        '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
  retirement: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  investment: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
  isa:        '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  fees:       '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  complaint:  '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
};

function advClient(slug) {
  return adviserClients.find(function (c) { return c.slug === slug; });
}

function advInitials(name) {
  return name.replace(/^Lt\.\s*/, '').split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
}

/* "Today, 9:12 am" / "Yesterday, 4:40 pm" / "9 Nov" */
function advWhen(isoDateTime, withTime) {
  var date = isoDateTime.slice(0, 10);
  var days = advDaysUntil(date);
  var t = new Date(isoDateTime + ':00Z');
  var time = t.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC' }).replace(' ', ' ');
  if (days === 0)  return 'Today, ' + time;
  if (days === -1) return 'Yesterday, ' + time;
  var d = t.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
  return withTime ? d + ', ' + time : d;
}

function advRequestCounts() {
  var counts = {};
  Object.keys(requestFilters).forEach(function (k) {
    counts[k] = adviceRequests.filter(requestFilters[k].test).length;
  });
  return counts;
}

function buildAdviceRequests() {
  var list = document.getElementById('request-list');
  if (!list) return;

  var tabs   = document.getElementById('request-tabs');
  var search = document.getElementById('request-search');

  function renderList() {
    var counts = advRequestCounts();
    Object.keys(counts).forEach(function (k) { advSetText('request-count-' + k, String(counts[k])); });
    advSetText('request-summary', counts.reply + ' need' + (counts.reply === 1 ? 's' : '') + ' a reply · ' + counts.awaiting + ' awaiting client');

    var q = requestState.query.trim().toLowerCase();
    var rows = adviceRequests
      .filter(requestFilters[requestState.filter].test)
      .filter(function (r) {
        if (!q) return true;
        var c = advClient(r.client);
        return (c.name + ' ' + r.subject + ' ' + r.id + ' ' + REQUEST_TYPES[r.type].label).toLowerCase().indexOf(q) !== -1;
      })
      .sort(function (a, b) { return b.received.localeCompare(a.received); });

    var heading = '<div class="doc-group-hd"><span class="doc-group-label">' + requestFilters[requestState.filter].label + '</span>' +
      '<span class="doc-group-count">' + rows.length + ' request' + (rows.length === 1 ? '' : 's') + '</span></div>';

    if (!rows.length) {
      list.innerHTML = '<div class="doc-group">' + heading + '<div class="card empty-state">' +
        '<svg aria-hidden="true" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
        '<div>' + (q ? 'No requests match' : 'Nothing here') + '</div>' +
        '<div class="empty-state-sub">' + (q ? 'Try a client name, subject or reference.' : 'You’re all caught up.') + '</div></div></div>';
      return;
    }

    list.innerHTML = '<div class="doc-group">' + heading + '<div class="card">' + rows.map(function (r) {
      var c = advClient(r.client);
      var type = REQUEST_TYPES[r.type];
      var st = REQUEST_STATUS[r.status];
      var isNew = r.status === 'new';
      return '<button class="doc-entry' + (isNew ? ' is-unread' : '') + '" type="button" popovertarget="request-drawer" data-request="' + r.id + '">' +
        '<span class="doc-entry-dot' + (isNew ? ' is-on' : '') + '"></span>' +
        '<span class="doc-entry-icon" style="--doc-cat-color:' + type.color + ';--doc-cat-bg:' + type.bg + '" aria-hidden="true">' +
          '<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">' + REQUEST_ICONS[r.type] + '</svg></span>' +
        '<span class="doc-entry-body">' +
          '<span class="doc-entry-name">' + c.name + ' — ' + r.subject + (isNew ? ' <span class="doc-new-tag">NEW</span>' : '') + '</span>' +
          '<span class="doc-entry-meta">' +
            '<span class="doc-cat-chip" style="--doc-cat-color:' + type.color + '">' + type.label + '</span>' +
            (r.amount ? '<span class="doc-meta-dot">·</span><span class="doc-account-chip">' + advMoney(r.amount, 0) + '</span>' : '') +
            '<span class="doc-meta-dot">·</span><span>' + r.id + '</span>' +
          '</span>' +
        '</span>' +
        '<span class="doc-entry-date">' + advWhen(r.received) + '</span>' +
        advTag(st.label, st.tone) +
      '</button>';
    }).join('') + '</div></div>';
  }

  if (tabs) tabs.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-filter]');
    if (!btn) return;
    requestState.filter = btn.dataset.filter;
    tabs.querySelectorAll('[data-filter]').forEach(function (b) {
      var on = b === btn;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    renderList();
  });

  if (search) search.addEventListener('input', function () { requestState.query = search.value; renderList(); });

  /* Fill the drawer before the popover opens (the click runs
     ahead of popovertarget's default action).                 */
  list.addEventListener('click', function (e) {
    var row = e.target.closest('[data-request]');
    if (!row) return;
    var r = adviceRequests.find(function (x) { return x.id === row.dataset.request; });
    if (r.status === 'new') r.status = 'open';
    requestState.openId = r.id;
    renderRequestDrawer();
  });

  var drawer = document.getElementById('request-drawer');
  if (drawer) drawer.addEventListener('toggle', function (e) {
    if (e.newState === 'closed') renderList();      /* status may have changed */
    else {
      var thread = document.getElementById('request-thread');
      if (thread) thread.scrollTop = thread.scrollHeight;
    }
  });

  /* Deep link: /advice-requests/#AR-2611-0412 opens that request */
  var hashId = window.location.hash.slice(1);
  renderList();
  if (hashId && drawer && adviceRequests.some(function (r) { return r.id === hashId; })) {
    var target = list.querySelector('[data-request="' + hashId + '"]');
    if (!target) {
      requestState.filter = 'all';
      tabs && tabs.querySelector('[data-filter="all"]').click();
      target = list.querySelector('[data-request="' + hashId + '"]');
    }
    if (target) target.click();
    if (target && drawer.showPopover && !drawer.matches(':popover-open')) drawer.showPopover();
  }
}

/* A conversation as chat bubbles (adviser.css): the client on the
   left, the adviser on the right, sender name on the first of a run */
function advThreadHtml(thread, c) {
  var prev = null;
  return thread.map(function (m) {
    var mine = m.from === 'adviser';
    var first = m.from !== prev; prev = m.from;
    var initials = mine ? advInitials(ADVISER.name) : advInitials(c.name);
    /* The adviser speaks for the firm, so gets the Aurelius monogram
       (--bot); the client gets grey initials (--user)              */
    var avatar = '<div class="adv-avatar ' + (mine ? 'adv-avatar--bot' : 'adv-avatar--user') + '" aria-hidden="true">' + initials + '</div>';
    var bubble = '<div class="adv-bubble">' +
      (first ? '<p class="adv-sender">' + (mine ? 'You' : c.name) + '</p>' : '') +
      '<div class="adv-bubble-inner"><p class="adv-text">' + m.text + '</p></div>' +
      '<time class="adv-time" datetime="' + m.at + '">' + advWhen(m.at, true) + '</time></div>';
    return '<div class="adv-msg ' + (mine ? 'adv-msg--user' : 'adv-msg--bot') + '">' + (mine ? bubble + avatar : avatar + bubble) + '</div>';
  }).join('');
}

/* Prototype clock: the "as at" date at the current time of day */
function advNow() {
  var now = new Date();
  return AS_AT + 'T' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
}

function renderRequestDrawer() {
  var r = adviceRequests.find(function (x) { return x.id === requestState.openId; });
  if (!r) return;
  var c = advClient(r.client);
  var type = REQUEST_TYPES[r.type];
  var st = REQUEST_STATUS[r.status];
  var closed = r.status === 'closed';

  advSetText('request-drawer-media', advInitials(c.name));
  advSetText('request-drawer-title', r.subject);
  /* Subtitle carries the request details; the green notice
     below the header stays the secure-message line, as on the
     client's own adviser drawer.                               */
  var sub = document.getElementById('request-drawer-subtitle');
  if (sub) sub.innerHTML = advTag(st.label, st.tone) + ' <a href="' + advClientUrl(c.slug) + '">' + c.name + '</a> · ' +
    type.label + (r.amount ? ' · ' + advMoney(r.amount, 0) : '') + ' · ' + r.id +
    (closed && r.outcome ? ' · ' + r.outcome : '');

  var thread = document.getElementById('request-thread');
  if (thread) {
    thread.innerHTML = advThreadHtml(r.thread, c);
    thread.scrollTop = thread.scrollHeight;
  }

  var composer = document.getElementById('request-composer');
  if (composer) composer.hidden = closed;
  var closeBtn = document.getElementById('request-close');
  if (closeBtn) closeBtn.hidden = closed;
}

function sendRequestReply() {
  var input = document.getElementById('request-reply');
  var r = adviceRequests.find(function (x) { return x.id === requestState.openId; });
  if (!input || !r || !input.value.trim()) return;
  r.thread.push({ from: 'adviser', at: advNow(), text: input.value.trim().replace(/</g, '&lt;') });
  r.status = 'awaiting';
  input.value = '';
  document.getElementById('request-send').disabled = true;
  renderRequestDrawer();
}

function closeRequest() {
  var r = adviceRequests.find(function (x) { return x.id === requestState.openId; });
  if (!r) return;
  r.status = 'closed';
  r.outcome = r.outcome || 'Closed by ' + ADVISER.name.split(' ')[0];
  renderRequestDrawer();
}

function initRequestComposer() {
  var input = document.getElementById('request-reply');
  var send  = document.getElementById('request-send');
  if (!input || !send) return;
  input.addEventListener('input', function () { send.disabled = !input.value.trim(); });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); sendRequestReply(); }
  });
  send.addEventListener('click', sendRequestReply);
  var closeBtn = document.getElementById('request-close');
  if (closeBtn) closeBtn.addEventListener('click', closeRequest);
}

/* Dashboard card: the requests that need a reply */
function buildDashboardRequests() {
  var el = document.getElementById('adv-requests');
  if (!el) return;
  var rows = adviceRequests.filter(requestFilters.reply.test)
    .sort(function (a, b) { return b.received.localeCompare(a.received); });
  advSetText('adv-requests-sub', rows.length + ' awaiting your response');
  el.innerHTML = rows.length ? rows.map(function (r) {
    var c = advClient(r.client);
    return '<div class="activity-item">' +
      '<div class="activity-icon is-div" aria-hidden="true"><svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>' +
      '<div class="activity-body"><div class="activity-title"><a href="/adviser-dashboard/' + ADVISER.slug + '/advice-requests/#' + r.id + '">' + c.name + '</a></div>' +
      '<div class="activity-sub">' + r.subject + ' · ' + REQUEST_TYPES[r.type].label + '</div></div>' +
      '<div class="activity-figures">' + (r.amount ? '<div class="activity-amount">' + advMoney(r.amount, 0) + '</div>' : '') +
      '<div class="activity-time">' + advWhen(r.received) + '</div></div></div>';
  }).join('') : '<div class="empty-state"><div>No requests need a reply</div><div class="empty-state-sub">You’re all caught up.</div></div>';
}


/* ── Reviews & Meetings ─────────────────────────────────────── */

var DIARY_ICONS = {
  review:  '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  'Phone':      '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  'Video call': '<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>',
  meeting:      '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
};

var DIARY_KINDS = {
  review:  { label: 'Review',        color: '#F5A623', bg: 'rgba(245,166,35,0.12)' },
  meeting: { label: 'Meeting',       color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
};

/* extra: clients not yet due whose review was asked for by deep link
   (Client 360 "Book Review"), so it can be booked early            */
var diaryState = { filter: 'upcoming', openId: null, extra: [] };

/* One list of everything in the diary. Reviews are derived from
   client data plus any booking; meetings come straight through.  */
function advDiary() {
  var items = [];
  adviserClients.forEach(function (c) {
    var b = reviewBookings[c.slug];
    if (!advReviewDue(c) && !b && diaryState.extra.indexOf(c.slug) === -1) return;
    items.push({
      id: 'review-' + c.slug, kind: 'review', client: c.slug, title: 'Annual review',
      due: c.nextReview, at: b ? b.at : null, where: b ? b.where : null,
      booking: b || null, done: !!(b && b.stage >= REVIEW_STAGES.length),
    });
  });
  adviserMeetings.forEach(function (m) {
    items.push({ id: m.id, kind: 'meeting', client: m.client, title: m.title, at: m.at, where: m.where, agenda: m.agenda, meeting: m, done: !!m.held });
  });
  return items;
}

function advDiaryWhen(item) {
  if (!item.at) return 'Due ' + advDate(item.due);
  var t = new Date(item.at + ':00Z');
  return t.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }) + ', ' +
    t.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC' }).replace(' ', ' ');
}

function advDiaryStatus(item) {
  if (item.kind === 'meeting') return item.done ? { label: 'Held', tone: 'success' } : { label: 'Booked', tone: '' };
  if (item.done) return { label: 'Complete', tone: 'success' };
  if (!item.booking) return advDaysUntil(item.due) < 0 ? { label: 'Overdue · not booked', tone: 'error' } : { label: 'Not booked', tone: 'warning' };
  var stage = REVIEW_STAGES[item.booking.stage];
  return { label: stage.status, tone: item.booking.stage >= 2 ? 'warning' : '' };
}

/* Monday of the week an ISO date falls in, as ISO */
function advWeekStart(iso) {
  var d = new Date(iso.slice(0, 10) + 'T00:00:00Z');
  var dow = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dow);
  return d.toISOString().slice(0, 10);
}

function advWeekLabel(weekIso) {
  var thisWeek = advWeekStart(AS_AT);
  var diff = Math.round((Date.parse(weekIso) - Date.parse(thisWeek)) / (7 * 864e5));
  var start = new Date(weekIso + 'T00:00:00Z');
  var end = new Date(start); end.setUTCDate(end.getUTCDate() + 6);
  var fmt = function (d) { return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }); };
  var range = fmt(start) + ' – ' + fmt(end);
  if (diff === 0)  return 'This week · ' + range;
  if (diff === 1)  return 'Next week · ' + range;
  if (diff === -1) return 'Last week · ' + range;
  return 'Week of ' + fmt(start);
}

var diaryFilters = {
  upcoming:  { test: function (i) { return !i.done; } },
  reviews:   { test: function (i) { return i.kind === 'review' && !i.done; } },
  completed: { test: function (i) { return i.done; } },
};

function buildReviewsPage() {
  var list = document.getElementById('diary-list');
  if (!list) return;
  var tabs = document.getElementById('diary-tabs');

  function row(item) {
    var c = advClient(item.client);
    var kind = DIARY_KINDS[item.kind];
    var st = advDiaryStatus(item);
    var icon = item.kind === 'review' ? DIARY_ICONS.review : (DIARY_ICONS[item.where] || DIARY_ICONS.meeting);
    return '<button class="doc-entry" type="button" popovertarget="diary-drawer" data-item="' + item.id + '">' +
      '<span class="doc-entry-icon" style="--doc-cat-color:' + kind.color + ';--doc-cat-bg:' + kind.bg + '" aria-hidden="true">' +
        '<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">' + icon + '</svg></span>' +
      '<span class="doc-entry-body">' +
        '<span class="doc-entry-name">' + c.name + ' — ' + item.title + '</span>' +
        '<span class="doc-entry-meta">' +
          '<span class="doc-cat-chip" style="--doc-cat-color:' + kind.color + '">' + kind.label + '</span>' +
          (item.where ? '<span class="doc-meta-dot">·</span><span>' + item.where + '</span>' : '') +
          (item.kind === 'review' && item.at && !item.done ?'<span class="doc-meta-dot">·</span><span>Due ' + advDate(item.due) + '</span>' : '') +
        '</span>' +
      '</span>' +
      '<span class="doc-entry-date">' + advDiaryWhen(item) + '</span>' +
      advTag(st.label, st.tone) +
    '</button>';
  }

  function group(label, items) {
    return '<div class="doc-group"><div class="doc-group-hd"><span class="doc-group-label">' + label + '</span>' +
      '<span class="doc-group-count">' + items.length + '</span></div>' +
      '<div class="card">' + items.map(row).join('') + '</div></div>';
  }

  function render() {
    var all = advDiary();
    Object.keys(diaryFilters).forEach(function (k) {
      advSetText('diary-count-' + k, String(all.filter(diaryFilters[k].test).length));
    });
    var unbooked = all.filter(function (i) { return i.kind === 'review' && !i.booking; });
    var overdue = unbooked.filter(function (i) { return advDaysUntil(i.due) < 0; }).length;
    var thisWeek = all.filter(function (i) { return i.at && !i.done && advWeekStart(i.at) === advWeekStart(AS_AT); }).length;
    advSetText('diary-summary', thisWeek + ' this week · ' + unbooked.length + ' review' + (unbooked.length === 1 ? '' : 's') + ' to book' + (overdue ? ' (' + overdue + ' overdue)' : ''));

    var items = all.filter(diaryFilters[diaryState.filter].test);
    if (!items.length) {
      list.innerHTML = '<div class="card empty-state">' +
        '<svg aria-hidden="true" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">' + DIARY_ICONS.review + '</svg>' +
        '<div>Nothing here</div><div class="empty-state-sub">Booked reviews and meetings will appear here.</div></div>';
      return;
    }

    var html = '';
    if (diaryState.filter === 'completed') {
      items.sort(function (a, b) { return (b.at || b.due).localeCompare(a.at || a.due); });
      html = group('Completed', items);
    } else {
      /* Unbooked reviews first: they need action before they can sit in a week */
      var toBook = items.filter(function (i) { return !i.at; }).sort(function (a, b) { return a.due.localeCompare(b.due); });
      if (toBook.length) html += group('To book', toBook);
      var weeks = {};
      items.filter(function (i) { return i.at; })
        .sort(function (a, b) { return a.at.localeCompare(b.at); })
        .forEach(function (i) { var w = advWeekStart(i.at); (weeks[w] = weeks[w] || []).push(i); });
      Object.keys(weeks).sort().forEach(function (w) { html += group(advWeekLabel(w), weeks[w]); });
    }
    list.innerHTML = html;
  }

  if (tabs) tabs.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-filter]');
    if (!btn) return;
    diaryState.filter = btn.dataset.filter;
    tabs.querySelectorAll('[data-filter]').forEach(function (b) {
      var on = b === btn;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    render();
  });

  list.addEventListener('click', function (e) {
    var row = e.target.closest('[data-item]');
    if (!row) return;
    diaryState.openId = row.dataset.item;
    renderDiaryDrawer();
  });

  var drawer = document.getElementById('diary-drawer');
  if (drawer) {
    drawer.addEventListener('toggle', function (e) { if (e.newState === 'closed') render(); });
    drawer.addEventListener('change', function (e) {
      if (!e.target.matches('[data-check]')) return;
      var item = advDiary().find(function (i) { return i.id === diaryState.openId; });
      var b = item && item.booking;
      if (!b) return;
      var n = Number(e.target.dataset.check);
      b.done = b.done.filter(function (x) { return x !== n; });
      if (e.target.checked) b.done.push(n);
      advSyncAdvance(b);
    });
    drawer.addEventListener('click', function (e) {
      var act = e.target.closest('[data-action]');
      if (!act) return;
      var item = advDiary().find(function (i) { return i.id === diaryState.openId; });
      if (!item) return;
      if (act.dataset.action === 'book')    advBookReview(item);
      if (act.dataset.action === 'advance') { item.booking.stage += 1; item.booking.done = []; }
      if (act.dataset.action === 'held')    item.meeting.held = true;
      renderDiaryDrawer();
    });
  }

  /* Deep link: /reviews/#review-basil-fawlty or #MT-2611-031 */
  var hashId = window.location.hash.slice(1);
  var hashSlug = hashId.indexOf('review-') === 0 ? hashId.slice(7) : '';
  if (hashSlug && advClient(hashSlug)) diaryState.extra.push(hashSlug);
  render();
  if (hashId && drawer && advDiary().some(function (i) { return i.id === hashId; })) {
    var target = list.querySelector('[data-item="' + hashId + '"]');
    if (!target && tabs) { tabs.querySelector('[data-filter="completed"]').click(); target = list.querySelector('[data-item="' + hashId + '"]'); }
    if (target) { diaryState.openId = hashId; renderDiaryDrawer(); drawer.showPopover(); }
  }
}

function advSyncAdvance(b) {
  var btn = document.querySelector('#diary-drawer [data-action="advance"]');
  if (btn) btn.disabled = b.done.length < REVIEW_STAGES[b.stage].checks.length;
}

function advBookReview(item) {
  var date = document.getElementById('book-date').value;
  var time = document.getElementById('book-time').value;
  var where = document.getElementById('book-where').value;
  if (!date) { document.getElementById('book-date').focus(); return; }
  reviewBookings[item.client] = { at: date + 'T' + time, where: where, stage: 0, done: [] };
}

function renderDiaryDrawer() {
  var item = advDiary().find(function (i) { return i.id === diaryState.openId; });
  if (!item) return;
  var c = advClient(item.client);
  var st = advDiaryStatus(item);
  var reviewRow = function (label, value) {
    return '<div class="review-row"><span class="review-row-label">' + label + '</span><span class="review-row-value">' + value + '</span></div>';
  };

  advSetText('diary-drawer-media', advInitials(c.name));
  advSetText('diary-drawer-title', item.title);
  var sub = document.getElementById('diary-drawer-subtitle');
  if (sub) sub.innerHTML = advTag(st.label, st.tone) + ' <a href="' + advClientUrl(c.slug) + '">' + c.name + '</a> · ' + c.ref + ' · ' + c.tier;

  var body = document.getElementById('diary-drawer-body');
  var foot = document.getElementById('diary-drawer-footer');
  var html = '', footer = '';

  if (item.kind === 'review') {
    var b = item.booking;
    var stage = b ? b.stage : -1;
    /* Progress shows once booked and until complete: one step is always active */
    if (b && !item.done) html += '<div class="steps" role="list" aria-label="Review progress">' + REVIEW_STAGES.map(function (s, n) {
      var cls = n < stage ? ' is-complete' : n === stage ? ' is-active' : '';
      var num = n < stage ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : (n + 1);
      return (n ? '<div class="step-connector' + (n <= stage ? ' is-complete' : '') + '" aria-hidden="true"></div>' : '') +
        '<div class="step' + cls + '" role="listitem"' + (n === stage ? ' aria-current="step"' : '') + '>' +
        '<div class="step-num" aria-hidden="true">' + num + '</div><span class="step-label">' + s.label + '</span></div>';
    }).join('') + '</div>';

    html += '<div class="review-card">' +
      reviewRow('Review due', advDate(item.due) + ' ' + advDueTag(item.due, 'Overdue')) +
      reviewRow('Booked for', item.at ? advDiaryWhen(item) : 'Not booked') +
      (item.where ? reviewRow('Location', item.where) : '') +
      reviewRow('Last review', advDate(c.lastReview)) +
      reviewRow('Portfolio', advMoney(c.value, 0)) +
      '</div>';

    if (!b) {
      var suggested = advDaysUntil(item.due) < 0 ? '2026-11-18' : item.due;
      html += '<h3 class="section-heading">Book the review</h3>' +
        '<div class="drawer-fields">' +
          '<div class="field-row">' +
            '<div class="field"><label class="field-label" for="book-date">Date</label><input class="det-input" type="date" id="book-date" min="' + AS_AT + '" value="' + suggested + '"></div>' +
            '<div class="field"><label class="field-label" for="book-time">Time</label><select class="det-select" id="book-time">' +
              ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'].map(function (t) { return '<option' + (t === '10:00' ? ' selected' : '') + '>' + t + '</option>'; }).join('') +
            '</select></div>' +
          '</div>' +
          '<div class="field"><label class="field-label" for="book-where">Location</label><select class="det-select" id="book-where">' +
            MEETING_PLACES.map(function (p) { return '<option>' + p + '</option>'; }).join('') + '</select></div>' +
        '</div>';
      footer = '<button class="btn-primary" type="button" data-action="book">Book review</button>';
    } else if (!item.done) {
      var s = REVIEW_STAGES[b.stage];
      var next = REVIEW_STAGES[b.stage + 1];
      html += '<h3 class="section-heading">' + s.label + ' checklist</h3><div>' + s.checks.map(function (label, n) {
        return '<label class="form-checkbox-row"><input type="checkbox" data-check="' + n + '"' + (b.done.indexOf(n) !== -1 ? ' checked' : '') + '>' +
          '<span class="form-checkbox-text">' + label + '</span></label>';
      }).join('') + '</div>';
      footer = '<button class="btn-primary" type="button" data-action="advance"' + (b.done.length < s.checks.length ? ' disabled' : '') + '>' +
        (next ? 'Move to ' + next.label : 'Complete review') + '</button>';
    } else {
      html += '<div class="empty-state">' +
        '<svg aria-hidden="true" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>' +
        '<div>Review complete</div><div class="empty-state-sub">Next review due ' + advDate(c.nextReview) + '.</div></div>';
    }
  } else {
    html += '<div class="review-card">' +
      reviewRow('When', advDiaryWhen(item)) +
      reviewRow('Where', item.where) +
      reviewRow('Reference', item.id) +
      '</div>' +
      '<h3 class="section-heading">Agenda</h3><p class="det-section-sub">' + item.agenda + '</p>';
    if (!item.done) footer = '<button class="btn-primary" type="button" data-action="held">Mark as held</button>';
  }

  if (body) body.innerHTML = html;
  if (foot) { foot.innerHTML = footer; foot.hidden = !footer; }
}


/* ── KYC & AML ──────────────────────────────────────────────── */

/* Next screening date: last screening plus the risk rating's cycle */
function advScreenDue(slug) {
  var a = adviserAml[slug];
  var d = new Date(a.screened + 'T00:00:00Z');
  d.setUTCMonth(d.getUTCMonth() + AML_RISK[a.risk].months);
  return d.toISOString().slice(0, 10);
}

function advRiskTag(a) {
  return advTag(a.risk, AML_RISK[a.risk].tone) + (a.pep ? ' ' + advTag('PEP', 'gold') : '');
}

function advKycAction(c) { return advKycDue(c) || advDaysUntil(advScreenDue(c.slug)) <= SOON; }

/* Check history, newest first, derived from the profile dates, so
   running a screening or verifying new ID updates it too           */
function advKycHistory(c) {
  var a = adviserAml[c.slug];
  return ([
    { date: a.screened,   text: 'Sanctions, PEP and adverse media screening', sub: a.result, tone: a.result === 'Clear' ? 'buy' : 'div' },
    { date: a.poa.date,   text: 'Proof of address checked', sub: a.poa.doc, tone: 'div' },
    { date: a.idVerified, text: 'Identity verified', sub: c.kyc.doc + ' · expires ' + advDate(c.kyc.expiry), tone: 'div' },
  ]).sort(function (x, y) { return y.date.localeCompare(x.date); });
}

var kycState = { filter: 'action', query: '', sort: 'expiry', dir: 'ascending', openSlug: null };

var kycFilters = {
  action: advKycAction,
  high:   function (c) { return adviserAml[c.slug].risk === 'High'; },
  all:    function () { return true; },
};

var kycSortKeys = {
  name:   function (c) { return c.name.split(' ').pop(); },
  expiry: function (c) { return c.kyc.expiry; },
  kyc:    function (c) { return advKyc(c).rank; },
  risk:   function (c) { return ['High', 'Medium', 'Low'].indexOf(adviserAml[c.slug].risk); },
  screen: function (c) { return advScreenDue(c.slug); },
};

function buildKycPage() {
  var tbody = document.getElementById('kyc-body');
  if (!tbody) return;
  var table  = tbody.closest('table');
  var search = document.getElementById('kyc-search');
  var tabs   = document.getElementById('kyc-tabs');
  var drawer = document.getElementById('kyc-drawer');

  function render() {
    var verified = adviserClients.filter(function (c) { return advKyc(c).rank === 2; }).length;
    var expiring = adviserClients.filter(function (c) { return advKyc(c).rank === 1; }).length;
    var expired  = adviserClients.filter(function (c) { return advKyc(c).rank === 0; }).length;
    var high     = adviserClients.filter(kycFilters.high).length;
    var peps     = adviserClients.filter(function (c) { return adviserAml[c.slug].pep; }).length;
    var screens  = adviserClients.filter(function (c) { return advDaysUntil(advScreenDue(c.slug)) < 0; }).length;
    advSetText('kyc-kpi-verified', verified + ' / ' + adviserClients.length);
    advSetText('kyc-kpi-expiring', String(expiring));
    advSetText('kyc-kpi-expired', String(expired));
    advSetText('kyc-kpi-high', String(high));
    advSetText('kyc-kpi-high-note', peps + ' PEP');
    advSetText('kyc-kpi-screen', screens + ' screening' + (screens === 1 ? '' : 's') + ' overdue');
    Object.keys(kycFilters).forEach(function (k) {
      advSetText('kyc-count-' + k, String(adviserClients.filter(kycFilters[k]).length));
    });

    var q = kycState.query.trim().toLowerCase();
    var rows = adviserClients.filter(kycFilters[kycState.filter])
      .filter(function (c) { return !q || (c.name + ' ' + c.ref).toLowerCase().indexOf(q) !== -1; });
    var key = kycSortKeys[kycState.sort];
    var dir = kycState.dir === 'ascending' ? 1 : -1;
    rows.sort(function (a, b) { var x = key(a), y = key(b); return (x > y ? 1 : x < y ? -1 : 0) * dir; });

    advSetText('kyc-summary', expired + ' expired · ' + expiring + ' expiring in ' + KYC_WINDOW + ' days · ' + screens + ' screening' + (screens === 1 ? '' : 's') + ' overdue');

    tbody.innerHTML = rows.length ? rows.map(function (c) {
      var a = adviserAml[c.slug];
      var k = advKyc(c);
      var due = advScreenDue(c.slug);
      var screenSoon = advDaysUntil(due) <= SOON;
      return '<tr>' + advNameCell(c) +
        '<td>' + c.kyc.doc + '<div class="td-type">Expires <time datetime="' + c.kyc.expiry + '">' + advDate(c.kyc.expiry) + '</time></div></td>' +
        '<td>' + advTag(k.label, k.tone) + '</td>' +
        '<td>' + advRiskTag(a) + '</td>' +
        '<td><time datetime="' + due + '">' + advDate(due) + '</time>' +
          (screenSoon ? '<div class="td-type">' + advDueTag(due, 'Overdue') + '</div>' : '<div class="td-type">Last ' + advDate(a.screened) + '</div>') + '</td>' +
        '<td><button class="btn-secondary btn-secondary--sm" type="button" popovertarget="kyc-drawer" data-kyc="' + c.slug + '" aria-label="Open KYC for ' + c.name + '">Open</button></td>' +
        '</tr>';
    }).join('') : advEmptyRow(6, 'Nothing needs action', 'Every client’s ID and screening is in date.');

    table.querySelectorAll('th[data-sort]').forEach(function (th) {
      if (th.dataset.sort === kycState.sort) th.setAttribute('aria-sort', kycState.dir);
      else th.removeAttribute('aria-sort');
    });
  }

  if (search) search.addEventListener('input', function () { kycState.query = search.value; render(); });

  if (tabs) tabs.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-filter]');
    if (!btn) return;
    kycState.filter = btn.dataset.filter;
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
      if (kycState.sort === key) kycState.dir = kycState.dir === 'ascending' ? 'descending' : 'ascending';
      else { kycState.sort = key; kycState.dir = 'ascending'; }
      render();
    });
  });

  tbody.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-kyc]');
    if (!btn) return;
    kycState.openSlug = btn.dataset.kyc;
    renderKycDrawer();
  });

  if (drawer) {
    drawer.addEventListener('toggle', function (e) { if (e.newState === 'closed') render(); });
    drawer.addEventListener('input', advSyncVerify);
    drawer.addEventListener('change', advSyncVerify);
    drawer.addEventListener('click', function (e) {
      var act = e.target.closest('[data-action]');
      if (!act) return;
      var c = advClient(kycState.openSlug);
      var a = adviserAml[c.slug];
      if (act.dataset.action === 'screen') {
        /* The history row for screening is derived from these two */
        a.screened = AS_AT; a.result = 'Clear';
      }
      if (act.dataset.action === 'verify') {
        c.kyc = { doc: document.getElementById('kyc-doc').value, expiry: document.getElementById('kyc-expiry').value };
        a.idVerified = AS_AT;
      }
      renderKycDrawer();
    });
  }

  render();

  /* Deep link: /compliance/kyc/#jessica-fletcher */
  var hashSlug = window.location.hash.slice(1);
  if (hashSlug && drawer && advClient(hashSlug)) {
    kycState.openSlug = hashSlug;
    renderKycDrawer();
    drawer.showPopover();
  }
}

/* Verify stays disabled until a file is chosen and the new expiry is in the future */
function advSyncVerify() {
  var btn = document.querySelector('#kyc-drawer [data-action="verify"]');
  var file = document.getElementById('kyc-file');
  var exp = document.getElementById('kyc-expiry');
  if (!btn || !file || !exp) return;
  var name = document.getElementById('kyc-file-name');
  if (name) name.textContent = file.files[0] ? file.files[0].name : 'Choose file or drag & drop';
  btn.disabled = !(file.files.length && exp.value > AS_AT);
}

function renderKycDrawer() {
  var c = advClient(kycState.openSlug);
  if (!c) return;
  var a = adviserAml[c.slug];
  var k = advKyc(c);
  var due = advScreenDue(c.slug);
  var row = function (label, value) {
    return '<div class="review-row"><span class="review-row-label">' + label + '</span><span class="review-row-value">' + value + '</span></div>';
  };

  advSetText('kyc-drawer-media', advInitials(c.name));
  advSetText('kyc-drawer-title', c.name);
  var sub = document.getElementById('kyc-drawer-subtitle');
  if (sub) sub.innerHTML = advTag(k.label, k.tone) + ' <a href="' + advClientUrl(c.slug) + '">' + c.ref + '</a> · ' + c.tier + ' · ' + c.role;

  var html = '';
  if (!advKycAction(c)) {
    html += '<div class="det-kyc-status"><div class="det-kyc-icon" aria-hidden="true">' +
      '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></div>' +
      '<div><div class="det-kyc-label">Identity verified</div><div class="det-kyc-sub">Next screening ' + advDate(due) + '</div></div></div>';
  }

  html += '<div class="review-card">' +
    row('ID document', c.kyc.doc) +
    row('Document expiry', advDate(c.kyc.expiry) + (advKycDue(c) ? ' ' + advDueTag(c.kyc.expiry, 'Expired') : '')) +
    row('Proof of address', a.poa.doc + ' · ' + advDate(a.poa.date)) +
    row('AML risk', advRiskTag(a)) +
    (a.pep ? row('PEP', a.pepNote) : '') +
    row('Source of wealth', a.sow) +
    row('Last screening', advDate(a.screened) + ' · ' + a.result) +
    row('Next screening', advDate(due) + (advDaysUntil(due) <= SOON ? ' ' + advDueTag(due, 'Overdue') : '')) +
    '</div>';

  var footer = '<button class="btn-secondary" type="button" data-action="screen">Run screening</button>';

  if (advKycDue(c)) {
    var min = new Date(Date.parse(AS_AT) + 864e5).toISOString().slice(0, 10);
    html += '<h3 class="section-heading">Upload new ID</h3>' +
      '<div class="drawer-fields">' +
        '<div class="field-row">' +
          '<div class="field"><label class="field-label" for="kyc-doc">Document type</label><select class="det-select" id="kyc-doc">' +
            ID_DOCUMENTS.map(function (d) { return '<option' + (d === c.kyc.doc ? ' selected' : '') + '>' + d + '</option>'; }).join('') + '</select></div>' +
          '<div class="field"><label class="field-label" for="kyc-expiry">New expiry date</label><input class="det-input" type="date" id="kyc-expiry" min="' + min + '"></div>' +
        '</div>' +
        '<div class="field"><span class="field-label" id="kyc-file-label">Scan or photo</span>' +
          '<label for="kyc-file" class="file-upload">' +
            '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>' +
            '<span id="kyc-file-name">Choose file or drag &amp; drop</span></label>' +
          '<input id="kyc-file" type="file" accept=".pdf,.jpg,.jpeg,.png" class="file-upload-input" aria-labelledby="kyc-file-label">' +
        '</div>' +
      '</div>';
    footer += '<button class="btn-primary" type="button" data-action="verify" disabled>Verify document</button>';
  }

  html += '<h3 class="section-heading">Check history</h3><div>' + advKycHistory(c).map(function (h) {
    return '<div class="activity-item">' +
      '<div class="activity-icon is-' + h.tone + '" aria-hidden="true"><svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>' +
      '<div class="activity-body"><div class="activity-title">' + h.text + '</div><div class="activity-sub">' + h.sub + '</div></div>' +
      '<div class="activity-figures"><div class="activity-time">' + advDate(h.date) + '</div></div></div>';
  }).join('') + '</div>';

  document.getElementById('kyc-drawer-body').innerHTML = html;
  document.getElementById('kyc-drawer-footer').innerHTML = footer;
}


/* ── Secure Messages ────────────────────────────────────────── */

var msgState = { filter: 'reply', query: '', openSlug: null };

function advLast(conv) { return conv.thread[conv.thread.length - 1]; }

var msgFilters = {
  reply:    function (v) { return v.thread.length && advLast(v).from === 'client'; },
  awaiting: function (v) { return v.thread.length && advLast(v).from === 'adviser'; },
  all:      function () { return true; },
};

function buildMessagesPage() {
  var list = document.getElementById('msg-list');
  if (!list) return;
  var tabs   = document.getElementById('msg-tabs');
  var search = document.getElementById('msg-search');
  var pane   = document.getElementById('msg-pane');
  var input  = document.getElementById('msg-reply');
  var send   = document.getElementById('msg-send');

  function conv(slug) { return adviserConversations.find(function (v) { return v.client === slug; }); }

  function renderList() {
    Object.keys(msgFilters).forEach(function (k) {
      advSetText('msg-count-' + k, String(adviserConversations.filter(msgFilters[k]).length));
    });
    var unread = adviserConversations.filter(function (v) { return v.unread; }).length;
    var reply = adviserConversations.filter(msgFilters.reply).length;
    advSetText('msg-summary', unread + ' unread · ' + reply + ' need' + (reply === 1 ? 's' : '') + ' a reply');

    var q = msgState.query.trim().toLowerCase();
    var rows = adviserConversations.filter(msgFilters[msgState.filter]).filter(function (v) {
      var c = advClient(v.client);
      return !q || (c.name + ' ' + c.ref + ' ' + v.subject).toLowerCase().indexOf(q) !== -1;
    }).sort(function (a, b) {
      var x = a.thread.length ? advLast(a).at : AS_AT, y = b.thread.length ? advLast(b).at : AS_AT;
      return y.localeCompare(x);
    });

    list.innerHTML = rows.length ? rows.map(function (v) {
      var c = advClient(v.client);
      var last = v.thread.length ? advLast(v) : null;
      var preview = last ? (last.from === 'adviser' ? 'You: ' : '') + last.text : 'No messages yet';
      return '<button class="doc-entry' + (v.unread ? ' is-unread' : '') + '" type="button" data-msg="' + v.client + '"' +
        (v.client === msgState.openSlug ? ' aria-current="true"' : '') + '>' +
        '<span class="doc-entry-dot' + (v.unread ? ' is-on' : '') + '"></span>' +
        '<span class="doc-entry-body">' +
          '<span class="doc-entry-name">' + c.name + '</span>' +
          '<span class="doc-entry-meta"><span>' + v.subject + '</span></span>' +
          '<span class="doc-entry-meta"><span>' + (preview.length > 70 ? preview.slice(0, 68).trimEnd() + '…' : preview) + '</span></span>' +
        '</span>' +
        '<span class="doc-entry-date">' + (last ? advWhen(last.at) : '') + '</span>' +
      '</button>';
    }).join('') : '<div class="empty-state">' +
      '<svg aria-hidden="true" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>' +
      '<div>No conversations</div><div class="empty-state-sub">Try another tab or search.</div></div>';
  }

  function renderPane() {
    var v = conv(msgState.openSlug);
    if (!v) return;
    var c = advClient(v.client);
    advSetText('msg-avatar', advInitials(c.name));
    advSetText('msg-title', c.name);
    advSetText('msg-sub', v.subject + ' · ' + c.ref + ' · ' + c.tier);
    document.getElementById('msg-client-link').href = advClientUrl(c.slug);
    var thread = document.getElementById('msg-thread');
    thread.innerHTML = v.thread.length ? advThreadHtml(v.thread, c) :
      '<div class="adv-divider" role="separator"><span class="adv-divider-label">New conversation with ' + c.name + '</span></div>';
    thread.scrollTop = thread.scrollHeight;
    input.placeholder = 'Write a secure reply to ' + c.name.split(' ')[0] + '…';
  }

  function open(slug, focusPane) {
    var v = conv(slug);
    if (!v) return;
    msgState.openSlug = slug;
    v.unread = false;
    renderList();
    renderPane();
    /* Stacked below 1200px: bring the thread into view */
    if (focusPane && window.matchMedia('(max-width: 1200px)').matches) pane.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function sendReply() {
    var v = conv(msgState.openSlug);
    if (!v || !input.value.trim()) return;
    v.thread.push({ from: 'adviser', at: advNow(), text: input.value.trim().replace(/</g, '&lt;') });
    input.value = '';
    send.disabled = true;
    renderList();
    renderPane();
  }

  list.addEventListener('click', function (e) {
    var row = e.target.closest('[data-msg]');
    if (row) open(row.dataset.msg, true);
  });
  if (search) search.addEventListener('input', function () { msgState.query = search.value; renderList(); });
  if (tabs) tabs.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-filter]');
    if (!btn) return;
    msgState.filter = btn.dataset.filter;
    tabs.querySelectorAll('[data-filter]').forEach(function (b) {
      var on = b === btn;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    renderList();
  });
  input.addEventListener('input', function () { send.disabled = !input.value.trim(); });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); sendReply(); }
  });
  send.addEventListener('click', sendReply);

  /* Deep link /messages/#<client> (Client 360 "Message"): opens that
     conversation, starting a new one if there isn't one yet       */
  var hashSlug = window.location.hash.slice(1);
  if (hashSlug && advClient(hashSlug)) {
    if (!conv(hashSlug)) adviserConversations.push({ client: hashSlug, subject: 'New message', unread: false, thread: [] });
    if (!msgFilters[msgState.filter](conv(hashSlug))) tabs.querySelector('[data-filter="all"]').click();
    open(hashSlug, false);
  } else {
    renderList();
    var first = list.querySelector('[data-msg]');
    if (first) open(first.dataset.msg, false);
  }
}


/* ── Suitability Reports ────────────────────────────────────── */

var reportState = { filter: 'progress', query: '', openId: null };

var reportFilters = {
  progress: function (r) { return r.stage < 3; },
  signed:   function (r) { return r.stage === 3; },
  all:      function () { return true; },
};

function advReportStatus(r) {
  if (r.stage === 3) return { label: 'Signed', tone: 'success' };
  if (r.stage === 2) {
    var waiting = -advDaysUntil(r.sent);
    return waiting > SIGNATURE_CHASE ? { label: 'Unsigned · ' + waiting + ' days', tone: 'error' } : { label: 'Awaiting signature', tone: 'warning' };
  }
  return { label: REPORT_STAGES[r.stage].status, tone: '' };
}

function advReportSource(r) {
  var base = '/adviser-dashboard/' + ADVISER.slug;
  return r.source.kind === 'request'
    ? '<a href="' + base + '/advice-requests/#' + r.source.ref + '">Advice request ' + r.source.ref + '</a>'
    : '<a href="' + base + '/reviews/#review-' + r.source.ref + '">Annual review</a>';
}

/* Client 360: the client's most recent report, linked */
function advLatestReportRow(c, row) {
  var mine = suitabilityReports.filter(function (r) { return r.client === c.slug; })
    .sort(function (a, b) { return b.updated.localeCompare(a.updated); });
  if (!mine.length) return row('Suitability report', 'None on file');
  var r = mine[0], st = advReportStatus(r);
  return row('Suitability report', '<a href="/adviser-dashboard/' + ADVISER.slug + '/compliance/suitability/#' + r.id + '">' + r.title + '</a> ' + advTag(st.label, st.tone));
}

function buildSuitabilityPage() {
  var list = document.getElementById('report-list');
  if (!list) return;
  var tabs   = document.getElementById('report-tabs');
  var search = document.getElementById('report-search');
  var drawer = document.getElementById('report-drawer');
  var ICON = '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>';

  function row(r) {
    var c = advClient(r.client);
    var st = advReportStatus(r);
    var when = r.stage === 3 ? 'Signed ' + advDate(r.signed) : r.stage === 2 ? 'Sent ' + advDate(r.sent) : 'Updated ' + advDate(r.updated);
    return '<button class="doc-entry" type="button" popovertarget="report-drawer" data-report="' + r.id + '">' +
      '<span class="doc-entry-icon" style="--doc-cat-color:#F5A623;--doc-cat-bg:rgba(245,166,35,0.12)" aria-hidden="true">' +
        '<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">' + ICON + '</svg></span>' +
      '<span class="doc-entry-body">' +
        '<span class="doc-entry-name">' + c.name + ' — ' + r.title + '</span>' +
        '<span class="doc-entry-meta"><span>' + r.id + '</span><span class="doc-meta-dot">·</span><span>' + (r.source.kind === 'request' ? 'Advice request' : 'Annual review') + '</span></span>' +
      '</span>' +
      '<span class="doc-entry-date">' + when + '</span>' +
      advTag(st.label, st.tone) +
    '</button>';
  }

  function render() {
    Object.keys(reportFilters).forEach(function (k) {
      advSetText('report-count-' + k, String(suitabilityReports.filter(reportFilters[k]).length));
    });
    var by = function (n) { return suitabilityReports.filter(function (r) { return r.stage === n; }).length; };
    advSetText('report-summary', by(0) + ' drafting · ' + by(1) + ' with compliance · ' + by(2) + ' awaiting signature');

    var q = reportState.query.trim().toLowerCase();
    var rows = suitabilityReports.filter(reportFilters[reportState.filter]).filter(function (r) {
      return !q || (advClient(r.client).name + ' ' + r.title + ' ' + r.id).toLowerCase().indexOf(q) !== -1;
    });
    if (!rows.length) {
      list.innerHTML = '<div class="card empty-state"><svg aria-hidden="true" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">' + ICON + '</svg>' +
        '<div>No reports</div><div class="empty-state-sub">Try another tab or search.</div></div>';
      return;
    }
    /* One group per stage, in workflow order */
    list.innerHTML = REPORT_STAGES.map(function (s, n) {
      var items = rows.filter(function (r) { return r.stage === n; })
        .sort(function (a, b) { return b.updated.localeCompare(a.updated); });
      if (!items.length) return '';
      return '<div class="doc-group"><div class="doc-group-hd"><span class="doc-group-label">' + s.status + '</span>' +
        '<span class="doc-group-count">' + items.length + '</span></div><div class="card">' + items.map(row).join('') + '</div></div>';
    }).join('');
  }

  if (search) search.addEventListener('input', function () { reportState.query = search.value; render(); });
  if (tabs) tabs.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-filter]');
    if (!btn) return;
    reportState.filter = btn.dataset.filter;
    tabs.querySelectorAll('[data-filter]').forEach(function (b) {
      var on = b === btn;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    render();
  });
  list.addEventListener('click', function (e) {
    var r = e.target.closest('[data-report]');
    if (!r) return;
    reportState.openId = r.dataset.report;
    renderReportDrawer();
  });

  if (drawer) {
    drawer.addEventListener('toggle', function (e) { if (e.newState === 'closed') render(); });
    drawer.addEventListener('input', advSyncReport);
    drawer.addEventListener('change', advSyncReport);
    drawer.addEventListener('click', function (e) {
      var act = e.target.closest('[data-action]');
      if (!act) return;
      var r = suitabilityReports.find(function (x) { return x.id === reportState.openId; });
      if (!r) return;
      if (act.dataset.action === 'submit')  { r.stage = 1; r.submitted = AS_AT; }
      if (act.dataset.action === 'approve') { r.stage = 2; r.sent = AS_AT; }
      if (act.dataset.action === 'remind')  { r.reminded = AS_AT; }
      if (act.dataset.action === 'signed')  { r.stage = 3; r.signed = AS_AT; }
      r.updated = AS_AT;
      renderReportDrawer();
    });
  }

  render();
  var hashId = window.location.hash.slice(1);
  var target = suitabilityReports.find(function (x) { return x.id === hashId; });
  if (target && drawer) {
    if (!reportFilters[reportState.filter](target)) tabs.querySelector('[data-filter="all"]').click();
    reportState.openId = hashId;
    renderReportDrawer();
    drawer.showPopover();
  }
}

/* While drafting: keep the recommendation and ticks on the report, and
   allow "Send to compliance" once there is a recommendation and every
   suitability point is ticked                                        */
function advSyncReport(e) {
  var r = suitabilityReports.find(function (x) { return x.id === reportState.openId; });
  if (!r || r.stage !== 0) return;
  if (e && e.target.matches('[data-check]')) {
    var n = Number(e.target.dataset.check);
    r.done = r.done.filter(function (x) { return x !== n; });
    if (e.target.checked) r.done.push(n);
  }
  var text = document.getElementById('report-recommendation');
  if (text) r.recommendation = text.value;
  var btn = document.querySelector('#report-drawer [data-action="submit"]');
  if (btn) btn.disabled = !(r.recommendation.trim().length >= 20 && r.done.length === SUITABILITY_CHECKS.length);
}

function renderReportDrawer() {
  var r = suitabilityReports.find(function (x) { return x.id === reportState.openId; });
  if (!r) return;
  var c = advClient(r.client);
  var st = advReportStatus(r);
  var row = function (label, value) {
    return '<div class="review-row"><span class="review-row-label">' + label + '</span><span class="review-row-value">' + value + '</span></div>';
  };

  advSetText('report-drawer-media', advInitials(c.name));
  advSetText('report-drawer-title', r.title);
  var sub = document.getElementById('report-drawer-subtitle');
  if (sub) sub.innerHTML = advTag(st.label, st.tone) + ' <a href="' + advClientUrl(c.slug) + '">' + c.name + '</a> · ' + r.id;

  var html = '';
  if (r.stage < 3) {
    html += '<div class="steps" role="list" aria-label="Report progress">' + REPORT_STAGES.map(function (s, n) {
      var cls = n < r.stage ? ' is-complete' : n === r.stage ? ' is-active' : '';
      var num = n < r.stage ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : (n + 1);
      return (n ? '<div class="step-connector' + (n <= r.stage ? ' is-complete' : '') + '" aria-hidden="true"></div>' : '') +
        '<div class="step' + cls + '" role="listitem"' + (n === r.stage ? ' aria-current="step"' : '') + '>' +
        '<div class="step-num" aria-hidden="true">' + num + '</div><span class="step-label">' + s.label + '</span></div>';
    }).join('') + '</div>';
  } else {
    html += '<div class="form-success" role="status">' +
      '<div class="form-success-icon" aria-hidden="true"><svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></div>' +
      '<h3 class="form-success-title">Signed by ' + c.name.split(' ')[0] + '</h3>' +
      '<p class="form-success-sub">E-signed on ' + advDate(r.signed) + '. The signed copy is filed in the client’s documents.</p>' +
      '<div class="form-ref-badge"><span class="form-ref-label">Reference</span><span class="form-ref-value">' + r.id + '</span></div></div>';
  }

  html += '<div class="review-card">' +
    row('Advice', r.product + (r.amount ? ' · ' + advMoney(r.amount, 0) : '')) +
    row('Risk profile', r.risk) +
    row('From', advReportSource(r)) +
    (r.submitted ? row('Compliance', (r.stage === 1 ? 'With ' : 'Approved by ') + COMPLIANCE_REVIEWER + ' · ' + advDate(r.submitted)) : '') +
    (r.sent ? row('Sent to client', advDate(r.sent) + (r.stage === 2 ? ' ' + advTag(st.label, st.tone) : '')) : '') +
    (r.reminded ? row('Reminder', 'Sent ' + advDate(r.reminded)) : '') +
    '</div>';

  var footer = '';
  if (r.stage === 0) {
    html += '<h3 class="section-heading">Recommendation</h3>' +
      '<div class="field"><label class="field-label" for="report-recommendation">What you recommend, and why</label>' +
      '<textarea id="report-recommendation" rows="4" maxlength="1200">' + r.recommendation + '</textarea></div>' +
      '<h3 class="section-heading">Why it is suitable</h3><div>' + SUITABILITY_CHECKS.map(function (label, n) {
        return '<label class="form-checkbox-row"><input type="checkbox" data-check="' + n + '"' + (r.done.indexOf(n) !== -1 ? ' checked' : '') + '>' +
          '<span class="form-checkbox-text">' + label + '</span></label>';
      }).join('') + '</div>';
    footer = '<button class="btn-primary" type="button" data-action="submit" disabled>Send to compliance</button>';
  } else {
    html += '<h3 class="section-heading">Recommendation</h3><p class="det-section-sub">' + r.recommendation + '</p>';
    /* Prototype stand-ins for what compliance and the client do */
    if (r.stage === 1) footer = '<button class="btn-primary" type="button" data-action="approve">Approved · send to client</button>';
    if (r.stage === 2) footer = (r.reminded === AS_AT ? '' : '<button class="btn-secondary" type="button" data-action="remind">Send reminder</button>') +
      '<button class="btn-primary" type="button" data-action="signed">Mark as signed</button>';
  }

  document.getElementById('report-drawer-body').innerHTML = html;
  var foot = document.getElementById('report-drawer-footer');
  foot.innerHTML = footer;
  foot.hidden = !footer;
  advSyncReport();
}


document.addEventListener('DOMContentLoaded', function () {
  buildAdviserDashboard();
  buildSuitabilityPage();
  buildMessagesPage();
  buildDashboardRequests();
  buildReviewsPage();
  buildKycPage();
  buildClientBook();
  buildClientProfile();
  buildAdviceRequests();
  initRequestComposer();
});
