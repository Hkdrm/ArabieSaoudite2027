/* Tirer vers le bas pour rafraîchir (les PWA installées n'ont pas ce geste en natif).
   Récupère la dernière version de l'appli (si connecté) puis recharge la page courante. */
(() => {
  const ind = document.createElement('div');
  ind.id = 'ptr'; ind.textContent = '↓'; ind.setAttribute('aria-hidden', 'true');
  document.body.appendChild(ind);

  const THRESHOLD = 110;           // distance de glissement (px) pour déclencher
  let y0 = null, dy = 0, busy = false;
  // On ne déclenche pas dans la carte, ni dans les champs de saisie.
  const blocked = t => t.closest && t.closest('#map, .leaflet-container, input, textarea, select');

  const reset = () => { ind.style.opacity = 0; ind.style.transform = 'translate(-50%, -20px)'; ind.classList.remove('ready'); };

  addEventListener('touchstart', e => {
    y0 = (busy || window.scrollY > 0 || e.touches.length !== 1 || blocked(e.target)) ? null : e.touches[0].clientY;
    dy = 0;
  }, { passive: true });

  addEventListener('touchmove', e => {
    if (y0 == null) return;
    dy = e.touches[0].clientY - y0;
    if (dy <= 0 || window.scrollY > 0) { reset(); return; }
    const d = Math.min(dy * 0.5, 70);
    ind.style.opacity = Math.min(dy / THRESHOLD, 1);
    ind.style.transform = `translate(-50%, ${d - 20}px) rotate(${Math.min(dy / THRESHOLD, 1) * 180}deg)`;
    ind.classList.toggle('ready', dy >= THRESHOLD);
  }, { passive: true });

  addEventListener('touchend', () => {
    if (y0 == null) return;
    const go = dy >= THRESHOLD;
    y0 = null;
    if (go) refresh(); else reset();
  }, { passive: true });
  addEventListener('touchcancel', () => { y0 = null; reset(); }, { passive: true });

  async function refresh() {
    busy = true;
    ind.textContent = '↻'; ind.classList.add('spin');
    ind.style.opacity = 1; ind.style.transform = 'translate(-50%, 50px)';
    try {
      if (navigator.onLine !== false) {
        // Vérifie qu'on est vraiment en ligne avant de vider le cache (sinon on garde la version hors ligne).
        const r = await fetch('index.html', { cache: 'no-store' });
        if (r.ok) {
          const reg = navigator.serviceWorker && await navigator.serviceWorker.getRegistration();
          if (reg) await reg.unregister();
          for (const k of await caches.keys()) await caches.delete(k);
        }
      }
    } catch { /* hors ligne : on recharge simplement depuis le cache */ }
    location.reload();
  }
})();
