# 《星星大冒險》Build 0.4.1 FINAL 實作規格

> 本文件是 Build 0.4.1 的 FINAL、最高優先實作規格。  
> 請搭配 `STAR_ADVENTURE_MASTER_SPEC.md` 與目前最新可執行的 `0.4 Full Alpha ZIP` 使用。  
> 若本文件與舊 Master Spec 衝突，**以本文件為準**。

---

## 0. 任務性質

請完整閱讀我上傳的：

1. `STAR_ADVENTURE_MASTER_SPEC.md`
2. 目前最新可執行版本《星星大冒險》0.4 Full Alpha ZIP
3. 本文件 `STAR_ADVENTURE_BUILD_0.4.1_IMPLEMENTATION_SPEC.md`

這是「既有遊戲修改 / 實作任務」，不是重新設計遊戲，也不是只做 Prototype。

請先完整檢查現有 0.4 Full Alpha 的：

- 前端程式
- Server / Socket.IO 多人同步
- 房間系統
- reconnect
- DEV 工具
- Level 1～5
- Birthday Ending
- Party Room

確認現有架構後，再直接修改。

### 最高優先原則

不要從零重寫整個專案。

必須以目前 0.4 Full Alpha 為基礎修改，保留目前已經可以運作的：

- 建立房間
- 加入房間
- 房間代碼
- 角色選擇
- 禁止重複角色
- 6 人多人同步
- `momoPlayer / momoToken`
- reconnect
- PC / Mobile 操作
- DEV 系統
- Birthday Ending
- Party Room
- Render 部署方式

Master Spec 中沒有被以下「新版定版規格」覆蓋的內容，全部繼續有效。

但是 **Level 2、Level 3、Level 4、Level 5** 的玩法，以本文件中的新版定版規格為最高優先級。

若本文件與舊 Master Spec 衝突：

> **以本文件為準。**

不要自行刪減、簡化、合併或改玩法。  
不要使用 Coming Soon。  
Placeholder 美術可以繼續使用。

優先目標：

> **6 個真人可以從建立房間一路完整玩到 Birthday Ending + Party Room。**

---

# 1. 共通修正

## 1.1 RESET

新增兩種 Host-only 功能。

### A. 重置本關

- 只重置目前 Level。
- 保留房間。
- 保留玩家。
- 保留已取得的前置碎片 / 前面關卡進度。
- 清除目前關卡的暫時狀態。

### B. RESET GAME / 重製遊戲

- Host only。
- 必須二次確認。
- 不需要建立新房間。
- 保留目前房間與玩家連線。
- 清除整個 Run：
  - Level
  - fragments
  - puzzle state
  - cargo
  - Boss
  - Ending
  - Party state
- 回到 Lobby / Character Selection 的適當初始狀態。

原本 DEV Jump Level 功能保留。

---

## 1.2 移動 / 跳躍

目前跳躍高度不足。

重新調整 Jump，但必須測試 Level 1～5，避免跳躍高度增加後直接跳過正常關卡機制。

所有平台、Boss、Cargo、障礙必須一起重新檢查：

- collision
- jump feasibility
- route blocking
- unintended skips

---

## 1.3 Fonts

目前 GitHub 沒有 `public/fonts`，因為原本 fonts 資料夾超過 100 files，無法正常 Web Upload。

請：

- 移除無效 `/fonts/fonts.css` dependency；或
- 改成不需要大量字型檔的安全 fallback。

不得讓字型缺失影響遊戲。

---

## 1.4 網路

非常重要：

> **提高遊戲難度不能靠大量增加 Socket.IO 流量。**

能 client-side / local 計算的內容，例如：

- 靜態地形
- 視覺效果
- 動畫
- 倒數 UI
- particles
- screen shake

盡量 client-side。

Server 只同步必要權威狀態。

---

# 2. Level 1

Level 1 保留目前 Master Spec 的原始玩法。

定位：

> ★☆☆☆☆

教學關，不要大改核心內容。

---

# 3. Level 2 — 完全重製
## 五洞穴語音記憶 / 推理接力

