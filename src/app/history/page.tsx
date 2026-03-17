'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Search, Trash2, Pencil, ChevronRight, X, ClipboardList, List, BarChart2 } from 'lucide-react'
import Link from 'next/link'
import { getTransactionsByMonth, deleteTransaction } from '@/lib/db'
import type { Transaction, CardId } from '@/types'
import { CARD_NAMES, CARD_COLORS } from '@/data/cards'
import AddTransactionModal from '@/components/modals/AddTransactionModal'

// ── 常數 ─────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  dining: '餐飲',
  shopping: '網購',
  department: '百貨',
  supermarket: '超市賣場',
  convenience: '超商',
  gas: '加油',
  transport: '交通',
  parking: '停車',
  ev: '充電',
  digital: '數位/訂閱',
  travel: '旅遊',
  overseas: '海外消費',
  insurance: '保費',
  other: '一般消費',
}

// ── 工具函式 ─────────────────────────────────────────────────

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7)
}

function monthLabel(): string {
  const d = new Date()
  return `${d.getMonth() + 1} 月份`
}

function groupByDate(txs: Transaction[]): Record<string, Transaction[]> {
  return txs.reduce((acc, tx) => {
    if (!acc[tx.date]) acc[tx.date] = []
    acc[tx.date].push(tx)
    return acc
  }, {} as Record<string, Transaction[]>)
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return '今天'
  if (d.toDateString() === yesterday.toDateString()) return '昨天'
  return `${d.getMonth() + 1} 月 ${d.getDate()} 日`
}

