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
    var prev = null;
    thread.innerHTML = r.thread.map(function (m) {
      var mine = m.from === 'adviser';
      var first = m.from !== prev; prev = m.from;
      var initials = mine ? advInitials(ADVISER.name) : advInitials(c.name);
      var avatar = '<div class="adv-avatar ' + (mine ? 'adv-avatar--user' : 'adv-avatar--bot') + '" aria-hidden="true">' + initials + '</div>';
      var bubble = '<div class="adv-bubble">' +
        (first ? '<p class="adv-sender">' + (mine ? 'You' : c.name) + '</p>' : '') +
        '<div class="adv-bubble-inner"><p class="adv-text">' + m.text + '</p></div>' +
        '<time class="adv-time" datetime="' + m.at + '">' + advWhen(m.at, true) + '</time></div>';
      return '<div class="adv-msg ' + (mine ? 'adv-msg--user' : 'adv-msg--bot') + '">' + (mine ? bubble + avatar : avatar + bubble) + '</div>';
    }).join('');
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
  /* Prototype clock: the "as at" date, at the current time of day */
  var now = new Date();
  var at = AS_AT + 'T' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
  r.thread.push({ from: 'adviser', at: at, text: input.value.trim().replace(/</g, '&lt;') });
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


document.addEventListener('DOMContentLoaded', function () {
  buildAdviserDashboard();
  buildDashboardRequests();
  buildClientBook();
  buildClientProfile();
  buildAdviceRequests();
  initRequestComposer();
});
