/* Onglet Logement : hôtels / appartements à ajouter quand ils sont réservés (ou « à réserver »).
   Les nuits se choisissent parmi les dates du voyage (liste explicite : pas de sélecteur natif de date).
   Données : S.stays (synchronisées, sauf la référence de réservation), enregistrées localement. */
(() => {
  const A = window.Omra;
  const { $, $$, esc, S, save, t } = A;
  const Money = window.OmraCurrency;
  const CITY_IDS = ['makkah', 'madinah', 'jeddah', 'riyadh', 'alula', 'taif'];
  const cityName = id => (CITIES[id] ? (CITIES[id].n[S.lang] || CITIES[id].n.fr) : t('st_other_city'));
  const loc = () => S.lang === 'ar' ? 'ar-SA-u-nu-latn' : S.lang;
  const pad = n => String(n).padStart(2, '0');
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;      // dates locales (pas d'UTC)
  const day = s => new Date(s + 'T00:00:00');
  const addDay = (s, n) => { const d = day(s); d.setDate(d.getDate() + n); return iso(d); };
  const nights = (a, b) => Math.round((day(b) - day(a)) / 864e5);
  const short = s => day(s).toLocaleDateString(loc(), { weekday: 'short', day: 'numeric', month: 'short' });
  const safeUrl = u => { u = (u || '').trim(); if (!u) return ''; try { const x = new URL(/^[a-z][a-z0-9+.-]*:/i.test(u) ? u : 'https://' + u); return /^https?:$/.test(x.protocol) ? x.href : ''; } catch { return ''; } };
  const tel = v => (v || '').replace(/[^\d+]/g, '');
  const where = s => encodeURIComponent([s.addr || s.name, s.addr ? '' : cityName(s.city)].filter(Boolean).join(' '));
  const CUR = ['CHF', 'USD', 'SAR'];

  A.views.stay = el => {
    S.stays = S.stays || [];
    const J = S.journey || {};
    const tripOk = !!(J.date1 && J.date2 && J.date2 > J.date1);
    let editing = null;                                  // null | 'new' | id
    let f = null;                                        // brouillon du formulaire
    const dayList = () => { const out = []; if (!tripOk) return out; for (let d = J.date1; d <= J.date2; d = addDay(d, 1)) out.push(d); return out; };
    const lastOut = () => S.stays.filter(s => s.out).map(s => s.out).sort().at(-1);

    const blank = () => ({ id: 's' + Date.now(), city: 'makkah', name: '', status: 'todo', in: tripOk ? (lastOut() && lastOut() < J.date2 ? lastOut() : J.date1) : '', out: tripOk ? J.date2 : '', addr: '', link: '', ref: '', price: '', cur: 'CHF', phone: '', notes: '' });

    /* nuits couvertes / à loger */
    const coverage = () => {
      if (!tripOk) return null;
      const total = nights(J.date1, J.date2), set = new Set();
      S.stays.forEach(s => { if (s.in && s.out && s.out > s.in) for (let d = s.in; d < s.out; d = addDay(d, 1)) if (d >= J.date1 && d < J.date2) set.add(d); });
      return { total, covered: set.size };
    };

    const searchLinks = () => {
      const q = (name) => `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(name)}${tripOk ? `&checkin=${J.date1}&checkout=${J.date2}` : ''}&group_adults=2&no_rooms=1`;
      return `<div class="row"><a class="btn alt" href="${q('Mecca')}" target="_blank" rel="noopener">Booking · ${esc(cityName('makkah'))} ↗</a>
        <a class="btn alt" href="${q('Medina')}" target="_blank" rel="noopener">Booking · ${esc(cityName('madinah'))} ↗</a>
        <a class="btn alt" href="https://www.google.com/maps/search/${encodeURIComponent('hotels near Masjid al-Haram')}" target="_blank" rel="noopener">Google Maps ↗</a></div>`;
    };


    /* ---- Distance à pied jusqu'à la porte la plus proche (La Mecque / Médine) ----
       Adresse → coordonnées (Nominatim/OSM) ; porte la plus proche (data/holy-sites.json, © OpenStreetMap) ;
       itinéraire piéton (routing.openstreetmap.de) ou, à défaut, estimation à vol d'oiseau × 1,3. */
    const WALK_CITIES = { makkah: 'haram', madinah: 'nabawi' };
    const hav = (a, b) => { const R = 6371000, r = Math.PI / 180, dLa = (b.lat - a.lat) * r, dLo = (b.lng - a.lng) * r; const h = Math.sin(dLa / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLo / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };
    const band = m => (m < 300 ? 0 : m < 600 ? 1 : m < 1000 ? 2 : m < 2000 ? 3 : 4);
    const fmtM = m => (m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1)} km`);
    let GATES = null;
    const loadGates = () => GATES ? Promise.resolve(GATES) : fetch('data/holy-sites.json', { cache: 'no-cache' }).then(r => (r.ok ? r.json() : Promise.reject())).then(d => (GATES = d.sites));
    const geocode = async s => {
      const m = /(-?\d{1,2}\.\d{3,})\s*[, ]\s*(-?\d{1,3}\.\d{3,})/.exec(s.addr || '');           // coordonnées collées depuis Google Maps
      if (m) return { lat: +m[1], lng: +m[2] };
      const q = [s.addr || s.name, cityName(s.city), 'Saudi Arabia'].filter(Boolean).join(', ');
      const r = await fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=' + encodeURIComponent(q), { headers: { Accept: 'application/json' } });
      const j = await r.json(); if (!j.length) return null;
      return { lat: +j[0].lat, lng: +j[0].lon };
    };
    const measure = async s => {
      const pt = await geocode(s); if (!pt) return { err: 'nofound' };
      const sites = await loadGates(); const site = sites.find(x => x.id === WALK_CITIES[s.city]); if (!site) return { err: 'nodata' };
      const gates = site.features.filter(f => f.cat === 'gate').map(f => ({ f, d: hav(pt, f) })).sort((a, b) => a.d - b.d);
      const g = gates[0]; if (!g) return { err: 'nodata' };
      let m = g.d * 1.3, min = Math.max(1, Math.round(m / 80)), approx = true;
      try {
        const u = `https://routing.openstreetmap.de/routed-foot/route/v1/foot/${pt.lng},${pt.lat};${g.f.lng},${g.f.lat}?overview=false`;
        const j = await (await fetch(u)).json();
        if (j.routes && j.routes[0]) { m = j.routes[0].distance; min = Math.max(1, Math.round(j.routes[0].duration / 60)); approx = false; }
      } catch (e) { /* estimation */ }
      return { m: Math.round(m), min, approx, gate: g.f.num || '', gname: { fr: g.f.name_fr, en: g.f.name_en, ar: g.f.name_ar }, lat: pt.lat, lng: pt.lng, at: Date.now() };
    };
    const walkHtml = s => {
      if (!WALK_CITIES[s.city]) return '';
      const w = s.walk, ref = s.city === 'makkah' ? t('st_walk_haram') : t('st_walk_nabawi');
      if (!w) return `<div style="margin:6px 0"><button type="button" class="chip" data-walk="${s.id}">📏 ${t('st_walk_btn')}</button></div>`;
      const gn = w.gname && (w.gname[S.lang] || w.gname.fr);
      return `<div class="walkbox wb${band(w.m)}">🚶 <b>${w.approx ? '≈ ' : ''}${fmtM(w.m)}</b> · ${w.min} min · ${esc(ref)}<div style="font-size:12px;margin-top:2px">${w.gate ? `${t('st_gate')} ${esc(w.gate)}` : ''}${gn ? ` · ${esc(gn)}` : ''}${w.approx ? ` · ${t('st_walk_est')}` : ''}
        <button type="button" class="chip" data-walk="${s.id}" style="margin-inline-start:6px;padding:2px 8px;font-size:12px">↻</button></div></div>`;
    };

    const stayCard = s => {
      const n = s.in && s.out && s.out > s.in ? nights(s.in, s.out) : 0;
      const link = safeUrl(s.link);
      return `<div class="card stay"><div class="row"><b class="grow" style="font-size:17px">🏨 ${esc(s.name || t('st_noname'))}</b>
          <span class="pill ${s.status === 'booked' ? 'ok' : ''}">${s.status === 'booked' ? '✓ ' + t('st_booked') : t('st_todo')}</span></div>
        <div class="muted" style="margin:4px 0">📍 ${esc(cityName(s.city))}${n ? ` · 🌙 ${n} ${t('nights')}` : ''}</div>
        ${s.in && s.out ? `<div>📅 ${esc(short(s.in))} → ${esc(short(s.out))}</div>` : ''}
        ${s.addr ? `<div class="muted">${esc(s.addr)}</div>` : ''}
        ${walkHtml(s)}
        ${s.price ? `<div>💶 ${esc(s.price)} ${esc(s.cur || 'CHF')}${Number.isFinite(Money.toCHF(s.price, s.cur || 'CHF', S.fxRates)) && (s.cur || 'CHF') !== 'CHF' ? ` <span class="muted">≈ ${Money.format(Money.toCHF(s.price, s.cur || 'CHF', S.fxRates), 'CHF', 'fr-CH')}</span>` : ''} <span class="pill ${s.pay === 'paid' ? 'ok' : ''}">${A.pay.PAY_IC[s.pay] || '⏳'} ${t({ paid: 'pay_paid', partial: 'pay_partial', onsite: 'pay_onsite' }[s.pay] || 'pay_todo')}</span></div>` : ''}
        ${s.ref ? `<div class="muted">${t('booking_ref')} : <b>${esc(s.ref)}</b></div>` : ''}
        ${s.notes ? `<div class="muted" style="margin-top:4px">${esc(s.notes)}</div>` : ''}
        <div class="row" style="margin-top:10px">
          <a class="btn" href="https://www.google.com/maps/dir/?api=1&destination=${where(s)}" target="_blank" rel="noopener">🧭 Google Maps</a>
          <a class="btn alt" href="https://maps.apple.com/?daddr=${where(s)}&dirflg=d" target="_blank" rel="noopener">Plans</a>
          ${tel(s.phone) ? `<a class="btn alt" href="tel:${esc(tel(s.phone))}">📞 ${t('st_call')}</a>` : ''}
          ${link ? `<a class="btn alt" href="${esc(link)}" target="_blank" rel="noopener">🔗 ${t('st_open_booking')}</a>` : ''}
          <button type="button" class="ghost sm" data-edit="${s.id}">✏️</button></div></div>`;
    };

    const drawList = () => {
      const cv = coverage();
      const list = [...S.stays].sort((a, b) => (a.in || '9').localeCompare(b.in || '9'));
      el.innerHTML = `<h2>${t('stay_title')}</h2>
        ${A.circuit ? A.circuit.html() : ''}
        ${cv ? `<div class="card"><b>🌙 ${cv.covered} / ${cv.total} ${t('nights')}</b><progress max="${cv.total}" value="${cv.covered}"></progress>
          ${cv.covered < cv.total ? `<p class="muted" style="margin:6px 0 0">⚠️ ${cv.total - cv.covered} ${t('st_uncovered')}</p>` : `<p class="muted" style="margin:6px 0 0">✓ ${t('st_all_covered')}</p>`}</div>` : ''}
        ${list.length ? list.map(stayCard).join('') : `<div class="card" style="text-align:center"><div style="font-size:54px">🏨</div><h3>${t('stay_empty')}</h3><p class="muted">${t('stay_empty_sub')}</p></div>`}
        <button type="button" id="addStay" style="width:100%;padding:14px">＋ ${t('add_stay')}</button>
        <div class="card" style="margin-top:14px"><h3>🔎 ${t('st_search')}</h3>${tripOk ? '' : `<p class="muted">${t('st_nodates_hint')} <a href="#/trip">${t('nav_trip')} →</a></p>`}${searchLinks()}</div>`;
      $('#addStay', el).onclick = () => { f = blank(); editing = 'new'; draw(); scrollTo(0, 0); };
      $$('[data-walk]', el).forEach(b => b.onclick = async () => {
        const st = S.stays.find(x => x.id === b.dataset.walk); if (!st) return;
        if (!st.addr && !st.name) { A.toast(t('st_walk_need')); return; }
        b.disabled = true; b.textContent = '…';
        try { const r = await measure(st); if (r.err) { A.toast(t(r.err === 'nofound' ? 'st_walk_nofound' : 'st_walk_fail')); } else { st.walk = r; save('stays'); } } catch (e) { A.toast(t('st_walk_fail')); }
        drawList();
      });
      if (A.circuit) A.circuit.bind(el, { redraw: () => A.views.stay(el), addStay: st => { A.circuitPrefill = st; A.views.stay(el); scrollTo(0, 0); } });
      $$('[data-edit]', el).forEach(b => b.onclick = () => { f = { ...S.stays.find(x => x.id === b.dataset.edit) }; editing = f.id; draw(); scrollTo(0, 0); });
    };

    const opts = (arr, sel, fmt) => arr.map(v => `<option value="${esc(v)}" ${v === sel ? 'selected' : ''}>${esc(fmt ? fmt(v) : v)}</option>`).join('');
    const drawForm = () => {
      const days = dayList(), isNew = editing === 'new';
      const inList = days.slice(0, -1), outList = days.slice(1);
      el.innerHTML = `<h2>${isNew ? t('add_stay') : t('st_edit')}</h2><div class="card">
        <label>${t('st_city')}</label><select id="fCity" style="width:100%">${CITY_IDS.map(c => `<option value="${c}" ${f.city === c ? 'selected' : ''}>${esc(cityName(c))}</option>`).join('')}<option value="other" ${f.city === 'other' ? 'selected' : ''}>${t('st_other_city')}</option></select>
        <label style="margin-top:8px">${t('st_name')}</label><input id="fName" value="${esc(f.name)}" placeholder="${esc(t('st_name_ph'))}" style="width:100%">
        <div class="chips" style="margin-top:10px"><button type="button" class="chip ${f.status === 'todo' ? 'on' : ''}" data-st="todo">${t('st_todo')}</button><button type="button" class="chip ${f.status === 'booked' ? 'on' : ''}" data-st="booked">✓ ${t('st_booked')}</button></div>
        ${tripOk ? `<div class="row"><div class="grow"><label>🌙 ${t('st_in')}</label><select id="fIn" style="width:100%">${opts(inList, f.in, short)}</select></div>
          <div class="grow"><label>${t('st_out')}</label><select id="fOut" style="width:100%">${opts(outList, f.out, short)}</select></div></div>
          <p class="err" id="fErr"></p>` : `<p class="muted">${t('st_nodates_hint')} <a href="#/trip">${t('nav_trip')} →</a></p>`}
        <label>${t('st_addr')}</label><input id="fAddr" value="${esc(f.addr)}" style="width:100%">
        <label style="margin-top:8px">${t('st_link')}</label><input id="fLink" inputmode="url" autocapitalize="off" value="${esc(f.link)}" placeholder="https://…" style="width:100%">
        <label style="margin-top:8px">${t('booking_ref')} <span class="muted">(${t('local_only')})</span></label><input id="fRef" value="${esc(f.ref)}" style="width:100%">
        ${A.pay.fields('fp', { amount: f.price, cur: f.cur, pay: f.pay, paidAmt: f.paidAmt })}
        <label style="margin-top:8px">${t('st_phone')}</label><input id="fPhone" inputmode="tel" value="${esc(f.phone)}" style="width:100%">
        <label style="margin-top:8px">${t('st_notes')}</label><textarea id="fNotes" rows="3" style="width:100%">${esc(f.notes)}</textarea></div>
        <div class="stickybar"><button type="button" class="ghost" id="cancel">${t('cancel')}</button><button type="button" id="saveStay" style="flex:1">✓ ${t('save')}</button></div>
        ${isNew ? '' : `<p style="text-align:center"><button type="button" class="danger" id="delStay">${t('delete')}</button></p>`}`;
      const bind = (id, k, fn) => { const i = $(id, el); if (i) i.oninput = i.onchange = () => { f[k] = fn ? fn(i.value) : i.value; }; };
      bind('#fCity', 'city'); bind('#fName', 'name'); bind('#fAddr', 'addr'); bind('#fLink', 'link'); bind('#fRef', 'ref'); bind('#fPrice', 'price'); bind('#fCur', 'cur'); bind('#fPhone', 'phone'); bind('#fNotes', 'notes');
      $$('[data-st]', el).forEach(b => b.onclick = () => { f.status = b.dataset.st; $$('[data-st]', el).forEach(x => x.classList.toggle('on', x === b)); });
      A.pay.wire(el, 'fp');
      const fin = $('#fIn', el), fout = $('#fOut', el);
      const checkDates = () => {
        if (!fin) return true;
        f.in = fin.value; f.out = fout.value;
        const ok = f.out > f.in; $('#fErr', el).textContent = ok ? '' : t('err_return'); return ok;
      };
      if (fin) { fin.onchange = fout.onchange = checkDates; checkDates(); }
      $('#cancel', el).onclick = () => { editing = null; draw(); };
      $('#saveStay', el).onclick = () => {
        if (!checkDates()) return;
        const rec = { ...f, name: f.name.trim(), addr: f.addr.trim(), link: safeUrl(f.link), ref: f.ref.trim(), price: String(f.price).trim(), phone: f.phone.trim(), notes: f.notes.trim() };
        const pv = A.pay.read(el, 'fp'); rec.price = pv.amount ? String(pv.amount) : ''; rec.cur = pv.cur; rec.pay = pv.pay; rec.paidAmt = pv.paidAmt;
        const i = S.stays.findIndex(x => x.id === rec.id);
        if (i >= 0) S.stays[i] = rec; else S.stays.push(rec);
        save('stays'); editing = null; draw(); A.toast(t('saved'));
      };
      const del = $('#delStay', el);
      if (del) del.onclick = () => { if (confirm(t('st_delete_confirm'))) { S.stays = S.stays.filter(x => x.id !== f.id); save('stays'); editing = null; draw(); } };
    };

    const draw = () => (editing ? drawForm() : drawList());
    if (A.circuitPrefill && tripOk) { f = blank(); Object.assign(f, { city: A.circuitPrefill.city, in: A.circuitPrefill.in, out: A.circuitPrefill.out }); editing = 'new'; }
    A.circuitPrefill = null;
    if (A.stayEdit) { const ex = S.stays.find(x => x.id === A.stayEdit); if (ex) { f = { ...ex }; editing = ex.id; } A.stayEdit = null; }
    if (A.stayPrefill) { f = blank(); Object.assign(f, A.stayPrefill); editing = 'new'; A.stayPrefill = null; }
    draw();
  };
})();
