# 刷哪張？— Design Specification

> 信用卡回饋追蹤與刷卡建議 PWA
> 最後更新：2026-03-17

---

## 目標使用者

個人持有多張切換型信用卡，痛點：
- 每張卡有不同方案切換限制與月回饋上限
- 不知道當下消費要用哪張卡最划算
- 需要追蹤各卡當月累積回饋是否快到上限

---

## 信用卡清單與規則

### 國泰 CUBE（L2）
| 項目 | 說明 |
|------|------|
| 切換頻率 | 每天一次，透過 CUBE App |
| 方案選項 | 玩數位、樂饗購、趣旅行、集精選、慶生月 |
| L2 回饋 | 指定通路 **3%**（集精選固定 2%）|
| 一般消費 | **0.3%** |
| 月上限 | 實質無上限 |

### 台新 Richart（L2）
| 項目 | 說明 |
|------|------|
| 切換頻率 | 每天一次，透過 Richart Life App |
| 方案選項 | 台新Pay 3.8%、LINE Pay 2.3%、生活/百貨/餐飲/網購/旅遊 3.3% |
| L2 條件 | 設定台新帳戶自動扣繳 |
| 一般消費 | **0.3%** |
| 月上限 | 實質無上限（永久額度 + 30 萬為限）|

### 玉山 Unicard
| 項目 | 說明 |
|------|------|
| 切換頻率 | 每月最多 30 次，但**以月底方案計算整月回饋** |
| 方案選項 | 簡單選（1% + 百大 2%）、任意選（最高 3.5%）、UP 選（最高 4.5%）|
| UP 選條件 | 上月刷卡 ≥ 3 萬 或 資產 ≥ 30 萬（免費）；否則 149 點/月 |
| UP 選上限 | **5,000 點/月**（= 約 NT$111,111）|
| 簡單/任意上限 | **1,000 點/月** |
| 注意 | 選定 UP 選後當月不可切換回其他方案 |

### 永豐大戶 DAWHO（大戶 Plus）
| 項目 | 說明 |
|------|------|
| 切換 | **不需切換**，全通路自動 |
| 等級條件 | 大戶 Plus：當月平均資產 ≥ 100 萬 + 換匯/交易任一 |
| 國內回饋 | **5%** |
| 國外回饋 | **6%** |
| 月上限 | **NT$1,000**（= 刷 NT$20,000 封頂）|
| 悠遊卡加值 | 5%，上限 NT$500/月 |
| 不含通路 | 便利商店、全聯、保費、公共事業、稅款、油費 |

### 中信華航（璀璨無限）
| 項目 | 說明 |
|------|------|
| 類型 | 里程累積，非現金回饋 |
| 國內消費 | 18 元 = 1 哩 |
| 海外/指定通路 | 9 元 = 1 哩（2 倍）|
| 生日月海外 | 6 元 = 1 哩（3 倍）|
| 哩程換算 | **1 哩 = NT$0.55**（使用者自設）|
| 月上限 | 60,000 哩/月（正卡）|
| 使用策略 | 優先度最低，主要用於海外消費累積哩程 |

---

## 消費類別

| ID | 名稱 | 關鍵字範例 |
|----|------|-----------|
| dining | 餐飲 | 餐廳、鼎泰豐、麥當勞、foodpanda、ubereats |
| shopping | 網購 | momo、shopee、pchome、amazon |
| department | 百貨 | sogo、新光三越、微風、uniqlo、zara |
| supermarket | 超市賣場 | 全聯、家樂福、好市多、大潤發 |
| convenience | 超商 | 7-11、全家、萊爾富 |
| gas | 加油 | 中油、台塑、全國加油 |
| transport | 交通 | uber、高鐵、台鐵、捷運、gogoro |
| parking | 停車 | 停車場、utaggo、iparking |
| ev | 充電 | u-power、evoasis、icharging |
| digital | 數位/訂閱 | spotify、netflix、apple、chatgpt、line pay |
| travel | 旅遊 | booking.com、agoda、kkday、klook |
| overseas | 海外消費 | 境外、foreign |
| insurance | 保費 | 人壽、產險、保費 |
| other | 一般消費 | （其他未分類）|

---

## 頁面架構

