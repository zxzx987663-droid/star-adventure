/* Only visuals and HUD copy. Geometry is shared; no gameplay mutations here. */
window.LevelView={
 hud(s,players,time){const name=t=>players.find(p=>p.token===t)?.char||'離線夥伴';if(s.id===2)return {objective:s.mode==='complete'?'五洞完成，六位前往出口集合':`洞穴 ${s.cave}/5 · 第 ${s.leg+1}/4 棒 · ${name(s.executors[s.leg])} · ${s.mode==='waiting'?'等待讀者讀取石碑':s.mode==='display'?'讀題中':s.mode==='discussion'?'語音討論｜第一次 E 輸入才計時':`剩 ${Math.max(0,s.inputUntil-time).toFixed(1)} 秒`}`,help:'<h3>五洞穴・四棒接力</h3><p>讀題者靠近自己的石碑按 E 後才會短暫看到答案。當棒執行者靠近固定符號按 E 輸入；連續相同符號可原地重複按 E。</p><p>每棒不同執行者，讀題者不能執行。第四、五洞有兩位讀題者，依石碑規則判斷真假；答錯或逾時只重置目前洞穴。</p>'};
 if(s.id===3)return {objective:s.delivered?'月亮送到終點了！':`${s.finalCheckpoint?'最後大坡：六人一起推月亮':'三人推月亮、三人開路'} · 推手 ${s.pushers}/6 · ${s.warning||'穩穩前進'}`,help:'<h3>推月亮</h3><p>靠近月亮往右走就能推。前跑組跳上高台按 E 開路，推月亮組穩住上坡。1–2 人慢、3 人正常、4–6 人會失控。下坡放手，先開啟緩衝路面；月亮掉落就回到檢查點。</p><p>最後大坡反過來：六人才能穩定上坡，五人非常慢，更少就倒滾。坡腳檢查點會保留之前的路。月亮可以搭乘，也會壓人。</p>'};
 if(s.id===4)return {objective:`已抵達並按鈕 ${s.completed.length}/6 · ${s.bridgeOpen?'橋打開了！離開中央！':'每人到橋尾按自己的按鈕'}`,help:'<h3>越過兇狠月兔</h3><p>牠不能被擊倒。可以跳過身體，或看到蹲低預兆後等牠躍起，從下方通過。衝刺前有警告；重擊時跳起。</p><p>壓扁仍可慢慢走。隊友靠近按住互動 0.5 秒救起，救起後保護 0.5 秒。橋尾每人按 E 記錄完成，可以回頭救人；完成紀錄不會因被打消失。6/6 時中央橋會打開。</p>'};
 if(s.id===5)return {objective:s.arrivals.length===6?'所有冒險者已抵達。':`夕陽到星空 · 四段障礙賽 · 終點 ${s.arrivals.length}/6`,help:'<h3>最後一段路</h3><p>跳過斷崖、移動平台與會落下的平台，留意小怪預兆。旗子是個人檢查點，掉落只回到自己的上一面旗。</p><p>壓扁後仍可慢走，隊友按住互動 0.5 秒救援；超過三秒未被救起就回到檢查點。終點六人一起按住三秒。</p>'};return {};},
 draw(s,t,room,kit){const {ctx,rect,text,line,ellipse,sign,gate,cargo}=kit,D=Geometry;
 if(s.id===2){D.caves.forEach((c,i)=>{line(c.start,430,c.gate-40,430,'#3e665c',10);text(`洞穴 ${i+1} ${s.caveCleared[i+1]?'✓':''}`,c.start+400,180,24,'#fff0cb');c.pads.forEach((x,j)=>{const live=i+1===s.cave&&!s.caveCleared[i+1];ellipse(x,414,35,13,live?'#a7bda2':'#71867a');ellipse(x,405,29,12,'#fff0c7');text(['🌸','⭐','🍄','🌙'][j],x,413,27);});const readers=i>=3?2:1;for(let j=0;j<readers;j++){const x=c.readers[j],active=i+1===s.cave&&s.mode==='waiting';const state=i>=3&&j===1?'special':'normal';if(!Art.draw(ctx,'levels','l2Reader',state,x,420,t)){rect(x-24,344,48,76,active?'#e5dd9e':'#83968c',8);}if(active){ellipse(x,330,35,8,'#f5d78666');text('✦',x,336,24,'#ffe28b');}text(j?'B':'A',x,380,15,'#614f42');if(i+1===s.cave)text(room.players.find(p=>p.token===s.readers[j])?.char||'',x,450,12,'#fff1cf');}const isOpen=s.caveCleared[i+1];if(!Art.draw(ctx,'levels','l2Gate',isOpen?'open':'closed',c.gate,430,t))gate(c.gate,isOpen);if(i+1===s.cave){text(s.rule,c.start+410,224,14,'#fff4db');text(s.mode==='waiting'?'等待讀者靠近自己的石碑按 E':s.mode==='display'?'讀者正在閱讀石碑……':s.mode==='complete'?'完成':`語音傳遞 → 執行者靠近符號按 E · ${s.entered.length}/${s.cfg.length}`,c.start+410,269,14,'#d8dfd1');}});sign('六位集合',5100);text('⭐',5100,395,45);}
 if(s.id===3){for(const b of World.platforms(s,t)){const sc=Math.max(.75,Math.min(1.45,b.w/110));if(!Art.draw(ctx,'levels','l3Platform','idle',b.x+b.w/2,b.y+18,t,sc))rect(b.x,b.y,b.w,14,'#ab9488',4);}sign('🌕 推月亮任務',400,240);sign('3 人推 · 放手會倒滾',660,180);sign('前跑組 ↑ 跳上高台按 E',1130,100);sign('下坡！放手，小心月亮！',2770,100);
 D.cargo.switches.forEach(k=>{const on=s.switches[k.id];if(!Art.draw(ctx,'levels','l3Switch',on?'on':'off',k.x,k.y+10,t)){rect(k.x-17,k.y-38,34,38,on?'#9ed7ac':'#e8c378',5);line(k.x,k.y-18,k.x+(on?13:-13),k.y-45,'#5c4c5b',5);}text(on?'✓':'E',k.x,k.y-58,18);});
 D.cargo.obstacles.forEach((o,i)=>{const y=D.mountain(o.x),open=s.obstacles[i];if(o.kind==='bridge'){const cx=(o.x+o.end)/2,w=o.end-o.x,sc=Math.max(.72,Math.min(1.3,w/210));if(!Art.draw(ctx,'levels','l3Bridge',open?'open':'closed',cx,y+24,t,sc)){if(open)rect(o.x,y,w,14,'#b6c995');else{line(o.x,y-35,o.x,y,'#f6cb75',5);text('⚠',o.x,y-55,24);}}}else{if(!Art.draw(ctx,'levels','l3Gate',open?'open':'closed',o.x,y+8,t)){rect(o.x-12,open?y-150:y-90,24,open?40:90,open?'#84a991':'#cf8591',4);}text(open?'✓':'A + B',o.x,y-118,18);}});
 for(const x of [2500,4100]){const y=D.mountain(x),state=x===2500?'mid':'final';if(!Art.draw(ctx,'levels','l3Checkpoint',state,x,y+8,t)){line(x,y,x,y-90,'#eddfa8',5);text('⚑',x+17,y-62,36);}text(x===2500?'中途檢查點':'六人集合 · 最後大坡',x+80,y-110,16);}
 /* Mid-Autumn route dressing: decorative props only, no collision changes. */
 const deco=[[1840,'crate'],[2670,'stone'],[3470,'fence']];for(const [x,state] of deco){const y=D.mountain(x);Art.draw(ctx,'levels','l3Obstacle',state,x,y+5,t,.72);}
 const c={...s.cargo,...D.cargoPose(s.cargo,t,s.obstacles)};
 if(!s.delivered){if(!Art.draw(ctx,'cargo','pink','idle',c.x,c.y+c.r,t))cargo(c);}else{Art.draw(ctx,'levels','l3Checkpoint','final',5390,D.mountain(5390)+4,t,1.05);text('NPC：辛苦了！',5390,D.mountain(5390)-100,24);} }
 if(s.id===4){
 /* L4 Mid-Autumn bridge skin. Visual-only: gameplay geometry/FSM stays authoritative in levels.js. */
 const deck=(x,w,color='#606b88')=>{rect(x,418,w,18,color,5);rect(x,435,w,45,'#4c5876',3);line(x,419,x+w,419,'#e4bd78',4);};
 deck(50,950,'#596b80');deck(1000,670,'#6a6681');if(!s.bridgeOpen)deck(1670,660,'#765c73');deck(2330,650,'#6a6681');deck(2980,880,'#596b80');
 for(let x=190;x<3900;x+=180){line(x,391,x,448,'#4f4350',8);ellipse(x,386,9,12,'#ffd77c');ellipse(x,386,17,21,'#ffd77c22');}
 sign('月兔橋 · 前往另一側 →',970,260);sign('觀察預兆 · 跳過／從下方穿越',1460,225);sign('安全區 · 可以回頭救援',2800,255);
 const b={...s.boss,...D.bossPose(s.boss,t)};
 const bossScale=b.mode==='fall'?1.05:1;
 if(!Art.draw(ctx,'boss','bridge',b.mode,b.x,b.y,t,bossScale,b.dir<0)){
  const squat=['crouch','stompWarning'].includes(b.mode);ellipse(b.x,b.y-(squat?28:40),52,squat?28:42,'#f4e6e7');text('ಠ ᴗ ಠ',b.x,b.y-30,26,'#733944');
 }
 const warn={crouch:'蹲低……要跳了！',leap:'從下方穿過！',slamWarning:'⚠ 重槌預備！',slam:'砰！',stompWarning:'⚠ 踩踏！',stomp:'砰！',chargeWarning:'⚠ 衝刺！',charge:'衝刺！',recovery:'現在，跳過去！',fall:'月兔掉下去了！'}[b.mode]||'';
 text(warn,b.x,b.y-128,18,b.mode.includes('Warning')?'#ffcf7a':'#fff0d6');
 if(['crouch','leap','slam','slamWarning'].includes(b.mode)){ellipse(b.x,417,145,9,'#f49aa455');rect(b.x-135,414,270,5,'#ff8ca0');}
 if(['stompWarning','stomp'].includes(b.mode)){ellipse(b.x,417,105,11,'#ffd27b55');rect(b.x-95,414,190,5,'#ffcf6b');}
 if(b.mode==='chargeWarning'){const x0=Math.min(b.x,b.x+b.dir*230);rect(x0,414,230,5,'#ffcf6b');text(b.dir>0?'➜':'⬅',b.x+b.dir*82,b.y-58,34,'#ffd77c');}
 if(b.mode==='charge'){for(let i=1;i<=3;i++)ellipse(b.x-b.dir*i*30,b.y-38,18-i*3,8-i,'#fff1d633');}
 if(b.mode==='recovery'){text('💨',b.x-58,b.y-25,22);}
 /* Per-player bridge buttons: existing completion logic, new moon-festival visual. */
 s.participants.forEach((token,i)=>{const p=room.players.find(p=>p.token===token),x=D.boss.buttons[i],done=s.completed.includes(token);ellipse(x,421,24,10,done?'#ffe58a':'#7183a2');ellipse(x,414,19,9,done?'#fff0ae':'#c9d0df');text(done?'★':'E',x,419,13,done?'#b37d2d':'#4f5c75');text(p?.char||'',x,382-i%2*18,10,'#fff3db');});
 sign('各自按鈕 · E',3580,235);text(`${s.completed.length} / 6`,3580,315,28,'#fff0c5');
 if(s.bridgeOpen){text('✦ 月光機關啟動！ ✦',2000,325,22,'#ffe69b');}
 }
 if(s.id===5){
 /* L5 Mid-Autumn obstacle-course skin. Visual-only: collision, enemy FSM, checkpoints and 3-second final hold remain authoritative. */
 const badge=(label,x,y)=>{ctx.save();ctx.globalAlpha=.96;rect(x-74,y-18,148,36,'#fff6dd',8);text(label,x,y+6,14,'#576a67');ctx.restore();};
 const floatingMark=(x,y,str)=>{text(str,x,y+Math.sin(t*3+x*.01)*3,15,'#ffe39c');};
 sign('最後一段路 · 月光障礙賽',420,230);
 badge('起跑平台',230,330); badge('移動浮台區',1460,250); badge('陷阱平台區',3230,232); badge('終點祭壇',5530,242);
 // checkpoint shrines
 D.checkpoints.forEach((x,i)=>{const y=D.raceFloor(x);if(!Art.draw(ctx,'levels','l5Checkpoint','idle',x,y+7,t,.78)){line(x,y,x,y-95,'#e8d3a2',5);text('⚑',x+14,y-70,40,'#f7d28c');}text(`CHECKPOINT ${i+1}`,x+58,y-104,12,'#fff0d0');if(i<3)floatingMark(x+85,y-128,'✦');});
 // runway and special platforms
 for(const b of World.platforms(s,t)){
  const state=b.id.startsWith('fall')?'falling':'idle',sc=Math.max(.62,Math.min(1.35,b.w/110));
  if(!Art.draw(ctx,'platforms',b.id,state,b.x+b.w/2,b.y+21,t,sc))rect(b.x,b.y,b.w,14,b.id.startsWith('fall')?'#d6a4a8':'#b6b9d2',4);
  if(b.id.startsWith('moving')){text('↔',b.x+b.w/2,b.y-16,18,'#fff0ad');ellipse(b.x+b.w/2,b.y+18,32,6,'#fff2c144');}
  if(b.id==='narrow'){text('小心跳躍',b.x+b.w/2,b.y-18,10,'#fff1c8');}
  if(b.id.startsWith('fall')){text('✦',b.x+b.w/2,b.y-12,13,'#ffd98a');text('踩久會落下',b.x+b.w/2,b.y-28,10,'#fff0cc');}
 }
 // enemies with themed hints
 for(const raw of s.enemies){
  const m={...raw,...D.enemyPose(raw,t)};
  if(!Art.draw(ctx,'enemies',m.type,m.mode,m.x,m.y,t,1,m.dir<0)){
   ellipse(m.x,m.y-18,20,18,{patrol:'#b3c4aa',hopper:'#c9afdc',charger:'#e1a68b'}[m.type]);
   text(m.type==='hopper'?'↟':m.dir>0?'›':'‹',m.x,m.y-7,24,'#554957');
  }
  if(m.mode==='warning'){ellipse(m.x,m.y-48,18,18,'#f06f7a');text('！',m.x,m.y-42,22,'#fff6d6');}
  if(m.mode==='crouch')text('↟',m.x,m.y-50,18,'#ffe19b');
 }
 // decorative guides and lantern spirits to tie the route together
 for(const [x,y] of [[1160,300],[3060,292],[4550,255]]) Art.draw(ctx,'levels','l5LanternSpirit','idle',x,y,t,.72);
 for(const [x,y,msg] of [[760,278,'跨過斷崖'],[2050,195,'跟著浮台節奏'],[3920,200,'避開月餅衝刺'],[4970,182,'最後集合！']]){floatingMark(x,y,'✦');text(msg,x,y+24,13,'#fff1cd');}
 // final altar / hold feedback
 Art.draw(ctx,'levels','l5Final','idle',5530,401,t,.9);
 text('全員集合 · 按住 E 3 秒',5530,284,18,'#fff1c9');
 if(s.arrivals.length===6){text(`${Math.min(3,s.hold).toFixed(1)} / 3 秒`,5530,315,18,'#ffe69c');if(s.hold>0){ellipse(5530,360,48+Math.min(3,s.hold)*12,16,'#fff0a433');text('月光聚集中…',5530,338,13,'#fff5d2');}}
 else text(`${s.arrivals.length} / 6 抵達`,5530,315,18,'#ffe69c');
 }
 }
};
