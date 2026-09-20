const express=require('express');
const http=require('http');
const crypto=require('crypto');
const {Server}=require('socket.io');
const path=require('path');

const app=express();
const server=http.createServer(app);
const io=new Server(server,{cors:{origin:true,credentials:false},pingTimeout:20000,pingInterval:10000});
app.use(express.static(path.join(__dirname,'public')));
app.get('/health',(req,res)=>res.json({ok:true,service:'star-adventure',version:'0.3.1'}));

const rooms=new Map();
const chars=['吉伊卡哇','小八','兔兔','小桃','栗子饅頭','海獺師傅','風獅爺','古本屋'];
const roomCode=()=>{const a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let o='';for(let i=0;i<4;i++)o+=a[Math.floor(Math.random()*a.length)];return o};
const token=()=>crypto.randomBytes(12).toString('hex');
const cleanName=v=>String(v||'玩家').trim().slice(0,16)||'玩家';
function newStage(){return {id:1,gateOpen:false,leverOn:false,bridgeBroken:false,fragment:false,cleared:false,checkpoint:120};}
function publicRoom(r){return {code:r.code,hostToken:r.hostToken,started:r.started,momoToken:r.momoToken,stage:r.stage,players:[...r.players.values()].map(p=>({token:p.token,name:p.name,char:p.char,x:p.x,y:p.y,bot:p.bot,connected:p.connected,down:p.down}))};}
function emit(r){io.to(r.code).emit('room',publicRoom(r));}
function attachSocket(s,r,p){p.socketId=s.id;p.connected=true;s.join(r.code);s.data.room=r.code;s.data.token=p.token;}
function getPlayer(s){const r=rooms.get(s.data.room);return {r,p:r?.players.get(s.data.token)};}
function resetPositions(r){let i=0;for(const p of r.players.values()){p.x=120+i*48;p.y=360;p.down=false;i++;}}
function plateCount(r){return [...r.players.values()].filter(p=>p.connected&&!p.down&&p.x>=620&&p.x<=880&&p.y>=320).length;}
function updateStage(r){
  if(!r.started)return false;
  let changed=false;
  const n=plateCount(r);
  if(n>=3&&!r.stage.gateOpen){r.stage.gateOpen=true;changed=true;io.to(r.code).emit('toast','三個壓力板同時亮了！門打開了！');}
  if(!r.stage.bridgeBroken&&[...r.players.values()].some(p=>p.x>1450)){r.stage.bridgeBroken=true;changed=true;io.to(r.code).emit('toast','喀啦……橋是不是有點不妙？');}
  if(r.stage.leverOn&&r.stage.checkpoint!==1780){r.stage.checkpoint=1780;changed=true;}
  return changed;
}
function botAssist(r,host){
  const bots=[...r.players.values()].filter(p=>p.bot);
  if(!bots.length)return;
  if(!r.stage.gateOpen){const spots=[670,750,830];bots.slice(0,3).forEach((b,i)=>{b.x=spots[i];b.y=360;});}
  else {bots.forEach((b,i)=>{b.x=Math.max(120,Math.min(2480,host.x-120+i*48));b.y=360;});}
}

