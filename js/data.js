/* Données statiques + traductions (FR / AR / EN) */
const LANGS = { fr: 'Français', ar: 'العربية', en: 'English' };

const I18N = {
  fr: {
    app_name: 'Mon Voyage Omra', tagline: 'Vacances & Omra en Arabie saoudite',
    nav_home: 'Accueil', nav_plan: 'Planning', nav_omra: 'Omra', nav_prayer: 'Prière', nav_map: 'Carte', nav_tools: 'Outils',
    countdown: 'Départ dans', days: 'jours', day_word: 'Jour', trip_ongoing: 'Voyage en cours', trip_over: 'Voyage terminé',
    set_dates: 'Renseignez vos dates de voyage', trip_start: 'Départ', trip_end: 'Retour', save: 'Enregistrer',
    next_prayer: 'Prochaine prière', in: 'dans', city: 'Ville', method: 'Méthode de calcul', my_position: '📍 Ma position', locating: 'Localisation…',
    geo_error: 'Position indisponible', today: "Aujourd'hui",
    fajr: 'Fajr', sunrise: 'Chourouq', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha',
    qibla: 'Qibla', qibla_dir: 'Direction de la Qibla', from_north: 'depuis le Nord', distance: 'Distance de la Kaaba', km: 'km',
    enable_compass: 'Activer la boussole', compass_off: "Boussole indisponible sur cet appareil : orientez-vous avec l'angle indiqué.",
    compass_hint: 'Posez le téléphone à plat. Quand la flèche pointe vers le haut, vous faites face à la Qibla.',
    quick: 'Accès rapide', quick_omra: 'Guide pas à pas', quick_plan: 'Mon planning', quick_map: 'Lieux à visiter', quick_list: 'Checklist',
    plan_title: 'Planning du voyage', add_day: 'Ajouter une étape', title: 'Titre', notes: 'Notes (hôtel, vol, horaire…)', add: 'Ajouter', delete: 'Supprimer',
    empty_plan: 'Aucune étape pour le moment.', load_example: 'Charger un exemple', clear: 'Tout effacer', confirm_clear: 'Tout effacer ?',
    ex1: 'Arrivée & installation', ex2: 'Médine : Masjid an-Nabawi & Rawdah', ex3: 'Médine : Quba, Uhud, Qiblatayn', ex4: 'Route vers La Mecque — ihram au miqat',
    ex5: 'Omra : tawaf, sa\'i, taqsir', ex6: 'La Mecque : prières & Jabal Nour', ex7: 'Jeddah : Al-Balad & Corniche', ex8: 'Retour',
    omra_title: "Guide de l'Omra", omra_disclaimer: "Guide d'aide-mémoire. Pour toute question de rite, référez-vous à un savant ou au guide officiel de votre agence.",
    tawaf_counter: 'Compteur de Tawaf', sai_counter: 'Compteur de Sa\'i', round: 'tour', lap: 'trajet', plus: '+1', reset: 'Remise à zéro', done: 'Terminé ✓',
    men: 'Hommes', women: 'Femmes',
    map_title: 'Carte', all: 'Tout', c_holy: 'Lieux saints', c_miqat: 'Miqats', c_visit: 'À visiter', c_airport: 'Aéroports',
    open_maps: 'Itinéraire', map_offline: 'La carte nécessite une connexion. La liste ci-dessous reste disponible hors ligne.', approx: 'Positions approximatives.',
    tools_title: 'Outils', checklist: 'Checklist', add_item: 'Ajouter un élément…', budget: 'Budget', label: 'Libellé', amount: 'Montant', currency: 'Devise',
    rate: '1 SAR =', total: 'Total', spent: 'Dépensé', planned: 'Budget prévu', expenses: 'Dépenses', no_exp: 'Aucune dépense.',
    settings: 'Réglages', language: 'Langue', backup: 'Sauvegarde', export: 'Exporter', import: 'Importer', imported: 'Données importées', import_err: 'Fichier invalide',
    install: "Installer l'application", g_docs: 'Documents', g_ihram: 'Ihram & Omra', g_bag: 'Valise', g_misc: 'Divers',
    ck_passport: 'Passeport valide (6 mois min.)', ck_visa: 'Visa Omra / e-Visa', ck_nusuk: 'Permis & réservations via l\'app Nusuk', ck_ticket: 'Billets d\'avion',
    ck_hotel: 'Réservations hôtels', ck_insurance: 'Assurance voyage', ck_health: 'Vaccins / exigences sanitaires officielles',
    ck_ihram: 'Ihram (2 pièces blanches non cousues) + ceinture', ck_sandals: 'Sandales ouvertes', ck_unscented: 'Produits de toilette sans parfum', ck_prayerrug: 'Tapis de prière léger',
    ck_clothes: 'Vêtements amples & confortables', ck_shoes: 'Chaussures de marche', ck_adapter: 'Adaptateur prise (type G) & chargeur', ck_powerbank: 'Batterie externe',
    ck_money: 'Cartes + un peu de SAR en espèces', ck_meds: 'Médicaments personnels', ck_water: 'Gourde / bouteille', ck_quran: 'Coran / recueil de duas',
  },
  en: {
    app_name: 'My Umrah Trip', tagline: 'Holiday & Umrah in Saudi Arabia',
    nav_home: 'Home', nav_plan: 'Plan', nav_omra: 'Umrah', nav_prayer: 'Prayer', nav_map: 'Map', nav_tools: 'Tools',
    countdown: 'Departure in', days: 'days', day_word: 'Day', trip_ongoing: 'Trip in progress', trip_over: 'Trip completed',
    set_dates: 'Set your travel dates', trip_start: 'Departure', trip_end: 'Return', save: 'Save',
    next_prayer: 'Next prayer', in: 'in', city: 'City', method: 'Calculation method', my_position: '📍 My location', locating: 'Locating…',
    geo_error: 'Location unavailable', today: 'Today',
    fajr: 'Fajr', sunrise: 'Sunrise', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha',
    qibla: 'Qibla', qibla_dir: 'Qibla direction', from_north: 'from North', distance: 'Distance to the Kaaba', km: 'km',
    enable_compass: 'Enable compass', compass_off: 'Compass unavailable on this device: use the angle shown.',
    compass_hint: 'Hold the phone flat. When the arrow points up, you are facing the Qibla.',
    quick: 'Quick access', quick_omra: 'Step-by-step guide', quick_plan: 'My plan', quick_map: 'Places to visit', quick_list: 'Checklist',
    plan_title: 'Trip plan', add_day: 'Add a step', title: 'Title', notes: 'Notes (hotel, flight, time…)', add: 'Add', delete: 'Delete',
    empty_plan: 'No steps yet.', load_example: 'Load an example', clear: 'Clear all', confirm_clear: 'Clear everything?',
    ex1: 'Arrival & check-in', ex2: 'Madinah: Masjid an-Nabawi & Rawdah', ex3: 'Madinah: Quba, Uhud, Qiblatayn', ex4: 'Road to Makkah — ihram at the miqat',
    ex5: 'Umrah: tawaf, sa\'i, taqsir', ex6: 'Makkah: prayers & Jabal Nour', ex7: 'Jeddah: Al-Balad & Corniche', ex8: 'Return',
    omra_title: 'Umrah guide', omra_disclaimer: 'Memory aid only. For any ruling, refer to a scholar or your tour operator\'s official guide.',
    tawaf_counter: 'Tawaf counter', sai_counter: 'Sa\'i counter', round: 'round', lap: 'lap', plus: '+1', reset: 'Reset', done: 'Done ✓',
    men: 'Men', women: 'Women',
    map_title: 'Map', all: 'All', c_holy: 'Holy sites', c_miqat: 'Miqats', c_visit: 'To visit', c_airport: 'Airports',
    open_maps: 'Directions', map_offline: 'The map needs a connection. The list below stays available offline.', approx: 'Approximate locations.',
    tools_title: 'Tools', checklist: 'Checklist', add_item: 'Add an item…', budget: 'Budget', label: 'Label', amount: 'Amount', currency: 'Currency',
    rate: '1 SAR =', total: 'Total', spent: 'Spent', planned: 'Planned budget', expenses: 'Expenses', no_exp: 'No expenses.',
    settings: 'Settings', language: 'Language', backup: 'Backup', export: 'Export', import: 'Import', imported: 'Data imported', import_err: 'Invalid file',
    install: 'Install the app', g_docs: 'Documents', g_ihram: 'Ihram & Umrah', g_bag: 'Luggage', g_misc: 'Misc',
    ck_passport: 'Valid passport (6+ months)', ck_visa: 'Umrah visa / e-Visa', ck_nusuk: 'Permits & bookings via the Nusuk app', ck_ticket: 'Flight tickets',
    ck_hotel: 'Hotel bookings', ck_insurance: 'Travel insurance', ck_health: 'Vaccines / official health requirements',
    ck_ihram: 'Ihram (2 unstitched white pieces) + belt', ck_sandals: 'Open sandals', ck_unscented: 'Unscented toiletries', ck_prayerrug: 'Light prayer mat',
    ck_clothes: 'Loose, comfortable clothes', ck_shoes: 'Walking shoes', ck_adapter: 'Plug adapter (type G) & charger', ck_powerbank: 'Power bank',
    ck_money: 'Cards + some SAR cash', ck_meds: 'Personal medication', ck_water: 'Water bottle', ck_quran: 'Quran / dua booklet',
  },
  ar: {
    app_name: 'رحلتي للعمرة', tagline: 'عطلة وعمرة في المملكة العربية السعودية',
    nav_home: 'الرئيسية', nav_plan: 'البرنامج', nav_omra: 'العمرة', nav_prayer: 'الصلاة', nav_map: 'الخريطة', nav_tools: 'أدوات',
    countdown: 'المغادرة بعد', days: 'يوم', day_word: 'اليوم', trip_ongoing: 'الرحلة جارية', trip_over: 'انتهت الرحلة',
    set_dates: 'أدخل تواريخ سفرك', trip_start: 'المغادرة', trip_end: 'العودة', save: 'حفظ',
    next_prayer: 'الصلاة القادمة', in: 'بعد', city: 'المدينة', method: 'طريقة الحساب', my_position: '📍 موقعي', locating: 'جارٍ تحديد الموقع…',
    geo_error: 'تعذر تحديد الموقع', today: 'اليوم',
    fajr: 'الفجر', sunrise: 'الشروق', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء',
    qibla: 'القبلة', qibla_dir: 'اتجاه القبلة', from_north: 'من الشمال', distance: 'المسافة إلى الكعبة', km: 'كم',
    enable_compass: 'تفعيل البوصلة', compass_off: 'البوصلة غير متاحة على هذا الجهاز: استخدم الزاوية الموضحة.',
    compass_hint: 'ضع الهاتف أفقيًا. عندما يشير السهم للأعلى فأنت تواجه القبلة.',
    quick: 'وصول سريع', quick_omra: 'دليل خطوة بخطوة', quick_plan: 'برنامجي', quick_map: 'أماكن للزيارة', quick_list: 'قائمة التحقق',
    plan_title: 'برنامج الرحلة', add_day: 'إضافة محطة', title: 'العنوان', notes: 'ملاحظات (فندق، رحلة، وقت…)', add: 'إضافة', delete: 'حذف',
    empty_plan: 'لا توجد محطات بعد.', load_example: 'تحميل مثال', clear: 'مسح الكل', confirm_clear: 'مسح كل شيء؟',
    ex1: 'الوصول والإقامة', ex2: 'المدينة: المسجد النبوي والروضة', ex3: 'المدينة: قباء وأحد والقبلتين', ex4: 'الطريق إلى مكة — الإحرام من الميقات',
    ex5: 'العمرة: الطواف والسعي والتقصير', ex6: 'مكة: الصلوات وجبل النور', ex7: 'جدة: البلد والكورنيش', ex8: 'العودة',
    omra_title: 'دليل العمرة', omra_disclaimer: 'للتذكير فقط. لأي مسألة شرعية ارجع إلى أهل العلم أو دليل حملتك الرسمي.',
    tawaf_counter: 'عدّاد الطواف', sai_counter: 'عدّاد السعي', round: 'شوط', lap: 'شوط', plus: '+١', reset: 'إعادة', done: '✓ تم',
    men: 'الرجال', women: 'النساء',
    map_title: 'الخريطة', all: 'الكل', c_holy: 'المشاعر', c_miqat: 'المواقيت', c_visit: 'للزيارة', c_airport: 'المطارات',
    open_maps: 'الاتجاهات', map_offline: 'تحتاج الخريطة إلى اتصال. القائمة أدناه متاحة دون اتصال.', approx: 'المواقع تقريبية.',
    tools_title: 'أدوات', checklist: 'قائمة التحقق', add_item: 'إضافة عنصر…', budget: 'الميزانية', label: 'البيان', amount: 'المبلغ', currency: 'العملة',
    rate: '١ ريال =', total: 'المجموع', spent: 'المصروف', planned: 'الميزانية المخططة', expenses: 'المصروفات', no_exp: 'لا مصروفات.',
    settings: 'الإعدادات', language: 'اللغة', backup: 'نسخ احتياطي', export: 'تصدير', import: 'استيراد', imported: 'تم استيراد البيانات', import_err: 'ملف غير صالح',
    install: 'تثبيت التطبيق', g_docs: 'الوثائق', g_ihram: 'الإحرام والعمرة', g_bag: 'الأمتعة', g_misc: 'متفرقات',
    ck_passport: 'جواز سفر ساري (6 أشهر فأكثر)', ck_visa: 'تأشيرة العمرة / التأشيرة الإلكترونية', ck_nusuk: 'التصاريح والحجوزات عبر تطبيق نسك', ck_ticket: 'تذاكر الطيران',
    ck_hotel: 'حجوزات الفنادق', ck_insurance: 'تأمين السفر', ck_health: 'اللقاحات / المتطلبات الصحية الرسمية',
    ck_ihram: 'الإحرام (قطعتان بيضاوان غير مخيطتين) + حزام', ck_sandals: 'نعال مفتوحة', ck_unscented: 'مستلزمات نظافة بلا عطر', ck_prayerrug: 'سجادة صلاة خفيفة',
    ck_clothes: 'ملابس فضفاضة ومريحة', ck_shoes: 'حذاء للمشي', ck_adapter: 'محول كهرباء وشاحن', ck_powerbank: 'شاحن متنقل',
    ck_money: 'بطاقات + بعض الريالات نقدًا', ck_meds: 'أدوية شخصية', ck_water: 'قارورة ماء', ck_quran: 'مصحف / كتيب أدعية',
  },
};

