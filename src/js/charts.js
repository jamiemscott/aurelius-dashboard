/* ─── SVG CHART BUILDERS ────────────────────────────────────── */

function buildPerfChart(svgId, w, h) {
  const svg = document.getElementById(svgId);
  if (!svg) return;
  // Override the hardcoded width/height attributes so the SVG fills its
  // container. viewBox is set to the measured pixel width so coordinates
  // drawn below always match the viewport exactly (no letterboxing).
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', String(h));
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);

  // Simulated portfolio performance curve
  const pts = [
     0.00, -0.8, -2.1,  1.2,  3.4,  2.8,  4.1,  6.2,  5.4,  7.8,
     9.1,   8.3, 10.2,  9.8, 11.4, 10.9, 12.8, 14.2, 13.6, 15.1,
    14.8,  16.3, 15.9, 17.4, 16.2, 15.0, 14.3, 13.8, 14.9, 15.8,
    17.2,  16.8, 18.3, 17.4, 16.1, 15.3, 16.8, 17.6, 18.9, 18.4,
    19.2,  18.7, 20.1, 19.4, 20.8, 21.3, 20.6, 19.8, 20.4, 21.1,
    22.0,  21.5, 22.8, 23.4, 22.1, 21.8, 23.2, 22.9, 24.1, 23.6,
  ];

  const pad = 20;
  const xStep = (w - pad * 2) / (pts.length - 1);
  const minV = Math.min(...pts) - 2;
  const maxV = Math.max(...pts) + 2;
  const yScale = v => h - pad - ((v - minV) / (maxV - minV)) * (h - pad * 2);

  const linePoints = pts.map((v, i) => `${pad + i * xStep},${yScale(v)}`).join(' ');
  const areaPoints = `${pad},${h - pad} ${linePoints} ${pad + (pts.length - 1) * xStep},${h - pad}`;

  const uid = svgId + '-grad';
  svg.innerHTML = `
    <defs>
      <linearGradient id="${uid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#F5A623" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="#F5A623" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <polygon points="${areaPoints}" fill="url(#${uid})"/>
    <polyline points="${linePoints}" fill="none" stroke="#F5A623" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${pad + (pts.length - 1) * xStep}" cy="${yScale(pts[pts.length - 1])}" r="4" fill="#F5A623" stroke="var(--bg-card)" stroke-width="2"/>
    ${[0, 15, 30, 45, 59].map(i =>
      `<line x1="${pad + i * xStep}" y1="${pad}" x2="${pad + i * xStep}" y2="${h - pad}" stroke="var(--divider)" stroke-width="1" stroke-dasharray="3,4"/>`
    ).join('')}
  `;
}

function buildDonut(svgId, data, r = 38, strokeW = 14) {
  const svg = document.getElementById(svgId);
  if (!svg) return;
  const cx = 50, cy = 50;
  const total = data.reduce((s, d) => s + d.pct, 0);
  let angle = -90;

  let html = '';
  for (const d of data) {
    const sweep = (d.pct / total) * 360;
    const rad1 = (angle * Math.PI) / 180;
    const rad2 = ((angle + sweep) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(rad1);
    const y1 = cy + r * Math.sin(rad1);
    const x2 = cx + r * Math.cos(rad2);
    const y2 = cy + r * Math.sin(rad2);
    const large = sweep > 180 ? 1 : 0;
    html += `<path d="M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}" fill="none" stroke="${d.color}" stroke-width="${strokeW}" stroke-linecap="butt"/>`;
    angle += sweep;
  }

  // Center text
  html += `<text x="50" y="46" text-anchor="middle" fill="var(--text-1)" font-size="9" font-weight="600" font-family="DM Serif Display">Equity</text>`;
  html += `<text x="50" y="56" text-anchor="middle" fill="var(--gold)" font-size="10" font-weight="700" font-family="DM Serif Display">96%</text>`;

  svg.innerHTML = html;
}

function buildLegend(containerId, data) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = data.map(d => `
    <div class="legend-item">
      <div class="legend-dot" style="background:${d.color}"></div>
      <span class="legend-label">${d.label}</span>
      <span class="legend-pct">${d.pct.toFixed(2)}%</span>
    </div>
  `).join('');
}

function buildProgressList(containerId, data, totalValue) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = data.map(d => {
    const val = totalValue ? `£${Math.round(totalValue * d.pct / 100).toLocaleString()}` : '';
    return `
    <div class="progress-item">
      <div class="progress-dot" style="background:${d.color}"></div>
      <div class="progress-label">
        <div class="progress-name">${d.label}</div>
        <div class="progress-sub">${val}</div>
      </div>
      <div class="progress-bar-wrap">
        <div class="progress-bar-track">
          <div class="progress-bar-fill" style="width:${d.pct}%;background:${d.color}"></div>
        </div>
      </div>
      <div class="progress-pct">${d.pct.toFixed(2)}%</div>
    </div>`;
  }).join('');
}

function buildSparkline(data, positive) {
  const w = 60, h = 24, pad = 2;
  const min = Math.min(...data), max = Math.max(...data);
  const xStep = (w - pad * 2) / (data.length - 1);
  const yScale = v => h - pad - ((v - min) / (max - min + 0.01)) * (h - pad * 2);
  const pts = data.map((v, i) => `${pad + i * xStep},${yScale(v)}`).join(' ');
  const color = positive === false ? '#EF4444' : positive === null ? '#6B6F76' : '#22C55E';
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
}

function buildTopHoldings() {
  const tbody = document.getElementById('top-holdings-body');
  if (!tbody) return;
  tbody.innerHTML = topHoldings.map(h => {
    const sparkSVG = h.spark ? buildSparkline(h.spark, h.up) : '';
    return `
    <tr>
      <td><div class="td-name">${h.name}</div><div class="td-type">${h.type}</div></td>
      <td><strong>${h.value}</strong></td>
      <td><span class="td-change ${h.up === null ? '' : h.up ? 'is-up' : 'is-down'}">${h.pct !== '—' ? (h.up ? '▲' : '▼') + ' ' : ''}${h.pct}</span></td>
      <td>${sparkSVG}</td>
    </tr>`;
  }).join('');
}

function buildActivityFeed() {
  const el = document.getElementById('activity-feed');
  if (!el) return;
  el.innerHTML = activity.map(a => `
    <div class="activity-item">
      <div class="activity-icon is-${a.type}">${a.icon}</div>
      <div class="activity-body">
        <div class="activity-title">${a.title}</div>
        <div class="activity-sub">${a.sub}</div>
      </div>
      <div style="text-align:right;flex-shrink:0">
        <div class="activity-amount ${a.pos ? 'is-positive' : ''}">${a.amount}</div>
        <div class="activity-time">${a.time}</div>
      </div>
    </div>`).join('');
}

/* ─── DOCUMENTS PAGE ─────────────────────────────────── */

const DOC_CATS = {
  statement:      { label: 'Statement',      color: '#3B82F6', bg: 'rgba(59,130,246,0.12)'  },
  tax:            { label: 'Tax',            color: '#22C55E', bg: 'rgba(34,197,94,0.12)'   },
  report:         { label: 'Report',         color: '#F5A623', bg: 'rgba(245,166,35,0.12)'  },
  correspondence: { label: 'Correspondence', color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)'  },
  form:           { label: 'Form',           color: '#6B7280', bg: 'rgba(107,114,128,0.12)' },
};

const DOC_ICONS = {
  statement:      `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  tax:            `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="13" y2="15"/></svg>`,
  report:         `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  correspondence: `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  form:           `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>`,
};

let docState = {
  unread: new Set(),
  activeCategory: 'all',
  searchQuery: '',
};

function buildDocumentsPage() {
  docState.unread = new Set(documents.filter(d => d.unread).map(d => d.id));
  renderDocStats();
  buildDocTabs();
  renderDocList();
}

function buildDocTabs() {
  const container = document.getElementById('doc-tabs');
  if (!container) return;
  const catKeys   = ['all', 'statement', 'tax', 'report', 'correspondence', 'form'];
  const catLabels = { all: 'All', statement: 'Statements', tax: 'Tax', report: 'Reports', correspondence: 'Correspondence', form: 'Forms' };
  container.innerHTML = catKeys.map(cat => {
    const count = cat === 'all' ? documents.length : documents.filter(d => d.category === cat).length;
    const unreadCount = cat === 'all'
      ? docState.unread.size
      : documents.filter(d => d.category === cat && docState.unread.has(d.id)).length;
    const active = cat === docState.activeCategory;
    return `
      <button class="doc-tab ${active ? 'is-active' : ''}" onclick="setDocCategory('${cat}')">
        ${catLabels[cat]}
        <span class="doc-tab-count">${count}</span>
        ${unreadCount > 0 ? `<span class="doc-tab-unread">${unreadCount}</span>` : ''}
      </button>`;
  }).join('');
}

function renderDocStats() {
  const el = document.getElementById('doc-stats-strip');
  if (!el) return;
  const unread = docState.unread.size;
  const bycat  = k => documents.filter(d => d.category === k).length;
  const stats  = [
    { label: 'Unread',     value: unread,             gold: true,  cat: 'all'       },
    { label: 'Total',      value: documents.length,   gold: false, cat: 'all'       },
    { label: 'Statements', value: bycat('statement'), gold: false, cat: 'statement' },
    { label: 'Tax Docs',   value: bycat('tax'),       gold: false, cat: 'tax'       },
    { label: 'Reports',    value: bycat('report'),    gold: false, cat: 'report'    },
  ];
  el.innerHTML = stats.map(s => `
    <div class="doc-stat ${s.gold && unread > 0 ? 'is-featured' : ''}" onclick="setDocCategory('${s.cat}')">
      <div class="doc-stat-value ${s.gold && unread > 0 ? 'gold' : ''}">${s.value}</div>
      <div class="doc-stat-label">${s.label}</div>
    </div>`).join('');
}

function renderDocList() {
  const el = document.getElementById('doc-list');
  if (!el) return;

  let filtered = documents;
  if (docState.activeCategory !== 'all') filtered = filtered.filter(d => d.category === docState.activeCategory);
  if (docState.searchQuery) {
    const q = docState.searchQuery.toLowerCase();
    filtered = filtered.filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.category.includes(q) ||
      d.account.toLowerCase().includes(q)
    );
  }

  const unreadDocs = filtered.filter(d => docState.unread.has(d.id));
  const readDocs   = filtered.filter(d => !docState.unread.has(d.id));

  // Group read docs by "Mon YYYY"
  const groups = {};
  for (const doc of readDocs) {
    const p = doc.date.split(' ');
    const key = `${p[1]} ${p[2]}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(doc);
  }

  let html = '';

  if (unreadDocs.length > 0) {
    html += `
      <div class="doc-group">
        <div class="doc-group-hd">
          <span class="doc-group-label new-label">New</span>
          <span class="doc-group-badge">${unreadDocs.length}</span>
          <button class="doc-mark-all" onclick="markAllDocsRead()">Mark all as read</button>
        </div>
        <div class="card">${unreadDocs.map(d => renderDocEntry(d, true)).join('')}</div>
      </div>`;
  }

  for (const [monthYear, docs] of Object.entries(groups)) {
    html += `
      <div class="doc-group">
        <div class="doc-group-hd">
          <span class="doc-group-label">${monthYear}</span>
          <span class="doc-group-count">${docs.length} document${docs.length !== 1 ? 's' : ''}</span>
        </div>
        <div class="card">${docs.map(d => renderDocEntry(d, false)).join('')}</div>
      </div>`;
  }

  if (filtered.length === 0) {
    html = `
      <div class="doc-empty">
        <svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="margin-bottom:12px"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        <div>No documents found</div>
      </div>`;
  }

  el.innerHTML = html;
}

