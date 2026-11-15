/* PR 02: encrypted, versioned exports and validated restoration. No external crypto service. */
(() => {
  'use strict';
  const A = window.Omra;
  const KEYS = [...A.SYNC_KEYS, 'geo', 'here'];
  const TYPES = {
    lang:'string', city:'string', method:'string', trip:'object', plan:'arrayOrNull',
    checks:'object', custom:'array', cnt:'object', exp:'array', budget:'number',
    rate:'number', cur:'string', fav:'array', visited:'object', notes:'object',
    vids:'object', journey:'objectOrNull', stays:'array', geo:'objectOrNull',
    here:'objectOrNull', sira:'object', circuit:'objectOrNull', pays:'object'
  };
  const VERSION = 2, MAX_BYTES = 5 * 1024 * 1024;
  const enc = new TextEncoder(), dec = new TextDecoder();
  const random = n => crypto.getRandomValues(new Uint8Array(n));
  const b64 = bytes => {
    let out = ''; for(let i=0;i<bytes.length;i+=16384) out += String.fromCharCode(...bytes.subarray(i,i+16384));
    return btoa(out);
  };
  const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  const validType = (v, type) => {
    if (type === 'arrayOrNull') return v === null || Array.isArray(v);
    if (type === 'objectOrNull') return v === null || (typeof v === 'object' && !Array.isArray(v));
    if (type === 'array') return Array.isArray(v);
    if (type === 'object') return v !== null && typeof v === 'object' && !Array.isArray(v);
    return typeof v === type && (type !== 'number' || Number.isFinite(v));
  };
  function validate(input) {
    if (!input || typeof input !== 'object' || input.schemaVersion !== VERSION || !input.data || typeof input.data !== 'object' || Array.isArray(input.data)) throw new Error('Format de sauvegarde incompatible');
    for (const [k,v] of Object.entries(input.data)) {
      if (!Object.hasOwn(TYPES,k) || !validType(v,TYPES[k])) throw new Error('Champ invalide : ' + k);
    }
    if (!Object.keys(input.data).length) throw new Error('Sauvegarde vide');
    if (enc.encode(JSON.stringify(input)).length > MAX_BYTES) throw new Error('Sauvegarde trop volumineuse');
    return input;
  }
  function snapshot() {
    const data = {};
    KEYS.forEach(k => { data[k] = JSON.parse(JSON.stringify(A.S[k] ?? null)); });
    return validate({schemaVersion:VERSION, createdAt:new Date().toISOString(), data});
  }
  async function keyFrom(pass, salt, iterations) {
    if (typeof pass !== 'string' || pass.length < 12) throw new Error('Phrase secrète : 12 caractères minimum');
    const raw = await crypto.subtle.importKey('raw',enc.encode(pass),'PBKDF2',false,['deriveKey']);
    return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations,hash:'SHA-256'},raw,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
  }
  async function encrypt(data, pass) {
    const body = enc.encode(JSON.stringify(validate(data)));
    const salt = random(16), iv = random(12), iterations = 310000;
    const key = await keyFrom(pass,salt,iterations);
    const cipher = await crypto.subtle.encrypt({name:'AES-GCM',iv},key,body);
    return {type:'omra-encrypted-backup',version:2,kdf:'PBKDF2-SHA256',iterations,
      cipher:'AES-256-GCM',salt:b64(salt),iv:b64(iv),data:b64(new Uint8Array(cipher))};
  }
  async function decrypt(envelope, pass) {
    if (!envelope || envelope.type !== 'omra-encrypted-backup' || envelope.version !== 2 ||
        envelope.kdf !== 'PBKDF2-SHA256' || envelope.cipher !== 'AES-256-GCM' ||
        envelope.iterations !== 310000 || typeof envelope.data !== 'string' ||
        envelope.data.length > MAX_BYTES * 2) throw new Error('Sauvegarde chiffrée invalide');
    const salt=unb64(envelope.salt), iv=unb64(envelope.iv);
    if(salt.length !== 16 || iv.length !== 12) throw new Error('Paramètres cryptographiques invalides');
    const key=await keyFrom(pass,salt,envelope.iterations);
    const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv},key,unb64(envelope.data));
    if (plain.byteLength > MAX_BYTES) throw new Error('Fichier trop volumineux');
    return validate(JSON.parse(dec.decode(plain)));
  }
  function restore(input) {
    const {data} = validate(input);
    // Recovery snapshot before any write. A failed write aborts and leaves the original state in this slot.
    const old = snapshot();
    const recovery = JSON.stringify(old);
    if (recovery.length > MAX_BYTES || !A.store.set('recovery',old)) throw new Error('Impossible de sécuriser les données existantes');
    const before = Object.fromEntries(KEYS.map(k => [k,A.S[k]]));
    try {
      Object.entries(data).forEach(([k,v]) => {
        if (!A.store.set(k,v)) throw new Error('Stockage indisponible : ' + k);
        A.S[k] = v;
      });
      A.store.set('ts',Date.now());
    } catch(e) {
      Object.entries(before).forEach(([k,v]) => { A.S[k]=v; A.store.set(k,v); });
      throw e;
    }
    A.refresh();
  }
  function download(envelope) {
    const url=URL.createObjectURL(new Blob([JSON.stringify(envelope,null,2)],{type:'application/json'}));
    const a=document.createElement('a');a.href=url;a.download='omra-sauvegarde-chiffree-'+new Date().toISOString().slice(0,10)+'.json';
    document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
  }
  A.backup={snapshot,validate,encrypt,decrypt,restore,download,MAX_BYTES};
})();