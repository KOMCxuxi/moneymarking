/* 日日記 — local-first data layer. No dependencies, works in browser and Node. */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.LedgerStore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  'use strict';

  const VERSION = 1;
  const STORAGE_KEY = 'ririji.state.v1';
  const PALETTE = ['#E06A45', '#C9A227', '#4A7C9B', '#8A6F4E', '#D9A441', '#9B6B9E',
    '#C2554F', '#3E7C6A', '#B56576', '#D17B88', '#A98467', '#5B8AA6', '#8C9289'];

  const ACCOUNT_TYPES = {
    cash: '現金', bank: '銀行', credit: '信用卡', wallet: '電子錢包', other: '其他'
  };

  const DEFAULT_CATEGORIES = [
    { id: 'cat_food', name: '餐飲', emoji: '🍜', color: '#E06A45', type: 'expense' },
    { id: 'cat_transport', name: '交通', emoji: '🚇', color: '#4A7C9B', type: 'expense' },
    { id: 'cat_shop', name: '購物', emoji: '🛍️', color: '#C9A227', type: 'expense' },
    { id: 'cat_home', name: '居住', emoji: '🏠', color: '#8A6F4E', type: 'expense' },
    { id: 'cat_utility', name: '水電煤', emoji: '💡', color: '#D9A441', type: 'expense' },
    { id: 'cat_fun', name: '娛樂', emoji: '🎬', color: '#9B6B9E', type: 'expense' },
    { id: 'cat_health', name: '醫療', emoji: '💊', color: '#C2554F', type: 'expense' },
    { id: 'cat_study', name: '學習', emoji: '📚', color: '#3E7C6A', type: 'expense' },
    { id: 'cat_cloth', name: '服飾', emoji: '👕', color: '#B56576', type: 'expense' },
    { id: 'cat_gift', name: '人情', emoji: '🎁', color: '#D17B88', type: 'expense' },
    { id: 'cat_pet', name: '寵物', emoji: '🐱', color: '#A98467', type: 'expense' },
    { id: 'cat_travel', name: '旅行', emoji: '✈️', color: '#5B8AA6', type: 'expense' },
    { id: 'cat_other', name: '其他', emoji: '📦', color: '#8C9289', type: 'expense' },
    { id: 'cat_salary', name: '薪水', emoji: '💼', color: '#2E7D5B', type: 'income' },
    { id: 'cat_bonus', name: '獎金', emoji: '🧧', color: '#C2554F', type: 'income' },
    { id: 'cat_invest', name: '投資', emoji: '📈', color: '#3E7C6A', type: 'income' },
    { id: 'cat_parttime', name: '兼職', emoji: '🧑‍💻', color: '#4A7C9B', type: 'income' },
    { id: 'cat_refund', name: '退款', emoji: '↩️', color: '#8C9289', type: 'income' },
    { id: 'cat_other_income', name: '其他收入', emoji: '💰', color: '#C9A227', type: 'income' }
  ];

  const DEFAULT_ACCOUNTS = [
    { id: 'acc_cash', name: '現金', type: 'cash', initial: 0 },
    { id: 'acc_bank', name: '銀行戶口', type: 'bank', initial: 3200000 },
    { id: 'acc_card', name: '信用卡', type: 'credit', initial: 0 },
    { id: 'acc_octopus', name: '八達通', type: 'wallet', initial: 15000 }
  ];

  const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  let seq = 0;
  function uid(prefix) {
    seq += 1;
    return prefix + '_' + Date.now().toString(36) + seq.toString(36) + Math.random().toString(36).slice(2, 5);
  }
  function pad(n) { return String(n).padStart(2, '0'); }
  function clone(v) { return JSON.parse(JSON.stringify(v)); }
  function toInt(v, fallback) {
    const n = Math.round(Number(v));
    return Number.isFinite(n) ? n : (fallback || 0);
  }
  function fmtYM(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1); }
  function parseYM(ym) {
    const p = String(ym || '').split('-');
    return { y: Number(p[0]), m: Number(p[1]) };
  }
  function addMonths(ym, delta) {
    const p = parseYM(ym);
    const d = new Date(p.y, p.m - 1 + delta, 1);
    return fmtYM(d);
  }
  function daysInMonth(ym) {
    const p = parseYM(ym);
    return new Date(p.y, p.m, 0).getDate();
  }
  function todayISO(d) {
    const t = d || new Date();
    return t.getFullYear() + '-' + pad(t.getMonth() + 1) + '-' + pad(t.getDate());
  }
  function isoAtNoon(dateStr) {
    return new Date(dateStr + 'T12:00:00').toISOString();
  }
  function sortTx(a, b) {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    const ac = a.createdAt || '';
    const bc = b.createdAt || '';
    if (ac !== bc) return ac < bc ? 1 : -1;
    return a.id < b.id ? 1 : -1;
  }

  function baseState(now) {
    return {
      version: VERSION,
      createdAt: (now || new Date()).toISOString(),
      settings: {
        currency: 'HK$',
        theme: 'system',
        activeLedgerId: 'ledger_daily',
        hideAmounts: false,
        demoMode: false,
        lastCategory: {},
        lastAccountId: 'acc_cash'
      },
      ledgers: [
        { id: 'ledger_daily', name: '日常帳本', color: '#1F5E45', emoji: '🌿' }
      ],
      accounts: clone(DEFAULT_ACCOUNTS),
      categories: clone(DEFAULT_CATEGORIES),
      transactions: [],
      budgets: []
    };
  }

  function emptyState(now) {
    return baseState(now);
  }

  function seedState(now) {
    const state = baseState(now);
    state.settings.demoMode = true;
    const today = now || new Date();
    const y = today.getFullYear();
    const m = today.getMonth() + 1;
    const curDay = today.getDate();
    const ym = y + '-' + pad(m);
    const dim = daysInMonth(ym);

    state.ledgers.push({ id: 'ledger_trip', name: '旅行帳本', color: '#E06A45', emoji: '✈️' });

    const push = (date, type, amount, categoryId, accountId, note, ledgerId) => {
      state.transactions.push({
        id: uid('tx'),
        type: type,
        amount: amount,
        categoryId: categoryId,
        accountId: accountId,
        ledgerId: ledgerId || 'ledger_daily',
        date: date,
        note: note || '',
        createdAt: isoAtNoon(date),
        updatedAt: isoAtNoon(date)
      });
    };
    const dateOf = (day) => ym + '-' + pad(Math.min(Math.max(day, 1), dim));

    const current = [
      [1, 'income', 2800000, 'cat_salary', 'acc_bank', '本月薪水'],
      [2, 'expense', 600000, 'cat_home', 'acc_bank', '租金（分擔）'],
      [3, 'expense', 5800, 'cat_food', 'acc_cash', '茶餐廳午餐'],
      [4, 'expense', 1250, 'cat_transport', 'acc_octopus', '港鐵'],
      [5, 'expense', 9600, 'cat_food', 'acc_cash', '午餐'],
      [6, 'expense', 4200, 'cat_food', 'acc_cash', '早餐'],
      [7, 'expense', 29900, 'cat_shop', 'acc_card', '日用品'],
      [8, 'expense', 7600, 'cat_food', 'acc_cash', '晚餐 · 大排檔'],
      [9, 'expense', 68000, 'cat_shop', 'acc_card', '家品'],
      [10, 'expense', 68000, 'cat_utility', 'acc_bank', '電費'],
      [11, 'expense', 12000, 'cat_fun', 'acc_card', '電影'],
      [12, 'expense', 12800, 'cat_food', 'acc_card', '朋友聚餐'],
      [13, 'expense', 280000, 'cat_travel', 'acc_card', '周末小旅行'],
      [14, 'expense', 4500, 'cat_transport', 'acc_cash', '的士'],
      [15, 'expense', 3500, 'cat_food', 'acc_cash', '咖啡'],
      [16, 'expense', 38000, 'cat_fun', 'acc_card', '演唱會'],
      [17, 'expense', 32000, 'cat_health', 'acc_card', '藥房'],
      [18, 'expense', 16800, 'cat_shop', 'acc_card', '衫'],
      [19, 'expense', 22000, 'cat_food', 'acc_cash', '晚餐 · 火鍋'],
      [20, 'expense', 6400, 'cat_food', 'acc_octopus', '午餐'],
      [21, 'expense', 840, 'cat_transport', 'acc_octopus', '巴士'],
      [22, 'expense', 12000, 'cat_transport', 'acc_octopus', '月票'],
      [23, 'expense', 8800, 'cat_food', 'acc_cash', '晚餐'],
      [24, 'expense', 25000, 'cat_study', 'acc_card', '書'],
      [25, 'expense', 9600, 'cat_food', 'acc_cash', '午餐'],
      [26, 'expense', 5200, 'cat_food', 'acc_cash', '午餐'],
      [27, 'income', 12000, 'cat_refund', 'acc_bank', '網購退款'],
      [29, 'expense', 6800, 'cat_food', 'acc_cash', '茶餐廳'],
      [30, 'expense', 6800, 'cat_fun', 'acc_card', '串流月費']
    ];
    current.forEach(function (row) {
      if (row[0] <= curDay) {
        push(dateOf(row[0]), row[1], row[2], row[3], row[4], row[5]);
      }
    });

    // Five previous months, so the six-month trend is meaningful.
    const patterns = [
      [3, 'expense', 32000, 'cat_food', 'acc_cash', '茶餐廳'],
      [6, 'expense', 48000, 'cat_shop', 'acc_card', '日用品'],
      [10, 'expense', 7600, 'cat_transport', 'acc_octopus', '港鐵'],
      [14, 'expense', 19800, 'cat_fun', 'acc_card', '聚會'],
      [19, 'expense', 45800, 'cat_food', 'acc_card', '晚餐'],
      [25, 'expense', 52000, 'cat_utility', 'acc_bank', '水電煤']
    ];
    for (let i = 1; i <= 5; i += 1) {
      const d = new Date(y, m - 1 - i, 1);
      const pym = fmtYM(d);
      const pYm = pym;
      push(pYm + '-01', 'income', 2800000, 'cat_salary', 'acc_bank', '薪水');
      push(pYm + '-02', 'expense', 1200000, 'cat_home', 'acc_bank', '租金');
      patterns.forEach(function (row, idx) {
        const amount = Math.round(row[2] * (0.82 + ((i * 7 + idx * 13) % 31) / 100));
        push(pYm + '-' + pad(row[0]), row[1], amount, row[3], row[4], row[5]);
      });
    }

    // A separate trip ledger, two months back.
    const tripMonth = addMonths(ym, -2);
    const tripDate = (day) => tripMonth + '-' + pad(day);
    push(tripDate(15), 'expense', 238000, 'cat_travel', 'acc_card', '機票', 'ledger_trip');
    push(tripDate(16), 'expense', 185000, 'cat_home', 'acc_card', '酒店', 'ledger_trip');
    push(tripDate(17), 'expense', 32000, 'cat_food', 'acc_cash', '當地美食', 'ledger_trip');

    state.budgets = [
      { id: 'bgt_total', ledgerId: 'ledger_daily', categoryId: null, amount: 1800000 },
      { id: 'bgt_food', ledgerId: 'ledger_daily', categoryId: 'cat_food', amount: 150000 },
      { id: 'bgt_transport', ledgerId: 'ledger_daily', categoryId: 'cat_transport', amount: 30000 },
      { id: 'bgt_fun', ledgerId: 'ledger_daily', categoryId: 'cat_fun', amount: 50000 },
      { id: 'bgt_shop', ledgerId: 'ledger_daily', categoryId: 'cat_shop', amount: 120000 },
      { id: 'bgt_travel', ledgerId: 'ledger_daily', categoryId: 'cat_travel', amount: 300000 }
    ];

    return state;
  }

  function normalize(raw) {
    if (!raw || typeof raw !== 'object') throw new Error('備份格式不正確');
    const state = raw.data && typeof raw.data === 'object' ? raw.data : raw;
    if (!Array.isArray(state.transactions) || !Array.isArray(state.categories) ||
        !Array.isArray(state.accounts) || !Array.isArray(state.ledgers)) {
      throw new Error('備份缺少必要資料');
    }
    const base = baseState(new Date());
    const out = {
      version: VERSION,
      createdAt: typeof state.createdAt === 'string' ? state.createdAt : base.createdAt,
      settings: Object.assign({}, base.settings, state.settings || {}),
      ledgers: [],
      accounts: [],
      categories: [],
      transactions: [],
      budgets: []
    };

    state.ledgers.forEach(function (l) {
      if (!l || !l.id) return;
      out.ledgers.push({
        id: String(l.id),
        name: String(l.name || '未命名帳本').slice(0, 20),
        color: /^#[0-9a-fA-F]{6}$/.test(l.color || '') ? l.color : '#1F5E45',
        emoji: String(l.emoji || '🌿').slice(0, 8)
      });
    });
    if (!out.ledgers.length) out.ledgers = base.ledgers;

    state.accounts.forEach(function (a) {
      if (!a || !a.id) return;
      out.accounts.push({
        id: String(a.id),
        name: String(a.name || '帳戶').slice(0, 20),
        type: ACCOUNT_TYPES[a.type] ? a.type : 'other',
        initial: toInt(a.initial, 0)
      });
    });
    if (!out.accounts.length) out.accounts = base.accounts;

    state.categories.forEach(function (c) {
      if (!c || !c.id || !c.name) return;
      out.categories.push({
        id: String(c.id),
        name: String(c.name).slice(0, 12),
        emoji: String(c.emoji || '📦').slice(0, 8),
        color: /^#[0-9a-fA-F]{6}$/.test(c.color || '') ? c.color : '#8C9289',
        type: c.type === 'income' ? 'income' : 'expense'
      });
    });
    if (!out.categories.length) out.categories = base.categories;

    const ledgerIds = new Set(out.ledgers.map(function (l) { return l.id; }));
    const accountIds = new Set(out.accounts.map(function (a) { return a.id; }));
    const categoryMap = {};
    out.categories.forEach(function (c) { categoryMap[c.id] = c; });

    state.transactions.forEach(function (t) {
      if (!t || !t.id || !/^\d{4}-\d{2}-\d{2}$/.test(t.date || '')) return;
      if (t.type !== 'expense' && t.type !== 'income') return;
      const amount = Math.round(Number(t.amount));
      if (!Number.isFinite(amount) || amount <= 0) return;
      const category = categoryMap[t.categoryId];
      const accountId = accountIds.has(t.accountId) ? t.accountId : out.accounts[0].id;
      const ledgerId = ledgerIds.has(t.ledgerId) ? t.ledgerId : out.ledgers[0].id;
      out.transactions.push({
        id: String(t.id),
        type: t.type,
        amount: amount,
        categoryId: category && category.type === t.type ? t.categoryId : (t.type === 'expense' ? 'cat_other' : 'cat_other_income'),
        accountId: accountId,
        ledgerId: ledgerId,
        date: t.date,
        note: String(t.note || '').slice(0, 80),
        createdAt: typeof t.createdAt === 'string' ? t.createdAt : isoAtNoon(t.date),
        updatedAt: typeof t.updatedAt === 'string' ? t.updatedAt : isoAtNoon(t.date)
      });
    });

    (state.budgets || []).forEach(function (b) {
      if (!b || !ledgerIds.has(b.ledgerId)) return;
      const amount = toInt(b.amount, 0);
      if (amount <= 0) return;
      out.budgets.push({
        id: b.id ? String(b.id) : uid('bgt'),
        ledgerId: b.ledgerId,
        categoryId: b.categoryId || null,
        amount: amount
      });
    });

    if (!ledgerIds.has(out.settings.activeLedgerId)) out.settings.activeLedgerId = out.ledgers[0].id;
    if (!/^(HK\$|NT\$|US\$|S\$|[$¥€£])$/.test(String(out.settings.currency || ''))) out.settings.currency = 'HK$';
    if (['system', 'light', 'dark'].indexOf(out.settings.theme) < 0) out.settings.theme = 'system';
    out.settings.hideAmounts = !!out.settings.hideAmounts;
    out.settings.demoMode = !!out.settings.demoMode;
    return out;
  }

  let memoryState = null;
  let lastSaveError = null;

  function load() {
    try {
      const raw = root.localStorage ? root.localStorage.getItem(STORAGE_KEY) : null;
      if (!raw) {
        const seeded = seedState(new Date());
        save(seeded);
        return seeded;
      }
      return normalize(JSON.parse(raw));
    } catch (err) {
      if (memoryState) return clone(memoryState);
      const seeded = seedState(new Date());
      memoryState = seeded;
      return seeded;
    }
  }

  function save(state) {
    memoryState = clone(state);
    try {
      if (!root.localStorage) throw new Error('localStorage unavailable');
      root.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      lastSaveError = null;
      return true;
    } catch (err) {
      lastSaveError = err;
      return false;
    }
  }

  function categoryById(state, id) {
    return state.categories.find(function (c) { return c.id === id; }) || null;
  }
  function accountById(state, id) {
    return state.accounts.find(function (a) { return a.id === id; }) || null;
  }
  function ledgerById(state, id) {
    return state.ledgers.find(function (l) { return l.id === id; }) || null;
  }

  function validateInput(state, input) {
    const type = input.type === 'income' ? 'income' : 'expense';
    const amount = Math.round(Number(input.amount));
    if (!Number.isFinite(amount) || amount <= 0) throw new Error('請輸入有效金額');
    if (amount > 99999999900) throw new Error('金額太大了');
    const category = categoryById(state, input.categoryId);
    if (!category || category.type !== type) throw new Error('請選擇分類');
    if (!accountById(state, input.accountId)) throw new Error('請選擇帳戶');
    if (!ledgerById(state, input.ledgerId)) throw new Error('帳本不存在');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date || '')) throw new Error('日期不正確');
    return {
      type: type,
      amount: amount,
      categoryId: category.id,
      accountId: input.accountId,
      ledgerId: input.ledgerId,
      date: input.date,
      note: String(input.note || '').trim().slice(0, 80)
    };
  }

  function addTransaction(state, input) {
    const clean = validateInput(state, input);
    const now = new Date().toISOString();
    const tx = Object.assign({ id: uid('tx') }, clean, { createdAt: now, updatedAt: now });
    state.transactions.push(tx);
    return tx;
  }

  function updateTransaction(state, id, input) {
    const idx = state.transactions.findIndex(function (t) { return t.id === id; });
    if (idx < 0) throw new Error('找不到這筆紀錄');
    const clean = validateInput(state, input);
    state.transactions[idx] = Object.assign({}, state.transactions[idx], clean, { updatedAt: new Date().toISOString() });
    return state.transactions[idx];
  }

  function deleteTransaction(state, id) {
    const before = state.transactions.length;
    state.transactions = state.transactions.filter(function (t) { return t.id !== id; });
    return state.transactions.length < before;
  }

  function addLedger(state, data) {
    const name = String(data && data.name || '').trim();
    if (!name) throw new Error('請輸入帳本名稱');
    const ledger = {
      id: uid('ledger'),
      name: name.slice(0, 20),
      color: /^#[0-9a-fA-F]{6}$/.test(data.color || '') ? data.color : PALETTE[state.ledgers.length % PALETTE.length],
      emoji: String(data.emoji || '📒').slice(0, 8)
    };
    state.ledgers.push(ledger);
    return ledger;
  }

  function deleteLedger(state, id) {
    if (state.ledgers.length <= 1) throw new Error('至少要保留一本帳本');
    if (state.transactions.some(function (t) { return t.ledgerId === id; })) {
      throw new Error('此帳本仍有紀錄，請先清除紀錄');
    }
    state.ledgers = state.ledgers.filter(function (l) { return l.id !== id; });
    state.budgets = state.budgets.filter(function (b) { return b.ledgerId !== id; });
    if (state.settings.activeLedgerId === id) state.settings.activeLedgerId = state.ledgers[0].id;
  }

  function addAccount(state, data) {
    const name = String(data && data.name || '').trim();
    if (!name) throw new Error('請輸入帳戶名稱');
    const account = {
      id: uid('acc'),
      name: name.slice(0, 20),
      type: ACCOUNT_TYPES[data.type] ? data.type : 'other',
      initial: toInt(data.initial, 0)
    };
    state.accounts.push(account);
    return account;
  }

  function deleteAccount(state, id) {
    if (state.accounts.length <= 1) throw new Error('至少要保留一個帳戶');
    if (state.transactions.some(function (t) { return t.accountId === id; })) {
      throw new Error('此帳戶仍有紀錄，未能刪除');
    }
    state.accounts = state.accounts.filter(function (a) { return a.id !== id; });
  }

  function addCategory(state, data) {
    const name = String(data && data.name || '').trim();
    if (!name) throw new Error('請輸入分類名稱');
    const type = data.type === 'income' ? 'income' : 'expense';
    const category = {
      id: uid('cat'),
      name: name.slice(0, 12),
      emoji: String(data.emoji || '📦').slice(0, 8),
      color: /^#[0-9a-fA-F]{6}$/.test(data.color || '') ? data.color : PALETTE[state.categories.length % PALETTE.length],
      type: type
    };
    state.categories.push(category);
    return category;
  }

  function deleteCategory(state, id) {
    if (state.transactions.some(function (t) { return t.categoryId === id; })) {
      throw new Error('此分類仍有紀錄，未能刪除');
    }
    const cat = categoryById(state, id);
    if (!cat) return;
    const remaining = state.categories.filter(function (c) { return c.type === cat.type && c.id !== id; });
    if (!remaining.length) throw new Error('每種收支至少要保留一個分類');
    state.categories = state.categories.filter(function (c) { return c.id !== id; });
    state.budgets = state.budgets.filter(function (b) { return b.categoryId !== id; });
  }

  function setBudget(state, ledgerId, categoryId, amount) {
    const cents = Math.round(Number(amount) || 0);
    const idx = state.budgets.findIndex(function (b) {
      return b.ledgerId === ledgerId && (b.categoryId || null) === (categoryId || null);
    });
    if (cents <= 0) {
      if (idx >= 0) state.budgets.splice(idx, 1);
      return;
    }
    if (idx >= 0) state.budgets[idx].amount = cents;
    else state.budgets.push({
      id: uid('bgt'),
      ledgerId: ledgerId,
      categoryId: categoryId || null,
      amount: cents
    });
  }

  function ledgerTx(state, ledgerId) {
    return state.transactions.filter(function (t) {
      return !ledgerId || t.ledgerId === ledgerId;
    });
  }

  function summarize(state, ym, ledgerId, now) {
    const tx = ledgerTx(state, ledgerId).filter(function (t) { return t.date.slice(0, 7) === ym; });
    let expense = 0;
    let income = 0;
    const catMap = {};
    const dayMap = {};
    tx.forEach(function (t) {
      const isExpense = t.type === 'expense';
      if (isExpense) expense += t.amount; else income += t.amount;
      if (!catMap[t.categoryId]) catMap[t.categoryId] = { categoryId: t.categoryId, amount: 0, count: 0 };
      catMap[t.categoryId].amount += t.amount;
      catMap[t.categoryId].count += 1;
      const day = Number(t.date.slice(8, 10));
      if (!dayMap[day]) dayMap[day] = { day: day, expense: 0, income: 0 };
      if (isExpense) dayMap[day].expense += t.amount; else dayMap[day].income += t.amount;
    });
    const byCategory = Object.keys(catMap).map(function (k) { return catMap[k]; })
      .sort(function (a, b) { return b.amount - a.amount; });
    const total = expense + income;
    byCategory.forEach(function (r) { r.pct = total > 0 ? r.amount / total : 0; });
    const days = Object.keys(dayMap).length;
    const ref = now || new Date();
    const current = fmtYM(ref) === ym;
    const denom = current ? Math.max(1, Math.min(ref.getDate(), daysInMonth(ym))) : daysInMonth(ym);
    return {
      ym: ym,
      expense: expense,
      income: income,
      net: income - expense,
      count: tx.length,
      days: days,
      avgDaily: Math.round(expense / denom),
      byCategory: byCategory,
      byDay: dayMap
    };
  }

  function recentTransactions(state, ledgerId, limit) {
    return ledgerTx(state, ledgerId).slice().sort(sortTx).slice(0, limit || 5);
  }

  function monthlyTrend(state, endYm, count, ledgerId) {
    const out = [];
    for (let i = count - 1; i >= 0; i -= 1) {
      const ym = addMonths(endYm, -i);
      const s = summarize(state, ym, ledgerId);
      out.push({
        ym: ym,
        label: MONTHS_EN[parseYM(ym).m - 1],
        short: (parseYM(ym).m) + '月',
        expense: s.expense,
        income: s.income
      });
    }
    return out;
  }

  function budgetStatus(state, ym, ledgerId) {
    const totalRow = state.budgets.find(function (b) {
      return b.ledgerId === ledgerId && !b.categoryId;
    });
    const total = totalRow ? totalRow.amount : 0;
    const sum = summarize(state, ym, ledgerId);
    const rows = state.budgets.filter(function (b) {
      return b.ledgerId === ledgerId && b.categoryId;
    }).map(function (b) {
      const cat = categoryById(state, b.categoryId);
      const spentRow = sum.byCategory.find(function (c) { return c.categoryId === b.categoryId; });
      const spent = spentRow ? spentRow.amount : 0;
      return {
        categoryId: b.categoryId,
        category: cat,
        budget: b.amount,
        spent: spent,
        pct: b.amount > 0 ? spent / b.amount : 0,
        remaining: b.amount - spent
      };
    }).filter(function (r) { return r.category; })
      .sort(function (a, b) { return b.pct - a.pct; });
    return {
      total: total,
      spent: sum.expense,
      remaining: total - sum.expense,
      pct: total > 0 ? sum.expense / total : 0,
      categories: rows
    };
  }

  function accountBalances(state, ledgerId) {
    return state.accounts.map(function (a) {
      let balance = a.initial;
      ledgerTx(state, ledgerId).forEach(function (t) {
        if (t.accountId !== a.id) return;
        balance += t.type === 'income' ? t.amount : -t.amount;
      });
      return { account: a, balance: balance };
    });
  }

  function topCategories(state, ledgerId, limit) {
    const counts = {};
    ledgerTx(state, ledgerId).forEach(function (t) {
      if (!counts[t.categoryId]) counts[t.categoryId] = { id: t.categoryId, count: 0, amount: 0, last: '' };
      counts[t.categoryId].count += 1;
      counts[t.categoryId].amount += t.amount;
      if (t.date > counts[t.categoryId].last) counts[t.categoryId].last = t.date;
    });
    return Object.keys(counts).map(function (k) {
      return Object.assign(counts[k], { category: categoryById(state, k) });
    }).filter(function (r) { return r.category && r.category.type === 'expense'; })
      .sort(function (a, b) {
        if (b.count !== a.count) return b.count - a.count;
        return b.amount - a.amount;
      }).slice(0, limit || 4)
      .map(function (r) { return r.category; });
  }

  function lastAmountForCategory(state, categoryId, ledgerId) {
    const tx = ledgerTx(state, ledgerId).filter(function (t) { return t.categoryId === categoryId; })
      .sort(sortTx);
    return tx.length ? tx[0].amount : 0;
  }

  function exportCSV(state, ledgerId) {
    const accounts = {};
    state.accounts.forEach(function (a) { accounts[a.id] = a.name; });
    const categories = {};
    state.categories.forEach(function (c) { categories[c.id] = c.name; });
    const ledgers = {};
    state.ledgers.forEach(function (l) { ledgers[l.id] = l.name; });
    const rows = [['日期', '收支', '分類', '帳戶', '備註', '金額', '帳本']];
    ledgerTx(state, ledgerId).slice().sort(sortTx).forEach(function (t) {
      rows.push([
        t.date,
        t.type === 'expense' ? '支出' : '收入',
        categories[t.categoryId] || '',
        accounts[t.accountId] || '',
        t.note || '',
        (t.amount / 100).toFixed(2),
        ledgers[t.ledgerId] || ''
      ]);
    });
    return '\uFEFF' + rows.map(function (row) {
      return row.map(function (cell) {
        const text = String(cell);
        return /[",\n\r]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
      }).join(',');
    }).join('\r\n');
  }

  function exportJSON(state) {
    return JSON.stringify({
      app: '日日記',
      version: VERSION,
      exportedAt: new Date().toISOString(),
      data: state
    }, null, 2);
  }

  function importJSON(text) {
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      throw new Error('無法讀取備份檔');
    }
    return normalize(parsed);
  }

  return {
    VERSION: VERSION,
    STORAGE_KEY: STORAGE_KEY,
    PALETTE: PALETTE,
    ACCOUNT_TYPES: ACCOUNT_TYPES,
    DEFAULT_CATEGORIES: DEFAULT_CATEGORIES,
    DEFAULT_ACCOUNTS: DEFAULT_ACCOUNTS,
    uid: uid,
    fmtYM: fmtYM,
    addMonths: addMonths,
    daysInMonth: daysInMonth,
    todayISO: todayISO,
    emptyState: emptyState,
    seedState: seedState,
    normalize: normalize,
    load: load,
    save: save,
    getSaveError: function () { return lastSaveError; },
    categoryById: categoryById,
    accountById: accountById,
    ledgerById: ledgerById,
    addTransaction: addTransaction,
    updateTransaction: updateTransaction,
    deleteTransaction: deleteTransaction,
    addLedger: addLedger,
    deleteLedger: deleteLedger,
    addAccount: addAccount,
    deleteAccount: deleteAccount,
    addCategory: addCategory,
    deleteCategory: deleteCategory,
    setBudget: setBudget,
    summarize: summarize,
    recentTransactions: recentTransactions,
    monthlyTrend: monthlyTrend,
    budgetStatus: budgetStatus,
    accountBalances: accountBalances,
    topCategories: topCategories,
    lastAmountForCategory: lastAmountForCategory,
    exportCSV: exportCSV,
    exportJSON: exportJSON,
    importJSON: importJSON
  };
});
