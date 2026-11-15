// GitHub API is mocked; no token or travel data leaves the test process.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {webcrypto}=require('node:crypto');
const {TextEncoder,TextDecoder}=require('node:util');

function fixture({legacy=false, remote=null, online=true, httpStatus=200}={}){
  const db=new Map();
  if(legacy)db.set('sync',{token:'OLD-SECRET',gistId:'old-gist'});
  const S={lang:'fr',city:'makkah',method:'ummalqura',trip:{start:'',end:''},plan:[],
    checks:{},custom:[],cnt:{tawaf:0,sai:0},exp:[],budget:0,rate:0.23,cur:'CHF',
    fav:[],visited:{},notes:{},vids:{},journey:{ref:'ABC123'},stays:[],geo:null,here:null};
  const app={S,SYNC_KEYS:Object.keys(S).filter(x=>!['geo','here'].includes(x)),
    hooks:{onSave(){}},refresh(){},toast(){},
    store:{get(k,f){return db.has(k)?db.get(k):f},set(k,v){db.set(k,structuredClone(v));return true}}};
  const elements=new Map();
  let html='', confirmed=true;
  const root={
    get innerHTML(){return html},
    set innerHTML(s){html=s;elements.clear();},
    querySelector(sel){
      const id=sel.slice(1);
      if(!html.includes('id="'+id+'"'))return null;
      if(!elements.has(id))elements.set(id,{value:'',onclick:null});
      return elements.get(id);
    }
  };
  const timers=[];
  const handlers={};
  const server={content:remote,gists:remote===null?[]:[{id:'gist-1',description:'Omra encrypted backup v2',files:{'omra-secure.json':{content:remote}}}],requests:[]};
  async function fetch(url,request){
    server.requests.push({url,method:request.method,headers:request.headers,body:request.body});
    if(httpStatus!==200)return {ok:false,status:httpStatus};
    if(url.endsWith('/gists?per_page=100'))return {ok:true,json:async()=>server.gists};
    if(url.endsWith('/gists') && request.method==='POST'){
      const body=JSON.parse(request.body);server.content=body.files['omra-secure.json'].content;
      server.gists=[{id:'gist-1',description:body.description,files:{'omra-secure.json':{content:server.content}}}];
      return {ok:true,json:async()=>({id:'gist-1'})};
    }
    if(url.endsWith('/gists/gist-1') && request.method==='GET')
      return {ok:true,json:async()=>({files:{'omra-secure.json':{content:server.content}}})};
    if(url.endsWith('/gists/gist-1') && request.method==='PATCH'){
      server.content=JSON.parse(request.body).files['omra-secure.json'].content;
      return {ok:true,json:async()=>({id:'gist-1'})};
    }
    throw Error('Unexpected HTTP '+url);
  }
  const sandbox={
    window:{Omra:app},navigator:{onLine:online},document:{body:{contains:x=>x===root},addEventListener:(name,fn)=>{handlers[name]=fn}},
    addEventListener:(name,fn)=>{handlers[name]=fn},
    confirm:()=>confirmed,fetch,clearTimeout:()=>{},setTimeout:(fn)=>{timers.push(fn);return timers.length},
    crypto:webcrypto,TextEncoder,TextDecoder,Uint8Array,Object,JSON,Date,Blob,URL,
    btoa:s=>Buffer.from(s,'binary').toString('base64'),
    atob:s=>Buffer.from(s,'base64').toString('binary')
  };
  for(const path of ['js/secure-backup.js','js/sync.js'])
    vm.runInNewContext(fs.readFileSync(path,'utf8'),sandbox,{filename:path});
  app.syncCard(root);
  const input=(id,value)=>{const node=root.querySelector('#'+id);assert.ok(node,id+' missing');node.value=value};
  const click=async(id)=>{const node=root.querySelector('#'+id);assert.ok(node,id+' missing');assert.equal(typeof node.onclick,'function');await node.onclick();await new Promise(setImmediate);};
  const connect=async(pass='correct-super-secret')=>{
    input('secureToken','ghp-TEST-token');input('securePass',pass);await click('secureConnect');
  };
  return {app,db,root,server,input,click,connect,timers,handlers,setConfirm:v=>confirmed=v};
}

test('creates only encrypted gist and does not persist credentials',async()=>{
  const f=fixture({legacy:true});
  assert.equal(f.db.get('sync'),null);
  assert.equal(f.db.get('legacySyncWarning'),true);
  await f.connect();
  assert.equal(f.server.gists.length,1);
  assert.equal(f.server.requests.some(r=>r.url.includes('/gists/old-gist')),false);
  assert.equal(f.server.content.includes('ABC123'),false);
  assert.equal(JSON.stringify([...f.db]).includes('ghp-TEST-token'),false);
  assert.equal(JSON.stringify([...f.db]).includes('correct-super-secret'),false);
});
test('auto-sync posts encrypted changes after a local edit',async()=>{
  const f=fixture();await f.connect();
  const before=f.server.content;
  f.app.S.city='madinah';f.app.hooks.onSave();
  await f.timers.at(-1)();await new Promise(setImmediate);
  assert.notEqual(f.server.content,before);
  assert.equal(f.server.content.includes('madinah'),false);
  assert.equal(f.db.has('secureSyncLastOk'),true);
});
test('remote changes block silent writes',async()=>{
  const f=fixture();await f.connect();
  f.server.content='{"different":true}';
  f.app.hooks.onSave();await f.timers.at(-1)();await new Promise(setImmediate);
  const patch=f.server.requests.filter(x=>x.method==='PATCH');
  assert.equal(patch.length,0);
  assert.match(f.root.innerHTML,/envoi bloqué/);
});
test('existing remote gist requires a deliberate restore or replacement',async()=>{
  const a=fixture();await a.connect();
  const b=fixture({remote:a.server.content});await b.connect();
  assert.match(b.root.innerHTML,/choix nécessaire/);
  assert.equal(b.server.requests.filter(x=>x.method==='PATCH').length,0);
  await b.click('secureRestore');
  assert.match(b.root.innerHTML,/Sauvegarde restaurée/);
});
test('GitHub errors do not persist token or discard local travel data',async()=>{
  const f=fixture({httpStatus:401});await f.connect();
  assert.match(f.root.innerHTML,/GitHub HTTP 401/);
  assert.equal(f.app.S.journey.ref,'ABC123');
  assert.equal(f.db.has('sync'),false);
});
test('offline sync never writes GitHub until connectivity is restored',async()=>{
  const f=fixture({online:false});await f.connect();
  assert.equal(f.server.requests.length,2); // Initial creation is triggered by the explicit connect action.
  f.app.hooks.onSave();await f.timers.at(-1)();await new Promise(setImmediate);
  assert.equal(f.server.requests.filter(x=>x.method==='PATCH').length,0);
});
