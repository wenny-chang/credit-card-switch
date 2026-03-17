'use client'

import { useState, useMemo, useEffect } from 'react'
import { X, Check } from 'lucide-react'
import { addTransaction, getMonthlyRewardByCard } from '@/lib/db'
import type { CategoryId, CardId, Transaction } from '@/types'
import { CARD_NAMES, CARD_COLORS } from '@/data/cards'
import { useAppStore } from '@/store/useAppStore'
import { calculateRewards } from '@/lib/calculator'

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

const CARD_IDS: CardId[] = ['cathay', 'taishin', 'esun', 'sinopac', 'ctbc']

interface Props {
  initialAmount: number
  initialCategory: CategoryId
  initialMerchant?: string
  initialCardId?: CardId
  initialPlan?: string
  initialReward?: number
  initialRewardType?: '點' | '元' | '哩'
  initialDate?: string
  initialNote?: string
  transactionId?: string  // 若提供則為編輯模式（update）
  onClose: () => void
  onSaved: () => void
}

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export default function AddTransactionModal({
  initialAmount,
  initialCategory,
  initialMerchant = '',
  initialCardId,
  initialPlan = '',
  initialReward = 0,
  initialRewardType = '元',
  initialDate,
  initialNote,
  transactionId,
  onClose,
  onSaved,
}: Props) {
  const { settings, currentPlan } = useAppStore()
  const enabledCardIds = CARD_IDS.filter(
    (id) => !(settings.disabledCards ?? []).includes(id)
  )

  const [merchant, setMerchant] = useState(initialMerchant)
  const [category, setCategory] = useState<CategoryId>(initialCategory)
  const [amount, setAmount] = useState(initialAmount > 0 ? String(initialAmount) : '')
  const [cardId, setCardId] = useState<CardId | undefined>(initialCardId)
  const [date, setDate] = useState(initialDate ?? new Date().toISOString().slice(0, 10))
  const [note, setNote] = useState(initialNote ?? '')
  const [saving, setSaving] = useState(false)
  const [monthlyUsage, setMonthlyUsage] = useState<Record<string, number>>({})

  useEffect(() => {
    const month = new Date().toISOString().slice(0, 7)
    getMonthlyRewardByCard(month).then(setMonthlyUsage)
  }, [])

  const rewardResult = useMemo(() => {
    const num = parseFloat(amount)
    if (!cardId || !num || num <= 0 || !currentPlan) return null
    const results = calculateRewards({
      amount: num,
      category,
      settings,
      currentPlan,
      monthlyUsage,
    })
    return results.find((r) => r.cardId === cardId) ?? null
  }, [cardId, amount, category, settings, currentPlan, monthlyUsage])

  async function handleSave() {
    if (!cardId) return
    const num = parseFloat(amount)
    if (!num || num <= 0) return

    setSaving(true)
    const tx: Transaction = {
      id: transactionId ?? makeId(),
      date,
      merchant: merchant.trim() || '（未填）',
      category,
      amount: num,
      cardId,
      plan: rewardResult?.planName ?? initialPlan,
      reward: rewardResult?.reward ?? initialReward,
      rewardType: rewardResult?.rewardType ?? initialRewardType,
      note: note.trim() || undefined,
    }
    await addTransaction(tx)
    setSaving(false)
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">{transactionId ? '編輯消費' : '記錄消費'}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          {/* Merchant */}
          <div>
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
              商家名稱
            </label>
            <input
              type="text"
              placeholder="例：鼎泰豐、Shopee…"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              className="mt-1.5 w-full px-3 py-2.5 text-sm bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 placeholder:text-gray-300"
            />
          </div>

          {/* Amount + Date */}
          <div className="flex gap-4 items-end min-w-0">
            <div className="flex-1 min-w-0">
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                金額
              </label>
              <div className="flex items-baseline gap-1.5 mt-1.5 border-b border-gray-200 pb-1.5">
                <span className="text-xs text-gray-300 flex-shrink-0">NT$</span>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="min-w-0 w-full text-2xl font-bold text-gray-900 bg-transparent outline-none placeholder:text-gray-200"
                />
              </div>
            </div>
            <div className="flex-shrink-0">
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                日期
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1.5 block w-[130px] text-sm text-gray-700 border-b border-gray-200 pb-1.5 bg-transparent outline-none"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
              消費類別
            </label>
            <div className="flex flex-wrap gap-2 mt-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    category === cat.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 active:bg-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Card selector */}
          <div>
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
              使用卡片
            </label>
            <div className="flex gap-2 mt-2 overflow-x-auto scrollbar-hide pb-1">
              {enabledCardIds.map((id) => (
                <button
                  key={id}
                  onClick={() => setCardId(id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                    cardId === id
                      ? 'border-transparent text-white'
                      : 'border-gray-200 text-gray-600 bg-white'
                  }`}
                  style={cardId === id ? { backgroundColor: CARD_COLORS[id] } : {}}
                >
                  {cardId === id && <Check size={12} />}
                  {CARD_NAMES[id]}
                </button>
              ))}
            </div>
          </div>

          {/* Reward preview */}
          {rewardResult && rewardResult.reward > 0 && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 flex justify-between items-center">
              <span className="text-sm text-emerald-700">預計回饋</span>
              <span className="text-sm font-bold text-emerald-700">
                +{rewardResult.reward.toLocaleString()} {rewardResult.rewardType}
                {rewardResult.planName && (
                  <span className="font-normal text-emerald-500 ml-1.5">
                    ({rewardResult.planName})
                  </span>
                )}
              </span>
            </div>
          )}

          {/* Note */}
          <div>
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
              備註（選填）
            </label>
            <input
              type="text"
              placeholder="例：出差報帳、生日餐廳…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-1.5 w-full px-3 py-2.5 text-sm bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 placeholder:text-gray-300"
            />
          </div>
        </div>

        {/* Save button */}
        <div className="px-5 pb-28 pt-2">
          <button
            onClick={handleSave}
            disabled={!cardId || !parseFloat(amount) || saving}
            className="w-full py-3.5 bg-blue-600 text-white font-semibold rounded-xl disabled:opacity-30 active:bg-blue-700 transition-all text-sm"
          >
            {saving ? '儲存中…' : '儲存紀錄'}
          </button>
        </div>
      </div>
    </div>
  )
}
