/* Onile prototype: drawers, dialogs and actions. */
(function () {
  'use strict';
  var O = window.O, A = O.ACTS, S = function () { return O.S; };
  var esc = O.esc, fmt = O.fmt;
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }
  function val(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; }
  function money(s) { return parseInt(String(s).replace(/[^0-9]/g, ''), 10) || 0; }
  function sel(id, opts, value) { return '<select class="input" id="' + id + '">' + opts.map(function (o) { var v = Array.isArray(o) ? o[0] : o, l = Array.isArray(o) ? o[1] : o; return '<option value="' + esc(v) + '"' + (String(v) === String(value) ? ' selected' : '') + '>' + esc(l) + '</option>'; }).join('') + '</select>'; }
  function field(label, inner, help, helpId) { return '<div class="field"><label>' + esc(label) + '</label>' + inner + (help != null ? '<span class="help" ' + (helpId ? 'id="' + helpId + '"' : '') + '>' + help + '</span>' : '') + '</div>'; }
  function input(id, value, attrs) { return '<input class="input" id="' + id + '" value="' + esc(value || '') + '" ' + (attrs || '') + '>'; }
  function done(msg) { O.closeOverlay(); O.render(); if (msg) O.toast(msg); }

  /* Tabs and paging */
  A['pay-tab'] = function (k) { S().ui.payTab = k; O.render(); };
  A['unit-tab'] = function (k) { S().ui.unitTab = k; S().ui.unitPage = 1; O.render(); };
  A['task-tab'] = function (k) { S().ui.taskTab = k; O.render(); };
  A['dep-tab'] = function (k) { S().ui.depTab = k; O.render(); };
  A['exp-tab'] = function (k) { S().ui.expTab = k; O.render(); };
  A['book-view'] = function (k) { S().ui.bookView = k; O.render(); };
  A['unit-page'] = function (d) { S().ui.unitPage = Math.max(1, S().ui.unitPage + parseInt(d, 10)); O.render(); };
  A['unit-filter'] = function (k) { S().ui.unitTab = k; S().ui.unitPage = 1; S().ui.unitQuery = ''; O.go('#/units'); };
  A['global-search'] = function (v) { S().ui.unitQuery = v; S().ui.unitTab = 'All'; S().ui.unitPage = 1; O.go('#/units'); };
  A.note = function (msg) { O.toast(msg, 'info'); };
  A.share = function (how) { O.toast({ WhatsApp: 'Statement link ready to send on WhatsApp', email: 'PDF emailed to the landlord', link: 'Statement link copied' }[how]); };
  A['to-statement'] = function () { O.go('#/statements/adebayo'); O.toast('Lekki 2B is on Mr Adebayo Johnson’s December statement'); };

  /* Confirm a transfer (owner, accountant) or view it (manager) */
  A.confirm = function (id) {
    var p = S().waiting.find(function (x) { return x.id === id; });
    if (!p) return O.toast('Already confirmed');
    var b = O.booking(p.booking), paid = b ? b.paid : 0, balance = p.total - paid - p.amount;
    var amount = '<div class="amount-box"><span class="muted sm">Amount sent</span><span class="big">' + fmt(p.amount) + '</span>' + (balance > 0 ? O.chip('Part payment · ' + fmt(balance) + ' balance', 'warning') : O.chip('Pays the booking in full', 'positive')) + '</div>';
    var details = '<div class="box rows">' + O.kv('Bank', esc(p.bank)) + O.kv('Reference', esc(p.ref)) + O.kv('Sent', esc(p.sent)) + O.kv('Booking', esc(p.unit + ' · ' + p.dates)) + O.kv('Booking total', fmt(p.total)) + (p.by ? O.kv('Recorded by', esc(p.by)) : '') + '</div>';
    var proof = '<div class="file"><span class="thumb">' + icon('statements') + '</span><span class="stack"><span class="strong">Transfer receipt uploaded by guest</span><span class="muted sm">' + esc(p.receipt + ' · ' + p.size) + '</span></span><button type="button" class="link" data-act="receipt" data-arg="' + p.id + '">View</button></div>';
    if (!O.can('confirm')) {
      var note = O.banner('info', 'info', 'Waiting for the accountant', 'Ngozi or the owner confirms it after finding it in the bank app. You can record payments, not confirm them.');
      O.openOverlay(O.drawer('Transfer waiting', p.guest + ' · booking ' + p.booking, amount + details + proof + note, O.btn('Close', { act: 'close' }) + '<button type="button" class="btn primary" style="opacity:.45" data-act="confirm-blocked" aria-disabled="true">' + icon('check') + 'Confirm</button>'));
      return;
    }
    var check = '<button type="button" class="check" id="found" data-act="confirm-tick" aria-pressed="false"><span class="cb">' + icon('check', 14) + '</span><span>I found this transfer in our bank app</span></button>';
    O.openOverlay(O.drawer('Confirm transfer', p.guest + ' · booking ' + p.booking, amount + details + proof + check,
      O.btn('Flag mismatch', { act: 'flag', arg: p.id }) + O.btn('Confirm ' + fmt(p.amount), { style: 'primary', icon: 'check', act: 'confirm-go', arg: p.id, id: 'confirm-btn', disabled: true })));
  };
  A['confirm-tick'] = function (a, el) {
    var on = !el.classList.contains('on');
    el.classList.toggle('on', on); el.setAttribute('aria-pressed', String(on));
    var b = document.getElementById('confirm-btn'); if (b) b.disabled = !on;
  };
  A['confirm-blocked'] = function () {
    O.logAction('Tried to confirm a payment', 'Payments', 'critical', 'Blocked');
    O.toast('Confirming stays with the accountant or the owner', 'warn');
  };
  A['confirm-go'] = function (id) {
    var i = S().waiting.findIndex(function (x) { return x.id === id; });
    if (i < 0) return;
    var p = S().waiting.splice(i, 1)[0], R = O.role();
    S().confirmed.unshift({ guest: p.guest, by: R.first, unit: p.unit, bankShort: p.bankShort, ref: p.ref, amount: p.amount });
    S().confirmedMonth += p.amount; S().confirmedCount += 1;
    S().extra[p.unit] = (S().extra[p.unit] || 0) + p.amount;
    var b = O.booking(p.booking);
    if (b) { b.paid += p.amount; b.conf = (b.conf || []).concat([{ amount: p.amount, by: R.first, ref: p.ref, bank: p.bank }]); if (b.type === 'tentative') b.type = 'confirmed'; }
    done(fmt(p.amount) + ' confirmed. It now counts as revenue.');
  };
  A.flag = function () { done('Flagged. The guest will be asked for a clearer receipt.'); };
  A.receipt = function (id) {
    var p = S().waiting.find(function (x) { return x.id === id; });
    if (!p) return;
    var r = '<div class="dialog" role="dialog" aria-label="Receipt"><div class="drawer-head"><div class="stack"><span class="panel-title">' + esc(p.receipt) + '</span><span class="muted sm">Uploaded by the guest</span></div><button type="button" class="icon-btn ghost" data-act="close" aria-label="Close">' + icon('close') + '</button></div>' +
      '<div class="drawer-body" style="background:#F9FAFB"><div class="panel" style="padding:24px;display:flex;flex-direction:column;gap:16px;align-items:center;text-align:center"><span class="thumb" style="background:#ECFDF3;color:#027A48">' + icon('check') + '</span><span class="strong">Transfer successful</span><span class="page-title">' + fmt(p.amount) + '</span>' +
      '<div class="box rows" style="width:100%;text-align:left">' + O.kv('From', esc(p.guest)) + O.kv('To', 'Onile Shortlets Ltd') + O.kv('Bank', esc(p.bank)) + O.kv('Reference', esc(p.ref)) + O.kv('Date', esc(p.sent)) + '</div></div>' +
      '<p class="muted sm">A receipt is a claim, not proof. Confirm only after you find the transfer in the bank app.</p></div></div>';
    O.openOverlay(r, true);
  };

  /* Record a payment (owner, manager) */
  function balanceOf(b) { var w = S().waiting.filter(function (p) { return p.booking === b.id; }).reduce(function (a, p) { return a + p.amount; }, 0); return b.total - b.paid - w; }
  A.record = function (bid) {
    var list = S().bookings.filter(function (b) { return b.guest && balanceOf(b) > 0; });
    if (!list.length) return O.toast('Every booking is paid or waiting');
    var b = O.booking(bid) && balanceOf(O.booking(bid)) > 0 ? O.booking(bid) : (O.booking('BK 1063') && balanceOf(O.booking('BK 1063')) > 0 ? O.booking('BK 1063') : list[0]);
    var grace = b.id === 'BK 1063';
    var amt = grace ? 120000 : balanceOf(b);
    var opts = list.map(function (x) { return [x.id, x.id + ' · ' + x.guest + ' · ' + x.unit]; });
    var body = field('Booking', sel('rp-booking', opts, b.id)) +
      field('Amount received', input('rp-amount', fmt(amt), 'inputmode="numeric" data-live="rp"'), 'Booking total ' + fmt(b.total) + ' · ' + fmt(balanceOf(b) - amt) + ' balance after this', 'rp-help') +
      field('Bank', sel('rp-bank', ['GTBank', 'Access Bank', 'Opay', 'Kuda', 'Moniepoint', 'Zenith Bank', 'First Bank'], grace ? 'GTBank' : 'GTBank')) +
      field('Transfer reference', input('rp-ref', grace ? '0051186' : '', 'placeholder="From the guest’s receipt" data-live="rp"'), 'From the guest’s receipt', 'rp-ref-help') +
      '<div class="field"><span class="flabel">Guest receipt</span><div class="file"><span class="thumb">' + icon('statements') + '</span><span class="stack"><span class="strong">receipt_' + esc(b.guest.split(' ')[0].toLowerCase()) + '.png</span><span class="muted sm">Uploaded · 180 KB</span></span><button type="button" class="link" data-act="soon" data-arg="Replacing the receipt">Replace</button></div></div>';
    var sub = S().role === 'manager' ? 'Saved as Waiting until the accountant confirms' : 'Saved as Waiting until it is confirmed';
    O.openOverlay(O.drawer('Record payment', sub, body, O.btn('Cancel', { act: 'close' }) + O.btn('Save as waiting', { style: 'primary', act: 'record-save' })));
  };
  O.LIVE = {
    rp: function () {
      var b = O.booking(val('rp-booking')); if (!b) return;
      var h = document.getElementById('rp-help'), a = money(val('rp-amount')), bal = balanceOf(b);
      if (h) { h.className = 'help' + (a > bal ? ' err' : ''); h.textContent = a > bal ? 'More than the ' + fmt(bal) + ' still owed' : 'Booking total ' + fmt(b.total) + ' · ' + fmt(bal - a) + ' balance after this'; }
    }
  };
  A['record-save'] = function () {
    var b = O.booking(val('rp-booking')), a = money(val('rp-amount')), ref = val('rp-ref'), bank = val('rp-bank');
    var bad = false;
    if (!a || a > balanceOf(b)) { document.getElementById('rp-amount').classList.add('err'); bad = true; }
    if (ref.length < 4) { document.getElementById('rp-ref').classList.add('err'); var rh = document.getElementById('rp-ref-help'); rh.className = 'help err'; rh.textContent = 'Add the reference so the transfer can be found in the bank app'; bad = true; }
    if (bad) return;
    var R = O.role();
    S().waiting.push({ id: 'p' + Date.now(), guest: b.guest, booking: b.id, unit: b.unit, dates: b.s + ' to ' + b.e + ' Dec', bank: bank, bankShort: bank.replace(' Bank', ''), ref: ref, sent: '17 Dec · just now', sentShort: '17 Dec, just now', age: 'Just now', total: b.total, amount: a, receipt: 'receipt_' + b.guest.split(' ')[0].toLowerCase() + '.png', size: '180 KB', by: R.first });
    if (S().role === 'manager') S().recordedWeek += 1;
    O.logAction('Recorded a payment of ' + fmt(a), b.unit, 'warning', 'Waiting');
    done(S().role === 'manager' ? 'Saved as Waiting. The accountant confirms it.' : 'Saved as Waiting');
  };

  /* Add a booking, blocked before save when it clashes */
  var lastBooking = null;
  A['add-booking'] = function (focus) {
    if (!O.can('book')) return O.toast('Bookings are view only for the Accountant', 'warn');
    var f = lastBooking || { guest: 'Bola Kareem', phone: '+234 802 000 1144', unit: 'Ikoyi 4A', s: 22, e: 24, source: 'Instagram DM', status: 'Confirmed' };
    var days = []; for (var d = 15; d <= 28; d++) days.push([d, O.wd(d) + ' ' + d + ' Dec']);
    var body = field('Guest name', input('bk-guest', f.guest, focus ? '' : 'autofocus')) + field('Phone', input('bk-phone', f.phone, 'inputmode="tel"')) +
      field('Unit', sel('bk-unit', S().units.map(function (u) { return [u.name, u.name + ' · ' + u.beds + ' · ' + u.area]; }), f.unit)) +
      '<div class="row2">' + field('Check in', sel('bk-s', days.slice(0, 13), f.s)) + field('Check out', sel('bk-e', days.slice(1), f.e)) + '</div>' +
      '<span class="help" id="bk-help"></span>' +
      field('Booked through', sel('bk-source', ['Instagram DM', 'WhatsApp', 'Phone call', 'Website enquiry', 'Referral'], f.source)) +
      field('Status', sel('bk-status', ['Confirmed', 'Tentative hold · 24 hours'], f.status), 'Peak season from 20 Dec · nightly rates +30% · 3 night minimum');
    O.openOverlay(O.drawer('Add booking', 'Clashes are checked before the booking saves', body, O.btn('Cancel', { act: 'close' }) + O.btn('Save booking', { style: 'primary', act: 'booking-save' })));
    bookingPreview();
    if (focus) { var el = document.getElementById(focus === 'unit' ? 'bk-unit' : 'bk-s'); if (el) setTimeout(function () { el.focus(); }, 40); }
  };
  function bookingPreview() {
    var u = O.unit(val('bk-unit')), s = +val('bk-s'), e = +val('bk-e'), h = document.getElementById('bk-help');
    if (!u || !h) return;
    if (e <= s) { h.className = 'help err'; h.textContent = 'Check out must be after check in'; return; }
    var total = 0; for (var d = s; d < e; d++) total += d >= 20 ? Math.round(u.rate * 1.3) : u.rate;
    h.className = 'help'; h.textContent = plural(e - s, 'night', 'nights') + ' · ' + fmt(total) + ' at ' + fmt(u.rate) + ' a night' + (e > 20 ? ', peak nights +30%' : '');
  }
  document.addEventListener('change', function (ev) { if (/^bk-(unit|s|e)$/.test(ev.target.id)) bookingPreview(); if (ev.target.id === 'rp-booking') A.record(ev.target.value); if (ev.target.id === 'task-who') A['task-who'](ev.target.value); });
  document.addEventListener('input', function (ev) { var k = ev.target.dataset && ev.target.dataset.live; if (k && O.LIVE[k]) O.LIVE[k](ev.target); if (ev.target.classList && ev.target.classList.contains('err')) ev.target.classList.remove('err'); });
  A['booking-save'] = function () {
    var f = { guest: val('bk-guest') || 'Guest', phone: val('bk-phone'), unit: val('bk-unit'), s: +val('bk-s'), e: +val('bk-e'), source: val('bk-source'), status: val('bk-status') };
    if (f.e <= f.s) return bookingPreview();
    lastBooking = f;
    var hit = S().bookings.find(function (b) { return b.unit === f.unit && ['confirmed', 'tentative', 'blocked', 'maintenance'].indexOf(b.type) > -1 && f.s < b.e && b.s < f.e; });
    if (hit) {
      S().clash = { unit: f.unit, s: Math.max(f.s, hit.s), e: Math.min(f.e, hit.e), guest: f.guest, other: hit.guest ? O.shortName(hit.guest) : hit.label.toLowerCase(), from: hit.s };
      if (S().calendarUnits.indexOf(f.unit) < 0) S().calendarUnits.push(f.unit);
      S().ui.bookView = 'calendar'; S().ui.bookQuery = '';
      O.logAction('Tried to add a booking that clashed', f.unit, 'critical', 'Blocked');
      O.closeOverlay();
      if (O.route().page !== 'bookings') O.go('#/bookings'); else O.render();
      O.toast('Save blocked. ' + f.unit + ' is already booked for those nights.', 'warn');
      return;
    }
    var u = O.unit(f.unit), total = 0; for (var d = f.s; d < f.e; d++) total += d >= 20 ? Math.round(u.rate * 1.3) : u.rate;
    var id = 'BK ' + (1064 + S().bookings.filter(function (b) { return b.isNew; }).length);
    S().bookings.push({ id: id, guest: f.guest, unit: f.unit, s: f.s, e: f.e, type: f.status === 'Confirmed' ? 'confirmed' : 'tentative', total: total, paid: 0, source: f.source, phone: f.phone, isNew: true });
    if (S().calendarUnits.indexOf(f.unit) < 0) S().calendarUnits.push(f.unit);
    S().clash = null; lastBooking = null;
    O.logAction('Added a booking for ' + f.guest, f.unit + ' · ' + f.s + ' to ' + f.e + ' Dec', 'positive', 'Saved');
    O.closeOverlay();
    if (O.route().page !== 'bookings') O.go('#/bookings'); else O.render();
    O.toast('Booking saved · ' + f.guest + ' · ' + f.unit + ' · ' + f.s + ' to ' + f.e + ' Dec');
  };
  A['clash-edit'] = function (what) { A['add-booking'](what === 'unit' ? 'unit' : 'dates'); };

  /* Tasks */
  A.task = function (id) {
    var t = O.task(id); if (!t) return;
    var can = O.can('tasks'), u = O.unit(t.unit);
    var top = '<div style="display:flex;gap:8px;align-items:center">' + O.chip(t.status, O.taskTone(t.status)) + '<span class="muted">' + (t.status === 'Done' ? 'Done' + (t.doneAt ? ' at ' + t.doneAt : '') : 'Due ' + esc(t.due)) + '</span></div>';
    var who = can && t.status !== 'Done' ? sel('task-who', ['Blessing', 'Funmi', 'Amaka', 'Sunday', 'CoolFix Ltd'], t.who).replace('class="input"', 'class="input" style="width:180px;height:36px"') : esc(t.who);
    var rows = '<div class="box rows">' + O.kv('Assigned to', null, null, '<span class="v">' + who + '</span>') + O.kv('Unit', esc(t.unit + ' · ' + u.status)) + O.kv('Due', esc(t.due)) + (t.started ? O.kv('Started', esc(t.started)) : '') + O.kv('Cost', fmt(t.cost)) + '</div>';
    var next = t.nextGuest ? O.banner(t.id === 't2' && t.status !== 'Done' ? 'crit' : 'info', t.id === 't2' && t.status !== 'Done' ? 'alert' : 'info', t.id === 't2' && t.status !== 'Done' ? 'Next guest arrives at 2:00 pm' : 'Next guest', t.nextGuest + (t.id === 't2' && t.status !== 'Done' ? '. The unit shows Not ready until this clean is done.' : '')) : '';
    var notes = t.notes ? '<div class="field"><span class="flabel">Notes</span><p>' + esc(t.notes) + '</p></div>' : '';
    var list = t.checklist ? '<div class="field"><span class="flabel">Checklist · ' + t.checklist.filter(function (c) { return c[1]; }).length + ' of ' + t.checklist.length + ' done</span><div>' + t.checklist.map(function (c, i) {
      return '<button type="button" class="check plain' + (c[1] ? ' on' : '') + '" data-act="' + (can && t.status !== 'Done' ? 'check-item' : 'soon') + '" data-arg="' + (can ? t.id + ':' + i : 'Ticking the checklist') + '"><span class="cb">' + icon('check', 14) + '</span><span class="lbl">' + esc(c[0]) + '</span></button>';
    }).join('') + '</div></div>' : '';
    var foot = can && t.status !== 'Done' ? O.btn('Close', { act: 'close' }) + O.btn('Mark done', { style: 'primary', icon: 'check', act: 'task-done', arg: t.id }) : O.btn('Close', { act: 'close' });
    O.openOverlay(O.drawer(t.title, t.unit + ' · ' + t.who, top + next + rows + list + notes, foot));
    O._task = t.id;
  };
  A['check-item'] = function (arg) {
    var p = arg.split(':'), t = O.task(p[0]); t.checklist[+p[1]][1] = !t.checklist[+p[1]][1];
    O.save(); A.task(t.id);
  };
  A['task-who'] = function (v) { var t = O.task(O._task); if (!t) return; t.who = v; O.save(); O.render(); A.task(t.id); O.toast(t.title + ' at ' + t.unit + ' reassigned to ' + v); };
  A['task-done'] = function (id) {
    var t = O.task(id); t.status = 'Done'; t.doneAt = 'just now';
    if (t.checklist) t.checklist.forEach(function (c) { c[1] = true; });
    var msg = t.title + ' at ' + t.unit + ' is done';
    if (id === 't2') { O.unit('Ikoyi 4A').status = 'Ready'; msg = 'Ikoyi 4A is ready for Chiamaka Eze at 2:00 pm'; }
    if (id === 't1' || id === 't3') { var a = O.task('t1').status === 'Done', b = O.task('t3').status === 'Done'; O.unit('Lekki 5A').status = a && b ? 'Ready' : a ? 'Cleaning' : 'Maintenance'; }
    O.logAction('Marked a task done', t.title + ' · ' + t.unit, 'positive', 'Saved');
    done(msg);
  };
  A['new-task'] = function () {
    var body = field('Task', input('nt-title', 'AC service', 'autofocus')) + field('Unit', sel('nt-unit', S().units.map(function (u) { return u.name; }), 'VI 1C')) + field('Assign to', sel('nt-who', ['Sunday', 'Blessing', 'Funmi', 'Amaka', 'CoolFix Ltd'], 'CoolFix Ltd')) +
      '<div class="row2">' + field('Due', sel('nt-due', ['Tomorrow', '19 Dec', '21 Dec', '23 Dec'], '19 Dec')) + field('Cost', input('nt-cost', fmt(25000), 'inputmode="numeric"')) + '</div>';
    O.openOverlay(O.drawer('New task', 'Costs go to the unit’s running costs', body, O.btn('Cancel', { act: 'close' }) + O.btn('Create task', { style: 'primary', act: 'task-save' })));
  };
  A['task-save'] = function () {
    var title = val('nt-title'); if (!title) return document.getElementById('nt-title').classList.add('err');
    S().tasks.unshift({ id: 't' + Date.now(), title: title, who: val('nt-who'), unit: val('nt-unit'), due: val('nt-due'), cost: money(val('nt-cost')), status: 'To do' });
    O.logAction('Created a task', title + ' · ' + val('nt-unit'), 'positive', 'Saved');
    done('Task created and assigned to ' + val('nt-who'));
  };

  /* Units */
  A.unit = function (name) {
    var u = O.unit(name), bks = S().bookings.filter(function (b) { return b.unit === name && b.guest; });
    var tasks = S().tasks.filter(function (t) { return t.unit === name && t.status !== 'Done'; });
    var body = '<div style="display:flex;gap:8px">' + O.chip(u.status, O.statusTone(u.status)) + '</div><div class="box rows">' + O.kv('Landlord', esc(S().landlords[u.landlord].name)) + O.kv('Area', esc(u.area)) + O.kv('Nightly rate', fmt(u.rate)) + O.kv('Next check in', esc(u.next)) + O.kv('Housekeeper', esc(u.keeper)) + '</div>' +
      (bks.length ? '<div class="field"><span class="flabel">Bookings, 15 to 28 Dec</span><div class="box rows">' + bks.map(function (b) { return O.listRow({ title: b.guest, sub: b.s + ' to ' + b.e + ' Dec · ' + plural(b.e - b.s, 'night', 'nights'), right: b.type === 'tentative' ? O.chip('Hold 24h', 'warning') : O.chip('Confirmed', 'positive'), go: O.bkLink(b.id) }); }).join('') + '</div></div>' : '') +
      (tasks.length ? '<div class="field"><span class="flabel">Open tasks</span><div class="box rows">' + tasks.map(function (t) { return O.listRow({ title: t.title + ' · ' + t.who, sub: 'Due ' + t.due, right: O.chip(t.status, O.taskTone(t.status)), act: O.can('tasks') ? 'task' : null, arg: t.id }); }).join('') + '</div></div>' : '');
    var foot = (O.can('money') ? O.btn('View finance', { act: 'unit-finance', arg: name }) : '') + (O.can('book') ? O.btn('Block dates', { style: 'primary', act: 'soon', arg: 'Blocking dates' }) : O.btn('Close', { act: 'close' }));
    O.openOverlay(O.drawer(u.name, u.beds + ' · ' + u.area, body, foot));
  };
  A['unit-finance'] = function (name) { if (name === 'Lekki 2B') { O.closeOverlay(); O.go('#/finance'); } else O.toast('The sample data has a full breakdown for Lekki 2B only', 'info'); };

  /* Deposits: manager requests, owner approves, accountant records the refund */
  function depCards(list, withAmount, withRef) {
    return list.map(function (d, i) {
      return '<div class="box"><div class="kv"><span class="stack"><span class="strong">' + esc(d.guest) + '</span><span class="muted sm">' + esc(d.unit + ' · checked out ' + d.out.replace('Today · ', 'today, ')) + '</span></span><span class="v">' + fmt(d.amount) + '</span></div><div style="padding:0 20px 16px;display:flex;flex-direction:column;gap:12px">' +
        field('Inspection notes', '<textarea class="input" id="dn-' + d.id + '"' + (withRef ? ' readonly' : '') + '>' + esc(d.note || '') + '</textarea>') +
        (withAmount ? field('Refund', input('da-' + d.id, fmt(d.amount), 'inputmode="numeric"'), 'Refund in full or in part') : '') +
        (withRef ? field('Bank reference', input('dr-' + d.id, '00612' + (40 + i))) : '') + '</div></div>';
    }).join('');
  }
  A['request-returns'] = function () {
    var list = S().deposits.filter(function (d) { return d.state === 'due'; });
    O.openOverlay(O.drawer('Request returns', 'The owner approves refunds', depCards(list, false, false), O.btn('Cancel', { act: 'close' }) + O.btn('Request ' + plural(list.length, 'return', 'returns'), { style: 'primary', act: 'request-go' })));
  };
  A['request-go'] = function () {
    S().deposits.forEach(function (d) { if (d.state === 'due') { d.note = val('dn-' + d.id) || d.note; d.state = 'requested'; } });
    O.logAction('Requested deposit returns', 'Deposits', 'positive', 'Saved');
    done('Returns requested. The owner approves the refunds.');
  };
  A['review-refunds'] = function () {
    var list = S().deposits.filter(function (d) { return d.state === 'due' || d.state === 'requested'; });
    O.openOverlay(O.drawer('Review refunds', 'Approve after reading the inspection notes', depCards(list, true, false), O.btn('Cancel', { act: 'close' }) + O.btn('Approve ' + plural(list.length, 'refund', 'refunds'), { style: 'primary', act: 'approve-go' })));
  };
  A['approve-go'] = function () {
    var n = 0, total = 0;
    S().deposits.forEach(function (d) { if (d.state === 'due' || d.state === 'requested') { d.refund = money(val('da-' + d.id)) || d.amount; d.note = val('dn-' + d.id) || d.note; d.state = 'approved'; n++; total += d.refund; } });
    O.logAction('Approved ' + plural(n, 'refund', 'refunds'), fmt(total), 'positive', 'Saved');
    done(plural(n, 'refund', 'refunds') + ' approved. Ngozi sends ' + (n === 1 ? 'it' : 'them') + ' and records the reference.');
  };
  A['record-refunds'] = function () {
    var list = S().deposits.filter(function (d) { return d.state === 'approved'; });
    O.openOverlay(O.drawer('Record refunds', 'Send each refund from the bank app first', depCards(list, false, true), O.btn('Cancel', { act: 'close' }) + O.btn('Record ' + plural(list.length, 'refund', 'refunds'), { style: 'primary', act: 'refund-go' })));
  };
  A['refund-go'] = function () {
    var total = 0;
    S().deposits.forEach(function (d) { if (d.state === 'approved') { d.state = 'refunded'; d.session = true; total += d.refund || d.amount; } });
    S().heldNow -= total;
    done(fmt(total) + ' refunded. Deposits held now ' + fmt(S().heldNow) + '.');
  };

  /* Expenses (manager) */
  A.expense = function (id) {
    var e = S().expenses.find(function (x) { return x.id === id; });
    var body = '<div class="amount-box"><span class="muted sm">Amount</span><span class="big">' + fmt(e.amount) + '</span>' + O.chip(e.status, { 'Waiting approval': 'warning', Approved: 'positive', Rejected: 'critical' }[e.status]) + '</div>' +
      '<div class="box rows">' + O.kv('Logged by', esc(e.who)) + O.kv('Unit', esc(e.unit)) + O.kv('Date', esc(e.date)) + O.kv('Goes to', 'Unit running costs') + '</div>' +
      (e.receipt ? '<div class="file"><span class="thumb">' + icon('statements') + '</span><span class="stack"><span class="strong">Receipt photo</span><span class="muted sm">receipt_' + e.id + '.jpg · 120 KB</span></span><button type="button" class="link" data-act="soon" data-arg="Opening the receipt">View</button></div>' : '');
    var foot = e.status === 'Waiting approval' ? O.btn('Reject', { style: 'danger', act: 'expense-set', arg: id + ':Rejected' }) + O.btn('Approve', { style: 'primary', icon: 'check', act: 'expense-set', arg: id + ':Approved' }) : O.btn('Close', { act: 'close' });
    O.openOverlay(O.drawer(e.title, e.unit + ' · ' + e.who, body, foot));
  };
  A['expense-set'] = function (arg) {
    var p = arg.split(':'), e = S().expenses.find(function (x) { return x.id === p[0]; });
    e.status = p[1];
    O.logAction((p[1] === 'Approved' ? 'Approved' : 'Rejected') + ' an expense', e.title + ' · ' + fmt(e.amount), p[1] === 'Approved' ? 'positive' : 'critical', p[1]);
    done(e.title + ' ' + p[1].toLowerCase());
  };
  A['log-expense'] = function () {
    var body = field('What was it for', input('le-title', 'Diesel 40 litres', 'autofocus')) + field('Unit', sel('le-unit', S().units.map(function (u) { return u.name; }), 'Ikoyi 4A')) +
      '<div class="row2">' + field('Amount', input('le-amount', fmt(50000), 'inputmode="numeric"')) + field('Paid by', sel('le-who', ['Tola', 'Sunday', 'Blessing', 'Funmi', 'Amaka'], 'Tola')) + '</div>' +
      '<div class="field"><span class="flabel">Receipt</span><button type="button" class="file" data-act="soon" data-arg="Uploading a receipt" style="width:100%"><span class="thumb">' + icon('upload') + '</span><span class="stack"><span class="strong">Add a photo of the receipt</span><span class="muted sm">JPG, PNG or PDF</span></span></button></div>';
    O.openOverlay(O.drawer('Log expense', 'Charged to the unit’s running costs', body, O.btn('Cancel', { act: 'close' }) + O.btn('Save expense', { style: 'primary', act: 'expense-save' })));
  };
  A['expense-save'] = function () {
    var title = val('le-title'), a = money(val('le-amount'));
    if (!title || !a) return;
    S().expenses.unshift({ id: 'e' + Date.now(), title: title, who: val('le-who'), unit: val('le-unit'), date: 'Today', amount: a, status: 'Approved', session: true });
    O.logAction('Logged an expense', title + ' · ' + fmt(a), 'positive', 'Saved');
    if (S().role === 'manager' && O.route().page !== 'finance') O.go('#/finance');
    done('Expense saved to ' + val('le-unit'));
  };

  /* Delegated access (owner) */
  A['give-access'] = function () {
    var powers = O.POWERS.map(function (p) {
      return '<div class="kv" style="padding:12px 0"><span class="stack"><span class="strong">' + esc(p.label) + '</span><span class="muted sm">' + esc(p.note) + '</span></span><button type="button" class="toggle' + (p.on ? ' on' : '') + '" data-act="power" data-arg="' + p.key + '" role="switch" aria-checked="' + p.on + '" aria-label="' + esc(p.label) + '"' + (p.locked ? ' disabled' : '') + '></button></div>';
    }).join('');
    var html = '<div class="dialog" role="dialog" aria-label="Give access"><div class="drawer-head"><div class="stack"><span class="panel-title">Give Tola Bello access</span><span class="muted sm">Manager · while you are away</span></div><button type="button" class="icon-btn ghost" data-act="close" aria-label="Close">' + icon('close') + '</button></div>' +
      '<div class="drawer-body">' + field('Access ends', sel('ga-until', [['20 Dec, 6:00 pm', 'In 3 days · 20 Dec, 6:00 pm'], ['24 Dec, 6:00 pm', 'In 7 days · 24 Dec, 6:00 pm'], ['31 Dec, 6:00 pm', 'In 14 days · 31 Dec, 6:00 pm']], '24 Dec, 6:00 pm')) +
      '<div class="field"><span class="flabel">They can</span><div class="rows">' + powers + '</div></div></div>' +
      '<div class="drawer-foot">' + O.btn('Cancel', { act: 'close' }) + O.btn('Give access', { style: 'primary', act: 'access-go' }) + '</div></div>';
    O.openOverlay(html, true);
  };
  A.power = function (k, el) { var on = !el.classList.contains('on'); el.classList.toggle('on', on); el.setAttribute('aria-checked', String(on)); };
  A['access-go'] = function () {
    var powers = Array.prototype.slice.call(document.querySelectorAll('.toggle.on')).map(function (t) { return t.dataset.arg; });
    if (!powers.length) return O.toast('Pick at least one thing Tola can do', 'warn');
    S().delegation = { to: 'Tola Bello', until: val('ga-until'), powers: powers }; S().log = [];
    done('Tola Bello has access until ' + val('ga-until').split(',')[0]);
  };
  A.revoke = function () { S().delegation = null; S().log = []; done('Access revoked. Tola is back to the Manager role.'); };

  A['send-statement'] = function (key) {
    var L = S().landlords[key]; L.snap = {};
    S().units.forEach(function (u) { if (u.landlord === key && S().extra[u.name]) L.snap[u.name] = S().extra[u.name]; });
    L.status = 'Sent'; L.sent = 'Sent today on WhatsApp';
    O.logAction('Sent a landlord statement', L.name, 'positive', 'Sent');
    done('Statement sent to ' + L.name + ' on WhatsApp');
  };
})();
