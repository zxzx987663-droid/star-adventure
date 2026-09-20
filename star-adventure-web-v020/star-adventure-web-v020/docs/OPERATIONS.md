# 操作與部署完整指南

**Build `0.4.0-alpha.1`** · 基於上傳的 Web Build 0.3.2 · 繁體中文

包含 **Level 1～5、Birthday Ending、Party Room、房主 DEV 工具、多人同步與重連**。所有關卡都有可操作的機關；第一版使用可替換的 Canvas placeholder 美術。

> 給製作人：後半段說明含結局資訊，請不要把 README 當成玩家的遊戲說明。

## 本機啟動

需要 Node.js 20 以上（本次在 Node.js 24 驗證）。解壓縮後，在 `package.json` 所在資料夾執行：

```bash
npm install
npm start
```

開啟 `http://localhost:3000`。不要直接用檔案總管打開 `public/index.html`，多人伺服器必須運行。

已包含 `package-lock.json`；固定版本安裝也可用 `npm ci`。

## 部署到 Render

這是 **Node Web Service**，不是 Static Site。ZIP 內的 `package.json`、`server.js`、`public/` 位於同一個專案根目錄。

1. 將解壓縮後的內容放入要部署的 Git repository，確認沒有多包一層資料夾。
2. Render 建立／更新 Web Service，連接該 repository。
3. 使用以下設定，或用附帶的 `render.yaml` 建立 Blueprint。

| 設定 | 值 |
| --- | --- |
| Runtime / Language | Node |
| Root Directory | `package.json` 所在資料夾；若檔案就在 repository 根目錄，留空 |
| Build Command | `npm ci --omit=dev` |
| Start Command | `npm start` |
| Health Check Path | `/health` |
| `NODE_ENV` | `production` |
| `ENABLE_DEV` | `true`；正式聚會要隱藏工具可改 `false` |
| Instances | **1**，這一版不使用多實例共享資料庫 |
| Port | 使用 Render 提供的 `PORT`，程式會自動讀取 |

部署後，開啟網站的 `/health`，應看到版本 `0.4.0-alpha.1`。朋友使用同一個 HTTPS 網址，以四碼房號加入。