```
/              首頁「刷哪張？」   → 輸入金額 + 類別 → 回饋排名（Live Search）
/cards         我的卡             → 各卡狀態、方案、月上限進度
/cards/plans   方案對照表         → 所有卡片的方案細項對照
/cards/perks   卡片權益查詢       → 停車、旅平險、道路救援等門檻
/history       消費歷史           → 依日期分組、搜尋、月小結
/history/plans 切換歷史           → 方案切換、等級調整記錄
/settings      設定               → 卡片等級、方案、哩程換算
```

底部 Tab Bar：推薦 / 我的卡 / 歷史 / 設定

---

## 各頁面規格

### 首頁（Live Search 模式）

**輸入區：**
- 金額輸入（大字，inputMode="numeric"）
- 類別 chips（預設顯示 6 個，展開顯示全部）
- **新增：文字搜尋欄**（搜尋商家名稱、類別關鍵字）
- 「查詢最佳刷法」按鈕（可選，也可 Live 自動計算）

**Live Search 行為：**
- 金額輸入 debounce 300ms 後自動計算
- 類別 chip 點擊立即計算
- 文字搜尋會自動 match 類別（例如輸入「麥當勞」→ 自動選擇「餐飲」）
- 保留「查詢」按鈕作為明確的行為提示（UX 友善）

**結果區：**
- 最佳卡：大色塊，品牌配色，顯示卡名 + 方案 + 回饋金額 + 回饋率
- 其他卡：列表，左側品牌色條，右側回饋金額
- 若某卡超過月上限：顯示黃色警告 badge
- 底部「+ 記錄這筆消費」按鈕

### 我的卡

每張卡：
- 卡片色塊（品牌配色漸層）
- 等級 / 卡名 / 目前方案 / 最高回饋率
- 月回饋上限進度條（有上限才顯示）
- 切換狀態說明 + 切換方案按鈕（無切換機制的卡不顯示）
- 無上限的卡顯示本月累積回饋

**永豐大戶特殊處理：**
- 顯示當前等級（大大/大戶/大戶 Plus）
- 若本月資產不達標，顯示警告 badge：「下月可能降級」
- 可手動設定「預期等級」，避免計算錯誤

**玉山 Unicard 特殊處理：**
- 顯示當月方案（簡單選/任意選/UP 選）
- **新增：UP 選切換記錄**，顯示本月是否已切換至 UP 選
- 若已選 UP 選，顯示提示：「本月無法切回其他方案」

**頁面上方新增連結：**
- 「方案對照表」→ 進入 `/cards/plans`
- 「卡片權益查詢」→ 進入 `/cards/perks`

### 方案對照表（/cards/plans）

**目的：** 快速比較各卡所有可切換方案的回饋細項

**版型：**
- Tab 切換卡片：國泰 CUBE / 台新 Richart / 玉山 Unicard
- 表格式對照：方案名稱 | 適用通路 | 回饋率 | 月上限
- 可摺疊的詳細說明（點擊方案名稱展開）

**範例（國泰 CUBE）：**
| 方案 | 適用通路 | 回饋率 | 月上限 |
|------|----------|--------|--------|
| 玩數位 | Apple、Google Play、Spotify、Netflix 等 | 3% | 無 |
| 樂饗購 | 餐飲、食品、外送 | 3% | 無 |
| 趣旅行 | 旅遊、訂房、租車 | 3% | 無 |
| 集精選 | SOGO、微風、全聯、Costco 等 | 2% | 無 |

---

### 卡片權益查詢（/cards/perks）

**目的：** 查詢各卡的非消費回饋權益（停車、旅平險、道路救援等）

**版型：**
- 權益分類 Tab：停車優惠 / 旅遊保險 / 道路救援 / 機場接送 / 其他
- 每張卡一個 card，顯示：
  - 權益名稱
  - 使用條件（消費門檻、申請方式）
  - 限制說明（次數、額度）
  - 快速連結（申請網址）

**範例（停車優惠）：**
- **國泰 CUBE**：CUBE App 點數折抵停車費，100 點 = NT$50
- **台新 Richart**：指定停車場享 8 折（需綁定台新 Pay）
- **玉山 Unicard**：無特別停車優惠
- **永豐大戶**：uTagGo 停車費 5% 回饋（計入月上限）
- **中信華航**：指定停車場免費停車 1 小時（單筆消費 ≥ NT$3,000）

---

### 消費歷史

