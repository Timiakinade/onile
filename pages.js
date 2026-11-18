/* Onile prototype: screens. Layouts follow the Onile Figma file. */
(function () {
  'use strict';
  var O = window.O, S = function () { return O.S; };
  var esc = O.esc, fmt = O.fmt;

  function wrap(html) { return '<div class="content">' + html + '</div>'; }
  function shortName(n) { var p = n.split(' '); return p[0] + (p[1] ? ' ' + p[1][0] + '.' : ''); }
  function bk(id) { return '#/bookings/' + encodeURIComponent(id); }
  var WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  function wd(d) { return WD[(d - 15 + 2 + 7) % 7]; }
  function checkinTime(unit) { return { 'Ikoyi 4A': '2:00 pm', 'VI 1C': '4:00 pm' }[unit] || '3:00 pm'; }
  O.wd = wd; O.shortName = shortName; O.bkLink = bk;

  /* Shared overview blocks */
  function unitStatus() {
    var order = [['Occupied', '#2E90FA'], ['Ready', '#12B76A'], ['Cleaning', '#F79009'], ['Maintenance', '#98A2B3'], ['Blocked', '#D0D5DD']];
    var c = {}; S().units.forEach(function (u) { c[u.status] = (c[u.status] || 0) + 1; });
    var bar = order.filter(function (o) { return c[o[0]]; }).map(function (o) { return '<span style="flex:' + c[o[0]] + ';background:' + o[1] + '"></span>'; }).join('');
    var leg = order.map(function (o) { return '<button type="button" class="li" data-act="unit-filter" data-arg="' + o[0] + '"><span class="ld" style="background:' + o[1] + '"></span><span>' + o[0] + '</span><span class="strong">' + (c[o[0]] || 0) + '</span></button>'; }).join('');
    return O.panel('Unit status', O.meta('18 units'), '<div class="panel-body"><div class="dist" role="img" aria-label="Unit status split">' + bar + '</div><div class="legend">' + leg + '</div></div>');
  }
  function ikoyiReady() { return O.task('t2').status === 'Done'; }
  function todayRows(manager) {
    var ik = ikoyiReady(), lk = O.task('t3').status === 'Done';
    var david = S().waiting.some(function (p) { return p.id === 'p4'; });
    return [
      { time: '10:00 am', title: 'Check out · Tunde Bakare', sub: manager ? 'Ikoyi 4A · deposit inspection due' : 'Ikoyi 4A · 4 nights · deposit inspection due', chip: ik ? ['Ready', 'positive'] : ['Cleaning', 'warning'], go: bk('BK 1036') },
      { time: '11:00 am', title: 'Check out · Kemi Adeyemi', sub: manager ? 'Lekki 5A' : 'Lekki 5A · 2 nights', chip: lk ? ['Ready', 'positive'] : ['Cleaning', 'warning'], go: bk('BK 1040') },
      { time: '12:00 pm', title: 'Check out · Femi Ola', sub: manager ? 'Yaba 3' : 'Yaba 3 · 5 nights', chip: ['Ready', 'positive'], go: bk('BK 1035') },
      { time: '2:00 pm', title: 'Check in · Chiamaka Eze', sub: manager ? 'Ikoyi 4A · 3 nights' : 'Ikoyi 4A · 3 nights · paid in full', chip: ik ? ['Ready', 'positive'] : ['Not ready', 'critical'], go: bk('BK 1044') },
      { time: '3:00 pm', title: 'Check in · Adaeze Okafor', sub: manager ? 'Lekki 2B · 3 nights' : 'Lekki 2B · 3 nights · paid in full', chip: ['Ready', 'positive'], go: bk('BK 1042') },
      { time: '4:00 pm', title: 'Check in · David Mensah', sub: manager ? 'VI 1C · 2 nights' : (david ? 'VI 1C · 2 nights · transfer waiting' : 'VI 1C · 2 nights · ₦ 50,000 balance'), chip: ['Ready', 'positive'], go: bk('BK 1045') }
    ];
  }
  function todayPanel(manager) {
    return O.panel('Today', O.meta('3 check outs · 3 check ins'), '<div class="rows">' + todayRows(manager).map(function (r) {
      return O.listRow({ time: r.time, title: r.title, sub: r.sub, right: O.chip(r.chip[0], r.chip[1]), go: r.go });
    }).join('') + '</div>');
  }
  function depositsDue() { return S().deposits.filter(function (d) { return d.state === 'due' || d.state === 'requested'; }); }
  function depositsApproved() { return S().deposits.filter(function (d) { return d.state === 'approved'; }); }
  function sum(list, k) { return list.reduce(function (a, x) { return a + (x[k] || 0); }, 0); }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }
  function waitingTitle(tail) { var n = S().waiting.length; return plural(n, 'transfer', 'transfers') + ' waiting ' + tail; }
  O.alerts = function (role) {
    var a = [], w = S().waiting, t1 = O.task('t1'), dd = depositsDue();
    if (role === 'accountant') {
      var p1 = w.find(function (p) { return p.id === 'p1'; });
      if (p1) a.push({ tone: 'critical', title: 'Bola Kareem’s transfer is 26 hours old', sub: 'Part payment · ₦ 181,000 due before 22 Dec', link: 'Confirm', act: 'confirm', arg: 'p1' });
      else if (w.length) a.push({ tone: 'warning', title: waitingTitle('for confirmation'), sub: fmt(O.waitingSum()) + ' · oldest ' + w[0].age, link: 'Open queue', go: '#/payments' });
      var ap = depositsApproved();
      if (ap.length) a.push({ tone: 'warning', title: plural(ap.length, 'refund', 'refunds') + ' approved, not yet sent', sub: fmt(sum(ap, 'amount')) + ' · ' + ap.map(function (d) { return d.guest; }).join(', '), link: 'Record', go: '#/deposits' });
      var ex = S().expenses.filter(function (e) { return e.status === 'Waiting approval'; });
      if (ex.length) a.push({ tone: 'warning', title: plural(ex.length, 'expense receipt', 'expense receipts') + ' waiting for the manager', sub: fmt(sum(ex, 'amount')) + ' · will reduce unit profit', link: 'View', act: 'note', arg: 'Tola approves staff receipts. Approved ones reduce unit profit on Finance.' });
      var drafts = O.statementKeys.filter(function (k) { return S().landlords[k].status === 'Draft'; }).length;
      if (drafts) a.push({ tone: 'info', title: plural(drafts, 'statement', 'statements') + ' still in draft', sub: 'Send to landlords by 5 January', link: 'Review', go: '#/statements' });
      return a;
    }
    if (!ikoyiReady()) a.push({ tone: 'critical', title: 'Ikoyi 4A not ready for 2:00 pm check in', sub: 'Cleaning task still open', link: 'Assign', act: 'task', arg: 't2' });
    if (w.length) a.push(role === 'manager'
      ? { tone: 'warning', title: waitingTitle('for the accountant'), sub: 'Oldest ' + w[0].age + ' · you can record, not confirm', link: 'View', go: '#/payments' }
      : { tone: 'warning', title: waitingTitle('for confirmation'), sub: fmt(O.waitingSum()) + ' · oldest ' + w[0].age, link: 'Open queue', go: '#/payments' });
    if (dd.length) a.push(role === 'manager'
      ? { tone: 'warning', title: plural(dd.length, 'caution deposit', 'caution deposits') + ' due back today', sub: dd.some(function (d) { return d.state === 'requested'; }) ? 'Return requested · waiting for the owner' : 'Add inspection notes, then request return', link: 'Request', go: '#/deposits' }
      : { tone: 'warning', title: plural(dd.length, 'caution deposit', 'caution deposits') + ' due back today', sub: fmt(sum(dd, 'amount')) + ' · inspection notes added', link: 'Review', go: '#/deposits' });
    if (t1.status !== 'Done') a.push({ tone: 'critical', title: 'Generator service overdue at Lekki 5A', sub: 'Due 24 November · assigned to ' + t1.who, link: 'View task', act: 'task', arg: 't1' });
    return a;
  };
  function attention(role, mobile) {
    var a = O.alerts(role);
    var body = a.length ? '<div class="rows">' + a.map(function (x) {
      if (mobile) x = Object.assign({}, x, { link: { 'Open queue': 'Open', 'View task': 'View' }[x.link] || x.link });
      return O.alertRow(x);
    }).join('') + '</div>' : '<div class="empty">Nothing needs you right now</div>';
    return O.panel('Needs attention', a.length ? O.chip(a.length + ' open', 'critical', false) : O.chip('All clear', 'positive', false), body);
  }

  /* Overview */
  O.PAGES.overview = function () {
    var r = S().role;
    if (r === 'manager') return overviewManager();
    if (r === 'accountant') return overviewAccountant();
    var w = S().waiting;
    var head = O.pageHead('Overview', '18 units across Lekki, Ikoyi, Victoria Island and Yaba', O.btn('Export', { icon: 'download', act: 'soon', arg: 'Export' }) + O.btn('Add booking', { style: 'primary', icon: 'plus', act: 'add-booking' }));
    var kpis = '<div class="kpis">' + O.kpi('Revenue this month', fmt(O.revenueMonth()), 'vs November', '12%') + O.kpi('Occupancy tonight', '78%', '14 of 18 units', '6%') +
      O.kpi('Waiting confirmation', fmt(O.waitingSum()), w.length ? plural(w.length, 'transfer', 'transfers') + ' · oldest ' + w[0].age : 'Nothing waiting') + O.kpi('Deposits held', fmt(S().heldNow), 'Kept out of profit') + '</div>';
    var payouts = O.panel('Landlord payouts', O.meta('December'), '<div class="rows">' + O.statementKeys.map(function (k) {
      var st = O.statement(k);
      return O.listRow({ title: st.L.name + ' · ' + plural(st.rows.length, 'unit', 'units'), sub: fmt(st.t.due), right: O.chip(st.L.status, st.L.status === 'Sent' ? 'positive' : 'warning'), go: '#/statements/' + k });
    }).join('') + '</div>');
    return wrap(head + kpis + '<div class="cols"><div class="col-main">' + unitStatus() + todayPanel(false) + '</div><div class="col-side">' + attention('owner') + payouts + '</div></div>');
  };
  function overviewManager() {
    var open = S().tasks.filter(function (t) { return t.status !== 'Done'; }), overdue = open.filter(function (t) { return t.status === 'Overdue'; }).length;
    var cleans = ['t2', 't3', 't4'].map(O.task);
    var inprog = cleans.filter(function (t) { return t.status !== 'Done'; }).length;
    var head = O.pageHead('Overview', 'Operations · 18 units across Lekki, Ikoyi, Victoria Island and Yaba', O.btn('Log expense', { act: 'log-expense' }) + O.btn('Add booking', { style: 'primary', icon: 'plus', act: 'add-booking' }));
    var kpis = '<div class="kpis">' + O.kpi('Occupancy tonight', '78%', '14 of 18 units', '6%') + O.kpi('Check ins today', '3', ikoyiReady() ? 'All units ready' : '1 unit not ready') +
      O.kpi('Check outs today', '3', inprog ? plural(inprog, 'clean', 'cleans') + ' in progress' : 'All cleans done') + O.kpi('Open tasks', String(open.length), overdue ? overdue + ' overdue' : 'None overdue') + '</div>';
    var cleaning = O.panel('Cleaning today', O.meta('3 turnovers'), '<div class="rows">' + cleans.map(function (t) {
      var sub = { t2: 'Due 1:30 pm · next guest 2:00 pm', t3: 'Due 2:00 pm · guest left 11:00 am', t4: 'Done 12:40 pm · next guest 21 Dec' }[t.id];
      if (t.status === 'Done' && t.id !== 't4') sub = 'Done today · unit ready';
      return O.listRow({ title: t.unit + ' · ' + t.who, sub: sub, right: O.chip(t.status, O.taskTone(t.status)), act: 'task', arg: t.id });
    }).join('') + '</div>');
    return wrap(head + kpis + '<div class="cols"><div class="col-main">' + unitStatus() + todayPanel(true) + '</div><div class="col-side">' + attention('manager') + cleaning + '</div></div>');
  }
  function areaRevenue() {
    var base = { 'Lekki Phase 1': 3780000, 'Ikoyi': 2880000, 'Victoria Island': 1240000, 'Yaba': 520000 };
    Object.keys(S().extra).forEach(function (u) { var unit = O.unit(u); if (unit) base[unit.area] += S().extra[u]; });
    return base;
  }
  function overviewAccountant() {
    var w = S().waiting, ap = depositsApproved();
    var due = O.statementKeys.reduce(function (a, k) { return a + O.statement(k).t.due; }, 0);
    var head = O.pageHead('Overview', 'Money · December 2026 · 18 units', O.btn('Export', { icon: 'download', act: 'soon', arg: 'Export' }) + O.btn('Open queue', { style: 'primary', icon: 'payments', go: '#/payments' }));
    var kpis = '<div class="kpis">' + O.kpi('Revenue this month', fmt(O.revenueMonth()), 'vs November', '12%') +
      O.kpi('Waiting confirmation', fmt(O.waitingSum()), w.length ? plural(w.length, 'transfer', 'transfers') + ' · oldest ' + w[0].age : 'Nothing waiting') +
      O.kpi('Deposits held', fmt(S().heldNow), ap.length ? plural(ap.length, 'refund', 'refunds') + ' to send' : 'Kept out of profit') +
      O.kpi('Due to landlords', fmt(due), '3 statements · by 5 January') + '</div>';
    var queue = O.panel('Waiting confirmation', '<a class="panel-meta link" href="#/payments">Open queue</a>', w.length ? '<div class="rows">' + w.map(function (p) {
      var part = p.amount < p.total - (O.booking(p.booking) ? O.booking(p.booking).paid : 0) ? ' · part payment' : '';
      return O.listRow({ title: p.guest + ' · ' + fmt(p.amount), sub: p.unit + ' · ' + p.bankShort + ' ' + p.ref + part, right: '<span class="muted">' + esc(p.age) + '</span>', act: 'confirm', arg: p.id });
    }).join('') + '</div>' : '<div class="empty">Every transfer is confirmed</div>');
    var statements = O.panel('Landlord statements', O.meta('December · due 5 January'), '<div class="rows">' + O.statementKeys.map(function (k) {
      var st = O.statement(k);
      var sub = plural(st.rows.length, 'unit', 'units') + ' · ' + (st.L.status === 'Sent' ? 'sent 16 Dec at owner’s request' : (st.waiting ? plural(st.waiting, 'transfer', 'transfers') + ' waiting' : 'reconciled'));
      return O.listRow({ title: st.L.name + ' · ' + fmt(st.t.due), sub: sub, right: O.chip(st.L.status, st.L.status === 'Sent' ? 'positive' : 'warning'), go: '#/statements/' + k });
    }).join('') + '</div>');
    var ar = areaRevenue(), max = Math.max.apply(null, Object.keys(ar).map(function (k) { return ar[k]; }));
    var areas = O.panel('Revenue by area', O.meta('December'), '<div class="rows">' + Object.keys(ar).map(function (k) {
      return '<div style="padding:12px 20px;display:flex;flex-direction:column;gap:8px"><div style="display:flex;gap:12px"><span style="flex:1">' + (k === 'Lekki Phase 1' ? 'Lekki' : k) + '</span><span class="strong">' + fmt(ar[k]) + '</span></div><div style="height:6px;background:#F2F4F7;border-radius:3px;overflow:hidden"><div style="height:6px;background:#175CD3;border-radius:3px;width:' + Math.round(ar[k] / max * 100) + '%"></div></div></div>';
    }).join('') + '</div>');
    return wrap(head + kpis + '<div class="cols"><div class="col-main">' + queue + statements + '</div><div class="col-side">' + attention('accountant') + areas + '</div></div>');
  }
  O.PAGES.mobileOverview = function () {
    var role = S().role, w = S().waiting, k;
    if (role === 'manager') k = [['Occupancy', '78%', '14 of 18', '6%'], ['Check ins', '3', ikoyiReady() ? 'All ready' : '1 not ready'], ['Check outs', '3', 'Today'], ['Open tasks', String(S().tasks.filter(function (t) { return t.status !== 'Done'; }).length), '1 overdue']];
    else if (role === 'accountant') k = [['Revenue this month', O.short(O.revenueMonth()), 'vs Nov', '12%'], ['Waiting', O.short(O.waitingSum()), plural(w.length, 'transfer', 'transfers')], ['Deposits held', O.short(S().heldNow), 'Not profit'], ['Due to landlords', O.short(O.statementKeys.reduce(function (a, x) { return a + O.statement(x).t.due; }, 0)), 'By 5 Jan']];
    else k = [['Revenue this month', O.short(O.revenueMonth()), 'vs Nov', '12%'], ['Occupancy', '78%', '14 of 18', '6%'], ['Waiting', O.short(O.waitingSum()), plural(w.length, 'transfer', 'transfers')], ['Deposits held', O.short(S().heldNow), 'Not profit']];
    var rows = todayRows(role === 'manager').filter(function (r, i) { return [0, 1, 3, 4].indexOf(i) > -1; }).map(function (r) {
      return O.listRow({ time: r.time, title: r.title.replace('Check out', 'Out').replace('Check in', 'In'), sub: r.sub.split(' · ').slice(0, 1).concat(r.sub.indexOf('paid') > -1 ? ['paid'] : []).join(' · '), right: O.chip(r.chip[0], r.chip[1]), go: r.go });
    }).join('');
    return '<div class="titles"><h1 class="page-title">Overview</h1><p class="page-sub">Thursday, 17 December · 18 units</p></div>' +
      '<div class="m-kpis">' + k.map(function (x) { return O.kpi(x[0], x[1], x[2], x[3]); }).join('') + '</div>' +
      attention(role, true) + O.panel('Today', O.meta('6 movements'), '<div class="rows">' + rows + '</div>') +
      '<p class="muted sm">Showing 4 of 6. Open <a class="link" href="#/bookings">Bookings</a> for the full list.</p>';
  };

  /* Bookings */
  function barHtml(b, extra, clash) {
    var x0 = Math.max(b.s - 15 + 0.5, 0), x1 = Math.min(b.e - 15 + 0.5, 14);
    var pad = '';
    if (clash && b.type !== 'clash' && clash.s <= b.s && clash.e > b.s) pad = ';padding-left:calc((100% - 158px) * ' + ((Math.min(clash.e, b.e) - b.s) / 14).toFixed(5) + ' + 8px)';
    if (x1 <= 0 || x0 >= 14) return '';
    var n = b.e - b.s, label, cls = 'b-' + b.type, act = '';
    if (b.type === 'confirmed') { label = shortName(b.guest) + ' · ' + plural(n, 'night', 'nights'); act = ' data-go="' + bk(b.id) + '"'; }
    else if (b.type === 'tentative') { label = shortName(b.guest) + ' · hold 24h'; act = ' data-go="' + bk(b.id) + '"'; }
    else if (b.type === 'cleaning' || b.type === 'maintenance') { label = b.label; act = ' data-act="task" data-arg="' + b.task + '"'; }
    else if (b.type === 'clash') { label = 'Clash'; act = ' data-act="clash-edit"'; }
    else { label = b.label; act = ' data-act="soon" data-arg="Editing an owner stay"'; }
    var style = 'left:calc(158px + (100% - 158px) * ' + (x0 / 14).toFixed(5) + ' + 2px);width:calc((100% - 158px) * ' + ((x1 - x0) / 14).toFixed(5) + ' - 4px)' + pad;
    return '<button type="button" class="bar ' + cls + (extra || '') + '" style="' + style + '"' + act + ' title="' + esc(label) + '">' + (b.type === 'clash' ? icon('alert', 16) : '') + '<span>' + esc(label) + '</span></button>';
  }
  function dayCls(d) { return d === 17 ? ' today' : ((wd(d) === 'Sat' || wd(d) === 'Sun') ? ' we' : ''); }
  function calendar() {
    var days = []; for (var d = 15; d <= 28; d++) days.push(d);
    var cells = function () { return days.map(function (d) { return '<div class="day' + dayCls(d) + '"></div>'; }).join(''); };
    var head = '<div class="cal-row head"><div class="cal-unit">Unit</div>' + days.map(function (d) { return '<div class="day' + dayCls(d) + '"><span class="wd">' + wd(d) + '</span><span class="dn">' + d + '</span></div>'; }).join('') + '</div>';
    var season = '<div class="cal-row season"><div class="cal-unit">Season</div>' + days.map(function () { return '<div class="day"></div>'; }).join('') +
      '<div class="flag" style="left:calc(158px + (100% - 158px) * ' + (5 / 14).toFixed(5) + ');right:0">Peak season from 20 Dec · nightly rates +30% · 3 night minimum</div></div>';
    var rows = S().calendarUnits.map(function (name) {
      var c = S().clash && S().clash.unit === name ? S().clash : null;
      var u = O.unit(name), bars = S().bookings.filter(function (b) { return b.unit === name; }).map(function (b) { return barHtml(b, '', c); }).join('');
      if (S().clash && S().clash.unit === name) bars += barHtml({ type: 'clash', s: S().clash.s, e: S().clash.e });
      return '<div class="cal-row"><div class="cal-unit"><span class="strong">' + esc(name) + '</span><span class="muted sm">' + esc(u.beds) + '</span></div>' + cells() + bars + '</div>';
    }).join('');
    return '<div class="cal"><div class="table-scroll"><div class="cal-inner">' + head + season + rows + '</div></div></div>';
  }
  function bookingList() {
    var list = S().bookings.filter(function (b) { return b.guest; }).sort(function (a, b) { return a.s - b.s; });
    return O.table('minmax(0,1fr) 120px 180px 140px 140px', ['Guest', 'Unit', 'Dates', 'Amount', 'Status'], list.map(function (b) {
      var n = b.e - b.s;
      return { go: bk(b.id), cells: ['<span class="strong">' + esc(b.guest) + '</span><span class="muted"> · ' + esc(b.id) + '</span>', esc(b.unit), b.s + ' to ' + b.e + ' Dec · ' + plural(n, 'night', 'nights'), fmt(b.total), b.type === 'tentative' ? O.chip('Hold 24h', 'warning') : O.chip('Confirmed', 'positive')] };
    }));
  }
  O.PAGES.bookings = function () {
    var acc = S().role === 'accountant', view = S().ui.bookView;
    var head = O.pageHead('Bookings', '18 units · 15 to 28 December' + (acc ? ' · view only' : ''), O.btn('Export', { icon: 'download', act: 'soon', arg: 'Export' }) + (acc ? O.chip('View only', 'neutral', false) : O.btn('Add booking', { style: 'primary', icon: 'plus', act: 'add-booking' })));
    var tb = '<div class="toolbar">' + O.seg([{ key: 'list', label: 'List' }, { key: 'calendar', label: 'Calendar' }], view, 'book-view') +
      '<div style="display:flex;align-items:center;gap:8px"><button type="button" class="icon-btn" data-act="soon" data-arg="Earlier dates" aria-label="Earlier dates">' + icon('chevron-left') + '</button><span class="strong" style="padding:0 8px">15 to 28 Dec 2026</span><button type="button" class="icon-btn" data-act="soon" data-arg="Later dates" aria-label="Later dates">' + icon('chevron-right') + '</button></div>' +
      '<span class="spacer"></span>' + O.toolbarSearch('Search guest or unit', 'bookQuery') + O.btn('Filters', { icon: 'filter', act: 'soon', arg: 'Filters' }) + '</div>';
    var c = S().clash, banner = '';
    if (c && !acc) banner = O.banner('crit', 'alert', 'Save blocked: ' + c.unit + ' already has ' + c.other + ' from ' + c.from + ' Dec', c.guest + '’s new booking for ' + c.s + ' to ' + c.e + ' Dec overlaps that stay. Move the new booking or pick another unit.', O.btn('Pick another unit', { act: 'clash-edit', arg: 'unit' }) + O.btn('Move booking', { style: 'primary', act: 'clash-edit', arg: 'dates' }));
    var legend = '<div class="cal-legend">' + [['b-confirmed', 'Confirmed'], ['b-tentative', 'Tentative hold'], ['b-cleaning', 'Cleaning'], ['b-maintenance', 'Maintenance'], ['b-blocked', 'Blocked'], ['b-clash', 'Clash, save blocked']].map(function (x) { return '<span class="li"><span class="sw bar ' + x[0] + '" style="position:static;padding:0"></span>' + x[1] + '</span>'; }).join('') + '<span class="muted">Bars start and end at midday for check in and check out.</span></div>';
    var q = (S().ui.bookQuery || '').trim().toLowerCase();
    var body = view === 'list' ? bookingList() : calendar() + legend;
    if (q) {
      var hits = S().bookings.filter(function (b) { return b.guest && (b.guest.toLowerCase().indexOf(q) > -1 || b.unit.toLowerCase().indexOf(q) > -1); });
      body = O.table('minmax(0,1fr) 120px 180px 140px 140px', ['Guest', 'Unit', 'Dates', 'Amount', 'Status'], hits.map(function (b) {
        return { go: bk(b.id), cells: ['<span class="strong">' + esc(b.guest) + '</span><span class="muted"> · ' + esc(b.id) + '</span>', esc(b.unit), b.s + ' to ' + b.e + ' Dec', fmt(b.total), b.type === 'tentative' ? O.chip('Hold 24h', 'warning') : O.chip('Confirmed', 'positive')] };
      }), { empty: 'No bookings match “' + q + '”' });
    }
    return wrap(head + tb + banner + body);
  };
  O.PAGES.booking = function (id) {
    var b = O.booking(id);
    if (!b || !b.guest) return wrap(O.pageHead('Booking not found', 'It may have been removed.', O.btn('Back to bookings', { go: '#/bookings' })));
    var u = O.unit(b.unit), n = b.e - b.s, rate = Math.round(b.total / n);
    var waits = S().waiting.filter(function (p) { return p.booking === b.id; });
    var conf = b.conf || [], confSum = sum(conf, 'amount'), base = b.paid - confSum;
    var crumb = '<div class="crumb"><a href="#/bookings">Bookings</a><span class="sep">/</span><span class="muted">' + esc(b.id) + '</span></div>';
    var acts = (O.can('book') ? O.btn('Cancel booking', { act: 'soon', arg: 'Cancelling a booking' }) : '') + (O.can('record') ? O.btn('Record payment', { style: 'primary', act: 'record', arg: b.id }) : '');
    var head = O.pageHead(b.guest + ' · ' + b.unit, 'Booking ' + esc(b.id) + ' · ' + b.s + ' to ' + b.e + ' December · ' + plural(n, 'night', 'nights'), acts);
    var timing = b.s === 17 ? O.chip('Checks in today ' + checkinTime(b.unit), 'info') : b.e === 17 ? O.chip('Checked out today', 'neutral') : b.s > 17 ? O.chip('Arrives ' + b.s + ' Dec', 'info') : O.chip('In stay', 'info');
    var pay = waits.length ? O.chip('Transfer waiting', 'warning') : b.paid >= b.total ? O.chip('Paid in full', 'positive') : b.paid > 0 ? O.chip('Part paid · ' + fmt(b.total - b.paid) + ' balance', 'warning') : O.chip('Not paid yet', 'critical');
    var chips = '<div style="display:flex;gap:8px;flex-wrap:wrap">' + (b.type === 'tentative' ? O.chip('Hold 24h', 'warning') : O.chip('Confirmed', 'positive')) + timing + pay + '</div>';
    var stay = O.panel('Stay', '<button type="button" class="panel-meta link" data-act="soon" data-arg="Editing a stay">Edit</button>', '<div class="rows">' +
      O.kv('Check in', wd(b.s) + ' ' + b.s + ' Dec · ' + checkinTime(b.unit)) + O.kv('Check out', wd(b.e) + ' ' + b.e + ' Dec · 12:00 pm') + O.kv('Guests', '2 adults') + O.kv('Booked through', esc(b.source || 'WhatsApp')) +
      O.kv('Nightly rate', fmt(rate) + ' × ' + plural(n, 'night', 'nights')) + O.kv('Booking total', fmt(b.total)) + '</div>');
    var prow = [];
    if (base > 0) prow.push(O.kv('Booking payment', fmt(base), 'Bank transfer' + (b.ref ? ' · GTBank · ref ' + b.ref : '') + ' · confirmed by ' + (b.confirmedBy || 'Omoakin'), O.chip('Manually confirmed', 'positive')));
    conf.forEach(function (c) { prow.push(O.kv(c.amount < b.total ? 'Part payment' : 'Booking payment', fmt(c.amount), c.bank + ' · ref ' + c.ref + ' · confirmed by ' + c.by + ' today', O.chip('Manually confirmed', 'positive'))); });
    waits.forEach(function (p) { prow.push(O.kv('Transfer waiting', fmt(p.amount), p.bank + ' · ref ' + p.ref + ' · sent ' + p.sentShort, O.chip('Waiting', 'warning'))); });
    if (b.deposit) prow.push(O.kv('Caution deposit', fmt(b.deposit), 'Kept out of revenue · refund after inspection on ' + b.e + ' Dec', O.chip('Held', 'neutral')));
    if (!prow.length) prow.push('<div class="note">No payments yet.</div>');
    var payments = O.panel('Payments', O.meta(fmt(b.paid + (b.deposit || 0)) + ' received'), '<div class="rows">' + prow.join('') + '</div>');
    var acts2 = b.id === 'BK 1042' ? [['Housekeeper marked unit ready', 'Today · 11:40 am · Blessing', 'Unit'], ['Deposit received', '14 Dec · 9:20 am · ₦ 50,000', 'Deposit'], ['Payment confirmed against bank app', '14 Dec · 9:12 am · Omoakin', 'Payment'], ['Booking created', '12 Dec · 6:05 pm · Omoakin', 'Booking']]
      : conf.map(function (c) { return ['Payment confirmed against bank app', 'Today · ' + c.by, 'Payment']; }).concat(waits.map(function (p) { return ['Transfer recorded', p.sent, 'Payment']; })).concat([['Booking created', (b.s - 6 > 0 ? b.s - 6 : 1) + ' Dec · 6:05 pm · Omoakin', 'Booking']]);
    var activity = O.panel('Activity', '', '<div class="rows">' + acts2.map(function (a) { return O.listRow({ title: a[0], sub: a[1], right: O.chip(a[2], 'neutral', false) }); }).join('') + '</div>');
    var first = b.guest.split(' ')[0].toLowerCase();
    var guest = O.panel('Guest', O.meta(b.stays || '1st stay'), '<div class="rows">' + O.kv('Name', esc(b.guest)) + O.kv('Phone', esc(b.phone || '+234 80' + (3 + b.s % 6) + ' 555 01' + (10 + b.s))) + O.kv('Email', esc(b.email || first + '@mail.com')) + O.kv('ID check', null, null, b.type === 'tentative' ? O.chip('Not checked', 'neutral') : O.chip('Verified', 'positive')) + '</div>');
    var unitP = O.panel('Unit', O.chip(u.status, O.statusTone(u.status)), '<div class="rows">' + O.kv('Unit', esc(u.name + ' · ' + u.beds)) + O.kv('Landlord', esc(S().landlords[u.landlord].name)) + O.kv('Housekeeper', esc(u.keeper)) + O.kv('Access code', b.s === 17 ? 'Shared at 2:00 pm' : b.s > 17 ? 'Sent on arrival day' : 'Changed after check out') + '</div>');
    return wrap(crumb + head + chips + '<div class="cols"><div class="col-main">' + stay + payments + activity + '</div><div class="col-side">' + guest + unitP + '</div></div>');
  };

  /* Units */
  O.PAGES.units = function () {
    var role = S().role, ui = S().ui;
    var sub = role === 'manager' ? '18 units · you can edit details and block dates. Adding units is owner only.' : '18 units · 4 areas · 5 landlords' + (role === 'accountant' ? ' · view only' : '');
    var right = role === 'owner' ? O.btn('Add unit', { style: 'primary', icon: 'plus', act: 'soon', arg: 'Adding a unit' }) : role === 'accountant' ? O.chip('View only', 'neutral', false) : '';
    var head = O.pageHead('Units', sub, O.btn('Export', { icon: 'download', act: 'soon', arg: 'Export' }) + right);
    var counts = { All: S().units.length };
    S().units.forEach(function (u) { counts[u.status] = (counts[u.status] || 0) + 1; });
    var tabs = ['All', 'Occupied', 'Ready', 'Cleaning', 'Maintenance', 'Blocked'].map(function (k) { return { key: k, label: k, n: counts[k] || 0 }; });
    var q = (ui.unitQuery || '').trim().toLowerCase();
    var list = S().units.filter(function (u) {
      if (ui.unitTab !== 'All' && u.status !== ui.unitTab) return false;
      if (q && (u.name + ' ' + S().landlords[u.landlord].name + ' ' + u.area).toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
    var pages = Math.max(1, Math.ceil(list.length / 10)), page = Math.min(ui.unitPage, pages), shown = list.slice((page - 1) * 10, page * 10);
    var foot = '<div class="pager"><span class="muted">Showing ' + shown.length + ' of ' + plural(list.length, 'unit', 'units') + '</span>' + O.btn('Previous', { act: 'unit-page', arg: '-1', disabled: page <= 1 }) + O.btn('Next', { act: 'unit-page', arg: '1', disabled: page >= pages }) + '</div>';
    var table = O.table('minmax(0,1fr) 150px 150px 130px 130px 40px', ['Unit', 'Area', 'Next check in', 'Nightly rate', 'Status', ''], shown.map(function (u) {
      return { act: 'unit', arg: u.name, cells: ['<span class="strong">' + esc(u.name) + '</span><span class="muted"> · ' + esc(u.beds) + ' · ' + esc(S().landlords[u.landlord].name) + '</span>', esc(u.area), esc(u.next), fmt(u.rate), O.chip(u.status, O.statusTone(u.status)), '<span class="menu">' + icon('more') + '</span>'] };
    }), { foot: foot, empty: 'No units match' });
    return wrap(head + '<div class="toolbar">' + O.seg(tabs, ui.unitTab, 'unit-tab') + '<span class="spacer"></span>' + O.toolbarSearch('Search units or landlords', 'unitQuery') + O.btn('Filters', { icon: 'filter', act: 'soon', arg: 'Filters' }) + '</div>' + table);
  };

  /* Payments */
  O.PAGES.payments = function () {
    var role = S().role, w = S().waiting, tab = S().ui.payTab, mgr = role === 'manager';
    var head = O.pageHead('Payments', mgr ? 'Record transfers as guests send them. The accountant confirms them.' : 'Check each transfer in your bank app before you confirm it', O.btn('Export', { icon: 'download', act: 'soon', arg: 'Export' }) + (O.can('record') ? O.btn('Record payment', { style: 'primary', icon: 'plus', act: 'record' }) : ''));
    var oldest = w[0];
    var kpis = '<div class="kpis three">' + O.kpi('Waiting confirmation', fmt(O.waitingSum()), plural(w.length, 'transfer', 'transfers')) +
      (mgr ? O.kpi('Recorded by you this week', String(S().recordedWeek), '3 today') : O.kpi('Confirmed this month', fmt(S().confirmedMonth), 'vs November', '9%')) +
      O.kpi('Oldest waiting', oldest ? oldest.age : 'None', oldest ? oldest.guest + ' · ' + oldest.unit : 'Every transfer is confirmed') + '</div>';
    var banner = mgr ? O.banner('info', 'info', 'You record payments. The accountant confirms them.', 'Record a transfer once the guest sends a receipt. It stays Waiting until the accountant or owner finds it in the bank app.')
      : O.banner('info', 'check', 'Confirmed payments get a Manually confirmed badge', 'Version 1 records transfers only. Gateway confirmation through your own Paystack account comes in version 1.5.');
    var tabs = O.seg([{ key: 'waiting', label: 'Waiting', n: w.length }, { key: 'confirmed', label: 'Confirmed', n: S().confirmedCount }, { key: 'all', label: 'All', n: w.length + S().confirmedCount }], tab, 'pay-tab');
    var cols = 'minmax(0,1fr) 120px 180px 130px 190px';
    var hd = ['Guest', 'Unit', 'Bank reference', 'Amount', 'Status'];
    var pq = (S().ui.payQuery || '').trim().toLowerCase();
    var match = function (x) { return !pq || (x.guest + ' ' + x.ref + ' ' + x.unit).toLowerCase().indexOf(pq) > -1; };
    var waitRows = w.filter(match).map(function (p) {
      return { act: 'confirm', arg: p.id, cells: ['<span class="strong">' + esc(p.guest) + '</span><span class="muted"> · ' + (p.by ? 'recorded by ' + esc(p.by) : 'sent ' + esc(p.sentShort)) + '</span>', esc(p.unit), esc(p.bankShort + ' · ' + p.ref), fmt(p.amount), O.chip(mgr ? 'Waiting for accountant' : 'Waiting', 'warning')] };
    });
    var confRows = S().confirmed.filter(match).map(function (c) {
      return { cells: ['<span class="strong">' + esc(c.guest) + '</span><span class="muted"> · confirmed by ' + esc(c.by) + '</span>', esc(c.unit), esc(c.bankShort + ' · ' + c.ref), fmt(c.amount), O.chip('Manually confirmed', 'positive')] };
    });
    var body;
    if (tab === 'confirmed') body = O.table(cols, hd, confRows, { foot: '<div class="pager"><span class="muted">Showing the ' + confRows.length + ' most recent of ' + S().confirmedCount + '</span></div>' });
    else if (tab === 'all') body = O.table(cols, hd, waitRows.concat(confRows));
    else body = O.table(cols, hd, waitRows, { empty: 'Every transfer is confirmed' }) + O.panel('Recently confirmed', O.meta('This week'), O.table(cols, hd, confRows).replace('class="table"', 'class="table" style="border:0;border-radius:0"'));
    return wrap(head + kpis + banner + '<div class="toolbar">' + tabs + '<span class="spacer"></span>' + O.toolbarSearch('Search guest or reference', 'payQuery') + O.btn('Filters', { icon: 'filter', act: 'soon', arg: 'Filters' }) + '</div>' + body);
  };

  /* Deposits */
  O.depChip = function (d) {
    var role = S().role;
    switch (d.state) {
      case 'due': return O.chip('Due back', 'warning');
      case 'requested': return O.chip('Return requested', 'info');
      case 'approved': return O.chip(role === 'accountant' ? 'Approved · send refund' : 'Approved', 'warning');
      case 'refunded': return O.chip('Refunded', 'positive');
      case 'inspection': return O.chip('Inspection', 'info');
      case 'deducted': return O.chip(fmt(d.deducted) + ' deducted', 'critical');
      default: return O.chip('Held', 'neutral');
    }
  };
  O.PAGES.deposits = function () {
    var role = S().role, dd = depositsDue(), ap = depositsApproved();
    var names = function (l) { return l.map(function (d) { return d.guest; }).join(' and '); };
    var sub = role === 'manager' ? 'Inspect, add notes and request returns. The owner approves refunds.' : 'Caution fees held for guests. Never counted as revenue.';
    var head = O.pageHead('Deposits', sub, O.btn('Export', { icon: 'download', act: 'soon', arg: 'Export' }) + (role === 'owner' ? O.btn('Record deposit', { style: 'primary', icon: 'plus', act: 'soon', arg: 'Recording a deposit' }) : ''));
    var refunded = S().deposits.filter(function (d) { return d.state === 'refunded' && d.session; }).length;
    var kpis = '<div class="kpis three">' + O.kpi('Held now', fmt(S().heldNow), plural(25 - refunded, 'guest', 'guests')) + O.kpi('Due back this week', '₦ 250,000', '5 guests · after inspection') + O.kpi('Deducted this month', '₦ 35,000', '1 damage claim · Yaba 3') + '</div>';
    var banner = '';
    var dueOnly = dd.filter(function (d) { return d.state === 'due'; }), req = dd.filter(function (d) { return d.state === 'requested'; });
    if (role === 'owner') {
      if (dd.length) banner = O.banner('warn', 'alert', plural(dd.length, 'refund is', 'refunds are') + ' due back today', req.length ? 'Tola requested returns for ' + names(req) + '. Check the inspection notes, then approve in full or in part.' : names(dd) + ' checked out. Add inspection notes, then refund in full or in part.', O.btn('Review refunds', { act: 'review-refunds' }));
      else if (ap.length) banner = O.banner('info', 'info', plural(ap.length, 'refund', 'refunds') + ' approved', 'Waiting for the accountant to send ' + (ap.length === 1 ? 'it' : 'them') + ' and record the bank reference.');
    } else if (role === 'manager') {
      if (dueOnly.length) banner = O.banner('warn', 'alert', plural(dueOnly.length, 'deposit is', 'deposits are') + ' due back today', 'Add inspection notes for ' + names(dueOnly) + ', then request a return.', O.btn('Request returns', { act: 'request-returns' }));
      else if (req.length) banner = O.banner('info', 'info', 'Return requested for ' + names(req), O.can('approveRefund') ? 'You can approve these while you have the owner’s access.' : 'The owner approves refunds. Nothing else to do here.', O.can('approveRefund') ? O.btn('Approve refunds', { act: 'review-refunds' }) : '');
    } else {
      if (ap.length) banner = O.banner('warn', 'alert', plural(ap.length, 'refund', 'refunds') + ' approved by the owner', 'Send the refunds to ' + names(ap) + ', then record them here.', O.btn('Record refunds', { act: 'record-refunds' }));
      else if (dd.length) banner = O.banner('info', 'info', plural(dd.length, 'refund is', 'refunds are') + ' waiting for the owner’s approval', 'You record refunds once the owner approves them.');
    }
    var tab = S().ui.depTab;
    var tabs = O.seg([{ key: 'All', label: 'All', n: 65 }, { key: 'Held', label: 'Held', n: 18 }, { key: 'Due back', label: 'Due back', n: 5 }, { key: 'Refunded', label: 'Refunded', n: 41 }, { key: 'Deducted', label: 'Deducted', n: 1 }], tab, 'dep-tab');
    var map = { Held: ['held'], 'Due back': ['due', 'requested', 'approved', 'inspection'], Refunded: ['refunded'], Deducted: ['deducted'] };
    var dq = (S().ui.depQuery || '').trim().toLowerCase();
    var rows = S().deposits.filter(function (d) { return (tab === 'All' || map[tab].indexOf(d.state) > -1) && (!dq || (d.guest + ' ' + d.unit).toLowerCase().indexOf(dq) > -1); });
    var table = O.table('minmax(0,1fr) 140px 200px 140px 200px', ['Guest', 'Unit', 'Checked out', 'Amount', 'Status'], rows.map(function (d) {
      return { cells: ['<span class="strong">' + esc(d.guest) + '</span>', esc(d.unit), esc(d.out), fmt(d.amount), O.depChip(d)] };
    }));
    return wrap(head + kpis + banner + '<div class="toolbar">' + tabs + '<span class="spacer"></span>' + O.toolbarSearch('Search guest or unit', 'depQuery') + O.btn('Filters', { icon: 'filter', act: 'soon', arg: 'Filters' }) + '</div>' + table);
  };

  /* Finance per unit (owner, accountant) and Expenses (manager) */
  O.PAGES.finance = function () {
    if (S().role === 'manager') return expenses();
    var f = S().fin['Lekki 2B'], extra = S().extra['Lekki 2B'] || 0, rev = f.revenue + extra, net = rev - f.costs, com = Math.round(net * 0.2), due = net - com;
    var waits = S().waiting.filter(function (p) { return p.unit === 'Lekki 2B'; });
    var head = O.pageHead('Lekki 2B · Finance', 'December 2026 · Landlord Mr Adebayo Johnson · 20% commission on net', O.btn('Download PDF', { icon: 'download', act: 'soon', arg: 'PDF download' }) + O.btn('Add to statement', { style: 'primary', act: 'to-statement' }));
    var tb = '<div class="toolbar">' + O.btn('Unit: Lekki 2B', { icon: 'chevron-down', act: 'soon', arg: 'Switching units' }) + O.btn('December 2026', { icon: 'calendar', act: 'soon', arg: 'Other months' }) + '<span class="spacer"></span>' + (waits.length ? O.chip(plural(waits.length, 'transfer', 'transfers') + ' waiting', 'warning') : O.chip('All transfers confirmed', 'positive')) + '</div>';
    var kpis = '<div class="kpis">' + O.kpi('Revenue', fmt(rev), 'vs November', '8%') + O.kpi('Running costs', fmt(f.costs), (Math.round(f.costs / rev * 1000) / 10) + '% of revenue') + O.kpi('Commission', fmt(com), '20% of ' + fmt(net) + ' net') + O.kpi('Due to landlord', fmt(due), 'Ready for statement') + '</div>';
    var costs = [['Diesel and generator', 186000, '4 deliveries · 620 litres'], ['Cleaning and laundry', 120000, '7 turnovers'], ['Electricity tokens', 75000, ''], ['Repairs', 80000, 'Bathroom tap, AC gas refill'], ['Internet', 25000, '']];
    var breakdown = O.panel('Profit breakdown', O.meta('Reconciled · 1 Dec to 31 Dec'), '<div class="rows"><div class="group-label">REVENUE</div>' +
      O.kv('Bookings', fmt(rev), '24 nights at ₦ 90,000 average · 7 bookings' + (extra ? ' · includes ' + fmt(extra) + ' confirmed today' : '')) +
      '<div class="group-label">RUNNING COSTS</div>' + costs.map(function (c) { return O.kv(c[0], fmt(c[1]), c[2]); }).join('') + O.kv('Total running costs', fmt(f.costs), null, null, 'strongk') +
      '<div class="group-label">SPLIT</div>' + O.kv('Net profit', fmt(net), 'Revenue less running costs') + O.kv('Commission', fmt(com), '20% of net profit') + O.kv('Due to landlord', fmt(due), null, null, 'total') + '</div>');
    var kept = 100000 + sum(waits, 'amount');
    var keptP = O.panel('Kept out of profit', O.meta(fmt(kept)), '<div class="rows"><div class="note">Held money and unconfirmed transfers never count as revenue until they are released or confirmed.</div>' +
      O.kv('Caution deposits held', fmt(100000), '2 guests · due back after inspection', O.chip('Held', 'neutral')) +
      waits.map(function (p) { return '<button type="button" class="kv" style="width:100%" data-act="confirm" data-arg="' + p.id + '"><span class="stack"><span>Transfer waiting</span><span class="muted sm">' + esc(p.guest) + ' · ' + esc(p.age) + ' old</span></span>' + O.chip('Pending', 'warning') + '<span class="v">' + fmt(p.amount) + '</span></button>'; }).join('') + '</div>');
    var bola = O.booking('BK 1051');
    var list = [['Ngozi Adeleke', '14 to 17 Dec · 3 nights · ₦ 270,000', 'Paid', 'positive', 'BK 1038'], ['Adaeze Okafor', '17 to 20 Dec · 3 nights · ₦ 255,000', 'Paid', 'positive', 'BK 1042'], ['Bola Kareem', '22 to 25 Dec · 3 nights · ₦ 351,000', bola.paid >= bola.total ? 'Paid' : bola.paid > 0 ? 'Part paid' : 'Pending', bola.paid > 0 ? (bola.paid >= bola.total ? 'positive' : 'info') : 'warning', 'BK 1051'], ['Ifeoma Obi', '26 to 31 Dec · 5 nights · ₦ 585,000', 'Paid', 'positive', '']];
    var bookingsP = O.panel('Bookings this month', O.meta('7'), '<div class="rows">' + list.map(function (x) { return O.listRow({ title: x[0], sub: x[1], right: O.chip(x[2], x[3]), go: x[4] ? bk(x[4]) : null }); }).join('') + '</div>');
    return wrap(head + tb + kpis + '<div class="cols"><div class="col-main">' + breakdown + '</div><div class="col-side">' + keptP + bookingsP + '</div></div>');
  };
  function expenses() {
    var ex = S().expenses, tab = S().ui.expTab, waiting = ex.filter(function (e) { return e.status === 'Waiting approval'; });
    var head = O.pageHead('Expenses', 'Running costs you log for each unit. Profit, commission and landlord share are not shown to managers.', O.btn('Export', { icon: 'download', act: 'soon', arg: 'Export' }) + O.btn('Log expense', { style: 'primary', icon: 'plus', act: 'log-expense' }));
    var kpis = '<div class="kpis three">' + O.kpi('Logged this month', fmt(2980000 + sum(ex.filter(function (e) { return e.session; }), 'amount')), '48 items across 18 units') + O.kpi('Waiting approval', plural(waiting.length, 'receipt', 'receipts'), 'Logged by staff · ' + fmt(sum(waiting, 'amount'))) + O.kpi('Diesel this month', '₦ 742,000', 'About 594 litres') + '</div>';
    var tabs = O.seg([{ key: 'All', label: 'All', n: 48 }, { key: 'Waiting approval', label: 'Waiting approval', n: waiting.length }, { key: 'Diesel', label: 'Diesel', n: 14 }, { key: 'Cleaning', label: 'Cleaning', n: 18 }, { key: 'Repairs', label: 'Repairs', n: 9 }], tab, 'exp-tab');
    var eq = (S().ui.expQuery || '').trim().toLowerCase();
    var rows = ex.filter(function (e) {
      if (eq && (e.title + ' ' + e.unit + ' ' + e.who).toLowerCase().indexOf(eq) < 0) return false;
      if (tab === 'All') return true;
      if (tab === 'Waiting approval') return e.status === 'Waiting approval';
      if (tab === 'Diesel') return /diesel/i.test(e.title);
      if (tab === 'Cleaning') return /clean|toiletries/i.test(e.title);
      return /repair|tap|gas|pump/i.test(e.title);
    });
    var tone = { 'Waiting approval': 'warning', Approved: 'positive', Rejected: 'critical' };
    var table = O.table('minmax(0,1fr) 120px 120px 130px 170px', ['Expense', 'Unit', 'Date', 'Amount', 'Status'], rows.map(function (e) {
      return { act: 'expense', arg: e.id, cells: ['<span class="strong">' + esc(e.title) + '</span><span class="muted"> · ' + esc(e.who) + (e.receipt ? ' · receipt' : '') + '</span>', esc(e.unit), esc(e.date), fmt(e.amount), O.chip(e.status, tone[e.status])] };
    }), { foot: '<div class="pager"><span class="muted">Showing ' + rows.length + ' of 48 expenses</span>' + O.btn('Previous', { disabled: true }) + O.btn('Next', { act: 'soon', arg: 'Older expenses' }) + '</div>' });
    return wrap(head + kpis + '<div class="toolbar">' + tabs + '<span class="spacer"></span>' + O.toolbarSearch('Search expense or unit', 'expQuery') + O.btn('Filters', { icon: 'filter', act: 'soon', arg: 'Filters' }) + '</div>' + table);
  }

  /* Maintenance */
  O.PAGES.maintenance = function () {
    var t = S().tasks, tab = S().ui.taskTab;
    var open = t.filter(function (x) { return x.status !== 'Done'; }), overdue = t.filter(function (x) { return x.status === 'Overdue'; }), prog = t.filter(function (x) { return x.status === 'In progress'; });
    var done = t.filter(function (x) { return x.status === 'Done'; });
    var head = O.pageHead('Maintenance', plural(open.length, 'open task', 'open tasks') + ' · ' + overdue.length + ' overdue', O.btn('Export', { icon: 'download', act: 'soon', arg: 'Export' }) + O.btn('New task', { style: 'primary', icon: 'plus', act: 'new-task' }));
    var kpis = '<div class="kpis three">' + O.kpi('Open tasks', String(open.length), overdue.length + ' overdue · ' + prog.length + ' in progress') + O.kpi('Due today', '3', 'Turnover cleans before check in') + O.kpi('Spent this month', '₦ 280,000', 'Charged to unit running costs') + '</div>';
    var tabs = O.seg([{ key: 'week', label: 'This week', n: t.length }, { key: 'open', label: 'Open', n: open.length }, { key: 'overdue', label: 'Overdue', n: overdue.length }, { key: 'done', label: 'Done', n: S().doneTotal + done.length }], tab, 'task-tab');
    var tq = (S().ui.taskQuery || '').trim().toLowerCase();
    var rows = t.filter(function (x) { return (tab === 'week' || (tab === 'open' && x.status !== 'Done') || (tab === 'overdue' && x.status === 'Overdue') || (tab === 'done' && x.status === 'Done')) && (!tq || (x.title + ' ' + x.unit + ' ' + x.who).toLowerCase().indexOf(tq) > -1); });
    var table = O.table('minmax(0,1fr) 140px 160px 130px 150px', ['Task', 'Unit', 'Due', 'Cost', 'Status'], rows.map(function (x) {
      return { act: 'task', arg: x.id, cells: ['<span class="strong">' + esc(x.title) + '</span><span class="muted"> · ' + esc(x.who) + '</span>', esc(x.unit), esc(x.due), fmt(x.cost), O.chip(x.status, O.taskTone(x.status))] };
    }), { empty: 'No tasks here' });
    return wrap(head + kpis + '<div class="toolbar">' + tabs + '<span class="spacer"></span>' + O.toolbarSearch('Search task or unit', 'taskQuery') + O.btn('Filters', { icon: 'filter', act: 'soon', arg: 'Filters' }) + '</div>' + table);
  };

  /* Statements */
  O.PAGES.statements = function (key) {
    if (key && S().landlords[key] && O.statementKeys.indexOf(key) > -1) return statement(key);
    var all = O.statementKeys.map(O.statement), total = all.reduce(function (a, s) { return a + s.t.due; }, 0);
    var drafts = all.filter(function (s) { return s.L.status === 'Draft'; }).length;
    var head = O.pageHead('Statements', 'December 2026 · send to landlords by 5 January', O.btn('Export', { icon: 'download', act: 'soon', arg: 'Export' }));
    var kpis = '<div class="kpis three">' + O.kpi('Due to landlords', fmt(total), '3 statements · by 5 January') + O.kpi('In draft', String(drafts), drafts ? 'Not sent yet' : 'All sent') + O.kpi('Sent', String(3 - drafts), 'Landlords open them without an account') + '</div>';
    var table = O.table('minmax(0,1fr) 100px 150px 150px 120px', ['Landlord', 'Units', 'Revenue', 'Due to landlord', 'Status'], all.map(function (s) {
      return { go: '#/statements/' + s.key, cells: ['<span class="strong">' + esc(s.L.name) + '</span>' + (s.waiting && !s.frozen ? '<span class="muted"> · ' + plural(s.waiting, 'transfer', 'transfers') + ' waiting</span>' : ''), String(s.rows.length), fmt(s.t.rev), '<span class="strong">' + fmt(s.t.due) + '</span>', O.chip(s.L.status, s.L.status === 'Sent' ? 'positive' : 'warning')] };
    }), { foot: '<div class="pager"><span class="muted">Mr Chidi Eze and Mrs Bisi Coker are paid on the 15th, so their statements open in January.</span></div>' });
    return wrap(head + kpis + table);
  };
  function statement(key) {
    var st = O.statement(key), L = st.L, t = st.t, sent = L.status === 'Sent';
    var crumb = '<div class="crumb"><a href="#/statements">Statements</a><span class="sep">/</span><span class="muted">' + esc(L.name) + '</span></div>';
    var acts = O.btn('Download PDF', { icon: 'download', act: 'soon', arg: 'PDF download' }) + (O.can('statement') ? (sent ? O.btn('Sent 16 Dec', { disabled: true }) : O.btn('Send statement', { style: 'primary', act: 'send-statement', arg: key })) : '');
    var head = O.pageHead(L.name + ' · December statement', plural(st.rows.length, 'unit', 'units') + ' · 1 to 31 December 2026 · 20% commission on net', acts);
    var kpis = '<div class="kpis">' + O.kpi('Revenue', fmt(t.rev), key === 'adebayo' ? 'vs November' : 'December', key === 'adebayo' ? '11%' : null) + O.kpi('Running costs', fmt(t.costs), 'Across ' + plural(st.rows.length, 'unit', 'units')) + O.kpi('Commission', fmt(t.com), '20% of ' + fmt(t.net) + ' net') + O.kpi('Due to landlord', fmt(t.due), sent ? 'Sent 16 Dec' : 'Pay by 5 January') + '</div>';
    var banner = '';
    var extras = st.rows.filter(function (r) { return r.extra; });
    if (!sent && st.waiting) banner = O.banner('info', 'info', plural(st.waiting, 'transfer is', 'transfers are') + ' still waiting', 'Unconfirmed money stays off this statement. It joins once someone confirms it against the bank app.', O.btn('Open queue', { go: '#/payments' }));
    else if (!sent && extras.length) banner = O.banner('ok', 'check', 'Updated with money confirmed today', extras.map(function (r) { return r.unit + ' · ' + fmt(r.extra); }).join(', ') + ' now counts, because the transfer was checked against the bank app.');
    else if (sent) banner = O.banner('info', 'info', L.sent || 'Sent', 'Payments confirmed after this go on the January statement.');
    var cols = ' style="grid-template-columns:minmax(0,1fr) 120px 110px 110px 120px"';
    var tableRows = '<div class="tr th"' + cols + '><span>Unit</span><span>Revenue</span><span>Costs</span><span>Commission</span><span>Due</span></div>' + st.rows.map(function (r) {
      return '<div class="tr"' + cols + ' style="min-height:71px"><span class="stack"><span class="strong">' + esc(r.unit) + '</span><span class="muted sm">' + r.nights + ' nights · ' + r.bookings + ' bookings</span></span><span>' + fmt(r.rev) + '</span><span>' + fmt(r.costs) + '</span><span>' + fmt(r.com) + '</span><span class="strong">' + fmt(r.due) + '</span></div>';
    }).join('') + '<div class="tr" style="grid-template-columns:minmax(0,1fr) 120px 110px 110px 120px;background:#EFF8FF;font-size:16px;line-height:24px;font-weight:600"><span class="strong">Total</span><span>' + fmt(t.rev) + '</span><span>' + fmt(t.costs) + '</span><span>' + fmt(t.com) + '</span><span class="strong">' + fmt(t.due) + '</span></div>';
    var byUnit = O.panel('By unit', O.meta(st.waiting && !sent ? plural(st.waiting, 'transfer', 'transfers') + ' waiting' : 'All payments reconciled'), '<div class="table-scroll"><div class="table-min" style="min-width:620px">' + tableRows + '</div></div>');
    var notes = { adebayo: ['Lekki 5A generator service is booked for 18 December and will show on the January statement.', 'Peak season rates applied from 20 December.', 'Caution deposits of ₦ 150,000 are held and not included above.'], funke: ['Ikoyi 6B was blocked for an owner stay from 15 to 21 December.', 'Caution deposits are held and not included above.'], okon: ['Yaba 3 damage claim of ₦ 35,000 was deducted from the guest’s deposit, not from revenue.', 'Peak season rates applied from 20 December.'] }[key];
    var notesP = O.panel('Notes for landlord', O.meta('Shown on the PDF'), '<div class="panel-body" style="gap:8px;padding:16px 20px">' + notes.map(function (n) { return '<p>' + esc(n) + '</p>'; }).join('') + '</div>');
    var payout = O.panel('Payout', O.chip(L.status, sent ? 'positive' : 'warning'), '<div class="rows">' + O.kv('Pay to', esc(L.name)) + O.kv('Bank', esc(L.bank)) + O.kv('Send by', '5 January') + O.kv('Amount', fmt(t.due), null, null, 'strongk') + '</div>');
    var share = O.panel('Share statement', '', '<div class="panel-body" style="gap:12px;padding:16px 20px">' + O.btn('Send on WhatsApp', { block: true, act: 'share', arg: 'WhatsApp' }) + O.btn('Email PDF', { block: true, act: 'share', arg: 'email' }) + O.btn('Copy link', { block: true, act: 'share', arg: 'link' }) + '<p class="muted sm">Landlords open the statement without an account.</p></div>');
    return wrap(crumb + head + kpis + banner + '<div class="cols"><div class="col-main">' + byUnit + notesP + '</div><div class="col-side w360">' + payout + share + '</div></div>');
  }

  /* Settings */
  var CAN = {
    owner: [['Everything', 'Units, bookings, payments, deposits, finance and statements']],
    manager: [['Bookings and units', 'Edit both. Adding units is owner only.'], ['Payments', 'Record only. Transfers wait for the accountant.'], ['Deposits', 'Request returns after inspection.'], ['Finance', 'Expenses only. No profit or commission.'], ['Hidden', 'Statements']],
    accountant: [['Payments', 'Confirm against the bank app.'], ['Deposits', 'Record refunds once the owner approves.'], ['Finance', 'Full, plus landlord statements.'], ['Bookings and units', 'View only.'], ['Hidden', 'Maintenance']]
  };
  O.POWERS = [
    { key: 'refunds', label: 'Approve refunds', note: 'Refunds won’t wait for you', on: true },
    { key: 'rates', label: 'Change nightly rates', note: 'Peak season and discounts', on: true },
    { key: 'statements', label: 'Send landlord statements', note: 'Shows profit and commission', on: false },
    { key: 'units', label: 'Add or remove units', note: 'Owner only', on: false, locked: true },
    { key: 'confirm', label: 'Confirm payments', note: 'Stays with the accountant. Whoever records a payment never confirms it.', on: false, locked: true }
  ];
  O.PAGES.settings = function () {
    var role = S().role, R = O.role(), d = S().delegation;
    var team = O.panel('Team', role === 'owner' ? O.btn('Invite', { icon: 'plus', act: 'soon', arg: 'Inviting a team member' }) : '', '<div class="rows">' + S().team.map(function (m) {
      return '<div class="list-row"><span class="avatar">' + m.initials + '</span><span class="stack"><span class="strong">' + esc(m.name) + (m.role === R.label ? ' · you' : '') + '</span><span class="muted sm">' + esc(m.contact) + '</span></span>' + O.chip(m.role, m.role === 'Owner' ? 'info' : 'neutral', false) + '</div>';
    }).join('') + '</div>');
    if (role !== 'owner') {
      var extra = d && role === 'manager' ? O.banner('warn', 'key', 'You have the owner’s access until ' + d.until.split(',')[0], d.powers.map(function (k) { return O.POWERS.find(function (p) { return p.key === k; }).label; }).join(' · ') + '. Every action is logged for the owner.') : '';
      var can = O.panel('What you can do', O.chip(R.label, 'neutral', false), '<div class="rows">' + CAN[role].map(function (c) { return O.kv(c[0], null, c[1]); }).join('') + '<div class="note">Only the owner can change access.</div></div>');
      return wrap(O.pageHead('Settings', 'Your account', '') + extra + '<div class="cols"><div class="col-main">' + can + '</div><div class="col-side">' + team + '</div></div>');
    }
    var access;
    if (!d) {
      access = O.panel('Delegated access', '', '<div class="panel-body" style="align-items:flex-start;gap:12px"><span class="thumb" style="background:#EFF8FF;color:#175CD3">' + icon('key') + '</span><span class="strong">Hand over owner powers while you are away</span><p class="muted">Pick what Tola can do and for how long. You can revoke it at any time, and every action is logged.</p>' + O.btn('Give access', { style: 'primary', act: 'give-access' }) + '</div>');
    } else {
      var labels = d.powers.map(function (k) { return O.POWERS.find(function (p) { return p.key === k; }).label; }).join(' · ');
      access = O.panel('Delegated access', '', '<div class="panel-body">' + O.banner('warn', 'key', d.to + ' has access until ' + d.until, labels, O.btn('Revoke now', { style: 'danger', act: 'revoke' })) + '<div class="flabel">ACTIVITY</div>' +
        (S().log.length ? '<div class="box rows">' + S().log.map(function (l) { return O.listRow({ title: l.title, sub: l.sub, right: O.chip(l.status, l.tone) }); }).join('') + '</div>' : '<p class="muted">Nothing yet. Every action Tola takes with this access shows here.</p>') + '</div>');
    }
    return wrap(O.pageHead('Settings', 'Team and access', '') + '<div class="cols"><div class="col-main">' + access + '</div><div class="col-side">' + team + '</div></div>');
  };

  /* A page hidden for this role */
  O.PAGES.hidden = function (page) {
    var R = O.role(), label = O.NAV[page] ? O.NAV[page].label : 'This page';
    var why = { statements: 'Statements show profit and commission, so they stay with the owner and the accountant.', maintenance: 'Maintenance is run by the owner and the manager.' }[page] || 'It isn’t part of this role.';
    return wrap('<div class="panel"><div class="panel-body" style="align-items:flex-start;padding:32px"><span class="thumb">' + icon('eye') + '</span><h1 class="page-title" style="font-size:20px;line-height:28px">' + esc(label) + ' is hidden for the ' + R.label + ' role</h1><p class="muted">' + esc(why) + ' Items a role can’t open are hidden from the menu, not greyed out.</p>' + O.btn('Go to Overview', { style: 'primary', go: '#/overview' }) + '</div></div>');
  };
})();
