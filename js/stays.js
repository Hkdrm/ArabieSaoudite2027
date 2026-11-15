/* Onglet Logement : hôtels / appartements à ajouter quand ils sont réservés (ou « à réserver »).
   Les nuits se choisissent parmi les dates du voyage (liste explicite : pas de sélecteur natif de date).
   Données : S.stays (synchronisées, sauf la référence de réservation), enregistrées localement. */
(() => {
  const A = window.Omra;
  const { $, $, esc, S, save, t } = A;
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

    const stayCard = s => {
      const n = s.in && s.out && s.out > s.in ? nights(s.in, s.out) : 0;
      const link = safeUrl(s.link);
      return `<div class="card stay"><div class="row"><b class="grow" style="font-size:17px">🏨 ${esc(s.name || t('st_noname'))}</b>
          <span class="pill ${s.status === 'booked' ? 'ok' : ''}">${s.status === 'booked' ? '✓ ' + t('st_booked') : t('st_todo')}</span></div>
        <div class="muted" style="margin:4px 0">📍 ${esc(cityName(s.city))}${n ? ` · 🌙 ${n} ${t('nights')}` : ''}</div>
        ${s.in && s.out ? `<div>📅 ${esc(short(s.in))} → ${esc(short(s.out))}</div>` : ''}
        ${s.addr ? `<div class="muted">${esc(s.addr)}</div>` : ''}
        ${s.price ? `<div>💰 ${esc(s.price)} ${esc(s.cur || 'CHF')}${Number.isFinite(Money.toCHF(s.price,s.cur||'CHF',S.fxRates)) && (s.cur||'CHF') !== 'CHF' ? ` <span class="muted">≈ ${Money.format(Money.toCHF(s.price,s.cur||'CHF',S.fxRates),'CHF','fr-CH')}</span>` : ''}</div>` : ''}
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
        ${cv ? `<div class="card"><b>🌙 ${cv.covered} / ${cv.total} ${t('nights')}</b><progress max="${cv.total}" value="${cv.covered}"></progress>
          ${cv.covered < cv.total ? `<p class="muted" style="margin:6px 0 0">⚠️ ${cv.total - cv.covered} ${t('st_uncovered')}</p>` : `<p class="muted" style="margin:6px 0 0">✓ ${t('st_all_covered')}</p>`}</div>` : ''}
        ${list.length ? list.map(stayCard).join('') : `<div class="card" style="text-align:center"><div style="font-size:54px">🏨</div><h3>${t('stay_empty')}</h3><p class="muted">${t('stay_empty_sub')}</p></div>`}
        <button type="button" id="addStay" style="width:100%;padding:14px">＋ ${t('add_stay')}</button>
        <div class="card" style="margin-top:14px"><h3>🔎 ${t('st_search')}</h3>${tripOk ? '' : `<p class="muted">${t('st_nodates_hint')} <a href="#/trip">${t('nav_trip')} →</a></p>`}${searchLinks()}</div>`;
      $('#addStay', el).onclick = () => { f = blank(); editing = 'new'; draw(); scrollTo(0, 0); };
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
        <div class="row" style="margin-top:8px"><div class="grow"><label>${t('st_price')}</label><input id="fPrice" inputmode="decimal" value="${esc(f.price)}" style="width:100%"></div>
          <div><label>${t('currency')}</label><select id="fCur">${opts([...new Set([...CUR, f.cur].filter(Boolean))], f.cur)}</select></div></div>
        <label style="margin-top:8px">${t('st_phone')}</label><input id="fPhone" inputmode="tel" value="${esc(f.phone)}" style="width:100%">
        <label style="margin-top:8px">${t('st_notes')}</label><textarea id="fNotes" rows="3" style="width:100%">${esc(f.notes)}</textarea></div>
        <div class="stickybar"><button type="button" class="ghost" id="cancel">${t('cancel')}</button><button type="button" id="saveStay" style="flex:1">✓ ${t('save')}</button></div>
        ${isNew ? '' : `<p style="text-align:center"><button type="button" class="danger" id="delStay">${t('delete')}</button></p>`}`;
      const bind = (id, k, fn) => { const i = $(id, el); if (i) i.oninput = i.onchange = () => { f[k] = fn ? fn(i.value) : i.value; }; };
      bind('#fCity', 'city'); bind('#fName', 'name'); bind('#fAddr', 'addr'); bind('#fLink', 'link'); bind('#fRef', 'ref'); bind('#fPrice', 'price'); bind('#fCur', 'cur'); bind('#fPhone', 'phone'); bind('#fNotes', 'notes');
      $$('[data-st]', el).forEach(b => b.onclick = () => { f.status = b.dataset.st; $$('[data-st]', el).forEach(x => x.classList.toggle('on', x === b)); });
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
        const i = S.stays.findIndex(x => x.id === rec.id);
        if (i >= 0) S.stays[i] = rec; else S.stays.push(rec);
        save('stays'); editing = null; draw(); A.toast(t('saved'));
      };
      const del = $('#delStay', el);
      if (del) del.onclick = () => { if (confirm(t('st_delete_confirm'))) { S.stays = S.stays.filter(x => x.id !== f.id); save('stays'); editing = null; draw(); } };
    };

    const draw = () => (editing ? drawForm() : drawList());
    draw();
  };
})();
