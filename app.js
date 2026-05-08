/* ============================================================
   PAYD — Shared sidebar + topbar
   ============================================================ */

const SIDEBAR_HTML = `
<aside class="sidebar">
  <div class="sb-brand">
    <div class="sb-logo"><span>P</span></div>
    <div>
      <div class="sb-brand-text">PAYD</div>
      <div class="sb-brand-sub">Платформа рассрочки</div>
    </div>
  </div>

  <div class="sb-search">
    <span class="si"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
    <input type="text" placeholder="Поиск везде..." />
    <span class="kbd">⌘K</span>
  </div>

  <nav class="sb-nav">
    <div class="sb-section">Главное</div>
    <a class="sb-link" data-page="dashboard" href="dashboard.html">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>
      Дашборд
    </a>
    <a class="sb-link" data-page="zhurnal" href="zhurnal.html">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
      Журнал заявок
      <span class="badge muted" data-count="zhurnal">0</span>
    </a>
    <a class="sb-link" data-page="zayavka-new" href="zayavka-new.html">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      Новая заявка
    </a>

    <div class="sb-section">Рабочие места</div>
    <a class="sb-link" data-page="manager" href="manager.html">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      Менеджер · CRM
      <span class="badge" data-count="manager">0</span>
    </a>
    <a class="sb-link" data-page="kassir" href="kassir.html">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/><circle cx="12" cy="15" r="2"/></svg>
      Касса
      <span class="badge" data-count="kassir">0</span>
    </a>
    <a class="sb-link" data-page="warehouse" href="warehouse.html">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
      Выдача товара
      <span class="badge" data-count="warehouse">0</span>
    </a>
    <a class="sb-link" data-page="partner" href="partner.html">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/></svg>
      Рабочее место партнёра
      <span class="badge">3</span>
    </a>
    <a class="sb-link" data-page="sb" href="sb.html">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      Служба безопасности
      <span class="badge">5</span>
    </a>
    <a class="sb-link" data-page="collector" href="collector.html">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      Взыскание
      <span class="badge">23</span>
    </a>
    <a class="sb-link" data-page="inkassator" href="inkassator.html">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
      Инкассатор
      <span class="badge">7</span>
    </a>
    <div class="sb-section">Документы и финансы</div>
    <a class="sb-link" data-page="contracts" href="contracts.html">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
      Договоры
    </a>
    <a class="sb-link" data-page="finance" href="finance.html">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
      Финансы · ДДС
    </a>
    <a class="sb-link" data-page="kassa" href="kassa.html">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/><circle cx="12" cy="15" r="2"/></svg>
      Кассы и проводки
    </a>
    <a class="sb-link" data-page="promo" href="promo.html">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
      Промо и рефералы
    </a>

    <div class="sb-section">Справочники</div>
    <a class="sb-link" data-page="clients" href="clients.html">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      Клиенты
    </a>
    <a class="sb-link" data-page="products" href="products.html">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
      Товары
    </a>
    <a class="sb-link" data-page="partners" href="partners.html">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/><path d="M9 9v.01"/><path d="M9 12v.01"/><path d="M9 15v.01"/><path d="M9 18v.01"/></svg>
      Партнёры
    </a>
    <a class="sb-link" data-page="employees" href="employees.html">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>
      Сотрудники
    </a>

    <div class="sb-section">Интеграции</div>
    <a class="sb-link" data-page="integration-1c" href="integration-1c.html">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
      1С УНФ 3.0
      <span class="badge muted" style="background: var(--success-soft); color: var(--success);">●</span>
    </a>

    <div class="sb-section">Аналитика</div>
    <a class="sb-link" data-page="struktura" href="struktura.html">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/><line x1="12" y1="22" x2="12" y2="15.5"/><polyline points="22 8.5 12 15.5 2 8.5"/><polyline points="2 15.5 12 8.5 22 15.5"/><line x1="12" y1="2" x2="12" y2="8.5"/></svg>
      Структура и цепочки
      <span class="badge" style="background: var(--purple-soft); color: var(--purple);">map</span>
    </a>
    <a class="sb-link" data-page="reports" href="reports.html">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
      Отчёты
    </a>

    <div class="sb-section">Система</div>
    <a class="sb-link" data-page="audit" href="audit.html">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      Журнал аудита
    </a>
    <a class="sb-link" data-page="settings" href="settings.html">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
      Настройки
    </a>
  </nav>

  <div class="sb-user">
    <div class="avatar c7 sm" id="sb-user-avatar">—</div>
    <div class="sb-user-info">
      <div class="n" id="sb-user-name">Загрузка…</div>
      <div class="r" id="sb-user-role"></div>
    </div>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-3)"><polyline points="6 9 12 15 18 9"/></svg>
  </div>
</aside>
`;

function buildTopbar(opts = {}) {
  const { title = '', breadcrumbs = [], actions = '' } = opts;
  const crumbs = breadcrumbs.length
    ? `<div class="crumbs">${breadcrumbs.map((c, i) => {
        const sep = i < breadcrumbs.length - 1 ? '<span class="sep">/</span>' : '';
        return `${c.href ? `<a href="${c.href}">${c.label}</a>` : `<span>${c.label}</span>`}${sep}`;
      }).join('')}</div>`
    : '';
  return `
    <div class="topbar">
      <div class="topbar-left">
        <button class="icon-btn tb-back-btn" id="tb-back-btn" data-no-handler="true" title="Назад" aria-label="Назад" style="margin-right:6px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
        <div>
          ${crumbs}
          <div class="page-title">${title}</div>
        </div>
      </div>
      <div class="topbar-right">
        ${actions}
        <button class="tb-calc-btn" id="tb-open-calc" title="Калькулятор (⌘K)" aria-label="Калькулятор">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4a92ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="4" y="2" width="16" height="20" rx="2.5"/>
            <rect x="7" y="5.5" width="10" height="3.5" rx="1" fill="#4a92ff" stroke="none"/>
            <rect x="7.2" y="11.6" width="2.6" height="2.6" rx=".6" fill="#4a92ff" stroke="none"/>
            <rect x="10.7" y="11.6" width="2.6" height="2.6" rx=".6" fill="#4a92ff" stroke="none"/>
            <rect x="14.2" y="11.6" width="2.6" height="2.6" rx=".6" fill="#4a92ff" stroke="none"/>
            <rect x="7.2" y="15.6" width="2.6" height="2.6" rx=".6" fill="#4a92ff" stroke="none"/>
            <rect x="10.7" y="15.6" width="2.6" height="2.6" rx=".6" fill="#4a92ff" stroke="none"/>
            <rect x="14.2" y="15.6" width="2.6" height="2.6" rx=".6" fill="#4a92ff" stroke="none"/>
          </svg>
        </button>
        <button class="icon-btn" title="Уведомления">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <span class="dot"></span>
        </button>
        <button class="icon-btn" title="Помощь">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </button>
      </div>
    </div>
  `;
}

function mountShell({ active, title, breadcrumbs, actions }) {
  const root = document.getElementById('app-root');
  if (!root) return;

  // Auth guard — выполняется в фоне, не блокирует рендер
  authGuardBackground();

  const main = root.innerHTML;
  root.innerHTML = `
    <div class="app">
      ${SIDEBAR_HTML}
      <div class="main">
        ${buildTopbar({ title, breadcrumbs, actions })}
        <div class="tab-bar" id="tab-bar"></div>
        <div class="content">${main}</div>
      </div>
    </div>
  `;

  // Tabs (browser-style)
  initTabBar({ active, title });

  // Highlight active link
  if (active) {
    document.querySelectorAll('.sb-link').forEach(el => {
      if (el.dataset.page === active) el.classList.add('active');
    });
  }

  initButtonHandlers();
  initMobileSidebar();
  initTopbarCalc();
  initTopbarBack({ active });
  loadSidebarUser();
}

async function loadSidebarUser() {
  if (!window.PaydDB) return;
  try {
    await PaydDB.cloud.connect().catch(() => {});
    const profile = await PaydDB.profiles?.me?.().catch(() => null);
    const user    = PaydDB.cloud.user?.();

    const fullName = profile?.full_name
                  || user?.user_metadata?.full_name
                  || user?.email
                  || 'Пользователь';

    const ROLE_LABELS = {
      admin: 'Администратор', manager: 'Менеджер', cashier: 'Кассир',
      sb: 'Служба безопасности', collector: 'Взыскание',
      inkassator: 'Инкассатор', partner: 'Партнёр', client: 'Клиент'
    };
    const roleLabel = ROLE_LABELS[profile?.role] || profile?.role || '';

    const initials = String(fullName).trim().split(/\s+/)
      .map(p => p[0] || '').slice(0, 2).join('').toUpperCase() || '—';

    const nameEl = document.getElementById('sb-user-name');
    const roleEl = document.getElementById('sb-user-role');
    const avEl   = document.getElementById('sb-user-avatar');
    if (nameEl) nameEl.textContent = fullName;
    if (roleEl) roleEl.textContent = roleLabel;
    if (avEl)   avEl.textContent   = initials;
  } catch (e) {
    console.warn('[app] loadSidebarUser', e.message);
  }
}

