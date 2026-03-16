import type {
  CategoryId,
  CardRewardResult,
  AppSettings,
  MonthlyPlan,
} from '@/types'
import {
  CATHAY_PLAN_CATEGORIES,
  CATHAY_PLAN_RATE,
  CATHAY_BASE_RATE,
  CATHAY_MONTHLY_LIMIT,
  TAISHIN_PLAN_CONFIG,
  TAISHIN_BASE_RATE,
  TAISHIN_MONTHLY_LIMIT,
  ESUN_PLAN_CONFIG,
  SINOPAC_EXCLUDED_CATEGORIES,
  SINOPAC_LEVEL_RATES,
  SINOPAC_MONTHLY_LIMIT_NT,
  CTBC_DOMESTIC_RATE,
  CTBC_OVERSEAS_RATE,
  CTBC_OVERSEAS_CATEGORIES,
  CTBC_MONTHLY_LIMIT_MILES,
  CARD_NAMES,
} from '@/data/cards'

// ============================================================
// Types
// ============================================================

interface CalcInput {
  amount: number
  category: CategoryId
  settings: AppSettings
  currentPlan: MonthlyPlan
  // 當月各卡已累積回饋（現金，NT$）
  monthlyUsage: Record<string, number>
  // 當月中信已累積哩程
  monthlyMiles?: number
}

// ============================================================
// 國泰 CUBE
// ============================================================

function calcCathay(input: CalcInput): CardRewardResult {
  const { amount, category, currentPlan } = input
  const plan = currentPlan.cathayPlan
  const planCategories = CATHAY_PLAN_CATEGORIES[plan] ?? []
  const planRate = CATHAY_PLAN_RATE[plan] ?? CATHAY_BASE_RATE

  const rate = planCategories.includes(category) ? planRate : CATHAY_BASE_RATE
  const reward = Math.floor(amount * rate)

  return {
    cardId: 'cathay',
    cardName: CARD_NAMES.cathay,
    planName: plan,
    reward,
    rewardType: '元',
    rewardCash: reward,
    rewardRate: rate,
    isOverLimit: false,
    remainingBudget: null,
  }
}

// ============================================================
// 台新 Richart
// ============================================================

function calcTaishin(input: CalcInput): CardRewardResult {
  const { amount, category, currentPlan } = input
  const plan = currentPlan.taishinPlan
  const config = TAISHIN_PLAN_CONFIG[plan]

  const rate =
    config && config.categories.includes(category)
      ? config.rate
      : TAISHIN_BASE_RATE

  const reward = Math.floor(amount * rate)

  return {
    cardId: 'taishin',
    cardName: CARD_NAMES.taishin,
    planName: plan,
    reward,
    rewardType: '元',
    rewardCash: reward,
    rewardRate: rate,
    isOverLimit: false,
    remainingBudget: null,
  }
}

// ============================================================
// 玉山 Unicard
// ============================================================

function calcEsun(input: CalcInput): CardRewardResult {
  const { amount, category, currentPlan, monthlyUsage } = input
  const plan = currentPlan.esunPlan
  const config = ESUN_PLAN_CONFIG[plan]

  // 判斷是否命中加成通路
  let rate = config.baseRate
  if (plan === '簡單選' && config.bonusCategories.includes(category)) {
    rate = config.bonusRate
  } else if (plan === 'UP選') {
    // UP 選：一般 3%，無特定加成類別（簡化）
    rate = config.baseRate
  }

  const reward = Math.floor(amount * rate)

  // 月上限判斷
  const used = monthlyUsage['esun'] ?? 0
  const limit = config.monthlyLimitPoints
  const remaining = Math.max(0, limit - used)
  const isOverLimit = used >= limit
  const actualReward = Math.min(reward, remaining)

  return {
    cardId: 'esun',
    cardName: CARD_NAMES.esun,
    planName: plan,
    reward: actualReward,
    rewardType: '點',
    rewardCash: actualReward,  // 玉山 1 點 = NT$1
    rewardRate: rate,
    isOverLimit,
    remainingBudget: remaining,
  }
}

// ============================================================
// 永豐大戶 DAWHO
// ============================================================

function calcSinopac(input: CalcInput): CardRewardResult {
  const { amount, category, settings, monthlyUsage } = input

  // 不適用類別
  if (SINOPAC_EXCLUDED_CATEGORIES.includes(category)) {
    return {
      cardId: 'sinopac',
      cardName: CARD_NAMES.sinopac,
      planName: settings.sinopacExpectedLevel,
      reward: 0,
      rewardType: '元',
      rewardCash: 0,
      rewardRate: 0,
      isOverLimit: false,
      remainingBudget: null,
    }
  }

  // 使用「預期等級」計算（供使用者規劃用）
  const levelRates = SINOPAC_LEVEL_RATES[settings.sinopacExpectedLevel]
  const rate =
    category === 'overseas' ? levelRates.overseas : levelRates.domestic

  const reward = Math.floor(amount * rate)

  // 月上限 NT$1,000
  const used = monthlyUsage['sinopac'] ?? 0
  const remaining = Math.max(0, SINOPAC_MONTHLY_LIMIT_NT - used)
  const isOverLimit = used >= SINOPAC_MONTHLY_LIMIT_NT
  const actualReward = Math.min(reward, remaining)

  return {
    cardId: 'sinopac',
    cardName: CARD_NAMES.sinopac,
    planName: settings.sinopacExpectedLevel,
    reward: actualReward,
    rewardType: '元',
    rewardCash: actualReward,
    rewardRate: rate,
    isOverLimit,
    remainingBudget: remaining,
  }
}

// ============================================================
// 中信華航
// ============================================================

function calcCtbc(input: CalcInput): CardRewardResult {
  const { amount, category, settings, monthlyMiles = 0 } = input

  const isOverseas = CTBC_OVERSEAS_CATEGORIES.includes(category)
  const mileRate = isOverseas ? CTBC_OVERSEAS_RATE : CTBC_DOMESTIC_RATE
  const miles = Math.floor(amount * mileRate)

  // 月上限 60,000 哩
  const remaining = Math.max(0, CTBC_MONTHLY_LIMIT_MILES - monthlyMiles)
  const isOverLimit = monthlyMiles >= CTBC_MONTHLY_LIMIT_MILES
  const actualMiles = Math.min(miles, remaining)
  const rewardCash = Math.floor(actualMiles * settings.mileValue)

  return {
    cardId: 'ctbc',
    cardName: CARD_NAMES.ctbc,
    planName: `${settings.ctbcCard}（${isOverseas ? '海外' : '國內'}）`,
    reward: actualMiles,
    rewardType: '哩',
    rewardCash,
    rewardRate: mileRate * settings.mileValue,  // 等效現金回饋率
    isOverLimit,
    remainingBudget: remaining,
  }
}

// ============================================================
// 主計算函式
// ============================================================

export function calculateRewards(input: CalcInput): CardRewardResult[] {
  if (!input.amount || input.amount <= 0) return []

  const disabled = input.settings.disabledCards ?? []

  const results: CardRewardResult[] = [
    calcCathay(input),
    calcTaishin(input),
    calcEsun(input),
    calcSinopac(input),
    calcCtbc(input),
  ].filter((r) => !disabled.includes(r.cardId))

  // 依現金等值回饋降序排列
  return results.sort((a, b) => b.rewardCash - a.rewardCash)
}
