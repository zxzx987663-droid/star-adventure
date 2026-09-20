# 星星大冒險 · Build 0.4.1 QA Fix 1

版本：`0.4.1-qa-fix.1`。以完整 `star-adventure-build-0.4.1.zip` 原始碼原地修改，沿用 Express / Socket.IO / Canvas、房間、選角、身分、重連、生日 Ending 與 Party Room。**QA_FIX_FINAL.md > 0.4.1 Implementation FINAL > Master Spec**。這是完整專案，可整包取代，不需合併 patch。

本輪完成可關閉 Intro、compact HUD、L2 實體 Reader / E 輸入、L3 坡道運輸與 E 開路機關、L4 清晰 Boss 狀態機與個人按鈕、L5 三類固定敵人；L1 只補入簡單起步平台。未引入 Nintendo 關卡或資產。

## Render 部署

1. 將 ZIP 完整解壓，把專案根目錄內容放入 Git repository。`package.json`、`server.js`、`render.yaml` 必須在同一層。
2. Render 建立 **Web Service** 並連接該 repository，或以隨附 `render.yaml` 建立 Blueprint。不要選 Static Site。
3. 設定：Runtime `Node`；Build Command `npm ci --omit=dev`；Start Command `npm start`；Health Check `/health`；**單一 instance**。
4. `NODE_ENV=production`；`ENABLE_DEV=true` 供朋友 Alpha 測試。關閉 DEV 可改成 `false`；一般房主 Reset 仍可使用。
5. 等 `/health` 回傳 `version: "0.4.1-qa-fix.1"`，將 HTTPS 網址交給朋友。Socket.IO 與 HTTP 共用 Render 提供的 `PORT`，不用另開 WebSocket port。