async function authGuardBackground() {
  // Не запускаем guard на публичных страницах
  const path = window.location.pathname;
  if (path.includes('index.html') || path.includes('calculator.html') || path === '/' ) return;
  if (!window.PaydDB) return;

  // Дать время на восстановление сессии из localStorage
  await new Promise(r => setTimeout(r, 100));
  let user = window.PaydDB.cloud.user();
  if (!user) {
    await window.PaydDB.cloud.connect().catch(() => null);
    user = window.PaydDB.cloud.user();
  }
  // Ещё подождём — Supabase auth.getSession() — async
  if (!user) {
    await new Promise(r => setTimeout(r, 1500));
    user = window.PaydDB.cloud.user();
  }
  if (!user) {
    window.location.href = 'index.html';
  }
}

function initTopbarBack({ active }) {
  const btn = document.getElementById('tb-back-btn');
  if (!btn) return;
  // Скрываем на дашборде — там некуда возвращаться
  if (active === 'dashboard') {
    btn.style.display = 'none';
    return;
  }
  btn.addEventListener('click', e => {
    e.preventDefault();
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = 'dashboard.html';
    }
  });
}

/* ============================================================
   TAB BAR — browser-style tabs of open pages
   ============================================================ */
const TAB_KEY = 'payd.tabs.v1';

const TAB_PAGE_ICONS = {
  dashboard:    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>',
  zhurnal:      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
  'zayavka-new':'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  manager:      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  kassir:       '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>',
  warehouse:    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>',
  partner:      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/></svg>',
  partners:     '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/></svg>',
  inkassator:   '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/></svg>',
  sb:           '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  collector:    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/></svg>',
  contracts:    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>',
  finance:      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
  kassa:        '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="14" rx="2"/><circle cx="12" cy="13" r="2"/></svg>',
  promo:        '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/></svg>',
  clients:      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>',
  products:     '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>',
  employees:    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>',
  reports:      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
  audit:        '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/></svg>',
  settings:     '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  zhurnal_zayavka: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>'
};

function _loadTabs() {
  try {
    const arr = JSON.parse(localStorage.getItem(TAB_KEY) || '[]');
    if (Array.isArray(arr)) return arr;
  } catch (_) {}
  return [];
}
function _saveTabs(tabs) { localStorage.setItem(TAB_KEY, JSON.stringify(tabs)); }

function initTabBar({ active, title }) {
  const bar = document.getElementById('tab-bar');
  if (!bar) return;

  // Always pin Dashboard
  let tabs = _loadTabs();
  if (!tabs.find(t => t.key === 'dashboard')) {
    tabs.unshift({ key: 'dashboard', title: 'Дашборд', href: 'dashboard.html', pinned: true });
  } else {
    const idx = tabs.findIndex(t => t.key === 'dashboard');
    if (idx > 0) { const d = tabs.splice(idx, 1)[0]; tabs.unshift({ ...d, pinned: true }); }
  }

  // Determine current tab
  const path = location.pathname.split('/').pop() || 'dashboard.html';
  const search = location.search;
  const currentKey = active || path.replace('.html', '');
  // For заявка — make per-id tab so multiple can be open
  let key = currentKey;
  let curHref = path + search;
  let curTitle = title || 'Страница';
  if (path === 'zayavka.html') {
    const idMatch = search.match(/[?&]id=([^&]+)/);
    const id = idMatch ? decodeURIComponent(idMatch[1]) : '';
    key = 'zayavka:' + id;
    curTitle = title || ('Заявка №' + id);
  }

  // Add or update current tab
  const found = tabs.find(t => t.key === key);
  if (!found) {
    tabs.push({ key, title: curTitle, href: curHref, pinned: false });
  } else {
    found.href = curHref;
    found.title = curTitle;
  }
  _saveTabs(tabs);

  function render() {
    tabs = _loadTabs();
    bar.innerHTML = tabs.map(t => {
      const isActive = t.key === key;
      const iconKey = t.key.startsWith('zayavka:') ? 'zhurnal_zayavka' : t.key;
      const ico = TAB_PAGE_ICONS[iconKey] || TAB_PAGE_ICONS.dashboard;
      return `
        <div class="ptab ${isActive ? 'active' : ''} ${t.pinned ? 'pinned' : ''}" data-key="${t.key}" data-href="${t.href}">
          <span class="ptab-ico">${ico}</span>
          <span class="ptab-title">${t.title}</span>
          ${t.pinned
            ? '<span class="ptab-pin" title="Закреплена"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M16 3l5 5-2 2-2-1-3 3v6l-3 3-3-3v-6l-3-3-2 1-2-2 5-5h10z"/></svg></span>'
            : '<button class="ptab-close" title="Закрыть"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>'
          }
        </div>
      `;
    }).join('');

    bar.querySelectorAll('.ptab').forEach(el => {
      // Click: switch
      el.addEventListener('click', e => {
        if (e.target.closest('.ptab-close')) return;
        if (el.dataset.key === key) return;
        location.href = el.dataset.href;
      });
      // Middle-click closes
      el.addEventListener('mousedown', e => {
        if (e.button === 1 && !el.classList.contains('pinned')) {
          e.preventDefault();
          closeTab(el.dataset.key);
        }
      });
      // Close button
      const closeBtn = el.querySelector('.ptab-close');
      if (closeBtn) closeBtn.addEventListener('click', e => {
        e.stopPropagation();
        closeTab(el.dataset.key);
      });
    });
  }

  function closeTab(k) {
    const list = _loadTabs();
    const closingIdx = list.findIndex(t => t.key === k);
    if (closingIdx < 0) return;
    if (list[closingIdx].pinned) return;
    list.splice(closingIdx, 1);
    _saveTabs(list);
    if (k === key) {
      // Move to last opened tab (or dashboard fallback)
      const next = list[Math.max(0, closingIdx - 1)] || list[0];
      location.href = next ? next.href : 'dashboard.html';
    } else {
      render();
    }
  }

  render();
}

/* ============================================================
   TOPBAR CALCULATOR — quick mini-calc shortcut
   ============================================================ */
function initTopbarCalc() {
  const btn = document.getElementById('tb-open-calc');
  if (btn && !btn._wired) {
    btn._wired = true;
    btn.addEventListener('click', () => window.PaydApp?.openMiniCalc?.());
  }
  // Global ⌘K / Ctrl+K shortcut
  if (!window._paydCalcKey) {
    window._paydCalcKey = true;
    document.addEventListener('keydown', e => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        window.PaydApp?.openMiniCalc?.();
      }
    });
  }
}

/* ============================================================
   MOBILE SIDEBAR (burger toggle)
   ============================================================ */
function initMobileSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const topbar = document.querySelector('.topbar');
  if (!sidebar || !topbar) return;

  // Click on ::before pseudo-element of topbar = burger area (left ~36px)
  topbar.addEventListener('click', e => {
    if (window.innerWidth > 900) return;
    const rect = topbar.getBoundingClientRect();
    if (e.clientX - rect.left < 50) {
      sidebar.classList.toggle('open');
      document.body.classList.toggle('sidebar-open');
    }
  });

  // Click outside sidebar closes it
  document.addEventListener('click', e => {
    if (window.innerWidth > 900) return;
    if (!sidebar.contains(e.target) && !topbar.contains(e.target)) {
      sidebar.classList.remove('open');
      document.body.classList.remove('sidebar-open');
    }
  });

  // Click on a sidebar link closes the sidebar (mobile UX)
  sidebar.querySelectorAll('.sb-link').forEach(l => {
    l.addEventListener('click', () => {
      if (window.innerWidth <= 900) {
        sidebar.classList.remove('open');
        document.body.classList.remove('sidebar-open');
      }
    });
  });
}

/* ============================================================
   GLOBAL UI STYLES (toast / modal / dropdown)
   ============================================================ */
