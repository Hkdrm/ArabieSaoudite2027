/* Service worker : réseau d'abord (toujours la dernière version quand on est en ligne),
   cache en secours (hors ligne). Les fichiers de l'appli sont revalidés à chaque requête. */
const V = 'omra-v47';
const SHELL = ['./', 'index.html', 'css/style.css', 'js/app.js', 'js/data.js', 'js/places.js', 'data/junaid-madinah-discoveries.json', 'js/holy.js', 'js/sira-data.js', 'js/sira.js', 'data/holy-sites.json', 'js/trip.js', 'js/ticket.js', 'js/stays.js', 'js/sync.js', 'js/refresh.js', 'js/prayer.js', 'manifest.webmanifest', 'icons/icon.svg', 'fonts/ArefRuqaa-ar.woff2', 'img/kaaba-hajj.jpg', 'img/bg-zoomblur.jpg', 'icons/icon-192.png', 'icons/icon-512.png'];
const NET_TIMEOUT = 4000; // réseau trop lent → on sert le cache

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V)
    .then(c => c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' }))))   // contourne le cache HTTP
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});

function networkFirst(req) {
  return new Promise(resolve => {
    let done = false;
    const fromCache = () => caches.match(req, { ignoreSearch: true }).then(hit => hit || (req.mode === 'navigate' ? caches.match('index.html') : undefined));
    const timer = setTimeout(() => fromCache().then(hit => { if (hit && !done) { done = true; resolve(hit); } }), NET_TIMEOUT);
    fetch(req, { cache: 'no-cache' }).then(res => {
      clearTimeout(timer);
      if (res.ok) { const copy = res.clone(); caches.open(V).then(c => c.put(req, copy)); }
      if (!done) { done = true; resolve(res); }
    }).catch(() => {
      clearTimeout(timer);
      fromCache().then(hit => { if (!done) { done = true; resolve(hit || Response.error()); } });
    });
  });
}

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin === location.origin) { e.respondWith(networkFirst(r)); return; }
  if (u.hostname === 'cdnjs.cloudflare.com') {      // bibliothèques versionnées : cache d'abord
    e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => { if (res.ok) { const c = res.clone(); caches.open(V).then(ca => ca.put(r, c)); } return res; })));
  }
});
