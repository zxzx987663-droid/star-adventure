# QA / Automated Test Results — STEP 25 Final

版本：`0.4.1-step25-final.1`  
日期：2026-09-27  
本次執行環境：Node `v22.16.0`

## 最終結果

- **Core / integration Node tests：44 / 44 PASS，0 fail，0 skipped**。
- Production JavaScript `node --check`：**PASS**（engine / levels / server / public client / shared / geometry / level-view / tests）。
- `public/assets/manifest.json`：195 次引用、**175 個唯一資產路徑，0 missing**。
- 圖片完整性：所有 manifest PNG/JPG/WebP 可正常解碼，**0 bad image**。
- 角色一般動畫：8 角色 × 7 狀態 = **56 個 128×128 frame sheet PASS**。
- 表情：8 角色 × `emote1..3` = **24 組 PASS**，未被 STEP 22 重製。
- 首頁 Logo：**900×365**，已裁除底部外漏活動 banner；CSS 桌機主視覺上限約 900×340，手機另有尺寸規則。
- Party Room：`walls=[]`、`platforms=[]`、平面 floor 保留；玩家重疊不再互推；client 固定 camera=0 並把世界座標映射到完整生日庭園。
- L5 最終：祭壇依 `raceFloor(5530)` 對位；六人到齊且所有人持續 E 3 秒才進 Ending 的 server-authoritative 規則通過。
- 完整順序 fixture：L1 → L2 五洞 → L3 固定 3+3 / A-B-C / 1.5 秒展橋 / 六人最後坡 → L4 → L5 → 白幕 → 五人送星 → Party Room：**PASS**。

## 本次沒有宣稱通過的項目

`test/network.test.js` 需要 `socket.io-client`。本次提供的工作區沒有 `node_modules`，且隔離執行環境無法補裝外部 npm 套件，因此 network suite 在載入階段即出現 `Cannot find module 'socket.io-client'`；這是**測試環境依賴缺失**，不是把 network test 當成通過。

最終 ZIP 不包含 `node_modules`。部署或在可連 npm registry 的電腦上執行：

```bash
npm ci
npm test
```

即可重跑 core + network suite。專案 `qa/` 內舊 Chromium 截圖／JSON 為先前 QA Fix 的歷史紀錄，沒有被拿來冒充 STEP 25 的新瀏覽器實測。

## STEP 25 專項回歸

1. **L5 最後祭壇**：不再偏下；提示／讀秒不與祭壇重疊。
2. **E 3 秒**：測試六人同時 hold；未滿 3 秒不轉場，持續超過 3 秒進 Ending。
3. **Party 空氣牆**：移除玩家互推；無中段 wall/platform；固定全景呈現。
4. **L1 斷橋**：深谷／瀑布與中央浮島僅改視覺，`1420..1680` 斷橋碰撞範圍未變。
5. **角色動畫**：56 個一般動畫 sheet 統一 128 frame；24 組表情保持原尺寸／內容。
6. **首頁主視覺**：Logo 放大、漏字／活動 banner 已移除；手機規則同步保留。
7. **累積玩法**：L3 / L4 / L5 測試預期已同步到最後核准版本，沒有用舊 QA Fix 斷言假造 PASS。

## 重跑指令

```bash
npm run test:core
npm test              # 需先 npm ci，包含 network.test.js
```
