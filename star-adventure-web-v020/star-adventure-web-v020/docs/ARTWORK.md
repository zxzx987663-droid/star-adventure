# 替換 placeholder 美術

所有機關、碰撞與角色能力都與圖片分離。修改 `public/assets/manifest.json` 即可替換美術，不需重寫遊戲規則。

角色鍵名維持八個已定案名字。每個動畫可填圖片網址字串，或填：

```json
{"src":"/assets/momo-run.png","frames":6,"fps":10,"height":76}
```

圖片為水平排列的等寬影格；座標基準是角色腳底中心，顯示高度以世界像素計。支援 idle、run、jump、fall、down、rescue、happy、emote。未提供的動畫回退到 idle；無圖片時使用 Canvas placeholder。

`backgrounds` 中的 `1`～`5` 和 `party` 可填靜態背景路徑，背景會填滿可視區域。碰撞地形仍由 shared.js 定義。

字型：Noto Sans TC、Noto Emoji，SIL Open Font License；授權原文附在 `public/fonts/`。字型自託管，不依賴第三方 CDN。placeholder 角色、背景、機關由 Canvas 繪製，沒有下載動畫或商業遊戲素材。
