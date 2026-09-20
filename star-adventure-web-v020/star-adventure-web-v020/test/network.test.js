const test=require('node:test'),assert=require('node:assert/strict');const {io}=require('socket.io-client');const {createGameServer}=require('../server');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const emit=(s,name,data={})=>new Promise(resolve=>s.emit(name,data,resolve));
async function connect(url){const s=io(url,{transports:['websocket'],forceNew:true,reconnection:false});await new Promise((r,j)=>{s.once('connect',r);s.once('connect_error',j)});return s;}
test('six Socket.IO clients: capacity, hidden credentials, private clues, host transfer and target rejoin',async()=>{
 const game=createGameServer();await new Promise(r=>game.server.listen(0,r));const url=`http://127.0.0.1:${game.server.address().port}`,clients=[];
 try{const host=await connect(url);clients.push(host);let latest;host.on('room',r=>latest=r);const h=await emit(host,'create',{name:'Ollie'});assert.ok(h.ok);const identities=[h];
 for(let i=1;i<6;i++){const s=await connect(url);clients.push(s);identities.push(await emit(s,'join',{code:h.code,name:`P${i}`}));}
 const chars=['吉伊卡哇','小八','兔兔','小桃','栗子饅頭','海獺師傅'];for(let i=0;i<6;i++)assert.equal((await emit(clients[i],'char',chars[i])).ok,true);
 assert.equal((await emit(clients[1],'char','小桃')).ok,false);await wait(25);assert.ok(!JSON.stringify(latest).includes(h.playerToken));assert.ok(!Object.hasOwn(latest,'momoToken'));
 const seventh=await connect(url);clients.push(seventh);assert.equal((await emit(seventh,'join',{code:h.code})).ok,false);
 assert.equal((await emit(clients[1],'start')).ok,false);assert.equal((await emit(host,'start')).ok,true);assert.equal((await emit(clients[1],'dev',{action:'jump',value:5})).ok,false);
 await emit(host,'dev',{action:'jump',value:2});let reader,operator;host.on('clue',c=>reader=c);clients[1].on('clue',c=>operator=c);await wait(250);assert.deepEqual(reader.sequence,[0,1,2,3]);assert.equal(operator.sequence,null);
 await emit(host,'dev',{action:'jump',value:5});await emit(host,'dev',{action:'fragments'});const r=game.rooms.get(h.code),target=r.momoToken,epoch=r.stage.epoch;clients[3].disconnect();await wait(80);assert.equal(r.momoToken,target);assert.equal(r.players.get(target).connected,false);
 const momo=await connect(url);clients.push(momo);const joined=await emit(momo,'join',{code:h.code,playerToken:identities[3].playerToken});assert.equal(joined.id,target);assert.equal(r.stage.epoch,epoch);assert.deepEqual(r.fragments,[1,2,3,4]);
 host.disconnect();await wait(80);assert.equal(r.hostToken,identities[1].id);assert.equal((await emit(clients[1],'dev',{action:'ending'})).ok,true);assert.equal(r.stage.target,target);
 const newcomer=await connect(url);clients.push(newcomer);assert.equal((await emit(newcomer,'join',{code:h.code})).ok,false);
 }finally{clients.forEach(s=>s.disconnect());await game.close();}
});
test('server restart restores saved room, fragments, stage and original resume identity',async()=>{const fs=require('fs'),os=require('os'),path=require('path');const dir=fs.mkdtempSync(path.join(os.tmpdir(),'star-save-')),savePath=path.join(dir,'rooms.json');let game=createGameServer({savePath}),s;
 try{await new Promise(r=>game.server.listen(0,r));s=await connect(`http://127.0.0.1:${game.server.address().port}`);const h=await emit(s,'create',{name:'saved'});await emit(s,'char','小桃');await emit(s,'dev',{action:'bots'});await emit(s,'start');await emit(s,'dev',{action:'jump',value:5});await emit(s,'dev',{action:'fragments'});game.save();s.disconnect();await game.close();
 game=createGameServer({savePath});await new Promise(r=>game.server.listen(0,r));s=await connect(`http://127.0.0.1:${game.server.address().port}`);const j=await emit(s,'join',{code:h.code,playerToken:h.playerToken});assert.equal(j.id,h.id);const r=game.rooms.get(h.code);assert.equal(r.stage.id,5);assert.equal(r.momoToken,h.id);assert.deepEqual(r.fragments,[1,2,3,4]);
 }finally{s?.disconnect();await game.close();fs.rmSync(dir,{recursive:true,force:true});}
});
