/* Onglet « Parcours prophétique » : frise chronologique + carte animée, récit audio, tampons, mode « autour de moi ».
   Données : js/sira-data.js (window.SIRA). Les lieux de Médine du dossier de découvertes sont repris via data/junaid-madinah-discoveries.json. */
(() => {
  const A = window.Omra, D = window.SIRA;
  if (!A || !D) return;
  const { $, $$, esc, S, save, t } = A;
  const L = o => (o && (o[S.lang] || o.fr)) || '';
  const LANGTTS = { fr: 'fr-FR', en: 'en-US', ar: 'ar-SA' };
  const SRC_ICON = { fact: '✅', trad: '📜', tbc: '❓' };
  const SRC_KEY = { fact: 'sr_fact', trad: 'sr_trad', tbc: 'sr_tbc' };
  const chapters = D.chapters;
  const dist = (a, b) => { const R = 6371, r = Math.PI / 180, dLa = (b.lat - a.lat) * r, dLo = (b.lng - a.lng) * r; const h = Math.sin(dLa / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLo / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };
  const done = () => (S.sira = S.sira || {});
  let DISC = null;
  const loadDisc = () => DISC ? Promise.resolve(DISC) : fetch('data/junaid-madinah-discoveries.json', { cache: 'no-cache' }).then(r => (r.ok ? r.json() : Promise.reject())).then(d => (DISC = d)).catch(() => null);

  A.views.sira = el => {
    let era = 'all', open = null, map = null, markers = {}, ready = false, story = null, speaking = null, watch = null, pos = null, anim = null;
    const queue = [], whenReady = f => (ready ? f() : queue.push(f));
    const ML = window.maplibregl;
    const list = () => chapters.filter(c => era === 'all' || c.era === era);
    const count = () => chapters.filter(c => done()[c.id]).length;

    el.innerHTML = `<h2>${t('sira_title')}</h2><div class="cal-title" lang="ar" dir="rtl">صلى الله عليه وسلم</div>
      <div class="card sira-hero"><div class="ring" id="sRing"></div><div><b id="sProg"></b><p class="muted" style="margin:2px 0 0;font-size:13px">${t('sira_sub')}</p></div></div>
      <div class="row" style="gap:8px;margin:8px 0"><button type="button" id="sPlay" class="btn">▶ ${t('sira_play')}</button><button type="button" id="sNear" class="ghost">📍 ${t('sira_near')}</button></div>
      <div id="sBanner"></div>
      <div class="chips" id="sEras" style="margin:6px 0"></div>
      <div id="sMapWrap" style="position:relative"><div id="sMap" style="height:300px;border-radius:14px;overflow:hidden;border:1px solid var(--bd)"></div>
        <div class="mapbtns"><button type="button" class="chip mapbtn" id="sFull">⛶ ${t('holy_full')}</button></div>
        <div id="sStory" class="sstory" hidden></div></div>
      <p class="muted" style="font-size:12px;margin:6px 0">⚠️ ${t('sira_disc')}</p>
      <div id="sList"></div>`;

    /* ---------- progression ---------- */
    const progress = () => {
      const n = count(), tot = chapters.length;
      $('#sProg', el).textContent = `${n} / ${tot} ${t('sira_stamps')}`;
      $('#sRing', el).style.background = `conic-gradient(var(--g) ${Math.round(n / tot * 360)}deg, var(--bd) 0)`;
      $('#sRing', el).textContent = n === tot ? '✓' : String(n);
    };

    /* ---------- carte ---------- */
    const mkEl = (c, i) => { const e = document.createElement('div'); e.className = 'sm' + (done()[c.id] ? ' done' : '') + (c.approx ? ' approx' : ''); e.style.setProperty('--ec', D.eras[c.era].c); e.textContent = done()[c.id] ? '✓' : String(chapters.indexOf(c) + 1); e.title = L(c.n); e.onclick = ev => { ev.stopPropagation(); select(c.id, true, true); }; return e; };
    const draw = () => {
      if (!map) return;
      Object.values(markers).forEach(m => m.remove()); markers = {};
      list().forEach((c, i) => { markers[c.id] = new ML.Marker({ element: mkEl(c, i) }).setLngLat([c.lng, c.lat]).addTo(map); });
      whenReady(() => {
        map.getSource('sline').setData({ type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'LineString', coordinates: list().map(c => [c.lng, c.lat]) } }] });
        if (!anim) map.getSource('shijra').setData({ type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'LineString', coordinates: era === 'all' || era === 'hijra' ? D.hijraLine : [] } }] });
      });
      fit();
    };
    const fit = () => { if (!map) return; const bb = new ML.LngLatBounds(); list().forEach(c => bb.extend([c.lng, c.lat])); if (!bb.isEmpty()) map.fitBounds(bb, { padding: 40, maxZoom: 11, duration: 600 }); };
    const animateHijra = () => {
      if (!map) return; whenReady(() => {
        cancelAnimationFrame(anim); const pts = D.hijraLine; const seg = []; let tot = 0;
        for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); tot += d; }
        const t0 = performance.now(), dur = 3500;
        const step = now => {
          const k = Math.min(1, (now - t0) / dur); let rem = k * tot; const out = [pts[0]];
          for (let i = 0; i < seg.length; i++) { if (rem >= seg[i]) { out.push(pts[i + 1]); rem -= seg[i]; } else { const f = rem / seg[i]; out.push([pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f]); break; } }
          map.getSource('shijra').setData({ type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'LineString', coordinates: out } }] });
          if (k < 1) anim = requestAnimationFrame(step); else anim = null;
        };
        anim = requestAnimationFrame(step);
      });
    };
    const applyLang = () => whenReady(() => {
      const ex = S.lang === 'ar' ? ['coalesce', ['get', 'name:ar'], ['get', 'name']] : S.lang === 'en' ? ['coalesce', ['get', 'name:en'], ['get', 'name_en'], ['get', 'name:latin'], ['get', 'name']] : ['coalesce', ['get', 'name:fr'], ['get', 'name:en'], ['get', 'name_en'], ['get', 'name:latin'], ['get', 'name']];
      map.getStyle().layers.forEach(l => { if (l.type === 'symbol' && l.layout && l.layout['text-field'] && /name/.test(JSON.stringify(l.layout['text-field']))) map.setLayoutProperty(l.id, 'text-field', ex); });
    });

    /* ---------- liste (frise) ---------- */
    const body = c => {
      const place = c.place && window.PLACES && PLACES.find(p => p.id === c.place);
      const gm = `https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`, ap = `https://maps.apple.com/?daddr=${c.lat},${c.lng}`;
      const discs = (c.disc || []).map(id => DISC && DISC.records.find(r => r.id === id)).filter(Boolean);
      return `<div class="sbody">
        <p class="sstorytxt">${esc(L(c.story))}</p>
        <div class="row" style="gap:6px;margin:8px 0"><button type="button" class="chip" data-say="${c.id}">${speaking === c.id ? '⏹ ' + t('sira_stop') : '🔊 ' + t('sira_listen')}</button>
          <button type="button" class="chip ${done()[c.id] ? 'on' : ''}" data-stamp="${c.id}">${done()[c.id] ? '✅ ' + t('sira_stamped') : '🏷️ ' + t('sira_stamp')}</button></div>
        ${c.facts.map(f => `<div class="sfact s-${f.s}"><b>${SRC_ICON[f.s]} ${t(SRC_KEY[f.s])}</b><div>${esc(L(f))}</div></div>`).join('')}
        ${c.onsite ? `<div class="sfact s-site"><b>📍 ${t('sira_onsite')}</b><div>${esc(L(c.onsite))}</div>${c.approx ? `<div class="muted">⚠️ ${t('holy_approx')}</div>` : ''}</div>` : ''}
        <p class="muted" style="font-size:12px;margin:6px 0">${t('sira_sources')} : ${esc(c.src.join(' ; '))}</p>
        ${discs.length ? `<div class="sfact"><b>🗂️ ${t('sira_more')}</b>${discs.map(r => `<div style="margin-top:4px">· <b>${esc(r.name_fr)}</b> <span class="muted">(${esc(r.area || '')})</span><div class="muted">${esc(r.description_fr)}</div></div>`).join('')}<div class="muted" style="margin-top:4px">${t('sira_unverified')}</div></div>` : ''}
        <div class="row" style="gap:6px;flex-wrap:wrap"><a class="btn" href="${gm}" target="_blank" rel="noopener">🧭 Google Maps</a><a class="ghost btn" href="${ap}" target="_blank" rel="noopener">Plans</a>${place ? `<a class="ghost btn" href="#/place/${place.id}">${t('sira_fiche')} →</a>` : ''}</div></div>`;
    };
    const renderList = () => {
      const g = {}; list().forEach(c => { (g[c.era] = g[c.era] || []).push(c); });
      $('#sList', el).innerHTML = Object.keys(D.eras).filter(k => g[k]).map(k => `<h3 class="subh" style="color:${D.eras[k].c}">${D.eras[k].ic} ${esc(L(D.eras[k]))}</h3>` +
        g[k].map(c => { const n = chapters.indexOf(c) + 1, on = open === c.id; return `<div class="sitem ${on ? 'open' : ''} ${done()[c.id] ? 'done' : ''}" id="sc-${c.id}" style="--ec:${D.eras[k].c}">
          <button type="button" class="shead" data-open="${c.id}"><span class="snum">${done()[c.id] ? '✓' : n}</span><span class="stxt"><b>${esc(L(c.n))}</b><small>${esc(L(c.year))} · ${esc(L(c.sum))}</small></span><span class="schev">${on ? '▾' : '▸'}</span></button>${on ? body(c) : ''}</div>`; }).join('')).join('');
      $$('[data-open]', el).forEach(b => b.onclick = () => select(open === b.dataset.open ? null : b.dataset.open, true));
      $$('[data-stamp]', el).forEach(b => b.onclick = () => stamp(b.dataset.stamp));
      $$('[data-say]', el).forEach(b => b.onclick = () => say(b.dataset.say));
    };
    const ui = () => {
      $('#sEras', el).innerHTML = ['all', ...Object.keys(D.eras)].map(k => `<button type="button" class="chip ${era === k ? 'on' : ''}" data-era="${k}">${k === 'all' ? t('sira_all') : D.eras[k].ic + ' ' + esc(L(D.eras[k]))}</button>`).join('');
      $$('[data-era]', el).forEach(b => b.onclick = () => { era = b.dataset.era; open = null; ui(); draw(); });
      progress(); renderList();
    };

    /* ---------- actions ---------- */
    const stamp = id => {
      const d = done(); d[id] = d[id] ? undefined : Date.now(); if (!d[id]) delete d[id]; save('sira');
      if (d[id]) A.toast('🏷️ ' + t('sira_stamped'));
      if (markers[id]) { const e = markers[id].getElement(); e.classList.toggle('done', !!d[id]); e.textContent = d[id] ? '✓' : String(chapters.findIndex(c => c.id === id) + 1); }
      ui();
    };
    const say = id => {
      const ss = window.speechSynthesis; if (!ss) { A.toast(t('sira_no_tts')); return; }
      const was = speaking; ss.cancel(); speaking = null;
      if (was !== id) {
        const c = chapters.find(x => x.id === id); const u = new SpeechSynthesisUtterance(L(c.n) + '. ' + L(c.story)); u.lang = LANGTTS[S.lang] || 'fr-FR'; u.rate = .95;
        u.onend = u.onerror = () => { if (speaking === id) { speaking = null; renderList(); } }; speaking = id; ss.speak(u);
      }
      renderList();
    };
    let pop = null;
    const showPop = c => {
      if (!map) return; if (pop) pop.remove();
      const n = chapters.indexOf(c) + 1, box = document.createElement('div');
      box.innerHTML = `<div style="display:flex;gap:8px;align-items:center"><span class="snum" style="--ec:${D.eras[c.era].c}">${n}</span><b>${esc(L(c.n))}</b></div>
        <div class="muted" style="margin:4px 0">${esc(L(D.eras[c.era]))} · ${esc(L(c.year))}</div><div>${esc(L(c.sum))}</div>${c.approx ? `<div class="muted">⚠️ ${t('holy_approx')}</div>` : ''}
        <button type="button" class="btn" style="margin-top:8px;padding:6px 12px">${t('sira_read')}</button>`;
      $('button', box).onclick = () => { open = c.id; ui(); pop && pop.remove(); const x = $('#sc-' + c.id, el); x && x.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
      pop = new ML.Popup({ offset: 18, maxWidth: '270px', closeButton: true }).setLngLat([c.lng, c.lat]).setDOMContent(box).addTo(map);
    };
    const select = (id, fly, fromMap) => {
      open = id; if (!id) { renderList(); return; }
      const c = chapters.find(x => x.id === id); if (era !== 'all' && c.era !== era) { era = 'all'; draw(); }
      ui();
      if (map && fly) {
        map.flyTo({ center: [c.lng, c.lat], zoom: c.hijra && c.id === 'route' ? 7 : (c.id === 'badr' || c.id === 'khaybar' || c.id === 'hegra' || c.id === 'tabuk' || c.id === 'taif' ? 9 : 13.5), duration: 1400 });
        Object.values(markers).forEach(m => m.getElement().classList.remove('hl')); if (markers[id]) markers[id].getElement().classList.add('hl');
        if (c.hijra) animateHijra();
        showPop(c);
      }
      const n = $('#sc-' + id, el); if (n && fly && story == null && !fromMap) setTimeout(() => n.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 80);
    };

    /* ---------- mode récit : une étape après l'autre ---------- */
    const storyUI = () => {
      const box = $('#sStory', el); if (story == null) { box.hidden = true; box.innerHTML = ''; return; }
      const c = chapters[story]; box.hidden = false;
      box.innerHTML = `<div class="sst-top"><span>${story + 1}/${chapters.length} · ${esc(L(c.year))}</span><button type="button" class="chip" data-s="x">✕</button></div><b>${esc(L(c.n))}</b>
        <p>${esc(L(c.sum))}</p><div class="row" style="gap:6px"><button type="button" class="chip" data-s="p" ${story === 0 ? 'disabled' : ''}>◀</button><button type="button" class="chip" data-s="a">🔊</button><button type="button" class="chip" data-s="m">📖</button><button type="button" class="chip on" data-s="n">${story === chapters.length - 1 ? '🏁' : '▶'}</button></div>`;
      $$('[data-s]', box).forEach(b => b.onclick = () => {
        const k = b.dataset.s;
        if (k === 'x') { story = null; window.speechSynthesis && speechSynthesis.cancel(); storyUI(); return; }
        if (k === 'p' && story > 0) go(story - 1);
        else if (k === 'n') { if (story < chapters.length - 1) go(story + 1); else { story = null; storyUI(); } }
        else if (k === 'a') say(c.id);
        else if (k === 'm') { open = c.id; ui(); const n = $('#sc-' + c.id, el); n && n.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      });
    };
    const go = i => { story = i; if (speaking) { speechSynthesis.cancel(); speaking = null; } const c = chapters[i]; era = 'all'; draw(); select(c.id, true); storyUI(); };
    $('#sPlay', el).onclick = () => { era = 'all'; ui(); draw(); $('#sMapWrap', el).scrollIntoView({ behavior: 'smooth', block: 'start' }); go(story == null ? 0 : story); };

    /* ---------- autour de moi (GPS, facultatif) ---------- */
    const near = () => {
      if (!pos) return; const b = $('#sBanner', el);
      const ranked = chapters.map(c => ({ c, d: dist(pos, c) })).sort((a, b) => a.d - b.d); const n = ranked[0];
      if (n.d <= (n.c.approx ? 1.5 : 0.6)) b.innerHTML = `<div class="card sira-near">📍 <b>${t('sira_here')} ${esc(L(n.c.n))}</b><div class="muted">${t('sira_hint')}</div><button type="button" class="btn" data-go="${n.c.id}">${t('sira_read')}</button></div>`;
      else b.innerHTML = `<div class="card sira-near">🧭 ${t('sira_nearest')} : <b>${esc(L(n.c.n))}</b> · ${n.d < 10 ? n.d.toFixed(1) : Math.round(n.d)} km <button type="button" class="chip" data-go="${n.c.id}">${t('sira_read')}</button></div>`;
      const g = $('[data-go]', b); if (g) g.onclick = () => select(g.dataset.go, true);
    };
    $('#sNear', el).onclick = () => {
      if (watch != null) { navigator.geolocation.clearWatch(watch); watch = null; pos = null; $('#sBanner', el).innerHTML = ''; $('#sNear', el).textContent = '📍 ' + t('sira_near'); return; }
      if (!navigator.geolocation) { A.toast(t('sira_no_gps')); return; }
      $('#sNear', el).textContent = '⏹ ' + t('sira_near_off');
      watch = navigator.geolocation.watchPosition(p => { pos = { lat: p.coords.latitude, lng: p.coords.longitude }; near(); }, () => { A.toast(t('sira_no_gps')); watch = null; $('#sNear', el).textContent = '📍 ' + t('sira_near'); }, { enableHighAccuracy: true, maximumAge: 15000, timeout: 20000 });
    };
    $('#sFull', el).onclick = () => {
      const w = $('#sMapWrap', el), on = !w.classList.contains('sfull'); w.classList.toggle('sfull', on);
      document.body.style.overflow = on ? 'hidden' : ''; $('#sFull', el).textContent = on ? '✕ ' + t('holy_close') : '⛶ ' + t('holy_full');
      setTimeout(() => map && map.resize(), 50); setTimeout(() => map && map.resize(), 350);
    };

    /* ---------- carte : initialisation ---------- */
    if (ML && navigator.onLine !== false) {
      try {
        if (!window.__rtlSet) { window.__rtlSet = true; try { ML.setRTLTextPlugin('https://cdn.jsdelivr.net/npm/@mapbox/mapbox-gl-rtl-text@0.2.3/mapbox-gl-rtl-text.min.js', true); } catch (e) { /* indisponible */ } }
        map = new ML.Map({ container: 'sMap', style: 'https://tiles.openfreemap.org/styles/liberty', center: [39.7, 23.5], zoom: 5, attributionControl: { compact: true } });
        map.addControl(new ML.NavigationControl({ showCompass: false }), 'top-right');
        if (A.registerMap) A.registerMap(map); A.siraMap = map;
        map.on('load', () => {
          map.addSource('sline', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
          map.addLayer({ id: 'sline', type: 'line', source: 'sline', paint: { 'line-color': '#8a8a8a', 'line-width': 2, 'line-dasharray': [1, 2], 'line-opacity': .7 } });
          map.addSource('shijra', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
          map.addLayer({ id: 'shijra-c', type: 'line', source: 'shijra', paint: { 'line-color': '#fff', 'line-width': 8 }, layout: { 'line-cap': 'round', 'line-join': 'round' } });
          map.addLayer({ id: 'shijra', type: 'line', source: 'shijra', paint: { 'line-color': '#c9a227', 'line-width': 4, 'line-dasharray': [2, 1.5] }, layout: { 'line-cap': 'round', 'line-join': 'round' } });
          ready = true; applyLang(); queue.splice(0).forEach(f => f());
        });
      } catch (e) { map = null; }
    }
    if (!map) $('#sMap', el).outerHTML = `<div class="card muted">${t('map_offline')}</div>`;
    loadDisc().then(() => { if (document.body.contains(el)) renderList(); });
    ui(); draw();
    const leave = () => { if (/^#\/sira/.test(location.hash)) return; window.removeEventListener('hashchange', leave); cancelAnimationFrame(anim); if (watch != null) navigator.geolocation.clearWatch(watch); window.speechSynthesis && speechSynthesis.cancel(); };
    window.addEventListener('hashchange', leave);
    const id = (location.hash.split('/')[2] || '');
    if (id && chapters.some(c => c.id === id)) select(id, true);
  };
})();
