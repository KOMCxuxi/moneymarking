/* 日日記 — UI layer */
(function () {
  'use strict';

  const S = window.LedgerStore;
  const $ = function (sel, el) { return (el || document).querySelector(sel); };
  const $$ = function (sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); };

  const ICON_PATHS = {
    home: '<path d="M4 10.4 12 3.8l8 6.6V20a1 1 0 0 1-1 1h-4.6v-6.2H9.6V21H5a1 1 0 0 1-1-1z"/>',
    receipt: '<path d="M7 4.5h10a2 2 0 0 1 2 2V20l-3-1.7L13 20l-3-1.7L7 20V6.5a2 2 0 0 1 2-2Z"/><path d="M9.5 9h5M9.5 13h5"/>',
    chart: '<path d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5H12z"/><path d="M15 3.4A8.5 8.5 0 0 1 20.6 9H15z"/>',
    settings: '<path d="M4 7h9M17.5 7H20M4 17h2.5M11 17h9"/><circle cx="15" cy="7" r="2.2"/><circle cx="8.5" cy="17" r="2.2"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    'arrow-left': '<path d="M20 12H4M10 6l-6 6 6 6"/>',
    'chev-down': '<path d="m6 9 6 6 6-6"/>',
    'chev-left': '<path d="m15 6-6 6 6 6"/>',
    'chev-right': '<path d="m9 6 6 6-6 6"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
    backspace: '<path d="M20 6H9.8a1 1 0 0 0-.8.4l-4.6 5a1 1 0 0 0 0 1.2l4.6 5a1 1 0 0 0 .8.4H20a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1z"/><path d="m12 9.5 5 5M17 9.5l-5 5"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M8 3v4M16 3v4M3.5 10h17"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.8"/>',
    'eye-off': '<path d="m3 3 18 18"/><path d="M10.6 6.1A9.7 9.7 0 0 1 12 6c6 0 9.5 6 9.5 6a17 17 0 0 1-3.3 3.8M6.4 6.9A16.6 16.6 0 0 0 2.5 12S6 18 12 18a9.8 9.8 0 0 0 4.3-1"/>',
    trash: '<path d="M4 7h16M9 7V4.5h6V7M7 7l1 13h8l1-13M10 11v5M14 11v5"/>',
    wallet: '<path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H19a1 1 0 0 1 1 1v13H6.5A2.5 2.5 0 0 1 4 16.5z"/><path d="M4 8h16"/><circle cx="16.5" cy="13" r="1"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M4 20h16"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>',
    database: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>',
    palette: '<path d="M12 3.5a8.5 8.5 0 0 0 0 17c1.4 0 2-1 2-2 0-1.3-1-1.7-1-3 0-1 .8-1.5 1.8-1.5H17a3.8 3.8 0 0 0 3.8-3.8C20.5 6.2 16.7 3.5 12 3.5Z"/><circle cx="7.5" cy="10" r="1"/><circle cx="10" cy="6.8" r="1"/><circle cx="14.5" cy="6.8" r="1"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5"/><circle cx="12" cy="7.8" r=".9" fill="currentColor" stroke="none"/>',
    shield: '<path d="M12 3.5 19 6v6c0 4.2-2.8 6.7-7 8.5-4.2-1.8-7-4.3-7-8.5V6z"/><path d="m9 12 2 2 4-4"/>',
    sparkles: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/>'
  };

  function icon(name, cls) {
    return '<svg class="icon ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICON_PATHS[name] || '') + '</svg>';
  }

  const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
  const CURRENCIES = ['HK$', '$', '¥', 'NT$', '€', '£'];
  const EMOJIS = ['🍜', '☕', '🛒', '🚇', '🏠', '💡', '🎬', '💊', '📚', '👕', '🎁', '🐱', '✈️', '💰', '💼', '📈', '🧧', '📦'];
  const THEMES = [
    { id: 'system', label: '跟隨系統', swatch: 'linear-gradient(135deg,#F4F1EA 0 50%,#1A201B 50% 100%)' },
    { id: 'light', label: '淺色', swatch: '#F4F1EA' },
    { id: 'dark', label: '深色', swatch: '#1A201B' }
  ];
  const ACCOUNT_ICONS = { cash: '💵', bank: '🏦', credit: '💳', wallet: '🎫', other: '📁' };

  let state;
  let ui;
  let draft;
  let confirmState = null;
  let lastFocus = null;
  let toastTimer = null;
  let deferredPrompt = null;

  /* --------------------------------------------------------------- utils */

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function hexA(hex, alpha) {
    const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255).toString(16).padStart(2, '0');
    return hex + a;
  }

  function pad(n) { return String(n).padStart(2, '0'); }
  function currentYM() { return S.fmtYM(new Date()); }
  function todayISO() { return S.todayISO(new Date()); }

  function isCurrentMonth(ym) { return ym === currentYM(); }

  function monthLabel(ym) {
    const p = ym.split('-').map(Number);
    return p[0] + '年' + p[1] + '月';
  }

  function shortDate(iso) {
    const p = iso.split('-').map(Number);
    return p[1] + '月' + p[2] + '日';
  }

  function weekdayOf(iso) {
    return WEEKDAYS[new Date(iso + 'T12:00:00').getDay()];
  }

  function dayTitle(iso) {
    const t = todayISO();
    if (iso === t) return '今天 · ' + shortDate(iso);
    const y = new Date();
    y.setDate(y.getDate() - 1);
    if (iso === S.todayISO(y)) return '昨天 · ' + shortDate(iso);
    return shortDate(iso) + ' 週' + weekdayOf(iso);
  }

  function entryDateLabel(iso) {
    if (iso === todayISO()) return '今天';
    return shortDate(iso);
  }

  function fmtMoney(cents, opts) {
    const o = opts || {};
    if (state.settings.hideAmounts && !o.force) return '••••';
    const value = Math.abs(cents) / 100;
    const num = value.toLocaleString('en-HK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const symbol = o.noSymbol ? '' : state.settings.currency;
    return (cents < 0 ? '−' : '') + symbol + num;
  }

  function fmtCompact(cents) {
    if (state.settings.hideAmounts) return '••••';
    return state.settings.currency + Math.round(Math.abs(cents) / 100).toLocaleString('en-HK');
  }

  function signedMoney(cents, type) {
    if (state.settings.hideAmounts) return '••••';
    return (type === 'income' ? '+' : '−') + fmtMoney(Math.abs(cents));
  }

  function centsToPlain(cents) {
    return (cents / 100).toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
  }

  function plainToCents(value) {
    const n = Number(String(value || '').replace(/,/g, ''));
    return Number.isFinite(n) ? Math.round(n * 100) : 0;
  }

  function amountDisplayHTML(raw) {
    if (!raw) return '0';
    const parts = raw.split('.');
    const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.length > 1 ? intPart + '<span class="dec">.' + parts[1] + '</span>' : intPart;
  }

  function sortTx(a, b) {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    const ac = a.createdAt || '';
    const bc = b.createdAt || '';
    if (ac !== bc) return ac < bc ? 1 : -1;
    return a.id < b.id ? 1 : -1;
  }

  function haptic(ms) {
    if (navigator.vibrate) {
      try { navigator.vibrate(ms || 8); } catch (e) { /* noop */ }
    }
  }

  function download(filename, content, mime) {
    const blob = new Blob([content], { type: mime || 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    window.setTimeout(function () {
      URL.revokeObjectURL(url);
      a.remove();
    }, 800);
  }

  function themeLabel(id) {
    const t = THEMES.find(function (x) { return x.id === id; });
    return t ? t.label : '跟隨系統';
  }

  /* --------------------------------------------------------------- theme */

  function applyTheme() {
    const setting = state.settings.theme;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = setting === 'dark' || (setting === 'system' && prefersDark);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#111511' : '#F4F1EA');
  }

  /* --------------------------------------------------------------- toast */

  function toast(message, type) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = message;
    el.className = 'toast show' + (type === 'err' ? ' err' : '');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      el.className = 'toast' + (type === 'err' ? ' err' : '');
    }, 2200);
  }

  /* --------------------------------------------------------------- sheets */

  function openSheet(html, opts) {
    const o = opts || {};
    closeSheet(true);
    lastFocus = document.activeElement;
    const wrap = document.createElement('div');
    wrap.className = 'sheet-backdrop';
    wrap.innerHTML = '<div class="sheet ' + (o.className || '') + '" role="dialog" aria-modal="true">' + html + '</div>';
    $('#sheetRoot').appendChild(wrap);
    wrap.addEventListener('click', function (e) {
      if (e.target === wrap) closeSheet();
    });
    window.requestAnimationFrame(function () { wrap.classList.add('is-open'); });
    document.body.classList.add('sheet-open');
    const focusEl = wrap.querySelector('[data-autofocus]') || wrap.querySelector('button');
    window.setTimeout(function () {
      if (focusEl && document.body.contains(focusEl)) focusEl.focus({ preventScroll: true });
    }, 140);
    return wrap;
  }

  function closeSheet(immediate) {
    const wrap = $('#sheetRoot .sheet-backdrop');
    document.body.classList.remove('sheet-open');
    if (!wrap) return;
    if (immediate) {
      wrap.remove();
      return;
    }
    wrap.classList.remove('is-open');
    window.setTimeout(function () { wrap.remove(); }, 260);
    if (lastFocus && lastFocus.focus) {
      window.setTimeout(function () {
        try { lastFocus.focus({ preventScroll: true }); } catch (e) { /* noop */ }
      }, 60);
    }
  }

  function confirmSheet(opts) {
    confirmState = { onConfirm: opts.onConfirm, backTo: opts.backTo || null };
    openSheet(
      '<div class="sheet-grab"></div>' +
      '<div class="confirm-body">' +
      '<div class="confirm-icon">!</div>' +
      '<h3>' + esc(opts.title) + '</h3>' +
      '<p>' + esc(opts.message || '') + '</p>' +
      '<div class="btn-row">' +
      '<button class="btn btn-ghost" data-action="confirm-cancel">取消</button>' +
      '<button class="btn ' + (opts.danger === false ? 'btn-primary' : 'btn-danger') + '" data-action="confirm-ok">' + esc(opts.confirmText || '確定') + '</button>' +
      '</div></div>'
    );
  }

  /* ---------------------------------------------------------- top / views */

  function renderTopbar() {
    const ledger = S.ledgerById(state, ui.ledgerId) || state.ledgers[0];
    const name = $('#ledgerName');
    if (name) name.textContent = ledger.name;
    const dot = $('#ledgerDot');
    if (dot) dot.style.background = ledger.color;
    const eye = $('#eyeBtn');
    if (eye) {
      eye.innerHTML = icon(state.settings.hideAmounts ? 'eye-off' : 'eye');
      eye.setAttribute('aria-label', state.settings.hideAmounts ? '顯示金額' : '隱藏金額');
    }
  }

  function setView(view) {
    ui.view = view;
    $$('.view').forEach(function (el) { el.hidden = el.dataset.view !== view; });
    $$('.tab').forEach(function (el) {
      const on = el.dataset.view === view;
      el.classList.toggle('is-active', on);
      if (on) el.setAttribute('aria-current', 'page'); else el.removeAttribute('aria-current');
    });
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }

  function renderAll() {
    if (!state) return;
    if (!S.ledgerById(state, ui.ledgerId)) ui.ledgerId = state.ledgers[0].id;
    state.settings.activeLedgerId = ui.ledgerId;
    renderTopbar();
    renderHome();
    renderRecords();
    renderReports();
    renderSettings();
    $$('.tab').forEach(function (el) { el.classList.toggle('is-active', el.dataset.view === ui.view); });
  }

  function monthNavHTML() {
    return '<div class="month-nav">' +
      '<button class="month-arrow" data-action="month-prev" aria-label="上個月">' + icon('chev-left') + '</button>' +
      '<div class="month-label">' + monthLabel(ui.month) + '</div>' +
      '<button class="month-arrow" data-action="month-next" aria-label="下個月">' + icon('chev-right') + '</button>' +
      (isCurrentMonth(ui.month) ? '' : '<button class="today-chip" data-action="month-today">回到本月</button>') +
      '</div>';
  }

  function txRowHTML(t) {
    const cat = S.categoryById(state, t.categoryId) || { name: '未分類', emoji: '📦', color: '#8C9289' };
    const acc = S.accountById(state, t.accountId);
    const sub = [t.note, acc ? acc.name : ''].filter(Boolean).join(' · ');
    return '<button class="tx-row" data-action="edit-tx" data-id="' + esc(t.id) + '">' +
      '<span class="tx-emoji" style="background:' + hexA(cat.color, 0.13) + '">' + esc(cat.emoji) + '</span>' +
      '<span class="tx-main"><span class="tx-cat">' + esc(cat.name) + '</span>' +
      '<span class="tx-sub">' + esc(sub || '—') + '</span></span>' +
      '<span class="tx-amount ' + t.type + '">' + signedMoney(t.amount, t.type) + '</span>' +
      '</button>';
  }

  function emptyHTML(iconEmoji, title, text, cta) {
    return '<div class="empty"><div class="e-icon">' + iconEmoji + '</div><b>' + esc(title) + '</b><p>' + esc(text) + '</p>' +
      (cta ? '<button class="btn btn-primary" data-action="add-open">' + icon('plus') + '記一筆</button>' : '') + '</div>';
  }

  /* --------------------------------------------------------------- home */

  function heroAmountHTML(cents) {
    const symbol = esc(state.settings.currency);
    if (state.settings.hideAmounts) {
      return '<span class="hero-cur">' + symbol + '</span><span class="hero-num">••••</span>';
    }
    const parts = (cents / 100).toFixed(2).split('.');
    return '<span class="hero-cur">' + symbol + '</span>' +
      '<span class="hero-num">' + Number(parts[0]).toLocaleString('en-HK') +
      '<span class="dec">.' + parts[1] + '</span></span>';
  }

  function renderHome() {
    const el = $('#view-home');
    if (!el) return;
    const sum = S.summarize(state, ui.month, ui.ledgerId);
    const budget = S.budgetStatus(state, ui.month, ui.ledgerId);
    const ledger = S.ledgerById(state, ui.ledgerId);
    const recent = S.recentTransactions(state, ui.ledgerId, 5);
    let quick = S.topCategories(state, ui.ledgerId, 4);
    if (!quick.length) quick = state.categories.filter(function (c) { return c.type === 'expense'; }).slice(0, 4);

    const hasBudget = budget.total > 0;
    const pct = hasBudget ? budget.pct : 0;
    const over = hasBudget && budget.pct > 1;
    const budgetLeft = budget.total - budget.spent;

    const quickHTML = quick.map(function (c) {
      return '<button class="quick-item" data-action="add-open" data-cat="' + esc(c.id) + '">' +
        '<span class="quick-emoji" style="background:' + hexA(c.color, 0.13) + '">' + esc(c.emoji) + '</span>' +
        '<span class="quick-name">' + esc(c.name) + '</span></button>';
    }).join('') +
      '<button class="quick-item quick-more" data-action="add-open">' +
      '<span class="quick-emoji">' + icon('plus') + '</span><span class="quick-name">其他</span></button>';

    const recentHTML = recent.length
      ? '<div class="card">' + recent.map(txRowHTML).join('') + '</div>'
      : '<div class="card">' + emptyHTML('🧾', '還沒有紀錄', '按下面的＋，三秒記下第一筆。', true) + '</div>';

    el.innerHTML = monthNavHTML() +
      '<section class="hero">' +
        '<div class="hero-top"><span class="hero-label">本月支出 · ' + esc(ledger.name) + (state.settings.demoMode ? '<span class="demo-tag">示範</span>' : '') + '</span>' +
        '<button class="hero-eye" data-action="toggle-hide" aria-label="隱藏金額">' + icon(state.settings.hideAmounts ? 'eye-off' : 'eye') + '</button></div>' +
        '<div class="hero-amount">' + heroAmountHTML(sum.expense) + '</div>' +
        '<div class="hero-meta">' +
          '<div class="hero-stat"><span class="k">收入</span><span class="v">' + fmtMoney(sum.income) + '</span></div>' +
          '<div class="hero-stat"><span class="k">結餘</span><span class="v ' + (sum.net >= 0 ? 'pos' : '') + '">' + fmtMoney(sum.net) + '</span></div>' +
          '<div class="hero-stat"><span class="k">預算</span><span class="v">' + (hasBudget ? Math.round(pct * 100) + '%' : '—') + '</span></div>' +
        '</div>' +
        (hasBudget
          ? '<div class="hero-budget"><div class="budget-track"><i class="budget-fill ' + (over ? 'over' : '') + '" style="width:' + Math.min(100, Math.max(2, pct * 100)) + '%"></i></div>' +
            '<div class="hero-budget-cap"><span>預算 ' + fmtCompact(budget.total) + '</span><span>' + (over ? '超支 ' + fmtCompact(Math.abs(budgetLeft)) : '剩 ' + fmtCompact(budgetLeft)) + '</span></div></div>'
          : '<div class="hero-budget"><div class="hero-budget-cap"><span>還沒有每月預算</span><button data-action="open-panel" data-panel="budgets">立即設定 →</button></div></div>') +
      '</section>' +
      '<div class="section"><div class="section-head"><h2>快速記一筆</h2><span class="hint">點分類就開始</span></div><div class="quick-row">' + quickHTML + '</div></div>' +
      '<div class="section"><div class="section-head"><h2>最近紀錄</h2><button class="link-btn" data-action="nav" data-view="records">全部' + icon('chev-right') + '</button></div>' + recentHTML + '</div>' +
      '<div class="section mini-grid">' +
        '<div class="mini-card"><div class="mini-label">日均支出</div><div class="mini-value">' + fmtCompact(sum.avgDaily) + '<span class="unit">/日</span></div></div>' +
        '<div class="mini-card"><div class="mini-label">本月記帳</div><div class="mini-value">' + sum.days + '<span class="unit">天</span></div></div>' +
      '</div>';
  }

  /* ------------------------------------------------------------ records */

  function renderRecords() {
    const el = $('#view-records');
    if (!el) return;
    const filters = [
      { id: 'all', label: '全部' },
      { id: 'expense', label: '支出' },
      { id: 'income', label: '收入' }
    ];
    el.innerHTML =
      '<div class="page-head"><h1 class="page-title">明細</h1><p class="page-sub">每一筆收支，都查得到</p></div>' +
      monthNavHTML() +
      '<div class="search-wrap">' + icon('search') +
        '<input id="searchInput" class="search-input" type="search" placeholder="搜尋備註、分類、帳戶" value="' + esc(ui.query) + '" autocomplete="off">' +
        (ui.query ? '<button class="search-clear" data-action="search-clear" aria-label="清除搜尋">' + icon('close') + '</button>' : '') +
      '</div>' +
      '<div class="filter-row">' + filters.map(function (f) {
        return '<button class="filter-chip ' + (ui.filter === f.id ? 'is-active' : '') + '" data-action="filter" data-filter="' + f.id + '">' + f.label + '</button>';
      }).join('') + '</div>' +
      '<div id="recordsBody"></div>';
    renderRecordsBody();
  }

  function renderRecordsBody() {
    const body = $('#recordsBody');
    if (!body) return;
    const q = ui.query.trim().toLowerCase();
    let tx = state.transactions.filter(function (t) { return t.ledgerId === ui.ledgerId; });
    if (q) {
      tx = tx.filter(function (t) {
        const cat = S.categoryById(state, t.categoryId);
        const acc = S.accountById(state, t.accountId);
        return [t.note, cat ? cat.name : '', acc ? acc.name : '', t.date].join(' ').toLowerCase().indexOf(q) >= 0;
      });
    } else {
      tx = tx.filter(function (t) { return t.date.indexOf(ui.month) === 0; });
    }
    if (ui.filter !== 'all') tx = tx.filter(function (t) { return t.type === ui.filter; });
    tx.sort(sortTx);

    let expense = 0;
    let income = 0;
    tx.forEach(function (t) { if (t.type === 'expense') expense += t.amount; else income += t.amount; });

    const groups = [];
    const map = {};
    tx.forEach(function (t) {
      if (!map[t.date]) {
        map[t.date] = { date: t.date, items: [] };
        groups.push(map[t.date]);
      }
      map[t.date].items.push(t);
    });

    const summary = '<div class="card summary-strip">' +
      '<div class="summary-item"><div class="k">支出</div><div class="v">' + fmtMoney(expense) + '</div></div>' +
      '<div class="summary-item"><div class="k">收入</div><div class="v income">' + fmtMoney(income) + '</div></div>' +
      '<div class="summary-item"><div class="k">結餘</div><div class="v">' + fmtMoney(income - expense) + '</div></div>' +
      '</div>';

    if (!tx.length) {
      body.innerHTML = summary +
        (q ? emptyHTML('🔍', '找不到符合的紀錄', '試試其他關鍵字，或清除搜尋再找一次。')
          : emptyHTML('🗂️', '這個月還沒有紀錄', '新增一筆，月結就更完整了。', true));
      return;
    }

    const groupsHTML = groups.map(function (g) {
      let de = 0;
      let di = 0;
      g.items.forEach(function (t) { if (t.type === 'expense') de += t.amount; else di += t.amount; });
      const dayTotal = [de ? '支出 ' + fmtCompact(de) : '', di ? '收入 ' + fmtCompact(di) : ''].filter(Boolean).join(' · ');
      return '<div class="day-group">' +
        '<div class="day-head"><span class="day-date">' + esc(dayTitle(g.date)) + '</span><span class="day-total">' + esc(dayTotal) + '</span></div>' +
        '<div class="card">' + g.items.map(txRowHTML).join('') + '</div>' +
        '</div>';
    }).join('');

    body.innerHTML = (q ? '<div class="search-note">在所有月份中找到 ' + tx.length + ' 筆紀錄</div>' : '') +
      summary + groupsHTML;
  }

  /* ------------------------------------------------------------- reports */

  function donutHTML(rows, total) {
    const R = 67;
    const C = 2 * Math.PI * R;
    let offset = 0;
    const segs = rows.map(function (r) {
      const len = total > 0 ? (r.amount / total) * C : 0;
      const gap = rows.length > 1 ? 2.4 : 0;
      const dash = Math.max(len - gap, 0.01);
      const color = r.cat ? r.cat.color : r.color;
      const seg = '<circle cx="88" cy="88" r="' + R + '" fill="none" stroke="' + color + '" stroke-width="17" stroke-dasharray="' + dash + ' ' + C + '" stroke-dashoffset="' + (-offset) + '" transform="rotate(-90 88 88)"/>';
      offset += len;
      return seg;
    }).join('');
    return '<svg viewBox="0 0 176 176" role="img" aria-label="分類比例圖">' +
      '<circle cx="88" cy="88" r="' + R + '" fill="none" stroke="var(--surface-3)" stroke-width="17"/>' + segs + '</svg>';
  }

  function renderReports() {
    const el = $('#view-reports');
    if (!el) return;
    const sum = S.summarize(state, ui.month, ui.ledgerId);
    const type = ui.reportType;
    const total = type === 'expense' ? sum.expense : sum.income;
    const raw = sum.byCategory.map(function (r) {
      return { id: r.categoryId, amount: r.amount, count: r.count, cat: S.categoryById(state, r.categoryId) };
    }).filter(function (r) { return r.cat && r.cat.type === type; });

    let rows = raw;
    if (raw.length > 7) {
      const rest = raw.slice(6).reduce(function (a, r) { return a + r.amount; }, 0);
      rows = raw.slice(0, 6).concat([{ id: '__rest', amount: rest, cat: { name: '其他', emoji: '📦', color: '#B8B1A3' } }]);
    }

    const legend = rows.map(function (r, i) {
      const p = total > 0 ? r.amount / total : 0;
      return '<div class="legend-row">' +
        '<span class="legend-dot" style="background:' + r.cat.color + '"></span>' +
        '<div class="legend-main"><div class="legend-top"><span class="legend-name">' + esc(r.cat.name) + '</span>' +
        '<span class="legend-pct">' + (p * 100).toFixed(1) + '%</span></div>' +
        '<div class="legend-bar"><i style="width:' + Math.min(100, p * 100) + '%;background:' + r.cat.color + ';animation-delay:' + (i * 40) + 'ms"></i></div></div>' +
        '<span class="legend-amt">' + fmtCompact(r.amount) + '</span></div>';
    }).join('');

    const donutCard = '<div class="card report-card">' +
      '<div class="card-head"><h3>' + (type === 'expense' ? '支出分佈' : '收入來源') + '</h3><span class="sub">' + sum.count + ' 筆 · ' + monthLabel(ui.month) + '</span></div>' +
      (total > 0
        ? '<div class="donut-wrap">' + donutHTML(rows, total) + '<div class="donut-center"><span class="k">' + (type === 'expense' ? '總支出' : '總收入') + '</span><span class="v">' + fmtCompact(total) + '</span></div></div><div class="legend">' + legend + '</div>'
        : '<div class="donut-wrap">' + donutHTML([], 0) + '<div class="donut-center"><span class="k">' + (type === 'expense' ? '總支出' : '總收入') + '</span><span class="v">' + fmtCompact(0) + '</span></div></div>' +
          emptyHTML('📊', '還沒有' + (type === 'expense' ? '支出' : '收入') + '紀錄', '這個月記一筆，圖表就會出現。', true)) +
      '</div>';

    const trend = S.monthlyTrend(state, ui.month, 6, ui.ledgerId);
    let maxTrend = 1;
    trend.forEach(function (r) { maxTrend = Math.max(maxTrend, r.expense, r.income); });
    const trendCard = '<div class="card report-card">' +
      '<div class="card-head"><h3>六個月趨勢</h3><span class="sub">支出 / 收入</span></div>' +
      '<div class="trend">' + trend.map(function (r) {
        const eh = Math.max(3, Math.round((r.expense / maxTrend) * 100));
        const ih = Math.max(3, Math.round((r.income / maxTrend) * 100));
        return '<div class="trend-col"><div class="trend-bars">' +
          '<i class="trend-bar expense" style="height:' + eh + '%" title="支出 ' + esc(fmtCompact(r.expense)) + '"></i>' +
          '<i class="trend-bar income" style="height:' + ih + '%" title="收入 ' + esc(fmtCompact(r.income)) + '"></i>' +
          '</div><span class="trend-label ' + (r.ym === ui.month ? 'is-now' : '') + '">' + r.short + '</span></div>';
      }).join('') + '</div>' +
      '<div class="trend-legend"><span><i style="background:var(--accent)"></i>支出</span><span><i style="background:var(--primary)"></i>收入</span></div>' +
      '</div>';

    const budget = S.budgetStatus(state, ui.month, ui.ledgerId);
    let budgetCard;
    if (budget.total > 0) {
      const over = budget.pct > 1;
      const catRows = budget.categories.slice(0, 4).map(function (r) {
        const p = Math.min(100, r.pct * 100);
        return '<div class="budget-cat"><div class="row"><span class="name">' + esc(r.category.emoji) + ' ' + esc(r.category.name) + '</span>' +
          '<span class="val ' + (r.pct > 1 ? 'over' : '') + '">' + fmtCompact(r.spent) + ' / ' + fmtCompact(r.budget) + '</span></div>' +
          '<div class="bar-track"><i class="' + (r.pct > 1 ? 'over' : '') + '" style="width:' + Math.max(2, p) + '%"></i></div></div>';
      }).join('');
      budgetCard = '<div class="card report-card">' +
        '<div class="card-head"><h3>本月預算</h3><button class="link-btn" data-action="open-panel" data-panel="budgets">調整</button></div>' +
        '<div class="budget-total"><span class="big">' + fmtCompact(budget.spent) + '</span>' +
        '<span class="of">預算 ' + fmtCompact(budget.total) + '</span>' +
        '<span class="pct ' + (over ? 'over' : '') + '">' + Math.round(budget.pct * 100) + '%</span></div>' +
        '<div class="bar-track"><i class="' + (over ? 'over' : '') + '" style="width:' + Math.min(100, Math.max(2, budget.pct * 100)) + '%"></i></div>' +
        catRows + '</div>';
    } else {
      budgetCard = '<div class="card report-card"><div class="card-head"><h3>本月預算</h3></div>' +
        '<div class="empty" style="padding:14px 8px 18px"><div class="e-icon">🎯</div><b>設定預算，花錢更有數</b><p>每月總額與分類上限，隨時看到還剩多少。</p>' +
        '<button class="btn btn-primary" data-action="open-panel" data-panel="budgets">設定預算</button></div></div>';
    }

    const monthTx = state.transactions.filter(function (t) {
      return t.ledgerId === ui.ledgerId && t.date.indexOf(ui.month) === 0 && t.type === 'expense';
    });
    const biggest = monthTx.slice().sort(function (a, b) { return b.amount - a.amount; })[0];
    const expenseTop = sum.byCategory.map(function (r) {
      return { amount: r.amount, cat: S.categoryById(state, r.categoryId) };
    }).filter(function (r) { return r.cat && r.cat.type === 'expense'; })[0];
    const insights = [
      expenseTop ? '<div class="insight-row"><span class="insight-ic">🏆</span><div class="insight-main"><b>最大支出分類</b>' +
        '<span>' + esc(expenseTop.cat.emoji) + ' ' + esc(expenseTop.cat.name) + ' · <span class="num">' + fmtCompact(expenseTop.amount) + '</span>，佔 ' + (expenseTop.amount / (sum.expense || 1) * 100).toFixed(1) + '%</span></div></div>' : '',
      biggest ? '<div class="insight-row"><span class="insight-ic">🧾</span><div class="insight-main"><b>單筆最大支出</b>' +
        '<span>' + esc(shortDate(biggest.date)) + ' · <span class="num">' + fmtCompact(biggest.amount) + '</span>' + (biggest.note ? ' · ' + esc(biggest.note) : '') + '</span></div></div>' : '',
      '<div class="insight-row"><span class="insight-ic">📅</span><div class="insight-main"><b>平均每日支出</b>' +
        '<span>本月 <span class="num">' + fmtCompact(sum.avgDaily) + '</span> · 已記帳 ' + sum.days + ' 天</span></div></div>'
    ].join('');

    el.innerHTML = '<div class="page-head"><h1 class="page-title">報表</h1><p class="page-sub">看懂錢花在哪裡</p></div>' +
      monthNavHTML() +
      '<div class="seg-block"><div class="seg">' +
        '<button class="seg-btn ' + (type === 'expense' ? 'is-active' : '') + '" data-action="report-type" data-type="expense">支出</button>' +
        '<button class="seg-btn ' + (type === 'income' ? 'is-active' : '') + '" data-action="report-type" data-type="income">收入</button>' +
      '</div></div>' +
      donutCard + trendCard + budgetCard +
      '<div class="card report-card"><div class="card-head"><h3>本月洞察</h3></div>' + insights + '</div>';
  }

  /* ------------------------------------------------------------ settings */

  function settingsRow(opts) {
    return '<button class="settings-row" data-action="open-panel" data-panel="' + opts.panel + '">' +
      '<span class="settings-ic" style="' + (opts.tint ? 'background:' + hexA(opts.tint, 0.13) : '') + '">' + (opts.emoji || '') + '</span>' +
      '<span class="settings-main"><b>' + esc(opts.title) + '</b><span>' + esc(opts.sub) + '</span></span>' +
      (opts.value ? '<span class="settings-value">' + esc(opts.value) + '</span>' : '') +
      icon('chev-right', 'chev') + '</button>';
  }

  function renderSettings() {
    const el = $('#view-settings');
    if (!el) return;
    const ledger = S.ledgerById(state, ui.ledgerId);
    const budget = S.budgetStatus(state, ui.month, ui.ledgerId);
    el.innerHTML =
      '<div class="page-head"><h1 class="page-title">設定</h1><p class="page-sub">你的帳本，你的資料</p></div>' +
      '<div class="profile-card"><div class="profile-logo">記</div>' +
        '<div class="profile-main"><b>日日記</b><span>' + (state.settings.demoMode ? '示範資料 · 可於「備份與匯出」清除' : '簡單記帳 · 資料只存在這部裝置') + '</span></div>' +
        '<span class="profile-badge">v1.0</span></div>' +
      '<div class="settings-group"><div class="settings-label">記帳</div><div class="settings-card">' +
        settingsRow({ panel: 'ledgers', emoji: ledger.emoji, title: '帳本', sub: '目前：' + ledger.name, value: state.ledgers.length + ' 本' }) +
        settingsRow({ panel: 'accounts', emoji: '🏦', title: '帳戶', sub: '現金、銀行、信用卡、八達通', value: state.accounts.length + ' 個' }) +
        settingsRow({ panel: 'categories', emoji: '🏷️', title: '分類', sub: '自訂名稱、圖示與顏色', value: state.categories.length + ' 個' }) +
        settingsRow({ panel: 'budgets', emoji: '🎯', title: '每月預算', sub: '總額與分類上限', value: budget.total ? fmtCompact(budget.total) : '未設定' }) +
      '</div></div>' +
      '<div class="settings-group"><div class="settings-label">資料與外觀</div><div class="settings-card">' +
        settingsRow({ panel: 'data', emoji: '🗄️', title: '備份與匯出', sub: 'CSV、JSON 備份、還原' }) +
        settingsRow({ panel: 'appearance', emoji: '🎨', title: '外觀與貨幣', sub: themeLabel(state.settings.theme) + ' · ' + state.settings.currency, value: '' }) +
        settingsRow({ panel: 'about', emoji: '🌱', title: '關於日日記', sub: '版本 1.0.0 · 離線可用' }) +
      '</div></div>' +
      '<div class="settings-foot">所有帳目只儲存在你的瀏覽器<br><b>沒有帳號、沒有上傳、沒有廣告</b><br>記得偶爾備份，換機就不怕遺失</div>';
  }

  /* --------------------------------------------------------------- entry */

  function defaultEntryDate() {
    if (isCurrentMonth(ui.month)) return todayISO();
    const dim = S.daysInMonth(ui.month);
    return ui.month + '-' + pad(dim);
  }

  function openEntry(opts) {
    const o = opts || {};
    const editing = o.id ? state.transactions.find(function (t) { return t.id === o.id; }) : null;
    const type = editing ? editing.type : (o.type || 'expense');
    let categoryId = editing ? editing.categoryId : (o.categoryId || (ui.lastCategory[type] || ''));
    const cat = categoryId ? S.categoryById(state, categoryId) : null;
    if (!cat || cat.type !== type) {
      const fallback = state.categories.find(function (c) { return c.type === type; });
      categoryId = fallback ? fallback.id : '';
    }
    let accountId = editing ? editing.accountId : (ui.lastAccountId || state.accounts[0].id);
    if (!S.accountById(state, accountId)) accountId = state.accounts[0].id;
    draft = {
      id: editing ? editing.id : null,
      type: type,
      amount: editing ? centsToPlain(editing.amount) : '',
      categoryId: categoryId,
      accountId: accountId,
      date: editing ? editing.date : defaultEntryDate(),
      note: editing ? editing.note : '',
      saving: false
    };
    renderEntrySheet();
  }

  function entryCatsHTML() {
    return state.categories.filter(function (c) { return c.type === draft.type; }).map(function (c) {
      return '<button class="cat-item ' + (draft.categoryId === c.id ? 'is-selected' : '') + '" data-action="entry-cat" data-id="' + esc(c.id) + '">' +
        '<span class="cat-emoji" style="background:' + hexA(c.color, 0.14) + '">' + esc(c.emoji) + '</span>' +
        '<span class="cat-name">' + esc(c.name) + '</span></button>';
    }).join('');
  }

  function entryToolsHTML() {
    if (draft.id) return '';
    const last = S.lastAmountForCategory(state, draft.categoryId, ui.ledgerId);
    if (!last) return '';
    return '<button class="last-chip" data-action="use-last">套用上次 <b>' + fmtMoney(last) + '</b></button>';
  }

  function renderEntrySheet() {
    const accounts = state.accounts.map(function (a) {
      return '<option value="' + esc(a.id) + '" ' + (a.id === draft.accountId ? 'selected' : '') + '>' + esc(a.name) + '</option>';
    }).join('');
    const keypadKeys = ['1', '2', '3', 'back', '4', '5', '6', 'save', '7', '8', '9', '.', '0', '00'];
    const keypad = keypadKeys.map(function (k) {
      if (k === 'save') {
        return '<button class="key save" data-action="entry-save"><span>儲存</span></button>';
      }
      if (k === 'back') {
        return '<button class="key fn" data-action="key" data-key="back" aria-label="刪除">' + icon('backspace') + '</button>';
      }
      return '<button class="key" data-action="key" data-key="' + k + '">' + k + '</button>';
    }).join('');

    openSheet(
      '<div class="sheet-grab"></div>' +
      '<div class="sheet-head">' +
        '<button class="icon-btn" data-action="entry-close" aria-label="關閉">' + icon('close') + '</button>' +
        '<div class="seg" role="tablist">' +
          '<button class="seg-btn ' + (draft.type === 'expense' ? 'is-active' : '') + '" data-action="entry-type" data-type="expense">支出</button>' +
          '<button class="seg-btn ' + (draft.type === 'income' ? 'is-active' : '') + '" data-action="entry-type" data-type="income">收入</button>' +
        '</div>' +
        '<button class="icon-btn" data-action="entry-delete" aria-label="刪除" style="' + (draft.id ? '' : 'visibility:hidden') + '">' + icon('trash') + '</button>' +
      '</div>' +
      '<div class="entry-scroll">' +
        '<div class="amount-wrap"><span class="amount-cur">' + esc(state.settings.currency) + '</span>' +
          '<span class="amount-text is-zero" id="amountText">0</span><span class="amount-caret"></span></div>' +
        '<div class="entry-tools" id="entryTools">' + entryToolsHTML() + '</div>' +
        '<div class="cat-grid" id="catGrid">' + entryCatsHTML() + '</div>' +
        '<div class="meta-row">' +
          '<label class="chip date-chip">' + icon('calendar') + '<span id="dateLabel">' + entryDateLabel(draft.date) + '</span>' +
            '<input type="date" id="entryDate" value="' + esc(draft.date) + '"></label>' +
          '<label class="chip select-chip">' + icon('wallet') + '<select id="entryAccount">' + accounts + '</select></label>' +
        '</div>' +
        '<input class="note-input" id="entryNote" maxlength="60" placeholder="加備註（例：茶餐廳午餐）" value="' + esc(draft.note) + '">' +
      '</div>' +
      '<div class="keypad">' + keypad + '</div>',
      { className: 'entry-sheet' }
    );
    updateAmountUI();
  }

  function updateAmountUI() {
    const el = $('#amountText');
    if (!el) return;
    el.innerHTML = amountDisplayHTML(draft.amount);
    el.classList.toggle('is-zero', !draft.amount || draft.amount === '0');
    const save = $('.key.save');
    if (save) save.classList.toggle('is-ready', Number(draft.amount) > 0);
  }

  function refreshEntryCats() {
    const grid = $('#catGrid');
    if (grid) grid.innerHTML = entryCatsHTML();
    const tools = $('#entryTools');
    if (tools) tools.innerHTML = entryToolsHTML();
    $$('.seg-btn', $('.entry-sheet')).forEach(function (b) {
      b.classList.toggle('is-active', b.dataset.type === draft.type);
    });
  }

  function keyInput(key) {
    if (!draft) return;
    haptic(5);
    if (key === 'back') {
      draft.amount = draft.amount.slice(0, -1);
    } else if (key === 'clear') {
      draft.amount = '';
    } else if (key === '.') {
      if (!draft.amount) draft.amount = '0.';
      else if (draft.amount.indexOf('.') < 0) draft.amount += '.';
    } else if (key === '00') {
      if (!draft.amount || draft.amount === '0') draft.amount = '0';
      else if (draft.amount.indexOf('.') < 0 && draft.amount.replace(/,/g, '').length < 8) draft.amount += '00';
    } else if (/^[0-9]$/.test(key)) {
      if (draft.amount.indexOf('.') >= 0) {
        if (draft.amount.split('.')[1].length >= 2) return;
      } else if (draft.amount.replace(/,/g, '').length >= 9) {
        return;
      }
      draft.amount = draft.amount === '0' ? key : draft.amount + key;
    }
    updateAmountUI();
  }

  function saveEntry() {
    if (!draft || draft.saving) return;
    const cents = plainToCents(draft.amount);
    if (!(cents > 0)) { toast('請先輸入金額', 'err'); haptic(30); return; }
    if (!draft.categoryId) { toast('請選擇一個分類', 'err'); return; }
    const payload = {
      type: draft.type,
      amount: cents,
      categoryId: draft.categoryId,
      accountId: draft.accountId,
      ledgerId: ui.ledgerId,
      date: draft.date,
      note: draft.note
    };
    try {
      draft.saving = true;
      if (draft.id) S.updateTransaction(state, draft.id, payload);
      else S.addTransaction(state, payload);
      state.settings.lastCategory = state.settings.lastCategory || {};
      state.settings.lastCategory[draft.type] = draft.categoryId;
      state.settings.lastAccountId = draft.accountId;
      ui.lastCategory = state.settings.lastCategory;
      ui.lastAccountId = draft.accountId;
      const persisted = S.save(state);
      const edited = !!draft.id;
      closeSheet();
      renderAll();
      if (persisted) toast((edited ? '已更新 ' : '已記下 ') + fmtMoney(cents), 'ok');
      else toast('已加入，但無法寫入本機儲存；請先備份資料', 'err');
      haptic(15);
    } catch (err) {
      draft.saving = false;
      toast(err.message || '儲存失敗', 'err');
    }
  }

  /* -------------------------------------------------------------- panels */

  function panelHead(title, action) {
    return '<div class="sheet-grab"></div><div class="panel-head">' +
      '<button class="icon-btn" data-action="sheet-close" aria-label="返回">' + icon('arrow-left') + '</button>' +
      '<h2>' + esc(title) + '</h2>' + (action || '') + '</div>';
  }

  function panelHTML(kind, opts) {
    const o = opts || {};
    if (kind === 'ledgerPicker') {
      const rows = state.ledgers.map(function (l) {
        const count = state.transactions.filter(function (t) { return t.ledgerId === l.id; }).length;
        return '<button class="panel-row" data-action="set-ledger" data-id="' + esc(l.id) + '">' +
          '<span class="panel-ic" style="background:' + hexA(l.color, 0.13) + '">' + esc(l.emoji) + '</span>' +
          '<span class="panel-row-main"><b>' + esc(l.name) + (l.id === ui.ledgerId ? ' <span style="font-size:9px;color:var(--primary)">目前</span>' : '') + '</b><span>' + count + ' 筆紀錄</span></span>' +
          '<span class="check-dot ' + (l.id === ui.ledgerId ? 'on' : '') + '">' + icon('check') + '</span></button>';
      }).join('');
      return panelHead('切換帳本') +
        '<div class="panel-body"><div class="panel-list">' + rows + '</div>' +
        '<button class="btn btn-ghost btn-block" style="margin-top:12px" data-action="open-panel" data-panel="ledgers">' + icon('settings') + '管理帳本</button>' +
        '<div class="notice"><span>🌿</span><div>用不同帳本分開記錄日常、旅行或公司開支，互不影響。</div></div></div>';
    }

    if (kind === 'ledgers') {
      const rows = state.ledgers.map(function (l) {
        const count = state.transactions.filter(function (t) { return t.ledgerId === l.id; }).length;
        return '<div class="panel-row">' +
          '<span class="panel-ic" style="background:' + hexA(l.color, 0.13) + '">' + esc(l.emoji) + '</span>' +
          '<button class="panel-row-main" data-action="set-ledger" data-id="' + esc(l.id) + '" style="text-align:left"><b>' + esc(l.name) + '</b><span>' + count + ' 筆紀錄' + (l.id === ui.ledgerId ? ' · 目前使用' : '') + '</span></button>' +
          (count === 0 && state.ledgers.length > 1 ? '<button class="row-del" data-action="delete-ledger" data-id="' + esc(l.id) + '" aria-label="刪除帳本">' + icon('trash') + '</button>' : '') +
          '</div>';
      }).join('');
      return panelHead('帳本', '<button class="head-action" data-action="open-panel" data-panel="ledgerForm">新增</button>') +
        '<div class="panel-body"><div class="panel-list">' + rows + '</div>' +
        '<div class="notice"><span>📒</span><div><b>多帳本</b><br>日常、旅行、公司分開記，報表也會自動分開計算。</div></div></div>';
    }

    if (kind === 'ledgerForm') {
      const colors = S.PALETTE.slice(0, 6);
      return panelHead('新增帳本') +
        '<div class="panel-body"><form data-form="ledger">' +
        '<div class="field"><label>帳本名稱</label><input class="input" name="name" maxlength="20" placeholder="例：旅行帳本" required data-autofocus></div>' +
        '<div class="field"><label>圖示</label><div class="emoji-grid">' + EMOJIS.map(function (e, i) {
          return '<label class="emoji-opt"><input type="radio" name="emoji" value="' + e + '" ' + (i === 0 ? 'checked' : '') + '><span>' + e + '</span></label>';
        }).join('') + '</div></div>' +
        '<div class="field"><label>顏色</label><div class="swatches">' + colors.map(function (c, i) {
          return '<label class="swatch" style="background:' + c + '"><input type="radio" name="color" value="' + c + '" ' + (i === 0 ? 'checked' : '') + '></label>';
        }).join('') + '</div></div>' +
        '<button class="btn btn-primary btn-block" type="submit">建立帳本</button>' +
        '</form></div>';
    }

    if (kind === 'accounts') {
      const rows = S.accountBalances(state, ui.ledgerId).map(function (r) {
        const count = state.transactions.filter(function (t) { return t.accountId === r.account.id; }).length;
        return '<div class="panel-row">' +
          '<span class="panel-ic">' + (ACCOUNT_ICONS[r.account.type] || '📁') + '</span>' +
          '<div class="panel-row-main"><b>' + esc(r.account.name) + '</b><span>' + (S.ACCOUNT_TYPES[r.account.type] || '其他') + '</span></div>' +
          '<div class="panel-row-value ' + (r.balance < 0 ? 'negative' : '') + '">' + fmtMoney(r.balance) + '</div>' +
          (count === 0 && state.accounts.length > 1 ? '<button class="row-del" data-action="delete-account" data-id="' + esc(r.account.id) + '" aria-label="刪除帳戶">' + icon('trash') + '</button>' : '') +
          '</div>';
      }).join('');
      return panelHead('帳戶', '<button class="head-action" data-action="open-panel" data-panel="accountForm">新增</button>') +
        '<div class="panel-body"><div class="panel-title">' + esc(S.ledgerById(state, ui.ledgerId).name) + '的帳戶</div>' +
        '<div class="panel-list">' + rows + '</div>' +
        '<div class="notice"><span>💡</span><div>餘額由「初始金額＋收入−支出」自動計算；信用卡的負數代表待繳金額。</div></div></div>';
    }

    if (kind === 'accountForm') {
      return panelHead('新增帳戶') +
        '<div class="panel-body"><form data-form="account">' +
        '<div class="field"><label>帳戶名稱</label><input class="input" name="name" maxlength="20" placeholder="例：恒生銀行" required data-autofocus></div>' +
        '<div class="field"><label>類型</label><div class="select-wrap"><select class="select" name="type"><option value="cash">現金</option><option value="bank">銀行</option><option value="credit">信用卡</option><option value="wallet">電子錢包</option><option value="other">其他</option></select></div></div>' +
        '<div class="field"><label>初始餘額（' + esc(state.settings.currency) + '）</label><input class="input" name="initial" type="number" step="0.01" inputmode="decimal" placeholder="0.00" value="0"></div>' +
        '<button class="btn btn-primary btn-block" type="submit">建立帳戶</button>' +
        '</form><div class="notice"><span>🔒</span><div>初始餘額只影響顯示的帳戶餘額，不會計入本月收支。</div></div></div>';
    }

    if (kind === 'categories') {
      const type = ui.catTab || 'expense';
      const rows = state.categories.filter(function (c) { return c.type === type; }).map(function (c) {
        const count = state.transactions.filter(function (t) { return t.categoryId === c.id; }).length;
        return '<div class="panel-row">' +
          '<span class="panel-ic" style="background:' + hexA(c.color, 0.13) + '">' + esc(c.emoji) + '</span>' +
          '<div class="panel-row-main"><b>' + esc(c.name) + '</b><span>' + count + ' 筆紀錄</span></div>' +
          (count === 0 ? '<button class="row-del" data-action="delete-category" data-id="' + esc(c.id) + '" aria-label="刪除分類">' + icon('trash') + '</button>' : '') +
          '</div>';
      }).join('');
      return panelHead('分類', '<button class="head-action" data-action="open-panel" data-panel="categoryForm" data-type="' + type + '">新增</button>') +
        '<div class="panel-body">' +
        '<div class="seg-block" style="padding-top:0"><div class="seg">' +
        '<button class="seg-btn ' + (type === 'expense' ? 'is-active' : '') + '" data-action="cat-tab" data-type="expense">支出</button>' +
        '<button class="seg-btn ' + (type === 'income' ? 'is-active' : '') + '" data-action="cat-tab" data-type="income">收入</button>' +
        '</div></div><div class="panel-list">' + rows + '</div>' +
        '<div class="notice"><span>🏷️</span><div>常用分類可自行新增；已有紀錄的分類不能刪除，避免舊帳目失去分類。</div></div></div>';
    }

    if (kind === 'categoryForm') {
      const type = o.type === 'income' ? 'income' : 'expense';
      return panelHead('新增' + (type === 'income' ? '收入' : '支出') + '分類') +
        '<div class="panel-body"><form data-form="category">' +
        '<input type="hidden" name="type" value="' + type + '">' +
        '<div class="field"><label>分類名稱</label><input class="input" name="name" maxlength="12" placeholder="例：咖啡" required data-autofocus></div>' +
        '<div class="field"><label>圖示</label><div class="emoji-grid">' + EMOJIS.map(function (e, i) {
          return '<label class="emoji-opt"><input type="radio" name="emoji" value="' + e + '" ' + (i === 0 ? 'checked' : '') + '><span>' + e + '</span></label>';
        }).join('') + '</div></div>' +
        '<button class="btn btn-primary btn-block" type="submit">建立分類</button>' +
        '</form></div>';
    }

    if (kind === 'budgets') {
      const totalRow = state.budgets.find(function (b) { return b.ledgerId === ui.ledgerId && !b.categoryId; });
      const cats = state.categories.filter(function (c) { return c.type === 'expense'; });
      const catRows = cats.map(function (c) {
        const b = state.budgets.find(function (x) { return x.ledgerId === ui.ledgerId && x.categoryId === c.id; });
        return '<div class="budget-form-row"><div class="bf-main">' +
          '<span class="bf-emoji" style="background:' + hexA(c.color, 0.13) + '">' + esc(c.emoji) + '</span><span>' + esc(c.name) + '</span></div>' +
          '<input type="number" min="0" step="1" inputmode="decimal" name="cat:' + esc(c.id) + '" placeholder="0" value="' + (b ? centsToPlain(b.amount) : '') + '"></div>';
      }).join('');
      return panelHead('每月預算') +
        '<div class="panel-body"><form data-form="budget">' +
        '<div class="field"><label>每月支出總預算（' + esc(state.settings.currency) + '）</label>' +
        '<input class="input" name="total" type="number" min="0" step="1" inputmode="decimal" placeholder="例：18000" value="' + (totalRow ? centsToPlain(totalRow.amount) : '') + '"></div>' +
        '<div class="panel-title">分類上限（可留空）</div>' +
        '<div class="panel-list" style="padding:2px 13px">' + catRows + '</div>' +
        '<button class="btn btn-primary btn-block" type="submit" style="margin-top:16px">儲存預算</button>' +
        '</form><div class="notice"><span>🎯</span><div>預算每個月自動套用，適用於目前的「' + esc(S.ledgerById(state, ui.ledgerId).name) + '」。0 或留空代表不設定。</div></div></div>';
    }

    if (kind === 'data') {
      return panelHead('備份與匯出') +
        '<div class="panel-body">' +
        '<button class="data-btn" data-action="export-csv"><span class="settings-ic" style="background:var(--surface)">' + icon('download') + '</span><span><b>匯出 CSV</b><span>可用 Excel／Numbers 開啟，適合報稅或分析</span></span>' + icon('chev-right', 'chev') + '</button>' +
        '<button class="data-btn" data-action="backup-json"><span class="settings-ic" style="background:var(--surface)">' + icon('upload') + '</span><span><b>備份完整資料</b><span>下載 JSON 檔，包含所有帳目與設定</span></span>' + icon('chev-right', 'chev') + '</button>' +
        '<button class="data-btn" data-action="restore-json"><span class="settings-ic" style="background:var(--surface)">' + icon('database') + '</span><span><b>還原備份</b><span>從 JSON 備份檔回復，會覆蓋目前資料</span></span>' + icon('chev-right', 'chev') + '</button>' +
        '<input type="file" id="restoreFile" accept="application/json,.json" class="hide">' +
        '<div class="divider"></div>' +
        '<button class="data-btn" data-action="load-demo"><span class="settings-ic" style="background:var(--surface)">' + icon('sparkles') + '</span><span><b>載入示範資料</b><span>用一組範例帳目重新體驗所有功能</span></span>' + icon('chev-right', 'chev') + '</button>' +
        '<button class="data-btn" data-action="clear-data"><span class="settings-ic" style="background:var(--danger-soft)">' + icon('trash') + '</span><span><b style="color:var(--danger)">清除所有資料</b><span>刪除全部帳目、帳本與設定，無法復原</span></span>' + icon('chev-right', 'chev') + '</button>' +
        '<div class="notice"><span>🛡️</span><div><b>你的資料只在這部裝置</b><br>日日記沒有伺服器，不會上傳任何帳目。清除瀏覽器資料或換機前，請先備份 JSON。</div></div>' +
        '</div>';
    }

    if (kind === 'appearance') {
      return panelHead('外觀與貨幣') +
        '<div class="panel-body">' +
        '<div class="panel-title">主題</div>' +
        '<div class="theme-options">' + THEMES.map(function (t) {
          return '<button class="theme-opt ' + (state.settings.theme === t.id ? 'on' : '') + '" data-action="theme-set" data-theme="' + t.id + '">' +
            '<span class="theme-swatch" style="background:' + t.swatch + '"></span>' + t.label + '</button>';
        }).join('') + '</div>' +
        '<div class="panel-title">貨幣</div>' +
        '<div class="select-wrap"><select class="select" id="currencySelect">' + CURRENCIES.map(function (c) {
          return '<option value="' + esc(c) + '" ' + (state.settings.currency === c ? 'selected' : '') + '>' + esc(c) + '</option>';
        }).join('') + '</select></div>' +
        '<div class="panel-title">隱私</div>' +
        '<button class="data-btn" data-action="toggle-hide"><span class="settings-ic" style="background:var(--surface)">' + icon('eye') + '</span><span><b>隱藏所有金額</b><span>截圖或借人看時自動顯示 ••••</span></span><span class="check-dot ' + (state.settings.hideAmounts ? 'on' : '') + '">' + icon('check') + '</span></button>' +
        '<div class="notice"><span>🎨</span><div>主題只影響這個裝置；金額符號會套用到所有顯示位置。</div></div></div>';
    }

    if (kind === 'about') {
      return panelHead('關於日日記') +
        '<div class="panel-body"><div class="about-hero">' +
        '<div class="profile-logo" style="margin:0 auto 12px;width:58px;height:58px;border-radius:18px;font-size:27px">記</div>' +
        '<h3>日日記</h3><p>簡單、實用的本地記帳本</p></div>' +
        '<div class="notice"><span>🌱</span><div><b>為甚麼做這個 App</b><br>記帳最難的是「開始」與「持續」。所以我們把一筆帳壓到三個動作：輸入金額、點分類、儲存。沒有廣告、沒有註冊、沒有雲端。</div></div>' +
        '<div class="notice"><span>📱</span><div><b>安裝到手機主畫面</b><br>iPhone：用 Safari 開啟，按分享 → 加入主畫面。<br>Android：用 Chrome 開啟，選單 → 安裝應用程式。之後可離線使用。</div></div>' +
        '<div class="notice"><span>🛡️</span><div><b>私隱</b><br>所有資料儲存在你的裝置瀏覽器內。日日記不收集、不上傳、不販售任何記帳資料。刪除 App 或清除瀏覽器資料前，請先匯出備份。</div></div>' +
        (deferredPrompt ? '<button class="btn btn-primary btn-block" data-action="install-app" style="margin-top:14px">' + icon('download') + '安裝到主畫面</button>' : '') +
        '<p class="about-version">版本 1.0.0 · 以原生 HTML/CSS/JS 製作 · 無外部依賴</p>' +
        '</div>';
    }

    return '';
  }

  function openPanel(kind, opts) {
    const html = panelHTML(kind, opts);
    if (!html) return;
    openSheet(html, { className: 'is-panel' });
  }

  function refreshPanel(kind, opts) {
    const sheet = $('#sheetRoot .sheet');
    if (!sheet) { openPanel(kind, opts); return; }
    sheet.innerHTML = panelHTML(kind, opts);
    sheet.scrollTop = 0;
  }

  /* --------------------------------------------------------------- forms */

  function handleSubmit(e) {
    const form = e.target;
    const kind = form.dataset.form;
    if (!kind) return;
    e.preventDefault();
    const fd = new FormData(form);
    try {
      if (kind === 'ledger') {
        const ledger = S.addLedger(state, {
          name: fd.get('name'),
          emoji: fd.get('emoji'),
          color: fd.get('color')
        });
        state.settings.activeLedgerId = ledger.id;
        ui.ledgerId = ledger.id;
        S.save(state);
        renderAll();
        toast('已建立「' + ledger.name + '」');
        openPanel('ledgers');
        return;
      }
      if (kind === 'account') {
        S.addAccount(state, {
          name: fd.get('name'),
          type: fd.get('type'),
          initial: plainToCents(fd.get('initial') || 0)
        });
        S.save(state);
        renderAll();
        toast('已新增帳戶');
        openPanel('accounts');
        return;
      }
      if (kind === 'category') {
        const type = fd.get('type') === 'income' ? 'income' : 'expense';
        S.addCategory(state, { name: fd.get('name'), emoji: fd.get('emoji'), type: type });
        ui.catTab = type;
        S.save(state);
        renderAll();
        toast('已新增分類');
        openPanel('categories');
        return;
      }
      if (kind === 'budget') {
        S.setBudget(state, ui.ledgerId, null, plainToCents(fd.get('total') || 0));
        state.categories.filter(function (c) { return c.type === 'expense'; }).forEach(function (c) {
          S.setBudget(state, ui.ledgerId, c.id, plainToCents(fd.get('cat:' + c.id) || 0));
        });
        S.save(state);
        renderAll();
        toast('預算已更新');
        openPanel('budgets');
      }
    } catch (err) {
      toast(err.message || '儲存失敗', 'err');
    }
  }

  function handleChange(e) {
    const el = e.target;
    if (el.id === 'entryDate' && draft) {
      draft.date = el.value || todayISO();
      const label = $('#dateLabel');
      if (label) label.textContent = entryDateLabel(draft.date);
    } else if (el.id === 'entryAccount' && draft) {
      draft.accountId = el.value;
    } else if (el.id === 'currencySelect') {
      state.settings.currency = el.value;
      S.save(state);
      renderAll();
      toast('貨幣已改為 ' + el.value);
    } else if (el.id === 'restoreFile') {
      const file = el.files && el.files[0];
      el.value = '';
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function () {
        try {
          const next = S.importJSON(String(reader.result));
          state = next;
          ui.ledgerId = state.settings.activeLedgerId;
          ui.lastCategory = state.settings.lastCategory || {};
          ui.lastAccountId = state.settings.lastAccountId || state.accounts[0].id;
          S.save(state);
          closeSheet(true);
          renderAll();
          toast('備份已還原');
        } catch (err) {
          toast(err.message || '還原失敗', 'err');
        }
      };
      reader.readAsText(file);
    }
  }

  function handleInput(e) {
    const el = e.target;
    if (el.id === 'searchInput') {
      ui.query = el.value;
      const wrap = el.parentElement;
      const oldClear = wrap.querySelector('.search-clear');
      if (ui.query && !oldClear) {
        const btn = document.createElement('button');
        btn.className = 'search-clear';
        btn.dataset.action = 'search-clear';
        btn.setAttribute('aria-label', '清除搜尋');
        btn.innerHTML = icon('close');
        wrap.appendChild(btn);
      } else if (!ui.query && oldClear) {
        oldClear.remove();
      }
      renderRecordsBody();
    } else if (el.id === 'entryNote' && draft) {
      draft.note = el.value;
    }
  }

  function handleKey(e) {
    if (e.key === 'Escape') {
      if ($('#sheetRoot .sheet-backdrop')) { closeSheet(); }
      else if (ui.view !== 'home') setView('home');
      return;
    }
    if (!draft || !$('#sheetRoot .entry-sheet')) return;
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'select' || tag === 'textarea') return;
    if (/^[0-9]$/.test(e.key)) { e.preventDefault(); keyInput(e.key); }
    else if (e.key === '.') { e.preventDefault(); keyInput('.'); }
    else if (e.key === 'Backspace') { e.preventDefault(); keyInput('back'); }
    else if (e.key === 'Enter') { e.preventDefault(); saveEntry(); }
  }

  /* --------------------------------------------------------------- actions */

  function askDeleteLedger(id) {
    const ledger = S.ledgerById(state, id);
    if (!ledger) return;
    confirmSheet({
      title: '刪除帳本？',
      message: '「' + ledger.name + '」沒有任何紀錄，刪除後無法復原。',
      backTo: 'ledgers',
      onConfirm: function () {
        try {
          S.deleteLedger(state, id);
          if (ui.ledgerId === id) ui.ledgerId = state.settings.activeLedgerId;
          S.save(state);
          renderAll();
          toast('已刪除帳本');
        } catch (err) { toast(err.message, 'err'); }
        openPanel('ledgers');
      }
    });
  }

  function askDeleteAccount(id) {
    const account = S.accountById(state, id);
    if (!account) return;
    confirmSheet({
      title: '刪除帳戶？',
      message: '「' + account.name + '」沒有任何紀錄，刪除後無法復原。',
      backTo: 'accounts',
      onConfirm: function () {
        try {
          S.deleteAccount(state, id);
          S.save(state);
          renderAll();
          toast('已刪除帳戶');
        } catch (err) { toast(err.message, 'err'); }
        openPanel('accounts');
      }
    });
  }

  function askDeleteCategory(id) {
    const cat = S.categoryById(state, id);
    if (!cat) return;
    confirmSheet({
      title: '刪除分類？',
      message: '「' + cat.name + '」沒有紀錄，刪除後無法復原。',
      backTo: 'categories',
      onConfirm: function () {
        try {
          S.deleteCategory(state, id);
          S.save(state);
          renderAll();
          toast('已刪除分類');
        } catch (err) { toast(err.message, 'err'); }
        openPanel('categories');
      }
    });
  }

  function onClick(e) {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const action = el.dataset.action;

    switch (action) {
      case 'nav':
        setView(el.dataset.view);
        break;

      case 'month-prev':
        ui.month = S.addMonths(ui.month, -1);
        renderAll();
        break;
      case 'month-next':
        ui.month = S.addMonths(ui.month, 1);
        renderAll();
        break;
      case 'month-today':
        ui.month = currentYM();
        renderAll();
        break;

      case 'ledger-open':
        openPanel('ledgerPicker');
        break;
      case 'set-ledger': {
        const ledger = S.ledgerById(state, el.dataset.id);
        if (!ledger) return;
        ui.ledgerId = ledger.id;
        state.settings.activeLedgerId = ledger.id;
        S.save(state);
        closeSheet(true);
        renderAll();
        toast('已切換至「' + ledger.name + '」');
        break;
      }
      case 'toggle-hide':
        state.settings.hideAmounts = !state.settings.hideAmounts;
        S.save(state);
        renderAll();
        if ($('#sheetRoot .sheet-backdrop')) refreshPanel('appearance');
        toast(state.settings.hideAmounts ? '已隱藏金額' : '已顯示金額');
        break;

      case 'search-focus':
        setView('records');
        window.setTimeout(function () {
          const input = $('#searchInput');
          if (input) {
            input.focus();
            const len = input.value.length;
            input.setSelectionRange(len, len);
          }
        }, 80);
        break;
      case 'search-clear':
        ui.query = '';
        renderRecords();
        window.setTimeout(function () { const i = $('#searchInput'); if (i) i.focus(); }, 40);
        break;
      case 'filter':
        ui.filter = el.dataset.filter;
        $$('.filter-chip').forEach(function (c) { c.classList.toggle('is-active', c.dataset.filter === ui.filter); });
        renderRecordsBody();
        break;

      case 'add-open':
        openEntry({ categoryId: el.dataset.cat || null });
        break;
      case 'entry-close':
        closeSheet();
        break;
      case 'entry-type': {
        if (!draft || draft.type === el.dataset.type) return;
        draft.type = el.dataset.type;
        const cat = S.categoryById(state, draft.categoryId);
        if (!cat || cat.type !== draft.type) {
          const last = ui.lastCategory[draft.type];
          const lastCat = last ? S.categoryById(state, last) : null;
          draft.categoryId = lastCat && lastCat.type === draft.type ? lastCat.id : state.categories.find(function (c) { return c.type === draft.type; }).id;
        }
        refreshEntryCats();
        updateAmountUI();
        break;
      }
      case 'entry-cat':
        draft.categoryId = el.dataset.id;
        $$('.cat-item', $('#catGrid')).forEach(function (b) {
          b.classList.toggle('is-selected', b.dataset.id === draft.categoryId);
        });
        const tools = $('#entryTools');
        if (tools) tools.innerHTML = entryToolsHTML();
        haptic(6);
        break;
      case 'key':
        keyInput(el.dataset.key);
        break;
      case 'use-last': {
        const last = S.lastAmountForCategory(state, draft.categoryId, ui.ledgerId);
        if (last) { draft.amount = centsToPlain(last); updateAmountUI(); haptic(8); }
        break;
      }
      case 'entry-save':
        saveEntry();
        break;
      case 'entry-delete': {
        if (!draft || !draft.id) return;
        const tx = state.transactions.find(function (t) { return t.id === draft.id; });
        if (!tx) return;
        confirmSheet({
          title: '刪除這筆紀錄？',
          message: '這筆 ' + fmtMoney(tx.amount) + ' 的紀錄會永久刪除。',
          confirmText: '刪除',
          onConfirm: function () {
            S.deleteTransaction(state, tx.id);
            S.save(state);
            renderAll();
            toast('已刪除紀錄');
          }
        });
        break;
      }

      case 'edit-tx': {
        const id = el.dataset.id;
        if (id) openEntry({ id: id });
        break;
      }

      case 'report-type':
        ui.reportType = el.dataset.type;
        renderReports();
        break;

      case 'open-panel':
        openPanel(el.dataset.panel, { type: el.dataset.type });
        break;
      case 'sheet-close':
        closeSheet();
        break;
      case 'cat-tab':
        ui.catTab = el.dataset.type;
        refreshPanel('categories');
        break;

      case 'delete-ledger':
        askDeleteLedger(el.dataset.id);
        break;
      case 'delete-account':
        askDeleteAccount(el.dataset.id);
        break;
      case 'delete-category':
        askDeleteCategory(el.dataset.id);
        break;

      case 'theme-set':
        state.settings.theme = el.dataset.theme;
        S.save(state);
        applyTheme();
        renderAll();
        refreshPanel('appearance');
        break;

      case 'export-csv': {
        const csv = S.exportCSV(state, ui.ledgerId);
        const name = S.ledgerById(state, ui.ledgerId).name;
        download('日日記-' + name + '-' + todayISO() + '.csv', csv, 'text/csv;charset=utf-8');
        toast('CSV 已匯出');
        break;
      }
      case 'backup-json': {
        download('日日記-備份-' + todayISO() + '.json', S.exportJSON(state), 'application/json');
        toast('備份已下載');
        break;
      }
      case 'restore-json': {
        const input = $('#restoreFile');
        if (input) input.click();
        break;
      }
      case 'load-demo':
        confirmSheet({
          title: '載入示範資料？',
          message: '目前的資料會被示範資料覆蓋。建議先備份。',
          confirmText: '載入',
          danger: false,
          backTo: 'data',
          onConfirm: function () {
            const theme = state.settings.theme;
            state = S.seedState(new Date());
            state.settings.theme = theme;
            ui.ledgerId = state.settings.activeLedgerId;
            S.save(state);
            closeSheet(true);
            renderAll();
            toast('已載入示範資料');
          }
        });
        break;
      case 'clear-data':
        confirmSheet({
          title: '清除所有資料？',
          message: '所有帳目、帳本、預算都會刪除，無法復原。確定要重新開始嗎？',
          confirmText: '全部清除',
          backTo: 'data',
          onConfirm: function () {
            const theme = state.settings.theme;
            state = S.emptyState(new Date());
            state.settings.theme = theme;
            ui.ledgerId = state.settings.activeLedgerId;
            ui.month = currentYM();
            ui.query = '';
            S.save(state);
            closeSheet(true);
            renderAll();
            toast('已清除所有資料');
          }
        });
        break;
      case 'install-app':
        if (deferredPrompt) {
          deferredPrompt.prompt();
          deferredPrompt = null;
        } else {
          toast('請用瀏覽器選單「加入主畫面」');
        }
        break;

      case 'confirm-cancel': {
        const backTo = confirmState ? confirmState.backTo : null;
        confirmState = null;
        closeSheet(true);
        if (backTo) openPanel(backTo);
        break;
      }
      case 'confirm-ok': {
        const fn = confirmState ? confirmState.onConfirm : null;
        confirmState = null;
        closeSheet(true);
        if (fn) {
          try { fn(); } catch (err) { toast(err.message || '操作失敗', 'err'); }
        }
        break;
      }

      default:
        break;
    }
  }

  /* ----------------------------------------------------------------- init */

  function bindEvents() {
    document.addEventListener('click', onClick);
    document.addEventListener('change', handleChange);
    document.addEventListener('input', handleInput);
    document.addEventListener('keydown', handleKey);
    document.addEventListener('submit', handleSubmit);

    if (window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const onChange = function () { if (state.settings.theme === 'system') applyTheme(); };
      if (mq.addEventListener) mq.addEventListener('change', onChange);
      else if (mq.addListener) mq.addListener(onChange);
    }

    window.addEventListener('beforeinstallprompt', function (e) {
      e.preventDefault();
      deferredPrompt = e;
    });

    window.addEventListener('appinstalled', function () {
      deferredPrompt = null;
      toast('已加入主畫面');
    });
  }

  function registerSW() {
    if (!('serviceWorker' in navigator)) return;
    if (location.protocol !== 'http:' && location.protocol !== 'https:') return;
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('./sw.js').catch(function () { /* offline only */ });
    });
  }

  function init() {
    state = S.load();
    ui = {
      view: 'home',
      month: currentYM(),
      ledgerId: state.settings.activeLedgerId,
      reportType: 'expense',
      query: '',
      filter: 'all',
      catTab: 'expense',
      lastCategory: state.settings.lastCategory || {},
      lastAccountId: state.settings.lastAccountId || state.accounts[0].id
    };
    if (!S.ledgerById(state, ui.ledgerId)) ui.ledgerId = state.ledgers[0].id;
    applyTheme();
    bindEvents();
    renderAll();
    setView('home');
    registerSW();
  }

  init();
})();
