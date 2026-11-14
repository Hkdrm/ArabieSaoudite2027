/* Onglet Départ / Retour : dates choisies dans un calendrier intégré (1er toucher = départ, 2e = retour),
   puis numéro de vol / référence de réservation. Aéroports et horaires facultatifs. Tout s'enregistre automatiquement.
   Le calendrier remplace le sélecteur natif : celui d'iOS valide la date du jour dès qu'on le touche. */
(() => {
  const A = window.Omra;
  const { $, $$, esc, S, save, t } = A;
  const AIRPORTS = { CDG: 'Paris Charles-de-Gaulle', ORY: 'Paris Orly', LYS: 'Lyon', MRS: 'Marseille', NCE: 'Nice', TLS: 'Toulouse', BOD: 'Bordeaux', NTE: 'Nantes', LIL: 'Lille', BRU: 'Bruxelles', GVA: 'Genève',
    JED: 'Jeddah', MED: 'Médine', RUH: 'Riyad', DMM: 'Dammam', TIF: 'Taïf', ULH: 'AlUla' };
  const DEST = ['JED', 'MED', 'RUH', 'DMM'];
  const ORIGINS = ['GVA', 'LYS', 'CDG', 'ORY'];
  const FLIGHT_RE = /^[A-Z0-9]{2}\s?\d{1,4}[A-Z]?$/;
  const pad = n => String(n).padStart(2, '0');
  const iso = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;               // dates locales (pas d'UTC : évite le décalage d'un jour)
  const day = s => new Date(s + 'T00:00:00');
  const todayStr = () => { const n = new Date(); return iso(n.getFullYear(), n.getMonth(), n.getDate()); };
  const iata = v => (v || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
  const loc = () => S.lang === 'ar' ? 'ar-SA-u-nu-latn' : S.lang;
  const fmtDate = s => s ? day(s).toLocaleDateString(loc(), { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const yymmdd = s => s.slice(2).replace(/-/g, '');

  A.views.trip = el => {
    S.journey = S.journey || {};
    const J = S.journey;
    delete J.date2Rejected;
    const set = (k, v) => { J[k] = v; save('journey'); };
    const ok = () => J.date1 && J.date2 && J.date2 > J.date1;
    if (!J.from) set('from', 'GVA');                       // départ par défaut : Genève
    const base = J.date1 ? day(J.date1) : new Date();
    const view = { y: base.getFullYear(), m: base.getMonth() };   // mois affiché
    const draft = { d1: J.date1 || '', d2: J.date2 || '' };       // sélection en cours : enregistrée seulement après « Valider »
    let editing = !ok();                                          // calendrier ouvert tant que les dates ne sont pas validées

    const links = () => {
      const f = J.from || 'GVA', to = J.to, d1 = J.date1, d2 = J.date2;
      const g = ['Google Flights', `https://www.google.com/travel/flights?q=${encodeURIComponent(`Flights from ${f} to ${to || 'Saudi Arabia'} on ${d1} through ${d2}`)}`];
      if (!to) return [g];                                  // sans destination précise : uniquement Google Flights (pays)
      return [g,
        ['Skyscanner', `https://www.skyscanner.fr/transport/vols/${f.toLowerCase()}/${to.toLowerCase()}/${yymmdd(d1)}/${yymmdd(d2)}/`],
        ['Kayak', `https://www.kayak.fr/flights/${f}-${to}/${d1}/${d2}`]];
    };
    const track = no => FLIGHT_RE.test(no || '') ? `<a href="https://www.google.com/search?q=${encodeURIComponent('vol ' + no.replace(/\s+/g, ''))}" target="_blank" rel="noopener">${t('track')} ↗</a>` : '';

    const summary = () => {
      if (!J.date1) return '';
      const n = ok() ? Math.round((day(J.date2) - day(J.date1)) / 864e5) : 0;
      return `<div class="card hero" style="text-align:start">${J.to ? `<div style="font-size:24px;font-weight:700">${esc(J.from || '???')} → ${esc(J.to)}</div>` : ''}
        <div>🛫 ${esc(fmtDate(J.date1))}${J.noOut ? ' · ' + esc(J.noOut) : ''}</div>
        ${J.date2 ? `<div>🛬 ${esc(fmtDate(J.date2))}${J.noRet ? ' · ' + esc(J.noRet) : ''}</div>` : ''}
        ${n ? `<small>${n} ${t('nights')}</small>` : ''}</div>`;
    };

    const apt = (id, label, key, ph) => `<div class="grow"><label>${label}</label><input id="${id}" list="apts" value="${esc(J[key] || '')}" placeholder="${esc(ph)}" maxlength="3" style="width:100%;text-transform:uppercase"></div>`;

    /* ---- calendrier ---- */
    const calendar = () => {
      const first = new Date(view.y, view.m, 1), n = new Date(view.y, view.m + 1, 0).getDate();
      const offset = (first.getDay() + 6) % 7;                        // semaine commençant le lundi
      const today = todayStr();
      const wd = [...Array(7)].map((_, i) => new Date(2024, 0, 1 + i).toLocaleDateString(loc(), { weekday: 'narrow' }));   // 1er janv. 2024 = lundi
      let cells = wd.map(w => `<div class="cal-wd">${esc(w)}</div>`).join('') + '<div></div>'.repeat(offset);
      for (let d = 1; d <= n; d++) {
        const s = iso(view.y, view.m, d);
        const cls = [s === draft.d1 || s === draft.d2 ? 'sel' : '', draft.d1 && draft.d2 && s > draft.d1 && s < draft.d2 ? 'range' : '', s === today ? 'today' : ''].join(' ');
        cells += `<button type="button" class="cal-day ${cls}" data-d="${s}" ${s < today ? 'disabled' : ''}>${d}</button>`;
      }
      const prev = S.lang === 'ar' ? '›' : '‹', next = S.lang === 'ar' ? '‹' : '›';
      const hint = !draft.d1 ? t('cal_start') : !draft.d2 ? t('cal_end') : t('cal_again');
      return `<div class="cal"><div class="cal-head"><button type="button" class="ghost sm" id="calPrev" aria-label="prev">${prev}</button>
        <b>${esc(first.toLocaleDateString(loc(), { month: 'long', year: 'numeric' }))}</b>
        <button type="button" class="ghost sm" id="calNext" aria-label="next">${next}</button></div>
        <div class="cal-grid">${cells}</div></div><p class="muted" style="margin:8px 0 0">${hint}</p>`;
    };

    const pick = s => {
      if (!draft.d1 || draft.d2) { draft.d1 = s; draft.d2 = ''; }                         // nouveau départ
      else if (s > draft.d1) draft.d2 = s;                                                  // retour : strictement après le départ
      else { draft.d1 = s; A.toast(t('err_return')); }                                     // avant / même jour : on déplace le départ
    };
    const draftOk = () => draft.d1 && draft.d2 && draft.d2 > draft.d1;
    const draftLine = () => !draft.d1 ? '' : `<div style="margin-top:8px"><b>🛫 ${esc(fmtDate(draft.d1))}</b>${draft.d2 ? `<br><b>🛬 ${esc(fmtDate(draft.d2))}</b> <span class="muted">(${Math.round((day(draft.d2) - day(draft.d1)) / 864e5)} ${t('nights')})</span>` : ''}</div>`;

    const draw = () => {
      const valid = ok();
      const past = J.date1 && J.date1 < todayStr() && !editing ? `<p class="muted">ℹ️ ${t('warn_past')}</p>` : '';
      el.innerHTML = `<h2>${t('trip_title')}</h2><datalist id="apts">${Object.entries(AIRPORTS).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join('')}</datalist>
        <div id="sum">${summary()}</div>
        ${editing ? `<div class="card"><h3>${t('step_route')}</h3>${calendar()}${draftLine()}
          <div class="row" style="margin-top:12px"><button type="button" id="okDates" ${draftOk() ? '' : 'disabled'}>✓ ${t('validate_dates')}</button>
            ${ok() ? `<button type="button" class="ghost" id="cancelDates">${t('cancel')}</button>` : ''}
            ${draft.d1 ? `<button type="button" class="ghost sm" id="clrDates">${t('reset_dates')}</button>` : ''}</div></div>`
        : `<div class="card"><h3>${t('step_route')} ✓</h3>${past}<div class="row"><button type="button" class="ghost" id="editDates">✏️ ${t('edit_dates')}</button>
            <button type="button" class="ghost sm" id="clrDates">${t('reset_dates')}</button></div></div>`}
        ${valid ? `<div class="card"><h3>${t('step_flights')}</h3>
          <p>${t('have_flight')}</p>
          <div class="row"><div class="grow"><label>🛫 ${t('no_out')}</label><input id="noOut" value="${esc(J.noOut || '')}" placeholder="SV 124" style="width:100%;text-transform:uppercase"></div>
            <div class="grow"><label>🛬 ${t('no_ret')}</label><input id="noRet" value="${esc(J.noRet || '')}" placeholder="SV 125" style="width:100%;text-transform:uppercase"></div></div>
          <div class="row"><span id="trkOut">${track(J.noOut)}</span><span id="trkRet">${track(J.noRet)}</span></div>
          <div style="margin-top:8px"><label>${t('booking_ref')} <span class="muted">(${t('local_only')})</span></label><input id="ref" value="${esc(J.ref || '')}" style="width:100%"></div>
          <hr style="border:0;border-top:1px solid var(--bd);margin:14px 0">
          <p>${t('find_flights')}</p><div class="row">${links().map(([n, u]) => `<a class="btn" href="${u}" target="_blank" rel="noopener">${n} ↗</a>`).join('')}</div>
          <details style="margin-top:14px" ${J.to || J.retFrom || J.retTo || J.depOut || J.arrOut || J.depRet || J.arrRet ? 'open' : ''}><summary>${t('airports_opt')}</summary>
            <p class="muted">${t('airports_hint')}</p>
            <div class="row">${apt('from', t('from_lbl'), 'from', 'GVA')}<div style="padding-top:20px">→</div>${apt('to', t('to_lbl'), 'to', 'JED')}</div>
            <div class="chips" style="margin-top:8px">${ORIGINS.map(d => `<button type="button" class="chip ${J.from === d ? 'on' : ''}" data-orig="${d}">${d} · ${esc(AIRPORTS[d])}</button>`).join('')}</div>
            <div class="chips">${DEST.map(d => `<button type="button" class="chip ${J.to === d ? 'on' : ''}" data-dest="${d}">${d} · ${esc(AIRPORTS[d])}</button>`).join('')}</div>
            <p class="muted" style="margin:10px 0 4px">${t('other_return')}</p>
            <div class="row">${apt('rfrom', t('ret_from'), 'retFrom', J.to || 'MED')}${apt('rto', t('ret_to'), 'retTo', J.from || 'GVA')}</div>
            <p class="muted" style="margin:10px 0 4px">${t('times_opt')}</p>
            <div class="row"><div><label>🛫 ${t('dep_time')}</label><input id="depOut" type="time" value="${esc(J.depOut || '')}"></div><div><label>🛫 ${t('arr_time')}</label><input id="arrOut" type="time" value="${esc(J.arrOut || '')}"></div><div><label>${t('terminal')}</label><input id="termOut" value="${esc(J.termOut || '')}" style="width:70px"></div></div>
            <div class="row" style="margin-top:6px"><div><label>🛬 ${t('dep_time')}</label><input id="depRet" type="time" value="${esc(J.depRet || '')}"></div><div><label>🛬 ${t('arr_time')}</label><input id="arrRet" type="time" value="${esc(J.arrRet || '')}"></div><div><label>${t('terminal')}</label><input id="termRet" value="${esc(J.termRet || '')}" style="width:70px"></div></div></details>
          <p class="muted" style="margin-top:10px">✓ ${t('saved_auto')}</p>
          <button type="button" class="danger" id="clrAll">${t('reset_all')}</button></div>`
          : `<p class="muted">${t('pick_dates')}</p>`}`;

      $$('.cal-day', el).forEach(b => b.onclick = () => { pick(b.dataset.d); const d = day(b.dataset.d); view.y = d.getFullYear(); view.m = d.getMonth(); draw(); });
      const pv = $('#calPrev', el), nx = $('#calNext', el);
      if (pv) pv.onclick = () => { view.m--; if (view.m < 0) { view.m = 11; view.y--; } draw(); };
      if (nx) nx.onclick = () => { view.m++; if (view.m > 11) { view.m = 0; view.y++; } draw(); };
      const okB = $('#okDates', el);
      if (okB) okB.onclick = () => {
        if (!draftOk()) return;
        set('date1', draft.d1); set('date2', draft.d2); S.trip = { start: '', end: '' }; save('trip');
        editing = false; A.toast(t('dates_ok')); draw();
      };
      const cn = $('#cancelDates', el);
      if (cn) cn.onclick = () => { draft.d1 = J.date1; draft.d2 = J.date2; editing = false; draw(); };
      const ed = $('#editDates', el);
      if (ed) ed.onclick = () => { draft.d1 = J.date1 || ''; draft.d2 = J.date2 || ''; if (J.date1) { const d = day(J.date1); view.y = d.getFullYear(); view.m = d.getMonth(); } editing = true; draw(); };
      const bindAirport = (id, key) => { const i = $(id, el); if (i) i.onchange = e => { e.target.value = iata(e.target.value); set(key, e.target.value); draw(); }; };
      bindAirport('#from', 'from'); bindAirport('#to', 'to'); bindAirport('#rfrom', 'retFrom'); bindAirport('#rto', 'retTo');
      const cd = $('#clrDates', el);
      if (cd) cd.onclick = () => { set('date1', ''); set('date2', ''); draft.d1 = ''; draft.d2 = ''; S.trip = { start: '', end: '' }; save('trip'); editing = true; draw(); };
      const ca = $('#clrAll', el);
      if (ca) ca.onclick = () => {
        if (!confirm(t('confirm_reset_all'))) return;
        for (const k of Object.keys(J)) delete J[k];
        J.from = 'GVA'; draft.d1 = ''; draft.d2 = ''; editing = true;
        S.trip = { start: '', end: '' }; save('trip'); save('journey'); draw();
      };
      $$('[data-orig]', el).forEach(b => b.onclick = () => { set('from', b.dataset.orig); draw(); });
      $$('[data-dest]', el).forEach(b => b.onclick = () => { set('to', b.dataset.dest); draw(); });
      // champs texte : enregistrement à chaque frappe, sans redessiner (le clavier reste ouvert)
      const bindText = (id, key, fn) => { const i = $(id, el); if (i) i.oninput = () => { set(key, fn ? fn(i.value) : i.value); $('#sum', el).innerHTML = summary(); }; };
      const up = v => v.toUpperCase();
      bindText('#noOut', 'noOut', up); bindText('#noRet', 'noRet', up); bindText('#ref', 'ref');
      ['depOut', 'arrOut', 'depRet', 'arrRet', 'termOut', 'termRet'].forEach(k => bindText('#' + k, k));
      const no1 = $('#noOut', el), no2 = $('#noRet', el);
      if (no1) no1.onchange = () => { $('#trkOut', el).innerHTML = track(J.noOut); };
      if (no2) no2.onchange = () => { $('#trkRet', el).innerHTML = track(J.noRet); };
    };
    draw();
  };
})();
