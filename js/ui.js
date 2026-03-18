// ── AgriFlow UI Utilities ─────────────────────────────────

// ── Toast ─────────────────────────────────────────────────
let toastRoot = null;
function getToastRoot() {
  if (!toastRoot) {
    toastRoot = document.getElementById('toast-root');
    if (!toastRoot) {
      toastRoot = document.createElement('div');
      toastRoot.id = 'toast-root';
      document.body.appendChild(toastRoot);
    }
  }
  return toastRoot;
}

export function toast(msg, type = 'success', duration = 3200) {
  const root = getToastRoot();
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  el.innerHTML = `<span>${icons[type] || '✅'}</span><span>${msg}</span>`;
  root.appendChild(el);
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('show')));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 300);
  }, duration);
}

// ── Modal ─────────────────────────────────────────────────
export function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}
export function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}
export function setupModals() {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  });
}

// ── Alert ─────────────────────────────────────────────────
export function showAlert(id, msg, type = 'error') {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.className = `alert show ${type}`;
}
export function clearAlert(id) {
  const el = document.getElementById(id);
  if (el) el.className = 'alert';
}

// ── Page Loader ───────────────────────────────────────────
export function showLoader(msg = 'Loading...') {
  const el = document.getElementById('page-loader');
  if (el) {
    const msgEl = el.querySelector('.loader-msg');
    if (msgEl) msgEl.textContent = msg;
    el.classList.remove('hidden');
  }
}
export function hideLoader() {
  const el = document.getElementById('page-loader');
  if (el) el.classList.add('hidden');
}
export function loaderError(msg) {
  const el = document.getElementById('page-loader');
  if (!el) return;
  el.innerHTML = `
    <div style="text-align:center;padding:24px">
      <div style="font-size:36px;margin-bottom:12px">⚠️</div>
      <div style="color:var(--danger);font-size:15px;font-weight:700;margin-bottom:8px">Something went wrong</div>
      <div style="color:var(--muted);font-size:13px;margin-bottom:20px">${msg}</div>
      <button class="btn btn-outline btn-sm" onclick="window.location.reload()">🔄 Retry</button>
    </div>`;
}

// ── Theme ─────────────────────────────────────────────────
export function initTheme() {
  const saved = localStorage.getItem('af_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeBtn(saved);
}
export function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('af_theme', next);
  updateThemeBtn(next);
}
function updateThemeBtn(theme) {
  document.querySelectorAll('[data-theme-btn]').forEach(btn => {
    btn.textContent = theme === 'dark' ? '☀️ Light' : '🌙 Dark';
  });
}

// ── Online / Offline ──────────────────────────────────────
export function initOnlineStatus() {
  function update() {
    const on = navigator.onLine;
    document.querySelectorAll('.online-dot').forEach(el => {
      el.classList.toggle('off', !on);
      el.title = on ? 'Online' : 'Offline';
    });
    const bar = document.getElementById('offline-bar');
    if (bar) bar.classList.toggle('show', !on);
    if (on) toast('Back online', 'success');
  }
  window.addEventListener('online',  () => { update(); });
  window.addEventListener('offline', () => {
    document.getElementById('offline-bar')?.classList.add('show');
    document.querySelectorAll('.online-dot').forEach(el => el.classList.add('off'));
  });
  update();
}

// ── Sidebar ───────────────────────────────────────────────
export function initSidebar() {
  const sidebar  = document.getElementById('sidebar');
  const overlay  = document.getElementById('sidebar-overlay');
  const hamburger = document.getElementById('hamburger');
  if (!sidebar || !overlay || !hamburger) return;

  hamburger.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('show');
  });
  overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
  });
}
export function closeSidebar() {
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('sidebar-overlay')?.classList.remove('show');
}

// ── Tabs ──────────────────────────────────────────────────
export function initTabs(onChange) {
  document.querySelectorAll('[data-tab-btn]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tabBtn;
      document.querySelectorAll('[data-tab-btn]').forEach(b => b.classList.toggle('active', b.dataset.tabBtn === tab));
      document.querySelectorAll('[data-tab-content]').forEach(c => c.classList.toggle('hidden', c.dataset.tabContent !== tab));
      closeSidebar();
      if (onChange) onChange(tab);
    });
  });
}
export function switchTab(tab) {
  document.querySelectorAll('[data-tab-btn]').forEach(b => b.classList.toggle('active', b.dataset.tabBtn === tab));
  document.querySelectorAll('[data-tab-content]').forEach(c => c.classList.toggle('hidden', c.dataset.tabContent !== tab));
}

// ── Action Menu (dot menu) ────────────────────────────────
let activeMenu = null;
export function showActionMenu(triggerEl, items) {
  closeActionMenu();
  const menu = document.getElementById('action-menu');
  if (!menu) return;

  menu.innerHTML = items.map((item, i) =>
    item === 'divider'
      ? `<div class="action-menu-divider"></div>`
      : `<button class="action-menu-item${item.danger ? ' danger' : ''}" data-idx="${i}">${item.icon || ''} ${item.label}</button>`
  ).join('');

  menu.querySelectorAll('.action-menu-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = items[parseInt(btn.dataset.idx)];
      closeActionMenu();
      if (item && item.action) item.action();
    });
  });

  const r = triggerEl.getBoundingClientRect();
  const mw = 200;
  let left = r.right - mw;
  let top  = r.bottom + 4;
  if (left < 8) left = 8;
  if (top + 280 > window.innerHeight) top = r.top - 280;
  menu.style.left = left + 'px';
  menu.style.top  = top  + 'px';
  menu.classList.add('open');
  activeMenu = menu;
}
export function closeActionMenu() {
  if (activeMenu) { activeMenu.classList.remove('open'); activeMenu = null; }
}
document.addEventListener('click', e => {
  if (!e.target.closest('.action-menu') && !e.target.closest('[data-menu-trigger]')) {
    closeActionMenu();
  }
});

// ── Format helpers ────────────────────────────────────────
export const fmt = {
  money: n  => '₨ ' + Number(n || 0).toLocaleString('en-PK'),
  date:  d  => {
    if (!d) return '—';
    const dt = d.toDate ? d.toDate() : new Date(d);
    return dt.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
  },
  initial: name => (name || '?').charAt(0).toUpperCase(),
};
