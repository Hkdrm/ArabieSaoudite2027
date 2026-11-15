/* PR 02: encrypted GitHub sync. GitHub token and passphrase live in memory only.
   Legacy plaintext gist is NEVER accessed or overwritten automatically. */
(() => {
  'use strict';
  const A = window.Omra, {store,t,esc} = A;
  const DESCRIPTION = 'Omra encrypted backup v2';
  const FILE = 'omra-secure.json';
  let token = null, pass = null, gistId = null, previous = null, busy = false, pending = false, timer = null, root = null;
  let error = '', success = '', conflict = false;
  const legacy = store.get('sync',null);
  if (legacy && legacy.token) {
    // Old local token was readable by any script on this origin.
    // Do not retain it, and do not delete the old remote gist.
    store.set('sync',null);
    store.set('legacySyncWarning',true);
  }
  const connected = () => Boolean(token && pass && gistId);
  async function api(path, method='GET', body) {
    if (!token) throw Error('Connexion GitHub requise');
    const response = await fetch('https://api.github.com'+path, {
      method, headers: {'Accept':'application/vnd.github+json','Authorization':'Bearer '+token,
        'Content-Type':'application/json','X-GitHub-Api-Version':'2022-11-28'},
      body: body ? JSON.stringify(body) : undefined, cache:'no-store'
    });
    if (!response.ok) throw Error('GitHub HTTP '+response.status);
    return response.json();
  }
  function fileContent(gist) {
    const entry = gist.files && gist.files[FILE];
    if (!entry) return null;
    if (entry.truncated) throw Error('Sauvegarde distante tronquée');
    return entry.content;
  }
  async function getRemote() {
    const gist = await api('/gists/'+encodeURIComponent(gistId));
    return fileContent(gist);
  }
  function status(message, bad=false) {
    error = bad ? message : ''; success = bad ? '' : message; render();
  }
  async function connect(tok, secret) {
    if (!tok.trim() || secret.length < 12) { status('Jeton requis et phrase secrète de 12 caractères minimum',true); return; }
    token = tok.trim(); pass = secret; gistId = null; previous = null; conflict = false;
    try {
      let list = await api('/gists?per_page=100');
      const match = list.find(g => g.description === DESCRIPTION && g.files && g.files[FILE]);
      if (!match) {
        const encrypted = await A.backup.encrypt(A.backup.snapshot(),pass);
        const value = JSON.stringify(encrypted);
        const created = await api('/gists','POST',{description:DESCRIPTION,public:false,files:{[FILE]:{content:value}}});
        gistId = created.id; previous=value;
        status('Sauvegarde GitHub chiffrée créée');
      } else {
        gistId = match.id;
        const remote = await getRemote();
        // Never overwrite an existing backup without first proving we can decrypt it.
        const data = await A.backup.decrypt(JSON.parse(remote),pass);
        previous=remote; conflict=true;
        status('Sauvegarde distante trouvée. Choisissez Restaurer pour la récupérer, ou Remplacer pour envoyer les données de cet appareil.');
      }
      render();
    } catch (e) {
      token=null;pass=null;gistId=null;previous=null;
      status('Connexion refusée : '+e.message,true);
    }
  }
  async function saveRemote(force=false) {
    if (!connected() || busy || navigator.onLine === false) { pending = connected(); return; }
    if (conflict && !force) { status('Sauvegarde distante différente : résolvez le conflit avant envoi',true); return; }
    busy=true; pending=false; render();
    try {
      const latest=await getRemote();
      if (latest !== previous) { conflict=true; throw Error('La sauvegarde a changé sur GitHub : envoi bloqué'); }
      const encrypted=await A.backup.encrypt(A.backup.snapshot(),pass);
      const value=JSON.stringify(encrypted);
      await api('/gists/'+encodeURIComponent(gistId),'PATCH',{files:{[FILE]:{content:value}}});
      previous=value;conflict=false;store.set('secureSyncLastOk',Date.now());
      status('Sauvegarde chiffrée envoyée');
    } catch (e) { pending=true;status(e.message,true); }
    finally { busy=false;render(); }
    if(pending && !conflict && navigator.onLine !== false) {
      pending=false;clearTimeout(timer);timer=setTimeout(()=>saveRemote(),1500);
    }
  }
  async function restoreRemote() {
    if (!connected()) return;
    busy=true;render();
    try {
      const latest=await getRemote();
      const data=await A.backup.decrypt(JSON.parse(latest),pass);
      if (!confirm('Restaurer cette sauvegarde du '+(data.createdAt || 'date inconnue')+' ? Les données actuelles seront conservées dans une copie de récupération locale.')) return;
      A.backup.restore(data);
      previous=latest;conflict=false;pending=false;
      status('Sauvegarde restaurée');
    } catch (e) { status('Restauration refusée : '+e.message,true); }
    finally { busy=false;render(); }
  }
  function disconnect() {
    token=null;pass=null;gistId=null;previous=null;pending=false;conflict=false;
    clearTimeout(timer);status('Session GitHub fermée');
  }
  A.hooks.onSave = () => {
    if(!connected() || conflict) return;
    pending=true;clearTimeout(timer);timer=setTimeout(()=>saveRemote(),3000);
  };
  addEventListener('online',()=>{if(pending && connected() && !conflict) saveRemote();});
  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState==='hidden' && pending && connected() && !conflict) {
      clearTimeout(timer);saveRemote();
    }
  });
  function render() {
    if(!root || !document.body.contains(root)) return;
    const legacyWarning=store.get('legacySyncWarning',false);
    root.innerHTML = '<div class="card"><h3>🔐 Sauvegarde GitHub chiffrée</h3>'+
      (legacyWarning ? '<p class="err">Ancienne synchronisation non chiffrée désactivée. Révoquez son ancien jeton dans GitHub et supprimez l\'ancien Gist après vérification de la nouvelle sauvegarde.</p>' : '')+
      (error ? '<p class="err" role="alert">'+esc(error)+'</p>' : '')+
      (success ? '<p role="status">'+esc(success)+'</p>' : '')+
      (connected() ?
        '<p>Session active (jeton et phrase secrète conservés uniquement en mémoire).</p>'+
        (conflict ? '<p class="err" role="alert">Sauvegarde distante existante : choix nécessaire.</p>' : '')+
        '<div class="row"><button id="secureSave" '+(busy?'disabled':'')+'>Sauvegarder</button>'+
        '<button class="ghost" id="secureRestore" '+(busy?'disabled':'')+'>Restaurer</button>'+
        (conflict ? '<button class="danger" id="secureReplace" '+(busy?'disabled':'')+'>Remplacer la sauvegarde distante</button>' : '')+
        '<button class="ghost" id="secureOff">Déconnecter</button></div>' :
        '<p>Jeton GitHub avec droit <code>gist</code> et phrase secrète de 12 caractères minimum. Ils seront redemandés à chaque ouverture de l’application. L’ancien Gist n’est jamais écrasé.</p>'+
        '<div class="form"><label for="secureToken">Jeton GitHub</label><input id="secureToken" type="password" autocomplete="off" autocapitalize="off" spellcheck="false">'+
        '<label for="securePass">Phrase secrète</label><input id="securePass" type="password" autocomplete="off" spellcheck="false">'+
        '<button id="secureConnect">Activer la session chiffrée</button></div>'
      )+'<p class="muted">La sauvegarde utilise un Gist non répertorié, pas un coffre-fort privé. Son contenu est chiffré avant envoi. Une phrase secrète perdue ne peut pas être récupérée.</p></div>';
    const get = id=>root.querySelector('#'+id);
    if(get('secureConnect')) get('secureConnect').onclick=()=>{
      const tok=get('secureToken').value, pwd=get('securePass').value;
      get('secureToken').value='';get('securePass').value='';
      connect(tok,pwd);
    };
    if(get('secureSave')) get('secureSave').onclick=()=>saveRemote();
    if(get('secureRestore')) get('secureRestore').onclick=()=>restoreRemote();
    if(get('secureReplace')) get('secureReplace').onclick=()=>{
      if(confirm('Remplacer définitivement la dernière version distante ? Vérifiez que les données de cet appareil sont les bonnes.')) saveRemote(true);
    };
    if(get('secureOff')) get('secureOff').onclick=disconnect;
  }
  A.syncCard=el=>{root=el;render();};
})();