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
