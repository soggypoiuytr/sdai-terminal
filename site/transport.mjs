import {CONFIG} from './config.js';
import {initialRoom,roomCode,ownsControl} from './core.mjs';
export async function createTransport(code,{master=false,demo=false}={}){
 const room=roomCode(code);
 if(demo)return demoTransport(room,master);
 if(!CONFIG.firebase?.apiKey||!CONFIG.firebase?.databaseURL||!CONFIG.masterUid)throw Error('A conexão online ainda não foi configurada. O mestre precisa preencher config.js e publicar as regras do Firebase. Para testar apenas neste navegador, use ?demo=1.');
 const base='https://www.gstatic.com/firebasejs/12.19.0/';
 const [appAPI,authAPI,dbAPI]=await Promise.all([import(base+'firebase-app.js'),import(base+'firebase-auth.js'),import(base+'firebase-database.js')]);
 const app=appAPI.initializeApp(CONFIG.firebase,master?'sdai-master':'sdai-player');
 const auth=authAPI.getAuth(app);await authAPI.setPersistence(auth,authAPI.inMemoryPersistence);
 const db=dbAPI.getDatabase(app),root=dbAPI.ref(db,'rooms/'+room);let offset=0,uid=null,connected=false,disconnects=[];
 dbAPI.onValue(dbAPI.ref(db,'.info/serverTimeOffset'),s=>offset=s.val()||0);
 const now=()=>Date.now()+offset;
 const api={mode:'online',room,now,get uid(){return uid},get connected(){return connected},async login(email,password){const result=master?await authAPI.signInWithEmailAndPassword(auth,email,password):await authAPI.signInAnonymously(auth);uid=result.user.uid;if(master&&uid!==CONFIG.masterUid){await authAPI.signOut(auth);uid=null;throw Error('Esta conta não está cadastrada como mestre deste terminal.');}return uid;},async read(){return (await dbAPI.get(root)).val();},subscribe(fn,onError){return dbAPI.onValue(root,s=>fn(s.val()),onError);},watchConnection(fn){return dbAPI.onValue(dbAPI.ref(db,'.info/connected'),s=>{connected=s.val()===true;fn(connected);});},async set(path,value){await dbAPI.set(dbAPI.ref(db,'rooms/'+room+'/'+path),value);},async patch(path,value){await dbAPI.update(dbAPI.ref(db,'rooms/'+room+(path?'/'+path:'')),value);},async transact(path,fn){return dbAPI.runTransaction(dbAPI.ref(db,'rooms/'+room+'/'+path),fn,{applyLocally:false});},async presence(person){const ref=dbAPI.ref(db,'rooms/'+room+'/participants/'+uid);const cleanup=dbAPI.onDisconnect(ref);await cleanup.remove();disconnects.push(cleanup);await dbAPI.set(ref,{...person,lastSeen:now()});},async armRelease(){const cleanup=dbAPI.onDisconnect(dbAPI.ref(db,'rooms/'+room+'/controller'));await cleanup.remove();disconnects.push(cleanup);},async close(){for(const d of disconnects)await d.cancel().catch(()=>{});if(uid)await api.set('participants/'+uid,null).catch(()=>{});dbAPI.goOffline(db);await authAPI.signOut(auth);}};
 return api;
}
function demoTransport(room,master){
 const key='sdai-demo-room:'+room,uid=master?'demo-master':'demo-'+crypto.randomUUID(),channel=new BroadcastChannel(key);let connected=true;const watchers=new Set();
 const read=()=>JSON.parse(localStorage.getItem(key)||'null');
 const emit=()=>{for(const f of watchers)f(read());};
 const save=data=>{localStorage.setItem(key,JSON.stringify(data));channel.postMessage('changed');emit();};
 channel.onmessage=emit;window.addEventListener('storage',e=>{if(e.key===key)emit();});
 const locked=fn=>navigator.locks?navigator.locks.request(key,fn):Promise.resolve().then(fn);
 const authorize=(path,data,value)=>{
  if(master)return;
  if(path==='participants/'+uid||path.startsWith('participants/'+uid+'/'))return;
  if(path==='requests/'+uid||path.startsWith('requests/')&&ownsControl(data,uid))return;
  if(path==='view'&&ownsControl(data,uid)&&!data.gm?.blocked&&value?.author===uid)return;
  if(path==='controller'){
   const current=data.controller;
   if(value===null&&current?.uid===uid)return;
   if(value&&data.gm?.blocked!==true&&value.leaseUntil>Date.now()&&value.leaseUntil<=Date.now()+60000){
    if(value.uid===uid&&(!current||current.uid===uid||current.leaseUntil<Date.now()))return;
    if(current?.uid===uid&&data.participants?.[value.uid])return;
   }
  }
  throw Error('Operação não autorizada para este participante.');
 };
 const api={mode:'demo',room,uid,now:()=>Date.now(),get connected(){return connected},async login(){return uid},async read(){return read()},subscribe(fn){watchers.add(fn);fn(read());return()=>watchers.delete(fn)},watchConnection(fn){fn(connected);return()=>{}},async set(path,value){await locked(()=>{const data=read()||initialRoom();authorize(path,data,value);const parts=path.split('/');let obj=data;for(const k of parts.slice(0,-1))obj=obj[k]||(obj[k]={});if(value===null)delete obj[parts.at(-1)];else obj[parts.at(-1)]=value;save(data);});},async patch(path,values){await locked(()=>{const data=read()||initialRoom();authorize(path,data,values);let obj=data;for(const k of path.split('/').filter(Boolean))obj=obj[k]||(obj[k]={});Object.assign(obj,values);save(data);});},async transact(path,fn){return locked(()=>{const data=read()||initialRoom();const result=fn(data[path]||null);if(result===undefined)return {committed:false};authorize(path,data,result);if(result===null)delete data[path];else data[path]=result;save(data);return {committed:true};});},async presence(person){await api.set('participants/'+uid,{...person,lastSeen:Date.now()})},async armRelease(){},async close(){const data=read();if(data?.controller?.uid===uid)await api.set('controller',null);await api.set('participants/'+uid,null);connected=false;channel.close();}};
 return api;
}
