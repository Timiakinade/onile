/* Onile prototype: state, rules, shared components and the app shell. */
(function () {
  'use strict';
  var O = window.O = {};
  var KEY = 'onile_demo';

  O.MARK = '<svg viewBox="0 0 45.33 40.177" aria-hidden="true"><path fill="#101928" fill-rule="evenodd" d="M22.594 0C24.406-.028 26.679 2.314 28.027 3.425C32.228 6.886 36.505 10.255 40.693 13.731C41.742 14.602 45.658 17.171 45.307 18.6C44.895 20.28 41.153 19.739 39.827 19.762C39.664 25.469 40.087 29.343 36.23 34.098C29.063 42.934 13.278 41.954 7.275 32.349C4.752 28.311 5.144 24.291 4.995 19.775C3.71 19.735.21 20.275.004 18.418C-.144 17.079 3.646 14.56 4.667 13.712C8.911 10.182 13.191 6.633 17.564 3.264C18.981 2.173 20.657.031 22.594 0ZM22.665 12.995C17.695 12.995 13.667 17.023 13.667 21.993C13.667 26.962 17.695 30.99 22.665 30.99C27.634 30.99 31.663 26.962 31.663 21.993C31.663 17.023 27.634 12.995 22.665 12.995Z"/><g fill="#101928"><rect x="18.515" y="17.84" width="3.89" height="3.89"/><rect x="18.515" y="22.255" width="3.89" height="3.89"/><rect x="22.925" y="17.84" width="3.89" height="3.89"/><rect x="22.925" y="22.255" width="3.89" height="3.89"/></g></svg>';

  O.ROLES = {
    owner: { key: 'owner', label: 'Owner', user: 'Omoakin', first: 'Omoakin', initials: 'OM', nav: ['overview', 'units', 'bookings', 'maintenance', 'payments', 'deposits', 'finance', 'statements'] },
    manager: { key: 'manager', label: 'Manager', user: 'Tola Bello', first: 'Tola', initials: 'TB', nav: ['overview', 'units', 'bookings', 'maintenance', 'payments', 'deposits', 'finance'] },
    accountant: { key: 'accountant', label: 'Accountant', user: 'Ngozi Eze', first: 'Ngozi', initials: 'NE', nav: ['overview', 'units', 'bookings', 'payments', 'deposits', 'finance', 'statements'] }
  };
  O.NAV = {
    overview: { label: 'Overview', icon: 'home', group: 0 },
    units: { label: 'Units', icon: 'units', group: 0 },
    bookings: { label: 'Bookings', icon: 'calendar', group: 0 },
    maintenance: { label: 'Maintenance', icon: 'maintenance', group: 0 },
    payments: { label: 'Payments', icon: 'payments', group: 1 },
    deposits: { label: 'Deposits', icon: 'deposits', group: 1 },
    finance: { label: 'Finance', icon: 'finance', group: 1 },
    statements: { label: 'Statements', icon: 'statements', group: 1 }
  };

  /* State */
  O.load = function () {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) { var o = JSON.parse(raw); if (o && o.v === window.ONILE_SEED().v) return o; }
    } catch (e) {}
    return window.ONILE_SEED();
  };
  O.S = O.load();
  O.save = function () { try { localStorage.setItem(KEY, JSON.stringify(O.S)); } catch (e) {} };
  O.reset = function () {
    var role = O.S.role;
    O.S = window.ONILE_SEED(); O.S.role = role; O.save();
    O.closeOverlay(); O.closePop(); O.render(); O.toast('Demo data reset');
  };
  var qRole = new URLSearchParams(location.search).get('role');
  if (qRole && O.ROLES[qRole]) { O.S.role = qRole; O.save(); }

  /* Helpers */
  O.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  O.fmt = function (n) { return '₦ ' + Math.round(n).toLocaleString('en-US'); };
  O.short = function (n) { return n >= 1e6 ? '₦ ' + (Math.round(n / 1e4) / 100) + 'm' : '₦ ' + Math.round(n / 1e3) + 'k'; };
  O.role = function () { return O.ROLES[O.S.role]; };
  O.unit = function (name) { return O.S.units.find(function (u) { return u.name === name; }); };
  O.task = function (id) { return O.S.tasks.find(function (t) { return t.id === id; }); };
  O.booking = function (id) { return O.S.bookings.find(function (b) { return b.id === id; }); };
  O.waitingSum = function () { return O.S.waiting.reduce(function (a, p) { return a + p.amount; }, 0); };
  O.extraTotal = function () { var t = 0; Object.keys(O.S.extra).forEach(function (k) { t += O.S.extra[k]; }); return t; };
  O.revenueMonth = function () { return O.S.revenueBase + O.extraTotal(); };
  O.statusTone = function (s) { return { Ready: 'positive', Occupied: 'info', Cleaning: 'warning', Maintenance: 'neutral', Blocked: 'neutral', 'Not ready': 'critical' }[s] || 'neutral'; };
  O.taskTone = function (s) { return { Overdue: 'critical', 'In progress': 'info', 'To do': 'neutral', Done: 'positive' }[s] || 'neutral'; };
  O.maintCount = function () { return O.S.tasks.filter(function (t) { return t.status === 'Overdue' || (t.id === 't2' && t.status !== 'Done'); }).length; };
  O.delegated = function (power) { return !!(O.S.delegation && O.S.role === 'manager' && O.S.delegation.powers.indexOf(power) > -1); };

  /* Who can do what. A payment the manager records always needs someone else to confirm it. */
  O.can = function (p) {
    var r = O.S.role;
    switch (p) {
      case 'confirm': return r === 'owner' || r === 'accountant';
      case 'record': return r === 'owner' || r === 'manager';
      case 'book': return r === 'owner' || r === 'manager';
      case 'addUnit': return r === 'owner';
      case 'approveRefund': return r === 'owner' || O.delegated('refunds');
      case 'requestReturn': return r === 'owner' || r === 'manager';
      case 'recordRefund': return r === 'owner' || r === 'accountant';
      case 'tasks': return r === 'owner' || r === 'manager';
      case 'statement': return r === 'owner' || r === 'accountant' || O.delegated('statements');
      case 'money': return r === 'owner' || r === 'accountant';
      case 'access': return r === 'owner';
    }
    return false;
  };

  /* Landlord statement figures. Sent statements are frozen; draft ones pick up newly confirmed money. */
  O.statement = function (key) {
    var L = O.S.landlords[key], frozen = L.status === 'Sent';
    var rows = O.S.units.filter(function (u) { return u.landlord === key && O.S.fin[u.name]; }).map(function (u) {
      var f = O.S.fin[u.name], extra = frozen ? ((L.snap && L.snap[u.name]) || 0) : (O.S.extra[u.name] || 0);
      var rev = f.revenue + extra, net = rev - f.costs, com = Math.round(net * 0.2);
      return { unit: u.name, rev: rev, costs: f.costs, net: net, com: com, due: net - com, nights: f.nights, bookings: f.bookings, extra: extra };
    });
    var t = { rev: 0, costs: 0, net: 0, com: 0, due: 0 };
    rows.forEach(function (r) { t.rev += r.rev; t.costs += r.costs; t.net += r.net; t.com += r.com; t.due += r.due; });
    var waiting = O.S.waiting.filter(function (p) { var u = O.unit(p.unit); return u && u.landlord === key; }).length;
    return { key: key, L: L, rows: rows, t: t, frozen: frozen, waiting: waiting };
  };
  O.statementKeys = ['adebayo', 'funke', 'okon'];

  /* Components */
  O.chip = function (text, tone, dot) { return '<span class="chip t-' + tone + '">' + (dot === false ? '' : '<span class="dot"></span>') + O.esc(text) + '</span>'; };
  O.attrs = function (o) {
    var a = '';
    if (o.act) a += ' data-act="' + o.act + '"';
    if (o.arg != null) a += ' data-arg="' + O.esc(o.arg) + '"';
    if (o.go) a += ' data-go="' + o.go + '"';
    return a;
  };
  O.btn = function (label, o) {
    o = o || {};
    return '<button type="button" class="btn ' + (o.style || 'secondary') + (o.block ? ' block' : '') + '"' + O.attrs(o) + (o.id ? ' id="' + o.id + '"' : '') + (o.disabled ? ' disabled' : '') + '>' + (o.icon ? icon(o.icon) : '') + O.esc(label) + '</button>';
  };
  O.pageHead = function (title, sub, actions) {
    return '<div class="page-head"><div class="titles"><h1 class="page-title">' + O.esc(title) + '</h1>' + (sub ? '<p class="page-sub">' + sub + '</p>' : '') + '</div>' + (actions ? '<div class="actions">' + actions + '</div>' : '') + '</div>';
  };
  O.kpi = function (label, value, meta, up) {
    return '<div class="kpi"><div class="kpi-label">' + O.esc(label) + '</div><div class="kpi-value">' + O.esc(value) + '</div><div class="kpi-meta">' + (up ? '<span class="up">' + icon('trend-up', 16) + O.esc(up) + '</span>' : '') + '<span>' + O.esc(meta || '') + '</span></div></div>';
  };
  O.panel = function (title, meta, body, cls) {
    return '<section class="panel ' + (cls || '') + '"><div class="panel-head"><h2 class="panel-title">' + O.esc(title) + '</h2>' + (meta || '') + '</div>' + body + '</section>';
  };
  O.meta = function (t) { return '<span class="panel-meta">' + O.esc(t) + '</span>'; };
  O.dotColor = { critical: '#F04438', warning: '#F79009', info: '#2E90FA', positive: '#12B76A' };
  O.alertRow = function (a) {
    return '<button type="button" class="alert-row"' + O.attrs(a) + '><span class="adot" style="background:' + O.dotColor[a.tone] + '"></span><span class="stack"><span class="strong">' + O.esc(a.title) + '</span><span class="muted sm">' + O.esc(a.sub) + '</span></span><span class="link">' + O.esc(a.link) + '</span></button>';
  };
  O.listRow = function (r) {
    var tag = (r.act || r.go) ? 'button type="button"' : 'div';
    var close = (r.act || r.go) ? 'button' : 'div';
    return '<' + tag + ' class="list-row"' + O.attrs(r) + '>' + (r.time ? '<span class="time">' + O.esc(r.time) + '</span>' : '') + '<span class="stack"><span class="strong">' + O.esc(r.title) + '</span><span class="muted sm">' + O.esc(r.sub) + '</span></span>' + (r.right || '') + '</' + close + '>';
  };
  O.kv = function (k, v, sub, right, cls) {
    return '<div class="kv ' + (cls || '') + '"><span class="stack"><span' + (cls === 'total' || cls === 'strongk' ? ' class="strong"' : '') + '>' + O.esc(k) + '</span>' + (sub ? '<span class="muted sm">' + O.esc(sub) + '</span>' : '') + '</span>' + (right || '') + (v != null ? '<span class="v">' + v + '</span>' : '') + '</div>';
  };
  O.seg = function (items, active, act) {
    return '<div class="seg" role="tablist">' + items.map(function (it) {
      return '<button type="button" role="tab" class="' + (it.key === active ? 'on' : '') + '" data-act="' + act + '" data-arg="' + O.esc(it.key) + '">' + O.esc(it.label) + (it.n != null ? '<span class="n">' + it.n + '</span>' : '') + '</button>';
    }).join('') + '</div>';
  };
  O.table = function (cols, head, rows, opts) {
    opts = opts || {};
    var style = ' style="grid-template-columns:' + cols + '"';
    var h = '<div class="tr th"' + style + '>' + head.map(function (c) { return '<span>' + c + '</span>'; }).join('') + '</div>';
    var b = rows.length ? rows.map(function (r) {
      var clickable = r.act || r.go;
      return '<div class="tr' + (clickable ? ' click' : '') + '"' + style + O.attrs(r) + (clickable ? ' role="button" tabindex="0"' : '') + '>' + r.cells.map(function (c, i) { return '<span' + (i === 0 ? ' class="c1"' : '') + '>' + c + '</span>'; }).join('') + '</div>';
    }).join('') : '<div class="empty">' + O.esc(opts.empty || 'Nothing here yet') + '</div>';
    return '<div class="table"><div class="table-scroll"><div class="table-min">' + h + b + (opts.foot || '') + '</div></div></div>';
  };
  O.banner = function (tone, ic, title, sub, actions) {
    return '<div class="banner ' + tone + '">' + icon(ic) + '<span class="stack"><span class="strong">' + O.esc(title) + '</span><span class="muted">' + O.esc(sub) + '</span></span>' + (actions || '') + '</div>';
  };
  O.toolbarSearch = function (ph, key) {
    return '<label class="search sm-w">' + icon('search') + '<input type="search" placeholder="' + O.esc(ph) + '" data-input="' + key + '" value="' + O.esc(O.S.ui[key] || '') + '"><span class="sr">' + O.esc(ph) + '</span></label>';
  };
  O.soon = function (what) { O.toast((what || 'This') + ' isn’t part of the prototype', 'info'); };

  /* Toasts. tone: undefined (success), 'info' or 'warn' */
  O.toast = function (msg, tone) {
    var box = document.getElementById('toasts');
    var t = document.createElement('div'); t.className = 'toast' + (tone ? ' ' + tone : ''); t.setAttribute('role', 'status');
    t.innerHTML = icon(tone === 'warn' ? 'alert' : tone === 'info' ? 'info' : 'check') + '<span>' + O.esc(msg) + '</span>';
    box.appendChild(t);
    setTimeout(function () { t.style.transition = 'opacity .3s'; t.style.opacity = '0'; setTimeout(function () { t.remove(); }, 320); }, 3200);
  };

  /* Overlays */
  O.openOverlay = function (html, center) {
    var root = document.getElementById('overlay');
    root.innerHTML = '<div class="overlay' + (center ? ' center' : '') + '" data-act="overlay-bg">' + html + '</div>';
    var first = root.querySelector('[autofocus]');
    if (first) setTimeout(function () { first.focus(); }, 30);
  };
  O.closeOverlay = function () { var root = document.getElementById('overlay'); if (root) root.innerHTML = ''; };
  O.drawer = function (title, sub, body, foot) {
    return '<aside class="drawer" role="dialog" aria-modal="true" aria-label="' + O.esc(title) + '"><div class="drawer-head"><div class="stack"><span class="panel-title">' + O.esc(title) + '</span>' + (sub ? '<span class="muted sm">' + O.esc(sub) + '</span>' : '') + '</div><button type="button" class="icon-btn ghost" data-act="close" aria-label="Close">' + icon('close') + '</button></div><div class="drawer-body">' + body + '</div>' + (foot ? '<div class="drawer-foot">' + foot + '</div>' : '') + '</aside>';
  };
  O.openPop = function (html, anchor, place) {
    O.closePop();
    var p = document.createElement('div'); p.className = 'pop'; p.id = 'pop'; p.innerHTML = html;
    document.body.appendChild(p);
    var r = anchor.getBoundingClientRect();
    var top = place === 'above' ? r.top + window.scrollY - p.offsetHeight - 8 : r.bottom + window.scrollY + 8;
    var left = place === 'above' ? r.left : Math.min(r.left, window.innerWidth - p.offsetWidth - 12);
    p.style.top = Math.max(8, top) + 'px'; p.style.left = Math.max(8, left) + 'px';
  };
  O.closePop = function () { var p = document.getElementById('pop'); if (p) p.remove(); };

  /* Activity log for delegated access */
  O.logAction = function (title, sub, tone, status) {
    if (!(O.S.delegation && O.S.role === 'manager')) return;
    O.S.log.unshift({ title: title, sub: sub + ' · just now', tone: tone || 'positive', status: status || 'Saved' });
  };

  /* Shell */
  function sidebar(page) {
    var role = O.role(), groups = [[], []];
    var nav = role.nav.slice();
    if (O.delegated('statements') && nav.indexOf('statements') < 0) nav.push('statements');
    nav.forEach(function (k) { groups[O.NAV[k].group].push(k); });
    function item(k) {
      var n = O.NAV[k], count = '';
      if (k === 'maintenance' && O.maintCount()) count = '<span class="count">' + O.maintCount() + '</span>';
      if (k === 'payments' && O.S.waiting.length) count = '<span class="count">' + O.S.waiting.length + '</span>';
      var active = page === k || (page === 'booking' && k === 'bookings');
      return '<a href="#/' + k + '" class="nav-item' + (active ? ' active' : '') + '"' + (active ? ' aria-current="page"' : '') + '>' + icon(n.icon) + '<span>' + n.label + '</span>' + count + '</a>';
    }
    return '<aside class="sidebar"><a href="#/overview" class="logo" aria-label="Onile home"><span class="mark">' + O.MARK + '</span><span class="logo-name">Onile</span></a>' +
      '<nav class="nav" aria-label="Main">' +
      '<div class="nav-group"><div class="nav-label">OPERATIONS</div>' + groups[0].map(item).join('') + '</div>' +
      '<div class="nav-group"><div class="nav-label">MONEY</div>' + groups[1].map(item).join('') + '</div></nav>' +
      '<div class="side-foot"><a href="#/settings" class="nav-item' + (page === 'settings' ? ' active' : '') + '">' + icon('settings') + '<span>Settings</span></a>' +
      '<button type="button" class="user" data-act="user-menu"><span class="avatar">' + role.initials + '</span><span class="user-text"><span class="strong">' + role.user + '</span><span class="muted sm">' + role.label + ' · 18 units</span></span>' + icon('chevron-down', 16) + '</button></div></aside>';
  }
  function topbar() {
    return '<header class="topbar"><label class="search">' + icon('search') + '<input type="search" placeholder="Search units, guests, bookings" data-enter="global-search"><span class="sr">Search units, guests, bookings</span></label><span class="date">Thursday, 17 December</span><button type="button" class="icon-btn" data-act="bell" aria-label="Notifications">' + icon('bell') + '</button></header>';
  }
  function mobileTop() {
    return '<header class="m-top"><span class="mark">' + O.MARK + '</span><span class="logo-name">Onile</span><button type="button" class="icon-btn" data-act="bell" aria-label="Notifications">' + icon('bell') + '</button></header>';
  }
  function mobileTabs(page) {
    var role = O.role();
    var four = role.key === 'accountant' ? ['overview', 'bookings', 'payments', 'statements'] : ['overview', 'bookings', 'payments', 'maintenance'];
    var label = { maintenance: 'Tasks' };
    var inFour = four.indexOf(page) > -1 || (page === 'booking' && true);
    return '<nav class="m-tabs" aria-label="Main">' + four.map(function (k) {
      var on = page === k || (page === 'booking' && k === 'bookings');
      return '<a href="#/' + k + '" class="m-tab' + (on ? ' on' : '') + '">' + icon(O.NAV[k].icon) + '<span>' + (label[k] || O.NAV[k].label) + '</span></a>';
    }).join('') + '<button type="button" class="m-tab' + (!inFour ? ' on' : '') + '" data-act="more">' + icon('more') + '<span>More</span></button></nav>';
  }

  O.route = function () {
    var parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    var page = parts[0] || 'overview', arg = parts.length > 1 ? decodeURIComponent(parts.slice(1).join('/')) : '';
    if (page === 'bookings' && arg) page = 'booking';
    return { page: page, arg: arg };
  };
  O.go = function (h) { if (location.hash === h) O.render(); else location.hash = h; };
  O.isMobile = function () { return window.matchMedia('(max-width: 760px)').matches; };
  O.PAGES = {};
  O.allowed = function (page) {
    var nav = O.role().nav;
    if (page === 'settings') return true;
    if (page === 'booking') return nav.indexOf('bookings') > -1;
    if (page === 'statements' && O.delegated('statements')) return true;
    return nav.indexOf(page) > -1;
  };

  O.render = function () {
    var r = O.route();
    var page = O.PAGES[r.page] ? r.page : 'overview';
    var body = O.allowed(page) ? O.PAGES[page](r.arg) : O.PAGES.hidden(page);
    var app = document.getElementById('app');
    var focusKey = document.activeElement && document.activeElement.getAttribute('data-input');
    if (O.isMobile()) {
      var mobileBody = (page === 'overview' && O.PAGES.mobileOverview && O.allowed(page)) ? '<main class="m-content">' + O.PAGES.mobileOverview() + '</main>' : body;
      app.innerHTML = mobileTop() + mobileBody + mobileTabs(page);
    } else {
      app.innerHTML = '<div class="shell">' + sidebar(page) + '<div class="main">' + topbar() + body + '</div></div>';
    }
    if (focusKey) { var el = app.querySelector('[data-input="' + focusKey + '"]'); if (el) { el.focus(); var v = el.value; el.value = ''; el.value = v; } }
    O.save();
    O.renderProto();
  };

  /* Prototype menu: a moderator aid, not part of Onile */
  O.protoOpen = false;
  O.renderProto = function () {
    var root = document.getElementById('proto');
    var role = O.S.role;
    var html = '<button type="button" id="proto-tab" data-act="proto-toggle" aria-expanded="' + O.protoOpen + '">' + icon('grid', 16) + 'Prototype</button>';
    if (O.protoOpen) {
      var pages = O.role().nav.concat(['settings']);
      html += '<div id="proto-panel" role="dialog" aria-label="Prototype menu"><div><div class="strong">Prototype menu</div><div class="muted sm">For the person running a test. It isn’t part of Onile.</div></div>' +
        '<div><h4>View as</h4><div class="proto-roles">' + ['owner', 'manager', 'accountant'].map(function (k) { return '<button type="button" class="' + (role === k ? 'on' : '') + '" data-act="set-role" data-arg="' + k + '">' + O.ROLES[k].label + '</button>'; }).join('') + '</div><div class="muted sm" style="margin-top:8px">' + O.ROLES[role].user + ' · ' + O.ROLES[role].label + '</div></div>' +
        '<div><h4>Go to</h4><div class="proto-links">' + pages.map(function (k) { return '<button type="button" data-go="#/' + k + '">' + (O.NAV[k] ? O.NAV[k].label : 'Settings') + '</button>'; }).join('') + '</div></div>' +
        '<div>' + O.btn('Reset demo data', { act: 'reset', icon: 'reset', block: true }) + '<div class="muted sm" style="margin-top:8px">Run before each tester. Confirmed payments, finished tasks and new bookings go back to the start.</div></div></div>';
    }
    root.innerHTML = html;
  };

  O.setRole = function (k) {
    if (!O.ROLES[k]) return;
    O.S.role = k; O.save(); O.closeOverlay(); O.closePop();
    var r = O.route();
    if (!O.allowed(r.page)) location.hash = '#/overview';
    O.render();
    O.toast('Now viewing as ' + O.ROLES[k].user + ' · ' + O.ROLES[k].label);
  };

  /* Events */
  O.ACTS = {
    'overlay-bg': function (a, el, e) { if (e.target === el) O.closeOverlay(); },
    close: function () { O.closeOverlay(); },
    reset: function () { O.reset(); },
    'proto-toggle': function () { O.protoOpen = !O.protoOpen; O.renderProto(); },
    'set-role': function (k) { O.setRole(k); },
    bell: function () { O.toast('No new notifications'); },
    soon: function (what) { O.soon(what); },
    'user-menu': function (a, el) {
      var html = '<div class="ph">Switch account · prototype</div>' + ['owner', 'manager', 'accountant'].map(function (k) {
        var R = O.ROLES[k];
        return '<button type="button" class="pi' + (O.S.role === k ? ' on' : '') + '" data-act="set-role" data-arg="' + k + '"><span class="avatar" style="width:28px;height:28px">' + R.initials + '</span><span class="stack"><span class="strong">' + R.user + '</span><span class="muted sm">' + R.label + '</span></span></button>';
      }).join('');
      O.openPop(html, el, 'above');
    },
    more: function () {
      var role = O.role();
      var rest = role.nav.filter(function (k) { return ['overview', 'bookings', 'payments', (role.key === 'accountant' ? 'statements' : 'maintenance')].indexOf(k) < 0; }).concat(['settings']);
      O.openOverlay('<div class="sheet" role="dialog" aria-label="More">' + rest.map(function (k) {
        return '<a href="#/' + k + '" class="nav-item" data-act="close">' + icon(O.NAV[k] ? O.NAV[k].icon : 'settings') + '<span>' + (O.NAV[k] ? O.NAV[k].label : 'Settings') + '</span></a>';
      }).join('') + '<button type="button" class="nav-item" data-act="user-sheet">' + icon('user') + '<span>Switch account · prototype</span></button></div>');
    },
    'user-sheet': function () {
      O.openOverlay('<div class="sheet" role="dialog" aria-label="Switch account">' + ['owner', 'manager', 'accountant'].map(function (k) {
        var R = O.ROLES[k];
        return '<button type="button" class="nav-item" data-act="set-role" data-arg="' + k + '"><span class="avatar" style="width:28px;height:28px">' + R.initials + '</span><span>' + R.user + ' · ' + R.label + '</span></button>';
      }).join('') + '</div>');
    }
  };

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act],[data-go]');
    var pop = document.getElementById('pop');
    if (pop && !e.target.closest('#pop') && !(el && el.dataset.act === 'user-menu')) O.closePop();
    if (!el) return;
    if (el.hasAttribute('disabled')) return;
    if (el.closest('#pop') && el.dataset.act !== undefined) O.closePop();
    if (el.dataset.go) { e.preventDefault(); O.closeOverlay(); O.go(el.dataset.go); return; }
    var fn = O.ACTS[el.dataset.act];
    if (fn) { if (el.tagName !== 'A') e.preventDefault(); fn(el.dataset.arg, el, e); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { O.closeOverlay(); O.closePop(); if (O.protoOpen) { O.protoOpen = false; O.renderProto(); } }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('tr') && e.target.getAttribute('role') === 'button') { e.preventDefault(); e.target.click(); }
    if (e.key === 'Enter' && e.target.dataset && e.target.dataset.enter) { var fn = O.ACTS[e.target.dataset.enter]; if (fn) fn(e.target.value, e.target, e); }
  });
  document.addEventListener('input', function (e) {
    var k = e.target.dataset && e.target.dataset.input;
    if (k) { O.S.ui[k] = e.target.value; if (k === 'unitQuery') O.S.ui.unitPage = 1; O.render(); }
  });
  window.addEventListener('hashchange', function () { O.closeOverlay(); O.closePop(); O.render(); window.scrollTo(0, 0); });
  var wasMobile = null;
  window.addEventListener('resize', function () { var m = O.isMobile(); if (m !== wasMobile) { wasMobile = m; O.render(); } });
  O.start = function () { wasMobile = O.isMobile(); O.render(); };
})();
