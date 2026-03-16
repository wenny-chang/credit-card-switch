# 刷哪張？— 實作 Task Plan

> 最後更新：2026-03-16

---

## Phase 1：地基（必須先完成）

### T1 — TypeScript Types
**檔案：** `src/types/index.ts`
- `CategoryId`（14 個類別 union type）
- `CardId`（5 張卡）
- `Transaction`
- `MonthlyPlan`（含 `esunUpSwitch`）
- `PlanChangeHistory`（含 `isAutomatic`, `changeType`）
- `AppSettings`（含 `sinopacExpectedLevel`）
- `CardPerk`

### T2 — IndexedDB Schema
**檔案：** `src/lib/db.ts`
- DB name + version
- Stores: `transactions`, `monthlyPlans`, `planHistory`
- CRUD operations for each store
- `getMonthSummary()` helper（月小結計算）

### T3 — Zustand Store
**檔案：** `src/store/useAppStore.ts`
- `settings`（AppSettings）+ `updateSettings()`
- `currentPlan`（MonthlyPlan）+ `updatePlan()`
- `searchState`（amount, category, merchant text, results）
- `recordPlanChange()` — 寫入 PlanChangeHistory + 更新 currentPlan

### T4 — 靜態資料 Config
**檔案：** `src/data/`
- `cards.ts` — 各卡規則（回饋率、上限、適用類別）
- `plans.ts` — 各卡方案細項（供 /cards/plans 用）
- `perks.ts` — 各卡權益資料（供 /cards/perks 用）
- `keywords.ts` — 商家關鍵字 → CategoryId 對照表

---

## Phase 2：核心計算

### T5 — 回饋計算邏輯
**檔案：** `src/lib/calculator.ts`
- 輸入：amount, categoryId, settings, currentPlan, monthlyUsage
- 輸出：每張卡的 `{ cardId, planName, reward, rewardRate, isOverLimit, remainingBudget }`
- 各卡邏輯：
  - 國泰 CUBE：方案 × 類別 → 3% 或 0.3%
  - 台新 Richart：方案 × 類別 → 3.8%/3.3%/2.3% 或 0.3%
  - 玉山 Unicard：方案 × 類別，月底計算規則，5000/1000 點上限
  - 永豐大戶：`sinopacExpectedLevel` 決定回饋率，排除類別，NT$1,000 上限
  - 中信華航：哩程換算，`mileValue` 設定

### T6 — 商家關鍵字搜尋
**檔案：** `src/lib/search.ts`
- `matchCategory(text: string): CategoryId | null`
- Debounce hook：`useDebounce(value, 300)`

---

## Phase 3：UI 改版（接上真實資料）

### T7 — 首頁重構（Live Search）
**檔案：** `src/app/page.tsx`
- 文字搜尋欄：輸入 → 自動 match 類別 → highlight chip
- 金額 debounce 300ms 自動計算
- 結果區接 `calculator.ts`（移除 mock data）
- 超限警告 badge
- 「+ 記錄這筆消費」→ 開啟 AddTransactionModal

### T8 — AddTransactionModal（共用元件）
**檔案：** `src/components/modals/AddTransactionModal.tsx`
- 商家名稱、金額、類別、選擇卡片、備註
- 存入 IndexedDB（`transactions` store）
- 自動帶入查詢頁面當前選擇的卡片與方案

### T9 — 我的卡重構
**檔案：** `src/app/cards/page.tsx`
- 接 Zustand settings + IndexedDB 月累積資料
- 永豐大戶：當前/預期等級切換，降級警告
- 玉山 Unicard：UP 選鎖定提示（已切換不可切回）
- 切換方案 → 呼叫 `recordPlanChange()`（自動寫 history）
- 頁面上方連結：方案對照表、卡片權益查詢

### T10 — 消費歷史重構
**檔案：** `src/app/history/page.tsx`
- 從 IndexedDB 讀取真實資料
- 月小結（總回饋、哩程、筆數）
- 搜尋功能（商家、類別、卡片）
- 依日期分組（今天/昨天/X 月 X 日）
- 頁面上方連結：切換歷史

### T11 — 設定重構
**檔案：** `src/app/settings/page.tsx`
- 接 Zustand store，真實讀寫 settings
- 永豐大戶：當前等級 + 預期等級（含說明文字與警告）
- 玉山：本月已切換至 UP 選 checkbox
- 匯出 JSON、清除資料

---

## Phase 4：新頁面

### T12 — 方案對照表
**檔案：** `src/app/cards/plans/page.tsx`
- Tab 切換：國泰 / 台新 / 玉山（永豐不需切換故不顯示）
- 表格：方案名稱 | 適用通路 | 回饋率 | 月上限
- 可摺疊詳細說明
- 資料來源：`src/data/plans.ts`

### T13 — 卡片權益查詢
**檔案：** `src/app/cards/perks/page.tsx`
- Tab 切換：停車優惠 / 旅遊保險 / 道路救援 / 機場接送 / 其他
- 每張卡的權益 card
- 資料來源：`src/data/perks.ts`

### T14 — 切換歷史
**檔案：** `src/app/history/plans/page.tsx`
- 從 IndexedDB 讀 `planHistory` store
- 依時間倒序
- 可依卡片篩選
- 每筆：時間、卡片、類型（方案/等級）、變更內容、自動/手動標註

---

## Phase 5：PWA & 收尾

### T15 — PWA 設定
- `next.config.ts`：設定 `@ducanh2912/next-pwa`
- `public/manifest.json`：app 名稱、icon、theme color
- `public/icons/`：PWA icon（多尺寸）
- `app/layout.tsx`：加入 `<meta name="theme-color">`

### T16 — shadcn/ui 元件安裝
- 確認需要哪些元件（Dialog, Tabs, Progress, Badge, Input 等）
- `npx shadcn@latest add ...`

---

## 建議實作順序

```
T1 → T4 → T2 → T3 → T5 → T6
→ T7 → T8 → T9 → T10 → T11
→ T12 → T13 → T14
→ T15 → T16
```

T1/T4 可並行，T2/T3 依賴 T1，T5/T6 依賴 T1+T4，UI 頁面依賴 T5/T6。

---

## 進度追蹤

| Task | 狀態 | 備註 |
|------|------|------|
| T1 TypeScript Types | ⏸️ 待開始 | |
| T2 IndexedDB Schema | ⏸️ 待開始 | 依賴 T1 |
| T3 Zustand Store | ⏸️ 待開始 | 依賴 T1 |
| T4 靜態資料 Config | ⏸️ 待開始 | |
| T5 回饋計算邏輯 | ⏸️ 待開始 | 依賴 T1, T4 |
| T6 商家關鍵字搜尋 | ⏸️ 待開始 | 依賴 T1, T4 |
| T7 首頁重構 | ⏸️ 待開始 | 依賴 T5, T6 |
| T8 AddTransactionModal | ⏸️ 待開始 | 依賴 T2, T5 |
| T9 我的卡重構 | ⏸️ 待開始 | 依賴 T3, T5 |
| T10 消費歷史重構 | ⏸️ 待開始 | 依賴 T2 |
| T11 設定重構 | ⏸️ 待開始 | 依賴 T3 |
| T12 方案對照表 | ⏸️ 待開始 | 依賴 T4 |
| T13 卡片權益查詢 | ⏸️ 待開始 | 依賴 T4 |
| T14 切換歷史 | ⏸️ 待開始 | 依賴 T2 |
| T15 PWA 設定 | ⏸️ 待開始 | |
| T16 shadcn/ui 安裝 | ⏸️ 待開始 | |
