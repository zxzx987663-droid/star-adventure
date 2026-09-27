/* Gameplay geometry. Artwork dimensions never participate in physics. */
(function(root){
const hitboxes={player:{width:46,height:52,offsetX:0,offsetY:0},flattened:{width:46,height:14,offsetX:0,offsetY:0},boss:{width:90,height:70,offsetX:0,offsetY:0},enemy:{width:40,height:36,offsetX:0,offsetY:0},cargo:{radius:55},platform:{height:14}};
const caves=Array.from({length:5},(_,i)=>({start:100+i*1000,pads:[400,475,550,625].map(x=>x+i*1000),readers:[235+i*1000,805+i*1000],gate:980+i*1000}));
const cargo={end:5600,finalBase:4200,summit:5380,mid:2500,bridgeOpenDelay:1.5,coopSwitchIds:['bridge','gateA','gateB'],
 profile:[[0,420],[350,420],[850,335],[1500,335],[2050,225],[2650,225],[3250,390],[4200,390],[5400,60],[5600,60]],
 switches:[{id:'bridge',role:'A',x:1510,y:250,label:'月橋機關 A'},{id:'gateA',role:'B',x:2080,y:115,label:'月橋機關 B'},{id:'gateB',role:'C',x:2340,y:115,label:'月橋機關 C'},{id:'brake',x:3610,y:300,label:'緩衝路面與接應橋展開'}],
 obstacles:[{x:1260,end:1470,kind:'bridge',requires:['bridge','gateA','gateB']},{x:2420,kind:'gate',requires:['gateA','gateB']},{x:3740,end:3940,kind:'bridge',requires:['brake']} ]};
const boss={zone:[1670,2330],bounds:[1770,2250],buttons:Array.from({length:6},(_,i)=>3440+i*58),safeZoneStart:3280,escapeCheckpoint:2360,
 escapeGaps:[[2475,2635],[2790,2960],[3100,3270]],
 escapePlatforms:[{id:'escape-1',x:2520,y:350,w:70},{id:'escape-2',x:2838,y:315,w:78},{id:'escape-3',x:3145,y:350,w:82}],
 attack:{chargeSpeed:520,slamRadius:165,stompRadius:115,leapTrack:170}};
function cargoPose(c,t,obstacles=[true,true,true]){const e=Math.max(0,Math.min(.2,t-(c.sampleAt??t)));if(c.falling)return {x:c.x,y:c.y+c.vy*e+525*e*e};let x=c.x+c.vx*e;if(!obstacles[1]&&c.x<=2420-c.r)x=Math.min(x,2420-c.r);return {x,y:mountain(x)-c.r};}
function cargoPlatforms(t){return [{id:'approach',x:1100,y:265,w:100},{id:'bridge-detour',x:1280+Math.sin(t*.7)*25,y:215,w:125},{id:'bridge-switch',x:1460,y:250,w:130},{id:'gate-step',x:1820,y:190,w:100},{id:'gate-a',x:2020,y:115,w:130},{id:'gate-moving',x:2180+Math.sin(t*.75)*25,y:90,w:95},{id:'gate-b',x:2290,y:115,w:125},{id:'brake-step',x:3400,y:325,w:110},{id:'brake-switch',x:3560,y:300,w:130},{id:'catch-detour',x:3770,y:290,w:110}];}
function bossPose(b,t){const e=Math.max(0,Math.min(t,b.until)-b.start);if(b.mode==='charge')return {x:Math.max(boss.bounds[0],Math.min(boss.bounds[1],b.fromX+b.dir*boss.attack.chargeSpeed*e)),y:420};if(b.mode==='leap'){const r=Math.max(0,Math.min(1,e/1.25)),tx=b.targetX??b.fromX;return {x:b.fromX+(tx-b.fromX)*r,y:420-4*240*r*(1-r)};}return {x:b.x,y:b.y};}
const enemyTuning={patrol:{speed:74,turnDelay:.22},hopper:{jumpDuration:.78,jumpHeight:112,crouch:.34,rest:.46,track:135},charger:{detect:285,warning:.34,chargeDuration:.62,recovery:.62,speed:390}};
function enemyPose(m,t){const e=Math.max(0,Math.min(t,m.until??t)-m.start);if(m.mode==='charge'){const sp=m.speed||enemyTuning.charger.speed;return {x:Math.max(m.min,Math.min(m.max,m.fromX+m.dir*sp*e)),y:m.floor};}if(m.mode==='patrol'){const sp=m.speed||enemyTuning.patrol.speed;return {x:Math.max(m.min,Math.min(m.max,m.x+m.dir*sp*Math.max(0,Math.min(.16,t-(m.sampleAt??t))))),y:m.floor};}if(m.mode==='jump'){const dur=m.jumpDuration||enemyTuning.hopper.jumpDuration,r=Math.max(0,Math.min(1,e/dur)),from=m.jumpFromX??m.x,to=m.jumpToX??m.x,h=m.jumpHeight||enemyTuning.hopper.jumpHeight;return {x:from+(to-from)*r,y:m.floor-4*h*r*(1-r)};}return {x:m.x,y:m.floor};}
const checkpoints=[120,1500,2950,4400];
const gaps=[[540,730],[1080,1280],[1800,2070],[2450,2720],[3300,3570],[3950,4200],[4850,5140]];
function slope(x){const p=cargo.profile;for(let i=1;i<p.length;i++)if(x<=p[i][0])return (p[i][1]-p[i-1][1])/(p[i][0]-p[i-1][0]);return 0;}
function mountain(x){const p=cargo.profile;for(let i=1;i<p.length;i++)if(x<=p[i][0])return p[i-1][1]+(x-p[i-1][0])*slope(x);return p.at(-1)[1];}
function raceFloor(x){if(gaps.some(([a,b])=>x>a&&x<b))return 2000;return x<1500?420:x<2950?370:x<4400?420:350;}
function racePlatforms(s,t){return [{id:'hop',x:605,y:340,w:65},{id:'moving1',x:1840+Math.sin(t)*65,y:300,w:110},{id:'narrow',x:2530,y:290,w:70},{id:'moving2',x:3340+Math.sin(t*.85)*65,y:330,w:100},{id:'fall1',x:4000,y:340,w:95},{id:'fall2',x:4940,y:260,w:85}].filter(p=>!s.fallen?.[p.id]||t<s.fallen[p.id]+.7||t>s.fallen[p.id]+4);}
function bounds(p,kind){const h=hitboxes[kind],x=p.x+h.offsetX,y=p.y+h.offsetY;return {left:x-h.width/2,right:x+h.width/2,top:y-h.height,bottom:y};}
function overlaps(a,b){return a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;}
const api={bounds,overlaps,hitboxes,caves,cargo,boss,bossPose,enemyPose,enemyTuning,cargoPlatforms,cargoPose,slope,checkpoints,gaps,mountain,raceFloor,racePlatforms};if(typeof module!=='undefined')module.exports=api;else root.Geometry=api;
})(typeof window!=='undefined'?window:globalThis);