const CITIES = {
  makkah:  { n: { fr: 'La Mecque', ar: 'مكة المكرمة', en: 'Makkah' },     lat: 21.4225, lng: 39.8262, tz: 'Asia/Riyadh', country: 'SA' },
  madinah: { n: { fr: 'Médine', ar: 'المدينة المنورة', en: 'Madinah' },   lat: 24.4672, lng: 39.6111, tz: 'Asia/Riyadh', country: 'SA' },
  jeddah:  { n: { fr: 'Jeddah', ar: 'جدة', en: 'Jeddah' },                lat: 21.5433, lng: 39.1728, tz: 'Asia/Riyadh', country: 'SA' },
  riyadh:  { n: { fr: 'Riyad', ar: 'الرياض', en: 'Riyadh' },              lat: 24.7136, lng: 46.6753, tz: 'Asia/Riyadh', country: 'SA' },
  alula:   { n: { fr: 'AlUla', ar: 'العُلا', en: 'AlUla' },               lat: 26.6085, lng: 37.9232, tz: 'Asia/Riyadh', country: 'SA' },
  taif:    { n: { fr: 'Taïf', ar: 'الطائف', en: 'Taif' },                 lat: 21.2703, lng: 40.4158, tz: 'Asia/Riyadh', country: 'SA' },
  paris:   { n: { fr: 'Paris', ar: 'باريس', en: 'Paris' },                lat: 48.8566, lng: 2.3522,  tz: 'Europe/Paris', country: 'FR' },
};

