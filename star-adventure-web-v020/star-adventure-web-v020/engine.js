const crypto=require('crypto');
const W=require('./public/shared');
const L=require('./levels');
const uid=()=>crypto.randomBytes(16).toString('hex');
const active=r=>[...r.players.values()].filter(p=>p.connected||p.bot);
const alive=r=>active(r).filter(p=>!p.down);
const near=(p,x,d=75)=>Math.abs(p.x-x)<d&&p.y>270;
const held=(p)=>p.input?.interact&&!p.down;
const plate=(r,x)=>alive(r).some(p=>Math.abs(p.x-x)<30&&Math.abs(p.y-W.floor(r.stage,x))<16);
function player(name,token=uid(),bot=false){return {token,name:String(name||'玩家').trim().slice(0,16),char:null,bot,connected:true,x:120,y:420,vx:0,vy:0,grounded:true,down:false,input:{},seq:0,checkpoint:120,warp:0,carry:false};}
function room(code,p){return {code,hostToken:p.token,momoToken:null,players:new Map([[p.token,p]]),started:false,fragments:[],stage:{id:0},time:0,dev:{assist:false,follow:true},events:[],emptySince:null};}
function event(r,text){r.events.push({type:'toast',text});}
function warp(p,x,y=420){p.x=x;p.y=y;p.vx=0;p.vy=0;p.kick=0;p.warp++;p.input={};p.grounded=true;}
function revive(p){p.flat=false;p.respawnAt=null;p.down=false;p.downUntil=0;p.rescue=0;warp(p,p.checkpoint);}
function down(r,p,why='啪！三秒後又是一條好漢。'){if(p.down)return;p.down=true;p.downUntil=r.time+3;p.rescue=0;p.carry=false;event(r,p.char==='小桃'?'系統：這個人等等還有用，不能死。':why);}
function enter(r,id){
 r.started=true;r.epoch=(r.epoch||0)+1;
 r.stage={id,epoch:r.epoch,at:r.time,cleared:false,checkpoint:120};
 const s=r.stage;
 if(id===1)Object.assign(s,{plates:[false,false,false],gateOpen:false,leverOn:false,crossed:[],bridgeBroken:false});
 if([2,3,4,5].includes(id))L.init(r,module.exports);
 if(id==='ending'){
  const momo=r.players.get(r.momoToken); // Identity is persistent, including a disconnected target.
  const others=[...r.players.values()].filter(p=>p.token!==r.momoToken).slice(0,5);
  s.target=r.momoToken;s.targetName=momo?.char||'小桃';s.phase='white';s.sent=[];
  s.stars=Array.from({length:5},(_,i)=>({token:others[i]?.token||`sim-${i}`,name:others[i]?.name||`冒險夥伴 ${i+1}`,simulated:!others[i],sentAt:null,arrivedAt:null}));
 }
 for(const [i,p] of [...r.players.values()].entries()){p.down=false;p.flat=false;p.respawnAt=null;p.invulnerableUntil=0;p.carry=false;p.checkpoint=120;warp(p,id==='party'?750+i*55:120+i*48);}
 if(id!=='ending')event(r,id==='party'?'可以繼續玩！跑、跳、碰撞、放煙火。':typeof id==='number'?`LEVEL ${id} · ${W.TITLES[id]}`:'冒險完成。');
}
function addBots(r){while(r.players.size<6){const p=player(`測試假人 ${r.players.size}`,`bot-${uid()}`,true);p.char=W.CHARS.find(c=>![...r.players.values()].some(q=>q.char===c));r.players.set(p.token,p);if(p.char==='小桃')r.momoToken=p.token;}r.dev.assist=true;if(r.stage.id===2)L.relayRound(r,module.exports);}

function ensureMomo(r){if(r.momoToken&&r.players.has(r.momoToken))return;
 let p=[...r.players.values()].find(p=>p.char==='小桃')||[...r.players.values()].find(p=>p.bot);
 if(!p&&r.players.size<6){p=player('測試小桃',`bot-${uid()}`,true);r.players.set(p.token,p);}
 if(!p)throw Error('六位真人已滿，請在大廳由一位玩家選擇小桃。');p.char='小桃';r.momoToken=p.token;}
