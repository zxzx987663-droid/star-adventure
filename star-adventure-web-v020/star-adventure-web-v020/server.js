// Express / HTTP / Socket.IO baseline retained from Web Build 0.3.2.
const express=require('express'),http=require('http'),path=require('path'),fs=require('fs');
const {Server}=require('socket.io');const G=require('./engine');
const VERSION=require('./package.json').version;
function createGameServer(options={}){
 const app=express(),server=http.createServer(app),io=new Server(server,{pingTimeout:20000,pingInterval:10000,maxHttpBufferSize:16384});
 const rooms=new Map(),savePath=options.savePath??process.env.SAVE_PATH;let ticking;
 app.get('/health',(_,res)=>res.json({ok:true,service:'star-adventure',version:VERSION,rooms:rooms.size}));
 app.use(express.static(path.join(__dirname,'public')));
 if(savePath&&fs.existsSync(savePath)){try{for(const data of JSON.parse(fs.readFileSync(savePath,'utf8'))){data.players=new Map(data.players.map(p=>{p.connected=p.bot;p.socketId=null;p.input={};return [p.token,p]}));data.events=[];const s=data.stage;if(data.started&&((s.id===2&&!s.caveCleared)||(s.id===3&&!s.obstacles)||(s.id===4&&!s.completed)||(s.id===5&&!s.arrivals))){G.enter(data,s.id);}else if(data.started&&!s.polishVersion){if(s.id===3)G.enter(data,3);else if(s.id===4){s.polishVersion=1;if(!s.bridgeOpen){s.boss.x=G.W.clamp(s.boss.x,1770,2250);s.boss.next='crouch';G.L.beginBoss(data,'chargeWarning',1);}}else if(s.id===5){s.enemies=G.L.createEnemies(data.time);s.polishVersion=1;}else if(s.id===2)s.polishVersion=1;}rooms.set(data.code,data);}}catch(e){console.error('Save recovery failed:',e.message);}}
 function save(){if(!savePath)return;try{fs.mkdirSync(path.dirname(savePath),{recursive:true});const data=[...rooms.values()].map(r=>({...r,players:[...r.players.values()],events:[]}));fs.writeFileSync(savePath+'.tmp',JSON.stringify(data));fs.renameSync(savePath+'.tmp',savePath);}catch(e){console.error('Save failed:',e.message);}}
 const ack=(cb,value)=>{if(typeof cb==='function')cb(value)};
 const get=s=>{const r=rooms.get(s.data.room),p=r?.players.get(s.data.token);return {r,p:p?.socketId===s.id?p:null};};
 function publicStage(s){const copy=JSON.parse(JSON.stringify(s));for(const k of Object.keys(copy))if(k.startsWith('_'))delete copy[k];delete copy.ruleIndex;return copy;}
 function full(r){const v=G.snapshot(r);v.devEnabled=process.env.ENABLE_DEV!=='false';v.stage=publicStage(r.stage);v.players.forEach(p=>delete p.resumeKey);return v;}
 const clueCache=new Map();
 function clues(r){for(const p of r.players.values()){if(!p.socketId)continue;const clue=G.L.privateClue(r,p),key=JSON.stringify(clue);if(clueCache.get(p.socketId)!==key){io.to(p.socketId).emit('clue',clue);clueCache.set(p.socketId,key);}}}
 function emit(r){io.to(r.code).emit('room',full(r));clues(r);}
 function attach(s,r,p){
  if(p.socketId&&p.socketId!==s.id){const old=io.sockets.sockets.get(p.socketId);if(old){old.emit('superseded');old.leave(r.code);old.data={};}}
  clueCache.delete(s.id);p.socketId=s.id;p.connected=true;p.input={};p.interactArmed=true;p.lastInput=r.time;s.join(r.code);s.data.room=r.code;s.data.token=p.token;r.emptySince=null;
  if(!r.players.get(r.hostToken)?.connected)r.hostToken=p.token;
 }
 function detach(s){clueCache.delete(s.id);const {r,p}=get(s);if(!r||!p)return;p.connected=false;p.socketId=null;p.input={};p.disconnectedAt=r.time;s.leave(r.code);s.data={};const next=G.active(r).find(q=>!q.bot);if(p.token===r.hostToken&&next)r.hostToken=next.token;emit(r);save();}
 const code=()=>{const a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='';for(let i=0;i<4;i++)s+=a[Math.floor(Math.random()*a.length)];return s;};
 io.on('connection',s=>{
  const limited=(key,ms)=>{const now=Date.now();s.data.limits??={};if(now-(s.data.limits[key]||0)<ms)return true;s.data.limits[key]=now;return false;};
  s.on('pingCheck',(_,cb)=>ack(cb,{ok:true}));
  s.on('create',(data={},cb)=>{if(limited('create',1000))return ack(cb,{ok:false,error:'請稍等一秒。'});detach(s);let c;do c=code();while(rooms.has(c));const p=G.player(data?.name||'Ollie');p.resumeKey=G.uid();const r=G.room(c,p);rooms.set(c,r);attach(s,r,p);ack(cb,{ok:true,code:c,playerToken:p.resumeKey,id:p.token});emit(r);save();});
  s.on('join',(data={},cb)=>{if(limited('join',150))return ack(cb,{ok:false,error:'請稍等再連線。'});const c=String(data?.code||'').trim().toUpperCase(),r=rooms.get(c);if(!r)return ack(cb,{ok:false,error:'找不到房間，可能伺服器已重新啟動。'});
   let p=[...r.players.values()].find(p=>!p.bot&&p.resumeKey===data?.playerToken);
   if(!p){if(r.started)return ack(cb,{ok:false,error:'冒險已開始，只能用原裝置身分重連。'});if(r.players.size>=6){const bot=[...r.players.values()].find(p=>p.bot);if(bot){r.players.delete(bot.token);if(r.momoToken===bot.token)r.momoToken=null;}else return ack(cb,{ok:false,error:'房間已滿（包含保留的離線位置）。'});}
    p=G.player(data?.name);p.resumeKey=G.uid();r.players.set(p.token,p);
   }const rejoined=!!p.socketId||!p.connected||r.started;detach(s);attach(s,r,p);ack(cb,{ok:true,code:c,playerToken:p.resumeKey,id:p.token,rejoined,started:r.started});emit(r);save();
  });
  s.on('leave',(_,cb)=>{const {r,p}=get(s);if(r&&p&&!r.started){detach(s);r.players.delete(p.token);if(r.momoToken===p.token)r.momoToken=null;emit(r);}else detach(s);ack(cb,{ok:true});});
  s.on('char',(ch,cb)=>{const {r,p}=get(s);if(!r||!p||r.started||!G.W.CHARS.includes(ch))return ack(cb,{ok:false,error:'現在無法換角色。'});if([...r.players.values()].some(q=>q.token!==p.token&&q.char===ch))return ack(cb,{ok:false,error:'這個角色已經有人選了。'});p.char=ch;if(ch==='小桃')r.momoToken=p.token;else if(r.momoToken===p.token)r.momoToken=null;emit(r);save();ack(cb,{ok:true});});
  s.on('start',(_,cb)=>{const {r,p}=get(s);if(!r||!p||p.token!==r.hostToken||r.started)return ack(cb,{ok:false,error:'只有房主能從大廳開始。'});if(G.active(r).length!==6)return ack(cb,{ok:false,error:'需要六位在線冒險者，可用 DEV 假人補滿。'});if(G.active(r).some(p=>!p.char))return ack(cb,{ok:false,error:'請大家先選好角色。'});if(!r.momoToken)return ack(cb,{ok:false,error:'本次冒險請保留一位小桃；可選角色或用 DEV 補滿假人。'});G.enter(r,1);emit(r);save();ack(cb,{ok:true});});
  s.on('input',data=>{const {r,p}=get(s);if(r&&p&&r.started&&(!!data?.interact!==!!p.input.interact||!limited('input',10)))G.input(r,p,data);});
  s.on('interact',(data={},cb)=>{const {r,p}=get(s);if(!r||!p||limited('interact',150))return ack(cb,{ok:false});if(!r.stage.cleared){if(!Number.isSafeInteger(data.press)||data.press<=(p.lastPress||0)||data.epoch!==r.stage.epoch||!p.input.interact||p.interactArmed===false)return ack(cb,{ok:false});p.lastPress=data.press;p.interactArmed=false;}const stamp=s=>[s.epoch,s.cave,s.leg,s.round,s.mode].join(':'),before=stamp(r.stage);const result=G.interact(r,p);ack(cb,result);if(result.ok&&r.stage.id===2&&stamp(r.stage)!==before){io.to(r.code).emit('stage',{time:r.time,stage:publicStage(r.stage),fragments:r.fragments});clues(r);}});
  s.on('puzzle',(_,cb)=>ack(cb,{ok:false,error:'請靠近場景物件，按 E / 互動。'}));
  s.on('sendStar',(_,cb)=>{const {r,p}=get(s);ack(cb,r&&p?G.sendStar(r,p.token):{ok:false});});
  s.on('emote',emoji=>{const {r,p}=get(s);if(r&&p&&!limited('emote',500))io.to(r.code).emit('emote',{token:p.token,emoji:['✨','😂','💦','⭐','🎉'].includes(emoji)?emoji:'✨'});});
  s.on('resetLevel',(_,cb)=>{const {r,p}=get(s);const result=r&&p?G.resetLevel(r,p):{ok:false};if(result.ok){emit(r);save();}ack(cb,result);});
  s.on('resetGame',(data={},cb)=>{const {r,p}=get(s);if(!r||!p||p.token!==r.hostToken)return ack(cb,{ok:false,error:'只有房主能 RESET GAME。'});if(!data.confirmation){s.data.resetChallenge={nonce:G.uid(),epoch:r.epoch,until:Date.now()+30000};return ack(cb,{ok:true,confirmation:s.data.resetChallenge.nonce});}const c=s.data.resetChallenge;delete s.data.resetChallenge;if(!c||c.nonce!==data.confirmation||c.epoch!==r.epoch||Date.now()>c.until)return ack(cb,{ok:false,error:'確認已失效，請重新按 RESET GAME。'});ack(cb,G.resetGame(r,p));emit(r);save();});
  s.on('dev',(data,cb)=>{const {r,p}=get(s);if(!r||!p)return ack(cb,{ok:false});if(process.env.ENABLE_DEV==='false')return ack(cb,{ok:false,error:'此部署已停用 DEV。'});const result=G.dev(r,p,data);if(result.ok){emit(r);save();}ack(cb,result);});
  s.on('disconnect',()=>detach(s));
 });
 let frame=0,last=Date.now();ticking=setInterval(()=>{const now=Date.now(),dt=Math.min((now-last)/1000,.075);last=now;frame++;
 for(const [c,r] of rooms){const humans=G.active(r).filter(p=>!p.bot);if(!humans.length){r.emptySince??=now;if(now-r.emptySince>86400000)rooms.delete(c);continue;}r.emptySince=null;
 const prev=r.stage.epoch;G.tick(r,dt);
 if(r.stage.epoch!==prev){emit(r);save();}
 // Movement is a compact packet at 20 Hz. Stage mechanics travel separately at 5 Hz.
 if(frame%2===0&&r.started)io.to(c).emit('frame',{time:r.time,epoch:r.stage.epoch,p:G.active(r).map(p=>({t:p.token,x:+p.x.toFixed(2),y:+p.y.toFixed(2),vx:p.vx,vy:p.vy,d:p.down,w:p.warp,c:p.carry,g:p.grounded,q:p.seq,rescue:p.rescue||0,f:!!p.flat,fa:p.flatAt||0,cp:p.checkpoint,iv:p.invulnerableUntil||0}))});
 if(frame%8===0&&r.started){io.to(c).emit('stage',{time:r.time,stage:publicStage(r.stage),fragments:r.fragments});clues(r);}
 for(const e of r.events.splice(0))io.to(c).emit(e.type,e.text);
 }},25);
 const saver=setInterval(save,5000);saver.unref();
 return {app,server,io,rooms,save,close:async()=>{clearInterval(ticking);clearInterval(saver);save();await new Promise(resolve=>io.close(resolve));}};
}
if(require.main===module){const game=createGameServer();const PORT=process.env.PORT||3000;game.server.listen(PORT,()=>console.log(`Star Adventure ${VERSION} listening on ${PORT}`));for(const signal of ['SIGINT','SIGTERM'])process.on(signal,async()=>{await game.close();process.exit(0);});}
module.exports={createGameServer};
