export const SECTORS=['AERO','COM','LOG','ENE','PES','HAB','CONT','LEG'];
export const DEFAULT_CHARACTERS=['Janel Hakurei','Hiriko','Onaya Keiko'];
export function initialRoom(){return {gm:{alert:'NORMAL',blocked:false,blockMessage:'Acesso suspenso por determinação da Segurança SDAI.',characters:DEFAULT_CHARACTERS,notices:{}},participants:{},requests:{}};}
export function roomCode(value){const r=String(value||'osaka').toLowerCase().trim();if(!/^[a-z0-9-]{3,32}$/.test(r))throw Error('Use um código de sala com 3 a 32 letras, números ou hífens.');return r;}
export function activeController(room,now=Date.now()){const c=room?.controller;return c&&c.leaseUntil>now?c:null;}
export function ownsControl(room,uid,now=Date.now()){return activeController(room,now)?.uid===uid;}
export function claimControl(current,uid,character,now){if(current&&current.leaseUntil>now&&current.uid!==uid)return;return {uid,character:String(character).slice(0,60),leaseUntil:now+45000};}
export function scrubView(value){
 if(!value||typeof value!=='object')return null;
 const v=JSON.parse(JSON.stringify(value));
 if(v.input?.secret){v.input.value='';v.input.length=Math.min(5,Math.max(0,Number(v.input.length)||0));}
 if(v.console){v.console.lines=Array.isArray(v.console.lines)?v.console.lines.slice(-180).map(x=>({kind:['system','muted','input','error','success','warning'].includes(x.kind)?x.kind:'system',text:String(x.text||'').slice(0,8000)})):[];v.console.history=Array.isArray(v.console.history)?v.console.history.slice(-60).map(x=>String(x).slice(0,160)):[];}
 return v;
}
export function cleanNotice(title,body,tag){title=String(title).trim();body=String(body).trim();if(!title||!body)throw Error('Preencha o título e o comunicado.');if(title.length>120||body.length>4000)throw Error('Use até 120 caracteres no título e 4.000 no texto.');return {title,body,tag:['COMUNICADO','SEGURANÇA','ORDEM PRIORITÁRIA','P&D','LOGÍSTICA'].includes(tag)?tag:'COMUNICADO',date:'Agora',createdAt:Date.now()};}
export function validateGM(gm){return {...gm,alert:['NORMAL','ALERTA','BLOQUEIO'].includes(gm?.alert)?gm.alert:'NORMAL',blocked:gm?.blocked===true,characters:(Array.isArray(gm?.characters)?gm.characters:DEFAULT_CHARACTERS).map(x=>String(x).trim().slice(0,60)).filter(Boolean).slice(0,20)};}
