const crypto=require('crypto');
const W=require('./public/shared');
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
function revive(p){p.down=false;p.downUntil=0;p.rescue=0;warp(p,p.checkpoint);}
function down(r,p,why='啪！三秒後又是一條好漢。'){if(p.down)return;p.down=true;p.downUntil=r.time+3;p.rescue=0;p.carry=false;event(r,p.char==='小桃'?'系統：這個人等等還有用，不能死。':why);}
function pairs(r){const a=active(r),out=[];for(let i=0;i<3;i++){out.push({members:a.slice(i*2,i*2+2).map(p=>p.token),seq:[0,1,2,3].map((_,j)=>(j+i)%4),entered:[],symbolSolved:false,solved:false,fail:0});}return out;}
function enter(r,id){
 r.started=true;r.epoch=(r.epoch||0)+1;
 r.stage={id,epoch:r.epoch,at:r.time,cleared:false,checkpoint:120};
 const s=r.stage;
 if(id===1)Object.assign(s,{plates:[false,false,false],gateOpen:false,leverOn:false,crossed:[],bridgeBroken:false});
 if(id===2)s.pairs=pairs(r);
 if(id===3)Object.assign(s,{cargo:{x:280,y:365,r:55,vx:0,vy:0,angle:0},seesaw:0,plates:[false,false,false],fanPassed:false,delivered:false});
 if(id===4)Object.assign(s,{boss:{x:1750,y:420,mode:'stalk',until:r.time+4,attack:0,target:null},mechs:[0,0],cannons:[{x:700,ammo:0,fired:false},{x:1250,ammo:0,fired:false},{x:1800,ammo:0,fired:false}],hits:0,mobs:[],fake:null});
 if(id===5)Object.assign(s,{plates:[false,false,false],plateLatch:false,clueSolved:false,clueEntered:[],star:{x:1490,y:384,r:36,vx:0,vy:0,angle:0},starDone:false,sockets:0,chest:false,hold:0});
 if(id==='ending'){
  const momo=r.players.get(r.momoToken); // Identity is persistent, including a disconnected target.
  const others=[...r.players.values()].filter(p=>p.token!==r.momoToken).slice(0,5);
  s.target=r.momoToken;s.targetName=momo?.char||'小桃';s.phase='complete';s.sent=[];
  s.stars=Array.from({length:5},(_,i)=>({token:others[i]?.token||`sim-${i}`,name:others[i]?.name||`冒險夥伴 ${i+1}`,simulated:!others[i],sentAt:null,arrivedAt:null}));
 }
 for(const [i,p] of [...r.players.values()].entries()){p.down=false;p.carry=false;p.checkpoint=120;warp(p,id==='party'?750+i*55:120+i*48);}
 event(r,id==='party'?'可以繼續玩！跑、跳、碰撞、放煙火。':typeof id==='number'?`LEVEL ${id} · ${W.TITLES[id]}`:'冒險完成。');
}
function addBots(r){while(r.players.size<6){const p=player(`測試假人 ${r.players.size}`,`bot-${uid()}`,true);p.char=W.CHARS.find(c=>![...r.players.values()].some(q=>q.char===c));r.players.set(p.token,p);if(p.char==='小桃')r.momoToken=p.token;}r.dev.assist=true;if(r.stage.id===2){const list=active(r);r.stage.pairs.forEach((q,i)=>{q.members=list.slice(i*2,i*2+2).map(p=>p.token);});}}
function ensureMomo(r){if(r.momoToken&&r.players.has(r.momoToken))return;
 let p=[...r.players.values()].find(p=>p.char==='小桃')||[...r.players.values()].find(p=>p.bot);
 if(!p&&r.players.size<6){p=player('測試小桃',`bot-${uid()}`,true);r.players.set(p.token,p);}
 if(!p)throw Error('六位真人已滿，請在大廳由一位玩家選擇小桃。');p.char='小桃';r.momoToken=p.token;}
