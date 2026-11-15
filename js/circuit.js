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
      { id: 'tf1', date: '2027-03-20', mode: 'taxi', kind: 'transfer', dir: 'toHotel', city: 'jeddah', from: 'jeddah', to: 'jeddah', stage: 's1' },
      { id: 't1', date: '2027-03-23', mode: 'train', from: 'jeddah', to: 'makkah' },
      { id: 't2', date: '2027-03-28', mode: 'train', from: 'makkah', to: 'madinah' },
      { id: 'tf2', date: '2027-04-02', mode: 'taxi', kind: 'transfer', dir: 'toAirport', city: 'madinah', from: 'madinah', to: 'madinah', stage: 's3' },
      { id: 't3', date: '2027-04-02', mode: 'flight', from: 'madinah', to: 'riyadh', codes: ['MED', 'RUH'] },
      { id: 'tf3', date: '2027-04-02', mode: 'taxi', kind: 'transfer', dir: 'toHotel', city: 'riyadh', from: 'riyadh', to: 'riyadh', stage: 's4' },
      { id: 'tf4', date: '2027-04-04', mode: 'taxi', kind: 'transfer', dir: 'toAirport', city: 'riyadh', from: 'riyadh', to: 'riyadh', stage: 's4' },
      { id: 't4', date: '2027-04-04', mode: 'flight', from: 'riyadh', to: 'jeddah', codes: ['RUH', 'JED'], morning: true },
      { id: 'tf5', date: '2027-04-04', mode: 'taxi', kind: 'transfer', dir: 'toHotel', city: 'jeddah', from: 'jeddah', to: 'jeddah', stage: 's5' },
      { id: 'tf6', date: '2027-04-06', mode: 'taxi', kind: 'transfer', dir: 'toAirport', city: 'jeddah', from: 'jeddah', to: 'jeddah', stage: 's5' },
      { id: 't5', date: '2027-04-06', mode: 'leave', from: 'jeddah', to: 'jeddah' },
    ],
    tf: 1,
    done: {},
  };

  const TIPS = {
    jeddah: { fr: "Près de la Corniche, de Jeddah Historique (Al-Balad) ou de l'aéroport selon l'heure du vol.", en: 'Near the Corniche, historic Jeddah (Al-Balad) or the airport depending on your flight time.' },
    makkah: { fr: "Cherchez à pied du Haram (vérifiez la distance réelle, les passages et les travaux). Les prix varient beaucoup selon la proximité.", en: 'Look for walking distance to the Haram (check the real distance, access routes and works). Prices vary a lot with proximity.' },
    madinah: { fr: "Cherchez près de la Mosquée du Prophète ﷺ (zone centrale ou proche des portes). Vérifiez le trajet à pied et les horaires de prière.", en: "Look near the Prophet's Mosque ﷺ (central area or close to the gates). Check the walking route and prayer times." },
    riyadh: { fr: "Quartier central (Olaya) ou proche de l'aéroport selon vos visites : séjour court, 2 nuits.", en: 'Central district (Olaya) or near the airport depending on your visits: short stay, 2 nights.' },
  };

  const MODE_IC = { train: '🚆', taxi: '🚕', bus: '🚌', car: '🚗', flight: '✈️', shuttle: '🚐', other: '➕' };
  const MODE_KEY = { train: 'ci_m_train', taxi: 'ci_m_taxi', bus: 'ci_m_bus', car: 'ci_m_car', flight: 'ci_m_flight', shuttle: 'ci_m_shuttle', other: 'ci_m_other' };
  const OPTS = { 'jeddah>makkah': ['train', 'taxi', 'bus', 'car'], 'makkah>madinah': ['train', 'taxi', 'bus', 'car'], 'madinah>riyadh': ['flight'], 'riyadh>jeddah': ['flight'] };
  /* durées indicatives (à confirmer lors de la réservation) */
  const INFO = {
    'jeddah>makkah': { train: { fr: "Train à grande vitesse Haramain : durée et gare de départ à confirmer sur la billetterie.", en: 'Haramain high-speed train: check duration and departure station on the ticket site.' },
      taxi: { fr: 'Environ 80 km : compter 1 h à 1 h 30 selon la circulation. Convenez du prix avant de partir ou utilisez une appli VTC.', en: 'About 80 km: allow 1–1.5 h depending on traffic. Agree the price first or use a ride-hailing app.' },
      bus: { fr: 'Des bus relient Djeddah à La Mecque (SAPTCO) : à confirmer.', en: 'Buses link Jeddah and Makkah (SAPTCO): to confirm.' }, car: { fr: 'Environ 80 km par autoroute ; vérifiez les règles d’accès à La Mecque pour votre véhicule.', en: 'About 80 km by highway; check Makkah access rules for your vehicle.' } },
    'makkah>madinah': { train: { fr: 'Train Haramain : environ 2 h 15 pour 450 km (à confirmer).', en: 'Haramain train: about 2 h 15 for 450 km (to confirm).' },
      taxi: { fr: 'Environ 450 km : compter 4 h 30 à 5 h par la route. Prix à convenir à l’avance.', en: 'About 450 km: allow 4.5–5 h by road. Agree the price in advance.' },
      bus: { fr: 'Bus longue distance (SAPTCO) : plus long que le train ; à confirmer.', en: 'Long-distance bus (SAPTCO): slower than the train; to confirm.' }, car: { fr: 'Environ 450 km ; prévoyez une pause et vérifiez l’assurance de la location.', en: 'About 450 km; plan a break and check rental insurance.' } },
    'madinah>riyadh': { flight: { fr: 'Vol intérieur d’environ 1 h 30 (à confirmer).', en: 'Domestic flight of about 1 h 30 (to confirm).' } },
    'riyadh>jeddah': { flight: { fr: 'Vol intérieur d’environ 1 h 45 (à confirmer).', en: 'Domestic flight of about 1 h 45 (to confirm).' } },
  };
  const modeOf = x => ((S.circuit && S.circuit.tmode) || {})[x.id] || x.mode;
  const ALL_MODES = ['train', 'flight', 'taxi', 'bus', 'car', 'shuttle', 'other'];
  const optsOf = x => (x.mode === 'arrive' || x.mode === 'leave' ? [] : ALL_MODES);
  const tinfoOf = x => ((S.circuit && S.circuit.tinfo) || {})[x.id] || {};
  const addTransport = stageId => { const cc = get(), st = cc.stages.find(s => s.id === stageId); if (!st) return; cc.transports.push({ id: 'tx' + Date.now(), date: st.in, mode: 'taxi', from: st.city, to: st.city, custom: true, stage: st.id }); cc.transports.sort((a, b) => a.date.localeCompare(b.date)); save('circuit'); };
  const modeLabel = m => t(MODE_KEY[m]);
  const get = () => S.circuit;
  const migrate = () => {
    const cc = S.circuit; if (!cc || cc.tf) return;
    const have = Object.fromEntries(cc.transports.map(x => [x.id, x]));
    const merged = DEFAULT.transports.map(d => have[d.id] || d);
    const extras = cc.transports.filter(x => !DEFAULT.transports.some(d => d.id === x.id));
    cc.transports = [...merged, ...extras].sort((a, b) => a.date.localeCompare(b.date) || 0);
    cc.tf = 1; save('circuit');
  };
  migrate();
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

  const titleOf = x => {
    const m = modeOf(x), inf = tinfoOf(x);
    if (x.custom) return inf.label || modeLabel(m);
    if (x.kind === 'transfer') return x.dir === 'toHotel' ? `${t('ci_airport')} ${cityName(x.city)} → ${t('ci_hotel')}` : `${t('ci_hotel')} → ${t('ci_airport')} ${cityName(x.city)}`;
    return `${cityName(x.from)} → ${cityName(x.to)}`;
  };
  const trCard = x => {
    const done = !!(get().done || {})[x.id], m = modeOf(x), opts = optsOf(x);
    const inf = tinfoOf(x);
    const title = x.custom || x.kind === 'transfer' ? `${MODE_IC[m]} ${esc(titleOf(x))}` : x.mode === 'arrive' ? `🛬 ${t('ci_arrive')} ${cityName(x.to)}` : x.mode === 'leave' ? `🛫 ${t('ci_leave')} ${cityName(x.from)}` :
      `${MODE_IC[m]} ${cityName(x.from)} → ${cityName(x.to)}`;
    const L2 = (u, txt) => `<a class="btn alt" href="${u}" target="_blank" rel="noopener">${txt} ↗</a>`;
    const links = m === 'train' ? L2('https://hhr.sa/', `🚆 ${t('ci_book_train')}`)
      : m === 'flight' ? `${L2(flightsUrl(x), `🔎 ${t('ci_find_flights')}`)}${L2('https://www.saudia.com/', 'Saudia')}${L2('https://www.flynas.com/', 'flynas')}${L2('https://www.flyadeal.com/', 'flyadeal')}`
      : m === 'taxi' ? L2('https://www.careem.com/', 'Careem') + L2('https://www.uber.com/', 'Uber')
      : m === 'bus' ? L2('https://www.saptco.com.sa/', 'SAPTCO')
      : m === 'car' ? L2('https://www.discovercars.com/saudi-arabia', `🚗 ${t('ci_find_car')}`)
      : m === 'shuttle' || m === 'other' ? ''
      : `<a class="btn alt" href="#/trip">✈️ ${t('nav_trip')} →</a>`;
    const info = x.kind === 'transfer' ? { fr: t('ci_tf_note'), en: t('ci_tf_note'), ar: t('ci_tf_note') } : (INFO[x.from + '>' + x.to] || {})[m];
    const note = info ? tr(info) : (m === 'flight' ? (x.morning ? t('ci_flight_morning') : t('ci_flight_note')) : '');
    const amt = inf.amount != null && inf.amount !== '' ? inf.amount : inf.price;
    const payIc = { todo: '⏳', paid: '✅', partial: '🔸', onsite: '📍' }[inf.pay] || '⏳';
    const sum = [inf.time, inf.ref, amt ? `${amt} ${inf.cur || 'CHF'} ${payIc}` : ''].filter(Boolean).map(esc).join(' · ');
    const payRow = `<div class="row" style="gap:8px;margin-top:6px"><div class="grow"><label>${t('pay_amount')}</label><input data-tinfo="${x.id}|amount" inputmode="decimal" value="${esc(amt || '')}" style="width:100%"></div>
      <div><label>${t('currency')}</label><select data-tinfo="${x.id}|cur">${['CHF', 'EUR', 'SAR', 'USD', 'GBP'].map(k => `<option ${k === (inf.cur || 'CHF') ? 'selected' : ''}>${k}</option>`).join('')}</select></div></div>
      <div class="row" style="gap:8px;margin-top:6px"><div class="grow"><label>${t('pay_status')}</label><select data-tinfo="${x.id}|pay" style="width:100%">${['todo', 'paid', 'partial', 'onsite'].map(k => `<option value="${k}" ${(inf.pay || 'todo') === k ? 'selected' : ''}>${{ todo: '⏳', paid: '✅', partial: '🔸', onsite: '📍' }[k]} ${esc(t({ todo: 'pay_todo', paid: 'pay_paid', partial: 'pay_partial', onsite: 'pay_onsite' }[k]))}</option>`).join('')}</select></div>
        <div class="grow"><label>${t('pay_paid_amt')}</label><input data-tinfo="${x.id}|paidAmt" inputmode="decimal" value="${esc(inf.paidAmt || '')}" style="width:100%"></div></div>`;
    const fld = (k, lbl, ph) => `<label style="margin-top:6px;display:block">${lbl}</label><input data-tinfo="${x.id}|${k}" value="${esc(inf[k] || '')}" placeholder="${esc(ph || '')}" style="width:100%">`;
    const details = x.mode === 'arrive' || x.mode === 'leave' ? '' : `<details style="margin:6px 0 0 28px" ${sum || x.custom ? 'open' : ''}><summary class="muted" style="font-size:13px">✏️ ${t('ci_details')}</summary>
      ${x.custom ? fld('label', t('ci_f_label'), modeLabel(m)) : ''}${fld('time', t('ci_f_time'), '08:30')}${fld('ref', t('ci_f_ref'))}${payRow}
      <label style="margin-top:6px;display:block">${t('ci_f_notes')}</label><textarea data-tinfo="${x.id}|notes" rows="2" style="width:100%">${esc(inf.notes || '')}</textarea>
      ${x.custom ? `<p style="margin:8px 0 0"><button type="button" class="danger" data-tdel="${x.id}">${t('delete')}</button></p>` : ''}</details>`;
    const chips = opts.length > 1 ? `<div class="row" style="gap:6px;margin:6px 0 0 28px;flex-wrap:wrap">${opts.map(o => `<button type="button" class="chip ${m === o ? 'on' : ''}" data-tmode="${x.id}:${o}">${MODE_IC[o]} ${esc(modeLabel(o))}</button>`).join('')}</div>` : '';
    return `<div class="sitem-tr ${done ? 'done' : ''}"><div class="row" style="gap:8px;flex-wrap:nowrap"><label class="grow" style="display:flex;gap:8px;align-items:flex-start;margin:0">
        <input type="checkbox" data-trdone="${x.id}" ${done ? 'checked' : ''} style="margin-top:3px"><span><b>${title}</b><br><span class="muted">📅 ${esc(short(x.date))}${x.morning ? ' · 🌅 ' + t('ci_morning') : ''}${opts.length ? ' · ' + esc(modeLabel(m)) : ''}</span></span></label></div>
      ${chips}${sum ? `<div style="margin:4px 0 0 28px;font-size:13px">🧾 ${sum}</div>` : ''}${note ? `<div class="muted" style="margin:4px 0 0 28px;font-size:13px">${esc(note)}</div>` : ''}${links ? `<div class="row" style="gap:6px;margin:6px 0 0 28px;flex-wrap:wrap">${links}</div>` : ''}${details}</div>`;
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
        <div class="row" style="gap:6px;flex-wrap:wrap"><a class="btn" href="${bookingUrl(s)}" target="_blank" rel="noopener">🔎 Booking ↗</a><a class="btn alt" href="${mapsUrl(s)}" target="_blank" rel="noopener">Google Maps ↗</a><button type="button" class="ghost" data-addstay="${s.id}">＋ ${t('ci_add_stay')}</button><button type="button" class="ghost" data-addtr="${s.id}">＋ ${t('ci_add_tr')}</button></div></div>`;
    }).join('');
    return `<div class="card"><h3>🗺️ ${t('ci_title')}</h3><p class="muted" style="margin:0 0 8px">${esc(short(c.stages[0].in))} → ${esc(short(c.stages.at(-1).out))} · ${tot} ${t('nights')}</p>
      <h4 style="margin:8px 0 4px">🏨 ${t('ci_stages')}</h4>${st}
      <h4 style="margin:12px 0 4px">🚆 ${t('ci_transports')}</h4>${c.transports.map(trCard).join('')}
      <div class="row" style="gap:8px;margin-top:10px"><button type="button" class="danger" id="ciReset">${t('ci_remove')}</button></div></div>`;
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
    $$('[data-tinfo]', root).forEach(i => i.oninput = i.onchange = () => { const [id, k] = i.dataset.tinfo.split('|'); const cc = get(); cc.tinfo = cc.tinfo || {}; (cc.tinfo[id] = cc.tinfo[id] || {})[k] = i.value; save('circuit'); });
    $$('[data-tdel]', root).forEach(b => b.onclick = () => { if (confirm(t('ci_del_tr'))) { const cc = get(); cc.transports = cc.transports.filter(y => y.id !== b.dataset.tdel); save('circuit'); h.redraw(); } });
    $$('[data-addtr]', root).forEach(b => b.onclick = () => { addTransport(b.dataset.addtr); h.redraw(); });
    $$('[data-tmode]', root).forEach(b => b.onclick = () => { const [id, m] = b.dataset.tmode.split(':'); const cc = get(); cc.tmode = cc.tmode || {}; cc.tmode[id] = m; save('circuit'); h.redraw(); });
    $$('[data-trdone]', root).forEach(i => i.onchange = () => { const c = get(); c.done = c.done || {}; if (i.checked) c.done[i.dataset.trdone] = 1; else delete c.done[i.dataset.trdone]; save('circuit'); h.redraw(); });
    $$('[data-addstay]', root).forEach(b => b.onclick = () => { const s = get().stages.find(x => x.id === b.dataset.addstay); if (!ensureJourney(get())) return; h.addStay(s); });
    const r = $('#ciReset', root); if (r) r.onclick = () => { if (confirm(t('ci_remove_confirm'))) { S.circuit = null; save('circuit'); h.redraw(); } };
  };

  const loadDefault = () => { const cc = JSON.parse(JSON.stringify(DEFAULT)); if (!ensureJourney(cc)) return false; S.circuit = cc; save('circuit'); return true; };
  A.circuit = { html, bind, trCard, addTransport, loadDefault, titleOf, icon: x => MODE_IC[modeOf(x)] || '🚆', label: x => modeLabel(modeOf(x)) };
})();
