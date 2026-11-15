// Run with: node --test tests/secure-backup.test.cjs
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');
const { TextEncoder, TextDecoder } = require('node:util');

function boot() {
  const values = new Map();
  const S = {
    lang:'fr', city:'makkah', method:'ummalqura', trip:{start:'',end:''},
    plan:[],checks:{},custom:[],cnt:{tawaf:0,sai:0},exp:[],budget:0,rate:0.23,cur:'CHF',
    fav:[],visited:{},notes:{},vids:{},journey:{ref:'PRIVATE123'},stays:[{id:'a',ref:'BOOK123'}],
    geo:null,here:null
  };
  const keys = Object.keys(S).filter(k => !['geo','here'].includes(k));
  const app = {
    S, SYNC_KEYS:keys, refresh(){},
    store: {
      set(k,v){values.set(k,structuredClone(v)); return true;},
      get(k,d){return values.has(k)?values.get(k):d;}
    }
  };
  const sandbox = {window:{Omra:app},crypto:webcrypto,TextEncoder,TextDecoder,
    Uint8Array,JSON,Date,Object,Blob,URL,setTimeout,
    btoa:bytes=>Buffer.from(bytes,'binary').toString('base64'),
    atob:bytes=>Buffer.from(bytes,'base64').toString('binary')};
  vm.runInNewContext(fs.readFileSync('js/secure-backup.js','utf8'),sandbox,
    {filename:'js/secure-backup.js'});
  return {app,values};
}
test('encrypted snapshot round-trips and contains no plaintext booking reference',async()=>{
  const {app}=boot();
  const original=app.backup.snapshot();
  const blob=await app.backup.encrypt(original,'very-long-test-secret');
  assert.equal(JSON.stringify(blob).includes('BOOK123'),false);
  const roundtrip=await app.backup.decrypt(blob,'very-long-test-secret');
  assert.deepEqual(JSON.parse(JSON.stringify(roundtrip.data)),JSON.parse(JSON.stringify(original.data)));
});
test('wrong passphrase fails closed',async()=>{
  const {app}=boot();
  const blob=await app.backup.encrypt(app.backup.snapshot(),'very-long-test-secret');
  await assert.rejects(app.backup.decrypt(blob,'another-long-secret'));
});
test('invalid data is rejected without changing the existing state',()=>{
  const {app}=boot();
  const before=app.S.stays[0].ref;
  assert.throws(()=>app.backup.restore({schemaVersion:2,data:{stays:'not an array'}}));
  assert.equal(app.S.stays[0].ref,before);
});
test('restore preserves a recovery snapshot',()=>{
  const {app,values}=boot();
  const changed=app.backup.snapshot();changed.data.city='madinah';
  app.backup.restore(changed);
  assert.equal(app.S.city,'madinah');
  assert.equal(values.get('recovery').data.city,'makkah');
});