/* Étapes de l'Omra. */
const OMRA_STEPS = [
  { id: 'ihram', ic: '🤍',
    t: { fr: "1. Ihram & intention", ar: '١. الإحرام والنية', en: '1. Ihram & intention' },
    d: { fr: "Ghusl, parfum sur le corps (pas sur l'ihram). Hommes : deux pièces blanches non cousues ; femmes : tenue pudique habituelle. Formulez l'intention au miqat (en avion : à l'approche du miqat). Dès lors, interdits de l'ihram : parfum, couper ongles/cheveux, chasser, relations conjugales, couvrir la tête (hommes).",
         ar: 'الاغتسال والتطيب في البدن (لا في الإحرام). الرجال: إزار ورداء أبيضان غير مخيطين؛ النساء: لباسهن الساتر المعتاد. تُعقد النية من الميقات (وفي الطائرة عند محاذاته). ثم تبدأ محظورات الإحرام: الطيب، قص الشعر والأظافر، الصيد، الجماع، تغطية الرأس للرجال.',
         en: "Ghusl, perfume on the body (not the ihram cloth). Men: two unstitched white sheets; women: usual modest clothing. Make the intention at the miqat (on a plane: when approaching it). Then the ihram restrictions apply: perfume, cutting nails/hair, hunting, marital relations, covering the head (men)." },
    du: [{ ar: 'اللَّهُمَّ لَبَّيْكَ عُمْرَةً', tr: "Allahumma labbayka 'umratan", m: { fr: "Ô Allah, me voici pour l'Omra.", ar: 'اللهم لبيك بعمرة.', en: 'O Allah, here I am for Umrah.' } }] },
  { id: 'talbiya', ic: '📣',
    t: { fr: '2. Talbiya', ar: '٢. التلبية', en: '2. Talbiyah' },
    d: { fr: "Répétez-la souvent, à voix haute pour les hommes et à voix basse pour les femmes, jusqu'à l'arrivée à la Kaaba (début du tawaf).", ar: 'أكثِر منها؛ يرفع الرجال أصواتهم وتخفض النساء، حتى الوصول إلى الكعبة وبدء الطواف.', en: 'Repeat it often — aloud for men, quietly for women — until you reach the Kaaba (start of tawaf).' },
    du: [{ ar: 'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لَا شَرِيكَ لَكَ', tr: "Labbayka Allahumma labbayk, labbayka la sharika laka labbayk, innal-hamda wan-ni'mata laka wal-mulk, la sharika lak.", m: { fr: "Me voici, ô Allah, me voici. Me voici, Tu n'as pas d'associé, me voici. À Toi la louange, le bienfait et la royauté. Tu n'as pas d'associé.", ar: '', en: 'Here I am, O Allah, here I am. Here I am, You have no partner, here I am. Praise, blessing and sovereignty are Yours. You have no partner.' } }] },
  { id: 'haram', ic: '🕋',
    t: { fr: "3. Entrer dans la Mosquée Sacrée", ar: '٣. دخول المسجد الحرام', en: '3. Entering the Sacred Mosque' },
    d: { fr: "Entrez par le pied droit en invoquant. Cessez la talbiya en arrivant au tawaf.", ar: 'ادخل بالرجل اليمنى مع الدعاء، وأمسك عن التلبية عند بدء الطواف.', en: 'Enter with your right foot while making dua. Stop the talbiyah when starting tawaf.' },
    du: [{ ar: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ', tr: "Allahummaf-tah li abwaba rahmatik", m: { fr: 'Ô Allah, ouvre-moi les portes de Ta miséricorde.', ar: '', en: 'O Allah, open for me the doors of Your mercy.' } }] },
  { id: 'tawaf', ic: '🔄', counter: { key: 'tawaf', max: 7, unit: 'round' },
    t: { fr: '4. Tawaf (7 tours)', ar: '٤. الطواف (٧ أشواط)', en: '4. Tawaf (7 rounds)' },
    d: { fr: "Commencez face à la Pierre Noire (on lève la main et on dit « Allahu akbar » ; certains ajoutent « Bismillah »), la Kaaba à votre gauche, sens inverse des aiguilles d'une montre. 7 tours complets. Hommes : épaule droite découverte (idtiba') et pas rapides sur les 3 premiers tours. Entre le coin yéménite et la Pierre Noire :",
         ar: 'ابدأ من الحجر الأسود (نرفع اليد ونقول «الله أكبر»، ويزيد بعضهم «بسم الله»)، والكعبة عن يسارك، عكس عقارب الساعة، سبعة أشواط. للرجال الاضطباع والرمل في الأشواط الثلاثة الأولى. بين الركن اليماني والحجر الأسود:',
         en: "Start facing the Black Stone (raise the hand and say “Allahu akbar”; some add “Bismillah”), Kaaba on your left, anticlockwise. 7 full rounds. Men: right shoulder uncovered (idtiba') and brisk pace in the first 3 rounds. Between the Yemeni corner and the Black Stone:" },
    du: [{ ar: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', tr: "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina 'adhaban-nar", m: { fr: "Notre Seigneur, accorde-nous une belle part ici-bas et une belle part dans l'au-delà, et préserve-nous du châtiment du Feu.", ar: '', en: 'Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.' } }] },
  { id: 'maqam', ic: '🤲',
    t: { fr: '5. Prière derrière le Maqam & Zamzam', ar: '٥. صلاة ركعتين خلف المقام وزمزم', en: '5. Prayer behind the Maqam & Zamzam' },
    d: { fr: "Deux rak'as derrière le Maqam Ibrahim (ou ailleurs dans la mosquée si trop de monde) : Al-Kafirun puis Al-Ikhlas. Puis buvez de l'eau de Zamzam.", ar: 'ركعتان خلف مقام إبراهيم (أو في أي مكان من المسجد عند الزحام): الكافرون ثم الإخلاص. ثم اشرب من ماء زمزم.', en: "Two rak'ahs behind Maqam Ibrahim (or elsewhere in the mosque if crowded): Al-Kafirun then Al-Ikhlas. Then drink Zamzam water." },
    du: [{ ar: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا وَاسِعًا، وَشِفَاءً مِنْ كُلِّ دَاءٍ', tr: "Allahumma inni as'aluka 'ilman nafi'an, wa rizqan wasi'an, wa shifa'an min kulli da'", m: { fr: "Ô Allah, je Te demande une science utile, une subsistance vaste et une guérison de tout mal.", ar: '', en: 'O Allah, I ask You for beneficial knowledge, ample provision and healing from every illness.' } }] },
  { id: 'sai', ic: '🚶', counter: { key: 'sai', max: 7, unit: 'lap' },
    t: { fr: "6. Sa'i (7 trajets Safa ⇄ Marwa)", ar: '٦. السعي (٧ أشواط بين الصفا والمروة)', en: "6. Sa'i (7 laps Safa ⇄ Marwa)" },
    d: { fr: "Départ de Safa, arrivée à Marwa = 1 trajet ; fin au 7e trajet à Marwa. À l'approche de Safa récitez le verset ci-dessous, montez, faites face à la Kaaba, levez les mains, dites 3 fois « Allahu akbar » puis invoquez. Hommes : courez entre les feux verts.",
         ar: 'من الصفا إلى المروة شوط، وتنتهي عند المروة في الشوط السابع. عند الاقتراب من الصفا اقرأ الآية، وارقَ، واستقبل الكعبة، وارفع يديك، وكبّر ثلاثًا ثم ادعُ. للرجال الهرولة بين العلمين الأخضرين.',
         en: "Start at Safa; Safa→Marwa = 1 lap; finish at Marwa on the 7th lap. Approaching Safa, recite the verse below, climb up, face the Kaaba, raise your hands, say “Allahu akbar” 3 times, then make dua. Men: jog between the green lights." },
    du: [{ ar: 'إِنَّ الصَّفَا وَالْمَرْوَةَ مِن شَعَائِرِ اللَّهِ ... أَبْدَأُ بِمَا بَدَأَ اللَّهُ بِهِ', tr: "Innas-Safa wal-Marwata min sha'a'irillah ... abda'u bima bada'allahu bih", m: { fr: "Certes, Safa et Marwa sont parmi les rites d'Allah. Je commence par ce par quoi Allah a commencé.", ar: '', en: 'Indeed Safa and Marwah are among the symbols of Allah. I begin with what Allah began with.' } },
         { ar: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', tr: "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu wa huwa 'ala kulli shay'in qadir", m: { fr: "Nul dieu sauf Allah, Unique, sans associé. À Lui la royauté et la louange, et Il est capable de toute chose.", ar: '', en: 'None has the right to be worshipped but Allah alone, with no partner. His is the dominion and the praise, and He is able to do all things.' } }] },
  { id: 'halq', ic: '✂️',
    t: { fr: '7. Halq ou Taqsir', ar: '٧. الحلق أو التقصير', en: '7. Halq or Taqsir' },
    d: { fr: "Hommes : raser la tête (préférable) ou raccourcir uniformément. Femmes : couper 1 à 2 cm des pointes des cheveux (mesure indiquée par le guide officiel de Nusuk). L'Omra est alors accomplie et les interdits de l'ihram sont levés. Qu'Allah l'accepte !", ar: 'الرجال: حلق الرأس (أفضل) أو التقصير من جميع الرأس. النساء: تقصير من ١ إلى ٢ سم من أطراف الشعر (حسب دليل نسك الرسمي). وبذلك تتم العمرة ويحل الإحرام. تقبّل الله منكم!', en: "Men: shave the head (preferred) or trim evenly. Women: cut 1–2 cm from the ends of the hair (measure given in the official Nusuk guide). The Umrah is complete and ihram restrictions end. May Allah accept it!" },
    du: [] },
];

const CHECKLIST = [
  ['g_docs', ['ck_passport', 'ck_visa', 'ck_nusuk', 'ck_ticket', 'ck_hotel', 'ck_insurance', 'ck_health']],
  ['g_ihram', ['ck_ihram', 'ck_sandals', 'ck_unscented', 'ck_prayerrug', 'ck_quran']],
  ['g_bag', ['ck_clothes', 'ck_shoes', 'ck_adapter', 'ck_powerbank', 'ck_meds', 'ck_water']],
  ['g_misc', ['ck_money']],
];

const EXAMPLE_PLAN = [
  { day: 1, city: 'madinah', k: 'ex1' }, { day: 2, city: 'madinah', k: 'ex2' }, { day: 3, city: 'madinah', k: 'ex3' },
  { day: 4, city: 'makkah', k: 'ex4' }, { day: 5, city: 'makkah', k: 'ex5' }, { day: 6, city: 'makkah', k: 'ex6' },
  { day: 7, city: 'jeddah', k: 'ex7' }, { day: 8, city: 'jeddah', k: 'ex8' },
];

/* ---- Hidden Arabia : textes additionnels ---- */
Object.assign(I18N.fr, {
  nav_explore: 'Explorer', nav_plan: 'Carnet', explore_title: 'Explorer', search: 'Rechercher un lieu…', all_cities: 'Toutes les villes',
  near_me: 'Près de moi', sort_name: 'A–Z', c_sira: 'Histoire islamique', c_heritage: 'Patrimoine', c_nature: 'Nature',
  warn_unverified: "Fiches en cours de validation : aucune n'est encore vérifiée par un humain. Confirmez horaires, prix et accès avant de vous déplacer.",
  fav: 'Favori', favorites: 'Favoris', no_fav: 'Aucun favori. Ouvrez une fiche et touchez ☆.', visited: 'Visité', mark_visited: 'Marquer visité', my_note: 'Mes notes',
  videos: 'Vidéos', add_video: 'Ajouter une vidéo', video_url: 'Lien YouTube', video_title: 'Titre', video_creator: 'Créateur', video_time: 'Passage (mm:ss)', watch: 'Voir', no_video: 'Aucune vidéo liée pour le moment.',
  video_hint: "Collez un lien YouTube, le créateur et l'instant où le lieu est présenté. Citez toujours le créateur.",
  fact: 'Fait établi', trad: 'Tradition non confirmée', facts_title: 'Histoire & faits', practical: 'Infos pratiques', price: 'Prix', free: 'Gratuit', paid: 'Payant', duration: 'Durée estimée', hours: 'Horaires', access: 'Accès', tips: 'Conseils',
  min: 'min', reliability: 'Fiabilité', rel_high: 'Élevée', rel_medium: 'Moyenne', rel_low: 'Faible', verified_on: 'Vérifié le', not_verified: 'Non vérifié par un humain', sources: 'Sources', approx_coord: 'Coordonnées approximatives — à confirmer sur place.',
  taxi_name: 'Montrez ce nom au chauffeur', back: '← Retour', copy_gps: 'Copier GPS', copied: 'Copié', add_to_plan: 'Ajouter au planning', added: 'Ajouté au planning', not_found: 'Lieu introuvable',
  itin: 'Créateur d\'itinéraire', itin_hours: 'Temps disponible (heures)', itin_interests: 'Centres d\'intérêt', generate: 'Générer', itin_none: 'Aucun lieu ne rentre dans ce temps.', itin_total: 'Total estimé', itin_note: 'Trajets estimés à vol d\'oiseau (≈ 25 km/h). Vérifiez horaires et ouvertures.', add_all: 'Tout ajouter au planning',
  distance_km: 'à', no_results: 'Aucun résultat.',
});
Object.assign(I18N.en, {
  nav_explore: 'Explore', nav_plan: 'Notebook', explore_title: 'Explore', search: 'Search a place…', all_cities: 'All cities',
  near_me: 'Near me', sort_name: 'A–Z', c_sira: 'Islamic history', c_heritage: 'Heritage', c_nature: 'Nature',
  warn_unverified: 'Entries are under review: none has been human-verified yet. Confirm hours, prices and access before you go.',
  fav: 'Favourite', favorites: 'Favourites', no_fav: 'No favourites yet. Open a place and tap ☆.', visited: 'Visited', mark_visited: 'Mark visited', my_note: 'My notes',
  videos: 'Videos', add_video: 'Add a video', video_url: 'YouTube link', video_title: 'Title', video_creator: 'Creator', video_time: 'Moment (mm:ss)', watch: 'Watch', no_video: 'No video linked yet.',
  video_hint: 'Paste a YouTube link, the creator and the moment the place is shown. Always credit the creator.',
  fact: 'Established fact', trad: 'Unconfirmed tradition', facts_title: 'History & facts', practical: 'Practical info', price: 'Price', free: 'Free', paid: 'Paid', duration: 'Estimated time', hours: 'Hours', access: 'Access', tips: 'Tips',
  min: 'min', reliability: 'Reliability', rel_high: 'High', rel_medium: 'Medium', rel_low: 'Low', verified_on: 'Verified on', not_verified: 'Not human-verified', sources: 'Sources', approx_coord: 'Approximate coordinates — confirm on site.',
  taxi_name: 'Show this name to the driver', back: '← Back', copy_gps: 'Copy GPS', copied: 'Copied', add_to_plan: 'Add to plan', added: 'Added to plan', not_found: 'Place not found',
  itin: 'Itinerary builder', itin_hours: 'Time available (hours)', itin_interests: 'Interests', generate: 'Generate', itin_none: 'No place fits in that time.', itin_total: 'Estimated total', itin_note: 'Travel estimated as the crow flies (≈ 25 km/h). Check opening hours.', add_all: 'Add all to plan',
  distance_km: 'at', no_results: 'No results.',
});
Object.assign(I18N.ar, {
  nav_explore: 'استكشف', nav_plan: 'دفتري', explore_title: 'استكشف', search: 'ابحث عن مكان…', all_cities: 'كل المدن',
  near_me: 'الأقرب إليّ', sort_name: 'أ–ي', c_sira: 'التاريخ الإسلامي', c_heritage: 'التراث', c_nature: 'الطبيعة',
  warn_unverified: 'المواد قيد المراجعة: لم يتحقق منها بشريًا بعد. تأكد من المواعيد والأسعار والوصول قبل الذهاب.',
  fav: 'مفضلة', favorites: 'المفضلة', no_fav: 'لا مفضلة بعد. افتح مكانًا واضغط ☆.', visited: 'تمت الزيارة', mark_visited: 'تحديد كمزار', my_note: 'ملاحظاتي',
  videos: 'فيديوهات', add_video: 'إضافة فيديو', video_url: 'رابط يوتيوب', video_title: 'العنوان', video_creator: 'صانع المحتوى', video_time: 'اللحظة (د:ث)', watch: 'مشاهدة', no_video: 'لا فيديو مرتبط بعد.',
  video_hint: 'الصق رابط يوتيوب واسم صانع المحتوى واللحظة التي يظهر فيها المكان. اذكر صاحب المحتوى دائمًا.',
  fact: 'حقيقة ثابتة', trad: 'رواية غير مؤكدة', facts_title: 'التاريخ والحقائق', practical: 'معلومات عملية', price: 'السعر', free: 'مجاني', paid: 'مدفوع', duration: 'المدة التقديرية', hours: 'المواعيد', access: 'الوصول', tips: 'نصائح',
  min: 'د', reliability: 'الموثوقية', rel_high: 'عالية', rel_medium: 'متوسطة', rel_low: 'منخفضة', verified_on: 'تم التحقق في', not_verified: 'لم يُتحقق منه بشريًا', sources: 'المصادر', approx_coord: 'إحداثيات تقريبية — تأكد في الموقع.',
  taxi_name: 'أرِ السائق هذا الاسم', back: 'رجوع ←', copy_gps: 'نسخ الإحداثيات', copied: 'تم النسخ', add_to_plan: 'إضافة إلى البرنامج', added: 'تمت الإضافة', not_found: 'المكان غير موجود',
  itin: 'منشئ المسار', itin_hours: 'الوقت المتاح (ساعات)', itin_interests: 'الاهتمامات', generate: 'إنشاء', itin_none: 'لا يتسع الوقت لأي مكان.', itin_total: 'المجموع التقديري', itin_note: 'المسافات تقديرية بخط مستقيم (≈ ٢٥ كم/س). تحقق من أوقات الفتح.', add_all: 'إضافة الكل',
  distance_km: 'على بعد', no_results: 'لا نتائج.',
});

/* ---- Onglet Départ / Retour ---- */
Object.assign(I18N.fr, { nav_trip: 'Vols', trip_title: 'Départ / Retour', outbound: 'Aller', inbound: 'Retour', add_leg: 'Ajouter un vol (escale)', airline: 'Compagnie', flight_no: 'N° de vol', from: 'De (IATA)', to: 'Vers (IATA)', f_date: 'Date', dep_time: 'Départ', arr_time: 'Arrivée', terminal: 'Terminal', booking_ref: 'Référence de réservation', local_only: 'Stocké uniquement sur cet appareil.', track: 'Suivre le vol', no_flight: 'Aucun vol renseigné.', remove: 'Supprimer', next_flight: 'Prochain vol', leg: 'Vol', f_notes: 'Notes (bagages, siège, transfert…)' });
Object.assign(I18N.en, { nav_trip: 'Flights', trip_title: 'Outbound / Return', outbound: 'Outbound', inbound: 'Return', add_leg: 'Add a flight (connection)', airline: 'Airline', flight_no: 'Flight no.', from: 'From (IATA)', to: 'To (IATA)', f_date: 'Date', dep_time: 'Departure', arr_time: 'Arrival', terminal: 'Terminal', booking_ref: 'Booking reference', local_only: 'Stored on this device only.', track: 'Track flight', no_flight: 'No flight entered.', remove: 'Remove', next_flight: 'Next flight', leg: 'Flight', f_notes: 'Notes (baggage, seat, transfer…)' });
Object.assign(I18N.ar, { nav_trip: 'الرحلات', trip_title: 'الذهاب / العودة', outbound: 'الذهاب', inbound: 'العودة', add_leg: 'إضافة رحلة (توقف)', airline: 'شركة الطيران', flight_no: 'رقم الرحلة', from: 'من (IATA)', to: 'إلى (IATA)', f_date: 'التاريخ', dep_time: 'الإقلاع', arr_time: 'الوصول', terminal: 'الصالة', booking_ref: 'رقم الحجز', local_only: 'محفوظ على هذا الجهاز فقط.', track: 'تتبع الرحلة', no_flight: 'لم تُدخل رحلة.', remove: 'حذف', next_flight: 'الرحلة القادمة', leg: 'رحلة', f_notes: 'ملاحظات (الأمتعة، المقعد، النقل…)' });

/* ---- Sauvegarde automatique (GitHub Gist) ---- */
Object.assign(I18N.fr, {
  sync_title: 'Sauvegarde automatique', sync_off_msg: 'Non activée : vos données restent sur ce téléphone seulement.',
  sync_steps: '1. Ouvrez le lien ci-dessous (connecté à GitHub).<br>2. Laissez uniquement « gist » coché, expiration « No expiration », puis « Generate token ».<br>3. Copiez le jeton (ghp_…) et collez-le ici.<br>Gardez-le dans un gestionnaire de mots de passe : il sert à restaurer vos données après une réinstallation.',
  sync_link: 'Créer le jeton sur GitHub', token_ph: 'Collez le jeton ghp_…', sync_enable: 'Activer', sync_on: 'Sauvegarde automatique activée', last_sync: 'Dernière sauvegarde',
  sync_now: 'Sauvegarder maintenant', restore: 'Restaurer', sync_disable: 'Désactiver', sync_err: 'Échec de la synchronisation (réessai automatique).', token_bad: 'Jeton refusé par GitHub.',
  restore_confirm: 'Une sauvegarde plus récente existe. La restaurer remplacera les données de cet appareil. Restaurer ?', restored: 'Données restaurées', saved: 'Sauvegardé ✓',
  sync_excl: 'Non envoyés : références de réservation et position. Les autres données vont dans un gist privé (lien non public) de votre compte.', sync_none: 'Aucune sauvegarde trouvée.',
});
Object.assign(I18N.en, {
  sync_title: 'Automatic backup', sync_off_msg: 'Not enabled: your data stays on this phone only.',
  sync_steps: '1. Open the link below (signed in to GitHub).<br>2. Keep only “gist” ticked, expiration “No expiration”, then “Generate token”.<br>3. Copy the token (ghp_…) and paste it here.<br>Keep it in a password manager: it restores your data after a reinstall.',
  sync_link: 'Create the token on GitHub', token_ph: 'Paste the ghp_… token', sync_enable: 'Enable', sync_on: 'Automatic backup enabled', last_sync: 'Last backup',
  sync_now: 'Back up now', restore: 'Restore', sync_disable: 'Disable', sync_err: 'Sync failed (will retry automatically).', token_bad: 'Token rejected by GitHub.',
  restore_confirm: 'A newer backup exists. Restoring will replace this device\'s data. Restore?', restored: 'Data restored', saved: 'Saved ✓',
  sync_excl: 'Not sent: booking references and location. Everything else goes to a private (unlisted) gist in your account.', sync_none: 'No backup found.',
});
Object.assign(I18N.ar, {
  sync_title: 'النسخ الاحتياطي التلقائي', sync_off_msg: 'غير مفعّل: بياناتك على هذا الهاتف فقط.',
  sync_steps: '١. افتح الرابط أدناه (وأنت مسجّل في GitHub).<br>٢. اترك «gist» فقط محددًا، والصلاحية «No expiration»، ثم «Generate token».<br>٣. انسخ الرمز (ghp_…) والصقه هنا.<br>احفظه في مدير كلمات المرور: يُستخدم لاستعادة بياناتك بعد إعادة التثبيت.',
  sync_link: 'إنشاء الرمز في GitHub', token_ph: 'الصق الرمز ghp_…', sync_enable: 'تفعيل', sync_on: 'النسخ التلقائي مفعّل', last_sync: 'آخر نسخة',
  sync_now: 'احفظ الآن', restore: 'استعادة', sync_disable: 'إيقاف', sync_err: 'فشلت المزامنة (ستعاد المحاولة تلقائيًا).', token_bad: 'رفض GitHub الرمز.',
  restore_confirm: 'توجد نسخة أحدث. الاستعادة ستستبدل بيانات هذا الجهاز. استعادة؟', restored: 'تمت الاستعادة', saved: 'تم الحفظ ✓',
  sync_excl: 'لا تُرسل: أرقام الحجز والموقع. بقية البيانات تُحفظ في gist خاص (غير معلن) في حسابك.', sync_none: 'لا توجد نسخة.',
});

/* ---- Départ / Retour simplifié ---- */
Object.assign(I18N.fr, {
  step_route: '1. Trajet et dates', step_flights: '2. Vos vols', from_lbl: 'Départ de', to_lbl: 'Destination', depart_date: 'Date de départ', return_date: 'Date de retour',
  err_return: 'La date de retour doit être après la date de départ.', warn_past: 'Cette date est déjà passée.', nights: 'nuits', other_return: 'Retour depuis / vers un autre aéroport ?', ret_from: 'Retour depuis', ret_to: 'Retour vers',
  find_flights: 'Pas encore de vol ? Cherchez les vols pour ces dates :', have_flight: 'Déjà réservé ? Indiquez le numéro de vol et/ou la réservation :',
  no_out: 'N° de vol aller', no_ret: 'N° de vol retour', times_opt: 'Horaires (facultatif)', saved_auto: 'Enregistré automatiquement', pick_dates: 'Choisissez d\'abord vos dates pour continuer.', open_search: 'Ouvrir',
});
Object.assign(I18N.en, {
  step_route: '1. Route and dates', step_flights: '2. Your flights', from_lbl: 'Departing from', to_lbl: 'Destination', depart_date: 'Departure date', return_date: 'Return date',
  err_return: 'The return date must be after the departure date.', warn_past: 'This date is already past.', nights: 'nights', other_return: 'Return from / to a different airport?', ret_from: 'Return from', ret_to: 'Return to',
  find_flights: 'No flight yet? Search flights for these dates:', have_flight: 'Already booked? Enter the flight number and/or booking:',
  no_out: 'Outbound flight no.', no_ret: 'Return flight no.', times_opt: 'Times (optional)', saved_auto: 'Saved automatically', pick_dates: 'Pick your dates first to continue.', open_search: 'Open',
});
Object.assign(I18N.ar, {
  step_route: '١. المسار والتواريخ', step_flights: '٢. رحلاتك', from_lbl: 'المغادرة من', to_lbl: 'الوجهة', depart_date: 'تاريخ المغادرة', return_date: 'تاريخ العودة',
  err_return: 'يجب أن يكون تاريخ العودة بعد تاريخ المغادرة.', warn_past: 'هذا التاريخ مضى بالفعل.', nights: 'ليالٍ', other_return: 'العودة من/إلى مطار آخر؟', ret_from: 'العودة من', ret_to: 'العودة إلى',
  find_flights: 'لا رحلة بعد؟ ابحث عن رحلات لهذه التواريخ:', have_flight: 'حجزت بالفعل؟ أدخل رقم الرحلة و/أو الحجز:',
  no_out: 'رقم رحلة الذهاب', no_ret: 'رقم رحلة العودة', times_opt: 'المواعيد (اختياري)', saved_auto: 'يُحفظ تلقائيًا', pick_dates: 'اختر التواريخ أولًا للمتابعة.', open_search: 'فتح',
});

Object.assign(I18N.fr, { reset_dates: '↺ Effacer les dates', reset_all: 'Tout réinitialiser', confirm_reset_all: 'Effacer le trajet, les dates, les numéros de vol et la réservation ?' });
Object.assign(I18N.en, { reset_dates: '↺ Clear dates', reset_all: 'Reset everything', confirm_reset_all: 'Clear the route, dates, flight numbers and booking?' });
Object.assign(I18N.ar, { reset_dates: '↺ مسح التواريخ', reset_all: 'إعادة ضبط الكل', confirm_reset_all: 'مسح المسار والتواريخ وأرقام الرحلات والحجز؟' });

Object.assign(I18N.fr, { step_route: '1. Vos dates', airports_opt: 'Aéroports et horaires (facultatif)', airports_hint: "Pas nécessaire : l'aéroport se retrouve avec le numéro de vol ou la réservation. Utile seulement pour comparer les vols.", have_flight: 'Numéro de vol et/ou référence de réservation :', find_flights: 'Pas encore de vol ? Cherchez les vols de ces dates :' });
Object.assign(I18N.en, { step_route: '1. Your dates', airports_opt: 'Airports and times (optional)', airports_hint: 'Not required: the airport can be found from the flight number or booking. Only useful to compare flights.', have_flight: 'Flight number and/or booking reference:', find_flights: 'No flight yet? Search flights for these dates:' });
Object.assign(I18N.ar, { step_route: '١. تواريخك', airports_opt: 'المطارات والمواعيد (اختياري)', airports_hint: 'غير مطلوب: يمكن معرفة المطار من رقم الرحلة أو الحجز. مفيد فقط لمقارنة الرحلات.', have_flight: 'رقم الرحلة و/أو رقم الحجز:', find_flights: 'لا رحلة بعد؟ ابحث عن رحلات لهذه التواريخ:' });

Object.assign(I18N.fr, { cal_start: '👆 Touchez votre date de départ.', cal_end: '👆 Touchez maintenant votre date de retour.', cal_again: 'Touchez une autre date pour recommencer.' });
Object.assign(I18N.en, { cal_start: '👆 Tap your departure date.', cal_end: '👆 Now tap your return date.', cal_again: 'Tap another date to start over.' });
Object.assign(I18N.ar, { cal_start: '👆 المس تاريخ المغادرة.', cal_end: '👆 والآن المس تاريخ العودة.', cal_again: 'المس تاريخًا آخر للبدء من جديد.' });

Object.assign(I18N.fr, { validate_dates: 'Valider les dates', edit_dates: 'Modifier les dates', cancel: 'Annuler', dates_ok: 'Dates validées ✓' });
Object.assign(I18N.en, { validate_dates: 'Confirm dates', edit_dates: 'Edit dates', cancel: 'Cancel', dates_ok: 'Dates confirmed ✓' });
Object.assign(I18N.ar, { validate_dates: 'تأكيد التواريخ', edit_dates: 'تعديل التواريخ', cancel: 'إلغاء', dates_ok: 'تم تأكيد التواريخ ✓' });

/* ---- Onglet Vols : expérience « appli de compagnie » ---- */
Object.assign(I18N.fr, { my_trip: 'Mon voyage', flights_h: 'Mes vols', dates_h: 'Dates', save_trip: 'Enregistrer mon voyage', edit_trip: 'Modifier le voyage', delete_trip: 'Supprimer', confirm_delete_trip: 'Supprimer ce voyage (vols, dates, réservation) ?',
  details: 'Détails', flight_info: 'Infos du vol', add_flight_no: 'Ajouter le numéro de vol', done_btn: 'OK', past_lbl: 'Passé', search_hint: 'Pas encore de vol ? Voir les vols pour ces dates', flight_no: 'N° de vol' });
Object.assign(I18N.en, { my_trip: 'My trip', flights_h: 'My flights', dates_h: 'Dates', save_trip: 'Save my trip', edit_trip: 'Edit trip', delete_trip: 'Delete', confirm_delete_trip: 'Delete this trip (flights, dates, booking)?',
  details: 'Details', flight_info: 'Flight info', add_flight_no: 'Add flight number', done_btn: 'OK', past_lbl: 'Past', search_hint: 'No flight yet? See flights for these dates', flight_no: 'Flight no.' });
Object.assign(I18N.ar, { my_trip: 'رحلتي', flights_h: 'رحلاتي', dates_h: 'التواريخ', save_trip: 'حفظ رحلتي', edit_trip: 'تعديل الرحلة', delete_trip: 'حذف', confirm_delete_trip: 'حذف هذه الرحلة (الرحلات والتواريخ والحجز)؟',
  details: 'التفاصيل', flight_info: 'معلومات الرحلة', add_flight_no: 'إضافة رقم الرحلة', done_btn: 'تم', past_lbl: 'انتهت', search_hint: 'لا رحلة بعد؟ شاهد الرحلات لهذه التواريخ', flight_no: 'رقم الرحلة' });

/* ---- Parcours guidé : « Avez-vous déjà votre billet ? » ---- */
Object.assign(I18N.fr, { ask_title: 'Avez-vous déjà votre billet ?', ask_sub: "Le numéro de vol se trouve sur votre billet ou dans l'e-mail de confirmation.", yes_ticket: "✅ Oui, j'ai mon billet", no_ticket: '🔍 Non, pas encore',
  ticket_title: 'Votre billet', ticket_hint: 'Saisissez le numéro de vol (ex. SV 124). Vous pouvez laisser un champ vide.', dates_title: 'Vos dates de voyage', step_word: 'Étape', next: 'Suivant',
  search_after: 'Une fois le vol réservé, revenez ici ajouter le numéro de vol depuis la carte.' });
Object.assign(I18N.en, { ask_title: 'Do you already have your ticket?', ask_sub: 'The flight number is on your ticket or in the confirmation email.', yes_ticket: '✅ Yes, I have my ticket', no_ticket: '🔍 Not yet',
  ticket_title: 'Your ticket', ticket_hint: 'Enter the flight number (e.g. SV 124). You may leave a field empty.', dates_title: 'Your travel dates', step_word: 'Step', next: 'Next',
  search_after: 'Once booked, come back and add the flight number from the card.' });
Object.assign(I18N.ar, { ask_title: 'هل لديك تذكرتك بالفعل؟', ask_sub: 'رقم الرحلة موجود على التذكرة أو في رسالة التأكيد.', yes_ticket: '✅ نعم، لدي تذكرتي', no_ticket: '🔍 ليس بعد',
  ticket_title: 'تذكرتك', ticket_hint: 'أدخل رقم الرحلة (مثل SV 124). يمكنك ترك حقل فارغًا.', dates_title: 'تواريخ سفرك', step_word: 'الخطوة', next: 'التالي',
  search_after: 'بعد الحجز، عد وأضف رقم الرحلة من البطاقة.' });

Object.assign(I18N.fr, { flight_fmt: 'Format attendu : 2 lettres + chiffres (ex. SV 124).', ticket_hint: 'Indiquez le numéro de vol ALLER et RETOUR (champs obligatoires), puis vos dates à l\'étape suivante.' });
Object.assign(I18N.en, { flight_fmt: 'Expected format: 2 letters + digits (e.g. SV 124).', ticket_hint: 'Enter the OUTBOUND and RETURN flight numbers (required), then your dates on the next step.' });
Object.assign(I18N.ar, { flight_fmt: 'الصيغة المتوقعة: حرفان + أرقام (مثل SV 124).', ticket_hint: 'أدخل رقم رحلة الذهاب والعودة (إلزامي)، ثم تواريخك في الخطوة التالية.' });

/* ---- Vols : dates puis vols, lien compagnie ---- */
Object.assign(I18N.fr, { flights_for_dates: 'Le numéro de vol doit correspondre à la date affichée : touchez « Vérifier » pour contrôler.', verify_flight: 'Vérifier ce vol à cette date', airline_link: "Lien de l'app ou du site de la compagnie (facultatif)",
  airline_app: 'App de la compagnie', no_ticket_yet: "Pas encore de billet : enregistrer seulement les dates", dates_changed_warn: 'Vous avez changé les dates : vérifiez que ces vols partent bien aux nouvelles dates.', flights_h: 'Vos vols' });
Object.assign(I18N.en, { flights_for_dates: 'The flight number must match the date shown: tap “Verify” to check.', verify_flight: 'Verify this flight on this date', airline_link: "Link to the airline's app or website (optional)",
  airline_app: 'Airline app', no_ticket_yet: 'No ticket yet: save the dates only', dates_changed_warn: 'You changed the dates: check that these flights operate on the new dates.', flights_h: 'Your flights' });
Object.assign(I18N.ar, { flights_for_dates: 'يجب أن يطابق رقم الرحلة التاريخ المعروض: المس «تحقق» للتأكد.', verify_flight: 'تحقق من هذه الرحلة في هذا التاريخ', airline_link: 'رابط تطبيق أو موقع شركة الطيران (اختياري)',
  airline_app: 'تطبيق الشركة', no_ticket_yet: 'لا تذكرة بعد: احفظ التواريخ فقط', dates_changed_warn: 'غيّرت التواريخ: تأكد أن هذه الرحلات تعمل في التواريخ الجديدة.', flights_h: 'رحلاتك' });

/* ---- Carte : français, GPS, itinéraires ---- */
Object.assign(I18N.fr, { follow_me: 'Ma position', route_btn: 'Itinéraire', route_drive: 'en voiture', route_walk: 'à pied, estimation', route_err: 'Itinéraire indisponible pour le moment. Utilisez Google Maps ou Plans.',
  route_far: 'Vous êtes à', route_crow: "à vol d'oiseau : l'itinéraire routier sera disponible une fois sur place. Utilisez Google Maps ou Plans.", map_layer_fr: 'Plan (français)', map_layer_local: 'Plan (noms locaux)', map_layer_sat: 'Satellite' });
Object.assign(I18N.en, { follow_me: 'My position', route_btn: 'Route', route_drive: 'by car', route_walk: 'on foot, estimate', route_err: 'Route unavailable right now. Use Google Maps or Apple Maps.',
  route_far: 'You are', route_crow: 'away as the crow flies: the road route will be available once you are there. Use Google Maps or Apple Maps.', map_layer_fr: 'Map (Latin names)', map_layer_local: 'Map (local names)', map_layer_sat: 'Satellite' });
Object.assign(I18N.ar, { follow_me: 'موقعي', route_btn: 'المسار', route_drive: 'بالسيارة', route_walk: 'سيرًا، تقدير', route_err: 'المسار غير متاح الآن. استخدم خرائط Google أو Apple.',
  route_far: 'أنت على بعد', route_crow: 'بخط مستقيم: سيتوفر المسار البري عند وصولك. استخدم خرائط Google أو Apple.', map_layer_fr: 'خريطة (أسماء لاتينية)', map_layer_local: 'خريطة (أسماء محلية)', map_layer_sat: 'قمر صناعي' });
Object.assign(I18N.fr, { route_walk_real: 'à pied' });
Object.assign(I18N.en, { route_walk_real: 'on foot' });
Object.assign(I18N.ar, { route_walk_real: 'سيرًا' });

/* ---- Langue / style de la carte ---- */
Object.assign(I18N.fr, { map_lang_label: 'Langue de la carte', map_style_label: 'Fond', ml_local: 'Noms locaux', base_plan: 'Plan', base_sat: 'Satellite' });
Object.assign(I18N.en, { map_lang_label: 'Map language', map_style_label: 'Style', ml_local: 'Local names', base_plan: 'Map', base_sat: 'Satellite' });
Object.assign(I18N.ar, { map_lang_label: 'لغة الخريطة', map_style_label: 'النمط', ml_local: 'الأسماء المحلية', base_plan: 'خريطة', base_sat: 'قمر صناعي' });

/* ---- Route du vol trouvée d'après le numéro ---- */
Object.assign(I18N.fr, { route_usual: 'route habituelle de ce vol', route_loading: 'Recherche de la route…', route_unknown: "Route introuvable pour ce vol : renseignez les aéroports dans « Détails ».", route_not_gva: 'Ce vol part habituellement de {city}, pas de Genève.' });
Object.assign(I18N.en, { route_usual: 'usual route of this flight', route_loading: 'Looking up the route…', route_unknown: 'Route not found for this flight: enter the airports in “Details”.', route_not_gva: 'This flight usually departs from {city}, not Geneva.' });
Object.assign(I18N.ar, { route_usual: 'المسار المعتاد لهذه الرحلة', route_loading: 'جارٍ البحث عن المسار…', route_unknown: 'لم يُعثر على مسار هذه الرحلة: أدخل المطارات في «التفاصيل».', route_not_gva: 'تقلع هذه الرحلة عادة من {city} وليس من جنيف.' });

/* ---- Onglet Logement ---- */
Object.assign(I18N.fr, { nav_stay: 'Logement', stay_title: 'Logement', stay_empty: 'Pas encore de logement', stay_empty_sub: "Ajoutez-le dès que vous l'aurez réservé, ou notez un « à réserver » en attendant.",
  add_stay: 'Ajouter un logement', st_edit: 'Modifier le logement', st_city: 'Ville', st_other_city: 'Autre ville', st_name: "Nom de l'hôtel / logement", st_name_ph: 'ex. Hôtel près du Haram', st_noname: 'Logement sans nom',
  st_todo: 'À réserver', st_booked: 'Réservé', st_in: 'Arrivée', st_out: 'Départ', st_addr: 'Adresse', st_link: 'Lien de la réservation ou de la plateforme (facultatif)', st_price: 'Prix total', st_phone: 'Téléphone', st_notes: 'Notes (petit-déjeuner, étage, navette…)',
  st_nodates_hint: "Pour choisir les nuits, renseignez d'abord vos dates dans l'onglet Vols.", st_call: 'Appeler', st_open_booking: 'Réservation', st_search: 'Chercher un hôtel', st_uncovered: 'nuit(s) sans logement', st_all_covered: 'Toutes les nuits sont logées',
  st_delete_confirm: 'Supprimer ce logement ?' });
Object.assign(I18N.en, { nav_stay: 'Stay', stay_title: 'Accommodation', stay_empty: 'No accommodation yet', stay_empty_sub: 'Add it once booked, or note a “to book” in the meantime.',
  add_stay: 'Add accommodation', st_edit: 'Edit accommodation', st_city: 'City', st_other_city: 'Other city', st_name: 'Hotel / place name', st_name_ph: 'e.g. Hotel near the Haram', st_noname: 'Unnamed accommodation',
  st_todo: 'To book', st_booked: 'Booked', st_in: 'Check-in', st_out: 'Check-out', st_addr: 'Address', st_link: 'Booking or platform link (optional)', st_price: 'Total price', st_phone: 'Phone', st_notes: 'Notes (breakfast, floor, shuttle…)',
  st_nodates_hint: 'To pick the nights, first enter your dates in the Flights tab.', st_call: 'Call', st_open_booking: 'Booking', st_search: 'Find a hotel', st_uncovered: 'night(s) without accommodation', st_all_covered: 'All nights are covered',
  st_delete_confirm: 'Delete this accommodation?' });
Object.assign(I18N.ar, { nav_stay: 'الإقامة', stay_title: 'الإقامة', stay_empty: 'لا إقامة بعد', stay_empty_sub: 'أضفها عند الحجز، أو دوّن «للحجز» في الوقت الحالي.',
  add_stay: 'إضافة إقامة', st_edit: 'تعديل الإقامة', st_city: 'المدينة', st_other_city: 'مدينة أخرى', st_name: 'اسم الفندق / المسكن', st_name_ph: 'مثال: فندق قرب الحرم', st_noname: 'إقامة بلا اسم',
  st_todo: 'للحجز', st_booked: 'تم الحجز', st_in: 'الوصول', st_out: 'المغادرة', st_addr: 'العنوان', st_link: 'رابط الحجز أو المنصة (اختياري)', st_price: 'السعر الإجمالي', st_phone: 'الهاتف', st_notes: 'ملاحظات (الإفطار، الطابق، الحافلة…)',
  st_nodates_hint: 'لاختيار الليالي، أدخل تواريخك أولًا في تبويب الرحلات.', st_call: 'اتصال', st_open_booking: 'الحجز', st_search: 'ابحث عن فندق', st_uncovered: 'ليلة بلا إقامة', st_all_covered: 'كل الليالي مغطاة',
  st_delete_confirm: 'حذف هذه الإقامة؟' });

Object.assign(I18N.fr, { see_time: "voir l'heure ↗", import_ask: 'Importer ces informations de vol dans votre voyage ?' });
Object.assign(I18N.en, { see_time: 'see time ↗', import_ask: 'Import this flight information into your trip?' });
Object.assign(I18N.ar, { see_time: 'عرض الوقت ↗', import_ask: 'استيراد معلومات الرحلة هذه إلى رحلتك؟' });

/* ---- Import depuis un billet / e-mail ---- */
Object.assign(I18N.fr, { imp_btn: 'Importer depuis mon billet / e-mail', imp_btn_complete: 'Importer / compléter depuis mon billet', imp_title: 'Importer mon billet',
  imp_hint: "Collez le texte de votre e-mail ou billet de confirmation, ou choisissez une capture. Astuce iPhone : sur la capture, appuyez longuement sur le texte puis « Copier ». Tout est lu sur votre téléphone, rien n'est envoyé.",
  imp_placeholder: "Collez ici le texte de la confirmation…\n(masquez votre nom et votre numéro de réservation si vous le souhaitez : ils ne servent pas)", imp_analyze: 'Analyser', imp_pick: 'Choisir une capture', imp_reading: 'Lecture en cours…',
  imp_none: "Aucun vol reconnu. Vérifiez que le texte contient les numéros de vol (ex. SV 126), les dates et les heures.", imp_found: 'vol(s) reconnu(s)', imp_check: 'Vérifiez et indiquez lequel est l\'aller et le retour :', imp_ignore: 'Ignorer',
  imp_apply: 'Appliquer à mon voyage', imp_ocr_fail: "Lecture de l'image impossible : collez plutôt le texte (iPhone : appui long sur le texte de la capture → Copier).", imp_pick_role: "Choisissez au moins l'aller ou le retour.", imp_no_date: 'Date manquante pour ce vol : complétez-la dans le texte.' });
Object.assign(I18N.en, { imp_btn: 'Import from my ticket / email', imp_btn_complete: 'Import / complete from my ticket', imp_title: 'Import my ticket',
  imp_hint: 'Paste the text of your confirmation email or ticket, or choose a screenshot. iPhone tip: on the screenshot, long-press the text then “Copy”. Everything is read on your phone; nothing is sent.',
  imp_placeholder: 'Paste the confirmation text here…\n(you may hide your name and booking reference: they are not needed)', imp_analyze: 'Analyze', imp_pick: 'Choose a screenshot', imp_reading: 'Reading…',
  imp_none: 'No flight recognized. Check the text contains flight numbers (e.g. SV 126), dates and times.', imp_found: 'flight(s) found', imp_check: 'Check and say which is outbound and return:', imp_ignore: 'Ignore',
  imp_apply: 'Apply to my trip', imp_ocr_fail: 'Could not read the image: paste the text instead (iPhone: long-press the text in the screenshot → Copy).', imp_pick_role: 'Choose at least the outbound or the return.', imp_no_date: 'Date missing for this flight: complete it in the text.' });
Object.assign(I18N.ar, { imp_btn: 'استيراد من تذكرتي / بريدي', imp_btn_complete: 'استيراد / إكمال من تذكرتي', imp_title: 'استيراد تذكرتي',
  imp_hint: 'الصق نص بريد التأكيد أو التذكرة، أو اختر لقطة شاشة. نصيحة آيفون: على اللقطة اضغط مطولًا على النص ثم «نسخ». كل شيء يُقرأ على هاتفك ولا يُرسل شيء.',
  imp_placeholder: 'الصق نص التأكيد هنا…\n(يمكنك إخفاء اسمك ورقم الحجز: لا حاجة إليهما)', imp_analyze: 'تحليل', imp_pick: 'اختيار لقطة شاشة', imp_reading: 'جارٍ القراءة…',
  imp_none: 'لم يُتعرَّف على أي رحلة. تأكد أن النص يحتوي أرقام الرحلات (مثل SV 126) والتواريخ والأوقات.', imp_found: 'رحلة مُتعرَّف عليها', imp_check: 'تحقق وحدّد الذهاب والعودة:', imp_ignore: 'تجاهل',
  imp_apply: 'تطبيق على رحلتي', imp_ocr_fail: 'تعذرت قراءة الصورة: الصق النص بدلًا من ذلك (آيفون: اضغط مطولًا على النص في اللقطة ← نسخ).', imp_pick_role: 'اختر الذهاب أو العودة على الأقل.', imp_no_date: 'التاريخ ناقص لهذه الرحلة: أكمله في النص.' });

Object.assign(I18N.fr, { imp_pick: 'Choisir la capture, la photo ou le PDF du billet', imp_paste: 'Ou coller le texte à la place', imp_pdf_fail: "Ce PDF ne contient pas de texte lisible (billet scanné ?). Prenez-le en capture d'écran ou en photo.",
  imp_hint: "Choisissez la capture d'écran, la photo ou le PDF de votre billet : l'appli le lit toute seule (inutile de copier-coller). Vérifiez ensuite les dates et heures, corrigeables d'un toucher. Tout est lu sur votre téléphone, rien n'est envoyé.",
  imp_check: "Vérifiez : touchez la bonne date, corrigez une heure si besoin, puis indiquez l'aller et le retour :" });
Object.assign(I18N.en, { imp_pick: 'Choose the screenshot, photo or PDF of the ticket', imp_paste: 'Or paste the text instead', imp_pdf_fail: 'This PDF has no readable text (scanned ticket?). Take a screenshot or photo of it.',
  imp_hint: 'Choose the screenshot, photo or PDF of your ticket: the app reads it by itself (no copy-paste needed). Then check the dates and times, fixable with a tap. Everything is read on your phone; nothing is sent.',
  imp_check: 'Check: tap the right date, fix a time if needed, then say which is outbound and return:' });
Object.assign(I18N.ar, { imp_pick: 'اختر لقطة الشاشة أو الصورة أو PDF للتذكرة', imp_paste: 'أو الصق النص بدلًا من ذلك', imp_pdf_fail: 'لا يحتوي هذا PDF على نص مقروء (تذكرة ممسوحة؟). التقط لقطة شاشة أو صورة.',
  imp_hint: 'اختر لقطة الشاشة أو الصورة أو PDF لتذكرتك: يقرؤها التطبيق وحده (دون نسخ ولصق). ثم تحقق من التواريخ والأوقات وصحّحها بلمسة. كل شيء يُقرأ على هاتفك ولا يُرسل شيء.',
  imp_check: 'تحقق: المس التاريخ الصحيح وصحّح الوقت عند الحاجة، ثم حدّد الذهاب والعودة:' });

Object.assign(I18N.fr, { imp_paste: 'Texte lu (corrigeable) — ou coller un texte' });
Object.assign(I18N.en, { imp_paste: 'Text read (editable) — or paste a text' });
Object.assign(I18N.ar, { imp_paste: 'النص المقروء (قابل للتعديل) — أو الصق نصًا' });

/* ---- Explorer unifié : ville, type, position activable ---- */
Object.assign(I18N.fr, { ex_all_cities: 'Toutes les villes', ex_type_all: 'Tout', ex_type_places: 'Lieux à visiter', ex_type_finds: 'Bons plans et découvertes', ex_results: 'résultat(s)',
  pos_on: 'Position activée', pos_off: 'Position désactivée', pos_hint_off: "Activez-la pour voir votre point sur la carte et les distances. Désactivée, la carte montre les lieux.", pos_active: 'Position active : distances affichées pour les lieux proches.',
  pos_far: "Vous êtes à {km} km de l'Arabie saoudite : la carte reste sur les lieux et les distances sont masquées.", disc_verified: 'Vérifié', disc_pending: 'À vérifier', disc_video: 'Vidéo / source' });
Object.assign(I18N.en, { ex_all_cities: 'All cities', ex_type_all: 'All', ex_type_places: 'Places to visit', ex_type_finds: 'Local finds and tips', ex_results: 'result(s)',
  pos_on: 'Location on', pos_off: 'Location off', pos_hint_off: 'Turn it on to see your dot on the map and distances. When off, the map shows the places.', pos_active: 'Location on: distances shown for nearby places.',
  pos_far: 'You are {km} km from Saudi Arabia: the map stays on the places and distances are hidden.', disc_verified: 'Verified', disc_pending: 'To verify', disc_video: 'Video / source' });
Object.assign(I18N.ar, { ex_all_cities: 'كل المدن', ex_type_all: 'الكل', ex_type_places: 'أماكن للزيارة', ex_type_finds: 'أماكن مميزة ونصائح', ex_results: 'نتيجة',
  pos_on: 'الموقع مفعّل', pos_off: 'الموقع متوقف', pos_hint_off: 'فعّله لرؤية موقعك على الخريطة والمسافات. وهو متوقف تعرض الخريطة الأماكن.', pos_active: 'الموقع مفعّل: تظهر المسافات للأماكن القريبة.',
  pos_far: 'أنت على بعد {km} كم من السعودية: تبقى الخريطة على الأماكن وتُخفى المسافات.', disc_verified: 'تم التحقق', disc_pending: 'يحتاج إلى تحقق', disc_video: 'فيديو / مصدر' });
Object.assign(I18N.fr, { map_settings: 'Réglages de la carte (langue, fond)' });
Object.assign(I18N.en, { map_settings: 'Map settings (language, style)' });
Object.assign(I18N.ar, { map_settings: 'إعدادات الخريطة (اللغة، النمط)' });

Object.assign(I18N.fr, { map_settings_short: 'Réglages de la carte' });
Object.assign(I18N.en, { map_settings_short: 'Map settings' });
Object.assign(I18N.ar, { map_settings_short: 'إعدادات الخريطة' });

Object.assign(I18N.fr, { ex_tab_places: 'Lieux', ex_more: 'Voir plus' });
Object.assign(I18N.en, { ex_tab_places: 'Places', ex_more: 'Show more' });
Object.assign(I18N.ar, { ex_tab_places: 'أماكن', ex_more: 'عرض المزيد' });

/* ---- Explorer : cartes 2 colonnes + fiche détaillée à onglets ---- */
Object.assign(I18N.fr, { sh_info: 'Infos', sh_practical: 'Pratique', sh_sources: 'Vidéos et sources', sh_category: 'Catégorie', sh_official: 'Site officiel', sh_loc_unverified: 'adresse non confirmée', sh_full: 'Fiche complète' });
Object.assign(I18N.en, { sh_info: 'Info', sh_practical: 'Practical', sh_sources: 'Videos & sources', sh_category: 'Category', sh_official: 'Official site', sh_loc_unverified: 'address not confirmed', sh_full: 'Full page' });
Object.assign(I18N.ar, { sh_info: 'معلومات', sh_practical: 'عملي', sh_sources: 'فيديوهات ومصادر', sh_category: 'الفئة', sh_official: 'الموقع الرسمي', sh_loc_unverified: 'العنوان غير مؤكد', sh_full: 'الصفحة الكاملة' });

/* ---- Carte interactive des lieux saints ---- */
Object.assign(I18N.fr, { holy_title: 'Carte interactive des lieux saints', holy_sub: 'Portes, lieux des rites, Safa et Marwa, miqats. Touchez un repère ou une carte.', holy_gates: 'Portes', holy_rites: 'Lieux des rites', holy_sai: "Sa'i", holy_services: 'Services', holy_visit: 'À proximité', holy_miqats: 'Miqats',
  holy_see_map: 'Voir sur la carte', holy_plan: 'Plan', holy_sat: 'Satellite', holy_women: 'Entrée réservée aux femmes', holy_approx: 'Position approximative', holy_fail: 'Données indisponibles hors connexion lors du premier chargement.',
  holy_note: "Positions : © contributeurs OpenStreetMap ; elles peuvent changer avec les travaux d'extension. Rappels pratiques : pour tout avis religieux, consultez un savant." });
Object.assign(I18N.en, { holy_title: 'Interactive map of the holy sites', holy_sub: 'Gates, ritual spots, Safa and Marwa, miqats. Tap a marker or a card.', holy_gates: 'Gates', holy_rites: 'Ritual spots', holy_sai: "Sa'i", holy_services: 'Services', holy_visit: 'Nearby', holy_miqats: 'Miqats',
  holy_see_map: 'See on the map', holy_plan: 'Map', holy_sat: 'Satellite', holy_women: "Women's entrance", holy_approx: 'Approximate position', holy_fail: 'Data unavailable offline on the first load.',
  holy_note: 'Positions: © OpenStreetMap contributors; they may change with expansion works. Practical reminders only: for any ruling, consult a scholar.' });
Object.assign(I18N.ar, { holy_title: 'خريطة تفاعلية للمشاعر المقدسة', holy_sub: 'الأبواب ومواضع المناسك والصفا والمروة والمواقيت. المس علامة أو بطاقة.', holy_gates: 'الأبواب', holy_rites: 'مواضع المناسك', holy_sai: 'السعي', holy_services: 'خدمات', holy_visit: 'قريب', holy_miqats: 'المواقيت',
  holy_see_map: 'عرض على الخريطة', holy_plan: 'خريطة', holy_sat: 'قمر صناعي', holy_women: 'مدخل النساء', holy_approx: 'موقع تقريبي', holy_fail: 'البيانات غير متاحة دون اتصال في التحميل الأول.',
  holy_note: 'المواقع: © المساهمون في OpenStreetMap؛ قد تتغير مع أعمال التوسعة. تذكيرات عملية فقط: لأي حكم شرعي راجع أهل العلم.' });

/* ---- Sources officielles ---- */
Object.assign(I18N.fr, { off_title: 'Sources officielles', off_note: "Le guide officiel de l'Omra de Nusuk a été lu pour vérifier les étapes de cet onglet. Les autres pages ont refusé la lecture automatique : consultez-les vous-même ou dans l'application Nusuk, car permis et modalités changent.",
  off_guide: "Guide officiel de l'Omra (Nusuk)", off_nusuk: 'Nusuk, plateforme officielle Hajj et Omra', off_permit: 'Permis Omra (service du gouvernement saoudien)', off_rawdah: 'Permis de visite de la Rawdah (service officiel)', off_v_haram: 'Visit Saudi : Masjid al-Haram', off_v_nabawi: 'Visit Saudi : Masjid an-Nabawi',
  holy_note: "Positions : © contributeurs OpenStreetMap ; elles peuvent changer avec les travaux d'extension. La numérotation des portes vient d'OpenStreetMap et n'a pas pu être confirmée par une liste officielle. Rappels pratiques : pour tout avis religieux, consultez un savant." });
Object.assign(I18N.en, { off_title: 'Official sources', off_note: "The official Nusuk Umrah guide was read to check this tab's steps. The other pages refused automated reading: check them yourself or in the Nusuk app, as permits and rules change.",
  off_guide: 'Official Umrah guide (Nusuk)', off_nusuk: 'Nusuk, the official Hajj and Umrah platform', off_permit: 'Umrah permit (Saudi government service)', off_rawdah: 'Rawdah visit permit (official service)', off_v_haram: 'Visit Saudi: Masjid al-Haram', off_v_nabawi: 'Visit Saudi: Masjid an-Nabawi',
  holy_note: 'Positions: © OpenStreetMap contributors; they may change with expansion works. Gate numbering comes from OpenStreetMap and could not be confirmed against an official list. Practical reminders only: for any ruling, consult a scholar.' });
Object.assign(I18N.ar, { off_title: 'المصادر الرسمية', off_note: 'قُرئ دليل العمرة الرسمي من نسك للتحقق من خطوات هذا التبويب. رفضت الصفحات الأخرى القراءة الآلية: راجعها بنفسك أو في تطبيق نسك لأن التصاريح والشروط تتغير.',
  off_guide: 'دليل العمرة الرسمي (نسك)', off_nusuk: 'نسك، المنصة الرسمية للحج والعمرة', off_permit: 'تصريح العمرة (خدمة حكومية)', off_rawdah: 'تصريح زيارة الروضة (خدمة رسمية)', off_v_haram: 'زوروا السعودية: المسجد الحرام', off_v_nabawi: 'زوروا السعودية: المسجد النبوي',
  holy_note: 'المواقع: © المساهمون في OpenStreetMap؛ قد تتغير مع أعمال التوسعة. ترقيم الأبواب مأخوذ من OpenStreetMap ولم يمكن تأكيده بقائمة رسمية. تذكيرات عملية فقط: لأي حكم شرعي راجع أهل العلم.' });

Object.assign(I18N.fr, { holy_full: 'Plein écran', holy_close: 'Fermer' });
Object.assign(I18N.en, { holy_full: 'Full screen', holy_close: 'Close' });
Object.assign(I18N.ar, { holy_full: 'ملء الشاشة', holy_close: 'إغلاق' });

/* ---- Parcours prophétique ---- */
Object.assign(I18N.fr, { nav_sira: 'Parcours', sira_title: 'Parcours prophétique', sira_sub: "Suivez la vie du Prophète ﷺ de lieu en lieu, dans l'ordre.", sira_play: 'Lancer le récit', sira_near: 'Autour de moi', sira_near_off: 'Arrêter', sira_stamps: 'étapes tamponnées', sira_all: 'Tout',
  sira_disc: "Contenu rédigé à partir de sources générales, pas encore relu par un savant : confirmez avant de diffuser. ✅ établi · 📜 tradition · ❓ à confirmer. Les dates sont approximatives.", sira_listen: 'Écouter', sira_stop: 'Arrêter', sira_stamp: "J'y suis allé", sira_stamped: 'Étape tamponnée', sira_onsite: 'Sur place', sira_sources: 'Sources', sira_more: 'Autres lieux du dossier de Médine', sira_unverified: 'Fiches issues de vidéos, non vérifiées : contrôlez avant de vous déplacer.', sira_fiche: 'Fiche du lieu',
  sira_here: 'Vous êtes près de', sira_hint: "Lisez ce qui s'est passé ici.", sira_read: 'Lire', sira_nearest: 'Étape la plus proche', sira_no_gps: 'Position indisponible.', sira_no_tts: "La lecture audio n'est pas disponible sur cet appareil.",
  sr_fact: 'Établi (source citée)', sr_trad: 'Tradition / transmis', sr_tbc: 'À confirmer / discuté' });
Object.assign(I18N.en, { nav_sira: 'Journey', sira_title: "Prophet's Journey", sira_sub: 'Follow the life of the Prophet ﷺ place by place, in order.', sira_play: 'Play the story', sira_near: 'Near me', sira_near_off: 'Stop', sira_stamps: 'stamps', sira_all: 'All',
  sira_disc: 'Content written from general sources, not yet reviewed by a scholar: confirm before sharing widely. ✅ established · 📜 tradition · ❓ to confirm. Dates are approximate.', sira_listen: 'Listen', sira_stop: 'Stop', sira_stamp: "I've been here", sira_stamped: 'Stamped', sira_onsite: 'On site', sira_sources: 'Sources', sira_more: 'More places from the Madinah file', sira_unverified: 'Entries from videos, unverified: check before going.', sira_fiche: 'Place page',
  sira_here: 'You are near', sira_hint: 'Read what happened here.', sira_read: 'Read', sira_nearest: 'Nearest stop', sira_no_gps: 'Location unavailable.', sira_no_tts: 'Audio reading is not available on this device.',
  sr_fact: 'Established (source cited)', sr_trad: 'Tradition / handed down', sr_tbc: 'To confirm / discussed' });
Object.assign(I18N.ar, { nav_sira: 'المسار', sira_title: 'المسار النبوي', sira_sub: 'تتبّع سيرة النبي ﷺ من مكان إلى مكان بالترتيب.', sira_play: 'ابدأ الحكاية', sira_near: 'بالقرب مني', sira_near_off: 'إيقاف', sira_stamps: 'أختام', sira_all: 'الكل',
  sira_disc: 'المحتوى مكتوب من مصادر عامة ولم يراجعه عالم بعد: تأكد قبل النشر. ✅ ثابت · 📜 منقول · ❓ للتأكد. التواريخ تقريبية.', sira_listen: 'استمع', sira_stop: 'إيقاف', sira_stamp: 'زرت المكان', sira_stamped: 'تم الختم', sira_onsite: 'في المكان', sira_sources: 'المصادر', sira_more: 'أماكن أخرى من ملف المدينة', sira_unverified: 'مأخوذة من مقاطع فيديو وغير موثقة: تحقق قبل الذهاب.', sira_fiche: 'بطاقة المكان',
  sira_here: 'أنت قرب', sira_hint: 'اقرأ ما حدث هنا.', sira_read: 'اقرأ', sira_nearest: 'أقرب محطة', sira_no_gps: 'الموقع غير متاح.', sira_no_tts: 'القراءة الصوتية غير متاحة على هذا الجهاز.',
  sr_fact: 'ثابت (بمصدر)', sr_trad: 'منقول / متوارث', sr_tbc: 'للتأكد / مختلف فيه' });

Object.assign(I18N.fr, { ex_category: 'Catégorie' }); Object.assign(I18N.en, { ex_category: 'Category' }); Object.assign(I18N.ar, { ex_category: 'الفئة' });

/* ---- Mon circuit ---- */
Object.assign(I18N.fr, { ci_title: 'Mon circuit', ci_empty: "Djeddah 20 → 23 mars · La Mecque 23 → 28 · Médine 28 mars → 2 avril · Riyad 2 → 4 · Djeddah 4 → 6 avril (17 nuits). Charge-le pour préparer les hôtels et les transports.", ci_load: 'Charger mon circuit (20 mars → 6 avril 2027)', ci_stages: 'Étapes et hôtels', ci_transports: 'Transports', ci_add_stay: 'Ajouter le logement', ci_arrive: 'Arrivée à', ci_leave: 'Départ de', ci_book_train: 'Billets Haramain', ci_find_flights: 'Chercher les vols',
  ci_train_note: "Train à grande vitesse Haramain : vérifiez la gare de départ (Djeddah Sulaymaniyah ou aéroport) et réservez à l'avance.", ci_flight_note: 'Vol intérieur : comparez les compagnies et les horaires.', ci_flight_morning: 'Prévoyez un vol le matin pour profiter de la journée à Djeddah.', ci_morning: 'matin',
  ci_to_plan: 'Ajouter au Carnet', ci_remove: 'Retirer le circuit', ci_remove_confirm: 'Retirer le circuit ? Vos logements enregistrés ne sont pas supprimés.', ci_loaded: 'Circuit chargé', ci_added: 'ajouté(s) au Carnet', ci_already: 'Déjà dans le Carnet.', ci_replace_dates: 'Remplacer les dates du voyage (onglet Vols) par 20 mars → 6 avril 2027 ?' });
Object.assign(I18N.en, { ci_title: 'My itinerary', ci_empty: 'Jeddah 20 → 23 Mar · Makkah 23 → 28 · Madinah 28 Mar → 2 Apr · Riyadh 2 → 4 · Jeddah 4 → 6 Apr (17 nights). Load it to prepare hotels and transport.', ci_load: 'Load my itinerary (20 Mar → 6 Apr 2027)', ci_stages: 'Stops and hotels', ci_transports: 'Transport', ci_add_stay: 'Add the stay', ci_arrive: 'Arrival in', ci_leave: 'Departure from', ci_book_train: 'Haramain tickets', ci_find_flights: 'Find flights',
  ci_train_note: 'Haramain high-speed train: check the departure station (Jeddah Sulaymaniyah or airport) and book ahead.', ci_flight_note: 'Domestic flight: compare airlines and times.', ci_flight_morning: 'Plan a morning flight to enjoy the day in Jeddah.', ci_morning: 'morning',
  ci_to_plan: 'Add to Planner', ci_remove: 'Remove itinerary', ci_remove_confirm: 'Remove the itinerary? Your saved stays are not deleted.', ci_loaded: 'Itinerary loaded', ci_added: 'added to Planner', ci_already: 'Already in the Planner.', ci_replace_dates: 'Replace the trip dates (Flights tab) with 20 Mar → 6 Apr 2027?' });
Object.assign(I18N.ar, { ci_title: 'مسار رحلتي', ci_empty: 'جدة ٢٠ → ٢٣ مارس · مكة ٢٣ → ٢٨ · المدينة ٢٨ مارس → ٢ أبريل · الرياض ٢ → ٤ · جدة ٤ → ٦ أبريل (١٧ ليلة).', ci_load: 'تحميل مساري (٢٠ مارس ← ٦ أبريل ٢٠٢٧)', ci_stages: 'المحطات والفنادق', ci_transports: 'المواصلات', ci_add_stay: 'إضافة الإقامة', ci_arrive: 'الوصول إلى', ci_leave: 'المغادرة من', ci_book_train: 'تذاكر قطار الحرمين', ci_find_flights: 'ابحث عن رحلات',
  ci_train_note: 'قطار الحرمين السريع: تحقق من محطة الانطلاق واحجز مسبقًا.', ci_flight_note: 'رحلة داخلية: قارن بين الشركات والمواعيد.', ci_flight_morning: 'خطط لرحلة صباحية للاستفادة من اليوم في جدة.', ci_morning: 'صباحًا',
  ci_to_plan: 'أضف إلى الدفتر', ci_remove: 'إزالة المسار', ci_remove_confirm: 'إزالة المسار؟ إقاماتك المحفوظة لا تُحذف.', ci_loaded: 'تم تحميل المسار', ci_added: 'أُضيفت إلى الدفتر', ci_already: 'موجود في الدفتر.', ci_replace_dates: 'استبدال تواريخ الرحلة بـ ٢٠ مارس ← ٦ أبريل ٢٠٢٧؟' });

/* ---- Menu ---- */
Object.assign(I18N.fr, { nav_menu: 'Menu', mn_prepare: 'Préparer le voyage', mn_faith: 'Omra et foi', mn_discover: 'Découvrir', mn_disc: 'Découvertes de Médine' });
Object.assign(I18N.en, { nav_menu: 'Menu', mn_prepare: 'Plan the trip', mn_faith: 'Umrah and faith', mn_discover: 'Discover', mn_disc: 'Madinah discoveries' });
Object.assign(I18N.ar, { nav_menu: 'القائمة', mn_prepare: 'تحضير الرحلة', mn_faith: 'العمرة والإيمان', mn_discover: 'اكتشف', mn_disc: 'اكتشافات المدينة' });

/* ---- Distance à pied hôtel → porte ---- */
Object.assign(I18N.fr, { st_walk_btn: 'Distance à pied jusqu\'à la porte la plus proche', st_walk_haram: 'jusqu\'à la porte la plus proche du Haram', st_walk_nabawi: 'jusqu\'à la porte la plus proche de la Mosquée du Prophète', st_gate: 'Porte', st_walk_est: 'estimation (itinéraire indisponible)', st_walk_need: "Renseignez le nom ou l'adresse de l'hôtel (ou collez ses coordonnées).", st_walk_nofound: "Adresse introuvable : précisez l'adresse ou collez les coordonnées (ex. 21.4189, 39.8234).", st_walk_fail: 'Mesure impossible pour le moment (réseau).',
  walk_legend: 'Repères : moins de 300 m · 300–600 m · 600 m–1 km · 1–2 km · plus de 2 km. Les foules aux heures de prière rallongent le trajet.' });
Object.assign(I18N.en, { st_walk_btn: 'Walking distance to the nearest gate', st_walk_haram: 'to the nearest Haram gate', st_walk_nabawi: "to the nearest gate of the Prophet's Mosque", st_gate: 'Gate', st_walk_est: 'estimate (route unavailable)', st_walk_need: "Enter the hotel's name or address (or paste its coordinates).", st_walk_nofound: 'Address not found: refine it or paste coordinates (e.g. 21.4189, 39.8234).', st_walk_fail: 'Measurement unavailable right now (network).',
  walk_legend: 'Bands: under 300 m · 300–600 m · 600 m–1 km · 1–2 km · over 2 km. Prayer-time crowds lengthen the walk.' });
Object.assign(I18N.ar, { st_walk_btn: 'المسافة مشيًا إلى أقرب باب', st_walk_haram: 'إلى أقرب باب للحرم', st_walk_nabawi: 'إلى أقرب باب للمسجد النبوي', st_gate: 'باب', st_walk_est: 'تقدير (تعذّر المسار)', st_walk_need: 'أدخل اسم الفندق أو عنوانه (أو الصق إحداثياته).', st_walk_nofound: 'العنوان غير موجود: وضّحه أو الصق الإحداثيات.', st_walk_fail: 'تعذّر القياس الآن (الشبكة).',
  walk_legend: 'الفئات: أقل من ٣٠٠ م · ٣٠٠–٦٠٠ م · ٦٠٠ م–١ كم · ١–٢ كم · أكثر من ٢ كم. الزحام وقت الصلاة يطيل المسير.' });

/* ---- Hôtels sur la carte des lieux saints ---- */
Object.assign(I18N.fr, { holy_hotels: 'Hôtels', holy_h_add: 'Ajouter à mes logements', holy_h_est: "Hôtels : données OpenStreetMap, incomplètes. Distance estimée (vol d'oiseau × 1,3, 80 m/min) jusqu'à la porte la plus proche ; à vérifier avec le calcul à pied dans l'onglet Logement." });
Object.assign(I18N.en, { holy_hotels: 'Hotels', holy_h_add: 'Add to my stays', holy_h_est: 'Hotels: OpenStreetMap data, incomplete. Estimated distance (straight line × 1.3, 80 m/min) to the nearest gate; confirm with the walking measure in the Stay tab.' });
Object.assign(I18N.ar, { holy_hotels: 'الفنادق', holy_h_add: 'أضف إلى إقاماتي', holy_h_est: 'الفنادق: بيانات OpenStreetMap غير مكتملة. المسافة تقديرية إلى أقرب باب؛ تحقق منها في تبويب الإقامة.' });

Object.assign(I18N.fr, { mn_umrah: 'Hôtels par temps de marche' }); Object.assign(I18N.en, { mn_umrah: 'Hotels by walking time' }); Object.assign(I18N.ar, { mn_umrah: 'الفنادق حسب زمن المشي' });
