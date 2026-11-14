/* Onglet Départ / Retour — saisie en une fois : trajet + dates, puis vol (recherche ou numéro/réservation).
   Tout s'enregistre automatiquement. Données : S.journey (voir app.js). */
(() => {
  const A = window.Omra;
  const { $, $$, esc, S, save, t } = A;
  const AIRPORTS = { CDG: 'Paris Charles-de-Gaulle', ORY: 'Paris Orly', LYS: 'Lyon', MRS: 'Marseille', NCE: 'Nice', TLS: 'Toulouse', BOD: 'Bordeaux', NTE: 'Nantes', LIL: 'Lille', BRU: 'Bruxelles', GVA: 'Genève',
    JED: 'Jeddah', MED: 'Médine', RUH: 'Riyad', DMM: 'Dammam', TIF: 'Taïf', ULH: 'AlUla' };
  const DEST = ['JED', 'MED', 'RUH', 'DMM'];
  const ORIGINS = ['GVA', 'LYS', 'CDG', 'ORY'];
  const FLIGHT_RE = /^[A-Z0-9]{2}\s?\d{1,4}[A-Z]?$/;
  const day = s => new Date(s + 'T00:00:00');
  const addDay = (s, n) => { const d = day(s); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
  const todayStr = () => new Date().toISOString().slice(0, 10);
  const iata = v => (v || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
  const fmtDate = s => s ? day(s).toLocaleDateString(S.lang === 'ar' ? 'ar-SA-u-nu-latn' : S.lang, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const yymmdd = s => s.slice(2).replace(/-/g, '');

  A.views.trip = el => {
    S.journey = S.journey || {};
    const J = S.journey;
    const set = (k, v) => { J[k] = v; save('journey'); };
    const ok = () => J.date1 && J.date2 && J.date2 > J.date1;
    if (!J.from) set('from', 'GVA');                       // départ par défaut : Genève

    const links = () => {
      const f = J.from, to = J.to, d1 = J.date1, d2 = J.date2;
      return [
        ['Google Flights', `https://www.google.com/travel/flights?q=${encodeURIComponent(`Flights from ${f} to ${to} on ${d1} through ${d2}`)}`],
        ['Skyscanner', `https://www.skyscanner.fr/transport/vols/${f.toLowerCase()}/${to.toLowerCase()}/${yymmdd(d1)}/${yymmdd(d2)}/`],
        ['Kayak', `https://www.kayak.fr/flights/${f}-${to}/${d1}/${d2}`],
      ];
    };
    const track = no => FLIGHT_RE.test(no || '') ? `<a href="https://www.google.com/search?q=${encodeURIComponent('vol ' + no.replace(/\s+/g, ''))}" target="_blank" rel="noopener">${t('track')} ↗</a>` : '';

    const summary = () => {
      if (!J.date1) return '';
      const n = ok() ? Math.round((day(J.date2) - day(J.date1)) / 864e5) : 0;
      return `<div class="card hero" style="text-align:start"><div style="font-size:24px;font-weight:700">${esc(J.from || '???')} → ${esc(J.to || '???')}</div>
        <div>🛫 ${esc(fmtDate(J.date1))}${J.noOut ? ' · ' + esc(J.noOut) : ''}</div>
        ${J.date2 ? `<div>🛬 ${esc(fmtDate(J.date2))}${J.noRet ? ' · ' + esc(J.noRet) : ''}</div>` : ''}
        ${n ? `<small>${n} ${t('nights')}</small>` : ''}</div>`;
    };

    const apt = (id, label, key, ph) => `<div class="grow"><label>${label}</label><input id="${id}" list="apts" value="${esc(J[key] || '')}" placeholder="${esc(ph)}" maxlength="3" style="width:100%;text-transform:uppercase"></div>`;

    const draw = () => {
      const valid = ok();
      const retErr = J.date2Rejected ? `<p style="color:#c0392b;margin:4px 0">⚠️ ${t('err_return')}</p>` : '';
      const past = J.date1 && J.date1 < todayStr() ? `<p class="muted">ℹ️ ${t('warn_past')}</p>` : '';
      el.innerHTML = `<h2>${t('trip_title')}</h2><datalist id="apts">${Object.entries(AIRPORTS).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join('')}</datalist>
        <div id="sum">${summary()}</div>
        <div class="card"><h3>${t('step_route')}</h3>
          <div class="row">${apt('from', t('from_lbl'), 'from', 'CDG')}<div style="padding-top:20px">→</div>${apt('to', t('to_lbl'), 'to', 'JED')}</div>
          <div class="chips" style="margin-top:8px">${ORIGINS.map(d => `<button type="button" class="chip ${J.from === d ? 'on' : ''}" data-orig="${d}">${d} · ${esc(AIRPORTS[d])}</button>`).join('')}</div>
          <div class="chips">${DEST.map(d => `<button type="button" class="chip ${J.to === d ? 'on' : ''}" data-dest="${d}">${d} · ${esc(AIRPORTS[d])}</button>`).join('')}</div>
          <div class="row"><div class="grow"><label>🛫 ${t('depart_date')}</label><input id="d1" type="date" value="${esc(J.date1 || '')}" style="width:100%"></div>
            <div class="grow"><label>🛬 ${t('return_date')}</label><input id="d2" type="date" value="${esc(J.date2 || '')}" ${J.date1 ? `min="${addDay(J.date1, 1)}"` : 'disabled'} style="width:100%"></div></div>
          ${retErr}${past}
          ${J.date1 || J.date2 ? `<div style="margin-top:8px"><button type="button" class="ghost sm" id="clrDates">${t('reset_dates')}</button></div>` : ''}
          <details style="margin-top:8px" ${J.retFrom || J.retTo ? 'open' : ''}><summary>${t('other_return')}</summary><div class="row" style="margin-top:6px">
            ${apt('rfrom', t('ret_from'), 'retFrom', J.to || 'MED')}${apt('rto', t('ret_to'), 'retTo', J.from || 'CDG')}</div></details></div>
        ${valid && J.from && J.to ? `<div class="card"><h3>${t('step_flights')}</h3>
          <p>${t('find_flights')}</p><div class="row">${links().map(([n, u]) => `<a class="btn" href="${u}" target="_blank" rel="noopener">${n} ↗</a>`).join('')}</div>
          <hr style="border:0;border-top:1px solid var(--bd);margin:14px 0">
          <p>${t('have_flight')}</p>
          <div class="row"><div class="grow"><label>🛫 ${t('no_out')}</label><input id="noOut" value="${esc(J.noOut || '')}" placeholder="SV 124" style="width:100%;text-transform:uppercase"></div>
            <div class="grow"><label>🛬 ${t('no_ret')}</label><input id="noRet" value="${esc(J.noRet || '')}" placeholder="SV 125" style="width:100%;text-transform:uppercase"></div></div>
          <div class="row"><span id="trkOut">${track(J.noOut)}</span><span id="trkRet">${track(J.noRet)}</span></div>
          <div style="margin-top:8px"><label>${t('booking_ref')} <span class="muted">(${t('local_only')})</span></label><input id="ref" value="${esc(J.ref || '')}" style="width:100%"></div>
          <details style="margin-top:10px" ${J.depOut || J.arrOut || J.depRet || J.arrRet ? 'open' : ''}><summary>${t('times_opt')}</summary>
            <div class="row" style="margin-top:6px"><div><label>🛫 ${t('dep_time')}</label><input id="depOut" type="time" value="${esc(J.depOut || '')}"></div><div><label>🛫 ${t('arr_time')}</label><input id="arrOut" type="time" value="${esc(J.arrOut || '')}"></div><div><label>${t('terminal')}</label><input id="termOut" value="${esc(J.termOut || '')}" style="width:70px"></div></div>
            <div class="row" style="margin-top:6px"><div><label>🛬 ${t('dep_time')}</label><input id="depRet" type="time" value="${esc(J.depRet || '')}"></div><div><label>🛬 ${t('arr_time')}</label><input id="arrRet" type="time" value="${esc(J.arrRet || '')}"></div><div><label>${t('terminal')}</label><input id="termRet" value="${esc(J.termRet || '')}" style="width:70px"></div></div></details>
          <p class="muted" style="margin-top:10px">✓ ${t('saved_auto')}</p>
          <button type="button" class="danger" id="clrAll">${t('reset_all')}</button></div>`
          : `<p class="muted">${t('pick_dates')}</p>`}`;

      const bindAirport = (id, key) => { $(id, el).onchange = e => { e.target.value = iata(e.target.value); set(key, e.target.value); draw(); }; };
      bindAirport('#from', 'from'); bindAirport('#to', 'to'); bindAirport('#rfrom', 'retFrom'); bindAirport('#rto', 'retTo');
      const cd = $('#clrDates', el);
      if (cd) cd.onclick = () => { J.date2Rejected = false; set('date1', ''); set('date2', ''); S.trip = { start: '', end: '' }; save('trip'); draw(); };
      const ca = $('#clrAll', el);
      if (ca) ca.onclick = () => {
        if (!confirm(t('confirm_reset_all'))) return;
        for (const k of Object.keys(J)) delete J[k];
        J.from = 'GVA';
        S.trip = { start: '', end: '' }; save('trip'); save('journey'); draw();
      };
      $$('[data-orig]', el).forEach(b => b.onclick = () => { set('from', b.dataset.orig); draw(); });
      $$('[data-dest]', el).forEach(b => b.onclick = () => { set('to', b.dataset.dest); draw(); });
      $('#d1', el).onchange = e => {
        set('date1', e.target.value); J.date2Rejected = false;
        if (J.date2 && J.date2 <= J.date1) { set('date2', ''); J.date2Rejected = true; }   // le retour doit rester après le départ
        draw();
      };
      $('#d2', el).onchange = e => {
        const v = e.target.value;
        if (v && J.date1 && v <= J.date1) { J.date2Rejected = true; set('date2', ''); } else { J.date2Rejected = false; set('date2', v); }
        draw();
      };
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