const GLOBAL_STYLES = `
<style id="payd-global-ui">
  #payd-toasts { position: fixed; bottom: 24px; right: 24px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; pointer-events: none; }
  .payd-toast {
    background: white;
    color: #1a2332;
    padding: 12px 14px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 500;
    box-shadow: 0 12px 40px rgba(15, 23, 42, .2), 0 0 0 1px rgba(15, 23, 42, .06);
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 280px;
    max-width: 380px;
    transform: translateX(420px);
    transition: transform .25s cubic-bezier(.4,0,.2,1);
    pointer-events: auto;
    border-left: 3px solid #2563eb;
  }
  .payd-toast.show { transform: translateX(0); }
  .payd-toast.success { border-left-color: #10b981; }
  .payd-toast.error { border-left-color: #ef4444; }
  .payd-toast.warning { border-left-color: #f59e0b; }
  .payd-toast .ic { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: #eff4ff; color: #2563eb; }
  .payd-toast.success .ic { background: #ecfdf5; color: #10b981; }
  .payd-toast.error .ic { background: #fef2f2; color: #ef4444; }
  .payd-toast.warning .ic { background: #fffbeb; color: #f59e0b; }
  .payd-toast .body { flex: 1; min-width: 0; }
  .payd-toast .body .t { font-weight: 600; }
  .payd-toast .body .s { font-size: 11px; color: #5a6478; margin-top: 2px; }

  .payd-modal-backdrop {
    position: fixed; inset: 0; background: rgba(15, 23, 42, .55);
    z-index: 9998; display: flex; align-items: center; justify-content: center;
    backdrop-filter: blur(4px);
    opacity: 0; transition: opacity .15s;
  }
  .payd-modal-backdrop.show { opacity: 1; }
  .payd-modal {
    background: white; border-radius: 16px; padding: 24px; max-width: 420px; width: 90%;
    box-shadow: 0 30px 60px rgba(0,0,0,.25);
    transform: scale(.96); transition: transform .15s;
  }
  .payd-modal-backdrop.show .payd-modal { transform: scale(1); }
  .payd-modal-icon { width: 48px; height: 48px; background: #fef2f2; color: #ef4444; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; }
  .payd-modal-icon.warning { background: #fffbeb; color: #f59e0b; }
  .payd-modal-icon.info { background: #eff4ff; color: #2563eb; }
  .payd-modal h3 { font-size: 17px; font-weight: 700; margin-bottom: 8px; color: #1a2332; }
  .payd-modal p { font-size: 13px; color: #5a6478; margin-bottom: 20px; line-height: 1.5; }
  .payd-modal-actions { display: flex; gap: 8px; justify-content: flex-end; }

  .payd-dropdown {
    position: fixed; background: white; border: 1px solid #e5e9f2;
    border-radius: 12px; box-shadow: 0 12px 40px rgba(15,23,42,.14);
    z-index: 9999; min-width: 240px; padding: 6px;
    opacity: 0; transform: translateY(-6px); transition: all .15s;
  }
  .payd-dropdown.show { opacity: 1; transform: translateY(0); }
  .payd-dropdown-item {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 12px; font-size: 13px; cursor: pointer; border-radius: 8px;
    color: #1a2332; transition: background .12s;
  }
  .payd-dropdown-item:hover { background: #fafbfd; }
  .payd-dropdown-item .ic { width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; color: #5a6478; }
  .payd-dropdown-item.danger { color: #ef4444; }
  .payd-dropdown-item.danger:hover { background: #fef2f2; }
  .payd-dropdown-item.danger .ic { color: #ef4444; }
  .payd-dropdown-divider { height: 1px; background: #e5e9f2; margin: 4px 6px; }
</style>
`;

if (!document.getElementById('payd-global-ui')) {
  document.head.insertAdjacentHTML('beforeend', GLOBAL_STYLES);
}

/* ============================================================
   TOAST
   ============================================================ */
function getToastHost() {
  let host = document.getElementById('payd-toasts');
  if (!host) {
    host = document.createElement('div');
    host.id = 'payd-toasts';
    document.body.appendChild(host);
  }
  return host;
}

const TOAST_ICONS = {
  success: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  error: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  warning: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  info: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
};

function toast(message, opts = {}) {
  const { type = 'success', subtitle = '' } = typeof opts === 'string' ? { type: opts } : opts;
  const host = getToastHost();
  const el = document.createElement('div');
  el.className = `payd-toast ${type}`;
  el.innerHTML = `
    <div class="ic">${TOAST_ICONS[type] || TOAST_ICONS.info}</div>
    <div class="body">
      <div class="t">${message}</div>
      ${subtitle ? `<div class="s">${subtitle}</div>` : ''}
    </div>
  `;
  host.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 250);
  }, 3200);
}

/* ============================================================
   CONFIRM MODAL
   ============================================================ */
function confirmDialog({ title = 'Подтвердите действие', message = '', okText = 'Подтвердить', cancelText = 'Отмена', danger = true, onOk = () => {}, type = 'danger' }) {
  const backdrop = document.createElement('div');
  backdrop.className = 'payd-modal-backdrop';

  const iconClass = type === 'warning' ? 'warning' : type === 'info' ? 'info' : '';
  const iconSvg = type === 'info'
    ? '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    : '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';

  backdrop.innerHTML = `
    <div class="payd-modal">
      <div class="payd-modal-icon ${iconClass}">${iconSvg}</div>
      <h3>${title}</h3>
      <p>${message}</p>
      <div class="payd-modal-actions">
        <button class="btn cancel" data-no-handler="true">${cancelText}</button>
        <button class="btn ${danger ? 'danger' : 'primary'} ok" data-no-handler="true">${okText}</button>
      </div>
    </div>
  `;

  const close = () => {
    backdrop.classList.remove('show');
    setTimeout(() => backdrop.remove(), 150);
  };

  backdrop.querySelector('.cancel').onclick = close;
  backdrop.querySelector('.ok').onclick = () => { close(); onOk(); };
  backdrop.onclick = e => { if (e.target === backdrop) close(); };

  document.body.appendChild(backdrop);
  requestAnimationFrame(() => backdrop.classList.add('show'));
}

/* ============================================================
   DROPDOWN MENU
   ============================================================ */
function showDropdown(anchor, items) {
  const existing = document.getElementById('payd-active-dropdown');
  if (existing) existing.remove();

  const rect = anchor.getBoundingClientRect();
  const dd = document.createElement('div');
  dd.id = 'payd-active-dropdown';
  dd.className = 'payd-dropdown';
  dd.style.top = `${rect.bottom + 6}px`;
  dd.style.left = `${rect.left}px`;

  items.forEach(item => {
    if (item.divider) {
      const d = document.createElement('div');
      d.className = 'payd-dropdown-divider';
      dd.appendChild(d);
      return;
    }
    const opt = document.createElement('div');
    opt.className = `payd-dropdown-item ${item.danger ? 'danger' : ''}`;
    opt.innerHTML = `<span class="ic">${item.icon || ''}</span><span>${item.label}</span>`;
    opt.onclick = () => {
      dd.remove();
      if (item.action) item.action();
    };
    dd.appendChild(opt);
  });

  document.body.appendChild(dd);
  requestAnimationFrame(() => dd.classList.add('show'));

  setTimeout(() => {
    document.addEventListener('click', function handler(e) {
      if (!dd.contains(e.target)) {
        dd.remove();
        document.removeEventListener('click', handler);
      }
    });
  }, 0);
}

/* ============================================================
   GLOBAL BUTTON HANDLERS
   ============================================================ */
function initButtonHandlers() {
  if (window._paydHandlersInited) return;
  window._paydHandlersInited = true;

  document.addEventListener('click', e => {
    // Switches in settings
    const sw = e.target.closest('.switch');
    if (sw) {
      sw.classList.toggle('on');
      toast(sw.classList.contains('on') ? 'Опция включена' : 'Опция отключена', 'info');
      return;
    }

    // Filter chips (chip-row): make selected, deactivate others in same row
    const chip = e.target.closest('.chip-row .chip');
    if (chip && !chip.href) {
      chip.parentElement.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      return;
    }

    // Tabs: visual active toggle within same .tabs container
    const tab = e.target.closest('.tabs .tab');
    if (tab) {
      tab.parentElement.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      return;
    }

    // Quick action items / chart tabs
    const ct = e.target.closest('.chart-tabs .ct');
    if (ct) {
      ct.parentElement.querySelectorAll('.ct').forEach(t => t.classList.remove('active'));
      ct.classList.add('active');
      return;
    }

    // Task checkbox toggle
    const taskCheck = e.target.closest('.task-item .check');
    if (taskCheck) {
      const item = taskCheck.closest('.task-item');
      item.classList.toggle('done');
      if (item.classList.contains('done')) {
        taskCheck.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>';
        toast('Задача выполнена', 'success');
      } else {
        taskCheck.innerHTML = '';
      }
      return;
    }

    // Checklist items in warehouse
    const checklistCheck = e.target.closest('.checklist-item .check');
    if (checklistCheck) {
      const item = checklistCheck.closest('.checklist-item');
      item.classList.toggle('done');
      if (item.classList.contains('done')) {
        checklistCheck.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>';
      } else {
        checklistCheck.innerHTML = '';
      }
      return;
    }

    // Buttons (.btn, .icon-btn) — but not links and not those with onclick or inside forms
    const btn = e.target.closest('button.btn, button.icon-btn, .btn:not(a)');
    if (!btn || btn.tagName === 'A' || btn.hasAttribute('onclick') || btn.closest('form')) return;
    if (btn.dataset.noHandler === 'true') return;
    // Skip clicks inside confirm/own modals
    if (btn.closest('.payd-modal-backdrop, .modal-bg')) return;

    handleSemanticButton(e, btn);
  });
}

