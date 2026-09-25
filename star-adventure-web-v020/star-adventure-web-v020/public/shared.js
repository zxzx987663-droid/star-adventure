/* Shared world coordinates and deterministic player physics. y = feet, x = centre. */
(function(root){
const D=typeof module!=='undefined'?require('./geometry'):root.Geometry;
const CHARS=['吉伊卡哇','小八','兔兔','小桃','栗子饅頭','海獺師傅','風獅爺','古本屋'];
const TITLES={1:'今天也要去工作！',2:'奇怪的洞穴',3:'推月亮',4:'月兔來襲',5:'星空之塔',ending:'冒險完成。',party:'Party Room'};
const WIDTH={1:2900,2:5300,3:5600,4:3900,5:5700,ending:1400,party:1800};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function platforms(s,t){
 if(s.id===1)return [{id:'first-step',x:240,y:390,w:60},{x:330,y:365,w:110},{x:455+Math.sin(t*1.25)*65,y:340,w:115},{x:1430+Math.sin(t)*85,y:460,w:125},{x:1990+Math.sin(t*.85)*90,y:370,w:150},{x:2180,y:330,w:140},...(!s.bridgeBroken?[{x:1410,y:420,w:290}]:[])];
 if(s.id===3)return D.cargoPlatforms(t);
 if(s.id===5)return D.racePlatforms(s,t);
 return [];
}
function floor(s,x){
 if(s.id===1&&((x>410&&x<565)||(x>1420&&x<1680)||(x>1960&&x<2170)))return 1000;
 if(s.id===3){if(D.cargo.obstacles.some((o,i)=>o.kind==='bridge'&&!s.obstacles[i]&&x>o.x&&x<o.end))return 2000;return D.mountain(x);}
 if(s.id===5)return D.raceFloor(x);
 if(s.id===4&&s.bridgeOpen&&x>1670&&x<2330)return 2000;
 return 420;
}
function walls(s){
 if(s.id===1&&!s.gateOpen)return [1040];
 if(s.id===2)return D.caves.filter((c,i)=>!s.caveCleared[i+1]).map(c=>c.gate);
 return [];
}
function step(p,input,s,dt,t){
 if(p.down||s.id==='ending'||(s.cleared&&s.id!==4)){p.vx=0;return;}
 const dir=(input.right?1:0)-(input.left?1:0),oldX=p.x,oldY=p.y,half=D.hitboxes.player.width/2,ox=D.hitboxes.player.offsetX,oy=D.hitboxes.player.offsetY;
 if(input.jump&&!p.jumpHeld&&p.grounded&&!p.flat){p.vy=-600;p.grounded=false;}
 p.jumpHeld=!!input.jump;p.vx=dir*(p.flat?32:210)+(p.kick||0);p.kick=(p.kick||0)*Math.exp(-6*dt);
 p.x=clamp(p.x+p.vx*dt,26,WIDTH[s.id]-26);
 for(const w of walls(s)){if(oldX+ox<=w&&p.x+ox>w-half)p.x=w-half-ox;if(oldX+ox>w&&p.x+ox<w+half)p.x=w+half-ox;}
 if(s.id===3&&!s.obstacles[1]&&p.y> D.mountain(2420)-90){const w=2420;if(oldX<=w&&p.x>w-half)p.x=w-half;if(oldX>w&&p.x<w+half)p.x=w+half;}
 p.vy=(p.vy||0)+1050*dt;p.y+=p.vy*dt;p.grounded=false;
 let ground=floor(s,p.x+ox)-oy;
 // Continuous slopes, one-way planks and riding cargo share the same support logic.
 for(const b of platforms(s,t)){if(p.x>=b.x-12&&p.x<=b.x+b.w+12&&oldY<=b.y+14&&p.y>=b.y&&p.vy>=0){ground=Math.min(ground,b.y);p.x+= (platforms(s,t+dt).find(q=>b.id?q.id===b.id:q.w===b.w)?.x-b.x||0);}}
 const c=s.cargo||s.star;if(c&&Math.abs(p.x-c.x)<c.r*.9&&oldY<=c.y-c.r+16&&p.y>=c.y-c.r&&p.vy>=0){ground=Math.min(ground,c.y-c.r);p.x+=(c.vx||0)*dt;}
 if(p.y>=ground&&p.vy>=0){p.y=ground;p.vy=0;p.grounded=true;}
 p.cargoHit=false;
 if(c&&!c.falling&&Math.abs(p.x-c.x)<c.r+half&&p.y>c.y-c.r+25){const side=oldX<c.x?-1:1;p.cargoHit=s.id===3&&Math.abs(c.vx)>110&&Math.sign(c.vx)===side;p.x=c.x+side*(c.r+half);}
}
const api={D,CHARS,TITLES,WIDTH,clamp,platforms,floor,walls,step};if(typeof module!=='undefined')module.exports=api;else root.World=api;
})(typeof window!=='undefined'?window:globalThis);
