/* Carnet de parfums — découvertes et préférences, sans prix ou adresses inventés. */
(() => {
  const A = window.Omra; if (!A) return;
  const { esc, S } = A;
  const TXT = {
    fr: {title:'Parfums & maisons de parfum',intro:'Carnet olfactif pour Djeddah, Médine, La Mecque et Riyad. Les boutiques et les prix restent à vérifier avant toute visite.',city:'Ville',all:'Toutes les villes',search:'Rechercher un parfum, une note ou une maison…',notes:'Mes notes',save:'Enregistrer',saved:'Notes enregistrées',source:'Vidéo source',wishlist:'Ma liste à découvrir',guide:'Notes olfactives à rechercher',video:'Repérage vidéo',empty:'Aucun résultat',hint:'Idées de recherche : ce ne sont pas des produits ni des adresses vérifiés.',shop:'Enseignes à repérer',place:'Adresse non vérifiée',personal:'Observations, prix sur place (SAR), coup de cœur…'},
    en: {title:'Perfumes & perfume houses',intro:'Fragrance notebook for Jeddah, Madinah, Makkah and Riyadh. Shops and prices need checking before visiting.',city:'City',all:'All cities',search:'Search perfumes, notes or brands…',notes:'My notes',save:'Save',saved:'Notes saved',source:'Source video',wishlist:'My discovery list',guide:'Fragrance notes to explore',video:'Video inspiration',empty:'No results',hint:'Research leads, not verified products or addresses.',shop:'Brands to explore',place:'Address not verified',personal:'Impressions, local price (SAR), favorites…'},
    ar: {title:'العطور ودور العطور',intro:'دفتر للعطور في جدة والمدينة ومكة والرياض. يجب التحقق من المحلات والأسعار قبل الزيارة.',city:'المدينة',all:'كل المدن',search:'ابحث عن عطر أو مكون أو علامة…',notes:'ملاحظاتي',save:'حفظ',saved:'تم الحفظ',source:'الفيديو',wishlist:'قائمة الاستكشاف',guide:'مكونات عطرية',video:'فيديو للاستكشاف',empty:'لا توجد نتائج',hint:'أفكار للبحث وليست منتجات أو عناوين موثقة.',shop:'دور عطور للبحث',place:'العنوان غير مؤكد',personal:'انطباعاتك والسعر بالريال…'}
  };
  const cities = [['','🌍'],['jeddah','Djeddah'],['madinah','Médine'],['makkah','La Mecque'],['riyadh','Riyad']];
  const leads = [
    {id:'benzoin',city:'',name:'Benjoin / الجاوي',tags:'résine balsamique vanillée ambrée benzoin الجاوي',desc:'À rechercher en résine, huile ou composition, idéalement avec du santal.'},
    {id:'sandal',city:'',name:'Santal / خشب الصندل',tags:'boisé crémeux sandalwood صندل',desc:'Comparer santal naturel, accords boisés et mélanges avec benjoin.'},
    {id:'mukhallat',city:'',name:'Mukhallat / مخلط',tags:'mélange traditionnel huile parfumée oud musc ambre',desc:'Demander un mélange personnalisé santal + benjoin, et vérifier la composition.'},
    {id:'oliban',city:'',name:'Oliban / اللبان',tags:'encens hojari frankincense اللبان',desc:'Comparer avec les accords résineux déjà appréciés.'},
    {id:'makkah-video',city:'makkah',name:'Fragrance Shopping in Mecca',tags:'shopping parfums parfumeries boutiques review vidéo IbraTalksScents',desc:'Vidéo de repérage à examiner avant de retenir une boutique.',url:'https://www.youtube.com/watch?v=Vg8zqprbO9w'}
  ];
  A.views.perfumes = el => {
    const T = TXT[S.lang] || TXT.fr;
    const notebook = A.store.get('perfumeNotes', {});
    let selected = '', q = '';
    const cityName = k => ({jeddah:{fr:'Djeddah',en:'Jeddah',ar:'جدة'},madinah:{fr:'Médine',en:'Madinah',ar:'المدينة'},makkah:{fr:'La Mecque',en:'Makkah',ar:'مكة'},riyadh:{fr:'Riyad',en:'Riyadh',ar:'الرياض'}}[k] || {})[S.lang] || k;
    el.innerHTML = `<h2>🧴 ${esc(T.title)}</h2><p class="muted">${esc(T.intro)}</p>
      <div class="card"><div class="row"><input id="pfSearch" class="grow" type="search" aria-label="${esc(T.search)}" placeholder="${esc(T.search)}">
      <select id="pfCity" aria-label="${esc(T.city)}"><option value="">${esc(T.all)}</option>${cities.slice(1).map(([id])=>`<option value="${id}">${esc(cityName(id))}</option>`).join('')}</select></div>
      <p class="muted">${esc(T.hint)}</p><div id="pfResults"></div></div>
      <div class="card"><h3>📝 ${esc(T.wishlist)}</h3><label for="pfPersonal">${esc(T.personal)}</label><textarea id="pfPersonal" rows="4" style="width:100%" maxlength="4000"></textarea><div class="row" style="margin-top:8px"><button type="button" id="pfSave">${esc(T.save)}</button></div></div>`;
    const results = el.querySelector('#pfResults'), input = el.querySelector('#pfSearch'), filter = el.querySelector('#pfCity');
    const personal = el.querySelector('#pfPersonal');
    personal.value = typeof notebook.general === 'string' ? notebook.general : '';
    const draw = () => {
      q = input.value.toLocaleLowerCase(); selected = filter.value;
      const found = leads.filter(p => (!selected || !p.city || p.city === selected) &&
        [p.name,p.tags,p.desc].join(' ').toLocaleLowerCase().includes(q));
      results.innerHTML = found.length ? found.map(p => `<article style="border-top:1px solid var(--bd);padding:14px 0"><b>${esc(p.name)}</b>
        ${p.city ? `<span class="muted"> · ${esc(cityName(p.city))}</span>` : ''}
        <p class="muted">${esc(p.desc)}</p>${p.url ? `<a class="btn ghost sm" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">▶ ${esc(T.source)}</a>` : ''}</article>`).join('') : `<p class="muted">${esc(T.empty)}</p>`;
    };
    input.addEventListener('input',draw); filter.addEventListener('change',draw); draw();
    el.querySelector('#pfSave').addEventListener('click',()=>{
      const value = personal.value.slice(0,4000);
      const updated = {...A.store.get('perfumeNotes',{}), general:value};
      if (A.store.set('perfumeNotes',updated)) A.toast(T.saved);
      else A.toast('⚠️');
    });
  };
})();
