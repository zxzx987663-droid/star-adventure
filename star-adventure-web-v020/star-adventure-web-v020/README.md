# 星星大冒險 — Full Alpha

**Build 0.4.0-alpha.1** · 基於上傳的 Build 0.3.2 · 繁體中文

完整包含 **Level 1～5、Birthday Ending、Party Room、房主 DEV、多人同步／重連**。使用可替換的 Canvas placeholder 美術，沒有 Coming Soon 關卡。

## 啟動

Node.js 20 以上。在 `package.json` 所在資料夾執行：

```bash
npm install
npm start
```

開啟 `http://localhost:3000`。不要直接打開 `public/index.html`。已附鎖定檔，也可用 `npm ci` 安裝。

## Render 設定

將 ZIP 內容放入 repository 的同一個根目錄，建立 **Node Web Service**；附帶的 `render.yaml` 也可用於 Blueprint。

| 設定 | 值 |
| --- | --- |
| Root Directory | `package.json` 所在資料夾；在 repo 根目錄就留空 |
| Build Command | `npm ci --omit=dev` |
| Start Command | `npm start` |
| Health Check Path | `/health` |
| 環境變數 | `NODE_ENV=production`；`ENABLE_DEV=true` |
| Instances | **1** |
| Port | 自動讀取 Render 的 `PORT` |

部署後 `/health` 應顯示 `0.4.0-alpha.1`。朋友使用同一個 HTTPS 網址與四碼房號加入。這是 Web Service，不是 Static Site。[Render 部署文件](https://render.com/docs/deploy-node-express-app)

**跨伺服器重啟保存進度：** 掛載持久磁碟 `/var/data`，設定 `SAVE_PATH=/var/data/star-adventure/rooms.json`。每五秒及重要轉場存檔。未配置持久儲存時，玩家重新整理可重連，但伺服器重啟會失去房間；此包不會替你建立付費資源。[持久磁碟文件](https://render.com/docs/disks)

## 操作與單人 DEV 測試

1. 建立房間，選角色；人數不足時按 **DEV · 補滿六位測試假人**，再開始。
2. PC：A/D 或方向鍵移動、Space 跳、E 互動／按住救援、Q 表情。手機用下方按鈕。
3. 每關完成後房主按「下一關」。第五關全員在寶箱旁按住【一起打開】三秒。
4. 角色小桃是唯一收件身分。小桃本人不會看到送星按鈕；其餘五位各自送星。DEV 假人會補齊測試分工。
5. 結束後留在 Party Room，自由跑跳、表情；製作人彩蛋在本機解鎖。

房主 DEV 提供：補假人、跟隨／自動互動、站壓板、集合／傳送、全員復活、跳 Level 1～5、四枚碎片、確保小桃、直接結局、配對協助。六真人測試請關閉自動協助；直接跳第五關時記得給四片。

## 重連與限制

- 原裝置的 localStorage 保存私密回房憑證；重新整理／斷線後自動回到原角色與當前關卡。請勿清除網站資料。
- 途中僅接受原玩家重連；新玩家需在開始前加入。房主斷線會移交給在線真人。同身分新分頁會接手舊分頁。
- 房間以在線冒險者判斷集合；小桃即使離線也不會被換掉。
- 美術／合成音效與關卡節奏仍是 Alpha。假人為 DEV 助手，會定位及完成部分分工，包含翹翹板平衡。
- 已驗證自動化桌機＋手機、多連線及完整通關；**尚未做真人遠端／真實手機鎖屏／Wi-Fi↔行動網路／六真人實機測試**。
- 不支援多伺服器 instance。未配置持久儲存時，不保證伺服器重啟後保留進度。

## 驗證與文件

```bash
npm test
```

**18 項機關／網路測試通過**；另通過一人＋假人全流程瀏覽器測試與桌機＋手機同房測試。詳細結果見 `docs/QA_REPORT.md`。

- `docs/OPERATIONS.md`：完整 Render、DEV 與瀏覽器測試指令。
- `docs/IMPLEMENTATION_MAP.md`：逐項對照 Master Spec 及 0.3.2 修正。
- `docs/ARTWORK.md`：替換角色動畫／背景。
- `STAR_ADVENTURE_MASTER_SPEC.md`：原始規格完整保留。

字型自託管：Noto Sans TC／Noto Emoji，SIL OFL 授權檔附在 `public/fonts/`。