舊版「三組 Pair Cave / Reader + Operator」設計淘汰。

Level 2 改成 **5 個連續洞穴**。

每個洞穴必須是真正的物理區域。

Cave N 沒有 Clear：

- Gate N 不得打開。
- 玩家不能進 Cave N+1。

Server 必須保存：

`caveCleared[1..5]`

或等價權威狀態。

Reconnect 後仍然正確。

玩家不能靠：

- jump
- latency
- reconnect
- collision bug

跳過未完成洞穴。

---

## 3.1 固定地板輸入

每個洞穴都有四個固定位置的符號：

- 🌸 花
- ⭐ 星星
- 🍄 香菇
- 🌙 月亮

位置永遠固定。

**不要 shuffle 實體按鈕位置。**

答案本身可以隨機。

---

## 3.2 四棒制

每個 Cave 都有 **四棒**。

同一輪中：

- 四位 Executor 必須是四個不同玩家。
- 任何 Executor 在同一輪最多只能負責一棒。

例如：

- 第 1 棒：兔兔
- 第 2 棒：吉伊卡哇
- 第 3 棒：海獺
- 第 4 棒：栗子饅頭

兔兔完成第 1 棒後，不能再次成為第 2～4 棒。

如果 Cave Fail：

- 整個「目前 Cave」重新洗牌。
- Reader(s) 重抽。
- 四個 Executor 重抽。
- Executor 順序重抽。
- Answers 重抽。
- Cave 4/5 truth relationship 重新生成。

但是：

> **已完成的前面 Cave 不重來。**

---

## 3.3 Cave 1～3 人員

- 1 Reader
- 4 Executors
- 1 Observer / Helper

---

## 3.4 Cave 4～5 人員

- 2 Readers
- 4 Executors

六個人全部都有正式角色。

Reader 不可以同時當 Executor。

---

## 3.5 每棒流程

非常重要：

> **下一棒不能自動開始。每一棒都必須由 Reader 手動啟動。**

流程：

1. UI 顯示：
   - `下一棒：XXX`
   - `等待讀者開始……`

2. Reader 按：
   - `【開始第 N 棒】`

3. Cave 4～5：
   - 兩個 Reader 都可以按。
   - 第一個成功觸發後 server lock。
   - 避免 double start。

4. Server 只把該棒 Answer 發給合法 Reader。

5. Answer 顯示指定時間。

6. Answer 消失。

7. 玩家可以語音溝通 / 記憶 / 推理。

8. Executor 此時**沒有倒數**。

9. 只有當該棒 Executor 第一次踩下任意輸入符號：
   - action timer 才開始。

10. Executor 必須在時間內完成完整 sequence。

11. 正確：
   - 此棒成功。
   - 暫停。
   - 等 Reader 手動開始下一棒。

12. 錯誤 / timeout：
   - BOING / 彈飛 / 搞笑失敗。
   - Current Cave Fail。
   - Current Cave reset + reshuffle。

---

## 3.6 Cave 1

- 1 Reader
- 4 Executors
- 每棒 sequence length = 4
- Answer 顯示約 2.5 秒
- Executor 第一次輸入後：約 6 秒完成

定位：

> 看答案 → 語音 → 記住 → 第一踩開始倒數。

---

## 3.7 Cave 2

- 1 Reader
- 4 Executors
- Length = 4
- Display 約 2 秒
- Input 約 5 秒

壓力稍微提高。

---

## 3.8 Cave 3

- 1 Reader
- 4 Executors
- Length = 5
- Display 約 1.8～2 秒
- Input 約 5 秒

主要增加記憶壓力。

---

## 3.9 Cave 4 — 雙 Reader

- 2 Readers
- 4 Executors
- Length 約 6

兩位 Reader 都知道彼此是 Reader。

每一棒開始時：

Reader A 與 Reader B 同時看到**不同的 sequence**。

兩個 Reader 都不知道自己看到的是 True 還是 Fake。

每一棒的 True Reader 獨立決定，例如：

- Leg 1：A true
- Leg 2：B true
- Leg 3：B true
- Leg 4：A true

