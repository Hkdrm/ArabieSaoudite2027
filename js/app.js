(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem('omra:' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem('omra:' + k, JSON.stringify(v)); } catch {} },
  };

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
  };
  const save = (k) => store.set(k, S[k]);
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
    const nav = [['home', '🏠'], ['plan', '🗓️'], ['omra', '🕋'], ['prayer', '🕌'], ['map', '🗺️'], ['tools', '🧰']];
    $('#nav').innerHTML = nav.map(([r, i]) => `<a href="#/${r}" data-r="${r}"><b>${i}</b>${esc(t('nav_' + r))}</a>`).join('');
  }
  $('#langSel').addEventListener('change', e => { S.lang = e.target.value; save('lang'); applyLang(); route(); });

  /* ---------- routeur ---------- */
  const views = {};
  let timer = null, mapObj = null, orient = null;
  function route() {
    clearInterval(timer); timer = null;
    if (orient) { window.removeEventListener('deviceorientationabsolute', orient, true); window.removeEventListener('deviceorientation', orient, true); orient = null; }
    if (mapObj) { mapObj.remove(); mapObj = null; }
    const r = (location.hash.replace('#/', '') || 'home');
    const name = views[r] ? r : 'home';
    $$('#nav a').forEach(a => a.classList.toggle('on', a.dataset.r === name));
    $('#view').innerHTML = '';
    views[name]($('#view'));
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
      if (S.trip.start) {
        const s = new Date(S.trip.start + 'T00:00'), e = S.trip.end ? new Date(S.trip.end + 'T00:00') : s;
        const d = Math.round((s - now) / 864e5);
        if (d > 0) hero = `<small>${t('countdown')}</small><div class="big">${d}</div><small>${t('days')}</small>`;
        else if (now <= e) hero = `<div class="big">${t('day_word')} ${Math.round((now - s) / 864e5) + 1}</div><small>${t('trip_ongoing')}</small>`;
        else hero = `<div class="big">✓</div><small>${t('trip_over')}</small>`;
      } else hero = `<small>${t('set_dates')}</small>`;
      let hijri = '';
      try { hijri = new Intl.DateTimeFormat((S.lang === 'ar' ? 'ar-SA' : S.lang) + '-u-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date()); } catch {}
      el.innerHTML = `
        <div class="card hero">${hero}</div>
        <div class="card"><div class="row"><div class="grow"><h3>${t('next_prayer')} · ${esc(p.name)}</h3>
          <div style="font-size:28px;font-weight:700">${t(nx.key)} <span class="muted">${t('in')} ${h ? h + 'h ' : ''}${String(mm).padStart(2, '0')}min</span></div>
          <div class="muted">${esc(hijri)}</div></div><a class="btn" href="#/prayer">🕌</a></div></div>
        <div class="card"><h3>${t('trip_start')} / ${t('trip_end')}</h3>
          <div class="row"><input type="date" id="d1" value="${esc(S.trip.start)}"><input type="date" id="d2" value="${esc(S.trip.end)}"><button id="saveTrip">${t('save')}</button></div></div>
        <h3>${t('quick')}</h3>
        <div class="grid2">
          <a class="tile" href="#/omra"><span>🕋</span>${t('quick_omra')}</a>
          <a class="tile" href="#/plan"><span>🗓️</span>${t('quick_plan')}</a>
          <a class="tile" href="#/map"><span>🗺️</span>${t('quick_map')}</a>
          <a class="tile" href="#/tools"><span>✅</span>${t('quick_list')}</a>
        </div>
        <p class="muted" id="inst"></p>`;
      $('#saveTrip', el).onclick = () => { S.trip = { start: $('#d1', el).value, end: $('#d2', el).value }; save('trip'); draw(); };
    };
    draw(); timer = setInterval(() => { if (!document.activeElement || document.activeElement.tagName !== 'INPUT') draw(); }, 30000);
    if (deferredInstall) { $('#inst', el).innerHTML = `<button id="instBtn">⬇️ ${t('install')}</button>`; $('#instBtn', el).onclick = () => deferredInstall.prompt(); }
  };
  let deferredInstall = null;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstall = e; if ((location.hash || '#/home') === '#/home') route(); });

  /* ---------- Planning ---------- */
  views.plan = el => {
    if (S.plan === null) { S.plan = []; save('plan'); }
    const draw = () => {
      const start = S.trip.start ? new Date(S.trip.start + 'T00:00') : null;
      const items = [...S.plan].sort((a, b) => a.day - b.day);
      const dateOf = d => { if (!start) return ''; const x = new Date(start); x.setDate(x.getDate() + d - 1); return x.toLocaleDateString(S.lang === 'ar' ? 'ar-SA-u-nu-latn' : S.lang, { weekday: 'short', day: 'numeric', month: 'short' }); };
      el.innerHTML = `<h2>${t('plan_title')}</h2>
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
      $$('[data-del]', el).forEach(b => b.onclick = () => { S.plan = S.plan.filter(x => x.id !== b.dataset.del); save('plan'); draw(); });
      $('#ex', el).onclick = () => { S.plan = EXAMPLE_PLAN.map((e, n) => ({ id: 'e' + n + Date.now(), day: e.day, city: e.city, title: t(e.k), notes: '', done: false })); save('plan'); draw(); };
      const clr = $('#clr', el); if (clr) clr.onclick = () => { if (confirm(t('confirm_clear'))) { S.plan = []; save('plan'); draw(); } };
      $('#f', el).onsubmit = e => { e.preventDefault(); const f = new FormData(e.target); S.plan.push({ id: 'p' + Date.now(), day: +f.get('day') || 1, city: f.get('city'), title: f.get('title').trim(), notes: f.get('notes').trim(), done: false }); save('plan'); draw(); };
    };
    draw();
  };

  /* ---------- Guide Omra ---------- */
  views.omra = el => {
    const draw = () => {
      el.innerHTML = `<h2>${t('omra_title')}</h2><p class="muted">⚠️ ${t('omra_disclaimer')}</p>` + OMRA_STEPS.map(s => `
        <div class="card step"><h3><span>${s.ic}</span>${esc(L(s.t))}</h3><p>${esc(L(s.d))}</p>
        ${s.du.map(d => `<div class="dua"><div class="ar">${d.ar}</div><div class="tr">${esc(d.tr)}</div><div>${esc(L(d.m) || d.m.en)}</div></div>`).join('')}
        ${s.counter ? `<div class="counter"><button data-c="${s.counter.key}" data-max="${s.counter.max}">${t('plus')}</button>
          <div class="n" id="n-${s.counter.key}">${S.cnt[s.counter.key]}/${s.counter.max}</div>
          <progress max="${s.counter.max}" value="${S.cnt[s.counter.key]}" class="grow"></progress>
          <button class="ghost sm" data-r="${s.counter.key}">${t('reset')}</button></div>` : ''}</div>`).join('');
      $$('[data-c]', el).forEach(b => b.onclick = () => { const k = b.dataset.c; if (S.cnt[k] < +b.dataset.max) S.cnt[k]++; save('cnt'); if (S.cnt[k] === +b.dataset.max) toast(t('done')); if (navigator.vibrate) navigator.vibrate(30); const y = scrollY; draw(); scrollTo(0, y); });
      $$('[data-r]', el).forEach(b => b.onclick = () => { S.cnt[b.dataset.r] = 0; save('cnt'); const y = scrollY; draw(); scrollTo(0, y); });
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

  /* ---------- Carte ---------- */
  views.map = el => {
    let cat = 'all';
    const cats = ['all', 'holy', 'miqat', 'visit', 'airport'];
    const colors = { holy: '#0b6b4f', miqat: '#c9a227', visit: '#2b6cb0', airport: '#7b5ea7' };
    el.innerHTML = `<h2>${t('map_title')}</h2><div class="chips" id="chips"></div><div id="map"></div><p class="muted">${t('approx')}</p><div class="card" id="list"></div>`;
    let layer = null;
    const gm = p => `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`;
    const render = () => {
      $('#chips', el).innerHTML = cats.map(c => `<button class="chip ${c === cat ? 'on' : ''}" data-cat="${c}">${t(c === 'all' ? 'all' : 'c_' + c)}</button>`).join('');
      const ps = PLACES.filter(p => cat === 'all' || p.c === cat);
      $('#list', el).innerHTML = ps.map(p => `<div class="item"><div class="tx"><div><button data-fly="${p.id}" style="padding:0;background:none;text-align:start;font-size:15px;color:var(--tx)">${esc(L(p.n))}</button></div><div class="pill">${t('c_' + p.c)}</div></div><a href="${gm(p)}" target="_blank" rel="noopener">${t('open_maps')} ↗</a></div>`).join('');
      $$('[data-cat]', el).forEach(b => b.onclick = () => { cat = b.dataset.cat; render(); });
      $$('[data-fly]', el).forEach(b => b.onclick = () => { const p = PLACES.find(x => x.id === b.dataset.fly); if (mapObj) { mapObj.flyTo([p.lat, p.lng], 14); $('#map', el).scrollIntoView({ behavior: 'smooth' }); } });
      if (mapObj && layer) {
        layer.clearLayers();
        const pts = ps.map(p => L_.circleMarker([p.lat, p.lng], { radius: 9, color: '#fff', weight: 2, fillColor: colors[p.c], fillOpacity: 1 })
          .bindPopup(`<b>${esc(L(p.n))}</b><br><a href="${gm(p)}" target="_blank" rel="noopener">${t('open_maps')} ↗</a>`).addTo(layer));
        if (pts.length) mapObj.fitBounds(L_.latLngBounds(ps.map(p => [p.lat, p.lng])).pad(0.2));
      }
    };
    const L_ = window.L;  // Leaflet (la fonction L locale masque le global dans ce module)
    if (L_ && navigator.onLine !== false) {
      mapObj = L_.map('map').setView([23.5, 42], 5);
      L_.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '&copy; OpenStreetMap' }).addTo(mapObj);
      layer = L_.layerGroup().addTo(mapObj);
    } else { $('#map', el).outerHTML = `<div class="card muted">${t('map_offline')}</div>`; }
    render();
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
        <div class="card"><h3>💾 ${t('backup')}</h3><div class="row"><button class="ghost" id="exp">${t('export')}</button><button class="ghost" id="imp">${t('import')}</button><input type="file" id="file" accept="application/json" hidden></div></div>`;
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
          for (const k of ['lang', 'city', 'geo', 'method', 'trip', 'plan', 'checks', 'custom', 'cnt', 'exp', 'budget', 'rate', 'cur']) if (k in d) { S[k] = d[k]; save(k); }
          applyLang(); toast(t('imported')); draw(); } catch { toast(t('import_err')); }
      };
    };
    draw();
  };

  /* ---------- démarrage ---------- */
  applyLang(); route();
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
