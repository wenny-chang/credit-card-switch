'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Search, Trash2, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { getTransactionsByMonth, deleteTransaction } from '@/lib/db'
import type { Transaction } from '@/types'
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

  const grouped = groupByDate(filtered)
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  const totalCash = transactions
    .filter((tx) => tx.rewardType !== '哩')
    .reduce((s, tx) => s + tx.reward, 0)
  const totalMiles = transactions
    .filter((tx) => tx.rewardType === '哩')
    .reduce((s, tx) => s + tx.reward, 0)

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
          <button
            onClick={() => setShowModal(true)}
            className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-sm active:scale-95 transition"
          >
            <Plus size={20} />
          </button>
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
              className="text-gray-300 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* List / Empty state */}
      {transactions.length === 0 ? (
        <div className="px-5 mt-16 text-center">
          <div className="text-5xl mb-3">📋</div>
          <p className="text-gray-300 text-sm">本月尚無消費紀錄</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium active:bg-blue-700 transition"
          >
            新增第一筆
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="px-5 mt-16 text-center">
          <p className="text-gray-300 text-sm">找不到符合的紀錄</p>
        </div>
      ) : (
        <div className="px-5 space-y-5 pb-4">
          {dates.map((date) => (
            <div key={date}>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                {formatDate(date)}
              </div>
              <div className="space-y-2">
                {grouped[date].map((tx) => (
                  <div
                    key={tx.id}
                    className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3"
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: CARD_COLORS[tx.cardId] ?? '#999' }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 text-sm truncate">
                          {tx.merchant}
                        </span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md flex-shrink-0">
                          {CATEGORY_LABELS[tx.category] ?? tx.category}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {CARD_NAMES[tx.cardId]} · {tx.plan}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-semibold text-gray-900">
                        NT${tx.amount.toLocaleString()}
                      </div>
                      <div className="text-xs text-emerald-600 font-medium mt-0.5">
                        +{tx.reward.toLocaleString()} {tx.rewardType}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(tx.id)}
                      className="ml-1 w-7 h-7 flex items-center justify-center rounded-full text-gray-300 active:text-red-400 active:bg-red-50 transition flex-shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Transaction Modal */}
      {showModal && (
        <AddTransactionModal
          initialAmount={0}
          initialCategory="dining"
          onClose={() => setShowModal(false)}
          onSaved={() => {
            setShowModal(false)
            load()
          }}
        />
      )}
    </div>
  )
}