不能設定成整個 Cave 都是同一個 True Reader。

洞穴中有所有玩家都看得到的 Stone Rule。

Cave 4 的 rule 偏簡單，例如：

> 「⭐ 星星比較多的答案是真的。」

Server 必須產生：

- 一個符合 rule 的 sequence
- 一個不符合 rule 的 sequence

而且必須 programmatically validate：

> **剛好只有一個答案符合 rule。**

Fake answer 不要完全亂數。

最好跟 True answer 很像，只差 1～2 個位置。

玩家必須真的比較兩個 Reader 的情報。

Answer 消失後仍可討論。

Executor 第一踩才開始 timer。

---

## 3.10 Cave 5 — 雙 Reader 進階

- 2 Readers
- 4 Executors
- Sequence length = 8
- Display 約 3.5 秒
- Input 約 8 秒

每棒 True Reader 一樣獨立變化。

Stone Rule 比 Cave 4 更需要推理。

但是必須：

- 清楚
- deterministic
- 唯一解
- 不能靠運氣

Rule 必須判斷 sequence 本身。

不要加入「拿著某個物品」之類目前遊戲不存在的系統。

可用 rule family，例如：

- 第一個 ⭐ 必須出現在第一個 🌙 之前
- 🍄 必須出現在第一個 🌙 之前
- ⭐ 數量比 🌸 多
- 第 2 個與第 4 個符號相同
- 第一個與最後一個不同
- 特定 symbol 出現奇數 / 偶數次
- 其他清楚、可理解、唯一判定的 sequence rule

生成後必須驗證：

> **exactly one sequence satisfies rule**

---

## 3.11 Level 2 設計原則

> **提示可以騙眼睛，但邏輯不能騙玩家。**

玩家體驗：

- Cave 1：「喔，原來這樣玩。」
- Cave 2：「開始有點趕。」
- Cave 3：「五個有點記不住。」
- Cave 4：「幹？怎麼有兩個答案？」
- Cave 5：「全部閉嘴！先讓他們兩個念完！」

五洞完成後：

- 六人 regroup
- 取得 Fragment ②

難度約：

> ★★★☆☆

---

# 4. Level 3 — 完全重製
## 超級搬運工

移除目前不合理的蹺蹺板玩法。

保留：

- 巨大粉紅 Cargo
- Cargo 可以推
- Cargo 可以滾
- Cargo 可以撞 / 壓玩家
- `⚠️ 禁止乘坐貨物`
- 玩家實際可以跳上 Cargo
- 最後送到山頂
- crate / mushroom gag
- Fragment ③

Level 3 核心變成：

> **3 人運貨 + 3 人提前開路**

---

## 4.1 前段 Cargo 規則

約前 70～80%：

### 3 人推
正常、最佳速度。

### 1～2 人
非常慢。

### 4～5 人
推力過大，Cargo 開始危險加速。

### 6 人
Cargo 暴衝。

可以顯示搞笑警告：

> ⚠️ 人力嚴重過剩

重點：

> **推太快不是獎勵。**

前方如果障礙還沒解除，Cargo 可能：

- 掉洞
- 掉陷阱
- 衝出路線

Cargo 掉入主要陷阱 / 深坑：

> Level 3 Fail → 整關重來。

---

## 4.2 3 人推 / 3 人開路

整關主要節奏：

- 3 個人控制 Cargo。
- 另外 3 個人必須提前跑去前方解除障礙。

障礙可以包括：

- 開橋
- 多人壓板
- 閘門
- 升降平台
- 風扇
- 陷阱
- 其他合理的多人合作障礙

必須形成：

> 「先不要推！前面還沒好！」

的語音合作。

不要把所有機關塞在同一個 viewport。

整關做成真正有距離、有高度差的「上山運輸路線」。

Static terrain 儘量 local。

---

## 4.3 Cargo 搞笑物理

Cargo 可以：

- 回滾
- 撞飛玩家
- 壓扁玩家
- 把站在上面的玩家帶走

`⚠️ 禁止乘坐貨物` 保留。

