/**
 * Aurelius Style Guide — Shell injector
 *
 * Reads data-sg-page from <html> and injects the shared topbar + sidebar.
 * Also marks the correct topbar tab and sidebar nav item as .is-active.
 *
 * data-sg-page values: colours | typography | spacing | buttons | cards |
 *                      forms | tables | navigation | layout | data-display | onboarding | adviser
 */

const PAGES = [
  { id: 'colours',      label: 'Colours',      href: 'index.html',        icon: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3" fill="currentColor"/>' },
  { id: 'typography',   label: 'Typography',   href: 'typography.html',   icon: '<polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>' },
  { id: 'spacing',      label: 'Spacing',      href: 'spacing.html',      icon: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>' },
  { id: 'buttons',      label: 'Buttons',      href: 'buttons.html',      icon: '<rect x="3" y="8" width="18" height="8" rx="4"/>' },
  { id: 'cards',        label: 'Cards',        href: 'cards.html',        icon: '<rect x="2" y="4" width="20" height="16" rx="3"/><line x1="2" y1="10" x2="22" y2="10"/>' },
  { id: 'forms',        label: 'Forms',        href: 'forms.html',        icon: '<rect x="3" y="3" width="18" height="4" rx="1"/><rect x="3" y="10" width="10" height="4" rx="1"/><rect x="3" y="17" width="14" height="4" rx="1"/>' },
  { id: 'tables',       label: 'Tables',       href: 'tables.html',       icon: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/>' },
  { id: 'navigation',   label: 'Navigation',   href: 'navigation.html',   icon: '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>' },
  { id: 'layout',       label: 'Layout',       href: 'layout.html',       icon: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="9" x2="9" y2="21"/>' },
  { id: 'data-display', label: 'Data Display', href: 'data-display.html', icon: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>' },
  { id: 'onboarding',   label: 'Onboarding',   href: 'onboarding.html',   icon: '<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>' },
  { id: 'adviser',      label: 'Adviser Chat', href: 'adviser.html',      icon: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' },
  { id: 'feedback',     label: 'Feedback',     href: 'feedback.html',     icon: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>' },
  { id: 'outsystems',   label: 'OutSystems',   href: 'outsystems.html',   icon: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>' },
];

function svgIcon(paths) {
  return `<svg class="nav-icon" fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths}</svg>`;
}

function buildTopbar(activePage) {
  const isOnSG = activePage !== null;
  return `
  <header role="banner">
    <a class="brand" href="../index.html" aria-label="Aurelius Wealth Management — home">
      <span class="brand-mark" aria-hidden="true">A</span>
      <span class="brand-text">
        <span class="brand-name">Aurelius</span>
        <span class="brand-sub">Wealth Management</span>
      </span>
    </a>

    <nav class="topbar-nav" aria-label="Primary">
      <a class="tab-btn" href="../index.html">My Overview</a>
      <a class="tab-btn" href="../valuation-history/index.html">Valuation History</a>
      <a class="tab-btn" href="../asset-allocation/index.html">Asset Allocation</a>
      <a class="tab-btn" href="../my-investments/index.html">My Investments</a>
      <a class="tab-btn" href="../capital-gains-tax/index.html">Capital Gains Tax</a>
      <a class="tab-btn${isOnSG ? ' is-active' : ''}" href="colours.html">Style Guide</a>
    </nav>

    <div class="site-controls">
      <div class="theme-switcher">
        <input type="checkbox" role="switch" id="theme-checkbox" class="theme-checkbox" aria-label="Colour theme">
        <label class="theme-toggle" for="theme-checkbox" aria-hidden="true">
          <span class="theme-label-dark">Dark</span>
          <span class="theme-label-light">Light</span>
        </label>
      </div>
      <span class="theme-live" role="status" aria-live="polite" aria-atomic="true"></span>
      <button class="icon-btn" aria-label="Settings">
        <svg aria-hidden="true" focusable="false" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/><circle cx="8" cy="6" r="2" fill="var(--bg-card)" stroke="currentColor" stroke-width="1.7"/><circle cx="16" cy="12" r="2" fill="var(--bg-card)" stroke="currentColor" stroke-width="1.7"/><circle cx="10" cy="18" r="2" fill="var(--bg-card)" stroke="currentColor" stroke-width="1.7"/></svg>
      </button>
      <button class="avatar" aria-label="Account">SK</button>
    </div>
  </header>`;
}

function buildSidebar(activePage) {
  const items = PAGES.map(p => {
    const active = p.id === activePage ? ' is-active' : '';
    return `      <a class="nav-item${active}" href="${p.href}" aria-label="${p.label}">
        ${svgIcon(p.icon)}
        <span>${p.label}</span>
      </a>`;
  }).join('\n');

  return `
  <aside class="sidebar" aria-label="Style guide navigation">
    <nav aria-label="Style guide sections">
      <div role="group" aria-labelledby="sg-nav-label">
        <h2 id="sg-nav-label" class="sidebar-section-label">Style Guide</h2>
${items}
      </div>
    </nav>
    <footer class="sidebar-footer">
      <div class="advisor-card">
        <div class="advisor-label">Design System</div>
        <div class="advisor-name">Aurelius Wealth</div>
        <div class="advisor-contact">Component Reference v1.0</div>
      </div>
    </footer>
  </aside>`;
}

document.addEventListener('DOMContentLoaded', () => {
  const activePage = document.documentElement.dataset.sgPage || null;

  const topbarMount  = document.getElementById('sg-topbar-mount');
  const sidebarMount = document.getElementById('sg-sidebar-mount');

  if (topbarMount)  topbarMount.outerHTML  = buildTopbar(activePage);
  if (sidebarMount) sidebarMount.outerHTML = buildSidebar(activePage);

  // Theme toggle wiring (mirrors main.js behaviour)
  const checkbox = document.getElementById('theme-checkbox');
  const live     = document.querySelector('.theme-live');
  if (checkbox && live) {
    checkbox.addEventListener('change', () => {
      live.textContent = checkbox.checked ? 'Light mode' : 'Dark mode';
    });
  }
});
