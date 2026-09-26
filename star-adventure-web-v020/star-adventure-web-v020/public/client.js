'use strict';
const $=id=>document.getElementById(id),W=World,SYMBOLS=['🌸','⭐','🍄','🌙'];
const store={get:k=>{try{return localStorage.getItem(k)}catch{return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch{}},del:k=>{try{localStorage.removeItem(k)}catch{}}};
const palette=['#fff5de','#c6e2f0','#f5df92','#e5c5ea','#d6af96','#bce2d5','#cad5ef','#eed5b9'];
let socket=io({reconnection:true,reconnectionAttempts:Infinity,reconnectionDelay:500}),room=null,myId=null,secret=store.get('star.playerToken'),lastCode=store.get('star.roomCode'),own=null,clue=null,keys={},remote=new Map(),emotes=new Map(),seq=0,lastSend=0,lastFrame=performance.now(),camera=0,net=0,netHz=0,fps=0,frames=0,perfAt=performance.now(),ping=0,stageEpoch=null,smooth={x:0,y:0},clientTime=0,lastStageUpdate=0,viewW=1100,viewH=550,muted=store.get('star.muted')==='true',reduced=store.get('star.reduced')==='true',audioCtx=null,toastTimer,devOpen=false,lastPhase='',lastSendKey='';
const canvas=$('canvas'),ctx=canvas.getContext('2d');
let assets=Art.data;
Art.load().then(a=>assets=a);
const artwork=entry=>Art.image(entry);
const facingByPlayer=new Map();
function sprite(p,x,y,scale){let state=p.flat?'flattened':p.down?'down':emotes.get(p.token)?.until>performance.now()?'emote':room?.stage.id==='party'?'happy':!p.grounded?(p.vy<0?'jump':'fall'):Math.abs(p.vx||0)>20?'run':'idle';if((p.vx||0)>8)facingByPlayer.set(p.token,1);else if((p.vx||0)<-8)facingByPlayer.set(p.token,-1);const facing=facingByPlayer.get(p.token)||1;if(state==='run'&&facing<0)state='runLeft';if(!Art.draw(ctx,'characters',p.char,state,x,y,clientTime,scale,false))return false;text(p.char,x,y+20,12);return true;}
let cameraY=0;
const whitePhase=()=>room?.stage.id==='ending'&&['white','whiteText'].includes(room.stage.phase);
function whiteUI(){show('whiteScreen',whitePhase());if(whitePhase()){for(const id of ['levelIntro','modal'])if($(id).open)$(id).close();$('whiteCopy').textContent=room.stage.phase==='whiteText'?(clue?.text||''):'';show('toast',false);if(audioCtx?.state==='running')audioCtx.suspend();}}

const show=(id,v)=>$(id).hidden=!v;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function tone(f=600,d=.12){if(muted||whitePhase())return;try{audioCtx??=new (window.AudioContext||window.webkitAudioContext)();audioCtx.resume();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.frequency.value=f;o.type='sine';g.gain.setValueAtTime(.06,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+d);o.connect(g);g.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+d);}catch{}}
function toast(text){if(!text||whitePhase())return;$('toast').textContent=text;show('toast',true);clearTimeout(toastTimer);toastTimer=setTimeout(()=>show('toast',false),3800);tone(570,.07);}
function call(event,data={},done){socket.timeout(5000).emit(event,data,(err,r)=>{if(err){toast('伺服器未回應，正在等待連線。');return;}if(!r?.ok&&r?.error){toast(r.error);$('lobbyMsg').textContent=r.error;}done?.(r);});}
function identity(r){if(!r?.ok)return;myId=r.id;secret=r.playerToken;lastCode=r.code;store.set('star.playerToken',secret);store.set('star.roomCode',lastCode);store.set('star.name',$('name').value||'Ollie');show('menu',false);}
function join(code){call('join',{code,playerToken:secret,name:$('name').value||'玩家'},r=>{identity(r);if(!r?.ok){$('connection').textContent=r?.error||'無法回房';show('rejoin',true);}});}
socket.on('connect',()=>{$('connection').textContent='● 已連線 · 冒險伺服器';$('connection').classList.remove('off');$('create').disabled=$('joinBtn').disabled=false;if(lastCode&&secret)join(lastCode);});
socket.on('disconnect',()=>{$('connection').textContent='● 連線中斷，正在自動回到原房間…';$('connection').classList.add('off');keys={};$('create').disabled=$('joinBtn').disabled=true;});
socket.on('connect_error',()=>{$('connection').textContent='● 正在等待伺服器啟動／重新連線…';$('connection').classList.add('off');});
socket.on('superseded',()=>{socket.disconnect();keys={};$('connection').textContent='這個角色已在另一個分頁登入。請關閉此分頁。';});
$('name').value=store.get('star.name')||'';$('code').value=lastCode||'';show('rejoin',!!lastCode);
$('create').onclick=()=>{tone();call('create',{name:$('name').value||'Ollie'},identity);};$('joinBtn').onclick=()=>show('joinBox',$('joinBox').hidden);$('join').onclick=()=>join($('code').value.trim().toUpperCase());$('rejoin').onclick=()=>join(lastCode);
$('leave').onclick=()=>call('leave',{},()=>{room=null;myId=null;lastCode=null;store.del('star.roomCode');show('lobby',false);show('play',false);show('menu',true);show('rejoin',false);});
$('copyCode').onclick=async()=>{try{await navigator.clipboard.writeText(room.code);$('copyCode').textContent='已複製';}catch{$('copyCode').textContent=room.code;}};
function modal(content){$('modalBody').innerHTML=content;$('modal').showModal();}
$('closeModal').onclick=()=>$('modal').close();
$('helpBtn').onclick=()=>modal('<h2>冒險者使用說明</h2><p>房主建立房間，把四碼房號給朋友。手機與電腦可以一起玩，最多六人，請使用外部語音溝通。</p><p>A / D 或 ← →：移動<br>Space：跳躍<br>E：互動；第三至五關按住 0.5 秒救起身旁夥伴<br>Q：表情<br>手機使用下方按鈕，可同時按住方向與跳躍。</p><p>第四關壓扁需隊友救；第五關壓扁超過三秒回個人檢查點，沒有命數限制。每個人都要一起到集合點。關卡中的提示需要分工讀取。</p><p>人數不足時可用房主 DEV 假人補到六位，適合測試整款遊戲。</p>');
$('creditBtn').onclick=()=>modal(`<h2>製作人</h2><p>製作人：Ollie<br>程式：Ollie ＆ AI<br>美術協力：AI<br>測試人員：製作人本人與一群假人<br>特別感謝：願意被騙進來玩的人<br>製作目的：${store.get('star.cleared')==='true'?'因為生日過了才想到要做生日禮物。':'？？？'}</p><p class="fine">Build 0.4.1 QA Fix 1</p>`);
function settings(){modal(`<h2>設定</h2><p><label><input id="muteSetting" type="checkbox" ${muted?'checked':''}> 關閉音效／簡易音樂</label></p><p><label><input id="motionSetting" type="checkbox" ${reduced?'checked':''}> 減少閃光與煙火動畫</label></p><p class="fine">音效由瀏覽器合成，需先點擊畫面。設定儲存在本機。</p>`);$('muteSetting').onchange=e=>{muted=e.target.checked;store.set('star.muted',muted);};$('motionSetting').onchange=e=>{reduced=e.target.checked;store.set('star.reduced',reduced);};}
$('settingsBtn').onclick=$('gameSettings').onclick=settings;
function unlock(){store.set('star.cleared','true');$('title').textContent='星星大冒險：遲到的生日禮物';}if(store.get('star.cleared')==='true')unlock();
W.CHARS.forEach((ch,i)=>{const b=document.createElement('button');b.textContent=ch;b.style.background=palette[i];b.onclick=()=>call('char',ch);$('chars').appendChild(b);});
$('bots').onclick=()=>call('dev',{action:'bots'});$('start').onclick=()=>{tone();call('start');};$('next').onclick=()=>call('interact');
const devs=[['補滿假人','bots'],['全員到我身邊','teleport'],['全員復活','revive'],...Array.from({length:5},(_,i)=>[`跳 Level ${i+1}`,'jump',i+1]),['給四枚碎片','fragments'],['確保小桃','momo'],['直接測結局','ending'],['假人站 L1 壓板','plates'],['全員到集合點','regroup'],['前往個人檢查點','checkpoint'],['重置本關','resetLevel'],['洞穴檢查答案／分工','relayInspect'],['DEV 開始本棒','legStart'],['DEV 完成本棒','legComplete'],['完成目前洞穴','caveComplete'],['洞穴 BOING 重來','caveFail'],...Array.from({length:5},(_,i)=>[`洞穴 ${i+1}`,'cave',i+1]),['貨物回起點','cargoReset'],['貨物回中途檢查點','cargoCheckpoint'],['直達最後大坡','finalSlope'],['前往下坡段','downhill'],...Array.from({length:7},(_,i)=>[`模擬 ${i} 推手`,'pushers',i]),['恢復真人推貨','pushers',null],['壓扁自己','flatten'],['死亡測試','death'],...['chargeWarning','charge','recovery','crouch','leap','slam','stompWarning','stomp'].map(x=>[`BOSS ${x}`,'bossAttack',x]),['BOSS 6/6 測試','bossAll'],...Array.from({length:4},(_,i)=>[`L5 檢查點 ${i+1}`,'raceCheckpoint',i]),['全員到最後平台','finalHold'],['預覽小桃台詞','whitePreview','momo'],['預覽夥伴台詞','whitePreview','other']];
for(const [label,action,value] of devs){const b=document.createElement('button');b.textContent=label;b.dataset.action=action;if(value!==undefined)b.dataset.value=value;b.onclick=()=>call('dev',{action,value},r=>{if(r?.inspect)$('devInspect').textContent=JSON.stringify(r.inspect,null,2);});$('devButtons').appendChild(b);}
$('resetLevel').onclick=()=>call('resetLevel');
$('resetGame').onclick=()=>call('resetGame',{},r=>{if(!r?.ok)return;modal('<h2>RESET GAME？</h2><p>保留房間與玩家，清空所有關卡、碎片與結局進度，返回選角大廳。</p><button id="confirmReset" class="primary">確認重新開始整場遊戲</button>');$('confirmReset').onclick=()=>{call('resetGame',{confirmation:r.confirmation});$('modal').close();};});
$('devToggle').onclick=()=>{devOpen=!devOpen;show('devPanel',devOpen);};$('assist').onchange=e=>call('dev',{action:'assist',value:e.target.checked});$('follow').onchange=e=>call('dev',{action:'follow',value:e.target.checked});
function roster(){if(!room)return;const host=room.hostToken===myId;show('hostControls',host);$('roomCode').textContent=room.code;$('count').textContent=`${room.players.length} / 6 位冒險者 · ${room.players.filter(p=>p.connected).length} 位在線`;
 $('players').innerHTML=room.players.map(p=>`<div class="player ${p.connected?'':'off'}"><div class="face">${p.bot?'🤖':'◕ᴗ◕'}</div><b>${esc(p.name)}</b><small>${esc(p.char||'尚未選角')}${p.token===myId?' · 你':''}</small><small>${p.token===room.hostToken?'房主':p.bot?'DEV 假人':p.connected?'已連線':'等待重連'}</small></div>`).join('');
 [...$('chars').children].forEach(b=>{const p=room.players.find(p=>p.char===b.textContent);b.disabled=!!p&&p.token!==myId;b.classList.toggle('mine',p?.token===myId);});show('start',host);for(const id of ['bots','devToggle'])show(id,host&&room.devEnabled!==false);show('devPanel',host&&room.devEnabled!==false&&devOpen);$('assist').checked=room.dev.assist;$('follow').checked=room.dev.follow;
 $('devPlayers').replaceChildren();for(const p of room.players){for(const complete of [true,false]){const b=document.createElement('button');b.textContent=`${p.char||p.name} ${complete?'標記完成':'取消完成'}`;b.onclick=()=>call('dev',{action:'bossMark',value:{token:p.token,complete}});$('devPlayers').appendChild(b);}}
 $('devState').textContent=`假人 ${room.players.filter(p=>p.bot).length} 位 · 自動協助 ${room.dev.assist?'開':'關'} · 房號 ${room.code}`;
}
function stageChanged(s){if(stageEpoch===s.epoch)return;stageEpoch=s.epoch;camera=0;cameraY=0;smooth={x:0,y:0};keys={};clue=null;lastSendKey='';remote.clear();own=null;lastPhase='';if(s.id!=='ending')tone(760,.2);}
socket.on('room',r=>{const changed=stageEpoch!==r.stage.epoch;room=r;clientTime=r.time;stageChanged(r.stage);const p=r.players.find(p=>p.token===myId);if(p&&(!own||changed))own={...p,input:{}};r.players.forEach(p=>{if(p.token!==myId)remote.set(p.token,{x:p.x,y:p.y,rx:p.x,ry:p.y});});show('menu',false);show('lobby',!r.started);show('play',r.started);roster();whiteUI();updateUI();resize();if(!r.started){introSeen.clear();if($('levelIntro').open)$('levelIntro').close();}else if(changed)intro(r.stage);});
socket.on('stage',packet=>{if(!room)return;stageChanged(packet.stage);room.stage=packet.stage;room.fragments=packet.fragments;clientTime=packet.time;lastStageUpdate=performance.now();updateUI();});
socket.on('frame',packet=>{net++;if(!room||packet.epoch!==room.stage.epoch)return;clientTime=packet.time;for(const p of packet.p){const target=room.players.find(q=>q.token===p.t);if(!target)continue;Object.assign(target,{x:p.x,y:p.y,vx:p.vx,vy:p.vy,down:p.d,carry:p.c,warp:p.w,grounded:p.g,rescue:p.rescue,flat:p.f,flatAt:p.fa,checkpoint:p.cp,invulnerableUntil:p.iv});
 if(p.t===myId){const old=own?{x:own.x,y:own.y}:p,isWarp=!own||own.warp!==p.w||own.down!==p.d;own={...target,jumpHeld:!!keys.jump};if(isWarp){smooth={x:0,y:0};}else{smooth.x=W.clamp(smooth.x+old.x-own.x,-65,65);smooth.y=W.clamp(smooth.y+old.y-own.y,-65,65);}}
 else {let a=remote.get(p.t);if(!a||Math.abs(a.x-p.x)>450)a={rx:p.x,ry:p.y};remote.set(p.t,{...a,x:p.x,y:p.y});}}
 });