玩家仍然可以真的跳上去。

---

## 4.4 最後大斜坡

這裡規則反轉。

前面一直教育玩家：

> 「不要太多人一起推。」

最後大斜坡改成：

> 「需要全體搬運工。」

### 6 人
可以穩定往上。

### 5 人
勉強維持 / 非常慢。

### 少於 5 人
Cargo 開始往下掉 / 往下滾。

往下滾時可以：

- 壓扁玩家
- 撞飛玩家

最後坡失敗：

> **不要整個 Level 3 重來。**

Cargo reset 到最後坡底部 checkpoint。

前面的 Cargo 掉入主要洞 / 陷阱：

> 仍然可以整關重來。

Level 3 難度：

> ★★★★☆

---

# 5. Level 4 — 完全重製
## 橋上的 Boss

刪除舊版：

- Cannon
- Ammo
- 固定砲手
- 三次砲擊
- 原本角色分工

新核心：

> **Boss 無法被玩家殺死。**

場景是一座長橋。

Boss 守在橋中央。

六個玩家的目標不是殺 Boss：

> **每一個人都必須想辦法越過 Boss。**

---

## 5.1 Boss 難度

Boss 要強。

玩家非常容易：

- 被撞
- 被打飛
- 被屁股壓
- 被踩扁

但是：

Boss 的所有重要攻擊必須有可讀前搖。

不能靠不可預測亂數坑人。

難度來源：

- timing
- movement
- observation

不是運氣。

---

## 5.2 兩種主要突破方式

### A. 直接跳過 Boss

Boss collision / player jump 必須調整到：

- 有技巧
- 有難度
- 合理可過

不能隨便跳就過。

也不能要求 pixel-perfect。

### B. 等 Boss 跳起來

Boss 有明確前搖，例如：

- 蹲下
- 動作提示
- 地面提示

Boss 跳起來時：

玩家可以抓空檔從下面 / 身邊衝過去。

兩種方式都必須真的可行。

---

## 5.3 壓扁系統

被 Boss 攻擊：

> 不死亡。

變成「壓扁狀態」。

壓扁玩家：

- 仍然可以移動。
- 速度非常慢。

其他玩家靠近：

> Interact 0.5 秒 → 救起。

救起後：

> 0.1 秒 invulnerability。

0.1 秒很短是刻意的，主要防止同一 frame 立即再次判傷。

---

## 5.4 個人成功按鈕

玩家成功越過 Boss 後：

到橋另一端按自己的按鈕。

按下後：

> Server 永久記錄此玩家本關已突破。

例如：

> 突破成功 4 / 6

按過按鈕後：

玩家可以自由跑回橋上。

可以：

- 救人
- 幫忙吸引 Boss
- 幫最後的人創造空檔

回去後即使再次被打，也不取消成功紀錄。

---

## 5.5 通關

當 6 / 6 全部按過自己的按鈕：

Boss 腳下的橋面立刻打開。

Boss 掉下去。

如果此時有玩家還站在橋中央：

> 可以跟 Boss 一起掉下去。

如果該玩家已經按過按鈕：

> 直接在終點側復活。

不要要求重新突破。

Boss 掉下去後：

- Level Clear
- Fragment ④

Level 4：

> ★★★★★

重要：

- 這關不 Game Over。
- 不需要整關重來。
- 核心樂趣是一直被 Boss 壓扁、互救、突破、回頭救人。

---

# 6. Level 5 — 完全重製
## 星空障礙賽

刪除舊版：

- 四碎片飛入 socket
- 中央寶箱
- 前四關 puzzle reprise
- 原本 Final Tower puzzle structure

Level 5 改成：

> **單純但有趣的最後障礙賽。**

難度約：

> ★★★☆☆

不要比 Level 4 更難。

---

## 6.1 場景

由黃昏逐漸進入星空。

六個人一路往前。

路程要有一定長度。

主要內容：

- 普通平台跳躍
- 高低差
- 窄平台
- 移動平台
- 小斷崖
- 部分掉落平台
- 小怪
- 簡單環境障礙

不需要複雜 puzzle。

