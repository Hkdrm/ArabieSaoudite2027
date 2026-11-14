/* Sauvegarde automatique dans un gist GitHub privé du compte de l'utilisateur.
   - Envoi automatique ~3 s après chaque modification, et quand l'appli passe en arrière-plan.
   - Restauration automatique au démarrage si la sauvegarde distante est plus récente.
   - N'envoie JAMAIS : références de réservation, position (geo/here), ni le jeton.
   Jeton = classic PAT avec la seule portée « gist » (stocké localement, révocable sur GitHub). */
(() => {
  const A = window.Omra;
  const { esc, S, t, store } = A;
  const DESC = 'Omra app data (auto-sync)', FILE = 'omra-data.json';
  const cfg = () => store.get('sync', null);                  // { token, gistId }
  const status = () => store.get('syncStatus', {});           // { ok: ts, err: bool }
  const setStatus = v => store.set('syncStatus', { ...status(), ...v });
  let timer = null, pending = false, busy = false, box = null;

  async function api(token, path, method = 'GET', body) {
    const r = await fetch('https://api.github.com' + path, {
      method, body,
      headers: { Accept: 'application/vnd.github+json', Authorization: 'Bearer ' + token, 'Content-Type': 'application/json', 'X-GitHub-Api-Version': '2022-11-28' },
    });
    if (!r.ok) { const e = new Error('HTTP ' + r.status); e.status = r.status; throw e; }
    return r.json();
  }

  function payload() {
    const d = { _v: 1, _ts: +store.get('ts', 0) || Date.now() };
    A.SYNC_KEYS.forEach(k => { d[k] = S[k]; });
    if (d.journey) { d.journey = { ...d.journey }; delete d.journey.ref; delete d.journey.date2Rejected; }   // pas de référence de réservation
    if (Array.isArray(d.stays)) d.stays = d.stays.map(x => { const y = { ...x }; delete y.ref; return y; });
    return d;
  }

  function apply(d) {
    A.SYNC_KEYS.forEach(k => {
      if (!(k in d)) return;
      if (k === 'journey' && d.journey) d.journey.ref = (S.journey && S.journey.ref) || '';
      if (k === 'stays' && Array.isArray(d.stays)) d.stays.forEach(x => { const mine = (S.stays || []).find(y => y.id === x.id); x.ref = (mine && mine.ref) || ''; });
      S[k] = d[k]; store.set(k, S[k]);
    });
    store.set('ts', d._ts || Date.now());
    A.refresh();
  }

  async function push() {
    const c = cfg(); pending = false;
    if (!c || busy || navigator.onLine === false) { if (c) pending = true; return; }
    busy = true;
    try {
      await api(c.token, '/gists/' + c.gistId, 'PATCH', JSON.stringify({ files: { [FILE]: { content: JSON.stringify(payload()) } } }));
      setStatus({ ok: Date.now(), err: false });
    } catch (e) { setStatus({ err: true }); pending = true; }
    busy = false; render();
  }

  async function fetchRemote(c) {
    const g = await api(c.token, '/gists/' + c.gistId);
    const f = g.files && g.files[FILE];
    return f ? JSON.parse(f.content) : null;
  }

  async function pull(silent = true) {
    const c = cfg(); if (!c || navigator.onLine === false) return false;
    try {
      const remote = await fetchRemote(c);
      if (remote && (+remote._ts || 0) > (+store.get('ts', 0) || 0)) { apply(remote); setStatus({ ok: Date.now(), err: false }); return true; }
      if (!silent) A.toast(t('sync_none'));
    } catch (e) { setStatus({ err: true }); }
    return false;
  }

  async function enable(token) {
    token = token.trim();
    let list;
    try { list = await api(token, '/gists?per_page=100'); }
    catch (e) { A.toast(t('token_bad')); return; }
    const found = list.find(g => g.description === DESC && g.files && g.files[FILE]);
    const localTs = +store.get('ts', 0) || 0;
    if (found) {
      setCfg({ token, gistId: found.id });
      const remote = await fetchRemote(cfg()).catch(() => null);
      if (remote && (+remote._ts || 0) > localTs && (!localTs || confirm(t('restore_confirm')))) { apply(remote); A.toast(t('restored')); }
      else await push();
    } else {
      const g = await api(token, '/gists', 'POST', JSON.stringify({ description: DESC, public: false, files: { [FILE]: { content: JSON.stringify(payload()) } } }));
      setCfg({ token, gistId: g.id });
    }
    setStatus({ ok: Date.now(), err: false });
    render();
  }
  const setCfg = v => store.set('sync', v);

  A.hooks.onSave = () => {
    if (!cfg()) return;
    pending = true; clearTimeout(timer); timer = setTimeout(push, 3000);
  };
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && pending) { clearTimeout(timer); push(); }
    else if (document.visibilityState === 'visible' && cfg() && !pending) pull();
  });
  addEventListener('online', () => { if (pending) push(); });
  document.addEventListener('DOMContentLoaded', () => setTimeout(() => { if (cfg()) pull(); }, 400));

  /* ---- carte dans Outils ---- */
  function render() {
    if (!box || !document.body.contains(box)) return;
    const c = cfg(), st = status();
    const when = st.ok ? new Date(st.ok).toLocaleString(S.lang === 'ar' ? 'ar-SA-u-nu-latn' : S.lang) : '—';
    box.innerHTML = `<div class="card"><h3>☁️ ${t('sync_title')}</h3>` + (c ? `
      <p>✅ ${t('sync_on')}<br><span class="muted">${t('last_sync')} : ${esc(when)}</span></p>
      ${st.err ? `<p class="muted">⚠️ ${t('sync_err')}</p>` : ''}
      <div class="row"><button id="sNow">${t('sync_now')}</button><button class="ghost" id="sRes">${t('restore')}</button><button class="danger" id="sOff">${t('sync_disable')}</button></div>
      <p class="muted" style="margin-top:10px">${t('sync_excl')}</p>` : `
      <p class="muted">${t('sync_off_msg')}</p><p style="font-size:14px">${t('sync_steps')}</p>
      <p><a href="https://github.com/settings/tokens/new?scopes=gist&description=Omra%20app" target="_blank" rel="noopener">${t('sync_link')} ↗</a></p>
      <div class="row"><input id="sTok" class="grow" placeholder="${esc(t('token_ph'))}" autocomplete="off" autocapitalize="off" spellcheck="false"><button id="sOn">${t('sync_enable')}</button></div>
      <p class="muted" style="margin-top:10px">${t('sync_excl')}</p>`) + '</div>';
    const on = box.querySelector('#sOn');
    if (on) on.onclick = () => { const v = box.querySelector('#sTok').value; if (v.trim()) enable(v); };
    const now = box.querySelector('#sNow');
    if (now) now.onclick = async () => { await push(); if (!status().err) A.toast(t('saved')); };
    const res = box.querySelector('#sRes');
    if (res) res.onclick = async () => {
      try { const remote = await fetchRemote(cfg()); if (remote && confirm(t('restore_confirm'))) { apply(remote); A.toast(t('restored')); } else if (!remote) A.toast(t('sync_none')); }
      catch (e) { A.toast(t('sync_err')); }
    };
    const off = box.querySelector('#sOff');
    if (off) off.onclick = () => { store.set('sync', null); setStatus({ ok: 0, err: false }); render(); };
  }
  A.syncCard = el => { box = el; render(); };
})();