function grant(r,id){if(!r.fragments.includes(id))r.fragments.push(id);r.fragments.sort();}
function clear(r,id){if(r.stage.cleared)return;grant(r,id);r.stage.cleared=true;r.stage.clearAt=r.time;event(r,`⭐ 星星碎片${['','①','②','③','④'][id]} GET！`);}
function gather(r,x,d=160){const a=active(r);return a.length>0&&a.every(p=>!p.down&&near(p,x,d));}
function input(r,p,data){if(!data||typeof data!=='object')return;p.seq=Number.isSafeInteger(data.seq)?data.seq:p.seq;if(!data.interact)p.interactArmed=true;p.input={left:!!data.left,right:!!data.right,jump:!!data.jump,interact:!!data.interact};p.lastInput=r.time;}
function puzzle(r,p,data={}){return L.action(r,p,data,module.exports);}
function interact(r,p){
 const s=r.stage;if(p.down)return {ok:false,error:'等待救援或三秒復活。'};
 if(s.cleared){if(p.token!==r.hostToken)return {ok:false,error:'等房主按下一關。'};enter(r,s.id+1);return {ok:true};}
 if(s.id===1&&near(p,1200)&&s.gateOpen){s.leverOn=true;event(r,'喀！遠端拉桿鎖住大門，壓板的夥伴可以通過！');}
 if([2,3,4].includes(s.id))return L.action(r,p,{},module.exports);
 if(s.id==='ending')return sendStar(r,p.token);
 return {ok:true};
}
function sendStar(r,t){const s=r.stage;if(s.id!=='ending'||s.phase!=='send'||t===r.momoToken)return {ok:false,error:'還不能送出。'};const star=s.stars.find(x=>x.token===t);if(!star||star.sentAt!==null)return {ok:false,error:'已送出。'};star.sentAt=r.time;return {ok:true};}
function bots(r,dt){
 const s=r.stage,host=r.players.get(r.hostToken),bs=active(r).filter(p=>p.bot);if(!host||!r.dev.follow)return;
 for(const [i,b] of bs.entries()){if(b.flat||b.down)continue;let target=host.x-45-i*30;if(s.id===1&&!s.leverOn)target=i<3?[650,770,890][i]:s.gateOpen?1200:host.x;if(s.id===1&&host.x>2600)target=2730+i*15;
 b.input={left:b.x>target+5,right:b.x<target-5,interact:!!host.input.interact};if(b.grounded&&W.floor(s,b.x+(b.input.right?65:-65))>700)b.input.jump=true;if(s.id===1&&s.gateOpen&&b.x>1090&&r.dev.assist)interact(r,b);
 if(r.dev.assist&&s.id!==1&&Math.abs(b.x-host.x)>700)warp(b,host.x-40-i*12,host.y);
 }
 if(!r.dev.assist)return;
 if(s.id===2){if(s.mode==='waiting'){const ri=s.readers.findIndex(t=>r.players.get(t)?.bot);if(ri>=0){const b=r.players.get(s.readers[ri]);warp(b,W.D.caves[s.cave-1].readers[ri]);L.action(r,b,{},module.exports);}}const b=r.players.get(s.executors[s.leg]);if(b?.bot&&['discussion','input'].includes(s.mode)&&r.time-(s.botStep||0)>.4){warp(b,W.D.caves[s.cave-1].pads[s._legs[s.leg].truth[s.entered.length]]);L.action(r,b,{},module.exports);s.botStep=r.time;}}
 if(s.id===3){bs.forEach((b,i)=>{if(s.finalCheckpoint){warp(b,s.cargo.x-82-i*3,W.floor(s,s.cargo.x-82));b.input={right:!!host.input.right};}else if(i<3){const k=W.D.cargo.switches.filter(k=>!s.switches[k.id])[i];if(k){warp(b,k.x,k.y);L.action(r,b,{},module.exports);b.input={};}}else{warp(b,s.cargo.x-82-i*3,W.floor(s,s.cargo.x-82));b.input={right:!!host.input.right};}});}
 if(s.id===4)for(const b of bs){const fallen=active(r).find(p=>p.flat);if(fallen){warp(b,fallen.x+40,fallen.y);b.input={interact:true};}else if(host.x>3500){warp(b,W.D.boss.buttons[s.participants.indexOf(b.token)]);L.action(r,b,{},module.exports);}}
 if(s.id===5&&host.x>5390)bs.forEach((b,i)=>{warp(b,5450+i*30,350);b.input={interact:!!host.input.interact};});
 if(s.id==='ending'&&s.phase==='send')s.stars.forEach((st,i)=>{const p=r.players.get(st.token);if((p?.bot||st.simulated)&&r.time-s.at>18+i*.65&&st.sentAt===null)st.sentAt=r.time;});
}
function tick(r,dt){
 r.time+=dt;if(!r.started)return;const s=r.stage;
 for(const p of r.players.values()){if(p.down&&!p.respawnAt){const rescuers=alive(r).filter(q=>q.token!==p.token&&held(q)&&Math.abs(q.x-p.x)<80&&Math.abs(q.y-p.y)<85);p.rescue=rescuers.length?(p.rescue||0)+dt:0;if(p.rescue>=2||r.time>=p.downUntil)revive(p);}if(!p.bot&&r.time-(p.lastInput||0)>.8)p.input={};}
 if([3,4,5].includes(s.id))L.survival(r,dt,module.exports);
 bots(r,dt);
 for(const p of active(r)){W.step(p,p.input,s,dt,r.time);if(p.cargoHit&&!p.down){L.flatten(r,p,module.exports);p.kick=Math.sign(s.cargo.vx)*120;}
 if(p.y>680){if([3,4,5].includes(s.id)){if(!p.down)L.die(r,p,module.exports);}else down(r,p,'咻——掉下去了，三秒後回到檢查點。');}}
 if(s.cleared)return;
 if(s.id===1){s.plates=[650,770,890].map(x=>plate(r,x));s.gateOpen=s.leverOn||s.plates.every(Boolean);
 for(const p of alive(r)){if(p.x>1100)p.checkpoint=Math.max(p.checkpoint,1180);if(p.x>1695)p.checkpoint=1740;
 if(p.x>1420&&!s.crossed.includes(p.token)){s.crossed.push(p.token);if(s.crossed.length>=4&&!s.bridgeBroken){s.bridgeBroken=true;event(r,'喀啦！第四位勇者：為什麼剛好是我！');}}}
 if(s.leverOn&&gather(r,2760,160))clear(r,1);
 }
 if([2,3,4,5].includes(s.id))L.tick(r,dt,module.exports);
 if(s.id==='ending'){const e=r.time-s.at;
 s.phase=e<5?'white':e<8?'whiteText':e<9.5?'ellipsis':e<12.5?'error':e<14.5?'search':e<16.5?'recipient':'send';
 s.stars.forEach(st=>{if(st.sentAt!==null&&r.time-st.sentAt>=1.2&&st.arrivedAt===null){st.arrivedAt=r.time;s.sent.push(st.token);}});
 if(s.stars.every(st=>st.arrivedAt!==null)){s.mergeAt??=r.time;s.phase=r.time-s.mergeAt<2?'merge':'celebrate';if(r.time-s.mergeAt>9)enter(r,'party');}
 }
 if(s.id==='party'){const ps=alive(r);for(let i=0;i<ps.length;i++)for(let j=i+1;j<ps.length;j++){const a=ps[i],b=ps[j];if(Math.abs(a.x-b.x)<43&&Math.abs(a.y-b.y)<40){const d=a.x<=b.x?-1:1;a.x=W.clamp(a.x+d*1.5,26,1774);b.x=W.clamp(b.x-d*1.5,26,1774);}}}
}
function dev(r,p,{action,value}={}){
 if(r.hostToken!==p.token)return {ok:false,error:'只有房主能使用 DEV。'};
 try{const custom=L.dev(r,p,{action,value},module.exports);if(custom)return custom;if(action==='resetLevel')return resetLevel(r,p);if(action==='bots')addBots(r);else if(action==='teleport')for(const [i,q] of active(r).entries()){q.down=false;warp(q,p.x+i*8,p.y);}
 else if(action==='revive')for(const q of r.players.values())revive(q);
 else if(action==='jump'&&[1,2,3,4,5].includes(value))enter(r,value);
 else if(action==='fragments')r.fragments=[1,2,3,4];
 else if(action==='momo')ensureMomo(r);
 else if(action==='ending'){ensureMomo(r);r.dev.assist=true;enter(r,'ending');}
 else if(action==='assist')r.dev.assist=!!value;
 else if(action==='follow')r.dev.follow=!!value;
 else if(action==='plates'){active(r).filter(q=>q.bot).slice(0,3).forEach((q,i)=>warp(q,[650,770,890][i]));}
 else if(action==='regroup'){const x={1:2730,2:5080,3:5390,4:3600,5:5480,party:900}[r.stage.id]||p.x;active(r).forEach((q,i)=>warp(q,x+i*5,W.floor(r.stage,x)));}
 else if(action==='checkpoint')warp(p,p.checkpoint,W.floor(r.stage,p.checkpoint));
 else return {ok:false,error:'未知 DEV 指令。'};
 return {ok:true};}catch(e){return {ok:false,error:e.message};}
}
function snapshot(r){return {code:r.code,hostToken:r.hostToken,started:r.started,stage:r.stage,fragments:r.fragments,dev:r.dev,time:r.time,players:[...r.players.values()].map(({socketId,input,lastInput,...p})=>p)};}
function resetLevel(r,p){if(p.token!==r.hostToken||!r.started)return {ok:false,error:'只有房主能重置目前關卡。'};const id=r.stage.id;r.fragments=r.fragments.filter(n=>n!==id);enter(r,id);return {ok:true};}
function resetGame(r,p){if(p.token!==r.hostToken)return {ok:false,error:'只有房主能 RESET GAME。'};r.started=false;r.fragments=[];r.epoch=(r.epoch||0)+1;r.stage={id:0,epoch:r.epoch};r.events=[];r.dev.assist=false;for(const q of r.players.values()){q.down=q.flat=false;q.respawnAt=null;q.checkpoint=120;warp(q,120);}return {ok:true};}
module.exports={L,event,resetLevel,resetGame,W,uid,player,room,active,alive,near,held,plate,warp,revive,down,enter,addBots,ensureMomo,grant,clear,gather,input,puzzle,interact,sendStar,tick,dev,snapshot};