Render 的部署入口是 repository，這份 ZIP 是完整 repository 內容，並非直接上傳 ZIP 的 Render 安裝器。部署步驟依 [Render Express 文件](https://render.com/docs/deploy-node-express-app)；WebSocket 設定依 [Render WebSockets 文件](https://render.com/docs/websocket)。

### 重连與伺服器重啟

- 同一服務仍在運作時，原瀏覽器會使用私有 resume key 自動回到原角色。房號、momoToken、關卡狀態與個人紀錄保留；離線位置不會被陌生玩家取代。
- 要跨伺服器重啟／重新部署保存房間，請在支援磁碟的 Render 方案掛載 `/var/data`，並設定 `SAVE_PATH=/var/data/rooms.json`。每 5 秒及重要操作存檔，關閉服務時再存一次。突然中止最多可能回到最近存檔。
- 未設 `SAVE_PATH` 時使用記憶體；未掛持久磁碟的檔案不能保證跨 Render 重啟保留。[Render Persistent Disks](https://render.com/docs/disks)
- 保持單一 instance；此版沒有 Redis 多 instance room adapter。
- 沿用 0.4.1 存檔時：L2 的分工／答案保留，L4 的個人完成與 L5 的個人檢查點／生存狀態保留；L3 因坡道與機關布局改變，首次升級從新版 L3 起點開始，已拿到的前關碎片及角色保留。更早、缺少完整關卡欄位的存檔會重新初始化當前關卡。新版自己的斷線／重啟則保留完整新版狀態。
- 身分儲存在原瀏覽器 localStorage；清除網站資料或改用另一裝置不會自動取得原角色。

## 本機執行

```bash
npm ci
npm start
```

開啟 `http://localhost:3000`。Node >= 20；本次測試環境 Node 24.19.0。

需要本機存檔時（bash）：

```bash
SAVE_PATH=./data/rooms.json npm start
```

## 開始遊戲

房主建立房間 → 分享四碼房號 → 六位各選不重複角色（其中一位選小桃）→ 開始。人數不足可由房主 DEV 補滿六位假人。假人是測試助手，可關閉跟隨與自動協助；正常六人玩法不依賴假人或 DEV。

- 電腦：A/D 或方向鍵移動、Space 跳、E 互動／按住救援、Q 表情。
- 手機：方向、跳躍與互動支援多指同按；窄螢幕互動鍵簡寫為「互動／救援」。控制列會停在下緣。每關首次進入，按 Intro 的 X 開始操作；介紹不會留在畫面下方。
- Level 1：三塊獨立壓板、遠端拉桿、第四人斷橋、全員集合拿碎片。
- Level 2：五洞各四棒。Reader 靠近自己的石碑按 E；答案與閱讀倒數同時出現，僅授權 Reader 可見，時間到整塊面板消失且不可重看。Executor 靠近固定符號逐次按 E，連續相同符號可原地重按。走／跳／站上不會輸入；第一個有效 E 才開始作答計時。Cave 4/5 任一 Reader 在自己石碑啟動，兩人同時獲得各自答案，依公開規則辨真假。
- Level 3：小坡教回滾 → 平台 E 開橋 → 上坡高台雙鎖 → 中途旗 → 下坡加速、提前開緩衝／接應橋 → 六人最後大坡。前段三人推正常，1–2 慢、4–6 危險；坡上放手會倒滾。最後六人穩定、五人慢、少於五人倒滾。貨物前段掉落回起點、中段掉落回中途旗、大坡失敗只回坡腳；個人掉落回個人旗子。被壓扁可慢走、隊友救援或約三秒自動站起，恢复後保護 0.5 秒。
- Level 4：Boss 固定戰區，衝刺前 0.55 秒警告、方向鎖定、0.85 秒恢復；短蹲後真正跳起並重擊，另有近身踩踏。跳過 BOSS 或等牠躍起後從下方通過。被壓扁可慢走；隊友按住 0.5 秒救援。每人到橋尾按 E，完成紀錄永久保留至本關 Reset；6/6 開橋，BOSS 掉落。
- Level 5：保留四段個人檢查點障礙賽，Patrol 固定巡邏／停下转頭、Hopper 固定節奏跳、Charger 近距警告後直衝／恢復；壓扁超過三秒回自己的檢查點。六人抵達普通終點平台後一起按住三秒。
- 結尾：五秒純白無字 → 分身分台詞 → DELIVERY ERROR → 五位夥伴分別送出星星 → 合併祝福 → Party Room。小桃不能替自己送星。

## Reset 與 DEV

**重置目前關卡**只清目前关卡狀態與該關碎片，保留前面關卡碎片、房間與角色。**RESET GAME**須再按一次確認，清空整場進度回選角大廳，保留房間及玩家身分。

房主 DEV 包含：補假人、跟隨／協助、全員傳送／復活、跳 Level 1–5、碎片、小桃、直接結局、重置本關；以及洞穴跳關／開始或完成當棒／強制失敗／完成／私有答案驗證、推手 0–6 人模擬／恢復真人推貨、貨物起點／中途檢查點／下坡／最後坡腳、BOSS 指定攻擊／逐人標記或取消／6/6、壓扁／死亡、L5 四個檢查點／終點集合、兩種白畫面台詞預覽。展開即時狀態可看壓扁秒數、救援進度與個人檢查點。

DEV 查看答案只回給提出要求的房主 socket。一般玩家收不到私有答案；`ENABLE_DEV=false` 時此入口由伺服器拒絕。

## Art Asset Replacement Guide

1. 圖片放在 `public/assets/characters/`、`boss/`、`enemies/`、`cargo/`、`levels/level1..5/`、`effects/`、`ui/`、`ending/`。
2. 在 `public/assets/manifest.json` 填入 `src`。角色 key 使用現有中文角色名；預設資料夾 `char1..char8` 依角色列表順序對應。BOSS key 是 `bridge`、怪物是 `patrol / hopper / charger`、貨物 `pink`。舊 `mushroom` 模板仍保留供素材整理。
3. `visual.width / height / scale / anchorX / anchorY` 只控制顯示。角色 `idle/run/jump/fall/flattened/down/emote/happy`；BOSS `chargeWarning/charge/recovery/crouch/leap/slam/stompWarning/stomp/fall`；Patrol `patrol/turn`、Hopper `crouch/jump/rest`、Charger `idle/warning/charge/recovery` 均可分開填圖。
4. 逐格動畫可填 `frames`、`fps`，或 `sheet: {frameWidth, frameHeight, columns, start, count}`。例如：

```json
{
  "src": "/assets/characters/char4/run.png",
  "fps": 10,
  "sheet": {"frameWidth": 64, "frameHeight": 80, "columns": 6, "start": 0, "count": 6},
  "visual": {"width": 64, "height": 80, "scale": 1, "anchorX": 0.5, "anchorY": 1}
}
```

5. `public/asset-registry.js` 管理圖片快取、Sprite sheet 與空圖／損壞圖 fallback。圖片尚未載入時也會使用 placeholder。
6. 碰撞資料另在 `public/geometry.js` 的 `hitboxes`；玩家與 BOSS 有寬高與 offset，貨物以 radius 定義，平台有高度與獨立世界座標。純換皮不需修改 hitbox。
7. 通常**不要修改** `engine.js`、`levels.js`、`server.js` 或 `public/shared.js`。`public/level-view.js` 與 `public/client.js` 的 Canvas fallback 是視覺層，若要改構圖才碰這兩個檔案。
8. 場景背景填 `backgrounds`；符號／NPC 的文字圖示可透過 `ui` 對應圖替換。複合的派對蛋糕／煙火由本機視覺層繪製，新增正式效果動畫只需擴充該視覺層，不影響 gameplay。

已移除原本 `/fonts/fonts.css` 與大量分片字體。現在只有約 92 KB 的中文子集與約 9 KB 的符號字體，採 `font-display: swap`，缺字回退到裝置字體；字體授權附在 `assets/ui/`。

## 驗證與文件

```bash
npm test
```

瀏覽器測試需另備 Playwright 與 Chromium（部署不需要）：

```bash
PLAYWRIGHT_MODULE=/absolute/path/to/playwright CHROMIUM_PATH=/absolute/path/to/chromium npm run test:browser
PLAYWRIGHT_MODULE=/absolute/path/to/playwright CHROMIUM_PATH=/absolute/path/to/chromium npm run test:assets-mobile
```

`TEST_RESULTS.md` 列實際結果、方法及規格 77 項逐項對照；`MANUAL_VERIFICATION_REQUIRED.md` 列真人／實機待驗；`CHANGELOG.md` 記錄變更；`qa/` 附原始輸出、JSON、截圖及修改前基準。

本機 Node 測試涵蓋完整 L1 → L5 → 五秒白幕 → 五人送星 → Birthday Ending → Party Room；六個獨立 Chromium context 驗证私有答案、手機互動、重連及結局。流程腳本使用測試位置安排，不等於六位真人自然通關。真人手感與真實 Wi-Fi/5G 重連未宣稱完成。

其他可重現測試：

```bash
npm run test:traffic
npm run test:visual
```

`test:visual` 同樣需 Playwright / Chromium 環境變數。`BASELINE_DIR=/absolute/original-project npm run test:traffic` 可比較原版；不提供時測當前版頻率即可。正式部署不需要 Python、Playwright、Chromium 或測試假人。

## 已知限制

- 美術仍為 placeholder，可獨立換 Sprite；真實六人語音與 Boss/Cargo 主觀難度待實玩。語音使用外部工具。
- DEV 假人可傳送協助，不等於真人平台 AI；驗證正式互動時關閉「自動協助」和「跟隨」。
- 單一 Node instance、記憶體房間；跨重啟保存必須另外配置持久磁碟及 SAVE_PATH。沒有多 instance adapter。
- 只有本機與瀏覽器模擬結果；尚未在本次使用者的 Render 網址上驗證，需部署後驗收 HTTPS、實機及真實網路。
- L3 舊布局無法原座標續玩，第一次升級的處理如上；新版的正常 reconnect 不會重置关卡。

## 維護者：這次改動的範圍

`levels.js` 局部更新 L2 action、Cargo/Boss/enemy 計算；`geometry.js` 定義静態布局與 visual pose；`shared.js` 保留跑速、跳速、重力，只更新平台、缺口與有高度的貨門碰撞。`server.js` 沿用原通道，E 加入 press/epoch 與按鍵邊沿驗证；`input`/`frame` 格式、room/resume 架構不重寫。正常 frame 20 Hz、stage 5 Hz；L2 重要 phase 改變才立即補發一次 stage，私有答案仍單播，計時與動畫在 client 本機繪製。

