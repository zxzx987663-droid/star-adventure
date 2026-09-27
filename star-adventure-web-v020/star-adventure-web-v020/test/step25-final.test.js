const test=require('node:test');
const A=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const G=require('../engine');
const ROOT=path.resolve(__dirname,'..');
const manifest=require('../public/assets/manifest.json');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
function pngSize(file){const b=fs.readFileSync(file);A.equal(b.toString('ascii',1,4),'PNG');return {w:b.readUInt32BE(16),h:b.readUInt32BE(20)};}
function assetPath(src){return path.join(ROOT,'public',src.replace(/^\//,''));}
function setup(id){const p=G.player('host');p.char='小桃';const r=G.room('FINAL',p);r.momoToken=p.token;G.addBots(r);for(const q of r.players.values())q.bot=false;r.dev={assist:false,follow:false};G.enter(r,id);return {r,p,ps:[...r.players.values()]};}

test('STEP25 L5 final altar is tied to race floor and authoritative six-player hold remains 3 seconds',()=>{
 const source=read('public/level-view.js');
 A.match(source,/const finalY=D\.raceFloor\(5530\)/);
 A.match(source,/l5Final','idle',5530,finalY\+2/);
 const {r,ps}=setup(5);ps.forEach(p=>{G.warp(p,5500,G.W.D.raceFloor(5500));p.input={interact:true};});
 for(let i=0;i<100;i++){for(const p of ps)p.lastInput=r.time;G.tick(r,.025);}A.equal(r.stage.id,5);for(let i=0;i<25;i++){for(const p of ps)p.lastInput=r.time;G.tick(r,.025);}A.equal(r.stage.id,'ending');
});

test('STEP25 Party is an open fixed full-scene playfield with no player air wall',()=>{
 const {r,ps}=setup('party');
 A.deepEqual(G.W.walls(r.stage),[]);A.deepEqual(G.W.platforms(r.stage,r.time),[]);A.equal(G.W.floor(r.stage,900),420);
 G.warp(ps[0],900,420);G.warp(ps[1],900,420);const x0=ps[0].x,x1=ps[1].x;G.tick(r,.025);A.equal(ps[0].x,x0);A.equal(ps[1].x,x1);
 const client=read('public/client.js');A.match(client,/function partyX\(x\)/);A.match(client,/function partyY\(y\)/);A.match(client,/room\.stage\.id==='party'\?0/);A.doesNotMatch(read('engine.js'),/if\(s\.id==='party'\).*Math\.abs\(a\.x-b\.x\)/s);
});

test('STEP25 L1 bridge collision is unchanged while deep-pit and center-island visuals are present',()=>{
 const s={id:1,gateOpen:true,bridgeBroken:true};A.equal(G.W.floor(s,1555),1000);A.equal(G.W.floor(s,1750),420);
 const client=read('public/client.js');A.match(client,/fillRect\(1420,420,260,130\)/);A.match(client,/floating-island silhouette/);A.match(client,/\[1680,1960\]/);
});

test('STEP25 all 8 characters use 128x128 normal frames and preserve 24 emote groups',()=>{
 const states=['idle','run','runLeft','jump','fall','land','flattened'];const chars=Object.entries(manifest.characters);A.equal(chars.length,8);let normals=0,emotes=0;
 for(const [name,c] of chars){for(const st of states){const e=c[st];A.ok(e,`${name}/${st}`);A.equal(e.sheet.frameWidth,128,`${name}/${st} frameWidth`);A.equal(e.sheet.frameHeight,128,`${name}/${st} frameHeight`);const d=pngSize(assetPath(e.src));A.deepEqual(d,{w:128*e.sheet.count,h:128},`${name}/${st} PNG dimensions`);normals++;}
  for(const st of ['emote1','emote2','emote3']){const e=c[st];A.ok(e,`${name}/${st}`);A.ok(fs.existsSync(assetPath(e.src)),`${name}/${st} file`);const d=pngSize(assetPath(e.src));A.equal(d.w,e.sheet.frameWidth*e.sheet.columns);A.equal(d.h,e.sheet.frameHeight);emotes++;}}
 A.equal(normals,56);A.equal(emotes,24);
});

test('STEP25 home hero uses cleaned enlarged STAR ADVENTURE artwork',()=>{
 const d=pngSize(path.join(ROOT,'public/assets/ui/midautumn/menu-logo-banner.png'));A.deepEqual(d,{w:900,h:365});
 const css=read('public/style.css');A.match(css,/#menu h1\{width:min\(900px,96vw\);height:clamp\(190px,34vw,340px\)/);A.match(css,/@media\(max-width:600px\)\{#menu h1\{height:190px;width:98vw\}/);
});

test('STEP25 duplicated served/root client copies stay byte-identical',()=>{A.equal(fs.readFileSync(path.join(ROOT,'client.js')).compare(fs.readFileSync(path.join(ROOT,'public/client.js'))),0);});