io.on('connection',s=>{
  s.on('pingCheck',(_,cb)=>cb?.({ok:true}));
  s.on('create',({name,playerToken}={},cb)=>{let c;do c=roomCode();while(rooms.has(c));const t=playerToken||token();const p={token:t,name:cleanName(name||'Ollie'),char:null,x:120,y:360,bot:false,connected:true,down:false,socketId:s.id};const r={code:c,hostToken:t,started:false,momoToken:null,stage:newStage(),players:new Map([[t,p]])};rooms.set(c,r);attachSocket(s,r,p);emit(r);cb?.({ok:true,code:c,playerToken:t});});
  s.on('join',({code,name,playerToken}={},cb)=>{const c=String(code||'').trim().toUpperCase(),r=rooms.get(c);if(!r)return cb?.({ok:false,error:'找不到房間'});if(playerToken&&r.players.has(playerToken)){const p=r.players.get(playerToken);p.name=cleanName(name||p.name);attachSocket(s,r,p);emit(r);return cb?.({ok:true,playerToken:p.token,rejoined:true,started:r.started});}const humans=[...r.players.values()].filter(p=>!p.bot);if(humans.length>=6)return cb?.({ok:false,error:'房間已滿'});const t=playerToken||token(),p={token:t,name:cleanName(name),char:null,x:120,y:360,bot:false,connected:true,down:false,socketId:s.id};r.players.set(t,p);attachSocket(s,r,p);emit(r);cb?.({ok:true,playerToken:t,started:r.started});});
  s.on('char',(ch,cb)=>{const {r,p}=getPlayer(s);if(!r||!p||!chars.includes(ch))return cb?.({ok:false});if([...r.players.values()].some(q=>q.token!==p.token&&q.char===ch))return cb?.({ok:false,error:'這個角色已經有人選了'});p.char=ch;if(ch==='小桃')r.momoToken=p.token;else if(r.momoToken===p.token)r.momoToken=null;emit(r);cb?.({ok:true});});
  s.on('start',(_,cb)=>{const {r,p}=getPlayer(s);if(!r||!p||r.hostToken!==p.token)return cb?.({ok:false,error:'只有房主可以開始'});const humans=[...r.players.values()].filter(x=>!x.bot);if(humans.some(x=>!x.char))return cb?.({ok:false,error:'還有人沒有選角色'});r.started=true;r.stage=newStage();resetPositions(r);emit(r);io.to(r.code).emit('start');cb?.({ok:true});});
  s.on('move',pos=>{const {r,p}=getPlayer(s);if(!r||!p||p.down)return;const x=Math.max(0,Math.min(2580,Number(pos?.x)||0)),y=Math.max(0,Math.min(700,Number(pos?.y)||0));p.x=x;p.y=y;s.to(r.code).emit('move',{token:p.token,x,y});if(p.token===r.hostToken){botAssist(r,p);for(const b of r.players.values())if(b.bot)io.to(r.code).emit('move',{token:b.token,x:b.x,y:b.y});}if(updateStage(r))emit(r);});
  s.on('interact',(_,cb)=>{const {r,p}=getPlayer(s);if(!r||!p)return;let msg='這裡沒有可以互動的東西。';if(p.x>=1110&&p.x<=1300&&r.stage.gateOpen&&!r.stage.leverOn){r.stage.leverOn=true;r.stage.checkpoint=1320;msg='喀！遠端開關啟動，後面的路打開了！';io.to(r.code).emit('toast',msg);emit(r);return cb?.({ok:true});}if(p.x>=2320&&p.x<=2550&&!r.stage.fragment){const active=[...r.players.values()].filter(q=>q.connected);const gathered=active.every(q=>q.x>=2180);if(!gathered)return cb?.({ok:false,error:'要等所有冒險者一起到終點！'});r.stage.fragment=true;r.stage.cleared=true;msg='⭐ 星星碎片① GET！';io.to(r.code).emit('stageClear',{stage:1});emit(r);return cb?.({ok:true});}cb?.({ok:false,error:msg});});
  s.on('fall',()=>{const {r,p}=getPlayer(s);if(!r||!p||p.down)return;p.down=true;io.to(r.code).emit('down',{token:p.token});emit(r);setTimeout(()=>{const rr=rooms.get(r.code),pp=rr?.players.get(p.token);if(!rr||!pp)return;pp.down=false;pp.x=rr.stage.checkpoint;pp.y=360;io.to(rr.code).emit('respawn',{token:pp.token,x:pp.x,y:pp.y});emit(rr);},3000);});
  s.on('emote',emoji=>{const {r,p}=getPlayer(s);if(!r||!p)return;io.to(r.code).emit('emote',{token:p.token,emoji:['✨','😂','💦','⭐'].includes(emoji)?emoji:'✨'});});
  s.on('addbots',(_,cb)=>{const {r,p}=getPlayer(s);if(!r||!p||r.hostToken!==p.token)return;let i=1;while(r.players.size<6){const id='bot-'+token(),used=new Set([...r.players.values()].map(x=>x.char)),ch=chars.find(x=>!used.has(x))||null;r.players.set(id,{token:id,name:'測試假人 '+i,char:ch,x:150+i*45,y:360,bot:true,connected:true,down:false,socketId:null});if(ch==='小桃'&&!r.momoToken)r.momoToken=id;i++;}emit(r);cb?.({ok:true});});
  s.on('devTeleport',()=>{const {r,p}=getPlayer(s);if(!r||!p||r.hostToken!==p.token)return;for(const q of r.players.values()){q.x=p.x+(Math.random()*80-40);q.y=360;q.down=false;}emit(r);});
  s.on('disconnect',()=>{const {r,p}=getPlayer(s);if(!r||!p)return;p.connected=false;p.socketId=null;emit(r);setTimeout(()=>{const rr=rooms.get(r.code),pp=rr?.players.get(p.token);if(!rr||!pp||pp.connected)return;if(!rr.started){rr.players.delete(pp.token);if(rr.momoToken===pp.token)rr.momoToken=null;if(rr.hostToken===pp.token){const next=[...rr.players.values()].find(x=>!x.bot);rr.hostToken=next?.token||null;}if(!rr.players.size)rooms.delete(rr.code);else emit(rr);}},30000);});
});
const PORT=process.env.PORT||3000;server.listen(PORT,()=>console.log(`Star Adventure Web v0.3.1 listening on ${PORT}`));
