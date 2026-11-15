/* Dépenses : tarifs et paiements (payé / acompte / à payer sur place / à payer) pour les vols, l'hébergement, les transports
   et les dépenses libres. Données : S.pays (vols), S.stays[].price/cur/pay/paidAmt, S.circuit.tinfo[id].amount/cur/pay/paidAmt, S.exp (libres).
   Les totaux sont calculés par devise (pas de conversion automatique entre devises). */
(() => {
  const A = window.Omra; if (!A) return;
  const { $, $$, esc, S, save, t } = A;
  const CURS = ['EUR', 'CHF', 'SAR', 'USD', 'GBP'];
  const PAYS = ['todo', 'paid', 'partial', 'onsite'];
  const PAY_IC = { todo: '⏳', paid: '✅', partial: '🔸', onsite: '📍' };
  const PAY_KEY = { todo: 'pay_todo', paid: 'pay_paid', partial: 'pay_partial', onsite: 'pay_onsite' };
  const num = v => { const n = parseFloat(String(v == null ? '' : v).replace(',', '.').replace(/[^\d.\-]/g, '')); return isFinite(n) ? n : 0; };
  const loc = () => (S.lang === 'ar' ? 'ar-SA-u-nu-latn' : S.lang);
  const nf = n => new Intl.NumberFormat(loc(), { maximumFractionDigits: 2 }).format(n);
  const cityName = id => (typeof CITIES !== 'undefined' && CITIES[id] ? (CITIES[id].n[S.lang] || CITIES[id].n.fr) : id);
  const shortD = s => (s ? new Date(s + 'T00:00:00').toLocaleDateString(loc(), { day: 'numeric', month: 'short' }) : '');

  /* ---- champs réutilisables (formulaires hôtel, transport, dépense) ---- */
  const fields = (p, v = {}) => {
    const pay = PAYS.includes(v.pay) ? v.pay : 'todo';
    return `<div class="row" style="gap:8px;margin-top:6px"><div class="grow"><label>${t('pay_amount')}</label><input id="${p}-amt" inputmode="decimal" value="${esc(v.amount || '')}" style="width:100%"></div>
      <div><label>${t('currency')}</label><select id="${p}-cur">${CURS.map(c => `<option ${c === (v.cur || 'EUR') ? 'selected' : ''}>${c}</option>`).join('')}</select></div></div>
      <div class="row" style="gap:8px;margin-top:6px"><div class="grow"><label>${t('pay_status')}</label><select id="${p}-pay" style="width:100%">${PAYS.map(k => `<option value="${k}" ${pay === k ? 'selected' : ''}>${PAY_IC[k]} ${esc(t(PAY_KEY[k]))}</option>`).join('')}</select></div>
        <div class="grow" id="${p}-pw" ${pay === 'partial' ? '' : 'hidden'}><label>${t('pay_paid_amt')}</label><input id="${p}-paid" inputmode="decimal" value="${esc(v.paidAmt || '')}" style="width:100%"></div></div>`;
  };
  const wire = (root, p) => { const s = $('#' + p + '-pay', root), w = $('#' + p + '-pw', root); if (s && w) s.onchange = () => { w.hidden = s.value !== 'partial'; }; };
  const read = (root, p) => ({ amount: num(($('#' + p + '-amt', root) || {}).value), cur: ($('#' + p + '-cur', root) || {}).value || 'EUR', pay: ($('#' + p + '-pay', root) || {}).value || 'todo', paidAmt: num(($('#' + p + '-paid', root) || {}).value) });

  /* ---- lignes (toutes les sources) ---- */
  S.pays = S.pays || {};
  const lines = () => {
    const out = [], J = S.journey || {};
    const flight = (key, label, sub) => out.push({ key, cat: 'flight', icon: '✈️', label, sub, read: () => S.pays[key] || {}, write: v => { S.pays[key] = v; save('pays'); } });
    flight('flight-out', `${t('pay_fl_out')}${J.noOut ? ' · ' + J.noOut : ''}`, shortD(J.date1));
    flight('flight-ret', `${t('pay_fl_ret')}${J.noRet ? ' · ' + J.noRet : ''}`, shortD(J.date2));
    const nightsOf = (a, b) => (a && b ? Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 864e5) : 0);
    const perNight = (amount, n) => (num(amount) && n > 0 ? ` · ≈ ${nf(Math.round(num(amount) / n))}/${t('pay_night')}` : '');
    [...(S.stays || [])].sort((a, b) => (a.in || '9').localeCompare(b.in || '9')).forEach(s => { const n = nightsOf(s.in, s.out); out.push({ key: 'stay-' + s.id, cat: 'stay', icon: '🏨', label: s.name || cityName(s.city), hasName: true, name: s.name || '',
      sub: `${cityName(s.city)}${s.in && s.out ? ' · ' + shortD(s.in) + ' → ' + shortD(s.out) + ' · ' + n + ' ' + t('nights') : ''}${perNight(s.price, n)}`,
      read: () => ({ amount: num(s.price), cur: s.cur, pay: s.pay, paidAmt: s.paidAmt }), write: v => { if (v.name !== undefined) s.name = v.name; s.price = v.amount ? String(v.amount) : ''; s.cur = v.cur; s.pay = v.pay; s.paidAmt = v.paidAmt; save('stays'); } }); });
    /* étapes du circuit sans hébergement : ligne à renseigner (créée au premier enregistrement) */
    if (S.circuit) S.circuit.stages.filter(st => !(S.stays || []).some(x => x.city === st.city && x.in && x.out && x.in < st.out && x.out > st.in)).forEach(st => {
      const n = nightsOf(st.in, st.out);
      out.push({ key: 'stage-' + st.id, cat: 'stay', icon: '🏨', label: `${cityName(st.city)} · ${t('pay_no_hotel')}`, hasName: true, name: '', sub: `${shortD(st.in)} → ${shortD(st.out)} · ${n} ${t('nights')}`,
        read: () => ({}), write: v => { S.stays = S.stays || []; S.stays.push({ id: 's' + Date.now(), city: st.city, name: v.name || '', status: 'todo', in: st.in, out: st.out, addr: '', link: '', ref: '', phone: '', notes: '', price: v.amount ? String(v.amount) : '', cur: v.cur, pay: v.pay, paidAmt: v.paidAmt }); save('stays'); } });
    });
    const c = S.circuit;
    if (c) c.transports.filter(x => x.mode !== 'arrive' && x.mode !== 'leave').forEach(x => {
      const m = (c.tmode || {})[x.id] || x.mode, inf = (c.tinfo || {})[x.id] || {}, ic = A.circuit ? A.circuit.icon(x) : '🚆';
      const name = x.custom ? (inf.label || (A.circuit ? A.circuit.label(x) : '')) : `${cityName(x.from)} → ${cityName(x.to)}`;
      out.push({ key: 'tr-' + x.id, cat: 'transport', icon: ic, label: name, sub: `${shortD(x.date)}${A.circuit ? ' · ' + A.circuit.label(x) : ''}`,
        read: () => ({ amount: inf.amount != null && inf.amount !== '' ? num(inf.amount) : num(inf.price), cur: inf.cur, pay: inf.pay, paidAmt: inf.paidAmt }),
        write: v => { const cc = S.circuit; cc.tinfo = cc.tinfo || {}; const o = (cc.tinfo[x.id] = cc.tinfo[x.id] || {}); o.amount = v.amount || ''; o.price = ''; o.cur = v.cur; o.pay = v.pay; o.paidAmt = v.paidAmt; save('circuit'); } });
    });
    (S.exp || []).forEach(e => out.push({ key: 'exp-' + e.id, cat: 'other', icon: '🧾', label: e.label, sub: '', manual: true,
      read: () => ({ amount: e.amount, cur: e.cur, pay: e.pay || 'paid', paidAmt: e.paidAmt }), write: v => { e.amount = v.amount; e.cur = v.cur; e.pay = v.pay; e.paidAmt = v.paidAmt; save('exp'); },
      remove: () => { S.exp = S.exp.filter(x => x.id !== e.id); save('exp'); } }));
    return out;
  };
  /* part payée / à payer / sur place d'une ligne */
  const split = v => {
    const a = num(v.amount), pay = PAYS.includes(v.pay) ? v.pay : 'todo';
    if (!a) return { total: 0, paid: 0, due: 0, onsite: 0 };
    if (pay === 'paid') return { total: a, paid: a, due: 0, onsite: 0 };
    if (pay === 'onsite') return { total: a, paid: 0, due: 0, onsite: a };
    if (pay === 'partial') { const p = Math.min(a, num(v.paidAmt)); return { total: a, paid: p, due: a - p, onsite: 0 }; }
    return { total: a, paid: 0, due: a, onsite: 0 };
  };
  const paidOf = e => split({ amount: e.amount, pay: e.pay || 'paid', paidAmt: e.paidAmt }).paid;
  const fmtBy = (map, key) => { const parts = Object.entries(map).filter(([, v]) => v[key] > 0).map(([c, v]) => `${nf(v[key])} ${c}`); return parts.length ? parts.join(' · ') : '—'; };

  A.pay = { fields, wire, read, num, split, paidOf, PAY_IC };

  A.views.expenses = el => {
    let filter = 'all', openKey = A.payOpen || null, adding = false; A.payOpen = null;
    const draw = () => {
      const all = lines();
      const by = {};
      all.forEach(l => { const v = l.read(), s = split(v), c = v.cur || 'EUR'; const b = (by[c] = by[c] || { total: 0, paid: 0, due: 0, onsite: 0 }); Object.keys(s).forEach(k => { b[k] += s[k]; }); });
      const missing = all.filter(l => !num(l.read().amount) && !l.manual).length;
      const noHotel = all.filter(l => l.key.startsWith('stage-')).length;
      const pass = l => { const v = l.read(); const p = PAYS.includes(v.pay) ? v.pay : 'todo'; return filter === 'all' || (filter === 'paid' && p === 'paid') || (filter === 'due' && (p === 'todo' || p === 'partial')) || (filter === 'onsite' && p === 'onsite'); };
      const FIL = [['all', t('pay_f_all')], ['paid', '✅ ' + t('pay_paid')], ['due', '⏳ ' + t('pay_f_due')], ['onsite', '📍 ' + t('pay_onsite')]];
      const CATS = [['flight', '✈️ ' + t('pay_c_flight')], ['stay', '🏨 ' + t('pay_c_stay')], ['transport', '🚆 ' + t('pay_c_transport')], ['other', '🧾 ' + t('pay_c_other')]];
      const row = l => {
        const v = l.read(), s = split(v), p = PAYS.includes(v.pay) ? v.pay : 'todo', on = openKey === l.key;
        return `<div class="sitem-tr ${p === 'paid' ? 'done' : ''}"><div role="button" tabindex="0" data-ln="${esc(l.key)}" style="cursor:pointer"><div class="row" style="gap:8px;flex-wrap:nowrap"><b class="grow">${l.icon} ${esc(l.label)}</b><b>${num(v.amount) ? nf(num(v.amount)) + ' ' + esc(v.cur || 'EUR') : '<span class="muted">' + t('pay_set') + '</span>'}</b></div>
          <div class="row" style="gap:6px;margin-top:2px;flex-wrap:nowrap"><span class="muted grow" style="font-size:13px">${esc(l.sub)}</span><span class="pill ${p === 'paid' ? 'ok' : ''}">${PAY_IC[p]} ${esc(t(PAY_KEY[p]))}${p === 'partial' && s.total ? ` · ${nf(s.paid)}/${nf(s.total)}` : ''}</span></div></div>
          ${on ? `<div class="sfact">${l.hasName ? `<label>${t('st_name')}</label><input id="ed-name" value="${esc(l.name || '')}" placeholder="${esc(t('st_name_ph'))}" style="width:100%">` : ''}${fields('ed', v)}<div class="row" style="gap:8px;margin-top:10px"><button type="button" id="ed-save">✓ ${t('save')}</button><button type="button" class="ghost" id="ed-cancel">${t('cancel')}</button>${l.manual ? `<button type="button" class="danger" id="ed-del">${t('delete')}</button>` : ''}</div></div>` : ''}</div>`;
      };
      const sections = CATS.map(([k, h]) => { const ls = all.filter(l => l.cat === k && pass(l)); return ls.length ? `<h3 class="subh">${h}</h3>${ls.map(row).join('')}` : ''; }).join('');
      el.innerHTML = `<h2>💶 ${t('pay_title')}</h2>
        <div class="card"><div class="cards" style="margin:0">
          <div class="pcard" style="min-height:0"><span class="muted">✅ ${t('pay_paid')}</span><b>${fmtBy(by, 'paid')}</b></div>
          <div class="pcard" style="min-height:0"><span class="muted">⏳ ${t('pay_rest')}</span><b>${fmtBy(by, 'due')}</b></div>
          <div class="pcard" style="min-height:0"><span class="muted">📍 ${t('pay_onsite')}</span><b>${fmtBy(by, 'onsite')}</b></div>
          <div class="pcard" style="min-height:0"><span class="muted">Σ ${t('pay_total')}</span><b>${fmtBy(by, 'total')}</b></div></div>
          ${missing ? `<p class="muted" style="margin:8px 0 0;font-size:13px">ℹ️ ${missing} ${t('pay_missing')}</p>` : ''}${S.circuit ? '' : `<p style="margin:8px 0 0"><a class="btn" href="#/stay">🗺️ ${t('ci_load')} →</a></p>`}<p class="muted" style="margin:6px 0 0;font-size:12px">${t('pay_note')}</p></div>
        <div class="chips" style="margin:8px 0">${FIL.map(([k, v]) => `<button type="button" class="chip ${filter === k ? 'on' : ''}" data-pf="${k}">${esc(v)}</button>`).join('')}</div>
        ${noHotel ? `<button type="button" class="ghost" id="mkStays" style="width:100%;margin:8px 0">🏨 ${t('pay_mk_stays')} (${noHotel})</button>` : ''}
        ${sections || `<p class="muted">${t('pay_none')}</p>`}
        ${adding ? `<div class="card"><b>＋ ${t('pay_add')}</b><label style="margin-top:6px;display:block">${t('label')}</label><input id="nw-label" style="width:100%">${fields('nw', { pay: 'paid' })}<div class="row" style="gap:8px;margin-top:10px"><button type="button" id="nw-save">✓ ${t('save')}</button><button type="button" class="ghost" id="nw-cancel">${t('cancel')}</button></div></div>`
          : `<button type="button" id="nw-add" style="width:100%;margin-top:10px">＋ ${t('pay_add')}</button>`}
        <p style="margin-top:14px"><a class="ghost btn" href="#/tools">🧰 ${t('pay_budget')}</a></p>`;
      $$('[data-pf]', el).forEach(b => b.onclick = () => { filter = b.dataset.pf; draw(); });
      $$('[data-ln]', el).forEach(b => b.onclick = () => { openKey = openKey === b.dataset.ln ? null : b.dataset.ln; adding = false; draw(); });
      const cur = all.find(l => l.key === openKey);
      if (cur) { wire(el, 'ed'); $('#ed-cancel', el).onclick = () => { openKey = null; draw(); }; $('#ed-save', el).onclick = () => { { const v = read(el, 'ed'); if (cur.hasName) v.name = ($('#ed-name', el).value || '').trim(); cur.write(v); } openKey = null; A.toast('✓ ' + t('saved')); draw(); }; const d = $('#ed-del', el); if (d) d.onclick = () => { if (confirm(t('pay_del_confirm'))) { cur.remove(); openKey = null; draw(); } }; }
      const mk = $('#mkStays', el); if (mk) mk.onclick = () => { all.filter(l => l.key.startsWith('stage-')).forEach(l => l.write({ amount: 0, cur: 'EUR', pay: 'todo', paidAmt: 0 })); A.toast('✓ ' + t('saved')); draw(); };
      const add = $('#nw-add', el); if (add) add.onclick = () => { adding = true; openKey = null; draw(); };
      if (adding) { wire(el, 'nw'); $('#nw-cancel', el).onclick = () => { adding = false; draw(); }; $('#nw-save', el).onclick = () => { const v = read(el, 'nw'); const label = ($('#nw-label', el).value || '').trim(); if (!label || !v.amount) { A.toast(t('pay_need')); return; } S.exp.push({ id: 'x' + Date.now(), label, amount: v.amount, cur: v.cur, pay: v.pay, paidAmt: v.paidAmt }); save('exp'); adding = false; draw(); }; }
    };
    draw();
  };
})();
