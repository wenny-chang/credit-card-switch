'use client'

import { useState } from 'react'
import { ChevronLeft, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { PERKS_DATA } from '@/data/perks'
import type { PerkType, CardId } from '@/types'

// ── 類型 Tab ─────────────────────────────────────────────────

const PERK_TYPE_TABS: { type: PerkType; label: string }[] = [
  { type: 'parking', label: '停車優惠' },
  { type: 'insurance', label: '旅遊保險' },
  { type: 'roadside', label: '道路救援' },
  { type: 'airport', label: '機場服務' },
  { type: 'other', label: '其他' },
]

// ── 卡片顏色 / 名稱 ──────────────────────────────────────────

const CARD_COLORS: Record<CardId, string> = {
  cathay:  '#047857',  // emerald-700 — CUBE 品牌翠綠
  taishin: '#18181b',  // zinc-950 — 黑狗卡黑
  esun:    '#7c3aed',  // violet-600 — Unicard 品牌紫
  sinopac: '#3f3f46',  // zinc-700 — 永豐大戶黑
  ctbc:    '#1e40af',  // blue-800 — 華航深藍
}

const CARD_NAMES: Record<CardId, string> = {
  cathay: '國泰 CUBE',
  taishin: '台新 Richart',
  esun: '玉山 Unicard',
  sinopac: '永豐大戶',
  ctbc: '中信華航',
}

// ── 主頁面 ───────────────────────────────────────────────────

export default function PerksPage() {
  const [activeType, setActiveType] = useState<PerkType>('parking')

  const filtered = PERKS_DATA.filter((p) => p.perkType === activeType)

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
          <h1 className="text-xl font-bold text-gray-900">卡片權益</h1>
        </div>
        <p className="text-sm text-gray-400">停車、保險、道路救援、機場服務等附加權益</p>
      </div>

      {/* Type Tabs */}
      <div className="px-5 mb-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {PERK_TYPE_TABS.map((tab) => {
            const isActive = activeType === tab.type
            return (
              <button
                key={tab.type}
                onClick={() => setActiveType(tab.type)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Perks */}
      <div className="px-5 space-y-3 pb-6">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-300 text-sm">
            此類型目前無資料
          </div>
        ) : (
          filtered.map((perk) => (
            <div
              key={perk.id}
              className="bg-white rounded-xl border border-gray-100 p-4"
            >
              {/* Card badge + perk name */}
              <div className="flex items-start gap-3">
                <div
                  className="w-1 h-full min-h-[2rem] rounded-full flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: CARD_COLORS[perk.cardId] }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-full text-white flex-shrink-0"
                      style={{ backgroundColor: CARD_COLORS[perk.cardId] }}
                    >
                      {CARD_NAMES[perk.cardId]}
                    </span>
                  </div>
                  <div className="font-semibold text-gray-900 text-sm leading-snug">
                    {perk.name}
                  </div>

                  {/* Condition */}
                  <div className="mt-2 space-y-1.5">
                    <div>
                      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                        使用條件
                      </span>
                      <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                        {perk.condition}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                        次數 / 上限
                      </span>
                      <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                        {perk.limit}
                      </p>
                    </div>
                    {perk.partners && perk.partners.length > 0 && (
                      <div>
                        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                          合作商家
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {perk.partners.map((partner) => (
                            <span
                              key={partner}
                              className="text-[11px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full"
                            >
                              {partner}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Link */}
                  {perk.url && (
                    <a
                      href={perk.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-xs text-blue-500 font-medium"
                    >
                      詳細資訊
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