// ── 主頁面 ───────────────────────────────────────────────────

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'chart'>('list')

  const load = useCallback(async () => {
    const txs = await getTransactionsByMonth(currentMonth())
    setTransactions(txs)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleDelete(id: string) {
    if (!confirm('確定要刪除這筆紀錄？')) return
    await deleteTransaction(id)
    await load()
  }

  const filtered = transactions.filter((tx) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      tx.merchant.toLowerCase().includes(q) ||
      (CATEGORY_LABELS[tx.category] ?? '').includes(q) ||
      (CARD_NAMES[tx.cardId] ?? '').toLowerCase().includes(q)
    )
  })

  // id 格式為 `${Date.now()}-xxx`，降序即最新在最前
  const sorted = [...filtered].sort((a, b) => b.id.localeCompare(a.id))
  const grouped = groupByDate(sorted)
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  const totalCash = transactions
    .filter((tx) => tx.rewardType !== '哩')
    .reduce((s, tx) => s + tx.reward, 0)
  const totalMiles = transactions
    .filter((tx) => tx.rewardType === '哩')
    .reduce((s, tx) => s + tx.reward, 0)

  // ── 圖表資料 ──────────────────────────────────────────────
  const categoryTotals = transactions.reduce((acc, tx) => {
    acc[tx.category] = (acc[tx.category] ?? 0) + tx.amount
    return acc
  }, {} as Record<string, number>)
  const categoryChart = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a)
  const maxCategoryAmount = categoryChart[0]?.[1] ?? 1

  const cardTotalsMap = transactions.reduce((acc, tx) => {
    if (!acc[tx.cardId]) acc[tx.cardId] = { cash: 0, miles: 0 }
    if (tx.rewardType === '哩') acc[tx.cardId].miles += tx.reward
    else acc[tx.cardId].cash += tx.reward
    return acc
  }, {} as Record<string, { cash: number; miles: number }>)
  const cashCardChart = Object.entries(cardTotalsMap)
    .filter(([, v]) => v.cash > 0)
    .sort(([, a], [, b]) => b.cash - a.cash)
  const milesCardChart = Object.entries(cardTotalsMap)
    .filter(([, v]) => v.miles > 0)
    .sort(([, a], [, b]) => b.miles - a.miles)
  const maxCash = cashCardChart[0]?.[1].cash ?? 1
  const maxMiles = milesCardChart[0]?.[1].miles ?? 1

  return (
    <div>
      {/* Header */}
      <div className="px-5 pt-8 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">消費歷史</h1>
            <p className="text-sm text-gray-400 mt-0.5">{monthLabel()}</p>
            <Link
              href="/history/plans"
              className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium bg-blue-50 px-3 py-1.5 rounded-full mt-2"
            >
              切換歷史 <ChevronRight size={12} />
            </Link>
          </div>
          <div className="flex items-center gap-2">
            {transactions.length > 0 && (
              <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('list')}
                  className={`w-8 h-8 flex items-center justify-center rounded-md transition cursor-pointer ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`}
                >
                  <List size={15} />
                </button>
                <button
                  onClick={() => setViewMode('chart')}
                  className={`w-8 h-8 flex items-center justify-center rounded-md transition cursor-pointer ${viewMode === 'chart' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`}
                >
                  <BarChart2 size={15} />
                </button>
              </div>
            )}
            <button
              onClick={() => setShowModal(true)}
              className="w-11 h-11 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-sm active:scale-95 transition cursor-pointer"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Summary chips */}
        <div className="flex gap-2 mt-4">
          <div className="bg-white rounded-xl border border-gray-100 px-4 py-2.5 flex-1 text-center">
            <div className="text-xs text-gray-400 mb-0.5">本月回饋</div>
            <div className="font-bold text-gray-900">+{totalCash.toLocaleString()} 元</div>
          </div>
          {totalMiles > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 px-4 py-2.5 flex-1 text-center">
              <div className="text-xs text-gray-400 mb-0.5">累積哩程</div>
              <div className="font-bold text-gray-900">+{totalMiles.toLocaleString()} 哩</div>
            </div>
          )}
          <div className="bg-white rounded-xl border border-gray-100 px-4 py-2.5 flex-1 text-center">
            <div className="text-xs text-gray-400 mb-0.5">筆數</div>
            <div className="font-bold text-gray-900">{transactions.length} 筆</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-5 mb-4">
        <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-3 py-2.5">
          <Search size={16} className="text-gray-300 flex-shrink-0" />
          <input
            type="text"
            placeholder="搜尋商家、類別、卡片…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none text-gray-900 placeholder:text-gray-300"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-gray-300 cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Chart Mode */}
      {viewMode === 'chart' && transactions.length > 0 && (
        <div className="px-5 space-y-6 pb-6">
          {/* Category spending */}
          <div>
            <div className="text-sm font-semibold text-gray-700 mb-3">消費類別分布</div>
            <div className="space-y-2.5">
              {categoryChart.map(([catId, amount]) => (
                <div key={catId}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">{CATEGORY_LABELS[catId] ?? catId}</span>
                    <span className="text-gray-900 font-medium">NT${amount.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-400 rounded-full transition-all"
                      style={{ width: `${(amount / maxCategoryAmount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card cash/points rewards */}
          {cashCardChart.length > 0 && (
            <div>
              <div className="text-sm font-semibold text-gray-700 mb-3">各卡回饋總計（元／點）</div>
              <div className="space-y-2.5">
                {cashCardChart.map(([cardId, totals]) => (
                  <div key={cardId}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">{CARD_NAMES[cardId as CardId] ?? cardId}</span>
                      <span className="text-gray-900 font-medium">+{totals.cash.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(totals.cash / maxCash) * 100}%`,
                          backgroundColor: CARD_COLORS[cardId as CardId] ?? '#e5e7eb',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Card miles rewards */}
          {milesCardChart.length > 0 && (
            <div>
              <div className="text-sm font-semibold text-gray-700 mb-3">各卡回饋總計（哩）</div>
              <div className="space-y-2.5">
                {milesCardChart.map(([cardId, totals]) => (
                  <div key={cardId}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">{CARD_NAMES[cardId as CardId] ?? cardId}</span>
                      <span className="text-gray-900 font-medium">+{totals.miles.toLocaleString()} 哩</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(totals.miles / maxMiles) * 100}%`,
                          backgroundColor: CARD_COLORS[cardId as CardId] ?? '#e5e7eb',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* List / Empty state */}
      {transactions.length === 0 ? (
        <div className="px-5 mt-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-50 mb-4">
            <ClipboardList size={28} className="text-gray-200" />
          </div>
          <p className="text-gray-300 text-sm">本月尚無消費紀錄</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium active:bg-blue-700 transition cursor-pointer"
          >
            新增第一筆
          </button>
        </div>
      ) : viewMode === 'list' && filtered.length === 0 ? (
        <div className="px-5 mt-16 text-center">
          <p className="text-gray-300 text-sm">找不到符合的紀錄</p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="px-5 space-y-5 pb-6">
          {dates.map((date) => (
            <div key={date}>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                {formatDate(date)}
              </div>
              <div className="space-y-2">
                {grouped[date].map((tx) => (
                  <div
                    key={tx.id}
                    className="bg-white rounded-xl border border-gray-100 flex items-stretch overflow-hidden"
                  >
                    {/* Left color bar */}
                    <div
                      className="w-1 flex-shrink-0"
                      style={{ backgroundColor: CARD_COLORS[tx.cardId] ?? '#e5e7eb' }}
                    />
                    <div className="flex-1 flex items-center gap-2 px-3 py-2.5 min-w-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          {tx.merchant !== '（未填）' ? (
                            <>
                              <span className="font-semibold text-gray-900 text-sm truncate">
                                {tx.merchant}
                              </span>
                              <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded flex-shrink-0">
                                {CATEGORY_LABELS[tx.category] ?? tx.category}
                              </span>
                            </>
                          ) : (
                            <span className="text-sm text-gray-400 truncate">
                              {CATEGORY_LABELS[tx.category] ?? tx.category}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {CARD_NAMES[tx.cardId]} · {tx.plan}
                        </div>
                        {tx.note && (
                          <div className="text-xs text-gray-400 mt-0.5 truncate">
                            {tx.note}
                          </div>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-semibold text-gray-900">
                          NT${tx.amount.toLocaleString()}
                        </div>
                        <div className="text-xs text-emerald-600 font-medium mt-0.5">
                          +{tx.reward.toLocaleString()} {tx.rewardType}
                        </div>
                      </div>
                      <div className="flex flex-row gap-0 flex-shrink-0">
                        <button
                          onClick={() => setEditingTx(tx)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-300 active:text-blue-500 active:bg-blue-50 transition cursor-pointer"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-300 active:text-red-400 active:bg-red-50 transition cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Add Transaction Modal */}
      {showModal && (
        <AddTransactionModal
          initialAmount={0}
          initialCategory="dining"
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); load() }}
        />
      )}

      {/* Edit Transaction Modal */}
      {editingTx && (
        <AddTransactionModal
          transactionId={editingTx.id}
          initialAmount={editingTx.amount}
          initialCategory={editingTx.category}
          initialMerchant={editingTx.merchant === '（未填）' ? '' : editingTx.merchant}
          initialCardId={editingTx.cardId}
          initialDate={editingTx.date}
          initialNote={editingTx.note}
          initialPlan={editingTx.plan}
          initialReward={editingTx.reward}
          initialRewardType={editingTx.rewardType}
          onClose={() => setEditingTx(null)}
          onSaved={() => { setEditingTx(null); load() }}
        />
      )}
    </div>
  )
}
