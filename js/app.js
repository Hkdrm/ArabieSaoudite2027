(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem('omra:' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem('omra:' + k, JSON.stringify(v)); } catch {} },
  };

  const APP_VERSION = '2026-11-14.42';   // à incrémenter à chaque publication (même valeur que le cache de sw.js)

  /* ---------- état ---------- */
  const detect = () => { const l = (navigator.language || 'fr').slice(0, 2); return LANGS[l] ? l : 'fr'; };
  const S = {
    lang: store.get('lang', detect()),
    city: store.get('city', 'makkah'),
    geo: store.get('geo', null),            // {lat,lng,tz}
    method: store.get('method', 'ummalqura'),
    trip: store.get('trip', { start: '', end: '' }),
    plan: store.get('plan', null),          // null = jamais initialisé
    checks: store.get('checks', {}),
    custom: store.get('custom', []),        // items checklist perso
    cnt: store.get('cnt', { tawaf: 0, sai: 0 }),
    exp: store.get('exp', []),
    budget: store.get('budget', 0),
    rate: store.get('rate', 0.23),
    cur: store.get('cur', 'EUR'),
    fav: store.get('fav', []), visited: store.get('visited', {}), notes: store.get('notes', {}), vids: store.get('vids', {}), here: store.get('here', null), journey: store.get('journey', null), stays: store.get('stays', []),
  };
  const hooks = { onSave: () => {} };
  const SYNC_KEYS = ['lang', 'city', 'method', 'trip', 'plan', 'checks', 'custom', 'cnt', 'exp', 'budget', 'rate', 'cur', 'fav', 'visited', 'notes', 'vids', 'journey', 'stays'];
  (function migrate() {
    const old = store.get('flights', null);
    if (S.journey || !old) return;
    const o = (old.out && old.out.legs) || [], r = (old.ret && old.ret.legs) || [];
    if (!o.length && !r.length) return;
    S.journey = { from: (o[0] || {}).from || '', to: (o.length ? o[o.length - 1].to : '') || '', date1: (o[0] || {}).date || '', date2: (r.length ? r[r.length - 1].date : '') || '',
      noOut: (o[0] || {}).no || '', noRet: (r[0] || {}).no || '', depOut: (o[0] || {}).dep || '', arrOut: (o.length ? o[o.length - 1].arr : '') || '',
      depRet: (r[0] || {}).dep || '', arrRet: (r.length ? r[r.length - 1].arr : '') || '', ref: (old.out && old.out.ref) || '' };
    store.set('journey', S.journey);
  })();
  const save = (k) => {
    store.set(k, S[k]);
    if (k !== 'geo' && k !== 'here') { store.set('ts', Date.now()); hooks.onSave(k); }
  };
  const t = k => (I18N[S.lang] && I18N[S.lang][k]) ?? I18N.fr[k] ?? k;
  const L = o => (o && (o[S.lang] || o.fr || o.en)) || '';
  const nf = n => new Intl.NumberFormat(S.lang === 'ar' ? 'ar-SA-u-nu-latn' : S.lang, { maximumFractionDigits: 2 }).format(n);

  function place() {
    if (S.city === 'geo' && S.geo) return { name: t('my_position'), ...S.geo, tzFallback: 3 };
    const c = CITIES[S.city] || CITIES.makkah;
    return { name: L(c.n), lat: c.lat, lng: c.lng, tz: c.tz, tzFallback: 3 };
  }

  /* ---------- langue / thème ---------- */
  function applyLang() {
    document.documentElement.lang = S.lang;
    document.documentElement.dir = S.lang === 'ar' ? 'rtl' : 'ltr';
    document.title = t('app_name');
    $('#appName').textContent = t('app_name');
    $('#tagline').textContent = t('tagline');
    $('#langSel').innerHTML = Object.entries(LANGS).map(([k, v]) => `<option value="${k}" ${k === S.lang ? 'selected' : ''}>${v}</option>`).join('');
    const nav = [['home', '🏠'], ['trip', '✈️'], ['stay', '🏨'], ['explore', '🧭'], ['omra', '🕋'], ['prayer', '🕌'], ['plan', '📒'], ['tools', '🧰']];
    $('#nav').innerHTML = nav.map(([r, i]) => `<a href="#/${r}" data-r="${r}"><b>${i}</b>${esc(t('nav_' + r))}</a>`).join('');
  }
  $('#langSel').addEventListener('change', e => { S.lang = e.target.value; save('lang'); applyLang(); route(); });

  /* ---------- routeur ---------- */
  const views = {};
  let timer = null, mapObj = null, orient = null, geoWatch = null;
  function route() {
    clearInterval(timer); timer = null;
    document.body.style.overflow = '';                      // une fiche ouverte (Explorer) ne doit pas bloquer le défilement ailleurs
    if (orient) { window.removeEventListener('deviceorientationabsolute', orient, true); window.removeEventListener('deviceorientation', orient, true); orient = null; }
    if (mapObj) { mapObj.remove(); mapObj = null; }
    if (geoWatch != null && navigator.geolocation) { navigator.geolocation.clearWatch(geoWatch); geoWatch = null; }
    const [r, arg] = (location.hash.replace('#/', '') || 'home').split('/');
    const name = views[r] ? r : 'home';
    $$('#nav a').forEach(a => a.classList.toggle('on', a.dataset.r === (name === 'place' || name === 'map' || name === 'discoveries' ? 'explore' : name)));
    $('#view').innerHTML = '';
    views[name]($('#view'), arg);
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);
  function toast(msg) { const d = document.createElement('div'); d.className = 'toast'; d.textContent = msg; document.body.appendChild(d); setTimeout(() => d.remove(), 2200); }

  /* ---------- Accueil ---------- */
  views.home = el => {
    const draw = () => {
      const p = place();
      const nx = Prayer.next(p.lat, p.lng, p.tz || Intl.DateTimeFormat().resolvedOptions().timeZone, p.tzFallback, S.method);
      const m = Math.floor(nx.minutes), h = Math.floor(m / 60), mm = m % 60;
      let hero = '';
      const now = new Date(); now.setHours(0, 0, 0, 0);
      if (tripStart()) {
        const s = new Date(tripStart() + 'T00:00'), e = tripEnd() ? new Date(tripEnd() + 'T00:00') : s;
        const d = Math.round((s - now) / 864e5);
        if (d > 0) hero = `<small>${t('countdown')}</small><div class="big">${d}</div><small>${t('days')}</small>`;
        else if (now <= e) hero = `<div class="big">${t('day_word')} ${Math.round((now - s) / 864e5) + 1}</div><small>${t('trip_ongoing')}</small>`;
        else hero = `<div class="big">✓</div><small>${t('trip_over')}</small>`;
      }                                                    // sans dates : pas de bandeau
      const nowD = new Date(), todayStr = `${nowD.getFullYear()}-${String(nowD.getMonth() + 1).padStart(2, '0')}-${String(nowD.getDate()).padStart(2, '0')}`;
      const nextFlight = [...legs('out'), ...legs('ret')].filter(l => l.date && l.date >= todayStr)
        .sort((a, b) => (a.date + (a.dep || '')).localeCompare(b.date + (b.dep || '')))[0];
      let hijri = '';
      try { hijri = new Intl.DateTimeFormat((S.lang === 'ar' ? 'ar-SA' : S.lang) + '-u-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date()); } catch {}
      el.innerHTML = `
        ${hero ? `<div class="card hero">${hero}</div>` : ''}
        <div class="card"><div class="row"><div class="grow"><h3>${t('next_prayer')} · ${esc(p.name)}</h3>
          <div style="font-size:28px;font-weight:700">${t(nx.key)} <span class="muted">${t('in')} ${h ? h + 'h ' : ''}${String(mm).padStart(2, '0')}min</span></div>
          <div class="muted">${esc(hijri)}</div></div><a class="btn" href="#/prayer">🕌</a></div></div>
        ${nextFlight ? `<a class="card" href="#/trip" style="display:block;color:inherit;text-decoration:none"><h3>✈️ ${t('next_flight')}</h3><b>${esc(nextFlight.no || '')} ${esc(nextFlight.from || '')} → ${esc(nextFlight.to || '')}</b><div class="muted">${esc(nextFlight.date || '')} ${esc(nextFlight.dep || '')}</div></a>` : ''}
        ${tripStart() ? '' : `<a class="card" href="#/trip" style="display:block;color:inherit;text-decoration:none"><h3>✈️ ${t('trip_title')}</h3><span class="muted">${t('set_dates')} →</span></a>`}
        <h3>${t('quick')}</h3>
        <div class="grid2">
          <a class="tile" href="#/omra"><span>🕋</span>${t('quick_omra')}</a>
          <a class="tile" href="#/plan"><span>🗓️</span>${t('quick_plan')}</a>
          <a class="tile" href="#/explore"><span>🧭</span>${t('quick_map')}</a>
          <a class="tile" href="#/tools"><span>✅</span>${t('quick_list')}</a>
        </div>
        <p class="muted" id="inst"></p>`;
    };
    draw(); timer = setInterval(() => { if (!document.activeElement || document.activeElement.tagName !== 'INPUT') draw(); }, 30000);
    if (deferredInstall) { $('#inst', el).innerHTML = `<button id="instBtn">⬇️ ${t('install')}</button>`; $('#instBtn', el).onclick = () => deferredInstall.prompt(); }
  };
  let deferredInstall = null;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstall = e; if ((location.hash || '#/home') === '#/home') route(); });

  function buildItin(city, hours, cats) {
    const c = CITIES[city]; let cur = { lat: c.lat, lng: c.lng }, left = hours * 60;
    const pool = PLACES.filter(p => p.city === city && p.mins > 0 && cats.includes(p.c)), out = [];
    while (pool.length) {
      pool.sort((a, b) => km(cur, a) - km(cur, b));
      const k = pool.findIndex(p => km(cur, p) / 25 * 60 + 5 + p.mins <= left);
      if (k < 0) break;
      const p = pool.splice(k, 1)[0], tr = Math.round(km(cur, p) / 25 * 60 + 5);
      left -= tr + p.mins; out.push({ p, tr }); cur = p;
    }
    return { out, used: hours * 60 - left };
  }

  /* ---------- dates issues des vols ---------- */
  const legs = k => {
    const j = S.journey || {};
    if (k === 'out') return j.date1 ? [{ date: j.date1, no: j.noOut, from: j.from, to: j.to, dep: j.depOut }] : [];
    return j.date2 ? [{ date: j.date2, no: j.noRet, from: j.retFrom || j.to, to: j.retTo || j.from, dep: j.depRet }] : [];
  };
  const firstDate = k => legs(k).map(l => l.date).filter(Boolean).sort()[0] || '';
  const lastDate = k => legs(k).map(l => l.date).filter(Boolean).sort().at(-1) || '';
  const tripStart = () => firstDate('out') || S.trip.start;
  const tripEnd = () => lastDate('ret') || S.trip.end;


  /* ---------- Import d'infos de vol via un lien préparé (#/import/…) : champs validés un par un ---------- */
  views.import = (el, arg) => {
    let d = null;
    try { const b64 = String(arg || '').replace(/-/g, '+').replace(/_/g, '/'); d = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(b64), c => c.charCodeAt(0)))); } catch (e) { d = null; }
    const RX = { date1: /^\d{4}-\d{2}-\d{2}$/, date2: /^\d{4}-\d{2}-\d{2}$/, noOut: /^[A-Z0-9]{2}\s?\d{1,4}[A-Z]?$/, noRet: /^[A-Z0-9]{2}\s?\d{1,4}[A-Z]?$/,
      from: /^[A-Z]{3}$/, to: /^[A-Z]{3}$/, retFrom: /^[A-Z]{3}$/, retTo: /^[A-Z]{3}$/, depOut: /^\d{2}:\d{2}$/, arrOut: /^\d{2}:\d{2}$/, depRet: /^\d{2}:\d{2}$/, arrRet: /^\d{2}:\d{2}$/,
      termOut: /^[\w -]{1,8}$/, termRet: /^[\w -]{1,8}$/ };
    const clean = {};
    if (d && typeof d === 'object') for (const k of Object.keys(RX)) if (typeof d[k] === 'string' && RX[k].test(d[k])) clean[k] = d[k];
    if (d && d.names && typeof d.names === 'object') { clean.names = {}; for (const [c, n] of Object.entries(d.names)) if (/^[A-Z]{3}$/.test(c) && typeof n === 'string') clean.names[c] = n.slice(0, 40); }
    const keys = Object.keys(clean);
    if (!keys.length) { el.innerHTML = `<h2>${t('import')}</h2><div class="card"><p>${t('import_err')}</p><a class="btn" href="#/trip">${t('nav_trip')}</a></div>`; return; }
    const rows = keys.filter(k => k !== 'names').map(k => `<div class="item"><span class="tx muted">${esc(k)}</span><b>${esc(clean[k])}</b></div>`).join('');
    el.innerHTML = `<h2>${t('import')}</h2><div class="card"><p>${t('import_ask')}</p>${rows}
      <div class="row" style="margin-top:12px"><button type="button" id="impOk">✓ ${t('import')}</button><a class="btn alt" href="#/trip">${t('cancel')}</a></div></div>`;
    $('#impOk', el).onclick = () => {
      S.journey = S.journey || {};
      Object.assign(S.journey, clean, clean.names ? { names: { ...(S.journey.names || {}), ...clean.names } } : {});
      save('journey'); toast(t('imported')); location.hash = '#/trip';
    };
  };

  /* ---------- Planning / Carnet ---------- */
  views.plan = el => {
    if (S.plan === null) { S.plan = []; save('plan'); }
    const IT = { city: 'madinah', hours: 4, cats: ['holy', 'sira', 'heritage'], result: null };
    const draw = () => {
      const start = tripStart() ? new Date(tripStart() + 'T00:00') : null;
      const items = [...S.plan].sort((a, b) => a.day - b.day);
      const dateOf = d => { if (!start) return ''; const x = new Date(start); x.setDate(x.getDate() + d - 1); return x.toLocaleDateString(S.lang === 'ar' ? 'ar-SA-u-nu-latn' : S.lang, { weekday: 'short', day: 'numeric', month: 'short' }); };
      const favs = S.fav.map(id => PLACES.find(x => x.id === id)).filter(Boolean);
      const itCities = [...new Set(PLACES.filter(x => x.c !== 'airport').map(x => x.city))];
      const R = IT.result;
      el.innerHTML = `<h2>${t('nav_plan')}</h2>
        <div class="card"><h3>★ ${t('favorites')}</h3>${favs.length ? favs.map(x => `<div class="item ${S.visited[x.id] ? 'done' : ''}"><input type="checkbox" data-vis="${x.id}" ${S.visited[x.id] ? 'checked' : ''} title="${t('visited')}"><a class="tx" href="#/place/${x.id}" style="color:var(--tx)">${esc(L(x.n))} <span class="muted">· ${esc(cityName(x.city))}</span></a></div>`).join('') : `<p class="muted">${t('no_fav')}</p>`}</div>
        <div class="card"><h3>⚡ ${t('itin')}</h3><div class="row">
          <div><label>${t('city')}</label><select id="itc">${itCities.map(c => `<option value="${c}" ${IT.city === c ? 'selected' : ''}>${esc(cityName(c))}</option>`).join('')}</select></div>
          <div><label>${t('itin_hours')}</label><input id="ith" type="number" min="1" max="12" step="0.5" value="${IT.hours}" style="width:80px"></div></div>
          <label style="margin-top:8px">${t('itin_interests')}</label><div class="chips">${['holy', 'sira', 'heritage', 'nature'].map(c => `<button class="chip ${IT.cats.includes(c) ? 'on' : ''}" data-itcat="${c}">${t('c_' + c)}</button>`).join('')}</div>
          <button id="itgo">${t('generate')}</button>
          ${R ? (R.out.length ? `<div style="margin-top:12px">${R.out.map((o, i) => `<div class="item"><span class="daybadge">${i + 1}</span><div class="tx"><a href="#/place/${o.p.id}" style="color:var(--tx)"><b>${esc(L(o.p.n))}</b></a><div class="muted">${i ? '🚗 ~' + o.tr + ' ' + t('min') + ' · ' : ''}${o.p.mins} ${t('min')}</div></div></div>`).join('')}
            <p><b>${t('itin_total')} :</b> ${Math.floor(R.used / 60)}h${String(Math.round(R.used % 60)).padStart(2, '0')}</p><p class="muted">${t('itin_note')}</p><button id="itadd">${t('add_all')}</button></div>` : `<p class="muted">${t('itin_none')}</p>`) : ''}</div>
        <div class="card">${items.length ? items.map(i => `<div class="item ${i.done ? 'done' : ''}">
            <input type="checkbox" data-done="${i.id}" ${i.done ? 'checked' : ''}>
            <div class="tx"><span class="daybadge">${t('day_word')} ${i.day}</span> <span class="pill">${esc(i.city && CITIES[i.city] ? L(CITIES[i.city].n) : '')}</span> <span class="muted">${esc(dateOf(i.day))}</span>
            <div><b>${esc(i.title)}</b></div>${i.notes ? `<div class="muted">${esc(i.notes)}</div>` : ''}</div>
            <button class="danger" data-del="${i.id}" aria-label="${t('delete')}">✕</button></div>`).join('') : `<p class="muted">${t('empty_plan')}</p>`}
          <div class="row" style="margin-top:10px"><button class="ghost sm" id="ex">${t('load_example')}</button>${items.length ? `<button class="danger" id="clr">${t('clear')}</button>` : ''}</div></div>
        <div class="card"><h3>${t('add_day')}</h3><form class="form" id="f">
          <div class="row"><div><label>${t('day_word')}</label><input type="number" min="1" name="day" value="${(items.at(-1)?.day || 0) + 1}" style="width:80px" required></div>
          <div class="grow"><label>${t('city')}</label><select name="city" style="width:100%">${Object.entries(CITIES).map(([k, c]) => `<option value="${k}">${esc(L(c.n))}</option>`).join('')}</select></div></div>
          <div><label>${t('title')}</label><input name="title" style="width:100%" required></div>
          <div><label>${t('notes')}</label><textarea name="notes" rows="2" style="width:100%"></textarea></div>
          <button>${t('add')}</button></form></div>`;
      $$('[data-done]', el).forEach(c => c.onchange = () => { const i = S.plan.find(x => x.id === c.dataset.done); i.done = c.checked; save('plan'); draw(); });
      $$('[data-vis]', el).forEach(c => c.onchange = () => { if (c.checked) S.visited[c.dataset.vis] = new Date().toISOString().slice(0, 10); else delete S.visited[c.dataset.vis]; save('visited'); draw(); });
      $$('[data-itcat]', el).forEach(b => b.onclick = () => { const c = b.dataset.itcat; IT.cats = IT.cats.includes(c) ? IT.cats.filter(x => x !== c) : [...IT.cats, c]; IT.city = $('#itc', el).value; IT.hours = +$('#ith', el).value || 4; draw(); });
      $('#itgo', el).onclick = () => { IT.city = $('#itc', el).value; IT.hours = +$('#ith', el).value || 4; IT.result = buildItin(IT.city, IT.hours, IT.cats); draw(); };
      const ia = $('#itadd', el); if (ia) ia.onclick = () => { const day = Math.max(0, ...S.plan.map(i => i.day)) + 1; IT.result.out.forEach(o => S.plan.push({ id: 'i' + Date.now() + o.p.id, day, city: o.p.city, title: L(o.p.n), notes: `~${o.p.mins} ${t('min')}`, done: false })); save('plan'); toast(t('added')); draw(); };
      $$('[data-del]', el).forEach(b => b.onclick = () => { S.plan = S.plan.filter(x => x.id !== b.dataset.del); save('plan'); draw(); });
      $('#ex', el).onclick = () => { S.plan = EXAMPLE_PLAN.map((e, n) => ({ id: 'e' + n + Date.now(), day: e.day, city: e.city, title: t(e.k), notes: '', done: false })); save('plan'); draw(); };
      const clr = $('#clr', el); if (clr) clr.onclick = () => { if (confirm(t('confirm_clear'))) { S.plan = []; save('plan'); draw(); } };
      $('#f', el).onsubmit = e => { e.preventDefault(); const f = new FormData(e.target); S.plan.push({ id: 'p' + Date.now(), day: +f.get('day') || 1, city: f.get('city'), title: f.get('title').trim(), notes: f.get('notes').trim(), done: false }); save('plan'); draw(); };
    };
    draw();
  };

  /* ---------- Guide Omra ---------- */
  views.omra = el => {
    const MAP_STEPS = ['ihram', 'haram', 'tawaf', 'maqam', 'sai', 'halq'];
    el.innerHTML = `<h2>${t('omra_title')}</h2><p class="muted">⚠️ ${t('omra_disclaimer')}</p><div id="holyWrap"></div><div id="omraSteps"></div>`;
    const ctrl = window.Omra && window.Omra.holy ? window.Omra.holy.mount($('#holyWrap', el)) : null;
    const box = $('#omraSteps', el);
    const draw = () => {
      box.innerHTML = OMRA_STEPS.map(s => `
        <div class="card step"><h3><span>${s.ic}</span>${esc(L(s.t))}</h3><p>${esc(L(s.d))}</p>
        ${s.du.map(d => `<div class="dua"><div class="ar">${d.ar}</div><div class="tr">${esc(d.tr)}</div><div>${esc(L(d.m) || d.m.en)}</div></div>`).join('')}
        ${ctrl && MAP_STEPS.includes(s.id) ? `<button type="button" class="ghost sm" data-map="${s.id}" style="margin-top:10px">📍 ${t('holy_see_map')}</button>` : ''}
        ${s.counter ? `<div class="counter"><button data-c="${s.counter.key}" data-max="${s.counter.max}">${t('plus')}</button>
          <div class="n" id="n-${s.counter.key}">${S.cnt[s.counter.key]}/${s.counter.max}</div>
          <progress max="${s.counter.max}" value="${S.cnt[s.counter.key]}" class="grow"></progress>
          <button class="ghost sm" data-r="${s.counter.key}">${t('reset')}</button></div>` : ''}</div>`).join('');
      $$('[data-map]', box).forEach(b => b.onclick = () => ctrl.focusStep(b.dataset.map));
      $$('[data-c]', box).forEach(b => b.onclick = () => { const k = b.dataset.c; if (S.cnt[k] < +b.dataset.max) S.cnt[k]++; save('cnt'); if (S.cnt[k] === +b.dataset.max) toast(t('done')); if (navigator.vibrate) navigator.vibrate(30); const y = scrollY; draw(); scrollTo(0, y); });
      $$('[data-r]', box).forEach(b => b.onclick = () => { S.cnt[b.dataset.r] = 0; save('cnt'); const y = scrollY; draw(); scrollTo(0, y); });
    };
    draw();
  };

  /* ---------- Prière & Qibla ---------- */
  views.prayer = el => {
    const draw = () => {
      const p = place();
      const tzName = p.tz || Intl.DateTimeFormat().resolvedOptions().timeZone;
      const tz = Prayer.tzOffset(tzName, p.tzFallback);
      const c = new Date(Date.now() + tz * 3600000);
      const tm = Prayer.times(c.getUTCFullYear(), c.getUTCMonth() + 1, c.getUTCDate(), p.lat, p.lng, tz, S.method);
      const nx = Prayer.next(p.lat, p.lng, tzName, p.tzFallback, S.method);
      const q = Prayer.qibla(p.lat, p.lng), dist = Prayer.distanceKm(p.lat, p.lng);
      el.innerHTML = `<h2>${t('nav_prayer')}</h2>
        <div class="card"><div class="row"><div class="grow"><label>${t('city')}</label><select id="city" style="width:100%">
          ${Object.entries(CITIES).map(([k, v]) => `<option value="${k}" ${S.city === k ? 'selected' : ''}>${esc(L(v.n))}</option>`).join('')}
          ${S.geo ? `<option value="geo" ${S.city === 'geo' ? 'selected' : ''}>${t('my_position')}</option>` : ''}</select></div>
          <button class="ghost" id="geo" style="align-self:flex-end">${t('my_position')}</button></div>
          <div style="margin-top:10px"><label>${t('method')}</label><select id="meth" style="width:100%">${Object.entries(Prayer.METHODS).map(([k, v]) => `<option value="${k}" ${S.method === k ? 'selected' : ''}>${v.name}</option>`).join('')}</select></div></div>
        <div class="card"><h3>${t('today')} — ${esc(p.name)}</h3><div class="times">${Prayer.ORDER.map(k => `<div class="${k === nx.key ? 'nx' : ''}"><span>${t(k)}</span><b>${Prayer.fmt(tm[k])}</b></div>`).join('')}</div></div>
        <div class="card" style="text-align:center"><h3>${t('qibla_dir')}</h3>
          <div style="font-size:30px;font-weight:700">${Math.round(q)}° <span class="muted" style="font-size:14px">${t('from_north')}</span></div>
          <div class="compass"><div class="kaaba">🕋</div><div class="arrow" id="arrow" style="transform:rotate(${q}deg)"></div><span class="n">N</span></div>
          <p class="muted">${t('distance')} : ${nf(Math.round(dist))} ${t('km')}</p>
          <button id="cmp">🧭 ${t('enable_compass')}</button><p class="muted" id="cmpmsg">${t('compass_hint')}</p></div>`;
      $('#city', el).onchange = e => { S.city = e.target.value; save('city'); draw(); };
      $('#meth', el).onchange = e => { S.method = e.target.value; save('method'); draw(); };
      $('#geo', el).onclick = () => {
        if (!navigator.geolocation) return toast(t('geo_error'));
        toast(t('locating'));
        navigator.geolocation.getCurrentPosition(pos => {
          S.geo = { lat: pos.coords.latitude, lng: pos.coords.longitude, tz: Intl.DateTimeFormat().resolvedOptions().timeZone };
          S.city = 'geo'; save('geo'); save('city'); draw();
        }, () => toast(t('geo_error')), { enableHighAccuracy: false, timeout: 10000 });
      };
      $('#cmp', el).onclick = async () => {
        try {
          if (typeof DeviceOrientationEvent !== 'undefined' && DeviceOrientationEvent.requestPermission) {
            const r = await DeviceOrientationEvent.requestPermission(); if (r !== 'granted') throw 0;
          }
          let got = false;
          orient = e => {
            const h = e.webkitCompassHeading ?? (e.absolute || e.type === 'deviceorientationabsolute' ? 360 - e.alpha : null);
            if (h == null || isNaN(h)) return;
            got = true; $('#arrow', el).style.transform = `rotate(${q - h}deg)`;
          };
          window.addEventListener('deviceorientationabsolute', orient, true);
          window.addEventListener('deviceorientation', orient, true);
          setTimeout(() => { if (!got) $('#cmpmsg', el).textContent = t('compass_off'); }, 2500);
        } catch { $('#cmpmsg', el).textContent = t('compass_off'); }
      };
    };
    draw();
  };

  /* ---------- outils géo ---------- */
  const rad = d => d * Math.PI / 180;
  const km = (a, b) => { const dp = rad(b.lat - a.lat), dl = rad(b.lng - a.lng); const x = Math.sin(dp / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dl / 2) ** 2; return 12742 * Math.asin(Math.sqrt(x)); };
  const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const gmaps = p => `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}&travelmode=driving`;
  const appleMaps = p => `https://maps.apple.com/?daddr=${p.lat},${p.lng}&dirflg=d`;
  const catColor = { holy: '#0b6b4f', sira: '#2b6cb0', heritage: '#b7791f', nature: '#2f855a', miqat: '#c9a227', airport: '#7b5ea7' };
  const cityName = id => (CITIES[id] ? L(CITIES[id].n) : id);
  const pad2 = n => String(n).padStart(2, '0');
  const fmtDur = m => m >= 60 ? `${Math.floor(m / 60)} h ${pad2(m % 60)}` : `${m} min`;

  /* Catalogue de découvertes (boutiques, marchés, bons plans) : chargé une fois, réuni aux lieux dans Explorer. */
  let DISC = null;
  const loadDisc = () => DISC ? Promise.resolve(DISC) : fetch('data/junaid-madinah-discoveries.json', { cache: 'no-cache' }).then(r => (r.ok ? r.json() : Promise.reject())).then(d => (DISC = d)).catch(() => null);
  const httpsOnly = arr => (arr || []).filter(x => /^https:\/\//.test(x));

  /* ---------- Explorer : lieux + bons plans réunis, filtrés par ville / type / catégorie ; carte, GPS activable ---------- */
  views.explore = (el, arg) => {
    let city = 'all', tab = '', limit = 10, q = '', posOn = false, far = false, firstFix = true, lastR = null, ready = false;
    const queue = [], whenReady = f => (ready ? f() : queue.push(f));
    let markers = [], meMarker = null, destMarker = null;
    const prefs = store.get('mappref', {});
    let mlang = prefs.lang || (S.lang === 'ar' ? 'ar' : S.lang), mbase = prefs.base || 'plan';
    const savePrefs = () => store.set('mappref', { lang: mlang, base: mbase });
    const CITY_ORDER = Object.keys(CITIES).filter(c => PLACES.some(p => p.city === c));
    el.innerHTML = `<h2>${t('explore_title')}</h2>
      <div class="row" style="margin-bottom:8px;flex-wrap:nowrap"><input id="q" class="grow" type="search" placeholder="${esc(t('search'))}" style="min-width:0"><select id="citySel" aria-label="${esc(t('city'))}" style="max-width:58%;min-width:44%"></select></div>
      <div id="mapWrap"><div id="map"></div>
        <div class="mapbtns"><button type="button" class="chip mapbtn" id="posBtn"></button><button type="button" class="chip mapbtn" id="setBtn" aria-label="${esc(t('map_settings'))}" title="${esc(t('map_settings'))}">⚙️</button></div>
        <div class="mappanel" id="mapPanel" hidden><div class="row" style="justify-content:space-between;flex-wrap:nowrap;margin-bottom:8px"><b>⚙️ ${t('map_settings_short')}</b><button type="button" class="danger" id="setClose" aria-label="OK">✕</button></div>
          <label>🌐 ${t('map_lang_label')}</label><select id="mlang" style="width:100%;margin-bottom:8px">${[['fr', 'Français'], ['en', 'English'], ['ar', 'العربية'], ['local', t('ml_local')]].map(([k, v]) => `<option value="${k}" ${mlang === k ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select>
          <label>🗺️ ${t('map_style_label')}</label><select id="mbase" style="width:100%"><option value="plan" ${mbase === 'plan' ? 'selected' : ''}>${t('base_plan')}</option><option value="sat" ${mbase === 'sat' ? 'selected' : ''}>${t('base_sat')}</option></select></div></div>
      <p class="muted" id="posInfo" style="font-size:12px;margin:4px 0 0"></p>
      <div class="tabs" id="tabs" role="tablist"></div>
      <div id="routeBar"></div><div id="list"></div>`;
    const ML = window.maplibregl;
    let map = null;

    /* ---- langue des noms sur la carte ---- */
    const LANG_EXPR = {
      fr: ['coalesce', ['get', 'name:fr'], ['get', 'name:en'], ['get', 'name_en'], ['get', 'name:latin'], ['get', 'name']],
      en: ['coalesce', ['get', 'name:en'], ['get', 'name_en'], ['get', 'name:latin'], ['get', 'name']],
      ar: ['coalesce', ['get', 'name:ar'], ['get', 'name']],
      local: ['get', 'name'],
    };
    const applyLang = () => whenReady(() => {
      map.getStyle().layers.forEach(l => {
        if (l.type === 'symbol' && l.layout && l.layout['text-field'] && /name/.test(JSON.stringify(l.layout['text-field']))) map.setLayoutProperty(l.id, 'text-field', LANG_EXPR[mlang] || LANG_EXPR.fr);
      });
    });
    const OVERLAY = ['sat', 'acc', 'route-casing', 'route-line'];
    const applyBase = () => whenReady(() => {
      const sat = mbase === 'sat';
      if (map.getLayer('sat')) map.setLayoutProperty('sat', 'visibility', sat ? 'visible' : 'none');
      map.getStyle().layers.forEach(l => { if (['fill', 'line', 'fill-extrusion'].includes(l.type) && !OVERLAY.includes(l.id)) map.setLayoutProperty(l.id, 'visibility', sat ? 'none' : 'visible'); });
    });

    /* ---- position GPS (point bleu) ---- */
    const circlePoly = (lng, lat, r) => {
      const pts = []; for (let i = 0; i <= 64; i++) { const a = i / 64 * 2 * Math.PI; pts.push([lng + r * Math.cos(a) / (111320 * Math.cos(lat * Math.PI / 180)), lat + r * Math.sin(a) / 110540]); }
      return { type: 'Feature', geometry: { type: 'Polygon', coordinates: [pts] } };
    };
    const showMe = (lat, lng, acc) => {
      if (!map) return;
      if (!meMarker) { const e = document.createElement('div'); e.className = 'medot'; meMarker = new ML.Marker({ element: e }).setLngLat([lng, lat]).addTo(map); } else meMarker.setLngLat([lng, lat]);
      whenReady(() => { const src = map.getSource('acc'); if (src) src.setData(circlePoly(lng, lat, acc || 30)); });
    };
    const hideMe = () => { if (meMarker) { meMarker.remove(); meMarker = null; } whenReady(() => { const src = map && map.getSource('acc'); if (src) src.setData({ type: 'FeatureCollection', features: [] }); }); };
    const getPos = () => new Promise(res => {
      if (!navigator.geolocation) return res(null);
      navigator.geolocation.getCurrentPosition(pos => {
        S.here = { lat: pos.coords.latitude, lng: pos.coords.longitude }; save('here'); showMe(S.here.lat, S.here.lng, pos.coords.accuracy); res(S.here);
      }, () => res(null), { enableHighAccuracy: true, timeout: 12000, maximumAge: 15000 });
    });
    const fitTo = (pts, maxZoom = 14) => { if (!map || !pts.length) return; const bb = new ML.LngLatBounds(); pts.forEach(c => bb.extend(c)); map.fitBounds(bb, { padding: 40, maxZoom, duration: 600 }); };

    /* ---- données réunies : lieux (avec coordonnées) + bons plans (sans coordonnées) ---- */
    const buildItems = () => {
      const items = PLACES.map(p => ({ kind: 'place', id: p.id, p, city: p.city, cat: p.c, name: L(p.n), ar: p.n.ar, text: L(p.sum), disc: null }));
      const byId = new Map(items.map(i => [i.id, i]));
      ((DISC && DISC.records) || []).forEach(r => {
        const ex = byId.get(r.id);
        if (ex) ex.disc = r;                                                   // même lieu dans les deux catalogues : une seule fiche
        else items.push({ kind: 'find', id: 'd-' + r.id, r, city: r.city, cat: 'f:' + r.category, name: r.name_fr, text: r.description_fr || '', area: r.area || '' });
      });
      return items;
    };
    let items = buildItems();
    const catLabel = c => c.startsWith('f:') ? ((DISC && DISC.categories && DISC.categories[c.slice(2)]) || c.slice(2)) : t('c_' + c);
    const hay = i => norm([i.name, i.ar || '', i.text, i.area || '', cityName(i.city), i.kind === 'find' ? (i.r.practical_notes_fr || '') : '', catLabel(i.cat)].join(' '));
    const matchQ = i => !q || hay(i).includes(norm(q));
    const NEAR_KM = 300;                                                       // au-delà, les distances n'ont pas de sens (on n'est pas sur place)

    const gSearch = i => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([i.name, i.area, cityName(i.city)].filter(Boolean).join(' '))}`;
    const aSearch = i => `https://maps.apple.com/?q=${encodeURIComponent([i.name, i.area, cityName(i.city)].filter(Boolean).join(' '))}`;
    const vids = i => { const src = ((i.kind === 'find' ? i.r : i.disc) || {}).source || {}; return [...new Set(httpsOnly([...(src.videos || []), ...(src.references || [])]))].slice(0, 5); };

    const CAT_ICON = { holy: '🕋', sira: '📜', heritage: '🏛️', nature: '🌿', miqat: '🕌', airport: '✈️', 'f:history': '📜', 'f:museum': '🏛️', 'f:shopping': '🛍️', 'f:transport': '🚌', 'f:umrah': '🕋', 'f:services': '🛎️',
      'f:nature': '🌿', 'f:food': '🍽️', 'f:leisure': '🎡', 'f:perfume': '🧴', 'f:cafe_tea': '☕', 'f:dates': '🌴', 'f:calligraphy': '🖋️', 'f:regional_products': '🧺' };
    const itemById = id => items.find(i => i.id === id);

    /* carte compacte (2 colonnes) : icône, titre, ville · quartier — un toucher ouvre la fiche */
    const tile = i => {
      const sub = i.kind === 'place' ? cityName(i.city) : [cityName(i.city), i.area].filter(Boolean).join(' · ');
      const d = i.kind === 'place' && posOn && !far && S.here ? km(S.here, i.p) : null;
      return `<button type="button" class="pcard" data-open="${esc(i.id)}"><span class="ic">${CAT_ICON[i.cat] || '📍'}${i.kind === 'place' && S.fav.includes(i.id) ? ' ★' : ''}${i.kind === 'place' && S.visited[i.id] ? ' ✓' : ''}</span>
        <span class="tt">${esc(i.name)}</span><span class="sub">📍 ${esc(sub)}${d != null && d < NEAR_KM ? ` · ${nf(Math.round(d * 10) / 10)} ${t('km')}` : ''}</span></button>`;
    };

    /* fiche détaillée en feuille (bottom sheet) avec onglets : Infos / Pratique / Vidéos et sources */
    let sheet = null, sheetKey = null;
    const closeSheet = () => { if (sheet) { sheet.remove(); sheet = null; } document.body.style.overflow = ''; document.removeEventListener('keydown', onKey); };
    const onKey = e => { if (e.key === 'Escape') closeSheet(); };
    const row = (ic, label, val) => val ? `<div class="srow"><span>${ic}</span><div><b>${esc(label)}</b><div>${val}</div></div></div>` : '';
    const srcBtns = urls => urls.map((u, k) => `<a class="btn ghost sm" target="_blank" rel="noopener noreferrer" href="${esc(u)}">${/youtube\.com|youtu\.be/.test(u) ? '🎬 ' + t('disc_video') : '🔗 ' + t('sources')}${urls.length > 1 ? ' ' + (k + 1) : ''}</a>`).join(' ');
    const sheetTabs = i => {
      const out = [];
      if (i.kind === 'place') {
        const p = i.p, d = i.disc;
        out.push(['info', t('sh_info'), `<p>${esc(i.text)}</p>` + (p.facts || []).map(f => `<div class="dua" style="border-inline-start-color:${f.s === 'fact' ? 'var(--g)' : '#d69e2e'}"><span class="pill">${f.s === 'fact' ? '✔ ' + t('fact') : '❓ ' + t('trad')}</span><div>${esc(L(f.t))}</div></div>`).join('') +
          (d && d.description_fr ? `<p class="muted">🛍️ ${esc(d.description_fr)}</p>` : '')]);
        const tips = (p.tips || []).map(x => `<p>💡 ${esc(L(x))}</p>`).join('') + (d && d.practical_notes_fr ? `<p>💡 ${esc(d.practical_notes_fr)}</p>` : '');
        out.push(['prat', t('sh_practical'), row('💶', t('price'), p.free ? t('free') : t('paid')) + row('⏱️', t('duration'), p.mins ? p.mins + ' ' + t('min') : '') + row('🕒', t('hours'), esc(L(p.hours))) + row('🚪', t('access'), esc(L(p.access))) +
          row('📍', 'GPS', `${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}`) + (p.approx ? `<p class="muted">⚠️ ${t('approx_coord')}</p>` : '') + tips]);
        const v = vids(i);
        out.push(['src', t('sh_sources'), (v.length ? `<div class="row">${srcBtns(v)}</div>` : '') + `<p class="muted">${p.ver ? t('verified_on') + ' ' + esc(p.ver) : '⚠️ ' + t('not_verified')} · ${t('reliability')} : ${t('rel_' + p.rel)}</p>` + ((p.src && p.src.length) ? `<p class="muted">${t('sources')} : ${esc(p.src.join(' · '))}</p>` : '')]);
      } else {
        const r = i.r, v = vids(i), vf = r.verification || {};
        out.push(['info', t('sh_info'), `<p>${esc(i.text)}</p>` + row('📍', t('city'), esc(cityName(i.city)) + (i.area ? ' · ' + esc(i.area) : '')) + row('🏷️', t('sh_category'), esc(catLabel(i.cat)))]);
        const off = /^https:\/\//.test(r.official_url || '') ? `<a class="btn ghost sm" target="_blank" rel="noopener noreferrer" href="${esc(r.official_url)}">🌐 ${t('sh_official')}</a>` : '';
        const prat = (r.practical_notes_fr ? `<p>💡 ${esc(r.practical_notes_fr)}</p>` : '') + (r.cost ? row('💶', t('price'), esc(typeof r.cost === 'string' ? r.cost : JSON.stringify(r.cost))) : '') + (off ? `<div class="row">${off}</div>` : '');
        if (prat) out.push(['prat', t('sh_practical'), prat]);
        out.push(['src', t('sh_sources'), (r.source && r.source.creator ? `<p class="muted">${t('sources')} : ${esc(r.source.creator)}</p>` : '') + (v.length ? `<div class="row">${srcBtns(v)}</div>` : '') +
          `<p class="muted">${vf.independently_verified ? '✓ ' + t('disc_verified') : '⚠️ ' + t('disc_pending')}${vf.location_verified ? '' : ' · ' + t('sh_loc_unverified')}</p>`]);
      }
      return out;
    };
    const openSheet = (i, tabKey, noAnim) => {
      if (!i) return;
      closeSheet(); sheetKey = i.id;
      const tabsDef = sheetTabs(i), cur = tabsDef.find(x => x[0] === tabKey) ? tabKey : tabsDef[0][0];
      const isPlace = i.kind === 'place', p = i.p;
      const fav = isPlace && S.fav.includes(p.id), vis = isPlace && !!S.visited[p.id];
      sheet = document.createElement('div'); sheet.className = 'sheet' + (noAnim ? ' noanim' : ''); sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-modal', 'true');
      sheet.innerHTML = `<div class="sheet-in"><div class="sheet-hd"><div class="row" style="justify-content:space-between;flex-wrap:nowrap;align-items:flex-start"><div><h3 style="margin:0;font-size:20px">${CAT_ICON[i.cat] || '📍'} ${esc(i.name)}</h3>
          ${isPlace ? `<div dir="rtl" style="font:22px/1.5 'Amiri','Noto Naskh Arabic',serif;text-align:start">${esc(i.ar)}</div>` : ''}
          <div class="muted" style="margin-top:2px">📍 ${esc(cityName(i.city))}${i.area ? ' · ' + esc(i.area) : ''} · ${esc(catLabel(i.cat))}</div></div>
          <button type="button" class="danger" id="shClose" aria-label="${esc(t('cancel'))}">✕</button></div>
          <div class="tabs" role="tablist" style="margin-top:8px">${tabsDef.map(x => `<button type="button" class="tab ${x[0] === cur ? 'on' : ''}" role="tab" data-st="${x[0]}">${esc(x[1])}</button>`).join('')}</div></div>
        <div class="sheet-body">${tabsDef.find(x => x[0] === cur)[2]}</div>
        <div class="sheet-ft">${isPlace ? `<button type="button" id="shRoute">🧭 ${t('route_btn')}</button>` : ''}
          <a class="btn alt" href="${isPlace ? gmaps(p) : gSearch(i)}" target="_blank" rel="noopener">Google Maps</a><a class="btn alt" href="${isPlace ? appleMaps(p) : aSearch(i)}" target="_blank" rel="noopener">Plans</a>
          ${isPlace ? `<button type="button" class="ghost" id="shFav">${fav ? '★' : '☆'} ${t('fav')}</button><button type="button" class="ghost" id="shVis">${vis ? '✓ ' + t('visited') : t('mark_visited')}</button><a class="btn ghost" id="shFull" href="#/place/${p.id}">${t('sh_full')} →</a>` : ''}</div></div>`;
      el.appendChild(sheet); document.body.style.overflow = 'hidden'; document.addEventListener('keydown', onKey);
      sheet.addEventListener('click', e => { if (e.target === sheet) closeSheet(); });
      $('#shClose', sheet).onclick = closeSheet;
      $$('[data-st]', sheet).forEach(bt => bt.onclick = () => openSheet(i, bt.dataset.st, true));
      if (isPlace) {
        $('#shRoute', sheet).onclick = () => { closeSheet(); routeTo(p); };
        $('#shFav', sheet).onclick = () => { S.fav = fav ? S.fav.filter(x => x !== p.id) : [...S.fav, p.id]; save('fav'); openSheet(i, cur, true); render(false); };
        $('#shVis', sheet).onclick = () => { if (vis) delete S.visited[p.id]; else S.visited[p.id] = new Date().toISOString().slice(0, 10); save('visited'); openSheet(i, cur, true); render(false); };
        $('#shFull', sheet).onclick = () => closeSheet();
      }
    };

    const render = (fit = true) => {
      /* liste déroulante des villes (compteurs selon la recherche) */
      const byCity = {}; items.filter(matchQ).forEach(i => { byCity[i.city] = (byCity[i.city] || 0) + 1; });
      const totalCity = Object.values(byCity).reduce((x, y) => x + y, 0);
      $('#citySel', el).innerHTML = `<option value="all" ${city === 'all' ? 'selected' : ''}>🌍 ${esc(t('ex_all_cities'))} (${totalCity})</option>` +
        CITY_ORDER.filter(c => byCity[c] || c === city).map(c => `<option value="${c}" ${city === c ? 'selected' : ''}>${esc(cityName(c))} (${byCity[c] || 0})</option>`).join('');
      /* onglets sous la carte : « Lieux » puis une catégorie de bons plans par onglet */
      const base = items.filter(i => (city === 'all' || i.city === city) && matchQ(i));
      const byTab = {}; base.forEach(i => { const k = i.kind === 'place' ? 'places' : i.cat; (byTab[k] = byTab[k] || []).push(i); });
      const keys = Object.keys(byTab).sort((x, y) => (x === 'places' ? -1 : y === 'places' ? 1 : byTab[y].length - byTab[x].length));
      if ((tab !== 'all' && !byTab[tab]) || (tab === 'all' && keys.length <= 1)) tab = keys[0] || 'all';      // pas d'onglet « Tout » s'il n'y a qu'une catégorie
      const tabLabel = k => (k === 'places' ? '📍 ' + t('ex_tab_places') : k === 'all' ? t('ex_type_all') : catLabel(k));
      $('#tabs', el).innerHTML = keys.length ? [...keys, ...(keys.length > 1 ? ['all'] : [])].map(k => `<button type="button" class="tab ${tab === k ? 'on' : ''}" role="tab" aria-selected="${tab === k}" data-tab="${esc(k)}">${esc(tabLabel(k))} <span class="tn">${k === 'all' ? base.length : byTab[k].length}</span></button>`).join('') : '';
      /* contenu de l'onglet actif */
      const cur = tab === 'all' ? base : (byTab[tab] || []);
      const places = cur.filter(i => i.kind === 'place'), finds = cur.filter(i => i.kind === 'find');
      if (posOn && !far && S.here) places.sort((x, y) => km(S.here, x.p) - km(S.here, y.p)); else places.sort((x, y) => x.name.localeCompare(y.name));
      finds.sort((x, y) => x.cat.localeCompare(y.cat) || x.name.localeCompare(y.name));
      const seq = [...places, ...finds], shown = seq.slice(0, limit);
      let html = '', lastCat = null;
      shown.forEach(i => {
        const hd = tab === 'all' ? (i.kind === 'place' ? 'places' : i.cat) : null;
        if (hd && hd !== lastCat) { html += `<h4 class="subh">${esc(tabLabel(hd))} · ${byTab[hd].length}</h4>`; lastCat = hd; }
        html += tile(i);
      });
      if (seq.length > shown.length) html += `<button type="button" class="ghost" id="moreBtn" style="grid-column:1/-1">${t('ex_more')} (${seq.length - shown.length})</button>`;
      $('#list', el).innerHTML = seq.length ? `<div class="cards">${html}</div>` : `<p class="muted">${t('no_results')}</p>`;
      /* événements */
      $$('[data-tab]', el).forEach(bt => bt.onclick = () => { tab = bt.dataset.tab; limit = 10; render(false); const act = $('#tabs .tab.on', el); if (act && act.scrollIntoView) act.scrollIntoView({ inline: 'center', block: 'nearest' }); });
      const more = $('#moreBtn', el); if (more) more.onclick = () => { limit += 10; render(false); };
      $$('[data-open]', el).forEach(bt => bt.onclick = () => openSheet(itemById(bt.dataset.open)));
      /* carte : les lieux de la ville (les bons plans n'ont pas de coordonnées) */
      if (map) {
        const pl = base.filter(i => i.kind === 'place');
        markers.forEach(m => m.remove()); markers = [];
        pl.forEach(i => {
          const p = i.p, e = document.createElement('div'); e.className = 'mk'; e.style.background = catColor[p.c];
          const pop = new ML.Popup({ offset: 12, maxWidth: '260px' }).setHTML(`<b>${esc(i.name)}</b><br><span dir="rtl">${esc(i.ar)}</span><br><a href="#/place/${p.id}">${t('nav_explore')} →</a> · <a href="#/explore/to-${p.id}">🧭 ${t('route_btn')}</a><br><a href="${gmaps(p)}" target="_blank" rel="noopener">Google Maps ↗</a> · <a href="${appleMaps(p)}" target="_blank" rel="noopener">Plans ↗</a>`);
          markers.push(new ML.Marker({ element: e }).setLngLat([p.lng, p.lat]).setPopup(pop).addTo(map));
        });
        if (fit) {
          if (pl.length) fitTo(pl.map(i => [i.p.lng, i.p.lat]));
          else if (city !== 'all' && CITIES[city]) map.flyTo({ center: [CITIES[city].lng, CITIES[city].lat], zoom: 11 });
        }
      }
      posUi();
    };

    /* ---- bouton Position : activer / désactiver ---- */
    const posUi = () => {
      const b = $('#posBtn', el), info = $('#posInfo', el); if (!b) return;
      b.classList.toggle('on', posOn);
      b.textContent = `📍 ${posOn ? t('pos_on') : t('pos_off')}`;
      info.textContent = !posOn ? '' : far && S.here ? t('pos_far').replace('{km}', nf(Math.round(Math.min(...PLACES.map(p => km(S.here, p)))))) : S.here ? t('pos_active') : t('locating');
    };
    const stopFollow = () => {
      if (geoWatch != null && navigator.geolocation) { navigator.geolocation.clearWatch(geoWatch); geoWatch = null; }
      posOn = false; far = false; firstFix = true; lastR = null; S.here = null; save('here'); hideMe(); render(false);
    };
    const startFollow = () => {
      if (!navigator.geolocation) return toast(t('geo_error'));
      posOn = true; far = false; firstFix = true; posUi(); toast(t('locating'));
      geoWatch = navigator.geolocation.watchPosition(pos => {
        S.here = { lat: pos.coords.latitude, lng: pos.coords.longitude }; save('here');
        showMe(S.here.lat, S.here.lng, pos.coords.accuracy);
        if (firstFix) {
          firstFix = false; lastR = S.here;
          const nearest = Math.min(...PLACES.map(p => km(S.here, p)));
          far = nearest > NEAR_KM;                                            // pas en Arabie saoudite : on garde la carte sur les lieux
          if (far) toast(t('pos_far').replace('{km}', nf(Math.round(nearest)))); else if (map) map.flyTo({ center: [S.here.lng, S.here.lat], zoom: 14 });
          render(false);
        } else if (!lastR || km(lastR, S.here) > 0.05) { lastR = S.here; render(false); }
      }, () => { toast(t('geo_error')); stopFollow(); }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 });
    };

    /* ---- itinéraire depuis la position GPS (calcul routier OSM). Trop loin (> 800 km) : distance à vol d'oiseau + liens Google/Plans ---- */
    const setRoute = geom => whenReady(() => { const src = map.getSource('route'); if (src) src.setData(geom ? { type: 'Feature', geometry: geom } : { type: 'FeatureCollection', features: [] }); });
    const clearRoute = () => { setRoute(null); if (destMarker) { destMarker.remove(); destMarker = null; } };
    const routeTo = async p => {
      const bar = $('#routeBar', el);
      const links = `<a class="btn alt" href="${gmaps(p)}" target="_blank" rel="noopener">Google Maps ↗</a> <a class="btn alt" href="${appleMaps(p)}" target="_blank" rel="noopener">Plans ↗</a>`;
      toast(t('locating'));
      const me = await getPos();
      if (!me) { bar.innerHTML = `<div class="card"><b>🧭 ${esc(L(p.n))}</b><p class="muted">${t('geo_error')}</p><div class="row">${links}</div></div>`; return; }
      clearRoute();
      const crow = km(me, p);
      let rt = null, foot = null;
      if (crow <= 800) {
        const fetchRoute = async (base) => {
          const ctl = new AbortController(), tm = setTimeout(() => ctl.abort(), 9000);
          try {
            const r = await fetch(`${base}/route/v1/driving/${me.lng},${me.lat};${p.lng},${p.lat}?overview=full&geometries=geojson`, { signal: ctl.signal });
            const d = await r.json(); return (d.routes && d.routes[0]) || null;
          } catch (e) { return null; } finally { clearTimeout(tm); }
        };
        const firstOf = async bases => { for (const b of bases) { const r = await fetchRoute(b); if (r) return r; } return null; };
        [rt, foot] = await Promise.all([
          firstOf(['https://routing.openstreetmap.de/routed-car', 'https://router.project-osrm.org']),
          firstOf(['https://routing.openstreetmap.de/routed-foot'])]);
        if (!rt) rt = foot;
      }
      const head = `<b>🧭 ${esc(L(p.n))}</b> <button type="button" class="danger" id="routeClear" style="float:inline-end">✕</button>`;
      if (map) destMarker = new ML.Marker({ color: '#e53e3e' }).setLngLat([p.lng, p.lat]).addTo(map);
      if (rt) {
        setRoute(rt.geometry); fitTo(rt.geometry.coordinates);
        const kmv = rt.distance / 1000, drive = Math.max(1, Math.round(rt.duration / 60)), walk = foot ? Math.max(1, Math.round(foot.duration / 60)) : Math.round(kmv / 5 * 60);
        bar.innerHTML = `<div class="card">${head}<p style="margin:6px 0">🚗 <b>${nf(Math.round(kmv * 10) / 10)} ${t('km')}</b> · ${fmtDur(drive)} <span class="muted">(${t('route_drive')})</span><br>
          🚶 ${foot ? '' : '≈ '}${fmtDur(walk)} <span class="muted">(${foot ? t('route_walk_real') : t('route_walk')})</span></p><div class="row">${links}</div></div>`;
      } else {
        setRoute({ type: 'LineString', coordinates: [[me.lng, me.lat], [p.lng, p.lat]] }); fitTo([[me.lng, me.lat], [p.lng, p.lat]]);
        bar.innerHTML = `<div class="card">${head}<p style="margin:6px 0">${crow > 800 ? `${t('route_far')} <b>${nf(Math.round(crow))} ${t('km')}</b> ${t('route_crow')}` : t('route_err')}</p><div class="row">${links}</div></div>`;
      }
      const c = $('#routeClear', el); if (c) c.onclick = () => { bar.innerHTML = ''; clearRoute(); };
      bar.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    /* ---- carte vectorielle OpenFreeMap (MapLibre) ---- */
    if (ML && navigator.onLine !== false) {
      try {
        if (!window.__rtlSet) { window.__rtlSet = true; try { ML.setRTLTextPlugin('https://cdn.jsdelivr.net/npm/@mapbox/mapbox-gl-rtl-text@0.2.3/mapbox-gl-rtl-text.min.js', true); } catch (e) { /* indisponible */ } }
        map = new ML.Map({ container: 'map', style: 'https://tiles.openfreemap.org/styles/liberty', center: [42, 23.5], zoom: 4, attributionControl: { compact: true } });
        map.addControl(new ML.NavigationControl({ showCompass: false }), 'top-right');
        mapObj = map; window.Omra.map = map;                       // (exposé pour les tests)
        map.on('load', () => {
          const first = map.getStyle().layers.find(l => l.type === 'symbol');
          map.addSource('sat', { type: 'raster', tileSize: 256, maxzoom: 19, tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'], attribution: 'Imagerie &copy; Esri, Maxar, Earthstar Geographics' });
          map.addLayer({ id: 'sat', type: 'raster', source: 'sat', layout: { visibility: 'none' } }, first && first.id);
          map.addSource('acc', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
          map.addLayer({ id: 'acc', type: 'fill', source: 'acc', paint: { 'fill-color': '#2b6cb0', 'fill-opacity': 0.14 } });
          map.addSource('route', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
          map.addLayer({ id: 'route-casing', type: 'line', source: 'route', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#fff', 'line-width': 9 } });
          map.addLayer({ id: 'route-line', type: 'line', source: 'route', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#2b6cb0', 'line-width': 6 } });
          ready = true; applyLang(); applyBase(); queue.splice(0).forEach(f => f());
        });
      } catch (e) { map = null; mapObj = null; }
    }
    if (!map) $('#map', el).outerHTML = `<div class="card muted">${t('map_offline')}</div>`;
    $('#citySel', el).onchange = e => { city = e.target.value; tab = ''; limit = 10; render(); };
    $('#q', el).oninput = e => { q = e.target.value; limit = 10; tab = q.trim() ? 'all' : ''; render(); };
    $('#posBtn', el).onclick = () => (posOn ? stopFollow() : startFollow());
    const panel = $('#mapPanel', el); $('#setBtn', el).onclick = () => { panel.hidden = !panel.hidden; }; $('#setClose', el).onclick = () => { panel.hidden = true; };
    $('#mlang', el).onchange = e => { mlang = e.target.value; savePrefs(); applyLang(); };
    $('#mbase', el).onchange = e => { mbase = e.target.value; savePrefs(); applyBase(); };
    render();
    loadDisc().then(() => { if (!document.body.contains($('#list', el))) return; items = buildItems(); render(false); });      // les bons plans s'ajoutent dès leur chargement
    const target = arg && /^to-/.test(arg) ? PLACES.find(x => 'to-' + x.id === arg) : null;
    if (target) routeTo(target);
  };
  views.map = views.explore;

  /* ---------- Fiche d'un lieu ---------- */
  const ytId = u => { try { const x = new URL(u); let id = null;
    if (x.hostname === 'youtu.be') id = x.pathname.slice(1);
    else if (/(^|\.)youtube\.com$/.test(x.hostname)) id = x.searchParams.get('v') || (x.pathname.match(/\/(?:shorts|embed|live)\/([\w-]{11})/) || [])[1];
    return /^[\w-]{11}$/.test(id || '') ? id : null; } catch { return null; } };
  const parseT = s => { s = String(s || '').trim(); if (!s) return 0; if (/^\d+$/.test(s)) return +s; const p = s.split(':').map(Number); if (p.some(isNaN)) return 0; return p.reduce((a, b) => a * 60 + b, 0); };
  const fmtT = n => { const h = Math.floor(n / 3600), m = Math.floor(n % 3600 / 60), s = n % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(s).padStart(2, '0'); };

  views.place = (el, id) => {
    const p = PLACES.find(x => x.id === id);
    if (!p) { el.innerHTML = `<p>${t('not_found')}</p><a class="btn" href="#/explore">${t('back')}</a>`; return; }
    const draw = () => {
      const fav = S.fav.includes(p.id), vis = !!S.visited[p.id];
      const vids = S.vids[p.id] || [];
      el.innerHTML = `<a href="#/explore" class="muted">${t('back')}</a>
        <div class="card"><h2 style="margin-bottom:2px">${esc(L(p.n))}</h2>
          <div dir="rtl" style="font:28px/1.6 'Amiri','Noto Naskh Arabic',serif;text-align:start">${esc(p.n.ar)}</div>
          <div class="muted" style="font-size:12px">${t('taxi_name')}</div>
          <div style="margin-top:8px"><span class="pill">${t('c_' + p.c)}</span> <span class="pill">${esc(cityName(p.city))}</span>
            <span class="pill">${t('reliability')} : ${t('rel_' + p.rel)}</span>
            <span class="pill">${p.ver ? t('verified_on') + ' ' + esc(p.ver) : '⚠️ ' + t('not_verified')}</span></div>
          <p>${esc(L(p.sum))}</p>
          <div class="row"><button id="fav" class="${fav ? '' : 'ghost'}">${fav ? '★' : '☆'} ${t('fav')}</button>
            <button id="vis" class="${vis ? '' : 'ghost'}">${vis ? '✓ ' + t('visited') : t('mark_visited')}</button></div>
          <div class="row" style="margin-top:8px"><a class="btn" href="#/explore/to-${p.id}">🧭 ${t('route_btn')}</a>
            <a class="btn alt" href="${gmaps(p)}" target="_blank" rel="noopener">Google Maps ↗</a><a class="btn alt" href="${appleMaps(p)}" target="_blank" rel="noopener">Plans ↗</a></div>
          <div class="row" style="margin-top:8px"><button class="ghost" id="gps">📋 ${t('copy_gps')}</button><button class="ghost" id="addplan">🗓️ ${t('add_to_plan')}</button></div>
          ${p.approx ? `<p class="muted">⚠️ ${t('approx_coord')}</p>` : ''}</div>
        ${p.facts.length ? `<div class="card"><h3>${t('facts_title')}</h3>${p.facts.map(f => `<div class="dua" style="border-inline-start-color:${f.s === 'fact' ? 'var(--g)' : '#d69e2e'}"><span class="pill">${f.s === 'fact' ? '✔ ' + t('fact') : '❓ ' + t('trad')}</span><div>${esc(L(f.t))}</div></div>`).join('')}</div>` : ''}
        <div class="card"><h3>${t('practical')}</h3><div class="times">
          <div><span>${t('price')}</span><b>${p.free ? t('free') : t('paid')}</b></div>
          ${p.mins ? `<div><span>${t('duration')}</span><b>${p.mins} ${t('min')}</b></div>` : ''}
          <div><span>${t('hours')}</span><b style="text-align:end">${esc(L(p.hours))}</b></div></div>
          <p><b>${t('access')} :</b> ${esc(L(p.access))}</p>
          <p class="muted">GPS : ${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}</p>
          ${p.tips.length ? `<h3>${t('tips')}</h3>${p.tips.map(x => `<p>💡 ${esc(L(x))}</p>`).join('')}` : ''}</div>
        <div class="card"><h3>🎬 ${t('videos')}</h3>
          ${vids.length ? vids.map((v, i) => `<div class="item"><div class="tx"><b>${esc(v.title)}</b><div class="muted">${esc(v.creator)}${v.t ? ' · ' + fmtT(v.t) : ''}</div></div>
            <a href="https://www.youtube.com/watch?v=${v.id}${v.t ? '&t=' + v.t + 's' : ''}" target="_blank" rel="noopener">▶ ${t('watch')}</a><button class="danger" data-vdel="${i}">✕</button></div>`).join('') : `<p class="muted">${t('no_video')}</p>`}
          <details style="margin-top:10px"><summary>${t('add_video')}</summary><p class="muted">${t('video_hint')}</p>
            <form class="form" id="vf"><input name="u" placeholder="${esc(t('video_url'))}" required><input name="ti" placeholder="${esc(t('video_title'))}" required>
              <input name="cr" placeholder="${esc(t('video_creator'))}" required><input name="tm" placeholder="${esc(t('video_time'))}"><button>${t('add')}</button></form></details></div>
        <div class="card"><h3>📝 ${t('my_note')}</h3><textarea id="note" rows="4" style="width:100%">${esc(S.notes[p.id] || '')}</textarea></div>
        <div class="card muted"><b>${t('sources')} :</b> ${p.src.length ? esc(p.src.join(' · ')) : '—'}</div>`;
      $('#fav', el).onclick = () => { S.fav = fav ? S.fav.filter(x => x !== p.id) : [...S.fav, p.id]; save('fav'); draw(); };
      $('#vis', el).onclick = () => { if (vis) delete S.visited[p.id]; else S.visited[p.id] = new Date().toISOString().slice(0, 10); save('visited'); draw(); };
      $('#gps', el).onclick = async () => { try { await navigator.clipboard.writeText(`${p.lat},${p.lng}`); toast(t('copied')); } catch { prompt('GPS', `${p.lat},${p.lng}`); } };
      $('#addplan', el).onclick = () => { S.plan = S.plan || []; S.plan.push({ id: 'p' + Date.now(), day: Math.max(1, ...S.plan.map(i => i.day)), city: p.city, title: L(p.n), notes: p.mins ? `~${p.mins} ${t('min')}` : '', done: false }); save('plan'); toast(t('added')); };
      $('#note', el).oninput = e => { S.notes[p.id] = e.target.value; save('notes'); };
      $$('[data-vdel]', el).forEach(b => b.onclick = () => { S.vids[p.id] = vids.filter((_, i) => i !== +b.dataset.vdel); save('vids'); draw(); });
      $('#vf', el).onsubmit = e => { e.preventDefault(); const f = new FormData(e.target); const vid = ytId(f.get('u'));
        if (!vid) return toast('YouTube ?');
        S.vids[p.id] = [...vids, { id: vid, title: f.get('ti').trim(), creator: f.get('cr').trim(), t: parseT(f.get('tm')) }]; save('vids'); draw(); };
    };
    draw();
  };

  /* ---------- Outils ---------- */
  views.tools = el => {
    const draw = () => {
      const all = CHECKLIST.map(([g, ks]) => [t(g), ks.map(k => ({ id: k, label: t(k) }))]);
      const cust = S.custom.map(c => ({ id: c.id, label: c.label, custom: true }));
      const total = all.reduce((n, [, a]) => n + a.length, 0) + cust.length;
      const done = all.flatMap(([, a]) => a).concat(cust).filter(i => S.checks[i.id]).length;
      const toSar = e => e.cur === 'SAR' ? e.amount : e.amount / S.rate;
      const spent = S.exp.reduce((n, e) => n + toSar(e), 0);
      const fmtCur = sar => S.cur === 'SAR' ? `${nf(sar)} SAR` : `${nf(sar * S.rate)} ${S.cur}`;
      el.innerHTML = `<h2>${t('tools_title')}</h2>
        <div class="card"><h3>✅ ${t('checklist')} <span class="pill">${done}/${total}</span></h3><progress max="${total}" value="${done}"></progress>
          ${all.map(([g, a]) => `<h3 style="margin-top:14px;font-size:14px;color:var(--mut)">${esc(g)}</h3>${a.map(i => `<div class="item ${S.checks[i.id] ? 'done' : ''}"><input type="checkbox" data-ck="${i.id}" ${S.checks[i.id] ? 'checked' : ''}><span class="tx">${esc(i.label)}</span></div>`).join('')}`).join('')}
          ${cust.length ? `<h3 style="margin-top:14px;font-size:14px;color:var(--mut)">★</h3>` + cust.map(i => `<div class="item ${S.checks[i.id] ? 'done' : ''}"><input type="checkbox" data-ck="${i.id}" ${S.checks[i.id] ? 'checked' : ''}><span class="tx">${esc(i.label)}</span><button class="danger" data-cdel="${i.id}">✕</button></div>`).join('') : ''}
          <form class="row" id="cf" style="margin-top:10px"><input class="grow" name="l" placeholder="${t('add_item')}" required><button>${t('add')}</button></form></div>
        <div class="card"><h3>💰 ${t('budget')}</h3>
          <div class="row"><div><label>${t('planned')} (SAR)</label><input type="number" id="bud" value="${S.budget || ''}" style="width:130px"></div>
            <div><label>${t('rate')}</label><div class="row"><input type="number" step="0.01" id="rate" value="${S.rate}" style="width:90px"><select id="cur">${['EUR', 'USD', 'GBP', 'CAD', 'CHF', 'SAR'].map(c => `<option ${S.cur === c ? 'selected' : ''}>${c}</option>`).join('')}</select></div></div></div>
          <div style="margin:12px 0"><b>${t('spent')} :</b> ${nf(spent)} SAR ≈ ${fmtCur(spent)}${S.budget ? ` <span class="muted">/ ${nf(S.budget)} SAR</span>` : ''}</div>
          ${S.budget ? `<progress max="${S.budget}" value="${Math.min(spent, S.budget)}"></progress>` : ''}
          ${S.exp.length ? S.exp.map(e => `<div class="item"><span class="tx">${esc(e.label)}</span><b>${nf(e.amount)} ${e.cur}</b><button class="danger" data-edel="${e.id}">✕</button></div>`).join('') : `<p class="muted">${t('no_exp')}</p>`}
          <form class="row" id="ef" style="margin-top:10px"><input class="grow" name="l" placeholder="${t('label')}" required><input name="a" type="number" step="0.01" placeholder="${t('amount')}" style="width:100px" required><select name="c"><option>SAR</option><option ${S.cur !== 'SAR' ? 'selected' : ''}>${S.cur !== 'SAR' ? S.cur : 'EUR'}</option></select><button>${t('add')}</button></form></div>
        <div id="syncBox"></div>
        <div class="card"><h3>💾 ${t('backup')}</h3><div class="row"><button class="ghost" id="exp">${t('export')}</button><button class="ghost" id="imp">${t('import')}</button><input type="file" id="file" accept="application/json" hidden></div>
          <p class="muted" style="margin-top:10px">v${APP_VERSION}</p>
          <p class="muted" style="font-size:12px">Crédits : photo de l'écran d'ouverture © Adli Wahid, <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener">CC BY-SA 4.0</a> (<a href="https://commons.wikimedia.org/wiki/File:The_Kaaba_during_Hajj.jpg" target="_blank" rel="noopener">Wikimedia Commons</a>), recadrée et retouchée. Police Aref Ruqaa (SIL OFL). Cartes © OpenStreetMap.</p></div>`;
      if (window.Omra && window.Omra.syncCard) window.Omra.syncCard($('#syncBox', el));
      $$('[data-ck]', el).forEach(c => c.onchange = () => { S.checks[c.dataset.ck] = c.checked; save('checks'); const y = scrollY; draw(); scrollTo(0, y); });
      $$('[data-cdel]', el).forEach(b => b.onclick = () => { S.custom = S.custom.filter(x => x.id !== b.dataset.cdel); save('custom'); draw(); });
      $('#cf', el).onsubmit = e => { e.preventDefault(); S.custom.push({ id: 'c' + Date.now(), label: new FormData(e.target).get('l').trim() }); save('custom'); draw(); };
      $('#bud', el).onchange = e => { S.budget = +e.target.value || 0; save('budget'); draw(); };
      $('#rate', el).onchange = e => { S.rate = +e.target.value || S.rate; save('rate'); draw(); };
      $('#cur', el).onchange = e => { S.cur = e.target.value; save('cur'); draw(); };
      $('#ef', el).onsubmit = e => { e.preventDefault(); const f = new FormData(e.target); S.exp.push({ id: 'x' + Date.now(), label: f.get('l').trim(), amount: +f.get('a'), cur: f.get('c') }); save('exp'); draw(); };
      $$('[data-edel]', el).forEach(b => b.onclick = () => { S.exp = S.exp.filter(x => x.id !== b.dataset.edel); save('exp'); draw(); });
      $('#exp', el).onclick = () => {
        const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'omra-backup.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      };
      $('#imp', el).onclick = () => $('#file', el).click();
      $('#file', el).onchange = async e => {
        try { const d = JSON.parse(await e.target.files[0].text()); if (typeof d !== 'object' || !d) throw 0;
          for (const k of ['lang', 'city', 'geo', 'method', 'trip', 'plan', 'checks', 'custom', 'cnt', 'exp', 'budget', 'rate', 'cur', 'fav', 'visited', 'notes', 'vids', 'here', 'journey', 'stays']) if (k in d) { S[k] = d[k]; save(k); }
          applyLang(); toast(t('imported')); draw(); } catch { toast(t('import_err')); }
      };
    };
    draw();
  };

  /* ---------- Catalogue de découvertes : vidéos, marchés, artisans, conseils ---------- */
  views.discoveries = el => {
    const i18n = {
      fr: { title: 'Découvertes et bonnes adresses', search: 'Rechercher un lieu, un produit ou une astuce…', all: 'Toutes les catégories', cities: 'Toutes les villes', count: 'résultats', source: 'Source', warn: 'Catalogue documentaire : lieux, prix, accès et informations historiques à vérifier indépendamment avant une visite.', empty: 'Aucun résultat', fail: 'Catalogue indisponible hors connexion lors du premier chargement.', verified: 'Vérifié', pending: 'À vérifier', view: 'Voir la vidéo / source' },
      en: { title: 'Discoveries and local finds', search: 'Search places, products and tips…', all: 'All categories', cities: 'All cities', count: 'results', source: 'Source', warn: 'Research catalogue: locations, prices, access and historic claims require independent verification before travel.', empty: 'No results', fail: 'Catalogue unavailable on the first offline load.', verified: 'Verified', pending: 'To verify', view: 'Watch video / source' },
      ar: { title: 'اكتشافات وأماكن مميزة', search: 'البحث عن الأماكن والمنتجات والنصائح…', all: 'كل الفئات', cities: 'كل المدن', count: 'نتائج', source: 'المصدر', warn: 'بيانات بحثية: يجب التحقق من المواقع والأسعار والمعلومات التاريخية قبل الزيارة.', empty: 'لا توجد نتائج', fail: 'لا تتوفر البيانات دون اتصال في التحميل الأول.', verified: 'تم التحقق', pending: 'يحتاج إلى تحقق', view: 'عرض المصدر' }
    };
    const ui = i18n[S.lang] || i18n.fr;
    el.innerHTML = '<h2>' + esc(ui.title) + '</h2><div class="card muted">⚠️ ' + esc(ui.warn) + '</div><div class="card" id="discoveryBody"><p class="muted">…</p></div>';
    fetch('data/junaid-madinah-discoveries.json', { cache: 'no-cache' }).then(r => { if (!r.ok) throw Error(r.status); return r.json(); }).then(data => {
      if (!document.getElementById('discoveryBody') || !Array.isArray(data.records)) return;
      const root = document.getElementById('discoveryBody');
      const ct = data.categories || {};
      const cities = [...new Set(data.records.map(r => r.city))].sort();
      root.innerHTML = '<div class="row"><input type="search" class="grow" id="discQuery" placeholder="' + esc(ui.search) + '" aria-label="' + esc(ui.search) + '"><select id="discCity" aria-label="' + esc(ui.cities) + '"><option value="">' + esc(ui.cities) + '</option>' + cities.map(c => '<option value="' + esc(c) + '">' + esc(cityName(c)) + '</option>').join('') + '</select></div>' +
        '<div class="row" style="margin:10px 0"><select id="discCat" style="width:100%" aria-label="' + esc(ui.all) + '"><option value="">' + esc(ui.all) + '</option>' + Object.entries(ct).map(([k,v]) => '<option value="' + esc(k) + '">' + esc(v) + '</option>').join('') + '</select></div>' +
        '<p class="muted" id="discCount" aria-live="polite"></p><div id="discResults"></div>';
      const render = () => {
        const q = norm($('#discQuery', root).value);
        const c = $('#discCity', root).value, cat = $('#discCat', root).value;
        const filtered = data.records.filter(p => (!c || p.city === c) && (!cat || p.category === cat) &&
          (!q || norm([p.name_fr, p.area, p.description_fr, p.practical_notes_fr, ct[p.category]].join(' ')).includes(q)));
        $('#discCount', root).textContent = filtered.length + ' ' + ui.count;
        $('#discResults', root).innerHTML = filtered.length ? filtered.map(p => {
          const links = [...new Set([...(p.source?.videos || []), ...(p.source?.references || [])])].filter(x => /^https:\/\//.test(x)).slice(0,5);
          const status = p.verification?.independently_verified ? ui.verified : ui.pending;
          return '<article style="padding:14px 0;border-top:1px solid var(--bd)">' +
            '<div class="row" style="justify-content:space-between"><strong>' + esc(p.name_fr) + '</strong><span class="muted">' + esc(status) + '</span></div>' +
            '<p class="muted">' + esc(cityName(p.city)) + (p.area ? ' · ' + esc(p.area) : '') + ' · ' + esc(ct[p.category] || p.category) + '</p>' +
            '<p>' + esc(p.description_fr || '') + '</p>' +
            (p.practical_notes_fr ? '<p class="muted">💡 ' + esc(p.practical_notes_fr) + '</p>' : '') +
            (links.length ? '<div class="row">' + links.map((url,i) => '<a class="btn ghost sm" target="_blank" rel="noopener noreferrer" href="' + esc(url) + '">' + esc(ui.view) + (links.length > 1 ? ' ' + (i+1) : '') + '</a>').join('') + '</div>' : '') +
            '</article>';
        }).join('') : '<p class="muted">' + esc(ui.empty) + '</p>';
      };
      $('#discQuery', root).addEventListener('input', render);
      $('#discCity', root).addEventListener('change', render);
      $('#discCat', root).addEventListener('change', render);
      render();
    }).catch(() => { const b = document.getElementById('discoveryBody'); if (b) b.innerHTML = '<p class="muted">' + esc(ui.fail) + '</p>'; });
  };

  /* ---------- démarrage ---------- */
  window.Omra = { $, $$, esc, S, save, t, views, store, toast, hooks, SYNC_KEYS, refresh: () => { applyLang(); route(); }, syncCard: null, registerMap: m => { mapObj = m; } };
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
  applyLang(); document.addEventListener('DOMContentLoaded', route);
  /* Mises à jour automatiques : vérification à l'ouverture et au retour au premier plan,
     rechargement dès qu'une nouvelle version du service worker prend le relais. */
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    const hadController = !!navigator.serviceWorker.controller;
    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController || reloaded) return;      // première installation : rien à recharger
      reloaded = true; location.reload();
    });
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(reg => {
      const check = () => reg.update().catch(() => {});
      check();
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') check(); });
    }).catch(() => {});
  }
})();
