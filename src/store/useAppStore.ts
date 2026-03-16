import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  AppSettings,
  MonthlyPlan,
  CategoryId,
  CardRewardResult,
  CathayPlan,
  TaishinPlan,
  EsunPlan,
  SinopacLevel,
} from '@/types'
import {
  getSettings,
  saveSettings,
  getMonthlyPlan,
  saveMonthlyPlan,
  addPlanHistory,
} from '@/lib/db'

// ============================================================
// Search State
// ============================================================

interface SearchState {
  amount: string           // 輸入金額（字串，避免 leading zero 問題）
  category: CategoryId | null
  merchantText: string     // 文字搜尋欄
  results: CardRewardResult[]
  isCalculating: boolean
}

// ============================================================
// Store Shape
// ============================================================

interface AppStore {
  // ── 設定（從 IndexedDB 載入）──
  settings: AppSettings
  settingsLoaded: boolean
  loadSettings: () => Promise<void>
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>

  // ── 當月方案（從 IndexedDB 載入）──
  currentPlan: MonthlyPlan | null
  planLoaded: boolean
  loadCurrentPlan: () => Promise<void>
  updateCathayPlan: (plan: CathayPlan) => Promise<void>
  updateTaishinPlan: (plan: TaishinPlan) => Promise<void>
  updateEsunPlan: (plan: EsunPlan) => Promise<void>
  updateSinopacLevel: (level: SinopacLevel) => Promise<void>

  // ── 搜尋狀態（純記憶體）──
  search: SearchState
  setAmount: (amount: string) => void
  setCategory: (category: CategoryId | null) => void
  setMerchantText: (text: string) => void
  setResults: (results: CardRewardResult[]) => void
  setCalculating: (v: boolean) => void
  resetSearch: () => void
}

// ============================================================
// Defaults
// ============================================================

const DEFAULT_SETTINGS: AppSettings = {
  disabledCards: [],
  cathayLevel: 'L2',
  taishinLevel: 'L2',
  sinopacLevel: '大戶Plus',
  sinopacExpectedLevel: '大戶Plus',
  ctbcCard: '璀璨無限',
  mileValue: 0.55,
  resetDay: 1,
}

const DEFAULT_SEARCH: SearchState = {
  amount: '',
  category: null,
  merchantText: '',
  results: [],
  isCalculating: false,
}

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7)
}

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

// ============================================================
// Store
// ============================================================

export const useAppStore = create<AppStore>()((set, get) => ({
  // ── Settings ──────────────────────────────────────────────

  settings: DEFAULT_SETTINGS,
  settingsLoaded: false,

  loadSettings: async () => {
    const settings = await getSettings()
    set({ settings, settingsLoaded: true })
  },

  updateSettings: async (patch) => {
    const next = { ...get().settings, ...patch }
    set({ settings: next })
    await saveSettings(next)
  },

  // ── Monthly Plan ──────────────────────────────────────────

  currentPlan: null,
  planLoaded: false,

  loadCurrentPlan: async () => {
    const plan = await getMonthlyPlan(currentMonth())
    set({ currentPlan: plan, planLoaded: true })
  },

  updateCathayPlan: async (plan) => {
    const current = get().currentPlan
    if (!current) return
    const prev = current.cathayPlan
    if (prev === plan) return
    const next = { ...current, cathayPlan: plan }
    set({ currentPlan: next })
    await saveMonthlyPlan(next)
    await addPlanHistory({
      id: makeId(),
      timestamp: new Date().toISOString(),
      cardId: 'cathay',
      changeType: 'plan',
      fromValue: prev,
      toValue: plan,
      isAutomatic: false,
    })
  },

  updateTaishinPlan: async (plan) => {
    const current = get().currentPlan
    if (!current) return
    const prev = current.taishinPlan
    if (prev === plan) return
    const next = { ...current, taishinPlan: plan }
    set({ currentPlan: next })
    await saveMonthlyPlan(next)
    await addPlanHistory({
      id: makeId(),
      timestamp: new Date().toISOString(),
      cardId: 'taishin',
      changeType: 'plan',
      fromValue: prev,
      toValue: plan,
      isAutomatic: false,
    })
  },

  updateEsunPlan: async (plan) => {
    const current = get().currentPlan
    if (!current) return
    const prev = current.esunPlan
    if (prev === plan) return
    // 一旦切換至 UP 選，標記本月已切換
    const esunUpSwitch = plan === 'UP選' ? true : current.esunUpSwitch
    const next = { ...current, esunPlan: plan, esunUpSwitch }
    set({ currentPlan: next })
    await saveMonthlyPlan(next)
    await addPlanHistory({
      id: makeId(),
      timestamp: new Date().toISOString(),
      cardId: 'esun',
      changeType: 'plan',
      fromValue: prev,
      toValue: plan,
      isAutomatic: false,
    })
  },

  updateSinopacLevel: async (level) => {
    const current = get().settings
    const prev = current.sinopacLevel
    if (prev === level) return
    await get().updateSettings({ sinopacLevel: level })
    await addPlanHistory({
      id: makeId(),
      timestamp: new Date().toISOString(),
      cardId: 'sinopac',
      changeType: 'level',
      fromValue: prev,
      toValue: level,
      isAutomatic: false,
    })
  },

  // ── Search ────────────────────────────────────────────────

  search: DEFAULT_SEARCH,

  setAmount: (amount) =>
    set((s) => ({ search: { ...s.search, amount } })),

  setCategory: (category) =>
    set((s) => ({ search: { ...s.search, category } })),

  setMerchantText: (merchantText) =>
    set((s) => ({ search: { ...s.search, merchantText } })),

  setResults: (results) =>
    set((s) => ({ search: { ...s.search, results, isCalculating: false } })),

  setCalculating: (isCalculating) =>
    set((s) => ({ search: { ...s.search, isCalculating } })),

  resetSearch: () => set({ search: DEFAULT_SEARCH }),
}))