---

## 6.2 小怪

小怪不是主要戰鬥。

主要負責干擾跑酷。

可以：

- 撞
- 衝
- 跳壓
- 壓扁玩家

---

## 6.3 L5 壓扁 / Death

玩家被壓扁：

- 仍然可以慢速移動。
- 隊友可以救。

但是：

如果壓扁超過 **3 秒**沒有被救：

> Death → 最近 Checkpoint 復活。

掉下懸崖：

> 直接 Death → 最近 Checkpoint 復活。

---

## 6.4 Checkpoint

整關約 3～4 個主要區段。

每段有清楚 Checkpoint。

Checkpoint 為**個人進度**。

玩家碰到 / 通過後更新自己的 respawn checkpoint。

死亡不影響其他玩家。

---

## 6.5 最後終點

不要做得像生日 Ending。

不要：

- 寶箱
- 盛大演出
- Birthday hint
- Fragment ⑤
- NPC 提示生日

六個人到達普通終點平台。

全部抵達後顯示：

> 所有冒險者已抵達。

然後：

> 【一起按住】

六人必須一起 Hold Interact **3 秒**。

完成瞬間：

- 不要 Victory。
- 不要 Level Clear 動畫。
- 不要煙火。
- 不要過場。

直接：

> **畫面純白。**

音樂瞬間停止。

要讓玩家以為：

> 「蛤？遊戲結束了？」  
> 「是不是壞掉？」

---

# 7. 白畫面 / Birthday Ending 銜接

白畫面維持完整約 **5 秒**。

前 5 秒不要出現任何文字。

5 秒後：

### 其他五名玩家畫面

> 系統好像漏掉了什麼。

### 只有 momoPlayer / 小桃畫面

> 啊……製作人做不下去了。  
> 沒想法了。

這段必須依 `momoToken / momoPlayer` 正確個人化。

- 其他玩家不能看到小桃專屬文字。
- 小桃也不要看到其他五人的版本。

短暫停頓後：

六人畫面重新進入同一條 Birthday Ending。

接下來沿用原本已定案 Ending：

> ……  
> ⚠️ DELIVERY ERROR  
> 有一份物品嚴重延遲。  
> 搜尋……  
> 收件人：小桃

然後：

- 小桃 target 鎖定。
- 小桃本人沒有「送出去」按鈕。
- 其他五個人各自看到：
  - `⭐【送出去】`
- 五人必須各自送出。
- 五顆星逐一飛向小桃。
- 五星合成。
- Party World。
- Fireworks。
- Cake。
- 前面 NPC。
- Birthday atmosphere。

主要文字：

> 🎂 HAPPY BELATED BIRTHDAY！  
> 小桃！

後續：

> 生日祝福傳送成功。  
> 延遲原因：製作人嚴重拖延。

保留原本隱藏成就：

> **《為了一句生日快樂，叫五個人陪妳闖了五關》**

不要替換這句。

原本已定案的額外搞笑內容可保留：

> 我們終於想起了一件重要的事……  
> 雖然好像有點晚了。  
> ……不是有點。

補償：

- 蛋糕 ×1
- 盟友 ×5
- 遲到的禮物 ×1
- 精神損失賠償 ×0

最後進 Party Room。

Party Room：

- 可以自由跑跳
- 碰撞
- Emote
- Fireworks
- Cake

不要強制離開房間。

---

# 8. 小桃判定

不要新增「生日主角選擇器」。

誰選擇「小桃」：

> 誰就是 momoPlayer。

`momoToken` 必須 server authoritative。

Reconnect 後必須保留。

Birthday Ending 的所有個人化畫面都以這個身份判定。

---

# 9. DEV TOOL 更新

保留並更新 Host DEV：

- Fill to 6 bots
- Bots follow host
- Teleport all to host
- Revive all
- Jump Level 1～5
- Grant fragments
- Ensure / simulate 小桃
- Direct Birthday Ending
- Reset Current Level
- RESET GAME

## Level 2 DEV

