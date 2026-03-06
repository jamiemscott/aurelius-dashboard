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