function grant(r,id){if(!r.fragments.includes(id))r.fragments.push(id);r.fragments.sort();}
function clear(r,id){if(r.stage.cleared)return;grant(r,id);r.stage.cleared=true;r.stage.clearAt=r.time;event(r,`⭐ 星星碎片${['','①','②','③','④'][id]} GET！`);}
function gather(r,x,d=160){const a=active(r);return a.length>0&&a.every(p=>!p.down&&near(p,x,d));}
function input(r,p,data){if(!data||typeof data!=='object')return;p.seq=Number.isSafeInteger(data.seq)?data.seq:p.seq;p.input={left:!!data.left,right:!!data.right,jump:!!data.jump,interact:!!data.interact};p.lastInput=r.time;}
function puzzle(r,p,{kind,value}={}){
 const s=r.stage;if(p.down)return {ok:false,error:'扁掉了，稍等復活。'};
 if(s.id===2){const i=s.pairs.findIndex(q=>q.members.includes(p.token)),q=s.pairs[i];if(!q||!near(p,740+i*800,250))return {ok:false,error:'到你的配對控制台旁邊。'};
 const operator=q.members[1]||q.members[0];if(p.token!==operator)return {ok:false,error:'你負責讀提示，請隊友按按鈕。'};
 if(kind==='symbol'&&!q.symbolSolved){if(value!==q.seq[q.entered.length]){q.entered=[];q.fail++;p.vy=-690;p.kick=-250;p.warp++;event(r,'BOING！答案不對，彈簧送你一程！');}else{q.entered.push(value);if(q.entered.length===4)q.symbolSolved=true;}}
 if(kind==='color'&&q.symbolSolved&&!q.solved){if(value==='red'){q.solved=true;event(r,`第 ${i+1} 組石門解鎖！集合吧。`);}else{q.fail++;p.vy=-690;p.warp++;event(r,'BOING！記得第三塊石碑：只有紅色牌說真話。');}}
 return {ok:true};}
 if(s.id===5&&kind==='tower'&&near(p,1070,180)&&!s.clueSolved){const a=active(r),operator=a[1]||a[0];if(p.token!==operator.token)return {ok:false,error:'由第二位冒險者操作星座鍵盤。'};const seq=[3,1,0];if(value===seq[s.clueEntered.length]){s.clueEntered.push(value);if(s.clueEntered.length===3)s.clueSolved=true;}else{s.clueEntered=[];p.vy=-580;p.warp++;event(r,'星座順序錯了！BOING！');}return {ok:true};}
 return {ok:false,error:'目前無法操作這個機關。'};
}
function interact(r,p){
 const s=r.stage;if(p.down)return {ok:false,error:'等待救援或三秒復活。'};
 if(s.cleared){if(p.token!==r.hostToken)return {ok:false,error:'等房主按下一關。'};enter(r,s.id+1);return {ok:true};}
 if(s.id===1&&near(p,1200)&&s.gateOpen){s.leverOn=true;event(r,'喀！遠端拉桿鎖住大門，壓板的夥伴可以通過！');}
 if(s.id===4&&!s.fake){
  if((near(p,150)||near(p,2460))&&!p.carry){p.carry=true;return {ok:true};}
  const c=s.cannons.find(c=>near(p,c.x)&&!c.fired);
  if(c){if(p.carry&&c.ammo<2){p.carry=false;c.ammo++;event(r,'彈藥送達！每門砲需要兩份彈藥。');}
  else if(c.ammo===2&&s.mechs.every(t=>t>r.time)&&Math.abs(s.boss.x-c.x)<540){c.fired=true;s.hits++;s.shot={x:c.x,target:s.boss.x,at:r.time};event(r,`砰！命中 ${s.hits} / 3`);if(s.hits===3){s.fake='defeated';s.fakeAt=r.time;}}
  else return {ok:false,error:c.ammo<2?'需要兩位搬運夥伴送來兩份彈藥。':s.mechs.some(t=>t<=r.time)?'左右機關要同時啟動（按住 E）。':'請一位夥伴把 BOSS 引到這門砲附近。'};}
 }
 if(s.id==='ending')return sendStar(r,p.token);
 return {ok:true};
}
function sendStar(r,t){const s=r.stage;if(s.id!=='ending'||s.phase!=='send'||t===r.momoToken)return {ok:false,error:'還不能送出。'};const star=s.stars.find(x=>x.token===t);if(!star||star.sentAt!==null)return {ok:false,error:'已送出。'};star.sentAt=r.time;return {ok:true};}
function bots(r,dt){
 const s=r.stage,host=r.players.get(r.hostToken),bs=active(r).filter(p=>p.bot);if(!host)return;
 bs.forEach((b,i)=>{b.input={};if(!r.dev.follow||s.cleared)return;let target=host.x-50-i*42;
 if((s.id===1||s.id===2)&&host.x>2600)target=(s.id===1?2730:2820)+i*15;
 if(s.id===1&&!s.leverOn){if(i<3)target=[650,770,890][i];else if(s.gateOpen)target=1200;}
 if(s.id===3&&!s.fanPassed&&s.cargo.x>1640&&i<3)target=[1760,1860,1960][i];
 if(s.id===4&&!s.fake){const cannon=s.cannons.find(c=>!c.fired);const lure=cannon?s.boss.x+Math.sign(cannon.x-s.boss.x)*140:s.boss.x;target=i===0?350:i===1?2240:i===2?lure:i===3?150:2460;}
 b.input={left:b.x>target+5,right:b.x<target-5,jump:false,interact:true};
 if(b.grounded&&(W.floor(s,b.x+(b.input.right?55:-55))>700||(s.id===3&&Math.abs(b.x-s.cargo.x)<85)))b.input.jump=true;
 if(Math.abs(b.x-target)>600&&r.dev.assist&&s.id!==1)warp(b,W.clamp(target,35,W.WIDTH[s.id]-35));
 });
 if(!r.dev.assist||!r.dev.follow)return;
 if(s.id===1&&s.gateOpen&&!s.leverOn){const b=bs.find(b=>b.x>1090);if(b)interact(r,b);}
 if(s.id===2){s.pairs.forEach((q,i)=>{const members=q.members.map(t=>r.players.get(t));if(members.length&&members.every(p=>p.bot)){q.symbolSolved=true;q.solved=true;}else if(members[1]?.bot&&near(members[0],740+i*800,250)){q.symbolSolved=true;q.solved=true;}});}
 if(s.id===3){if(s.cargo.x>1180&&s.cargo.x<1650)bs.slice(0,3).forEach((b,i)=>{const bx=s.cargo.x<1435?1550+i*20:1265+i*22;warp(b,bx,W.floor(s,bx));b.input={};});bs.filter((b,i)=>!(s.cargo.x>1640&&i<3)&&!(s.cargo.x>1180&&s.cargo.x<1650&&i<3)).forEach((b,i)=>{if(near(host,s.cargo.x,170)){warp(b,s.cargo.x-82-i*6);b.input={right:true,interact:true};}});}
 if(s.id===4&&!s.fake){bs.forEach((b,i)=>{if(i<2&&near(b,i===0?350:2240))b.input.interact=true;});const c=s.cannons.find(c=>!c.fired);if(c&&r.time-(s.botAmmoAt||0)>1.5){const b=bs[3+((s.botTrip||0)%2)]||bs[3]||bs[2];if(b){if(!b.carry){warp(b,(s.botTrip||0)%2?2460:150);interact(r,b);}else{warp(b,c.x);interact(r,b);s.botTrip=(s.botTrip||0)+1;}s.botAmmoAt=r.time;}}}
 if(s.id===5){if(!s.plateLatch)bs.slice(0,3).forEach((b,i)=>warp(b,[330,430,530][i]));if(s.plateLatch&&!s.clueSolved&&near(host,1000,250)&&active(r)[1]?.bot){s.clueEntered=[3,1,0];s.clueSolved=true;}if(s.starDone&&host.x>2500)bs.forEach((b,i)=>{warp(b,2680+i*20);b.input={interact:!!host.input.interact};});}
 if(s.id==='ending'&&s.phase==='send')s.stars.forEach((st,i)=>{const p=r.players.get(st.token);if((p?.bot||st.simulated)&&r.time-s.at>14+i*.65&&st.sentAt===null)st.sentAt=r.time;});
}
function cargoTick(r,c,dt,small=false){
 if(c.falling){c.y+=340*dt;if(c.y>650){Object.assign(c,{x:1150,y:365,vx:0,vy:0,falling:false});event(r,'貨物滑下翹翹板了！已送回坡頂後的檢查點。');}return;}
 const s=r.stage,pushers=alive(r).filter(p=>Math.abs(p.x-c.x)<c.r+43&&p.y>c.y-25&&((p.x<c.x&&p.input.right)||(p.x>c.x&&p.input.left)));
 const force=pushers.reduce((v,p)=>v+(p.x<c.x?1:-1),0);
 let slope=(W.floor(s,c.x+2)-W.floor(s,c.x-2))/4;
 c.vx+= (force*(small?155:95)+slope*600)*dt;c.vx*=Math.exp(-1.5*dt);c.vx=W.clamp(c.vx,-270,270);
 if(!small&&c.x>560&&c.x<1030&&c.vx>205){c.vx=-165;event(r,'推太猛！粉紅貨物滾回來了！');}
 if(!small&&!s.fanPassed&&c.x>2070&&c.x<2300&&!s.plates.every(Boolean)){c.vx-=1000*dt;}
 const old=c.x;c.x=W.clamp(c.x+c.vx*dt,90,W.WIDTH[s.id]-120);c.angle+=(c.x-old)/c.r;
 const target=W.floor(s,c.x)-c.r;c.vy=(c.vy||0)+900*dt;c.y+=c.vy*dt;
 if(c.y>=target){c.y=target;c.vy=0;}
 if(!small&&c.x>1240&&c.x<1630&&Math.abs(s.seesaw)>.19){c.y+=300*dt;c.falling=true;}
 
 for(const p of alive(r)){if(!small&&Math.abs(p.x-c.x)<c.r*.78&&p.y>c.y-10&&Math.abs(c.vx)>105)down(r,p,'被粉紅貨物壓成餅了 😂');}
}
function bossTick(r,dt){const s=r.stage,b=s.boss;
 if(s.fake){const e=r.time-s.fakeAt;s.fake=e<2?'defeated':e<4?'phase2':e<7?'eating':'sitting';if(e>=4)b.x+=(2350-b.x)*Math.min(1,dt*.9);if(e>=8)clear(r,4);return;}
 const players=alive(r);if(!players.length)return;const target=players.reduce((a,p)=>Math.abs(p.x-b.x)<Math.abs(a.x-b.x)?p:a,players[0]);b.target=target.token;
 if(r.time>=b.until){const modes=['charge','slam','spit','roar'];b.mode=modes[b.attack++%4];b.start=r.time;b.until=r.time+4;b.aim=target.x;b.hit=[];b.from=b.x;}
 const age=r.time-(b.start||s.at);
 if(b.mode==='stalk')b.x+=Math.sign(target.x-b.x)*55*dt;
 if(b.mode==='charge'&&age>1.2&&age<2.7){b.x+=Math.sign(b.aim-b.from)*320*dt;for(const p of players)if(Math.abs(p.x-b.x)<90&&p.y>340)down(r,p,'BOSS 衝過來了！快跳！');}
 if(b.mode==='slam'){b.y=age>1&&age<2?240:420;if(age>=2&&age<2.35)for(const p of players)if(Math.abs(p.x-b.x)<260&&p.y>380)down(r,p,'屁股落地！被壓成一張貼紙。');}
 if(b.mode==='spit'&&age>1.2&&!b.spitDone){for(let i=0;i<3;i++)s.mobs.push({x:b.x,y:420,vx:(i-1)*95-50,until:r.time+6});b.spitDone=true;}if(b.mode!=='spit')b.spitDone=false;
 if(b.mode==='roar'&&age>1.2&&age<2.6)for(const p of players)p.kick=(p.x<b.x?-1:1)*300;
 b.x=W.clamp(b.x,430,2400);
 s.mobs=s.mobs.filter(m=>m.until>r.time);for(const m of s.mobs){m.x+=m.vx*dt;for(const p of players)if(Math.abs(p.x-m.x)<35&&p.y>385)down(r,p,'被小怪絆倒了！');}
 s.mechs=s.mechs.map((until,i)=>alive(r).some(p=>held(p)&&near(p,[350,2240][i],65))?r.time+.4:until);
}
function tick(r,dt){
 r.time+=dt;if(!r.started)return;const s=r.stage;
 for(const p of r.players.values()){if(p.down){const rescuers=alive(r).filter(q=>q.token!==p.token&&held(q)&&Math.abs(q.x-p.x)<80&&Math.abs(q.y-p.y)<85);p.rescue=rescuers.length?(p.rescue||0)+dt:0;if(p.rescue>=2||r.time>=p.downUntil)revive(p);}if(!p.bot&&r.time-(p.lastInput||0)>.8)p.input={};}
 bots(r,dt);
 for(const p of active(r)){W.step(p,p.input,s,dt,r.time);if(p.cargoHit&&!p.down)down(r,p,'被滾動貨物壓扁了 😂');
 if(p.y>680)down(r,p,'咻——掉下去了，三秒後回到檢查點。');}
 if(s.cleared)return;
 if(s.id===1){s.plates=[650,770,890].map(x=>plate(r,x));s.gateOpen=s.leverOn||s.plates.every(Boolean);
 for(const p of alive(r)){if(p.x>1100)p.checkpoint=Math.max(p.checkpoint,1180);if(p.x>1695)p.checkpoint=1740;
 if(p.x>1420&&!s.crossed.includes(p.token)){s.crossed.push(p.token);if(s.crossed.length>=4&&!s.bridgeBroken){s.bridgeBroken=true;event(r,'喀啦！第四位勇者：為什麼剛好是我！');}}}
 if(s.leverOn&&gather(r,2760,160))clear(r,1);
 }
 if(s.id===2){for(const p of alive(r)){const idx=s.pairs.findIndex(q=>q.members.includes(p.token));if(idx>=0&&p.x>500+idx*800)p.checkpoint=580+idx*800;}if(s.pairs.every(p=>p.solved)&&gather(r,2850,170))clear(r,2);}
 if(s.id===3){const weight=alive(r).filter(p=>p.x>1240&&p.x<1630&&Math.abs(p.y-W.floor(s,p.x))<15).reduce((v,p)=>v+(p.x-1435)*.0006,0);s.seesaw+= (W.clamp(weight+(s.cargo.x>1240&&s.cargo.x<1630?(s.cargo.x-1435)*.0015:0),-.24,.24)-s.seesaw)*Math.min(1,dt*2);
 // DEV counterweight helpers hold the board level; ordinary six-human play uses the weights above.
 if(r.dev.assist&&active(r).filter(p=>p.bot).length>=3&&s.cargo.x>1180&&s.cargo.x<1650)s.seesaw=0;
 s.plates=[1760,1860,1960].map(x=>plate(r,x));cargoTick(r,s.cargo,dt);if(s.cargo.x>2350)s.fanPassed=true;
 if(s.cargo.x>1130)alive(r).forEach(p=>{if(p.x>1100)p.checkpoint=1130;});
 if(s.cargo.x>2810&&!s.delivered){s.delivered=true;s.deliveredAt=r.time;s.cargo.vx=0;event(r,'箱子打開了……只有一朵蘑菇？');}
 if(s.delivered&&r.time-s.deliveredAt>3){event(r,'NPC：辛苦了！這個才是你們要的。');clear(r,3);}
 }
 if(s.id===4)bossTick(r,dt);
 if(s.id===5){for(const p of alive(r)){if(s.plateLatch&&p.x>700)p.checkpoint=750;if(s.clueSolved&&p.x>1300)p.checkpoint=1340;if(s.starDone&&p.x>2240)p.checkpoint=2300;}s.plates=[330,430,530].map(x=>plate(r,x));if(s.plates.every(Boolean))s.plateLatch=true;
 cargoTick(r,s.star,dt,true);if(s.star.x>2050)s.starDone=true;
 const hx=1860+Math.sin(r.time*1.4)*200;s.hazardX=hx;s.hazardAwake=Math.sin(r.time*.9)>.45;for(const p of alive(r))if(s.hazardAwake&&Math.abs(p.x-hx)<38&&p.y>380)down(r,p,'星空小怪借過！');
 if(s.plateLatch&&s.clueSolved&&s.starDone&&r.fragments.length===4){if(!s.socketAt)s.socketAt=r.time;s.sockets=Math.min(4,Math.floor((r.time-s.socketAt)/.5));s.chest=s.sockets===4;}
 if(s.chest&&gather(r,2750,170)){s.hold=active(r).every(held)?s.hold+dt:0;if(s.hold>=3){s.flashAt??=r.time;if(r.time-s.flashAt>.65)enter(r,'ending');}}else s.hold=0;
 }
 if(s.id==='ending'){const e=r.time-s.at;
 s.phase=e<2?'complete':e<4?'missing':e<7?'error':e<9?'search':e<11?'recipient':'send';
 s.stars.forEach(st=>{if(st.sentAt!==null&&r.time-st.sentAt>=1.2&&st.arrivedAt===null){st.arrivedAt=r.time;s.sent.push(st.token);}});
 if(s.stars.every(st=>st.arrivedAt!==null)){s.mergeAt??=r.time;s.phase=r.time-s.mergeAt<2?'merge':'celebrate';if(r.time-s.mergeAt>9)enter(r,'party');}
 }
 if(s.id==='party'){const ps=alive(r);for(let i=0;i<ps.length;i++)for(let j=i+1;j<ps.length;j++){const a=ps[i],b=ps[j];if(Math.abs(a.x-b.x)<43&&Math.abs(a.y-b.y)<40){const d=a.x<=b.x?-1:1;a.x=W.clamp(a.x+d*1.5,26,1774);b.x=W.clamp(b.x-d*1.5,26,1774);}}}
}
function dev(r,p,{action,value}={}){
 if(r.hostToken!==p.token)return {ok:false,error:'只有房主能使用 DEV。'};
 try{if(action==='bots')addBots(r);else if(action==='teleport')for(const [i,q] of active(r).entries()){q.down=false;warp(q,p.x+i*8,p.y);}
 else if(action==='revive')for(const q of r.players.values())revive(q);
 else if(action==='jump'&&[1,2,3,4,5].includes(value))enter(r,value);
 else if(action==='fragments')r.fragments=[1,2,3,4];
 else if(action==='momo')ensureMomo(r);
 else if(action==='ending'){ensureMomo(r);r.dev.assist=true;enter(r,'ending');}
 else if(action==='assist')r.dev.assist=!!value;
 else if(action==='follow')r.dev.follow=!!value;
 else if(action==='pair'){if(r.stage.id===2)r.stage.pairs.forEach(q=>{q.entered=q.seq.slice();q.symbolSolved=q.solved=true;});if(r.stage.id===5){r.stage.clueEntered=[3,1,0];r.stage.clueSolved=true;}}
 else if(action==='plates'){const spots=r.stage.id===3?[1760,1860,1960]:r.stage.id===5?[330,430,530]:[650,770,890];active(r).filter(q=>q.bot).slice(0,3).forEach((q,i)=>warp(q,spots[i]));}
 else if(action==='regroup'){const x={1:2730,2:2820,3:2860,4:1350,5:2750,party:900}[r.stage.id]||p.x;active(r).forEach((q,i)=>warp(q,x+i*5));}
 else if(action==='checkpoint'){const x={1:1180,2:2700,3:1130,4:120,5:2300}[r.stage.id]||120;warp(p,x);}
 else return {ok:false,error:'未知 DEV 指令。'};
 return {ok:true};}catch(e){return {ok:false,error:e.message};}
}
function snapshot(r){return {code:r.code,hostToken:r.hostToken,started:r.started,stage:r.stage,fragments:r.fragments,dev:r.dev,time:r.time,players:[...r.players.values()].map(({socketId,input,lastInput,...p})=>p)};}
module.exports={W,uid,player,room,active,alive,near,held,plate,warp,revive,down,enter,addBots,ensureMomo,grant,clear,gather,input,puzzle,interact,sendStar,tick,dev,snapshot};
