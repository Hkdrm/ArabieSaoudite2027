/* Carte interactive des lieux saints : Masjid al-Haram, Masjid an-Nabawi et miqats.
   Données : data/holy-sites.json (positions © contributeurs OpenStreetMap, ODbL).
   Utilisée dans l'onglet Omra (chaque étape a un bouton « Voir sur la carte ») et sur #/holy. */
(() => {
  const A = window.Omra;
  const { $, $$, esc, S, t } = A;
  let DATA = null;
  const hav = (a, b) => { const R = 6371000, r = Math.PI / 180, dLa = (b.lat - a.lat) * r, dLo = (b.lng - a.lng) * r; const q = Math.sin(dLa / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLo / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(q)); };
  const band = m => (m < 300 ? 0 : m < 600 ? 1 : m < 1000 ? 2 : m < 2000 ? 3 : 4);
  const BAND_COL = ['#2f855a', '#68a63c', '#c9a227', '#dd7a1f', '#c53030'];
  const fmtM = m => (m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1)} km`);
  /* Hôtels (OpenStreetMap, ODbL) : distance estimée = vol d'oiseau × 1,3 jusqu'à la porte la plus proche, 80 m/min */
  const addHotels = d => fetch('data/hotels-osm.json', { cache: 'no-cache' }).then(r => (r.ok ? r.json() : Promise.reject())).then(hd => {
    d.sites.forEach(site => {
      const key = site.id === 'haram' ? 'makkah' : site.id === 'nabawi' ? 'madinah' : null; if (!key) return;
      const gates = site.features.filter(f => f.cat === 'gate'); if (!gates.length) return;
      const hs = (hd.hotels[key] || []).map(x => {
        let g = null, gd = 1e12; gates.forEach(f => { const dd = hav(x, f); if (dd < gd) { gd = dd; g = f; } });
        const m = Math.round(gd * 1.3);
        return { id: 'h-' + x.id, cat: 'hotel', name_fr: x.name, name_en: x.name, name_ar: x.name_ar || x.name, lat: x.lat, lng: x.lng, stars: x.stars, dist: m, min: Math.max(1, Math.round(m / 80)), band: band(m), gate: g.num || '', gname: { fr: g.name_fr, en: g.name_en, ar: g.name_ar }, city: key };
      }).filter(x => x.dist <= 3500).sort((a, b) => a.dist - b.dist);
      site.features.push(...hs);
    });
    return d;
  }).catch(() => d);
  const load = () => DATA ? Promise.resolve(DATA) : fetch('data/holy-sites.json', { cache: 'no-cache' }).then(r => (r.ok ? r.json() : Promise.reject())).then(addHotels).then(d => (DATA = d)).catch(() => null);

  const ICON = { kaaba: '🕋', hajar: '⚫', yamani: '◻️', shami: '◻️', iraqi: '◻️', kaaba_door: '🚪', hijr: '🌓', maqam: '🔷', tawaf_start: '🟢', safa: '⛰️', marwa: '⛰️',
    rawdah: '🟩', tomb: '🕌', dome: '🟢', rawdah_women: '👩', baqi: '🪦', ghamama: '🕌', nourain: '🕌' };
  const CAT_KEY = { gate: 'holy_gates', rite: 'holy_rites', sai: 'holy_sai', service: 'holy_services', visit: 'holy_visit', miqat: 'holy_miqats', hotel: 'holy_hotels' };
  /* Étape de l'Omra → ce que la carte doit montrer */
  const STEP = {
    ihram: { site: 'miqats' },
    haram: { site: 'haram', layers: ['gate'], cam: { zoom: 16.5 } },
    tawaf: { site: 'haram', layers: ['rite'], hl: ['kaaba', 'hajar', 'tawaf_start', 'yamani'], cam: { ids: ['kaaba'], zoom: 18.4 } },
    maqam: { site: 'haram', layers: ['rite'], hl: ['maqam'], cam: { ids: ['maqam'], zoom: 19 } },
    sai: { site: 'haram', layers: ['sai'], hl: ['safa', 'marwa'], cam: { fit: ['safa', 'marwa'] } },
    halq: { site: 'haram', layers: ['sai', 'gate'], hl: ['marwa'], cam: { ids: ['marwa'], zoom: 18 } },
  };
  const LANG_EXPR = {
    fr: ['coalesce', ['get', 'name:fr'], ['get', 'name:en'], ['get', 'name_en'], ['get', 'name:latin'], ['get', 'name']],
    en: ['coalesce', ['get', 'name:en'], ['get', 'name_en'], ['get', 'name:latin'], ['get', 'name']],
    ar: ['coalesce', ['get', 'name:ar'], ['get', 'name']],
  };
  /* Repères très proches (quelques mètres) : affichés seulement à partir d'un certain zoom pour ne pas se superposer. */
  const MINZ = { hajar: 17.6, maqam: 17.6, tawaf_start: 17.6, hijr: 17.8, yamani: 18.3, shami: 18.3, iraqi: 18.3, kaaba_door: 20.2, tomb: 17.9, dome: 17.9 };
  const nm = f => (S.lang === 'ar' ? (f.name_ar || f.name_fr) : S.lang === 'en' ? (f.name_en || f.name_fr) : f.name_fr);
  const gUrl = f => `https://www.google.com/maps/search/?api=1&query=${f.lat},${f.lng}`;
  const aUrl = f => `https://maps.apple.com/?ll=${f.lat},${f.lng}&q=${encodeURIComponent(nm(f))}`;

  function mount(root, opts = {}) {
    let site = opts.site || 'haram', layers = new Set(opts.layers || ['gate', 'rite', 'sai']), hl = new Set(), base = 'plan', limit = 12;
    let map = null, markers = [], ready = false, shown = [];
    const queue = [], whenReady = f => (ready ? f() : queue.push(f));
    const ML = window.maplibregl;
    root.innerHTML = `<div class="card holy"><h3>🗺️ ${t('holy_title')}</h3><p class="muted" style="margin:0 0 8px;font-size:13px">${t('holy_sub')}</p>
      <div class="tabs" id="hSites" role="tablist"></div><div class="chips" id="hLayers"></div>
      <div id="hMapWrap" style="position:relative"><div id="hMap" style="height:340px;border-radius:14px;overflow:hidden;border:1px solid var(--bd)"></div>
        <div class="mapbtns"><button type="button" class="chip mapbtn" id="hBase"></button><button type="button" class="chip mapbtn" id="hFull" aria-label="${t('holy_full')}">⛶ ${t('holy_full')}</button></div></div>
      <div id="hList" style="margin-top:10px"></div>
      <p class="muted" style="font-size:11px;margin:8px 0 0">${t('holy_note')}</p></div>`;

    const siteList = () => {
      const s = (DATA && DATA.sites) || [];
      return [...s.map(x => ({ id: x.id, label: x.name[S.lang] || x.name.fr })), { id: 'miqats', label: t('holy_miqats') }];
    };
    const miqatFeatures = () => {
      const mi = PLACES.filter(p => p.c === 'miqat').map(p => ({ id: 'mq-' + p.id, cat: 'miqat', name_fr: p.n.fr, name_en: p.n.en, name_ar: p.n.ar, lng: p.lng, lat: p.lat, desc_fr: (p.sum && p.sum.fr) || '', where_fr: '' }));
      const h = PLACES.find(p => p.id === 'haram');
      return [...mi, { id: 'mq-haram', cat: 'miqat', name_fr: 'Masjid al-Haram', name_en: 'Masjid al-Haram', name_ar: 'المسجد الحرام', lng: h.lng, lat: h.lat, desc_fr: "Destination : on y entre en ihram déjà prononcé depuis le miqat.", where_fr: '' }];
    };
    const curSite = () => (site === 'miqats' ? { id: 'miqats', features: miqatFeatures(), lines: [], polys: [], center: [41, 22.5], zoom: 5 } : ((DATA && DATA.sites) || []).find(s => s.id === site) || { features: [], lines: [], polys: [] });
    const feats = () => curSite().features.filter(f => site === 'miqats' || layers.has(f.cat));
    const byId = id => curSite().features.find(f => f.id === id);

    const popupHtml = f => `<b>${esc(nm(f))}</b>${f.name_ar && S.lang !== 'ar' ? `<br><span dir="rtl">${esc(f.name_ar)}</span>` : ''}
      ${f.where_fr ? `<div class="muted">📍 ${esc(f.where_fr)}</div>` : ''}${f.level_fr ? `<div class="muted">🏢 ${esc(f.level_fr)}</div>` : ''}${f.women ? `<div class="muted">👩 ${t('holy_women')}</div>` : ''}${f.approx ? `<div class="muted">⚠️ ${t('holy_approx')}</div>` : ''}
      ${f.desc_fr ? `<p style="margin:6px 0">${esc(f.desc_fr)}</p>` : ''}<a href="${gUrl(f)}" target="_blank" rel="noopener">Google Maps ↗</a> · <a href="${aUrl(f)}" target="_blank" rel="noopener">Plans ↗</a>`;

    let hotelPop = null;
    const hotelPopup = f => {
      const box = document.createElement('div'), gn = f.gname && (f.gname[S.lang] || f.gname.fr), J = S.journey || {};
      const bk = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(f.name_fr + ' ' + (f.city === 'makkah' ? 'Mecca' : 'Medina'))}${J.date1 && J.date2 ? `&checkin=${J.date1}&checkout=${J.date2}` : ''}&group_adults=2&no_rooms=1`;
      box.innerHTML = `<b>🏨 ${esc(nm(f))}</b>${f.name_ar && S.lang !== 'ar' && f.name_ar !== f.name_fr ? `<br><span dir="rtl">${esc(f.name_ar)}</span>` : ''}${f.stars ? `<div class="muted">${'★'.repeat(Math.min(5, parseInt(f.stars, 10) || 0))}</div>` : ''}
        <div class="walkbox wb${f.band}" style="margin:6px 0">🚶 <b>≈ ${fmtM(f.dist)}</b> · ${f.min} min<div style="font-size:12px">${f.gate ? `${t('st_gate')} ${esc(f.gate)}` : ''}${gn ? ` · ${esc(gn)}` : ''}</div></div>
        <div class="muted" style="font-size:11px">${t('holy_h_est')}</div>
        <div style="margin-top:6px"><a href="${bk}" target="_blank" rel="noopener">Booking ↗</a> · <a href="${gUrl(f)}" target="_blank" rel="noopener">Google Maps ↗</a> · <a href="${aUrl(f)}" target="_blank" rel="noopener">Plans ↗</a></div>
        <button type="button" class="btn" style="margin-top:8px;padding:6px 12px">＋ ${t('holy_h_add')}</button>`;
      $('button', box).onclick = () => { A.stayPrefill = { city: f.city, name: f.name_fr, addr: `${f.name_fr} (${f.lat.toFixed(6)}, ${f.lng.toFixed(6)})` }; location.hash = '#/stay'; };
      return box;
    };
    const markerEl = f => {
      const e = document.createElement('div'); const isGate = f.cat === 'gate';
      e.className = 'hm hm-' + f.cat + (hl.has(f.id) ? ' hl' : '') + (f.women ? ' women' : '');
      e.textContent = isGate ? (f.num || '🚪') : (ICON[f.id] || (f.cat === 'service' ? 'ℹ️' : f.cat === 'miqat' ? '📍' : '•'));
      e.title = nm(f); return e;
    };
    const updateVis = () => { if (!map) return; const z = map.getZoom(); markers.forEach(m => { const f = m._f; m.getElement().style.display = (!f || hl.has(f.id) || z >= (MINZ[f.id] || 0) - 0.01) ? '' : 'none'; }); };
    const overlays = () => whenReady(() => {
      const s = curSite();
      const polys = { type: 'FeatureCollection', features: (s.polys || []).map(p => ({ type: 'Feature', properties: { id: p.id }, geometry: { type: 'Polygon', coordinates: [p.coords] } })) };
      const lines = { type: 'FeatureCollection', features: (s.lines || []).filter(l => layers.has(l.cat)).map(l => ({ type: 'Feature', properties: { id: l.id }, geometry: { type: 'LineString', coordinates: l.coords } })) };
      map.getSource('hpoly').setData(polys); map.getSource('hline').setData(lines);
      const hsrc = map.getSource('hhotels'); if (hsrc) hsrc.setData({ type: 'FeatureCollection', features: feats().filter(f => f.cat === 'hotel').map(f => ({ type: 'Feature', properties: { id: f.id, band: f.band }, geometry: { type: 'Point', coordinates: [f.lng, f.lat] } })) });
    });
    const renderMarkers = () => {
      if (!map) return;
      markers.forEach(m => m.remove()); markers = [];
      feats().filter(f => f.cat !== 'hotel').forEach(f => {
        const pop = new ML.Popup({ offset: 14, maxWidth: '270px' }).setHTML(popupHtml(f));
        const mk = new ML.Marker({ element: markerEl(f) }).setLngLat([f.lng, f.lat]).setPopup(pop).addTo(map); mk._f = f; markers.push(mk);
      });
      updateVis();
    };
    const camera = c => {
      if (!map) return;
      const s = curSite();
      if (site === 'miqats') { const bb = new ML.LngLatBounds(); feats().forEach(f => bb.extend([f.lng, f.lat])); map.fitBounds(bb, { padding: 50, duration: 700 }); return; }
      if (c && c.fit) { const bb = new ML.LngLatBounds(); c.fit.forEach(id => { const f = byId(id); if (f) bb.extend([f.lng, f.lat]); }); (s.lines || []).filter(l => layers.has(l.cat)).forEach(l => l.coords.forEach(p => bb.extend(p))); map.fitBounds(bb, { padding: 40, maxZoom: 18.5, duration: 700 }); return; }
      if (c && c.ids) { const f = byId(c.ids[0]); if (f) { map.flyTo({ center: [f.lng, f.lat], zoom: c.zoom || 18 }); return; } }
      map.flyTo({ center: s.center, zoom: (c && c.zoom) || s.zoom || 17 });
    };
    const applyLang = () => whenReady(() => {
      const ex = LANG_EXPR[S.lang === 'ar' ? 'ar' : S.lang === 'en' ? 'en' : 'fr'];
      map.getStyle().layers.forEach(l => { if (l.type === 'symbol' && l.layout && l.layout['text-field'] && /name/.test(JSON.stringify(l.layout['text-field']))) map.setLayoutProperty(l.id, 'text-field', ex); });
    });
    const OVERLAY = ['sat', 'hpoly-fill', 'hpoly-line', 'hline-casing', 'hline', 'hhotels'];
    const applyBase = () => whenReady(() => {
      const sat = base === 'sat';
      map.setLayoutProperty('sat', 'visibility', sat ? 'visible' : 'none');
      map.getStyle().layers.forEach(l => { if (['fill', 'line', 'fill-extrusion'].includes(l.type) && !OVERLAY.includes(l.id)) map.setLayoutProperty(l.id, 'visibility', sat ? 'none' : 'visible'); });
    });

    const ui = () => {
      $('#hSites', root).innerHTML = siteList().map(x => `<button type="button" class="tab ${site === x.id ? 'on' : ''}" role="tab" data-site="${x.id}">${esc(x.label)}</button>`).join('');
      const s = curSite(), cats = [...new Set(s.features.map(f => f.cat))].filter(c => c !== 'miqat');
      $('#hLayers', root).innerHTML = site === 'miqats' ? '' : cats.map(c => `<button type="button" class="chip ${layers.has(c) ? 'on' : ''}" data-layer="${c}">${esc(t(CAT_KEY[c]))} · ${s.features.filter(f => f.cat === c).length}</button>`).join('') + (layers.has('hotel') ? `<div class="muted" style="font-size:12px;width:100%">${BAND_COL.map((c, i) => `<span style="color:${c}">●</span> ${['< 300 m', '300–600 m', '0,6–1 km', '1–2 km', '> 2 km'][i]}`).join(' · ')}<br>${t('holy_h_est')}</div>` : '');
      $('#hBase', root).textContent = base === 'sat' ? '🗺️ ' + t('holy_plan') : '🛰️ ' + t('holy_sat');
      shown = feats();
      const list = shown.slice(0, limit);
      $('#hList', root).innerHTML = shown.length ? `<div class="cards">${list.map(f => `<button type="button" class="pcard" data-f="${esc(f.id)}"><span class="ic">${f.cat === 'hotel' ? '🏨' : f.cat === 'gate' ? '🚪' : (ICON[f.id] || (f.cat === 'service' ? 'ℹ️' : '📍'))}${f.num ? ' ' + esc(f.num) : ''}</span>
          <span class="tt">${esc(nm(f))}</span><span class="sub">${f.cat === 'hotel' ? `<b style="color:${BAND_COL[f.band]}">≈ ${fmtM(f.dist)}</b> · ${f.min} min${f.gate ? ' · ' + esc(t('st_gate')) + ' ' + esc(f.gate) : ''}` : esc(f.where_fr ? f.where_fr.replace(/^à environ /, '≈ ').replace(/ de (la Kaaba|la Rawdah)$/, '') : (f.level_fr || t(CAT_KEY[f.cat])))}</span></button>`).join('')}
        ${shown.length > list.length ? `<button type="button" class="ghost" id="hMore" style="grid-column:1/-1">${t('ex_more')} (${shown.length - list.length})</button>` : ''}</div>` : '';
      $$('[data-site]', root).forEach(b => b.onclick = () => setSite(b.dataset.site));
      $$('[data-layer]', root).forEach(b => b.onclick = () => { const c = b.dataset.layer; layers.has(c) ? layers.delete(c) : layers.add(c); limit = 12; refresh(false); });
      $$('[data-f]', root).forEach(b => b.onclick = () => openFeature(b.dataset.f));
      const mo = $('#hMore', root); if (mo) mo.onclick = () => { limit += 12; ui(); };
      $('#hFull', root).onclick = () => {
        const w = $('#hMapWrap', root), on = !w.classList.contains('hfull'); w.classList.toggle('hfull', on);
        document.body.style.overflow = on ? 'hidden' : ''; $('#hFull', root).textContent = on ? '✕ ' + t('holy_close') : '⛶ ' + t('holy_full');
        setTimeout(() => map && map.resize(), 50); setTimeout(() => map && map.resize(), 350);
      };
      $('#hBase', root).onclick = () => { base = base === 'sat' ? 'plan' : 'sat'; $('#hBase', root).textContent = base === 'sat' ? '🗺️ ' + t('holy_plan') : '🛰️ ' + t('holy_sat'); applyBase(); };
    };
    const refresh = (cam = true) => { ui(); renderMarkers(); overlays(); if (cam) camera(); };
    const setSite = id => { site = id; hl = new Set(); limit = 12; layers = new Set(id === 'haram' ? ['gate', 'rite', 'sai'] : ['gate', 'rite', 'visit']); refresh(true); };
    const openFeature = id => {
      const f = byId(id); if (!f || !map) return;
      if (f.cat === 'hotel') { map.flyTo({ center: [f.lng, f.lat], zoom: Math.max(map.getZoom(), 17) }); if (hotelPop) hotelPop.remove(); hotelPop = new ML.Popup({ offset: 12, maxWidth: '270px' }).setLngLat([f.lng, f.lat]).setDOMContent(hotelPopup(f)).addTo(map); $('#hMapWrap', root).scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
      map.flyTo({ center: [f.lng, f.lat], zoom: Math.max(map.getZoom(), 17.5, (MINZ[f.id] || 0) + 0.3) });
      const i = markers.findIndex(m => { const ll = m.getLngLat(); return Math.abs(ll.lng - f.lng) < 1e-7 && Math.abs(ll.lat - f.lat) < 1e-7; });
      if (i >= 0) { markers.forEach(m => { const p = m.getPopup(); if (p && p.isOpen()) m.togglePopup(); }); const mk = markers[i]; mk.getElement().style.display = ''; if (!mk.getPopup().isOpen()) mk.togglePopup(); }
      $('#hMapWrap', root).scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    /* étape de l'Omra → carte */
    const focusStep = id => {
      const st = STEP[id]; if (!st) return;
      load().then(() => {
        site = st.site; hl = new Set(st.hl || []); limit = 12;
        layers = new Set(st.layers || ['gate', 'rite', 'sai']);
        refresh(false); camera(st.cam);
        $('#hMapWrap', root).scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    };

    /* ---- carte ---- */
    if (ML && navigator.onLine !== false) {
      try {
        if (!window.__rtlSet) { window.__rtlSet = true; try { ML.setRTLTextPlugin('https://cdn.jsdelivr.net/npm/@mapbox/mapbox-gl-rtl-text@0.2.3/mapbox-gl-rtl-text.min.js', true); } catch (e) { /* indisponible */ } }
        map = new ML.Map({ container: 'hMap', style: 'https://tiles.openfreemap.org/styles/liberty', center: [39.8262, 21.4225], zoom: 16.5, attributionControl: { compact: true } });
        map.addControl(new ML.NavigationControl({ showCompass: false }), 'top-right');
        map.on('zoom', () => updateVis());
        if (A.registerMap) A.registerMap(map);
        A.holyMap = map;                                                   // (exposé pour les tests)
        map.on('load', () => {
          const first = map.getStyle().layers.find(l => l.type === 'symbol');
          map.addSource('sat', { type: 'raster', tileSize: 256, maxzoom: 19, tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'], attribution: 'Imagerie &copy; Esri, Maxar, Earthstar Geographics' });
          map.addLayer({ id: 'sat', type: 'raster', source: 'sat', layout: { visibility: 'none' } }, first && first.id);
          map.addSource('hpoly', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
          map.addLayer({ id: 'hpoly-fill', type: 'fill', source: 'hpoly', paint: { 'fill-color': ['match', ['get', 'id'], 'kaaba', '#111111', 'hijr', '#ffffff', 'maqam', '#2b6cb0', 'rawdah', '#0b6b4f', 'dome', '#2f855a', '#888888'], 'fill-opacity': ['match', ['get', 'id'], 'kaaba', 0.92, 'rawdah', 0.4, 0.6] } });
          map.addLayer({ id: 'hpoly-line', type: 'line', source: 'hpoly', paint: { 'line-color': '#c9a227', 'line-width': 1.5 } });
          map.addSource('hline', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
          map.addLayer({ id: 'hline-casing', type: 'line', source: 'hline', paint: { 'line-color': '#fff', 'line-width': 8 }, layout: { 'line-cap': 'round' } });
          map.addLayer({ id: 'hline', type: 'line', source: 'hline', paint: { 'line-color': ['match', ['get', 'id'], 'sai', '#2b6cb0', '#0b6b4f'], 'line-width': 4, 'line-dasharray': [2, 1.5] }, layout: { 'line-cap': 'round' } });
          map.addSource('hhotels', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
          map.addLayer({ id: 'hhotels', type: 'circle', source: 'hhotels', paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 13, 4, 17, 8, 19, 12], 'circle-color': ['match', ['get', 'band'], 0, BAND_COL[0], 1, BAND_COL[1], 2, BAND_COL[2], 3, BAND_COL[3], BAND_COL[4]], 'circle-stroke-color': '#fff', 'circle-stroke-width': 1.5, 'circle-opacity': .95 } });
          map.on('click', 'hhotels', e => { const f = e.features && e.features[0]; if (f) openFeature(f.properties.id); });
          map.on('mouseenter', 'hhotels', () => { map.getCanvas().style.cursor = 'pointer'; }); map.on('mouseleave', 'hhotels', () => { map.getCanvas().style.cursor = ''; });
          ready = true; applyLang(); applyBase(); queue.splice(0).forEach(f => f());
        });
      } catch (e) { map = null; }
    }
    if (!map) $('#hMap', root).outerHTML = `<div class="card muted">${t('map_offline')}</div>`;
    ui();
    load().then(d => {
      if (!d) { $('#hList', root).innerHTML = `<p class="muted">${t('holy_fail')}</p>`; return; }
      if (!document.body.contains(root)) return;
      refresh(true);
      if (opts.step) focusStep(opts.step);
    });
    return { focusStep, setSite, get map() { return map; } };
  }

  A.holy = { mount, ctrl: null };
  /* Page « Makkah » : la carte interactive centrée sur la Mosquée sacrée, avec les portes, les rites et les hôtels par distance à pied */
  A.views.makkah = el => {
    el.innerHTML = `<div class="mk"><h2>🕋 ${esc(t('mk_title'))}</h2><p class="muted" style="margin:0 0 8px">${t('mk_sub')}</p><div id="holyWrap"></div>
      <div class="card" style="margin-top:12px"><b>🏨 ${t('mn_umrah')}</b><div class="row" style="gap:8px;margin-top:8px;flex-wrap:wrap"><a class="btn alt" href="https://maps.umrahcore.com/hotels" target="_blank" rel="noopener">UmrahMap ↗</a><a class="ghost btn" href="#/stay">🏨 ${t('nav_stay')}</a><a class="ghost btn" href="#/omra">🕋 ${t('nav_omra')}</a></div></div></div>`;
    A.holy.ctrl = mount($('#holyWrap', el), { site: 'haram', layers: ['gate', 'rite', 'hotel'] });
  };
  A.views.holy = el => { el.innerHTML = '<h2>' + esc(t('holy_title')) + '</h2><div id="holyWrap"></div>'; A.holy.ctrl = mount($('#holyWrap', el)); };
})();