- 右上角「＋」新增一筆
- 本月小結：回饋總計 / 哩程 / 筆數
- 搜尋欄（商家、類別、卡片）
- 依日期分組：今天 / 昨天 / X 月 X 日
- 每筆：商家名 + 類別標籤 / 卡名 + 方案 / 金額 + 回饋
- **備註顯示**：若有備註，顯示在卡名方案行下方（淡色小字）

**圖表模式：**
- 清單 / 圖表 切換 toggle（header 右側）
- 圖表內容：
  - 各類別消費金額水平長條圖
  - 各卡回饋金額水平長條圖
  - 僅顯示本月有消費的類別／卡片

**頁面上方新增連結：**
- 「切換歷史」→ 進入 `/history/plans`

---

### 切換歷史（/history/plans）

**目的：** 追蹤所有信用卡方案切換、等級調整的歷史記錄

**版型：**
- 依時間倒序排列
- 每筆記錄顯示：
  - 日期時間
  - 卡片名稱（品牌色標籤）
  - 變更類型：「方案切換」/ 「等級調整」
  - 變更內容：「樂饗購 → 玩數位」
  - 自動記錄 / 手動調整標註

**特殊追蹤：**
- **玉山 Unicard UP 選切換**：每次切換至 UP 選都記錄，方便確認本月是否已切換
- **永豐大戶等級變更**：在設定頁或「我的卡」調整等級時記錄（changeType: 'level'）
- **中信華航卡等變更**：在設定頁更換卡等（商務御璽/璀璨無限/鼎尊無限）時記錄（changeType: 'level'）

**範例記錄：**
```
2026-03-16 14:30  國泰 CUBE  方案切換  樂饗購 → 玩數位  [手動]
2026-03-15 09:00  玉山 Unicard  方案切換  簡單選 → UP 選  [手動]
2026-03-01 00:00  永豐大戶  等級調整  大戶 Plus → 大戶  [手動]
2026-03-01 00:00  中信華航  等級調整  商務御璽 → 璀璨無限  [手動]
```

### 設定

每張卡的可編輯參數：
- **國泰 CUBE**：等級、今日方案、**結帳日**
- **台新 Richart**：等級、今日方案、**結帳日**
- **玉山 Unicard**：當月方案（按月設定）、**本月是否已切換至 UP 選**（checkbox）、**結帳日**
- **永豐大戶**：**當前等級**（大大/大戶/大戶 Plus）、**預期等級**（供計算用）、**結帳日**
- **中信華航**：卡等（切換時記錄歷史）、哩程換算率、**結帳日**

**結帳週期設定：**
- 每張卡可設定「結帳日」（1～31 日，即帳單截止日）
- 在「我的卡」頁面上顯示：距下次結帳 N 天 / 今日結帳
- 幫助使用者掌握帳單截止時間，避免消費超限

**新增：永豐大戶等級說明**
- 提供等級條件快速參考（資產門檻、交易要求）
- 若設定「預期等級」低於「當前等級」，顯示警告提示

應用程式設定：
- 每月自動重置日
- 匯出 JSON
- 清除所有資料

---

## 資料模型

### 消費紀錄（Transaction）
```ts
{
  id: string
  date: string           // "2026-03-16"
  merchant: string       // "鼎泰豐"
  category: CategoryId
  amount: number         // NT$
  cardId: CardId
  plan: string           // "樂饗購"
  reward: number         // 回饋點數/元/哩
  rewardType: "點" | "元" | "哩"
  note?: string
}
```

### 月份方案設定（MonthlyPlan）
```ts
{
  month: string          // "2026-03"
  cathayPlan: string     // "樂饗購"
  taishinPlan: string    // "Pay 著刷"
  esunPlan: "簡單選" | "任意選" | "UP選"
  esunUpSwitch: boolean  // 本月是否已切換至 UP 選
}
```

### 方案切換歷史（PlanChangeHistory）
```ts
{
  id: string
  timestamp: string      // ISO 8601: "2026-03-16T14:30:00+08:00"
  cardId: CardId
  changeType: "plan" | "level"
  fromValue: string      // "樂饗購" 或 "L2"
  toValue: string        // "玩數位" 或 "L3"
  isAutomatic: boolean   // true = 系統自動 / false = 使用者手動
  note?: string
}
```

