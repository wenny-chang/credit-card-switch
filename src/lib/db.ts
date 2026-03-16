import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Transaction, MonthlyPlan, PlanChangeHistory, AppSettings } from '@/types'

// ============================================================
// Schema
// ============================================================

interface AppDB extends DBSchema {
  transactions: {
    key: string
    value: Transaction
    indexes: {
      'by-date': string
      'by-card': string
      'by-month': string  // "2026-03"
    }
  }
  monthlyPlans: {
    key: string  // "2026-03"
    value: MonthlyPlan
  }
  planHistory: {
    key: string
    value: PlanChangeHistory
    indexes: {
      'by-card': string
      'by-timestamp': string
    }
  }
  settings: {
    key: 'app'
    value: AppSettings
  }
}

const DB_NAME = 'credit-card-switch'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase<AppDB>> | null = null

function getDB(): Promise<IDBPDatabase<AppDB>> {
  if (!dbPromise) {
    dbPromise = openDB<AppDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // transactions
        const txStore = db.createObjectStore('transactions', { keyPath: 'id' })
        txStore.createIndex('by-date', 'date')
        txStore.createIndex('by-card', 'cardId')
        txStore.createIndex('by-month', 'date')  // slice to "YYYY-MM" in queries

        // monthlyPlans
        db.createObjectStore('monthlyPlans', { keyPath: 'month' })

        // planHistory
        const histStore = db.createObjectStore('planHistory', { keyPath: 'id' })
        histStore.createIndex('by-card', 'cardId')
        histStore.createIndex('by-timestamp', 'timestamp')

        // settings
        db.createObjectStore('settings')
      },
    })
  }
  return dbPromise
}

// ============================================================
// Helpers
// ============================================================

function toMonth(date: string): string {
  return date.slice(0, 7)  // "2026-03-16" → "2026-03"
}

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7)
}

// ============================================================
// Settings
// ============================================================

const DEFAULT_SETTINGS: AppSettings = {
  cathayLevel: 'L2',
  taishinLevel: 'L2',
  sinopacLevel: '大戶Plus',
  sinopacExpectedLevel: '大戶Plus',
  ctbcCard: '璀璨無限',
  mileValue: 0.55,
  resetDay: 1,
}

export async function getSettings(): Promise<AppSettings> {
  const db = await getDB()
  const settings = await db.get('settings', 'app')
  return settings ?? DEFAULT_SETTINGS
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const db = await getDB()
  await db.put('settings', settings, 'app')
}

// ============================================================
// Monthly Plans
// ============================================================

const DEFAULT_MONTHLY_PLAN = (month: string): MonthlyPlan => ({
  month,
  cathayPlan: '樂饗購',
  taishinPlan: '餐飲',
  esunPlan: 'UP選',
  esunUpSwitch: false,
})

export async function getMonthlyPlan(month?: string): Promise<MonthlyPlan> {
  const db = await getDB()
  const m = month ?? currentMonth()
  const plan = await db.get('monthlyPlans', m)
  return plan ?? DEFAULT_MONTHLY_PLAN(m)
}

export async function saveMonthlyPlan(plan: MonthlyPlan): Promise<void> {
  const db = await getDB()
  await db.put('monthlyPlans', plan)
}

// ============================================================
// Transactions
// ============================================================

export async function addTransaction(tx: Transaction): Promise<void> {
  const db = await getDB()
  await db.put('transactions', tx)
}

export async function getTransactionsByMonth(month: string): Promise<Transaction[]> {
  const db = await getDB()
  const all = await db.getAll('transactions')
  return all
    .filter(tx => toMonth(tx.date) === month)
    .sort((a, b) => b.date.localeCompare(a.date))
}

export async function deleteTransaction(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('transactions', id)
}

// ============================================================
// Plan Change History
// ============================================================

export async function addPlanHistory(entry: PlanChangeHistory): Promise<void> {
  const db = await getDB()
  await db.put('planHistory', entry)
}

export async function getPlanHistory(limit = 100): Promise<PlanChangeHistory[]> {
  const db = await getDB()
  const all = await db.getAll('planHistory')
  return all
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, limit)
}

// ============================================================
// Month Summary
// ============================================================

export interface MonthSummaryData {
  totalCash: number
  totalMiles: number
  totalTransactions: number
}

export async function getMonthSummary(month: string): Promise<MonthSummaryData> {
  const txs = await getTransactionsByMonth(month)

  let totalCash = 0
  let totalMiles = 0

  for (const tx of txs) {
    if (tx.rewardType === '哩') {
      totalMiles += tx.reward
    } else {
      // 點 or 元 → 1:1 現金
      totalCash += tx.reward
    }
  }

  return {
    totalCash,
    totalMiles,
    totalTransactions: txs.length,
  }
}

// 取得某月各卡累積回饋（用於判斷是否接近上限）
export async function getMonthlyRewardByCard(
  month: string
): Promise<Record<string, number>> {
  const txs = await getTransactionsByMonth(month)
  const result: Record<string, number> = {}

  for (const tx of txs) {
    if (!result[tx.cardId]) result[tx.cardId] = 0
    if (tx.rewardType !== '哩') {
      result[tx.cardId] += tx.reward
    }
  }

  return result
}

// ============================================================
// Export / Clear
// ============================================================

export async function exportAllData(): Promise<string> {
  const db = await getDB()
  const [settings, transactions, planHistory] = await Promise.all([
    db.get('settings', 'app'),
    db.getAll('transactions'),
    db.getAll('planHistory'),
  ])
  const monthlyPlans = await db.getAll('monthlyPlans')

  return JSON.stringify({ settings, transactions, monthlyPlans, planHistory }, null, 2)
}

export async function clearAllData(): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(['transactions', 'monthlyPlans', 'planHistory', 'settings'], 'readwrite')
  await Promise.all([
    tx.objectStore('transactions').clear(),
    tx.objectStore('monthlyPlans').clear(),
    tx.objectStore('planHistory').clear(),
    tx.objectStore('settings').clear(),
  ])
  await tx.done
}
