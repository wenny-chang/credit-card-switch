import type { CardId, CategoryId, CathayLevel, TaishinLevel, SinopacLevel } from '@/types'

// ============================================================
// 各卡基本資訊
// ============================================================

export const CARD_NAMES: Record<CardId, string> = {
  cathay: '國泰 CUBE',
  taishin: '台新 Richart',
  esun: '玉山 Unicard',
  sinopac: '永豐大戶',
  ctbc: '中信華航',
}

export const CARD_COLORS: Record<CardId, string> = {
  cathay:  '#047857',  // emerald-700 — 國泰 CUBE 品牌翠綠（白卡主題色）
  taishin: '#18181b',  // zinc-950 — 台新黑狗卡（黑卡）
  esun:    '#7c3aed',  // violet-600 — 玉山 Unicard 品牌紫（白卡主題色）
  sinopac: '#3f3f46',  // zinc-700 — 永豐大戶黑卡
  ctbc:    '#1e40af',  // blue-800 — 中信華航深藍（華航品牌色）
}

// ============================================================
// 國泰 CUBE
// ============================================================

// 各方案適用類別（命中 → 3%；集精選固定 2%）
export const CATHAY_PLAN_CATEGORIES: Record<string, CategoryId[]> = {
  玩數位: ['digital'],
  樂饗購: ['dining', 'shopping'],
  趣旅行: ['travel', 'overseas', 'transport'],
  集精選: ['department', 'supermarket', 'shopping'],
  慶生月: ['dining', 'shopping', 'department', 'travel'],
}

export const CATHAY_PLAN_RATE: Record<string, number> = {
  玩數位: 0.03,
  樂饗購: 0.03,
  趣旅行: 0.03,
  集精選: 0.02,
  慶生月: 0.03,
}

export const CATHAY_LEVEL_MULTIPLIER: Record<CathayLevel, number> = {
  L1: 1,
  L2: 1,   // L2 = 指定通路 3%（與 L3 同，條件不同）
  L3: 1,
}

export const CATHAY_BASE_RATE = 0.003  // 一般消費 0.3%
export const CATHAY_MONTHLY_LIMIT = Infinity

// ============================================================
// 台新 Richart
// ============================================================

// 方案 → { 適用類別, 回饋率 }
export const TAISHIN_PLAN_CONFIG: Record<string, { categories: CategoryId[]; rate: number }> = {
  台新Pay: {
    categories: ['shopping', 'dining', 'department', 'digital', 'travel', 'transport'],
    rate: 0.038,
  },
  'LINE Pay': {
    categories: ['shopping', 'dining', 'digital'],
    rate: 0.023,
  },
  生活: {
    categories: ['supermarket', 'convenience', 'gas', 'transport'],
    rate: 0.033,
  },
  百貨: {
    categories: ['department'],
    rate: 0.033,
  },
  餐飲: {
    categories: ['dining'],
    rate: 0.033,
  },
  網購: {
    categories: ['shopping'],
    rate: 0.033,
  },
  旅遊: {
    categories: ['travel', 'overseas'],
    rate: 0.033,
  },
}

export const TAISHIN_BASE_RATE = 0.003  // 一般消費 0.3%
export const TAISHIN_LEVEL_RATE: Record<TaishinLevel, number> = {
  L1: 1,   // L1 無加成
  L2: 1,   // L2 = 指定通路最高回饋（已含在方案 config）
}
export const TAISHIN_MONTHLY_LIMIT = Infinity

// ============================================================
// 玉山 Unicard
// ============================================================

export const ESUN_PLAN_CONFIG = {
  簡單選: {
    baseRate: 0.01,
    bonusCategories: ['department', 'shopping'] as CategoryId[],  // 百大通路
    bonusRate: 0.02,
    monthlyLimitPoints: 1000,
  },
  任意選: {
    // 任意選回饋率依使用者選定通路，最高 3.5%
    // 簡化：固定 2.5%（保守估計）
    baseRate: 0.025,
    bonusCategories: [] as CategoryId[],
    bonusRate: 0.035,
    monthlyLimitPoints: 1000,
  },
  UP選: {
    baseRate: 0.03,
    bonusCategories: [] as CategoryId[],
    bonusRate: 0.045,
    monthlyLimitPoints: 5000,
  },
}

// 玉山 1 點 = NT$1（回饋以點數計）
export const ESUN_POINT_VALUE = 1

// ============================================================
// 永豐大戶 DAWHO
// ============================================================

// 不適用永豐大戶回饋的類別
export const SINOPAC_EXCLUDED_CATEGORIES: CategoryId[] = [
  'convenience',   // 便利商店
  'supermarket',   // 全聯
  'insurance',     // 保費
  'gas',           // 油費
  // 公共事業、稅款無對應類別，歸 other 處理
]

export const SINOPAC_LEVEL_RATES: Record<SinopacLevel, { domestic: number; overseas: number }> = {
  大大: { domestic: 0.01, overseas: 0.01 },
  大戶: { domestic: 0.03, overseas: 0.04 },
  大戶Plus: { domestic: 0.05, overseas: 0.06 },
}

export const SINOPAC_MONTHLY_LIMIT_NT = 1000  // NT$1,000

// ============================================================
// 中信華航（璀璨無限）
// ============================================================

// 國內：18 元 = 1 哩；海外/指定：9 元 = 1 哩
export const CTBC_DOMESTIC_RATE = 1 / 18   // 哩/元
export const CTBC_OVERSEAS_RATE = 1 / 9    // 哩/元（海外與指定通路）
export const CTBC_BIRTHDAY_OVERSEAS_RATE = 1 / 6  // 哩/元（生日月海外）

// 海外消費類別
export const CTBC_OVERSEAS_CATEGORIES: CategoryId[] = ['overseas']

export const CTBC_MONTHLY_LIMIT_MILES = 60000

// 預設哩程換算率（可在設定中調整）
export const DEFAULT_MILE_VALUE = 0.55  // 1 哩 = NT$0.55