- 可協助完成目前 Cave
- 可查看 Reader / Executor assignment
- 可查看 current answer / true-fake validation
- 可快速測 Cave 1～5
- 可強制 Fail / Retry
- 可確認同一輪 Executor 不重複

## Level 3 DEV

- Cargo reset
- Cargo checkpoint
- 模擬 1～6 人推力
- 快速跳到 Final Slope

## Level 4 DEV

- Boss attack debug
- Flatten / Revive
- Mark / unmark player button completion
- Test 6/6 bridge opening

## Level 5 DEV

- Checkpoint teleport
- Flatten timer test
- Death / respawn test
- Jump to final hold
- Test momo / non-momo white-screen text

---

# 10. 多人同步 / Reconnect

所有新機制必須支援多人。

Server authoritative state 至少要涵蓋：

## Level 2

- current cave
- caveCleared
- readers
- executors
- executor order
- current leg
- current leg status
- answer authorization
- true/fake relation
- stone rule
- timer start timestamp
- gate state

## Level 3

- Cargo authoritative position/state
- obstacle state
- checkpoint / reset state
- final slope state

## Level 4

- Boss authoritative important state
- flattened state
- rescue state
- individual completion buttons
- bridge open / Boss drop state

## Level 5

- player checkpoint
- flattened / death state
- final arrival
- final hold state
- white-screen / Ending phase

Reconnect 不得破壞：

- momo identity
- Level progress
- Cave progress
- personal L4 completion
- L5 checkpoint
- Birthday Ending state

---

---

# 11. 美術資產 / Sprite 架構（後續正式美術換皮必須容易）

Build 0.4.1 目前仍可使用 placeholder 美術，但程式架構必須為後續正式美術做好準備。

## 11.1 美術與遊戲邏輯解耦

所有 placeholder 美術必須與以下系統解耦：

- gameplay logic
- collision / hitbox
- movement
- physics
- Socket.IO sync
- server authoritative state
- puzzle logic
- Boss logic
- checkpoint / respawn logic

不得把「圖片本身的尺寸」直接當成關鍵碰撞判定。

角色、Boss、小怪、Cargo、平台等應使用獨立 gameplay hitbox / collision data。

更換 PNG / WebP / Sprite Sheet 時，不應需要重寫 multiplayer 或 gameplay logic。

## 11.2 統一 Asset / Sprite 層

請建立清楚、集中管理的 Asset / Sprite 架構。

建議目錄概念：

```text
public/assets/
├─ characters/
│  ├─ chiikawa/
│  ├─ hachiware/
│  ├─ usagi/
│  ├─ momo/
│  ├─ kurimanju/
│  ├─ rakko/
│  ├─ shisa/
│  └─ furuhonya/
├─ boss/
├─ enemies/
├─ cargo/
├─ levels/
│  ├─ level1/
│  ├─ level2/
│  ├─ level3/
│  ├─ level4/
│  └─ level5/
├─ effects/
├─ ui/
└─ ending/
```

實際目錄可依現有專案架構合理調整，但必須保持：

- 集中
- 清楚
- 可替換
- 不與 gameplay logic 綁死

## 11.3 角色動畫介面預留

即使 Build 0.4.1 暫時沒有完整正式動畫，也請讓角色 renderer 能合理支援後續狀態，例如：

- idle
- run
- jump
- flattened
- emote

Boss 至少預留：

- idle
- attack
- jump / leap
- slam
- fall

小怪至少預留：

- idle
- move
- attack

目前可以使用 placeholder / fallback renderer。

不要因為正式 Sprite 尚未提供，就阻塞 Build 0.4.1 的 gameplay 完成。

## 11.4 Asset Manifest / Mapping

角色與物件不要在各關卡程式中散落 hard-coded image path。

請使用集中 mapping / manifest / asset registry 或等價方式管理，例如：

- character ID → sprite assets
- boss state → sprite asset
- enemy type → sprite asset
- level background → asset
- UI icon → asset

未來正式美術進場時，應能主要透過：

1. 放入新素材
2. 更新 asset mapping / manifest
3. 必要時調整 visual scale / anchor / animation timing

完成換皮。

