'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { getPlanHistory } from '@/lib/db'
import type { PlanChangeHistory, CardId } from '@/types'

// ── 常數 ─────────────────────────────────────────────────────

const CARD_COLORS: Record<CardId, string> = {
  cathay: '#00693e',
  taishin: '#c41230',
  esun: '#d4860a',
  sinopac: '#005baa',
  ctbc: '#b91c1c',
}

const CARD_NAMES: Record<CardId, string> = {
  cathay: '國泰 CUBE',
  taishin: '台新 Richart',
  esun: '玉山 Unicard',
  sinopac: '永豐大戶',
  ctbc: '中信華航',
}

const ALL_CARD_IDS: CardId[] = ['cathay', 'taishin', 'esun', 'sinopac', 'ctbc']

// ── 時間格式化 ────────────────────────────────────────────────

function formatTimestamp(iso: string): string {
  const d = new Date(iso)
  const mm = d.getMonth() + 1
  const dd = d.getDate()
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${mm}/${dd} ${hh}:${min}`
}

// ── 主頁面 ───────────────────────────────────────────────────

export default function PlanHistoryPage() {
  const [history, setHistory] = useState<PlanChangeHistory[]>([])
  const [filterCard, setFilterCard] = useState<CardId | 'all'>('all')

  useEffect(() => {
    getPlanHistory(200).then(setHistory)
  }, [])

  const filtered =
    filterCard === 'all'
      ? history
      : history.filter((h) => h.cardId === filterCard)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <Link
            href="/history"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500"
          >
            <ChevronLeft size={18} />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">切換歷史</h1>
        </div>
        <p className="text-sm text-gray-400">方案與等級的變更紀錄</p>
      </div>

      {/* Card filter */}
      <div className="px-5 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterCard('all')}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filterCard === 'all'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            全部
          </button>
          {ALL_CARD_IDS.map((id) => (
            <button
              key={id}
              onClick={() => setFilterCard(id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filterCard === id ? 'text-white' : 'bg-gray-100 text-gray-600'
              }`}
              style={filterCard === id ? { backgroundColor: CARD_COLORS[id] } : {}}
            >
              {CARD_NAMES[id]}
            </button>
          ))}
        </div>
      </div>

      {/* History list */}
      {filtered.length === 0 ? (
        <div className="px-5 mt-16 text-center">
          <div className="text-5xl mb-3">🔄</div>
          <p className="text-gray-300 text-sm">尚無切換紀錄</p>
          <p className="text-gray-200 text-xs mt-1">
            在「我的卡」頁面切換方案後，紀錄會顯示在這裡
          </p>
        </div>
      ) : (
        <div className="px-5 space-y-2.5 pb-6">
          {filtered.map((entry) => (
            <div
              key={entry.id}
              className="bg-white rounded-xl border border-gray-100 p-4 flex items-start gap-3"
            >
              {/* Card color bar */}
              <div
                className="w-1 rounded-full flex-shrink-0 self-stretch"
                style={{ backgroundColor: CARD_COLORS[entry.cardId] }}
              />

              <div className="flex-1 min-w-0">
                {/* Card name + type badge */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-gray-900">
                    {CARD_NAMES[entry.cardId]}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                      entry.changeType === 'plan'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-purple-100 text-purple-600'
                    }`}
                  >
                    {entry.changeType === 'plan' ? '方案' : '等級'}
                  </span>
                  {entry.isAutomatic && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                      自動
                    </span>
                  )}
                </div>

                {/* Change content */}
                <div className="mt-1.5 flex items-center gap-2 text-sm text-gray-700">
                  <span className="text-gray-400 line-through text-xs">
                    {entry.fromValue}
                  </span>
                  <span className="text-gray-300">→</span>
                  <span className="font-semibold">{entry.toValue}</span>
                </div>

                {/* Note */}
                {entry.note && (
                  <p className="text-xs text-gray-400 mt-1">{entry.note}</p>
                )}
              </div>

              {/* Timestamp */}
              <div className="text-xs text-gray-300 flex-shrink-0 pt-0.5">
                {formatTimestamp(entry.timestamp)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
