/* Gameplay geometry. Artwork dimensions never participate in physics. */
(function(root){
const hitboxes={player:{width:46,height:52,offsetX:0,offsetY:0},flattened:{width:46,height:14,offsetX:0,offsetY:0},boss:{width:100,height:80,offsetX:0,offsetY:0},enemy:{width:40,height:36,offsetX:0,offsetY:0},cargo:{radius:55},platform:{height:14}};
const caves=Array.from({length:5},(_,i)=>({start:100+i*1000,pads:[400,475,550,625].map(x=>x+i*1000),gate:980+i*1000}));
const cargo={end:5600,finalBase:4200,summit:5380,obstacles:[{x:1100,plates:[850,920,990],kind:'bridge'},{x:2200,plates:[1900,1980,2060],kind:'gate'},{x:3250,plates:[2940,3020,3100],kind:'fan'}]};
const checkpoints=[120,1500,2950,4400];
const gaps=[[540,730],[1080,1280],[1800,2070],[2450,2720],[3300,3570],[3950,4200],[4850,5140]];
function mountain(x){return 420-Math.min(Math.max(x-400,0),3800)*.12-Math.max(0,x-4200)*.27;}
function raceFloor(x){if(gaps.some(([a,b])=>x>a&&x<b))return 2000;return x<1500?420:x<2950?370:x<4400?420:350;}
function racePlatforms(s,t){return [{id:'hop',x:605,y:340,w:65},{id:'moving1',x:1840+Math.sin(t)*65,y:300,w:110},{id:'narrow',x:2530,y:290,w:70},{id:'moving2',x:3340+Math.sin(t*.85)*65,y:330,w:100},{id:'fall1',x:4000,y:340,w:95},{id:'fall2',x:4940,y:260,w:85}].filter(p=>!s.fallen?.[p.id]||t<s.fallen[p.id]+.7||t>s.fallen[p.id]+4);}
function bounds(p,kind){const h=hitboxes[kind],x=p.x+h.offsetX,y=p.y+h.offsetY;return {left:x-h.width/2,right:x+h.width/2,top:y-h.height,bottom:y};}
function overlaps(a,b){return a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;}
const api={bounds,overlaps,hitboxes,caves,cargo,checkpoints,gaps,mountain,raceFloor,racePlatforms};if(typeof module!=='undefined')module.exports=api;else root.Geometry=api;
})(typeof window!=='undefined'?window:globalThis);