socket.on('clue',c=>{clue=c;whiteUI();updatePuzzle();});socket.on('toast',toast);socket.on('emote',e=>{emotes.set(e.token,{emoji:e.emoji,until:performance.now()+1600});tone(900,.06);});
function updateUI(){if(!room?.started)return;const s=room.stage;const host=room.hostToken===myId;$('stageTag').textContent=typeof s.id==='number'?`LEVEL 0${s.id} / 05 · FULL ALPHA`:'STAR ADVENTURE · FULL ALPHA';$('stageTitle').textContent=W.TITLES[s.id];$('inventory').textContent=`${[1,2,3,4].map(n=>room.fragments.includes(n)?'★':'☆').join(' ')} · 房號 ${room.code}`;
 if(devOpen)$('devRuntime').textContent=JSON.stringify({level:s.id,cave:s.cave,mode:s.mode,hold:s.hold,completed:s.completed,players:room.players.map(p=>({char:p.char,life:p.down?'dead':p.flat?'flattened':'alive',flattenSeconds:p.flat?+(clientTime-p.flatAt).toFixed(2):0,checkpoint:p.checkpoint,rescue:p.rescue}))},null,2);
 let obj='',help='';if(s.id===1){obj=!s.leverOn?`三塊獨立壓力板 ${s.plates.filter(Boolean).length} / 3 · 過門後拉遠端機關`:'遠端機關已鎖定 · 全員前往右側星星站';help='<h3>月下啟程 · 今天也要去工作！</h3><p>NPC：今晚的工作是把星星送到月光門的另一邊！</p><p>先練習跳躍與移動平台。三人各站一塊月紋壓板，讓另外三人穿過花燈門；過門的人到遠端月光機關按 E，留下的人才可以離開壓板。前面的斷層橋承重……好像不太可靠。</p><p>終點要等所有在線冒險者。離線的位置仍會保留，重連即可回來。</p>';}
 if([2,3,4,5].includes(s.id)){const h=LevelView.hud(s,room.players,clientTime);obj=h.objective;help=h.help;if(s.id===2&&s.cave>=4)obj+='\n'+s.rule;}
 if(s.id==='party'){obj='生日月夜庭園 · 自由活動時間！跑、跳、碰撞、表情、拍照區、蛋糕舞台與煙火持續開放';help='<h3>🎂 小桃生日月夜庭園</h3><p>生日結局之後，大家來到自由活動區。<br>可以一起跑跑跳跳、擠在一起拍照、看煙火、逛月餅與禮物佈景。</p><p>場景包含：蛋糕舞台、拍照鞦韆、帳篷閱讀角、禮物區與月餅點心區。</p><p>🏆《為了一句生日快樂，叫五個人陪妳闖了五關》</p><button id="partyCredits">解鎖製作人頁面</button>';unlock();}
 $('objective').textContent=obj;show('objective',s.id!=='ending');$('instructions').innerHTML=s.id==='party'?help:'';if($('partyCredits'))$('partyCredits').onclick=$('creditBtn').onclick;
 show('stageClear',!!s.cleared);if(s.cleared){$('clearText').textContent=`⭐ 星星碎片${['','①','②','③','④'][s.id]} GET！`;show('next',host);}
 show('chestPanel',s.id===5&&s.arrivals.length===6);if(s.id===5){$('holdProgress').value=s.hold;$('holdStatus').textContent=`${s.hold.toFixed(1)} / 3 秒 · ${s.arrivals.length} / 6 位抵達`;}
 show('ending',s.id==='ending');show('controlbar',s.id!=='ending');show('instructions',s.id==='party');if(s.id==='ending')updateEnding();updatePuzzle();whiteUI();
}
function updateEnding(){const s=room.stage,copy={white:'',whiteText:'',ellipsis:'……',error:'⚠️ DELIVERY ERROR\n有一份物品嚴重延遲。',search:'正在搜尋遺失的物品……',recipient:'收件人：小桃',send:'收件人：小桃\n'+(s.target===myId?'請稍候，夥伴正在送來星星。':'這一次，換我們送給妳。'),merge:'五份心意，傳送中……',celebrate:''};
 $('endingCopy').textContent=copy[s.phase]||'';const slot=s.stars.find(st=>st.token===myId);show('sendStar',s.phase==='send'&&s.target!==myId&&!!slot&&slot.sentAt===null);$('starCount').textContent=['send','merge'].includes(s.phase)?s.stars.map(st=>st.arrivedAt!==null?'⭐':st.sentAt!==null?'✧':'☆').join('　')+'　'+s.sent.length+' / 5':'';
 if(s.phase!==lastPhase){lastPhase=s.phase;tone(s.phase==='celebrate'?1046:440,.3);}if(s.phase==='celebrate')unlock();
}
$('sendStar').onclick=()=>call('sendStar');
function updatePuzzle(){const s=room?.stage,visible=s?.id===2&&s.mode==='display'&&clue?.sequence&&clue.epoch===s.epoch&&clue.round===s.round&&clue.leg===s.leg&&clientTime<clue.until;show('puzzlePanel',!!visible);if(!visible){$('privateClue').textContent='';$('environmentClue').textContent='';return;}
 $('puzzleTitle').textContent=`讀者 ${clue.readerIndex===0?'A':'B'}`;$('privateClue').textContent=clue.sequence.map(i=>SYMBOLS[i]).join(' ');$('environmentClue').textContent=String(Math.ceil(clue.until-clientTime));
 const stone=W.D.caves[s.cave-1].readers[clue.readerIndex],box=$('viewport').getBoundingClientRect(),panel=$('puzzlePanel'),px=(stone-camera)/viewW*box.width,py=(245-cameraY)/viewH*box.height;panel.style.left=Math.max(8,Math.min(box.width-panel.offsetWidth-8,px-panel.offsetWidth/2))+'px';panel.style.top=Math.max($('objective').getBoundingClientRect().bottom-box.top+6,Math.min(box.height-panel.offsetHeight-75,py-panel.offsetHeight))+'px';
}
let pressSeq=Number(store.get('star.pressSeq')||0),introSeen=new Set();
const intros={1:'跑、跳，看看前面的木板。遇到夥伴時一起合作吧！',2:'讀者靠近自己的石碑按 E。記住答案，用語音告訴當棒執行者；執行者靠近符號按 E。',3:'三位一起推月亮，另外三位先去開路。上坡放手，月亮會往後滾！',4:'兇狠月兔擋在橋上。看懂牠的攻擊預兆，越過橋面後每人按下自己的終點按鈕。',5:'再走一段熟悉的路。留意平台、小怪與檢查點，大家在終點會合。'};
$('introClose').onclick=()=>{$('levelIntro').close();release();};
function intro(s){if(!intros[s.id]){if($('levelIntro').open)$('levelIntro').close();return;}const key=room.code+':'+s.id;if(introSeen.has(key))return;introSeen.add(key);release();$('introNumber').textContent=`LEVEL ${s.id} / 5`;$('introTitle').textContent=W.TITLES[s.id];$('introCopy').textContent=intros[s.id];if(!$('levelIntro').open)$('levelIntro').showModal();}
$('viewport').prepend(document.querySelector('.game-head'));$('viewport').append($('puzzlePanel'),$('chestPanel'));
function contextual(){if(!room?.started||!own)return;const s=room.stage;let hint=null;if(s.id===1&&s.gateOpen&&!s.leverOn&&Math.abs(own.x-1200)<75)hint='E｜拉動遠端機關';
 if(s.id===2){const c=W.D.caves[s.cave-1],ri=s.readers.indexOf(myId);if(ri>=0&&s.mode==='waiting'&&Math.abs(own.x-c.readers[ri])<48&&Math.abs(own.y-420)<65)hint='E｜讀取石碑';if(['discussion','input'].includes(s.mode)&&s.executors[s.leg]===myId){const i=c.pads.findIndex(x=>Math.abs(own.x-x)<31);if(i>=0&&Math.abs(own.y-420)<60)hint='E｜輸入 '+SYMBOLS[i];}}
 if(s.id===3){const k=W.D.cargo.switches.find(k=>!s.switches[k.id]&&Math.abs(own.x-k.x)<46&&Math.abs(own.y-k.y)<65);if(k)hint='E｜'+k.label;}
 if(s.id===4){const i=s.participants.indexOf(myId);if(!s.completed.includes(myId)&&Math.abs(own.x-W.D.boss.buttons[i])<25)hint='E｜完成突破';}
 if(room.players.some(p=>p.token!==myId&&p.flat&&Math.abs(p.x-own.x)<75&&Math.abs(p.y-own.y)<65))hint='按住 E 0.5 秒｜救援';
 if(own.down||own.flat)hint=own.down?'回到檢查點…':s.id===3?'被壓扁了！可慢走，等待救援或站起':s.id===4?'被壓扁了！可慢走，請隊友按住互動救援':'被壓扁了！三秒內請隊友救援';show('contextHint',!!hint);$('contextHint').textContent=hint||'';}
