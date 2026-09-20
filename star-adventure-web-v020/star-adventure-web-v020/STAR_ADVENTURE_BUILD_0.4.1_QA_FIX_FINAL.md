# 《星星大冒險》Build 0.4.1 — QA / Level Design Fix FINAL

> **用途：** 本文件是針對目前 `star-adventure-build-0.4.1` 的 QA 修正與關卡設計 Polish 規格。  
> **不是重新設計遊戲、不是重寫整個專案。**  
> 請以目前 0.4.1 完整程式碼為基礎修改，保留已正常運作的系統。

---

## 0. 執行優先級與施工原則

1. 本文件只處理目前 QA 發現的問題與 Level Design Polish。
2. **不要重構已正常工作的系統，不要重新實作整個 Level。**
3. 若本文件與先前 Master Spec / 0.4.1 Implementation Spec 衝突，以本文件針對 QA 修正的內容為優先；沒有修改到的舊規格繼續有效。
4. 必須保留目前正常運作的：
   - Create / Join Room
   - 6-player multiplayer sync
   - Character select / duplicate prevention
   - `momoPlayer` / `momoToken`
   - reconnect / progress recovery
   - Level 1–5 基本流程
   - fragments / progression
   - Birthday Ending
   - Party Room
   - DEV Tools
   - 現有 server-authoritative multiplayer 架構
5. **不要為了關卡 Polish 大幅增加 Socket.IO 高頻同步。** 靜態地形、一般動畫、視覺提示、敵人表現能 local/client-side 就 local；Server 只同步必要 authoritative state。
6. 不可新增 `Coming Soon`、不可刪減任何已完成關卡。
7. L3 / L4 不提供逐座標 Layout。請先完整分析目前 0.4.1 的 movement speed、jump arc、collision、camera、world dimensions、Cargo physics、Boss state、checkpoint、multiplayer architecture，再依本文件的節奏自行設計實際 Layout，並實際驗證可通關。
8. **不要只把現有障礙換位置。** L3 / L4 必須有真正的關卡節奏與可讀性改善。

---

# 1. 全遊戲 Level Design 語言

本輪統一採用 **Mario-like platform level design principles**。

這裡的 Mario-like 僅指關卡設計哲學與可讀性，**不得直接複製 Nintendo 的關卡、美術、角色、敵人或資產。**

核心節奏：

> **展示 → 教學 → 測試 → 組合 → 提高難度 → Payoff**

玩家應該能透過物件外觀、位置與短暫行為理解：

- 這是危險物
- 這可以互動
- 這個敵人怎麼移動
- 這個 Boss 接下來要做什麼
- 這個機關為什麼打開
- 自己為什麼失敗

難度主要來自：

- Movement
- Jump timing
- Observation
- Execution
- Cooperation
- Voice communication

而不是來自「不知道程式希望玩家做什麼」。

禁止出現明顯像 Bug 的設計：

- 無理由漂移
- 瞬間轉向
- 突然自動觸發重要機關
- 不可理解的 collision jitter
- 敵人撞牆持續抖動
- Boss 漂浮 / teleport-like movement
- 玩家尚未碰到機關，門已經自己打開

---

# 2. 全遊戲互動規則

正式統一「被動觸發」與「主動互動」。

## 2.1 可以自動觸發

以下可使用 collision / zone detection：

- Checkpoint
- Fall / death zone
- Hazard
- Enemy / Boss hit detection
- 普通 Finish arrival zone
- 必要的 passive detection

## 2.2 必須按 E / Mobile Interact

所有玩家有意識操作的機制必須：

> **靠近物件 → 顯示互動提示 → 按 E / Mobile Interact → 才觸發**

包含但不限於：

- L2 Reader 石碑
- L2 四個答案符號
- L3 開關 / 按鈕 / 橋機關 / 門機關
- Rescue
- L4 個人 Finish Button
- 其他 deliberate mechanism

單純：

- 走過
- 站上去
- 跳過去
- Collision overlap

**不得直接觸發 deliberate interaction。**

HUD 負責「資訊」，場景物件負責「玩法」。能做成遊戲世界內實體互動的東西，不要改成普通網頁按鈕。

---

# 3. 關卡 Intro / HUD UI 重做

## 3.1 移除目前常駐在遊戲下方的關卡敘述

目前關卡名稱、玩法敘述、遊玩資訊以獨立區塊常駐在遊戲畫面下方的方式取消。

