/* Shared world coordinates and deterministic player physics. y = feet, x = centre. */
(function(root){
const CHARS=['吉伊卡哇','小八','兔兔','小桃','栗子饅頭','海獺師傅','風獅爺','古本屋'];
const TITLES={1:'今天也要去工作！',2:'奇怪的洞穴',3:'超級搬運工',4:'討伐 BOSS',5:'星空之塔',ending:'冒險完成。',party:'Party Room'};
const WIDTH={1:2900,2:3000,3:3100,4:2700,5:3000,ending:1400,party:1800};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function platforms(s,t){
 if(s.id===1)return [{x:330,y:365,w:110},{x:455+Math.sin(t*1.25)*65,y:340,w:115},{x:1430+Math.sin(t)*85,y:460,w:125},{x:1990+Math.sin(t*.85)*90,y:370,w:150},{x:2180,y:330,w:140},...(!s.bridgeBroken?[{x:1410,y:420,w:290}]:[])];
 return [];
}
function floor(s,x){
 if(s.id===1&&((x>410&&x<565)||(x>1420&&x<1680)||(x>1960&&x<2170)))return 1000;
 if(s.id===3){if(x>=500&&x<900)return 420-(x-500)*.2;if(x>=900&&x<1120)return 340+(x-900)*80/220;
 if(x>=1140&&x<1240)return 420+(410-195*(s.seesaw||0)-420)*(x-1140)/100;
 if(x>=1240&&x<=1630)return 410+(x-1435)*(s.seesaw||0);
 if(x>1630&&x<1730)return (410+195*(s.seesaw||0))+(420-(410+195*(s.seesaw||0)))*(x-1630)/100;}
 return 420;
}
function walls(s){
 if(s.id===1&&!s.gateOpen)return [1040];
 if(s.id===2&&!s.pairs?.every(p=>p.solved))return [2650];
 if(s.id===5)return [...(!s.plateLatch?[650]:[]),...(!s.clueSolved?[1270]:[]),...(!s.starDone?[2210]:[])];
 return [];
}
function step(p,input,s,dt,t){
 if(p.down||s.id==='ending'||s.cleared){p.vx=0;return;}
 const dir=(input.right?1:0)-(input.left?1:0),oldX=p.x,oldY=p.y;
 if(input.jump&&!p.jumpHeld&&p.grounded){p.vy=-465;p.grounded=false;}
 p.jumpHeld=!!input.jump;p.vx=dir*210+(p.kick||0);p.kick=(p.kick||0)*Math.exp(-6*dt);
 p.x=clamp(p.x+p.vx*dt,26,WIDTH[s.id]-26);
 for(const w of walls(s)){if(oldX<=w&&p.x>w-23)p.x=w-23;if(oldX>w&&p.x<w+23)p.x=w+23;}
 p.vy=(p.vy||0)+1050*dt;p.y+=p.vy*dt;p.grounded=false;
 let ground=floor(s,p.x);
 // Continuous slopes, one-way planks and riding cargo share the same support logic.
 for(const b of platforms(s,t)){if(p.x>=b.x-12&&p.x<=b.x+b.w+12&&oldY<=b.y+14&&p.y>=b.y&&p.vy>=0){ground=Math.min(ground,b.y);p.x+= (platforms(s,t+dt).find(q=>q.w===b.w)?.x-b.x||0);}}
 const c=s.cargo||s.star;if(c&&Math.abs(p.x-c.x)<c.r*.9&&oldY<=c.y-c.r+16&&p.y>=c.y-c.r&&p.vy>=0){ground=Math.min(ground,c.y-c.r);p.x+=(c.vx||0)*dt;}
 if(p.y>=ground&&p.vy>=0){p.y=ground;p.vy=0;p.grounded=true;}
 p.cargoHit=false;
 if(c&&!c.falling&&Math.abs(p.x-c.x)<c.r+23&&p.y>c.y-c.r+25){const side=oldX<c.x?-1:1;p.cargoHit=s.id===3&&Math.abs(c.vx)>110&&Math.sign(c.vx)===side;p.x=c.x+side*(c.r+23);}
}
const api={CHARS,TITLES,WIDTH,clamp,platforms,floor,walls,step};if(typeof module!=='undefined')module.exports=api;else root.World=api;
})(typeof window!=='undefined'?window:globalThis);