function renderDocEntry(doc, isUnread) {
  const cat = DOC_CATS[doc.category];
  const dlIcon = `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;
  return `
    <div class="doc-entry ${isUnread ? 'is-unread' : ''}" onclick="markDocRead(${doc.id})">
      <div class="doc-entry-dot ${isUnread ? 'is-on' : ''}"></div>
      <div class="doc-entry-icon" style="color:${cat.color};background:${cat.bg}">${DOC_ICONS[doc.category]}</div>
      <div class="doc-entry-body">
        <div class="doc-entry-name">${doc.name}${isUnread ? ' <span class="doc-new-tag">NEW</span>' : ''}</div>
        <div class="doc-entry-meta">
          <span class="doc-cat-chip" style="color:${cat.color}">${cat.label}</span>
          <span class="doc-meta-dot">·</span>
          <span class="doc-account-chip">${doc.account}</span>
        </div>
      </div>
      <div class="doc-entry-date">${doc.date}</div>
      <div class="doc-entry-size">${doc.size}</div>
      <button class="doc-entry-dl" onclick="event.stopPropagation()" title="Download">${dlIcon}</button>
    </div>`;
}

function setDocCategory(cat) {
  docState.activeCategory = cat;
  renderDocStats();
  buildDocTabs();
  renderDocList();
}

function filterDocs() {
  docState.searchQuery = document.getElementById('doc-search').value;
  renderDocList();
}

function markDocRead(id) {
  if (docState.unread.has(id)) {
    docState.unread.delete(id);
    updateDocBadge();
    renderDocStats();
    buildDocTabs();
    renderDocList();
  }
}

function markAllDocsRead() {
  let filtered = documents;
  if (docState.activeCategory !== 'all') filtered = filtered.filter(d => d.category === docState.activeCategory);
  filtered.forEach(d => docState.unread.delete(d.id));
  updateDocBadge();
  renderDocStats();
  buildDocTabs();
  renderDocList();
}

function updateDocBadge() {
  const count = docState.unread.size;
  const badge = document.getElementById('docs-nav-badge');
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? '' : 'none';
  }
}

function buildInvestmentsTable() {
  const tbody = document.getElementById('investments-body');
  if (!tbody) return;
  tbody.innerHTML = investments.map(inv => `
    <tr>
      <td><div class="td-name">${inv.name}</div><div class="td-type">GBP Mutual Fund</div></td>
      <td class="td-secondary">${inv.qty}</td>
      <td class="td-secondary">${inv.price}p</td>
      <td class="td-secondary">£${inv.cost}</td>
      <td><strong>£${inv.mv}</strong></td>
      <td class="td-secondary">${inv.assets}%</td>
      <td class="td-secondary">${inv.yield}%</td>
      <td><span class="td-change ${inv.up ? 'is-up' : 'is-down'}">£${inv.gl}</span></td>
      <td><span class="gain-tag ${inv.up ? 'is-up' : 'is-down'}">${inv.up ? '▲' : '▼'} ${inv.glp}%</span></td>
    </tr>`).join('');
}

/* ─── MY DETAILS PAGE ──────────────────────────────────────── */

// profileTypes is defined in data.js — available on every page.

let detailsState = {
  activeTab: 'personal',
  editing: new Set(),
  data: null,
};

/* ── Utilities ── */

function detMask(str, keep) {
  keep = keep || 2;
  if (!str || str.length <= keep * 2) return str;
  return str.slice(0, keep) + '•'.repeat(str.length - keep * 2) + str.slice(-keep);
}

function detGetNested(obj, path) {
  return path.split('.').reduce(function(o, k) { return o != null ? o[k] : undefined; }, obj);
}

function detSetNested(obj, path, val) {
  var keys = path.split('.');
  var last = keys.pop();
  var target = keys.reduce(function(o, k) { return o[k]; }, obj);
  target[last] = val;
}

/* ── Main build ── */

function buildDetailsPage() {
  detailsState.data = JSON.parse(JSON.stringify(userData));
  // Pre-select tab from URL hash (e.g. /my-details/#security)
  const validTabs = ['personal', 'contact', 'security', 'preferences'];
  const hash = window.location.hash.replace('#', '');
  if (validTabs.includes(hash)) detailsState.activeTab = hash;
  renderDetailsHero();
  renderDetailsTabs();
  renderDetailsContent();
}

/* ── Hero ── */

function renderDetailsHero() {
  var el = document.getElementById('details-hero');
  if (!el) return;
  var d = detailsState.data;
  el.innerHTML = `
    <div class="det-avatar">${d.firstName[0]}${d.lastName[0]}</div>
    <div class="det-hero-main">
      <div class="det-hero-name">${d.title} ${d.firstName} ${d.lastName}</div>
      <div class="det-hero-chips">
        <span class="det-hero-chip">
          <svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/></svg>
          ${d.clientNumber}
        </span>
        <span class="det-hero-badge is-platinum">★ ${d.tier} Client</span>
        <span class="det-hero-badge is-verified">
          <svg width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
          KYC Verified
        </span>
      </div>
    </div>
    <div class="det-hero-side">
      <div class="det-hero-meta-row"><strong>Client since</strong> ${d.clientSince}</div>
      <div class="det-hero-meta-row"><strong>Adviser</strong> ${d.adviser}</div>
      <div class="det-hero-meta-row">Next review: <strong>${d.nextReview}</strong></div>
    </div>`;

  var pc = document.getElementById('details-profile-card');
  if (!pc) return;
  var pt = profileTypes[d.profileType];
  if (!pt) { pc.innerHTML = ''; return; }
  pc.innerHTML = `
    <div class="det-profile-card">
      <div class="det-profile-eyebrow">Investor Profile</div>
      <div class="det-profile-emoji" aria-hidden="true">${pt.emoji}</div>
      <div class="det-profile-label">${pt.label}</div>
      <p class="det-profile-desc">${pt.desc}</p>
      <a class="det-profile-link" href="/onboarding/">Retake assessment</a>
    </div>`;
}

/* ── Tabs ── */

function renderDetailsTabs() {
  var el = document.getElementById('details-tabs');
  if (!el) return;
  var tabs = [
    { id: 'personal',    label: 'Personal Information' },
    { id: 'contact',     label: 'Contact Details' },
    { id: 'security',    label: 'Security & Access' },
    { id: 'preferences', label: 'Preferences' },
  ];
  el.innerHTML = tabs.map(function(t) {
    return `<button class="details-tab ${t.id === detailsState.activeTab ? 'is-active' : ''}" onclick="setDetailsTab('${t.id}')">${t.label}</button>`;
  }).join('');
}

function setDetailsTab(tab) {
  detailsState.activeTab = tab;
  detailsState.editing.clear();
  renderDetailsTabs();
  renderDetailsContent();
}

/* ── Content dispatcher ── */

function renderDetailsContent() {
  var el = document.getElementById('details-content');
  if (!el) return;
  var tab = detailsState.activeTab;
  if      (tab === 'personal')    el.innerHTML = renderPersonalTab();
  else if (tab === 'contact')     el.innerHTML = renderContactTab();
  else if (tab === 'security')    el.innerHTML = renderSecurityTab();
  else if (tab === 'preferences') el.innerHTML = renderPrefsTab();
}

/* ── Section actions ── */

function editSection(id) {
  detailsState.editing.add(id);
  renderDetailsContent();
}

function cancelSection(id) {
  detailsState.editing.delete(id);
  renderDetailsContent();
}

function saveSection(id) {
  var wrap = document.getElementById('det-section-' + id);
  if (wrap) {
    wrap.querySelectorAll('[data-field]').forEach(function(el) {
      var field = el.dataset.field;
      if (field && field[0] !== '_') {
        var val = el.type === 'checkbox' ? el.checked : el.value;
        detSetNested(detailsState.data, field, val);
      }
    });
  }
  if (id === 'password') detailsState.data.passwordChangedDate = 'Today';
  detailsState.editing.delete(id);
  renderDetailsHero();
  renderDetailsContent();
}

/* ── Section header helper ── */

function detSectionHd(title, sub, id, isEditing) {
  var subHtml = sub ? `<div class="det-section-sub">${sub}</div>` : '';
  var editIcon = `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
  var actions = isEditing
    ? `<button class="btn-secondary btn-sm" onclick="cancelSection('${id}')">Cancel</button>
       <button class="btn-primary btn-sm" onclick="saveSection('${id}')">Save Changes</button>`
    : `<button class="btn-secondary btn-sm" onclick="editSection('${id}')">${editIcon} Edit</button>`;
  return `
    <div class="det-section-hd">
      <div><div class="det-section-title">${title}</div>${subHtml}</div>
      <div class="det-section-actions">${actions}</div>
    </div>`;
}

/* ── Field row helper ── */

function detRow(label, readHtml, editEl) {
  var content = (editEl !== undefined)
    ? `<div class="det-field-val" style="flex:1">${editEl}</div>`
    : `<div class="det-field-val${!readHtml ? ' muted' : ''}">${readHtml || 'Not provided'}</div>`;
  return `<div class="det-field-row"><div class="det-field-label">${label}</div>${content}</div>`;
}

/* ── Device icons for sessions ── */