不要讓遊戲看起來像：

> Game Canvas  
> ---  
> 網頁說明區

## 3.2 Level Intro Modal

每次玩家第一次進入一個新 Level：

1. Level 場景載入。
2. 中央顯示關卡 Intro Modal。
3. 顯示關卡名稱與非常簡短的玩法敘述。
4. 玩家按 `X` 關閉。
5. Modal 完全消失。
6. 正式開始遊玩。

Intro Modal 不要把整關所有規則一次寫完。

新機制第一次出現時，可以用短暫 Context Hint，例如：

- `需要 3 位玩家。`
- `E｜啟動機關`
- `貨物正在往後滾！`

## 3.3 HUD

遊戲進行中只保留真正需要持續看的資訊，直接 overlay 在遊戲畫面上方。

例如：

- L2：`洞穴 3/5｜第 2 棒｜執行者：兔兔`
- L4：`突破成功 4/6`
- L5：`抵達終點 3/6`

HUD 必須：

- compact
- semi-transparent
- 不增加 Canvas 高度
- 不把遊戲場景往下推
- PC / mobile responsive
- 不遮擋主要角色與互動區

DEV Panel 可維持獨立，因為它不是正式玩家 UI。

---

# 4. LEVEL 1 — 平台入門關 ★☆☆☆☆

## 4.1 核心不重做

目前 Level 1 的核心設計與 falling / respawn 體驗是可接受的。

保留：

- movement tutorial
- easy jumps
- pits
- moving platforms / planks
- 3-player pressure plate cooperation
- bridge break comedy event
- respawn
- all players regroup
- fragment ①

## 4.2 只做 Level Design Polish

把節奏整理得更像完整的平台教學關：

> 安全出生區  
> → 最簡單跳躍  
> → 小坑  
> → 高低平台  
> → 移動平台  
> → 合作壓板  
> → 斷橋搞笑事件  
> → 最後平台  
> → 終點

第一次出現的玩法應該簡單，之後才組合。

**L1 = L5 的基礎 / 教學版。**

不要為了本輪 QA 加入新的複雜玩法。

---

# 5. LEVEL 2 — 五洞穴語音記憶接力 ★★★☆☆

原本 5 Cave、Reader、4 Executors、Cave 4–5 雙 Reader 與真假邏輯全部保留。

本輪主要修正「Reader 任務、輸入互動與 UI」。

---

## 5.1 Reader 必須有場景內實體任務物件

不要使用普通 HUD / HTML 的「開始第 N 棒」按鈕作為主要玩法。

每個 Cave 必須有一個清楚可辨識的：

> **Reader 石碑 / 讀者台 / 發光裝置**

被指定的 Reader 靠近時顯示：

> `E｜讀取石碑`

Mobile 顯示對應 Interact。

不是 Reader 的玩家即使靠近並按 E：

> **不得啟動、不得看到答案。**

石碑可使用清楚狀態：

- 發光：目前 Reader 可以讀取
- 暗掉 / locked：不可互動
- completed：本棒已完成

---

# 6. L2 Reader 正式流程

每一棒流程如下。

## Phase A — Waiting Reader

HUD 顯示：

> `下一棒：XXX`  
> `等待讀者讀取石碑……`

Reader 走到石碑並按 E。

## Phase B — Private Reading

按 E 的瞬間：

1. Server authoritative lock 本棒，防止重複觸發。
2. Reader 石碑進入 Reading 狀態。
3. **只有授權 Reader 看得到答案。**
4. 答案在石碑上方 / 靠近石碑的位置以 compact floating panel 顯示。
5. 答案出現的同時立即開始閱讀倒數。

例如：

> 🍄　🍄　🍄　🍄  
> **3**

→

> 🍄　🍄　🍄　🍄  
> **2**

→

> 🍄　🍄　🍄　🍄  
> **1**

→ 完全消失。

**3 / 2 / 1 是閱讀時間本身，不是看完答案之後才另外倒數。**

Cave 1–3 可依既有難度使用約 2–3 秒顯示；Cave 4–5 可依原規格使用較適合的顯示時間，但 UI 行為一致。

## Phase C — Locked / Communication

閱讀時間結束後：

- Answer 完全消失
- Reader 石碑鎖定
- `E｜讀取石碑` 提示消失
- Reader 再按 E 無效
- **不可重看答案**

