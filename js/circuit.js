/* « Mon circuit » : étapes (villes + dates + nuits) et transports entre les étapes.
   Sert à trouver les hôtels (recherche pré-remplie par ville et dates) et à programmer les transports.
   Données : S.circuit = { stages, transports, done:{id:true} } (enregistrées localement, synchronisées). */
(() => {
  const A = window.Omra;
  const { $, $$, esc, S, save, t } = A;
  const pad = n => String(n).padStart(2, '0');
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const day = s => new Date(s + 'T00:00:00');
  const addDay = (s, n) => { const d = day(s); d.setDate(d.getDate() + n); return iso(d); };
  const nights = (a, b) => Math.round((day(b) - day(a)) / 864e5);
  const loc = () => (S.lang === 'ar' ? 'ar-SA-u-nu-latn' : S.lang);
  const short = s => day(s).toLocaleDateString(loc(), { weekday: 'short', day: 'numeric', month: 'short' });
  const cityName = id => (typeof CITIES !== 'undefined' && CITIES[id] ? (CITIES[id].n[S.lang] || CITIES[id].n.fr) : id);
  const BK = { jeddah: 'Jeddah', makkah: 'Mecca', madinah: 'Medina', riyadh: 'Riyadh' };
  const tr = o => (o && (o[S.lang] || o.fr)) || '';

  const DEFAULT = {
    stages: [
      { id: 's1', city: 'jeddah', in: '2027-03-20', out: '2027-03-23' },
      { id: 's2', city: 'makkah', in: '2027-03-23', out: '2027-03-28' },
      { id: 's3', city: 'madinah', in: '2027-03-28', out: '2027-04-02' },
      { id: 's4', city: 'riyadh', in: '2027-04-02', out: '2027-04-04' },
      { id: 's5', city: 'jeddah', in: '2027-04-04', out: '2027-04-06' },
    ],
    transports: [
      { id: 't0', date: '2027-03-20', mode: 'arrive', from: 'jeddah', to: 'jeddah' },
      { id: 't1', date: '2027-03-23', mode: 'train', from: 'jeddah', to: 'makkah' },
      { id: 't2', date: '2027-03-28', mode: 'train', from: 'makkah', to: 'madinah' },
      { id: 't3', date: '2027-04-02', mode: 'flight', from: 'madinah', to: 'riyadh', codes: ['MED', 'RUH'] },
      { id: 't4', date: '2027-04-04', mode: 'flight', from: 'riyadh', to: 'jeddah', codes: ['RUH', 'JED'], morning: true },
      { id: 't5', date: '2027-04-06', mode: 'leave', from: 'jeddah', to: 'jeddah' },
    ],
    done: {},
  };

  const TIPS = {
    jeddah: { fr: "Près de la Corniche, de Jeddah Historique (Al-Balad) ou de l'aéroport selon l'heure du vol.", en: 'Near the Corniche, historic Jeddah (Al-Balad) or the airport depending on your flight time.' },
    makkah: { fr: "Cherchez à pied du Haram (vérifiez la distance réelle, les passages et les travaux). Les prix varient beaucoup selon la proximité.", en: 'Look for walking distance to the Haram (check the real distance, access routes and works). Prices vary a lot with proximity.' },
    madinah: { fr: "Cherchez près de la Mosquée du Prophète ﷺ (zone centrale ou proche des portes). Vérifiez le trajet à pied et les horaires de prière.", en: "Look near the Prophet's Mosque ﷺ (central area or close to the gates). Check the walking route and prayer times." },
    riyadh: { fr: "Quartier central (Olaya) ou proche de l'aéroport selon vos visites : séjour court, 2 nuits.", en: 'Central district (Olaya) or near the airport depending on your visits: short stay, 2 nights.' },
  };

  const get = () => S.circuit;
  const stageStatus = st => {
    const stays = (S.stays || []).filter(s => s.city === st.city && s.in && s.out && s.out > s.in && s.in < st.out && s.out > st.in);
    const set = new Set();
    stays.forEach(s => { for (let d = s.in; d < s.out; d = addDay(d, 1)) if (d >= st.in && d < st.out) set.add(d); });
    const n = nights(st.in, st.out);
    const booked = stays.length && stays.every(s => s.status === 'booked') && set.size >= n;
    return { n, covered: set.size, booked };
  };
  const bookingUrl = st => `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(BK[st.city] || cityName(st.city))}&checkin=${st.in}&checkout=${st.out}&group_adults=2&no_rooms=1`;
  const mapsUrl = st => `https://www.google.com/maps/search/${encodeURIComponent('hotels in ' + (BK[st.city] || cityName(st.city)))}`;
  const flightsUrl = x => `https://www.google.com/travel/flights?q=${encodeURIComponent(`Flights from ${x.codes[0]} to ${x.codes[1]} on ${x.date}`)}`;

  const trCard = x => {
    const done = !!(get().done || {})[x.id];
    const title = x.mode === 'arrive' ? `🛬 ${t('ci_arrive')} ${cityName(x.to)}` : x.mode === 'leave' ? `🛫 ${t('ci_leave')} ${cityName(x.from)}` :
      `${x.mode === 'train' ? '🚆' : '✈️'} ${cityName(x.from)} → ${cityName(x.to)}`;
    const links = x.mode === 'train' ? `<a class="btn alt" href="https://hhr.sa/" target="_blank" rel="noopener">🚆 ${t('ci_book_train')} ↗</a>`
      : x.mode === 'flight' ? `<a class="btn alt" href="${flightsUrl(x)}" target="_blank" rel="noopener">🔎 ${t('ci_find_flights')} ↗</a><a class="btn alt" href="https://www.saudia.com/" target="_blank" rel="noopener">Saudia ↗</a><a class="btn alt" href="https://www.flynas.com/" target="_blank" rel="noopener">flynas ↗</a><a class="btn alt" href="https://www.flyadeal.com/" target="_blank" rel="noopener">flyadeal ↗</a>`
        : `<a class="btn alt" href="#/trip">✈️ ${t('nav_trip')} →</a>`;
    const note = x.mode === 'train' ? t('ci_train_note') : x.mode === 'flight' ? (x.morning ? t('ci_flight_morning') : t('ci_flight_note')) : '';
    return `<div class="sitem-tr ${done ? 'done' : ''}"><div class="row" style="gap:8px;flex-wrap:nowrap"><label class="grow" style="display:flex;gap:8px;align-items:flex-start;margin:0">
        <input type="checkbox" data-trdone="${x.id}" ${done ? 'checked' : ''} style="margin-top:3px"><span><b>${title}</b><br><span class="muted">📅 ${esc(short(x.date))}${x.morning ? ' · 🌅 ' + t('ci_morning') : ''}</span></span></label></div>
      ${note ? `<div class="muted" style="margin:4px 0 0 28px;font-size:13px">${note}</div>` : ''}<div class="row" style="gap:6px;margin:6px 0 0 28px;flex-wrap:wrap">${links}</div></div>`;
  };

  const html = () => {
    const c = get();
    if (!c) return `<div class="card"><h3>🗺️ ${t('ci_title')}</h3><p class="muted">${t('ci_empty')}</p><button type="button" id="ciLoad" style="width:100%">⬇️ ${t('ci_load')}</button></div>`;
    const tot = nights(c.stages[0].in, c.stages.at(-1).out);
    const st = c.stages.map((s, i) => {
      const q = stageStatus(s);
      const pill = q.booked ? `<span class="pill ok">✓ ${t('st_booked')}</span>` : q.covered ? `<span class="pill">${q.covered}/${q.n} ${t('nights')}</span>` : `<span class="pill">${t('st_todo')}</span>`;
      return `<div class="sitem-tr"><div class="row" style="gap:8px;flex-wrap:nowrap"><b class="grow">${i + 1}. ${esc(cityName(s.city))}</b>${pill}</div>
        <div class="muted">📅 ${esc(short(s.in))} → ${esc(short(s.out))} · 🌙 ${q.n} ${t('nights')}</div>
        <div class="muted" style="font-size:13px;margin:4px 0">${esc(tr(TIPS[s.city]))}</div>${s.city === 'makkah' || s.city === 'madinah' ? `<div class="muted" style="font-size:12px;margin:0 0 4px">🚶 ${t('walk_legend')}</div>` : ''}
        <div class="row" style="gap:6px;flex-wrap:wrap"><a class="btn" href="${bookingUrl(s)}" target="_blank" rel="noopener">🔎 Booking ↗</a><a class="btn alt" href="${mapsUrl(s)}" target="_blank" rel="noopener">Google Maps ↗</a><button type="button" class="ghost" data-addstay="${s.id}">＋ ${t('ci_add_stay')}</button></div></div>`;
    }).join('');
    return `<div class="card"><h3>🗺️ ${t('ci_title')}</h3><p class="muted" style="margin:0 0 8px">${esc(short(c.stages[0].in))} → ${esc(short(c.stages.at(-1).out))} · ${tot} ${t('nights')}</p>
      <h4 style="margin:8px 0 4px">🏨 ${t('ci_stages')}</h4>${st}
      <h4 style="margin:12px 0 4px">🚆 ${t('ci_transports')}</h4>${c.transports.map(trCard).join('')}
      <div class="row" style="gap:8px;margin-top:10px"><button type="button" class="ghost" id="ciPlan">📒 ${t('ci_to_plan')}</button><button type="button" class="danger" id="ciReset">${t('ci_remove')}</button></div></div>`;
  };

  const tripDates = (c) => ({ d1: c.stages[0].in, d2: c.stages.at(-1).out });
  const ensureJourney = c => {
    const { d1, d2 } = tripDates(c); const J = (S.journey = S.journey || {});
    if (J.date1 === d1 && J.date2 === d2) return true;
    if (J.date1 && J.date2 && !confirm(t('ci_replace_dates'))) return false;
    J.date1 = d1; J.date2 = d2; save('journey'); return true;
  };

  const bind = (root, h) => {
    const load = $('#ciLoad', root);
    if (load) load.onclick = () => {
      const c = JSON.parse(JSON.stringify(DEFAULT)); if (!ensureJourney(c)) return;
      S.circuit = c; save('circuit'); A.toast('✓ ' + t('ci_loaded')); h.redraw();
    };
    $$('[data-trdone]', root).forEach(i => i.onchange = () => { const c = get(); c.done = c.done || {}; if (i.checked) c.done[i.dataset.trdone] = 1; else delete c.done[i.dataset.trdone]; save('circuit'); h.redraw(); });
    $$('[data-addstay]', root).forEach(b => b.onclick = () => { const s = get().stages.find(x => x.id === b.dataset.addstay); if (!ensureJourney(get())) return; h.addStay(s); });
    const p = $('#ciPlan', root);
    if (p) p.onclick = () => {
      const c = get(), d1 = c.stages[0].in; S.plan = S.plan || [];
      const dayN = d => nights(d1, d) + 1; let added = 0;
      const push = (id, d, city, title) => { if (S.plan.some(x => x.id === id)) return; S.plan.push({ id, day: dayN(d), city, title, notes: '', done: false }); added++; };
      c.stages.forEach(s => push('ci-' + s.id, s.in, s.city, `🏨 ${cityName(s.city)} (${nights(s.in, s.out)} ${t('nights')})`));
      c.transports.filter(x => x.mode === 'train' || x.mode === 'flight').forEach(x => push('ci-' + x.id, x.date, x.from, `${x.mode === 'train' ? '🚆' : '✈️'} ${cityName(x.from)} → ${cityName(x.to)}`));
      save('plan'); A.toast(added ? `📒 ${added} ${t('ci_added')}` : t('ci_already'));
    };
    const r = $('#ciReset', root); if (r) r.onclick = () => { if (confirm(t('ci_remove_confirm'))) { S.circuit = null; save('circuit'); h.redraw(); } };
  };

  A.circuit = { html, bind };
})();