Render 的 Node 部署及 WebSocket 設定參照：[Express 部署文件](https://render.com/docs/deploy-node-express-app)、[WebSockets 文件](https://render.com/docs/websocket)。

### 避免重啟後丟失進度

玩家短暫斷線、重新整理、切回瀏覽器時，只要伺服器仍在運行，會用原裝置的 localStorage 憑證回到原角色與當前關卡。小桃身分不會重新抽選。

若也要跨**伺服器重啟／重新部署**恢復房間，請設定：

```text
SAVE_PATH=/var/data/star-adventure/rooms.json
```

並在 Render 掛載持久磁碟 `/var/data`。程式每五秒、重要轉場、正常關閉時寫入快照；異常中止最多可能退回最近一次快照。本機也能把 `SAVE_PATH` 設成可寫入的檔案路徑。

未設定持久儲存時，伺服器重啟會失去房間。Render 預設檔案系統不保留部署／重啟後的變更，持久磁碟的供應與限制請見 [Persistent Disks](https://render.com/docs/disks)。本包不會替你建立付費資源。

## 遊玩

- 建立房間 → 選角 → 分享房號 → 朋友加入並選角 → 房主開始。
- 角色能力相同、不可重複。小桃的選角身分就是唯一指定身分，沒有第二個選擇器。
- PC：A/D 或方向鍵移動，Space 跳躍，E 互動，Q 表情。
- 手機：下方方向／跳躍／互動／表情鍵；可以同時按方向與跳躍。
- 倒下約三秒復活，無命數限制；隊友在旁按住互動約兩秒可提前救起。
- 全員集合以在線冒險者（含假人）為準；離線真人的位置／角色保留供重連。
- 途中只接受原玩家重連，新玩家需在開始前入房。離線房主會自動移交給在線真人。
- 同一身分同時開第二個分頁時，新分頁接手，舊分頁停止操作。請勿清除瀏覽器網站資料，否則會失去回房憑證。

## 一人測試完整遊戲

1. 建立房間，選一個角色。
2. 按 **DEV · 補滿六位測試假人**，再開始冒險。
3. 假人會站壓板、跟隨／集合、協助配對謎題、平衡翹翹板、搬彈與誘敵；玩家仍可實際走路、推貨物、開砲、開箱。
4. 每關清除後，房主按「下一關」。第五關在寶箱旁按住【一起打開】三秒；假人會一起按住。
5. 如果你選小桃，結局不會出現送星按鈕；其他五顆星由測試假人送出。如果你選其他角色，自己仍須按【送出去】。

| 房主 DEV 控制 | 功能 |
| --- | --- |
| 補滿假人 | 補到六位，不產生重複角色 |
| 假人自動互動／配對協助 | 開關自動解謎、平衡、運彈、開箱／送星輔助 |
| 假人跟隨／分工 | 開關假人移動；便於手動佈置機關 |
| 全員到我身邊 | 傳送真人與假人至房主位置 |
| 全員復活 | 清除倒下狀態並回各自檢查點 |
| 跳 Level 1～5 | 直接建立該關的初始狀態 |
| 給四枚碎片 | 用於直接測試第五關插槽與開箱 |
| 確保小桃 | 使用空位／測試假人補足小桃；不搶走真人角色 |
| 直接測結局 | 從完整黑畫面揭露開始，保留五顆星的個別傳送 |
| 假人站壓板 | 將前三個假人放到本關各自壓板 |
| 完成配對謎題 | 決定性完成第二關／第五關配對，方便測試後續 |
| 全員到集合點 | 傳送到本關集合區；不會略過尚未解完的機關 |
| 前往檢查點 | 房主快速前往該關測試檢查點 |

DEV 在伺服器端也驗證房主身分。六真人正常玩時，關閉自動協助即可測試原本的六人合作機關。

## 測試與檔案

```bash
npm test
```

涵蓋獨立壓板、橋第四人、移動平台、配對答案／BOING、貨物／翹翹板／風扇、三砲條件、救援、全員開箱、五顆星、DEV 權限、六個 Socket.IO 連線、身分保留及存檔恢復。

瀏覽器流程測試另需 Playwright（部署不需要）：

```bash
npm install --no-save playwright
npx playwright install chromium
npm run test:browser
```

`test/browser.cjs` 是「一人＋假人」實際輸入通關測試；`test/browser-multiplayer.cjs` 檢查桌機＋手機同房、小桃重連與目標畫面。詳細結果與未驗證項目見 `docs/QA_REPORT.md`。

| 檔案 | 用途 |
| --- | --- |
| `server.js` | Express／Socket.IO、房間、憑證、快照、持久化 |
| `engine.js` | 五關規則、BOSS、結局、假人、DEV |
| `public/shared.js` | 桌機／手機／伺服器共用物理與世界座標 |
| `public/client.js` | 本地預測、遠端插值、畫面與操作 |
| `public/assets/manifest.json` | 可替換角色動畫、背景；說明見 `docs/ARTWORK.md` |
| `STAR_ADVENTURE_MASTER_SPEC.md` | 原始已定案規格，完整附上 |
| `docs/IMPLEMENTATION_MAP.md` | 規格對照與相對 0.3.2 的修正 |

## Alpha 限制

- 美術為 placeholder，音樂為簡易合成音；尚未做最終角色原畫／動畫與音樂製作。
- 假人是明確的 DEV 測試助手，會定位和自動完成部分分工，不是正式 AI 隊友。
- 關卡長度與難度尚未經六位真人調整；規格中的各關預估分鐘數不是已達成的實測時長。
- 已用自動化瀏覽器和多連線測試，但沒有真人遠端測試者參與；真實 iOS／Android 鎖屏、跨電信網路與六真人聚會仍需部署後確認。
- 不支援多個伺服器 instance；未配置 `SAVE_PATH` 與持久磁碟時，不保證跨伺服器重啟保留進度。