其他玩家從頭到尾不能看到答案。

其他玩家可以看到中性狀態：

> `讀者正在閱讀石碑……`

但不能看到任何答案內容。

Answer 消失後進入語音溝通階段。

**此時不要開始 Executor 作答倒數。**

玩家可以先講、確認、討論。

---

# 7. L2 Executor 輸入

四個符號固定物理位置：

- 🌸 花
- ⭐ 星星
- 🍄 香菇
- 🌙 月亮

不要 shuffle 四個符號的場景位置。

指定 Executor 必須：

> 走到符號附近  
> → 出現 `E｜輸入 🍄`  
> → 按 E  
> → 才記錄一次 input

**走過、踩到、站上、跳過符號全部不能輸入。**

例如答案：

> 🍄 🍄 🍄 🍄

Executor 可以在 🍄 附近連續完成四次有效 E interaction。

## 7.1 Executor Timer

Executor action timer 只有在：

> **該 Executor 第一次有效按下某個符號的 E**

時才開始。

Reader Answer 消失、大家開始討論時，不能先偷跑 Executor Timer。

保持原本 Cave 難度目標：

- Cave 1：約 6 sec input window
- Cave 2：約 5 sec
- Cave 3：約 5 sec
- Cave 4 / 5 依原規格

Wrong input / timeout：

- funny BOING / spring / explosion launch
- current Cave attempt fail
- 只重試 current Cave
- earlier caves remain cleared
- reshuffle current Cave roles / sequences / relevant truth state

---

# 8. L2 Cave 4 / Cave 5 — Dual Reader

Cave 4–5 使用兩個 Reader。

場景中建議有兩個清楚分開的 Reader 石碑：

> `[ Reader A 石碑 ]　　　Cave　　　[ Reader B 石碑 ]`

兩名 Reader 都知道自己是 Reader，但都不知道自己的答案是真是假。

## 8.1 啟動

任一 Reader 在自己的石碑按 E：

- Server lock 本棒
- 防止另一 Reader 再次觸發第二次 start
- **兩名 Reader 同時進入 Reading Phase**

Reader A 只看到 A 的 sequence。

Reader B 只看到 B 的 sequence。

兩邊同時倒數、同時消失。

任何 Reader 都不能看到另一人的 sequence UI。

## 8.2 Truth Logic

保留原 0.4.1 Final Spec 原則：

- True Reader / true sequence **每一棒獨立決定**
- 不可整個 Cave 固定某一 Reader 為真
- Stone rule 在該 Cave attempt 內固定
- Fake sequence 不能只是亂數垃圾
- Server 必須驗證 **exactly one sequence satisfies the rule**
- Fake 與 True 可高度相似，甚至只差 1–2 個位置
- 邏輯永遠不能說謊

核心體驗：

> 兩名 Reader 記住各自答案  
> → 答案消失  
> → 用語音念出來  
> → 大家依 Stone Rule 判斷  
> → Executor 再開始輸入

---

# 9. L2 UI 修正

目前 Reader / Hint 背景過大。

修改為：

- compact floating panel
- 背景只包必要內容
- 答案符號本身可以清楚偏大
- Panel 不應佔據半個遊戲畫面
- 不遮角色腳下
- 不遮四個 symbol
- 不遮 Cave 主要地形
- PC / mobile responsive

Answer 消失後，整個 Reader answer panel 一起消失，不留下大型半透明背景。

---

# 10. LEVEL 3 — Cargo Escort ★★★★☆

## 10.1 保留核心系統

不要砍掉 Cargo 系統。

保留：

- giant round pink Cargo
- push / roll
- Cargo 可撞飛 / 壓扁玩家
- `⚠️ 禁止乘坐貨物。`
- 玩家實際可以站 / 搭在 Cargo 上
- destination crate / mushroom joke
- fragment ③
- 3 people transport + 3 people clear ahead 核心
- final all-player slope

但目前 Level 3 的 obstacle arrangement / pressure-plate feel 不自然，需要真正的 Level Design Polish。

---

# 11. L3 Cargo Physics 基本規則

Cargo 必須有可理解的重量與坡度行為。

### 前 70–80%：

- 3 pushers = intended / normal controlled speed
- 1–2 pushers = very slow
- 4–5 pushers = dangerous acceleration
- 6 pushers = strongly accelerated / funny overpowered state

