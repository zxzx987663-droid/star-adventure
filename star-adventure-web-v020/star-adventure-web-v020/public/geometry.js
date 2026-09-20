/* Gameplay geometry. Artwork dimensions never participate in physics. */
(function(root){
const hitboxes={player:{width:46,height:52,offsetX:0,offsetY:0},flattened:{width:46,height:14,offsetX:0,offsetY:0},boss:{width:90,height:70,offsetX:0,offsetY:0},enemy:{width:40,height:36,offsetX:0,offsetY:0},cargo:{radius:55},platform:{height:14}};
const caves=Array.from({length:5},(_,i)=>({start:100+i*1000,pads:[400,475,550,625].map(x=>x+i*1000),readers:[235+i*1000,805+i*1000],gate:980+i*1000}));
const cargo={end:5600,finalBase:4200,summit:5380,mid:2500,
 profile:[[0,420],[350,420],[850,335],[1500,335],[2050,225],[2650,225],[3250,390],[4200,390],[5400,60],[5600,60]],
 switches:[{id:'bridge',x:1510,y:250,label:'跨谷木橋展開'},{id:'gateA',x:2080,y:115,label:'高台鎖 A 開啟'},{id:'gateB',x:2340,y:115,label:'高台鎖 B 開啟'},{id:'brake',x:3610,y:300,label:'緩衝路面與接應橋展開'}],
 obstacles:[{x:1260,end:1470,kind:'bridge',requires:['bridge']},{x:2420,kind:'gate',requires:['gateA','gateB']},{x:3740,end:3940,kind:'bridge',requires:['brake']} ]};
const boss={zone:[1670,2330],bounds:[1770,2250],buttons:Array.from({length:6},(_,i)=>3440+i*58)};
function cargoPose(c,t,obstacles=[true,true,true]){const e=Math.max(0,Math.min(.2,t-(c.sampleAt??t)));if(c.falling)return {x:c.x,y:c.y+c.vy*e+525*e*e};let x=c.x+c.vx*e;if(!obstacles[1]&&c.x<=2420-c.r)x=Math.min(x,2420-c.r);return {x,y:mountain(x)-c.r};}
function cargoPlatforms(t){return [{id:'approach',x:1100,y:265,w:100},{id:'bridge-detour',x:1280+Math.sin(t*.7)*25,y:215,w:125},{id:'bridge-switch',x:1460,y:250,w:130},{id:'gate-step',x:1820,y:190,w:100},{id:'gate-a',x:2020,y:115,w:130},{id:'gate-moving',x:2180+Math.sin(t*.75)*25,y:90,w:95},{id:'gate-b',x:2290,y:115,w:125},{id:'brake-step',x:3400,y:325,w:110},{id:'brake-switch',x:3560,y:300,w:130},{id:'catch-detour',x:3770,y:290,w:110}];}
function bossPose(b,t){const e=Math.max(0,Math.min(t,b.until)-b.start);return {x:b.mode==='charge'?Math.max(boss.bounds[0],Math.min(boss.bounds[1],b.fromX+b.dir*420*e)):b.x,y:b.mode==='leap'?420-4*240*(e/1.25)*(1-e/1.25):b.y};}
function enemyPose(m,t){const e=Math.max(0,Math.min(t,m.until??t)-m.start);return {x:m.mode==='charge'?Math.max(m.min,Math.min(m.max,m.fromX+m.dir*280*e)):m.mode==='patrol'?Math.max(m.min,Math.min(m.max,m.x+m.dir*52*Math.max(0,Math.min(.2,t-m.sampleAt)))):m.x,y:m.mode==='jump'?m.floor-4*95*(e/.9)*(1-e/.9):m.floor};}
const checkpoints=[120,1500,2950,4400];
const gaps=[[540,730],[1080,1280],[1800,2070],[2450,2720],[3300,3570],[3950,4200],[4850,5140]];
function slope(x){const p=cargo.profile;for(let i=1;i<p.length;i++)if(x<=p[i][0])return (p[i][1]-p[i-1][1])/(p[i][0]-p[i-1][0]);return 0;}
function mountain(x){const p=cargo.profile;for(let i=1;i<p.length;i++)if(x<=p[i][0])return p[i-1][1]+(x-p[i-1][0])*slope(x);return p.at(-1)[1];}
function raceFloor(x){if(gaps.some(([a,b])=>x>a&&x<b))return 2000;return x<1500?420:x<2950?370:x<4400?420:350;}
function racePlatforms(s,t){return [{id:'hop',x:605,y:340,w:65},{id:'moving1',x:1840+Math.sin(t)*65,y:300,w:110},{id:'narrow',x:2530,y:290,w:70},{id:'moving2',x:3340+Math.sin(t*.85)*65,y:330,w:100},{id:'fall1',x:4000,y:340,w:95},{id:'fall2',x:4940,y:260,w:85}].filter(p=>!s.fallen?.[p.id]||t<s.fallen[p.id]+.7||t>s.fallen[p.id]+4);}
function bounds(p,kind){const h=hitboxes[kind],x=p.x+h.offsetX,y=p.y+h.offsetY;return {left:x-h.width/2,right:x+h.width/2,top:y-h.height,bottom:y};}
function overlaps(a,b){return a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;}
const api={bounds,overlaps,hitboxes,caves,cargo,boss,bossPose,enemyPose,cargoPlatforms,cargoPose,slope,checkpoints,gaps,mountain,raceFloor,racePlatforms};if(typeof module!=='undefined')module.exports=api;else root.Geometry=api;
})(typeof window!=='undefined'?window:globalThis);
