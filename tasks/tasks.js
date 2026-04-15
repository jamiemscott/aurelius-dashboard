/* ─── TASK BOARD ─────────────────────────────────────────────────────────────
   Vanilla JS — no framework, no build step.
   Data persists in localStorage under the key "aurelius-tasks".

   Priority order (for sorting): critical → high → medium → low
   Traffic-light colours are handled purely in CSS via .tk-task-wrap--{priority}.
   ──────────────────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  /* ── Constants ─────────────────────────────────────────────────────────── */

  const STORAGE_KEY   = 'aurelius-tasks';
  const PER_PAGE      = 5;
  const PRIORITY_RANK = { critical: 0, high: 1, medium: 2, low: 3 };

  /* ── State ──────────────────────────────────────────────────────────────── */

  let tasks  = load();
  let todoPg = 1;
  let donePg = 1;

  /* ── Persistence ────────────────────────────────────────────────────────── */

  function load() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  /* ── Utilities ──────────────────────────────────────────────────────────── */

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function cap(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function fmtDate(iso) {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  }

  /* ── Toast ──────────────────────────────────────────────────────────────── */

  let toastTimer;
  function toast(msg) {
    const el = document.getElementById('tk-toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2600);
  }

  /* ── Render ─────────────────────────────────────────────────────────────── */

  function sortTasks(arr) {
    return arr.slice().sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
  }

  function render() {
    const todo = sortTasks(tasks.filter(t => !t.completed));
    const done = sortTasks(tasks.filter(t =>  t.completed));

    todoPg = Math.min(todoPg, Math.max(1, Math.ceil(todo.length / PER_PAGE)));
    donePg = Math.min(donePg, Math.max(1, Math.ceil(done.length / PER_PAGE)));

    renderList({
      listId:      'todo-list',
      paginId:     'todo-pagin',
      countId:     'todo-count',
      items:       todo,
      page:        todoPg,
      isDone:      false,
      onPage:      (p) => { todoPg = p; render(); },
      emptyMsg:    'No tasks. Add one using the form.',
    });

    renderList({
      listId:      'done-list',
      paginId:     'done-pagin',
      countId:     'done-count',
      items:       done,
      page:        donePg,
      isDone:      true,
      onPage:      (p) => { donePg = p; render(); },
      emptyMsg:    'Completed tasks will appear here.',
    });
  }

  function renderList({ listId, paginId, countId, items, page, isDone, onPage, emptyMsg }) {
    const listEl  = document.getElementById(listId);
    const paginEl = document.getElementById(paginId);
    const countEl = document.getElementById(countId);

    countEl.textContent = items.length;

    const totalPages = Math.max(1, Math.ceil(items.length / PER_PAGE));
    const pg         = Math.min(page, totalPages);
    const slice      = items.slice((pg - 1) * PER_PAGE, pg * PER_PAGE);

    listEl.innerHTML = '';

    if (items.length === 0) {
      listEl.innerHTML = `
        <div class="tk-empty" role="status">
          <svg class="tk-empty-icon" aria-hidden="true" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          ${esc(emptyMsg)}
        </div>`;
      paginEl.innerHTML = '';
      return;
    }

    slice.forEach(task => {
      listEl.appendChild(buildTaskEl(task, isDone));
    });

    renderPagination(paginEl, pg, totalPages, onPage);
  }

  function buildTaskEl(task, isDone) {
    const wrap = document.createElement('div');
    wrap.className = `tk-task-wrap tk-task-wrap--${task.priority}${isDone ? ' tk-task-wrap--done' : ''}`;
    wrap.setAttribute('role', 'listitem');

    const bodyId = `tk-body-${task.id}`;

    wrap.innerHTML = `
      <details class="tk-task" id="tk-det-${esc(task.id)}">
        <summary class="tk-task-summary" aria-label="${esc(task.name)}, ${cap(task.priority)} priority — click to ${isDone ? 'view' : 'expand'}">
          <span class="tk-priority-dot" aria-hidden="true"></span>
          <span class="tk-task-name">${esc(task.name)}</span>
          <svg class="tk-chevron" aria-hidden="true" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
        </summary>
        <div class="tk-task-body" id="${bodyId}">
          ${task.description
            ? `<p class="tk-task-desc">${esc(task.description)}</p>`
            : ''}
          <div class="tk-meta" role="list">
            ${task.assignee
              ? `<div class="tk-meta-item" role="listitem">
                   <span class="tk-meta-key">Assignee</span>
                   <span class="tk-meta-val">${esc(task.assignee)}</span>
                 </div>`
              : ''}
            ${task.section
              ? `<div class="tk-meta-item" role="listitem">
                   <span class="tk-meta-key">Section</span>
                   <span class="tk-meta-val">${esc(task.section)}</span>
                 </div>`
              : ''}
            <div class="tk-meta-item" role="listitem">
              <span class="tk-meta-key">Priority</span>
              <span class="tk-meta-val">
                <span class="tk-priority-badge tk-priority-badge--${esc(task.priority)}">${cap(task.priority)}</span>
              </span>
            </div>
            <div class="tk-meta-item" role="listitem">
              <span class="tk-meta-key">Added</span>
              <span class="tk-meta-val">${fmtDate(task.createdAt)}</span>
            </div>
          </div>
          <button class="tk-delete-btn" data-action="delete" data-id="${esc(task.id)}" aria-label="Delete task: ${esc(task.name)}">
            <svg aria-hidden="true" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin-right:4px"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>Delete
          </button>
        </div>
      </details>
      <div class="tk-task-check-wrap">
        <input
          type="checkbox"
          class="tk-task-check"
          data-action="toggle"
          data-id="${esc(task.id)}"
          ${isDone ? 'checked' : ''}
          aria-label="${isDone ? 'Restore task: ' : 'Mark complete: '}${esc(task.name)}"
          title="${isDone ? 'Restore to To Do' : 'Mark as complete'}"
        >
      </div>`;

    return wrap;
  }

  function renderPagination(container, currentPage, totalPages, onPage) {
    container.innerHTML = '';
    if (totalPages <= 1) return;

    function addBtn(label, page, isActive, isDisabled, ariaLabel) {
      const btn = document.createElement('button');
      btn.className = 'tk-pg-btn' + (isActive ? ' tk-pg-btn--active' : '');
      btn.textContent = label;
      btn.disabled    = isDisabled;
      btn.setAttribute('aria-label', ariaLabel || label);
      if (isActive) btn.setAttribute('aria-current', 'page');
      if (!isDisabled) btn.addEventListener('click', () => onPage(page));
      container.appendChild(btn);
    }

    addBtn('←', currentPage - 1, false, currentPage === 1, 'Previous page');

    // Show at most 7 page buttons with ellipsis logic
    const pages = buildPageRange(currentPage, totalPages);
    pages.forEach(p => {
      if (p === '…') {
        const span = document.createElement('span');
        span.className = 'tk-pg-btn';
        span.style.cssText = 'cursor:default;opacity:0.4';
        span.textContent = '…';
        span.setAttribute('aria-hidden', 'true');
        container.appendChild(span);
      } else {
        addBtn(p, p, p === currentPage, false, `Page ${p}`);
      }
    });

    addBtn('→', currentPage + 1, false, currentPage === totalPages, 'Next page');
  }

  function buildPageRange(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages = new Set([1, total, current, current - 1, current + 1].filter(p => p >= 1 && p <= total));
    const sorted = Array.from(pages).sort((a, b) => a - b);
    const result = [];
    sorted.forEach((p, i) => {
      if (i > 0 && p - sorted[i - 1] > 1) result.push('…');
      result.push(p);
    });
    return result;
  }

  /* ── Form ───────────────────────────────────────────────────────────────── */

  function bindForm() {
    const form = document.getElementById('task-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.elements['task-name'].value.trim();

      // Validate
      const nameInput = form.elements['task-name'];
      const nameError = document.getElementById('task-name-error');
      if (!name) {
        nameInput.classList.add('is-invalid');
        nameError.classList.add('is-visible');
        nameInput.focus();
        return;
      }

      nameInput.classList.remove('is-invalid');
      nameError.classList.remove('is-visible');

      const task = {
        id:          uid(),
        name:        name,
        priority:    form.elements['task-priority'].value,
        description: form.elements['task-desc'].value.trim(),
        assignee:    form.elements['task-assignee'].value.trim(),
        section:     form.elements['task-section'].value,
        completed:   form.elements['task-completed'].checked,
        createdAt:   new Date().toISOString(),
      };

      tasks.unshift(task);
      save();

      if (task.completed) { donePg = 1; }
      else                { todoPg = 1; }

      render();
      form.reset();
      toast(`"${task.name}" added.`);

      // Return focus to name input for fast entry
      nameInput.focus();
    });

    // Clear invalid state on input
    form.elements['task-name'].addEventListener('input', () => {
      form.elements['task-name'].classList.remove('is-invalid');
      document.getElementById('task-name-error').classList.remove('is-visible');
    });

    document.getElementById('btn-clear').addEventListener('click', () => {
      form.reset();
      form.elements['task-name'].classList.remove('is-invalid');
      document.getElementById('task-name-error').classList.remove('is-visible');
    });
  }

  /* ── Event delegation for task actions ─────────────────────────────────── */

  function bindLists() {
    ['todo-list', 'done-list'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;

      el.addEventListener('change', (e) => {
        if (e.target.dataset.action !== 'toggle') return;
        const taskId = e.target.dataset.id;
        const task   = tasks.find(t => t.id === taskId);
        if (!task) return;
        task.completed = e.target.checked;
        if (task.completed) { donePg = 1; }
        else                { todoPg = 1; }
        save();
        render();
        toast(task.completed ? `"${task.name}" completed.` : `"${task.name}" restored.`);
      });

      el.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action="delete"]');
        if (!btn) return;
        const taskId = btn.dataset.id;
        const task   = tasks.find(t => t.id === taskId);
        if (!task) return;
        if (!confirm(`Delete "${task.name}"?`)) return;
        tasks = tasks.filter(t => t.id !== taskId);
        save();
        render();
        toast(`"${task.name}" deleted.`);
      });
    });
  }

  /* ── Theme toggle (mirrors main.js) ────────────────────────────────────── */

  function bindTheme() {
    const checkbox = document.getElementById('theme-checkbox');
    const live     = document.querySelector('.theme-live');
    if (!checkbox) return;

    // Restore saved preference
    const saved = localStorage.getItem('aurelius-theme');
    if (saved === 'light') {
      document.documentElement.style.colorScheme = 'light';
      checkbox.checked = true;
    } else if (saved === 'dark') {
      document.documentElement.style.colorScheme = 'dark';
      checkbox.checked = false;
    }

    checkbox.addEventListener('change', () => {
      const isLight = checkbox.checked;
      document.documentElement.style.colorScheme = isLight ? 'light' : 'dark';
      localStorage.setItem('aurelius-theme', isLight ? 'light' : 'dark');
      if (live) live.textContent = isLight ? 'Light mode' : 'Dark mode';
    });
  }

  /* ── Init ───────────────────────────────────────────────────────────────── */

  document.addEventListener('DOMContentLoaded', () => {
    bindForm();
    bindLists();
    bindTheme();
    render();
  });

})();