可顯示：

> `⚠️ 人力嚴重過剩`

### Gravity / Rollback

當 Cargo：

- 沒有人推
- 推力不足
- 位於斜坡

時，不應該無理由停在原地。

尤其上坡：

> **Cargo 應自然向下 / 向後滾。**

這個規則必須在關卡前段先教玩家。

不要做成完全真實物理模擬；目標是 predictable game physics。

---

# 12. L3 新關卡節奏

GPT-6 請依現有 movement / camera / Cargo 尺寸自行設計實際 Layout，但必須符合以下節奏。

## Section 1 — Teach the Cargo Rule

安全的小上坡。

讓玩家快速理解：

> 3 人推 = 正常  
> 放手 = Cargo 往後滾

第一次不要搭配複雜機關。

## Section 2 — First Route Preparation

前方出現明顯缺口 / Bridge / Gate。

前跑組需要：

> 離開 Cargo  
> → 做簡單平台跳躍  
> → 到達實體開關  
> → 靠近  
> → `E｜啟動`  
> → Bridge / Gate 才真正開啟

**不得使用玩家還沒真正互動就自動開門的 proximity / collision trigger。**

後方玩家同時必須控制 Cargo 不要回滾。

目標自然產生語音：

> 「先不要推！前面還沒好！」

## Section 3 — Cooperation Escalation

開始組合：

- uphill
- height differences
- narrow path
- simple moving platform / route obstacle
- second deliberate E-interaction mechanism

所有障礙都必須服務於「如何把 Cargo 安全送過去」。

不要只是把不同機關依序擺在地圖上。

## Section 4 — Mid Checkpoint

設置清楚的中途 Checkpoint。

真正掉出地圖 / death：

> respawn at nearest checkpoint

不要永遠回 Level 起點。

## Section 5 — Downhill Loss-of-Control

設計一段明顯下坡。

Cargo 受坡度影響自然加速。

玩法反轉：

前面玩家習慣「推」，這裡反而必須控制 / 追趕 / 不要亂推。

預期語音：

> 「不要再推啦！！！」

這是本關主要 comedy / action payoff。

## Section 6 — Final Giant Slope

最後必須有視覺上非常清楚的巨大上坡 / mountain slope。

規則：

- 6 pushers = stable upward movement
- 5 pushers = barely maintains / very slow
- `<5` = Cargo starts rolling downward

Final slope failure：

- 不重開整個 Level
- Cargo reset 到 final-slope checkpoint / bottom checkpoint

最後形成真正的：

> **六人一起推上去。**

---

# 13. L3 Flatten / Rescue / Checkpoint

Cargo 壓到玩家：

> Flattened

Flattened player：

- 可以非常慢地移動
- Teammate 靠近按 E 可 rescue
- 若無人 rescue，約 3 秒後自動站起來
- Recovery 後約 0.5 秒 invulnerability，避免 same-frame / immediate re-flatten

真正掉出地圖：

> nearest checkpoint respawn

Cargo 掉入 major pit / trap：

- 前段 major failure 可依原規格造成 Level 3 restart / appropriate Cargo reset
- Final slope failure 只 reset final section，不重跑整關

請讓失敗規則在視覺與狀態上可理解。

---

# 14. LEVEL 4 — Boss Bridge ★★★★★

## 14.1 核心玩法不改

Boss **不能被玩家殺死**。

玩家的目標：

> 每個人自己突破 Boss → 抵達橋另一側 → 按下自己的 Finish Button。

保留：

- flatten instead of death
- teammate rescue
- successful player can return to help
- individual completion persistence
- `突破成功 X/6`
- 6/6 → bridge floor opens → Boss falls
- 已完成玩家即使跟 Boss 一起掉下去，respawn at finish side
- fragment ④

本輪主要重做 **Bridge readability + Boss behavior / timing**。

---

# 15. L4 Bridge Layout

目前橋 / encounter space 不夠清楚。

重新整理成玩家一眼能讀懂的：

> **Safe Start Area**  
> → **Bridge Entrance**  
> → **Approach / anticipation section**  
> → **Boss Blockade / Combat Zone**  
> → **Breakthrough Zone**  
> → **Finish Safe Platform**  
> → **Individual Finish Buttons**

玩家一進來就應該理解：

> 「Boss 擋在橋上，我要想辦法穿過去。」

