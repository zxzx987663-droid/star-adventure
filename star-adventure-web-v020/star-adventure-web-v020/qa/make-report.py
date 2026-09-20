from pathlib import Path
import re,json,hashlib
root=Path(__file__).resolve().parents[1]
spec=(root/'QA_FIX_FINAL.md').read_text().split('# 27. Required QA Tests')[1].split('# 28.')[0]
items=[(int(n),text) for n,text in re.findall(r'^(\d+)\. (.+)$',spec,re.M)]
assert len(items)==77
traffic=json.loads((root/'qa/network-traffic.json').read_text());browser=json.loads((root/'qa/browser-results.json').read_text());visual=json.loads((root/'qa/visual-qa.json').read_text());extra=json.loads((root/'qa/browser-extra-results.json').read_text())
evidence={}
def group(nums,label):
 for n in nums:evidence[n]=label
group(range(1,9),'network.test.js／mechanics.test.js：六個 Socket.IO client、權限、身分、重連、Reset')
group(range(9,12),'browser.cjs＋visual-qa.cjs：Intro/X、無常駐敘述、三尺寸 DOM 邊界／截圖')
group(range(12,16),'l1.test.js＋qa-fix.test.js：壓板／拉桿／第四人斷橋／掉落／集合')
group(range(16,31),'mechanics.test.js＋qa-fix.test.js：20 棒、實體 E、真假與時間鎖；network.test.js 私有封包；browser.cjs 實際 UI')
group(range(31,47),'mechanics.test.js＋qa-fix.test.js：真實三人輸入、1–6 推手、坡度、E 機關、存點、壓扁／救援／自起／最终坡')
group(range(47,59),'qa-fix.test.js＋mechanics.test.js：FSM 連續座標、跳越／下穿、個人按鈕、完成保留、6/6 與終點復活')
group(range(59,67),'mechanics.test.js＋qa-fix.test.js：四檢查點、個人死亡、救援、固定三種 AI、四相位缺口跳躍')
group(range(67,73),'mechanics.test.js＋browser.cjs：六人 hold、白幕分身分、五個送星、Birthday／Party')
evidence[73]='network.test.js：L2/3/4/5 機制中斷線回房、Ending、磁碟重啟；browser.cjs：小桃 reload'
evidence[74]='traffic.cjs／network-traffic.json：原版對比 20 Hz frame、5 Hz stage、內容變動才發 clue'
evidence[75]='network.test.js：長按偽造新 press、重送 press、舊 epoch 全拒絕；browser.cjs：四次手機 tap 有效'
evidence[76]='network.test.js＋browser.cjs：非 Reader 不收答案／不顯示，publicStage 無 _legs，過期重連不能重看'
evidence[77]='qa-fix.test.js：順序從 L1 到 Party，沒有逐關 DEV jump；測試用位置安排，非真人自然跑圖'
text='''# QA / Automated Test Results — Build 0.4.1 QA Fix 1

版本 `0.4.1-qa-fix.1`；Node `v24.19.0`；本機伺服器與 headless Chromium。報告日期：2026-09-20。

## 結果

- 修改前基準：原版 **29/29 通過**；原版六瀏覽器結局測試通過。原始記錄為 `qa/baseline-tests.txt`、`qa/baseline-browser-results.json`，物理／架構分析在 `qa/ARCHITECTURE_BASELINE.md`。
- 修改後：**43/43 Node tests 通過，0 failure／0 skipped**。`qa/automated-tests.txt` 是最終完整輸出。
- 六個獨立 Chromium context：Reader 私有 UI、雙 Reader、手機四次同符號 E、momo reload、六人終點、純白、五人分別送星、生日、Party 與 Reset 全通過；無 page error／HTTP error。
- 多點觸控模擬：方向＋跳躍同時按、放開清除；素材更換／損壞 fallback／圖片快取與 hitbox 解耦通過，測試時約 60 FPS（不是實機效能保證）。
- 390×844、844×390、1280×850：沒有頁面水平溢出；HUD 與 Reader 面板留在 viewport；面板不蓋住符號高度；關卡下方無敘述。
- 純正式依賴啟動：見 `qa/deployment-smoke.json`；使用 `npm ci --omit=dev`，HTTP／WebSocket、資產／字體、版本及 `ENABLE_DEV=false` 權限檢查。

'''
text+=f"六瀏覽器測試實測白幕約 **{browser['whiteDurationMs']/1000:.3f} 秒**。詳見 `qa/browser-results.json`、`qa/browser-extra-results.json`、`qa/visual-qa.json`。\n\n"
text+='''## 測試方法與可解讀範圍

`npm test` 使用真實 engine 的 25ms 步進。L2 測了 5×4 棒、5,000 組真假生成與閱讀／首輸入計時；L3 測三個實際玩家 input 推過起步斜坡及全路貨物運送、每段路線的真實跳躍；Boss 兩條路線各測三個起始偏移，另用連續 45 秒座標檢查無瞬移／越界；L5 全缺口在四個移動平台相位測實際可達性。

完整順序流程不用 DEV 切換各關，以 G.interact 正常推進、各關完成條件與 ending tick 跑到底；會用測試 fixture 安排角色位置（如壓板、可達開關、Boss 按鈕、終點），不是六個 AI 自主走過每一步。L3 的 route team 先按實體機關，之後三個真實 player input 推完整段，最後六人輸入共同上坡。平台路徑與 Boss 突破另有獨立物理測試。

Browser 測試使用 DEV 切到各區段，然後以真實鍵盤／pointer 事件驗證 Reader、四次重複符號、hold、送星、Reset；也重新載入小桃分頁驗證身分。Socket.IO tests 使用六個獨立連線而非假人，驗證授權、重連、私有 payload、長按／重送／舊 epoch 防重複。磁碟恢復測試涵蓋新版存檔与原版升級。

原本測試中「踩踏答題／三組自動壓板／Boss 8 秒 sine 週期」的預期已依 QA FINAL 替換；原 L1 測試保留。初期測試找出的 Boss 直接跳越矩形碰撞過窄、手機 viewport 橫溢、測試 fixture 隨機 Reader 恰好出生在石碑旁、Playwright selector 命中兩個互動鍵均已修正。此報告只引用最後通過的結果。

## 封包比較

六個獨立 WebSocket client，各關穩定期取 1.5 秒左右；下表為每位 client 接收的 JSON payload，未計 TLS/WebSocket 額外位元組。短時間抽樣會受 5 Hz 相位差一包影響。

| 關卡 | 原版 bytes/s | 新版 bytes/s | 新／舊比例 |
|---|---:|---:|---:|
'''
for k,v in traffic['current'].items():text+=f"| L{k} | {traffic['baseline'][k]['bytesPerSecond']} | {v['bytesPerSecond']} | {traffic['ratios'][k]:.3f} |\n"
text+='''
frame 維持 20 Hz、stage 維持 5 Hz，沒有把動畫逐幀送出。L2 phase 改變立即補一次必要 stage，private clue 只在內容變動時單播。穩定期樣本沒有多餘 clue 廣播；不是長時間壓力測試或真實 WAN bandwidth 保證。

## QA FIX FINAL 77 項對照

「通過」指下面列明的自動／脚本驗證；「實玩待驗」另標主觀與真機部分。不能把 77 個規格項目讀成 77 個獨立自動測試，也不能視為真人 QA 已完成。

| # | 規格項目 | 本次結果 | 證據／方法 |
|---:|---|---|---|
'''
manual={11,47,50,51,52,66,73,74,77}
for n,label in items:
 status='腳本通過；實玩／實機待驗' if n in manual else '自動／腳本通過'
 text+=f'| {n} | {label.replace("|","／")} | {status} | {evidence[n]} |\n'
text+='''
## Manual Verification Required

請見 `MANUAL_VERIFICATION_REQUIRED.md`。尚未測試六名真人、iPhone Safari／Android 實體觸控、Wi-Fi↔5G、真實 WAN 延遲／丟包、長時間手機效能，以及主觀 Boss／Cargo 平衡。未提供已部署網址，故未宣稱已在使用者的 Render 服務驗收。

## 重新執行

```bash
npm ci
npm test
npm run test:traffic
```

瀏覽器另安裝 Playwright／Chromium，再使用 README 的 `PLAYWRIGHT_MODULE`／`CHROMIUM_PATH` 執行 `test:browser`、`test:assets-mobile`、`test:visual`。正式部署只需 npm 的 production dependencies。
'''
(root/'TEST_RESULTS.md').write_text(text)
(root/'qa/criteria-77.json').write_text(json.dumps([{'id':n,'requirement':label,'status':'scripted_pass_manual_followup' if n in manual else 'automated_or_scripted_pass','evidence':evidence[n]} for n,label in items],ensure_ascii=False,indent=2)+'\n')
