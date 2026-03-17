// ============================================================
// 消費類別
// ============================================================

export type CategoryId =
  | 'dining'
  | 'shopping'
  | 'department'
  | 'supermarket'
  | 'convenience'
  | 'gas'
  | 'transport'
  | 'parking'
  | 'ev'
  | 'digital'
  | 'travel'
  | 'overseas'
  | 'insurance'
  | 'other'

// ============================================================
// 信用卡
// ============================================================

export type CardId =
  | 'cathay'    // 國泰 CUBE
  | 'taishin'   // 台新 Richart
  | 'esun'      // 玉山 Unicard
  | 'sinopac'   // 永豐大戶 DAWHO
  | 'ctbc'      // 中信華航

// ============================================================
// 消費紀錄
// ============================================================

export interface Transaction {
  id: string
  date: string           // "2026-03-16"
  merchant: string       // "鼎泰豐"
  category: CategoryId
  amount: number         // NT$
  cardId: CardId
  plan: string           // "樂饗購"
  reward: number         // 回饋點數/元/哩
  rewardType: '點' | '元' | '哩'
  note?: string
}

// ============================================================
// 月份方案設定
// ============================================================

export type CathayPlan = '玩數位' | '樂饗購' | '趣旅行' | '集精選' | '慶生月'
export type TaishinPlan = '台新Pay' | 'LINE Pay' | '生活' | '百貨' | '餐飲' | '網購' | '旅遊'
export type EsunPlan = '簡單選' | '任意選' | 'UP選'

export interface MonthlyPlan {
  month: string          // "2026-03"
  cathayPlan: CathayPlan
  taishinPlan: TaishinPlan
  esunPlan: EsunPlan
  esunUpSwitch: boolean  // 本月是否已切換至 UP 選
}

// ============================================================
// 方案切換歷史
// ============================================================

export interface PlanChangeHistory {
  id: string
  timestamp: string      // ISO 8601: "2026-03-16T14:30:00+08:00"
  cardId: CardId
  changeType: 'plan' | 'level'
  fromValue: string      // "樂饗購" 或 "L2"
  toValue: string        // "玩數位" 或 "L3"
  isAutomatic: boolean   // true = 系統自動 / false = 使用者手動
  note?: string
}

// ============================================================
// App 設定
// ============================================================

export type CathayLevel = 'L1' | 'L2' | 'L3'
export type TaishinLevel = 'L1' | 'L2'
export type SinopacLevel = '大大' | '大戶' | '大戶Plus'
export type CtbcCard = '商務御璽' | '璀璨無限' | '鼎尊無限'

export interface AppSettings {
  disabledCards: CardId[] // 停用的卡片（不顯示、不計算）
  cathayLevel: CathayLevel
  taishinLevel: TaishinLevel
  sinopacLevel: SinopacLevel
  sinopacExpectedLevel: SinopacLevel  // 預期等級（供計算用）
  ctbcCard: CtbcCard
  mileValue: number       // 哩程換算率，預設 0.55
  resetDay: number        // 每月重置日，預設 1
  statementDays?: Partial<Record<CardId, number>>  // 各卡結帳日 (1–28)
}

// ============================================================
// 卡片權益
// ============================================================

export type PerkType = 'parking' | 'insurance' | 'roadside' | 'airport' | 'other'

export interface CardPerk {
  id: string
  cardId: CardId
  perkType: PerkType
  name: string           // "指定停車場 8 折"
  condition: string      // "需綁定台新 Pay"
  limit: string          // "每月 10 次"
  partners?: string[]    // 合作停車場/商家清單
  url?: string           // 申請或詳情連結
}

// ============================================================
// 回饋計算結果
// ============================================================

export interface CardRewardResult {
  cardId: CardId
  cardName: string
  planName: string
  reward: number
  rewardType: '點' | '元' | '哩'
  rewardCash: number     // 換算成現金（哩程卡用）
  rewardRate: number     // 回饋率（0~1）
  isOverLimit: boolean
  remainingBudget: number | null  // null = 無上限
}

// ============================================================
// 月小結
// ============================================================

export interface MonthSummary {
  month: string
  totalCash: number       // 現金回饋總計（NT$）
  totalMiles: number      // 哩程總計
  totalTransactions: number
  byCard: Partial<Record<CardId, { reward: number; rewardType: '點' | '元' | '哩' }>>
}