function handleSemanticButton(e, btn) {
  const text = btn.textContent.trim().toLowerCase().replace(/\s+/g, ' ');

  // ---- PRINT ----
  if (text.startsWith('печат')) {
    e.preventDefault();
    toast('Открываю окно печати', 'info');
    setTimeout(() => window.print(), 300);
    return;
  }

  // ---- "Провести и закрыть" → save + return to source page ----
  if (text.includes('провести и закрыть') || text.includes('сохранить и закрыть')) {
    e.preventDefault();
    const back = window._paydReturnUrl || 'zhurnal.html';
    const backLabel = back.includes('manager') ? 'CRM менеджера'
      : back.includes('clients') || back.includes('client.html') ? 'клиентам'
      : back.includes('contracts') ? 'договорам'
      : back.includes('collector') ? 'взысканию'
      : back.includes('warehouse') ? 'выдаче'
      : back.includes('sb.html') ? 'СБ'
      : 'журналу';
    toast('Документ проведён и сохранён', { type: 'success', subtitle: `Возврат к ${backLabel}...` });
    setTimeout(() => { location.href = back; }, 900);
    return;
  }

  // ---- Save / process actions ----
  if (text === 'провести') { e.preventDefault(); toast('Документ проведён', 'success'); return; }
  if (text === 'записать' || text === 'сохранить' || text === 'сохранить шаблон' || text === 'сохранить изменения') {
    e.preventDefault();
    toast('Сохранено', 'success');
    return;
  }

  // ---- Communications ----
  if (text === 'sms' || text === 'sms клиенту' || text.includes('отправить sms') || text === 'напомнить') {
    e.preventDefault();
    toast('SMS отправлено клиенту', 'success');
    return;
  }
  if (text === 'звонок' || text.includes('позвонить') || text.includes('звонок')) {
    e.preventDefault();
    toast('Соединение через Mango Office...', 'info');
    return;
  }
  if (text.includes('отправить клиенту')) {
    e.preventDefault();
    toast('Документ отправлен клиенту', 'success');
    return;
  }
  if (text.includes('массовая рассылка')) {
    e.preventDefault();
    toast('Рассылка запущена', { type: 'info', subtitle: 'Получатели определяются по фильтру' });
    return;
  }

  // ---- Decision actions ----
  if (text === 'одобрить' || text === 'подтвердить выдачу' || text === 'принять') {
    e.preventDefault();
    toast('Действие выполнено', 'success');
    return;
  }
  if (text === 'отклонить' || text === 'отказать') {
    e.preventDefault();
    confirmDialog({
      title: 'Отклонить заявку?',
      message: 'Заявка будет переведена в статус «Отклонена». Клиент получит SMS-уведомление.',
      okText: 'Отклонить',
      onOk: () => toast('Заявка отклонена', 'error')
    });
    return;
  }
  if (text === 'запросить документы') {
    e.preventDefault();
    toast('Запрос документов отправлен клиенту', 'info');
    return;
  }

  // ---- Destructive ----
  if (text === 'удалить' || text === 'удалить организацию' || text === 'очистить') {
    e.preventDefault();
    confirmDialog({
      title: 'Удалить?',
      message: 'Это действие нельзя отменить. Все связанные данные будут удалены.',
      okText: 'Удалить',
      onOk: () => toast('Удалено', 'error')
    });
    return;
  }
  if (text === 'расторгнуть') {
    e.preventDefault();
    confirmDialog({
      title: 'Расторгнуть договор?',
      message: 'Договор будет аннулирован. Клиенту будет отправлено уведомление о расторжении.',
      okText: 'Расторгнуть',
      onOk: () => toast('Договор расторгнут', 'error')
    });
    return;
  }
  if (text === 'закрыть смену') {
    e.preventDefault();
    confirmDialog({
      title: 'Закрыть смену?',
      message: 'Будет сформирован Z-отчёт, остаток зафиксирован, новая смена откроется только после подтверждения.',
      okText: 'Закрыть смену',
      danger: false,
      onOk: () => toast('Смена закрыта · Z-отчёт сформирован', 'success')
    });
    return;
  }

  // ---- "Создать на основании" dropdown ----
  if (text.startsWith('создать на основании') || text.startsWith('создать на основан')) {
    e.preventDefault();
    const I = window.PaydIcons;
    showDropdown(btn, [
      { label: 'Договор рассрочки', icon: I.file, action: () => location.href = 'template.html?t=standard' },
      { label: 'Договор Мурабаха', icon: I.file, action: () => location.href = 'template.html?t=murabaha' },
      { label: 'Акт приёма-передачи', icon: I.file, action: () => location.href = 'template.html?t=act' },
      { divider: true },
      { label: 'Платёж в кассу', icon: I.cash, action: () => location.href = 'kassir.html' },
      { label: 'Уведомление о просрочке', icon: I.sms, action: () => location.href = 'template.html?t=notice' }
    ]);
    return;
  }

  // ---- "Еще" / "Ещё" dropdown ----
  if (text === 'еще' || text === 'ещё') {
    e.preventDefault();
    const I = window.PaydIcons;
    showDropdown(btn, [
      { label: 'Скопировать ссылку', icon: I.link, action: () => toast('Ссылка скопирована в буфер', 'success') },
      { label: 'Дублировать', icon: I.copy, action: () => toast('Создан дубликат', 'success') },
      { label: 'Экспорт в Excel', icon: I.download, action: () => toast('Файл скачан', 'success') },
      { label: 'Экспорт в PDF', icon: I.file, action: () => toast('PDF сформирован', 'success') },
      { divider: true },
      { label: 'Архивировать', icon: I.archive, action: () => toast('Перемещено в архив', 'info') },
      { label: 'Удалить', icon: I.trash, danger: true, action: () => confirmDialog({
        title: 'Удалить?',
        message: 'Действие нельзя отменить.',
        onOk: () => toast('Удалено', 'error')
      })}
    ]);
    return;
  }

  // ---- Export / download ----
  if (text === 'экспорт' || text === 'экспорт в 1с' || text.includes('excel') || text === 'скачать pdf' || text === 'экспортировать') {
    e.preventDefault();
    toast('Файл скачан', { type: 'success', subtitle: 'Сохранено в Загрузки' });
    return;
  }
  if (text === 'импорт') {
    e.preventDefault();
    toast('Откройте файл для загрузки', 'info');
    return;
  }

  // ---- Reports / generate schedule ----
  if (text.includes('сформировать график')) {
    e.preventDefault();
    toast('График платежей сформирован', 'success');
    return;
  }
  if (text === 'пересчитать') {
    e.preventDefault();
    toast('Расчёт обновлён', 'success');
    return;
  }
  if (text === 'обновить очередь') {
    e.preventDefault();
    toast('Очередь обновлена', 'success');
    return;
  }

  // ---- Cashier ----
  if (text.includes('принять платёж') || text.includes('принять платеж')) {
    e.preventDefault();
    toast('Платёж принят', { type: 'success', subtitle: 'Чек напечатан' });
    return;
  }
  if (text === 'распечатать чек') {
    e.preventDefault();
    toast('Чек отправлен на печать', 'info');
    return;
  }
  if (text === 'z-отчёт' || text === 'x-отчёт') {
    e.preventDefault();
    toast(`${btn.textContent.trim()} сформирован`, 'success');
    return;
  }

  // ---- Filters / generic ----
  if (text === 'фильтры') {
    e.preventDefault();
    toast('Расширенный фильтр в разработке', 'info');
    return;
  }
  if (text === 'обновить' || text === 'обновить очередь' || text === 'live режим') {
    e.preventDefault();
    toast('Данные обновлены', 'success');
    return;
  }

  // ---- Settings actions ----
  if (text === 'настроить' || text === 'подключить') {
    e.preventDefault();
    toast('Окно настройки откроется в следующей версии', 'info');
    return;
  }
  if (text.includes('z-отчёт') || text.includes('отчёт для проверки')) {
    e.preventDefault();
    toast('Отчёт сформирован', 'success');
    return;
  }

  // ---- Calendar / schedule ----
  if (text === 'календарь') {
    e.preventDefault();
    toast('Календарь откроется в следующей версии', 'info');
    return;
  }

  // ---- Tester / test ----
  if (text.includes('тест на клиенте')) {
    e.preventDefault();
    toast('Тест выполнен', { type: 'info', subtitle: 'Проверьте превью справа' });
    return;
  }
  if (text === 'дублировать') {
    e.preventDefault();
    toast('Дубликат создан', 'success');
    return;
  }

  // ---- Reschedule / archive / restore ----
  if (text === 'архивировать' || text === 'архив') {
    e.preventDefault();
    toast('Перемещено в архив', 'info');
    return;
  }
  if (text === 'откатить') {
    e.preventDefault();
    confirmDialog({
      title: 'Откатить версию?',
      message: 'Текущая версия станет архивной, а выбранная — активной.',
      okText: 'Откатить',
      danger: false,
      onOk: () => toast('Версия откатана', 'success')
    });
    return;
  }

  // Icon buttons with no text — let them be silent unless they have title
  if (btn.classList.contains('icon-btn') && !text) {
    // Notification icon — show example
    if (btn.title === 'Уведомления') {
      e.preventDefault();
      const I = window.PaydIcons;
      showDropdown(btn, [
        { label: 'Новая заявка #0000000148', icon: I.file, action: () => location.href = 'zhurnal.html' },
        { label: 'Просрочка 5 дней — Исраилов Я.', icon: I.warning, action: () => location.href = 'collector.html' },
        { label: 'Платёж получен 12 400 ₽', icon: I.cash, action: () => location.href = 'kassir.html' },
        { divider: true },
        { label: 'Все уведомления', icon: I.bell, action: () => toast('Скоро появится отдельная страница', 'info') }
      ]);
      return;
    }
    return;
  }
}

