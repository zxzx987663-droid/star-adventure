/* Only visuals and HUD copy. Geometry is shared; no gameplay mutations here. */
window.LevelView={
 hud(s,players,time){
  const name=t=>players.find(p=>p.token===t)?.char||'離線夥伴';
  if(s.id===2)return {objective:s.mode==='complete'?'五洞完成，六位前往出口集合':`洞穴 ${s.cave}/5 · 第 ${s.leg+1}/4 棒 · ${name(s.executors[s.leg])} · ${s.mode==='waiting'?'等待讀者讀取石碑':s.mode==='display'?'讀題中':s.mode==='discussion'?'語音討論｜第一次 E 輸入才計時':`剩 ${Math.max(0,s.inputUntil-time).toFixed(1)} 秒`}`,help:'<h3>五洞穴・四棒接力</h3><p>讀題者靠近自己的石碑按 E 後才會短暫看到答案。當棒執行者靠近固定符號按 E 輸入；連續相同符號可原地重複按 E。</p><p>每棒不同執行者，讀題者不能執行。第四、五洞有兩位讀題者，依石碑規則判斷真假；答錯或逾時只重置目前洞穴。</p>'};
  if(s.id===3)return {objective:s.delivered?'月亮送到終點了！':`${s.finalCheckpoint?'最後大坡：六人一起推月亮':'三人推月亮、三人開路'} · 推手 ${s.pushers}/${s.pusherGoal|| (s.finalCheckpoint?6:3)} · ${s.warning||'穩穩前進'}`,help:'<h3>推月亮</h3><p>前三位是推月亮組，後三位是前跑組。前跑組分別負責 A / B / C，三個不同的人都完成後橋面還需要短暫展開；橋固定前把月亮推進斷口會直接墜落並重開本關。</p><p>前半段只有推月亮組三人的推力有效；下坡先放手並開啟緩衝路面。最後大坡才重新集合六人一起推，坡腳檢查點會保留之前的路。月亮可以搭乘，也會壓人。</p>'};
  if(s.id===4)return {objective:`已抵達並按鈕 ${s.completed.length}/6 · ${s.bridgeOpen?'橋打開了！離開中央！':'每人到橋尾按自己的按鈕'}`,help:'<h3>越過兇狠月兔</h3><p>牠不能被擊倒。可以跳過身體，或看到蹲低預兆後等牠躍起，從下方通過。衝刺前有警告；重擊時跳起。</p><p>壓扁仍可慢慢走。隊友靠近按住互動 0.5 秒救起，救起後保護 0.5 秒。橋尾每人按 E 記錄完成，可以回頭救人；完成紀錄不會因被打消失。6/6 時中央橋會打開。</p>'};
  if(s.id===5)return {objective:s.arrivals.length===6?'所有冒險者已抵達。':`夕陽到星空 · 四段障礙賽 · 終點 ${s.arrivals.length}/6`,help:'<h3>最後一段路</h3><p>跳過斷崖、移動平台與會落下的平台。雲怪會快速折返；跳躍兔會蹲低後朝附近玩家落點跳；月餅會先警告再鎖定方向衝刺。中後段會遇到兩種怪的組合。</p><p>旗子是個人檢查點。壓扁後仍可慢走，隊友按住互動 0.5 秒救援；超過三秒未被救起就回到檢查點。終點六人一起按住三秒。</p>'};
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
   // STEP 11 integration QA: LV2 uses one dedicated cave terrain route instead of repeating LV1 ground tiles.
   if(!Art.draw(ctx,'levels','l2TerrainRoute','idle',0,0,t))drawTerrainBand(0,5400,()=>420,{chunk:160,h:92,tint:{color:'#65766f',alpha:.1},shade:{color:'#334047',alpha:.08}});
   D.caves.forEach((c,i)=>{
    const caveNo=i+1,live=caveNo===s.cave&&!s.caveCleared[caveNo],cleared=!!s.caveCleared[caveNo],x1=c.start-92,x2=c.gate+124;
    topGlow(x1,x2);
    ribbon(c.start+420,174,190,`洞穴 ${caveNo} ${cleared?'✓':''}`,cleared?'已通關':live?'進行中':'未解鎖');
    c.pads.forEach((x,j)=>{
     const key='l2Pad'+padKeys[j];
     // STEP 14: stone mechanisms stay dim by default; a symbol lights only after it is actually entered (or the cave is cleared).
     const pressed=cleared||(live&&['discussion','input'].includes(s.mode)&&Array.isArray(s.entered)&&s.entered.includes(j));
     const state=pressed?'on':'off';ctx.save();if(!live&&!cleared)ctx.globalAlpha=.72;if(cleared)ctx.globalAlpha=.94;if(!Art.draw(ctx,'levels',key,state,x,420,t,1)){ellipse(x,410,31,25,pressed?'#ffefb8':'#7e8584');text(['🌸','⭐','🍄','🌙'][j],x,414,23);}ctx.restore();if(live&&!pressed)ellipse(x,424,24,5,'#fff6c144');if(pressed)ellipse(x,424,27,7,'#ffe78a66');
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
   if(!Art.draw(ctx,'levels','l2Gate',gatherReady?'open':'closed',5100,428,t,1.02))gate(5100,gatherReady);
   if(gatherReady)glimmer(5100,325,6,18,14);ribbon(5100,222,180,'六位集合',gatherReady?'出口已開啟':'完成五個洞穴');text('⭐',5100,396,44,'#ffe49b');
  }

  if(s.id===3){
   if(!Art.draw(ctx,'levels','l3TerrainRoute','idle',0,0,t)){drawTerrainBand(0,5600,x=>D.mountain(x),{chunk:86,h:96,tint:{color:'#718a7e',alpha:.08},shade:{color:'#24333a',alpha:.08}});}
   for(const b of World.platforms(s,t)){
    const sc=Math.max(.75,Math.min(1.45,b.w/110));
    // The platform sprite is anchored by its walkable top; visible grass aligns with collision y.
    if(!Art.draw(ctx,'levels','l3Platform','idle',b.x+b.w/2,b.y-3*sc,t,sc))rect(b.x,b.y,b.w,14,'#ab9488',4);
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
   // STEP 5/6: one real foreground bridge, with a true open centre and visible escape gaps.
   if(!Art.draw(ctx,'levels','l4BridgeWest','idle',60,370,t))rect(60,416,1610,66,'#657487',4);
   if(!Art.draw(ctx,'levels','l4BridgeCenter',s.bridgeOpen?'open':'closed',1670,370,t)&&!s.bridgeOpen)rect(1670,416,660,66,'#79637a',4);
   if(!Art.draw(ctx,'levels','l4BridgeEast','idle',2330,370,t))rect(2330,416,1520,66,'#657487',4);
   // The three collision escape platforms sit above gaps already painted into bridge-east-escape.
   for(const ep of D.boss.escapePlatforms){
    const sc=ep.w/184;
    // bridge-mid source is 184 px wide and its deck surface is ~50 px from the top.
    if(!Art.draw(ctx,'levels','l4EscapePlatform','idle',ep.x+ep.w/2,ep.y-50*sc,t,sc))rect(ep.x,ep.y,ep.w,14,'#8f86a3',4);
   }
   if(s.bridgeOpen){const gx=D.boss.zone[0],gw=D.boss.zone[1]-D.boss.zone[0],water=ctx.createLinearGradient(0,412,0,540);water.addColorStop(0,'rgba(159,176,220,.12)');water.addColorStop(1,'rgba(88,112,173,.42)');ctx.fillStyle=water;ctx.fillRect(gx,416,gw,120);for(let i=0;i<7;i++)ellipse(gx+60+i*90,448+Math.sin(t*2+i)*6,26,6,'rgba(255,229,150,.22)');}
   sign('月兔橋 · 前往另一側 →',970,256);sign('觀察預兆：跳過或從下方穿越',1480,220);sign('破損橋段 · 正常狀態才能跳過',2785,228);sign('安全區 · 可回頭救援隊友',3470,252);
   const b={...s.boss,...D.bossPose(s.boss,t)},bossScale=b.mode==='fall'?1.05:1;
   if(!Art.draw(ctx,'boss','bridge',b.mode,b.x,b.y,t,bossScale,b.dir<0)){const squat=['crouch','stompWarning'].includes(b.mode);ellipse(b.x,b.y-(squat?28:40),52,squat?28:42,'#f4e6e7');text('ಠ ᴗ ಠ',b.x,b.y-30,26,'#733944');}
   const warn={crouch:'蹲低……要跳了！',leap:'趁現在，從下方穿過！',slamWarning:'⚠ 重槌預備！',slam:'砰！',stompWarning:'⚠ 踩踏！',stomp:'砰！',chargeWarning:'⚠ 衝刺！',charge:'衝刺！',recovery:'現在，跳過去！',fall:'月兔掉下去了！'}[b.mode]||'';text(warn,b.x,b.y-128,18,b.mode.includes('Warning')?'#ffcf7a':'#fff0d6');
   if(['crouch','leap','slam','slamWarning'].includes(b.mode)){ellipse(b.x,417,D.boss.attack.slamRadius+10,9,'#f49aa455');rect(b.x-D.boss.attack.slamRadius,414,D.boss.attack.slamRadius*2,5,'#ff8ca0');}
   if(['stompWarning','stomp'].includes(b.mode)){ellipse(b.x,417,D.boss.attack.stompRadius+8,11,'#ffd27b55');rect(b.x-D.boss.attack.stompRadius,414,D.boss.attack.stompRadius*2,5,'#ffcf6b');}
   if(b.mode==='chargeWarning'){const len=300,x0=b.dir>0?b.x:b.x-len;rect(x0,414,len,5,'#ffcf6b');text(b.dir>0?'➜':'⬅',b.x+b.dir*82,b.y-58,34,'#ffd77c');}
   if(b.mode==='charge')for(let i=1;i<=3;i++)ellipse(b.x-b.dir*i*30,b.y-38,18-i*3,8-i,'#fff1d633');if(b.mode==='recovery')text('💨',b.x-58,b.y-25,22);
   s.participants.forEach((token,i)=>{const p=room.players.find(p=>p.token===token),x=D.boss.buttons[i],done=s.completed.includes(token);rect(x-22,418,44,18,done?'#d9c47b':'#7788a3',7);rect(x-15,433,30,36,done?'#94704f':'#5e6883',4);ellipse(x,413,16,7,done?'#fff0a7':'#d7deea');ellipse(x,408,21,10,done?'#ffd777':'#96a7c7');text(done?'★':'E',x,414,done?13:11,done?'#af7620':'#4b5975');text(p?.char||'',x,378-i%2*16,10,'#fff2dc');if(done)glimmer(x,384,3,18,10,'#ffe9a2');});
   sign('各自按鈕 · E',3580,233);text(`${s.completed.length} / 6`,3580,313,28,'#fff0c5');if(s.bridgeOpen)text('✦ 月光機關啟動！ ✦',2000,325,22,'#ffe69b');
  }

  if(s.id===5){
   const badge=(label,x,y)=>{ctx.save();ctx.globalAlpha=.96;rect(x-74,y-18,148,36,'#fff6dd',8);text(label,x,y+6,14,'#576a67');ctx.restore();};
   const floatingMark=(x,y,str)=>{text(str,x,y+Math.sin(t*3+x*.01)*3,15,'#ffe39c');};
   // STEP 7: continuous route artwork replaces repeating ground tiles.
   if(!Art.draw(ctx,'levels','l5TerrainRoute','idle',0,0,t)){
    const solids=[];let start=0;D.gaps.forEach(([a,b])=>{solids.push([start,a]);start=b;});solids.push([start,5700]);
    solids.forEach(([a,b])=>{const y=D.raceFloor((a+b)/2);rect(a,y,b-a,86,'#6f7c7b',0);});
   }
   sign('最後一段路 · 月光障礙賽',420,230);
   badge('起跑平台',230,330);badge('移動浮台區',1460,250);badge('陷阱平台區',3230,232);badge('終點祭壇',5530,242);
   D.checkpoints.forEach((x,i)=>{const y=D.raceFloor(x);if(!Art.draw(ctx,'levels','l5Checkpoint','idle',x,y+7,t,.78)){line(x,y,x,y-95,'#e8d3a2',5);text('⚑',x+14,y-70,40,'#f7d28c');}text(`CHECKPOINT ${i+1}`,x+58,y-104,12,'#fff0d0');if(i<3)floatingMark(x+85,y-128,'✦');});
   for(const b of World.platforms(s,t)){
    const state=b.id.startsWith('fall')?'falling':'idle';
    // Each PNG keeps width-calibrated canvas but has a different transparent top margin.
    const surfaceOffset={hop:-25,moving1:-9,narrow:-21,moving2:-9,fall1:-10,fall2:-10}[b.id]??0;
    if(!Art.draw(ctx,'platforms',b.id,state,b.x+b.w/2,b.y+surfaceOffset,t,1))rect(b.x,b.y,b.w,14,b.id.startsWith('fall')?'#d6a4a8':'#b6b9d2',4);
    if(b.id.startsWith('moving')){text('↔',b.x+b.w/2,b.y-16,18,'#fff0ad');ellipse(b.x+b.w/2,b.y+18,32,6,'#fff2c144');}
    if(b.id==='narrow')text('小心跳躍',b.x+b.w/2,b.y-18,10,'#fff1c8');
    if(b.id.startsWith('fall')){text('✦',b.x+b.w/2,b.y-12,13,'#ffd98a');text('踩久會落下',b.x+b.w/2,b.y-28,10,'#fff0cc');}
   }
   // STEP 8: state-specific art + shared flipX renderer make attack tells and facing truthful.
   for(const raw of s.enemies){
    const m={...raw,...D.enemyPose(raw,t)};
    if(!Art.draw(ctx,'enemies',m.type,m.mode,m.x,m.y,t,1,m.dir<0)){
     ellipse(m.x,m.y-18,20,18,{patrol:'#b3c4aa',hopper:'#c9afdc',charger:'#e1a68b'}[m.type]);
     text(m.type==='hopper'?'↟':m.dir>0?'›':'‹',m.x,m.y-7,24,'#554957');
    }
    if(m.mode==='warning'){ellipse(m.x,m.y-53,19,19,'#f06f7a');text('！',m.x,m.y-47,22,'#fff6d6');const tx=m.x+m.dir*90;line(m.x,m.y-5,tx,m.y-5,'#ffd170',3);text(m.dir>0?'➜':'⬅',tx,m.y-7,20,'#ffe39a');}
    if(m.mode==='crouch')text('↟',m.x,m.y-56,18,'#ffe19b');
    if(m.mode==='recovery')text('💫',m.x,m.y-54,15,'#fff1b2');
   }
   for(const [x,y] of [[1160,300],[3060,292],[4550,255]])Art.draw(ctx,'levels','l5LanternSpirit','idle',x,y,t,.72);
   for(const [x,y,msg] of [[760,278,'跨過斷崖'],[2050,195,'小心雲怪＋跳兔'],[3920,200,'避開月餅衝刺'],[4700,170,'最後組合怪！'],[4970,182,'最後集合！']]){floatingMark(x,y,'✦');text(msg,x,y+24,13,'#fff1cd');}
   Art.draw(ctx,'levels','l5Final','idle',5530,401,t,.9);
   text('全員集合 · 按住 E 3 秒',5530,284,18,'#fff1c9');
   if(s.arrivals.length===6){text(`${Math.min(3,s.hold).toFixed(1)} / 3 秒`,5530,315,18,'#ffe69c');if(s.hold>0){ellipse(5530,360,48+Math.min(3,s.hold)*12,16,'#fff0a433');text('月光聚集中…',5530,338,13,'#fff5d2');}}
   else text(`${s.arrivals.length} / 6 抵達`,5530,315,18,'#ffe69c');
  }
 }
};