Bridge 可以有少量視覺 / 高度變化來增加動作感，但不能變成讓玩家搞不清楚哪裡是橋、哪裡是終點的複雜地形。

---

# 16. L4 Boss Design

目前 Boss 前搖過長、節奏太慢，且 movement / animation 容易看起來像 Bug。

**不要單純把所有速度數值乘 2。**

請重新整理 Boss state machine，優先做 2–3 個簡單、清楚、可靠的 attack archetypes。

## 16.1 Charge / Lunge

Telegraph：

- 約 0.3–0.6 sec
- 清楚的身體後縮 / 面向 / 準備姿勢

Attack：

- 快速直線衝刺
- 方向不可在 attack 中無理由瞬間改變

Recovery：

- miss / 撞到 bridge post / edge / obstacle 後有短暫 recovery
- 約可從 ~0.7 sec 起調整
- Recovery 是玩家重要 breakthrough window

## 16.2 Jump / Slam

Telegraph：

- 短暫 crouch / pullback

Attack：

- Boss 明確跳起
- landing 有 readable hit / shockwave zone

Counterplay：

> **Boss 在空中時，玩家可以 dash / run under or around。**

這是主要合法突破方式之一。

## 16.3 Close-range Punish

玩家貼 Boss 太近或嘗試無腦站在 Boss 身上時，可使用：

- butt slam
- stomp
- short-range knockback

Telegraph 可以短，但必須看得懂。

---

# 17. L4 兩種主要突破方式必須成立

### Route A — Direct Jump

玩家可以靠熟練 movement / jump timing 直接跳過 Boss。

要求：

- skillful
- 不 trivial
- 不 pixel-perfect
- collision box 不可比視覺角色大得離譜

### Route B — Boss Jump Window

玩家等待 Boss Jump / Slam。

Boss 離地後：

> 從下面 / 側面快速穿過。

兩種方式都要實際測試可行。

Boss 難度應該是：

> **玩家看得懂下一招，但仍然需要操作才能成功。**

而不是靠 random / luck。

---

# 18. L4 Boss 禁止行為

禁止：

- unexplained sliding
- teleport-like reposition
- sudden 180° direction changes during attack
- floating
- collision jitter
- wall shaking / stuck oscillation
- 超長 idle / crouch 讓玩家輕鬆走過
- 攻擊沒有 telegraph
- attack hitbox 與動畫嚴重不一致

Boss movement 應被限制在清楚的 encounter zone 內。

---

# 19. L4 Flatten / Completion

Boss hit：

> Flattened

Flattened player：

- slow movement
- teammate 靠近按 E 約 0.5 sec rescue
- revive 後保留短 invulnerability，避免同 frame 再 hit

玩家突破後，到 Finish Side 的**實體個人按鈕**：

> `E｜完成突破`

按下後 Server 永久記錄本關完成狀態。

HUD：

> `突破成功 4/6`

完成玩家仍可以返回橋上幫忙。

之後被 Boss 打中不取消完成狀態。

6/6：

> Bridge floor opens  
> → Boss falls  
> → 還在橋上的玩家也可以一起掉下去

已完成玩家掉下去：

> respawn directly on Finish Side

---

# 20. LEVEL 5 — L1 Plus ★★★☆☆

Level 5 核心設計目前可接受，不做大改。

正式定位：

> **Level 1 的進階版 / Final platform journey。**

L1 教過的：

- running
- jumping
- pits
- platforms
- moving platforms

在 L5 做較難組合。

可包含：

- narrow platforms
- height differences
- moving-platform combinations
- falling platforms
- small cliffs
- simple enemies
- 3–4 checkpoints

難度：

> 高於 L1，但刻意低於 L4。

不要重新加入 fragment socket、final tower puzzle、chest、生日暗示或前四關 mechanic reprise。

---

# 21. L5 Enemy 行為重做

目前 Enemy 行為看起來容易像程式 Bug。

移除 / 避免：

- weird sine-wave drifting
- random pursuit
- wall jitter
- instantaneous direction flip
- unexplained movement
- 過度複雜 AI

改成少量、非常直覺的 archetypes。

## 21.1 Patrol Enemy

> 固定平台左右巡邏  
> → 到平台邊緣 / obstacle  
> → 明確轉頭  
> → 反方向繼續

## 21.2 Hopper

> 固定節奏跳躍

不要突然改節奏或追蹤玩家。

## 21.3 Charger

