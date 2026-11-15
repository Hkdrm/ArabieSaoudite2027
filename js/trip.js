/* Onglet Vols — parcours en 2 mini-écrans, puis cartes de vol :
   1) DATES (calendrier : départ puis retour)  →  2) VOLS (n° de vol de l'aller et du retour, chacun présenté avec SA date)
   → cartes de vol (aller / retour), avec lien vers l'app ou le site de la compagnie.
   Aucun sélecteur natif de date/heure (celui d'iOS valide la date du jour dès qu'on le touche).
   Données : S.journey (voir app.js), enregistrées localement. */
(() => {
  const A = window.Omra;
  const { $, $$, esc, S, save, t } = A;
  const AIRPORTS = { CDG: 'Paris Charles-de-Gaulle', ORY: 'Paris Orly', LYS: 'Lyon', MRS: 'Marseille', NCE: 'Nice', TLS: 'Toulouse', BOD: 'Bordeaux', NTE: 'Nantes', LIL: 'Lille', BRU: 'Bruxelles', GVA: 'Genève',
    JED: 'Jeddah', MED: 'Médine', RUH: 'Riyad', DMM: 'Dammam', TIF: 'Taïf', ULH: 'AlUla' };
  /* Compagnies reconnues d'après le code du vol (site d'accueil officiel ; l'utilisateur peut mettre son propre lien : app, réservation…). */
  const AIRLINES = { SV: ['Saudia', 'https://www.saudia.com'], XY: ['flynas', 'https://www.flynas.com'], F3: ['flyadeal', 'https://www.flyadeal.com'], LX: ['SWISS', 'https://www.swiss.com'],
    AF: ['Air France', 'https://www.airfrance.fr'], KL: ['KLM', 'https://www.klm.fr'], TK: ['Turkish Airlines', 'https://www.turkishairlines.com'], QR: ['Qatar Airways', 'https://www.qatarairways.com'],
    EK: ['Emirates', 'https://www.emirates.com'], EY: ['Etihad', 'https://www.etihad.com'], MS: ['EgyptAir', 'https://www.egyptair.com'], AT: ['Royal Air Maroc', 'https://www.royalairmaroc.com'],
    TU: ['Tunisair', 'https://www.tunisair.com'], AH: ['Air Algérie', 'https://www.airalgerie.dz'], LH: ['Lufthansa', 'https://www.lufthansa.com'], ET: ['Ethiopian', 'https://www.ethiopianairlines.com'],
    PC: ['Pegasus', 'https://www.flypgs.com'], U2: ['easyJet', 'https://www.easyjet.com'], G9: ['Air Arabia', 'https://www.airarabia.com'], BA: ['British Airways', 'https://www.britishairways.com'],
    EW: ['Eurowings', 'https://www.eurowings.com'], WY: ['Oman Air', 'https://www.omanair.com'], GF: ['Gulf Air', 'https://www.gulfair.com'], KU: ['Kuwait Airways', 'https://www.kuwaitairways.com'],
    RJ: ['Royal Jordanian', 'https://www.rj.com'], ME: ['MEA', 'https://www.mea.com.lb'] };
  const FLIGHT_RE = /^[A-Z0-9]{2}\s?\d{1,4}[A-Z]?$/;
  const airline = no => AIRLINES[(no || '').replace(/\s+/g, '').slice(0, 2).toUpperCase()] || null;
  const safeUrl = u => { u = (u || '').trim(); if (!u) return ''; try { const x = new URL(/^[a-z][a-z0-9+.-]*:/i.test(u) ? u : 'https://' + u); return /^https?:$/.test(x.protocol) ? x.href : ''; } catch { return ''; } };   // http(s) uniquement
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
  /* Recherche Google du vol À SA DATE (affiche l'état/les horaires du vol ce jour-là) */
  const verifyUrl = (no, date) => `https://www.google.com/search?q=${encodeURIComponent('vol ' + no.replace(/\s+/g, '') + ' ' + day(date).toLocaleDateString('fr', { day: 'numeric', month: 'long', year: 'numeric' }))}`;

  const routeCache = new Map();
  async function lookupRoute(no) {
    const cs = (no || '').replace(/\s+/g, '').toUpperCase();
    if (routeCache.has(cs)) return routeCache.get(cs);
    const ctl = new AbortController(), tm = setTimeout(() => ctl.abort(), 7000);
    let out = null;
    try {
      const r = await fetch(`https://api.adsbdb.com/v0/callsign/${encodeURIComponent(cs)}`, { signal: ctl.signal });
      const d = await r.json(), f = d && d.response && d.response.flightroute;
      if (f && f.origin && f.destination) out = { from: f.origin.iata_code, to: f.destination.iata_code, fromCity: f.origin.municipality, toCity: f.destination.municipality, airline: f.airline && f.airline.name };
    } catch (e) { return null; }                       // hors ligne / service indisponible : on ne met pas en cache
    finally { clearTimeout(tm); }
    routeCache.set(cs, out);
    return out;
  }

  A.views.trip = el => {
    S.journey = S.journey || {};
    const J = S.journey;
    delete J.date2Rejected;
    const saved = () => !!(J.date1 && J.date2 && J.date2 > J.date1);
    if (!J.from) J.from = 'GVA';                                // départ par défaut : Genève
    let mode = saved() ? 'card' : 'dates';                        // dates → flights → card
    let editLeg = null;                                           // 'out' | 'ret' : panneau de détails ouvert
    const rt = { out: null, ret: null };                          // routes trouvées (adsbdb)
    const form = { d1: J.date1 || '', d2: J.date2 || '', noOut: J.noOut || '', noRet: J.noRet || '', ref: J.ref || '', linkOut: J.linkOut || '', linkRet: J.linkRet || '' };
    const base = form.d1 ? day(form.d1) : new Date();
    const view = { y: base.getFullYear(), m: base.getMonth() };
    const set = (k, v) => { J[k] = v; save('journey'); };
    const datesOk = () => !!(form.d1 && form.d2 && form.d2 > form.d1);
    const numsOk = () => FLIGHT_RE.test((form.noOut || '').trim()) && FLIGHT_RE.test((form.noRet || '').trim());
    const bad = v => v && !FLIGHT_RE.test(v.trim());

    /* ---------- calendrier ---------- */
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
    const dots = (i, n) => `<div class="steps">${[...Array(n)].map((_, k) => `<span class="${k < i ? 'on' : ''}"></span>`).join('')}</div><p class="muted" style="text-align:center;margin:0 0 8px">${t('step_word')} ${i}/${n}</p>`;

    /* ---------- étape 1 : dates ---------- */
    const drawDates = () => {
      const hint = !form.d1 ? t('cal_start') : !form.d2 ? t('cal_end') : '';
      const chosen = form.d1 ? `<div style="margin-top:8px"><b>🛫 ${esc(fmtDate(form.d1))}</b>${form.d2 ? `<br><b>🛬 ${esc(fmtDate(form.d2))}</b> <span class="muted">(${nights(form.d1, form.d2)} ${t('nights')})</span>` : ''}</div>` : '';
      el.innerHTML = `<h2>${t('my_trip')}</h2><button type="button" class="ghost" id="impOpen" style="width:100%;margin-bottom:10px">📋 ${t('imp_btn')}</button>${dots(1, 2)}<div class="card mini"><h3>📅 ${t('dates_title')}</h3>${calendar()}<p class="muted" style="margin:8px 0 0">${hint}</p>${chosen}</div>
        <div class="stickybar">${saved() ? `<button type="button" class="ghost" id="cancelTrip">${t('cancel')}</button>` : ''}<button type="button" id="next" style="flex:1" ${datesOk() ? '' : 'disabled'}>${t('next')} →</button></div>`;
      $$('.cal-day', el).forEach(b => b.onclick = () => { pick(b.dataset.d); const d = day(b.dataset.d); view.y = d.getFullYear(); view.m = d.getMonth(); draw(); });
      $('#calPrev', el).onclick = () => { view.m--; if (view.m < 0) { view.m = 11; view.y--; } draw(); };
      $('#calNext', el).onclick = () => { view.m++; if (view.m > 11) { view.m = 0; view.y++; } draw(); };
      $('#next', el).onclick = () => { if (datesOk()) { mode = 'flights'; draw(); scrollTo(0, 0); } };
      $('#impOpen', el).onclick = () => { mode = 'import'; draw(); scrollTo(0, 0); };
      const cn = $('#cancelTrip', el); if (cn) cn.onclick = () => { mode = 'card'; draw(); };
    };

    /* ---------- étape 2 : vols (chacun avec sa date) ---------- */
    const detect = (no, date) => {
      const a = airline(no);
      return FLIGHT_RE.test((no || '').trim())
        ? `${a ? `✈️ ${esc(a[0])} · ` : ''}<a href="${esc(verifyUrl(no.trim(), date))}" target="_blank" rel="noopener">🔎 ${t('verify_flight')} ↗</a>` : '';
    };
    const legBox = (k, date) => {
      const o = k === 'out', no = o ? form.noOut : form.noRet, link = o ? form.linkOut : form.linkRet;
      return `<div class="legbox"><div class="legdate">${o ? '🛫 ' + t('outbound') : '🛬 ' + t('inbound')} · <b>${esc(fmtDate(date))}</b></div>
        <label>${t('flight_no')} *</label><input id="f${o ? 'NoOut' : 'NoRet'}" value="${esc(no)}" placeholder="${o ? 'SV 124' : 'SV 125'}" autocapitalize="characters" style="width:100%;text-transform:uppercase">
        <p class="err" id="e${o ? 'Out' : 'Ret'}">${bad(no) ? t('flight_fmt') : ''}</p><p class="muted detect" id="d${o ? 'Out' : 'Ret'}">${detect(no, date)}</p><p class="muted detect" id="r${o ? 'Out' : 'Ret'}"></p>
        <label>${t('airline_link')}</label><input id="f${o ? 'LinkOut' : 'LinkRet'}" inputmode="url" autocapitalize="off" value="${esc(link)}" placeholder="https://…" style="width:100%"></div>`;
    };
    const drawFlights = () => {
      const changed = saved() && (form.d1 !== J.date1 || form.d2 !== J.date2) && (J.noOut || J.noRet);
      el.innerHTML = `<h2>${t('my_trip')}</h2>${dots(2, 2)}<div class="card mini"><h3>✈️ ${t('flights_h')}</h3><p class="muted">${t('flights_for_dates')}</p>
        ${changed ? `<p class="err" style="min-height:0">⚠️ ${t('dates_changed_warn')}</p>` : ''}
        ${legBox('out', form.d1)}${legBox('ret', form.d2)}
        <label style="margin-top:10px">${t('booking_ref')} <span class="muted">(${t('local_only')})</span></label><input id="fRef" value="${esc(form.ref)}" style="width:100%">
        <p style="margin:14px 0 0"><a href="https://www.google.com/travel/flights?q=${encodeURIComponent(`Flights from ${J.from || 'GVA'} to Saudi Arabia on ${form.d1} through ${form.d2}`)}" target="_blank" rel="noopener">🔍 ${t('search_hint')} ↗</a></p></div>
        <div class="stickybar"><button type="button" class="ghost" id="back">${t('back')}</button><button type="button" id="saveTrip" style="flex:1" ${numsOk() ? '' : 'disabled'}>✓ ${t('save_trip')}</button></div>
        <p style="text-align:center"><button type="button" class="ghost sm" id="skipNums">${t('no_ticket_yet')}</button></p>`;
      const routeLine = (r, k) => {
        const warn = k === 'out' && (J.from || 'GVA') === 'GVA' && r.from !== 'GVA' ? `<br>⚠️ ${t('route_not_gva').replace('{city}', esc(r.fromCity || r.from))}` : '';
        return `📍 ${esc(r.fromCity || '')} (${esc(r.from)}) → ${esc(r.toCity || '')} (${esc(r.to)}) <span class="muted">· ${t('route_usual')}</span>${warn}`;
      };
      const lookupInto = async k => {
        const no = k === 'out' ? form.noOut : form.noRet, box = $('#r' + (k === 'out' ? 'Out' : 'Ret'), el);
        if (!box) return;
        if (!FLIGHT_RE.test((no || '').trim())) { box.innerHTML = ''; rt[k] = null; return; }
        box.textContent = t('route_loading');
        const r = await lookupRoute(no);
        if ((k === 'out' ? form.noOut : form.noRet) !== no || !document.body.contains(box)) return;      // saisie modifiée entre-temps
        rt[k] = r; box.innerHTML = r ? routeLine(r, k) : t('route_unknown');
      };
      const timers = {}, schedule = k => { clearTimeout(timers[k]); timers[k] = setTimeout(() => lookupInto(k), 600); };
      const upd = () => {
        $('#saveTrip', el).disabled = !numsOk();
        $('#eOut', el).textContent = bad(form.noOut) ? t('flight_fmt') : ''; $('#eRet', el).textContent = bad(form.noRet) ? t('flight_fmt') : '';
        $('#dOut', el).innerHTML = detect(form.noOut, form.d1); $('#dRet', el).innerHTML = detect(form.noRet, form.d2);
      };
      $('#fNoOut', el).oninput = e => { form.noOut = e.target.value.toUpperCase(); upd(); schedule('out'); };
      $('#fNoRet', el).oninput = e => { form.noRet = e.target.value.toUpperCase(); upd(); schedule('ret'); };
      lookupInto('out'); lookupInto('ret');                       // numéros déjà saisis : on affiche leur route tout de suite
      $('#fLinkOut', el).oninput = e => { form.linkOut = e.target.value; };
      $('#fLinkRet', el).oninput = e => { form.linkRet = e.target.value; };
      $('#fRef', el).oninput = e => { form.ref = e.target.value; };
      $('#back', el).onclick = () => { mode = 'dates'; draw(); };
      const commit = withNums => {
        Object.assign(J, { date1: form.d1, date2: form.d2, ref: form.ref.trim(), noOut: withNums ? form.noOut.trim() : '', noRet: withNums ? form.noRet.trim() : '',
          linkOut: safeUrl(form.linkOut), linkRet: safeUrl(form.linkRet) });
        if (withNums) {                                               // aéroports trouvés d'après le numéro de vol
          const ap = (k, r) => { if (!r) return; if (k === 'out') { J.from = r.from; J.to = r.to; } else { J.retFrom = r.from; J.retTo = r.to; } J.names = { ...(J.names || {}), [r.from]: r.fromCity, [r.to]: r.toCity }; };
          ap('out', rt.out); ap('ret', rt.ret);
        }
        save('journey'); S.trip = { start: '', end: '' }; save('trip');
        mode = 'card'; A.toast(t('dates_ok')); draw(); scrollTo(0, 0);
      };
      $('#saveTrip', el).onclick = () => { if (datesOk() && numsOk()) commit(true); };
      $('#skipNums', el).onclick = () => { if (datesOk()) commit(false); };
    };


    /* ---------- import depuis un billet / e-mail : capture, photo ou PDF d'abord ; texte collé en secours ---------- */
    const imp = { segs: [], role: [], text: '', status: '', dates: [] };
    const roleDefaults = () => { const n = imp.segs.length; imp.role = imp.segs.map((_, i) => (i === 0 ? 'out' : i === n - 1 && n > 1 ? 'ret' : 'skip')); };
    const analyze = async () => {
      const T = A.ticket;
      imp.segs = T ? T.parse(imp.text) : []; imp.dates = T ? T.allDates(imp.text) : [];
      for (const sg of imp.segs) if (!sg.from || !sg.to) { const r = await lookupRoute(sg.no); if (r) { sg.from = sg.from || r.from; sg.to = sg.to || r.to; sg.fromCity = r.fromCity; sg.toCity = r.toCity; } }
      roleDefaults();
    };
    const parseDateInput = v => { const d = A.ticket.datesIn(v)[0]; return d || ''; };
    const impResult = () => {
      if (!imp.segs.length) return imp.text.trim() ? `<div class="card"><p>${t('imp_none')}</p></div>` : '';
      const rows = imp.segs.map((sg, i) => `<div class="legbox" data-seg="${i}">
          <div class="row"><input data-sf="no" value="${esc(sg.no)}" style="width:96px;text-transform:uppercase;font-weight:700"><span class="muted">${esc(sg.date ? fmtDate(sg.date) : '—')}</span></div>
          <div class="chips" style="margin-top:6px">${imp.dates.map(d => `<button type="button" class="chip ${sg.date === d ? 'on' : ''}" data-sd="${i}:${d}">${esc(day(d).toLocaleDateString(loc(), { day: 'numeric', month: 'short', year: 'numeric' }))}</button>`).join('')}
            <input data-sf="dateText" placeholder="jj/mm/aaaa" inputmode="numeric" style="width:110px" value=""></div>
          <div class="row" style="margin-top:6px"><div><label>${t('from_lbl')}</label><input data-sf="from" value="${esc(sg.from)}" maxlength="3" style="width:66px;text-transform:uppercase"></div>
            <div><label>${t('to_lbl')}</label><input data-sf="to" value="${esc(sg.to)}" maxlength="3" style="width:66px;text-transform:uppercase"></div>
            <div><label>${t('dep_time')}</label><input data-sf="dep" inputmode="numeric" value="${esc(sg.dep)}" maxlength="5" style="width:70px"></div>
            <div><label>${t('arr_time')}</label><input data-sf="arr" inputmode="numeric" value="${esc(sg.arr)}" maxlength="5" style="width:70px"></div>
            <div><label>${t('terminal')}</label><input data-sf="term" value="${esc(sg.term)}" style="width:56px"></div></div>
          <div class="chips" style="margin-top:8px">${[['out', t('outbound')], ['ret', t('inbound')], ['skip', t('imp_ignore')]].map(([k, l]) => `<button type="button" class="chip ${imp.role[i] === k ? 'on' : ''}" data-role="${i}:${k}">${esc(l)}</button>`).join('')}</div></div>`).join('');
      return `<div class="card"><h3>✅ ${imp.segs.length} ${t('imp_found')}</h3><p class="muted">${t('imp_check')}</p>${rows}</div>
        <div class="stickybar"><button type="button" id="impApply" style="flex:1">✓ ${t('imp_apply')}</button></div>`;
    };
    const drawImport = () => {
      el.innerHTML = `<h2>${t('my_trip')}</h2><div class="card mini"><h3>📋 ${t('imp_title')}</h3><p class="muted">${t('imp_hint')}</p>
        <button type="button" id="impPic" style="width:100%;padding:14px">📷 ${t('imp_pick')}</button>
        <input type="file" id="impFile" accept="image/*,application/pdf" hidden>
        <p class="muted" id="impStatus">${esc(imp.status)}</p>
        <details ${imp.text.trim() ? 'open' : ''}><summary>${t('imp_paste')}</summary>
          <textarea id="impText" rows="7" style="width:100%;margin-top:6px" placeholder="${esc(t('imp_placeholder'))}">${esc(imp.text)}</textarea>
          <button type="button" class="ghost" id="impGo" style="margin-top:6px">🔎 ${t('imp_analyze')}</button></details></div>
        <div id="impResult">${impResult()}</div>
        <div class="stickybar"><button type="button" class="ghost" id="back">${t('back')}</button></div>`;
      const wire = () => {
        $$('[data-role]', el).forEach(bt => bt.onclick = () => { const [i, k] = bt.dataset.role.split(':'); imp.role.forEach((r, j) => { if (r === k && k !== 'skip' && +i !== j) imp.role[j] = 'skip'; }); imp.role[+i] = k; refresh(); });
        $$('[data-sd]', el).forEach(bt => bt.onclick = () => { const [i, d] = bt.dataset.sd.split(':'); imp.segs[+i].date = d; refresh(); });
        $$('[data-sf]', el).forEach(inp => inp.onchange = () => {                      // correction manuelle d'un champ
          const sg = imp.segs[+inp.closest('[data-seg]').dataset.seg], f = inp.dataset.sf; let v = inp.value;
          if (f === 'no') sg.no = v.toUpperCase().trim(); else if (f === 'from' || f === 'to') sg[f] = iata(v); else if (f === 'dep' || f === 'arr') sg[f] = fmtTime(v);
          else if (f === 'term') sg.term = v.trim().toUpperCase(); else if (f === 'dateText') { const d = parseDateInput(v); if (d) { sg.date = d; if (!imp.dates.includes(d)) imp.dates.push(d); } }
          refresh();
        });
        const ap = $('#impApply', el); if (ap) ap.onclick = applyImport;
      };
      const refresh = () => { $('#impResult', el).innerHTML = impResult(); wire(); };
      wire();
      $('#back', el).onclick = () => { mode = saved() ? 'card' : 'dates'; draw(); };
      const go = async () => { $('#impStatus', el).textContent = t('imp_reading'); await analyze(); imp.status = ''; drawImport(); };
      $('#impGo', el).onclick = () => { imp.text = $('#impText', el).value; go(); };
      $('#impPic', el).onclick = () => $('#impFile', el).click();
      $('#impFile', el).onchange = async e => {
        const file = e.target.files && e.target.files[0]; if (!file) return;
        try {
          imp.text = await A.ticket.extract(file, (st, pr) => { const bx = $('#impStatus', el); if (bx) bx.textContent = `${t('imp_reading')} ${Math.round(pr * 100)} %`; });
          await go();
        } catch (err) { imp.status = /pdf/.test(String(err && err.message)) ? t('imp_pdf_fail') : t('imp_ocr_fail'); const bx = $('#impStatus', el); if (bx) bx.textContent = imp.status; }
      };
    };
    const applyImport = () => {
      const out = imp.segs[imp.role.indexOf('out')], ret = imp.segs[imp.role.indexOf('ret')];
      if (!out && !ret) return A.toast(t('imp_pick_role'));
      const d1 = out ? out.date : J.date1, d2 = ret ? ret.date : J.date2;
      if (out && !out.date) return A.toast(t('imp_no_date'));
      if (ret && !ret.date) return A.toast(t('imp_no_date'));
      if (d1 && d2 && d2 <= d1) return A.toast(t('err_return'));
      const put = (o, keys) => { if (o.no) J[keys.no] = o.no; if (o.date) J[keys.date] = o.date; if (o.from) J[keys.from] = o.from; if (o.to) J[keys.to] = o.to; if (o.dep) J[keys.dep] = o.dep; if (o.arr) J[keys.arr] = o.arr; if (o.term) J[keys.term] = o.term;
        J.names = { ...(J.names || {}), ...(o.fromCity ? { [o.from]: o.fromCity } : {}), ...(o.toCity ? { [o.to]: o.toCity } : {}) }; };
      if (out) put(out, { no: 'noOut', date: 'date1', from: 'from', to: 'to', dep: 'depOut', arr: 'arrOut', term: 'termOut' });
      if (ret) put(ret, { no: 'noRet', date: 'date2', from: 'retFrom', to: 'retTo', dep: 'depRet', arr: 'arrRet', term: 'termRet' });
      save('journey'); S.trip = { start: '', end: '' }; save('trip');
      Object.assign(form, { d1: J.date1 || '', d2: J.date2 || '', noOut: J.noOut || '', noRet: J.noRet || '' });
      A.toast(t('imported'));
      if (saved()) { mode = 'card'; } else { mode = 'dates'; if (form.d1) { const b = day(form.d1); view.y = b.getFullYear(); view.m = b.getMonth(); } }
      draw(); scrollTo(0, 0);
    };

    /* ---------- cartes de vol ---------- */
    const leg = k => {
      const o = k === 'out';
      return o ? { no: J.noOut, date: J.date1, from: J.from, to: J.to, dep: J.depOut, arr: J.arrOut, term: J.termOut, link: J.linkOut }
               : { no: J.noRet, date: J.date2, from: J.retFrom || J.to, to: J.retTo || J.from, dep: J.depRet, arr: J.arrRet, term: J.termRet, link: J.linkRet };
    };
    const keys = k => k === 'out' ? { no: 'noOut', from: 'from', to: 'to', dep: 'depOut', arr: 'arrOut', term: 'termOut', link: 'linkOut' }
                                  : { no: 'noRet', from: 'retFrom', to: 'retTo', dep: 'depRet', arr: 'arrRet', term: 'termRet', link: 'linkRet' };
    const nameOf = c => (J.names && J.names[c]) || AIRPORTS[c] || '';
    const chip = date => { const d = daysTo(date); return d > 0 ? `J-${d}` : d === 0 ? t('today') : t('past_lbl'); };

    const legCard = k => {
      const L = leg(k), o = k === 'out';
      const valid = FLIGHT_RE.test((L.no || '').trim());
      const tm = v => v ? esc(v) : (valid ? `<a class="seeTime" href="${esc(verifyUrl(L.no, L.date))}" target="_blank" rel="noopener">${t('see_time')}</a>` : '--:--');
      const info = valid ? `<a class="btn" href="${esc(verifyUrl(L.no, L.date))}" target="_blank" rel="noopener">ℹ️ ${t('flight_info')}</a>` : '';
      const a = airline(L.no), url = safeUrl(L.link) || (a ? a[1] : '');
      const open = url ? `<a class="btn alt" href="${esc(url)}" target="_blank" rel="noopener">✈️ ${esc(a && !safeUrl(L.link) ? a[0] : t('airline_app'))} ↗</a>` : '';
      const panel = editLeg === k ? `<div class="legedit">
        <div class="row"><div class="grow"><label>${t('flight_no')}</label><input data-f="no" value="${esc(L.no || '')}" placeholder="SV 124" autocapitalize="characters" style="width:100%;text-transform:uppercase"></div></div>
        <div class="row" style="margin-top:6px"><div class="grow"><label>${t('from_lbl')}</label><input data-f="from" list="apts" value="${esc(L.from || '')}" maxlength="3" placeholder="GVA" style="width:100%;text-transform:uppercase"></div>
          <div class="grow"><label>${t('to_lbl')}</label><input data-f="to" list="apts" value="${esc(L.to || '')}" maxlength="3" placeholder="JED" style="width:100%;text-transform:uppercase"></div></div>
        <div class="row" style="margin-top:6px"><div class="grow"><label>${t('dep_time')}</label><input data-f="dep" inputmode="numeric" value="${esc(L.dep || '')}" placeholder="10:30" maxlength="5" style="width:100%"></div>
          <div class="grow"><label>${t('arr_time')}</label><input data-f="arr" inputmode="numeric" value="${esc(L.arr || '')}" placeholder="17:05" maxlength="5" style="width:100%"></div>
          <div class="grow"><label>${t('terminal')}</label><input data-f="term" value="${esc(L.term || '')}" placeholder="2" style="width:100%"></div></div>
        <div style="margin-top:6px"><label>${t('airline_link')}</label><input data-f="link" inputmode="url" autocapitalize="off" value="${esc(L.link || '')}" placeholder="https://…" style="width:100%"></div>
        <button type="button" id="legOk" style="margin-top:10px">${t('done_btn')}</button></div>` : '';
      return `<div class="card flight"><div class="row"><span class="pill">${o ? '🛫 ' + t('outbound') : '🛬 ' + t('inbound')}</span>
          <b class="grow" style="font-size:18px">${L.no ? esc(L.no) : `<a href="#" data-edit="${k}">＋ ${t('add_flight_no')}</a>`}</b><span class="pill">${esc(chip(L.date))}</span></div>
        <div class="route"><div><div class="code">${esc(L.from || '—')}</div><div class="cname">${esc(nameOf(L.from))}</div><div class="time">${tm(L.dep)}</div></div><div class="plane">✈️</div>
          <div style="text-align:end"><div class="code">${esc(L.to || '—')}</div><div class="cname">${esc(nameOf(L.to))}</div><div class="time">${tm(L.arr)}</div></div></div>
        <div class="muted">📅 ${esc(fmtDate(L.date))}${L.term ? ' · ' + t('terminal') + ' ' + esc(L.term) : ''}</div>
        <div class="row" style="margin-top:10px">${info}${open}<button type="button" class="ghost sm" data-edit="${k}">✏️ ${t('details')}</button></div>${panel}</div>`;
    };

    const drawCard = () => {
      const d = daysTo(J.date1), end = daysTo(J.date2);
      const hero = d > 0 ? `<small>${t('countdown')}</small><div class="big">${d}</div><small>${t('days')} · ${nights(J.date1, J.date2)} ${t('nights')}</small>`
        : end >= 0 ? `<div class="big">✈️</div><small>${t('trip_ongoing')}</small>` : `<div class="big">✓</div><small>${t('trip_over')}</small>`;
      el.innerHTML = `<h2>${t('my_trip')}</h2><datalist id="apts">${Object.entries(AIRPORTS).map(([c, n]) => `<option value="${c}">${esc(n)}</option>`).join('')}</datalist>
        <div class="card hero">${hero}</div>${legCard('out')}${legCard('ret')}
        ${J.ref ? `<div class="card"><label>${t('booking_ref')}</label><b>${esc(J.ref)}</b></div>` : ''}
        <a class="card" href="#/expenses" id="payFl" style="display:block;color:inherit;text-decoration:none"><b>💶 ${t('pay_fl_btn')} →</b><div class="muted" style="font-size:13px">${t('pay_fl_sub')}</div></a>
        <button type="button" class="ghost" id="impOpen" style="width:100%;margin-bottom:10px">📋 ${t('imp_btn_complete')}</button>
        <div class="row"><button type="button" class="ghost" id="editTrip">✏️ ${t('edit_trip')}</button><button type="button" class="danger" id="delTrip">${t('delete_trip')}</button></div>`;
      $$('[data-edit]', el).forEach(b => b.onclick = e => { e.preventDefault(); editLeg = editLeg === b.dataset.edit ? null : b.dataset.edit; draw(); });
      const pf = $('#payFl', el); if (pf) pf.onclick = () => { window.Omra.payOpen = 'flight-out'; };
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
      $('#impOpen', el).onclick = () => { mode = 'import'; draw(); scrollTo(0, 0); };
      $('#editTrip', el).onclick = () => {
        Object.assign(form, { d1: J.date1 || '', d2: J.date2 || '', noOut: J.noOut || '', noRet: J.noRet || '', ref: J.ref || '', linkOut: J.linkOut || '', linkRet: J.linkRet || '' });
        const b = form.d1 ? day(form.d1) : new Date(); view.y = b.getFullYear(); view.m = b.getMonth();
        mode = 'dates'; editLeg = null; draw();
      };
      $('#delTrip', el).onclick = () => {
        if (!confirm(t('confirm_delete_trip'))) return;
        for (const k of Object.keys(J)) delete J[k];
        J.from = 'GVA'; S.trip = { start: '', end: '' }; save('trip'); save('journey');
        Object.assign(form, { d1: '', d2: '', noOut: '', noRet: '', ref: '', linkOut: '', linkRet: '' });
        mode = 'dates'; editLeg = null; draw();
      };
    };

    const draw = () => (mode === 'import' ? drawImport() : mode === 'card' && saved() ? drawCard() : mode === 'flights' ? drawFlights() : drawDates());
    draw();
  };
})();
