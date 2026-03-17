'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  TrendingUp,
  AlertCircle,
  Zap,
  ChevronDown,
  Search,
  X,
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { calculateRewards } from '@/lib/calculator'
import { matchCategory, useDebounce } from '@/lib/search'
import { getMonthlyRewardByCard } from '@/lib/db'
import type { CategoryId, CardRewardResult } from '@/types'
import { CARD_COLORS } from '@/data/cards'
import AddTransactionModal from '@/components/modals/AddTransactionModal'

// ── 類別清單 ─────────────────────────────────────────────────
const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: 'dining', label: '餐飲' },
  { id: 'shopping', label: '網購' },
  { id: 'department', label: '百貨' },
  { id: 'supermarket', label: '超市賣場' },
  { id: 'convenience', label: '超商' },
  { id: 'gas', label: '加油' },
  { id: 'transport', label: '交通' },
  { id: 'parking', label: '停車' },
  { id: 'ev', label: '充電' },
  { id: 'digital', label: '數位/訂閱' },
  { id: 'travel', label: '旅遊' },
  { id: 'overseas', label: '海外消費' },
  { id: 'insurance', label: '保費' },
  { id: 'other', label: '一般消費' },
]

// ── 格式化回饋 ───────────────────────────────────────────────
function fmtReward(r: CardRewardResult): string {
  if (r.rewardType === '哩') return `${r.reward.toLocaleString()} 哩`
  return `+${r.rewardCash.toLocaleString()}`
}

function fmtRate(r: CardRewardResult): string {
  const pct = (r.rewardRate * 100).toFixed(1)
  if (r.rewardType === '哩') return `≈ ${pct}% (哩程)`
  return `${pct}%`
}