var DET_DEVICE_ICONS = {
  laptop:  `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M1 20h22"/></svg>`,
  mobile:  `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="18" r="1" fill="currentColor"/></svg>`,
  desktop: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/></svg>`,
};

/* ──────────────────────────────────────────────────────── */
/* TAB 1: PERSONAL                                          */
/* ──────────────────────────────────────────────────────── */

function renderPersonalTab() {
  var d = detailsState.data;
  var pEdit = detailsState.editing.has('personal');
  var tEdit = detailsState.editing.has('tax');

  var personalFields = pEdit ? `
    ${detRow('Title', null, `<select class="det-select" data-field="title">
      <option ${d.title==='Mr'?'selected':''}>Mr</option>
      <option ${d.title==='Mrs'?'selected':''}>Mrs</option>
      <option ${d.title==='Ms'?'selected':''}>Ms</option>
      <option ${d.title==='Dr'?'selected':''}>Dr</option>
      <option ${d.title==='Prof'?'selected':''}>Prof</option>
    </select>`)}
    ${detRow('First Name', null, `<input class="det-input" data-field="firstName" value="${d.firstName}">`)}
    ${detRow('Last Name', null, `<input class="det-input" data-field="lastName" value="${d.lastName}">`)}
    ${detRow('Preferred Name', null, `<input class="det-input" data-field="preferredName" value="${d.preferredName}">`)}
    ${detRow('Date of Birth', null, `<input class="det-input" data-field="dob" value="${d.dob}" placeholder="DD/MM/YYYY">`)}
    ${detRow('Gender', null, `<select class="det-select" data-field="gender">
      <option ${d.gender==='Male'?'selected':''}>Male</option>
      <option ${d.gender==='Female'?'selected':''}>Female</option>
      <option ${d.gender==='Non-binary'?'selected':''}>Non-binary</option>
      <option ${d.gender==='Prefer not to say'?'selected':''}>Prefer not to say</option>
    </select>`)}
    ${detRow('Nationality', null, `<input class="det-input" data-field="nationality" value="${d.nationality}">`)}
    ${detRow('Marital Status', null, `<select class="det-select" data-field="maritalStatus">
      <option ${d.maritalStatus==='Single'?'selected':''}>Single</option>
      <option ${d.maritalStatus==='Married'?'selected':''}>Married</option>
      <option ${d.maritalStatus==='Civil Partnership'?'selected':''}>Civil Partnership</option>
      <option ${d.maritalStatus==='Divorced'?'selected':''}>Divorced</option>
      <option ${d.maritalStatus==='Widowed'?'selected':''}>Widowed</option>
    </select>`)}
    ${detRow('NI Number', null, `<input class="det-input" data-field="niNumber" value="${d.niNumber}" placeholder="AB123456C">`)}
  ` : `
    ${detRow('Full Legal Name', `${d.title} ${d.firstName} ${d.lastName}`)}
    ${detRow('Preferred Name', d.preferredName)}
    ${detRow('Date of Birth', d.dob)}
    ${detRow('Gender', d.gender)}
    ${detRow('Nationality', d.nationality)}
    ${detRow('Marital Status', d.maritalStatus)}
    ${detRow('NI Number', `<span style="letter-spacing:2px;font-family:monospace">${detMask(d.niNumber, 2)}</span>`)}
  `;

  var taxFields = tEdit ? `
    ${detRow('Tax Residency', null, `<input class="det-input" data-field="taxResidency" value="${d.taxResidency}">`)}
    ${detRow('UTR Number', null, `<input class="det-input" data-field="utr" value="${d.utr}" placeholder="10-digit UTR">`)}
    ${detRow('FATCA Status', null, `<label style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text-1);cursor:pointer"><input type="checkbox" data-field="fatca" ${d.fatca?'checked':''} style="width:15px;height:15px;accent-color:var(--gold)"> US Person declaration</label>`)}
  ` : `
    ${detRow('Tax Residency', d.taxResidency)}
    ${detRow('UTR Number', `<span style="letter-spacing:1px;font-family:monospace">${detMask(d.utr, 2)}</span>`)}
    ${detRow('FATCA Status', d.fatca ? 'US Person' : 'Not a US Person')}
    ${detRow('Tax Year End', '5 April')}
  `;

  return `
    <div class="det-two-col">
      <div>
        <div id="det-section-personal" class="det-section">
          ${detSectionHd('Personal Details', 'Legal name and identity', 'personal', pEdit)}
          <div class="det-field-list">${personalFields}</div>
        </div>
        <div id="det-section-tax" class="det-section">
          ${detSectionHd('Tax Information', 'HMRC and residency details', 'tax', tEdit)}
          <div class="det-field-list">${taxFields}</div>
        </div>
      </div>
      <div>
        <div class="det-section">
          <div class="det-section-hd">
            <div><div class="det-section-title">Identity Verification</div><div class="det-section-sub">KYC & AML status</div></div>
          </div>
          <div class="det-kyc-status">
            <div class="det-kyc-icon">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <div>
              <div class="det-kyc-label">Identity Verified</div>
              <div class="det-kyc-sub">Last verified ${d.kycVerifiedDate}</div>
            </div>
          </div>
          <div class="det-field-list">
            ${detRow('Document Type', d.kycDoc)}
            ${detRow('Expiry Date', d.kycExpiry)}
            ${detRow('KYC Status', `<span class="det-hero-badge is-verified"><svg width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg> Verified</span>`)}
          </div>
          <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--divider)">
            <button class="btn-secondary btn-sm" style="width:100%;justify-content:center">
              <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Upload New Document
            </button>
          </div>
        </div>
        <div class="det-section">
          <div class="det-section-hd">
            <div><div class="det-section-title">Account Status</div><div class="det-section-sub">Client profile summary</div></div>
          </div>
          <div class="det-field-list">
            ${detRow('Client Number', `<code style="font-size:12px;color:var(--text-2);background:var(--tag-bg);padding:2px 8px;border-radius:5px;font-family:monospace">${d.clientNumber}</code>`)}
            ${detRow('Client Since', d.clientSince)}
            ${detRow('Account Tier', `<span class="det-hero-badge is-platinum">★ ${d.tier}</span>`)}
            ${detRow('Next Review', d.nextReview)}
            ${detRow('Relationship Manager', `<div><div style="font-size:13px;font-weight:500;color:var(--text-1)">${d.adviser}</div><div style="font-size:11px;color:var(--text-3);margin-top:2px">${d.adviserEmail}</div></div>`)}
          </div>
        </div>
      </div>
    </div>`;
}

/* ──────────────────────────────────────────────────────── */
/* TAB 2: CONTACT                                           */
/* ──────────────────────────────────────────────────────── */

function renderContactTab() {
  var d = detailsState.data;
  var eEdit = detailsState.editing.has('email');
  var pEdit = detailsState.editing.has('phone');
  var aEdit = detailsState.editing.has('address');

  var verifiedBadge = `<span class="det-verified-badge"><svg width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg> Verified</span>`;

  var emailFields = eEdit ? `
    ${detRow('Primary Email', null, `<input class="det-input" type="email" data-field="emailPrimary" value="${d.emailPrimary}">`)}
    ${detRow('Secondary Email', null, `<input class="det-input" type="email" data-field="emailSecondary" value="${d.emailSecondary}" placeholder="Optional">`)}
  ` : `
    ${detRow('Primary Email', d.emailPrimary + (d.emailPrimaryVerified ? verifiedBadge : ''))}
    ${detRow('Secondary Email', d.emailSecondary)}
  `;

  var phoneFields = pEdit ? `
    ${detRow('Mobile', null, `<input class="det-input" type="tel" data-field="phoneMobile" value="${d.phoneMobile}">`)}
    ${detRow('Home', null, `<input class="det-input" type="tel" data-field="phoneHome" value="${d.phoneHome}">`)}
    ${detRow('Work', null, `<input class="det-input" type="tel" data-field="phoneWork" value="${d.phoneWork}" placeholder="Optional">`)}
  ` : `
    ${detRow('Mobile', d.phoneMobile ? `${d.phoneMobile} <span style="font-size:10px;color:var(--text-3);background:var(--tag-bg);padding:1px 7px;border-radius:99px;margin-left:4px">Primary</span>` : '')}
    ${detRow('Home', d.phoneHome)}
    ${detRow('Work', d.phoneWork)}
  `;

  var addrDisplay = `<div style="line-height:1.8">
    ${d.addrLine1}${d.addrLine2 ? `<br>${d.addrLine2}` : ''}
    <br>${d.addrCity}${d.addrCounty ? `, ${d.addrCounty}` : ''}
    <br>${d.addrPostcode}
    <br>${d.addrCountry}
  </div>`;

  var addrFields = aEdit ? `
    ${detRow('Address Line 1', null, `<input class="det-input" data-field="addrLine1" value="${d.addrLine1}">`)}
    ${detRow('Address Line 2', null, `<input class="det-input" data-field="addrLine2" value="${d.addrLine2}" placeholder="Optional">`)}
    ${detRow('City', null, `<input class="det-input" data-field="addrCity" value="${d.addrCity}">`)}
    ${detRow('County', null, `<input class="det-input" data-field="addrCounty" value="${d.addrCounty}" placeholder="Optional">`)}
    ${detRow('Postcode', null, `<input class="det-input" data-field="addrPostcode" value="${d.addrPostcode}">`)}
    ${detRow('Country', null, `<select class="det-select" data-field="addrCountry">
      <option ${d.addrCountry==='United Kingdom'?'selected':''}>United Kingdom</option>
      <option ${d.addrCountry==='United States'?'selected':''}>United States</option>
      <option ${d.addrCountry==='Germany'?'selected':''}>Germany</option>
      <option ${d.addrCountry==='France'?'selected':''}>France</option>
      <option ${d.addrCountry==='Australia'?'selected':''}>Australia</option>
    </select>`)}
  ` : `
    ${detRow('Address', addrDisplay)}
  `;

  return `
    <div class="det-two-col">
      <div>
        <div id="det-section-email" class="det-section">
          ${detSectionHd('Email Addresses', '', 'email', eEdit)}
          <div class="det-field-list">${emailFields}</div>
        </div>
        <div id="det-section-phone" class="det-section">
          ${detSectionHd('Phone Numbers', '', 'phone', pEdit)}
          <div class="det-field-list">${phoneFields}</div>
        </div>
        <div class="det-section">
          <div class="det-section-hd">
            <div><div class="det-section-title">Preferred Contact Method</div><div class="det-section-sub">For non-urgent correspondence</div></div>
          </div>
          <div class="det-pref-group">
            <button class="det-pref-btn ${d.preferredContact==='email'?'is-active':''}" onclick="setContactPref('email')">Email</button>
            <button class="det-pref-btn ${d.preferredContact==='phone'?'is-active':''}" onclick="setContactPref('phone')">Phone</button>
            <button class="det-pref-btn ${d.preferredContact==='post'?'is-active':''}"  onclick="setContactPref('post')">Post</button>
          </div>
        </div>
      </div>
      <div>
        <div id="det-section-address" class="det-section">
          ${detSectionHd('Registered Address', '', 'address', aEdit)}
          <div class="det-field-list">${addrFields}</div>
        </div>
        <div class="det-section">
          <div class="det-section-hd">
            <div><div class="det-section-title">Correspondence Address</div></div>
          </div>
          <div class="det-toggle-row" style="margin-bottom:${d.corrSameAsReg?'0':'12px'}">
            <span class="det-toggle-label">Same as registered address</span>
            <label class="det-toggle">
              <input type="checkbox" ${d.corrSameAsReg?'checked':''} onchange="toggleCorrSame()">
              <span class="det-toggle-slider"></span>
            </label>
          </div>
          ${d.corrSameAsReg
            ? `<div style="font-size:12px;color:var(--text-3);margin-top:12px;display:flex;align-items:center;gap:6px">
                <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                Using registered address
               </div>`
            : `<div style="font-size:12px;color:var(--text-3)">Add a different address below if required.</div>`}
        </div>
      </div>
    </div>`;
}

function setContactPref(val) {
  detailsState.data.preferredContact = val;
  renderDetailsContent();
}

function toggleCorrSame() {
  detailsState.data.corrSameAsReg = !detailsState.data.corrSameAsReg;
  renderDetailsContent();
}

/* ──────────────────────────────────────────────────────── */
/* TAB 3: SECURITY                                          */
/* ──────────────────────────────────────────────────────── */

function renderSecurityTab() {
  var d = detailsState.data;
  var pwEdit = detailsState.editing.has('password');

  var failedLogin = d.loginHistory.some(function(l) { return l.status === 'failed'; });

  return `
    <div class="det-security-grid">
      <div id="det-section-password" class="det-section">
        ${detSectionHd('Password', 'Account login credentials', 'password', pwEdit)}
        <div class="det-field-list">
          ${pwEdit ? `
            ${detRow('Current Password', null, `<input class="det-input" type="password" data-field="_currentPw" placeholder="Enter current password">`)}
            ${detRow('New Password', null, `<input class="det-input" type="password" data-field="_newPw" placeholder="Minimum 12 characters">`)}
            ${detRow('Confirm Password', null, `<input class="det-input" type="password" data-field="_confirmPw" placeholder="Repeat new password">`)}
          ` : `
            ${detRow('Password', `<span class="det-password-dots">••••••••••••</span>`)}
            ${detRow('Last Changed', d.passwordChangedDate)}
          `}
        </div>
      </div>

      <div class="det-section">
        <div class="det-section-hd">
          <div><div class="det-section-title">Two-Factor Authentication</div><div class="det-section-sub">Enhanced account security</div></div>
        </div>
        <div class="det-twofa-status ${d.twoFA ? 'is-on' : 'is-off'}">
          <div style="display:flex;align-items:center;gap:10px;flex:1">
            <div class="det-status-dot ${d.twoFA ? 'green' : 'red'}"></div>
            <div>
              <div style="font-size:13px;font-weight:600;color:${d.twoFA?'var(--green)':'var(--red)'}">${d.twoFA ? 'Enabled' : 'Disabled'}</div>
              <div style="font-size:11px;color:var(--text-3);margin-top:1px">${d.twoFA ? d.twoFAMethod : 'Your account is less secure — enable 2FA now'}</div>
            </div>
          </div>
          <label class="det-toggle">
            <input type="checkbox" ${d.twoFA ? 'checked' : ''} onchange="toggleTwoFA()">
            <span class="det-toggle-slider"></span>
          </label>
        </div>
        <div class="det-field-list">
          ${detRow('Method', d.twoFAMethod)}
          ${detRow('Backup Codes', `<span style="color:var(--text-2)">8 of 10 remaining</span>`)}
          ${detRow('Last Used', d.twoFALastUsed)}
        </div>
        <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--divider)">
          <button class="btn-secondary btn-sm">Manage 2FA Settings</button>
        </div>
      </div>
    </div>

    <div class="det-section">
      <div class="det-section-hd">
        <div><div class="det-section-title">Active Sessions</div><div class="det-section-sub">${d.sessions.length} device${d.sessions.length !== 1 ? 's' : ''} currently signed in</div></div>
        <button class="btn-secondary btn-sm" style="color:var(--red);border-color:rgba(239,68,68,0.3)" onclick="alert('All other sessions have been revoked.')">Sign Out All Others</button>
      </div>
      ${d.sessions.map(function(s, i) {
        return `
          <div class="det-session-row">
            <div class="det-session-icon">${DET_DEVICE_ICONS[s.icon] || DET_DEVICE_ICONS.laptop}</div>
            <div class="det-session-info">
              <div class="det-session-device">${s.device}</div>
              <div class="det-session-meta">${s.browser} · ${s.location}</div>
            </div>
            <div class="det-session-badge ${s.lastSeen === 'Now' ? 'is-now' : ''}">${s.lastSeen === 'Now' ? '● Active now' : s.lastSeen}</div>
            ${s.lastSeen !== 'Now' ? `<button class="det-revoke-btn" onclick="revokeSession(${i})">Revoke</button>` : ''}
          </div>`;
      }).join('')}
    </div>

    <div class="det-section">
      <div class="det-section-hd">
        <div><div class="det-section-title">Recent Login History</div><div class="det-section-sub">Last 5 access events</div></div>
      </div>
      <div class="table-wrap">
        <table style="font-size:12px" aria-label="Login history">
          <thead>
            <tr>
              <th>Date &amp; Time</th>
              <th>Device</th>
              <th>Location</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${d.loginHistory.map(function(l) {
              return `<tr>
                <td style="color:var(--text-2)">${l.date}</td>
                <td>${l.device}</td>
                <td style="color:var(--text-2)">${l.location}</td>
                <td><span class="det-status-badge is-${l.status}">${l.status === 'success' ? '✓ Success' : '✕ Failed'}</span></td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
      ${failedLogin ? `
        <div style="margin-top:14px;padding:10px 14px;background:var(--red-dim);border:1px solid rgba(239,68,68,0.2);border-radius:8px;font-size:12px;color:var(--red);display:flex;align-items:flex-start;gap:8px">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="flex-shrink:0;margin-top:1px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          A failed login attempt was detected on 22 Feb 2026 from Paris, France. If this wasn't you, please contact your adviser immediately.
        </div>` : ''}
    </div>`;
}

function toggleTwoFA() {
  detailsState.data.twoFA = !detailsState.data.twoFA;
  renderDetailsContent();
}

function revokeSession(idx) {
  detailsState.data.sessions.splice(idx, 1);
  renderDetailsContent();
}

/* ──────────────────────────────────────────────────────── */
/* TAB 4: PREFERENCES                                       */
/* ──────────────────────────────────────────────────────── */

var DET_NOTIF_CHANNELS = [
  { key: 'email', label: 'Email' },
  { key: 'sms',   label: 'SMS' },
  { key: 'inapp', label: 'In-App' },
];

var DET_NOTIF_ROWS = [
  { key: 'statements', label: 'Monthly Statements',    sub: 'Portfolio & account statements' },
  { key: 'trades',     label: 'Trade Confirmations',   sub: 'Buy and sell confirmations' },
  { key: 'markets',    label: 'Market Alerts',         sub: 'Significant market movements' },
  { key: 'reviews',    label: 'Quarterly Reviews',     sub: 'Adviser review notifications' },
  { key: 'system',     label: 'System Announcements',  sub: 'Platform updates & maintenance' },
];

function renderPrefsTab() {
  var d = detailsState.data;
  var cEdit = detailsState.editing.has('comm');

  var notifGrid = `
    <div class="det-notif-wrap">
      <div class="det-notif-header">
        <div class="det-notif-label-col">Notification</div>
        ${DET_NOTIF_CHANNELS.map(function(ch) { return `<div class="det-notif-ch-col">${ch.label}</div>`; }).join('')}
      </div>
      ${DET_NOTIF_ROWS.map(function(row) {
        return `
          <div class="det-notif-item">
            <div class="det-notif-label-col">
              <div class="det-notif-name">${row.label}</div>
              <div class="det-notif-desc">${row.sub}</div>
            </div>
            ${DET_NOTIF_CHANNELS.map(function(ch) {
              return `<div class="det-notif-ch-col">
                <label class="det-toggle">
                  <input type="checkbox" ${d.notif[ch.key][row.key]?'checked':''} onchange="togglePref('notif.${ch.key}.${row.key}')">
                  <span class="det-toggle-slider"></span>
                </label>
              </div>`;
            }).join('')}
          </div>`;
      }).join('')}
    </div>`;

  var commFields = cEdit ? `
    ${detRow('Language', null, `<select class="det-select" data-field="language">
      <option ${d.language==='English'?'selected':''}>English</option>
      <option ${d.language==='Welsh'?'selected':''}>Welsh</option>
    </select>`)}
    ${detRow('Time Zone', null, `<select class="det-select" data-field="timezone">
      <option value="Europe/London" ${d.timezone==='Europe/London'?'selected':''}>Europe/London (GMT)</option>
      <option value="America/New_York" ${d.timezone==='America/New_York'?'selected':''}>America/New_York (EST)</option>
      <option value="America/Los_Angeles" ${d.timezone==='America/Los_Angeles'?'selected':''}>America/Los_Angeles (PST)</option>
    </select>`)}
  ` : `
    ${detRow('Language', d.language)}
    ${detRow('Time Zone', d.timezone === 'Europe/London' ? 'Europe/London (GMT)' : d.timezone)}
  `;

  return `
    <div class="det-section" style="margin-bottom:16px">
      <div class="det-section-hd">
        <div><div class="det-section-title">Notification Preferences</div><div class="det-section-sub">Choose how you receive alerts and updates</div></div>
      </div>
      ${notifGrid}
    </div>

    <div class="det-two-col-equal">
      <div id="det-section-comm" class="det-section">
        ${detSectionHd('Communication Preferences', '', 'comm', cEdit)}
        <div class="det-toggle-row">
          <div>
            <div class="det-toggle-label">Paperless Statements</div>
            <div class="det-toggle-sub">Receive all documents electronically</div>
          </div>
          <label class="det-toggle">
            <input type="checkbox" ${d.paperless?'checked':''} onchange="togglePaperless()">
            <span class="det-toggle-slider"></span>
          </label>
        </div>
        <div class="det-field-list" style="margin-top:4px">${commFields}</div>
      </div>

      <div class="det-section">
        <div class="det-section-hd">
          <div><div class="det-section-title">Privacy & Marketing</div><div class="det-section-sub">Your data preferences</div></div>
        </div>
        <div class="det-toggle-row">
          <div>
            <div class="det-toggle-label">Marketing Emails</div>
            <div class="det-toggle-sub">Newsletters, insights and product updates</div>
          </div>
          <label class="det-toggle">
            <input type="checkbox" ${d.marketing?'checked':''} onchange="togglePref('marketing')">
            <span class="det-toggle-slider"></span>
          </label>
        </div>
        <div class="det-toggle-row">
          <div>
            <div class="det-toggle-label">Third-Party Data Sharing</div>
            <div class="det-toggle-sub">Share data with trusted partners only</div>
          </div>
          <label class="det-toggle">
            <input type="checkbox" ${d.thirdParty?'checked':''} onchange="togglePref('thirdParty')">
            <span class="det-toggle-slider"></span>
          </label>
        </div>
        <div class="det-toggle-row">
          <div>
            <div class="det-toggle-label">Analytics</div>
            <div class="det-toggle-sub">Help us improve our platform</div>
          </div>
          <label class="det-toggle">
            <input type="checkbox" ${d.analytics?'checked':''} onchange="togglePref('analytics')">
            <span class="det-toggle-slider"></span>
          </label>
        </div>
        <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--divider)">
          <button class="btn-secondary btn-sm">
            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export My Data (GDPR)
          </button>
        </div>
        <div class="det-danger-zone">
          <div class="det-danger-title">Danger Zone</div>
          <button class="det-danger-link" onclick="alert('Please contact your adviser to request account closure.')">Request Account Closure</button>
        </div>
      </div>
    </div>`;
}

function togglePref(path) {
  var val = detGetNested(detailsState.data, path);
  detSetNested(detailsState.data, path, !val);
  renderDetailsContent();
}

function togglePaperless() {
  detailsState.data.paperless = !detailsState.data.paperless;
  renderDetailsContent();
}

/* ─── CONTACT PAGE ───────────────────────────────────────────── */

let contactState = {
  formStatus: 'idle',  // 'idle' | 'sending' | 'sent'
  formRef: '',
  formData: { type: '', subject: '', message: '', response: 'email', urgency: 'routine' },
};

function buildContactPage() {
  renderContactHero();
  renderContactStrip();
  renderContactMain();
  renderContactNumbers();
  renderContactTrust();
}

/* ── Section 1: Quick-contact hero ── */
function renderContactHero() {
  var d = userData;
  var adviserInitials = d.adviser.split(' ').map(function(w){ return w[0]; }).join('').slice(0,2);
  document.getElementById('contact-hero').innerHTML = `
    <div class="contact-hero-grid">
      <div class="contact-action-tile">
        <div class="contact-action-icon">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"/>
          </svg>
        </div>
        <div class="contact-action-title">Call Us</div>
        <div class="contact-action-sub">0800 123 4567</div>
        <div class="contact-action-desc">Freephone Client Services line, available Monday to Friday, 8am – 6pm.</div>
        <button class="btn-secondary btn-sm" style="width:fit-content" onclick="alert('Call 0800 123 4567')">Call Now</button>
      </div>
      <div class="contact-action-tile">
        <div class="contact-action-icon">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"/>
          </svg>
        </div>
        <div class="contact-action-title">Message Your Adviser</div>
        <div class="contact-action-sub">${d.adviser}</div>
        <div class="contact-action-desc">Send a secure, encrypted message directly to your dedicated relationship manager.</div>
        <button class="btn-secondary btn-sm" style="width:fit-content" onclick="contactScrollToForm('message')">Send Message</button>
      </div>
      <div class="contact-action-tile">
        <div class="contact-action-icon">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"/>
          </svg>
        </div>
        <div class="contact-action-title">Schedule a Meeting</div>
        <div class="contact-action-sub">Request a Callback</div>
        <div class="contact-action-desc">We'll call you back at a time that suits your schedule, typically within 2 business hours.</div>
        <button class="btn-secondary btn-sm" style="width:fit-content" onclick="contactScrollToForm('callback')">Request Callback</button>
      </div>
    </div>`;
}

/* ── Section 2: Three-col strip ── */
function renderContactStrip() {
  var d = userData;
  var parts = d.adviser.split(' ');
  var initials = parts.map(function(p){ return p[0]; }).join('').slice(0,2).toUpperCase();
  document.getElementById('contact-strip').innerHTML = `
    <div class="contact-strip">
      <!-- Adviser card -->
      <div class="card card-pad">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--text-3);margin-bottom:16px">Your Dedicated Adviser</div>
        <div class="contact-adviser-row">
          <div class="contact-adviser-avatar">${initials}</div>
          <div>
            <div class="contact-adviser-name">${d.adviser}</div>
            <div class="contact-adviser-role">Senior Wealth Manager</div>
          </div>
        </div>
        <div class="det-field-list">
          <div class="det-field-row">
            <span class="det-field-label">Direct Line</span>
            <span class="det-field-val">+44 20 7946 0155</span>
          </div>
          <div class="det-field-row">
            <span class="det-field-label">Email</span>
            <span class="det-field-val">${d.adviserEmail}</span>
          </div>
        </div>
        <div class="contact-avail-row">
          <div class="contact-avail-dot"></div>
          Available today &nbsp;·&nbsp; Mon–Fri, 9am – 5pm
        </div>
        <div style="margin-top:16px">
          <button class="btn-secondary btn-sm" onclick="contactScrollToForm('adviser')">Send a Message</button>
        </div>
      </div>
      <!-- Office card -->
      <div class="card card-pad">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--text-3);margin-bottom:16px">London Office</div>
        <div class="contact-office-addr">
          <strong style="color:var(--text-1)">Aurelius Wealth Management</strong><br>
          One Cavendish Square<br>
          London, W1G 0LD<br>
          United Kingdom
        </div>
        <div class="contact-office-row">
          <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"/></svg>
          +44 20 7946 0100
        </div>
        <div class="contact-office-row">
          <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/></svg>
          london@aurelius.co.uk
        </div>
        <a href="https://maps.google.com/?q=Cavendish+Square+London+W1G" target="_blank" rel="noopener" class="contact-dir-link">
          Get Directions
          <svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
        </a>
        <div><span class="contact-office-chip">
          <svg width="9" height="9" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"/></svg>
          FCA Authorised · Ref 987654
        </span></div>
      </div>
      <!-- Hours card -->
      <div class="card card-pad">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--text-3);margin-bottom:16px">Business Hours</div>
        <div class="contact-hours-row"><span class="contact-hours-day">Monday – Thursday</span><span class="contact-hours-time">8:00 am – 6:00 pm</span></div>
        <div class="contact-hours-row"><span class="contact-hours-day">Friday</span><span class="contact-hours-time">8:00 am – 5:00 pm</span></div>
        <div class="contact-hours-row"><span class="contact-hours-day">Saturday</span><span class="contact-hours-closed">Closed</span></div>
        <div class="contact-hours-row"><span class="contact-hours-day">Sunday</span><span class="contact-hours-closed">Closed</span></div>
        <div class="contact-hours-row" style="font-size:11px;color:var(--text-3);border-bottom:none;padding-top:4px">All times GMT / BST</div>
        <div class="contact-emergency">
          <div class="contact-emerg-dot"></div>
          <div>
            <strong style="color:var(--text-1)">24/7 Emergency Line</strong><br>
            <span style="font-family:var(--font-serif);color:var(--gold)">0800 999 8765</span>
          </div>
        </div>
      </div>
    </div>`;
}

/* ── Section 3: Enquiry form + SVG map ── */
function renderContactMain() {
  document.getElementById('contact-main').innerHTML = `
    <div class="contact-main-grid">
      <div class="card card-pad" id="contact-form-card">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--text-3);margin-bottom:20px">Send an Enquiry</div>
        <div class="contact-form-wrap" id="contact-form-wrap">
          ${renderContactForm()}
        </div>
      </div>
      <div class="card card-pad">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--text-3);margin-bottom:14px">Our Location</div>
        <div class="contact-map-wrap">${contactSVGMap()}</div>
        <div class="contact-getting-there">
          <div style="font-size:11px;font-weight:600;color:var(--text-2);text-transform:uppercase;letter-spacing:0.8px;margin-bottom:2px">Getting There</div>
          <div class="contact-getting-row">
            <span class="contact-getting-icon">🚇</span>
            <span><strong style="color:var(--text-1)">Oxford Circus</strong> (2 min walk) · Victoria, Central, Bakerloo lines<br>
            <strong style="color:var(--text-1)">Bond Street</strong> (5 min walk) · Central, Jubilee lines</span>
          </div>
          <div class="contact-getting-row">
            <span class="contact-getting-icon">🚌</span>
            <span>Routes <strong style="color:var(--text-1)">10, 55, 98, C2</strong> — Oxford Street stop (2 min walk)</span>
          </div>
          <div class="contact-getting-row">
            <span class="contact-getting-icon">🅿</span>
            <span><strong style="color:var(--text-1)">Q-Park Cavendish Square</strong>, NCP on Wimpole Street</span>
          </div>
        </div>
      </div>
    </div>`;
}

function renderContactForm() {
  var s = contactState;
  if (s.formStatus === 'sent') {
    return `
      <div style="display:flex;flex-direction:column;align-items:center;text-align:center;padding:24px 0;gap:14px">
        <div class="contact-sent-icon">
          <svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg>
        </div>
        <div class="contact-sent-title">Message Received</div>
        <div class="contact-ref">Ref: AW-2026-${s.formRef}</div>
        <div class="contact-sent-note">${userData.adviser} will respond to your enquiry within 1 business day. You will receive a confirmation to ${userData.emailPrimary}.</div>
        <button class="btn-secondary" onclick="resetContactForm()">Send Another Enquiry</button>
      </div>`;
  }
  var fd = s.formData;
  return `
    ${s.formStatus === 'sending' ? `
    <div class="contact-form-overlay">
      <div class="contact-spinner"></div>
      <div style="font-family:var(--font-serif);font-size:18px;color:var(--text-1)">Sending securely…</div>
      <div style="font-size:12px;color:var(--text-3)">Please wait a moment</div>
    </div>` : ''}
    <div style="display:flex;flex-direction:column;gap:16px">
      <div>
        <label style="font-size:12px;color:var(--text-3);font-weight:500;display:block;margin-bottom:6px">Enquiry Type</label>
        <select class="det-select" id="cf-type" onchange="contactState.formData.type=this.value">
          <option value="" ${!fd.type?'selected':''} disabled>Select enquiry type…</option>
          <option value="investment" ${fd.type==='investment'?'selected':''}>Investment Query</option>
          <option value="admin" ${fd.type==='admin'?'selected':''}>Account Administration</option>
          <option value="tax" ${fd.type==='tax'?'selected':''}>Tax &amp; Planning</option>
          <option value="products" ${fd.type==='products'?'selected':''}>New Products &amp; Services</option>
          <option value="complaint" ${fd.type==='complaint'?'selected':''}>Complaint</option>
          <option value="general" ${fd.type==='general'?'selected':''}>General Enquiry</option>
        </select>
      </div>
      <div>
        <label style="font-size:12px;color:var(--text-3);font-weight:500;display:block;margin-bottom:6px">Subject</label>
        <input class="det-input" type="text" id="cf-subject" placeholder="Brief subject of your enquiry" value="${fd.subject}" oninput="contactState.formData.subject=this.value">
      </div>
      <div>
        <label style="font-size:12px;color:var(--text-3);font-weight:500;display:block;margin-bottom:6px">Message</label>
        <textarea class="contact-textarea" id="cf-message" placeholder="Please describe your enquiry in as much detail as you're comfortable sharing…" maxlength="1000" oninput="contactState.formData.message=this.value;document.getElementById('cf-charcount').textContent=this.value.length+'/1000'">${fd.message}</textarea>
        <div class="contact-char-count" id="cf-charcount">${fd.message.length}/1000</div>
      </div>
      <div>
        <label style="font-size:12px;color:var(--text-3);font-weight:500;display:block;margin-bottom:8px">Preferred Response Method</label>
        <div class="contact-seg">
          <button class="contact-seg-btn ${fd.response==='email'?'is-active':''}" onclick="setContactResponse('email')">Email</button>
          <button class="contact-seg-btn ${fd.response==='phone'?'is-active':''}" onclick="setContactResponse('phone')">Phone</button>
          <button class="contact-seg-btn ${fd.response==='secure'?'is-active':''}" onclick="setContactResponse('secure')">Secure Message</button>
        </div>
      </div>
      <div>
        <label style="font-size:12px;color:var(--text-3);font-weight:500;display:block;margin-bottom:8px">Urgency</label>
        <div class="contact-seg">
          <button class="contact-seg-btn ${fd.urgency==='routine'?'is-active':''}" onclick="setContactUrgency('routine')">Routine</button>
          <button class="contact-seg-btn ${fd.urgency==='soon'?'is-active':''}" onclick="setContactUrgency('soon')">Within 24 Hours</button>
          <button class="contact-seg-btn ${fd.urgency==='urgent'?'is-active':''}" onclick="setContactUrgency('urgent')">Urgent</button>
        </div>
      </div>
      <button class="btn-primary" style="width:100%;justify-content:center" onclick="submitContactForm()">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin-right:6px"><path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"/></svg>
        Send Enquiry Securely
      </button>
      <div class="contact-lock-note">
        <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"/></svg>
        256-bit TLS encrypted &nbsp;·&nbsp; Reference number issued on submission &nbsp;·&nbsp; Response within 1 business day
      </div>
    </div>`;
}

function submitContactForm() {
  var fd = contactState.formData;
  if (!fd.type || !fd.subject || !fd.message) {
    alert('Please complete all required fields before sending.');
    return;
  }
  contactState.formStatus = 'sending';
  document.getElementById('contact-form-wrap').innerHTML = renderContactForm();
  setTimeout(function() {
    contactState.formRef = String(Math.floor(100000 + Math.random() * 900000));
    contactState.formStatus = 'sent';
    document.getElementById('contact-form-wrap').innerHTML = renderContactForm();
  }, 1400);
}

function resetContactForm() {
  contactState.formStatus = 'idle';
  contactState.formRef = '';
  contactState.formData = { type: '', subject: '', message: '', response: 'email', urgency: 'routine' };
  document.getElementById('contact-form-wrap').innerHTML = renderContactForm();
}

function setContactResponse(val) {
  contactState.formData.response = val;
  document.getElementById('contact-form-wrap').innerHTML = renderContactForm();
}

function setContactUrgency(val) {
  contactState.formData.urgency = val;
  document.getElementById('contact-form-wrap').innerHTML = renderContactForm();
}

function contactScrollToForm(preset) {
  var el = document.getElementById('contact-form-card');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (preset === 'message') {
    setTimeout(function() {
      var sel = document.getElementById('cf-type');
      if (sel) { sel.value = 'general'; contactState.formData.type = 'general'; }
    }, 400);
  } else if (preset === 'callback') {
    setTimeout(function() {
      var sel = document.getElementById('cf-type');
      if (sel) { sel.value = 'general'; contactState.formData.type = 'general'; }
      contactState.formData.response = 'phone';
      document.getElementById('contact-form-wrap').innerHTML = renderContactForm();
    }, 400);
  } else if (preset === 'adviser') {
    setTimeout(function() {
      var sel = document.getElementById('cf-type');
      if (sel) { sel.value = 'general'; contactState.formData.type = 'general'; }
    }, 400);
  }
}

/* ── Section 4: Contact numbers ── */
function renderContactNumbers() {
  var nums = [
    { label: 'Client Services',  val: '0800 123 4567',    sub: 'Freephone · Mon–Fri 8am–6pm',  emerg: false },
    { label: 'Investment Desk',  val: '+44 20 7946 0100', sub: 'Direct line · Mon–Fri 8am–6pm', emerg: false },
    { label: 'Tax & Planning',   val: '+44 20 7946 0102', sub: 'By appointment',                emerg: false },
    { label: 'Portfolio Admin',  val: '+44 20 7946 0103', sub: 'Mon–Fri 9am–5pm',               emerg: false },
    { label: 'Complaints',       val: '+44 20 7946 0199', sub: 'FCA regulated process',          emerg: false },
    { label: 'Emergency (24/7)', val: '0800 999 8765',    sub: 'Always available',               emerg: true  },
  ];
  document.getElementById('contact-numbers').innerHTML = `
    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--text-3);margin-bottom:14px">All Contact Numbers</div>
    <div class="contact-numbers-grid">
      ${nums.map(function(n) { return `
        <div class="contact-num-card">
          <div class="contact-num-label">${n.label}</div>
          <div class="contact-num-val${n.emerg?' emerg':''}">
            ${n.emerg ? '<div class="contact-emerg-dot"></div>' : ''}
            ${n.val}
          </div>
          <div class="contact-num-sub">${n.sub}</div>
        </div>`;
      }).join('')}
    </div>`;
}

/* ── Section 5: Trust strip ── */
function renderContactTrust() {
  document.getElementById('contact-trust').innerHTML = `
    <div class="contact-trust-grid">
      <div class="contact-trust-item">
        <div class="contact-trust-icon">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"/></svg>
        </div>
        <div class="contact-trust-text">
          <div class="contact-trust-title">Secure Communications</div>
          <div class="contact-trust-sub">All messages encrypted with 256-bit TLS. ISO 27001 certified infrastructure.</div>
        </div>
      </div>
      <div class="contact-trust-item">
        <div class="contact-trust-icon">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"/></svg>
        </div>
        <div class="contact-trust-text">
          <div class="contact-trust-title">FCA Authorised &amp; Regulated</div>
          <div class="contact-trust-sub">Aurelius Wealth Management Ltd. FCA Register No. 987654.</div>
        </div>
      </div>
      <div class="contact-trust-item">
        <div class="contact-trust-icon">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3c-4.97 0-9 3.578-9 8 0 2.04.78 3.91 2.07 5.34L3 21l4.84-1.29A9.33 9.33 0 0 0 12 21c4.97 0 9-3.578 9-8s-4.03-8-9-8Z"/></svg>
        </div>
        <div class="contact-trust-text">
          <div class="contact-trust-title">FSCS Protected</div>
          <div class="contact-trust-sub">Eligible deposits protected up to £85,000 per person by the Financial Services Compensation Scheme.</div>
        </div>
      </div>
    </div>`;
}

/* ── SVG Map of Cavendish Square area ── */
function contactSVGMap() {
  return `<svg class="contact-map-svg" viewBox="0 0 320 260" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="320" height="260" fill="var(--bg-input)"/>

  <!-- Street grid -->
  <!-- Oxford Street - major east-west -->
  <line x1="0" y1="228" x2="320" y2="228" stroke="var(--text-3)" stroke-width="2.5" opacity="0.6"/>
  <!-- Wigmore Street -->
  <line x1="0" y1="130" x2="260" y2="130" stroke="var(--text-3)" stroke-width="1" opacity="0.4"/>
  <!-- Cavendish Place -->
  <line x1="60" y1="175" x2="220" y2="175" stroke="var(--text-3)" stroke-width="1" opacity="0.35"/>
  <!-- Harley Street - vertical -->
  <line x1="62" y1="80" x2="62" y2="255" stroke="var(--text-3)" stroke-width="1" opacity="0.4"/>
  <!-- Portland Place - vertical -->
  <line x1="218" y1="36" x2="218" y2="228" stroke="var(--text-3)" stroke-width="1" opacity="0.4"/>
  <!-- Regent Street - angled -->
  <line x1="245" y1="228" x2="285" y2="36" stroke="var(--text-3)" stroke-width="1.5" opacity="0.45"/>
  <!-- New Cavendish St -->
  <line x1="62" y1="100" x2="218" y2="100" stroke="var(--text-3)" stroke-width="1" opacity="0.3"/>
  <!-- Henrietta Place -->
  <line x1="62" y1="152" x2="218" y2="152" stroke="var(--text-3)" stroke-width="0.8" opacity="0.3"/>

  <!-- Cavendish Square park -->
  <rect x="88" y="140" width="96" height="60" rx="5" fill="var(--gold-dim)" stroke="var(--gold-glow)" stroke-width="1.5"/>
  <text x="136" y="174" text-anchor="middle" font-size="5.5" fill="var(--gold)" font-family="sans-serif" font-weight="600" letter-spacing="0.5">CAVENDISH SQ</text>

  <!-- Block fills for realism -->
  <rect x="62" y="100" width="26" height="40" rx="2" fill="var(--border)" opacity="0.5"/>
  <rect x="100" y="100" width="36" height="32" rx="2" fill="var(--border)" opacity="0.5"/>
  <rect x="148" y="100" width="30" height="32" rx="2" fill="var(--border)" opacity="0.5"/>
  <rect x="190" y="100" width="28" height="32" rx="2" fill="var(--border)" opacity="0.4"/>
  <rect x="62" y="185" width="24" height="28" rx="2" fill="var(--border)" opacity="0.4"/>
  <rect x="98" y="210" width="108" height="18" rx="2" fill="var(--border)" opacity="0.5"/>
  <rect x="218" y="140" width="26" height="60" rx="2" fill="var(--border)" opacity="0.45"/>

  <!-- Office pulse ring (animated) -->
  <circle cx="130" cy="168" r="14" fill="none" stroke="var(--gold)" stroke-width="1" class="map-pulse"/>
  <!-- Office pin -->
  <circle cx="130" cy="168" r="7" fill="var(--gold)" stroke="var(--bg-card)" stroke-width="1.5"/>
  <circle cx="130" cy="168" r="3" fill="var(--bg-card)"/>

  <!-- Tube station markers -->
  <!-- Oxford Circus -->
  <circle cx="245" cy="231" r="5" fill="#CC0000" stroke="var(--bg-input)" stroke-width="1.5"/>
  <text x="230" y="247" font-size="5.5" fill="var(--text-3)" font-family="sans-serif">Oxford Circus</text>
  <!-- Bond Street -->
  <circle cx="78" cy="231" r="5" fill="#CC0000" stroke="var(--bg-input)" stroke-width="1.5"/>
  <text x="54" y="247" font-size="5.5" fill="var(--text-3)" font-family="sans-serif">Bond Street</text>
  <!-- Regent's Park -->
  <circle cx="218" cy="40" r="5" fill="#CC0000" stroke="var(--bg-input)" stroke-width="1.5"/>
  <text x="186" y="35" font-size="5.5" fill="var(--text-3)" font-family="sans-serif">Regent's Park</text>

  <!-- Street labels -->
  <text x="148" y="222" font-size="6" fill="var(--text-3)" font-family="sans-serif" font-weight="600" letter-spacing="0.8" text-anchor="middle">OXFORD STREET</text>
  <text x="14" y="126" font-size="5.5" fill="var(--text-3)" font-family="sans-serif" letter-spacing="0.4">WIGMORE ST</text>
  <text x="265" y="126" font-size="5.5" fill="var(--text-3)" font-family="sans-serif" letter-spacing="0.4" text-anchor="middle" transform="rotate(-72 275 120)">REGENT ST</text>
  <text x="72" y="96" font-size="5" fill="var(--text-3)" font-family="sans-serif" opacity="0.7">PORTLAND PL</text>

  <!-- North arrow -->
  <polygon points="299,14 303,26 299,23 295,26" fill="var(--text-2)" opacity="0.7"/>
  <text x="299" y="32" font-size="6" fill="var(--text-3)" font-family="sans-serif" text-anchor="middle" font-weight="700">N</text>

  <!-- Office label callout -->
  <rect x="142" y="155" width="64" height="22" rx="4" fill="var(--bg-card)" stroke="var(--gold)" stroke-width="0.8" opacity="0.95"/>
  <text x="174" y="163.5" font-size="5" fill="var(--gold)" font-family="sans-serif" font-weight="700" text-anchor="middle">AURELIUS WEALTH</text>
  <text x="174" y="172" font-size="4.5" fill="var(--text-3)" font-family="sans-serif" text-anchor="middle">One Cavendish Square</text>
</svg>`;
}

/* ─── ADVISER MESSAGE DRAWER ─────────────────────────────────── */

let adviserMsgState = {
  status: 'idle',   // 'idle' | 'sending' | 'sent'
  ref:    '',
  urgency: 'routine',
};

function renderAdviserForm() {
  const el = document.getElementById('adv-form-body');
  if (!el) return;

  /* ── Sent confirmation ── */
  if (adviserMsgState.status === 'sent') {
    el.innerHTML = `
      <div class="adv-drawer-sent">
        <div class="adv-drawer-sent-icon">
          <svg width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div class="adv-drawer-sent-title">Message Sent</div>
        <div class="adv-drawer-sent-note">
          Your reference: <strong>${adviserMsgState.ref}</strong><br>
          James Whitmore will respond within 1 business day.
        </div>
        <button class="btn-secondary" style="margin-top:8px" onclick="resetAdviserMsg()">
          Send Another Message
        </button>
      </div>`;
    return;
  }

  /* ── Idle form ── */
  const urgencyOpts = [
    { val: 'routine', label: 'Routine' },
    { val: '24h',     label: 'Within 24 Hours' },
    { val: 'urgent',  label: 'Urgent' },
  ];

  el.style.position = 'relative';
  el.innerHTML = `
    <div>
      <label class="adv-drawer-label">Enquiry Type</label>
      <select class="det-select" style="width:100%">
        <option>Investment Query</option>
        <option>Account Administration</option>
        <option>Tax &amp; Planning</option>
        <option>New Products &amp; Services</option>
        <option>Complaint</option>
        <option>General Enquiry</option>
      </select>
    </div>
    <div>
      <label class="adv-drawer-label">Subject</label>
      <input class="det-input" style="width:100%;box-sizing:border-box"
             placeholder="Brief subject of your message" />
    </div>
    <div>
      <label class="adv-drawer-label">Message</label>
      <textarea class="contact-textarea" style="width:100%;box-sizing:border-box" rows="6"
                maxlength="1000"
                placeholder="Type your message to James Whitmore…"
                oninput="document.getElementById('adv-char').textContent=this.value.length+'/1000'">
      </textarea>
      <div class="contact-char-count" id="adv-char">0/1000</div>
    </div>
    <div>
      <label class="adv-drawer-label">Urgency</label>
      <div class="contact-seg">
        ${urgencyOpts.map(o =>
          `<button class="contact-seg-btn${adviserMsgState.urgency === o.val ? ' is-active' : ''}"
                   onclick="setAdviserUrgency('${o.val}')">${o.label}</button>`
        ).join('')}
      </div>
    </div>
    <button class="btn-primary" style="width:100%;margin-top:4px"
            onclick="submitAdviserMsg()">Send Secure Message</button>
    <div class="contact-lock-note">
      <svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
        <rect x="3" y="11" width="18" height="11" rx="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
      256-bit TLS encrypted · Ref number issued on submission
    </div>`;

  /* ── Sending overlay ── */
  if (adviserMsgState.status === 'sending') {
    const overlay = document.createElement('div');
    overlay.className = 'contact-form-overlay';
    overlay.style.borderRadius = '0';
    overlay.innerHTML = `
      <div class="contact-spinner"></div>
      <div style="font-family:var(--font-serif);font-size:18px;color:var(--text-1);letter-spacing:-0.3px">
        Sending securely…
      </div>`;
    el.appendChild(overlay);
  }
}

function submitAdviserMsg() {
  adviserMsgState.status = 'sending';
  renderAdviserForm();
  setTimeout(() => {
    adviserMsgState.status = 'sent';
    adviserMsgState.ref = 'AW-2026-' + Math.floor(100000 + Math.random() * 900000);
    renderAdviserForm();
  }, 1200);
}

function resetAdviserMsg() {
  adviserMsgState.status = 'idle';
  adviserMsgState.ref    = '';
  adviserMsgState.urgency = 'routine';
  renderAdviserForm();
}

function setAdviserUrgency(val) {
  adviserMsgState.urgency = val;
  renderAdviserForm();
}

/* ─── ADD INVESTMENT DRAWER ─────────────────────────────────────── */

let addInvestmentState = {
  status:  'idle',    // 'idle' | 'sending' | 'sent'
  ref:     '',
  method:  'amount',  // 'amount' | 'units'
  wrapper: 'isa',     // 'isa' | 'gia' | 'sipp' | 'jisa'
};

function renderAddInvestmentForm() {
  const el = document.getElementById('add-investment-body');
  if (!el) return;

  /* ── Sent confirmation ── */
  if (addInvestmentState.status === 'sent') {
    el.innerHTML = `
      <div style="text-align:center;padding:16px 0 8px">
        <div class="contact-sent-icon" style="margin:0 auto 16px">
          <svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div style="font-family:var(--font-serif);font-size:22px;color:var(--text-1);letter-spacing:-0.5px;margin-bottom:8px">
          Instruction Received
        </div>
        <div class="contact-ref">${addInvestmentState.ref}</div>
        <div style="font-size:13px;color:var(--text-2);line-height:1.6;margin:12px 0 24px">
          James Whitmore will review your investment instruction<br>within 1 business day.
        </div>
        <button class="btn-secondary" style="width:100%" onclick="resetAddInvestment()">
          Submit Another
        </button>
      </div>`;
    return;
  }

  /* ── Today's date for Trade Date default ── */
  const today = new Date().toISOString().split('T')[0];

  const wrapperOpts = [
    { val: 'isa',  label: 'ISA' },
    { val: 'gia',  label: 'GIA' },
    { val: 'sipp', label: 'SIPP' },
    { val: 'jisa', label: 'Junior ISA' },
  ];

  const methodOpts = [
    { val: 'amount', label: 'By Amount' },
    { val: 'units',  label: 'By Units' },
  ];

  el.innerHTML = `
    <!-- SECTION 1: Security -->
    <div class="add-inv-section">Security</div>

    <div style="display:flex;flex-direction:column;gap:12px">
      <div>
        <label class="adv-drawer-label">Fund / Security Name <span style="color:var(--red)">*</span></label>
        <input id="inv-name" class="det-input" style="width:100%;box-sizing:border-box"
               placeholder="e.g. Artisan Partners Global Value" />
      </div>
      <div>
        <label class="adv-drawer-label">ISIN</label>
        <input id="inv-isin" class="det-input" style="width:100%;box-sizing:border-box;font-family:monospace;letter-spacing:0.5px"
               placeholder="e.g. GB00B7FQLH15" maxlength="12" />
      </div>
      <div class="add-inv-row-2">
        <div>
          <label class="adv-drawer-label">Asset Type</label>
          <select id="inv-type" class="det-select" style="width:100%">
            <option>GBP Mutual Fund</option>
            <option>ETF</option>
            <option>UK Equity</option>
            <option>Global Equity</option>
            <option>Fixed Income</option>
            <option>Alternative</option>
            <option>Cash</option>
          </select>
        </div>
        <div>
          <label class="adv-drawer-label">Currency</label>
          <select id="inv-currency" class="det-select" style="width:100%">
            <option>GBP</option>
            <option>USD</option>
            <option>EUR</option>
            <option>JPY</option>
          </select>
        </div>
      </div>
    </div>

    <!-- SECTION 2: Account -->
    <div class="add-inv-section">Account &amp; Wrapper</div>

    <div class="contact-seg">
      ${wrapperOpts.map(o =>
        `<button class="contact-seg-btn${addInvestmentState.wrapper === o.val ? ' is-active' : ''}"
                 onclick="setInvWrapper('${o.val}')">${o.label}</button>`
      ).join('')}
    </div>

    <!-- SECTION 3: Trade Details -->
    <div class="add-inv-section">Trade Details</div>

    <div style="display:flex;flex-direction:column;gap:12px">
      <div>
        <label class="adv-drawer-label">Investment Method</label>
        <div class="contact-seg">
          ${methodOpts.map(o =>
            `<button class="contact-seg-btn${addInvestmentState.method === o.val ? ' is-active' : ''}"
                     onclick="setInvMethod('${o.val}')">${o.label}</button>`
          ).join('')}
        </div>
      </div>

      ${addInvestmentState.method === 'amount' ? `
      <div>
        <label class="adv-drawer-label">Investment Amount (£)</label>
        <input id="inv-amount" class="det-input" type="number" min="0" step="0.01"
               style="width:100%;box-sizing:border-box" placeholder="e.g. 10000"
               oninput="updateInvSummary()" />
      </div>` : `
      <div>
        <label class="adv-drawer-label">Number of Units</label>
        <input id="inv-units" class="det-input" type="number" min="0" step="0.0001"
               style="width:100%;box-sizing:border-box" placeholder="e.g. 430.00"
               oninput="updateInvSummary()" />
      </div>`}

      <div>
        <label class="adv-drawer-label">Unit Price (pence)</label>
        <input id="inv-price" class="det-input" type="number" min="0" step="0.01"
               style="width:100%;box-sizing:border-box" placeholder="e.g. 23.29"
               oninput="updateInvSummary()" />
      </div>

      <div id="inv-summary-wrap"></div>

      <div class="add-inv-row-2">
        <div>
          <label class="adv-drawer-label">Trade Date</label>
          <input id="inv-date" class="det-input" type="date"
                 style="width:100%;box-sizing:border-box" value="${today}" />
        </div>
        <div>
          <label class="adv-drawer-label">Dealing Instruction</label>
          <select id="inv-dealing" class="det-select" style="width:100%">
            <option>Market Order</option>
            <option>Limit Order</option>
          </select>
        </div>
      </div>
    </div>

    <!-- SECTION 4: Additional Instructions -->
    <div class="add-inv-section">Additional Instructions</div>

    <div>
      <textarea id="inv-notes" class="contact-textarea" style="width:100%;box-sizing:border-box" rows="4"
                maxlength="500" placeholder="Any specific instructions for your adviser…"
                oninput="document.getElementById('inv-char').textContent=this.value.length+'/500'"></textarea>
      <div class="contact-char-count" id="inv-char">0/500</div>
    </div>

    <button class="btn-primary" style="width:100%;margin-top:4px"
            onclick="submitAddInvestment()">Submit Investment Instruction</button>

    <div class="contact-lock-note">
      <svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
        <rect x="3" y="11" width="18" height="11" rx="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
      Routed securely to your adviser · Ref number issued on submission
    </div>`;

  /* ── Sending overlay ── */
  if (addInvestmentState.status === 'sending') {
    const overlay = document.createElement('div');
    overlay.className = 'contact-form-overlay';
    overlay.style.borderRadius = '0';
    overlay.innerHTML = `
      <div class="contact-spinner"></div>
      <div style="font-family:var(--font-serif);font-size:18px;color:var(--text-1);letter-spacing:-0.3px">
        Submitting securely…
      </div>`;
    el.appendChild(overlay);
  }
}

function updateInvSummary() {
  const wrap = document.getElementById('inv-summary-wrap');
  if (!wrap) return;

  const priceEl  = document.getElementById('inv-price');
  const amtEl    = document.getElementById('inv-amount');
  const unitsEl  = document.getElementById('inv-units');
  const price    = parseFloat(priceEl  && priceEl.value  ? priceEl.value  : '');
  const primary  = addInvestmentState.method === 'amount'
    ? parseFloat(amtEl   && amtEl.value   ? amtEl.value   : '')
    : parseFloat(unitsEl && unitsEl.value ? unitsEl.value : '');

  if (!isNaN(price) && price > 0 && !isNaN(primary) && primary > 0) {
    const pricePounds = price / 100;
    if (addInvestmentState.method === 'amount') {
      const estUnits = (primary / pricePounds).toLocaleString('en-GB', { maximumFractionDigits: 2 });
      wrap.innerHTML = `
        <div class="add-inv-summary">
          <div>
            <div class="add-inv-summary-label">Estimated Units</div>
            <div class="add-inv-summary-val">${estUnits}</div>
          </div>
          <div style="text-align:right">
            <div class="add-inv-summary-label">At Price</div>
            <div class="add-inv-summary-val">${price}p</div>
          </div>
        </div>`;
    } else {
      const estCost = (primary * pricePounds).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      wrap.innerHTML = `
        <div class="add-inv-summary">
          <div>
            <div class="add-inv-summary-label">Estimated Cost</div>
            <div class="add-inv-summary-val">£${estCost}</div>
          </div>
          <div style="text-align:right">
            <div class="add-inv-summary-label">At Price</div>
            <div class="add-inv-summary-val">${price}p</div>
          </div>
        </div>`;
    }
  } else {
    wrap.innerHTML = '';
  }
}

function submitAddInvestment() {
  addInvestmentState.status = 'sending';
  renderAddInvestmentForm();
  setTimeout(() => {
    addInvestmentState.status = 'sent';
    addInvestmentState.ref = 'AW-' + new Date().getFullYear() + '-' + Math.floor(100000 + Math.random() * 900000);
    renderAddInvestmentForm();
  }, 1200);
}

function resetAddInvestment() {
  addInvestmentState.status  = 'idle';
  addInvestmentState.ref     = '';
  addInvestmentState.method  = 'amount';
  addInvestmentState.wrapper = 'isa';
  renderAddInvestmentForm();
}

function setInvMethod(val) {
  addInvestmentState.method = val;
  renderAddInvestmentForm();
}

function setInvWrapper(val) {
  addInvestmentState.wrapper = val;
  renderAddInvestmentForm();
}

/* ─── ADD FUND DRAWER ───────────────────────────────────────────── */

let addFundState = {
  status:      'idle',    // 'idle' | 'sending' | 'sent'
  ref:         '',
  txType:      'buy',     // 'buy' | 'switch' | 'transfer' | 'regular'
  method:      'amount',  // 'amount' | 'units'
  wrapper:     'sipp',    // 'sipp' | 'isa' | 'gia' | 'jisa'
  suitability: false,
};

function renderAddFundForm() {
  const el = document.getElementById('add-fund-body');
  if (!el) return;

  /* ── Sent confirmation ── */
  if (addFundState.status === 'sent') {
    el.innerHTML = `
      <div style="text-align:center;padding:16px 0 8px">
        <div class="contact-sent-icon" style="margin:0 auto 16px">
          <svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div style="font-family:var(--font-serif);font-size:22px;color:var(--text-1);letter-spacing:-0.5px;margin-bottom:8px">
          Dealing Instruction Sent
        </div>
        <div class="contact-ref">${addFundState.ref}</div>
        <div style="font-size:13px;color:var(--text-2);line-height:1.6;margin:12px 0 24px">
          James Whitmore will review and action your instruction<br>within 1 business day. A confirmation note will be<br>added to your Document Library.
        </div>
        <button class="btn-secondary" style="width:100%" onclick="resetAddFund()">
          Submit Another Instruction
        </button>
      </div>`;
    return;
  }

  const today = new Date().toISOString().split('T')[0];

  const txOpts = [
    { val: 'buy',      label: 'Buy' },
    { val: 'switch',   label: 'Switch' },
    { val: 'transfer', label: 'Transfer In' },
    { val: 'regular',  label: 'Regular Savings' },
  ];

  const wrapperOpts = [
    { val: 'sipp', label: 'SIPP' },
    { val: 'isa',  label: 'ISA' },
    { val: 'gia',  label: 'GIA' },
    { val: 'jisa', label: 'Junior ISA' },
  ];

  const methodOpts = [
    { val: 'amount', label: 'By Amount' },
    { val: 'units',  label: 'By Units' },
  ];

  const holdingOptions = investments.map(inv =>
    `<option>${inv.name}</option>`
  ).join('');

  const showTradeBlock   = addFundState.txType === 'buy' || addFundState.txType === 'switch';
  const showRegularBlock = addFundState.txType === 'regular';

  el.innerHTML = `

    <!-- SECTION 1: Fund Details -->
    <div class="add-inv-section">Fund Details</div>

    <div style="display:flex;flex-direction:column;gap:12px">
      <div>
        <label class="adv-drawer-label">Fund / Security Name <span style="color:var(--red)">*</span></label>
        <input id="fund-name" class="det-input" style="width:100%;box-sizing:border-box"
               placeholder="e.g. Artisan Partners Global Value" />
      </div>
      <div class="add-inv-row-2">
        <div>
          <label class="adv-drawer-label">ISIN</label>
          <input id="fund-isin" class="det-input" style="width:100%;box-sizing:border-box;font-family:monospace;letter-spacing:0.5px"
                 placeholder="e.g. GB00B7FQLH15" maxlength="12" />
        </div>
        <div>
          <label class="adv-drawer-label">SEDOL</label>
          <input id="fund-sedol" class="det-input" style="width:100%;box-sizing:border-box;font-family:monospace;letter-spacing:0.5px"
                 placeholder="e.g. B7FQLH1" maxlength="7" />
        </div>
      </div>
      <div>
        <label class="adv-drawer-label">Fund House / Manager</label>
        <input id="fund-house" class="det-input" style="width:100%;box-sizing:border-box"
               placeholder="e.g. Artisan Partners" />
      </div>
      <div>
        <label class="adv-drawer-label">Share Class</label>
        <input id="fund-shareclass" class="det-input" style="width:100%;box-sizing:border-box"
               placeholder="e.g. Z GBP Accumulation" />
      </div>
    </div>

    <!-- SECTION 2: Classification -->
    <div class="add-inv-section">Classification</div>

    <div style="display:flex;flex-direction:column;gap:12px">
      <div class="add-inv-row-2">
        <div>
          <label class="adv-drawer-label">Asset Class</label>
          <select id="fund-assetclass" class="det-select" style="width:100%">
            <option>Equity</option>
            <option>Fixed Income</option>
            <option>Multi-Asset</option>
            <option>Alternative</option>
            <option>Money Market</option>
            <option>Property</option>
          </select>
        </div>
        <div>
          <label class="adv-drawer-label">Currency</label>
          <select id="fund-currency" class="det-select" style="width:100%">
            <option>GBP</option>
            <option>USD</option>
            <option>EUR</option>
            <option>JPY</option>
            <option>CHF</option>
          </select>
        </div>
      </div>
      <div>
        <label class="adv-drawer-label">Geographic Focus</label>
        <select id="fund-geo" class="det-select" style="width:100%">
          <option>Global</option>
          <option>UK</option>
          <option>North America</option>
          <option>European</option>
          <option>Asia Pacific</option>
          <option>Emerging Markets</option>
          <option>Japan</option>
          <option>Sector Specific</option>
        </select>
      </div>
    </div>

    <!-- SECTION 3: Transaction Type -->
    <div class="add-inv-section">Transaction Type</div>

    <div class="contact-seg" style="flex-wrap:wrap">
      ${txOpts.map(o =>
        `<button class="contact-seg-btn${addFundState.txType === o.val ? ' is-active' : ''}"
                 onclick="setFundTxType('${o.val}')">${o.label}</button>`
      ).join('')}
    </div>

    ${addFundState.txType === 'switch' ? `
    <div style="margin-top:12px">
      <label class="adv-drawer-label">Switch From (Existing Holding)</label>
      <select id="fund-switch-from" class="det-select" style="width:100%">
        ${holdingOptions}
      </select>
    </div>` : ''}

    ${addFundState.txType === 'transfer' ? `
    <div style="display:flex;flex-direction:column;gap:12px;margin-top:12px">
      <div>
        <label class="adv-drawer-label">Transferring Provider</label>
        <input id="fund-transfer-provider" class="det-input" style="width:100%;box-sizing:border-box"
               placeholder="e.g. Hargreaves Lansdown" />
      </div>
      <div class="add-inv-row-2">
        <div>
          <label class="adv-drawer-label">Approx. Transfer Value (£)</label>
          <input id="fund-transfer-value" class="det-input" type="number" min="0"
                 style="width:100%;box-sizing:border-box" placeholder="e.g. 50,000" />
        </div>
        <div>
          <label class="adv-drawer-label">Transfer Type</label>
          <select id="fund-transfer-type" class="det-select" style="width:100%">
            <option>In-Specie (as is)</option>
            <option>Cash Transfer</option>
          </select>
        </div>
      </div>
    </div>` : ''}

    <!-- SECTION 4: Account & Wrapper -->
    <div class="add-inv-section">Account &amp; Wrapper</div>

    <div class="contact-seg">
      ${wrapperOpts.map(o =>
        `<button class="contact-seg-btn${addFundState.wrapper === o.val ? ' is-active' : ''}"
                 onclick="setFundWrapper('${o.val}')">${o.label}</button>`
      ).join('')}
    </div>

    ${showTradeBlock ? `
    <!-- SECTION 5: Trade Execution -->
    <div class="add-inv-section">Trade Execution</div>

    <div style="display:flex;flex-direction:column;gap:12px">
      <div>
        <label class="adv-drawer-label">Investment Method</label>
        <div class="contact-seg">
          ${methodOpts.map(o =>
            `<button class="contact-seg-btn${addFundState.method === o.val ? ' is-active' : ''}"
                     onclick="setFundMethod('${o.val}')">${o.label}</button>`
          ).join('')}
        </div>
      </div>

      ${addFundState.method === 'amount' ? `
      <div>
        <label class="adv-drawer-label">Investment Amount (£)</label>
        <input id="fund-amount" class="det-input" type="number" min="0" step="0.01"
               style="width:100%;box-sizing:border-box" placeholder="e.g. 25,000"
               oninput="updateFundSummary()" />
      </div>` : `
      <div>
        <label class="adv-drawer-label">Number of Units</label>
        <input id="fund-units" class="det-input" type="number" min="0" step="0.0001"
               style="width:100%;box-sizing:border-box" placeholder="e.g. 1,000.00"
               oninput="updateFundSummary()" />
      </div>`}

      <div>
        <label class="adv-drawer-label">Unit Price (pence) <span style="color:var(--text-3);font-weight:400">— optional, for limit orders</span></label>
        <input id="fund-price" class="det-input" type="number" min="0" step="0.01"
               style="width:100%;box-sizing:border-box" placeholder="e.g. 2,329.00"
               oninput="updateFundSummary()" />
      </div>

      <div id="fund-summary-wrap"></div>

      <div class="add-inv-row-2">
        <div>
          <label class="adv-drawer-label">Trade Date</label>
          <input id="fund-date" class="det-input" type="date"
                 style="width:100%;box-sizing:border-box" value="${today}" />
        </div>
        <div>
          <label class="adv-drawer-label">Settlement</label>
          <select id="fund-settlement" class="det-select" style="width:100%">
            <option>Standard (T+2)</option>
            <option>Next Dealing Day</option>
            <option>Specific Date</option>
          </select>
        </div>
      </div>
      <div>
        <label class="adv-drawer-label">Instruction Type</label>
        <select id="fund-instruction" class="det-select" style="width:100%">
          <option>Best Execution</option>
          <option>Market Order</option>
          <option>Limit Order</option>
          <option>Stop Loss</option>
        </select>
      </div>
    </div>` : ''}

    ${showRegularBlock ? `
    <!-- SECTION 5: Regular Savings -->
    <div class="add-inv-section">Regular Savings</div>

    <div style="display:flex;flex-direction:column;gap:12px">
      <div class="add-inv-row-2">
        <div>
          <label class="adv-drawer-label">Monthly Amount (£)</label>
          <input id="fund-regular-amount" class="det-input" type="number" min="0"
                 style="width:100%;box-sizing:border-box" placeholder="e.g. 500" />
        </div>
        <div>
          <label class="adv-drawer-label">Start Date</label>
          <input id="fund-regular-start" class="det-input" type="date"
                 style="width:100%;box-sizing:border-box" value="${today}" />
        </div>
      </div>
      <div>
        <label class="adv-drawer-label">Payment Method</label>
        <select id="fund-payment" class="det-select" style="width:100%">
          <option>Direct Debit</option>
          <option>Standing Order</option>
          <option>Cash Balance</option>
        </select>
      </div>
    </div>` : ''}

    <!-- SECTION 6: Risk & Suitability -->
    <div class="add-inv-section">Risk &amp; Suitability</div>

    <div class="add-fund-risk-strip">
      <div>
        <div class="add-inv-summary-label">Current Risk Profile</div>
        <div style="font-size:13px;font-weight:600;color:var(--text-1);margin-top:2px">Balanced Growth · Level 5 of 10</div>
      </div>
      <div class="add-fund-risk-bar">
        <div class="add-fund-risk-fill" style="width:50%"></div>
      </div>
    </div>

    <label class="add-fund-checkbox-row">
      <input type="checkbox" style="accent-color:var(--gold);width:16px;height:16px;flex-shrink:0;margin-top:1px"
             ${addFundState.suitability ? 'checked' : ''}
             onchange="addFundState.suitability=this.checked" />
      <span style="font-size:12px;color:var(--text-2);line-height:1.5">
        I confirm this fund aligns with my investment objectives and risk profile as documented in my most recent Suitability Report.
      </span>
    </label>

    <!-- SECTION 7: Additional Notes -->
    <div class="add-inv-section">Additional Notes</div>

    <div>
      <textarea id="fund-notes" class="contact-textarea" style="width:100%;box-sizing:border-box" rows="4"
                maxlength="500" placeholder="Any specific instructions or considerations for your adviser…"
                oninput="document.getElementById('fund-char').textContent=this.value.length+'/500'"></textarea>
      <div class="contact-char-count" id="fund-char">0/500</div>
    </div>

    <button class="btn-primary" style="width:100%;margin-top:4px"
            onclick="submitAddFund()">Submit Dealing Instruction</button>

    <div class="contact-lock-note">
      <svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
        <rect x="3" y="11" width="18" height="11" rx="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
      FCA regulated · Instructions recorded for audit purposes · Ref issued on submission
    </div>`;

  /* ── Sending overlay ── */
  if (addFundState.status === 'sending') {
    const overlay = document.createElement('div');
    overlay.className = 'contact-form-overlay';
    overlay.style.borderRadius = '0';
    overlay.innerHTML = `
      <div class="contact-spinner"></div>
      <div style="font-family:var(--font-serif);font-size:18px;color:var(--text-1);letter-spacing:-0.3px">
        Submitting instruction…
      </div>`;
    el.appendChild(overlay);
  }
}

function updateFundSummary() {
  const wrap    = document.getElementById('fund-summary-wrap');
  if (!wrap) return;
  const priceEl = document.getElementById('fund-price');
  const amtEl   = document.getElementById('fund-amount');
  const unitsEl = document.getElementById('fund-units');
  const price   = parseFloat(priceEl  && priceEl.value  ? priceEl.value  : '');
  const primary = addFundState.method === 'amount'
    ? parseFloat(amtEl   && amtEl.value   ? amtEl.value   : '')
    : parseFloat(unitsEl && unitsEl.value ? unitsEl.value : '');

  if (!isNaN(price) && price > 0 && !isNaN(primary) && primary > 0) {
    const pricePounds = price / 100;
    if (addFundState.method === 'amount') {
      const estUnits = (primary / pricePounds).toLocaleString('en-GB', { maximumFractionDigits: 2 });
      wrap.innerHTML = `
        <div class="add-inv-summary">
          <div><div class="add-inv-summary-label">Estimated Units</div><div class="add-inv-summary-val">${estUnits}</div></div>
          <div style="text-align:right"><div class="add-inv-summary-label">At Price</div><div class="add-inv-summary-val">${price}p</div></div>
        </div>`;
    } else {
      const estCost = (primary * pricePounds).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      wrap.innerHTML = `
        <div class="add-inv-summary">
          <div><div class="add-inv-summary-label">Estimated Cost</div><div class="add-inv-summary-val">£${estCost}</div></div>
          <div style="text-align:right"><div class="add-inv-summary-label">At Price</div><div class="add-inv-summary-val">${price}p</div></div>
        </div>`;
    }
  } else {
    wrap.innerHTML = '';
  }
}

function submitAddFund() {
  addFundState.status = 'sending';
  renderAddFundForm();
  setTimeout(() => {
    addFundState.status = 'sent';
    addFundState.ref = 'AW-' + new Date().getFullYear() + '-' + Math.floor(100000 + Math.random() * 900000);
    renderAddFundForm();
  }, 1200);
}

function resetAddFund() {
  addFundState.status      = 'idle';
  addFundState.ref         = '';
  addFundState.txType      = 'buy';
  addFundState.method      = 'amount';
  addFundState.wrapper     = 'sipp';
  addFundState.suitability = false;
  renderAddFundForm();
}

function setFundTxType(val) {
  addFundState.txType = val;
  renderAddFundForm();
}

function setFundMethod(val) {
  addFundState.method = val;
  renderAddFundForm();
}

function setFundWrapper(val) {
  addFundState.wrapper = val;
  renderAddFundForm();
}

/* ─── VALUATION HISTORY VIEW ──────────────────────────────────── */

function updateHistoryView(range) {
  const today  = historyData[historyData.length - 1].date;
  const cutoff = new Date(today);
  switch (range) {
    case '1D':  cutoff.setDate(cutoff.getDate() - 1);          break;
    case '1W':  cutoff.setDate(cutoff.getDate() - 7);          break;
    case '1M':  cutoff.setMonth(cutoff.getMonth() - 1);        break;
    case '3M':  cutoff.setMonth(cutoff.getMonth() - 3);        break;
    case '6M':  cutoff.setMonth(cutoff.getMonth() - 6);        break;
    case '1Y':  cutoff.setFullYear(cutoff.getFullYear() - 1);  break;
    default:    cutoff.setFullYear(2000);                       break; // ALL
  }
  const filtered = historyData.filter(r => r.date >= cutoff);
  if (!filtered.length) return;
  buildHistChart(filtered);
  buildHistKPIs(filtered, range);
  buildHistDateLabels(filtered);
  buildHistTable(filtered, range);
}

function buildHistChart(filtered) {
  const svg = document.getElementById('hist-chart');
  if (!svg) return;
  const w = 800, h = 260;
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);

  const base = filtered[0].value;
  const pts  = filtered.map(r => ((r.value - base) / base) * 100);

  const pad    = 20;
  const xStep  = (w - pad * 2) / Math.max(pts.length - 1, 1);
  const minV   = Math.min(...pts) - 1;
  const maxV   = Math.max(...pts) + 1;
  const yScale = v => h - pad - ((v - minV) / (maxV - minV)) * (h - pad * 2);

  const linePoints = pts.map((v, i) => `${pad + i * xStep},${yScale(v)}`).join(' ');
  const areaPoints = `${pad},${h - pad} ${linePoints} ${pad + (pts.length - 1) * xStep},${h - pad}`;

  // Up to 6 evenly-spaced vertical grid lines
  const gridCount = Math.min(pts.length - 1, 5);
  const gridStep  = Math.max(Math.floor((pts.length - 1) / gridCount), 1);
  const gridIdxs  = Array.from({ length: gridCount + 1 }, (_, k) => Math.min(k * gridStep, pts.length - 1));

  svg.innerHTML = `
    <defs>
      <linearGradient id="hist-chart-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#F5A623" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="#F5A623" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <polygon points="${areaPoints}" fill="url(#hist-chart-grad)"/>
    <polyline points="${linePoints}" fill="none" stroke="#F5A623" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${pad + (pts.length - 1) * xStep}" cy="${yScale(pts[pts.length - 1])}" r="4" fill="#F5A623" stroke="var(--bg-card)" stroke-width="2"/>
    ${gridIdxs.map(i =>
      `<line x1="${pad + i * xStep}" y1="${pad}" x2="${pad + i * xStep}" y2="${h - pad}" stroke="var(--divider)" stroke-width="1" stroke-dasharray="3,4"/>`
    ).join('')}
  `;
}

function buildHistKPIs(filtered, range) {
  const first = filtered[0];
  const last  = filtered[filtered.length - 1];
  const hi    = filtered.reduce((a, b) => b.value > a.value ? b : a);
  const lo    = filtered.reduce((a, b) => b.value < a.value ? b : a);

  const change     = last.value - first.value;
  const changePct  = ((change / first.value) * 100).toFixed(1);
  const up         = change >= 0;
  const rangeLabel = { '1D':'1D','1W':'1W','1M':'1M','3M':'3M','6M':'6M','1Y':'1Y','ALL':'All' }[range] || range;

  const fmt     = v => '£' + v.toLocaleString('en-GB');
  const fmtDate = d => d.toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });

  const valEl  = document.getElementById('hist-kpi-value');
  const chgEl  = document.getElementById('hist-kpi-change');
  const hiEl   = document.getElementById('hist-kpi-high');
  const hiDtEl = document.getElementById('hist-kpi-high-date');
  const loEl   = document.getElementById('hist-kpi-low');
  const loDtEl = document.getElementById('hist-kpi-low-date');

  if (valEl) valEl.textContent = fmt(last.value);
  if (chgEl) {
    const arrow = `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="${up ? '18 15 12 9 6 15' : '6 9 12 15 18 9'}"/></svg>`;
    chgEl.className = `kpi-change ${up ? 'up' : 'down'}`;
    chgEl.innerHTML = `${arrow}${up ? '+' : '-'}${fmt(Math.abs(change))} (${rangeLabel})`;
  }
  if (hiEl)   hiEl.textContent   = fmt(hi.value);
  if (hiDtEl) hiDtEl.textContent = fmtDate(hi.date);
  if (loEl)   loEl.textContent   = fmt(lo.value);
  if (loDtEl) loDtEl.textContent = fmtDate(lo.date);
}

