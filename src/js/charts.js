/* ─── SVG CHART BUILDERS ────────────────────────────────────── */

function buildPerfChart(svgId, w, h) {
  const svg = document.getElementById(svgId);
  if (!svg) return;
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
      <td><span class="td-change ${h.up === null ? '' : h.up ? 'up' : 'down'}">${h.pct !== '—' ? (h.up ? '▲' : '▼') + ' ' : ''}${h.pct}</span></td>
      <td>${sparkSVG}</td>
    </tr>`;
  }).join('');
}

function buildActivityFeed() {
  const el = document.getElementById('activity-feed');
  if (!el) return;
  el.innerHTML = activity.map(a => `
    <div class="activity-item">
      <div class="activity-icon ${a.type}">${a.icon}</div>
      <div class="activity-body">
        <div class="activity-title">${a.title}</div>
        <div class="activity-sub">${a.sub}</div>
      </div>
      <div style="text-align:right;flex-shrink:0">
        <div class="activity-amount ${a.pos ? 'pos' : ''}">${a.amount}</div>
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
      <button class="doc-tab ${active ? 'active' : ''}" onclick="setDocCategory('${cat}')">
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
    <div class="doc-stat ${s.gold && unread > 0 ? 'featured' : ''}" onclick="setDocCategory('${s.cat}')">
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
    <div class="doc-entry ${isUnread ? 'unread' : ''}" onclick="markDocRead(${doc.id})">
      <div class="doc-entry-dot ${isUnread ? 'on' : ''}"></div>
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
      <td><span class="td-change ${inv.up ? 'up' : 'down'}">£${inv.gl}</span></td>
      <td><span class="gain-tag ${inv.up ? 'up' : 'down'}">${inv.up ? '▲' : '▼'} ${inv.glp}%</span></td>
    </tr>`).join('');
}

/* ─── MY DETAILS PAGE ──────────────────────────────────────── */

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
        <span class="det-hero-badge platinum">★ ${d.tier} Client</span>
        <span class="det-hero-badge verified">
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
    return `<button class="details-tab ${t.id === detailsState.activeTab ? 'active' : ''}" onclick="setDetailsTab('${t.id}')">${t.label}</button>`;
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
            ${detRow('KYC Status', `<span class="det-hero-badge verified"><svg width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg> Verified</span>`)}
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
            ${detRow('Account Tier', `<span class="det-hero-badge platinum">★ ${d.tier}</span>`)}
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
            <button class="det-pref-btn ${d.preferredContact==='email'?'active':''}" onclick="setContactPref('email')">Email</button>
            <button class="det-pref-btn ${d.preferredContact==='phone'?'active':''}" onclick="setContactPref('phone')">Phone</button>
            <button class="det-pref-btn ${d.preferredContact==='post'?'active':''}"  onclick="setContactPref('post')">Post</button>
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
        <div class="det-twofa-status ${d.twoFA ? 'on' : 'off'}">
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
            <div class="det-session-badge ${s.lastSeen === 'Now' ? 'now' : ''}">${s.lastSeen === 'Now' ? '● Active now' : s.lastSeen}</div>
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
                <td><span class="det-status-badge ${l.status}">${l.status === 'success' ? '✓ Success' : '✕ Failed'}</span></td>
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
