/* Only visuals and HUD copy. Geometry is shared; no gameplay mutations here. */
window.LevelView={
 hud(s,players,time){
  const name=t=>players.find(p=>p.token===t)?.char||'離線夥伴';
  if(s.id===2)return {objective:s.mode==='complete'?'五洞完成，六位前往出口集合':`洞穴 ${s.cave}/5 · 第 ${s.leg+1}/4 棒 · ${name(s.executors[s.leg])} · ${s.mode==='waiting'?'等待讀者讀取石碑':s.mode==='display'?'讀題中':s.mode==='discussion'?'語音討論｜第一次 E 輸入才計時':`剩 ${Math.max(0,s.inputUntil-time).toFixed(1)} 秒`}`,help:'<h3>五洞穴・四棒接力</h3><p>讀題者靠近自己的石碑按 E 後才會短暫看到答案。當棒執行者靠近固定符號按 E 輸入；連續相同符號可原地重複按 E。</p><p>每棒不同執行者，讀題者不能執行。第四、五洞有兩位讀題者，依石碑規則判斷真假；答錯或逾時只重置目前洞穴。</p>'};
  if(s.id===3)return {objective:s.delivered?'月亮送到終點了！':`${s.finalCheckpoint?'最後大坡：六人一起推月亮':'三人推月亮、三人開路'} · 推手 ${s.pushers}/6 · ${s.warning||'穩穩前進'}`,help:'<h3>推月亮</h3><p>靠近月亮往右走就能推。前跑組跳上高台按 E 開路，推月亮組穩住上坡。1–2 人慢、3 人正常、4–6 人會失控。下坡放手，先開啟緩衝路面；月亮掉落就回到檢查點。</p><p>最後大坡反過來：六人才能穩定上坡，五人非常慢，更少就倒滾。坡腳檢查點會保留之前的路。月亮可以搭乘，也會壓人。</p>'};
  if(s.id===4)return {objective:`已抵達並按鈕 ${s.completed.length}/6 · ${s.bridgeOpen?'橋打開了！離開中央！':'每人到橋尾按自己的按鈕'}`,help:'<h3>越過兇狠月兔</h3><p>牠不能被擊倒。可以跳過身體，或看到蹲低預兆後等牠躍起，從下方通過。衝刺前有警告；重擊時跳起。</p><p>壓扁仍可慢慢走。隊友靠近按住互動 0.5 秒救起，救起後保護 0.5 秒。橋尾每人按 E 記錄完成，可以回頭救人；完成紀錄不會因被打消失。6/6 時中央橋會打開。</p>'};
  if(s.id===5)return {objective:s.arrivals.length===6?'所有冒險者已抵達。':`夕陽到星空 · 四段障礙賽 · 終點 ${s.arrivals.length}/6`,help:'<h3>最後一段路</h3><p>跳過斷崖、移動平台與會落下的平台，留意小怪預兆。旗子是個人檢查點，掉落只回到自己的上一面旗。</p><p>壓扁後仍可慢走，隊友按住互動 0.5 秒救援；超過三秒未被救起就回到檢查點。終點六人一起按住三秒。</p>'};
  return {};
 },
 draw(s,t,room,kit){
  const {ctx,rect,text,line,ellipse,sign,gate,cargo}=kit,D=Geometry;
  const data=Art?.data||{};
  const img=(cat,key,state='idle')=>{
   try{return Art.image(data?.[cat]?.[key]?.animations?.[state]);}catch{return null;}
  };
  const drawImage=(image,x,y,w,h,alpha=1)=>{if(!image)return false;ctx.save();ctx.globalAlpha=alpha;ctx.drawImage(image,x,y,w,h);ctx.restore();return true;};
  const drawTerrainBand=(x1,x2,getY,opt={})=>{
   const left=img('levels',opt.left||'l1GroundLeft'),mid=img('levels',opt.mid||'l1GroundMid'),right=img('levels',opt.right||'l1GroundRight');
   const chunk=opt.chunk||96,h=opt.h||118,overlap=opt.overlap??4,tint=opt.tint,shade=opt.shade;
   if(!left||!mid||!right){
    ctx.save();
    ctx.fillStyle=opt.fallbackFill||'#7d8f88';
    for(let x=x1;x<x2;x+=chunk){const w=Math.min(chunk,x2-x),y=getY(x+w/2)-9;ctx.fillRect(x,y,w,h);}ctx.restore();
    return;
   }
   const pieces=[];
   for(let x=x1;x<x2;x+=chunk-overlap){const w=Math.min(chunk,x2-x);pieces.push({x,w});if(x+w>=x2)break;}
   pieces.forEach((p,i)=>{
    const isFirst=i===0,isLast=i===pieces.length-1,src=isFirst?left:isLast?right:mid,y=getY(p.x+p.w/2)-9;
    drawImage(src,p.x,y,p.w+(isLast?0:overlap),h);
    if(tint){ctx.save();ctx.globalAlpha=tint.alpha??.18;ctx.fillStyle=tint.color||'#7a8c84';ctx.fillRect(p.x,y,p.w+(isLast?0:overlap),h);ctx.restore();}
    if(shade){ctx.save();ctx.globalAlpha=shade.alpha??.14;ctx.fillStyle=shade.color||'#23323a';ctx.fillRect(p.x,y+h*.52,p.w+(isLast?0:overlap),h*.48);ctx.restore();}
   });
  };
  const glimmer=(x,y,count=4,spread=18,size=12,color='#ffe9a6')=>{for(let k=0;k<count;k++)text('✦',x+(k-(count-1)/2)*spread,y+Math.sin(t*5+k)*5,size,color);};

  if(s.id===2){
   const ribbon=(x,y,w,a,b)=>{rect(x-w/2,y-18,w,36,'#fff5dde8',9);text(a,x,y-1,15,'#4f605b');if(b)text(b,x,y+14,10,'#777d70');};
   const topGlow=(x1,x2)=>{const g=ctx.createLinearGradient(0,388,0,470);g.addColorStop(0,'rgba(255,243,205,.22)');g.addColorStop(1,'rgba(255,243,205,0)');ctx.fillStyle=g;ctx.fillRect(x1,388,x2-x1,82);};
   const padKeys=['Flower','Star','Mushroom','Moon'];
   const gatherReady=s.caveCleared.slice(1).every(Boolean);
   D.caves.forEach((c,i)=>{
    const caveNo=i+1,live=caveNo===s.cave&&!s.caveCleared[caveNo],cleared=!!s.caveCleared[caveNo],x1=c.start-92,x2=c.gate+124;
    drawTerrainBand(x1,x2,()=>420,{chunk:120,h:118,tint:{color:live?'#6d8275':'#5f7269',alpha:live?.08:.16},shade:{color:'#334047',alpha:.12}});
    topGlow(x1,x2);
    ribbon(c.start+420,174,190,`洞穴 ${caveNo} ${cleared?'✓':''}`,cleared?'已通關':live?'進行中':'未解鎖');
    c.pads.forEach((x,j)=>{
     const key='l2Pad'+padKeys[j],state=live?'on':'off';ctx.save();if(!live&&!cleared)ctx.globalAlpha=.72;if(cleared)ctx.globalAlpha=.9;if(!Art.draw(ctx,'levels',key,state,x,418,t,.78)){ellipse(x,412,34,12,live?'#fff0c7':'#d5d3b3');text(['🌸','⭐','🍄','🌙'][j],x,414,25);}ctx.restore();if(live)ellipse(x,423,26,7,'#fff6c166');
    });
    const readers=caveNo>=4?2:1;
    for(let j=0;j<readers;j++){
     const x=c.readers[j],active=live&&s.mode==='waiting',state=caveNo>=4&&j===1?'special':'normal';
     if(!Art.draw(ctx,'levels','l2Reader',state,x,420,t,.96))rect(x-24,344,48,76,active?'#e5dd9e':'#83968c',8);
     if(active){ellipse(x,332,38,10,'#f5d78666');text('✦',x,338,24,'#ffe28b');}
     text(j?'B':'A',x,377,15,'#614f42');if(live)text(room.players.find(p=>p.token===s.readers[j])?.char||'',x,448,12,'#fff1cf');
    }
    if(!Art.draw(ctx,'levels','l2Gate',cleared?'open':'closed',c.gate,428,t,.96))gate(c.gate,cleared);
    if(cleared)glimmer(c.gate,332,4,16,13); else if(live){ellipse(c.gate,363,62,18,'#ffecc433');text('月光封印',c.gate,336,11,'#fff3d2');}
    if(live)ribbon(c.start+420,236,330,s.rule,s.mode==='waiting'?'等待讀者靠近自己的石碑按 E':s.mode==='display'?'讀者正在閱讀石碑……':s.mode==='complete'?'本洞穴完成':`靠近符號按 E · ${s.entered.length}/${s.cfg.length}`);
   });
   drawTerrainBand(4988,5228,()=>420,{chunk:120,h:118,tint:{color:'#687b72',alpha:.1},shade:{color:'#334047',alpha:.12}});
   if(!Art.draw(ctx,'levels','l2Gate',gatherReady?'open':'closed',5100,428,t,1.02))gate(5100,gatherReady);
   if(gatherReady)glimmer(5100,325,6,18,14);ribbon(5100,222,180,'六位集合',gatherReady?'出口已開啟':'完成五個洞穴');text('⭐',5100,396,44,'#ffe49b');
  }

  if(s.id===3){
   drawTerrainBand(0,5600,x=>D.mountain(x),{chunk:86,h:126,tint:{color:'#718a7e',alpha:.08},shade:{color:'#24333a',alpha:.1}});
   for(const b of World.platforms(s,t)){
    const sc=Math.max(.75,Math.min(1.45,b.w/110));
    if(!Art.draw(ctx,'levels','l3Platform','idle',b.x+b.w/2,b.y+18,t,sc))rect(b.x,b.y,b.w,14,'#ab9488',4);
   }
   sign('🌕 推月亮任務',400,240);sign('3 人推 · 放手會倒滾',660,180);sign('前跑組 ↑ 跳上高台按 E',1130,100);sign('下坡！放手，小心月亮！',2770,100);
   D.cargo.switches.forEach(k=>{const on=s.switches[k.id];if(!Art.draw(ctx,'levels','l3Switch',on?'on':'off',k.x,k.y+10,t)){rect(k.x-17,k.y-38,34,38,on?'#9ed7ac':'#e8c378',5);line(k.x,k.y-18,k.x+(on?13:-13),k.y-45,'#5c4c5b',5);}text(on?'✓':'E',k.x,k.y-58,18);});
   D.cargo.obstacles.forEach((o,i)=>{const y=D.mountain(o.x),open=s.obstacles[i];if(o.kind==='bridge'){const cx=(o.x+o.end)/2,w=o.end-o.x,sc=Math.max(.72,Math.min(1.3,w/210));if(!Art.draw(ctx,'levels','l3Bridge',open?'open':'closed',cx,y+24,t,sc)){if(open)rect(o.x,y,w,14,'#b6c995');else{line(o.x,y-35,o.x,y,'#f6cb75',5);text('⚠',o.x,y-55,24);}}}else{if(!Art.draw(ctx,'levels','l3Gate',open?'open':'closed',o.x,y+8,t)){rect(o.x-12,open?y-150:y-90,24,open?40:90,open?'#84a991':'#cf8591',4);}text(open?'✓':'A + B',o.x,y-118,18);}});
   for(const x of [2500,4100]){const y=D.mountain(x),state=x===2500?'mid':'final';if(!Art.draw(ctx,'levels','l3Checkpoint',state,x,y+8,t)){line(x,y,x,y-90,'#eddfa8',5);text('⚑',x+17,y-62,36);}text(x===2500?'中途檢查點':'六人集合 · 最後大坡',x+80,y-110,16);}   
   const deco=[[1840,'crate'],[2670,'stone'],[3470,'fence']];for(const [x,state] of deco){const y=D.mountain(x);Art.draw(ctx,'levels','l3Obstacle',state,x,y+5,t,.72);}   
   const c={...s.cargo,...D.cargoPose(s.cargo,t,s.obstacles)};
   if(!s.delivered){if(!Art.draw(ctx,'cargo','pink','idle',c.x,c.y+c.r,t))cargo(c);}else{Art.draw(ctx,'levels','l3Checkpoint','final',5390,D.mountain(5390)+4,t,1.05);text('NPC：辛苦了！',5390,D.mountain(5390)-100,24);} 
  }

  if(s.id===4){
   const drawBridgeSegment=(x,w,tone='stone')=>{const palette={stone:['#6b7695','#505b79','#f0c97e'],safe:['#657487','#556277','#e6c47f'],center:['#79637a','#604d63','#f0c97e']}[tone]||['#6b7695','#505b79','#f0c97e'];const topY=416,railY=393;rect(x,topY,w,18,palette[0],6);rect(x,434,w,48,palette[1],4);line(x,417,x+w,417,palette[2],4);for(let px=x+26;px<x+w;px+=78){line(px,railY,px,417,'#5d4e58',6);ellipse(px,railY-8,7,9,'#ffd67c');ellipse(px,railY-8,16,18,'#ffd67c22');if(px<x+w-28)line(px+6,railY-18,px+72,railY-18,'#7e7a92',4);}};
   drawBridgeSegment(60,930,'safe');drawBridgeSegment(1005,655,'stone');if(!s.bridgeOpen)drawBridgeSegment(1670,660,'center');drawBridgeSegment(2330,645,'stone');drawBridgeSegment(2990,850,'safe');
   if(s.bridgeOpen){const gx=1670,gw=660,water=ctx.createLinearGradient(0,412,0,540);water.addColorStop(0,'rgba(159,176,220,.15)');water.addColorStop(1,'rgba(88,112,173,.5)');ctx.fillStyle=water;ctx.fillRect(gx,416,gw,120);for(let i=0;i<7;i++)ellipse(gx+60+i*90,448+Math.sin(t*2+i)*6,26,6,'rgba(255,229,150,.25)');}
   sign('月兔橋 · 前往另一側 →',970,256);sign('觀察預兆：跳過或從下方穿越',1480,220);sign('安全區 · 可回頭救援隊友',2825,252);
   const b={...s.boss,...D.bossPose(s.boss,t)},bossScale=b.mode==='fall'?1.05:1;
   if(!Art.draw(ctx,'boss','bridge',b.mode,b.x,b.y,t,bossScale,b.dir<0)){const squat=['crouch','stompWarning'].includes(b.mode);ellipse(b.x,b.y-(squat?28:40),52,squat?28:42,'#f4e6e7');text('ಠ ᴗ ಠ',b.x,b.y-30,26,'#733944');}
   const warn={crouch:'蹲低……要跳了！',leap:'趁現在，從下方穿過！',slamWarning:'⚠ 重槌預備！',slam:'砰！',stompWarning:'⚠ 踩踏！',stomp:'砰！',chargeWarning:'⚠ 衝刺！',charge:'衝刺！',recovery:'現在，跳過去！',fall:'月兔掉下去了！'}[b.mode]||'';text(warn,b.x,b.y-128,18,b.mode.includes('Warning')?'#ffcf7a':'#fff0d6');
   if(['crouch','leap','slam','slamWarning'].includes(b.mode)){ellipse(b.x,417,145,9,'#f49aa455');rect(b.x-135,414,270,5,'#ff8ca0');}if(['stompWarning','stomp'].includes(b.mode)){ellipse(b.x,417,105,11,'#ffd27b55');rect(b.x-95,414,190,5,'#ffcf6b');}if(b.mode==='chargeWarning'){const x0=Math.min(b.x,b.x+b.dir*230);rect(x0,414,230,5,'#ffcf6b');text(b.dir>0?'➜':'⬅',b.x+b.dir*82,b.y-58,34,'#ffd77c');}if(b.mode==='charge')for(let i=1;i<=3;i++)ellipse(b.x-b.dir*i*30,b.y-38,18-i*3,8-i,'#fff1d633');if(b.mode==='recovery')text('💨',b.x-58,b.y-25,22);
   s.participants.forEach((token,i)=>{const p=room.players.find(p=>p.token===token),x=D.boss.buttons[i],done=s.completed.includes(token);rect(x-22,418,44,18,done?'#d9c47b':'#7788a3',7);rect(x-15,433,30,36,done?'#94704f':'#5e6883',4);ellipse(x,413,16,7,done?'#fff0a7':'#d7deea');ellipse(x,408,21,10,done?'#ffd777':'#96a7c7');text(done?'★':'E',x,414,done?13:11,done?'#af7620':'#4b5975');text(p?.char||'',x,378-i%2*16,10,'#fff2dc');if(done)glimmer(x,384,3,18,10,'#ffe9a2');});
   sign('各自按鈕 · E',3580,233);text(`${s.completed.length} / 6`,3580,313,28,'#fff0c5');if(s.bridgeOpen)text('✦ 月光機關啟動！ ✦',2000,325,22,'#ffe69b');
  }

  if(s.id===5){
   const badge=(label,x,y)=>{ctx.save();ctx.globalAlpha=.96;rect(x-74,y-18,148,36,'#fff6dd',8);text(label,x,y+6,14,'#576a67');ctx.restore();};
   const floatingMark=(x,y,str)=>{text(str,x,y+Math.sin(t*3+x*.01)*3,15,'#ffe39c');};
   const solids=[]; let start=0; D.gaps.forEach(([a,b])=>{solids.push([start,a]);start=b;});solids.push([start,5700]);
   solids.forEach(([a,b])=>drawTerrainBand(a,b,x=>D.raceFloor(x),{chunk:92,h:126,tint:{color:'#7e90a3',alpha:.08},shade:{color:'#233047',alpha:.12}}));
   sign('最後一段路 · 月光障礙賽',420,230);
   badge('起跑平台',230,330); badge('移動浮台區',1460,250); badge('陷阱平台區',3230,232); badge('終點祭壇',5530,242);
   D.checkpoints.forEach((x,i)=>{const y=D.raceFloor(x);if(!Art.draw(ctx,'levels','l5Checkpoint','idle',x,y+7,t,.78)){line(x,y,x,y-95,'#e8d3a2',5);text('⚑',x+14,y-70,40,'#f7d28c');}text(`CHECKPOINT ${i+1}`,x+58,y-104,12,'#fff0d0');if(i<3)floatingMark(x+85,y-128,'✦');});
   for(const b of World.platforms(s,t)){
    const state=b.id.startsWith('fall')?'falling':'idle',sc=Math.max(.62,Math.min(1.35,b.w/110));
    if(!Art.draw(ctx,'platforms',b.id,state,b.x+b.w/2,b.y+21,t,sc))rect(b.x,b.y,b.w,14,b.id.startsWith('fall')?'#d6a4a8':'#b6b9d2',4);
    if(b.id.startsWith('moving')){text('↔',b.x+b.w/2,b.y-16,18,'#fff0ad');ellipse(b.x+b.w/2,b.y+18,32,6,'#fff2c144');}
    if(b.id==='narrow'){text('小心跳躍',b.x+b.w/2,b.y-18,10,'#fff1c8');}
    if(b.id.startsWith('fall')){text('✦',b.x+b.w/2,b.y-12,13,'#ffd98a');text('踩久會落下',b.x+b.w/2,b.y-28,10,'#fff0cc');}
   }
   for(const raw of s.enemies){
    const m={...raw,...D.enemyPose(raw,t)};
    if(!Art.draw(ctx,'enemies',m.type,m.mode,m.x,m.y,t,1,m.dir<0)){
     ellipse(m.x,m.y-18,20,18,{patrol:'#b3c4aa',hopper:'#c9afdc',charger:'#e1a68b'}[m.type]);
     text(m.type==='hopper'?'↟':m.dir>0?'›':'‹',m.x,m.y-7,24,'#554957');
    }
    if(m.mode==='warning'){ellipse(m.x,m.y-48,18,18,'#f06f7a');text('！',m.x,m.y-42,22,'#fff6d6');}
    if(m.mode==='crouch')text('↟',m.x,m.y-50,18,'#ffe19b');
   }
   for(const [x,y] of [[1160,300],[3060,292],[4550,255]]) Art.draw(ctx,'levels','l5LanternSpirit','idle',x,y,t,.72);
   for(const [x,y,msg] of [[760,278,'跨過斷崖'],[2050,195,'跟著浮台節奏'],[3920,200,'避開月餅衝刺'],[4970,182,'最後集合！']]){floatingMark(x,y,'✦');text(msg,x,y+24,13,'#fff1cd');}
   Art.draw(ctx,'levels','l5Final','idle',5530,401,t,.9);
   text('全員集合 · 按住 E 3 秒',5530,284,18,'#fff1c9');
   if(s.arrivals.length===6){text(`${Math.min(3,s.hold).toFixed(1)} / 3 秒`,5530,315,18,'#ffe69c');if(s.hold>0){ellipse(5530,360,48+Math.min(3,s.hold)*12,16,'#fff0a433');text('月光聚集中…',5530,338,13,'#fff5d2');}}
   else text(`${s.arrivals.length} / 6 抵達`,5530,315,18,'#ffe69c');
  }
 }
};
