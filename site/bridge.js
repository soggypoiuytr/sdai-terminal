// Same-origin adapter. No media or password values are included in shared snapshots.
(()=>{
 const keys=['page','dae','sector','osakaZoom','dbCategory','record','query','asiaView','afgConflictOpen'];
 let readOnly=true,remote=false,onChange=()=>{},gmSignature='',lastScroll='',started=false;
 const initialNav=Object.fromEntries(keys.map(k=>[k,state[k]??null])),initialLines=asConsole.lines.map(x=>({...x}));
 const canonical=v=>{if(v===null||v===undefined)return undefined;if(Array.isArray(v))return v.length?v.map(canonical):undefined;if(typeof v==='object'){const obj=Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])]).filter(([,x])=>x!==undefined));return Object.keys(obj).length?obj:undefined;}return v;};
 const shape=v=>JSON.stringify(canonical({...v,input:undefined,scroll:undefined,author:undefined,version:undefined}));
 const oldRender=render;
 render=function(){oldRender();if(!remote&&started)queueMicrotask(()=>onChange());};
 const capture=()=>{
  const input=document.querySelector('#as-cmd-input'),secret=!!asConsole.pending;
  return {state:Object.fromEntries(keys.map(k=>[k,state[k]??null])),relations:{mode:factionMapMode,focus:factionMapFocus,edge:factionMapEdge},security:JSON.parse(JSON.stringify(asSecurityState)),console:{lines:asConsole.lines.slice(-180),pending:asConsole.pending,history:asConsole.history.slice(-60),historyIndex:asConsole.historyIndex},scroll:{x:scrollX,y:scrollY,results:document.querySelector('#results')?.scrollTop||0},input:{secret,value:secret?'':input?.value||'',length:secret?Math.min(5,input?.value.length||0):0}};
 };
 const apply=view=>{
  if(!view?.state)return;remote=true;
  try{
   const before=shape(capture()),next=shape(view);
   for(const k of keys)state[k]=view.state[k]??initialNav[k];
   if(view.relations){factionMapMode=view.relations.mode||'files';factionMapFocus=view.relations.focus||'SDAI';factionMapEdge=Number.isInteger(view.relations.edge)?view.relations.edge:-1;}
   for(const s of DB.sectors)asSecurityState[s.id].online=view.security?.[s.id]?.online!==false;
   if(view.console){asConsole.lines=view.console.lines||[];asConsole.pending=view.console.pending||null;asConsole.history=view.console.history||[];asConsole.historyIndex=view.console.historyIndex||0;}
   // A shared update uses the existing renderer; local-only audio preference is retained.
   if(before!==next)render();
   const input=document.querySelector('#as-cmd-input');if(input&&view.input)input.value=view.input.secret?'•'.repeat(Math.min(5,view.input.length||0)):view.input.value||'';
   requestAnimationFrame(()=>{window.scrollTo(view.scroll?.x||0,view.scroll?.y||0);const list=document.querySelector('#results');if(list)list.scrollTop=view.scroll?.results||0;});
  }finally{remote=false;}
 };
 const setGM=gm=>{
  const signature=JSON.stringify(gm);if(signature===gmSignature)return;const previous=state.alert;gmSignature=signature;remote=true;
  try{state.alert=gm.alert||'NORMAL';state.revoked=gm.blocked===true;DB.notices=Object.values(gm.notices||{}).sort((a,b)=>b.createdAt-a.createdAt).map(({title,body,tag,date})=>({title:escapeHTML(title||''),body:escapeHTML(body||''),tag:escapeHTML(tag||''),date:escapeHTML(date||'')})).concat(baseNotices);render();if(previous!==state.alert){if(state.alert==='ALERTA')showIntrusionBanner();setLockdownPhase(state.alert==='BLOQUEIO');syncInvasionAlarm();}}finally{remote=false;}
 };
 const baseNotices=DB.notices.map(x=>({...x}));
 const guard=e=>{
  if(e.target.closest?.('#audio-toggle,#lockdown-mute'))return;
  if(readOnly){if(e.type==='keydown'&&(e.key==='Tab'||!e.target.closest?.('input,textarea,select')&&['PageDown','PageUp','ArrowDown','ArrowUp','Home','End'].includes(e.key)))return;e.preventDefault();e.stopImmediatePropagation();return;}
  if(!remote)for(const delay of [0,220,800])setTimeout(()=>onChange(),delay);
 };
 for(const name of ['click','keydown','submit','input','change'])window.addEventListener(name,guard,true);
 window.addEventListener('scroll',()=>{if(!readOnly&&!remote){const s=scrollX+','+scrollY;if(s!==lastScroll){lastScroll=s;onChange();}}},true);
 const start=()=>{document.querySelector('#boot').classList.add('hidden');document.querySelector('#app').classList.remove('hidden');started=true;remote=true;render();remote=false;};
 const reset=()=>{remote=true;try{Object.assign(state,initialNav);for(const s of DB.sectors)asSecurityState[s.id].online=true;asConsole.lines=initialLines.map(x=>({...x}));asConsole.pending=null;asConsole.history=[];asConsole.historyIndex=0;render();window.scrollTo(0,0);}finally{remote=false;}};
 window.SDAIBridge={capture,apply,setGM,reset,setReadOnly:flag=>{const was=readOnly;readOnly=!!flag;if(was&&!readOnly&&asConsole.pending){const input=document.querySelector('#as-cmd-input');if(input)input.value='';}document.body.dataset.sharedRole=readOnly?'spectator':'operator'},onChange:fn=>{onChange=fn||(()=>{})},start};
 if(window.parent===window){document.body.innerHTML='<p style="padding:30px;color:white;background:#142b36">Abra o terminal pela página principal da sessão.</p>';}else window.parent.postMessage({type:'sdai-bridge-ready'},location.origin);
})();
