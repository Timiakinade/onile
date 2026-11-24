/* Onile prototype: first run onboarding. Four steps, always skippable. */
(function () {
  'use strict';
  var O = window.O, A = O.ACTS, S = function () { return O.S; };
  var esc = O.esc;
  var STEPS = 4;

  /* Direct role links skip onboarding, so a test task always starts on Overview. */
  if (new URLSearchParams(location.search).get('role')) { O.S.onboarded = true; O.save(); }

  function ob() {
    var s = S();
    if (!s.ob) s.ob = { step: 1, biz: 'Omoakin Stays', count: '18', areas: 'Lekki, Ikoyi, Victoria Island, Yaba', mode: 'sample', team: [{ name: 'Tola Bello', role: 'Manager' }, { name: 'Ngozi Eze', role: 'Accountant' }] };
    return s.ob;
  }
  function val(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; }

  function collect() {
    var d = ob(), step = d.step;
    if (step === 1) { d.biz = val('ob-biz') || d.biz; d.count = val('ob-count') || d.count; d.areas = val('ob-areas') || d.areas; }
    if (step === 3) {
      d.team.forEach(function (t, i) { var v = val('ob-name-' + i); if (v) t.name = v; });
    }
  }

  var ROLE_NOTE = {
    Manager: 'Records payments and runs the day. Cannot confirm money.',
    Accountant: 'Confirms transfers and sends statements. Cannot book stays.'
  };

  function progress(step) {
    var h = '';
    for (var i = 1; i <= STEPS; i++) h += '<span class="ob-pill' + (i === step ? ' now' : '') + (i <= step ? ' on' : '') + '"></span>';
    return '<div class="ob-prog"><div class="ob-pills">' + h + '</div><span class="ob-count">Step ' + step + ' of ' + STEPS + '</span></div>';
  }
  function field(label, id, value) {
    return '<div class="field"><label for="' + id + '">' + esc(label) + '</label><input class="input" id="' + id + '" value="' + esc(value) + '"></div>';
  }
  function dot() { return '<span class="ob-dot"><span></span></span>'; }

  function body(step, d) {
    if (step === 1) {
      return field('Business name', 'ob-biz', d.biz) + field('Units you manage', 'ob-count', d.count) + field('Areas', 'ob-areas', d.areas);
    }
    if (step === 2) {
      return '<button type="button" class="ob-opt' + (d.mode === 'sample' ? ' on' : '') + '" data-act="ob-mode" data-arg="sample"><span class="strong">Use sample units</span><span class="muted sm">18 units across four areas, with bookings and payments to try.</span></button>' +
        '<button type="button" class="ob-opt' + (d.mode === 'own' ? ' on' : '') + '" data-act="ob-mode" data-arg="own"><span class="strong">Add units one by one</span><span class="muted sm">Name, area, landlord and nightly rate for each unit.</span></button>' +
        '<span class="muted sm">' + (d.mode === 'own' ? 'In this prototype we load the sample units for you, so you can try the product.' : 'You can change all of this later in Units.') + '</span>';
    }
    if (step === 3) {
      return d.team.map(function (t, i) {
        return '<div class="ob-invite"><div class="ob-invite-top"><input class="input ob-name" id="ob-name-' + i + '" value="' + esc(t.name) + '" aria-label="Name"><span class="chip t-info"><span class="dot"></span>' + esc(t.role) + '</span></div><span class="muted sm">' + ROLE_NOTE[t.role] + '</span></div>';
      }).join('') + (d.team.length < 3 ? '<button type="button" class="ob-link" data-act="ob-add">+ Add another person</button>' : '');
    }
    var rules = [['A second person confirms', 'A recorded payment waits until someone checks the bank app.'], ['Deposits stay out of profit', 'Caution money is held, never counted as revenue.'], ['No double bookings', 'A clash is blocked before the booking is saved.']];
    return rules.map(function (r) { return '<div class="ob-rule">' + dot() + '<span class="stack"><span class="strong">' + esc(r[0]) + '</span><span class="muted sm">' + esc(r[1]) + '</span></span></div>'; }).join('');
  }

  var HEAD = [
    null,
    ['Your business', 'Tell Onile how big the operation is.'],
    ['Add your units', 'Start with sample units, or add your own one by one.'],
    ['Invite your team', 'Each person sees only what their role needs.'],
    ['How money works', 'Three rules Onile keeps for you.']
  ];

  function renderOb() {
    var d = ob(), step = d.step, h = HEAD[step];
    var back = step > 1 ? '<button type="button" class="btn secondary" data-act="ob-back">Back</button>' : '';
    var next = '<button type="button" class="btn primary" data-act="' + (step === STEPS ? 'ob-finish' : 'ob-next') + '">' + (step === STEPS ? 'Go to Overview' : 'Continue') + '</button>';
    document.getElementById('app').innerHTML =
      '<div class="ob"><div class="ob-top"><span class="mark">' + O.MARK + '</span><span class="logo-name">Onile</span></div>' +
      '<main class="ob-card" aria-label="Set up Onile">' + progress(step) +
      '<div class="ob-head"><h1 class="ob-title">' + esc(h[0]) + '</h1><p class="muted">' + esc(h[1]) + '</p></div>' +
      '<div class="ob-body">' + body(step, d) + '</div>' +
      '<div class="ob-btns">' + back + next + '</div>' +
      '<button type="button" class="ob-skip" data-act="ob-skip">Skip to demo</button></main></div>';
    var proto = document.getElementById('proto'); if (proto) proto.innerHTML = '';
    window.scrollTo(0, 0);
  }

  /* Reset demo data keeps onboarding done, so testers are not sent back to it. */
  var baseReset = O.reset;
  var baseSeed = window.ONILE_SEED;
  O.reset = function () {
    var keep = S().onboarded === true;
    window.ONILE_SEED = function () { var s = baseSeed(); if (keep) s.onboarded = true; return s; };
    try { baseReset(); } finally { window.ONILE_SEED = baseSeed; }
  };
  A.reset = function () { O.reset(); };

  /* Replace the render function: show onboarding until it is done or skipped. */
  var baseRender = O.render;
  O.render = function () {
    if (S().onboarded === true) { baseRender(); addChecklist(); return; }
    renderOb();
  };

  function finish(skipped) {
    S().onboarded = true;
    if (!skipped) { S().checklist = true; }
    O.save();
    location.hash = '#/overview';
    O.render();
    O.toast(skipped ? 'Skipped. Sample data is loaded' : 'You are set up. Sample data is loaded', 'info');
  }

  A['ob-next'] = function () { collect(); var d = ob(); if (d.step < STEPS) d.step++; O.save(); renderOb(); };
  A['ob-back'] = function () { collect(); var d = ob(); if (d.step > 1) d.step--; O.save(); renderOb(); };
  A['ob-mode'] = function (k) { ob().mode = k; O.save(); renderOb(); };
  A['ob-add'] = function () { collect(); ob().team.push({ name: 'New teammate', role: 'Manager' }); O.save(); renderOb(); };
  A['ob-skip'] = function () { finish(true); };
  A['ob-finish'] = function () { collect(); finish(false); };
  A['ob-replay'] = function () { S().onboarded = false; delete S().ob; S().checklist = false; O.protoOpen = false; O.save(); location.hash = '#/overview'; O.render(); };
  A['ob-hide'] = function () { S().checklist = false; O.save(); var el = document.getElementById('ob-check'); if (el) el.remove(); };

  /* Setup checklist on Overview after a finished onboarding. */
  function addChecklist() {
    if (!S().checklist || O.route().page !== 'overview' || document.getElementById('ob-check')) return;
    var content = document.querySelector('.content'); if (!content) return;
    var d = ob(), team = d.team.length;
    var items = [[true, 'Business details added'], [true, 'Units loaded'], [true, 'Team invited (' + team + ')'], [false, 'Record a payment', '#/payments'], [false, 'Confirm it against the bank app', '#/payments']];
    var html = '<section class="ob-check" id="ob-check" aria-label="Setup checklist"><div class="ob-check-head"><span class="strong">Finish setting up ' + esc(d.biz) + '</span><button type="button" class="ob-link" data-act="ob-hide">Hide</button></div><div class="ob-check-list">' +
      items.map(function (it) { return (it[2] ? '<a class="ob-ci" href="' + it[2] + '" data-go="' + it[2] + '">' : '<span class="ob-ci done">') + '<span class="ob-tick' + (it[0] ? ' on' : '') + '"></span>' + esc(it[1]) + (it[2] ? '</a>' : '</span>'); }).join('') + '</div></section>';
    content.insertAdjacentHTML('afterbegin', html);
  }

  /* Prototype menu: a button to replay onboarding. */
  var baseProto = O.renderProto;
  O.renderProto = function () {
    baseProto();
    var panel = document.getElementById('proto-panel');
    if (panel && !panel.querySelector('[data-act="ob-replay"]')) {
      panel.insertAdjacentHTML('beforeend', '<div><button type="button" class="btn secondary block" data-act="ob-replay">Replay onboarding</button><div class="muted sm" style="margin-top:8px">Shows the four step first run again.</div></div>');
    }
  };
})();
