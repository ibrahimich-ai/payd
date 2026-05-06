/* ============================================================
   Payd Data Layer (db.js)

   Двухрежимная работа:
   - localStorage (по умолчанию) — быстро, оффлайн, для одного браузера
   - Supabase (облако) — для всех сотрудников одновременно, реалтайм

   API:
     PaydDB.list(coll, opts)   — получить список
     PaydDB.get(coll, id)      — одну запись
     PaydDB.upsert(coll, item) — создать/обновить
     PaydDB.remove(coll, id)   — удалить
     PaydDB.subscribe(coll, cb) — подписка на изменения

     PaydDB.cloud.connect()    — подключиться к Supabase
     PaydDB.cloud.signIn(email, pwd) — войти
     PaydDB.cloud.signOut()    — выйти
     PaydDB.cloud.user()       — текущий пользователь

     PaydDB.sync.push()        — залить localStorage → Supabase
     PaydDB.sync.pull()        — скачать Supabase → localStorage
   ============================================================ */

(function () {
  'use strict';

  // ============================================================
  //  CONFIG
  // ============================================================
  const SUPABASE_URL = 'https://ehxfjvcyqvpjtahkmncf.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_iRVhvmhCqwezAXL80vEpAg_yweB0VU6';

  // Логические коллекции → таблицы Supabase + ключи localStorage
  const COLLECTIONS = {
    partners:        { table: 'partners',              ls: 'payd.partners.v1',           type: 'map',  pk: 'name' },
    tariffs:         { table: 'tariffs',               ls: 'payd.tariffs.v1',            type: 'list', pk: 'id' },
    cashes:          { table: 'cashes',                ls: 'payd.cashes.v1',             type: 'list', pk: 'id' },
    cash_ops:        { table: 'cash_ops',              ls: 'payd.cash.ops.v1',           type: 'list', pk: 'id' },
    cash_articles:   { table: 'cash_articles',         ls: 'payd.cash.articles.v1',      type: 'list', pk: 'id' },
    applications:    { table: 'applications',          ls: 'payd.calc.applications',     type: 'list', pk: 'id' },
    workflows:       { table: 'application_workflows', ls: 'payd.zayavka.wf.v1',         type: 'map',  pk: 'app_id' },
    payouts:         { table: 'partner_payouts',       ls: 'payd.partner.payouts.v1',    type: 'list', pk: 'id' },
    reserv_stages:   { table: 'partner_reservations',  ls: 'payd.partner.reserv.stages.v1', type: 'map', pk: 'app_id' },
    // Новые коллекции (Migration V2)
    clients:         { table: 'clients',               ls: 'payd.clients.v1',            type: 'map',  pk: 'phone' },
    product_categories: { table: 'product_categories', ls: 'payd.products.categories.v1', type: 'list', pk: 'id' },
    products:        { table: 'products',              ls: 'payd.products.v1',           type: 'map',  pk: 'id' },
    contracts:       { table: 'contracts',             ls: 'payd.contracts.v1',          type: 'list', pk: 'id' },
    promo_campaigns: { table: 'promo_campaigns',       ls: 'payd.promo.v1',              type: 'list', pk: 'id' },
    payments:        { table: 'payments',              ls: 'payd.payments.v1',           type: 'list', pk: 'id' },
    kanban:          { table: null,                    ls: 'payd.kanban.v1',             type: 'map',  pk: 'leadId' } // local-only
  };

  // ============================================================
  //  Supabase client (lazy init)
  // ============================================================
  let _sb = null;
  let _user = null;
  let _isOnline = false;

  function getSb() {
    if (_sb) return _sb;
    if (typeof supabase === 'undefined' || !supabase.createClient) {
      console.warn('[PaydDB] Supabase SDK не загружен');
      return null;
    }
    _sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true }
    });
    return _sb;
  }

  // ============================================================
  //  localStorage helpers (всегда используются как кеш)
  // ============================================================
  function loadLocal(coll) {
    const def = COLLECTIONS[coll];
    if (!def) throw new Error('Unknown collection: ' + coll);
    try {
      const raw = localStorage.getItem(def.ls);
      if (!raw) return def.type === 'list' ? [] : {};
      return JSON.parse(raw);
    } catch (_) {
      return def.type === 'list' ? [] : {};
    }
  }
  function saveLocal(coll, data) {
    const def = COLLECTIONS[coll];
    localStorage.setItem(def.ls, JSON.stringify(data));
    notify(coll);
  }

  // ============================================================
  //  Subscriptions (для UI)
  // ============================================================
  const subs = {};
  function subscribe(coll, cb) {
    subs[coll] = subs[coll] || [];
    subs[coll].push(cb);
    return () => { subs[coll] = (subs[coll] || []).filter(f => f !== cb); };
  }
  function notify(coll) {
    (subs[coll] || []).forEach(cb => { try { cb(coll); } catch (_) {} });
  }
  window.addEventListener('storage', e => {
    Object.entries(COLLECTIONS).forEach(([coll, def]) => { if (e.key === def.ls) notify(coll); });
  });

  // ============================================================
  //  CRUD (работает на localStorage, опционально синхронизирует с облаком)
  // ============================================================
  async function list(coll, opts) {
    opts = opts || {};
    const def = COLLECTIONS[coll];
    const raw = loadLocal(coll);
    let arr = def.type === 'list' ? [...raw] : Object.values(raw);
    if (opts.where) arr = arr.filter(item => Object.entries(opts.where).every(([k, v]) => item[k] === v));
    if (opts.orderBy) {
      const { field, dir } = opts.orderBy;
      const m = dir === 'desc' ? -1 : 1;
      arr.sort((a, b) => (a[field] > b[field] ? 1 : -1) * m);
    }
    if (opts.limit) arr = arr.slice(0, opts.limit);
    return arr;
  }

  async function get(coll, pkValue) {
    const def = COLLECTIONS[coll];
    const raw = loadLocal(coll);
    if (def.type === 'list') return raw.find(x => x[def.pk] === pkValue) || null;
    return raw[pkValue] || null;
  }

  async function upsert(coll, item) {
    const def = COLLECTIONS[coll];
    const raw = loadLocal(coll);
    const pkVal = item[def.pk];
    if (pkVal == null) throw new Error('upsert: missing pk "' + def.pk + '"');
    if (def.type === 'list') {
      const idx = raw.findIndex(x => x[def.pk] === pkVal);
      if (idx >= 0) raw[idx] = { ...raw[idx], ...item };
      else raw.unshift(item);
    } else {
      raw[pkVal] = { ...(raw[pkVal] || {}), ...item };
    }
    saveLocal(coll, raw);
    // Async push to cloud (не блокирующее)
    if (_isOnline && def.table) {
      try {
        const clean = normalizeForCloud(coll, item);
        if (clean) await getSb().from(def.table).upsert(clean, { onConflict: def.pk });
      } catch (e) { console.warn('[PaydDB] cloud upsert', coll, e.message); }
    }
    return item;
  }

  async function remove(coll, pkValue) {
    const def = COLLECTIONS[coll];
    const raw = loadLocal(coll);
    if (def.type === 'list') saveLocal(coll, raw.filter(x => x[def.pk] !== pkValue));
    else { delete raw[pkValue]; saveLocal(coll, raw); }
    if (_isOnline && def.table) {
      try { await getSb().from(def.table).delete().eq(def.pk, pkValue); } catch (e) { console.warn('[PaydDB] cloud remove', coll, e.message); }
    }
  }

  async function count(coll, where) {
    return (await list(coll, { where })).length;
  }

  async function bulkReplace(coll, items) {
    const def = COLLECTIONS[coll];
    if (def.type === 'list') saveLocal(coll, items);
    else {
      const map = {};
      items.forEach(it => { map[it[def.pk]] = it; });
      saveLocal(coll, map);
    }
  }

  // ============================================================
  //  CLOUD (Supabase)
  // ============================================================
  async function cloudConnect() {
    const sb = getSb();
    if (!sb) return false;
    const { data: { session } } = await sb.auth.getSession();
    if (session) {
      _user = session.user;
      _isOnline = true;
      window.dispatchEvent(new CustomEvent('payd:cloud:connected', { detail: { user: _user } }));
      // Background pull + realtime subscribe — для актуальных данных на разных устройствах
      backgroundPull().catch(e => console.warn('[PaydDB] background pull', e.message));
      subscribeRealtime();
      return true;
    }
    return false;
  }

  async function cloudSignIn(email, password) {
    const sb = getSb();
    if (!sb) throw new Error('Supabase SDK недоступен');
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    _user = data.user;
    _isOnline = true;
    window.dispatchEvent(new CustomEvent('payd:cloud:connected', { detail: { user: _user } }));
    backgroundPull().catch(e => console.warn('[PaydDB] background pull', e.message));
    subscribeRealtime();
    return _user;
  }

  // ============================================================
  //  BACKGROUND PULL — merge cloud data into localStorage без потери
  //  локально созданных записей, которые ещё не доехали до облака
  // ============================================================
  let _pullDone = false;
  async function backgroundPull() {
    if (_pullDone) return;
    _pullDone = true;
    const sb = getSb();
    if (!sb) return;
    for (const [coll, def] of Object.entries(COLLECTIONS)) {
      if (!def.table) continue;
      try {
        const { data, error } = await sb.from(def.table).select('*');
        if (error) throw error;
        const cloudItems = (data || []).map(it => denormalizeFromCloud(coll, it));
        const local = loadLocal(coll);

        // MERGE: локальные данные имеют приоритет (они могут быть свежее
        // и ещё не доехали до облака). Из облака берём только то, что
        // ОТСУТСТВУЕТ локально.
        if (def.type === 'list') {
          const localArr = Array.isArray(local) ? local : [];
          const localKeys = new Set(localArr.map(it => it[def.pk]).filter(Boolean));
          const merged = [...localArr];
          cloudItems.forEach(it => {
            const k = it[def.pk];
            if (k && !localKeys.has(k)) merged.push(it);
          });
          _origSetItem.call(localStorage, def.ls, JSON.stringify(merged));
        } else {
          const localMap = (local && typeof local === 'object') ? { ...local } : {};
          cloudItems.forEach(it => {
            const k = it[def.pk];
            // Не перезаписываем локальную версию — она может быть свежее
            if (k && !localMap[k]) localMap[k] = it;
          });
          _origSetItem.call(localStorage, def.ls, JSON.stringify(localMap));
        }
        notify(coll);
      } catch (e) {
        console.warn('[PaydDB] pull ' + coll, e.message);
      }
    }
  }

  // ============================================================
  //  REALTIME SUBSCRIPTIONS — реакция на изменения от других сотрудников
  // ============================================================
  let _realtimeChannel = null;
  function subscribeRealtime() {
    if (_realtimeChannel) return;
    const sb = getSb();
    if (!sb || !sb.channel) return;

    _realtimeChannel = sb.channel('payd-changes');
    Object.entries(COLLECTIONS).forEach(([coll, def]) => {
      if (!def.table) return;
      _realtimeChannel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: def.table },
        (payload) => {
          handleRealtimeChange(coll, payload);
        }
      );
    });
    _realtimeChannel.subscribe();
  }

  function handleRealtimeChange(coll, payload) {
    const def = COLLECTIONS[coll];
    if (!def) return;
    const newRow = payload.new && Object.keys(payload.new).length ? denormalizeFromCloud(coll, payload.new) : null;
    const oldRow = payload.old && Object.keys(payload.old).length ? denormalizeFromCloud(coll, payload.old) : null;

    const raw = loadLocal(coll);
    if (def.type === 'list') {
      let arr = Array.isArray(raw) ? [...raw] : [];
      if (payload.eventType === 'DELETE' && oldRow) {
        arr = arr.filter(x => x[def.pk] !== oldRow[def.pk]);
      } else if (newRow) {
        const idx = arr.findIndex(x => x[def.pk] === newRow[def.pk]);
        if (idx >= 0) arr[idx] = newRow;
        else arr.unshift(newRow);
      }
      // saveLocal без триггера upsert обратно (используем _origSetItem чтобы не зациклить auto-sync)
      _origSetItem.call(localStorage, def.ls, JSON.stringify(arr));
    } else {
      const map = raw && typeof raw === 'object' ? { ...raw } : {};
      if (payload.eventType === 'DELETE' && oldRow) {
        delete map[oldRow[def.pk]];
      } else if (newRow) {
        map[newRow[def.pk]] = newRow;
      }
      _origSetItem.call(localStorage, def.ls, JSON.stringify(map));
    }
    notify(coll);
  }

  async function cloudSignUp(email, password, fullName) {
    const sb = getSb();
    if (!sb) throw new Error('Supabase SDK недоступен');
    const { data, error } = await sb.auth.signUp({
      email, password,
      options: { data: { full_name: fullName } }
    });
    if (error) throw error;
    return data.user;
  }

  async function cloudSignOut() {
    const sb = getSb();
    if (!sb) return;
    await sb.auth.signOut();
    _user = null;
    _isOnline = false;
    window.dispatchEvent(new CustomEvent('payd:cloud:disconnected'));
  }

  function cloudUser() { return _user; }
  function cloudIsOnline() { return _isOnline; }

  // ============================================================
  //  SYNC (push/pull всех данных)
  // ============================================================
  async function syncPush() {
    if (!_isOnline) throw new Error('Сначала войдите в облако');
    const sb = getSb();
    const report = { uploaded: {}, errors: [] };

    for (const [coll, def] of Object.entries(COLLECTIONS)) {
      if (!def.table) continue;
      const raw = loadLocal(coll);
      const items = def.type === 'list' ? raw : Object.values(raw);
      if (!items.length) { report.uploaded[coll] = 0; continue; }
      try {
        // Чистим записи от внутренних полей и приводим к схеме БД
        const clean = items.map(it => normalizeForCloud(coll, it)).filter(Boolean);
        if (!clean.length) { report.uploaded[coll] = 0; continue; }
        const { error } = await sb.from(def.table).upsert(clean, { onConflict: def.pk });
        if (error) throw error;
        report.uploaded[coll] = clean.length;
      } catch (e) {
        report.errors.push({ coll, message: e.message });
        console.warn('[PaydDB] push', coll, e);
      }
    }
    return report;
  }

  async function syncPull() {
    if (!_isOnline) throw new Error('Сначала войдите в облако');
    const sb = getSb();
    const report = { downloaded: {}, errors: [] };

    for (const [coll, def] of Object.entries(COLLECTIONS)) {
      if (!def.table) continue;
      try {
        const { data, error } = await sb.from(def.table).select('*');
        if (error) throw error;
        const items = (data || []).map(it => denormalizeFromCloud(coll, it));
        if (def.type === 'list') saveLocal(coll, items);
        else {
          const map = {};
          items.forEach(it => { map[it[def.pk]] = it; });
          saveLocal(coll, map);
        }
        report.downloaded[coll] = items.length;
      } catch (e) {
        report.errors.push({ coll, message: e.message });
        console.warn('[PaydDB] pull', coll, e);
      }
    }
    return report;
  }

  // ============================================================
  //  Field mapping (localStorage ⇄ Supabase)
  //  Локальные ключи в camelCase, в БД snake_case + некоторые поля убираются
  // ============================================================

  // Какие колонки реально есть в каждой таблице БД
  // Лишние поля из localStorage будут отфильтрованы (иначе PGRST204)
  const ALLOWED_COLUMNS = {
    partners:      ['id','name','legal','inn','contact','address','phone','email','category','color','commission','status','tariff','deals','turnover','created_at','updated_at'],
    tariffs:       ['id','name','description','types','terms','min_dp','max_amount','murabaha_rates','ijara_rates','is_default','created_at'],
    cashes:        ['id','name','address','kkt','fn','responsible','balance','status','created_at'],
    cash_articles: ['id','name','dir','color','group_name','created_at'],
    cash_ops:      ['id','num','date','article_id','article_name','dir','cash_id','amount','party','note','app_id','created_at'],
    applications:  ['id','number','client_name','client_phone','client_passport','client_address','partner_id','client_id','product_id','product','product_color','type','amount','down_payment','term','monthly','manager_id','source','ts','created_at','updated_at'],
    workflows:     ['app_id','step','sb_passed','sb_score','rejected','completed','type','updated_at'],
    payouts:       ['id','partner_id','amount','description','inkassator_id','recipient','sign','note','delivered_at','confirmed_at','status','dispute_reason','created_at'],
    reserv_stages: ['id','app_id','partner_id','product','purchase_amt','sale_amt','stage','ts','updated_at'],
    // V2 collections — created_at/updated_at сервер сам выставит из default
    clients:           ['id','full_name','phone','passport','address','dob','email','note','is_blacklisted'],
    product_categories:['id','name','parent_id','fields','position','is_active'],
    products:          ['id','name','category_id','field_values','price','purchase_price','status','is_active','stock','sku'],
    contracts:         ['id','number','app_id','type','signed_at','signed_by','status','terminated_at','termination_reason'],
    promo_campaigns:   ['id','name','code','description','type','value','start_at','end_at','partner_id','is_active'],
    payments:          ['id','app_id','num','amount','method','cash_id','cashier_id','partner_id','due_date','status','paid_at','kind']
  };

  function normalizeForCloud(coll, item) {
    if (!item) return null;
    const out = { ...item };
    // applications
    if (coll === 'applications') {
      if (item.client?.name) {
        out.client_name = item.client.name;
        out.client_phone = item.client.phone;
      }
      if (item.calc) {
        out.amount = item.calc.price;
        out.down_payment = item.calc.dpAmount;
        out.term = item.calc.term;
        out.monthly = item.calc.monthly;
        out.type = item.calc.typeLabel || item.calc.type;
        out.product = item.calc.product;
      }
      out.number = item.number;
      out.source = item.source || 'calculator';
    }
    if (coll === 'cash_ops') {
      out.article_id = item.articleId;
      out.article_name = item.articleName;
      out.cash_id = item.cashId;
    }
    if (coll === 'workflows') {
      out.app_id = item.appId || item.app_id;
      out.sb_passed = item.sbPassed;
      out.sb_score = item.sbScore;
      // app_id обязательно (PK) — пропускаем если пустой
      if (!out.app_id) return null;
    }
    if (coll === 'payouts') {
      out.delivered_at = item.deliveredAt;
      out.confirmed_at = item.confirmedAt;
      out.dispute_reason = item.disputeReason;
    }
    if (coll === 'tariffs') {
      out.description  = item.description || item.desc;
      out.murabaha_rates = item.murabahaRates;
      out.ijara_rates    = item.ijaraRates;
      out.min_dp         = item.minDp;
      out.max_amount     = item.maxAmount;
    }
    if (coll === 'cash_articles') {
      out.group_name = item.group_name || item.group;
    }
    if (coll === 'reserv_stages') {
      // Нормализация: всегда snake_case (избавляемся от смеси appId/app_id)
      out.app_id       = item.app_id || item.appId;
      out.partner_id   = item.partner_id || item.partnerId;
      out.purchase_amt = item.purchase_amt ?? item.purchaseAmt;
      out.sale_amt     = item.sale_amt ?? item.saleAmt;
      delete out.appId; delete out.partnerId; delete out.purchaseAmt; delete out.saleAmt;
    }
    if (coll === 'clients') {
      out.full_name = item.full_name || item.name;
      out.is_blacklisted = item.is_blacklisted ?? item.blacklisted ?? false;
      // Empty phone → null (unique constraint allows multiple NULLs)
      if (!out.phone || !String(out.phone).trim()) out.phone = null;
      // Skip clients without phone — нечем матчить при upsert
      if (!out.phone) return null;
      // Empty date strings → null (postgres date can't parse "")
      ['dob','created_at','updated_at'].forEach(k => {
        if (out[k] === '' || out[k] == null) delete out[k];
      });
      // id у clients в БД uuid auto-generated; не передаём свой нестандартный
      if (out.id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(out.id))) {
        delete out.id;
      }
    }
    if (coll === 'product_categories') {
      out.parent_id = item.parent_id ?? item.parent ?? null;
      // fields jsonb — normalize string fields to {label, example}
      if (Array.isArray(item.fields)) {
        out.fields = item.fields.map(f =>
          typeof f === 'string' ? { label: f, example: '' } : { label: f.label, example: f.example || '' }
        );
      }
    }
    if (coll === 'products') {
      out.category_id   = item.category_id ?? item.category;
      // Пустая строка → null (FK не матчит '')
      if (!out.category_id || out.category_id === '') out.category_id = null;
      // Validate category exists locally — иначе FK violation
      if (out.category_id) {
        try {
          const cats = JSON.parse(localStorage.getItem('payd.products.categories.v1') || '[]');
          if (!cats.find(c => c.id === out.category_id)) {
            console.warn('[PaydDB] product references missing category, nulling:', out.category_id);
            out.category_id = null;
          }
        } catch (_) {}
      }
      out.field_values  = item.field_values ?? item.fieldValues ?? {};
      out.purchase_price = item.purchase_price ?? item.purchase ?? null;
      out.is_active     = item.is_active ?? (item.status !== 'archived');
    }
    if (coll === 'contracts') {
      out.app_id = item.app_id || item.appId;
    }

    // Фильтруем только разрешённые колонки + убираем undefined
    const allowed = ALLOWED_COLUMNS[coll];
    if (allowed) {
      const filtered = {};
      for (const k of allowed) {
        if (out[k] !== undefined && out[k] !== null) filtered[k] = out[k];
      }
      // Если PK таблицы — uuid, а локальный id не похож на uuid → удалить
      // (БД сгенерирует свой uuid, но при условии что есть другой unique-ключ для onConflict)
      const uuidLike = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const uuidPkTables = ['partners','applications','cash_ops','payouts','reserv_stages'];
      if (uuidPkTables.includes(coll) && filtered.id && !uuidLike.test(String(filtered.id))) {
        delete filtered.id;
      }
      return filtered;
    }
    return out;
  }

  function denormalizeFromCloud(coll, item) {
    const out = { ...item };
    if (coll === 'applications') {
      out.client = { name: item.client_name, phone: item.client_phone };
      out.calc = {
        price: item.amount,
        dpAmount: item.down_payment,
        term: item.term,
        monthly: item.monthly,
        type: item.type,
        typeLabel: item.type,
        product: item.product
      };
    }
    if (coll === 'cash_ops') {
      out.articleId = item.article_id;
      out.articleName = item.article_name;
      out.cashId = item.cash_id;
    }
    if (coll === 'workflows') {
      out.appId = item.app_id;
      out.sbPassed = item.sb_passed;
      out.sbScore = item.sb_score;
    }
    if (coll === 'payouts') {
      out.deliveredAt = item.delivered_at;
      out.confirmedAt = item.confirmed_at;
      out.disputeReason = item.dispute_reason;
    }
    if (coll === 'tariffs') {
      out.desc = item.description;
      out.murabahaRates = item.murabaha_rates;
      out.ijaraRates = item.ijara_rates;
      out.minDp = item.min_dp;
      out.maxAmount = item.max_amount;
    }
    if (coll === 'cash_articles') {
      out.group = item.group_name;
    }
    return out;
  }

  // ============================================================
  //  Backup helpers (для совместимости с settings.html)
  // ============================================================
  function exportAll() {
    const out = { _meta: { exportedAt: new Date().toISOString(), version: 1 } };
    Object.values(COLLECTIONS).forEach(def => {
      const v = localStorage.getItem(def.ls);
      if (v != null) out[def.ls] = v;
    });
    return out;
  }
  function importAll(data) {
    if (!data || typeof data !== 'object') throw new Error('Invalid backup');
    Object.keys(data).forEach(k => {
      if (k.startsWith('payd.')) localStorage.setItem(k, data[k]);
    });
    Object.keys(COLLECTIONS).forEach(coll => notify(coll));
  }

  // ============================================================
  //  Auto-sync: перехват localStorage.setItem
  //  Когда любая страница пишет в payd.*.v1 — автоматически толкаем в облако
  // ============================================================
  const _origSetItem = Storage.prototype.setItem;
  const _pushTimers = {};
  Storage.prototype.setItem = function (key, value) {
    _origSetItem.call(this, key, value);
    if (this !== window.localStorage) return;
    if (!_isOnline) return;
    // Найти коллекцию по ls-ключу
    for (const [coll, def] of Object.entries(COLLECTIONS)) {
      if (def.ls !== key || !def.table) continue;
      // Debounce 500ms — чтобы не слать на каждый чих
      clearTimeout(_pushTimers[coll]);
      _pushTimers[coll] = setTimeout(() => pushCollection(coll), 500);
      break;
    }
  };

  async function pushCollection(coll) {
    const def = COLLECTIONS[coll];
    if (!def?.table || !_isOnline) return;
    const sb = getSb();
    const raw = loadLocal(coll);
    const items = def.type === 'list' ? raw : Object.values(raw);
    if (!items.length) return;
    try {
      const clean = items.map(it => normalizeForCloud(coll, it)).filter(Boolean);
      if (!clean.length) return;
      await sb.from(def.table).upsert(clean, { onConflict: def.pk });
    } catch (e) {
      console.warn('[PaydDB] auto-sync', coll, e.message);
    }
  }

  // ============================================================
  //  Auto-connect on page load (если есть сессия)
  // ============================================================
  if (typeof supabase !== 'undefined') {
    cloudConnect().catch(() => {});
  } else {
    // SDK ещё не загружен — попробуем после DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => { cloudConnect().catch(() => {}); });
  }

  // ============================================================
  //  PUBLIC API
  // ============================================================
  // ============================================================
  //  FILES — Supabase Storage (bucket payd-docs)
  // ============================================================
  async function uploadFile(file, entityType, entityId, docType = 'attachment') {
    if (!_isOnline) throw new Error('Сначала войдите в облако');
    const sb = getSb();
    if (!sb) throw new Error('Supabase SDK недоступен');
    const ext = (file.name || 'file').split('.').pop();
    const safeName = (file.name || 'file').replace(/[^a-zA-Z0-9_.-]/g, '_');
    const path = `${entityType}/${entityId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
    const { error: upErr } = await sb.storage.from('payd-docs').upload(path, file);
    if (upErr) throw upErr;
    const { data, error } = await sb.from('documents').insert({
      entity_type: entityType,
      entity_id:   entityId,
      doc_type:    docType,
      filename:    file.name,
      storage_path: path,
      size_bytes:  file.size,
      mime_type:   file.type
    }).select().single();
    if (error) throw error;
    return data;
  }

  async function listFiles(entityType, entityId) {
    if (!_isOnline) return [];
    const sb = getSb();
    if (!sb) return [];
    const { data, error } = await sb.from('documents')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('uploaded_at', { ascending: false });
    if (error) { console.warn('[PaydDB] listFiles', error.message); return []; }
    return data || [];
  }

  async function getFileUrl(storagePath, expiresInSec = 300) {
    const sb = getSb();
    if (!sb) return null;
    const { data, error } = await sb.storage.from('payd-docs').createSignedUrl(storagePath, expiresInSec);
    if (error) { console.warn('[PaydDB] getFileUrl', error.message); return null; }
    return data?.signedUrl || null;
  }

  async function deleteFile(documentId, storagePath) {
    const sb = getSb();
    if (!sb) return;
    if (storagePath) await sb.storage.from('payd-docs').remove([storagePath]).catch(e => console.warn(e));
    await sb.from('documents').delete().eq('id', documentId);
  }

  // ============================================================
  //  PROFILES — текущий пользователь и его расширенный профиль
  //  TODO: добавить таблицу profiles в COLLECTIONS, когда схема стабилизируется.
  //  Пока — прямой запрос к profiles по auth.user.id.
  // ============================================================
  async function profileMe() {
    const sb = getSb();
    const user = _user;
    if (!sb || !user) return null;
    try {
      const { data } = await sb.from('profiles').select('*').eq('id', user.id).maybeSingle();
      return data || null;
    } catch (e) {
      console.warn('[PaydDB] profileMe', e.message);
      return null;
    }
  }

  // ============================================================
  //  AUDIT LOG — запись действий в application_history
  // ============================================================
  async function auditLog(appId, action, meta = {}) {
    if (!appId || !action) return;
    if (!_isOnline) return;
    const sb = getSb();
    if (!sb) return;
    try {
      const byUser = _user?.email || _user?.user_metadata?.full_name || 'system';
      await sb.from('application_history').insert({
        app_id: appId,
        action,
        by_user: byUser,
        meta
      });
    } catch (e) {
      console.warn('[PaydDB] audit log', e.message);
    }
  }

  window.PaydDB = {
    list, get, upsert, remove, count, bulkReplace,
    subscribe, exportAll, importAll, COLLECTIONS,
    audit: { log: auditLog },
    profiles: { me: profileMe },
    files: { upload: uploadFile, list: listFiles, getUrl: getFileUrl, delete: deleteFile },
    cloud: {
      connect: cloudConnect,
      signIn: cloudSignIn,
      signUp: cloudSignUp,
      signOut: cloudSignOut,
      user: cloudUser,
      isOnline: cloudIsOnline,
      sb: getSb
    },
    sync: {
      push: syncPush,
      pull: syncPull,
      pullCollection: backgroundPull
    }
  };
})();