function buildHistDateLabels(filtered) {
  const fmt = d => `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  const s = document.getElementById('hist-date-start');
  const e = document.getElementById('hist-date-end');
  if (s) s.textContent = fmt(filtered[0].date);
  if (e) e.textContent = fmt(filtered[filtered.length - 1].date);
}

function buildHistTable(filtered, range) {
  const titleEl = document.getElementById('hist-table-title');
  const bodyEl  = document.getElementById('hist-table-body');
  if (!bodyEl) return;

  const fmt     = v => '£' + v.toLocaleString('en-GB');
  const fmtDate = d => d.toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });

  let rows, title;

  const titleMap = {
    '1D': '1 Day Valuations', '1W': '1 Week Valuations', '1M': '1 Month Valuations',
    '3M': '3 Month Valuations', '6M': '6 Month Valuations',
    '1Y': '1 Year Valuations', 'ALL': 'All Time Valuations',
  };

  if (range === '1D' || range === '1W' || range === '1M') {
    title = titleMap[range];
    const daily = [...filtered].reverse();
    rows = daily.map((r, i) => {
      const prev = daily[i + 1];
      const ret  = prev ? ((r.value - prev.value) / prev.value) * 100 : 0;
      return { date: r.date, value: r.value, cash: r.cash, invested: r.invested, ret, up: ret >= 0 };
    });

  } else if (range === '3M') {
    title = titleMap[range];
    // Group by ISO week, take last entry per week
    const buckets = new Map();
    filtered.forEach(r => {
      const d   = r.date;
      const dow = d.getDay() || 7;
      const thu = new Date(d); thu.setDate(d.getDate() - dow + 4);
      const yr  = thu.getFullYear();
      const wk  = Math.ceil((((thu - new Date(yr, 0, 1)) / 864e5) + 1) / 7);
      buckets.set(`${yr}-W${String(wk).padStart(2,'0')}`, r);
    });
    const weekly = Array.from(buckets.values()).reverse();
    rows = weekly.map((r, i) => {
      const prev = weekly[i + 1];
      const ret  = prev ? ((r.value - prev.value) / prev.value) * 100 : 0;
      return { date: r.date, value: r.value, cash: r.cash, invested: r.invested, ret, up: ret >= 0 };
    });

  } else {
    title = titleMap[range] || 'Monthly Valuations';
    // Group by year-month, take last entry per month
    const buckets = new Map();
    filtered.forEach(r => {
      buckets.set(`${r.date.getFullYear()}-${String(r.date.getMonth()).padStart(2,'0')}`, r);
    });
    const monthly = Array.from(buckets.values()).reverse();
    rows = monthly.map((r, i) => {
      const prev = monthly[i + 1];
      const ret  = prev ? ((r.value - prev.value) / prev.value) * 100 : 0;
      return { date: r.date, value: r.value, cash: r.cash, invested: r.invested, ret, up: ret >= 0 };
    });
  }

  if (titleEl) titleEl.textContent = title;
  bodyEl.innerHTML = rows.map(r => `
    <tr>
      <td><div class="td-name">${fmtDate(r.date)}</div></td>
      <td>${fmt(r.value)}</td>
      <td>${fmt(r.cash)}</td>
      <td>${fmt(r.invested)}</td>
      <td><span class="gain-tag ${r.up ? 'is-up' : 'is-down'}">${r.up ? '▲' : '▼'} ${r.up ? '+' : ''}${r.ret.toFixed(2)}%</span></td>
    </tr>
  `).join('');
}

/* ─── ADD FUNDS PAGE ─────────────────────────────────────────────── */

const addFundsState = {
  step:   1,
  method: 'bank',
  amount: '',
  ref:    ''
};

const addFundsMethods = {
  bank: {
    label:   'Bank Transfer',
    sub:     'BACS',
    detail:  '2\u20133 working days \xb7 No fee',
    icon:    '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><rect x="2" y="8" width="20" height="12" rx="2"/><path d="M6 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"/><line x1="6" y1="14" x2="10" y2="14"/></svg>',
    from:    'HSBC \xb7\xb7\xb7\xb74821',
    arrival: '2\u20133 working days',
    fee:     '\xa30.00'
  },
  chaps: {
    label:   'Same-Day Transfer',
    sub:     'CHAPS',
    detail:  'Before 4:00 PM \xb7 No fee',
    icon:    '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    from:    'HSBC \xb7\xb7\xb7\xb74821',
    arrival: 'Same working day (before 4:00 PM)',
    fee:     '\xa30.00'
  },
  card: {
    label:   'Debit Card',
    sub:     'Visa / Mastercard',
    detail:  'Instant \xb7 No fee up to \xa310,000',
    icon:    '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
    from:    'Visa \xb7\xb7\xb7\xb77293',
    arrival: 'Instant once payment clears',
    fee:     '\xa30.00 (under \xa310,000)'
  }
};

function renderAddFundsPage() {
  const el = document.getElementById('add-funds-form');
  if (!el) return;

  const s = addFundsState;
  const m = addFundsMethods[s.method];

  const checkIcon = '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>';

  function stepClass(n) {
    if (s.step > n)   return 'is-complete';
    if (s.step === n) return 'is-active';
    return '';
  }

  const stepsHtml = [
    '<div class="steps">',
    '  <div class="step ' + stepClass(1) + '">',
    '    <div class="step-num">' + (s.step > 1 ? checkIcon : '1') + '</div>',
    '    <span class="step-label">Method &amp; Amount</span>',
    '  </div>',
    '  <div class="step-connector ' + (s.step > 1 ? 'is-complete' : '') + '"></div>',
    '  <div class="step ' + stepClass(2) + '">',
    '    <div class="step-num">' + (s.step > 2 ? checkIcon : '2') + '</div>',
    '    <span class="step-label">Review</span>',
    '  </div>',
    '  <div class="step-connector ' + (s.step > 2 ? 'is-complete' : '') + '"></div>',
    '  <div class="step ' + stepClass(3) + '">',
    '    <div class="step-num">3</div>',
    '    <span class="step-label">Confirmation</span>',
    '  </div>',
    '</div>'
  ].join('\n');

  /* ── Step 3: Success ── */
  if (s.step === 3) {
    const fmtAmt = Number(s.amount).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    el.innerHTML =
      '<div class="card card-pad">' +
        stepsHtml +
        '<div class="form-success">' +
          '<div class="form-success-icon">' +
            '<svg width="30" height="30" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">' +
              '<polyline points="20 6 9 17 4 12"/>' +
            '</svg>' +
          '</div>' +
          '<div class="form-success-title">Deposit Submitted</div>' +
          '<div class="form-success-sub">' +
            'Your deposit of <strong>\xa3' + fmtAmt + '</strong> via ' + m.label + ' has been received and is being processed.' +
          '</div>' +
          '<div class="form-ref-badge">' +
            '<div class="form-ref-label">Reference Number</div>' +
            '<div class="form-ref-value">' + s.ref + '</div>' +
          '</div>' +
          '<div class="form-success-timeline">' +
            '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' +
            'Estimated arrival: <strong>' + m.arrival + '</strong>' +
          '</div>' +
          '<div class="form-success-actions">' +
            '<a href="/my-investments/" class="btn-primary" style="text-align:center;text-decoration:none;display:flex;align-items:center;justify-content:center;gap:6px">' +
              '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>' +
              'Back to My Investments' +
            '</a>' +
            '<button class="btn-secondary" onclick="resetAddFunds()">Make Another Deposit</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    return;
  }

  /* ── Step 2: Review ── */
  if (s.step === 2) {
    const fmtAmt = Number(s.amount).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    el.innerHTML =
      '<div class="card card-pad">' +
        stepsHtml +
        '<p class="add-funds-hint">Review your deposit details below. Once confirmed, your instruction will be sent securely.</p>' +
        '<div class="form-section-hd">Deposit Summary</div>' +
        '<div class="review-card">' +
          '<div class="review-row">' +
            '<span class="review-row-label">Deposit amount</span>' +
            '<span class="review-row-value">\xa3' + fmtAmt + '</span>' +
          '</div>' +
          '<div class="review-row">' +
            '<span class="review-row-label">Payment method</span>' +
            '<span class="review-row-value">' + m.label + ' (' + m.sub + ')</span>' +
          '</div>' +
          '<div class="review-row">' +
            '<span class="review-row-label">From account</span>' +
            '<span class="review-row-value">' + m.from + '</span>' +
          '</div>' +
          '<div class="review-row">' +
            '<span class="review-row-label">Estimated arrival</span>' +
            '<span class="review-row-value">' + m.arrival + '</span>' +
          '</div>' +
          '<div class="review-row">' +
            '<span class="review-row-label">Transaction fee</span>' +
            '<span class="review-row-value is-gold">' + m.fee + '</span>' +
          '</div>' +
          '<div class="review-row review-row--total">' +
            '<span class="review-row-label">Total to deposit</span>' +
            '<span class="review-row-value">\xa3' + fmtAmt + '</span>' +
          '</div>' +
        '</div>' +
        '<label class="form-checkbox-row">' +
          '<input type="checkbox" id="af-confirm-chk" onchange="document.getElementById(\'af-confirm-btn\').disabled = !this.checked">' +
          '<span class="form-checkbox-text">' +
            'I confirm this deposit instruction is correct and I understand funds may take time to clear. I have read and agree to the <a href="#">Deposit Terms &amp; Conditions</a>.' +
          '</span>' +
        '</label>' +
        '<div class="add-funds-actions">' +
          '<button id="af-confirm-btn" class="btn-primary" disabled onclick="confirmAddFunds()">Confirm Deposit</button>' +
          '<button class="btn-secondary" onclick="setAddFundsStep(1)">' +
            '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>' +
            'Back' +
          '</button>' +
        '</div>' +
      '</div>';
    return;
  }

  /* ── Step 1: Method & Amount ── */
  const quickAmounts = [500, 1000, 5000, 10000];

  const methodCardsHtml = Object.entries(addFundsMethods).map(function(entry) {
    const key = entry[0];
    const mth = entry[1];
    return '<button class="method-card ' + (s.method === key ? 'is-selected' : '') + '"' +
      ' onclick="setAddFundsMethod(\'' + key + '\')"' +
      ' aria-pressed="' + (s.method === key) + '">' +
      '<div class="method-card-icon" aria-hidden="true">' + mth.icon + '</div>' +
      '<div class="method-card-label">' + mth.label + '</div>' +
      '<div class="method-card-detail">' + mth.detail + '</div>' +
      '</button>';
  }).join('');

  const chipsHtml = quickAmounts.map(function(a) {
    return '<button class="amount-chip ' + (Number(s.amount) === a ? 'is-active' : '') + '"' +
      ' onclick="setAddFundsAmount(' + a + ')">' +
      '\xa3' + a.toLocaleString('en-GB') +
      '</button>';
  }).join('');

  el.innerHTML =
    '<div class="card card-pad">' +
      stepsHtml +
      '<div class="form-section-hd">Deposit Method</div>' +
      '<div class="method-cards">' + methodCardsHtml + '</div>' +
      '<div class="form-section-hd">Amount</div>' +
      '<div class="amount-wrap">' +
        '<span class="amount-prefix" aria-hidden="true">\xa3</span>' +
        '<input class="amount-input" id="af-amount-input" type="number" min="1" step="0.01" placeholder="0.00"' +
        ' value="' + s.amount + '"' +
        ' oninput="addFundsState.amount = this.value; updateAmountChips(this.value)"' +
        ' aria-label="Deposit amount in pounds sterling">' +
      '</div>' +
      '<div class="amount-chips" id="af-chips">' + chipsHtml + '</div>' +
      '<div class="add-funds-info-strip">' +
        '<div class="add-funds-info-row">' +
          '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="8" width="20" height="12" rx="2"/><path d="M6 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"/></svg>' +
          '<span>Depositing from: <strong>' + m.from + '</strong></span>' +
        '</div>' +
        '<div class="add-funds-info-row">' +
          '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>' +
          '<span>Current cash balance: <strong>\xa34,250.00</strong></span>' +
        '</div>' +
        '<div class="add-funds-info-row">' +
          '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' +
          '<span>Daily deposit limit: <strong>\xa3250,000</strong></span>' +
        '</div>' +
      '</div>' +
      '<div class="add-funds-actions">' +
        '<button class="btn-primary" onclick="submitAddFunds()">' +
          'Continue' +
          '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>' +
        '</button>' +
        '<a href="/my-investments/" class="btn-secondary add-funds-cancel">Cancel</a>' +
      '</div>' +
    '</div>';
}

function setAddFundsMethod(m) {
  addFundsState.method = m;
  renderAddFundsPage();
}

function setAddFundsAmount(v) {
  addFundsState.amount = String(v);
  renderAddFundsPage();
}

function updateAmountChips(v) {
  document.querySelectorAll('.amount-chip').forEach(function(c) {
    const chipVal = parseInt(c.textContent.replace(/[^\d]/g, ''));
    c.classList.toggle('is-active', Number(v) === chipVal);
  });
}

function setAddFundsStep(n) {
  addFundsState.step = n;
  renderAddFundsPage();
}

function submitAddFunds() {
  const amount = parseFloat(addFundsState.amount);
  if (!amount || amount < 1) {
    const inp = document.getElementById('af-amount-input');
    if (inp) {
      inp.focus();
      inp.style.borderColor = 'var(--red)';
      inp.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.15)';
    }
    return;
  }
  addFundsState.step = 2;
  renderAddFundsPage();
}

function confirmAddFunds() {
  const pad = function(n) { return String(n).padStart(2, '0'); };
  const d = new Date();
  addFundsState.ref = 'DEP-' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + '-' + Math.floor(1000 + Math.random() * 9000);
  addFundsState.step = 3;
  renderAddFundsPage();
}

function resetAddFunds() {
  addFundsState.step   = 1;
  addFundsState.method = 'bank';
  addFundsState.amount = '';
  addFundsState.ref    = '';
  renderAddFundsPage();
}