不應需要重新修改核心 Socket.IO / collision / puzzle code。

## 11.5 Visual Size 與 Hitbox 分離

必須可以分別設定：

- visual width / height
- visual scale
- anchor / origin
- collision width / height
- collision offset

例如 Boss 圖片未來即使畫得很大，仍可維持經過平衡測試的合理碰撞範圍。

Cargo、角色、小怪同理。

## 11.6 Placeholder Fallback

如果正式圖片不存在：

- 遊戲仍必須正常啟動。
- 使用目前 Canvas placeholder / simple shape / fallback visual。
- 不得因 missing asset 讓整關 crash。

圖片載入失敗應有安全 fallback。

## 11.7 效能

未來會加入正式角色圖、背景、Boss、小怪與特效，因此現在就避免：

- 每 frame 重複建立 Image object
- 每 frame 重複載入 asset
- 無限制建立 particle / DOM element
- 因圖片動畫增加 Socket.IO 傳輸

Sprite animation 應為 client-side visual state。

不要同步 animation frame。

多人只同步真正需要的 gameplay state。

## 11.8 README

README 請新增簡短的：

`Art Asset Replacement Guide`

至少說明：

- assets 放哪裡
- character / Boss / enemy mapping 在哪裡
- 如何替換 placeholder
- visual size / hitbox 在哪裡調
- Sprite Sheet / animation state 如何接入（若已建立）
- 哪些檔案不要為了換圖而修改

目標：

> Build 0.4.1 完成後，下一階段正式美術應是「換皮 / 加動畫」，而不是重新拆遊戲架構。


# 12. 測試要求

修改完成後，不要只說「完成」。

請實際檢查 / 執行可以執行的 automated tests。

至少測：

1. Create Room
2. Join Room
3. 6 connections
4. duplicate character prevention
5. momo identity
6. reconnect
7. Reset Current Level
8. RESET GAME
9. L1 clear
10. L2 Cave 1～5
11. L2 four executors unique per round
12. L2 manual leg start
13. L2 timer only starts on first executor input
14. L2 Cave4/5 exactly-one-valid-answer rule
15. L2 failure reshuffle
16. L3 3-player normal push
17. L3 excessive-player acceleration
18. L3 cargo pit fail/reset
19. L3 final slope <5 rollback
20. L4 direct jump path possible
21. L4 Boss-jump timing path possible
22. L4 flatten/rescue
23. L4 individual button persistence
24. L4 6/6 bridge opening
25. L4 player falling with Boss respawns at finish
26. L5 checkpoint
27. L5 cliff death
28. L5 flattened >3 sec death
29. L5 rescue before 3 sec
30. L5 six-player 3 sec final hold
31. momo-specific white screen
32. non-momo white screen
33. Birthday Ending
34. five individual star sends
35. Party Room
36. DEV tools
37. reconnect during new level mechanics
38. no obvious high-frequency network spam regression

如果某些真實裝置測試無法自動驗證，例如：

- 真手機 touch feel
- 六個真人跨網路
- 真實 Wi-Fi / 5G reconnect

請明確列為：

> **需要人工驗證**

不要假裝測過。

---

# 13. 輸出要求

完成後請直接輸出：

1. 一個完整、可部署 Render 的 ZIP
2. README.md
3. CHANGELOG / 本次修改摘要
4. 測試結果
5. 已知限制 / 尚需人工驗證項目

ZIP 必須包含完整專案。

- 不要只給 patch。
- 不要只貼部分程式碼。
- 不要要求我自己合併檔案。

Render 必須能直接部署。

如果目前 package / Root Directory 結構可以簡化，可以整理，但不要破壞部署。

最後版本請標記為：

> **Build 0.4.1**

---

# 14. 最重要

這是一個已經定案的遊戲實作。

- 不要重新幫我設計 Level 2～5。
- 不要自行改規則。
- 不要為了省時間砍功能。
- 不要把多人功能改成單機假多人。
- 不要用 Coming Soon。
- 不要只做其中一關。

> **請先完整閱讀現有專案，再一次完成 Build 0.4.1。**
