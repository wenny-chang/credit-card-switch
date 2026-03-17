'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { PLANS_DATA } from '@/data/plans'
import type { CardId } from '@/types'

// ── Tab 設定（永豐/中信不切換，不顯示）──────────────────────

const TABS: { cardId: CardId; label: string; color: string }[] = [
  { cardId: 'cathay', label: '國泰 CUBE', color: '#047857' },
  { cardId: 'taishin', label: '台新 Richart', color: '#18181b' },
  { cardId: 'esun', label: '玉山 Unicard', color: '#7c3aed' },
]

// ── 方案卡片 ─────────────────────────────────────────────────

function PlanCard({
  name,
  channels,
  rate,
  monthlyLimit,
  notes,
  color,
}: {
  name: string
  channels: string
  rate: string
  monthlyLimit: string
  notes?: string
  color: string
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between p-4 text-left active:bg-gray-50 transition"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-1 h-8 rounded-full flex-shrink-0"
            style={{ backgroundColor: color }}
          />
          <div className="min-w-0">
            <div className="font-semibold text-gray-900">{name}</div>
            <div className="text-xs text-gray-400 mt-0.5 truncate">{channels}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
          <div className="text-right">
            <div className="font-bold text-gray-900 text-sm">{rate}</div>
            <div className="text-[10px] text-gray-400">{monthlyLimit}</div>
          </div>
          <ChevronDown
            size={15}
            className={`text-gray-300 transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-50 px-4 py-3 space-y-2">
          <div>
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
              適用通路
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{channels}</p>
          </div>
          <div className="flex gap-4">
            <div>
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
                回饋率
              </div>
              <p className="text-sm font-bold text-gray-900">{rate}</p>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
                月上限
              </div>
              <p className="text-sm text-gray-700">{monthlyLimit}</p>
            </div>
          </div>
          {notes && (
            <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              <p className="text-xs text-amber-700 leading-relaxed">{notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── 主頁面 ───────────────────────────────────────────────────

export default function PlansPage() {
  const [activeCard, setActiveCard] = useState<CardId>('cathay')

  const cardData = PLANS_DATA.find((c) => c.cardId === activeCard)
  const activeTab = TABS.find((t) => t.cardId === activeCard)!

  return (
    <div>
      {/* Header */}
      <div className="px-5 pt-8 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <Link
            href="/cards"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500"
          >
            <ChevronLeft size={18} />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">方案對照表</h1>
        </div>
        <p className="text-sm text-gray-400">各卡方案適用通路、回饋率與月上限一覽</p>
      </div>

      {/* Tabs */}
      <div className="px-5 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {TABS.map((tab) => {
            const isActive = activeCard === tab.cardId
            return (
              <button
                key={tab.cardId}
                onClick={() => setActiveCard(tab.cardId)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive ? 'text-white' : 'bg-gray-100 text-gray-600'
                }`}
                style={isActive ? { backgroundColor: tab.color } : {}}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Plans */}
      <div className="px-5 space-y-3 pb-6">
        {cardData?.plans.map((plan) => (
          <PlanCard
            key={plan.name}
            name={plan.name}
            channels={plan.channels}
            rate={plan.rate}
            monthlyLimit={plan.monthlyLimit}
            notes={plan.notes}
            color={activeTab.color}
          />
        ))}

        {/* Base rate note */}
        <div className="bg-gray-50 rounded-xl border border-gray-100 px-4 py-3">
          <p className="text-xs text-gray-500 leading-relaxed">
            <span className="font-semibold">一般消費：</span>
            未符合方案指定通路時，回饋率為 0.3%（一般消費）。
          </p>
        </div>
      </div>
    </div>
  )
}
