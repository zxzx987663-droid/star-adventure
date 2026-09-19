const express=require('express');
const http=require('http');
const crypto=require('crypto');
const {Server}=require('socket.io');
const path=require('path');

const app=express();
const server=http.createServer(app);
const io=new Server(server,{cors:{origin:true,credentials:false},pingTimeout:20000,pingInterval:10000});
app.use(express.static(path.join(__dirname,'public')));
app.get('/health',(req,res)=>res.json({ok:true,service:'star-adventure',version:'0.2.0'}));

const rooms=new Map();
const chars=['吉伊卡哇','小八','兔兔','小桃','栗子饅頭','海獺師傅','風獅爺','古本屋'];
const roomCode=()=>{const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let out='';for(let i=0;i<4;i++)out+=alphabet[Math.floor(Math.random()*alphabet.length)];return out};
const token=()=>crypto.randomBytes(12).toString('hex');
function publicRoom(r){return {code:r.code,hostToken:r.hostToken,started:r.started,momoToken:r.momoToken,players:[...r.players.values()].map(p=>({token:p.token,name:p.name,char:p.char,x:p.x,y:p.y,bot:p.bot,connected:p.connected}))};}
function emit(r){io.to(r.code).emit('room',publicRoom(r));}
function attachSocket(s,r,p){p.socketId=s.id;p.connected=true;s.join(r.code);s.data.room=r.code;s.data.token=p.token;}
function getPlayer(s){const r=rooms.get(s.data.room);return {r,p:r?.players.get(s.data.token)};}
function cleanName(v){return String(v||'玩家').trim().slice(0,16)||'玩家';}

io.on('connection',s=>{
  s.on('create',({name,playerToken}={},cb)=>{
    let c;do c=roomCode();while(rooms.has(c));
    const t=playerToken||token();
    const p={token:t,name:cleanName(name||'Ollie'),char:null,x:160,y:300,bot:false,connected:true,socketId:s.id};
    const r={code:c,hostToken:t,started:false,momoToken:null,players:new Map([[t,p]])};rooms.set(c,r);attachSocket(s,r,p);emit(r);cb?.({ok:true,code:c,playerToken:t});
  });

  s.on('join',({code,name,playerToken}={},cb)=>{
    const c=String(code||'').trim().toUpperCase();const r=rooms.get(c);if(!r)return cb?.({ok:false,error:'找不到房間'});
    if(playerToken&&r.players.has(playerToken)){
      const p=r.players.get(playerToken);p.name=cleanName(name||p.name);attachSocket(s,r,p);emit(r);return cb?.({ok:true,playerToken:p.token,rejoined:true,started:r.started});
    }
    const humans=[...r.players.values()].filter(p=>!p.bot);if(humans.length>=6)return cb?.({ok:false,error:'房間已滿'});
    const t=playerToken||token();const p={token:t,name:cleanName(name),char:null,x:160,y:300,bot:false,connected:true,socketId:s.id};r.players.set(t,p);attachSocket(s,r,p);emit(r);cb?.({ok:true,playerToken:t,started:r.started});
  });

  s.on('char',(ch,cb)=>{const {r,p}=getPlayer(s);if(!r||!p||!chars.includes(ch))return cb?.({ok:false});if([...r.players.values()].some(q=>q.token!==p.token&&q.char===ch))return cb?.({ok:false,error:'這個角色已經有人選了'});p.char=ch;if(ch==='小桃')r.momoToken=p.token;else if(r.momoToken===p.token)r.momoToken=null;emit(r);cb?.({ok:true});});
  s.on('start',(_,cb)=>{const {r,p}=getPlayer(s);if(!r||!p||r.hostToken!==p.token)return cb?.({ok:false,error:'只有房主可以開始'});const humans=[...r.players.values()].filter(x=>!x.bot);if(humans.some(x=>!x.char))return cb?.({ok:false,error:'還有人沒有選角色'});r.started=true;emit(r);io.to(r.code).emit('start');cb?.({ok:true});});
  s.on('move',pos=>{const {r,p}=getPlayer(s);if(!r||!p)return;const x=Math.max(0,Math.min(2000,Number(pos?.x)||0));const y=Math.max(0,Math.min(1000,Number(pos?.y)||0));p.x=x;p.y=y;s.to(r.code).emit('move',{token:p.token,x,y});});
  s.on('emote',emoji=>{const {r,p}=getPlayer(s);if(!r||!p)return;io.to(r.code).emit('emote',{token:p.token,emoji:['✨','😂','💦','⭐'].includes(emoji)?emoji:'✨'});});
  s.on('addbots',(_,cb)=>{const {r,p}=getPlayer(s);if(!r||!p||r.hostToken!==p.token)return;let i=1;while(r.players.size<6){const id='bot-'+token();const used=new Set([...r.players.values()].map(x=>x.char));const ch=chars.find(x=>!used.has(x))||null;r.players.set(id,{token:id,name:'測試假人 '+i,char:ch,x:180+i*55,y:300,bot:true,connected:true,socketId:null});if(ch==='小桃'&&!r.momoToken)r.momoToken=id;i++;}emit(r);cb?.({ok:true});});
  s.on('disconnect',()=>{const {r,p}=getPlayer(s);if(!r||!p)return;p.connected=false;p.socketId=null;emit(r);setTimeout(()=>{const rr=rooms.get(r.code),pp=rr?.players.get(p.token);if(!rr||!pp||pp.connected)return;if(!rr.started){rr.players.delete(pp.token);if(rr.momoToken===pp.token)rr.momoToken=null;if(rr.hostToken===pp.token){const next=[...rr.players.values()].find(x=>!x.bot);rr.hostToken=next?.token||null;}if(!rr.players.size)rooms.delete(rr.code);else emit(rr);}},30000);});
});

const PORT=process.env.PORT||3000;server.listen(PORT,()=>console.log(`Star Adventure Web v0.2 listening on ${PORT}`));