/* ============================================================
   LIVE SEARCH HELPER
   ============================================================ */
function liveSearch(inputSelector, rowsSelector, opts = {}) {
  const input = typeof inputSelector === 'string' ? document.querySelector(inputSelector) : inputSelector;
  if (!input) return;
  const { onEmpty } = opts;

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    const rows = document.querySelectorAll(rowsSelector);
    let visible = 0;
    rows.forEach(r => {
      const text = r.textContent.toLowerCase();
      const match = !q || text.includes(q);
      r.style.display = match ? '' : 'none';
      if (match) visible++;
    });
    if (onEmpty) onEmpty(visible, q);
  });
}

/* ============================================================
   AUTO-WIRE COMMON SEARCH BARS
   ============================================================ */
function autoWireSearchBars() {
  // Filter-search inputs with placeholder hints filter the nearest .tbl tbody tr OR card grids
  document.querySelectorAll('.filter-search input').forEach(input => {
    // Find the nearest searchable container
    const card = input.closest('.content')?.querySelector('.card table.tbl tbody');
    const grid = input.closest('.content')?.querySelector('.clients-grid, .product-grid, .partner-grid');

    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      // Tables
      if (card) {
        card.querySelectorAll('tr').forEach(r => {
          const t = r.textContent.toLowerCase();
          r.style.display = (!q || t.includes(q)) ? '' : 'none';
        });
      }
      // Card grids
      if (grid) {
        grid.querySelectorAll(':scope > *').forEach(c => {
          const t = c.textContent.toLowerCase();
          c.style.display = (!q || t.includes(q)) ? '' : 'none';
        });
      }
    });
  });

  // Pagination buttons: visual active toggle
  document.querySelectorAll('.pagination-controls').forEach(controls => {
    controls.addEventListener('click', e => {
      const btn = e.target.closest('.page-btn');
      if (!btn || btn.disabled) return;
      // skip arrows
      if (!btn.textContent.match(/^\d+$/)) return;
      controls.querySelectorAll('.page-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

/* ============================================================
   ICON LIBRARY (use instead of emoji for consistent rendering)
   ============================================================ */
const SVG = (path, size = 13, w = 2) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;

window.PaydIcons = {
  // Communications
  phone: SVG('<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>'),
  sms: SVG('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'),
  email: SVG('<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>'),
  // Actions
  openExt: SVG('<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>'),
  edit: SVG('<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>'),
  trash: SVG('<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>'),
  copy: SVG('<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>'),
  archive: SVG('<polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>'),
  download: SVG('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>'),
  // Status / icons
  star: SVG('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'),
  check: SVG('<polyline points="20 6 9 17 4 12"/>', 13, 3),
  close: SVG('<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'),
  refresh: SVG('<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>'),
  link: SVG('<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>'),
  // Documents
  file: SVG('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>'),
  invoice: SVG('<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>'),
  printer: SVG('<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>'),
  // People & money
  user: SVG('<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'),
  users: SVG('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'),
  cash: SVG('<rect x="2" y="6" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/><circle cx="12" cy="15" r="2"/>'),
  card: SVG('<rect x="3" y="5" width="18" height="14" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/>'),
  // Other
  meeting: SVG('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'),
  calc: SVG('<rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="14" x2="9" y2="14"/><line x1="12" y1="14" x2="13" y2="14"/><line x1="16" y1="14" x2="17" y2="14"/><line x1="8" y1="18" x2="9" y2="18"/><line x1="12" y1="18" x2="13" y2="18"/><line x1="16" y1="18" x2="17" y2="18"/>'),
  bell: SVG('<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>'),
  calendar: SVG('<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>'),
  note: SVG('<path d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>'),
  warning: SVG('<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'),
  info: SVG('<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>'),
  transfer: SVG('<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>'),
  package: SVG('<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>')
};

// ============================================================
//  MINI CALCULATOR — floating widget callable from any page
//  Usage: PaydApp.openMiniCalc({ partner: 'M.Видео' })
// ============================================================
function openMiniCalc(opts = {}) {
  // Singleton — close existing if any
  document.getElementById('payd-mini-calc-host')?.remove();

  // ----- Inject styles once -----
  if (!document.getElementById('payd-mini-calc-styles')) {
    const style = document.createElement('style');
    style.id = 'payd-mini-calc-styles';
    style.textContent = `
      .pmc-host {
        position: fixed; top: 0; right: 0; bottom: 0;
        width: 420px; max-width: 100vw;
        z-index: 950;
        display: flex;
        font-family: 'Inter', sans-serif;
        transform: translateX(100%);
        transition: transform .25s ease;
      }
      .pmc-host.show { transform: translateX(0); }
      .pmc-overlay {
        position: fixed; inset: 0;
        background: rgba(2, 6, 20, .55);
        backdrop-filter: blur(2px);
        opacity: 0;
        transition: opacity .25s;
        pointer-events: none;
      }
      .pmc-host.show .pmc-overlay { opacity: 1; pointer-events: auto; }
      .pmc-panel {
        position: relative;
        flex: 1;
        background: linear-gradient(180deg, #0d1730 0%, #07112a 100%);
        color: white;
        overflow-y: auto;
        box-shadow: -20px 0 60px rgba(0,0,0,.6);
        padding: 22px 22px 28px;
        border-left: 1px solid rgba(255,255,255,.1);
      }
      .pmc-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
      .pmc-head h3 { font-size: 18px; font-weight: 800; letter-spacing: -.02em; }
      .pmc-head .pmc-actions { display: flex; gap: 6px; }
      .pmc-icon-btn {
        width: 30px; height: 30px;
        background: rgba(255,255,255,.06);
        border: 1px solid rgba(255,255,255,.1);
        border-radius: 8px;
        color: #aab3c5;
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
      }
      .pmc-icon-btn:hover { color: white; background: rgba(255,255,255,.1); }
      .pmc-sub { font-size: 12px; color: #6b7591; margin-bottom: 14px; }
      .pmc-pills { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; padding: 3px; background: rgba(0,0,0,.35); border: 1px solid rgba(255,255,255,.08); border-radius: 10px; margin-bottom: 14px; }
      .pmc-pill { padding: 8px; text-align: center; font-size: 12px; font-weight: 600; color: #aab3c5; border-radius: 7px; cursor: pointer; }
      .pmc-pill.active { background: linear-gradient(180deg, rgba(47,123,255,.2), rgba(47,123,255,.08)); color: white; border: 1px solid rgba(47,123,255,.45); }
      .pmc-field { margin-bottom: 12px; }
      .pmc-label { font-size: 10px; text-transform: uppercase; letter-spacing: .1em; color: #6b7591; font-weight: 700; }
      .pmc-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
      .pmc-input-block { display: flex; align-items: baseline; gap: 8px; padding: 12px 14px; background: rgba(0,0,0,.4); border: 1px solid rgba(255,255,255,.08); border-radius: 11px; }
      .pmc-input-block.invalid { border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239,68,68,.12); }
      .pmc-input-block input { flex: 1; background: transparent; border: none; outline: none; color: white; font-size: 22px; font-weight: 800; letter-spacing: -.02em; font-family: inherit; width: 100%; }
      .pmc-input-block input::placeholder { color: #6b7591; }
      .pmc-input-block .cur { color: #6b7591; font-size: 14px; font-weight: 700; }
      .pmc-error { display: none; font-size: 11px; color: #f87171; font-weight: 600; margin-top: 6px; }
      .pmc-error.show { display: block; }
      .pmc-slider { -webkit-appearance: none; width: 100%; height: 5px; background: rgba(255,255,255,.08); border-radius: 3px; outline: none; }
      .pmc-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: white; border: 3px solid #2f7bff; cursor: pointer; }
      .pmc-chips { display: flex; gap: 5px; flex-wrap: wrap; }
      .pmc-chip { padding: 6px 11px; font-size: 12px; font-weight: 600; color: #aab3c5; background: rgba(0,0,0,.35); border: 1px solid rgba(255,255,255,.08); border-radius: 8px; cursor: pointer; }
      .pmc-chip.active { background: rgba(47,123,255,.18); color: white; border-color: #2f7bff; }
      .pmc-result {
        margin-top: 14px;
        padding: 16px;
        background: linear-gradient(180deg, rgba(47,123,255,.14), rgba(47,123,255,.04));
        border: 1px solid rgba(47,123,255,.35);
        border-radius: 14px;
      }
      .pmc-result .lbl { font-size: 10px; text-transform: uppercase; letter-spacing: .12em; color: #aab3c5; font-weight: 700; }
      .pmc-result .big { font-size: 32px; font-weight: 900; letter-spacing: -.03em; line-height: 1; margin: 6px 0 4px; }
      .pmc-result .big small { font-size: 14px; color: #aab3c5; font-weight: 700; }
      .pmc-result .note { font-size: 11px; color: #aab3c5; }
      .pmc-result-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px; }
      .pmc-result-grid .cell { padding: 10px 12px; background: rgba(0,0,0,.35); border: 1px solid rgba(255,255,255,.08); border-radius: 10px; }
      .pmc-result-grid .cell .l { font-size: 10px; text-transform: uppercase; letter-spacing: .08em; color: #6b7591; font-weight: 700; }
      .pmc-result-grid .cell .v { font-size: 16px; font-weight: 800; margin-top: 3px; letter-spacing: -.01em; }
      .pmc-cta {
        width: 100%; margin-top: 14px;
        padding: 12px;
        background: linear-gradient(180deg, #2f7bff, #1d4ed8);
        color: white; font-weight: 700; font-size: 13px;
        border: none; border-radius: 11px; cursor: pointer;
        font-family: inherit;
        box-shadow: 0 8px 20px -6px rgba(47,123,255,.55);
      }
      .pmc-cta:hover { transform: translateY(-1px); }
      .pmc-cta:disabled { opacity: .45; cursor: not-allowed; transform: none; }
      .pmc-link { display: block; text-align: center; font-size: 11px; color: #6b7591; margin-top: 10px; text-decoration: none; }
      .pmc-link:hover { color: #aab3c5; }
      .pmc-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
      .pmc-form-row.single { grid-template-columns: 1fr; }
      .pmc-form-row input { width: 100%; padding: 10px 12px; background: rgba(0,0,0,.4); border: 1px solid rgba(255,255,255,.08); border-radius: 10px; color: white; font-family: inherit; font-size: 13px; outline: none; }
      .pmc-form-row input:focus { border-color: #2f7bff; }
      .pmc-success { text-align: center; padding: 20px 0; }
      .pmc-success .check { width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, #10b981, #059669); display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px; box-shadow: 0 8px 24px rgba(16,185,129,.4); }
      .pmc-success .num { font-size: 11px; text-transform: uppercase; letter-spacing: .15em; color: #6b7591; font-weight: 700; }
      .pmc-success .num b { color: #2f7bff; font-size: 14px; letter-spacing: -.01em; text-transform: none; }
      .pmc-success h3 { font-size: 22px; font-weight: 800; margin: 6px 0 6px; }
      .pmc-success p { font-size: 13px; color: #aab3c5; margin-bottom: 16px; }
    `;
    document.head.appendChild(style);
  }

  // ----- Tariff resolution (mirror of calculator.html) -----
  const FALLBACK = {
    types: ['standard', 'murabaha'],
    terms: [3, 6, 12, 18, 24, 36],
    minDp: 0, maxAmount: 3000000,
    murabahaRates: { 3:5, 6:8, 12:12, 18:16, 24:20, 36:28 }
  };
  function loadGlobalActive() {
    try {
      const list = JSON.parse(localStorage.getItem('payd.tariffs.v1') || '[]');
      const id = localStorage.getItem('payd.tariffs.active');
      const byId = Object.fromEntries(list.map(t => [t.id, t]));
      return byId[id]
        || list.find(t => t.is_default || t.isDefault)
        || list[0]
        || null;
    } catch (_) { return null; }
  }
  function resolveTariff() {
    if (opts.partner) {
      try {
        const all = JSON.parse(localStorage.getItem('payd.partners.v1') || '{}');
        const p = all[opts.partner];
        if (p && p.tariff && (p.tariff.types?.length || p.tariff.terms?.length)) {
          return { name: p.name, src: p.tariff };
        }
      } catch (_) {}
    }
    const g = loadGlobalActive();
    return { name: opts.partner || (g ? g.name : null), src: g || FALLBACK };
  }
  const ctx = resolveTariff();
  const t = ctx.src;
  const tariff = {
    types: (t.types?.length) ? t.types : FALLBACK.types,
    terms: (t.terms?.length) ? t.terms : FALLBACK.terms,
    minDp: t.minDp ?? 0,
    maxAmount: t.maxAmount || 3000000,
    murabahaRates: (t.murabahaRates && Object.keys(t.murabahaRates).length) ? t.murabahaRates : FALLBACK.murabahaRates
  };

  const fmt = n => Math.round(n).toLocaleString('ru-RU');
  const parseNum = s => parseInt(String(s).replace(/\D/g, ''), 10) || 0;
  const TYPES = { standard: 'Стандартная', murabaha: 'Мурабаха' };
  const MIN_PRICE = 10000;

  const state = {
    type: tariff.types[0],
    price: Math.min(150000, tariff.maxAmount),
    dpPct: tariff.minDp,
    term: tariff.terms.includes(12) ? 12 : tariff.terms[Math.floor(tariff.terms.length / 2)],
    valid: true
  };

  // ----- Build DOM -----
  const host = document.createElement('div');
  host.id = 'payd-mini-calc-host';
  host.className = 'pmc-host';
  host.innerHTML = `
    <div class="pmc-overlay"></div>
    <div class="pmc-panel">
      <div class="pmc-head">
        <div>
          <h3>Калькулятор</h3>
          <div class="pmc-sub">${ctx.name ? 'Тариф · ' + ctx.name : 'Базовый тариф'}</div>
        </div>
        <div class="pmc-actions">
          <button class="pmc-icon-btn" title="Открыть в полном экране" data-action="full">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
          </button>
          <button class="pmc-icon-btn" title="Закрыть" data-action="close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>

      <div class="pmc-content">
        <div class="pmc-pills" id="pmc-types"></div>

        <div class="pmc-field">
          <div class="pmc-label" style="margin-bottom: 8px;">Стоимость товара</div>
          <div class="pmc-input-block" id="pmc-priceBlock">
            <input id="pmc-price" type="text" inputmode="numeric" placeholder="0" />
            <span class="cur">₽</span>
          </div>
          <div class="pmc-error" id="pmc-priceError">Минимальная сумма — 10 000 ₽</div>
          <input class="pmc-slider" id="pmc-priceSlider" type="range" min="10000" step="1000" style="margin-top: 10px;" />
        </div>

        <div class="pmc-field">
          <div class="pmc-row">
            <div class="pmc-label">Первый взнос</div>
            <div style="font-size: 13px; font-weight: 800;"><span id="pmc-dpAmount">0</span> ₽ · <span id="pmc-dpPct">0</span>%</div>
          </div>
          <input class="pmc-slider" id="pmc-dpSlider" type="range" min="0" max="80" />
        </div>

        <div class="pmc-field">
          <div class="pmc-row">
            <div class="pmc-label">Срок</div>
            <div style="font-size: 13px; font-weight: 800;" id="pmc-termValue">12 мес</div>
          </div>
          <div class="pmc-chips" id="pmc-terms"></div>
        </div>

        <div class="pmc-result">
          <div class="lbl">Ежемесячный платёж</div>
          <div class="big"><span id="pmc-monthly">—</span> <small>₽/мес</small></div>
          <div class="note" id="pmc-note">—</div>
          <div class="pmc-result-grid">
            <div class="cell"><div class="l">К оплате</div><div class="v"><span id="pmc-total">—</span> ₽</div></div>
            <div class="cell"><div class="l">Переплата</div><div class="v"><span id="pmc-over">—</span> ₽</div></div>
          </div>
        </div>

        <button class="pmc-cta" id="pmc-apply">Оформить заявку →</button>
        <a id="pmc-link" href="calculator.html" target="_blank" class="pmc-link">Открыть полную версию ↗</a>
      </div>
    </div>
  `;
  document.body.appendChild(host);
  requestAnimationFrame(() => host.classList.add('show'));

  // ----- Refs -----
  const $ = sel => host.querySelector(sel);
  const priceInput = $('#pmc-price'), priceBlock = $('#pmc-priceBlock'), priceError = $('#pmc-priceError');
  const priceSlider = $('#pmc-priceSlider');
  const dpSlider = $('#pmc-dpSlider'), dpAmount = $('#pmc-dpAmount'), dpPctEl = $('#pmc-dpPct');
  const termValue = $('#pmc-termValue');
  const monthlyEl = $('#pmc-monthly'), totalEl = $('#pmc-total'), overEl = $('#pmc-over'), noteEl = $('#pmc-note');
  const applyBtn = $('#pmc-apply');

  priceSlider.max = tariff.maxAmount;
  dpSlider.min = tariff.minDp;
  dpSlider.value = state.dpPct;

  // ----- Renderers -----
  function renderControls() {
    $('#pmc-types').innerHTML = tariff.types.map(t =>
      `<div class="pmc-pill${t === state.type ? ' active' : ''}" data-type="${t}">${TYPES[t]}</div>`
    ).join('');
    if (tariff.types.length === 1) $('#pmc-types').style.gridTemplateColumns = '1fr';

    const allowed = state.type === 'murabaha'
      ? tariff.terms.filter(m => tariff.murabahaRates[m] != null) : tariff.terms;
    if (!allowed.includes(state.term)) state.term = allowed[0] || tariff.terms[0];
    $('#pmc-terms').innerHTML = allowed.map(m =>
      `<div class="pmc-chip${m === state.term ? ' active' : ''}" data-term="${m}">${m} мес</div>`
    ).join('');
    if (state.dpPct < tariff.minDp) state.dpPct = tariff.minDp;
    dpSlider.value = state.dpPct;
    priceInput.value = state.price ? fmt(state.price) : '';
    priceSlider.value = state.price || MIN_PRICE;
  }

  function setError(msg) {
    if (msg) {
      priceBlock.classList.add('invalid');
      priceError.textContent = msg;
      priceError.classList.add('show');
      state.valid = false;
    } else {
      priceBlock.classList.remove('invalid');
      priceError.classList.remove('show');
      state.valid = true;
    }
  }

  function updateFullLink() {
    const link = $('#pmc-link');
    if (!link) return;
    const p = new URLSearchParams();
    if (opts.partner) p.set('partner', opts.partner);
    if (ctx.src?.id) p.set('tariff', ctx.src.id);
    if (state.price) p.set('price', state.price);
    p.set('dp', state.dpPct);
    p.set('term', state.term);
    p.set('type', state.type);
    link.href = 'calculator.html?' + p.toString();
  }

  function recalc() {
    updateFullLink();
    const ok = state.valid && state.price >= MIN_PRICE;
    applyBtn.disabled = !ok;
    if (!ok) {
      monthlyEl.textContent = '—';
      totalEl.textContent = '—';
      overEl.textContent = '—';
      noteEl.textContent = 'Укажите стоимость от 10 000 ₽';
      dpAmount.textContent = '0';
      dpPctEl.textContent = state.dpPct;
      termValue.textContent = state.term + ' мес';
      return;
    }
    const principal = state.price * (1 - state.dpPct / 100);
    let total, over, monthly;
    if (state.type === 'standard') {
      total = principal; over = 0; monthly = principal / state.term;
    } else {
      const annual = tariff.murabahaRates[state.term] ?? 12;
      const markup = principal * (annual / 100) * (state.term / 12);
      total = principal + markup; over = markup; monthly = total / state.term;
    }
    monthlyEl.textContent = fmt(monthly);
    totalEl.textContent = fmt(total + state.price * state.dpPct / 100);
    overEl.textContent = fmt(over);
    noteEl.textContent = state.type === 'standard' ? `${state.term} равных платежей · без переплаты` : `${state.term} равных платежей · Мурабаха`;
    dpAmount.textContent = fmt(state.price * state.dpPct / 100);
    dpPctEl.textContent = state.dpPct;
    termValue.textContent = state.term + ' мес';
  }

  // ----- Events -----
  host.querySelector('[data-action="close"]').addEventListener('click', closeMini);
  host.querySelector('[data-action="full"]').addEventListener('click', () => {
    const p = new URLSearchParams();
    if (opts.partner) p.set('partner', opts.partner);
    p.set('price', state.price); p.set('dp', state.dpPct);
    p.set('term', state.term); p.set('type', state.type);
    window.open('calculator.html?' + p.toString(), '_blank');
  });
  host.querySelector('.pmc-overlay').addEventListener('click', closeMini);

  $('#pmc-types').addEventListener('click', e => {
    const p = e.target.closest('.pmc-pill'); if (!p) return;
    state.type = p.dataset.type; renderControls(); recalc();
  });
  $('#pmc-terms').addEventListener('click', e => {
    const c = e.target.closest('.pmc-chip'); if (!c) return;
    state.term = parseInt(c.dataset.term, 10); renderControls(); recalc();
  });
  priceInput.addEventListener('input', e => {
    const raw = e.target.value, n = parseNum(raw);
    if (raw.trim() === '' || n === 0) { state.price = 0; e.target.value = ''; setError('Введите стоимость'); }
    else if (n < MIN_PRICE) { state.price = n; e.target.value = fmt(n); setError(`Минимум — ${fmt(MIN_PRICE)} ₽`); }
    else if (n > tariff.maxAmount) { state.price = tariff.maxAmount; e.target.value = fmt(state.price); setError(`Максимум — ${fmt(tariff.maxAmount)} ₽`); }
    else { state.price = n; e.target.value = fmt(n); setError(null); }
    priceSlider.value = Math.max(MIN_PRICE, state.price || MIN_PRICE);
    recalc();
  });
  priceSlider.addEventListener('input', e => {
    state.price = parseInt(e.target.value, 10); priceInput.value = fmt(state.price); setError(null); recalc();
  });
  dpSlider.addEventListener('input', e => {
    state.dpPct = Math.max(tariff.minDp, parseInt(e.target.value, 10)); recalc();
  });

  // Apply — show inline form, then success
  applyBtn.addEventListener('click', () => {
    const principal = state.price * (1 - state.dpPct / 100);
    const annual = state.type === 'murabaha' ? (tariff.murabahaRates[state.term] ?? 0) : 0;
    const markup = state.type === 'murabaha' ? principal * (annual / 100) * (state.term / 12) : 0;
    const total = principal + markup + state.price * state.dpPct / 100;
    const monthly = (principal + markup) / state.term;

    const content = host.querySelector('.pmc-content');
    content.innerHTML = `
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: .12em; color: #6b7591; font-weight: 700; margin-bottom: 8px;">Расчёт</div>
      <div style="background: rgba(0,0,0,.4); border: 1px solid rgba(255,255,255,.08); border-radius: 12px; padding: 12px 14px; margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; font-size: 13px; padding: 3px 0;"><span style="color: #6b7591;">Стоимость</span><b>${fmt(state.price)} ₽</b></div>
        <div style="display: flex; justify-content: space-between; font-size: 13px; padding: 3px 0;"><span style="color: #6b7591;">Взнос</span><b>${fmt(state.price * state.dpPct / 100)} ₽ · ${state.dpPct}%</b></div>
        <div style="display: flex; justify-content: space-between; font-size: 13px; padding: 3px 0;"><span style="color: #6b7591;">Срок</span><b>${state.term} мес · ${TYPES[state.type]}</b></div>
        <div style="display: flex; justify-content: space-between; font-size: 16px; padding: 6px 0 0; border-top: 1px solid rgba(255,255,255,.08); margin-top: 4px;"><span style="color: #6b7591;">Платёж</span><b style="color: #2f7bff;">${fmt(monthly)} ₽/мес</b></div>
      </div>

      <form id="pmc-form" autocomplete="off">
        <div class="pmc-field">
          <div class="pmc-label" style="margin-bottom: 6px;">ФИО клиента *</div>
          <div class="pmc-form-row single"><input id="pmc-name" placeholder="ФИО клиента" required /></div>
        </div>
        <div class="pmc-field">
          <div class="pmc-label" style="margin-bottom: 6px;">WhatsApp / телефон *</div>
          <div class="pmc-form-row single"><input id="pmc-phone" type="tel" placeholder="+7 989 123-45-67" required /></div>
        </div>
        <button class="pmc-cta" type="submit">Создать заявку</button>
        <button class="pmc-cta" type="button" id="pmc-back" style="background: transparent; box-shadow: none; border: 1px solid rgba(255,255,255,.1); color: #aab3c5; margin-top: 8px;">Назад к расчёту</button>
      </form>
    `;
    content.querySelector('#pmc-back').addEventListener('click', () => location.reload());
    content.querySelector('#pmc-phone').addEventListener('input', e => {
      let d = e.target.value.replace(/\D/g, '').slice(0, 11);
      if (d.startsWith('8')) d = '7' + d.slice(1);
      if (!d.startsWith('7') && d.length) d = '7' + d;
      e.target.value = d.length ? '+' + d.slice(0,1) + (d.slice(1,4) ? ' ' + d.slice(1,4) : '') + (d.slice(4,7) ? ' ' + d.slice(4,7) : '') + (d.slice(7,9) ? '-' + d.slice(7,9) : '') + (d.slice(9,11) ? '-' + d.slice(9,11) : '') : '';
    });
    content.querySelector('#pmc-form').addEventListener('submit', e => {
      e.preventDefault();
      const name = content.querySelector('#pmc-name').value.trim();
      const phone = content.querySelector('#pmc-phone').value.trim();
      if (!name || !phone) return;

      // Save to same store as full calculator
      let list = [];
      try { list = JSON.parse(localStorage.getItem('payd.calc.applications') || '[]'); } catch (_) {}
      const num = String(200 + list.length + 1).padStart(10, '0');
      const app = {
        id: 'A' + Date.now(),
        number: num,
        ts: new Date().toISOString(),
        partner: opts.partner || null,
        client: { name, phone },
        calc: {
          type: state.type,
          typeLabel: TYPES[state.type],
          price: state.price,
          dpPct: state.dpPct,
          dpAmount: Math.round(state.price * state.dpPct / 100),
          term: state.term,
          principal: Math.round(principal),
          annualRate: annual,
          markup: Math.round(markup),
          total: Math.round(total),
          monthly: Math.round(monthly)
        }
      };
      list.unshift(app);
      localStorage.setItem('payd.calc.applications', JSON.stringify(list));

      content.innerHTML = `
        <div class="pmc-success">
          <div class="check"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg></div>
          <div class="num">Заявка <b>№ ${num}</b> создана</div>
          <h3>Готово!</h3>
          <p>Менеджер свяжется с клиентом <b style="color:white;">${name}</b> по номеру <span style="color:white;">${phone}</span>.</p>
          <button class="pmc-cta" id="pmc-close-ok">Закрыть</button>
        </div>
      `;
      content.querySelector('#pmc-close-ok').addEventListener('click', closeMini);
      if (window.PaydApp?.toast) PaydApp.toast(`Заявка №${num} создана`, { type: 'success', subtitle: name });
    });
  });

  function closeMini() {
    host.classList.remove('show');
    setTimeout(() => host.remove(), 250);
    document.removeEventListener('keydown', escClose);
    window.removeEventListener('storage', onTariffStorage);
  }
  function escClose(e) { if (e.key === 'Escape') closeMini(); }
  document.addEventListener('keydown', escClose);

  // Если в другой вкладке поменяли дефолтный тариф или список тарифов —
  // переоткрываем калькулятор, чтобы подхватить новые параметры.
  function onTariffStorage(e) {
    if (e.key === 'payd.tariffs.active' || e.key === 'payd.tariffs.v1') {
      closeMini();
      setTimeout(() => window.PaydApp?.openMiniCalc?.(opts), 300);
    }
  }
  window.addEventListener('storage', onTariffStorage);

  renderControls();
  recalc();
  setTimeout(() => priceInput.focus(), 250);
}

// ============================================================
//  ATTACHMENTS WIDGET — загрузка / список / удаление файлов
//  Использование:
//   <div data-attachments data-entity-type="application" data-entity-id="..."></div>
// ============================================================
function mountAttachments(host, entityType, entityId, docType = 'attachment') {
  if (!host || !entityType || !entityId) return;

  host.innerHTML = `
    <div class="att-widget">
      <div class="att-list" data-att-list></div>
      <label class="att-upload">
        <input type="file" data-att-input style="display:none;" />
        <span class="btn sm">📎 Прикрепить файл</span>
        <span class="att-status" data-att-status></span>
      </label>
    </div>
  `;
  if (!document.getElementById('att-styles')) {
    const s = document.createElement('style');
    s.id = 'att-styles';
    s.textContent = `
      .att-widget { padding: 8px 0; }
      .att-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px; }
      .att-item { display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: var(--surface-2); border-radius: 8px; font-size: 12px; }
      .att-item .ic { color: var(--text-3); font-size: 16px; }
      .att-item .name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 600; }
      .att-item .size { color: var(--text-3); font-size: 11px; flex-shrink: 0; }
      .att-item a { color: var(--primary); text-decoration: none; }
      .att-item .del { color: var(--danger); cursor: pointer; opacity: .6; padding: 0 6px; }
      .att-item .del:hover { opacity: 1; }
      .att-upload { display: inline-flex; align-items: center; gap: 10px; cursor: pointer; }
      .att-status { font-size: 12px; color: var(--text-3); }
    `;
    document.head.appendChild(s);
  }

  const listEl = host.querySelector('[data-att-list]');
  const inputEl = host.querySelector('[data-att-input]');
  const statusEl = host.querySelector('[data-att-status]');

  function fmtSize(b) {
    if (!b) return '';
    if (b < 1024) return b + ' Б';
    if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' КБ';
    return (b / 1024 / 1024).toFixed(1) + ' МБ';
  }

  async function refresh() {
    if (!window.PaydDB) return;
    const items = await PaydDB.files.list(entityType, entityId);
    if (!items.length) {
      listEl.innerHTML = '<div style="font-size:12px;color:var(--text-3);padding:8px;">Файлов пока нет</div>';
      return;
    }
    listEl.innerHTML = items.map(d => `
      <div class="att-item" data-id="${d.id}">
        <span class="ic">📎</span>
        <span class="name">${escAtt(d.filename)}</span>
        <span class="size">${fmtSize(d.size_bytes)}</span>
        <a href="#" data-action="open" data-path="${d.storage_path}">Открыть</a>
        <span class="del" data-action="delete" data-path="${d.storage_path}">×</span>
      </div>
    `).join('');
    listEl.querySelectorAll('[data-action="open"]').forEach(a => {
      a.addEventListener('click', async (e) => {
        e.preventDefault();
        const url = await PaydDB.files.getUrl(a.dataset.path);
        if (url) window.open(url, '_blank');
      });
    });
    listEl.querySelectorAll('[data-action="delete"]').forEach(d => {
      d.addEventListener('click', () => {
        const item = d.closest('.att-item');
        confirmDialog({
          title: 'Удалить файл?',
          message: 'Файл будет удалён без возможности восстановления.',
          okText: 'Удалить',
          onOk: async () => {
            await PaydDB.files.delete(item.dataset.id, d.dataset.path);
            toast('Файл удалён', 'success');
            refresh();
          }
        });
      });
    });
  }

  inputEl.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast('Файл больше 10 МБ', 'error');
      return;
    }
    statusEl.textContent = 'Загрузка ' + file.name + '...';
    try {
      await PaydDB.files.upload(file, entityType, entityId, docType);
      statusEl.textContent = '';
      toast('Файл прикреплён', 'success');
      e.target.value = '';
      refresh();
    } catch (err) {
      statusEl.textContent = '';
      toast('Ошибка: ' + err.message, 'error');
    }
  });

  refresh();
  return { refresh };
}

function escAtt(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

window.PaydApp = { mountShell, toast, confirmDialog, showDropdown, liveSearch, openMiniCalc, mountAttachments };

document.addEventListener('DOMContentLoaded', () => {
  // Wait for shell to mount
  setTimeout(autoWireSearchBars, 50);
});

// Auto-init on pages without mountShell (e.g. login, lk-client)
document.addEventListener('DOMContentLoaded', () => {
  if (!window._paydHandlersInited) initButtonHandlers();
});