// ── 主頁 ─────────────────────────────────────────────────────
export default function HomePage() {
  const { settings, settingsLoaded, currentPlan, planLoaded, loadSettings, loadCurrentPlan } =
    useAppStore()

  // 本地搜尋狀態
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<CategoryId>('dining')
  const [merchantText, setMerchantText] = useState('')
  const [showAllCats, setShowAllCats] = useState(false)
  const [results, setResults] = useState<CardRewardResult[]>([])
  const [monthlyUsage, setMonthlyUsage] = useState<Record<string, number>>({})
  const [showModal, setShowModal] = useState(false)

  // debounce 金額輸入 300ms
  const debouncedAmount = useDebounce(amount, 300)

  // 載入 store + 月累積資料
  useEffect(() => {
    loadSettings()
    loadCurrentPlan()
  }, [loadSettings, loadCurrentPlan])

  useEffect(() => {
    const month = new Date().toISOString().slice(0, 7)
    getMonthlyRewardByCard(month).then(setMonthlyUsage)
  }, [])

  // 文字搜尋自動 match 類別
  useEffect(() => {
    if (!merchantText.trim()) return
    const matched = matchCategory(merchantText)
    if (matched) setCategory(matched)
  }, [merchantText])

  // 自動計算
  const runCalc = useCallback(() => {
    const num = parseFloat(debouncedAmount)
    if (!num || num <= 0 || !settingsLoaded || !planLoaded || !currentPlan) {
      setResults([])
      return
    }
    const res = calculateRewards({
      amount: num,
      category,
      settings,
      currentPlan,
      monthlyUsage,
    })
    setResults(res)
  }, [debouncedAmount, category, settings, currentPlan, settingsLoaded, planLoaded, monthlyUsage])

  useEffect(() => { runCalc() }, [runCalc])

  const numAmount = parseFloat(amount) || 0
  const best = results[0]
  const visibleCats = showAllCats ? CATEGORIES : CATEGORIES.slice(0, 6)

  return (
    <div>
      {/* Header */}
      <div className="px-5 pt-8 pb-4">
        <div className="flex items-center gap-1.5 mb-1">
          <Zap size={14} className="text-blue-600" fill="currentColor" />
          <span className="text-[11px] font-bold text-blue-600 tracking-widest uppercase">
            Smart Pick
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">刷哪張？</h1>
      </div>

      {/* Input Card */}
      <div className="mx-5 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">

        {/* 文字搜尋 */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
          <input
            type="text"
            placeholder="輸入商家名稱自動選類別…"
            value={merchantText}
            onChange={(e) => setMerchantText(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 text-sm bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 placeholder:text-gray-300"
          />
          {merchantText && (
            <button
              onClick={() => setMerchantText('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* 金額 */}
        <div>
          <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
            消費金額
          </label>
          <div className="flex items-baseline mt-1.5 gap-2">
            <span className="text-xl font-light text-gray-300">NT$</span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 min-w-0 text-4xl font-bold text-gray-900 bg-transparent outline-none placeholder:text-gray-200"
            />
          </div>
          <div className="h-px bg-gray-100 mt-3" />
        </div>

        {/* 類別 chips */}
        <div>
          <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
            消費類別
          </label>
          <div className="flex flex-wrap gap-2 mt-2">
            {visibleCats.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
                  category === cat.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 active:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
            <button
              onClick={() => setShowAllCats((v) => !v)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-50 text-gray-400 border border-dashed border-gray-200"
            >
              <ChevronDown
                size={13}
                className={`transition-transform ${showAllCats ? 'rotate-180' : ''}`}
              />
              {showAllCats ? '收合' : '更多'}
            </button>
          </div>
        </div>

      </div>

      {/* Results */}
      {results.length > 0 && numAmount > 0 ? (
        <div className="mx-5 mt-4 space-y-2.5 pb-4">
          {/* Best card banner */}
          <div
            className="rounded-2xl p-5 text-white"
            style={{
              background: `linear-gradient(135deg, ${CARD_COLORS[best.cardId]}bb, ${CARD_COLORS[best.cardId]})`,
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <TrendingUp size={12} />
                  <span className="text-[10px] font-bold opacity-70 uppercase tracking-widest">
                    最佳選擇
                  </span>
                </div>
                <div className="text-xl font-bold truncate">{best.cardName}</div>
                <div className="text-sm opacity-75 mt-0.5 truncate">{best.planName}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-3xl font-bold">{fmtReward(best)}</div>
                <div className="text-xs opacity-70 mt-0.5">{fmtRate(best)}</div>
              </div>
            </div>
          </div>

          {/* Other cards */}
          {results.slice(1).map((r) => (
            <div
              key={r.cardId}
              className={`bg-white rounded-xl border p-4 flex items-center justify-between gap-3 ${
                r.isOverLimit ? 'border-amber-200' : 'border-gray-100'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-1 h-10 rounded-full flex-shrink-0"
                  style={{ backgroundColor: CARD_COLORS[r.cardId] }}
                />
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 text-sm truncate">
                    {r.cardName}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5 truncate">{r.planName}</div>
                  {r.isOverLimit && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-amber-500">
                      <AlertCircle size={10} />
                      已達月上限
                    </div>
                  )}
                  {!r.isOverLimit && r.remainingBudget !== null && r.remainingBudget < 300 && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-amber-500">
                      <AlertCircle size={10} />
                      月上限剩 {r.remainingBudget}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className={`font-bold text-sm ${r.isOverLimit ? 'text-amber-500' : 'text-gray-900'}`}>
                  {fmtReward(r)}
                </div>
                <div className="text-xs text-gray-400">{fmtRate(r)}</div>
              </div>
            </div>
          ))}

          {/* Log button */}
          <button
            onClick={() => setShowModal(true)}
            className="w-full py-3 border-2 border-dashed border-gray-200 text-gray-400 rounded-xl text-sm font-medium active:border-blue-300 active:text-blue-500 transition-all duration-150"
          >
            + 記錄這筆消費
          </button>
        </div>
      ) : (
        numAmount <= 0 && (
          <div className="mx-5 mt-10 text-center">
            <div className="text-5xl mb-3">💳</div>
            <p className="text-gray-300 text-sm">輸入金額後查看各卡回饋比較</p>
          </div>
        )
      )}

      {/* Add Transaction Modal */}
      {showModal && (
        <AddTransactionModal
          initialAmount={numAmount}
          initialCategory={category}
          initialMerchant={merchantText}
          initialCardId={best?.cardId}
          initialPlan={best?.planName}
          initialReward={best?.rewardCash ?? 0}
          initialRewardType={best?.rewardType ?? '元'}
          onClose={() => setShowModal(false)}
          onSaved={() => {
            setShowModal(false)
            // 重新載入月累積
            const month = new Date().toISOString().slice(0, 7)
            getMonthlyRewardByCard(month).then(setMonthlyUsage)
          }}
        />
      )}
    </div>
  )
}