function sendInput(){if(!socket.connected||!room?.started)return;socket.emit('input',{seq:++seq,...keys});}
function actionDown(k){if(keys[k]||$('levelIntro').open||$('modal').open)return;keys[k]=true;tone(k==='jump'?740:420,.04);sendInput();if(k==='interact'){pressSeq++;store.set('star.pressSeq',pressSeq);call('interact',{press:pressSeq,epoch:room.stage.epoch});}}function actionUp(k){keys[k]=false;sendInput();}
const keyboard={a:'left',arrowleft:'left',d:'right',arrowright:'right',' ':'jump',e:'interact'};
addEventListener('keydown',e=>{if(['INPUT','TEXTAREA'].includes(e.target.tagName)||$('modal').open||$('levelIntro').open)return;const k=e.key.toLowerCase();if(keyboard[k]){e.preventDefault();actionDown(keyboard[k]);}if(k==='q'&&!e.repeat)socket.emit('emote','✨');});addEventListener('keyup',e=>{if(keyboard[e.key.toLowerCase()])actionUp(keyboard[e.key.toLowerCase()]);});
for(const b of document.querySelectorAll('[data-k]')){b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);actionDown(b.dataset.k);};b.onpointerup=b.onpointercancel=b.onlostpointercapture=()=>actionUp(b.dataset.k);}
function release(){keys={};sendInput();}addEventListener('blur',release);document.addEventListener('visibilitychange',()=>{release();if(document.visibilityState==='visible'&&!socket.connected)socket.connect();});$('emote').onclick=()=>socket.emit('emote',room?.stage.id==='party'?'🎉':'✨');
function resize(){const box=$('viewport').getBoundingClientRect();if(!box.width)return;const ratio=box.width/box.height;viewH=550;viewW=550*ratio;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(box.width*dpr);canvas.height=Math.round(box.height*dpr);ctx.setTransform(canvas.width/viewW,0,0,canvas.height/viewH,0,0);}
new ResizeObserver(resize).observe($('viewport'));
function rect(x,y,w,h,color,r=0){ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();}
function text(str,x,y,size=18,color='#364d49',align='center'){if(Art.draw(ctx,'ui',str,'idle',x,y,clientTime,size/32))return;ctx.fillStyle=color;ctx.font=`700 ${size}px system-ui,"Noto Sans TC","Noto Emoji"`;ctx.textAlign=align;ctx.fillText(str,x,y);}
function ellipse(x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();}
function line(x,y,x2,y2,color,width=3){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.stroke();}
function sign(str,x,y=290){ctx.font='700 14px system-ui,"Noto Sans TC"';const w=Math.max(110,ctx.measureText(str).width+24);rect(x-w/2,y,w,39,'#fff6d9',7);line(x,y+39,x,y+70,'#a68d6b',5);text(str,x,y+25,14);}
function plateDraw(x,on){rect(x-30,414,60,10,on?'#eed46c':'#9ea797',5);if(on)ellipse(x,413,35,5,'#ffe6a1');}
function gate(x,open){rect(x-15,open?170:270,30,open?90:150,open?'#acd0a1':'#a98972',6);if(!open){line(x-12,300,x+12,330,'#f3dcb0',5);line(x-12,350,x+12,380,'#f3dcb0',5);}}
function avatar(p,x,y,scale=1){if(sprite(p,x,y,scale))return;const ci=W.CHARS.indexOf(p.char),color=palette[ci]||'#fff';ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);if(p.down||p.flat)ctx.scale(1,.27);const running=Math.abs(p.vx||0)>20,bob=running&&p.grounded?Math.sin(clientTime*15)*2:0;ctx.translate(0,bob);
 ellipse(0,0,25,5,'#314c4525');ellipse(-12,-55,ci===2?8:10,ci===2?22:13,color);ellipse(12,-55,ci===2?8:10,ci===2?22:13,color);ellipse(0,-30,25,28,color);line(-23,-29,-29,-19,'#69786e',2);line(23,-29,29,-19,'#69786e',2);ellipse(-9,-5,8,4,color);ellipse(9,-5,8,4,color);ellipse(-8,-35,2.7,3.7,'#40564d');ellipse(8,-35,2.7,3.7,'#40564d');text(p.down||p.flat?'×':'ᴗ',0,-24,16);ellipse(-15,-27,5,3,'#efa8b580');ellipse(15,-27,5,3,'#efa8b580');if(p.carry)text('●',0,-70,25,'#7898ac');if(p.token===myId){text('▼',0,-79,13,'#497868');}ctx.restore();
 text(p.char||p.name,x,y+20,12,p.connected===false?'#969b91':'#3b574c');const em=emotes.get(p.token);if(em?.until>performance.now())text(em.emoji,x,y-95,28);if((p.down||p.flat)&&p.rescue)rect(x-25,y-25,50*p.rescue/(p.flat?.5:2),5,'#fff6a8',2);
}
function cargo(c,star=false){ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.angle||0);ellipse(0,0,c.r,c.r,star?'#f3d273':'#eab4c6');ctx.strokeStyle=star?'#bb9f52':'#b4849f';ctx.lineWidth=3;ctx.stroke();text(star?'★':'◕ ᴗ ◕',0,10,star?42:22);line(-c.r*.65,-c.r*.45,c.r*.7,c.r*.4,star?'#ffeeb8':'#fce0ea',4);ctx.restore();}
function background(s){const art=artwork(assets.backgrounds[s.id]);
 const cover=img=>{const iw=img.naturalWidth||viewW,ih=img.naturalHeight||viewH,scale=Math.max(viewW/iw,viewH/ih),sw=viewW/scale,sh=viewH/scale,sx=(iw-sw)/2,sy=(ih-sh)/2;ctx.drawImage(img,sx,sy,sw,sh,0,0,viewW,viewH);};
 if(art){
  const fills={1:'#dbe7cc',2:'#596866',3:'#8596a0',4:'#27365f',5:'#28386f',party:'#293a78'};
  ctx.fillStyle=fills[s.id]||'#d7e4d8';ctx.fillRect(0,0,viewW,viewH);cover(art);
  if(s.id===2){const g=ctx.createLinearGradient(0,300,0,550);g.addColorStop(0,'rgba(53,69,66,0)');g.addColorStop(1,'rgba(45,56,54,.42)');ctx.fillStyle=g;ctx.fillRect(0,280,viewW,270);}
  if(s.id===3){const g=ctx.createLinearGradient(0,310,0,550);g.addColorStop(0,'rgba(238,232,200,0)');g.addColorStop(1,'rgba(214,211,174,.30)');ctx.fillStyle=g;ctx.fillRect(0,290,viewW,260);}
  if(s.id===4){const g=ctx.createLinearGradient(0,280,0,550);g.addColorStop(0,'rgba(230,218,220,0)');g.addColorStop(1,'rgba(230,218,220,.25)');ctx.fillStyle=g;ctx.fillRect(0,260,viewW,290);}
  if(s.id===5||s.id==='party'){const g=ctx.createLinearGradient(0,300,0,550);g.addColorStop(0,'rgba(255,244,225,0)');g.addColorStop(1,'rgba(255,244,225,.18)');ctx.fillStyle=g;ctx.fillRect(0,280,viewW,270);}
  return;
 }
 let sky={1:['#cae6df','#f4ebcd'],2:['#778f86','#c1c2a3'],3:['#e7d9cd','#f4eccb'],4:['#cfd4e4','#efe0c9'],5:['#d99dab','#3a4672'],party:['#e5dcee','#fff1cf'],ending:['#171b30','#262b43']}[s.id]||['#cee2d6','#fff'];const g=ctx.createLinearGradient(0,0,0,550);g.addColorStop(0,sky[0]);g.addColorStop(1,sky[1]);ctx.fillStyle=g;ctx.fillRect(0,0,viewW,550);
 if(s.id===5){for(let i=0;i<50;i++){const x=(i*173.3-camera*.15)%viewW;ellipse((x+viewW)%viewW,70+(i*53)%270,1.5,1.5,'#fff4cf');}ellipse(viewW*.8,105,33,33,'#ffdfbe');}
 else if(s.id!==2&&s.id!=='ending'){for(let i=0;i<9;i++){const x=i*300-camera*.22;ellipse(x,350,210,120,'#aec3a466');ellipse(x+120,120+(i%3)*35,75,18,'#ffffff80');}}
}
function drawWorld(){if(!room)return;const s=room.stage,t=clientTime;if(s.id==='ending'&&s.phase==='celebrate'){camera=0;drawEndingScene(s);return;}background(s);
 if(s.id==='ending'){drawEndingScene(s);return;}
 ctx.save();ctx.translate(-camera,-cameraY);
 const width=W.WIDTH[s.id];
 // Ground follows the exact collision height, including mountain slopes.
 // LV1 uses dedicated modular cliff art instead of the old green debug-like fill.
 if(s.id!==1&&s.id!==4){let segment=[];const fillGround=()=>{if(!segment.length)return;ctx.beginPath();ctx.moveTo(segment[0][0],560+cameraY);for(const [x,y] of segment)ctx.lineTo(x,y);ctx.lineTo(segment.at(-1)[0],560+cameraY);ctx.closePath();const fill={2:'#596764',3:'#747665',5:'#7e88a5'}[s.id]||'#b7cc9d',stroke={2:'#aeb99c',3:'#ddd7a9',5:'#eadfae'}[s.id]||'#dce6b7';ctx.fillStyle=fill;ctx.fill();ctx.beginPath();segment.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.strokeStyle=stroke;ctx.lineWidth=9;ctx.stroke();segment=[];};for(let x=Math.max(0,Math.floor(camera/10)*10-20);x<=Math.min(width,camera+viewW+30);x+=10){const y=W.floor(s,x);if(y<700)segment.push([x,y+4]);else fillGround();}fillGround();}
 if(s.id===1){
  /* LV1 Mid-Autumn layered art. Physics stays in shared.js; art is visual-only. */
  const levelAsset=key=>artwork(assets.levels?.[key]?.animations?.idle);
  const drawGroundSegment=(x1,x2,y=420)=>{
   const left=levelAsset('l1GroundLeft'),mid=levelAsset('l1GroundMid'),right=levelAsset('l1GroundRight');if(!left||!mid||!right)return;
   const len=x2-x1,endW=Math.min(120,Math.max(76,len*.28)),bodyX=x1+endW,bodyEnd=x2-endW,top=y-9,h=118;
   ctx.drawImage(left,x1,top,endW,h);
   for(let x=bodyX;x<bodyEnd-1;){const w=Math.min(164,bodyEnd-x+2);ctx.drawImage(mid,x,top,w,h);x+=w-2;}
   ctx.drawImage(right,x2-endW,top,endW,h);
  };
  // Four continuous walkable land masses match the actual LV1 floor collision gaps exactly.
  for(const [a,b] of [[0,410],[565,1420],[1680,1960],[2170,2900]])drawGroundSegment(a,b,420);
  Art.draw(ctx,'levels','l1Start','idle',135,424,t,.92);sign('今晚也要把星星送到另一邊！',235,260);
  for(const [i,x] of [650,770,890].entries()){if(!Art.draw(ctx,'levels','l1Plate',s.plates[i]?'on':'off',x,430,t))plateDraw(x,s.plates[i]);text(String(i+1),x,378,12,'#fff4d5');}
  if(!Art.draw(ctx,'levels','l1Gate',s.gateOpen?'open':'closed',1040,426,t))gate(1040,s.gateOpen);
  if(!Art.draw(ctx,'levels','l1Lever',s.leverOn?'on':'off',1200,426,t)){text(s.leverOn?'✅':'🔧',1200,400,38);}
  sign(s.leverOn?'月光機關已鎖定':'靠近月光機關按 E',1200,255);
  if(s.gateOpen&&!s.leverOn)text('✦',1040,300+Math.sin(t*5)*4,28,'#ffe8a0');
  /* The fragile bridge is a separate gameplay object: intact for the first crossings, visibly broken after the fourth. */
  if(!Art.draw(ctx,'levels','l1Bridge',s.bridgeBroken?'broken':'intact',1555,500,t)){rect(1410,420,290,14,'#b99470',4);}
  sign(s.bridgeBroken?'斷層橋已斷！改走移動平台':'斷層橋 · 承重似乎不太妙…',1555,245);
  if(s.bridgeBroken){text('喀啦！',1555,380,22,'#ffe2a1');for(let i=0;i<4;i++)text('✦',1460+i*62,405+Math.sin(t*6+i)*8,14,'#ffd98c');}
  const drawFloatPlatform=b=>{
   const key=b.w<=75?'l1PlatformSmall':b.w<=135?'l1PlatformMedium':'l1PlatformLarge',img=levelAsset(key);
   if(!img){rect(b.x,b.y,b.w,16,'#b99470',4);return;}
   const extra=key==='l1PlatformSmall'?12:key==='l1PlatformMedium'?16:20,dw=b.w+extra,ratio=img.naturalHeight/img.naturalWidth,dh=dw*ratio;
   // The collision surface is b.y. The art is independent and sinks only a few pixels into the grass cap.
   ctx.drawImage(img,b.x-extra/2,b.y-8,dw,dh);
  };
  for(const b of W.platforms(s,t)){if(b.w===290)continue;drawFloatPlatform(b);if(b.id==='first-step')text('↟',b.x+b.w/2,b.y-18,15,'#fff0bd');}
  /* Checkpoint lanterns correspond to the real respawn checkpoints already used by the server. */
  Art.draw(ctx,'levels','l1Checkpoint','idle',1760,424,t,.78);text('CHECKPOINT',1760,326,12,'#fff0c8');
  Art.draw(ctx,'levels','l1Goal','idle',2730,425,t,.95);text('⭐',2730,343+Math.sin(t*4)*4,34,'#ffe79b');sign('六位冒險者集合',2730,245);
  for(const [x,sc] of [[350,.55],[2280,.62],[2550,.5]])Art.draw(ctx,'levels','l1Decor','lantern',x,424,t,sc);
 }
 if([2,3,4,5].includes(s.id))LevelView.draw(s,t,room,{ctx,rect,text,line,ellipse,sign,gate,cargo});
 if(s.id==='party'||s.id==='ending'){drawParty(t);}
 for(const [index,p] of room.players.entries()){if(!p.connected&&!p.bot)continue;if(s.id==='ending'&&s.phase==='celebrate'){avatar(p,750+index*60,410+Math.sin(t*6+index)*8);continue;}let x=p.x,y=p.y;if(p.token===myId&&own){x=own.x+smooth.x;y=own.y+smooth.y;}else{const a=remote.get(p.token);if(a){x=a.rx;y=a.ry;}}avatar(p,x,y);}
 ctx.restore();
}
function fireworks(t){if(reduced)return;for(let j=0;j<5;j++){const f=(t*.5+j*.21)%1,x=120+j*(viewW-200)/5,y=100+(j%2)*65;for(let i=0;i<12;i++){const a=i*Math.PI/6,r=f*70;ellipse(x+Math.cos(a)*r,y+Math.sin(a)*r,2.5,2.5,['#fff2b9','#f8b4c9','#c5edd4'][j%3]);}}}
function drawParty(t){
 const spark=(x,y,s=18,a='#fff5c8')=>{text('✦',x,y+Math.sin(t*2+x*.01)*3,s,a);};
 for(const [x,y,s] of [[150,120,16],[320,150,18],[540,110,14],[760,135,16],[990,118,15],[1230,148,17],[1480,112,16],[1660,140,18]]) spark(x,y,s,['#ffe9a8','#ffd8f1','#fff5c8','#ffdca8'][Math.floor(x/100)%4]);
 rect(20,22,250,38,'#fff7dfd9',10);text('生日月夜庭園 · 自由活動中',145,47,15,'#6e6762');
 rect(1415,22,355,38,'#fff7dfd9',10);text('蛋糕舞台 · 拍照鞦韆 · 閱讀帳篷 · 禮物區',1592,47,13,'#6e6762');
 ctx.save();ctx.translate(camera,0);fireworks(t);ctx.restore();
}
function drawContainedImage(img){const scale=Math.min(viewW/img.naturalWidth,viewH/img.naturalHeight),w=img.naturalWidth*scale,h=img.naturalHeight*scale,x=(viewW-w)/2,y=(viewH-h)/2;ctx.fillStyle='#171b30';ctx.fillRect(0,0,viewW,viewH);ctx.drawImage(img,x,y,w,h);}
function drawEndingScene(s){const t=clientTime;if(s.phase==='celebrate'){const art=artwork(assets.ending?.birthdayFinal);if(art){drawContainedImage(art);return;}background(s);return;}const target=room.players.find(p=>p.token===s.target)||{char:'小桃',connected:true};if(['recipient','send','merge'].includes(s.phase)){avatar(target,viewW/2,470,1.4);if(s.phase==='merge'){const f=W.clamp((t-s.mergeAt)/2,0,1);for(let i=0;i<5;i++){const a=i*Math.PI*2/5;text('⭐',viewW/2+Math.cos(a)*70*(1-f),405+Math.sin(a)*45*(1-f),26);}text('✦',viewW/2,405,20+f*65,'#fff0bb');return;}s.stars.forEach((st,i)=>{const fromX=70+i*(viewW-140)/4,fromY=100+(i%2)*80;const f=st.sentAt===null?0:W.clamp((t-st.sentAt)/1.2,0,1);const x=fromX+(viewW/2-fromX)*f,y=fromY+(405-fromY)*f;if(st.sentAt!==null)text('⭐',x,y,30);else text('☆',fromX,fromY,25,'#69718d');if(st.arrivedAt!==null)text('✦',viewW/2+Math.cos(i*Math.PI*.4+t)*55,408+Math.sin(i*Math.PI*.4+t)*30,20,'#fff1ac');});}}
function loop(now){const dt=Math.min((now-lastFrame)/1000,.05);lastFrame=now;frames++;clientTime+=dt;
 if(room?.started&&!$('play').hidden){if(own&&socket.connected){const predictionStage=room.stage.id===3?{...room.stage,cargo:{...room.stage.cargo,...W.D.cargoPose(room.stage.cargo,clientTime,room.stage.obstacles)}}:room.stage;W.step(own,keys,predictionStage,dt,clientTime);smooth.x*=Math.exp(-16*dt);smooth.y*=Math.exp(-16*dt);if(now-lastSend>=50){sendInput();lastSend=now;}const goal=W.clamp(own.x-viewW*.4,0,Math.max(0,W.WIDTH[room.stage.id]-viewW));camera+=(goal-camera)*Math.min(1,dt*8);}for(const a of remote.values()){const k=1-Math.exp(-14*dt);a.rx+=(a.x-a.rx)*k;a.ry+=(a.y-a.ry)*k;}const goalY=room.stage.id===3&&own?Math.min(0,own.y-360):0;cameraY+=(goalY-cameraY)*Math.min(1,dt*8);drawWorld();contextual();if(room.stage.id===2)updatePuzzle();}
 if(now-perfAt>1000){fps=Math.round(frames*1000/(now-perfAt));frames=0;netHz=net;net=0;perfAt=now;$('perf').textContent=`FPS ${fps} · PING ${ping}ms · NET ${netHz}/s`;updatePuzzle();}
 requestAnimationFrame(loop);
}
setInterval(()=>{if(socket.connected){const at=performance.now();socket.timeout(1800).emit('pingCheck',{},err=>{if(!err)ping=Math.round(performance.now()-at);});}},2500);
requestAnimationFrame(loop);

let musicBeat=0;setInterval(()=>{const s=room?.stage;if(!s||!socket.connected||document.hidden||muted)return;if(s.id===4&&!s.bridgeOpen){const melody=[165,196,220,196,147,165,196,247];tone(melody[musicBeat++%melody.length],.14);}else if(s.id==='party'||(s.id==='ending'&&s.phase==='celebrate')){const melody=[523,659,784,659,587,698,880,784];tone(melody[musicBeat++%melody.length],.18);}},320);
