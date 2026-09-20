# QA / Automated Test Results — Build 0.4.1 QA Fix 1

版本 `0.4.1-qa-fix.1`；Node `v24.19.0`；本機伺服器與 headless Chromium。報告日期：2026-09-20。

## 結果

- 修改前基準：原版 **29/29 通過**；原版六瀏覽器結局測試通過。原始記錄為 `qa/baseline-tests.txt`、`qa/baseline-browser-results.json`，物理／架構分析在 `qa/ARCHITECTURE_BASELINE.md`。
- 修改後：**43/43 Node tests 通過，0 failure／0 skipped**。`qa/automated-tests.txt` 是最終完整輸出。
- 六個獨立 Chromium context：Reader 私有 UI、雙 Reader、手機四次同符號 E、momo reload、六人終點、純白、五人分別送星、生日、Party 與 Reset 全通過；無 page error／HTTP error。
- 多點觸控模擬：方向＋跳躍同時按、放開清除；素材更換／損壞 fallback／圖片快取與 hitbox 解耦通過，測試時約 60 FPS（不是實機效能保證）。
- 390×844、844×390、1280×850：沒有頁面水平溢出；HUD 與 Reader 面板留在 viewport；面板不蓋住符號高度；關卡下方無敘述。
- 純正式依賴啟動：見 `qa/deployment-smoke.json`；使用 `npm ci --omit=dev`，HTTP／WebSocket、資產／字體、版本及 `ENABLE_DEV=false` 權限檢查。

六瀏覽器測試實測白幕約 **5.165 秒**。詳見 `qa/browser-results.json`、`qa/browser-extra-results.json`、`qa/visual-qa.json`。

## 測試方法與可解讀範圍

`npm test` 使用真實 engine 的 25ms 步進。L2 測了 5×4 棒、5,000 組真假生成與閱讀／首輸入計時；L3 測三個實際玩家 input 推過起步斜坡及全路貨物運送、每段路線的真實跳躍；Boss 兩條路線各測三個起始偏移，另用連續 45 秒座標檢查無瞬移／越界；L5 全缺口在四個移動平台相位測實際可達性。

完整順序流程不用 DEV 切換各關，以 G.interact 正常推進、各關完成條件與 ending tick 跑到底；會用測試 fixture 安排角色位置（如壓板、可達開關、Boss 按鈕、終點），不是六個 AI 自主走過每一步。L3 的 route team 先按實體機關，之後三個真實 player input 推完整段，最後六人輸入共同上坡。平台路徑與 Boss 突破另有獨立物理測試。

Browser 測試使用 DEV 切到各區段，然後以真實鍵盤／pointer 事件驗證 Reader、四次重複符號、hold、送星、Reset；也重新載入小桃分頁驗證身分。Socket.IO tests 使用六個獨立連線而非假人，驗證授權、重連、私有 payload、長按／重送／舊 epoch 防重複。磁碟恢復測試涵蓋新版存檔与原版升級。

原本測試中「踩踏答題／三組自動壓板／Boss 8 秒 sine 週期」的預期已依 QA FINAL 替換；原 L1 測試保留。初期測試找出的 Boss 直接跳越矩形碰撞過窄、手機 viewport 橫溢、測試 fixture 隨機 Reader 恰好出生在石碑旁、Playwright selector 命中兩個互動鍵均已修正。此報告只引用最後通過的結果。

## 封包比較

六個獨立 WebSocket client，各關穩定期取 1.5 秒左右；下表為每位 client 接收的 JSON payload，未計 TLS/WebSocket 額外位元組。短時間抽樣會受 5 Hz 相位差一包影響。

| 關卡 | 原版 bytes/s | 新版 bytes/s | 新／舊比例 |
|---|---:|---:|---:|
| L2 | 23595 | 24328 | 1.031 |
| L3 | 22641 | 22491 | 0.993 |
| L4 | 21858 | 21827 | 0.999 |
| L5 | 21576 | 23314 | 1.081 |

frame 維持 20 Hz、stage 維持 5 Hz，沒有把動畫逐幀送出。L2 phase 改變立即補一次必要 stage，private clue 只在內容變動時單播。穩定期樣本沒有多餘 clue 廣播；不是長時間壓力測試或真實 WAN bandwidth 保證。

## QA FIX FINAL 77 項對照