### App 設定（AppSettings）
```ts
{
  cathayLevel: "L1" | "L2" | "L3"
  taishinLevel: "L1" | "L2"
  sinopacLevel: "大大" | "大戶" | "大戶Plus"
  sinopacExpectedLevel: "大大" | "大戶" | "大戶Plus"  // 預期等級（供計算用）
  ctbcCard: "商務御璽" | "璀璨無限" | "鼎尊無限"
  mileValue: number       // 0.55
  resetDay: number        // 1
  statementDays?: Partial<Record<CardId, number>>  // 各卡結帳日 (1–31)
}
```

### 卡片權益資料（CardPerk）
```ts
{
  id: string
  cardId: CardId
  perkType: "parking" | "insurance" | "roadside" | "airport" | "other"
  name: string           // "指定停車場 8 折"
  condition: string      // "需綁定台新 Pay"
  limit: string          // "每月 10 次"
  url?: string           // 申請或詳情連結
}
```

---

## 技術選型

| 項目 | 選擇 |
|------|------|
| Framework | Next.js 15（App Router）|
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| State | Zustand |
| Storage | IndexedDB（via idb）|
| PWA | @ducanh2912/next-pwa |

- 純前端，無後端、無登入
- 所有資料存於使用者裝置

---

## 設計規範

### 色彩
| Token | 值 | 用途 |
|-------|-----|------|
| Primary | `#2563eb` | 主要操作按鈕、active 狀態 |
| Background | `#f0f4f8` | 頁面底色 |
| Card | `#ffffff` | 卡片背景 |
| Border | `#e2e8f0` | 分隔線 |
| Success | `#059669` | 正向回饋 |
| Warning | `#d97706` | 接近上限警告 |
| Danger | `#dc2626` | 超過上限、危險操作 |

### 品牌配色
| 卡片 | 顏色 |
|------|------|
| 國泰 CUBE | `#00693e`（深綠）|
| 台新 Richart | `#c41230`（深紅）|
| 玉山 Unicard | `#d4860a`（琥珀）|
| 永豐大戶 | `#005baa`（深藍）|
| 中信華航 | `#b91c1c`（磚紅）|

### 字型
- 中文：Noto Sans TC / 系統字體
- 數字：Geist（等寬，用於金額顯示）

### 版型
- 最大寬度：`max-w-lg`（512px）
- 手機優先，`overflow-x: hidden`
- 底部 Tab Bar 高度：約 72px，main 設 `pb-24`

---

## 新功能實作重點

### 1. 方案對照表（/cards/plans）
- **資料來源**：前端靜態資料（可寫成 JSON config）
- **重點**：各卡方案細項完整對照，方便使用者快速查詢
- **更新頻率**：信用卡方案變更時手動更新（不常變動）

### 2. 文字搜尋功能
- **實作方式**：關鍵字 mapping 到類別（例如「麥當勞」→ dining）
- **資料結構**：建議用 `Map<string, CategoryId>` 存儲關鍵字對照表
- **UX**：輸入時自動 highlight 匹配的類別 chip

### 3. Live Search（自動計算）
- **效能優化**：金額輸入 debounce 300ms，類別選擇立即觸發
- **保留查詢按鈕**：作為明確的行為提示，提升 UX
- **狀態管理**：Zustand store 存儲當前查詢條件

### 4. 永豐大戶等級切換
- **當前等級 vs 預期等級**：
  - 當前等級：本月實際達到的等級
  - 預期等級：供計算用，可設定為下月預期的等級
- **警告機制**：若資產不達標，顯示「下月可能降級」提示
- **計算邏輯**：回饋計算使用「預期等級」，避免下月降級時計算錯誤

### 5. 玉山 Unicard UP 選切換記錄
- **追蹤欄位**：`MonthlyPlan.esunUpSwitch: boolean`
- **重要規則**：一旦切換至 UP 選，當月無法切回（需在 UI 明確提示）
- **歷史記錄**：每次切換都寫入 `PlanChangeHistory`

### 6. 方案切換歷史（/history/plans）
- **自動記錄 vs 手動調整**：
  - 自動：系統偵測到方案變更時自動記錄
  - 手動：使用者在設定頁調整時記錄
- **資料保留**：建議保留最近 6 個月的記錄
- **查詢功能**：可依卡片、時間範圍篩選

### 7. 卡片權益查詢（/cards/perks）
- **資料來源**：前端靜態資料（JSON config）
- **權益類型**：
  - parking（停車優惠）
  - insurance（旅平險、意外險）
  - roadside（道路救援）
  - airport（機場接送、貴賓室）
  - other（其他）
