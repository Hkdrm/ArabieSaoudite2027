/* Onglet Omra : « Invocations » (texte arabe + translittération + sens + lecture audio) et « Infos pratiques ».
   Contenu rédigé pour l'application, à titre indicatif : à vérifier auprès des sources officielles et d'un savant. */
(() => {
  const A = window.Omra; if (!A) return;
  const { $, $$, esc, S } = A;
  const L = o => (o && (o[S.lang] || o.fr)) || '';
  const TXT = {
    fr: { dua: 'Invocations', duaNote: "Seule la talbiya est caractéristique de l'Omra ; pour le reste, on peut aussi invoquer librement dans sa propre langue. Les formules ci-dessous sont rapportées ; vérifiez-les auprès d'un savant.", listen: 'Écouter', stop: 'Arrêter', slow: 'Lent', x3: '×3', tr: 'Translittération', meaning: 'Sens', source: 'Source',
      info: 'Infos pratiques Arabie saoudite', infoNote: "Repères généraux, à confirmer sur les sites officiels avant le départ : les règles et tarifs changent.", emerg: 'Urgences', apps: 'Applications utiles', docs: 'Visa et documents', money: 'Argent et connexion', call: 'Appeler',
      police: 'Police', ambu: 'Ambulance (Croissant-Rouge)', fire: 'Protection civile (pompiers)', traffic: 'Circulation', unified: 'Numéro unifié (La Mecque, Médine, Riyad, Est)', no_tts: "Lecture audio indisponible sur cet appareil." },
    en: { dua: 'Supplications', duaNote: 'Only the talbiya is specific to Umrah; for the rest you may also pray freely in your own language. The phrases below are reported; check them with a scholar.', listen: 'Listen', stop: 'Stop', slow: 'Slow', x3: '×3', tr: 'Transliteration', meaning: 'Meaning', source: 'Source',
      info: 'Practical info for Saudi Arabia', infoNote: 'General pointers, to confirm on official sites before departure: rules and fees change.', emerg: 'Emergency numbers', apps: 'Useful apps', docs: 'Visa and documents', money: 'Money and connectivity', call: 'Call',
      police: 'Police', ambu: 'Ambulance (Red Crescent)', fire: 'Civil defence (fire)', traffic: 'Traffic', unified: 'Unified number (Makkah, Madinah, Riyadh, Eastern)', no_tts: 'Audio reading is not available on this device.' },
  };
  const T = k => (TXT[S.lang] || TXT.fr)[k] || TXT.fr[k];

  const DUAS = [
    { id: 'talbiya', n: { fr: 'La talbiya', en: 'The talbiya' }, ar: 'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لَا شَرِيكَ لَكَ',
      tl: "Labbayk Allahumma labbayk, labbayka la sharika laka labbayk, innal-hamda wan-ni'mata laka wal-mulk, la sharika lak.",
      m: { fr: "Me voici, ô Allah, me voici. Me voici, Tu n'as pas d'associé, me voici. À Toi la louange, la grâce et la royauté ; Tu n'as pas d'associé.", en: 'Here I am, O Allah, here I am. Here I am, You have no partner, here I am. Praise, favour and sovereignty are Yours; You have no partner.' },
      src: 'Sahih al-Bukhari 1549 ; Sahih Muslim 1184', when: { fr: "À partir de l'ihram, jusqu'au début du tawaf.", en: 'From ihram until the start of tawaf.' } },
    { id: 'enter', n: { fr: 'Entrer dans la mosquée', en: 'Entering the mosque' }, ar: 'بِسْمِ اللَّهِ وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ، اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
      tl: "Bismillah was-salatu was-salamu 'ala Rasulillah, Allahummaf-tah li abwaba rahmatik.",
      m: { fr: "Au nom d'Allah ; paix et bénédictions sur le Messager d'Allah. Ô Allah, ouvre-moi les portes de Ta miséricorde.", en: "In the name of Allah; peace and blessings on the Messenger of Allah. O Allah, open for me the gates of Your mercy." },
      src: 'Sahih Muslim 713 (partie « ouvre-moi les portes de Ta miséricorde ») ; Abu Dawud 465', when: { fr: 'En franchissant la porte, du pied droit.', en: 'On crossing the gate, right foot first.' } },
    { id: 'takbir', n: { fr: 'Face à la Pierre Noire', en: 'Facing the Black Stone' }, ar: 'اللَّهُ أَكْبَرُ',
      tl: 'Allahu akbar.', m: { fr: 'Allah est le Plus Grand.', en: 'Allah is the Greatest.' },
      src: 'Sahih al-Bukhari 1613 ; guide officiel de Nusuk', when: { fr: 'À chaque tour, en levant la main vers la Pierre Noire.', en: 'At each round, raising the hand toward the Black Stone.' } },
    { id: 'corners', n: { fr: 'Entre le coin yéménite et la Pierre Noire', en: 'Between the Yemeni corner and the Black Stone' }, ar: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
      tl: "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina 'adhaban-nar.",
      m: { fr: "Notre Seigneur, accorde-nous une belle part ici-bas, une belle part dans l'au-delà, et protège-nous du châtiment du Feu.", en: 'Our Lord, grant us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.' },
      src: 'Coran 2:201 ; Abu Dawud 1892', when: { fr: 'Entre les deux angles à chaque tour (on peut aussi invoquer librement).', en: 'Between the two corners each round (you may also pray freely).' } },
    { id: 'maqam', n: { fr: 'Près de la station d’Ibrahim', en: 'Near the Station of Ibrahim' }, ar: 'وَاتَّخِذُوا مِن مَّقَامِ إِبْرَاهِيمَ مُصَلًّى',
      tl: 'Wattakhidhu min maqami Ibrahima musalla.', m: { fr: "Prenez la station d'Ibrahim comme lieu de prière.", en: 'Take the Station of Ibrahim as a place of prayer.' },
      src: 'Coran 2:125 ; Sahih Muslim 1218', when: { fr: 'En s’approchant du Maqam après le tawaf, avant les deux rak‘as.', en: 'Approaching the Maqam after tawaf, before the two rak‘ahs.' } },
    { id: 'safa', n: { fr: 'Sur Safa', en: 'On Safa' }, ar: 'إِنَّ الصَّفَا وَالْمَرْوَةَ مِن شَعَائِرِ اللَّهِ ۖ أَبْدَأُ بِمَا بَدَأَ اللَّهُ بِهِ',
      tl: "Innas-Safa wal-Marwata min sha'a'irillah. Abda'u bima bada'allahu bih.", m: { fr: "Safa et Marwa font partie des rites d'Allah. Je commence par ce par quoi Allah a commencé.", en: 'Safa and Marwa are among the rites of Allah. I begin with what Allah began with.' },
      src: 'Coran 2:158 ; Sahih Muslim 1218', when: { fr: "En montant vers Safa pour le premier passage, puis face à la Kaaba (invocation libre, 3 fois).", en: 'Going up Safa for the first pass, then facing the Kaaba (free supplication, 3 times).' } },
  ];

  const duaHtml = () => `<details class="card" id="duaCard"><summary><b>🤲 ${T('dua')}</b></summary><p class="muted" style="margin:8px 0;font-size:13px">${T('duaNote')}</p>
    ${DUAS.map(d => `<div class="sitem-tr"><b>${esc(L(d.n))}</b><div class="muted" style="font-size:13px">${esc(L(d.when))}</div>
      <p lang="ar" dir="rtl" style="font-family:ArefAr,serif;font-size:26px;line-height:1.9;margin:8px 0;text-align:center">${d.ar}</p>
      <div class="muted" style="font-style:italic;margin-bottom:4px">${esc(d.tl)}</div><div>${esc(L(d.m))}</div>
      <div class="muted" style="font-size:12px;margin:4px 0">${T('source')} : ${esc(d.src)}</div>
      <div class="row" style="gap:6px"><button type="button" class="chip" data-dua="${d.id}">🔊 ${T('listen')}</button><button type="button" class="chip" data-dua="${d.id}" data-slow="1">🐢 ${T('slow')}</button><button type="button" class="chip" data-dua="${d.id}" data-rep="3">🔁 ${T('x3')}</button></div></div>`).join('')}</details>`;

  const tel = n => `<a class="btn alt" href="tel:${n}">📞 ${n}</a>`;
  const infoHtml = () => `<details class="card" id="infoCard"><summary><b>ℹ️ ${T('info')}</b></summary><p class="muted" style="margin:8px 0;font-size:13px">${T('infoNote')}</p>
    <h4 style="margin:10px 0 4px">🚨 ${T('emerg')}</h4>
    ${[['999', 'police'], ['997', 'ambu'], ['998', 'fire'], ['993', 'traffic'], ['911', 'unified']].map(([n, k]) => `<div class="row" style="gap:8px;justify-content:space-between;margin:4px 0"><span>${T(k)}</span>${tel(n)}</div>`).join('')}
    <h4 style="margin:12px 0 4px">📱 ${T('apps')}</h4>
    <ul style="margin:0;padding-inline-start:18px;line-height:1.6">
      <li><a href="https://www.nusuk.sa/" target="_blank" rel="noopener"><b>Nusuk</b> ↗</a> : ${S.lang === 'en' ? 'Umrah permits, Rawdah and bookings' : 'permis Omra, Rawdah et réservations'}</li>
      <li><a href="https://hhr.sa/" target="_blank" rel="noopener"><b>Haramain</b> ↗</a> : ${S.lang === 'en' ? 'high-speed train tickets' : 'billets du train à grande vitesse'}</li>
      <li><b>Tawakkalna</b> : ${S.lang === 'en' ? 'official Saudi government services app' : "application officielle de services gouvernementaux saoudiens"}</li>
      <li><b>Careem</b> / <b>Uber</b> : ${S.lang === 'en' ? 'ride-hailing' : 'VTC'}</li>
      <li><b>Google Maps</b> : ${S.lang === 'en' ? 'directions and live transit' : 'itinéraires et transports'}</li></ul>
    <h4 style="margin:12px 0 4px">🛂 ${T('docs')}</h4>
    <ul style="margin:0;padding-inline-start:18px;line-height:1.6">
      <li><a href="https://visa.visitsaudi.com/" target="_blank" rel="noopener">${S.lang === 'en' ? 'Official e-visa portal' : 'Portail officiel du visa électronique'} ↗</a> (${S.lang === 'en' ? 'check fees and eligibility there' : 'frais et conditions à vérifier sur place'})</li>
      <li>${S.lang === 'en' ? 'Passport valid at least 6 months; keep digital and paper copies of visa, tickets and hotel bookings.' : "Passeport valide au moins 6 mois ; gardez des copies numériques et papier du visa, des billets et des réservations d'hôtel."}</li>
      <li><a href="https://www.diplomatie.gouv.fr/fr/conseils-aux-voyageurs/conseils-par-pays-destination/arabie-saoudite/" target="_blank" rel="noopener">${S.lang === 'en' ? 'France travel advice (Saudi Arabia)' : 'Conseils aux voyageurs (France)'} ↗</a></li></ul>
    <h4 style="margin:12px 0 4px">💳 ${T('money')}</h4>
    <ul style="margin:0;padding-inline-start:18px;line-height:1.6">
      <li>${S.lang === 'en' ? 'Currency: Saudi riyal (SAR). Cards are widely accepted; keep a little cash for small shops and taxis.' : 'Monnaie : riyal saoudien (SAR). Les cartes sont largement acceptées ; gardez un peu d’espèces pour les petits commerces et taxis.'}</li>
      <li>${S.lang === 'en' ? 'A local eSIM or a SIM from a Saudi operator (STC, Mobily, Zain) avoids roaming costs; compare before buying.' : 'Une eSIM locale ou une carte SIM d’un opérateur saoudien (STC, Mobily, Zain) évite les frais d’itinérance ; comparez avant d’acheter.'}</li></ul></details>`;

  let speaking = null;
  const say = (id, opt) => {
    const ss = window.speechSynthesis; if (!ss) { A.toast(T('no_tts')); return; }
    ss.cancel(); if (speaking === id + (opt.slow ? 's' : '') + (opt.rep || '')) { speaking = null; return; }
    const d = DUAS.find(x => x.id === id); speaking = id + (opt.slow ? 's' : '') + (opt.rep || '');
    for (let i = 0; i < (opt.rep || 1); i++) { const u = new SpeechSynthesisUtterance(d.ar); u.lang = 'ar-SA'; u.rate = opt.slow ? .6 : .85; ss.speak(u); }
  };

  /* ---------- Menu : toutes les rubriques, regroupées (la barre du bas ne garde que l'essentiel) ---------- */
  const MENU = [
    ['mn_prepare', [['trip', '✈️', 'nav_trip'], ['stay', '🏨', 'nav_stay'], ['plan', '📒', 'nav_plan'], ['tools', '🧰', 'nav_tools']]],
    ['mn_faith', [['omra', '🕋', 'nav_omra'], ['https://maps.umrahcore.com/', '🕋', 'mn_mk_site'], ['makkah', '🗺️', 'mn_mk_osm'], ['sira', '🌙', 'sira_title'], ['prayer', '🕌', 'nav_prayer'], ['holy', '🗺️', 'holy_title']]],
    ['mn_discover', [['explore', '🧭', 'nav_explore'], ['discoveries', '🗂️', 'mn_disc']]],
  ];
  /* ---------- Liens vers UmrahMap (maps.umrahcore.com) : hôtels par temps de marche, carte, portes ---------- */
  A.views.umrah = el => {
    const pre = 'https://maps.umrahcore.com' + (S.lang === 'ar' ? '/ar' : '');
    const T2 = { fr: ['Hôtels par temps de marche', "Classés par distance à pied de la porte la plus proche du Haram (bandes de distance).", 'Carte de La Mecque', 'Carte interactive du site.', 'Portes du Haram', 'Liste des portes de la Mosquée sacrée.', "Site externe (UmrahMap, umrahcore.com) : le contenu appartient à ses auteurs. Connexion internet nécessaire."],
      en: ['Hotels by walking time', 'Sorted by walking distance to the nearest Haram gate (distance bands).', 'Makkah map', "The site's interactive map.", 'Haram gates', 'List of the Sacred Mosque gates.', 'External site (UmrahMap, umrahcore.com): content belongs to its authors. Internet connection required.'],
      ar: ['الفنادق حسب زمن المشي', 'مرتبة حسب المسافة مشيًا إلى أقرب باب للحرم.', 'خريطة مكة', 'الخريطة التفاعلية للموقع.', 'أبواب الحرم', 'قائمة أبواب المسجد الحرام.', 'موقع خارجي (UmrahMap): المحتوى لأصحابه، ويلزم اتصال بالإنترنت.'] }[S.lang] || [];
    const rows = [['/hotels', 0, '🏨'], ['', 2, '🗺️'], ['/gates', 4, '🚪']];
    el.innerHTML = `<h2>🏨 ${esc(T2[0])}</h2>${rows.map(([u, k, ic]) => `<a class="card" href="${pre}${u}" target="_blank" rel="noopener" style="display:block;color:inherit;text-decoration:none"><b>${ic} ${esc(T2[k])} ↗</b><div class="muted" style="margin-top:4px">${esc(T2[k + 1])}</div></a>`).join('')}
      <p class="muted" style="font-size:12px">${esc(T2[6])}</p><a class="ghost btn" href="#/omra">🕋 ${S.lang === 'en' ? 'My own map (Umrah tab)' : S.lang === 'ar' ? 'خريطتي (تبويب العمرة)' : 'Ma carte (onglet Omra)'}</a>`;
  };

  A.views.menu = el => {
    el.innerHTML = `<h2>☰ ${A.t('nav_menu')}</h2>` + MENU.map(([h, items]) => `<h3 class="subh">${A.t(h)}</h3><div class="cards">${items.map(([r, ic, k]) => `<a class="pcard" href="${/^https?:/.test(r) ? r : '#/' + r}" ${/^https?:/.test(r) ? 'target="_blank" rel="noopener"' : ''} style="text-decoration:none"><span class="ic">${ic}</span><span class="tt">${esc(A.t(k))}${/^https?:/.test(r) ? ' ↗' : ''}</span></a>`).join('')}</div>`).join('');
  };


  /* ---------- « Mon séjour » : le circuit, les hôtels et les vols vus depuis l'onglet Omra ---------- */
  const SJ = {
    fr: { title: 'Mon séjour', empty: "Chargez votre circuit (Djeddah, La Mecque, Médine, Riyad…) pour voir ici vos étapes, vos hôtels et vos transports.", load: 'Charger mon circuit', edit: 'Modifier', hotel: 'Hôtel', tbook: "À réserver", booked: 'Réservé', nights: 'nuits', night: 'nuit', here: "Vous êtes ici", day: 'Jour', of: 'sur', left: 'jours avant le départ', flights: 'Vols', out: 'Aller', ret: 'Retour',
      omra: "Omra : étape principale. Renseignez-vous sur le miqat et le moment de l'ihram avant d'entrer à La Mecque.", nabawi: 'Visite de la Mosquée du Prophète ﷺ, Rawdah (permis Nusuk), Quba, Uhud.', jeddah: 'Arrivée et repos ; Djeddah historique (Al-Balad), Corniche.', riyadh: 'Capitale : Diriyah, Masmak.', see_ihram: "Voir l'étape Ihram" },
    en: { title: 'My stay', empty: 'Load your itinerary (Jeddah, Makkah, Madinah, Riyadh…) to see your stops, hotels and transport here.', load: 'Load my itinerary', edit: 'Edit', hotel: 'Hotel', tbook: 'To book', booked: 'Booked', nights: 'nights', night: 'night', here: 'You are here', day: 'Day', of: 'of', left: 'days until departure', flights: 'Flights', out: 'Outbound', ret: 'Return',
      omra: 'Umrah: main stop. Find out about the miqat and when to enter ihram before reaching Makkah.', nabawi: "Prophet's Mosque ﷺ, Rawdah (Nusuk permit), Quba, Uhud.", jeddah: 'Arrival and rest; historic Jeddah (Al-Balad), Corniche.', riyadh: 'Capital: Diriyah, Masmak.', see_ihram: 'See the Ihram step' },
  };
  const ST = k => (SJ[S.lang] || SJ.fr)[k] || SJ.fr[k];
  const pad2 = n => String(n).padStart(2, '0');
  const isoD = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const dd = s => new Date(s + 'T00:00:00');
  const nts = (a, b) => Math.round((dd(b) - dd(a)) / 864e5);
  const shortD = s => dd(s).toLocaleDateString(S.lang === 'ar' ? 'ar-SA-u-nu-latn' : S.lang, { day: 'numeric', month: 'short' });
  const cName = id => (typeof CITIES !== 'undefined' && CITIES[id] ? (CITIES[id].n[S.lang] || CITIES[id].n.fr) : id);
  const stayHtml = () => {
    const c = S.circuit;
    if (!c) return `<div class="card"><h3>🧳 ${ST('title')}</h3><p class="muted">${ST('empty')}</p><a class="btn" href="#/stay">${ST('load')} →</a></div>`;
    const today = isoD(new Date()), d1 = c.stages[0].in, d2 = c.stages.at(-1).out, tot = nts(d1, d2);
    let head = '';
    if (today < d1) head = `<b>${nts(today, d1)}</b> ${ST('left')}`; else if (today < d2) head = `${ST('here')} · ${ST('day')} <b>${nts(d1, today) + 1}</b> ${ST('of')} ${tot + 1}`;
    const J = S.journey || {};
    const flights = (J.noOut || J.noRet) ? `<div class="muted" style="margin-top:8px">✈️ ${ST('flights')} : ${J.noOut ? `${ST('out')} <b>${esc(J.noOut)}</b>` : ''}${J.noOut && J.noRet ? ' · ' : ''}${J.noRet ? `${ST('ret')} <b>${esc(J.noRet)}</b>` : ''}</div>` : '';
    const rows = c.stages.map((s, i) => {
      const n = nts(s.in, s.out), cur = today >= s.in && today < s.out;
      const stays = (S.stays || []).filter(x => x.city === s.city && x.in && x.out && x.in < s.out && x.out > s.in);
      const hotel = stays.length ? stays.map(x => `🏨 <b>${esc(x.name || ST('hotel'))}</b> <span class="pill ${x.status === 'booked' ? 'ok' : ''}">${x.status === 'booked' ? '✓ ' + ST('booked') : ST('tbook')}</span>`).join('<br>') : `<a href="#/stay" class="muted">🏨 ${ST('hotel')} : ${ST('tbook')} →</a>`;
      const note = s.city === 'makkah' ? ST('omra') : s.city === 'madinah' ? ST('nabawi') : s.city === 'jeddah' ? ST('jeddah') : s.city === 'riyadh' ? ST('riyadh') : '';
      const tr = c.transports.find(x => (x.mode === 'train' || x.mode === 'flight') && x.to === s.city && x.date === s.in && x.from !== s.city);
      return `${tr ? `<div class="muted" style="margin:2px 0 2px 14px;font-size:13px">${A.circuit ? A.circuit.icon(tr) : '🚆'} ${A.circuit ? esc(A.circuit.label(tr)) + ' · ' : ''}${esc(shortD(tr.date))} · ${esc(cName(tr.from))} → ${esc(cName(tr.to))}</div>` : ''}
        <div class="sitem-tr ${cur ? 'done' : ''}" style="${s.city === 'makkah' ? 'border-color:#c9a227;border-width:2px' : ''}"><div class="row" style="gap:8px;flex-wrap:nowrap"><b class="grow">${s.city === 'makkah' ? '🕋 ' : ''}${i + 1}. ${esc(cName(s.city))}</b>${cur ? `<span class="pill ok">${ST('here')}</span>` : ''}</div>
          <div class="muted">📅 ${esc(shortD(s.in))} → ${esc(shortD(s.out))} · 🌙 ${n} ${n > 1 ? ST('nights') : ST('night')}</div>
          <div style="margin:4px 0">${hotel}</div>
          <div class="row" style="gap:6px;margin:6px 0">${stays.length ? stays.map(x => `<button type="button" class="chip" data-editstay="${x.id}">✏️ ${ST('edit')}${stays.length > 1 ? ' · ' + esc(x.name || ST('hotel')) : ''}</button>`).join('') : `<button type="button" class="chip" data-addstage="${s.id}">＋ ${ST('hotel')}</button>`}</div>${note ? `<div class="muted" style="font-size:13px">${note}${s.city === 'makkah' ? ` <a href="#omraSteps" data-goihram>${ST('see_ihram')} ↓</a>` : ''}</div>` : ''}</div>`;
    }).join('');
    return `<div class="card"><h3 style="margin:0">🧳 ${ST('title')}</h3>
      <p class="muted" style="margin:4px 0 8px">${esc(shortD(d1))} → ${esc(shortD(d2))} · ${tot} ${ST('nights')}${head ? ' · ' + head : ''}</p>${rows}${flights}</div>`;
  };

  const wrap = A.views.omra;
  A.views.omra = el => {
    wrap(el);
    const w = $('#holyWrap', el); if (!w) return;
    w.insertAdjacentHTML('beforebegin', stayHtml() + duaHtml() + infoHtml());
    $$('[data-editstay]', el).forEach(b => b.onclick = () => { A.stayEdit = b.dataset.editstay; location.hash = '#/stay'; });
    $$('[data-addstage]', el).forEach(b => b.onclick = () => { const st = (S.circuit.stages || []).find(x => x.id === b.dataset.addstage); A.circuitPrefill = st; location.hash = '#/stay'; });
    const gi = $('[data-goihram]', el); if (gi) gi.onclick = ev => { ev.preventDefault(); const t0 = $('#omraSteps', el); t0 && t0.scrollIntoView({ behavior: 'smooth' }); };
    $$('[data-dua]', el).forEach(b => b.onclick = () => say(b.dataset.dua, { slow: !!b.dataset.slow, rep: +b.dataset.rep || 0 }));
    const leave = () => { if (/^#\/omra/.test(location.hash)) return; window.removeEventListener('hashchange', leave); window.speechSynthesis && speechSynthesis.cancel(); };
    window.addEventListener('hashchange', leave);
  };
})();