> 玩家進入短距離 detection  
> → clear short telegraph  
> → straight-line charge  
> → recovery

原則：

> **玩家第一次看到一個 Enemy 約 2–3 秒，就應該大致理解怎麼躲。**

敵人主要功能是干擾 platforming，不是變成複雜 combat system。

---

# 22. L5 Flatten / Checkpoint

保留既有規格：

- Flattened 可 slow move
- teammate 可 rescue
- Flattened 超過約 3 秒未救 → death → nearest checkpoint
- fall off cliff → immediate death → nearest checkpoint
- checkpoint is individual
- one player's death does not reset others

---

# 23. L5 Ending — 禁止改動核心

六名玩家抵達普通 Finish Platform。

顯示：

> `所有冒險者已抵達。`

然後六人：

> **【一起按住】**

所有人 hold interact 3 秒。

成功瞬間：

- 不顯示 Victory
- 不顯示 Level Clear
- 不放煙火
- 不顯示 fragment ⑤
- 不顯示 birthday hint
- 不顯示 chest

**直接瞬間 pure white screen。**

Music stops。

Blank 約 5 秒。

普通玩家只看到：

> `系統好像漏掉了什麼。`

只有 authoritative `momoPlayer` 看到：

> `啊……製作人做不下去了。`  
> `沒想法了。`

短暫 pause 後，所有玩家同步進入原本 Birthday Ending。

**Birthday Ending、五人 individual star send、小桃 target、隱藏成就、Party Room 全部不得改壞。**

---

# 24. RESET / DEV / Existing Tools

保留現有：

- Reset Current Level
- RESET GAME
- Level jump
- Bot fill
- teleport
- revive
- fragments
- ensure momo
- direct Birthday Ending

並確保新玩法仍可用 DEV 測試。

L2 DEV 至少應可：

- inspect Reader / Executor assignment
- start / complete current leg
- inspect authorized answer
- inspect Cave 4/5 true/fake validation
- force fail / retry
- quick jump Cave 1–5

L3 DEV 至少應可：

- Cargo reset
- checkpoint reset
- simulate 1–6 pushers
- jump to downhill section / final slope if practical

L4 DEV 至少應可：

- force Boss attacks
- flatten / revive
- mark / unmark personal completion
- test 6/6 bridge opening

L5 DEV 至少應可：

- checkpoint teleport
- flatten / death
- jump to final hold
- test momo / non-momo white-screen text

---

# 25. Networking / Performance Constraints

本輪 Level Design 改善不得明顯增加網路負擔。

### Client-side / local preferred

- static terrain
- visual telegraphs
- HUD animations
- Reader countdown rendering
- enemy animation frames
- particles / simple effects
- ordinary moving-platform visual interpolation where safe

### Server authoritative where needed

L2：

- current Cave
- caveCleared
- Readers
- Executors / order
- current leg / phase
- authorized answer payload
- Cave 4/5 truth relationship / rule
- first valid Executor input timestamp
- result / gate state

L3：

- Cargo authoritative position / state
- important obstacle states
- checkpoints / reset
- final slope state

L4：

- important Boss state / attack state as needed for multiplayer consistency
- flattened / rescue
- personal completion
- bridge open / Boss drop

L5：

- player checkpoint
- flattened / death
- final arrival
- final hold
- white-screen / ending phase

**Never sync animation frame-by-frame over Socket.IO.**

---

# 26. Regression Safety

修改前先建立現有功能 baseline。

施工順序建議：

1. Shared Intro / HUD / interaction helper
2. L2 interaction + Reader system
3. L3 Level Design / Cargo polish
4. L4 Boss / bridge polish
5. L5 enemy polish
6. L1 minor polish only
7. Full regression

每完成一關先測該關，不要等五關全部改完才測。

尤其禁止為了 L3 / L4 方便，順手重寫：

- Room system
- Player identity
- reconnect architecture
- global movement engine
- momo identity
- Birthday Ending

---

# 27. Required QA Tests

至少驗證：

### Global

1. Create Room
2. Join Room
3. six simultaneous connections / bots
4. duplicate character prevention
5. momo identity
6. reconnect
7. Reset Current Level
8. RESET GAME
9. Level Intro Modal appears correctly
10. Intro X closes and does not leave permanent description panel
11. PC + mobile HUD responsive

### L1

