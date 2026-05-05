/* ============================================================
   reports-data.js — живые показатели для отчётов

   Подключается на dashboard.html, reports.html, finance.html, audit.html
   После загрузки страницы:
   1. Тянет данные из Supabase через PaydDB
   2. Считает KPI (выручка, активные, просрочка и т.д.)
   3. Подставляет в элементы с атрибутом data-live="key"

   Пример HTML:
   <div class="stat-value" data-live="kpi:revenue:month">₽ 4 285 600</div>

   Если данных нет — показывает «—» или «0».
   ============================================================ */

(function () {
  'use strict';

  const fmt = {
    rub: (v) => '₽ ' + Math.round(Number(v) || 0).toLocaleString('ru-RU').replace(/,/g, ' '),
    rubShort: (v) => {
      const n = Number(v) || 0;
      if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.0', '') + 'М';
      if (n >= 1_000) return Math.round(n / 1_000) + 'К';
      return Math.round(n).toString();
    },
    int: (v) => Math.round(Number(v) || 0).toLocaleString('ru-RU').replace(/,/g, ' '),
    pct: (v) => (Number(v) || 0).toFixed(1).replace(/\.0$/, '') + '%',
    date: (v) => {
      const d = new Date(v);
      return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    },
    relTime: (v) => {
      const diff = (Date.now() - new Date(v).getTime()) / 1000;
      if (diff < 60) return 'только что';
      if (diff < 3600) return Math.round(diff / 60) + ' мин назад';
      if (diff < 86400) return Math.round(diff / 3600) + ' ч назад';
      return Math.round(diff / 86400) + ' дн назад';
    }
  };

  // Wait until PaydDB is ready and (optionally) cloud session is set
  async function waitReady() {
    for (let i = 0; i < 30; i++) {
      if (window.PaydDB) return;
      await new Promise(r => setTimeout(r, 100));
    }
  }

  async function loadAll() {
    if (!window.PaydDB) return null;
    const safe = (p) => p.then(r => r || []).catch(() => []);
    const [apps, partners, cashes, cashOps, articles, payouts, history] = await Promise.all([
      safe(PaydDB.list('applications')),
      safe(PaydDB.list('partners')),
      safe(PaydDB.list('cashes')),
      safe(PaydDB.list('cash_ops')),
      safe(PaydDB.list('cash_articles')),
      safe(PaydDB.list('payouts')),
      // History: try to fetch from Supabase if online
      window.PaydDB?.cloud?.isOnline?.()
        ? PaydDB.cloud.sb()?.from('application_history').select('*').order('ts', { ascending: false }).limit(50).then(r => r.data || []).catch(() => [])
        : Promise.resolve([])
    ]);
    return { apps, partners, cashes, cashOps, articles, payouts, history };
  }

  // ============================================================
  //  AGGREGATIONS
  // ============================================================
  function computeKPIs(d) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const todayStr = now.toDateString();

    // Cash ops aggregations
    const inOps = d.cashOps.filter(o => o.dir === 'in');
    const outOps = d.cashOps.filter(o => o.dir === 'out');
    const inMonth = inOps.filter(o => new Date(o.date || o.created_at) >= monthStart);
    const outMonth = outOps.filter(o => new Date(o.date || o.created_at) >= monthStart);
    const inToday = inOps.filter(o => new Date(o.date || o.created_at).toDateString() === todayStr);

    const revenueMonth = inMonth.reduce((s, o) => s + (+o.amount || 0), 0);
    const expensesMonth = outMonth.reduce((s, o) => s + (+o.amount || 0), 0);
    const todayIncome = inToday.reduce((s, o) => s + (+o.amount || 0), 0);

    // Applications
    const appsToday = d.apps.filter(a => new Date(a.ts || a.created_at).toDateString() === todayStr);
    const activeApps = d.apps.filter(a => !a.closed && !a.rejected);
    const activeAmount = activeApps.reduce((s, a) => s + (+(a.amount || a.calc?.price) || 0), 0);

    // Cash balances
    const cashTotal = d.cashes.reduce((s, c) => s + (+c.balance || 0), 0);

    // Top partners by application count + sum
    const partnersStat = {};
    d.apps.forEach(a => {
      const pid = a.partner_id || a.partnerId || (a.partner && (a.partner.name || a.partner));
      if (!pid) return;
      const key = String(pid);
      partnersStat[key] = partnersStat[key] || { count: 0, amount: 0, name: key };
      partnersStat[key].count++;
      partnersStat[key].amount += (+(a.amount || a.calc?.price) || 0);
    });
    const topPartners = Object.values(partnersStat).sort((a, b) => b.amount - a.amount).slice(0, 5);

    // Resolve partner names from partners list
    const partnerById = {};
    d.partners.forEach(p => {
      partnerById[p.id] = p.name;
      partnerById[p.name] = p.name;
    });
    topPartners.forEach(p => { p.name = partnerById[p.name] || p.name; });

    // Apps by type
    const byType = {};
    d.apps.forEach(a => {
      const t = a.type || a.calc?.type || 'другое';
      byType[t] = (byType[t] || 0) + 1;
    });

    // Apps by month (last 12)
    const byMonth = {};
    for (let i = 11; i >= 0; i--) {
      const d1 = new Date(now.getFullYear(), now.getMonth() - i, 1);
      byMonth[d1.toISOString().slice(0, 7)] = 0;
    }
    inOps.forEach(o => {
      const k = new Date(o.date || o.created_at).toISOString().slice(0, 7);
      if (k in byMonth) byMonth[k] += (+o.amount || 0);
    });

    return {
      revenueMonth, expensesMonth, todayIncome,
      todayIncomeCount: inToday.length,
      activeCount: activeApps.length, activeAmount,
      todayNewApps: appsToday.length,
      cashTotal,
      topPartners,
      byType, byMonth,
      apps: d.apps, partners: d.partners, cashes: d.cashes,
      cashOps: d.cashOps, articles: d.articles,
      history: d.history
    };
  }

  // ============================================================
  //  DOM PATCH HELPERS
  // ============================================================
  function set(key, value) {
    document.querySelectorAll(`[data-live="${key}"]`).forEach(el => {
      el.textContent = value;
    });
  }
  function setHTML(key, html) {
    document.querySelectorAll(`[data-live="${key}"]`).forEach(el => {
      el.innerHTML = html;
    });
  }

  // ============================================================
  //  PAGE: DASHBOARD
  // ============================================================
  function renderDashboard(k) {
    set('kpi:revenue:month', fmt.rub(k.revenueMonth));
    set('kpi:active:count', fmt.int(k.activeCount));
    set('kpi:active:amount', 'На сумму ' + fmt.rub(k.activeAmount));
    set('kpi:today:income', fmt.rub(k.todayIncome));
    set('kpi:today:income_count', k.todayIncomeCount
      ? 'Принято ' + k.todayIncomeCount + ' ' + plural(k.todayIncomeCount, 'платёж', 'платежа', 'платежей')
      : 'Платежей не было');
    set('kpi:today:new_apps', k.todayNewApps + '');
    set('kpi:overdue:count', '0');
    set('kpi:overdue:amount', '0 ₽ · 0% портфеля');
    set('kpi:partners:count', fmt.int(k.partners.length));

    // Top products from applications
    const products = {};
    k.apps.forEach(a => {
      const p = a.product || a.calc?.product;
      if (!p) return;
      products[p] = products[p] || { name: p, count: 0, amount: 0 };
      products[p].count++;
      products[p].amount += (+(a.amount || a.calc?.price) || 0);
    });
    const topProducts = Object.values(products).sort((a, b) => b.amount - a.amount).slice(0, 5);
    const prodHTML = topProducts.length
      ? topProducts.map(p => `
        <div class="top-row">
          <div class="product-mini-img">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="5" y="2" width="14" height="20" rx="2"/></svg>
          </div>
          <div class="info">
            <div class="n">${escapeHtml(p.name)}</div>
            <div class="s">${p.count} ${plural(p.count, 'продажа', 'продажи', 'продаж')}</div>
          </div>
          <div class="v">${fmt.rub(p.amount)}</div>
        </div>
      `).join('')
      : `<div style="padding:24px;text-align:center;color:var(--text-3);font-size:13px;">Появится после первых сделок</div>`;
    setHTML('list:products:top', prodHTML);

    // Period label
    const monthName = new Date().toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
    const lbl = document.getElementById('dash-period-label');
    if (lbl) lbl.textContent = 'Обзор за ' + monthName;

    // Top partners list
    const topHTML = k.topPartners.length
      ? k.topPartners.map((p, i) => `
        <div class="top-row">
          <div class="avatar c${(i % 6) + 1}">${(p.name || '?').slice(0, 2).toUpperCase()}</div>
          <div class="info">
            <div class="n">${escapeHtml(p.name)}</div>
            <div class="s">${p.count} ${plural(p.count, 'сделка', 'сделки', 'сделок')}</div>
          </div>
          <div style="text-align:right;">
            <div class="v">${fmt.rub(p.amount)}</div>
          </div>
        </div>
      `).join('')
      : `<div style="padding:24px;text-align:center;color:var(--text-3);font-size:13px;">Пока нет данных</div>`;
    setHTML('list:partners:top', topHTML);

    // Activity feed
    const eventsHTML = k.history.length
      ? k.history.slice(0, 10).map(h => `
        <div class="activity-item">
          <div class="ic">•</div>
          <div class="info">
            <div class="a">${escapeHtml(h.action || 'действие')}</div>
            <div class="b">${h.by_user || ''} · ${fmt.relTime(h.ts)}</div>
          </div>
        </div>
      `).join('')
      : `<div style="padding:24px;text-align:center;color:var(--text-3);font-size:13px;">Лента событий пуста — действия сотрудников появятся здесь</div>`;
    setHTML('list:activity:feed', eventsHTML);
  }

  // ============================================================
  //  PAGE: REPORTS
  // ============================================================
  function renderReports(k) {
    set('kpi:revenue:month', fmt.rub(k.revenueMonth));
    set('kpi:apps:total', fmt.int(k.apps.length));
    set('kpi:apps:active', fmt.int(k.activeCount));

    // By month bar chart
    const months = Object.entries(k.byMonth);
    const max = Math.max(...months.map(([_, v]) => v), 1);
    const barsHTML = months.map(([m, v]) => {
      const date = new Date(m + '-01');
      const label = date.toLocaleDateString('ru-RU', { month: 'short' });
      const h = (v / max) * 100;
      return `<div class="bar-col">
        <div class="bar-value">${fmt.rubShort(v)}</div>
        <div class="bar" style="height:${h}%"></div>
        <div class="bar-label">${label}</div>
      </div>`;
    }).join('');
    setHTML('chart:revenue:months', barsHTML);

    // By type
    const typeRows = Object.entries(k.byType).sort((a, b) => b[1] - a[1]);
    const typesHTML = typeRows.length
      ? typeRows.map(([t, c]) => `
        <div class="cat-item">
          <div class="head"><span class="n">${escapeHtml(t)}</span><span class="v">${c}</span></div>
          <div class="bar"><div class="fill" style="width:${(c / k.apps.length * 100) || 0}%;background:var(--primary);"></div></div>
        </div>`).join('')
      : `<div style="padding:24px;text-align:center;color:var(--text-3);font-size:13px;">Нет заявок</div>`;
    setHTML('chart:by:type', typesHTML);
  }

  // ============================================================
  //  PAGE: FINANCE
  // ============================================================
  function renderFinance(k) {
    set('kpi:cash:total', fmt.rub(k.cashTotal));
    set('kpi:cash:income_month', fmt.rub(k.revenueMonth));
    set('kpi:cash:expense_month', fmt.rub(k.expensesMonth));
    set('kpi:cash:net_month', fmt.rub(k.revenueMonth - k.expensesMonth));

    // Accounts list
    const accHTML = k.cashes.length
      ? k.cashes.map(c => `
        <div class="acc-row">
          <div class="ic" style="background:var(--primary-soft);color:var(--primary);">$</div>
          <div class="info">
            <div class="name">${escapeHtml(c.name || '')}</div>
            <div class="meta">${escapeHtml(c.address || c.kkt || '')}</div>
          </div>
          <div class="balance">${fmt.rub(c.balance)}</div>
        </div>
      `).join('')
      : `<div style="padding:24px;text-align:center;color:var(--text-3);font-size:13px;">Касс пока нет</div>`;
    setHTML('list:cash:accounts', accHTML);

    // Recent operations
    const opsHTML = k.cashOps.length
      ? k.cashOps.slice(0, 20).map(o => {
        const isIn = o.dir === 'in';
        return `<div class="op-row ${isIn ? 'income' : 'expense'}">
          <div class="ico">${isIn ? '↓' : '↑'}</div>
          <div>
            <div class="desc">${escapeHtml(o.article_name || o.articleName || '—')}</div>
            <div class="meta">${escapeHtml(o.party || '')}</div>
          </div>
          <div class="meta">${escapeHtml(o.num || '')}</div>
          <div class="meta">${fmt.date(o.date || o.created_at)}</div>
          <div class="amount">${(isIn ? '+' : '−')} ${fmt.rub(o.amount)}</div>
          <div class="meta">${escapeHtml(o.cash_id || o.cashId || '')}</div>
        </div>`;
      }).join('')
      : `<div style="padding:24px;text-align:center;color:var(--text-3);font-size:13px;">Операций ещё не было</div>`;
    setHTML('list:cash:operations', opsHTML);

    // By article
    const byArt = {};
    k.cashOps.forEach(o => {
      const key = (o.article_name || o.articleName || '—') + '|' + o.dir;
      byArt[key] = byArt[key] || { name: o.article_name || o.articleName || '—', dir: o.dir, sum: 0 };
      byArt[key].sum += (+o.amount || 0);
    });
    const artRows = Object.values(byArt).sort((a, b) => b.sum - a.sum).slice(0, 10);
    const totalAbs = artRows.reduce((s, r) => s + r.sum, 0) || 1;
    const artHTML = artRows.length
      ? artRows.map(r => `
        <div class="cat-item">
          <div class="head"><span class="n">${escapeHtml(r.name)}</span><span class="v">${fmt.rub(r.sum)}</span></div>
          <div class="bar"><div class="fill" style="width:${(r.sum / totalAbs * 100)}%;background:${r.dir === 'in' ? 'var(--success)' : 'var(--danger)'};"></div></div>
        </div>`).join('')
      : `<div style="padding:24px;text-align:center;color:var(--text-3);font-size:13px;">Нет статей</div>`;
    setHTML('chart:by:article', artHTML);
  }

  // ============================================================
  //  PAGE: AUDIT
  // ============================================================
  function renderAudit(k) {
    set('kpi:audit:total', fmt.int(k.history.length));

    const eventsHTML = k.history.length
      ? k.history.map(h => `
        <div class="activity-item">
          <div class="ic">•</div>
          <div class="info">
            <div class="a"><b>${escapeHtml(h.by_user || 'Система')}</b> — ${escapeHtml(h.action || '')}</div>
            <div class="b">${escapeHtml(h.app_id ? 'Заявка ' + String(h.app_id).slice(0, 8) : '')} · ${fmt.relTime(h.ts)}</div>
          </div>
        </div>
      `).join('')
      : `<div style="padding:32px;text-align:center;color:var(--text-3);font-size:13px;">Журнал аудита пуст. Все действия сотрудников появятся здесь автоматически.</div>`;
    setHTML('list:audit:events', eventsHTML);
  }

  // ============================================================
  //  HELPERS
  // ============================================================
  function plural(n, one, few, many) {
    n = Math.abs(n) % 100;
    const n1 = n % 10;
    if (n > 10 && n < 20) return many;
    if (n1 > 1 && n1 < 5) return few;
    if (n1 === 1) return one;
    return many;
  }
  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);
  }

  // ============================================================
  //  DISPATCH
  // ============================================================
  async function init() {
    await waitReady();
    if (!window.PaydDB) return;
    const data = await loadAll();
    if (!data) return;
    const k = computeKPIs(data);
    const path = location.pathname.toLowerCase();
    if (path.includes('dashboard')) renderDashboard(k);
    else if (path.includes('reports')) renderReports(k);
    else if (path.includes('finance')) renderFinance(k);
    else if (path.includes('audit')) renderAudit(k);

    // Re-render on data changes (любой апдейт коллекции)
    ['applications', 'cash_ops', 'partners', 'cashes'].forEach(coll => {
      PaydDB.subscribe(coll, () => init());
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 200);
  }
})();
