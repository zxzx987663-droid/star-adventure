# 修改前架構／物理基準

- 原始 ZIP：star-adventure-build-0.4.1.zip，完整解壓副本保留於 baseline，修改使用獨立工作副本。
- 原版 Node regression：29 項，涵蓋房間、身分、L1、舊互動、結局、重連與存檔。
- 角色水平速度 210px/s、跳速 -600px/s、重力 1050px/s²；理論最高 171px、同高飛行 1.143s、水平可跨約 240px。25ms server 步進實測略小，平台留容錯。
- 角色碰撞寬 46px、高 52px；扁平高 14px；Cargo radius 55px；Boss body 100×80px。美術不參與碰撞尺寸。
- 世界寬 L1 2900、L2 5300、L3 5600、L4 3900、L5 5700。Camera 水平平滑跟隨；L3 垂直跟隨玩家，沒有世界地形重構需要。
- Engine 管理 room lifecycle / movement / L1 / ending；levels.js 管理 L2–5；geometry.js 和 shared.js 提供共用地形／物理；client.js 管理輸入、預測、插值／畫面。
- 原 L2 踩地板即提交，Reader 可遠端 HTML 開始；本輪改為同一 state / private clue 通道的實體 E 互動。
- 原 L3 是單向連續上坡、三組自動壓板、速度查表；缺少真正下坡、自然地形重力、中途存點及 cargo flatten 回復。
- 原 L4 用 time % 8 決定狀態，charge sine 來回、跳躍 y 瞬切；需局部替換 Boss 狀態計算，不更動 completion/room/identity。
- 原 L5 同一怪物每 6 秒切多種攻擊，x 用 sine 頻率切換，有座標不連續；替換為三個固定 archetype。
- Server tick 40Hz、movement frame 20Hz、stage 5Hz；private clues 只在內容變動時單播。保留此架構。
- Reconnect 使用 player public token + private resumeKey；momoToken 由小桃選角綁定。Reset／5 秒白幕／五人送星／Party Room 沿用。
- 本輪具體布局：L3 小上坡教學 → 跨橋平台 E 拉桿 → 高低雙開關貨門 → 中途旗 → 重力下坡與前方制動橋 → 六人長坡；L4 安全區 → 橋柱入口 → 提示區 → 有邊界的 Boss 戰區 → 安全突破平台與各自按钮。
