# 刷哪張？— 信用卡回饋推薦 PWA

一個幫你即時決定「這筆消費刷哪張卡最划算」的個人 PWA。輸入金額 + 消費類別，秒算五張卡的回饋比較，並追蹤每月累積回饋與上限使用情況。

## 功能

- **即時回饋推薦** — 輸入金額、消費類別（或商家名稱），自動比較五張卡的回饋率
- **商家關鍵字自動分類** — 輸入「鼎泰豐」自動識別為餐飲類
- **月累積追蹤** — 追蹤各卡每月回饋上限使用進度
- **消費歷史** — 記錄每筆消費、查看月小結
- **方案切換管理** — 記錄玉山 Unicard UP 選、台新 Richart 切換方案等操作歷史
- **卡片權益查詢** — 停車優惠（含合作停車場）、旅遊保險、道路救援、機場服務
- **PWA 支援** — 可安裝至手機主畫面，離線可用

## 支援卡片

| 卡片 | 方案 |
|------|------|
| 國泰 CUBE | 玩數位 / 樂饗購 / 趣旅行 / 集精選 / 慶生月（L1–L3） |
| 台新 Richart | 台新Pay / LINE Pay / 生活 / 百貨 / 餐飲 / 網購 / 旅遊（L1–L2） |
| 玉山 Unicard | 簡單選 / 任意選 / UP選（月底整月生效） |
| 永豐大戶 DAWHO | 大大 / 大戶 / 大戶Plus（資產門檻），月上限 NT$1,000 |
| 中信華航璀璨無限 | 哩程換算（預設 1 哩 = NT$0.55） |

## 技術棧

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS**（無 shadcn/ui，純 utility class）
- **Zustand** — 全域狀態（設定、當月方案、搜尋狀態）
- **idb** — IndexedDB 本地儲存（消費記錄、方案歷史）
- **@ducanh2912/next-pwa** — PWA Service Worker
- **lucide-react** — icons

## 快速開始

```bash
yarn install
yarn dev
```

開啟 [http://localhost:3000](http://localhost:3000)

## 專案結構

```
src/
├── app/
│   ├── page.tsx              # 推薦首頁
│   ├── cards/
│   │   ├── page.tsx          # 我的卡（上限追蹤）
│   │   ├── perks/page.tsx    # 卡片權益查詢
│   │   └── plans/page.tsx    # 方案對照表
│   ├── history/
│   │   ├── page.tsx          # 消費歷史
│   │   └── plans/page.tsx    # 方案切換歷史
│   └── settings/page.tsx     # 設定
├── components/
│   ├── layout/BottomNav.tsx
│   └── modals/AddTransactionModal.tsx
├── data/
│   ├── cards.ts              # 各卡回饋規則
│   ├── plans.ts              # 各卡方案細項
│   ├── perks.ts              # 卡片附加權益
│   └── keywords.ts           # 商家關鍵字分類表
├── lib/
│   ├── calculator.ts         # 回饋計算邏輯
│   ├── db.ts                 # IndexedDB CRUD
│   ├── search.ts             # 關鍵字比對
│   └── utils.ts              # cn() 等工具
├── store/
│   └── useAppStore.ts        # Zustand store
└── types/
    └── index.ts              # 所有 TypeScript types
```

## 設計原則

- **無後端、無登入** — 所有資料存 IndexedDB，完全本地
- **玉山 Unicard UP 選月底生效** — 整月回饋以月底方案為準，非當下切換
- **永豐大戶上限即時追蹤** — NT$1,000 月上限單獨顯示剩餘額度
- **中信華航哩程換算** — 哩程折現後統一比較，標注「里程優先」