12. Level 1 complete
13. falling / respawn still works
14. cooperation gate still works
15. bridge comedy event still works

### L2

16. Cave 1–5 clear
17. four Executors unique per attempt
18. only authorized Reader can activate Reader stone
19. non-Reader E on stone does nothing
20. Reader answer visible only to Reader
21. Reader answer + countdown begin simultaneously
22. answer disappears and cannot be reopened
23. other players never receive / render private answer
24. Executor symbol does NOT trigger by walking / jumping / collision
25. E / mobile interact submits symbol
26. Executor timer starts only on first valid symbol input
27. failure reshuffles current Cave only
28. Cave 4/5 both Readers receive private answers simultaneously
29. Cave 4/5 exactly one sequence satisfies rule
30. true Reader can change between legs

### L3

31. 3-player push = intended controlled speed
32. 1–2 players = slow
33. 4–6 players = dangerous acceleration
34. Cargo rolls backward when unsupported on uphill
35. deliberate route mechanism requires E
36. proximity alone does not open mechanism
37. Cargo / player major fall behavior correct
38. nearest checkpoint respawn
39. flattened player slow movement
40. teammate rescue
41. auto recovery after ~3 sec
42. downhill Cargo acceleration is predictable
43. final slope: 6 stable
44. final slope: 5 barely moves / maintains
45. final slope: <5 rolls backward
46. final slope failure resets only final section

### L4

47. bridge route visually / mechanically clear
48. Boss Charge telegraph → attack → recovery works
49. Boss Jump / Slam works
50. Boss does not jitter / teleport / float / instant-turn during attack
51. direct jump route is possible but non-trivial
52. Boss-airborne timing route is possible
53. Boss hit → flattened
54. rescue works
55. individual Finish Button requires E
56. completion persists after returning to Boss zone
57. 6/6 opens bridge / drops Boss
58. completed player falling with Boss respawns Finish Side

### L5

59. checkpoints
60. cliff death
61. flatten >3 sec → death
62. rescue before 3 sec
63. Patrol enemy predictable
64. Hopper predictable
65. Charger telegraph / charge / recovery predictable
66. no obvious enemy wall jitter / weird drifting
67. six-player final hold 3 sec
68. momo-specific white screen
69. non-momo white screen
70. Birthday Ending
71. five individual star sends
72. Party Room

### Regression / Network

73. reconnect during new mechanics
74. no obvious high-frequency Socket.IO spam regression
75. no duplicated interaction events from holding / spamming E
76. private Reader answer is not accidentally broadcast to unauthorized clients
77. full L1 → L5 → Birthday Ending clear

Real-phone touch feel, six real humans across real networks, Wi-Fi ↔ mobile-data reconnection and subjective Boss/Cargo feel must be clearly listed as **manual verification** unless actually tested with real devices/users.

---

# 28. Deliverables

完成後請輸出完整可直接部署的 Build，不要只給 patch。

至少包含：

1. 完整 `star-adventure-build-0.4.1-qa-fix` ZIP
2. Updated README
3. CHANGELOG
4. Automated / scripted test results
5. Manual verification list
6. 已知限制 / remaining issues（如有）

README 必須說明：

- 如何在 Render 部署
- Build version
- DEV mode / tools
- 本輪 QA Fix 主要內容
- 哪些項目已自動測試
- 哪些項目仍需真人 / 手機 / 六人實測

---

# 29. Final Experience Target

五關最終身份：

> **L1｜平台教學**  
> 學會跑跳與基本合作。
>
> **L2｜語音記憶**  
> Reader 讀石碑、記住答案、語音傳遞，Executor 實體互動輸入。
>
> **L3｜合作運輸**  
> 3 人控 Cargo、3 人開路，學會控制重量與坡度，最後六人一起推上山。
>
> **L4｜Boss 突破**  
> 全遊戲動作難度最高；Boss 強但公平，讀招、閃避、互救、逐一突破。
>
> **L5｜平台最終旅程**  
> 回到 L1 熟悉的平台玩法，但做成進階版，讓玩家以為遊戲正常走向結束。
>
> **→ 突然白畫面 → 假爛尾 → Birthday Ending。**

本輪完成後，應視為主要 Gameplay / Level Design Polish 階段接近完成。後續優先進入正式美術、角色動畫、音效/BGM、VFX、細部 Bug Fix 與真人六人測試，而不是再次大幅改寫核心玩法。
