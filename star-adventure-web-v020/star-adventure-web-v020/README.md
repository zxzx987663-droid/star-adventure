# 星星大冒險 · Build 0.4.1

完整可部署版本，以 `star-adventure-full-alpha-v040-alpha1.zip` 的 Express / Socket.IO / Canvas 架構增量實作。規格優先順序為 **0.4.1 FINAL Spec > Master Spec**。五關、Birthday Ending、Party Room、製作人彩蛋與 DEV 都包含在此版本，無需合併 patch。

## Render 部署

1. 將 ZIP 完整解壓，把專案根目錄內容放入 Git repository。`package.json`、`server.js`、`render.yaml` 必須在同一層。
2. Render 建立 **Web Service** 並連接該 repository，或以隨附 `render.yaml` 建立 Blueprint。不要選 Static Site。
3. 設定：Runtime `Node`；Build Command `npm ci --omit=dev`；Start Command `npm start`；Health Check `/health`；**單一 instance**。
4. `NODE_ENV=production`；`ENABLE_DEV=true` 供朋友 Alpha 測試。關閉 DEV 可改成 `false`；一般房主 Reset 仍可使用。
5. 等 `/health` 回傳 `version: "0.4.1"`，將 HTTPS 網址交給朋友。Socket.IO 與 HTTP 共用 Render 提供的 `PORT`，不用另開 WebSocket port。

Render 的部署入口是 repository，這份 ZIP 是完整 repository 內容，並非直接上傳 ZIP 的 Render 安裝器。部署步驟依 [Render Express 文件](https://render.com/docs/deploy-node-express-app)；WebSocket 設定依 [Render WebSockets 文件](https://render.com/docs/websocket)。

### 重连與伺服器重啟

- 同一服務仍在運作時，原瀏覽器會使用私有 resume key 自動回到原角色。房號、momoToken、關卡狀態與個人紀錄保留；離線位置不會被陌生玩家取代。
- 要跨伺服器重啟／重新部署保存房間，請在支援磁碟的 Render 方案掛載 `/var/data`，並設定 `SAVE_PATH=/var/data/rooms.json`。每 5 秒及重要操作存檔，關閉服務時再存一次。突然中止最多可能回到最近存檔。
- 未設 `SAVE_PATH` 時使用記憶體；未掛持久磁碟的檔案不能保證跨 Render 重啟保留。[Render Persistent Disks](https://render.com/docs/disks)
- 保持單一 instance；此版沒有 Redis 多 instance room adapter。
- 若沿用 0.4.0 的存檔，角色、房間與碎片會保留；正在玩的舊版 Level 2–5 會從該關新版起點開始，因為關卡狀態結構已由 FINAL Spec 取代。
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
- 手機：方向、跳躍與互動可以多指同時按；橫向畫面可往下捲到遊戲視窗，控制列會停留在下緣。
- Level 1：三塊獨立壓板、遠端拉桿、第四人斷橋、全員集合拿碎片。
- Level 2：五座洞穴各四棒。讀題者每棒手動按開始，執行者踩實體符號；跳過不需要的符號，連續同符號須離開後再踩入。第四、五洞依公開規則比較兩位讀題者的答案。
- Level 3：三人運貨／三人先開路；橋、門、風扇各有開路壓板。最後大坡要六人一起推。主路陷阱重置本關，大坡失敗只回坡腳。
- Level 4：跳過 BOSS 或等待牠躍起後從下方通過。被壓扁可慢走；隊友按住 0.5 秒救援。每人到橋尾按 E，完成紀錄永久保留至本關 Reset；6/6 開橋，BOSS 掉落。
- Level 5：四段個人檢查點障礙賽；壓扁超過三秒回自己的檢查點。六人抵達普通終點平台後一起按住三秒。
- 結尾：五秒純白無字 → 分身分台詞 → DELIVERY ERROR → 五位夥伴分別送出星星 → 合併祝福 → Party Room。小桃不能替自己送星。

## Reset 與 DEV

**重置目前關卡**只清目前关卡狀態與該關碎片，保留前面關卡碎片、房間與角色。**RESET GAME**須再按一次確認，清空整場進度回選角大廳，保留房間及玩家身分。

房主 DEV 包含：補假人、跟隨／協助、全員傳送／復活、跳 Level 1–5、碎片、小桃、直接結局、重置本關；以及洞穴跳關／強制失敗／完成／私有答案驗證、推手 0–6 人模擬／恢復真人推貨、貨物起點／坡腳、BOSS 指定攻擊／逐人標記或取消／6/6、壓扁／死亡、L5 四個檢查點／終點集合、兩種白畫面台詞預覽。展開即時狀態可看壓扁秒數、救援進度與個人檢查點。

DEV 查看答案只回給提出要求的房主 socket。一般玩家收不到私有答案；`ENABLE_DEV=false` 時此入口由伺服器拒絕。

## Art Asset Replacement Guide

1. 圖片放在 `public/assets/characters/`、`boss/`、`enemies/`、`cargo/`、`levels/level1..5/`、`effects/`、`ui/`、`ending/`。
2. 在 `public/assets/manifest.json` 填入 `src`。角色 key 使用現有中文角色名；預設資料夾 `char1..char8` 依角色列表順序對應。BOSS key 是 `bridge`、怪物 `mushroom`、貨物 `pink`。
3. `visual.width / height / scale / anchorX / anchorY` 只控制顯示。角色 `idle/run/jump/fall/flattened/down/emote/happy`；BOSS `crouch/leap/slamWarning/slam/chargeWarning/charge/fall`；怪物 `move/warning/charge/jump/slam` 均可分開填圖。
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

已移除原本 `/fonts/fonts.css` 與大量分片字體。現在只有約 88 KB 的中文子集與約 9 KB 的符號字體，採 `font-display: swap`，缺字回退到裝置字體；字體授權附在 `assets/ui/`。

## 驗證與文件

```bash
npm test
```

瀏覽器測試需另備 Playwright 與 Chromium（部署不需要）：

```bash
PLAYWRIGHT_MODULE=/absolute/path/to/playwright CHROMIUM_PATH=/absolute/path/to/chromium npm run test:browser
PLAYWRIGHT_MODULE=/absolute/path/to/playwright CHROMIUM_PATH=/absolute/path/to/chromium npm run test:assets-mobile
```

`TEST_RESULTS.md` 列出實際結果與測試方法；`MANUAL_TEST_CHECKLIST.md` 列出真人／實機待驗；`CHANGELOG.md` 記錄變更；`qa/` 附原始測試輸出、JSON 與畫面截圖。尚未在使用者的 Render 帳號實際發佈。
