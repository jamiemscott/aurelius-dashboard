/* ── Your Orders (investor side of dealing instructions) ──────
   My Investments lists the signed-in client's orders from
   dealing-data.js (the same records the adviser approves) and opens
   #order-drawer for one. Changes, such as cancelling, last until the
   page reloads: the prototype shows the flow, not a live link.

   Components only, no page-specific CSS: card + chart-header,
   doc-entry rows, status-tag tones, drawer, review-card, form-success,
   btn-primary / btn-secondary (+ btn-danger).                       */

const ORDER_CLIENT = 'sumant-kumar';
const ORDER_ADVISER = 'James Whitmore';

const ORDER_STATUS = {
  awaiting:  { label: 'Awaiting approval', tone: 'warning' },
  approved:  { label: 'Approved',          tone: 'success' },
  rejected:  { label: 'Rejected',          tone: 'error'   },
  cancelled: { label: 'Cancelled',         tone: ''        },
};

const ORDER_TYPES = {
  Share: { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  ETF:   { color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
  Fund:  { color: '#F5A623', bg: 'rgba(245,166,35,0.12)' },
};

/* Add Investment's wrapper codes, for "Change and resubmit" */
const ORDER_WRAPPERS = {
  'Stocks & Shares ISA': 'isa',
  'General Investment Account': 'gia',
  'SIPP': 'sipp',
};

const ORDER_ICON = '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>';

/* mode: null, or 'cancel' while the client confirms a cancellation.
   done: the message to show after cancelling.                     */
const orderState = { openId: null, mode: null, done: false };

function orderMoney(n, dp) {
  dp = dp === undefined ? 2 : dp;
  return '£' + n.toLocaleString('en-GB', { minimumFractionDigits: dp, maximumFractionDigits: dp });
}

function orderDate(iso, withTime) {
  const d = new Date(iso.length > 10 ? iso + ':00Z' : iso + 'T00:00:00Z');
  const date = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  if (!withTime) return date;
  return date + ', ' + d.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC' });
}

function orderTag(st) {
  return '<span class="status-tag' + (st.tone ? ' status-tag--' + st.tone : '') + '">' + st.label + '</span>';
}

function orderMessage(from, text, at) {
  return '<div class="activity-item">' +
    '<div class="activity-icon is-div" aria-hidden="true"><svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>' +
    '<div class="activity-body"><div class="activity-title">Message from ' + from + '</div><div class="activity-sub">' + text + '</div></div>' +
    '<div class="activity-figures"><div class="activity-time">' + orderDate(at) + '</div></div></div>';
}

function orderSize(d) {
  return d.method === 'amount'
    ? orderMoney(d.amount, 0)
    : d.units.toLocaleString('en-GB') + ' units · ≈ ' + orderMoney(d.units * d.price, 0);
}

function orderType(d) { return d.order === 'limit' ? 'Limit at ' + orderMoney(d.limitPrice) : 'At next available price'; }

function myOrders() {
  return dealingInstructions.filter(d => d.client === ORDER_CLIENT)
    .sort((a, b) => b.submitted.localeCompare(a.submitted));
}

function orderEntry(d) {
  const type = ORDER_TYPES[d.fund.type];
  const waiting = d.status === 'awaiting';
  return '<button class="doc-entry' + (waiting ? ' is-unread' : '') + '" type="button" popovertarget="order-drawer" data-order="' + d.id + '">' +
    '<span class="doc-entry-dot' + (waiting ? ' is-on' : '') + '"></span>' +
    '<span class="doc-entry-icon" style="--doc-cat-color:' + type.color + ';--doc-cat-bg:' + type.bg + '" aria-hidden="true">' +
      '<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">' + ORDER_ICON + '</svg></span>' +
    '<span class="doc-entry-body">' +
      '<span class="doc-entry-name">' + d.fund.name + '</span>' +
      '<span class="doc-entry-meta">' +
        '<span class="doc-cat-chip" style="--doc-cat-color:' + type.color + '">' + d.fund.type + '</span>' +
        '<span class="doc-meta-dot">·</span><span class="doc-account-chip">' + orderSize(d) + '</span>' +
        '<span class="doc-meta-dot">·</span><span>' + d.wrapper + '</span>' +
        '<span class="doc-meta-dot">·</span><span>' + d.id + '</span>' +
      '</span>' +
    '</span>' +
    '<span class="doc-entry-date">' + orderDate(d.submitted) + '</span>' +
    orderTag(ORDER_STATUS[d.status]) +
  '</button>';
}

function renderOrders() {
  const list = document.getElementById('orders-list');
  if (!list) return;
  const rows = myOrders();
  const waiting = rows.filter(d => d.status === 'awaiting').length;
  const sub = document.getElementById('orders-sub');
  if (sub) sub.textContent = waiting
    ? waiting + ' awaiting approval by ' + ORDER_ADVISER
    : 'Orders you place are approved by ' + ORDER_ADVISER;
  list.innerHTML = rows.length ? rows.map(orderEntry).join('') :
    '<div class="empty-state">' +
      '<svg aria-hidden="true" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">' + ORDER_ICON + '</svg>' +
      '<div>No orders yet</div><div class="empty-state-sub">Investments you add will appear here while ' + ORDER_ADVISER.split(' ')[0] + ' reviews them.</div></div>';
}

function renderOrderDrawer() {
  const d = dealingInstructions.find(x => x.id === orderState.openId);
  if (!d) return;
  const st = ORDER_STATUS[d.status];
  const adviser = ORDER_ADVISER.split(' ')[0];
  const row = (label, value) =>
    '<div class="review-row"><span class="review-row-label">' + label + '</span><span class="review-row-value">' + value + '</span></div>';

  document.getElementById('order-drawer-title').textContent = d.fund.name;
  document.getElementById('order-drawer-subtitle').innerHTML = orderTag(st) + ' ' + d.id;

  let html = '';
  if (orderState.done) {
    html += '<div class="form-success" role="status">' +
      '<div class="form-success-icon" aria-hidden="true"><svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></div>' +
      '<h3 class="form-success-title">Order cancelled</h3>' +
      '<p class="form-success-sub">Nothing has been bought, and ' + adviser + ' has been told.</p></div>';
  }

  html += '<div class="review-card">' +
    row('Investment', d.fund.name + ' · ' + d.fund.ticker) +
    row('ISIN', d.fund.isin) +
    row('Account', d.wrapper) +
    row(d.method === 'amount' ? 'Amount' : 'Units', orderSize(d)) +
    row('Price when placed', orderMoney(d.price)) +
    row('Order type', orderType(d)) +
    row('Trade date', orderDate(d.tradeDate)) +
    row('Placed', orderDate(d.submitted, true)) +
    (d.notes ? row('Your note', d.notes) : '') +
    '</div>';

  html += '<h3 class="section-heading">Status</h3><div class="review-card">';
  if (d.status === 'awaiting') {
    html += row(st.label, 'With ' + ORDER_ADVISER) +
      row('What happens next', 'You’ll get a notification when ' + adviser + ' approves it. It’s then placed on the trade date.');
  } else if (d.status === 'approved') {
    html += row(st.label, orderDate(d.decision.at, true) + ' · ' + ORDER_ADVISER) +
      row('Placed on', orderDate(d.tradeDate));
  } else if (d.status === 'rejected') {
    html += row(st.label, orderDate(d.decision.at, true) + ' · ' + ORDER_ADVISER) +
      (d.decision.reason ? row('Reason', DEALING_REJECT_REASONS[d.decision.reason]) : '');
  } else {
    html += row(st.label, 'By you · nothing was bought');
  }
  html += '</div>';

  /* A message reads as a message: the activity-item pattern, as in
     Adviser Notes, rather than a squeezed review-row value         */
  if (d.decision && d.decision.note && d.status === 'rejected') html += orderMessage(ORDER_ADVISER, d.decision.note, d.decision.at);

  let footer = '';
  if (d.status === 'awaiting' && orderState.mode === 'cancel') {
    /* No alert box: the question is a section and the buttons act on it */
    html += '<h3 class="section-heading" id="order-cancel-q" tabindex="-1">Cancel this order?</h3><div class="review-card">' +
      row('If you cancel', adviser + ' won’t place it, and nothing is bought. You can add it again later.') + '</div>';
    footer = '<button class="btn-secondary" type="button" data-action="keep">Keep order</button>' +
      '<button class="btn-secondary btn-danger" type="button" data-action="confirm-cancel">Yes, cancel order</button>';
  } else if (d.status === 'awaiting') {
    footer = '<button class="btn-secondary btn-danger" type="button" data-action="cancel">Cancel order</button>' +
      '<button class="btn-primary" type="button" popovertarget="order-drawer" popovertargetaction="hide">Done</button>';
  } else if (d.status === 'rejected') {
    const q = new URLSearchParams({ isin: d.fund.isin, wrapper: ORDER_WRAPPERS[d.wrapper] || 'gia' });
    if (d.method === 'amount') q.set('amount', d.decision.reason === 'allowance' ? 8240 : d.amount);
    footer = '<a class="btn-secondary" href="/contact-us/">Message ' + adviser + '</a>' +
      '<a class="btn-primary" href="/my-investments/add-investment/?' + q + '">Change and resubmit</a>';
  } else {
    footer = '<button class="btn-primary" type="button" popovertarget="order-drawer" popovertargetaction="hide">Done</button>';
  }

  document.getElementById('order-drawer-body').innerHTML = html;
  document.getElementById('order-drawer-footer').innerHTML = footer;
}

document.addEventListener('DOMContentLoaded', () => {
  const list = document.getElementById('orders-list');
  const drawer = document.getElementById('order-drawer');
  if (!list || !drawer || typeof dealingInstructions === 'undefined') return;

  /* Fill the drawer before the popover opens (the click runs ahead
     of popovertarget's default action).                           */
  list.addEventListener('click', e => {
    const row = e.target.closest('[data-order]');
    if (!row) return;
    orderState.openId = row.dataset.order;
    orderState.mode = null;
    orderState.done = false;
    renderOrderDrawer();
  });

  drawer.addEventListener('click', e => {
    const act = e.target.closest('[data-action]');
    if (!act) return;
    const d = dealingInstructions.find(x => x.id === orderState.openId);
    const a = act.dataset.action;
    if (a === 'cancel') orderState.mode = 'cancel';
    if (a === 'keep') orderState.mode = null;
    if (a === 'confirm-cancel') {
      d.status = 'cancelled';
      orderState.mode = null;
      orderState.done = true;
      renderOrders();
    }
    renderOrderDrawer();
    /* Move focus to what changed, so keyboard and screen reader users follow */
    const focusTo = a === 'cancel' ? document.getElementById('order-cancel-q')
      : a === 'confirm-cancel' ? drawer.querySelector('.form-success')
      : drawer.querySelector('[data-action="cancel"]');
    if (focusTo) { if (!focusTo.hasAttribute('tabindex') && !focusTo.matches('button')) focusTo.tabIndex = -1; focusTo.focus(); }
  });

  drawer.addEventListener('toggle', e => { if (e.newState === 'closed') renderOrders(); });

  renderOrders();

  /* Deep link: /my-investments/#REF-20261105-0289 opens that order */
  const hashId = window.location.hash.slice(1);
  if (myOrders().some(d => d.id === hashId)) {
    orderState.openId = hashId;
    renderOrderDrawer();
    drawer.showPopover();
  }
});
