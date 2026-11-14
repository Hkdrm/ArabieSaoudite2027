/* Onglet Vols — expérience « appli de compagnie aérienne » :
   1) un seul écran pour ajouter le voyage (n° de vol aller/retour + dates dans un calendrier) → « Enregistrer »
   2) ensuite uniquement des cartes de vol (aller / retour) ; les détails (aéroports, heures, terminal) s'ajoutent d'un geste.
   Aucun sélecteur natif de date/heure (celui d'iOS valide la date du jour dès qu'on le touche).
   Données : S.journey (voir app.js), enregistrées localement. */
(() => {
  const A = window.Omra;
  const { $, $$, esc, S, save, t } = A;
  const AIRPORTS = { CDG: 'Paris Charles-de-Gaulle', ORY: 'Paris Orly', LYS: 'Lyon', MRS: 'Marseille', NCE: 'Nice', TLS: 'Toulouse', BOD: 'Bordeaux', NTE: 'Nantes', LIL: 'Lille', BRU: 'Bruxelles', GVA: 'Genève',
    JED: 'Jeddah', MED: 'Médine', RUH: 'Riyad', DMM: 'Dammam', TIF: 'Taïf', ULH: 'AlUla' };
  const FLIGHT_RE = /^[A-Z0-9]{2}\s?\d{1,4}[A-Z]?$/;
  const pad = n => String(n).padStart(2, '0');
  const iso = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;               // dates locales (pas d'UTC : évite le décalage d'un jour)
  const day = s => new Date(s + 'T00:00:00');
  const todayStr = () => { const n = new Date(); return iso(n.getFullYear(), n.getMonth(), n.getDate()); };
  const iata = v => (v || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
  const fmtTime = v => { const d = (v || '').replace(/\D/g, '').slice(0, 4); return d.length > 2 ? d.slice(0, 2) + ':' + d.slice(2) : d; };
  const loc = () => S.lang === 'ar' ? 'ar-SA-u-nu-latn' : S.lang;
  const fmtDate = s => s ? day(s).toLocaleDateString(loc(), { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const daysTo = s => Math.round((day(s) - day(todayStr())) / 864e5);
  const nights = (a, b) => Math.round((day(b) - day(a)) / 864e5);

  A.views.trip = el => {
    S.journey = S.journey || {};
    const J = S.journey;
    delete J.date2Rejected;
    const saved = () => !!(J.date1 && J.date2 && J.date2 > J.date1);
    if (!J.from) J.from = 'GVA';                                // départ par défaut : Genève
    let mode = saved() ? 'card' : 'ask';                          // ask → numbers (si billet) → dates → card
    let has = !!(J.noOut || J.noRet) || !saved();                  // a un billet ?
    let editLeg = null;                                           // 'out' | 'ret' : panneau de détails ouvert
    const form = { noOut: J.noOut || '', noRet: J.noRet || '', ref: J.ref || '', d1: J.date1 || '', d2: J.date2 || '' };
    const base = form.d1 ? day(form.d1) : new Date();
    const view = { y: base.getFullYear(), m: base.getMonth() };
    const set = (k, v) => { J[k] = v; save('journey'); };

    /* ---------- écran 1 : ajouter le voyage ---------- */
    const formOk = () => form.d1 && form.d2 && form.d2 > form.d1;

    const calendar = () => {
      const first = new Date(view.y, view.m, 1), n = new Date(view.y, view.m + 1, 0).getDate();
      const offset = (first.getDay() + 6) % 7, today = todayStr();
      const wd = [...Array(7)].map((_, i) => new Date(2024, 0, 1 + i).toLocaleDateString(loc(), { weekday: 'narrow' }));
      let cells = wd.map(w => `<div class="cal-wd">${esc(w)}</div>`).join('') + '<div></div>'.repeat(offset);
      for (let d = 1; d <= n; d++) {
        const s = iso(view.y, view.m, d);
        const cls = [s === form.d1 || s === form.d2 ? 'sel' : '', form.d1 && form.d2 && s > form.d1 && s < form.d2 ? 'range' : '', s === today ? 'today' : ''].join(' ');
        cells += `<button type="button" class="cal-day ${cls}" data-d="${s}" ${s < today ? 'disabled' : ''}>${d}</button>`;
      }
      const prev = S.lang === 'ar' ? '›' : '‹', next = S.lang === 'ar' ? '‹' : '›';
      return `<div class="cal-head"><button type="button" class="ghost sm" id="calPrev" aria-label="prev">${prev}</button>
        <b>${esc(first.toLocaleDateString(loc(), { month: 'long', year: 'numeric' }))}</b>
        <button type="button" class="ghost sm" id="calNext" aria-label="next">${next}</button></div><div class="cal-grid">${cells}</div>`;
    };
    const pick = s => {
      if (!form.d1 || form.d2) { form.d1 = s; form.d2 = ''; }
      else if (s > form.d1) form.d2 = s;
      else { form.d1 = s; A.toast(t('err_return')); }
    };

    const dots = (i, n) => n > 1 ? `<div class="steps">${[...Array(n)].map((_, k) => `<span class="${k < i ? 'on' : ''}"></span>`).join('')}</div><p class="muted" style="text-align:center;margin:0 0 8px">${t('step_word')} ${i}/${n}</p>` : '';

    /* écran 0 : « Avez-vous déjà votre billet ? » */
    const drawAsk = () => {
      el.innerHTML = `<h2>${t('my_trip')}</h2><div class="card mini" style="text-align:center">
        <div style="font-size:56px">🎫</div><h3 style="font-size:20px">${t('ask_title')}</h3><p class="muted">${t('ask_sub')}</p>
        <div class="form" style="margin-top:14px"><button type="button" id="yes" style="padding:14px">${t('yes_ticket')}</button>
          <button type="button" class="ghost" id="no" style="padding:14px">${t('no_ticket')}</button></div></div>`;
      $('#yes', el).onclick = () => { has = true; mode = 'numbers'; draw(); };
      $('#no', el).onclick = () => { has = false; mode = 'dates'; draw(); };
    };

    /* écran 1 : numéros de vol (si billet) */
    const drawNumbers = () => {
      el.innerHTML = `<h2>${t('my_trip')}</h2>${dots(1, 2)}<div class="card mini"><h3>✈️ ${t('ticket_title')}</h3><p class="muted">${t('ticket_hint')}</p>
        <label>🛫 ${t('no_out')}</label><input id="fNoOut" value="${esc(form.noOut)}" placeholder="SV 124" autocapitalize="characters" style="width:100%;text-transform:uppercase;margin-bottom:10px">
        <label>🛬 ${t('no_ret')}</label><input id="fNoRet" value="${esc(form.noRet)}" placeholder="SV 125" autocapitalize="characters" style="width:100%;text-transform:uppercase;margin-bottom:10px">
        <label>${t('booking_ref')} <span class="muted">(${t('local_only')})</span></label><input id="fRef" value="${esc(form.ref)}" style="width:100%"></div>
        <div class="stickybar"><button type="button" class="ghost" id="back">${t('back')}</button><button type="button" id="next" style="flex:1">${t('next')} →</button>
          ${saved() ? `<button type="button" class="ghost" id="cancelTrip">${t('cancel')}</button>` : ''}</div>`;
      $('#fNoOut', el).oninput = e => { form.noOut = e.target.value.toUpperCase(); };
      $('#fNoRet', el).oninput = e => { form.noRet = e.target.value.toUpperCase(); };
      $('#fRef', el).oninput = e => { form.ref = e.target.value; };
      $('#back', el).onclick = () => { mode = 'ask'; draw(); };
      $('#next', el).onclick = () => { mode = 'dates'; draw(); };
      const cn = $('#cancelTrip', el); if (cn) cn.onclick = () => { mode = 'card'; draw(); };
    };

    /* écran 2 : dates (calendrier) + enregistrer */
    const drawDates = () => {
      const hint = !form.d1 ? t('cal_start') : !form.d2 ? t('cal_end') : '';
      const chosen = form.d1 ? `<div style="margin-top:8px"><b>🛫 ${esc(fmtDate(form.d1))}</b>${form.d2 ? `<br><b>🛬 ${esc(fmtDate(form.d2))}</b> <span class="muted">(${nights(form.d1, form.d2)} ${t('nights')})</span>` : ''}</div>` : '';
      const find = formOk() && !has
        ? `<div style="margin-top:12px"><a class="btn" href="https://www.google.com/travel/flights?q=${encodeURIComponent(`Flights from ${J.from || 'GVA'} to Saudi Arabia on ${form.d1} through ${form.d2}`)}" target="_blank" rel="noopener">🔍 ${t('search_hint')} ↗</a>
           <p class="muted" style="margin:6px 0 0">${t('search_after')}</p></div>` : '';
      el.innerHTML = `<h2>${t('my_trip')}</h2>${has ? dots(2, 2) : ''}<div class="card mini"><h3>📅 ${t('dates_title')}</h3>${calendar()}<p class="muted" style="margin:8px 0 0">${hint}</p>${chosen}${find}</div>
        <div class="stickybar"><button type="button" class="ghost" id="back">${t('back')}</button><button type="button" id="saveTrip" style="flex:1" ${formOk() ? '' : 'disabled'}>✓ ${t('save_trip')}</button></div>`;
      $$('.cal-day', el).forEach(b => b.onclick = () => { pick(b.dataset.d); const d = day(b.dataset.d); view.y = d.getFullYear(); view.m = d.getMonth(); draw(); });
      $('#calPrev', el).onclick = () => { view.m--; if (view.m < 0) { view.m = 11; view.y--; } draw(); };
      $('#calNext', el).onclick = () => { view.m++; if (view.m > 11) { view.m = 0; view.y++; } draw(); };
      $('#back', el).onclick = () => { mode = has ? 'numbers' : 'ask'; draw(); };
      $('#saveTrip', el).onclick = () => {
        if (!formOk()) return;
        Object.assign(J, { date1: form.d1, date2: form.d2, noOut: form.noOut.trim(), noRet: form.noRet.trim(), ref: form.ref.trim() });
        save('journey'); S.trip = { start: '', end: '' }; save('trip');
        mode = 'card'; A.toast(t('dates_ok')); draw(); scrollTo(0, 0);
      };
    };

    /* ---------- écran 2 : cartes de vol ---------- */
    const leg = k => {
      const o = k === 'out';
      return o ? { no: J.noOut, date: J.date1, from: J.from, to: J.to, dep: J.depOut, arr: J.arrOut, term: J.termOut }
               : { no: J.noRet, date: J.date2, from: J.retFrom || J.to, to: J.retTo || J.from, dep: J.depRet, arr: J.arrRet, term: J.termRet };
    };
    const keys = k => k === 'out' ? { no: 'noOut', from: 'from', to: 'to', dep: 'depOut', arr: 'arrOut', term: 'termOut' }
                                  : { no: 'noRet', from: 'retFrom', to: 'retTo', dep: 'depRet', arr: 'arrRet', term: 'termRet' };
    const chip = date => { const d = daysTo(date); return d > 0 ? `J-${d}` : d === 0 ? t('today') : t('past_lbl'); };

    const legCard = k => {
      const L = leg(k), o = k === 'out', K = keys(k);
      const info = FLIGHT_RE.test(L.no || '') ? `<a class="btn" href="https://www.google.com/search?q=${encodeURIComponent('vol ' + L.no.replace(/\s+/g, ''))}" target="_blank" rel="noopener">ℹ️ ${t('flight_info')}</a>` : '';
      const panel = editLeg === k ? `<div class="legedit">
        <div class="row"><div class="grow"><label>${t('flight_no')}</label><input data-f="no" value="${esc(L.no || '')}" placeholder="SV 124" autocapitalize="characters" style="width:100%;text-transform:uppercase"></div></div>
        <div class="row" style="margin-top:6px"><div class="grow"><label>${t('from_lbl')}</label><input data-f="from" list="apts" value="${esc(L.from || '')}" maxlength="3" placeholder="GVA" style="width:100%;text-transform:uppercase"></div>
          <div class="grow"><label>${t('to_lbl')}</label><input data-f="to" list="apts" value="${esc(L.to || '')}" maxlength="3" placeholder="JED" style="width:100%;text-transform:uppercase"></div></div>
        <div class="row" style="margin-top:6px"><div class="grow"><label>${t('dep_time')}</label><input data-f="dep" inputmode="numeric" value="${esc(L.dep || '')}" placeholder="10:30" maxlength="5" style="width:100%"></div>
          <div class="grow"><label>${t('arr_time')}</label><input data-f="arr" inputmode="numeric" value="${esc(L.arr || '')}" placeholder="17:05" maxlength="5" style="width:100%"></div>
          <div class="grow"><label>${t('terminal')}</label><input data-f="term" value="${esc(L.term || '')}" placeholder="2" style="width:100%"></div></div>
        <button type="button" id="legOk" style="margin-top:10px">${t('done_btn')}</button></div>` : '';
      return `<div class="card flight"><div class="row"><span class="pill">${o ? '🛫 ' + t('outbound') : '🛬 ' + t('inbound')}</span>
          <b class="grow" style="font-size:18px">${L.no ? esc(L.no) : `<a href="#" data-edit="${k}">＋ ${t('add_flight_no')}</a>`}</b><span class="pill">${esc(chip(L.date))}</span></div>
        <div class="route"><div><div class="code">${esc(L.from || '—')}</div><div class="time">${esc(L.dep || '--:--')}</div></div><div class="plane">✈️</div>
          <div style="text-align:end"><div class="code">${esc(L.to || '—')}</div><div class="time">${esc(L.arr || '--:--')}</div></div></div>
        <div class="muted">📅 ${esc(fmtDate(L.date))}${L.term ? ' · ' + t('terminal') + ' ' + esc(L.term) : ''}</div>
        <div class="row" style="margin-top:10px">${info}<button type="button" class="ghost sm" data-edit="${k}">✏️ ${t('details')}</button></div>${panel}</div>`;
    };

    const drawCard = () => {
      const d = daysTo(J.date1), end = daysTo(J.date2);
      const hero = d > 0 ? `<small>${t('countdown')}</small><div class="big">${d}</div><small>${t('days')} · ${nights(J.date1, J.date2)} ${t('nights')}</small>`
        : end >= 0 ? `<div class="big">✈️</div><small>${t('trip_ongoing')}</small>` : `<div class="big">✓</div><small>${t('trip_over')}</small>`;
      el.innerHTML = `<h2>${t('my_trip')}</h2><datalist id="apts">${Object.entries(AIRPORTS).map(([c, n]) => `<option value="${c}">${esc(n)}</option>`).join('')}</datalist>
        <div class="card hero">${hero}</div>${legCard('out')}${legCard('ret')}
        ${J.ref ? `<div class="card"><label>${t('booking_ref')}</label><b>${esc(J.ref)}</b></div>` : ''}
        <div class="row"><button type="button" class="ghost" id="editTrip">✏️ ${t('edit_trip')}</button><button type="button" class="danger" id="delTrip">${t('delete_trip')}</button></div>`;
      $$('[data-edit]', el).forEach(b => b.onclick = e => { e.preventDefault(); editLeg = editLeg === b.dataset.edit ? null : b.dataset.edit; draw(); });
      const ok = $('#legOk', el);
      if (ok) ok.onclick = () => { editLeg = null; draw(); };
      const K = editLeg && keys(editLeg);
      $$('[data-f]', el).forEach(i => i.oninput = () => {            // enregistré à chaque frappe, sans redessiner (le clavier reste ouvert)
        const f = i.dataset.f;
        let v = i.value;
        if (f === 'no') v = v.toUpperCase(); else if (f === 'from' || f === 'to') v = iata(v); else if (f === 'dep' || f === 'arr') { v = fmtTime(v); i.value = v; }
        set(K[f], v);
        if (f === 'from' || f === 'to') i.value = v;
      });
      $('#editTrip', el).onclick = () => {
        Object.assign(form, { noOut: J.noOut || '', noRet: J.noRet || '', ref: J.ref || '', d1: J.date1 || '', d2: J.date2 || '' });
        const b = form.d1 ? day(form.d1) : new Date(); view.y = b.getFullYear(); view.m = b.getMonth();
        mode = 'numbers'; has = true; editLeg = null; draw();
      };
      $('#delTrip', el).onclick = () => {
        if (!confirm(t('confirm_delete_trip'))) return;
        for (const k of Object.keys(J)) delete J[k];
        J.from = 'GVA'; S.trip = { start: '', end: '' }; save('trip'); save('journey');
        Object.assign(form, { noOut: '', noRet: '', ref: '', d1: '', d2: '' });
        mode = 'ask'; has = true; editLeg = null; draw();
      };
    };

    const draw = () => (mode === 'card' && saved() ? drawCard() : mode === 'numbers' ? drawNumbers() : mode === 'dates' ? drawDates() : drawAsk());
    draw();
  };
})();
