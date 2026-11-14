/* Onglet Départ / Retour : vols saisis par l'utilisateur (stockés localement).
   Chargé après app.js : il enregistre sa vue via window.Omra. */
(() => {
  const A = window.Omra;
  const { $, $$, esc, S, save, t } = A;
  const AIRPORTS = ['CDG', 'ORY', 'LYS', 'MRS', 'NCE', 'TLS', 'BOD', 'NTE', 'BRU', 'GVA', 'JED', 'MED', 'RUH', 'DMM', 'TIF', 'ULH'];
  const blank = () => ({ legs: [], ref: '' });
  const sortLegs = a => a.sort((x, y) => (x.date + (x.dep || '')).localeCompare(y.date + (y.dep || '')));

  A.views.trip = el => {
    const draw = () => {
      const sect = (k, title, icon) => {
        const f = S.flights[k] || blank();
        const cards = f.legs.map((l, i) => `<div class="card" style="background:var(--bg)">
            <div class="row"><b class="grow">${t('leg')} ${i + 1}${l.no ? ' · ' + esc(l.no) : ''}${l.airline ? ' · ' + esc(l.airline) : ''}</b>
              ${l.no ? `<a href="https://www.google.com/search?q=${encodeURIComponent('vol ' + l.no.replace(/\s+/g, ''))}" target="_blank" rel="noopener">${t('track')} ↗</a>` : ''}
              <button class="danger" data-ldel="${k}:${i}" aria-label="${t('remove')}">✕</button></div>
            <div style="font-size:22px;font-weight:700;margin:6px 0">${esc(l.from || '???')} → ${esc(l.to || '???')}</div>
            <div class="muted">${esc(l.date || '')}${l.dep ? ' · ' + t('dep_time') + ' ' + esc(l.dep) : ''}${l.arr ? ' · ' + t('arr_time') + ' ' + esc(l.arr) : ''}${l.term ? ' · ' + t('terminal') + ' ' + esc(l.term) : ''}</div>
            ${l.note ? `<div>${esc(l.note)}</div>` : ''}</div>`).join('');
        return `<div class="card"><h3>${icon} ${title}</h3>
          ${cards || `<p class="muted">${t('no_flight')}</p>`}
          <details><summary>${t('add_leg')}</summary>
            <form class="form" data-lf="${k}" style="margin-top:8px">
              <div class="row"><input name="airline" placeholder="${esc(t('airline'))}" class="grow"><input name="no" placeholder="${esc(t('flight_no'))}" style="width:110px"></div>
              <div class="row"><input name="from" list="apts" placeholder="${esc(t('from'))}" maxlength="3" style="width:100px;text-transform:uppercase"><input name="to" list="apts" placeholder="${esc(t('to'))}" maxlength="3" style="width:100px;text-transform:uppercase"><input name="date" type="date" required></div>
              <div class="row"><div><label>${t('dep_time')}</label><input name="dep" type="time"></div><div><label>${t('arr_time')}</label><input name="arr" type="time"></div><div><label>${t('terminal')}</label><input name="term" style="width:80px"></div></div>
              <input name="note" placeholder="${esc(t('f_notes'))}"><button>${t('add')}</button></form></details>
          <div style="margin-top:10px"><label>${t('booking_ref')} <span class="muted">(${t('local_only')})</span></label>
            <input data-ref="${k}" value="${esc(f.ref || '')}" style="width:100%"></div></div>`;
      };
      el.innerHTML = `<h2>${t('trip_title')}</h2><datalist id="apts">${AIRPORTS.map(a => `<option value="${a}">`).join('')}</datalist>
        ${sect('out', t('outbound'), '🛫')}${sect('ret', t('inbound'), '🛬')}`;
      $$('[data-lf]', el).forEach(f => f.onsubmit = e => {
        e.preventDefault();
        const d = Object.fromEntries(new FormData(f)), k = f.dataset.lf;
        for (const x of ['from', 'to', 'no']) d[x] = (d[x] || '').toUpperCase().trim();
        S.flights[k] = S.flights[k] || blank();
        S.flights[k].legs = sortLegs([...S.flights[k].legs, d]);
        save('flights'); draw();
      });
      $$('[data-ldel]', el).forEach(b => b.onclick = () => { const [k, i] = b.dataset.ldel.split(':'); S.flights[k].legs.splice(+i, 1); save('flights'); draw(); });
      $$('[data-ref]', el).forEach(inp => inp.oninput = () => { const k = inp.dataset.ref; S.flights[k] = S.flights[k] || blank(); S.flights[k].ref = inp.value; save('flights'); });
    };
    draw();
  };
})();