「通過」指下面列明的自動／脚本驗證；「實玩待驗」另標主觀與真機部分。不能把 77 個規格項目讀成 77 個獨立自動測試，也不能視為真人 QA 已完成。

| # | 規格項目 | 本次結果 | 證據／方法 |
|---:|---|---|---|
| 1 | Create Room | 自動／腳本通過 | network.test.js／mechanics.test.js：六個 Socket.IO client、權限、身分、重連、Reset |
| 2 | Join Room | 自動／腳本通過 | network.test.js／mechanics.test.js：六個 Socket.IO client、權限、身分、重連、Reset |
| 3 | six simultaneous connections / bots | 自動／腳本通過 | network.test.js／mechanics.test.js：六個 Socket.IO client、權限、身分、重連、Reset |
| 4 | duplicate character prevention | 自動／腳本通過 | network.test.js／mechanics.test.js：六個 Socket.IO client、權限、身分、重連、Reset |
| 5 | momo identity | 自動／腳本通過 | network.test.js／mechanics.test.js：六個 Socket.IO client、權限、身分、重連、Reset |
| 6 | reconnect | 自動／腳本通過 | network.test.js／mechanics.test.js：六個 Socket.IO client、權限、身分、重連、Reset |
| 7 | Reset Current Level | 自動／腳本通過 | network.test.js／mechanics.test.js：六個 Socket.IO client、權限、身分、重連、Reset |
| 8 | RESET GAME | 自動／腳本通過 | network.test.js／mechanics.test.js：六個 Socket.IO client、權限、身分、重連、Reset |
| 9 | Level Intro Modal appears correctly | 自動／腳本通過 | browser.cjs＋visual-qa.cjs：Intro/X、無常駐敘述、三尺寸 DOM 邊界／截圖 |
| 10 | Intro X closes and does not leave permanent description panel | 自動／腳本通過 | browser.cjs＋visual-qa.cjs：Intro/X、無常駐敘述、三尺寸 DOM 邊界／截圖 |
| 11 | PC + mobile HUD responsive | 腳本通過；實玩／實機待驗 | browser.cjs＋visual-qa.cjs：Intro/X、無常駐敘述、三尺寸 DOM 邊界／截圖 |
| 12 | Level 1 complete | 自動／腳本通過 | l1.test.js＋qa-fix.test.js：壓板／拉桿／第四人斷橋／掉落／集合 |
| 13 | falling / respawn still works | 自動／腳本通過 | l1.test.js＋qa-fix.test.js：壓板／拉桿／第四人斷橋／掉落／集合 |
| 14 | cooperation gate still works | 自動／腳本通過 | l1.test.js＋qa-fix.test.js：壓板／拉桿／第四人斷橋／掉落／集合 |
| 15 | bridge comedy event still works | 自動／腳本通過 | l1.test.js＋qa-fix.test.js：壓板／拉桿／第四人斷橋／掉落／集合 |
| 16 | Cave 1–5 clear | 自動／腳本通過 | mechanics.test.js＋qa-fix.test.js：20 棒、實體 E、真假與時間鎖；network.test.js 私有封包；browser.cjs 實際 UI |
| 17 | four Executors unique per attempt | 自動／腳本通過 | mechanics.test.js＋qa-fix.test.js：20 棒、實體 E、真假與時間鎖；network.test.js 私有封包；browser.cjs 實際 UI |
| 18 | only authorized Reader can activate Reader stone | 自動／腳本通過 | mechanics.test.js＋qa-fix.test.js：20 棒、實體 E、真假與時間鎖；network.test.js 私有封包；browser.cjs 實際 UI |
| 19 | non-Reader E on stone does nothing | 自動／腳本通過 | mechanics.test.js＋qa-fix.test.js：20 棒、實體 E、真假與時間鎖；network.test.js 私有封包；browser.cjs 實際 UI |
| 20 | Reader answer visible only to Reader | 自動／腳本通過 | mechanics.test.js＋qa-fix.test.js：20 棒、實體 E、真假與時間鎖；network.test.js 私有封包；browser.cjs 實際 UI |
| 21 | Reader answer + countdown begin simultaneously | 自動／腳本通過 | mechanics.test.js＋qa-fix.test.js：20 棒、實體 E、真假與時間鎖；network.test.js 私有封包；browser.cjs 實際 UI |
| 22 | answer disappears and cannot be reopened | 自動／腳本通過 | mechanics.test.js＋qa-fix.test.js：20 棒、實體 E、真假與時間鎖；network.test.js 私有封包；browser.cjs 實際 UI |
| 23 | other players never receive / render private answer | 自動／腳本通過 | mechanics.test.js＋qa-fix.test.js：20 棒、實體 E、真假與時間鎖；network.test.js 私有封包；browser.cjs 實際 UI |
| 24 | Executor symbol does NOT trigger by walking / jumping / collision | 自動／腳本通過 | mechanics.test.js＋qa-fix.test.js：20 棒、實體 E、真假與時間鎖；network.test.js 私有封包；browser.cjs 實際 UI |
| 25 | E / mobile interact submits symbol | 自動／腳本通過 | mechanics.test.js＋qa-fix.test.js：20 棒、實體 E、真假與時間鎖；network.test.js 私有封包；browser.cjs 實際 UI |
| 26 | Executor timer starts only on first valid symbol input | 自動／腳本通過 | mechanics.test.js＋qa-fix.test.js：20 棒、實體 E、真假與時間鎖；network.test.js 私有封包；browser.cjs 實際 UI |
| 27 | failure reshuffles current Cave only | 自動／腳本通過 | mechanics.test.js＋qa-fix.test.js：20 棒、實體 E、真假與時間鎖；network.test.js 私有封包；browser.cjs 實際 UI |
| 28 | Cave 4/5 both Readers receive private answers simultaneously | 自動／腳本通過 | mechanics.test.js＋qa-fix.test.js：20 棒、實體 E、真假與時間鎖；network.test.js 私有封包；browser.cjs 實際 UI |
| 29 | Cave 4/5 exactly one sequence satisfies rule | 自動／腳本通過 | mechanics.test.js＋qa-fix.test.js：20 棒、實體 E、真假與時間鎖；network.test.js 私有封包；browser.cjs 實際 UI |
| 30 | true Reader can change between legs | 自動／腳本通過 | mechanics.test.js＋qa-fix.test.js：20 棒、實體 E、真假與時間鎖；network.test.js 私有封包；browser.cjs 實際 UI |
| 31 | 3-player push = intended controlled speed | 自動／腳本通過 | mechanics.test.js＋qa-fix.test.js：真實三人輸入、1–6 推手、坡度、E 機關、存點、壓扁／救援／自起／最终坡 |
| 32 | 1–2 players = slow | 自動／腳本通過 | mechanics.test.js＋qa-fix.test.js：真實三人輸入、1–6 推手、坡度、E 機關、存點、壓扁／救援／自起／最终坡 |
| 33 | 4–6 players = dangerous acceleration | 自動／腳本通過 | mechanics.test.js＋qa-fix.test.js：真實三人輸入、1–6 推手、坡度、E 機關、存點、壓扁／救援／自起／最终坡 |
| 34 | Cargo rolls backward when unsupported on uphill | 自動／腳本通過 | mechanics.test.js＋qa-fix.test.js：真實三人輸入、1–6 推手、坡度、E 機關、存點、壓扁／救援／自起／最终坡 |
| 35 | deliberate route mechanism requires E | 自動／腳本通過 | mechanics.test.js＋qa-fix.test.js：真實三人輸入、1–6 推手、坡度、E 機關、存點、壓扁／救援／自起／最终坡 |
| 36 | proximity alone does not open mechanism | 自動／腳本通過 | mechanics.test.js＋qa-fix.test.js：真實三人輸入、1–6 推手、坡度、E 機關、存點、壓扁／救援／自起／最终坡 |
| 37 | Cargo / player major fall behavior correct | 自動／腳本通過 | mechanics.test.js＋qa-fix.test.js：真實三人輸入、1–6 推手、坡度、E 機關、存點、壓扁／救援／自起／最终坡 |
| 38 | nearest checkpoint respawn | 自動／腳本通過 | mechanics.test.js＋qa-fix.test.js：真實三人輸入、1–6 推手、坡度、E 機關、存點、壓扁／救援／自起／最终坡 |
| 39 | flattened player slow movement | 自動／腳本通過 | mechanics.test.js＋qa-fix.test.js：真實三人輸入、1–6 推手、坡度、E 機關、存點、壓扁／救援／自起／最终坡 |
| 40 | teammate rescue | 自動／腳本通過 | mechanics.test.js＋qa-fix.test.js：真實三人輸入、1–6 推手、坡度、E 機關、存點、壓扁／救援／自起／最终坡 |
| 41 | auto recovery after ~3 sec | 自動／腳本通過 | mechanics.test.js＋qa-fix.test.js：真實三人輸入、1–6 推手、坡度、E 機關、存點、壓扁／救援／自起／最终坡 |
| 42 | downhill Cargo acceleration is predictable | 自動／腳本通過 | mechanics.test.js＋qa-fix.test.js：真實三人輸入、1–6 推手、坡度、E 機關、存點、壓扁／救援／自起／最终坡 |
| 43 | final slope: 6 stable | 自動／腳本通過 | mechanics.test.js＋qa-fix.test.js：真實三人輸入、1–6 推手、坡度、E 機關、存點、壓扁／救援／自起／最终坡 |
| 44 | final slope: 5 barely moves / maintains | 自動／腳本通過 | mechanics.test.js＋qa-fix.test.js：真實三人輸入、1–6 推手、坡度、E 機關、存點、壓扁／救援／自起／最终坡 |
| 45 | final slope: <5 rolls backward | 自動／腳本通過 | mechanics.test.js＋qa-fix.test.js：真實三人輸入、1–6 推手、坡度、E 機關、存點、壓扁／救援／自起／最终坡 |
| 46 | final slope failure resets only final section | 自動／腳本通過 | mechanics.test.js＋qa-fix.test.js：真實三人輸入、1–6 推手、坡度、E 機關、存點、壓扁／救援／自起／最终坡 |
| 47 | bridge route visually / mechanically clear | 腳本通過；實玩／實機待驗 | qa-fix.test.js＋mechanics.test.js：FSM 連續座標、跳越／下穿、個人按鈕、完成保留、6/6 與終點復活 |
| 48 | Boss Charge telegraph → attack → recovery works | 自動／腳本通過 | qa-fix.test.js＋mechanics.test.js：FSM 連續座標、跳越／下穿、個人按鈕、完成保留、6/6 與終點復活 |
| 49 | Boss Jump / Slam works | 自動／腳本通過 | qa-fix.test.js＋mechanics.test.js：FSM 連續座標、跳越／下穿、個人按鈕、完成保留、6/6 與終點復活 |
| 50 | Boss does not jitter / teleport / float / instant-turn during attack | 腳本通過；實玩／實機待驗 | qa-fix.test.js＋mechanics.test.js：FSM 連續座標、跳越／下穿、個人按鈕、完成保留、6/6 與終點復活 |
| 51 | direct jump route is possible but non-trivial | 腳本通過；實玩／實機待驗 | qa-fix.test.js＋mechanics.test.js：FSM 連續座標、跳越／下穿、個人按鈕、完成保留、6/6 與終點復活 |
| 52 | Boss-airborne timing route is possible | 腳本通過；實玩／實機待驗 | qa-fix.test.js＋mechanics.test.js：FSM 連續座標、跳越／下穿、個人按鈕、完成保留、6/6 與終點復活 |
| 53 | Boss hit → flattened | 自動／腳本通過 | qa-fix.test.js＋mechanics.test.js：FSM 連續座標、跳越／下穿、個人按鈕、完成保留、6/6 與終點復活 |
| 54 | rescue works | 自動／腳本通過 | qa-fix.test.js＋mechanics.test.js：FSM 連續座標、跳越／下穿、個人按鈕、完成保留、6/6 與終點復活 |
| 55 | individual Finish Button requires E | 自動／腳本通過 | qa-fix.test.js＋mechanics.test.js：FSM 連續座標、跳越／下穿、個人按鈕、完成保留、6/6 與終點復活 |
| 56 | completion persists after returning to Boss zone | 自動／腳本通過 | qa-fix.test.js＋mechanics.test.js：FSM 連續座標、跳越／下穿、個人按鈕、完成保留、6/6 與終點復活 |
| 57 | 6/6 opens bridge / drops Boss | 自動／腳本通過 | qa-fix.test.js＋mechanics.test.js：FSM 連續座標、跳越／下穿、個人按鈕、完成保留、6/6 與終點復活 |
| 58 | completed player falling with Boss respawns Finish Side | 自動／腳本通過 | qa-fix.test.js＋mechanics.test.js：FSM 連續座標、跳越／下穿、個人按鈕、完成保留、6/6 與終點復活 |
| 59 | checkpoints | 自動／腳本通過 | mechanics.test.js＋qa-fix.test.js：四檢查點、個人死亡、救援、固定三種 AI、四相位缺口跳躍 |
| 60 | cliff death | 自動／腳本通過 | mechanics.test.js＋qa-fix.test.js：四檢查點、個人死亡、救援、固定三種 AI、四相位缺口跳躍 |
| 61 | flatten >3 sec → death | 自動／腳本通過 | mechanics.test.js＋qa-fix.test.js：四檢查點、個人死亡、救援、固定三種 AI、四相位缺口跳躍 |
| 62 | rescue before 3 sec | 自動／腳本通過 | mechanics.test.js＋qa-fix.test.js：四檢查點、個人死亡、救援、固定三種 AI、四相位缺口跳躍 |
| 63 | Patrol enemy predictable | 自動／腳本通過 | mechanics.test.js＋qa-fix.test.js：四檢查點、個人死亡、救援、固定三種 AI、四相位缺口跳躍 |
| 64 | Hopper predictable | 自動／腳本通過 | mechanics.test.js＋qa-fix.test.js：四檢查點、個人死亡、救援、固定三種 AI、四相位缺口跳躍 |
| 65 | Charger telegraph / charge / recovery predictable | 自動／腳本通過 | mechanics.test.js＋qa-fix.test.js：四檢查點、個人死亡、救援、固定三種 AI、四相位缺口跳躍 |
| 66 | no obvious enemy wall jitter / weird drifting | 腳本通過；實玩／實機待驗 | mechanics.test.js＋qa-fix.test.js：四檢查點、個人死亡、救援、固定三種 AI、四相位缺口跳躍 |
| 67 | six-player final hold 3 sec | 自動／腳本通過 | mechanics.test.js＋browser.cjs：六人 hold、白幕分身分、五個送星、Birthday／Party |
| 68 | momo-specific white screen | 自動／腳本通過 | mechanics.test.js＋browser.cjs：六人 hold、白幕分身分、五個送星、Birthday／Party |
| 69 | non-momo white screen | 自動／腳本通過 | mechanics.test.js＋browser.cjs：六人 hold、白幕分身分、五個送星、Birthday／Party |
| 70 | Birthday Ending | 自動／腳本通過 | mechanics.test.js＋browser.cjs：六人 hold、白幕分身分、五個送星、Birthday／Party |
| 71 | five individual star sends | 自動／腳本通過 | mechanics.test.js＋browser.cjs：六人 hold、白幕分身分、五個送星、Birthday／Party |
| 72 | Party Room | 自動／腳本通過 | mechanics.test.js＋browser.cjs：六人 hold、白幕分身分、五個送星、Birthday／Party |
| 73 | reconnect during new mechanics | 腳本通過；實玩／實機待驗 | network.test.js：L2/3/4/5 機制中斷線回房、Ending、磁碟重啟；browser.cjs：小桃 reload |
| 74 | no obvious high-frequency Socket.IO spam regression | 腳本通過；實玩／實機待驗 | traffic.cjs／network-traffic.json：原版對比 20 Hz frame、5 Hz stage、內容變動才發 clue |
| 75 | no duplicated interaction events from holding / spamming E | 自動／腳本通過 | network.test.js：長按偽造新 press、重送 press、舊 epoch 全拒絕；browser.cjs：四次手機 tap 有效 |
| 76 | private Reader answer is not accidentally broadcast to unauthorized clients | 自動／腳本通過 | network.test.js＋browser.cjs：非 Reader 不收答案／不顯示，publicStage 無 _legs，過期重連不能重看 |
| 77 | full L1 → L5 → Birthday Ending clear | 腳本通過；實玩／實機待驗 | qa-fix.test.js：順序從 L1 到 Party，沒有逐關 DEV jump；測試用位置安排，非真人自然跑圖 |

## Manual Verification Required

請見 `MANUAL_VERIFICATION_REQUIRED.md`。尚未測試六名真人、iPhone Safari／Android 實體觸控、Wi-Fi↔5G、真實 WAN 延遲／丟包、長時間手機效能，以及主觀 Boss／Cargo 平衡。未提供已部署網址，故未宣稱已在使用者的 Render 服務驗收。

## 重新執行

```bash
npm ci
npm test
npm run test:traffic
```

瀏覽器另安裝 Playwright／Chromium，再使用 README 的 `PLAYWRIGHT_MODULE`／`CHROMIUM_PATH` 執行 `test:browser`、`test:assets-mobile`、`test:visual`。正式部署只需 npm 的 production dependencies。