- **更新頻率**：信用卡權益變更時手動更新

---

## 實作優先順序建議

### Phase 1：核心功能（已完成設計）
- ✅ 頁面架構與 UI
- ⏸️ 資料模型與 TypeScript types
- ⏸️ IndexedDB operations
- ⏸️ Zustand store
- ⏸️ 回饋計算邏輯

### Phase 2：新增功能（本次新增）
1. **文字搜尋 + Live Search**（高優先）
   - 商家關鍵字對照表
   - Debounce 自動計算
   - 保留查詢按鈕

2. **永豐大戶等級管理**（中優先）
   - 當前/預期等級設定
   - 警告提示機制

3. **玉山 UP 選追蹤**（中優先）
   - 切換狀態記錄
   - 鎖定提示（切換後無法切回）

4. **方案切換歷史**（中優先）
   - PlanChangeHistory 資料模型
   - /history/plans 頁面

5. **方案對照表**（低優先，資料整理工作量大）
   - 整理各卡方案細項
   - /cards/plans 頁面

6. **卡片權益查詢**（低優先，資料整理工作量大）
   - 整理各卡權益資料
   - /cards/perks 頁面

---

---

## Phase 3 新功能規格

### F1 — 備注顯示在歷史紀錄

**位置：** `src/app/history/page.tsx`

- 每筆 Transaction 若有 `note` 欄位，在「卡名 · 方案」行下方顯示備注文字
- 樣式：灰色小字（text-xs text-gray-400），前綴 `#` 或小筆記 icon
- 編輯模式（AddTransactionModal）需加 `initialNote` prop，載入現有備注供修改

---

### F2 — 歷史圖表模式

**位置：** `src/app/history/page.tsx`

**切換方式：**
- Header 右上角新增 `清單 / 圖表` icon toggle button
- 切換狀態存於本地 state（不需持久化）

**圖表內容（圖表模式）：**

1. **各類別消費分布**（水平長條圖）
   - Y 軸：類別名稱
   - X 軸：本月消費金額（NT$）
   - 僅顯示本月有消費的類別，依金額大到小排序
   - 顯示金額數字在長條右側

2. **各卡回饋總計**（水平長條圖）
   - Y 軸：卡片名稱（品牌色）
   - X 軸：本月回饋金額（元 / 點 / 哩分開標注）
   - 僅顯示本月有消費的卡片

**技術實作：** 純 CSS / Tailwind 長條圖（不引入外部 chart library）

---

### F3 — 大戶 & 中信切換歷史記錄

**目標：** 在設定頁更換永豐大戶等級或中信卡等時，自動寫入 `planHistory`

**永豐大戶：**
- Store 現有 `updateSinopacLevel(level)` 已支援 planHistory 記錄
- 問題：設定頁目前直接呼叫 `updateSettings({ sinopacLevel })` 跳過記錄
- **修正：** 設定頁改呼叫 `updateSinopacLevel()`

**中信華航：**
- 新增 store action `updateCtbcCard(card: CtbcCard)`
- 記錄：`changeType: 'level'`，fromValue/toValue 為卡等名稱
- 設定頁改呼叫 `updateCtbcCard()` 取代直接 `updateSettings`

---

### F4 — 每張卡結帳週期

**資料結構：**
- `AppSettings.statementDays: Partial<Record<CardId, number>>`（結帳日，1–31）

**顯示位置（我的卡頁面）：**
- 每張卡下方小字顯示：`結帳 X 日`
- 若今日距結帳日 ≤ 3 天：顯示橘色警示「X 天後結帳」
- 若今日為結帳日：顯示「今日結帳」（紅色）

**計算邏輯：**
```
daysUntil = statementDay - today.date
若 daysUntil < 0 → daysUntil += 本月天數（跨月計算）
```

**設定位置（設定頁）：**
- 每張卡的設定區塊新增「結帳日」行
- 點擊開啟數字 picker（1–28，避免 31 日不存在問題），或直接輸入
- 未設定時顯示「未設定」，不影響其他功能

---

## 截圖

截圖存放於 `.screenshots/` 資料夾：
- `design-home.png` — 首頁空白狀態
- `design-home-result.png` — 首頁查詢結果
- `design-cards.png` — 我的卡
- `design-history.png` — 消費歷史
- `design-settings.png` — 設定
